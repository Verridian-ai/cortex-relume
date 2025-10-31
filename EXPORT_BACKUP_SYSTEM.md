# Export & Backup System Documentation

A comprehensive export and backup system for the AI Site Builder project, providing automated backups, export functionality, and data management capabilities.

## Features

### 🎯 Export Capabilities
- **Multiple Formats**: JSON, ZIP, CSV, PDF
- **Export Templates**: Pre-configured templates for different use cases
- **Bulk Export**: Export multiple projects simultaneously
- **Selective Export**: Choose specific data to include/exclude
- **Progress Tracking**: Real-time export progress monitoring

### 🔄 Backup System
- **Automated Backups**: Scheduled backups (daily, weekly, monthly)
- **Manual Backups**: On-demand project backups
- **Version Management**: Create and compare project versions
- **Diff Tracking**: Track changes between versions
- **Selective Restore**: Restore specific components or full projects

### ☁️ Cloud Integration
- **Supabase Storage**: Store backups in cloud storage
- **Signed URLs**: Secure download links with expiration
- **Retention Policies**: Automatic cleanup based on user tier
- **Health Monitoring**: Backup system health and status monitoring

### 📊 Management & Monitoring
- **Schedule Management**: Create, edit, and manage backup schedules
- **Progress Tracking**: Real-time job status and progress
- **Error Handling**: Comprehensive error reporting and recovery
- **Storage Analytics**: Usage tracking and optimization

## System Architecture

### Database Schema

#### Core Tables
- `project_backups` - Backup records and metadata
- `project_versions` - Version control for projects
- `export_templates` - Pre-configured export templates
- `backup_schedules` - Automated backup scheduling
- `export_jobs` - Export operation tracking
- `project_diffs` - Change tracking between versions

#### Key Functions
- `create_project_backup()` - Creates new project backups
- `cleanup_old_backups()` - Removes expired backups
- `create_project_diff()` - Generates change tracking data
- `get_backup_retention_count()` - Calculates retention based on user tier

### API Endpoints

#### Export API (`/api/projects/[id]/export/`)
```
GET  /api/projects/[id]/export     - Export project in specified format
POST /api/projects/[id]/export     - Create export job or manage job status
```

#### Backup API (`/api/projects/[id]/backup/`)
```
GET    /api/projects/[id]/backup    - List backups, schedules, versions
POST   /api/projects/[id]/backup    - Create backup, version, or schedule
DELETE /api/projects/[id]/backup    - Delete backup or schedule
PATCH  /api/projects/[id]/backup    - Update schedule settings
```

### Edge Functions

#### Backup Processor (`backup-processor`)
- **Purpose**: Processes scheduled backups
- **Triggers**: Cron job (every hour)
- **Actions**: `process`, `cleanup`, `status`

#### Backup Maintenance (`backup-maintenance`)
- **Purpose**: System maintenance and health checks
- **Triggers**: Cron job (daily, weekly, monthly)
- **Actions**: `full`, `cleanup`, `retention`, `health`, `compact`

## Usage Guide

### For Users

#### Creating an Export
1. Navigate to project Export & Backup section
2. Choose format (JSON, ZIP, CSV, PDF)
3. Select optional inclusions (assets, history, versions)
4. Click "Export Project"
5. Download when complete

#### Managing Backups
1. Go to Backup tab
2. Click "Create Backup" for manual backup
3. View backup history and status
4. Download or restore as needed

#### Setting Up Automated Backups
1. Go to Schedules tab
2. Click "New Schedule"
3. Configure frequency, time, and retention
4. Enable the schedule
5. Monitor in Backup tab

### For Developers

#### Using the Export Library
```typescript
import { ProjectExporter, ExportOptions } from '@/lib/projects/export';

const options: ExportOptions = {
  format: 'zip',
  includeAssets: true,
  includeHistory: false,
  includeVersions: true,
  minify: false
};

const exporter = new ProjectExporter(projectId, userId, options);
const result = await exporter.export();

if (result.success) {
  // Handle successful export
  const downloadUrl = result.downloadUrl;
}
```

