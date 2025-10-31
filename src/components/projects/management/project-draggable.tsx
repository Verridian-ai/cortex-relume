'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FolderOpen,
  FolderPlus,
  MoreVertical,
  GripVertical,
  ChevronRight,
  ChevronDown,
  Plus,
  File,
  Archive
} from 'lucide-react';
import { Project } from './project-grid';

export interface ProjectFolder {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  color?: string;
  icon?: string;
  projectCount: number;
  children?: ProjectFolder[];
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectDraggableProps {
  projects: Project[];
  folders: ProjectFolder[];
  selectedProjectId?: string;
  onProjectMove: (projectId: string, newFolderId: string) => void;
  onFolderCreate: (parentId?: string, name?: string) => void;
  onFolderUpdate: (folderId: string, updates: Partial<ProjectFolder>) => void;
  onFolderDelete: (folderId: string) => void;
  className?: string;
}

interface DragState {
  draggedProjectId: string | null;
  draggedOverFolderId: string | null;
  isDragging: boolean;
}

export function ProjectDraggable({
  projects,
  folders,
  selectedProjectId,
  onProjectMove,
  onFolderCreate,
  onFolderUpdate,
  onFolderDelete,
  className
}: ProjectDraggableProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [dragState, setDragState] = useState<DragState>({
    draggedProjectId: null,
    draggedOverFolderId: null,
    isDragging: false
  });
  const [draggedProject, setDraggedProject] = useState<Project | null>(null);

  const toggleFolderExpansion = useCallback((folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, project: Project) => {
    setDragState(prev => ({
      ...prev,
      draggedProjectId: project.id,
      isDragging: true
    }));
    setDraggedProject(project);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', project.id);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragState({
      draggedProjectId: null,
      draggedOverFolderId: null,
      isDragging: false
    });
    setDraggedProject(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragState(prev => ({
      ...prev,
      draggedOverFolderId: folderId
    }));
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragState(prev => ({
      ...prev,
      draggedOverFolderId: null
    }));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData('text/plain');
    
    if (projectId && projectId !== targetFolderId) {
      onProjectMove(projectId, targetFolderId);
    }

    setDragState({
      draggedProjectId: null,
      draggedOverFolderId: null,
      isDragging: false
    });
    setDraggedProject(null);
  }, [onProjectMove]);

  const getProjectsInFolder = useCallback((folderId: string | undefined) => {
    if (!folderId) {
      return projects.filter(p => !p.metadata.folderId);
    }
    return projects.filter(p => p.metadata.folderId === folderId);
  }, [projects]);

