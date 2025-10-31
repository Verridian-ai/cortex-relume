import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  FileText, 
  Archive, 
  Database, 
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { ExportModal } from './export-modal';
import { BulkExport } from './bulk-export';
import { ExportProgress } from './export-progress';
import { ExportTemplateSelector } from './export-template-selector';
import { getExportTemplates, formatFileSize } from '@/lib/projects/export';
import { ProjectBackupManager } from '@/lib/projects/backup';

interface ExportManagerProps {
  projectId: string;
  projectName: string;
  userId: string;
}

interface ExportJob {
  id: string;
  type: string;
  status: string;
  progress: number;
  total_items: number;
  completed_items: number;
  format: string;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

interface Backup {
  id: string;
  name: string;
  description?: string;
  type: string;
  format: string;
  size_bytes?: number;
  status: string;
  created_at: string;
  expires_at?: string;
}

export function ExportManager({ projectId, projectName, userId }: ExportManagerProps) {
  const [activeTab, setActiveTab] = useState('export');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isBulkExportOpen, setIsBulkExportOpen] = useState(false);
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadExportJobs(),
        loadBackups()
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadExportJobs = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/export`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`
        }
      });
      
      if (response.ok) {
        const jobs = await response.json();
        setExportJobs(jobs.jobs || []);
      }
    } catch (err) {
      console.error('Failed to load export jobs:', err);
    }
  };

  const loadBackups = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/backup?action=list`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBackups(data.backups || []);
      }
    } catch (err) {
      console.error('Failed to load backups:', err);
    }
  };

  const getJobStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getJobStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      completed: 'default',
      failed: 'destructive',
      running: 'secondary',
      pending: 'outline',
      cancelled: 'outline'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'json':
        return <Database className="h-4 w-4" />;
      case 'zip':
        return <Archive className="h-4 w-4" />;
      case 'csv':
        return <FileText className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const deleteExportJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`
        },
        body: JSON.stringify({
          action: 'cancelJob',
          jobId
        })
      });

      if (response.ok) {
        setExportJobs(prev => prev.filter(job => job.id !== jobId));
      }
    } catch (err) {
      console.error('Failed to delete export job:', err);
    }
  };

  const deleteBackup = async (backupId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/backup?backupId=${backupId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`
        }
      });

      if (response.ok) {
        setBackups(prev => prev.filter(backup => backup.id !== backupId));
      }
    } catch (err) {
      console.error('Failed to delete backup:', err);
    }
  };

  const refreshData = () => {
    loadData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading export and backup data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Export & Backup</h2>
          <p className="text-muted-foreground">
            Manage project exports, backups, and automated schedules
          </p>
        </div>
        <Button onClick={refreshData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Single Export</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Export this project in various formats
                </CardDescription>
                <Button 
                  onClick={() => setIsExportModalOpen(true)}
                  className="w-full"
                >
                  Export Project
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bulk Export</CardTitle>
                <Archive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Export multiple projects at once
                </CardDescription>
                <Button 
                  onClick={() => setIsBulkExportOpen(true)}
                  variant="outline"
                  className="w-full"
                >
                  Bulk Export
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Templates</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Use pre-configured export templates
                </CardDescription>
                <ExportTemplateSelector 
                  projectId={projectId}
                  userId={userId}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Export Jobs</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Track export progress and history
                </CardDescription>
                <div className="text-2xl font-bold">{exportJobs.length}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Export Jobs</CardTitle>
              <CardDescription>
                Track and manage your export operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {exportJobs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No export jobs yet. Start by creating an export.
                </p>
              ) : (
                <div className="space-y-4">
                  {exportJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        {getJobStatusIcon(job.status)}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">Export Job</span>
                            {getFormatIcon(job.format)}
                            <span className="text-sm text-muted-foreground">
                              {job.format.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            {getJobStatusBadge(job.status)}
                            <span className="text-sm text-muted-foreground">
                              {new Date(job.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {job.status === 'running' && (
                          <div className="w-32">
                            <Progress value={job.progress} />
                          </div>
                        )}
                        
                        {job.status === 'completed' && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteExportJob(job.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backups" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Project Backups</h3>
            <Button 
              onClick={() => {
                // Create backup
                fetch(`/api/projects/${projectId}/backup`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`
                  },
                  body: JSON.stringify({
                    action: 'createBackup',
                    options: {
                      name: `Backup ${new Date().toLocaleDateString()}`,
                      description: 'Manual backup',
                      format: 'json'
                    }
                  })
                }).then(() => loadBackups());
              }}
            >
              <Database className="h-4 w-4 mr-2" />
              Create Backup
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {backups.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No backups created yet</p>
                </div>
              ) : (
                <div className="divide-y">
                  {backups.map((backup) => (
                    <div
                      key={backup.id}
                      className="flex items-center justify-between p-4"
                    >
                      <div className="flex items-center space-x-4">
                        {getFormatIcon(backup.format)}
                        <div>
                          <div className="font-medium">{backup.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {backup.description || 'No description'}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{backup.type}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {backup.size_bytes ? formatFileSize(backup.size_bytes) : 'Unknown size'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {new Date(backup.created_at).toLocaleDateString()}
                        </span>
                        
                        {backup.status === 'completed' && (
                          <>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                            <Button variant="outline" size="sm">
                              Restore
                            </Button>
                          </>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteBackup(backup.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Backup Schedules</h3>
            <Button>
              <Clock className="h-4 w-4 mr-2" />
              New Schedule
            </Button>
          </div>

          <Card>
            <CardContent className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No backup schedules configured</p>
              <p className="text-sm text-muted-foreground mt-2">
                Create automated backups for your project
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        projectId={projectId}
        projectName={projectName}
        userId={userId}
        onExportComplete={loadData}
      />

      <BulkExport
        isOpen={isBulkExportOpen}
        onClose={() => setIsBulkExportOpen(false)}
        userId={userId}
        onExportComplete={loadData}
      />

      <ExportProgress />
    </div>
  );
}
