import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { componentDatabaseHelpers } from '@/lib/supabase/components'
import { componentSearchHelpers } from '@/lib/search/component-search'
import { z } from 'zod'

const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  categories: z.array(z.string()).optional(),
  frameworks: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  difficulty_levels: z.array(z.string()).optional(),
  rating_min: z.number().min(0).max(5).optional(),
  usage_min: z.number().min(0).optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  sort_by: z.enum(['relevance', 'popularity', 'rating', 'recent', 'name']).default('relevance'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  include_fuzzy: z.boolean().default(true),
  include_semantic: z.boolean().default(true),
  highlight_matches: z.boolean().default(true),
})

// Rate limiting (simple in-memory rate limiter for AI-powered features)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10 // 10 requests per minute for AI features

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

// POST /api/components/search - Full-text and semantic search
export async function POST(request: NextRequest) {
  try {
    // Get client information for rate limiting
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    const rateLimitKey = `${clientIP}:${userAgent}`

    // Parse and validate request body
    const body = await request.json()
    const validatedData = searchSchema.parse(body)

    // Check rate limit for AI-powered features
    if (validatedData.include_semantic && !checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later.',
          success: false,
          retry_after: 60,
        },
        { status: 429 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Start timing the search
    const startTime = Date.now()

    // Perform the search
    let searchResults
    let searchMethod = 'basic'

    if (validatedData.include_semantic) {
      // Use semantic search with AI
      searchResults = await performSemanticSearch(supabase, validatedData)
      searchMethod = 'semantic'
    } else if (validatedData.include_fuzzy) {
      // Use fuzzy search
      searchResults = await performFuzzySearch(supabase, validatedData)
      searchMethod = 'fuzzy'
    } else {
      // Use basic full-text search
      searchResults = await performBasicSearch(supabase, validatedData)
      searchMethod = 'basic'
    }

    const endTime = Date.now()
    const searchDuration = endTime - startTime

    if (!searchResults.success) {
      return NextResponse.json(
        { error: searchResults.error || 'Search failed', success: false },
        { status: 500 }
      )
    }

    // Enhance results with additional data
    const enhancedResults = await enhanceSearchResults(supabase, searchResults.data, validatedData)

    // Calculate search metrics
    const searchMetrics = {
      total_results: enhancedResults.length,
      search_duration_ms: searchDuration,
      search_method: searchMethod,
      query: validatedData.query,
      filters_applied: {
        categories: validatedData.categories?.length || 0,
        frameworks: validatedData.frameworks?.length || 0,
        tags: validatedData.tags?.length || 0,
        has_date_range: !!(validatedData.date_from || validatedData.date_to),
      },
      performance_score: searchDuration < 100 ? 'excellent' : 
                        searchDuration < 500 ? 'good' : 
                        searchDuration < 1000 ? 'fair' : 'slow',
    }

    // Log search for analytics (optional)
    await logSearchAnalytics(supabase, validatedData, searchMetrics)

    return NextResponse.json({
      data: {
        results: enhancedResults,
        meta: {
          ...searchMetrics,
          has_more: enhancedResults.length === validatedData.limit,
          next_offset: validatedData.offset + validatedData.limit,
        },
        suggestions: searchMetrics.total_results === 0 ? await generateSearchSuggestions(validatedData.query) : [],
      },
      success: true,
    })

  } catch (error: any) {
    console.error('Error performing component search:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid search parameters',
          details: error.errors,
          success: false 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Search service temporarily unavailable',
        message: error.message,
        success: false 
      },
      { status: 503 }
    )
  }
}

// Basic full-text search using PostgreSQL full-text search
async function performBasicSearch(supabase: any, filters: any) {
  try {
    // Build the search query
    let query = supabase
      .from('components')
      .select(`
        id,
        name,
        description,
        category,
        framework,
        usage_count,
        rating,
        is_featured,
        preview_url,
        tags,
        complexity_score,
        performance_score,
        accessibility_score,
        created_at,
        updated_at,
        author_id,
        profiles!components_author_id_fkey(full_name, avatar_url)
      `)
      .eq('is_public', true)

    // Apply text search
    if (filters.query) {
      // Use ILIKE for simple text matching (could be enhanced with full-text search)
      query = query.or(`name.ilike.%${filters.query}%,description.ilike.%${filters.query}%`)
    }

    // Apply filters
    query = await applySearchFilters(query, filters)

    // Apply sorting
    query = applySearchSorting(query, filters)

    // Apply pagination
    query = query
      .range(filters.offset, filters.offset + filters.limit - 1)

    const { data, error } = await query

    if (error) {
      throw error
    }

    return {
      success: true,
      data: data || [],
    }

  } catch (error: any) {
    console.error('Error in basic search:', error)
    return {
      success: false,
      error: error.message,
      data: [],
    }
  }
}