  const renderFolderTree = useCallback((folder: ProjectFolder, level: number = 0) => {
    const hasChildren = folder.children && folder.children.length > 0;
    const isExpanded = expandedFolders.has(folder.id);
    const folderProjects = getProjectsInFolder(folder.id);
    const isDragOver = dragState.draggedOverFolderId === folder.id;
    const isRoot = level === 0;

    return (
      <div key={folder.id} className={cn("select-none", isRoot && "mb-4")}>
        <Card
          className={cn(
            "transition-all duration-200 cursor-pointer group",
            isDragOver && "ring-2 ring-primary bg-primary/5",
            !isRoot && "ml-" + (level * 4)
          )}
          onDragOver={(e) => handleDragOver(e, folder.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, folder.id)}
        >
          <div className="p-3">
            <div className="flex items-center gap-2">
              {/* Expand/Collapse Button */}
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => toggleFolderExpansion(folder.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </Button>
              )}

              {/* Folder Icon */}
              <div className="flex items-center justify-center w-6 h-6">
                {folder.icon ? (
                  <span className="text-sm">{folder.icon}</span>
                ) : (
                  <FolderOpen className="h-4 w-4 text-blue-500" />
                )}
              </div>

              {/* Folder Name and Stats */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{folder.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {folder.projectCount}
                  </Badge>
                </div>
                {folder.description && (
                  <p className="text-xs text-muted-foreground truncate">
                    {folder.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFolderCreate(folder.id);
                  }}
                >
                  <FolderPlus className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Show folder actions menu
                  }}
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Nested Folders */}
        {hasChildren && isExpanded && (
          <div className="mt-2">
            {folder.children?.map(child => renderFolderTree(child, level + 1))}
          </div>
        )}

        {/* Projects in Folder */}
        {folderProjects.length > 0 && (
          <div className={cn(
            "mt-2 space-y-1",
            isExpanded || !hasChildren ? "block" : "hidden"
          )}>
            {folderProjects.map(project => (
              <ProjectDraggableItem
                key={project.id}
                project={project}
                isDragging={dragState.draggedProjectId === project.id}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                isSelected={selectedProjectId === project.id}
                onClick={() => {
                  // Handle project selection
                }}
              />
            ))}
          </div>
        )}

        {/* Empty State for Folder */}
        {folderProjects.length === 0 && (
          <div className={cn(
            "mt-2 p-3 text-center text-muted-foreground text-xs border border-dashed rounded-lg",
            isExpanded || !hasChildren ? "block" : "hidden"
          )}>
            Drop projects here
          </div>
        )}
      </div>
    );
  }, [
    expandedFolders,
    dragState.draggedOverFolderId,
    dragState.draggedProjectId,
    selectedProjectId,
    getProjectsInFolder,
    toggleFolderExpansion,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    onFolderCreate,
    onProjectMove
  ]);

  const rootProjects = getProjectsInFolder(undefined);
  const rootFolders = folders.filter(f => !f.parentId);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Root Level */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">All Projects</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={() => onFolderCreate()}
            >
              <FolderPlus className="h-4 w-4 mr-1" />
              New Folder
            </Button>
          </div>
        </div>

        {/* Root Projects */}
        {rootProjects.length > 0 && (
          <div className="space-y-1 mb-4">
            {rootProjects.map(project => (
              <ProjectDraggableItem
                key={project.id}
                project={project}
                isDragging={dragState.draggedProjectId === project.id}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                isSelected={selectedProjectId === project.id}
                onClick={() => {
                  // Handle project selection
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Folders */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Folders</h3>
        <div>
          {rootFolders.map(folder => renderFolderTree(folder))}
        </div>
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Archive className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <div className="text-lg mb-2">No projects yet</div>
          <div className="text-sm mb-4">Create your first project to get started</div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </div>
      )}
    </div>
  );
}

interface ProjectDraggableItemProps {
  project: Project;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, project: Project) => void;
  onDragEnd: () => void;
  isSelected: boolean;
  onClick: () => void;
}

function ProjectDraggableItem({
  project,
  isDragging,
  onDragStart,
  onDragEnd,
  isSelected,
  onClick
}: ProjectDraggableItemProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-500',
      paused: 'bg-yellow-500',
      completed: 'bg-blue-500',
      archived: 'bg-gray-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg border bg-card transition-all duration-200 cursor-pointer group",
        isDragging && "opacity-50",
        isSelected && "ring-2 ring-primary",
        "hover:shadow-sm"
      )}
      draggable
      onDragStart={(e) => onDragStart(e, project)}
      onDragEnd={onDragEnd}
      onClick={onClick}
    >
      {/* Drag Handle */}
      <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Status Indicator */}
      <div className={cn("w-2 h-2 rounded-full", getStatusColor(project.status))} />
      
      {/* Project Name */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{project.name}</div>
        {project.description && (
          <div className="text-xs text-muted-foreground truncate">
            {project.description}
          </div>
        )}
      </div>
      
      {/* Project Stats */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {project.assignee && (
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-xs">
                {project.assignee.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}
        <div className="flex items-center gap-1">
          <File className="h-3 w-3" />
          <span>{project.files}</span>
        </div>
      </div>
    </div>
  );
}
