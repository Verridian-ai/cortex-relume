'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FixedSizeList as List,
  VariableSizeList,
  areEqual
} from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { 
  GripVertical, 
  MoreVertical, 
  Eye, 
  Edit, 
  Share, 
  Archive,
  Trash2,
  Star,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Loader2,
  Zap
} from 'lucide-react';
import { Project, ProjectCard } from './project-grid';

interface VirtualizedProjectGridProps {
  projects: Project[];
  itemHeight?: number;
  overscan?: number;
  onProjectSelect: (projectId: string, selected: boolean) => void;
  onProjectUpdate: (project: Project) => void;
  onProjectDelete: (projectId: string) => void;
  onProjectMove: (projectId: string, newFolderId: string) => void;
  onProjectClick: (project: Project) => void;
  onQuickActionsClick: (projectId: string) => void;
  selectedProjects: Set<string>;
  className?: string;
}

// Virtualized grid item component
interface ProjectGridItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    projects: Project[];
    selectedProjects: Set<string>;
    onProjectSelect: (projectId: string, selected: boolean) => void;
    onProjectUpdate: (project: Project) => void;
    onProjectDelete: (projectId: string) => void;
    onProjectMove: (projectId: string, newFolderId: string) => void;
    onProjectClick: (project: Project) => void;
    onQuickActionsClick: (projectId: string) => void;
  };
}