// Fuzzy search using PostgreSQL trigram similarity
async function performFuzzySearch(supabase: any, filters: any) {
  try {
    // Use the component search helpers if available
    if (componentSearchHelpers?.fuzzySearch) {
      const result = await componentSearchHelpers.fuzzySearch({
        query: filters.query,
        filters,
        limit: filters.limit,
        offset: filters.offset,
      })

      if (result.success) {
        return result
      }
    }

    // Fallback to basic search
    return await performBasicSearch(supabase, filters)

  } catch (error: any) {
    console.error('Error in fuzzy search:', error)
    return {
      success: false,
      error: error.message,
      data: [],
    }
  }
}

// Semantic search using AI embeddings
async function performSemanticSearch(supabase: any, filters: any) {
  try {
    // Use the component search helpers for semantic search
    if (componentSearchHelpers?.semanticSearch) {
      const result = await componentSearchHelpers.semanticSearch({
        query: filters.query,
        filters,
        limit: filters.limit,
        offset: filters.offset,
      })

      if (result.success) {
        return result
      }
    }

    // Fallback to fuzzy search
    return await performFuzzySearch(supabase, filters)

  } catch (error: any) {
    console.error('Error in semantic search:', error)
    return {
      success: false,
      error: error.message,
      data: [],
    }
  }
}

// Apply search filters to query
async function applySearchFilters(query: any, filters: any) {
  // Category filter
  if (filters.categories?.length) {
    query = query.in('category', filters.categories)
  }

  // Framework filter
  if (filters.frameworks?.length) {
    query = query.in('framework', filters.frameworks)
  }

  // Tags filter
  if (filters.tags?.length) {
    query = query.overlaps('tags', filters.tags)
  }

  // Difficulty levels filter (based on complexity_score)
  if (filters.difficulty_levels?.length) {
    const complexityMap = {
      'beginner': [1],
      'intermediate': [2, 3],
      'advanced': [4, 5],
    }

    const complexityScores = filters.difficulty_levels
      .flatMap((level: string) => complexityMap[level as keyof typeof complexityMap] || [])
      .filter(Boolean)

    if (complexityScores.length) {
      query = query.in('complexity_score', complexityScores)
    }
  }

  // Rating filter
  if (filters.rating_min) {
    query = query.gte('rating', filters.rating_min)
  }

  // Usage filter
  if (filters.usage_min) {
    query = query.gte('usage_count', filters.usage_min)
  }

  // Date range filter
  if (filters.date_from) {
    query = query.gte('created_at', filters.date_from)
  }

  if (filters.date_to) {
    query = query.lte('created_at', filters.date_to)
  }

  return query
}

// Apply sorting to search query
function applySearchSorting(query: any, filters: any) {
  switch (filters.sort_by) {
    case 'popularity':
      return query.order('usage_count', { ascending: filters.sort_order === 'asc' })
    case 'rating':
      return query.order('rating', { ascending: filters.sort_order === 'asc', nullsLast: true })
    case 'recent':
      return query.order('updated_at', { ascending: filters.sort_order === 'asc' })
    case 'name':
      return query.order('name', { ascending: filters.sort_order === 'asc' })
    case 'relevance':
    default:
      // For relevance, we'll rely on the search method's built-in scoring
      return query.order('usage_count', { ascending: false })
  }
}

