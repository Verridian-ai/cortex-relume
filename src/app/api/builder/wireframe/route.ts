/**
 * API Route: POST /api/builder/wireframe
 * Generates wireframe from sitemap data using AI
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
  extractProjectId,
} from '@/lib/api/builder'
import { WireframeGenerator } from '@/lib/ai/wireframe-generator'
import { SitemapStructure } from '@/types/sitemap'

/**
 * Rate limit identifier for this route
 */
const RATE_LIMIT_KEY = 'wireframe_generation'

/**
 * POST /api/builder/wireframe
 * Generate wireframe from sitemap data
 */
export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  const startTime = Date.now()
  
  try {
    // Get client IP and rate limit check
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(`${RATE_LIMIT_KEY}:${clientIP}`, {
      requests: 3,
      window: 60 * 1000, // 3 requests per minute
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
    const validation = validateRequest(requestData, schemas.wireframeGeneration)
    
    if (!validation.success) {
      return createErrorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Invalid request data',
        400,
        { details: validation.error }
      )
    }
    
    const { sitemapData, options } = validation.data
    const projectId = extractProjectId(request.nextUrl.searchParams) || null
    
    // Transform sitemap data to the format expected by WireframeGenerator
    const sitemapTree = {
      root: sitemapData.pages.map((page: any) => ({
        id: page.id || `page_${Math.random().toString(36).substr(2, 9)}`,
        title: page.title,
        path: page.path,
        description: page.description,
        children: page.children || [],
      })),
      totalPages: sitemapData.pages.length,
      maxDepth: calculateMaxDepth(sitemapData.pages),
      pageTypes: getPageTypes(sitemapData.pages),
      layoutPatterns: [], // TODO: Extract layout patterns from sitemap data
    }
    
    // Generate options for the wireframe generator
    const baseOptions = {
      includeNavigation: options?.includeNavigation ?? true,
      includeFooter: options?.includeFooter ?? true,
      includeSidebar: options?.includeSidebar,
      layoutPreference: options?.layoutPreference,
      industry: options?.industry,
      targetAudience: options?.targetAudience,
      style: options?.style || 'modern',
      colorScheme: options?.colorScheme,
      accessibilityLevel: options?.accessibilityLevel || 'AA',
    }
    
    // Filter out undefined values to satisfy exactOptionalPropertyTypes
    const generationOptions = Object.fromEntries(
      Object.entries(baseOptions).filter(([_, v]) => v !== undefined)
    )
    
    // Cost estimation
    const inputString = JSON.stringify({ sitemapData, options })
    const estimatedTokens = costOptimization.estimateTokens(inputString) + 2000
    const estimatedCost = costOptimization.estimateCost(estimatedTokens, 2500)
    
    // Generate wireframe using the AI generator
    const wireframeResult = await WireframeGenerator.generateFromSitemap(
      sitemapTree,
      generationOptions
    )
    
    const processingTime = Date.now() - startTime
    const tokensUsed = estimatedTokens // Simplified estimation
    const actualCost = estimatedCost
    
    // Transform the result to include metadata
    const result = {
      wireframe: wireframeResult.wireframe,
      confidence: wireframeResult.confidence,
      suggestions: wireframeResult.suggestions,
      warnings: wireframeResult.warnings,
      metadata: {
        processingTime,
        tokensUsed,
        cost: actualCost,
        sitemapPages: sitemapData.pages.length,
        components: wireframeResult.wireframe.components.length,
      }
    }
    
    // Save generation to database
    await logAIGeneration(
      user.id,
      projectId,
      'wireframe',
      'Generate wireframe from sitemap',
      { sitemapData, options: generationOptions },
      result,
      tokensUsed,
      actualCost,
      processingTime,
      'success'
    )
    
    // Return success response
    return createSuccessResponse(result, {
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
        route: '/api/builder/wireframe',
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
      
      if (error.message.includes('AI generation failed') || error.message.includes('Failed to generate wireframe')) {
        return createErrorResponse(
          ERROR_CODES.AI_GENERATION_FAILED,
          'Failed to generate wireframe. Please try again.',
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
 * GET /api/builder/wireframe
 * Health check or usage information for wireframe generation
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
        layoutPreferences: [
          'single-column',
          'two-column',
          'three-column',
          'sidebar-left',
          'sidebar-right',
          'header-sidebar',
          'header-footer',
        ],
        styles: ['modern', 'classic', 'minimal', 'corporate'],
        accessibilityLevels: ['A', 'AA', 'AAA'],
        options: {
          includeNavigation: true,
          includeFooter: true,
          includeSidebar: 'auto-detect',
        },
      },
      limits: {
        rateLimit: {
          requests: 3,
          window: '1 minute',
        },
        costs: {
          maxPerHour: '$5.00',
          maxPerDay: '$20.00',
        },
        complexity: {
          maxSitemapPages: 50,
          maxDepth: 5,
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

/**
 * Helper function to calculate maximum depth of sitemap
 */
function calculateMaxDepth(pages: any[], currentDepth: number = 0): number {
  let maxDepth = currentDepth
  
  for (const page of pages) {
    if (page.children && page.children.length > 0) {
      const childDepth = calculateMaxDepth(page.children, currentDepth + 1)
      maxDepth = Math.max(maxDepth, childDepth)
    }
  }
  
  return maxDepth
}

/**
 * Helper function to extract unique page types
 */
function getPageTypes(pages: any[]): string[] {
  const types = new Set<string>()
  
  const extractType = (path: string, title: string): string => {
    const lowerPath = path.toLowerCase()
    const lowerTitle = title.toLowerCase()
    
    if (lowerPath.includes('/product') || lowerTitle.includes('product')) return 'product'
    if (lowerPath.includes('/cart') || lowerTitle.includes('cart')) return 'ecommerce'
    if (lowerPath.includes('/blog') || lowerTitle.includes('blog')) return 'blog'
    if (lowerPath.includes('/news') || lowerTitle.includes('news')) return 'news'
    if (lowerPath.includes('/contact') || lowerTitle.includes('contact')) return 'contact'
    if (lowerPath.includes('/about') || lowerTitle.includes('about')) return 'about'
    if (lowerPath.includes('/faq') || lowerTitle.includes('faq')) return 'faq'
    if (lowerPath.includes('/dashboard') || lowerTitle.includes('dashboard')) return 'dashboard'
    
    return 'landing'
  }
  
  pages.forEach(page => {
    types.add(extractType(page.path, page.title))
  })
  
  return Array.from(types)
}
