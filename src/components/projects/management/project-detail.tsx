'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  X,
  Star,
  StarOff,
  Edit,
  MoreVertical,
  Clock,
  Users,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  PauseCircle,
  Archive,
  BarChart3,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Share2,
  Download,
  Eye,
  Settings,
  Trash2,
  Save,
  Plus,
  Minus,
  Send
} from 'lucide-react';
import { Project } from './project-grid';
import { ProjectStats } from './project-stats';

interface ProjectDetailProps {
  project: Project;
  open: boolean;
  onClose: () => void;
  onUpdate: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onMove: (projectId: string, newFolderId: string) => void;
  mode?: 'modal' | 'sidebar';
  className?: string;
}

const statusOptions = [
  { value: 'active', label: 'Active', color: 'text-green-600', icon: CheckCircle2 },
  { value: 'paused', label: 'Paused', color: 'text-yellow-600', icon: PauseCircle },
  { value: 'completed', label: 'Completed', color: 'text-blue-600', icon: CheckCircle2 },
  { value: 'archived', label: 'Archived', color: 'text-gray-600', icon: Archive }
];

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-gray-500' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500' }
];

export function ProjectDetail({
  project,
  open,
  onClose,
  onUpdate,
  onDelete,
  onMove,
  mode = 'modal',
  className
}: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState<Project>(project);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([
    {
      id: '1',
      author: 'John Doe',
      content: 'Great progress on this project!',
      createdAt: new Date('2024-01-15'),
      avatar: 'JD'
    },
    {
      id: '2',
      author: 'Jane Smith',
      content: 'Need to review the timeline for next sprint.',
      createdAt: new Date('2024-01-14'),
      avatar: 'JS'
    }
  ]);

  const handleSave = () => {
    onUpdate(editedProject);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProject(project);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this project?')) {
      onDelete(project.id);
      onClose();
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now().toString(),
        author: 'Current User',
        content: newComment,
        createdAt: new Date(),
        avatar: 'CU'
      };
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  const getHealthIcon = (health: string) => {
    const icons = {
      healthy: CheckCircle2,
      warning: AlertTriangle,
      'at-risk': AlertTriangle,
      critical: XCircle
    };
    return icons[health as keyof typeof icons] || CheckCircle2;
  };

  const statusInfo = statusOptions.find(s => s.value === project.status);
  const priorityInfo = priorityOptions.find(p => p.value === project.priority);
  const HealthIcon = getHealthIcon(project.health);

  const DetailContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between p-6 border-b">
        <div className="flex items-start gap-4 flex-1">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onUpdate({ ...project, isStarred: !project.isStarred })}
              >
                {project.isStarred ? (
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ) : (
                  <StarOff className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
              
              <h2 className="text-xl font-semibold truncate">
                {isEditing ? (
                  <Input
                    value={editedProject.name}
                    onChange={(e) => setEditedProject(prev => ({ ...prev, name: e.target.value }))}
                    className="text-lg h-auto"
                  />
                ) : (
                  project.name
                )}
              </h2>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn("text-xs", statusInfo?.color)}>
                  {statusInfo?.label}
                </Badge>
                <div className={cn("w-2 h-2 rounded-full", priorityInfo?.color)} />
              </div>
            </div>

            {isEditing ? (
              <Textarea
                value={editedProject.description}
                onChange={(e) => setEditedProject(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Project description..."
                className="text-sm"
                rows={2}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {project.description || 'No description provided'}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <Button variant="ghost" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <X className="h-4 w-4" />
            ) : (
              <Edit className="h-4 w-4" />
            )}
          </Button>

          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4 mx-6 mt-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="overview" className="h-full m-0 p-6">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-6">
                  {/* Progress Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Progress</h3>
                      <span className="text-sm text-muted-foreground">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Timeline</span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Start Date</div>
                        <div className="text-sm">{formatDate(project.startDate)}</div>
                        <div className="text-xs text-muted-foreground mt-2">Due Date</div>
                        <div className="text-sm">{formatDate(project.dueDate)}</div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Team</span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Size</div>
                        <div className="text-sm">{project.team.members} members</div>
                        <div className="text-xs text-muted-foreground mt-2">Assignee</div>
                        <div className="text-sm">
                          {project.assignee?.name || 'Unassigned'}
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Files & Activity</span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Files</div>
                        <div className="text-sm">{project.files}</div>
                        <div className="text-xs text-muted-foreground mt-2">Comments</div>
                        <div className="text-sm">{project.comments}</div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Health</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <HealthIcon className={cn("h-4 w-4", 
                            project.health === 'healthy' ? 'text-green-600' :
                            project.health === 'warning' ? 'text-yellow-600' :
                            project.health === 'critical' ? 'text-red-600' : 'text-orange-600'
                          )} />
                          <span className="text-sm capitalize">{project.health.replace('-', ' ')}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">Last Activity</div>
                        <div className="text-sm">{formatDate(project.lastActivity)}</div>
                      </div>
                    </Card>
                  </div>

                  {/* Tags */}
                  {(isEditing ? editedProject.tags : project.tags).length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {(isEditing ? editedProject.tags : project.tags).map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                            {isEditing && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 ml-1"
                                onClick={() => {
                                  const newTags = editedProject.tags.filter((_, i) => i !== index);
                                  setEditedProject(prev => ({ ...prev, tags: newTags }));
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </Badge>
                        ))}
                        {isEditing && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newTag = prompt('Enter tag name:');
                              if (newTag) {
                                setEditedProject(prev => ({
                                  ...prev,
                                  tags: [...prev.tags, newTag]
                                }));
                              }
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Tag
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Budget */}
                  {project.budget && (
                    <div>
                      <h3 className="font-medium mb-2">Budget</h3>
                      <Card className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Spent</span>
                          <span className="text-sm font-medium">
                            {project.budget.currency} {project.budget.spent.toLocaleString()}
                          </span>
                        </div>
                        <Progress 
                          value={(project.budget.spent / project.budget.allocated) * 100} 
                          className="h-2 mb-2"
                        />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>0</span>
                          <span>
                            of {project.budget.currency} {project.budget.allocated.toLocaleString()}
                          </span>
                        </div>
                      </Card>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="team" className="h-full m-0 p-6">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Team Members</h3>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Invite
                    </Button>
                  </div>

                  {/* Team List */}
                  <div className="space-y-2">
                    {project.assignee && (
                      <Card className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {project.assignee.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-sm">{project.assignee.name}</div>
                              <div className="text-xs text-muted-foreground">{project.assignee.email}</div>
                            </div>
                          </div>
                          <Badge variant="outline">Assignee</Badge>
                        </div>
                      </Card>
                    )}

                    {/* Additional team members would go here */}
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="activity" className="h-full m-0 p-6">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                  {/* Comment Input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment();
                        }
                      }}
                    />
                    <Button size="sm" onClick={handleAddComment}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <Card key={comment.id} className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">{comment.avatar}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{comment.author}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="settings" className="h-full m-0 p-6">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-6">
                  {/* Status Settings */}
                  <div>
                    <Label className="text-base font-medium">Status</Label>
                    <Select 
                      value={isEditing ? editedProject.status : project.status}
                      onValueChange={(value) => {
                        if (isEditing) {
                          setEditedProject(prev => ({ ...prev, status: value as Project['status'] }));
                        }
                      }}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Priority Settings */}
                  <div>
                    <Label className="text-base font-medium">Priority</Label>
                    <Select 
                      value={isEditing ? editedProject.priority : project.priority}
                      onValueChange={(value) => {
                        if (isEditing) {
                          setEditedProject(prev => ({ ...prev, priority: value as Project['priority'] }));
                        }
                      }}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Date Settings */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">Start Date</Label>
                      <Input
                        type="datetime-local"
                        value={isEditing ? 
                          new Date(editedProject.startDate).toISOString().slice(0, 16) : 
                          new Date(project.startDate).toISOString().slice(0, 16)
                        }
                        onChange={(e) => {
                          if (isEditing) {
                            setEditedProject(prev => ({ 
                              ...prev, 
                              startDate: new Date(e.target.value) 
                            }));
                          }
                        }}
                        disabled={!isEditing}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label className="text-base font-medium">Due Date</Label>
                      <Input
                        type="datetime-local"
                        value={isEditing ? 
                          new Date(editedProject.dueDate).toISOString().slice(0, 16) : 
                          new Date(project.dueDate).toISOString().slice(0, 16)
                        }
                        onChange={(e) => {
                          if (isEditing) {
                            setEditedProject(prev => ({ 
                              ...prev, 
                              dueDate: new Date(e.target.value) 
                            }));
                          }
                        }}
                        disabled={!isEditing}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Danger Zone */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-red-600">Danger Zone</h3>
                    <Button variant="destructive" size="sm" onClick={handleDelete}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Project
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end gap-2 p-6 border-t">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </Tabs>
      </div>
    </div>
  );

  if (mode === 'sidebar') {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-2xl p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>{project.name}</SheetTitle>
          </SheetHeader>
          <DetailContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{project.name}</DialogTitle>
        </DialogHeader>
        <DetailContent />
      </DialogContent>
    </Dialog>
  );
}
