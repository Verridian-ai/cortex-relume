import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Alert, 
  AlertDescription 
} from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Clock, 
  Download,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { formatFileSize, getExportFormatDescription } from '@/lib/projects/export';

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
  result_path?: string;
}

interface ExportProgressProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
  maxJobs?: number;
  onJobComplete?: (jobId: string) => void;
}

export function ExportProgress({ 
  autoRefresh = true, 
  refreshInterval = 5000,
  maxJobs = 10,
  onJobComplete 
}: ExportProgressProps) {
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    loadJobs();
    
    if (autoRefresh) {
      const interval = setInterval(loadJobs, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  useEffect(() => {
    // Check for completed jobs and trigger callback
    jobs.forEach(job => {
      if (job.status === 'completed' && onJobComplete) {
        onJobComplete(job.id);
      }
    });
  }, [jobs, onJobComplete]);

  const loadJobs = async () => {
    try {
      setError(null);
      const response = await fetch('/api/export/jobs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load export jobs');
      }

      const data = await response.json();
      setJobs(data.jobs?.slice(0, maxJobs) || []);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
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

  const getStatusBadge = (status: string) => {
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
        return <div className="w-4 h-4 bg-blue-500 rounded text-white text-xs flex items-center justify-center">J</div>;
      case 'zip':
        return <div className="w-4 h-4 bg-green-500 rounded text-white text-xs flex items-center justify-center">Z</div>;
      case 'csv':
        return <div className="w-4 h-4 bg-orange-500 rounded text-white text-xs flex items-center justify-center">C</div>;
      case 'pdf':
        return <div className="w-4 h-4 bg-red-500 rounded text-white text-xs flex items-center justify-center">P</div>;
      default:
        return <div className="w-4 h-4 bg-gray-500 rounded text-white text-xs flex items-center justify-center">?</div>;
    }
  };

  const downloadResult = async (jobId: string) => {
    try {
      const response = await fetch(`/api/export/jobs/${jobId}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        window.open(data.downloadUrl, '_blank');
      }
    } catch (err) {
      console.error('Failed to download result:', err);
    }
  };

  const cancelJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/export/jobs/${jobId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`
        }
      });

      if (response.ok) {
        setJobs(prev => prev.map(job => 
          job.id === jobId ? { ...job, status: 'cancelled' as const } : job
        ));
      }
    } catch (err) {
      console.error('Failed to cancel job:', err);
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/export/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`
        }
      });

      if (response.ok) {
        setJobs(prev => prev.filter(job => job.id !== jobId));
      }
    } catch (err) {
      console.error('Failed to delete job:', err);
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading export jobs...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Export Progress</h3>
          <p className="text-sm text-muted-foreground">
            Track your export operations in real-time
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {lastUpdate && (
            <span className="text-xs text-muted-foreground">
              Updated {getRelativeTime(lastUpdate.toISOString())}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={loadJobs}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Jobs List */}
      <div className="space-y-3">
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No export jobs found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Start an export to see progress here
              </p>
            </CardContent>
          </Card>
        ) : (
          jobs.map((job) => (
            <Card key={job.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(job.status)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Export Job</span>
                        {getFormatIcon(job.format)}
                        <span className="text-sm text-muted-foreground">
                          {job.format.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusBadge(job.status)}
                        <span className="text-xs text-muted-foreground">
                          {job.total_items} items • Started {getRelativeTime(job.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {job.status === 'completed' && job.result_path && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadResult(job.id)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}

                    {(job.status === 'pending' || job.status === 'running') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cancelJob(job.id)}
                      >
                        Cancel
                      </Button>
                    )}

                    {job.status !== 'running' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteJob(job.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {(job.status === 'running' || job.status === 'pending') && (
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        Progress
                      </span>
                      <span className="text-sm font-medium">
                        {job.completed_items} / {job.total_items} ({job.progress}%)
                      </span>
                    </div>
                    <Progress 
                      value={job.progress} 
                      className="h-2"
                    />
                  </div>
                )}

                {/* Error Message */}
                {job.status === 'failed' && job.error_message && (
                  <div className="p-4 bg-red-50 border-t">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium text-red-700">Export Failed</span>
                    </div>
                    <p className="text-sm text-red-600 mt-1">{job.error_message}</p>
                  </div>
                )}

                {/* Completion Info */}
                {job.status === 'completed' && job.completed_at && (
                  <div className="p-4 bg-green-50 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-green-700">
                          Export completed successfully
                        </span>
                      </div>
                      <span className="text-sm text-green-600">
                        Completed {getRelativeTime(job.completed_at)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {jobs.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {jobs.filter(j => j.status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {jobs.filter(j => j.status === 'running').length}
              </div>
              <div className="text-sm text-muted-foreground">Running</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {jobs.filter(j => j.status === 'pending').length}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {jobs.filter(j => j.status === 'failed').length}
              </div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Hook for using export progress in other components
export function useExportProgress(jobId?: string) {
  const [job, setJob] = useState<ExportJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const loadJob = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/export/jobs/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setJob(data.job);
        } else {
          throw new Error('Failed to load job');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load job');
      } finally {
        setIsLoading(false);
      }
    };

    loadJob();

    // Poll for updates if job is running
    const interval = setInterval(() => {
      if (job?.status === 'running' || job?.status === 'pending') {
        loadJob();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId, job?.status]);

  return { job, isLoading, error, refetch: () => window.location.reload() };
}
