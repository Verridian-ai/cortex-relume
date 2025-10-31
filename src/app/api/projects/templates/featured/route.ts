import { NextRequest, NextResponse } from 'next/server';
import { TemplateLibrary } from '@/lib/projects/templates';

export async function GET(request: NextRequest) {
  try {
    const templateLibrary = TemplateLibrary.getInstance();
    const featuredTemplates = await templateLibrary.getFeaturedTemplates();

    return NextResponse.json({
      success: true,
      data: featuredTemplates
    });
  } catch (error) {
    console.error('Error fetching featured templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch featured templates' },
      { status: 500 }
    );
  }
}