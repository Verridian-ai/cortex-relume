import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Archive, 
  Search, 
  XCircle, 
  CheckCircle,
  Loader2,
  Download,
  Folder,
  Calendar
} from 'lucide-react';
import { bulkExport, formatFileSize } from '@/lib/projects/export';

interface BulkExportProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onExportComplete: () => void;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ExportJob {
  id: string;
  project_ids: string[];
  status: string;
  progress: number;
  total_items: number;
  format: string;
  created_at: string;
}

export function BulkExport({ isOpen, onClose, userId, onExportComplete }: BulkExportProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [format, setFormat] = useState<'json' | 'zip' | 'csv' | 'pdf'>('zip');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadProjects();
      loadExportJobs();
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeJobId) {
      pollJobStatus();
    }
  }, [activeJobId]);

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  const loadExportJobs = async () => {
    try {
      const response = await fetch('/api/export/jobs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setExportJobs(data.jobs || []);
      }
    } catch (err) {
      console.error('Failed to load export jobs:', err);
    }
  };

  const pollJobStatus = async () => {
    if (!activeJobId) return;

    const poll = async () => {
      try {
        const response = await fetch(`/api/export/jobs/${activeJobId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setExportProgress(data.job.progress);
          
          if (data.job.status === 'completed' || data.job.status === 'failed') {
            setIsExporting(false);
            setActiveJobId(null);
            onExportComplete();
          } else if (data.job.status === 'running') {
            setTimeout(poll, 2000); // Poll every 2 seconds
          }
        }
      } catch (err) {
        console.error('Failed to poll job status:', err);
      }
    };

    poll();
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleProjectToggle = (projectId: string) => {
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProjects.length === filteredProjects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(filteredProjects.map(p => p.id));
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setError(null);
      setExportProgress(0);

      const jobId = await bulkExport(selectedProjects, userId, { format });
      setActiveJobId(jobId);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    setSelectedProjects([]);
    setSearchTerm('');
    setFormat('zip');
    setIsExporting(false);
    setExportProgress(0);
    setError(null);
    setActiveJobId(null);
    onClose();
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
      case 'zip':
        return <Archive className="h-4 w-4" />;
      case 'json':
        return <FileText className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Bulk Export</DialogTitle>
          <DialogDescription>
            Export multiple projects at once in a single archive
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label>Export Format</Label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full p-2 border rounded-md"
              >
                <option value="zip">ZIP Archive</option>
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="pdf">PDF Report</option>
              </select>
            </div>
          </div>

          {/* Selection Summary */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-4">
              <Checkbox
                checked={selectedProjects.length === filteredProjects.length && filteredProjects.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="font-medium">
                {selectedProjects.length} of {filteredProjects.length} projects selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Projects List */}
          <div className="border rounded-lg max-h-96 overflow-y-auto">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-8">
                <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No projects found</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className={`flex items-center justify-between p-4 hover:bg-muted/50 ${
                      selectedProjects.includes(project.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <Checkbox
                        checked={selectedProjects.includes(project.id)}
                        onCheckedChange={() => handleProjectToggle(project.id)}
                      />
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {project.description || 'No description'}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{project.type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            Created {new Date(project.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(project.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Export Summary */}
          {selectedProjects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Export Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Projects:</span>
                  <span className="font-medium">{selectedProjects.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Format:</span>
                  <span className="font-medium">{format.toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Estimated Size:</span>
                  <span className="font-medium">~{(selectedProjects.length * 2.5).toFixed(1)} MB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Estimated Time:</span>
                  <span className="font-medium">{Math.ceil(selectedProjects.length / 10)} minutes</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Export Jobs */}
          {exportJobs.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Recent Bulk Exports</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {exportJobs.slice(0, 3).map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-2 border rounded text-sm">
                    <div className="flex items-center space-x-2">
                      {getFormatIcon(job.format)}
                      <span>{job.project_ids.length} projects</span>
                      {getStatusBadge(job.status)}
                    </div>
                    <span className="text-muted-foreground">
                      {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Export Progress */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Exporting {selectedProjects.length} projects...</span>
                <span>{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} />
              <p className="text-xs text-muted-foreground">
                This may take a few minutes. You can close this dialog and check the progress in the Export tab.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedProjects.length} projects selected
          </div>
          
          <div className="space-x-2">
            <Button variant="outline" onClick={handleClose} disabled={isExporting}>
              Cancel
            </Button>
            
            <Button 
              onClick={handleExport}
              disabled={selectedProjects.length === 0 || isExporting}
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4 mr-2" />
                  Export {selectedProjects.length} Projects
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
