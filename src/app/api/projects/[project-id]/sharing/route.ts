import { supabase } from '@/lib/supabase/client'
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';

type ProjectSharing = Database['public']['Tables']['project_sharing']['Row'];
type ProjectSharingInsert = Database['public']['Tables']['project_sharing']['Insert'];
type ProjectShareLink = Database['public']['Tables']['project_share_links']['Row'];
type ProjectShareLinkInsert = Database['public']['Tables']['project_share_links']['Insert'];

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.project-id;

    // Check if user has access to this project
    const { data: project } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', project-id)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const canView = project.user_id === user.id ||
      await supabase.rpc('check_project_permission', {
        project_uuid: project-id,
        user_uuid: user.id,
        required_permission: 'viewer'
      });

    if (!canView) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get sharing information
    const { data: sharing, error } = await supabase
      .from('project_sharing')
      .select(`
        *,
        user:profiles(id, full_name, avatar_url, email),
        granted_by_profile:profiles!project_sharing_granted_by_fkey(id, full_name)
      `)
      .eq('project_id', project-id)
      .eq('is_active', true)
      .order('granted_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get share links
    const { data: shareLinks, error: linksError } = await supabase
      .from('project_share_links')
      .select(`
        *,
        created_by_profile:profiles!project_share_links_created_by_fkey(id, full_name)
      `)
      .eq('project_id', project-id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (linksError) {
      return NextResponse.json({ error: linksError.message }, { status: 500 });
    }

    // Transform data
    const transformedSharing = sharing?.map(rel => ({
      ...rel,
      user: rel.user,
      granted_by: rel.granted_by_profile
    })) || [];

    const transformedLinks = shareLinks?.map(link => ({
      ...link,
      created_by: link.created_by_profile
    })) || [];

    return NextResponse.json({
      sharing: transformedSharing,
      share_links: transformedLinks,
      is_owner: project.user_id === user.id
    });

  } catch (error) {
    console.error('Error fetching sharing info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.project-id;
    const body = await request.json();
    
    // Check if user is project owner
    const { data: project } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', project-id)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.user_id !== user.id) {
      return NextResponse.json({ error: 'Only project owner can manage sharing' }, { status: 403 });
    }

    const { sharing, share_link } = body;

    let result = {};

    // Handle user sharing
    if (sharing) {
      const sharingData: ProjectSharingInsert = {
        project_id: project-id,
        user_id: sharing.user_id,
        permission_level: sharing.permission_level,
        granted_by: user.id,
        expires_at: sharing.expires_at,
        metadata: sharing.metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: sharingResult, error: sharingError } = await supabase
        .from('project_sharing')
        .insert(sharingData)
        .select(`
          *,
          user:profiles(id, full_name, avatar_url, email)
        `)
        .single();

      if (sharingError) {
        if (sharingError.code === '23505') {
          return NextResponse.json({ 
            error: 'User already has access to this project' 
          }, { status: 409 });
        }
        return NextResponse.json({ error: sharingError.message }, { status: 500 });
      }

      result = { ...result, sharing: sharingResult };
    }

    // Handle share link creation
    if (share_link) {
      // Generate a unique token
      const token = crypto.randomUUID().replace(/-/g, '');
      
      const linkData: ProjectShareLinkInsert = {
        project_id: project-id,
        token,
        permission_level: share_link.permission_level || 'viewer',
        expires_at: share_link.expires_at,
        max_access_count: share_link.max_access_count,
        created_by: user.id,
        created_at: new Date().toISOString()
      };

      const { data: linkResult, error: linkError } = await supabase
        .from('project_share_links')
        .insert(linkData)
        .select()
        .single();

      if (linkError) {
        return NextResponse.json({ error: linkError.message }, { status: 500 });
      }

      result = { ...result, share_link: linkResult };
    }

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('Error creating sharing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.project-id;
    const { searchParams } = new URL(request.url);
    const sharingId = searchParams.get('sharing_id');
    const linkToken = searchParams.get('link_token');

    // Check if user is project owner
    const { data: project } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', project-id)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.user_id !== user.id) {
      return NextResponse.json({ error: 'Only project owner can manage sharing' }, { status: 403 });
    }

    if (sharingId) {
      // Remove user sharing
      const { error } = await supabase
        .from('project_sharing')
        .delete()
        .eq('id', sharingId)
        .eq('project_id', project-id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ message: 'User access removed successfully' });
    }

    if (linkToken) {
      // Remove share link
      const { error } = await supabase
        .from('project_share_links')
        .delete()
        .eq('token', linkToken)
        .eq('project_id', project-id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ message: 'Share link removed successfully' });
    }

    return NextResponse.json({ error: 'Missing sharing_id or link_token' }, { status: 400 });

  } catch (error) {
    console.error('Error removing sharing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}