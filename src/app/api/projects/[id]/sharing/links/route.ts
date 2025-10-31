/**
 * API Route: /api/projects/[id]/sharing/links
 * Handles project share links: GET, POST, DELETE
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

const RATE_LIMIT_KEY = 'project_share_links'

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
    
    // Check if user can view share links (requires at least admin access)
    const canViewLinks = await projectPermissions.checkPermission(projectId, user.id, 'project_share')
    if (!canViewLinks) {
      return createErrorResponse(
        ERROR_CODES.FORBIDDEN,
        'Only project admins and owners can view share links',
        403
      )
    }
    
    const supabase = createClient()
    
    // Get share links for the project
    const { data: shareLinks, error: linksError } = await supabase
      .from('project_share_links')
      .select('*')
      .eq('project_id', projectId)
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })
    
    if (linksError) {
      return createErrorResponse(
        ERROR_CODES.DATABASE_ERROR,
        'Failed to fetch share links',
        500,
        { details: linksError.message }
      )
    }
    
    // Add shareable URLs for each link
    const linksWithUrls = (shareLinks || []).map(link => ({
      ...link,
      share_url: `${process.env.NEXT_PUBLIC_APP_URL}/projects/${projectId}/shared/${link.link_token}`,
      is_expired: link.expires_at ? new Date(link.expires_at) < new Date() : false,
      is_max_access_reached: link.max_access_count && link.current_access_count >= link.max_access_count
    }))
    
    const processingTime = Date.now() - startTime
    
    return createSuccessResponse(
      {
        share_links: linksWithUrls,
        total_links: linksWithUrls.length
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
        route: `/api/projects/[${projectId}]/sharing/links`,
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
    
    // Check if user can create share links (requires admin access)
    const canCreateLinks = await projectPermissions.checkPermission(projectId, user.id, 'project_share')
    if (!canCreateLinks) {
      return createErrorResponse(
        ERROR_CODES.FORBIDDEN,
        'Only project admins and owners can create share links',
        403
      )
    }
    
    const requestData = await request.json()
    const { 
      permission_level = 'viewer',
      expires_in_hours,
      max_access_count = 10,
      metadata = {},
      domain_restrictions = [],
      requires_login = false,
      allow_api_access = false
    } = requestData
    
    // Enhanced validation
    if (!['viewer', 'editor'].includes(permission_level)) {
      return createErrorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Invalid permission level. Must be viewer or editor',
        400
      )
    }
    
    // Validate max access count
    if (max_access_count < 1 || max_access_count > 10000) {
      return createErrorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Max access count must be between 1 and 10000',
        400
      )
    }
    
    // Validate domain restrictions
    if (domain_restrictions.length > 0) {
      for (const domain of domain_restrictions) {
        if (typeof domain !== 'string' || domain.length === 0) {
          return createErrorResponse(
            ERROR_CODES.VALIDATION_ERROR,
            'Invalid domain restriction. All domains must be valid strings',
            400
          )
        }
      }
    }
    
    // Calculate expiration date if provided
    let expiresAt: string | undefined
    if (expires_in_hours) {
      const expiresDate = new Date()
      expiresDate.setHours(expiresDate.getHours() + expires_in_hours)
      expiresAt = expiresDate.toISOString()
    }
    
    // Validate expiration date is in future
    if (expiresAt && new Date(expiresAt) <= new Date()) {
      return createErrorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Expiration date must be in the future',
        400
      )
    }
    
    // Get user agent for enhanced metadata
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // Create share link with enhanced security features
    const shareLink = await projectPermissions.createShareLink(
      projectId,
      user.id,
      permission_level as PermissionLevel,
      {
        expiresAt,
        maxAccessCount: max_access_count,
        metadata: {
          ...metadata,
          userAgent,
          createdVia: 'api'
        },
        domainRestrictions: domain_restrictions,
        requiresLogin: requires_login,
        allowApiAccess: allow_api_access
      }
    )
    
    if (!shareLink) {
      return createErrorResponse(
        ERROR_CODES.DATABASE_ERROR,
        'Failed to create share link',
        500
      )
    }
    
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/projects/${projectId}/shared/${shareLink.link_token}`
    
    // Log the link creation
    await projectPermissions.logAccess(projectId, 'project_share', 'share_link', user.id, permission_level, {
      action: 'create_share_link',
      link_id: shareLink.id,
      permission_level,
      expires_at: expiresAt,
      max_access_count
    })
    
    const processingTime = Date.now() - startTime
    
    return createSuccessResponse(
      {
        share_link: {
          ...shareLink,
          share_url: shareUrl,
          is_expired: shareLink.expires_at ? new Date(shareLink.expires_at) < new Date() : false,
          is_max_access_reached: shareLink.current_access_count >= shareLink.max_access_count
        },
        message: 'Share link created successfully'
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
        route: `/api/projects/[${projectId}]/sharing/links`,
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
    
    // Parse URL parameters for link ID to revoke
    const { searchParams } = new URL(request.url)
    const linkId = searchParams.get('link_id')
    
    if (!linkId) {
      return createErrorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Link ID is required',
        400
      )
    }
    
    // Check if user can revoke share links (requires admin access)
    const canRevokeLinks = await projectPermissions.checkPermission(projectId, user.id, 'project_share')
    if (!canRevokeLinks) {
      return createErrorResponse(
        ERROR_CODES.FORBIDDEN,
        'Only project admins and owners can revoke share links',
        403
      )
    }
    
    // Revoke share link
    const success = await projectPermissions.revokeShareLink(linkId, user.id)
    
    if (!success) {
      return createErrorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Failed to revoke share link. Link may not exist or you may not have permission to revoke it.',
        400
      )
    }
    
    // Log the revocation
    await projectPermissions.logAccess(projectId, 'project_share', 'share_link', user.id, 'admin', {
      action: 'revoke_share_link',
      link_id: linkId
    })
    
    const processingTime = Date.now() - startTime
    
    return createSuccessResponse(
      {
        message: 'Share link revoked successfully',
        revoked_link_id: linkId
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
        route: `/api/projects/[${projectId}]/sharing/links`,
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