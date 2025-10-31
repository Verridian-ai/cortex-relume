/**
 * API Route: /api/projects/[id]/sharing/sessions
 * Handles real-time collaboration sessions: GET, POST, DELETE
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
import { projectPermissions } from '@/lib/projects/permissions'

const RATE_LIMIT_KEY = 'project_collaboration_sessions'

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
    
    // Check if user can view collaboration sessions (requires at least viewer access)
    const hasAccess = await projectPermissions.checkPermission(projectId, user.id, 'project_view')
    if (!hasAccess) {
      return createErrorResponse(
        ERROR_CODES.FORBIDDEN,
        'Access denied to this project',
        403
      )
    }
    
    // Get active collaboration sessions
    const sessions = await projectPermissions.getActiveCollaborationSessions(projectId)
    
    // Get concurrent access information for conflict detection
    const concurrentAccess = await projectPermissions.getConcurrentAccessInfo(projectId, user.id)
    
    // Add additional metadata to sessions with conflict information
    const enrichedSessions = sessions.map(session => ({
      ...session,
      is_online: new Date(session.last_activity) > new Date(Date.now() - 5 * 60 * 1000), // 5 minutes
      time_since_last_activity: Date.now() - new Date(session.last_activity).getTime(),
      last_activity_formatted: formatTimeAgo(new Date(session.last_activity)),
      has_activity: !!session.current_activity,
      has_cursor_position: !!session.cursor_position,
      has_selection: !!session.selection_data,
      is_conflicting: concurrentAccess.conflictingUsers.some(cu => cu.user_id === session.user_id),
      profile: session.profile || {
        email: 'Unknown',
        full_name: 'Unknown User',
        avatar_url: null,
        permission_level: 'viewer'
      }
    }))
    
    // Calculate real-time statistics with enhanced metrics
    const stats = {
      total_active_sessions: sessions.length,
      online_collaborators: sessions.filter(session => 
        new Date(session.last_activity) > new Date(Date.now() - 5 * 60 * 1000)
      ).length,
      idle_collaborators: sessions.filter(session => 
        new Date(session.last_activity) <= new Date(Date.now() - 5 * 60 * 1000) &&
        new Date(session.last_activity) > new Date(Date.now() - 30 * 60 * 1000)
      ).length,
      away_collaborators: sessions.filter(session => 
        new Date(session.last_activity) <= new Date(Date.now() - 30 * 60 * 1000) &&
        new Date(session.last_activity) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length,
      users_with_activity: sessions.filter(session => session.current_activity).length,
      users_with_cursor: sessions.filter(session => session.cursor_position).length,
      recent_activity: sessions.filter(session => 
        Date.now() - new Date(session.last_activity).getTime() < 60000 // Last minute
      ).length,
      conflicting_sessions: concurrentAccess.hasConflicts ? concurrentAccess.conflictingUsers.length : 0,
      has_concurrent_editing: concurrentAccess.hasConflicts
    }
    
    const processingTime = Date.now() - startTime
    
    return createSuccessResponse(
      {
        collaboration_sessions: enrichedSessions,
        statistics: stats,
        concurrent_access: {
          has_conflicts: concurrentAccess.hasConflicts,
          conflicting_users: concurrentAccess.conflictingUsers,
          suggestions: concurrentAccess.suggestions,
          your_session: enrichedSessions.find(s => s.user_id === user.id)
        },
        timestamp: new Date().toISOString()
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
        route: `/api/projects/[${projectId}]/sharing/sessions`,
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
      requests: 60, // Higher rate for frequent updates
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
    
    // Check if user can update collaboration session (requires at least viewer access)
    const hasAccess = await projectPermissions.checkPermission(projectId, user.id, 'project_view')
    if (!hasAccess) {
      return createErrorResponse(
        ERROR_CODES.FORBIDDEN,
        'Access denied to this project',
        403
      )
    }
    
    const requestData = await request.json()
    const { 
      activity,
      cursor_position,
      selection_data,
      device_info
    } = requestData
    
    // Update collaboration session
    const success = await projectPermissions.updateCollaborationSession(projectId, user.id, {
      activity: activity || undefined,
      cursorPosition: cursor_position || undefined,
      selectionData: selection_data || undefined,
      deviceInfo: device_info || undefined
    })
    
    if (!success) {
      return createErrorResponse(
        ERROR_CODES.DATABASE_ERROR,
        'Failed to update collaboration session',
        500
      )
    }
    
    const processingTime = Date.now() - startTime
    
    return createSuccessResponse(
      {
        message: 'Collaboration session updated',
        timestamp: new Date().toISOString()
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
        route: `/api/projects/[${projectId}]/sharing/sessions`,
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
    
    // Parse URL parameters
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')
    
    // If no session_id provided, end current user's session
    if (!sessionId) {
      // Check if user can end their own session (requires at least viewer access)
      const hasAccess = await projectPermissions.checkPermission(projectId, user.id, 'project_view')
      if (!hasAccess) {
        return createErrorResponse(
          ERROR_CODES.FORBIDDEN,
          'Access denied to this project',
          403
        )
      }
      
      // End current user's session
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const { error } = await supabase
        .from('project_collaboration_sessions')
        .update({ is_active: false })
        .eq('project_id', projectId)
        .eq('user_id', user.id)
      
      if (error) {
        return createErrorResponse(
          ERROR_CODES.DATABASE_ERROR,
          'Failed to end collaboration session',
          500,
          { details: error.message }
        )
      }
      
      const processingTime = Date.now() - startTime
      
      return createSuccessResponse(
        {
          message: 'Your collaboration session has been ended',
          ended_session_for_user: user.id
        },
        {
          processingTime,
          rateLimitRemaining: rateLimit.remaining,
        }
      )
    }
    
    // If session_id provided, only allow admins/owners to end other sessions
    const canEndOthers = await projectPermissions.checkPermission(projectId, user.id, 'collaborator_remove')
    if (!canEndOthers) {
      return createErrorResponse(
        ERROR_CODES.FORBIDDEN,
        'Only project admins and owners can end other users sessions',
        403
      )
    }
    
    // End specific session
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    
    const { error } = await supabase
      .from('project_collaboration_sessions')
      .update({ is_active: false })
      .eq('id', sessionId)
      .eq('project_id', projectId)
    
    if (error) {
      return createErrorResponse(
        ERROR_CODES.DATABASE_ERROR,
        'Failed to end collaboration session',
        500,
        { details: error.message }
      )
    }
    
    const processingTime = Date.now() - startTime
    
    return createSuccessResponse(
      {
        message: 'Collaboration session ended successfully',
        ended_session_id: sessionId
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
        route: `/api/projects/[${projectId}]/sharing/sessions`,
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

/**
 * Helper function to format time ago
 */
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }
}