'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MoreVertical, 
  Star, 
  StarOff,
  Clock,
  Users,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  PauseCircle,
  Archive,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Project, Column } from './project-grid';

interface ProjectListProps {
  projects: Project[];
  columns: Column[];
  selectedProjects: Set<string>;
  onProjectSelect: (projectId: string, selected: boolean) => void;
  onSelectAll: () => void;
  onSort: (columnKey: keyof Project | string) => void;
  sortBy: keyof Project | string;
  sortOrder: 'asc' | 'desc';
  onProjectUpdate: (project: Project) => void;
  onProjectDelete: (projectId: string) => void;
  onProjectMove: (projectId: string, newFolderId: string) => void;
  onProjectClick: (project: Project) => void;
  onQuickActionsClick: (projectId: string) => void;
  className?: string;
}

const statusConfig = {
  active: { label: 'Active', color: 'bg-green-500', icon: CheckCircle2 },
  paused: { label: 'Paused', color: 'bg-yellow-500', icon: PauseCircle },
  completed: { label: 'Completed', color: 'bg-blue-500', icon: CheckCircle2 },
  archived: { label: 'Archived', color: 'bg-gray-500', icon: Archive }
};

const priorityConfig = {
  low: { label: 'Low', color: 'bg-gray-500' },
  medium: { label: 'Medium', color: 'bg-blue-500' },
  high: { label: 'High', color: 'bg-orange-500' },
  critical: { label: 'Critical', color: 'bg-red-500' }
};

const healthConfig = {
  healthy: { color: 'text-green-600', icon: CheckCircle2 },
  warning: { color: 'text-yellow-600', icon: AlertTriangle },
  atRisk: { color: 'text-orange-600', icon: AlertTriangle },
  critical: { color: 'text-red-600', icon: XCircle }
};

export function ProjectList({
  projects,
  columns,
  selectedProjects,
  onProjectSelect,
  onSelectAll,
  onSort,
  sortBy,
  sortOrder,
  onProjectUpdate,
  onProjectDelete,
  onProjectMove,
  onProjectClick,
  onQuickActionsClick,
  className
}: ProjectListProps) {
  const allSelected = projects.length > 0 && selectedProjects.size === projects.length;
  const someSelected = selectedProjects.size > 0 && selectedProjects.size < projects.length;

  const getSortIcon = (columnKey: keyof Project | string) => {
    if (sortBy !== columnKey) return ArrowUpDown;
    return sortOrder === 'asc' ? ArrowUp : ArrowDown;
  };

  const renderCellValue = (project: Project, column: Column) => {
    const value = project[column.key as keyof Project];
    
    switch (column.key) {
      case 'name':
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={async (e) => {
                e.stopPropagation();
                onProjectUpdate({
                  ...project,
                  isStarred: !project.isStarred
                });
              }}
            >
              {project.isStarred ? (
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              ) : (
                <StarOff className="h-3 w-3 text-muted-foreground" />
              )}
            </Button>
            <div className="min-w-0">
              <div className="font-medium text-sm truncate">{project.name}</div>
              {project.description && (
                <div className="text-xs text-muted-foreground truncate">
                  {project.description}
                </div>
              )}
            </div>
          </div>
        );

      case 'status':
        const statusInfo = statusConfig[project.status];
        const StatusIcon = statusInfo.icon;
        return (
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", statusInfo.color)} />
            <StatusIcon className="h-3 w-3" />
            <span className="text-sm">{statusInfo.label}</span>
          </div>
        );

      case 'priority':
        const priorityInfo = priorityConfig[project.priority];
        return (
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", priorityInfo.color)} />
            <span className="text-sm">{priorityInfo.label}</span>
          </div>
        );

      case 'progress':
        return (
          <div className="flex items-center gap-2 min-w-0">
            <Progress value={project.progress} className="h-1 flex-1" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {project.progress}%
            </span>
          </div>
        );

      case 'assignee':
        return project.assignee ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium">
                {project.assignee.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm truncate">{project.assignee.name}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Unassigned</span>
        );

      case 'dueDate':
        const isOverdue = project.dueDate < new Date() && project.status !== 'completed';
        return (
          <div className={cn(
            "text-sm",
            isOverdue && "text-red-600 font-medium"
          )}>
            {new Intl.DateTimeFormat('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }).format(project.dueDate)}
          </div>
        );

      case 'team':
        return (
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{project.team.members}</span>
          </div>
        );

      case 'health':
        const healthInfo = healthConfig[project.health];
        const HealthIcon = healthInfo.icon;
        return (
          <div className="flex items-center gap-1">
            <HealthIcon className={cn("h-3 w-3", healthInfo.color)} />
          </div>
        );

      case 'lastActivity':
        return (
          <div className="text-sm text-muted-foreground">
            {new Intl.DateTimeFormat('en-US', {
              month: 'short',
              day: 'numeric'
            }).format(project.lastActivity)}
          </div>
        );

      case 'files':
        return (
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{project.files}</span>
          </div>
        );

      case 'comments':
        return (
          <span className="text-sm">{project.comments}</span>
        );

      default:
        return (
          <span className="text-sm">
            {typeof value === 'object' ? JSON.stringify(value) : String(value || '')}
          </span>
        );
    }
  };

  return (
    <div className={cn("border rounded-lg bg-card", className)}>
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="grid gap-4 p-4" style={{ gridTemplateColumns: `40px repeat(${columns.length}, 1fr) 40px` }}>
          {/* Selection checkbox */}
          <div className="flex items-center">
            <Checkbox
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected;
              }}
              onCheckedChange={onSelectAll}
            />
          </div>

          {/* Column headers */}
          {columns.map((column) => (
            <div key={column.key} className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 font-medium text-xs text-muted-foreground hover:text-foreground"
                onClick={() => onSort(column.key)}
                disabled={!column.sortable}
              >
                <span className="mr-1">{column.label}</span>
                {column.sortable && (
                  <div className="flex flex-col">
                    {React.createElement(getSortIcon(column.key), {
                      className: "h-3 w-3"
                    })}
                  </div>
                )}
              </Button>
            </div>
          ))}

          {/* Actions column */}
          <div />
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y">
        {projects.map((project) => (
          <div
            key={project.id}
            className="grid gap-4 p-4 hover:bg-muted/30 cursor-pointer transition-colors"
            style={{ gridTemplateColumns: `40px repeat(${columns.length}, 1fr) 40px` }}
            onClick={() => onProjectClick(project)}
          >
            {/* Selection checkbox */}
            <div className="flex items-center">
              <Checkbox
                checked={selectedProjects.has(project.id)}
                onCheckedChange={(checked) => onProjectSelect(project.id, !!checked)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Data cells */}
            {columns.map((column) => (
              <div key={column.key} className="flex items-center min-w-0">
                {renderCellValue(project, column)}
              </div>
            ))}

            {/* Actions */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickActionsClick(project.id);
                }}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          <div className="text-lg mb-2">No projects found</div>
          <div className="text-sm">Try adjusting your filters or create a new project.</div>
        </div>
      )}
    </div>
  );
}
