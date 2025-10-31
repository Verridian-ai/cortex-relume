import { NextRequest, NextResponse } from 'next/server';
import { TemplateLibrary } from '@/lib/projects/templates';

export async function GET(request: NextRequest) {
  try {
    const templateLibrary = TemplateLibrary.getInstance();
    const categories = await templateLibrary.getCategories();

    return NextResponse.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching template categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}