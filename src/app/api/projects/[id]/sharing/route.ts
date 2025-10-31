/**
 * API Route: /api/projects/[id]/sharing
 * Handles project sharing operations: GET (share settings), PUT (update settings)
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
  extractProjectId,
} from '@/lib/api/builder'
import { projectPermissions, PermissionLevel } from '@/lib/projects/permissions'
import { createClient } from '@/lib/supabase/client'

const RATE_LIMIT_KEY = 'project_sharing'

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
      requests: 30,
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
    
    // Check if user can view sharing settings (requires at least viewer access)
    const hasAccess = await projectPermissions.checkPermission(projectId, user.id, 'project_view')
    if (!hasAccess) {
      return createErrorResponse(
        ERROR_CODES.FORBIDDEN,
        'Access denied to this project',
        403
      )
    }
    
    const supabase = createClient()
    
    // Get project info with basic sharing settings
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, description, is_public, user_id')
      .eq('id', projectId)
      .single()
    
    if (projectError) {
      return createErrorResponse(
        ERROR_CODES.PROJECT_NOT_FOUND,
        'Project not found',
        404
      )
    }
    
    // Get user's permission level
    const permissionLevel = await projectPermissions.getUserPermissionLevel(projectId, user.id)
    
    // Get collaborators (only for admin/owner)
    let collaborators = []
    if (['admin', 'owner'].includes(permissionLevel || 'viewer')) {
      collaborators = await projectPermissions.getProjectCollaborators(projectId, user.id)
    }
    
    // Get active collaborators for real-time indicators
    const activeCollaborators = await projectPermissions.getActiveCollaborators(projectId)
    
    // Get user's pending invitations (if any)
    const userInvitations = await projectPermissions.getUserInvitations(user.id)
    const hasPendingInvitation = userInvitations.some(inv => inv.project_id === projectId)
    
    const processingTime = Date.now() - startTime
    
    return createSuccessResponse(
      {
        project: {
          id: project.id,
          name: project.name,
          description: project.description,
          is_public: project.is_public,
          user_id: project.user_id
        },
        sharing: {
          permission_level: permissionLevel,
          is_owner: project.user_id === user.id,
          has_pending_invitation: hasPendingInvitation,
          collaborators: collaborators,
          active_collaborators: activeCollaborators,
          can_share: ['admin', 'owner'].includes(permissionLevel || 'viewer'),
          can_manage_collaborators: ['admin', 'owner'].includes(permissionLevel || 'viewer')
        }
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
        route: `/api/projects/[${projectId}]/sharing`,
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = generateRequestId()
  const startTime = Date.now()
  const projectId = params.id
  
  try {
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(`${RATE_LIMIT_KEY}:${clientIP}`, {
      requests: 15,
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
    
    // Check if user can manage sharing settings (requires owner access)
    const isOwner = await projectPermissions.checkPermission(projectId, user.id, 'project_delete')
    if (!isOwner) {
      return createErrorResponse(
        ERROR_CODES.FORBIDDEN,
        'Only project owners can manage sharing settings',
        403
      )
    }
    
    const requestData = await request.json()
    const { is_public, sharing_settings } = requestData
    
    // Validate request data
    if (typeof is_public !== 'boolean' && !sharing_settings) {
      return createErrorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Invalid request data. Must include is_public or sharing_settings',
        400
      )
    }
    
    const supabase = createClient()
    
    // Update project sharing settings
    const updateData: any = {
      updated_at: new Date().toISOString()
    }
    
    if (typeof is_public === 'boolean') {
      updateData.is_public = is_public
    }
    
    if (sharing_settings) {
      updateData.settings = {
        ...updateData.settings,
        sharing: sharing_settings
      }
    }
    
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .select()
      .single()
    
    if (updateError) {
      return createErrorResponse(
        ERROR_CODES.DATABASE_ERROR,
        'Failed to update sharing settings',
        500,
        { details: updateError.message }
      )
    }
    
    // Log the sharing configuration change
    await projectPermissions.logAccess(projectId, 'project_share', 'direct', user.id, 'owner', {
      action: 'update_sharing_settings',
      changes: { is_public, sharing_settings }
    })
    
    const processingTime = Date.now() - startTime
    
    return createSuccessResponse(
      {
        project: updatedProject,
        message: 'Sharing settings updated successfully'
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
        route: `/api/projects/[${projectId}]/sharing`,
        method: 'PUT',
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