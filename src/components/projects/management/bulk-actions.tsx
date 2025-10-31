'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  MoreVertical,
  Move,
  Tag,
  Share,
  Archive,
  Trash2,
  Download,
  Copy,
  Star,
  StarOff,
  Users,
  FileText,
  CheckCircle2,
  AlertTriangle,
  X,
  ChevronDown,
  Mail,
  Link
} from 'lucide-react';

interface BulkActionsProps {
  selectedCount: number;
  onAction: (action: string, data?: any) => void;
  onClose: () => void;
  className?: string;
}

const bulkActions = [
  {
    id: 'move',
    label: 'Move to Folder',
    icon: Move,
    description: 'Move selected projects to a different folder',
    requiresConfirmation: false
  },
  {
    id: 'tag',
    label: 'Add Tags',
    icon: Tag,
    description: 'Add or remove tags from selected projects',
    requiresConfirmation: false
  },
  {
    id: 'star',
    label: 'Star/Unstar',
    icon: Star,
    description: 'Star or unstar selected projects',
    requiresConfirmation: false
  },
  {
    id: 'status',
    label: 'Change Status',
    icon: CheckCircle2,
    description: 'Update the status of selected projects',
    requiresConfirmation: false
  },
  {
    id: 'share',
    label: 'Share',
    icon: Share,
    description: 'Share selected projects with team members',
    requiresConfirmation: false
  },
  {
    id: 'assign',
    label: 'Assign Users',
    icon: Users,
    description: 'Assign users to selected projects',
    requiresConfirmation: false
  },
  {
    id: 'archive',
    label: 'Archive',
    icon: Archive,
    description: 'Archive selected projects',
    requiresConfirmation: true
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: Trash2,
    description: 'Permanently delete selected projects',
    requiresConfirmation: true
  }
];

const statusOptions = [
  { value: 'active', label: 'Active', color: 'text-green-600' },
  { value: 'paused', label: 'Paused', color: 'text-yellow-600' },
  { value: 'completed', label: 'Completed', color: 'text-blue-600' },
  { value: 'archived', label: 'Archived', color: 'text-gray-600' }
];

