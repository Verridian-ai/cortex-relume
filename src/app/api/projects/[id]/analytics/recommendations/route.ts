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
    const recommendations = await analyticsManager.getRecommendations(id);

    return NextResponse.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}

// Generate new recommendations
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
    const analyticsManager = ProjectAnalyticsManager.getInstance();
    const recommendations = await analyticsManager.generateRecommendations(id);

    return NextResponse.json({
      success: true,
      data: recommendations,
      count: recommendations.length
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}