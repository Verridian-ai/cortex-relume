import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { componentDatabaseHelpers } from '@/lib/supabase/components'
import { z } from 'zod'

const trackUsageSchema = z.object({
  component_id: z.string().uuid(),
  action: z.enum(['view', 'import', 'copy', 'download', 'favorite', 'share']),
  user_id: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional(),
  session_id: z.string().optional(),
  user_agent: z.string().optional(),
  ip_address: z.string().optional(),
})

// POST /api/components/analytics/track - Track component usage
export async function POST(request: NextRequest) {
  try {
    // Get Supabase client
    const supabase = createRouteHandlerClient({ cookies })
    
    // Parse and validate request body
    const body = await request.json()
    const validatedData = trackUsageSchema.parse(body)

    // Get client information
    const userAgent = request.headers.get('user-agent') || validatedData.user_agent
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    validatedData.ip_address || 
                    'unknown'

    // Get current user if authenticated
    let currentUser = null
    const { data: { user } } = await supabase.auth.getUser()
    currentUser = user

    // Use provided user_id or current user
    const userId = validatedData.user_id || currentUser?.id || null

    // Verify component exists
    const { data: component, error: componentError } = await supabase
      .from('components')
      .select('id, name, is_public, author_id')
      .eq('id', validatedData.component_id)
      .single()

    if (componentError || !component) {
      return NextResponse.json(
        { error: 'Component not found', success: false },
        { status: 404 }
      )
    }

    // Check if user has access to this component
    if (!component.is_public && component.author_id !== userId) {
      return NextResponse.json(
        { error: 'Component access denied', success: false },
        { status: 403 }
      )
    }

    // Process the usage tracking
    const trackingResult = await processUsageTracking({
      supabase,
      componentId: validatedData.component_id,
      action: validatedData.action,
      userId,
      metadata: {
        ...validatedData.metadata,
        user_agent: userAgent,
        ip_address: clientIP,
        session_id: validatedData.session_id,
        timestamp: new Date().toISOString(),
      },
    })

    if (!trackingResult.success) {
      return NextResponse.json(
        { error: trackingResult.error || 'Failed to track usage', success: false },
        { status: 500 }
      )
    }

    // Update component usage count for certain actions
    if (['import', 'copy', 'download'].includes(validatedData.action)) {
      await componentDatabaseHelpers.components.incrementUsage(validatedData.component_id)
    }

    return NextResponse.json({
      data: {
        tracked: true,
        component_id: validatedData.component_id,
        action: validatedData.action,
        timestamp: new Date().toISOString(),
        tracking_id: trackingResult.data?.tracking_id,
      },
      success: true,
    })

  } catch (error: any) {
    console.error('Error tracking component usage:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid tracking data',
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

// Process the actual usage tracking logic
async function processUsageTracking(params: {
  supabase: any,
  componentId: string,
  action: string,
  userId: string | null,
  metadata: Record<string, any>,
}) {
  try {
    const { supabase, componentId, action, userId, metadata } = params

    // Update daily usage statistics
    const today = new Date().toISOString().split('T')[0] || new Date().toLocaleDateString('en-CA')
    
    // Get or create today's usage stats
    const { data: existingStats } = await supabase
      .from('component_usage_stats')
      .select('*')
      .eq('component_id', componentId)
      .eq('date', today)
      .single()

    if (existingStats) {
      // Update existing stats
      const updates: any = {
        updated_at: new Date().toISOString(),
      }

      // Increment based on action
      switch (action) {
        case 'view':
          updates.total_uses = (existingStats.total_uses || 0) + 1
          if (userId) {
            // For views, we might track unique users differently
            updates.unique_users = existingStats.unique_users || 0
          }
          break
        case 'import':
          updates.successful_imports = (existingStats.successful_imports || 0) + 1
          updates.total_uses = (existingStats.total_uses || 0) + 1
          break
        case 'copy':
          updates.total_uses = (existingStats.total_uses || 0) + 1
          break
        case 'download':
          updates.total_uses = (existingStats.total_uses || 0) + 1
          break
        case 'favorite':
          // Could update a favorites count in metadata
          break
        case 'share':
          // Could update a share count in metadata
          break
      }

      const { error: updateError } = await supabase
        .from('component_usage_stats')
        .update(updates)
        .eq('id', existingStats.id)

      if (updateError) {
        throw updateError
      }
    } else {
      // Create new stats entry
      const newStats = {
        component_id: componentId,
        date: today,
        total_uses: action === 'view' || action === 'import' || action === 'copy' || action === 'download' ? 1 : 0,
        unique_users: userId ? 1 : 0,
        successful_imports: action === 'import' ? 1 : 0,
        failed_imports: 0,
        trending_score: 0,
        metadata: {},
      }

      const { error: insertError } = await supabase
        .from('component_usage_stats')
        .insert(newStats)

      if (insertError) {
        throw insertError
      }
    }

    // Store detailed usage event (optional, for advanced analytics)
    if (shouldStoreDetailedEvent(action)) {
      await storeDetailedEvent({
        supabase,
        componentId,
        action,
        userId,
        metadata,
      })
    }

    // Calculate and update trending score
    await updateTrendingScore(supabase, componentId, today)

    return {
      success: true,
      data: {
        tracking_id: `track_${componentId}_${action}_${Date.now()}`,
      },
    }

  } catch (error: any) {
    console.error('Error in processUsageTracking:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Store detailed usage events for advanced analytics
async function storeDetailedEvent(params: {
  supabase: any,
  componentId: string,
  action: string,
  userId: string | null,
  metadata: Record<string, any>,
}) {
  try {
    const { supabase, componentId, action, userId, metadata } = params

    // Create a detailed usage event record
    // Note: You might want to create a separate table for detailed events
    // For now, we'll store it in a JSON field or create it if the table exists
    
    const eventData = {
      component_id: componentId,
      action,
      user_id: userId,
      metadata,
      created_at: new Date().toISOString(),
    }

    // Try to insert into a detailed events table (if it exists)
    const { error } = await supabase
      .from('component_usage_events')
      .insert(eventData)
      .select()
      .single()

    // If table doesn't exist, we'll just log it (or could create the table)
    if (error && !error.message.includes('relation "component_usage_events" does not exist')) {
      console.warn('Failed to store detailed usage event:', error)
    }

  } catch (error) {
    console.warn('Error storing detailed usage event:', error)
  }
}

// Update trending score based on recent activity
async function updateTrendingScore(supabase: any, componentId: string, date: string) {
  try {
    // Calculate trending score based on recent activity
    // This is a simplified algorithm - you might want to make it more sophisticated
    
    const days = 7 // Look at last 7 days
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0]

    const { data: recentStats } = await supabase
      .from('component_usage_stats')
      .select('total_uses, unique_users, successful_imports, date')
      .eq('component_id', componentId)
      .gte('date', startDate)
      .lte('date', date)
      .order('date', { ascending: false })

    if (!recentStats || recentStats.length === 0) {
      return
    }

    // Calculate trending metrics
    const totalRecentUses = recentStats.reduce((sum: number, stat: any) => sum + (stat.total_uses || 0), 0)
    const totalRecentUsers = recentStats.reduce((sum: number, stat: any) => sum + (stat.unique_users || 0), 0)
    const totalRecentImports = recentStats.reduce((sum: number, stat: any) => sum + (stat.successful_imports || 0), 0)

    // Calculate trending score (0-100 scale)
    const usageScore = Math.min(50, totalRecentUses * 0.1) // Max 50 points for usage
    const userScore = Math.min(30, totalRecentUsers * 0.5) // Max 30 points for users
    const importScore = Math.min(20, totalRecentImports * 2) // Max 20 points for imports

    const trendingScore = usageScore + userScore + importScore

    // Update today's trending score
    await supabase
      .from('component_usage_stats')
      .update({ trending_score: trendingScore })
      .eq('component_id', componentId)
      .eq('date', date)

  } catch (error) {
    console.warn('Error updating trending score:', error)
  }
}

// Determine if we should store detailed events for this action
function shouldStoreDetailedEvent(action: string): boolean {
  // Store detailed events for important actions
  return ['import', 'download', 'share'].includes(action)
}

// GET /api/components/analytics/track - Get usage tracking summary
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const componentId = searchParams.get('component_id')
    const timeframe = searchParams.get('timeframe') || '30d'

    if (!componentId) {
      return NextResponse.json(
        { error: 'Component ID is required', success: false },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Calculate date range
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0]

    // Get usage summary
    const { data: usageStats } = await supabase
      .from('component_usage_stats')
      .select('*')
      .eq('component_id', componentId)
      .gte('date', startDate)
      .order('date', { ascending: false })

    const summary = {
      component_id: componentId,
      timeframe,
      period: {
        start_date: startDate,
        end_date: new Date().toISOString().split('T')[0],
        days,
      },
      total_views: usageStats?.reduce((sum, stat) => sum + (stat.total_uses || 0), 0) || 0,
      total_unique_users: new Set(
        usageStats?.flatMap(stat => stat.unique_users || []) || []
      ).size,
      total_imports: usageStats?.reduce((sum, stat) => sum + (stat.successful_imports || 0), 0) || 0,
      daily_average: (usageStats && usageStats.length > 0) 
        ? (usageStats?.reduce((sum: number, stat: any) => sum + (stat.total_uses || 0), 0) || 0) / days
        : 0,
      trending_score: usageStats?.[0]?.trending_score || 0,
    }

    return NextResponse.json({
      data: summary,
      success: true,
    })

  } catch (error: any) {
    console.error('Error fetching usage tracking summary:', error)
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