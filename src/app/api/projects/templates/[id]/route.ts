import { NextRequest, NextResponse } from 'next/server';
import { TemplateLibrary } from '@/lib/projects/templates';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
    const templateLibrary = TemplateLibrary.getInstance();
    const template = await templateLibrary.getTemplate(id);

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    // Increment usage count
    await templateLibrary.incrementTemplateUsage(id);

    return NextResponse.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
    // For this example, we'll use a mock user ID
    // In production, this would come from authentication
    const userId = 'current-user-id';

    const templateLibrary = TemplateLibrary.getInstance();
    
    // Only allow deleting custom templates created by the user
    await templateLibrary.deleteCustomTemplate(id, userId);

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}