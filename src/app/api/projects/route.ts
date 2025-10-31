import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category');
    const folder = searchParams.get('folder');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const status = searchParams.get('status');
    const isPublic = searchParams.get('public');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'updated_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    let queryBuilder = supabase
      .from('projects')
      .select(`
        *,
        folder:project_folders(id, name, color, icon),
        category:project_categories(id, name, color, icon),
        owner:profiles!projects_user_id_fkey(id, full_name, avatar_url),
        tags:project_tags_relations(
          tag:project_tags(id, name, color)
        ),
        sharing:project_sharing(
          user:profiles(id, full_name, avatar_url),
          permission_level,
          granted_at
        )
      `);

    // Apply filters
    if (query) {
      queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (category) {
      queryBuilder = queryBuilder.eq('category_id', category);
    }

    if (folder) {
      queryBuilder = queryBuilder.eq('folder_id', folder);
    }

    if (status) {
      queryBuilder = queryBuilder.eq('status', status);
    }

    if (isPublic === 'true') {
      queryBuilder = queryBuilder.eq('is_public', true);
    } else {
      // Only show user's own projects and shared projects
      queryBuilder = queryBuilder.or(`user_id.eq.${user.id},sharing.user_id.eq.${user.id}`);
    }

    // Apply sorting
    const orderColumn = sortBy === 'name' ? 'name' : 
                       sortBy === 'created_at' ? 'created_at' : 
                       sortBy === 'view_count' ? 'view_count' : 'updated_at';
    
    queryBuilder = queryBuilder.order(orderColumn, { ascending: sortOrder === 'asc' });

    // Apply pagination
    queryBuilder = queryBuilder.range(offset, offset + limit - 1);

    const { data, error, count } = await queryBuilder;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform data to flatten nested structure
    const transformedData = data?.map(project => ({
      ...project,
      folder: project.folder,
      category: project.category,
      owner: project.owner,
      tags: project.tags?.map((rel: any) => rel.tag).filter(Boolean) || [],
      collaborators: project.sharing?.filter((rel: any) => rel.user).map((rel: any) => ({
        ...rel.user,
        permission_level: rel.permission_level,
        granted_at: rel.granted_at
      })) || []
    })) || [];

    return NextResponse.json({
      projects: transformedData,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('Error fetching projects:', error);
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

    const body: ProjectInsert = await request.json();
    
    // Validate required fields
    if (!body.name || !body.type) {
      return NextResponse.json({ 
        error: 'Name and type are required' 
      }, { status: 400 });
    }

    // Create project with user ID
    const projectData = {
      ...body,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select(`
        *,
        folder:project_folders(id, name),
        category:project_categories(id, name),
        owner:profiles!projects_user_id_fkey(id, full_name, avatar_url)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create initial analytics record
    await supabase
      .from('project_analytics')
      .insert({
        project_id: data.id,
        user_id: user.id,
        event_type: 'create',
        event_data: { action: 'project_created' },
        created_at: new Date().toISOString()
      });

    return NextResponse.json({ project: data }, { status: 201 });

  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}