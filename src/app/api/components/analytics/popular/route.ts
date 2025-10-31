import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { componentDatabaseHelpers } from '@/lib/supabase/components'
import { z } from 'zod'

const popularSchema = z.object({
  timeframe: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  category: z.string().optional(),
  framework: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  sort_by: z.enum(['usage_count', 'rating', 'recent']).default('usage_count'),
})

// GET /api/components/analytics/popular - Most popular components
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse and validate parameters
    const params = {
      timeframe: searchParams.get('timeframe') || '30d',
      category: searchParams.get('category') || undefined,
      framework: searchParams.get('framework') || undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
      sort_by: (searchParams.get('sort_by') as any) || 'usage_count',
    }

    const validatedParams = popularSchema.parse(params)

    const supabase = createRouteHandlerClient({ cookies })
    
    // Calculate date range based on timeframe
    const days = validatedParams.timeframe === '7d' ? 7 : validatedParams.timeframe === '30d' ? 30 : 
                 validatedParams.timeframe === '90d' ? 90 : 365
    
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0]

    // Build base query
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
        profiles!components_author_id_fkey(full_name, avatar_url),
        component_usage_stats(
          total_uses,
          unique_users,
          successful_imports,
          avg_rating,
          date
        )
      `)
      .eq('is_public', true)

    // Apply filters
    if (validatedParams.category) {
      query = query.eq('category', validatedParams.category)
    }
    
    if (validatedParams.framework) {
      query = query.eq('framework', validatedParams.framework)
    }

    // Apply sorting
    switch (validatedParams.sort_by) {
      case 'usage_count':
        query = query.order('usage_count', { ascending: false })
        break
      case 'rating':
        query = query.order('rating', { ascending: false, nullsLast: true })
        break
      case 'recent':
        query = query.order('updated_at', { ascending: false })
        break
      default:
        query = query.order('usage_count', { ascending: false })
    }

    const { data: components, error } = await query.limit(validatedParams.limit)

    if (error) {
      throw error
    }

    // Enhance components with usage data for the specified timeframe
    const enhancedComponents = components?.map(component => {
      const recentStats = component.component_usage_stats?.filter(
        stat => stat.date >= startDate
      ) || []

      const totalRecentUses = recentStats.reduce((sum, stat) => sum + (stat.total_uses || 0), 0)
      const totalRecentUsers = new Set(
        recentStats.flatMap(stat => stat.unique_users || [])
      ).size

      return {
        ...component,
        recent_usage: {
          total_uses: totalRecentUses,
          unique_users: totalRecentUsers,
          period_days: days,
          daily_average: totalRecentUses / days,
        },
        // Remove the raw usage stats to clean up the response
        component_usage_stats: undefined,
      }
    }) || []

    // Calculate popularity score for ranking
    const componentsWithScores = enhancedComponents.map(component => {
      const usageScore = component.usage_count * 0.4
      const ratingScore = (component.rating || 0) * 20 * 0.3 // Scale rating to 0-100
      const recencyScore = Math.max(0, 100 - (Date.now() - new Date(component.updated_at).getTime()) / (1000 * 60 * 60 * 24 * 30)) * 0.2 // Decay over months
      const featuredBonus = component.is_featured ? 10 : 0
      const qualityBonus = ((component.performance_score || 0) + (component.accessibility_score || 0)) / 20 * 0.1

      const popularityScore = usageScore + ratingScore + recencyScore + featuredBonus + qualityBonus

      return {
        ...component,
        popularity_score: Math.round(popularityScore),
      }
    })

    // Sort by popularity score if not already sorted by specific criteria
    if (validatedParams.sort_by === 'usage_count') {
      componentsWithScores.sort((a, b) => b.popularity_score - a.popularity_score)
    }

    // Get category and framework summaries
    const { data: categories } = await supabase
      .from('component_categories')
      .select('name, component_count')
      .eq('is_active', true)
      .order('component_count', { ascending: false })
      .limit(10)

    const { data: frameworks } = await supabase
      .from('components')
      .select('framework')
      .eq('is_public', true)

    const frameworkStats = frameworks?.reduce((acc, comp) => {
      acc[comp.framework] = (acc[comp.framework] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    return NextResponse.json({
      data: {
        components: componentsWithScores,
        summary: {
          total_components: componentsWithScores.length,
          timeframe: validatedParams.timeframe,
          filters: {
            category: validatedParams.category,
            framework: validatedParams.framework,
            sort_by: validatedParams.sort_by,
          },
          categories: categories || [],
          frameworks: Object.entries(frameworkStats).map(([name, count]) => ({ name, count })),
          top_rated: componentsWithScores
            .filter(c => c.rating)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 5)
            .map(c => ({ id: c.id, name: c.name, rating: c.rating })),
          most_used: componentsWithScores
            .sort((a, b) => b.usage_count - a.usage_count)
            .slice(0, 5)
            .map(c => ({ id: c.id, name: c.name, usage_count: c.usage_count })),
        },
      },
      success: true,
    })

  } catch (error: any) {
    console.error('Error fetching popular components:', error)
    
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
        error: 'Internal server error',
        message: error.message,
        success: false 
      },
      { status: 500 }
    )
  }
}