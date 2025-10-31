'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  CheckCircle2,
  Star,
  StarOff,
  Edit,
  Share,
  Archive,
  Trash2,
  Copy,
  Download,
  Eye,
  Clock,
  Users,
  FolderOpen,
  MoreHorizontal,
  AlertTriangle,
  PauseCircle,
  Play,
  CheckSquare,
  Square,
  Calendar,
  Tag,
  MessageSquare,
  Settings,
  Filter,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  RefreshCw,
  ExternalLink,
  X
} from 'lucide-react';

interface QuickActionsProps {
  projectId: string;
  onClose: () => void;
  onAction: (action: string, data?: any) => void;
  className?: string;
}

const quickActions = [
  {
    id: 'view',
    label: 'View Details',
    icon: Eye,
    description: 'Open project details'
  },
  {
    id: 'edit',
    label: 'Edit',
    icon: Edit,
    description: 'Edit project details'
  },
  {
    id: 'star',
    label: 'Star/Unstar',
    icon: Star,
    description: 'Add to favorites'
  },
  {
    id: 'status',
    label: 'Change Status',
    icon: CheckCircle2,
    description: 'Update project status',
    submenu: [
      { id: 'active', label: 'Active', icon: Play },
      { id: 'paused', label: 'Paused', icon: PauseCircle },
      { id: 'completed', label: 'Completed', icon: CheckSquare },
      { id: 'archived', label: 'Archived', icon: Archive }
    ]
  },
  {
    id: 'share',
    label: 'Share',
    icon: Share,
    description: 'Share with team members'
  },
  {
    id: 'assign',
    label: 'Assign',
    icon: Users,
    description: 'Assign team members'
  },
  {
    id: 'move',
    label: 'Move to Folder',
    icon: FolderOpen,
    description: 'Move to different folder'
  },
  {
    id: 'duplicate',
    label: 'Duplicate',
    icon: Copy,
    description: 'Create a copy'
  },
  {
    id: 'export',
    label: 'Export',
    icon: Download,
    description: 'Export project data'
  },
  {
    id: 'archive',
    label: 'Archive',
    icon: Archive,
    description: 'Archive project'
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: Trash2,
    description: 'Delete permanently',
    variant: 'destructive' as const
  }
];

const statusActions = [
  { id: 'active', label: 'Mark Active', icon: Play, color: 'text-green-600' },
  { id: 'paused', label: 'Pause', icon: PauseCircle, color: 'text-yellow-600' },
  { id: 'completed', label: 'Mark Complete', icon: CheckSquare, color: 'text-blue-600' },
  { id: 'archived', label: 'Archive', icon: Archive, color: 'text-gray-600' }
];

const viewActions = [
  { id: 'grid', label: 'Grid View', icon: Grid3X3 },
  { id: 'list', label: 'List View', icon: List },
  { id: 'sort-name', label: 'Sort by Name', icon: SortAsc },
  { id: 'sort-date', label: 'Sort by Date', icon: SortDesc },
  { id: 'sort-priority', label: 'Sort by Priority', icon: SortDesc }
];

