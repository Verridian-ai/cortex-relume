import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ProjectExporter } from '@/lib/projects/export';
import { ProjectBackupManager } from '@/lib/projects/backup';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'json';
    const includeAssets = url.searchParams.get('includeAssets') === 'true';
    const includeHistory = url.searchParams.get('includeHistory') === 'true';
    const includeVersions = url.searchParams.get('includeVersions') === 'true';
    const includeComponents = url.searchParams.get('includeComponents') === 'true';
    const minify = url.searchParams.get('minify') === 'true';

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

    // Perform export
    const exporter = new ProjectExporter(projectId, user.id, {
      format: format as any,
      includeAssets,
      includeHistory,
      includeVersions,
      includeComponents,
      minify
    });

    const result = await exporter.export();

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Determine content type based on format
    const contentTypes = {
      json: 'application/json',
      csv: 'text/csv',
      pdf: 'application/pdf',
      zip: 'application/zip'
    };

    // Create filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = result.fileName || `project-${projectId}-${timestamp}.${format}`;

    // Return file
    return new NextResponse(result.data, {
      status: 200,
      headers: {
        'Content-Type': contentTypes[format as keyof typeof contentTypes] || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': (result.data as Buffer).length.toString()
      }
    });

  } catch (error) {
    console.error('Export API error:', error);
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
    const { action, options, jobId, downloadUrl } = body;

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

    switch (action) {
      case 'getJobStatus':
        if (!jobId) {
          return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
        }

        const { data: job, error: jobError } = await supabase
          .from('export_jobs')
          .select('*')
          .eq('id', jobId)
          .eq('user_id', user.id)
          .single();

        if (jobError) {
          return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        return NextResponse.json({
          job,
          progress: job.progress,
          status: job.status,
          resultUrl: job.result_path
        });

      case 'cancelJob':
        if (!jobId) {
          return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
        }

        const { error: cancelError } = await supabase
          .from('export_jobs')
          .update({ status: 'cancelled' })
          .eq('id', jobId)
          .eq('user_id', user.id)
          .eq('status', 'pending');

        if (cancelError) {
          return NextResponse.json({ error: 'Failed to cancel job' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Job cancelled successfully' });

      case 'downloadResult':
        if (!downloadUrl) {
          return NextResponse.json({ error: 'Download URL required' }, { status: 400 });
        }

        // Generate signed URL for download
        const { data: signedUrl, error: urlError } = await supabase.storage
          .from('exports')
          .createSignedUrl(downloadUrl, 3600); // 1 hour expiry

        if (urlError) {
          return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 });
        }

        return NextResponse.json({ 
          downloadUrl: signedUrl.signedUrl,
          expiresAt: new Date(Date.now() + 3600 * 1000).toISOString()
        });

      case 'createExportJob':
        const backupManager = new ProjectBackupManager(user.id);
        
        // Create backup job
        const backupJobId = await backupManager.createBackup(
          projectId,
          options?.name || `Export ${new Date().toLocaleDateString()}`,
          options?.description,
          options?.format || 'json',
          'manual'
        );

        // Update export job with backup info
        const { data: exportJob, error: exportError } = await supabase
          .from('export_jobs')
          .insert({
            user_id: user.id,
            project_ids: [projectId],
            type: 'export',
            status: 'running',
            format: options?.format || 'json',
            options: options,
            total_items: 1
          })
          .select()
          .single();

        if (exportError) {
          return NextResponse.json({ error: 'Failed to create export job' }, { status: 500 });
        }

        // Start background export (in real implementation, this would be queued)
        setTimeout(async () => {
          try {
            const exporter = new ProjectExporter(projectId, user.id, options);
            const result = await exporter.export();

            // Update job status
            await supabase
              .from('export_jobs')
              .update({
                status: result.success ? 'completed' : 'failed',
                progress: 100,
                completed_items: 1,
                completed_at: new Date().toISOString(),
                error_message: result.error
              })
              .eq('id', exportJob.id);

          } catch (error) {
            console.error('Background export failed:', error);
            await supabase
              .from('export_jobs')
              .update({
                status: 'failed',
                progress: 0,
                completed_items: 0,
                completed_at: new Date().toISOString(),
                error_message: error instanceof Error ? error.message : 'Unknown error'
              })
              .eq('id', exportJob.id);
          }
        }, 100);

        return NextResponse.json({ 
          jobId: exportJob.id,
          message: 'Export job created successfully' 
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
