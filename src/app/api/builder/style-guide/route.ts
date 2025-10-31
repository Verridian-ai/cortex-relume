/**
 * API Route: POST /api/builder/style-guide
 * Generates style guide from wireframe and brand guidelines using AI
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
import { styleGenerator } from '@/lib/ai/style-generator'

/**
 * Rate limit identifier for this route
 */
const RATE_LIMIT_KEY = 'style_guide_generation'

/**
 * POST /api/builder/style-guide
 * Generate style guide from wireframe and brand guidelines
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
    const validation = validateRequest(requestData, schemas.styleGuideGeneration)
    
    if (!validation.success) {
      return createErrorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Invalid request data',
        400,
        { details: validation.error }
      )
    }
    
    const { 
      wireframeData, 
      brandGuidelines, 
      designStyle, 
      wireframeDescription, 
      existingColors, 
      preferences 
    } = validation.data
    
    const projectId = extractProjectId(request.nextUrl.searchParams) || null
    
    // Cost estimation
    const inputString = JSON.stringify({ 
      wireframeData, 
      brandGuidelines, 
      designStyle, 
      preferences 
    })
    const estimatedTokens = costOptimization.estimateTokens(inputString) + 3000
    const estimatedCost = costOptimization.estimateCost(estimatedTokens, 3000)
    
    // Generate style guide using the AI generator
    const styleResult = await styleGenerator.generateStyleGuide({
      wireframeData,
      brandGuidelines,
      designStyle,
      wireframeDescription,
      existingColors,
      preferences,
    })
    
    const processingTime = Date.now() - startTime
    
    // Check if generation was successful
    if (!styleResult.success) {
      return createErrorResponse(
        ERROR_CODES.AI_GENERATION_FAILED,
        styleResult.error || 'Failed to generate style guide',
        500
      )
    }
    
    // Add metadata to the result
    const result = {
      styleGuide: styleResult.styleGuide,
      warnings: styleResult.warnings || [],
      metadata: {
        processingTime,
        tokensUsed: estimatedTokens,
        cost: estimatedCost,
        components: styleResult.styleGuide.componentStyles ? Object.keys(styleResult.styleGuide.componentStyles).length : 0,
        brandAlignment: calculateBrandAlignment(brandGuidelines, styleResult.styleGuide),
      }
    }
    
    // Save generation to database
    await logAIGeneration(
      user.id,
      projectId,
      'style_guide',
      'Generate style guide from wireframe and brand guidelines',
      { wireframeData, brandGuidelines, designStyle, preferences },
      result,
      estimatedTokens,
      estimatedCost,
      processingTime,
      'success'
    )
    
    // Return success response
    return createSuccessResponse(result, {
      processingTime,
      tokensUsed: estimatedTokens,
      cost: estimatedCost,
      rateLimitRemaining: rateLimit.remaining,
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    
    // Log the error
    try {
      const user = await verifyAuth(request).catch(() => null)
      logApiError(error, {
        route: '/api/builder/style-guide',
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
      
      if (error.message.includes('AI generation failed') || error.message.includes('Style generation error')) {
        return createErrorResponse(
          ERROR_CODES.AI_GENERATION_FAILED,
          'Failed to generate style guide. Please try again.',
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
 * GET /api/builder/style-guide
 * Health check or usage information for style guide generation
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
        designStyles: [
          'modern',
          'classic',
          'minimal',
          'corporate',
          'playful',
          'luxury',
          'tech'
        ],
        preferences: {
          colorIntensity: ['muted', 'balanced', 'vibrant'],
          typographyStyle: ['classic', 'modern', 'futuristic'],
          spacingDensity: ['compact', 'comfortable', 'spacious'],
        },
        brandGuidelines: {
          personalityTraits: 10,
          brandValues: 10,
          colorPreferences: 10,
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
        input: {
          maxBrandPersonality: 10,
          maxBrandValues: 10,
          maxColorPreferences: 10,
          maxWireframeDescription: 1000,
        },
      },
      features: {
        accessibility: 'WCAG AA compliant',
        responsive: 'Mobile-first design',
        components: 'Reusable design system',
        cssVariables: 'CSS custom properties generation',
        themeTokens: 'Design tokens for implementation',
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
 * Calculate brand alignment score based on style guide and brand guidelines
 */
function calculateBrandAlignment(brandGuidelines: any, styleGuide: any): number {
  let alignmentScore = 50 // Base score
  
  // Check typography preference alignment
  if (brandGuidelines.typographyPreference) {
    const preference = brandGuidelines.typographyPreference
    const fontFamilies = Object.values(styleGuide.typography.fontFamily).flat()
    
    if (preference === 'sans-serif' && fontFamilies.some(f => f.includes('sans'))) {
      alignmentScore += 15
    } else if (preference === 'serif' && fontFamilies.some(f => f.includes('serif'))) {
      alignmentScore += 15
    }
  }
  
  // Check color alignment (simplified)
  if (brandGuidelines.colorPreferences && brandGuidelines.colorPreferences.length > 0) {
    // In a real implementation, would compare color hues/tones
    alignmentScore += 10
  }
  
  // Check personality alignment (simplified heuristic)
  const personality = brandGuidelines.brandPersonality?.[0]?.toLowerCase() || ''
  
  if (personality.includes('professional')) {
    alignmentScore += styleGuide.typography.fontWeight.normal >= 400 ? 10 : 0
  } else if (personality.includes('creative') || personality.includes('playful')) {
    alignmentScore += styleGuide.borderRadius.lg !== '0.5rem' ? 10 : 0
  } else if (personality.includes('luxury') || personality.includes('premium')) {
    alignmentScore += Object.values(styleGuide.shadows).some(shadow => shadow.includes('xl')) ? 10 : 0
  }
  
  return Math.min(100, Math.max(0, alignmentScore))
}

/**
 * Generate CSS variables from style guide for immediate use
 */
export function generateCSSVariables(styleGuide: any): Record<string, string> {
  const cssVars: Record<string, string> = {}
  
  // Colors
  Object.entries(styleGuide.colorPalette).forEach(([category, colors]) => {
    if (typeof colors === 'object' && '50' in colors) {
      Object.entries(colors as any).forEach(([shade, color]) => {
        cssVars[`--color-${category}-${shade}`] = color as string
      })
    } else {
      cssVars[`--color-${category}`] = colors as any
    }
  })
  
  // Typography
  Object.entries(styleGuide.typography.fontSize).forEach(([size, value]) => {
    cssVars[`--font-size-${size}`] = value
  })
  
  Object.entries(styleGuide.typography.fontWeight).forEach(([weight, value]) => {
    cssVars[`--font-weight-${weight}`] = value.toString()
  })
  
  // Spacing
  Object.entries(styleGuide.spacing.scale).forEach(([key, value]) => {
    cssVars[`--spacing-${key}`] = value
  })
  
  // Border radius
  Object.entries(styleGuide.borderRadius).forEach(([key, value]) => {
    cssVars[`--radius-${key}`] = value
  })
  
  // Shadows
  Object.entries(styleGuide.shadows).forEach(([key, value]) => {
    cssVars[`--shadow-${key}`] = value
  })
  
  return cssVars
}
