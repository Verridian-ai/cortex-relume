import { NextRequest, NextResponse } from 'next/server';
import { TemplateLibrary } from '@/lib/projects/templates';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const templateLibrary = TemplateLibrary.getInstance();
    const trendingTemplates = await templateLibrary.getTrendingTemplates(limit);

    return NextResponse.json({
      success: true,
      data: trendingTemplates
    });
  } catch (error) {
    console.error('Error fetching trending templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trending templates' },
      { status: 500 }
    );
  }
}