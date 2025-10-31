/**
 * API Route: /api/builder/project/[id]
 * Handles individual project operations: GET, PUT, DELETE
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  createErrorResponse, 
  createSuccessResponse, 
  validateRequest, 
  schemas, 
  verifyAuth, 
  checkRateLimit, 
  getClientIP, 
  ERROR_CODES,
  logApiError,
  generateRequestId,
  checkUserQuotas,
  extractProjectId,
} from '@/lib/api/builder'
import { createClient } from '@/lib/supabase/client'

/**
 * Rate limit identifier for this route
 */
const RATE_LIMIT_KEY = 'project_individual'

/**
 * GET /api/builder/project/[id]
 * Get a specific project by ID with all related data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = generateRequestId()
  const startTime = Date.now()
  const projectId = params.id
  
  try {
    // Get client IP and rate limit check
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(`${RATE_LIMIT_KEY}:${clientIP}`, {
      requests: 30,
      window: 60 * 1000, // 30 requests per minute
    })
    
    if (!rateLimit.allowed) {
      return createErrorResponse(
        ERROR_CODES.RATE_LIMIT_EXCEEDED,
        'Rate limit exceeded. Please try again later.',
        429,
        {
          resetTime: rateLimit.resetTime,
          remaining: rateLimit.remaining,
        }
      )
    }
    
    // Verify authentication
    const user = await verifyAuth(request)
    
    // Fetch project with all related data
    const supabase = createClient()
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        *,
        sitemaps: sitemaps(*),
        wireframes: wireframes(*),
        style_guides: style_guides(*),
        ai_generations: ai_generations(*)
      `)
      .eq('id', projectId)
      .single()
    
    if (projectError) {
      if (projectError.code === 'PGRST116') {
        return createErrorResponse(
          ERROR_CODES.PROJECT_NOT_FOUND,
          'Project not found',
          404
        )
      }
      return createErrorResponse(
        ERROR_CODES.DATABASE_ERROR,
        'Failed to fetch project',
        500,
        { details: projectError.message }
      )
    }
    
    // Check if user owns the project or if it's public
    if (project.user_id !== user.id && !project.is_public) {
      return createErrorResponse(
        ERROR_CODES.FORBIDDEN,
        'Access denied to this project',
        403
      )
    }
    
    // Calculate project statistics
    const stats = {
      sitemapCount: project.sitemaps?.length || 0,
      wireframeCount: project.wireframes?.length || 0,
      styleGuideCount: project.style_guides?.length || 0,
      aiGenerationCount: project.ai_generations?.length || 0,
      lastActivity: getLastActivity(project),
      totalCost: calculateTotalCost(project.ai_generations || []),
      status: project.status,
    }
    
    const processingTime = Date.now() - startTime
    
    // Return success response
    return createSuccessResponse(
      {
        project: {
          ...project,
          stats,
        },
      },
      {
        processingTime,
        rateLimitRemaining: rateLimit.remaining,
      }
    )
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    
    // Log the error
    try {
      const user = await verifyAuth(request).catch(() => null)
      logApiError(error, {
        route: `/api/builder/project/[${projectId}]`,
        method: 'GET',
        userId: user?.id,
        requestId,
      })
    } catch {
      // Ignore auth errors for logging
    }
    
    // Determine error type and response
    if (error instanceof Error) {
      if (error.message.includes('authentication') || error.message.includes('unauthorized')) {
        return createErrorResponse(
          ERROR_CODES.UNAUTHORIZED,
          'Authentication required',
          401
        )
      }
    }
    
    // Generic error response
    return createErrorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      'Internal server error occurred',
      500,
      { requestId }
    )
  }
}

/**
 * PUT /api/builder/project/[id]
 * Update a project
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = generateRequestId()
  const startTime = Date.now()
  const projectId = params.id
  
  try {
    // Get client IP and rate limit check
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(`${RATE_LIMIT_KEY}:${clientIP}`, {
      requests: 15,
      window: 60 * 1000, // 15 requests per minute
    })
    
    if (!rateLimit.allowed) {
      return createErrorResponse(
        ERROR_CODES.RATE_LIMIT_EXCEEDED,
        'Rate limit exceeded. Please try again later.',
        429,
        {
          resetTime: rateLimit.resetTime,
          remaining: rateLimit.remaining,
        }
      )
    }
    
    // Verify authentication
    const user = await verifyAuth(request)
    
    // Check if project exists and user owns it
    const supabase = createClient()
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single()
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return createErrorResponse(
          ERROR_CODES.PROJECT_NOT_FOUND,
          'Project not found',
          404
        )
      }
      return createErrorResponse(
        ERROR_CODES.DATABASE_ERROR,
        'Failed to fetch project',
        500,
        { details: fetchError.message }
      )
    }
    
    // Check ownership
    if (existingProject.user_id !== user.id) {
      return createErrorResponse(
        ERROR_CODES.FORBIDDEN,
        'You can only update your own projects',
        403
      )
    }
    
    // Parse and validate request body
    const requestData = await request.json()
    const validation = validateRequest(requestData, schemas.projectUpdate)
    
    if (!validation.success) {
      return createErrorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Invalid request data',
        400,
        { details: validation.error }
      )
    }
    
    // Update project
    const { name, description, status, data, settings, isPublic, collaborators } = validation.data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }
    
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (status !== undefined) updateData.status = status
    if (data !== undefined) updateData.data = data
    if (settings !== undefined) updateData.settings = settings
    if (isPublic !== undefined) updateData.is_public = isPublic
    if (collaborators !== undefined) updateData.collaborators = collaborators
    
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .select()
      .single()
    
    if (updateError) {
      return createErrorResponse(
        ERROR_CODES.DATABASE_ERROR,
        'Failed to update project',
        500,
        { details: updateError.message }
      )
    }
    
    const processingTime = Date.now() - startTime
    
    // Return success response
    return createSuccessResponse(
      {
        project: updatedProject,
        message: 'Project updated successfully',
      },
      {
        processingTime,
        rateLimitRemaining: rateLimit.remaining,
      }
    )
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    
    // Log the error
    try {
      const user = await verifyAuth(request).catch(() => null)
      logApiError(error, {
        route: `/api/builder/project/[${projectId}]`,
        method: 'PUT',
        userId: user?.id,
        requestId,
      })
    } catch {
      // Ignore auth errors for logging
    }
    
    // Determine error type and response
    if (error instanceof Error) {
      if (error.message.includes('authentication') || error.message.includes('unauthorized')) {
        return createErrorResponse(
          ERROR_CODES.UNAUTHORIZED,
          'Authentication required',
          401
        )
      }
    }
    
    // Generic error response
    return createErrorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      'Internal server error occurred',
      500,
      { requestId }
    )
  }
}

/**
 * DELETE /api/builder/project/[id]
 * Delete a project
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = generateRequestId()
  const startTime = Date.now()
  const projectId = params.id
  
  try {
    // Get client IP and rate limit check
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(`${RATE_LIMIT_KEY}:${clientIP}`, {
      requests: 5,
      window: 60 * 1000, // 5 deletions per minute
    })
    
    if (!rateLimit.allowed) {
      return createErrorResponse(
        ERROR_CODES.RATE_LIMIT_EXCEEDED,
        'Rate limit exceeded. Please try again later.',
        429,
        {
          resetTime: rateLimit.resetTime,
          remaining: rateLimit.remaining,
        }
      )
    }
    
    // Verify authentication
    const user = await verifyAuth(request)
    
    // Check if project exists and user owns it
    const supabase = createClient()
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('user_id, name')
      .eq('id', projectId)
      .single()
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return createErrorResponse(
          ERROR_CODES.PROJECT_NOT_FOUND,
          'Project not found',
          404
        )
      }
      return createErrorResponse(
        ERROR_CODES.DATABASE_ERROR,
        'Failed to fetch project',
        500,
        { details: fetchError.message }
      )
    }
    
    // Check ownership
    if (existingProject.user_id !== user.id) {
      return createErrorResponse(
        ERROR_CODES.FORBIDDEN,
        'You can only delete your own projects',
        403
      )
    }
    
    // Delete related records first (cascade delete)
    const relatedTables = ['sitemaps', 'wireframes', 'style_guides', 'ai_generations']
    
    for (const table of relatedTables) {
      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .eq('project_id', projectId)
      
      if (deleteError) {
        console.warn(`Failed to delete from ${table}:`, deleteError)
      }
    }
    
    // Delete the project
    const { error: projectDeleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
    
    if (projectDeleteError) {
      return createErrorResponse(
        ERROR_CODES.DATABASE_ERROR,
        'Failed to delete project',
        500,
        { details: projectDeleteError.message }
      )
    }
    
    const processingTime = Date.now() - startTime
    
    // Return success response
    return createSuccessResponse(
      {
        message: `Project "${existingProject.name}" deleted successfully`,
        deletedProjectId: projectId,
      },
      {
        processingTime,
        rateLimitRemaining: rateLimit.remaining,
      }
    )
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    
    // Log the error
    try {
      const user = await verifyAuth(request).catch(() => null)
      logApiError(error, {
        route: `/api/builder/project/[${projectId}]`,
        method: 'DELETE',
        userId: user?.id,
        requestId,
      })
    } catch {
      // Ignore auth errors for logging
    }
    
    // Determine error type and response
    if (error instanceof Error) {
      if (error.message.includes('authentication') || error.message.includes('unauthorized')) {
        return createErrorResponse(
          ERROR_CODES.UNAUTHORIZED,
          'Authentication required',
          401
        )
      }
    }
    
    // Generic error response
    return createErrorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      'Internal server error occurred',
      500,
      { requestId }
    )
  }
}

/**
 * Helper function to get last activity date
 */
function getLastActivity(project: any): string | null {
  const dates = []
  
  if (project.sitemaps?.length) {
    dates.push(...project.sitemaps.map((s: any) => s.updated_at))
  }
  
  if (project.wireframes?.length) {
    dates.push(...project.wireframes.map((w: any) => w.updated_at))
  }
  
  if (project.style_guides?.length) {
    dates.push(...project.style_guides.map((sg: any) => sg.updated_at))
  }
  
  if (project.ai_generations?.length) {
    dates.push(...project.ai_generations.map((ai: any) => ai.created_at))
  }
  
  dates.push(project.updated_at, project.created_at)
  
  return dates.length > 0 ? new Date(Math.max(...dates.map(d => new Date(d).getTime()))).toISOString() : null
}

/**
 * Helper function to calculate total cost of AI generations
 */
function calculateTotalCost(aiGenerations: any[]): number {
  return aiGenerations.reduce((total, gen) => total + (gen.cost || 0), 0)
}
