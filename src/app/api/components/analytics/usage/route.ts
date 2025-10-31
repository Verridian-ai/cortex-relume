import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { componentDatabaseHelpers } from '@/lib/supabase/components'
import { z } from 'zod'

const usageSchema = z.object({
  component_id: z.string().uuid().optional(),
  timeframe: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  granularity: z.enum(['hourly', 'daily', 'weekly', 'monthly']).default('daily'),
  include_details: z.boolean().default(true),
})

// GET /api/components/analytics/usage - Usage statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse and validate parameters
    const params = {
      component_id: searchParams.get('component_id') || undefined,
      timeframe: searchParams.get('timeframe') || '30d',
      granularity: searchParams.get('granularity') || 'daily',
      include_details: searchParams.get('include_details') !== 'false',
    }

    const validatedParams = usageSchema.parse(params)

    const supabase = createRouteHandlerClient({ cookies })
    
    // Calculate date range
    const days = getTimeframeDays(validatedParams.timeframe)
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0] || new Date(Date.now() - days * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA')
    const endDate = new Date().toISOString().split('T')[0] || new Date().toLocaleDateString('en-CA')

    let usageData

    if (validatedParams.component_id) {
      // Get usage for specific component
      usageData = await getComponentUsage(supabase, validatedParams.component_id, startDate, endDate, validatedParams.granularity)
    } else {
      // Get aggregated usage across all components
      usageData = await getAggregatedUsage(supabase, startDate, endDate, validatedParams.granularity, validatedParams.include_details)
    }

    if (!usageData.success) {
      return NextResponse.json(
        { error: usageData.error || 'Failed to fetch usage statistics', success: false },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: {
        ...usageData.data,
        timeframe: validatedParams.timeframe,
        granularity: validatedParams.granularity,
        period: {
          start_date: startDate,
          end_date: endDate,
          total_days: days,
        },
      },
      success: true,
    })

  } catch (error: any) {
    console.error('Error fetching usage statistics:', error)
    
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

// Get usage statistics for a specific component
async function getComponentUsage(supabase: any, componentId: string, startDate: string, endDate: string, granularity: string) {
  try {
    // Get component details
    const { data: component, error: componentError } = await supabase
      .from('components')
      .select('id, name, category, framework, created_at')
      .eq('id', componentId)
      .single()

    if (componentError || !component) {
      return {
        success: false,
        error: 'Component not found',
        data: null,
      }
    }

    // Get usage statistics
    const { data: stats, error: statsError } = await supabase
      .from('component_usage_stats')
      .select('*')
      .eq('component_id', componentId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })

    if (statsError) {
      throw statsError
    }

    // Group data by granularity
    const groupedData = groupDataByGranularity(stats || [], granularity)

    // Calculate trends and insights
    const insights = calculateUsageInsights(stats || [])

    // Get comparison data (previous period)
    const previousPeriodData = await getPreviousPeriodUsage(supabase, componentId, startDate, endDate)

    return {
      success: true,
      data: {
        component,
        usage_data: groupedData,
        insights,
        comparison: previousPeriodData,
      },
    }

  } catch (error: any) {
    console.error('Error fetching component usage:', error)
    return {
      success: false,
      error: error.message,
      data: null,
    }
  }
}

