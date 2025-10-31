import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';

type ProjectTemplate = Database['public']['Tables']['project_templates']['Row'];
type ProjectTemplateInsert = Database['public']['Tables']['project_templates']['Insert'];

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category');
    const framework = searchParams.get('framework');
    const difficulty = searchParams.get('difficulty');
    const featured = searchParams.get('featured') === 'true';
    const publicOnly = searchParams.get('public') !== 'false';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'usage_count';

    let query = supabase
      .from('project_templates')
      .select(`
        *,
        author:profiles!project_templates_author_id_fkey(id, full_name, avatar_url)
      `);

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (framework) {
      query = query.eq('framework', framework);
    }

    if (difficulty) {
      query = query.eq('difficulty_level', difficulty);
    }

    if (featured) {
      query = query.eq('is_featured', true);
    }

    if (publicOnly) {
      query = query.eq('is_public', true);
    } else {
      // Include user's own templates even if not public
      query = query.or(`is_public.eq.true,author_id.eq.${user.id}`);
    }

    // Apply sorting
    const orderColumn = sortBy === 'name' ? 'name' :
                       sortBy === 'rating' ? 'rating' :
                       sortBy === 'created_at' ? 'created_at' : 'usage_count';
    
    const ascending = sortBy === 'name';
    query = query.order(orderColumn, { ascending });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: templates, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform data
    const transformedTemplates = templates?.map(template => ({
      ...template,
      author: template.author
    })) || [];

    return NextResponse.json({
      templates: transformedTemplates,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ProjectTemplateInsert = await request.json();
    
    // Validate required fields
    if (!body.name || !body.project_data) {
      return NextResponse.json({ 
        error: 'Name and project data are required' 
      }, { status: 400 });
    }

    const templateData = {
      ...body,
      author_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('project_templates')
      .insert(templateData)
      .select(`
        *,
        author:profiles!project_templates_author_id_fkey(id, full_name, avatar_url)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ template: data }, { status: 201 });

  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}