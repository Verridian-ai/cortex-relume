'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  GripVertical, 
  MoreVertical, 
  Eye, 
  Edit, 
  Share, 
  Archive,
  Trash2,
  Star,
  Clock,
  Users,
  FileText,
  Calendar,
  BarChart3,
  Grid3X3,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { ProjectDetail } from './project-detail';
import { QuickActions } from './quick-actions';
import { ProjectStats } from './project-stats';
import { ProjectErrorBoundary } from './error-boundary';
import { BulkActions } from './bulk-actions';
import { ProjectCard } from './project-card';
import { ProjectList } from './project-list';
import { VirtualizedProjectGrid, VirtualizedProjectList } from './project-virtualization';
import { ProjectErrorBoundary } from './error-boundary';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  category: string;
  progress: number;
  startDate: Date;
  dueDate: Date;
  completedAt?: Date;
  assignee?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  team: {
    id: string;
    name: string;
    members: number;
  };
  budget?: {
    allocated: number;
    spent: number;
    currency: string;
  };
  health: 'healthy' | 'warning' | 'critical' | 'at-risk';
  lastActivity: Date;
  files: number;
  comments: number;
  isStarred: boolean;
  permissions: 'owner' | 'admin' | 'member' | 'viewer';
  metadata: Record<string, any>;
}

export interface Column {
  key: keyof Project | string;
  label: string;
  width?: string;
  sortable?: boolean;
  visible: boolean;
}

interface ProjectGridProps {
  projects: Project[];
  viewMode: 'grid' | 'list';
  onProjectUpdate: (project: Project) => void;
  onProjectDelete: (projectId: string) => void;
  onProjectMove: (projectId: string, newFolderId: string) => void;
  className?: string;
  isLoading?: boolean;
}

const defaultColumns: Column[] = [
  { key: 'name', label: 'Project Name', width: '300px', sortable: true, visible: true },
  { key: 'status', label: 'Status', width: '120px', sortable: true, visible: true },
  { key: 'priority', label: 'Priority', width: '100px', sortable: true, visible: true },
  { key: 'progress', label: 'Progress', width: '120px', sortable: true, visible: true },
  { key: 'assignee', label: 'Assignee', width: '150px', sortable: true, visible: true },
  { key: 'dueDate', label: 'Due Date', width: '120px', sortable: true, visible: true },
  { key: 'team', label: 'Team', width: '100px', sortable: true, visible: true },
  { key: 'health', label: 'Health', width: '100px', sortable: true, visible: true },
  { key: 'lastActivity', label: 'Last Activity', width: '140px', sortable: true, visible: false },
  { key: 'files', label: 'Files', width: '80px', sortable: true, visible: false },
  { key: 'comments', label: 'Comments', width: '80px', sortable: true, visible: false },
];

