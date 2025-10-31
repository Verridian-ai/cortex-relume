import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { componentDatabaseHelpers } from '@/lib/supabase/components'
import { z } from 'zod'

// GET /api/components/[slug] - Get component details
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    if (!slug) {
      return NextResponse.json(
        { error: 'Component slug is required', success: false },
        { status: 400 }
      )
    }

    // Get component by slug (we'll need to implement this or use a different approach)
    // For now, let's get it by name slug
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: component, error } = await supabase
      .from('components')
      .select(`
        *,
        component_variants(*),
        component_dependencies(*, depends_on:component_dependencies_depends_on_component_id_fkey(*)),
        component_usage_stats(*),
        component_categories(*),
        component_tags(*)
      `)
      .ilike('name', slug.replace(/-/g, ' '))
      .eq('is_public', true)
      .single()

    if (error || !component) {
      return NextResponse.json(
        { error: 'Component not found', success: false },
        { status: 404 }
      )
    }

    // Increment usage count
    await componentDatabaseHelpers.components.incrementUsage(component.id)

    // Get recommendations for this component
    const recommendationsResult = await componentDatabaseHelpers.analytics.getRecommendations(component.id, 5)

    // Get quality assessment
    const qualityResult = await componentDatabaseHelpers.quality.assessQuality(component.id)

    return NextResponse.json({
      data: {
        ...component,
        recommendations: recommendationsResult.success ? recommendationsResult.data : null,
        quality_assessment: qualityResult.success ? qualityResult.data : null,
      },
      success: true,
    })

  } catch (error: any) {
    console.error('Error fetching component:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message,
        success: false 
      },
      { status: 500 }
    )
  }
}

// PUT /api/components/[slug] - Update component
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    if (!slug) {
      return NextResponse.json(
        { error: 'Component slug is required', success: false },
        { status: 400 }
      )
    }

    // Get Supabase client with authentication
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', success: false },
        { status: 401 }
      )
    }

    // Get the component first to check ownership
    const { data: existingComponent } = await supabase
      .from('components')
      .select('*')
      .ilike('name', slug.replace(/-/g, ' '))
      .single()

    if (!existingComponent) {
      return NextResponse.json(
        { error: 'Component not found', success: false },
        { status: 404 }
      )
    }

    // Check if user owns the component or is admin
    if (existingComponent.author_id !== user.id) {
      // Check if user has admin privileges (this would need proper role checking)
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single()

      if (profile?.subscription_tier !== 'pro' && profile?.subscription_tier !== 'enterprise') {
        return NextResponse.json(
          { error: 'Insufficient permissions to update this component', success: false },
          { status: 403 }
        )
      }
    }

    // Parse and validate request body
    const body = await request.json()
    const updateSchema = z.object({
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      code: z.string().optional(),
      preview_url: z.string().url().optional().or(z.literal('')),
      props: z.record(z.any()).optional(),
      tags: z.array(z.string()).optional(),
      is_public: z.boolean().optional(),
      complexity_score: z.number().min(1).max(5).optional(),
      performance_score: z.number().min(0).max(100).optional(),
      accessibility_score: z.number().min(0).max(100).optional(),
    })

    const validatedData = updateSchema.parse(body)

    // Update component
    const result = await componentDatabaseHelpers.components.update(
      existingComponent.id,
      {
        ...validatedData,
        updated_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
      }
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to update component', success: false },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: result.data,
      message: 'Component updated successfully',
      success: true,
    })

  } catch (error: any) {
    console.error('Error updating component:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid update data',
          details: error.errors,
          success: false 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message,
        success: false 
      },
      { status: 500 }
    )
  }
}

// DELETE /api/components/[slug] - Delete component
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    if (!slug) {
      return NextResponse.json(
        { error: 'Component slug is required', success: false },
        { status: 400 }
      )
    }

    // Get Supabase client with authentication
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', success: false },
        { status: 401 }
      )
    }

    // Get the component first to check ownership
    const { data: existingComponent } = await supabase
      .from('components')
      .select('*')
      .ilike('name', slug.replace(/-/g, ' '))
      .single()

    if (!existingComponent) {
      return NextResponse.json(
        { error: 'Component not found', success: false },
        { status: 404 }
      )
    }

    // Check if user owns the component or is admin
    if (existingComponent.author_id !== user.id) {
      // Check if user has admin privileges
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single()

      if (profile?.subscription_tier !== 'pro' && profile?.subscription_tier !== 'enterprise') {
        return NextResponse.json(
          { error: 'Insufficient permissions to delete this component', success: false },
          { status: 403 }
        )
      }
    }

    // Delete component
    const result = await componentDatabaseHelpers.components.delete(existingComponent.id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to delete component', success: false },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Component deleted successfully',
      success: true,
    })

  } catch (error: any) {
    console.error('Error deleting component:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message,
        success: false 
      },
      { status: 500 }
    )
  }
}