export function BulkActions({
  selectedCount,
  onAction,
  onClose,
  className
}: BulkActionsProps) {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [actionData, setActionData] = useState<any>({});

  const handleAction = async (actionId: string, data?: any) => {
    if (bulkActions.find(action => action.id === actionId)?.requiresConfirmation && !data?.confirmed) {
      setActiveAction(actionId);
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    // Simulate processing with progress updates
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setProgress((i / steps) * 100);
    }

    onAction(actionId, data || actionData);
    setIsProcessing(false);
    setActiveAction(null);
    setActionData({});
    setProgress(0);
  };

  const handleConfirmAction = () => {
    handleAction(activeAction!, { confirmed: true, ...actionData });
  };

  const renderActionDialog = () => {
    switch (activeAction) {
      case 'move':
        return (
          <MoveDialog
            onConfirm={(folderId) => handleAction('move', { folderId })}
            onCancel={() => setActiveAction(null)}
          />
        );

      case 'tag':
        return (
          <TagDialog
            onConfirm={(tags, action) => handleAction('tag', { tags, action })}
            onCancel={() => setActiveAction(null)}
          />
        );

      case 'status':
        return (
          <StatusDialog
            onConfirm={(status) => handleAction('status', { status })}
            onCancel={() => setActiveAction(null)}
          />
        );

      case 'share':
        return (
          <ShareDialog
            onConfirm={(emails, message) => handleAction('share', { emails, message })}
            onCancel={() => setActiveAction(null)}
          />
        );

      case 'assign':
        return (
          <AssignDialog
            onConfirm={(userIds) => handleAction('assign', { userIds })}
            onCancel={() => setActiveAction(null)}
          />
        );

      case 'archive':
        return (
          <ConfirmDialog
            title="Archive Projects"
            description={`Are you sure you want to archive ${selectedCount} project(s)? This action can be reversed.`}
            confirmLabel="Archive"
            confirmVariant="secondary"
            onConfirm={handleConfirmAction}
            onCancel={() => setActiveAction(null)}
          />
        );

      case 'delete':
        return (
          <ConfirmDialog
            title="Delete Projects"
            description={`Are you sure you want to permanently delete ${selectedCount} project(s)? This action cannot be undone.`}
            confirmLabel="Delete"
            confirmVariant="destructive"
            onConfirm={handleConfirmAction}
            onCancel={() => setActiveAction(null)}
          />
        );

      default:
        return null;
    }
  };

  if (isProcessing) {
    return (
      <Card className={cn("p-4", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-medium">
              Processing {selectedCount} project(s)...
            </span>
          </div>
          <div className="flex items-center gap-2 w-32">
            <Progress value={progress} className="flex-1" />
            <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className={cn("p-4", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {selectedCount} selected
            </Badge>
            <span className="text-sm text-muted-foreground">Bulk actions:</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Quick Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction('star')}
                disabled={isProcessing}
              >
                <Star className="h-4 w-4 mr-1" />
                Star
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction('status')}
                disabled={isProcessing}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Status
              </Button>
            </div>

            {/* More Actions Dropdown */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" disabled={isProcessing}>
                  <MoreVertical className="h-4 w-4 mr-1" />
                  More
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-96">
                <DialogHeader>
                  <DialogTitle>Bulk Actions</DialogTitle>
                  <DialogDescription>
                    Choose an action to apply to {selectedCount} selected project(s).
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-2">
                  {bulkActions.map((action) => {
                    const IconComponent = action.icon;
                    return (
                      <Button
                        key={action.id}
                        variant="ghost"
                        className="justify-start h-auto p-3"
                        onClick={() => setActiveAction(action.id)}
                      >
                        <IconComponent className="h-4 w-4 mr-3" />
                        <div className="flex-1 text-left">
                          <div className="font-medium">{action.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {action.description}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Action Dialogs */}
      {renderActionDialog()}
    </>
  );
}

// Dialog Components

function MoveDialog({
  onConfirm,
  onCancel
}: {
  onConfirm: (folderId: string) => void;
  onCancel: () => void;
}) {
  const [selectedFolder, setSelectedFolder] = useState('');

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move Projects to Folder</DialogTitle>
          <DialogDescription>
            Select a folder to move the selected projects to.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="folder">Destination Folder</Label>
            <Select value={selectedFolder} onValueChange={setSelectedFolder}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root">Root</SelectItem>
                <SelectItem value="completed">Completed Projects</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="work">Work</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={() => onConfirm(selectedFolder)}
            disabled={!selectedFolder}
          >
            Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TagDialog({
  onConfirm,
  onCancel
}: {
  onConfirm: (tags: string[], action: 'add' | 'remove') => void;
  onCancel: () => void;
}) {
  const [action, setAction] = useState<'add' | 'remove'>('add');
  const [tags, setTags] = useState('');

  const handleConfirm = () => {
    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
    onConfirm(tagList, action);
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
          <DialogDescription>
            {action === 'add' ? 'Add' : 'Remove'} tags from the selected projects.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Action</Label>
            <Select value={action} onValueChange={(value: 'add' | 'remove') => setAction(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">Add Tags</SelectItem>
                <SelectItem value="remove">Remove Tags</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="Enter tags separated by commas"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            {action === 'add' ? 'Add Tags' : 'Remove Tags'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatusDialog({
  onConfirm,
  onCancel
}: {
  onConfirm: (status: string) => void;
  onCancel: () => void;
}) {
  const [selectedStatus, setSelectedStatus] = useState('');

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Project Status</DialogTitle>
          <DialogDescription>
            Update the status of the selected projects.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="status">New Status</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a status" />
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={() => onConfirm(selectedStatus)}
            disabled={!selectedStatus}
          >
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ShareDialog({
  onConfirm,
  onCancel
}: {
  onConfirm: (emails: string[], message: string) => void;
  onCancel: () => void;
}) {
  const [emails, setEmails] = useState('');
  const [message, setMessage] = useState('');

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Projects</DialogTitle>
          <DialogDescription>
            Share the selected projects with team members.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="emails">Email Addresses</Label>
            <Input
              id="emails"
              placeholder="Enter email addresses separated by commas"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a message for the recipients"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={() => {
            const emailList = emails.split(',').map(e => e.trim()).filter(Boolean);
            onConfirm(emailList, message);
          }}>
            Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AssignDialog({
  onConfirm,
  onCancel
}: {
  onConfirm: (userIds: string[]) => void;
  onCancel: () => void;
}) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Mock user data - replace with actual API call
  const users = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com' }
  ];

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Users</DialogTitle>
          <DialogDescription>
            Assign users to the selected projects.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {users.map((user) => (
              <div key={user.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`user-${user.id}`}
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedUsers(prev => [...prev, user.id]);
                    } else {
                      setSelectedUsers(prev => prev.filter(id => id !== user.id));
                    }
                  }}
                />
                <div>
                  <label htmlFor={`user-${user.id}`} className="text-sm font-medium cursor-pointer">
                    {user.name}
                  </label>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={() => onConfirm(selectedUsers)}
            disabled={selectedUsers.length === 0}
          >
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  confirmVariant,
  onConfirm,
  onCancel
}: {
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant?: 'default' | 'destructive';
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant={confirmVariant || 'default'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
