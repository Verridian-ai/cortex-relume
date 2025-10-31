import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const suggestionsSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  limit: z.number().min(1).max(20).default(10),
  types: z.array(z.enum(['components', 'categories', 'tags', 'frameworks'])).default(['components', 'categories', 'tags']),
  include_usage: z.boolean().default(true),
})

// Rate limiting for suggestions API
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30 // 30 requests per minute

function checkRateLimit(identifier: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(identifier)
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }
  
  if (limit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false
  }
  
  limit.count++
  return true
}

// GET /api/components/suggestions - Auto-complete suggestions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Client information for rate limiting
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    const rateLimitKey = `${clientIP}:${userAgent}`

    // Check rate limit
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          success: false,
          retry_after: 60,
        },
        { status: 429 }
      )
    }

    // Parse and validate parameters
    const params = {
      query: searchParams.get('query') || '',
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 10,
      types: searchParams.get('types')?.split(',') || ['components', 'categories', 'tags'],
      include_usage: searchParams.get('include_usage') !== 'false',
    }

    const validatedParams = suggestionsSchema.parse(params)

    if (!validatedParams.query.trim()) {
      return NextResponse.json(
        { 
          data: {
            suggestions: [],
            total: 0,
            query: validatedParams.query,
          },
          success: true,
        }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Generate suggestions
    const suggestions = await generateSuggestions(supabase, validatedParams)

    return NextResponse.json({
      data: {
        suggestions,
        total: suggestions.length,
        query: validatedParams.query,
        types_searched: validatedParams.types,
      },
      success: true,
    })

  } catch (error: any) {
    console.error('Error generating suggestions:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid parameters',
          details: error.errors,
          success: false 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Suggestions service temporarily unavailable',
        message: error.message,
        success: false 
      },
      { status: 503 }
    )
  }
}

// Generate autocomplete suggestions
async function generateSuggestions(supabase: any, params: any) {
  const suggestions = []
  const query = params.query.trim().toLowerCase()

  // Component suggestions
  if (params.types.includes('components')) {
    const componentSuggestions = await getComponentSuggestions(supabase, query, params.limit)
    suggestions.push(...componentSuggestions)
  }

  // Category suggestions
  if (params.types.includes('categories')) {
    const categorySuggestions = await getCategorySuggestions(supabase, query, params.limit)
    suggestions.push(...categorySuggestions)
  }

  // Tag suggestions
  if (params.types.includes('tags')) {
    const tagSuggestions = await getTagSuggestions(supabase, query, params.limit)
    suggestions.push(...tagSuggestions)
  }

  // Framework suggestions
  if (params.types.includes('frameworks')) {
    const frameworkSuggestions = await getFrameworkSuggestions(supabase, query, params.limit)
    suggestions.push(...frameworkSuggestions)
  }

  // Sort by relevance and limit results
  const sortedSuggestions = suggestions
    .sort((a, b) => {
      // Sort by match type priority, then by relevance score
      const typePriority = { exact: 3, prefix: 2, fuzzy: 1 }
      const aPriority = typePriority[a.match_type as keyof typeof typePriority] || 0
      const bPriority = typePriority[b.match_type as keyof typeof typePriority] || 0
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority
      }
      
      return b.relevance_score - a.relevance_score
    })
    .slice(0, params.limit)

  return sortedSuggestions
}

