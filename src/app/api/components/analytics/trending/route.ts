import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { componentDatabaseHelpers } from '@/lib/supabase/components'
import { z } from 'zod'

const trendingSchema = z.object({
  timeframe: z.enum(['24h', '7d', '30d']).default('7d'),
  category: z.string().optional(),
  framework: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  min_growth: z.number().min(0).default(0), // Minimum growth percentage
})

// GET /api/components/analytics/trending - Trending components
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse and validate parameters
    const params = {
      timeframe: searchParams.get('timeframe') || '7d',
      category: searchParams.get('category') || undefined,
      framework: searchParams.get('framework') || undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
      min_growth: searchParams.get('min_growth') ? Number(searchParams.get('min_growth')) : 0,
    }

    const validatedParams = trendingSchema.parse(params)

    const supabase = createRouteHandlerClient({ cookies })
    
    // Calculate date ranges
    const now = new Date()
    const currentStartDate = new Date(now.getTime() - getTimeframeDays(validatedParams.timeframe) * 24 * 60 * 60 * 1000)
    const previousStartDate = new Date(currentStartDate.getTime() - getTimeframeDays(validatedParams.timeframe) * 24 * 60 * 60 * 1000)

    const currentStartStr = currentStartDate.toISOString().split('T')[0]
    const previousStartStr = previousStartDate.toISOString().split('T')[0]

    // Build base query for components
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

    // Apply filters
    if (validatedParams.category) {
      query = query.eq('category', validatedParams.category)
    }
    
    if (validatedParams.framework) {
      query = query.eq('framework', validatedParams.framework)
    }

    const { data: components, error } = await query

    if (error) {
      throw error
    }

    if (!components || components.length === 0) {
      return NextResponse.json({
        data: {
          components: [],
          summary: {
            total_components: 0,
            timeframe: validatedParams.timeframe,
            average_growth: 0,
            top_growth_rate: 0,
          },
        },
        success: true,
      })
    }

    // Get usage statistics for both periods
    const componentIds = components.map(c => c.id)
    
    const { data: currentStats } = await supabase
      .from('component_usage_stats')
      .select('component_id, total_uses, unique_users, date')
      .in('component_id', componentIds)
      .gte('date', currentStartStr)
      .lte('date', now.toISOString().split('T')[0])

    const { data: previousStats } = await supabase
      .from('component_usage_stats')
      .select('component_id, total_uses, unique_users, date')
      .in('component_id', componentIds)
      .gte('date', previousStartStr)
      .lt('date', currentStartStr)

    // Process and calculate trending scores
    const trendingComponents = components.map(component => {
      const currentComponentStats = currentStats?.filter(s => s.component_id === component.id) || []
      const previousComponentStats = previousStats?.filter(s => s.component_id === component.id) || []

      // Calculate usage for current period
      const currentUsage = currentComponentStats.reduce((sum, stat) => sum + (stat.total_uses || 0), 0)
      const currentUsers = new Set(currentComponentStats.flatMap(stat => stat.unique_users || [])).size

      // Calculate usage for previous period
      const previousUsage = previousComponentStats.reduce((sum, stat) => sum + (stat.total_uses || 0), 0)
      const previousUsers = new Set(previousComponentStats.flatMap(stat => stat.unique_users || [])).size

      // Calculate growth metrics
      const usageGrowth = previousUsage > 0 ? ((currentUsage - previousUsage) / previousUsage) * 100 : 
                         currentUsage > 0 ? 100 : 0
      
      const userGrowth = previousUsers > 0 ? ((currentUsers - previousUsers) / previousUsers) * 100 : 
                        currentUsers > 0 ? 100 : 0

      // Calculate trending score (combination of growth rates and momentum)
      const timeframeDays = getTimeframeDays(validatedParams.timeframe)
      const usageVelocity = currentUsage / timeframeDays // Average daily usage
      const userVelocity = currentUsers / timeframeDays // Average daily unique users
      
      // Trending algorithm: weighted combination of growth and velocity
      const growthScore = Math.max(0, (usageGrowth + userGrowth) / 2)
      const velocityScore = Math.sqrt(usageVelocity * userVelocity) // Geometric mean
      const momentumScore = (currentUsage / Math.max(1, component.usage_count)) * 100 // Current vs total usage ratio
      
      const trendingScore = (growthScore * 0.4) + (velocityScore * 0.3) + (momentumScore * 0.3)

      return {
        ...component,
        trending_metrics: {
          current_period: {
            usage: currentUsage,
            unique_users: currentUsers,
            days: timeframeDays,
            daily_average: Math.round(usageVelocity),
          },
          previous_period: {
            usage: previousUsage,
            unique_users: previousUsers,
            days: timeframeDays,
            daily_average: Math.round(previousUsage / timeframeDays),
          },
          growth: {
            usage_growth: Math.round(usageGrowth * 100) / 100,
            user_growth: Math.round(userGrowth * 100) / 100,
            overall_growth: Math.round(((usageGrowth + userGrowth) / 2) * 100) / 100,
          },
          trending_score: Math.round(trendingScore * 100) / 100,
          trend_direction: trendingScore > 50 ? 'rising' : trendingScore > 20 ? 'stable' : 'declining',
        },
        component_usage_stats: undefined, // Clean up raw data
      }
    })

    // Filter by minimum growth and sort by trending score
    const filteredComponents = trendingComponents
      .filter(component => 
        component.trending_metrics.growth.overall_growth >= validatedParams.min_growth
      )
      .sort((a, b) => b.trending_metrics.trending_score - a.trending_metrics.trending_score)
      .slice(0, validatedParams.limit)

    // Calculate summary statistics
    const allGrowthRates = trendingComponents.map(c => c.trending_metrics.growth.overall_growth)
    const averageGrowth = allGrowthRates.length > 0 
      ? allGrowthRates.reduce((sum, rate) => sum + rate, 0) / allGrowthRates.length 
      : 0
    const topGrowthRate = Math.max(...allGrowthRates, 0)

    // Get trending categories and frameworks
    const categoryTrends = trendingComponents.reduce((acc, comp) => {
      if (!acc[comp.category]) {
        acc[comp.category] = {
          name: comp.category,
          count: 0,
          avg_trending_score: 0,
          total_growth: 0,
        }
      }
      acc[comp.category].count++
      acc[comp.category].avg_trending_score += comp.trending_metrics.trending_score
      acc[comp.category].total_growth += comp.trending_metrics.growth.overall_growth
      return acc
    }, {} as Record<string, any>)

    // Calculate averages
    Object.values(categoryTrends).forEach((category: any) => {
      category.avg_trending_score = Math.round((category.avg_trending_score / category.count) * 100) / 100
      category.total_growth = Math.round((category.total_growth / category.count) * 100) / 100
    })

    return NextResponse.json({
      data: {
        components: filteredComponents,
        summary: {
          total_components: filteredComponents.length,
          timeframe: validatedParams.timeframe,
          filters: {
            category: validatedParams.category,
            framework: validatedParams.framework,
            min_growth: validatedParams.min_growth,
          },
          metrics: {
            average_growth: Math.round(averageGrowth * 100) / 100,
            top_growth_rate: Math.round(topGrowthRate * 100) / 100,
            rising_trends: filteredComponents.filter(c => c.trending_metrics.trend_direction === 'rising').length,
            stable_trends: filteredComponents.filter(c => c.trending_metrics.trend_direction === 'stable').length,
          },
          trending_categories: Object.values(categoryTrends)
            .sort((a: any, b: any) => b.avg_trending_score - a.avg_trending_score)
            .slice(0, 5),
        },
      },
      success: true,
    })

  } catch (error: any) {
    console.error('Error fetching trending components:', error)
    
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

// Helper function to convert timeframe string to days
function getTimeframeDays(timeframe: string): number {
  switch (timeframe) {
    case '24h':
      return 1
    case '7d':
      return 7
    case '30d':
      return 30
    default:
      return 7
  }
}