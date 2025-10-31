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
    
    const analyticsManager = ProjectAnalyticsManager.getInstance();
    const templateAnalytics = await analyticsManager.getTemplateAnalytics(id);

    if (!templateAnalytics) {
      return NextResponse.json(
        { success: false, error: 'Template analytics not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: templateAnalytics
    });
  } catch (error) {
    console.error('Error fetching template analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch template analytics' },
      { status: 500 }
    );
  }
}

// Track template usage
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();
    const { userId } = body;

    const analyticsManager = ProjectAnalyticsManager.getInstance();
    
    // Track template usage
    await analyticsManager.trackTemplateUsage(id, userId);

    return NextResponse.json({
      success: true,
      message: 'Template usage tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking template usage:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track template usage' },
      { status: 500 }
    );
  }
}