// Enhance search results with additional data
async function enhanceSearchResults(supabase: any, results: any[], filters: any) {
  if (!results.length) return results

  // Get component IDs for batch processing
  const componentIds = results.map(r => r.id)

  // Get additional data in batch
  const [variantsData, dependenciesData, statsData] = await Promise.all([
    // Get variants
    supabase
      .from('component_variants')
      .select('component_id, name, slug, is_default')
      .in('component_id', componentIds)
      .eq('is_active', true),

    // Get dependencies
    supabase
      .from('component_dependencies')
      .select('component_id, dependency_type')
      .in('component_id', componentIds),

    // Get recent usage stats
    supabase
      .from('component_usage_stats')
      .select('component_id, trending_score, avg_rating')
      .in('component_id', componentIds)
      .order('date', { ascending: false })
      .limit(1),
  ])

  // Group additional data by component ID
  const variantsMap = new Map()
  variantsData.data?.forEach(variant => {
    if (!variantsMap.has(variant.component_id)) {
      variantsMap.set(variant.component_id, [])
    }
    variantsMap.get(variant.component_id).push(variant)
  })

  const dependenciesMap = new Map()
  dependenciesData.data?.forEach(dep => {
    if (!dependenciesMap.has(dep.component_id)) {
      dependenciesMap.set(dep.component_id, { runtime: 0, build: 0, peer: 0 })
    }
    dependenciesMap.get(dep.component_id)[dep.dependency_type]++
  })

  const statsMap = new Map()
  statsData.data?.forEach(stat => {
    statsMap.set(stat.component_id, stat)
  })

  // Enhance results
  return results.map(result => ({
    ...result,
    variants: variantsMap.get(result.id) || [],
    dependencies: dependenciesMap.get(result.id) || { runtime: 0, build: 0, peer: 0 },
    recent_stats: statsMap.get(result.id) || null,
    
    // Add computed fields
    search_score: calculateSearchScore(result, filters),
    match_highlights: filters.highlight_matches ? highlightMatches(result, filters.query) : null,
  }))
}

// Calculate search relevance score
function calculateSearchScore(component: any, filters: any): number {
  let score = 0

  // Base score from usage
  score += Math.log(component.usage_count + 1) * 10

  // Rating bonus
  score += (component.rating || 0) * 5

  // Feature bonus
  if (component.is_featured) {
    score += 20
  }

  // Recency bonus
  const daysSinceUpdate = (Date.now() - new Date(component.updated_at).getTime()) / (1000 * 60 * 60 * 24)
  score += Math.max(0, 30 - daysSinceUpdate) * 0.5

  // Quality bonus
  score += ((component.performance_score || 0) + (component.accessibility_score || 0)) / 20

  return Math.round(score * 100) / 100
}

// Highlight matching terms in component data
function highlightMatches(component: any, query: string): { [key: string]: string[] } | null {
  if (!query) return null

  const highlights: { [key: string]: string[] } = {}
  const queryTerms = query.toLowerCase().split(' ').filter(term => term.length > 2)

  queryTerms.forEach(term => {
    // Check name
    if (component.name?.toLowerCase().includes(term)) {
      if (!highlights.name) highlights.name = []
      highlights.name.push(term)
    }

    // Check description
    if (component.description?.toLowerCase().includes(term)) {
      if (!highlights.description) highlights.description = []
      highlights.description.push(term)
    }

    // Check tags
    const matchingTags = component.tags?.filter((tag: string) => 
      tag.toLowerCase().includes(term)
    ) || []
    if (matchingTags.length) {
      if (!highlights.tags) highlights.tags = []
      highlights.tags.push(...matchingTags)
    }
  })

  return Object.keys(highlights).length > 0 ? highlights : null
}

// Generate search suggestions when no results found
async function generateSearchSuggestions(query: string): Promise<string[]> {
  const suggestions = []

  // Suggest removing special characters
  const cleanedQuery = query.replace(/[^\w\s]/g, '')
  if (cleanedQuery !== query) {
    suggestions.push(`Try searching for "${cleanedQuery}"`)
  }

  // Suggest broader terms
  const words = query.toLowerCase().split(' ')
  if (words.length > 1) {
    suggestions.push(`Try searching for just "${words[0]}"`)
    suggestions.push(`Try searching for just "${words[words.length - 1]}"`)
  }

  // Suggest popular alternatives (this would require more complex logic)
  suggestions.push('Check your spelling')
  suggestions.push('Try different keywords')

  return suggestions.slice(0, 3)
}

// Log search analytics
async function logSearchAnalytics(supabase: any, filters: any, metrics: any) {
  try {
    // Store search analytics for improving the search algorithm
    const { error } = await supabase
      .from('search_analytics')
      .insert({
        query: filters.query,
        results_count: metrics.total_results,
        search_duration_ms: metrics.search_duration_ms,
        search_method: metrics.search_method,
        filters_applied: JSON.stringify(metrics.filters_applied),
        created_at: new Date().toISOString(),
      })

    if (error) {
      console.warn('Failed to log search analytics:', error)
    }
  } catch (error) {
    console.warn('Error logging search analytics:', error)
  }
}