import { NextRequest, NextResponse } from 'next/server';
import { ProjectAnalyticsManager } from '@/lib/projects/analytics';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') as '24h' | '7d' | '30d' | '90d' | '1y' || '30d';

    const analyticsManager = ProjectAnalyticsManager.getInstance();
    const analytics = await analyticsManager.getProjectAnalytics(id, timeRange);

    if (!analytics) {
      return NextResponse.json(
        { success: false, error: 'Analytics data not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: analytics,
      timeRange
    });
  } catch (error) {
    console.error('Error fetching project analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

// Track page view
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();
    const { page, userId } = body;

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Page parameter is required' },
        { status: 400 }
      );
    }

    const analyticsManager = ProjectAnalyticsManager.getInstance();
    
    // Track the page view
    await analyticsManager.trackPageView(id, page, userId);

    return NextResponse.json({
      success: true,
      message: 'Page view tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking page view:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track page view' },
      { status: 500 }
    );
  }
}