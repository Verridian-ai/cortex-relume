import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause,
  XCircle,
  CheckCircle,
  Calendar,
  Database,
  Settings
} from 'lucide-react';
import { ProjectBackupManager, BackupSchedule } from '@/lib/projects/backup';
import { getScheduleDescription, getFormatDescription } from '@/lib/projects/backup';

interface BackupScheduleManagerProps {
  projectId?: string;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onScheduleUpdate?: () => void;
}

interface ScheduleFormData {
  name: string;
  description: string;
  schedule: 'daily' | 'weekly' | 'monthly';
  format: 'json' | 'zip' | 'csv' | 'pdf';
  time: string;
  day_of_week?: number;
  day_of_month?: number;
  timezone: string;
  retention_count: number;
  enabled: boolean;
  is_cloud_backup: boolean;
  cloud_config?: Record<string, any>;
}

export function BackupScheduleManager({ 
  projectId, 
  userId, 
  isOpen, 
  onClose, 
  onScheduleUpdate 
}: BackupScheduleManagerProps) {
  const [schedules, setSchedules] = useState<BackupSchedule[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<BackupSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ScheduleFormData>({
    name: '',
    description: '',
    schedule: 'daily',
    format: 'json',
    time: '02:00',
    timezone: 'UTC',
    retention_count: 7,
    enabled: true,
    is_cloud_backup: false
  });

  const backupManager = new ProjectBackupManager(userId);

  useEffect(() => {
    if (isOpen) {
      loadSchedules();
    }
  }, [isOpen, projectId]);

  const loadSchedules = async () => {
    try {
      setIsLoading(true);
      const data = await backupManager.getSchedules(projectId);
      setSchedules(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schedules');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSchedule = () => {
    setEditingSchedule(null);
    setFormData({
      name: '',
      description: '',
      schedule: 'daily',
      format: 'json',
      time: '02:00',
      timezone: 'UTC',
      retention_count: 7,
      enabled: true,
      is_cloud_backup: false
    });
    setIsFormOpen(true);
  };

  const handleEditSchedule = (schedule: BackupSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      name: schedule.name,
      description: schedule.description || '',
      schedule: schedule.schedule,
      format: schedule.format,
      time: schedule.time,
      day_of_week: schedule.day_of_week,
      day_of_month: schedule.day_of_month,
      timezone: schedule.timezone,
      retention_count: schedule.retention_count,
      enabled: schedule.enabled,
      is_cloud_backup: schedule.is_cloud_backup,
      cloud_config: schedule.cloud_config
    });
    setIsFormOpen(true);
  };

  const handleSaveSchedule = async () => {
    try {
      setError(null);

      const scheduleData = {
        ...formData,
        user_id: userId,
        project_id: projectId
      };

      if (editingSchedule) {
        await backupManager.updateSchedule(editingSchedule.id!, scheduleData);
      } else {
        await backupManager.createSchedule(scheduleData);
      }

      setIsFormOpen(false);
      await loadSchedules();
      onScheduleUpdate?.();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save schedule');
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this backup schedule?')) {
      return;
    }

    try {
      await backupManager.deleteSchedule(scheduleId);
      await loadSchedules();
      onScheduleUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete schedule');
    }
  };

  const handleToggleSchedule = async (schedule: BackupSchedule) => {
    try {
      await backupManager.updateSchedule(schedule.id!, {
        enabled: !schedule.enabled
      });
      await loadSchedules();
      onScheduleUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle schedule');
    }
  };

  const getScheduleIcon = (schedule: string) => {
    switch (schedule) {
      case 'daily':
        return <Clock className="h-4 w-4" />;
      case 'weekly':
        return <Calendar className="h-4 w-4" />;
      case 'monthly':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'json':
        return <Database className="h-4 w-4 text-blue-500" />;
      case 'zip':
        return <Database className="h-4 w-4 text-green-500" />;
      case 'csv':
        return <Database className="h-4 w-4 text-orange-500" />;
      case 'pdf':
        return <Database className="h-4 w-4 text-red-500" />;
      default:
        return <Database className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (schedule: BackupSchedule) => {
    const now = new Date();
    const nextRun = schedule.next_run ? new Date(schedule.next_run) : null;
    const isOverdue = nextRun && nextRun < now;

    if (!schedule.enabled) {
      return <Badge variant="outline">Disabled</Badge>;
    }

    if (isOverdue) {
      return <Badge variant="destructive">Overdue</Badge>;
    }

    return <Badge variant="default">Active</Badge>;
  };

  const formatNextRun = (nextRun?: string) => {
    if (!nextRun) return 'Not scheduled';
    
    const date = new Date(nextRun);
    const now = new Date();
    const diffInMs = date.getTime() - now.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Tomorrow';
    if (diffInDays > 0) return `In ${diffInDays} days`;
    
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Backup Schedules</DialogTitle>
            <DialogDescription>
              {projectId 
                ? 'Manage automated backup schedules for this project'
                : 'Manage backup schedules across all your projects'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-muted-foreground">
                  {schedules.length} schedule{schedules.length !== 1 ? 's' : ''} configured
                </div>
                <div className="text-sm text-muted-foreground">
                  {schedules.filter(s => s.enabled).length} active
                </div>
              </div>
              <Button onClick={handleCreateSchedule}>
                <Plus className="h-4 w-4 mr-2" />
                New Schedule
              </Button>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Schedules List */}
            {isLoading ? (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Loading schedules...</p>
              </div>
            ) : schedules.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No backup schedules configured</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Create automated backups to protect your data
                  </p>
                  <Button 
                    onClick={handleCreateSchedule}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Schedule
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {schedules.map((schedule) => (
                  <Card key={schedule.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-muted rounded-lg">
                            {getScheduleIcon(schedule.schedule)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold">{schedule.name}</h3>
                              {getStatusBadge(schedule)}
                            </div>
                            
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div className="flex items-center space-x-4">
                                <span>{getScheduleDescription(schedule.schedule)}</span>
                                <span>•</span>
                                <span>{getFormatDescription(schedule.format)}</span>
                              </div>
                              
                              <div className="flex items-center space-x-4">
                                <span>Time: {schedule.time} {schedule.timezone}</span>
                                {schedule.schedule === 'weekly' && schedule.day_of_week !== undefined && (
                                  <>
                                    <span>•</span>
                                    <span>Day: {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][schedule.day_of_week]}</span>
                                  </>
                                )}
                                {schedule.schedule === 'monthly' && schedule.day_of_month && (
                                  <>
                                    <span>•</span>
                                    <span>Day {schedule.day_of_month} of month</span>
                                  </>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-4">
                                <span>Keep {schedule.retention_count} backups</span>
                                <span>•</span>
                                <span>Next run: {formatNextRun(schedule.next_run)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleSchedule(schedule)}
                          >
                            {schedule.enabled ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditSchedule(schedule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSchedule(schedule.id!)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {schedule.description && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-muted-foreground">{schedule.description}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Quick Stats */}
            {schedules.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">{schedules.length}</div>
                    <div className="text-sm text-muted-foreground">Total Schedules</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {schedules.filter(s => s.enabled).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Active</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {schedules.filter(s => s.schedule === 'daily').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Daily</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {schedules.filter(s => s.schedule === 'weekly').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Weekly</div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? 'Edit Backup Schedule' : 'New Backup Schedule'}
            </DialogTitle>
            <DialogDescription>
              Configure automated backup schedule for your project
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Schedule Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Daily Project Backup"
                />
              </div>
              
              <div>
                <Label htmlFor="format">Backup Format</Label>
                <Select 
                  value={formData.format} 
                  onValueChange={(value) => setFormData({ ...formData, format: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="zip">ZIP Archive</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="pdf">PDF Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this backup schedule"
              />
            </div>

            {/* Schedule Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="schedule">Frequency</Label>
                <Select 
                  value={formData.schedule} 
                  onValueChange={(value) => setFormData({ ...formData, schedule: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="retention">Retention (backups to keep)</Label>
                <Input
                  id="retention"
                  type="number"
                  min="1"
                  max="365"
                  value={formData.retention_count}
                  onChange={(e) => setFormData({ ...formData, retention_count: parseInt(e.target.value) })}
                />
              </div>
            </div>

            {/* Day Configuration */}
            {formData.schedule === 'weekly' && (
              <div>
                <Label>Day of Week</Label>
                <Select 
                  value={formData.day_of_week?.toString() || '0'} 
                  onValueChange={(value) => setFormData({ ...formData, day_of_week: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sunday</SelectItem>
                    <SelectItem value="1">Monday</SelectItem>
                    <SelectItem value="2">Tuesday</SelectItem>
                    <SelectItem value="3">Wednesday</SelectItem>
                    <SelectItem value="4">Thursday</SelectItem>
                    <SelectItem value="5">Friday</SelectItem>
                    <SelectItem value="6">Saturday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.schedule === 'monthly' && (
              <div>
                <Label htmlFor="day_of_month">Day of Month</Label>
                <Select 
                  value={formData.day_of_month?.toString() || '1'} 
                  onValueChange={(value) => setFormData({ ...formData, day_of_month: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                    <SelectItem value="29">29</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="31">31</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Options */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enabled"
                  checked={formData.enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, enabled: !!checked })}
                />
                <Label htmlFor="enabled">Enable this schedule</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cloud_backup"
                  checked={formData.is_cloud_backup}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_cloud_backup: !!checked })}
                />
                <Label htmlFor="cloud_backup">Store in cloud backup</Label>
              </div>
            </div>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Schedule Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <strong>Name:</strong> {formData.name || 'Unnamed Schedule'}
                </div>
                <div className="text-sm">
                  <strong>Frequency:</strong> {formData.schedule.charAt(0).toUpperCase() + formData.schedule.slice(1)} at {formData.time}
                </div>
                <div className="text-sm">
                  <strong>Format:</strong> {formData.format.toUpperCase()}
                </div>
                <div className="text-sm">
                  <strong>Retention:</strong> Keep {formData.retention_count} backup{formData.retention_count !== 1 ? 's' : ''}
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveSchedule}
              disabled={!formData.name || !formData.schedule}
            >
              {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
