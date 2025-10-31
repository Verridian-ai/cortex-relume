'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Menu,
  Filter,
  Grid3X3,
  List,
  Search,
  Settings,
  ChevronDown,
  Plus,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { Project, ProjectFilters } from './project-grid';

// Hook to detect mobile screens
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  return isMobile;
}

// Hook for touch gestures
export function useSwipeGestures(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void
) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    };

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
    }

    setTouchStart(null);
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd
  };
}

// Mobile-optimized project grid
interface MobileProjectGridProps {
  projects: Project[];
  viewMode: 'grid' | 'list';
  onProjectSelect: (projectId: string) => void;
  onProjectUpdate: (project: Project) => void;
  onProjectDelete: (projectId: string) => void;
  onProjectMove: (projectId: string, newFolderId: string) => void;
  onToggleView: () => void;
  onOpenFilters: () => void;
  onOpenSearch: () => void;
  onCreateProject: () => void;
  className?: string;
}

export function MobileProjectGrid({
  projects,
  viewMode,
  onProjectSelect,
  onProjectUpdate,
  onProjectDelete,
  onProjectMove,
  onToggleView,
  onOpenFilters,
  onOpenSearch,
  onCreateProject,
  className
}: MobileProjectGridProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const isMobile = useIsMobile();

  // Add swipe gestures
  const swipeGestures = useSwipeGestures(
    () => onToggleView(), // Swipe left to toggle view
    () => onOpenFilters(), // Swipe right to open filters
    () => {}, // Swipe up
    () => {} // Swipe down
  );

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'text-green-600',
      paused: 'text-yellow-600',
      completed: 'text-blue-600',
      archived: 'text-gray-600'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      active: CheckCircle2,
      paused: Clock,
      completed: CheckCircle2,
      archived: XCircle
    };
    return icons[status as keyof typeof icons] || Clock;
  };

  if (!isMobile) {
    // Render desktop version when not mobile
    return (
      <div className={cn("hidden md:block", className)}>
        {/* Desktop project grid would go here */}
        <div className="text-sm text-muted-foreground p-4">
          Desktop view - use the regular project grid component
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn("md:hidden", className)}
      {...swipeGestures}
    >
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-background border-b p-4">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Menu className="h-4 w-4 mr-2" />
                Menu
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <h2 className="font-semibold mb-4">Projects</h2>
                  
                  <div className="space-y-2">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={onOpenSearch}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={onOpenFilters}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={onToggleView}
                    >
                      {viewMode === 'grid' ? (
                        <>
                          <List className="h-4 w-4 mr-2" />
                          List View
                        </>
                      ) : (
                        <>
                          <Grid3X3 className="h-4 w-4 mr-2" />
                          Grid View
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={onCreateProject}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Project
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>

          <div className="flex-1">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={onOpenSearch}
            >
              <Search className="h-4 w-4 mr-2" />
              Search projects...
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={onOpenFilters}>
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Projects List */}
      <div className="p-4 space-y-3">
        {projects.map((project) => {
          const StatusIcon = getStatusIcon(project.status);
          
          return (
            <div
              key={project.id}
              className="bg-card border rounded-lg p-4 active:scale-95 transition-transform"
              onClick={() => {
                setSelectedProject(project);
                onProjectSelect(project.id);
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{project.name}</h3>
                  {project.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {project.description}
                    </p>
                  )}
                </div>
                
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <StatusIcon className={cn("h-3 w-3", getStatusColor(project.status))} />
                  <span className="text-xs capitalize text-muted-foreground">
                    {project.status}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    project.priority === 'critical' ? 'bg-red-500' :
                    project.priority === 'high' ? 'bg-orange-500' :
                    project.priority === 'medium' ? 'bg-blue-500' : 'bg-gray-500'
                  )} />
                  <span className="text-xs capitalize text-muted-foreground">
                    {project.priority}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div 
                    className="bg-primary h-1.5 rounded-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span>Due {project.dueDate.toLocaleDateString()}</span>
                  {project.assignee && (
                    <span>Assigned to {project.assignee.name}</span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <span>{project.files} files</span>
                  {project.isStarred && (
                    <span className="text-yellow-500">★</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {projects.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-lg mb-2">No projects found</div>
            <div className="text-sm mb-4">Create your first project to get started</div>
            <Button onClick={onCreateProject}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="sticky bottom-0 bg-background border-t p-4">
        <div className="flex items-center justify-center">
          <Button onClick={onCreateProject} className="w-full max-w-xs">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>
    </div>
  );
}

// Mobile-optimized filters sheet
interface MobileFiltersSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: any;
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
}

export function MobileFiltersSheet({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onClearFilters
}: MobileFiltersSheetProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleClearFilters = () => {
    onClearFilters();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Filters</h2>
            <Button variant="ghost" onClick={onClose}>
              ×
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              {/* Filter options would go here */}
              <div>
                <h3 className="font-medium mb-2">Status</h3>
                <div className="space-y-2">
                  {['active', 'paused', 'completed', 'archived'].map((status) => (
                    <label key={status} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={localFilters.status?.includes(status)}
                        onChange={(e) => {
                          const newStatus = e.target.checked
                            ? [...(localFilters.status || []), status]
                            : localFilters.status?.filter((s: string) => s !== status) || [];
                          setLocalFilters({ ...localFilters, status: newStatus });
                        }}
                        className="rounded"
                      />
                      <span className="capitalize">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Priority</h3>
                <div className="space-y-2">
                  {['low', 'medium', 'high', 'critical'].map((priority) => (
                    <label key={priority} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={localFilters.priority?.includes(priority)}
                        onChange={(e) => {
                          const newPriority = e.target.checked
                            ? [...(localFilters.priority || []), priority]
                            : localFilters.priority?.filter((p: string) => p !== priority) || [];
                          setLocalFilters({ ...localFilters, priority: newPriority });
                        }}
                        className="rounded"
                      />
                      <span className="capitalize">{priority}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="p-4 border-t space-y-2">
            <Button variant="outline" onClick={handleClearFilters} className="w-full">
              Clear All Filters
            </Button>
            <Button onClick={handleApplyFilters} className="w-full">
              Apply Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Touch-optimized drag handle
interface TouchDragHandleProps {
  onDragStart: () => void;
  onDragEnd: () => void;
  className?: string;
}

export function TouchDragHandle({ onDragStart, onDragEnd, className }: TouchDragHandleProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    onDragStart();
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    onDragEnd();
  };

  return (
    <div
      className={cn(
        "touch-manipulation select-none",
        isDragging && "opacity-50",
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="w-6 h-6 flex items-center justify-center">
        <div className="w-4 h-1 bg-muted-foreground rounded-full mb-0.5" />
        <div className="w-4 h-1 bg-muted-foreground rounded-full mb-0.5" />
        <div className="w-4 h-1 bg-muted-foreground rounded-full" />
      </div>
    </div>
  );
}
