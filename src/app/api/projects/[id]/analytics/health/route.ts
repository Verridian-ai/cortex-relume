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
    const healthScore = await analyticsManager.calculateProjectHealthScore(id);

    return NextResponse.json({
      success: true,
      data: healthScore
    });
  } catch (error) {
    console.error('Error calculating project health score:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate health score' },
      { status: 500 }
    );
  }
}