// Get aggregated usage across all components
async function getAggregatedUsage(supabase: any, startDate: string, endDate: string, granularity: string, includeDetails: boolean) {
  try {
    // Get overall usage statistics
    const { data: stats, error: statsError } = await supabase
      .from('component_usage_stats')
      .select(`
        *,
        components(id, name, category, framework, is_featured)
      `)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })

    if (statsError) {
      throw statsError
    }

    // Group data by granularity
    const groupedData = groupDataByGranularity(stats || [], granularity)

    // Get top components if details requested
    let topComponents = []
    if (includeDetails) {
      const { data: components } = await supabase
        .from('components')
        .select('id, name, category, framework, usage_count, rating, is_featured')
        .eq('is_public', true)
        .order('usage_count', { ascending: false })
        .limit(10)

      topComponents = components || []
    }

    // Calculate category and framework breakdowns
    const categoryBreakdown: Record<string, any> = {}
    const frameworkBreakdown: Record<string, any> = {}

    stats?.forEach((stat: any) => {
      const component = stat.components
      if (component) {
        // Category breakdown
        if (!categoryBreakdown[component.category]) {
          categoryBreakdown[component.category] = {
            name: component.category,
            total_usage: 0,
            unique_components: new Set(),
          }
        }
        categoryBreakdown[component.category].total_usage += stat.total_uses || 0
        categoryBreakdown[component.category].unique_components.add(component.id)

        // Framework breakdown
        if (!frameworkBreakdown[component.framework]) {
          frameworkBreakdown[component.framework] = {
            name: component.framework,
            total_usage: 0,
            unique_components: new Set(),
          }
        }
        frameworkBreakdown[component.framework].total_usage += stat.total_uses || 0
        frameworkBreakdown[component.framework].unique_components.add(component.id)
      }
    })

    // Convert sets to counts
    Object.values(categoryBreakdown).forEach((cat: any) => {
      cat.unique_components = cat.unique_components.size
    })

    Object.values(frameworkBreakdown).forEach((fw: any) => {
      fw.unique_components = fw.unique_components.size
    })

    return {
      success: true,
      data: {
        usage_data: groupedData,
        top_components: topComponents,
        breakdowns: {
          categories: Object.values(categoryBreakdown),
          frameworks: Object.values(frameworkBreakdown),
        },
      },
    }

  } catch (error: any) {
    console.error('Error fetching aggregated usage:', error)
    return {
      success: false,
      error: error.message,
      data: null,
    }
  }
}

// Group data by time granularity
function groupDataByGranularity(stats: any[], granularity: string) {
  const groups: Record<string, any> = {}

  stats.forEach(stat => {
    const date = new Date(stat.date)
    let key: string

    switch (granularity) {
      case 'hourly':
        // For hourly data, we'd need hour-level tracking
        key = stat.date // Fallback to daily for now
        break
      case 'weekly':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split('T')[0] || weekStart.toLocaleDateString('en-CA')
        break
      case 'monthly':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      case 'daily':
      default:
        key = stat.date
        break
    }

    if (!groups[key]) {
      groups[key] = {
        period: key,
        total_uses: 0,
        unique_users: new Set(),
        successful_imports: 0,
        failed_imports: 0,
        avg_rating: 0,
        rating_count: 0,
        component_count: 0,
      }
    }

    groups[key].total_uses += stat.total_uses || 0
    groups[key].successful_imports += stat.successful_imports || 0
    groups[key].failed_imports += stat.failed_imports || 0
    
    // Handle unique users (could be stored as array or count)
    if (Array.isArray(stat.unique_users)) {
      stat.unique_users.forEach((user: any) => groups[key].unique_users.add(user))
    } else if (typeof stat.unique_users === 'number') {
      groups[key].unique_users.add(`count_${stat.unique_users}`)
    }

    if (stat.avg_rating) {
      groups[key].avg_rating += stat.avg_rating
      groups[key].rating_count += 1
    }

    groups[key].component_count += 1
  })

  // Convert to array and calculate final values
  return Object.values(groups).map((group: any) => ({
    ...group,
    unique_users: group.unique_users.size,
    avg_rating: group.rating_count > 0 ? group.avg_rating / group.rating_count : null,
    success_rate: group.total_uses > 0 
      ? ((group.successful_imports / (group.successful_imports + group.failed_imports)) * 100).toFixed(2)
      : null,
  })).sort((a, b) => a.period.localeCompare(b.period))
}

