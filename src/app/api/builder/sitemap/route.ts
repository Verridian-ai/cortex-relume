/**
 * API Route: POST /api/builder/sitemap
 * Generates sitemap from user prompt using GPT-5
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
  logAIGeneration,
  generateRequestId,
  extractRequestMetadata,
  checkUserQuotas,
  costOptimization,
} from '@/lib/api/builder'
import { sitemapGenerator } from '@/lib/ai/sitemap-generator'

/**
 * Rate limit identifier for this route
 */
const RATE_LIMIT_KEY = 'sitemap_generation'

/**
 * POST /api/builder/sitemap
 * Generate sitemap from user prompt
 */
export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  const startTime = Date.now()
  
  try {
    // Get client IP and rate limit check
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(`${RATE_LIMIT_KEY}:${clientIP}`, {
      requests: 5,
      window: 60 * 1000, // 5 requests per minute
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
    
    // Check user quotas
    const quotaCheck = await checkUserQuotas(user.id)
    if (!quotaCheck.allowed) {
      return createErrorResponse(
        ERROR_CODES.QUOTA_EXCEEDED,
        'AI generation quota exceeded. Please try again later.',
        429,
        {
          remainingHourly: quotaCheck.remaining.hourly,
          remainingDaily: quotaCheck.remaining.daily,
        }
      )
    }
    
    // Parse and validate request body
    const requestData = await request.json()
    const validation = validateRequest(requestData, schemas.sitemapGeneration)
    
    if (!validation.success) {
      return createErrorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Invalid request data',
        400,
        { details: validation.error }
      )
    }
    
    const { prompt, websiteType, domain, requirements, options, preferences } = validation.data
    
    // Cost estimation
    const estimatedTokens = costOptimization.estimateTokens(prompt) + 2000 // Add buffer
    const estimatedCost = costOptimization.estimateCost(estimatedTokens, 2000)
    
    // Generate sitemap using the existing AI generator
    const sitemapResult = await sitemapGenerator.generateSitemap({
      prompt,
      ...(websiteType ? { websiteType } : {}),
      ...(domain ? { domain } : {}),
      ...(requirements ? { requirements } : {}),
      ...(options ? { options: Object.fromEntries(Object.entries(options).filter(([_, v]) => v !== undefined)) } : {}),
      ...(preferences ? { preferences: Object.fromEntries(Object.entries(preferences).filter(([_, v]) => v !== undefined)) } : {}),
    })
    
    const processingTime = Date.now() - startTime
    const tokensUsed = sitemapResult.metadata.tokensUsed || estimatedTokens
    const actualCost = sitemapResult.metadata.cost || estimatedCost
    
    // Save generation to database
    await logAIGeneration(
      user.id,
      null, // No project ID for initial sitemap generation
      'sitemap',
      prompt,
      { websiteType, domain, requirements, options, preferences },
      sitemapResult,
      tokensUsed,
      actualCost,
      processingTime,
      'success'
    )
    
    // Return success response
    return createSuccessResponse(sitemapResult, {
      processingTime,
      tokensUsed,
      cost: actualCost,
      rateLimitRemaining: rateLimit.remaining,
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    
    // Log the error
    try {
      const user = await verifyAuth(request).catch(() => null)
      logApiError(error, {
        route: '/api/builder/sitemap',
        method: 'POST',
        ...(user?.id ? { userId: user.id } : {}),
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
      
      if (error.message.includes('AI generation failed')) {
        return createErrorResponse(
          ERROR_CODES.AI_GENERATION_FAILED,
          'Failed to generate sitemap. Please try again.',
          500
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
 * GET /api/builder/sitemap
 * Health check or usage information for sitemap generation
 */
export async function GET(request: NextRequest) {
  try {
    // Simple health check that doesn't require auth
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(`${RATE_LIMIT_KEY}:${clientIP}`, {
      requests: 10,
      window: 60 * 1000, // 10 health checks per minute
    })
    
    return createSuccessResponse({
      status: 'healthy',
      rateLimitRemaining: rateLimit.remaining,
      capabilities: {
        websiteTypes: [
          'business',
          'portfolio', 
          'blog',
          'e-commerce',
          'saas',
          'landing-page',
          'news',
          'documentation',
          'educational',
          'nonprofit',
          'other'
        ],
        options: {
          minPages: { min: 1, max: 50 },
          maxPages: { min: 1, max: 100 },
          includeBlog: true,
          includeAuth: true,
          includeAdmin: false,
          detailedMetadata: true,
        },
        preferences: {
          styles: ['modern', 'classic', 'minimal', 'corporate'],
          tones: ['professional', 'casual', 'friendly', 'formal'],
        },
      },
      limits: {
        rateLimit: {
          requests: 5,
          window: '1 minute',
        },
        costs: {
          maxPerHour: '$5.00',
          maxPerDay: '$20.00',
        },
      },
      requestId: generateRequestId(),
      timestamp: new Date().toISOString(),
    }, {
      rateLimitRemaining: rateLimit.remaining,
    })
    
  } catch (error) {
    return createErrorResponse(
      ERROR_CODES.SERVICE_UNAVAILABLE,
      'Service temporarily unavailable',
      503
    )
  }
}
