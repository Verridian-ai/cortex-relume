import { NextRequest, NextResponse } from 'next/server';
import { ProjectAnalyticsManager } from '@/lib/projects/analytics';

// For this example, we'll use a mock user ID
// In production, this would come from authentication
const getCurrentUserId = () => 'current-user-id';

export async function GET(request: NextRequest) {
  try {
    const userId = getCurrentUserId();
    
    const analyticsManager = ProjectAnalyticsManager.getInstance();
    const dashboardData = await analyticsManager.getDashboardData(userId);

    return NextResponse.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}