// Calculate usage insights
function calculateUsageInsights(stats: any[]) {
  if (stats.length === 0) {
    return {
      trend: 'no_data',
      growth_rate: 0,
      peak_usage_date: null,
      average_daily_usage: 0,
      consistency_score: 0,
    }
  }

  const totalUsage = stats.reduce((sum, stat) => sum + (stat.total_uses || 0), 0)
  const averageDailyUsage = totalUsage / stats.length

  // Calculate trend
  const firstHalf = stats.slice(0, Math.floor(stats.length / 2))
  const secondHalf = stats.slice(Math.floor(stats.length / 2))

  const firstHalfUsage = firstHalf.reduce((sum, stat) => sum + (stat.total_uses || 0), 0)
  const secondHalfUsage = secondHalf.reduce((sum, stat) => sum + (stat.total_uses || 0), 0)

  const growthRate = firstHalfUsage > 0 
    ? ((secondHalfUsage - firstHalfUsage) / firstHalfUsage) * 100 
    : secondHalfUsage > 0 ? 100 : 0

  // Find peak usage
  const peakStat = stats.reduce((peak, current) => 
    (current.total_uses || 0) > (peak.total_uses || 0) ? current : peak
  )

  // Calculate consistency (inverse of coefficient of variation)
  const usageValues = stats.map(stat => stat.total_uses || 0)
  const mean = usageValues.reduce((sum, val) => sum + val, 0) / usageValues.length
  const variance = usageValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / usageValues.length
  const standardDeviation = Math.sqrt(variance)
  const coefficientOfVariation = mean > 0 ? standardDeviation / mean : 0
  const consistencyScore = Math.max(0, 100 - (coefficientOfVariation * 100))

  return {
    trend: growthRate > 5 ? 'growing' : growthRate < -5 ? 'declining' : 'stable',
    growth_rate: Math.round(growthRate * 100) / 100,
    peak_usage_date: peakStat.date,
    peak_usage_count: peakStat.total_uses || 0,
    average_daily_usage: Math.round(averageDailyUsage * 100) / 100,
    consistency_score: Math.round(consistencyScore * 100) / 100,
    total_usage_period: totalUsage,
  }
}

// Get previous period comparison data
async function getPreviousPeriodUsage(supabase: any, componentId: string, currentStart: string, currentEnd: string) {
  try {
    const currentDays = Math.ceil((new Date(currentEnd).getTime() - new Date(currentStart).getTime()) / (1000 * 60 * 60 * 24))
    const previousEnd = new Date(new Date(currentStart).getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0] || new Date(new Date(currentStart).getTime() - 24 * 60 * 60 * 1000).toLocaleDateString('en-CA')
    const previousStart = new Date(new Date(previousEnd).getTime() - currentDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || new Date(new Date(previousEnd).getTime() - currentDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA')

    const { data: previousStats } = await supabase
      .from('component_usage_stats')
      .select('*')
      .eq('component_id', componentId)
      .gte('date', previousStart)
      .lte('date', previousEnd)

    const previousUsage = previousStats?.reduce((sum: number, stat: any) => sum + (stat.total_uses || 0), 0) || 0
    const currentUsage = await supabase
      .from('component_usage_stats')
      .select('total_uses')
      .eq('component_id', componentId)
      .gte('date', currentStart)
      .lte('date', currentEnd)
      .then((result: any) => result.data?.reduce((sum: number, stat: any) => sum + (stat.total_uses || 0), 0) || 0)

    const change = previousUsage > 0 ? ((currentUsage - previousUsage) / previousUsage) * 100 : 
                  currentUsage > 0 ? 100 : 0

    return {
      previous_period: {
        start_date: previousStart,
        end_date: previousEnd,
        total_usage: previousUsage,
      },
      current_period: {
        start_date: currentStart,
        end_date: currentEnd,
        total_usage: currentUsage,
      },
      change: {
        absolute: currentUsage - previousUsage,
        percentage: Math.round(change * 100) / 100,
      },
    }
  } catch (error) {
    console.error('Error fetching previous period data:', error)
    return null
  }
}

// Helper function to convert timeframe string to days
function getTimeframeDays(timeframe: string): number {
  switch (timeframe) {
    case '7d':
      return 7
    case '30d':
      return 30
    case '90d':
      return 90
    case '1y':
      return 365
    default:
      return 30
  }
}