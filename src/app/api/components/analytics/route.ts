import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { componentDatabaseHelpers } from '@/lib/supabase/components'
import { z } from 'zod'

const analyticsSchema = z.object({
  timeframe: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  categories: z.array(z.string()).optional(),
  frameworks: z.array(z.string()).optional(),
  limit: z.number().min(1).max(100).default(10),
})

// GET /api/components/analytics - Get comprehensive analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse and validate parameters
    const params = {
      timeframe: searchParams.get('timeframe') || '30d',
      categories: searchParams.get('categories')?.split(',') || undefined,
      frameworks: searchParams.get('frameworks')?.split(',') || undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 10,
    }

    const validatedParams = analyticsSchema.parse(params)

    // Get basic analytics
    const analyticsResult = await componentDatabaseHelpers.analytics.getAnalytics()

    if (!analyticsResult.success) {
      return NextResponse.json(
        { error: analyticsResult.error?.message || 'Failed to fetch analytics', success: false },
        { status: 500 }
      )
    }

    // Get trending components
    const trendingResult = await getTrendingComponents(validatedParams)

    // Get popular components
    const popularResult = await getPopularComponents(validatedParams)

    // Get usage statistics
    const usageResult = await getUsageStatistics(validatedParams)

    const analytics = {
      overview: analyticsResult.data,
      trending: trendingResult.success ? trendingResult.data : null,
      popular: popularResult.success ? popularResult.data : null,
      usage: usageResult.success ? usageResult.data : null,
      generated_at: new Date().toISOString(),
    }

    return NextResponse.json({
      data: analytics,
      success: true,
    })

  } catch (error: any) {
    console.error('Error fetching analytics:', error)
    
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

// Helper function to get trending components
async function getTrendingComponents(params: any) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Calculate date range based on timeframe
    const days = params.timeframe === '7d' ? 7 : params.timeframe === '30d' ? 30 : 
                 params.timeframe === '90d' ? 90 : 365
    
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0]

    // Get components with trending data
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
        preview_url,
        component_usage_stats!inner(
          trending_score,
          total_uses,
          unique_users,
          date
        )
      `)
      .eq('is_public', true)
      .gte('component_usage_stats.date', startDate)
      .order('component_usage_stats.trending_score', { ascending: false })
      .limit(params.limit)

    if (error) {
      throw error
    }

    // Transform data for frontend
    const trendingComponents = data?.map(component => ({
      id: component.id,
      name: component.name,
      category: component.category,
      framework: component.framework,
      usage_count: component.usage_count,
      rating: component.rating,
      is_featured: component.is_featured,
      preview_url: component.preview_url,
      trending_score: component.component_usage_stats[0]?.trending_score || 0,
      recent_usage: component.component_usage_stats[0]?.total_uses || 0,
      unique_users: component.component_usage_stats[0]?.unique_users || 0,
    })) || []

    return {
      success: true,
      data: trendingComponents,
    }

  } catch (error: any) {
    console.error('Error fetching trending components:', error)
    return {
      success: false,
      error: error.message,
      data: null,
    }
  }
}

// Helper function to get popular components
async function getPopularComponents(params: any) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    let query = supabase
      .from('components')
      .select(`
        id,
        name,
        category,
        framework,
        usage_count,
        rating,
        is_featured,
        preview_url,
        description,
        tags
      `)
      .eq('is_public', true)
      .order('usage_count', { ascending: false })
      .limit(params.limit)

    // Apply filters
    if (params.categories?.length) {
      query = query.in('category', params.categories)
    }
    
    if (params.frameworks?.length) {
      query = query.in('framework', params.frameworks)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return {
      success: true,
      data: data || [],
    }

  } catch (error: any) {
    console.error('Error fetching popular components:', error)
    return {
      success: false,
      error: error.message,
      data: null,
    }
  }
}

// Helper function to get usage statistics
async function getUsageStatistics(params: any) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Calculate date range
    const days = params.timeframe === '7d' ? 7 : params.timeframe === '30d' ? 30 : 
                 params.timeframe === '90d' ? 90 : 365
    
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0]

    // Get aggregated usage stats
    const { data, error } = await supabase
      .from('component_usage_stats')
      .select(`
        component_id,
        components(name, category, framework),
        date,
        total_uses,
        unique_users,
        successful_imports,
        failed_imports,
        avg_rating
      `)
      .gte('date', startDate)
      .order('date', { ascending: true })

    if (error) {
      throw error
    }

    // Process data for trends
    const dailyStats: Record<string, any> = {}
    const componentStats: Record<string, any> = {}

    data?.forEach(stat => {
      // Daily aggregation
      const date = stat.date
      if (!dailyStats[date]) {
        dailyStats[date] = {
          date,
          total_uses: 0,
          unique_users: 0,
          successful_imports: 0,
          failed_imports: 0,
          component_count: 0,
        }
      }

      dailyStats[date].total_uses += stat.total_uses || 0
      dailyStats[date].unique_users += stat.unique_users || 0
      dailyStats[date].successful_imports += stat.successful_imports || 0
      dailyStats[date].failed_imports += stat.failed_imports || 0
      dailyStats[date].component_count += 1

      // Component breakdown
      const componentId = stat.component_id
      if (!componentStats[componentId]) {
        componentStats[componentId] = {
          id: componentId,
          name: stat.components?.[0]?.name || '',
          category: stat.components?.[0]?.category || '',
          framework: stat.components?.[0]?.framework || '',
          total_uses: 0,
          unique_users: 0,
          avg_rating: 0,
          rating_count: 0,
        }
      }

      componentStats[componentId].total_uses += stat.total_uses || 0
      componentStats[componentId].unique_users += stat.unique_users || 0
      
      if (stat.avg_rating) {
        componentStats[componentId].avg_rating += stat.avg_rating
        componentStats[componentId].rating_count += 1
      }
    })

    // Calculate averages
    Object.values(componentStats).forEach((stat: any) => {
      if (stat.rating_count > 0) {
        stat.avg_rating = stat.avg_rating / stat.rating_count
      }
      delete stat.rating_count
    })

    return {
      success: true,
      data: {
        daily_trends: Object.values(dailyStats),
        component_breakdown: Object.values(componentStats),
        summary: {
          period_days: days,
          total_usage: Object.values(dailyStats).reduce((sum: number, day: any) => sum + day.total_uses, 0),
          total_unique_users: Object.values(dailyStats).reduce((sum: number, day: any) => sum + day.unique_users, 0),
          average_daily_usage: Object.values(dailyStats).reduce((sum: number, day: any) => sum + day.total_uses, 0) / days,
        },
      },
    }

  } catch (error: any) {
    console.error('Error fetching usage statistics:', error)
    return {
      success: false,
      error: error.message,
      data: null,
    }
  }
}