import { supabase } from '@/lib/supabase/client'
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';

type ProjectFolder = Database['public']['Tables']['project_folders']['Row'];
type ProjectFolderInsert = Database['public']['Tables']['project_folders']['Insert'];
type ProjectFolderUpdate = Database['public']['Tables']['project_folders']['Update'];

export async function GET(request: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parent_id');
    const includeRoot = searchParams.get('include_root') === 'true';

    let query = supabase
      .from('project_folders')
      .select(`
        *,
        projects:projects(count),
        children:project_folders(id, name, color, icon)
      `)
      .eq('owner_id', user.id)
      .order('sort_order', { ascending: true });

    if (parentId) {
      query = query.eq('parent_id', parentId);
    } else if (!includeRoot) {
      query = query.eq('is_root', false);
    }

    const { data: folders, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform data to include project counts
    const transformedFolders = folders?.map(folder => ({
      ...folder,
      project_count: folder.projects?.[0]?.count || 0,
      children_count: folder.children?.length || 0
    })) || [];

    return NextResponse.json({ folders: transformedFolders });

  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ProjectFolderInsert = await request.json();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json({ 
        error: 'Folder name is required' 
      }, { status: 400 });
    }

    // Create folder with user ID
    const folderData = {
      ...body,
      owner_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('project_folders')
      .insert(folderData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ folder: data }, { status: 201 });

  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}