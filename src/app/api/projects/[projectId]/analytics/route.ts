import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';

type ProjectAnalytics = Database['public']['Tables']['project_analytics']['Row'];
type ProjectUsageStats = Database['public']['Tables']['project_usage_stats']['Row'];

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.projectId;
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const summary = searchParams.get('summary') === 'true';

    // Check if user has access to this project
    const { data: project } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const canView = project.user_id === user.id ||
      await supabase.rpc('check_project_permission', {
        project_uuid: projectId,
        user_uuid: user.id,
        required_permission: 'viewer'
      });

    if (!canView) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (summary) {
      // Get analytics summary
      const { data: summaryData, error: summaryError } = await supabase
        .rpc('get_project_analytics_summary', {
          project_uuid: projectId,
          days_back: days
        });

      if (summaryError) {
        return NextResponse.json({ error: summaryError.message }, { status: 500 });
      }

      return NextResponse.json({ summary: summaryData?.[0] || {} });
    }

    // Get detailed analytics
    const { data: analytics, error: analyticsError } = await supabase
      .from('project_analytics')
      .select(`
        *,
        user:profiles(id, full_name, avatar_url)
      `)
      .eq('project_id', projectId)
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(1000);

    if (analyticsError) {
      return NextResponse.json({ error: analyticsError.message }, { status: 500 });
    }

    // Get usage stats
    const { data: usageStats, error: statsError } = await supabase
      .from('project_usage_stats')
      .select('*')
      .eq('project_id', projectId)
      .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (statsError) {
      return NextResponse.json({ error: statsError.message }, { status: 500 });
    }

    // Transform analytics data
    const transformedAnalytics = analytics?.map(event => ({
      ...event,
      user: event.user
    })) || [];

    return NextResponse.json({
      analytics: transformedAnalytics,
      usage_stats: usageStats || [],
      summary: {
        total_events: transformedAnalytics.length,
        date_range: days,
        event_types: [...new Set(transformedAnalytics.map(e => e.event_type))]
      }
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.projectId;
    const body = await request.json();

    // Validate required fields
    if (!body.event_type) {
      return NextResponse.json({ 
        error: 'Event type is required' 
      }, { status: 400 });
    }

    // Check if user has access to this project
    const canAccess = await supabase.rpc('can_access_project', {
      project_uuid: projectId,
      user_uuid: user.id
    });

    if (!canAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Create analytics record
    const analyticsData = {
      project_id: projectId,
      user_id: user.id,
      session_id: body.session_id,
      event_type: body.event_type,
      event_data: body.event_data || {},
      duration_seconds: body.duration_seconds,
      metadata: body.metadata || {},
      ip_address: body.ip_address,
      user_agent: body.user_agent,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('project_analytics')
      .insert(analyticsData)
      .select(`
        *,
        user:profiles(id, full_name, avatar_url)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ event: data }, { status: 201 });

  } catch (error) {
    console.error('Error creating analytics event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}