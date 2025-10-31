/**
 * API Route: /api/projects/[id]/sharing/collaborators
 * Handles project collaborator management: GET, POST, DELETE
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  createErrorResponse, 
  createSuccessResponse, 
  verifyAuth, 
  checkRateLimit, 
  getClientIP, 
  ERROR_CODES,
  logApiError,
  generateRequestId,
} from '@/lib/api/builder'
import { projectPermissions, PermissionLevel } from '@/lib/projects/permissions'
import { createClient } from '@/lib/supabase/client'

const RATE_LIMIT_KEY = 'project_collaborators'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = generateRequestId()
  const startTime = Date.now()
  const projectId = params.id
  
  try {
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(`${RATE_LIMIT_KEY}:${clientIP}`, {
      requests: 20,
      window: 60 * 1000,
    })
    
    if (!rateLimit.allowed) {
      return createErrorResponse(
        ERROR_CODES.RATE_LIMIT_EXCEEDED,
        'Rate limit exceeded. Please try again later.',
        429,
        { resetTime: rateLimit.resetTime, remaining: rateLimit.remaining }
      )
    }
    
    const user = await verifyAuth(request)
    
    // Check if user can view collaborators (requires at least viewer access)
    const hasAccess = await projectPermissions.checkPermission(projectId, user.id, 'project_view')
    if (!hasAccess) {
      return createErrorResponse(
        ERROR_CODES.FORBIDDEN,
        'Access denied to this project',
        403
      )
    }
    
    const collaborators = await projectPermissions.getProjectCollaborators(projectId, user.id)
    const activeCollaborators = await projectPermissions.getActiveCollaborators(projectId)
    
    const processingTime = Date.now() - startTime
    
    return createSuccessResponse(
      {
        collaborators,
        active_collaborators: activeCollaborators,
        total_collaborators: collaborators.length
      },
      {
        processingTime,
        rateLimitRemaining: rateLimit.remaining,
      }
    )
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    
    try {
      const user = await verifyAuth(request).catch(() => null)
      logApiError(error, {
        route: `/api/projects/[${projectId}]/sharing/collaborators`,
        method: 'GET',
        userId: user?.id,
        requestId,
      })
    } catch {
      // Ignore auth errors for logging
    }
    
    if (error instanceof Error) {
      if (error.message.includes('authentication') || error.message.includes('unauthorized')) {
        return createErrorResponse(
          ERROR_CODES.UNAUTHORIZED,
          'Authentication required',
          401
        )
      }
    }
    
    return createErrorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      'Internal server error occurred',
      500,
      { requestId }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = generateRequestId()
  const startTime = Date.now()
  const projectId = params.id
  
  try {
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(`${RATE_LIMIT_KEY}:${clientIP}`, {
      requests: 10,
      window: 60 * 1000,
    })
    
    if (!rateLimit.allowed) {
      return createErrorResponse(
        ERROR_CODES.RATE_LIMIT_EXCEEDED,
        'Rate limit exceeded. Please try again later.',
        429,
        { resetTime: rateLimit.resetTime, remaining: rateLimit.remaining }
      )
    }
    
    const user = await verifyAuth(request)
    
    // Check if user can invite collaborators (requires admin access)
    const canInvite = await projectPermissions.checkPermission(projectId, user.id, 'collaborator_invite')
    if (!canInvite) {
      return createErrorResponse(
        ERROR_CODES.FORBIDDEN,
        'Only project admins and owners can invite collaborators',
        403
      )
    }
    
    const requestData = await request.json()
    const { email, permission_level, message, expiresAt } = requestData
    
    // Enhanced validation
    if (!email || !permission_level) {
      return createErrorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Email and permission level are required',
        400
      )
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return createErrorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Invalid email format',
        400
      )
    }
    
    // Validate permission level
    if (!['viewer', 'editor', 'admin'].includes(permission_level)) {
      return createErrorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Invalid permission level. Must be viewer, editor, or admin',
        400
      )
    }
    
    // Validate expiration date
    if (expiresAt && new Date(expiresAt) <= new Date()) {
      return createErrorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Expiration date must be in the future',
        400
      )
    }
    
    // Check if user is already a collaborator or the owner (before sending invitation)
    const supabase = createClient()
    
    // Check if email belongs to project owner
    const { data: existingProject } = await supabase
      .from('projects')
      .select('user_id, name')
      .eq('id', projectId)
      .single()
    
    if (existingProject) {
      const { data: ownerProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', existingProject.user_id)
        .single()
      
      if (ownerProfile?.email === email) {
        return createErrorResponse(
          ERROR_CODES.VALIDATION_ERROR,
          'Cannot invite project owner as collaborator',
          400
        )
      }
    }
    
    // Use enhanced email invitation system
    const invitationResult = await projectPermissions.sendInvitationEmail(projectId, user.id, {
      email: email.toLowerCase().trim(),
      permission_level: permission_level as PermissionLevel,
      message: message?.trim(),
      expiresAt
    })
    
    if (!invitationResult.success) {
      return createErrorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        invitationResult.error || 'Failed to send invitation',
        400
      )
    }
    
    const processingTime = Date.now() - startTime
    
    return createSuccessResponse(
      {
        invitation_id: invitationResult.invitationId,
        message: `Invitation sent to ${email}`,
        expires_at: expiresAt,
        permission_level: permission_level
      },
      {
        processingTime,
        rateLimitRemaining: rateLimit.remaining,
      }
    )
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    
    try {
      const user = await verifyAuth(request).catch(() => null)
      logApiError(error, {
        route: `/api/projects/[${projectId}]/sharing/collaborators`,
        method: 'POST',
        userId: user?.id,
        requestId,
      })
    } catch {
      // Ignore auth errors for logging
    }
    
    if (error instanceof Error) {
      if (error.message.includes('authentication') || error.message.includes('unauthorized')) {
        return createErrorResponse(
          ERROR_CODES.UNAUTHORIZED,
          'Authentication required',
          401
        )
      }
    }
    
    return createErrorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      'Internal server error occurred',
      500,
      { requestId }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = generateRequestId()
  const startTime = Date.now()
  const projectId = params.id
  
  try {
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(`${RATE_LIMIT_KEY}:${clientIP}`, {
      requests: 10,
      window: 60 * 1000,
    })
    
    if (!rateLimit.allowed) {
      return createErrorResponse(
        ERROR_CODES.RATE_LIMIT_EXCEEDED,
        'Rate limit exceeded. Please try again later.',
        429,
        { resetTime: rateLimit.resetTime, remaining: rateLimit.remaining }
      )
    }
    
    const user = await verifyAuth(request)
    
    // Parse URL parameters for user ID to remove
    const { searchParams } = new URL(request.url)
    const userIdToRemove = searchParams.get('user_id')
    
    if (!userIdToRemove) {
      return createErrorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'User ID is required',
        400
      )
    }
    
    // Check if user can remove collaborators (requires admin access)
    const canRemove = await projectPermissions.checkPermission(projectId, user.id, 'collaborator_remove')
    if (!canRemove) {
      return createErrorResponse(
        ERROR_CODES.FORBIDDEN,
        'Only project admins and owners can remove collaborators',
        403
      )
    }
    
    // Cannot remove project owner
    const { data: existingProject } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single()
    
    if (existingProject.user_id === userIdToRemove) {
      return createErrorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Cannot remove project owner',
        400
      )
    }
    
    // Remove collaborator
    const success = await projectPermissions.removeCollaborator(projectId, userIdToRemove)
    
    if (!success) {
      return createErrorResponse(
        ERROR_CODES.DATABASE_ERROR,
        'Failed to remove collaborator',
        500
      )
    }
    
    // Log the removal
    await projectPermissions.logAccess(projectId, 'collaborator_remove', 'direct', user.id, 'admin', {
      removed_user_id: userIdToRemove
    })
    
    const processingTime = Date.now() - startTime
    
    return createSuccessResponse(
      {
        message: 'Collaborator removed successfully',
        removed_user_id: userIdToRemove
      },
      {
        processingTime,
        rateLimitRemaining: rateLimit.remaining,
      }
    )
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    
    try {
      const user = await verifyAuth(request).catch(() => null)
      logApiError(error, {
        route: `/api/projects/[${projectId}]/sharing/collaborators`,
        method: 'DELETE',
        userId: user?.id,
        requestId,
      })
    } catch {
      // Ignore auth errors for logging
    }
    
    if (error instanceof Error) {
      if (error.message.includes('authentication') || error.message.includes('unauthorized')) {
        return createErrorResponse(
          ERROR_CODES.UNAUTHORIZED,
          'Authentication required',
          401
        )
      }
    }
    
    return createErrorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      'Internal server error occurred',
      500,
      { requestId }
    )
  }
}