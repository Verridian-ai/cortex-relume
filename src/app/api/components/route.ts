import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { componentDatabaseHelpers } from '@/lib/supabase/components'
import type { ComponentSearchFilters } from '@/types/component'
import { z } from 'zod'

// Validation schemas
const createComponentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  framework: z.enum(['React', 'Vue', 'Angular', 'Svelte', 'Vanilla JS', 'HTML']),
  code: z.string().optional(),
  preview_url: z.string().url().optional().or(z.literal('')),
  props: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  is_public: z.boolean().default(true),
  complexity_score: z.number().min(1).max(5).default(1),
  performance_score: z.number().min(0).max(100).default(100),
  accessibility_score: z.number().min(0).max(100).default(100),
})

const updateComponentSchema = createComponentSchema.partial().extend({
  id: z.string().uuid().optional(),
})

const searchComponentsSchema = z.object({
  query: z.string().optional(),
  categories: z.array(z.string()).optional(),
  frameworks: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  difficulty_levels: z.array(z.string()).optional(),
  rating_min: z.number().min(0).max(5).optional(),
  usage_min: z.number().min(0).optional(),
  sort_by: z.enum(['popularity', 'rating', 'recent', 'name', 'usage']).default('popularity'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
})

// GET /api/components - List components with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse and validate search parameters
    const filters: ComponentSearchFilters = {
      query: searchParams.get('query') || undefined,
      categories: searchParams.get('categories')?.split(',') || undefined,
      frameworks: searchParams.get('frameworks')?.split(',') || undefined,
      tags: searchParams.get('tags')?.split(',') || undefined,
      difficulty_levels: searchParams.get('difficulty_levels')?.split(',') || undefined,
      rating_min: searchParams.get('rating_min') ? Number(searchParams.get('rating_min')) : undefined,
      usage_min: searchParams.get('usage_min') ? Number(searchParams.get('usage_min')) : undefined,
      sort_by: (searchParams.get('sort_by') as any) || 'popularity',
      sort_order: (searchParams.get('sort_order') as any) || 'desc',
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 50,
      offset: searchParams.get('offset') ? Number(searchParams.get('offset')) : 0,
    }

    // Validate filters
    const validatedFilters = searchComponentsSchema.parse(filters)

    // Get components with search
    const result = await componentDatabaseHelpers.components.search(validatedFilters)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to fetch components' },
        { status: 500 }
      )
    }

    // Return response with pagination metadata
    return NextResponse.json({
      data: result.data,
      meta: result.meta,
      success: true,
    })

  } catch (error: any) {
    console.error('Error fetching components:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters',
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

// POST /api/components - Create new component
export async function POST(request: NextRequest) {
  try {
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

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createComponentSchema.parse(body)

    // Create component
    const componentData = {
      ...validatedData,
      author_id: user.id,
      status: 'published',
      usage_count: 0,
      rating: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const result = await componentDatabaseHelpers.components.create(componentData)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to create component', success: false },
        { status: 500 }
      )
    }

    // Return created component
    return NextResponse.json({
      data: result.data,
      message: 'Component created successfully',
      success: true,
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating component:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid component data',
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

// PUT /api/components - Bulk update components
export async function PUT(request: NextRequest) {
  try {
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

    // Parse and validate request body
    const body = await request.json()
    
    // Handle both single update and bulk operations
    if (body.operation && body.component_ids) {
      // Bulk operation
      const { operation, component_ids, data } = body
      
      const result = await componentDatabaseHelpers.components.bulkOperation({
        operation,
        component_ids,
        data,
        user_id: user.id,
      })

      if (!result.success) {
        return NextResponse.json(
          { error: result.error?.message || 'Bulk operation failed', success: false },
          { status: 500 }
        )
      }

      return NextResponse.json({
        data: result.data,
        message: `Bulk ${operation} completed`,
        success: true,
      })
    } else {
      // Single update
      const validatedData = updateComponentSchema.parse(body)
      
      if (!validatedData.id) {
        return NextResponse.json(
          { error: 'Component ID required for update', success: false },
          { status: 400 }
        )
      }

      const result = await componentDatabaseHelpers.components.update(
        validatedData.id,
        validatedData
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
    }

  } catch (error: any) {
    console.error('Error updating components:', error)
    
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

// DELETE /api/components - Bulk delete components
export async function DELETE(request: NextRequest) {
  try {
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

    // Parse request body
    const body = await request.json()
    
    if (!body.component_ids || !Array.isArray(body.component_ids)) {
      return NextResponse.json(
        { error: 'Component IDs array required', success: false },
        { status: 400 }
      )
    }

    // Perform bulk delete
    const result = await componentDatabaseHelpers.components.bulkOperation({
      operation: 'delete',
      component_ids: body.component_ids,
      user_id: user.id,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Bulk delete failed', success: false },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: result.data,
      message: `Deleted ${result.data?.successful || 0} components`,
      success: true,
    })

  } catch (error: any) {
    console.error('Error deleting components:', error)
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