const VirtualProjectCard: React.FC<ProjectGridItemProps> = ({ 
  index, 
  style, 
  data 
}) => {
  const project = data.projects[index];
  const isSelected = data.selectedProjects.has(project.id);

  const getStatusIcon = (status: string) => {
    const icons = {
      active: CheckCircle2,
      paused: Clock,
      completed: CheckCircle2,
      archived: XCircle
    };
    return icons[status as keyof typeof icons] || Clock;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'text-green-600',
      paused: 'text-yellow-600',
      completed: 'text-blue-600',
      archived: 'text-gray-600'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600';
  };

  const getHealthColor = (health: string) => {
    const colors = {
      healthy: 'text-green-600',
      warning: 'text-yellow-600',
      critical: 'text-red-600',
      'at-risk': 'text-orange-600'
    };
    return colors[health as keyof typeof colors] || 'text-gray-600';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-blue-500',
      low: 'bg-gray-500'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div style={style} className="p-2">
      <Card className={cn(
        "h-full p-4 transition-all duration-200 cursor-pointer group",
        isSelected && "ring-2 ring-primary bg-primary/5",
        "hover:shadow-md hover:scale-[1.02]"
      )}>
        <div className="space-y-3 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  data.onProjectSelect(project.id, !isSelected);
                }}
              >
                <div className={cn(
                  "w-3 h-3 rounded border-2 flex items-center justify-center",
                  isSelected 
                    ? "bg-primary border-primary" 
                    : "border-muted-foreground"
                )}>
                  {isSelected && <CheckCircle2 className="h-2 w-2 text-primary-foreground" />}
                </div>
              </Button>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{project.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {project.description}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  data.onQuickActionsClick(project.id);
                }}
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Tags */}
          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary"
                >
                  {tag}
                </span>
              ))}
              {project.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{project.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Progress */}
          <div className="space-y-1 flex-shrink-0">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span>{project.progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div 
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          {/* Status and Priority */}
          <div className="flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              {React.createElement(getStatusIcon(project.status), {
                className: cn("h-3 w-3", getStatusColor(project.status))
              })}
              <span className="text-xs capitalize text-muted-foreground">
                {project.status}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", getPriorityColor(project.priority))} />
              <span className="text-xs capitalize text-muted-foreground">
                {project.priority}
              </span>
            </div>
          </div>

          {/* Assignee and Due Date */}
          <div className="flex items-center justify-between text-xs text-muted-foreground flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              {project.assignee && (
                <div className="flex items-center gap-1 min-w-0">
                  <div className="w-4 h-4 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs">
                      {project.assignee.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="truncate">{project.assignee.name}</span>
                </div>
              )}
            </div>
            <span className="flex-shrink-0">
              {project.dueDate.toLocaleDateString()}
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto flex-shrink-0 pt-2 border-t">
            <div className="flex items-center gap-3">
              <span>{project.files} files</span>
              <span>{project.comments} comments</span>
            </div>
            <div className="flex items-center gap-2">
              {project.isStarred && (
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
              )}
              <div className="flex items-center gap-1">
                {React.createElement(
                  project.health === 'healthy' ? CheckCircle2 :
                  project.health === 'warning' ? AlertTriangle :
                  project.health === 'critical' ? XCircle : Clock,
                  { className: cn("h-3 w-3", getHealthColor(project.health)) }
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export function VirtualizedProjectGrid({
  projects,
  itemHeight = 280,
  overscan = 4,
  onProjectSelect,
  onProjectUpdate,
  onProjectDelete,
  onProjectMove,
  onProjectClick,
  onQuickActionsClick,
  selectedProjects,
  className
}: VirtualizedProjectGridProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const itemData = useMemo(() => ({
    projects,
    selectedProjects,
    onProjectSelect,
    onProjectUpdate,
    onProjectDelete,
    onProjectMove,
    onProjectClick,
    onQuickActionsClick
  }), [
    projects,
    selectedProjects,
    onProjectSelect,
    onProjectUpdate,
    onProjectDelete,
    onProjectMove,
    onProjectClick,
    onQuickActionsClick
  ]);

  if (!mounted) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="h-72 p-6 animate-pulse">
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

  return (
    <div className={cn("h-full", className)}>
      <AutoSizer>
        {({ width, height }) => {
          // Calculate columns based on container width
          const columnWidth = 320;
          const gap = 16;
          const columns = Math.max(1, Math.floor((width - gap) / (columnWidth + gap)));
          
          return (
            <div className="h-full" style={{ width }}>
              <VariableSizeList
                height={height}
                width={width}
                itemCount={Math.ceil(projects.length / columns)}
                itemData={itemData}
                itemSize={() => itemHeight + gap}
                overscanCount={overscan}
              >
                {({ index, style, data }) => {
                  const startIndex = index * columns;
                  const endIndex = Math.min(startIndex + columns, projects.length);
                  const rowProjects = projects.slice(startIndex, endIndex);
                  
                  return (
                    <div
                      style={{
                        ...style,
                        display: 'flex',
                        gap: gap,
                        width: width - (gap * 2),
                        paddingLeft: gap,
                        paddingRight: gap
                      }}
                    >
                      {rowProjects.map((project, projectIndex) => (
                        <div
                          key={project.id}
                          style={{ width: columnWidth }}
                          className="flex-shrink-0"
                        >
                          <VirtualProjectCard
                            index={startIndex + projectIndex}
                            style={{}}
                            data={data}
                          />
                        </div>
                      ))}
                    </div>
                  );
                }}
              </VariableSizeList>
            </div>
          );
        }}
      </AutoSizer>
    </div>
  );
}

// Virtualized project list for better performance
interface VirtualizedProjectListProps {
  projects: Project[];
  height: number;
  itemHeight?: number;
  overscan?: number;
  columns: Array<{
    key: string;
    label: string;
    width: number;
  }>;
  selectedProjects: Set<string>;
  onProjectSelect: (projectId: string, selected: boolean) => void;
  onSelectAll: () => void;
  onSort: (columnKey: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onProjectUpdate: (project: Project) => void;
  onProjectDelete: (projectId: string) => void;
  onProjectMove: (projectId: string, newFolderId: string) => void;
  onProjectClick: (project: Project) => void;
  onQuickActionsClick: (projectId: string) => void;
  className?: string;
}

interface ProjectListItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    projects: Project[];
    columns: Array<{
      key: string;
      label: string;
      width: number;
    }>;
    selectedProjects: Set<string>;
    onProjectSelect: (projectId: string, selected: boolean) => void;
    onProjectClick: (project: Project) => void;
    onQuickActionsClick: (projectId: string) => void;
    onProjectUpdate: (project: Project) => void;
    onProjectDelete: (projectId: string) => void;
    onProjectMove: (projectId: string, newFolderId: string) => void;
  };
}

const VirtualProjectListRow: React.FC<ProjectListItemProps> = ({
  index,
  style,
  data
}) => {
  const project = data.projects[index];
  const isSelected = data.selectedProjects.has(project.id);

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'text-green-600',
      paused: 'text-yellow-600',
      completed: 'text-blue-600',
      archived: 'text-gray-600'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-blue-500',
      low: 'bg-gray-500'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-500';
  };

  const getHealthColor = (health: string) => {
    const colors = {
      healthy: 'text-green-600',
      warning: 'text-yellow-600',
      critical: 'text-red-600',
      'at-risk': 'text-orange-600'
    };
    return colors[health as keyof typeof colors] || 'text-gray-600';
  };

  const renderCell = (column: any) => {
    switch (column.key) {
      case 'select':
        return (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              data.onProjectSelect(project.id, !isSelected);
            }}
          >
            <div className={cn(
              "w-3 h-3 rounded border-2 flex items-center justify-center",
              isSelected 
                ? "bg-primary border-primary" 
                : "border-muted-foreground"
            )}>
              {isSelected && <CheckCircle2 className="h-2 w-2 text-primary-foreground" />}
            </div>
          </Button>
        );

      case 'name':
        return (
          <div 
            className="flex items-center gap-2 min-w-0 cursor-pointer"
            onClick={() => data.onProjectClick(project)}
          >
            <div className="w-4 h-4 bg-muted-foreground/20 rounded flex items-center justify-center flex-shrink-0">
              <Zap className="h-2 w-2" />
            </div>
            <div className="min-w-0">
              <div className="font-medium text-sm truncate">{project.name}</div>
              <div className="text-xs text-muted-foreground truncate">
                {project.description}
              </div>
            </div>
          </div>
        );

      case 'status':
        return (
          <span className={cn("text-sm capitalize", getStatusColor(project.status))}>
            {project.status}
          </span>
        );

      case 'priority':
        return (
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", getPriorityColor(project.priority))} />
            <span className="text-sm capitalize">{project.priority}</span>
          </div>
        );

      case 'progress':
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 bg-muted rounded-full h-1">
              <div 
                className="bg-primary h-1 rounded-full transition-all"
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{project.progress}%</span>
          </div>
        );

      case 'assignee':
        return (
          <div className="flex items-center gap-2">
            {project.assignee && (
              <>
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-xs">
                    {project.assignee.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm truncate">{project.assignee.name}</span>
              </>
            )}
          </div>
        );

      case 'dueDate':
        return (
          <span className="text-sm">
            {project.dueDate.toLocaleDateString()}
          </span>
        );

      case 'team':
        return (
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-muted-foreground/20 rounded flex items-center justify-center">
              <span className="text-xs">{project.team.members}</span>
            </div>
            <span className="text-xs text-muted-foreground">{project.team.name}</span>
          </div>
        );

      case 'health':
        return (
          <div className={cn(
            "w-2 h-2 rounded-full",
            project.health === 'healthy' ? 'bg-green-500' :
            project.health === 'warning' ? 'bg-yellow-500' :
            project.health === 'critical' ? 'bg-red-500' : 'bg-gray-500'
          )} />
        );

      case 'actions':
        return (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              data.onQuickActionsClick(project.id);
            }}
          >
            <MoreVertical className="h-3 w-3" />
          </Button>
        );

      default:
        return <span className="text-sm">{project[column.key as keyof Project] || ''}</span>;
    }
  };

  return (
    <div
      style={style}
      className={cn(
        "flex items-center px-4 py-2 border-b transition-colors cursor-pointer",
        "hover:bg-muted/50",
        isSelected && "bg-primary/5"
      )}
      onClick={() => data.onProjectClick(project)}
    >
      {data.columns.map((column) => (
        <div
          key={column.key}
          className="flex items-center"
          style={{ width: column.width }}
        >
          {renderCell(column)}
        </div>
      ))}
    </div>
  );
};