export function QuickActions({
  projectId,
  onClose,
  onAction,
  className
}: QuickActionsProps) {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  const handleActionClick = (actionId: string, data?: any) => {
    onAction(actionId, { projectId, ...data });
    onClose();
  };

  const handleSubmenuAction = (submenuId: string, actionId: string) => {
    onAction(actionId, { projectId, submenuId });
    onClose();
    setActiveSubmenu(null);
  };

  const renderSubmenu = (submenuId: string, items: any[]) => {
    return (
      <div className="absolute left-full top-0 ml-1 bg-popover border rounded-md shadow-lg z-50 min-w-[200px]">
        <div className="p-1">
          {items.map((item) => {
            const IconComponent = item.icon;
            return (
              <Button
                key={item.id}
                variant="ghost"
                className="w-full justify-start h-auto py-2 px-2"
                onClick={() => handleSubmenuAction(submenuId, item.id)}
              >
                <IconComponent className={cn("h-4 w-4 mr-2", item.color)} />
                <span className="text-sm">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Popover open={true} onOpenChange={onClose}>
      <PopoverTrigger asChild>
        <div className={cn("fixed inset-0 bg-transparent", className)} />
      </PopoverTrigger>
      <PopoverContent 
        className="w-64 p-0" 
        align="end"
        side="right"
      >
        <div className="p-2 border-b">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Quick Actions</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="py-2 max-h-96 overflow-y-auto">
          {/* Primary Actions */}
          <div className="space-y-1">
            {quickActions.slice(0, 4).map((action) => {
              const IconComponent = action.icon;
              const hasSubmenu = action.submenu;
              
              return (
                <div key={action.id} className="relative">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-auto py-2 px-2",
                      action.variant === 'destructive' && "text-red-600 hover:text-red-700 hover:bg-red-50"
                    )}
                    onClick={() => {
                      if (hasSubmenu) {
                        setActiveSubmenu(action.id);
                      } else {
                        handleActionClick(action.id);
                      }
                    }}
                  >
                    <IconComponent className={cn(
                      "h-4 w-4 mr-2",
                      action.variant === 'destructive' ? 'text-red-600' : 'text-muted-foreground'
                    )} />
                    <div className="flex-1 text-left">
                      <div className="text-sm">{action.label}</div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </div>
                    {hasSubmenu && (
                      <div className="ml-auto">
                        <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )}
                  </Button>
                  
                  {/* Submenu */}
                  {hasSubmenu && activeSubmenu === action.id && renderSubmenu(action.id, action.submenu)}
                </div>
              );
            })}
          </div>

          <div className="my-2 border-t" />

          {/* Secondary Actions */}
          <div className="space-y-1">
            {quickActions.slice(4).map((action) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-auto py-2 px-2",
                    action.variant === 'destructive' && "text-red-600 hover:text-red-700 hover:bg-red-50"
                  )}
                  onClick={() => handleActionClick(action.id)}
                >
                  <IconComponent className={cn(
                    "h-4 w-4 mr-2",
                    action.variant === 'destructive' ? 'text-red-600' : 'text-muted-foreground'
                  )} />
                  <div className="flex-1 text-left">
                    <div className="text-sm">{action.label}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Context Menu for project items
interface ContextMenuProps {
  projectId: string;
  onClose: () => void;
  onAction: (action: string, data?: any) => void;
  className?: string;
}

export function ProjectContextMenu({
  projectId,
  onClose,
  onAction,
  className
}: ContextMenuProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleAction = (actionId: string) => {
    onAction(actionId, { projectId });
    onClose();
  };

  const actionGroups = [
    {
      title: 'Project Actions',
      actions: [
        { id: 'view', label: 'View Details', icon: Eye },
        { id: 'edit', label: 'Edit', icon: Edit },
        { id: 'duplicate', label: 'Duplicate', icon: Copy }
      ]
    },
    {
      title: 'Status',
      actions: statusActions.map(action => ({
        ...action,
        id: action.id
      }))
    },
    {
      title: 'Team',
      actions: [
        { id: 'assign', label: 'Assign Users', icon: Users },
        { id: 'share', label: 'Share', icon: Share },
        { id: 'notify', label: 'Send Notification', icon: MessageSquare }
      ]
    },
    {
      title: 'Organization',
      actions: [
        { id: 'move', label: 'Move to Folder', icon: FolderOpen },
        { id: 'star', label: 'Star', icon: Star },
        { id: 'export', label: 'Export', icon: Download }
      ]
    },
    {
      title: 'Danger Zone',
      actions: [
        { id: 'archive', label: 'Archive', icon: Archive },
        { id: 'delete', label: 'Delete', icon: Trash2 }
      ]
    }
  ];

  return (
    <Popover open={true} onOpenChange={onClose}>
      <PopoverTrigger asChild>
        <div className={cn("fixed inset-0 bg-transparent", className)} />
      </PopoverTrigger>
      <PopoverContent 
        className="w-64 p-0" 
        align="start"
      >
        <div className="p-2 border-b">
          <span className="text-sm font-medium">Project Actions</span>
        </div>

        <div className="py-2 max-h-96 overflow-y-auto">
          {actionGroups.map((group, groupIndex) => (
            <div key={group.title}>
              {groupIndex > 0 && <div className="my-2 border-t" />}
              <div className="px-2 py-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {group.title}
                </span>
              </div>
              <div className="space-y-1">
                {group.actions.map((action) => {
                  const IconComponent = action.icon;
                  const isDestructive = group.title === 'Danger Zone';
                  
                  return (
                    <Button
                      key={action.id}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start h-auto py-2 px-2 text-sm",
                        isDestructive && "text-red-600 hover:text-red-700 hover:bg-red-50"
                      )}
                      onClick={() => handleAction(action.id)}
                    >
                      <IconComponent className={cn(
                        "h-4 w-4 mr-2",
                        isDestructive ? 'text-red-600' : 'text-muted-foreground'
                      )} />
                      <span>{action.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-2 border-t bg-muted/30">
          <Button
            variant="ghost"
            className="w-full justify-start text-xs"
            onClick={() => handleAction('settings')}
          >
            <Settings className="h-3 w-3 mr-2" />
            Project Settings
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Floating Action Button for Quick Actions
interface FloatingActionButtonProps {
  onAction: (action: string) => void;
  onClose: () => void;
  className?: string;
}

export function FloatingActionButton({
  onAction,
  onClose,
  className
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { id: 'create-project', label: 'New Project', icon: Plus },
    { id: 'import-project', label: 'Import', icon: Download },
    { id: 'template', label: 'From Template', icon: Copy },
    { id: 'folder', label: 'New Folder', icon: FolderOpen }
  ];

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      {/* Action Buttons */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 space-y-2">
          {actions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={action.id}
                variant="secondary"
                className="shadow-lg"
                onClick={() => {
                  onAction(action.id);
                  setIsOpen(false);
                  onClose();
                }}
                style={{
                  transform: `translateY(${(actions.length - index - 1) * -60}px)`,
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <IconComponent className="h-4 w-4 mr-2" />
                {action.label}
              </Button>
            );
          })}
        </div>
      )}

      {/* Main Button */}
      <Button
        size="lg"
        className="h-14 w-14 rounded-full shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MoreHorizontal className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}
