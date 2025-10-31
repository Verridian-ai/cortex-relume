import { NextRequest, NextResponse } from 'next/server';
import { TemplateLibrary } from '@/lib/projects/templates';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || undefined;
    const difficulty = searchParams.get('difficulty') || undefined;
    const tags = searchParams.get('tags')?.split(',') || undefined;

    if (!query.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Search query is required'
      }, { status: 400 });
    }

    const templateLibrary = TemplateLibrary.getInstance();
    
    const filters = {
      category,
      difficulty,
      tags
    };

    const results = await templateLibrary.searchTemplates(query, filters);

    return NextResponse.json({
      success: true,
      data: results,
      query,
      result_count: results.length
    });
  } catch (error) {
    console.error('Error searching templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search templates' },
      { status: 500 }
    );
  }
}