export function VirtualizedProjectList({
  projects,
  height,
  itemHeight = 60,
  overscan = 5,
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
}: VirtualizedProjectListProps) {
  const itemData = useMemo(() => ({
    projects,
    columns,
    selectedProjects,
    onProjectSelect,
    onProjectClick,
    onQuickActionsClick,
    onProjectUpdate,
    onProjectDelete,
    onProjectMove
  }), [
    projects,
    columns,
    selectedProjects,
    onProjectSelect,
    onProjectClick,
    onQuickActionsClick,
    onProjectUpdate,
    onProjectDelete,
    onProjectMove
  ]);

  return (
    <div className={cn("border rounded-lg bg-card", className)}>
      {/* Header */}
      <div className="border-b bg-muted/30 p-4">
        <div className="flex items-center gap-4">
          {columns.map((column) => (
            <div
              key={column.key}
              className="flex items-center gap-2"
              style={{ width: column.width }}
            >
              {column.key === 'select' ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={onSelectAll}
                >
                  <div className={cn(
                    "w-3 h-3 rounded border-2 flex items-center justify-center",
                    selectedProjects.size === projects.length
                      ? "bg-primary border-primary"
                      : "border-muted-foreground"
                  )}>
                    {selectedProjects.size === projects.length && (
                      <CheckCircle2 className="h-2 w-2 text-primary-foreground" />
                    )}
                  </div>
                </Button>
              ) : (
                <button
                  className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => onSort(column.key)}
                >
                  {column.label}
                  {sortBy === column.key && (
                    <span className="text-xs">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Virtual List */}
      <div style={{ height }}>
        <List
          height={height}
          itemCount={projects.length}
          itemSize={itemHeight}
          itemData={itemData}
          overscanCount={overscan}
        >
          {VirtualProjectListRow}
        </List>
      </div>
    </div>
  );
}

// Infinite scroll component for loading more projects
interface InfiniteScrollProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  children: React.ReactNode;
  threshold?: number;
  className?: string;
}

export function InfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  children,
  threshold = 100,
  className
}: InfiniteScrollProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const handleScroll = () => {
      if (!hasMore || isLoading) return;

      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - threshold;

      if (isNearBottom) {
        onLoadMore();
      }
    };

    const throttledHandleScroll = throttle(handleScroll, 100);

    document.addEventListener('scroll', throttledHandleScroll);
    return () => {
      document.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [mounted, hasMore, isLoading, onLoadMore, threshold]);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <div className={className}>
      {children}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading more projects...</span>
        </div>
      )}
      
      {/* Load more trigger */}
      {hasMore && !isLoading && (
        <div 
          ref={(node) => {
            if (node && !isLoading) {
              const observer = new IntersectionObserver(
                (entries) => {
                  entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                      onLoadMore();
                    }
                  });
                },
                { threshold: 0.1 }
              );
              observer.observe(node);
            }
          }}
          className="h-10 flex items-center justify-center"
        >
          <Button variant="outline" onClick={onLoadMore} size="sm">
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}

// Utility function for throttling
function throttle(func: Function, limit: number) {
  let inThrottle: boolean;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
