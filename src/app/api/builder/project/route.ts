/**
 * API Route: /api/builder/project
 * Handles project creation (POST) and listing (GET)
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
} from '@/lib/api/builder'
import { createClient } from '@/lib/supabase/client'

/**
 * Rate limit identifier for this route
 */
const RATE_LIMIT_KEY = 'project_management'

/**
 * POST /api/builder/project
 * Create a new project
 */
export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  const startTime = Date.now()
  
  try {
    // Get client IP and rate limit check
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(`${RATE_LIMIT_KEY}:${clientIP}`, {
      requests: 10,
      window: 60 * 1000, // 10 requests per minute
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
    
    // Check user quotas (projects don't consume AI quota but check anyway)
    const quotaCheck = await checkUserQuotas(user.id)
    if (!quotaCheck.allowed) {
      return createErrorResponse(
        ERROR_CODES.QUOTA_EXCEEDED,
        'Account quota exceeded. Please try again later.',
        429,
        {
          remainingHourly: quotaCheck.remaining.hourly,
          remainingDaily: quotaCheck.remaining.daily,
        }
      )
    }
    
    // Parse and validate request body
    const requestData = await request.json()
    const validation = validateRequest(requestData, schemas.projectCreation)
    
    if (!validation.success) {
      return createErrorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Invalid request data',
        400,
        { details: validation.error }
      )
    }
    
    const { name, description, type, isPublic, settings } = validation.data
    
    // Create project in database
    const supabase = createClient()
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name,
        description,
        type,
        status: 'draft',
        is_public: isPublic || false,
        settings: settings || {},
        data: {},
      })
      .select()
      .single()
    
    if (projectError) {
      return createErrorResponse(
        ERROR_CODES.DATABASE_ERROR,
        'Failed to create project',
        500,
        { details: projectError.message }
      )
    }
    
    const processingTime = Date.now() - startTime
    
    // Return success response
    return createSuccessResponse(
      {
        project,
        message: 'Project created successfully',
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
        route: '/api/builder/project',
        method: 'POST',
        userId: user?.id,
        requestId,
      })
    } catch {
      // Ignore auth errors for logging
    }
    
    // Determine error type and response
    if (error instanceof Error) {
      if (error.message.includes('rate limit') || error.message.includes('quota')) {
        return createErrorResponse(
          ERROR_CODES.RATE_LIMIT_EXCEEDED,
          error.message,
          429
        )
      }
      
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
 * GET /api/builder/project
 * List user's projects with optional filtering
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  const startTime = Date.now()
  
  try {
    // Get client IP and rate limit check
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(`${RATE_LIMIT_KEY}:${clientIP}`, {
      requests: 20,
      window: 60 * 1000, // 20 requests per minute
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
    
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    // Build query
    const supabase = createClient()
    let query = supabase
      .from('projects')
      .select(`
        *,
        sitemaps: sitemaps(id, title, created_at),
        wireframes: wireframes(id, title, created_at),
        style_guides: style_guides(id, title, created_at)
      `)
      .eq('user_id', user.id)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range((page - 1) * limit, page * limit - 1)
    
    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    
    if (type) {
      query = query.eq('type', type)
    }
    
    const { data: projects, error: projectsError, count } = await query
    
    if (projectsError) {
      return createErrorResponse(
        ERROR_CODES.DATABASE_ERROR,
        'Failed to fetch projects',
        500,
        { details: projectsError.message }
      )
    }
    
    const processingTime = Date.now() - startTime
    
    // Return success response with pagination info
    return createSuccessResponse(
      {
        projects: projects || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
        filters: {
          status,
          type,
          sortBy,
          sortOrder,
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
        route: '/api/builder/project',
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
