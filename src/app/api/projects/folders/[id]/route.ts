import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';

type ProjectFolder = Database['public']['Tables']['project_folders']['Row'];
type ProjectFolderUpdate = Database['public']['Tables']['project_folders']['Update'];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const folderId = params.id;

    const { data: folder, error } = await supabase
      .from('project_folders')
      .select(`
        *,
        parent:project_folders(id, name, color, icon),
        projects:projects(
          id, name, description, status, type, created_at, updated_at,
          owner:profiles!projects_user_id_fkey(id, full_name, avatar_url)
        ),
        children:project_folders(id, name, description, color, icon, created_at)
      `)
      .eq('id', folderId)
      .eq('owner_id', user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    // Transform data
    const transformedFolder = {
      ...folder,
      parent: folder.parent,
      projects: folder.projects || [],
      children: folder.children || [],
      project_count: folder.projects?.length || 0,
      children_count: folder.children?.length || 0
    };

    return NextResponse.json({ folder: transformedFolder });

  } catch (error) {
    console.error('Error fetching folder:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const folderId = params.id;
    const updates: ProjectFolderUpdate = await request.json();

    // Check ownership
    const { data: folder } = await supabase
      .from('project_folders')
      .select('owner_id')
      .eq('id', folderId)
      .single();

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    if (folder.owner_id !== user.id) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('project_folders')
      .update(updateData)
      .eq('id', folderId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ folder: data });

  } catch (error) {
    console.error('Error updating folder:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const folderId = params.id;

    // Check ownership
    const { data: folder } = await supabase
      .from('project_folders')
      .select('owner_id, name, is_root')
      .eq('id', folderId)
      .single();

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    if (folder.owner_id !== user.id) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Don't allow deletion of root folders
    if (folder.is_root) {
      return NextResponse.json({ error: 'Cannot delete root folder' }, { status: 400 });
    }

    // Check if folder has children or projects
    const { data: children } = await supabase
      .from('project_folders')
      .select('id')
      .eq('parent_id', folderId)
      .limit(1);

    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .eq('folder_id', folderId)
      .limit(1);

    if ((children && children.length > 0) || (projects && projects.length > 0)) {
      return NextResponse.json({ 
        error: 'Cannot delete folder with projects or subfolders. Move or delete all content first.' 
      }, { status: 400 });
    }

    // Delete the folder
    const { error } = await supabase
      .from('project_folders')
      .delete()
      .eq('id', folderId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Folder deleted successfully',
      deleted_folder: { id: folderId, name: folder.name }
    });

  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}