// Get component name suggestions
async function getComponentSuggestions(supabase: any, query: string, limit: number) {
  try {
    const { data, error } = await supabase
      .from('components')
      .select(`
        id,
        name,
        category,
        framework,
        usage_count,
        rating,
        is_featured,
        preview_url
      `)
      .eq('is_public', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('usage_count', { ascending: false })
      .order('rating', { ascending: false, nullsLast: true })
      .limit(limit)

    if (error) {
      throw error
    }

    return (data || []).map(component => {
      const nameLower = component.name.toLowerCase()
      let match_type = 'fuzzy'
      let relevance_score = 50

      // Determine match type and calculate relevance
      if (nameLower === query) {
        match_type = 'exact'
        relevance_score = 100
      } else if (nameLower.startsWith(query)) {
        match_type = 'prefix'
        relevance_score = 90
      } else if (nameLower.includes(query)) {
        match_type = 'fuzzy'
        relevance_score = 70
      }

      // Boost score based on popularity
      relevance_score += Math.min(20, Math.log(component.usage_count + 1) * 2)
      
      // Boost score for featured components
      if (component.is_featured) {
        relevance_score += 10
      }

      // Boost score for high rating
      if (component.rating) {
        relevance_score += component.rating * 2
      }

      return {
        type: 'component',
        id: component.id,
        text: component.name,
        display_text: component.name,
        description: `${component.category} • ${component.framework}`,
        category: component.category,
        framework: component.framework,
        usage_count: component.usage_count,
        rating: component.rating,
        is_featured: component.is_featured,
        preview_url: component.preview_url,
        match_type,
        relevance_score: Math.round(relevance_score),
      }
    })

  } catch (error) {
    console.error('Error fetching component suggestions:', error)
    return []
  }
}

// Get category suggestions
async function getCategorySuggestions(supabase: any, query: string, limit: number) {
  try {
    const { data, error } = await supabase
      .from('component_categories')
      .select(`
        id,
        name,
        slug,
        description,
        component_count,
        icon,
        color
      `)
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,slug.ilike.%${query}%,description.ilike.%${query}%`)
      .order('component_count', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return (data || []).map(category => {
      const nameLower = category.name.toLowerCase()
      let match_type = 'fuzzy'
      let relevance_score = 60

      if (nameLower === query) {
        match_type = 'exact'
        relevance_score = 100
      } else if (nameLower.startsWith(query)) {
        match_type = 'prefix'
        relevance_score = 90
      } else if (nameLower.includes(query)) {
        match_type = 'fuzzy'
        relevance_score = 80
      }

      // Boost score based on component count
      relevance_score += Math.min(15, Math.log(category.component_count + 1) * 2)

      return {
        type: 'category',
        id: category.id,
        text: category.name,
        display_text: category.name,
        description: category.description || `${category.component_count} components`,
        icon: category.icon,
        color: category.color,
        component_count: category.component_count,
        match_type,
        relevance_score: Math.round(relevance_score),
      }
    })

  } catch (error) {
    console.error('Error fetching category suggestions:', error)
    return []
  }
}

// Get tag suggestions
async function getTagSuggestions(supabase: any, query: string, limit: number) {
  try {
    const { data, error } = await supabase
      .from('component_tags')
      .select(`
        id,
        name,
        slug,
        description,
        category,
        component_count,
        color,
        is_official
      `)
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,slug.ilike.%${query}%,description.ilike.%${query}%`)
      .order('component_count', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return (data || []).map(tag => {
      const nameLower = tag.name.toLowerCase()
      let match_type = 'fuzzy'
      let relevance_score = 55

      if (nameLower === query) {
        match_type = 'exact'
        relevance_score = 100
      } else if (nameLower.startsWith(query)) {
        match_type = 'prefix'
        relevance_score = 90
      } else if (nameLower.includes(query)) {
        match_type = 'fuzzy'
        relevance_score = 75
      }

      // Boost score for official tags
      if (tag.is_official) {
        relevance_score += 10
      }

      // Boost score based on component count
      relevance_score += Math.min(10, Math.log(tag.component_count + 1) * 1.5)

      return {
        type: 'tag',
        id: tag.id,
        text: tag.name,
        display_text: tag.name,
        description: tag.description || `${tag.component_count} components`,
        category: tag.category,
        color: tag.color,
        component_count: tag.component_count,
        is_official: tag.is_official,
        match_type,
        relevance_score: Math.round(relevance_score),
      }
    })

  } catch (error) {
    console.error('Error fetching tag suggestions:', error)
    return []
  }
}

// Get framework suggestions
async function getFrameworkSuggestions(supabase: any, query: string, limit: number) {
  try {
    const { data, error } = await supabase
      .from('components')
      .select('framework')
      .eq('is_public', true)

    if (error) {
      throw error
    }

    // Aggregate framework counts
    const frameworkCounts = (data || []).reduce((acc, component) => {
      acc[component.framework] = (acc[component.framework] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Filter and sort frameworks
    const matchingFrameworks = Object.entries(frameworkCounts)
      .filter(([framework]) => framework.toLowerCase().includes(query))
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)

    return matchingFrameworks.map(([framework, count]) => {
      const frameworkLower = framework.toLowerCase()
      let match_type = 'fuzzy'
      let relevance_score = 65

      if (frameworkLower === query) {
        match_type = 'exact'
        relevance_score = 100
      } else if (frameworkLower.startsWith(query)) {
        match_type = 'prefix'
        relevance_score = 90
      }

      // Boost score based on component count
      relevance_score += Math.min(20, Math.log(count + 1) * 3)

      return {
        type: 'framework',
        id: framework,
        text: framework,
        display_text: framework,
        description: `${count} components`,
        component_count: count,
        match_type,
        relevance_score: Math.round(relevance_score),
      }
    })

  } catch (error) {
    console.error('Error fetching framework suggestions:', error)
    return []
  }
}