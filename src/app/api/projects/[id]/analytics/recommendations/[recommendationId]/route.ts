import { NextRequest, NextResponse } from 'next/server';
import { ProjectAnalyticsManager } from '@/lib/projects/analytics';

interface RouteParams {
  params: {
    id: string;
  };
}

interface RecommendationBody {
  recommendationId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body: RecommendationBody = await request.json();
    const { recommendationId, status } = body;

    if (!recommendationId || !status) {
      return NextResponse.json(
        { success: false, error: 'Recommendation ID and status are required' },
        { status: 400 }
      );
    }

    const analyticsManager = ProjectAnalyticsManager.getInstance();
    
    // Update recommendation status
    await analyticsManager.updateRecommendationStatus(recommendationId, status);

    return NextResponse.json({
      success: true,
      message: 'Recommendation status updated successfully',
      recommendationId,
      status
    });
  } catch (error) {
    console.error('Error updating recommendation status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update recommendation status' },
      { status: 500 }
    );
  }
}