import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ProjectBackupManager, BackupSchedule } from '@/lib/projects/backup';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user from JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Verify project access
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const backupManager = new ProjectBackupManager(user.id);

    switch (action) {
      case 'list':
        const backups = await backupManager.getBackups(projectId);
        return NextResponse.json({ backups });

      case 'schedules':
        const schedules = await backupManager.getSchedules(projectId);
        return NextResponse.json({ schedules });

      case 'versions':
        const versions = await backupManager.getVersions(projectId);
        return NextResponse.json({ versions });

      case 'storageUsage':
        const usage = await backupManager.getStorageUsage();
        return NextResponse.json({ usage });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Backup API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const body = await request.json();
    const { action, backupId, options, schedule } = body;

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user from JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Verify project access
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const backupManager = new ProjectBackupManager(user.id);

    switch (action) {
      case 'createBackup':
        const backup = await backupManager.createBackup(
          projectId,
          options?.name || `Backup ${new Date().toLocaleDateString()}`,
          options?.description,
          options?.format || 'json',
          'manual'
        );

        return NextResponse.json({ 
          backupId: backup,
          message: 'Backup created successfully' 
        });

      case 'createVersion':
        const version = await backupManager.createVersion(
          projectId,
          options?.name || `Version ${new Date().toISOString()}`,
          options?.description,
          options?.isMajor || false
        );

        return NextResponse.json({ 
          versionId: version,
          message: 'Version created successfully' 
        });

      case 'createSchedule':
        const scheduleId = await backupManager.createSchedule({
          ...schedule,
          user_id: user.id,
          project_id: projectId
        });

        return NextResponse.json({ 
          scheduleId,
          message: 'Backup schedule created successfully' 
        });

      case 'restoreBackup':
        if (!backupId) {
          return NextResponse.json({ error: 'Backup ID required' }, { status: 400 });
        }

        const restoreResult = await backupManager.restoreBackup(backupId, options);
        return NextResponse.json(restoreResult);

      case 'compareVersions':
        if (!options?.version1 || !options?.version2) {
          return NextResponse.json({ error: 'Both version IDs required' }, { status: 400 });
        }

        const diff = await backupManager.compareVersions(options.version1, options.version2);
        return NextResponse.json({ diff });

      case 'cleanupBackups':
        const deletedCount = await backupManager.cleanupOldBackups(
          projectId,
          options?.retentionCount
        );

        return NextResponse.json({ 
          deletedCount,
          message: `Cleaned up ${deletedCount} old backups` 
        });

      case 'downloadBackup':
        if (!backupId) {
          return NextResponse.json({ error: 'Backup ID required' }, { status: 400 });
        }

        const backup = await backupManager.getBackup(backupId);
        
        if (backup.storage_path) {
          // Generate signed URL for download
          const { data: signedUrl, error: urlError } = await supabase.storage
            .from('backups')
            .createSignedUrl(backup.storage_path, 3600); // 1 hour expiry

          if (urlError) {
            return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 });
          }

          return NextResponse.json({ 
            downloadUrl: signedUrl.signedUrl,
            expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
            fileName: `${backup.name}.${backup.format}`
          });
        } else {
          return NextResponse.json({ error: 'Backup file not found' }, { status: 404 });
        }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Backup API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const url = new URL(request.url);
    const backupId = url.searchParams.get('backupId');
    const scheduleId = url.searchParams.get('scheduleId');

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user from JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Verify project access
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const backupManager = new ProjectBackupManager(user.id);

    if (backupId) {
      await backupManager.deleteBackup(backupId);
      return NextResponse.json({ message: 'Backup deleted successfully' });
    }

    if (scheduleId) {
      await backupManager.deleteSchedule(scheduleId);
      return NextResponse.json({ message: 'Backup schedule deleted successfully' });
    }

    return NextResponse.json({ error: 'Backup ID or Schedule ID required' }, { status: 400 });

  } catch (error) {
    console.error('Backup API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const body = await request.json();
    const { scheduleId, updates } = body;

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user from JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Verify project access
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const backupManager = new ProjectBackupManager(user.id);

    if (!scheduleId) {
      return NextResponse.json({ error: 'Schedule ID required' }, { status: 400 });
    }

    await backupManager.updateSchedule(scheduleId, updates);

    return NextResponse.json({ message: 'Backup schedule updated successfully' });

  } catch (error) {
    console.error('Backup API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