export function ProjectGrid({
  projects,
  viewMode,
  onProjectUpdate,
  onProjectDelete,
  onProjectMove,
  className,
  isLoading = false
}: ProjectGridProps) {
  const [columns, setColumns] = useState<Column[]>(defaultColumns);
  const [sortBy, setSortBy] = useState<keyof Project | string>('lastActivity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showQuickActions, setShowQuickActions] = useState<string | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      const aValue = a[sortBy as keyof Project];
      const bValue = b[sortBy as keyof Project];
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      let comparison = 0;
      if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [projects, sortBy, sortOrder]);

  const handleSort = useCallback((columnKey: keyof Project | string) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnKey);
      setSortOrder('asc');
    }
  }, [sortBy, sortOrder]);

  const handleProjectSelect = useCallback((projectId: string, selected: boolean) => {
    setSelectedProjects(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(projectId);
      } else {
        newSet.delete(projectId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedProjects.size === projects.length) {
      setSelectedProjects(new Set());
    } else {
      setSelectedProjects(new Set(projects.map(p => p.id)));
    }
  }, [projects, selectedProjects.size]);

  const handleBulkAction = useCallback((action: string, data?: any) => {
    selectedProjects.forEach(projectId => {
      // Handle bulk action for each selected project
      console.log(`Bulk action ${action} on project ${projectId}`, data);
    });
    setSelectedProjects(new Set());
    setShowBulkActions(false);
  }, [selectedProjects]);

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-2 bg-muted rounded w-full"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className={cn("space-y-4", className)}>
        {selectedProjects.size > 0 && (
          <BulkActions
            selectedCount={selectedProjects.size}
            onAction={handleBulkAction}
            onClose={() => setSelectedProjects(new Set())}
          />
        )}
        
        {sortedProjects.length > 50 ? (
          <VirtualizedProjectList
            projects={sortedProjects}
            height={600}
            columns={columns.filter(col => col.visible)}
            selectedProjects={selectedProjects}
            onProjectSelect={handleProjectSelect}
            onSelectAll={handleSelectAll}
            onSort={handleSort}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onProjectUpdate={onProjectUpdate}
            onProjectDelete={onProjectDelete}
            onProjectMove={onProjectMove}
            onProjectClick={(project) => setSelectedProject(project)}
            onQuickActionsClick={(projectId) => setShowQuickActions(projectId)}
          />
        ) : (
          <ProjectList
            projects={sortedProjects}
            columns={columns.filter(col => col.visible)}
            selectedProjects={selectedProjects}
            onProjectSelect={handleProjectSelect}
            onSelectAll={handleSelectAll}
            onSort={handleSort}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onProjectUpdate={onProjectUpdate}
            onProjectDelete={onProjectDelete}
            onProjectMove={onProjectMove}
            onProjectClick={(project) => setSelectedProject(project)}
            onQuickActionsClick={(projectId) => setShowQuickActions(projectId)}
          />
        )}

        {selectedProject && (
          <ProjectDetail
            project={selectedProject}
            open={!!selectedProject}
            onClose={() => setSelectedProject(null)}
            onUpdate={onProjectUpdate}
            onDelete={onProjectDelete}
            onMove={onProjectMove}
          />
        )}

        {showQuickActions && (
          <QuickActions
            projectId={showQuickActions}
            onClose={() => setShowQuickActions(null)}
            onAction={(action) => {
              console.log('Quick action:', action);
              setShowQuickActions(null);
            }}
          />
        )}
      </div>
    );
  }

  // Use virtualization for better performance with large lists
  const shouldUseVirtualization = sortedProjects.length > 20;

  return (
    <div className={cn("space-y-4", className)}>
        {/* Column Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const visibleColumns = columns.filter(col => col.visible);
                if (visibleColumns.length > 1) {
                  setColumns(prev => prev.map(col => 
                    col.key === 'name' ? col : { ...col, visible: false }
                  ));
                }
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              Customize Columns
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBulkActions(true)}
              disabled={selectedProjects.size === 0}
            >
              <MoreVertical className="h-4 w-4 mr-2" />
              Bulk Actions ({selectedProjects.size})
            </Button>
          </div>
        </div>

        {selectedProjects.size > 0 && (
          <BulkActions
            selectedCount={selectedProjects.size}
            onAction={handleBulkAction}
            onClose={() => setSelectedProjects(new Set())}
          />
        )}

        {/* Projects Grid */}
        {shouldUseVirtualization ? (
          <div className="h-96 border rounded-lg">
            <VirtualizedProjectGrid
              projects={sortedProjects}
              selectedProjects={selectedProjects}
              onProjectSelect={handleProjectSelect}
              onProjectUpdate={onProjectUpdate}
              onProjectDelete={onProjectDelete}
              onProjectMove={onProjectMove}
              onProjectClick={setSelectedProject}
              onQuickActionsClick={setShowQuickActions}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                selected={selectedProjects.has(project.id)}
                onSelect={(selected) => handleProjectSelect(project.id, selected)}
                onUpdate={onProjectUpdate}
                onDelete={onProjectDelete}
                onMove={onProjectMove}
                onClick={() => setSelectedProject(project)}
                onQuickActionsClick={() => setShowQuickActions(project.id)}
              />
            ))}
          </div>
        )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetail
          project={selectedProject}
          open={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          onUpdate={onProjectUpdate}
          onDelete={onProjectDelete}
          onMove={onProjectMove}
        />
      )}

      {/* Quick Actions Menu */}
      {showQuickActions && (
        <QuickActions
          projectId={showQuickActions}
          onClose={() => setShowQuickActions(null)}
          onAction={(action) => {
            console.log('Quick action:', action);
            setShowQuickActions(null);
          }}
        />
      )}

      {/* Bulk Actions Dialog */}
      {showBulkActions && (
        <BulkActions
          selectedCount={selectedProjects.size}
          onAction={handleBulkAction}
          onClose={() => setShowBulkActions(false)}
        />
      )}
      </div>
  );
}
