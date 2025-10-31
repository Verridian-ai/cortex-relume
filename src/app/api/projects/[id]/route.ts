import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

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

    const projectId = params.id;

    // Get project with all related data
    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        folder:project_folders(id, name, description, color, icon, parent_id),
        category:project_categories(id, name, description, color, icon, parent_id),
        owner:profiles!projects_user_id_fkey(id, full_name, avatar_url, email),
        tags:project_tags_relations(
          tag:project_tags(id, name, slug, color, category)
        ),
        sharing:project_sharing(
          user:profiles(id, full_name, avatar_url, email),
          permission_level,
          granted_at,
          expires_at,
          granted_by
        )
      `)
      .eq('id', projectId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    // Check if user has access to this project
    const hasAccess = 
      project.user_id === user.id ||
      project.is_public ||
      project.sharing?.some((rel: any) => rel.user?.id === user.id);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Transform data
    const transformedProject = {
      ...project,
      folder: project.folder,
      category: project.category,
      owner: project.owner,
      tags: project.tags?.map((rel: any) => rel.tag).filter(Boolean) || [],
      collaborators: project.sharing?.filter((rel: any) => rel.user).map((rel: any) => ({
        ...rel.user,
        permission_level: rel.permission_level,
        granted_at: rel.granted_at,
        expires_at: rel.expires_at,
        granted_by: rel.granted_by
      })) || []
    };

    // Update view count and create analytics record
    if (project.user_id !== user.id) {
      await Promise.all([
        supabase.rpc('increment_project_views', { project_uuid: projectId }),
        supabase
          .from('project_analytics')
          .insert({
            project_id: projectId,
            user_id: user.id,
            event_type: 'view',
            event_data: { source: 'api' },
            created_at: new Date().toISOString()
          })
      ]);
    }

    return NextResponse.json({ project: transformedProject });

  } catch (error) {
    console.error('Error fetching project:', error);
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

    const projectId = params.id;
    const updates: ProjectUpdate = await request.json();

    // Check if user has edit permission
    const { data: project } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const canEdit = project.user_id === user.id || 
      await supabase.rpc('check_project_permission', {
        project_uuid: projectId,
        user_uuid: user.id,
        required_permission: 'editor'
      });

    if (!canEdit) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
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

    // Create analytics record for edit
    await supabase
      .from('project_analytics')
      .insert({
        project_id: projectId,
        user_id: user.id,
        event_type: 'edit',
        event_data: { changes: Object.keys(updates) },
        created_at: new Date().toISOString()
      });

    return NextResponse.json({ project: data });

  } catch (error) {
    console.error('Error updating project:', error);
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

    const projectId = params.id;

    // Check if user is the owner
    const { data: project } = await supabase
      .from('projects')
      .select('user_id, name')
      .eq('id', projectId)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.user_id !== user.id) {
      return NextResponse.json({ error: 'Only the project owner can delete the project' }, { status: 403 });
    }

    // Delete the project (cascade will handle related records)
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Project deleted successfully',
      deleted_project: { id: projectId, name: project.name }
    });

  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}