#### Using the Backup Manager
```typescript
import { ProjectBackupManager } from '@/lib/projects/backup';

const backupManager = new ProjectBackupManager(userId);

// Create manual backup
const backupId = await backupManager.createBackup(
  projectId,
  'My Backup',
  'Description',
  'json',
  'manual'
);

// Restore from backup
const restoreResult = await backupManager.restoreBackup(backupId, {
  selective: false,
  overwriteExisting: false,
  preserveIds: true
});

// Create backup schedule
const scheduleId = await backupManager.createSchedule({
  user_id: userId,
  project_id: projectId,
  name: 'Daily Backup',
  schedule: 'daily',
  format: 'json',
  time: '02:00',
  retention_count: 7,
  enabled: true,
  timezone: 'UTC'
});
```

#### Using React Components
```tsx
import { ExportManager } from '@/components/projects/export/export-manager';

<ExportManager
  projectId="project-uuid"
  projectName="My Project"
  userId="user-uuid"
/>
```

## Configuration

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Cron Job Setup

Add these cron jobs to your deployment platform:

```bash
# Process scheduled backups (every hour)
0 * * * * curl -X GET "https://your-project.functions.supabase.co/backup-processor?action=process"

# Daily maintenance (2 AM UTC)
0 2 * * * curl -X GET "https://your-project.functions.supabase.co/backup-maintenance?action=full"

# Health checks (every 6 hours)
0 */6 * * * curl -X GET "https://your-project.functions.supabase.co/backup-maintenance?action=health"
```

### Storage Bucket Setup

Create Supabase storage buckets:
- `backups` - For backup file storage
- `exports` - For temporary export files

### Row Level Security (RLS)

Ensure RLS policies are enabled for all backup-related tables:
```sql
-- Example policies are included in the migration files
```

## Monitoring & Maintenance

### Health Checks
The system provides health check endpoints:
- Backup processor status
- Storage usage
- Failed backup rates
- Schedule compliance

### Logs & Alerts
Monitor these locations:
- Edge function logs in Supabase dashboard
- Export job status in database
- Cron job execution logs

### Performance Considerations
- Large exports may take several minutes
- Bulk operations are processed asynchronously
- Storage cleanup runs automatically
- Database optimization performed monthly

## Error Handling

### Common Issues
1. **Export Timeout**: Large projects may timeout, use bulk export
2. **Storage Full**: System automatically cleans old backups
3. **Permission Denied**: Check RLS policies and user access
4. **Network Errors**: Exports can be resumed from progress

### Recovery Procedures
1. Check backup status in dashboard
2. Re-run failed exports
3. Verify storage permissions
4. Contact support for persistent issues

## Security

### Data Protection
- All backups encrypted at rest
- Signed URLs for secure downloads
- Row-level security on all tables
- Service role key required for maintenance

### Access Control
- Users can only access their own backups
- Admin functions require service role key
- Cron jobs use secure authentication
- Backup files auto-expire after download

## API Reference

### Export Options
```typescript
interface ExportOptions {
  format: 'json' | 'csv' | 'pdf' | 'zip';
  includeAssets?: boolean;
  includeHistory?: boolean;
  includeVersions?: boolean;
  includeComponents?: boolean;
  minify?: boolean;
  template?: string;
  customSettings?: Record<string, any>;
}
```

### Backup Schedule
```typescript
interface BackupSchedule {
  name: string;
  schedule: 'daily' | 'weekly' | 'monthly';
  format: 'json' | 'zip' | 'csv' | 'pdf';
  time: string;
  day_of_week?: number;
  day_of_month?: number;
  timezone: string;
  retention_count: number;
  enabled: boolean;
  is_cloud_backup?: boolean;
}
```

## Troubleshooting

### Export Issues
- **Slow exports**: Normal for large projects
- **Failed downloads**: Check signed URL expiration
- **Format issues**: Verify template compatibility

### Backup Problems
- **Missing schedules**: Check cron job configuration
- **Storage errors**: Verify bucket permissions
- **Restore failures**: Check backup integrity

### Performance Issues
- **Slow queries**: Enable database indexes
- **Large files**: Consider zip compression
- **Timeout errors**: Use background processing

## Support

For technical support:
1. Check the logs in Supabase dashboard
2. Verify cron job execution
3. Test with a simple export first
4. Contact development team for complex issues

## Changelog

### Version 1.0.0
- Initial export and backup system
- Support for all major formats
- Automated scheduling and maintenance
- Full API and UI integration
- Comprehensive documentation
