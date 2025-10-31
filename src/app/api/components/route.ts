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
    const categories = searchParams.get('categories')?.split(',').filter(Boolean)
    const frameworks = searchParams.get('frameworks')?.split(',').filter(Boolean)
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)
    const difficulty_levels = searchParams.get('difficulty_levels')?.split(',').filter(Boolean)
    
    const query = searchParams.get('query') || undefined
    const rating_min = searchParams.get('rating_min') ? Number(searchParams.get('rating_min')) : undefined
    const usage_min = searchParams.get('usage_min') ? Number(searchParams.get('usage_min')) : undefined
    
    const filters: ComponentSearchFilters = {
      ...(query ? { query } : {}),
      ...(categories ? { categories } : {}),
      ...(frameworks ? { frameworks: frameworks as any } : {}),
      ...(tags ? { tags } : {}),
      ...(difficulty_levels ? { difficulty_levels: difficulty_levels as any } : {}),
      ...(rating_min !== undefined ? { rating_min } : {}),
      ...(usage_min !== undefined ? { usage_min } : {}),
      sort_by: (searchParams.get('sort_by') as any) || 'popularity',
      sort_order: (searchParams.get('sort_order') as any) || 'desc',
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 50,
      offset: searchParams.get('offset') ? Number(searchParams.get('offset')) : 0,
    }

    // Validate filters and create clean object
    const validatedFilters = searchComponentsSchema.parse(filters)
    
    // Create a clean filters object with only defined values
    const searchFilters: Partial<ComponentSearchFilters> = {}
    if (validatedFilters.query) searchFilters.query = validatedFilters.query
    if (validatedFilters.categories?.length) searchFilters.categories = validatedFilters.categories
    if (validatedFilters.frameworks?.length) searchFilters.frameworks = validatedFilters.frameworks as any
    if (validatedFilters.tags?.length) searchFilters.tags = validatedFilters.tags
    if (validatedFilters.difficulty_levels?.length) searchFilters.difficulty_levels = validatedFilters.difficulty_levels as any
    if (validatedFilters.rating_min !== undefined) searchFilters.rating_min = validatedFilters.rating_min
    if (validatedFilters.usage_min !== undefined) searchFilters.usage_min = validatedFilters.usage_min
    searchFilters.sort_by = validatedFilters.sort_by as any
    searchFilters.sort_order = validatedFilters.sort_order
    searchFilters.limit = validatedFilters.limit
    searchFilters.offset = validatedFilters.offset

    // Get components with search
    const result = await componentDatabaseHelpers.components.search(searchFilters)

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
        options: {
          user_id: user.id,
        } as any,
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
      options: {
        user_id: user.id,
      } as any,
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