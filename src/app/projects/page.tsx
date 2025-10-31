'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { ProjectGrid, Project } from '@/components/projects/management/project-grid';
import { ProjectFilters, SearchFilters } from '@/components/projects/management/project-filters';
import { ProjectStats } from '@/components/projects/management/project-stats';
import { ProjectDraggable, ProjectFolder } from '@/components/projects/management/project-draggable';
import { KeyboardShortcuts, ShortcutsHelp, useProjectShortcuts } from '@/components/projects/management/keyboard-shortcuts';
import { ProjectErrorBoundary, DataErrorBoundary } from '@/components/projects/management/error-boundary';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Grid3X3,
  List,
  BarChart3,
  FolderOpen,
  Plus,
  Search,
  Filter,
  MoreVertical,
  SortAsc,
  SortDesc,
  View,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Star,
  Clock,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export default function ProjectsPage() {
  // State management
  const [projects, setProjects] = useState<Project[]>([]);
  const [folders, setFolders] = useState<ProjectFolder[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    status: [],
    priority: [],
    categories: [],
    tags: [],
    assignees: [],
    teams: [],
    dateRange: { type: 'all' },
    permissions: [],
    health: [],
    hasBudget: false,
    isStarred: false,
    sortBy: 'lastActivity',
    sortOrder: 'desc'
  });
  
  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>();
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  // Keyboard shortcuts
  const shortcuts = useProjectShortcuts();

  // Keyboard shortcut handlers
  const handleSearchShortcut = useCallback(() => {
    const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  }, []);

  const handleCreateProjectShortcut = useCallback(() => {
    handleCreateProject();
  }, []);

  const handleToggleViewShortcut = useCallback(() => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  }, [viewMode]);

  const handleRefreshShortcut = useCallback(() => {
    window.location.reload();
  }, []);

  const handleExportShortcut = useCallback(() => {
    handleExport();
  }, []);

  const handleImportShortcut = useCallback(() => {
    handleImport();
  }, []);

  const handleSelectAllShortcut = useCallback(() => {
    if (filteredProjects.length > 0) {
      const allIds = new Set(filteredProjects.map(p => p.id));
      setSelectedProjects(allIds);
    }
  }, [filteredProjects]);

  const handleClearSelectionShortcut = useCallback(() => {
    setSelectedProjects(new Set());
  }, []);

  const handleBulkActionsShortcut = useCallback(() => {
    // Open bulk actions if there are selected projects
    if (selectedProjects.size > 0) {
      console.log('Open bulk actions');
    }
  }, [selectedProjects.size]);

  const handleNextProject = useCallback(() => {
    // Navigate to next project in filtered list
    console.log('Next project');
  }, [filteredProjects]);

  const handlePreviousProject = useCallback(() => {
    // Navigate to previous project in filtered list
    console.log('Previous project');
  }, [filteredProjects]);

  const handleEnterProject = useCallback(() => {
    // Open selected project detail
    if (selectedProjects.size === 1) {
      const selectedProjectId = Array.from(selectedProjects)[0];
      const project = filteredProjects.find(p => p.id === selectedProjectId);
      if (project) {
        setSelectedProject(project);
      }
    }
  }, [selectedProjects, filteredProjects]);

  const handleEscapeProject = useCallback(() => {
    // Clear selection or close modals
    setSelectedProjects(new Set());
    setSelectedProject(null);
  }, []);

  // Mock data loading
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'Website Redesign',
          description: 'Complete redesign of the company website with modern UI/UX',
          status: 'active',
          priority: 'high',
          tags: ['design', 'frontend', 'urgent'],
          category: 'Web Development',
          progress: 75,
          startDate: new Date('2024-01-01'),
          dueDate: new Date('2024-02-15'),
          assignee: {
            id: 'user1',
            name: 'John Doe',
            email: 'john@example.com'
          },
          team: {
            id: 'team1',
            name: 'Design Team',
            members: 5
          },
          budget: {
            allocated: 50000,
            spent: 35000,
            currency: 'USD'
          },
          health: 'healthy',
          lastActivity: new Date('2024-01-20'),
          files: 23,
          comments: 12,
          isStarred: true,
          permissions: 'owner',
          metadata: { folderId: 'folder1' }
        },
        {
          id: '2',
          name: 'Mobile App Development',
          description: 'Native iOS and Android app development',
          status: 'active',
          priority: 'medium',
          tags: ['mobile', 'development', 'cross-platform'],
          category: 'Mobile Development',
          progress: 45,
          startDate: new Date('2024-01-10'),
          dueDate: new Date('2024-03-30'),
          assignee: {
            id: 'user2',
            name: 'Jane Smith',
            email: 'jane@example.com'
          },
          team: {
            id: 'team2',
            name: 'Mobile Team',
            members: 8
          },
          budget: {
            allocated: 80000,
            spent: 20000,
            currency: 'USD'
          },
          health: 'warning',
          lastActivity: new Date('2024-01-19'),
          files: 45,
          comments: 8,
          isStarred: false,
          permissions: 'admin',
          metadata: { folderId: 'folder2' }
        },
        {
          id: '3',
          name: 'Database Migration',
          description: 'Migrate legacy database to modern cloud infrastructure',
          status: 'paused',
          priority: 'critical',
          tags: ['database', 'infrastructure', 'migration'],
          category: 'Infrastructure',
          progress: 20,
          startDate: new Date('2024-01-15'),
          dueDate: new Date('2024-02-28'),
          assignee: {
            id: 'user3',
            name: 'Bob Johnson',
            email: 'bob@example.com'
          },
          team: {
            id: 'team3',
            name: 'Infrastructure Team',
            members: 3
          },
          budget: {
            allocated: 30000,
            spent: 8000,
            currency: 'USD'
          },
          health: 'critical',
          lastActivity: new Date('2024-01-18'),
          files: 12,
          comments: 5,
          isStarred: false,
          permissions: 'member',
          metadata: {}
        },
        {
          id: '4',
          name: 'Marketing Campaign Q1',
          description: 'Spring marketing campaign across all channels',
          status: 'completed',
          priority: 'medium',
          tags: ['marketing', 'campaign', 'q1'],
          category: 'Marketing',
          progress: 100,
          startDate: new Date('2024-01-01'),
          dueDate: new Date('2024-01-31'),
          completedAt: new Date('2024-01-28'),
          assignee: {
            id: 'user4',
            name: 'Alice Wilson',
            email: 'alice@example.com'
          },
          team: {
            id: 'team4',
            name: 'Marketing Team',
            members: 6
          },
          budget: {
            allocated: 40000,
            spent: 38000,
            currency: 'USD'
          },
          health: 'healthy',
          lastActivity: new Date('2024-01-28'),
          files: 34,
          comments: 15,
          isStarred: true,
          permissions: 'viewer',
          metadata: {}
        }
      ];

      const mockFolders: ProjectFolder[] = [
        {
          id: 'folder1',
          name: 'Development',
          description: 'Active development projects',
          projectCount: 2,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-20'),
          children: [
            {
              id: 'folder1-1',
              name: 'Web Projects',
              projectCount: 1,
              parentId: 'folder1',
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-20')
            }
          ]
        },
        {
          id: 'folder2',
          name: 'Infrastructure',
          description: 'Infrastructure and migration projects',
          projectCount: 1,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-18')
        },
        {
          id: 'folder3',
          name: 'Marketing',
          description: 'Marketing and campaign projects',
          projectCount: 1,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-28')
        }
      ];

      setProjects(mockProjects);
      setFolders(mockFolders);
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Filter projects based on current filters
  const filteredProjects = projects.filter(project => {
    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      const matchesName = project.name.toLowerCase().includes(query);
      const matchesDescription = project.description?.toLowerCase().includes(query);
      const matchesTags = project.tags.some(tag => tag.toLowerCase().includes(query));
      if (!matchesName && !matchesDescription && !matchesTags) return false;
    }

    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(project.status)) {
      return false;
    }

    // Priority filter
    if (filters.priority.length > 0 && !filters.priority.includes(project.priority)) {
      return false;
    }

    // Health filter
    if (filters.health.length > 0 && !filters.health.includes(project.health)) {
      return false;
    }

    // Starred filter
    if (filters.isStarred && !project.isStarred) {
      return false;
    }

    // Budget filter
    if (filters.hasBudget && !project.budget) {
      return false;
    }

    // Folder filter
    if (selectedFolderId) {
      const projectFolderId = project.metadata.folderId;
      if (selectedFolderId !== projectFolderId) {
        return false;
      }
    }

    // Tags filter
    if (filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag => project.tags.includes(tag));
      if (!hasMatchingTag) return false;
    }

    // Categories filter
    if (filters.categories.length > 0 && !filters.categories.includes(project.category)) {
      return false;
    }

    // Teams filter
    if (filters.teams.length > 0 && !filters.teams.includes(project.team.name)) {
      return false;
    }

    // Assignees filter
    if (filters.assignees.length > 0) {
      const assigneeName = project.assignee?.name;
      if (!assigneeName || !filters.assignees.includes(assigneeName)) {
        return false;
      }
    }

    // Date range filter
    if (filters.dateRange.type !== 'all') {
      const now = new Date();
      const projectDate = project.startDate;
      
      switch (filters.dateRange.type) {
        case 'today':
          if (projectDate.toDateString() !== now.toDateString()) return false;
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (projectDate < weekAgo) return false;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (projectDate < monthAgo) return false;
          break;
        case 'custom':
          if (filters.dateRange.start && projectDate < filters.dateRange.start) return false;
          if (filters.dateRange.end && projectDate > filters.dateRange.end) return false;
          break;
      }
    }

    // Permissions filter
    if (filters.permissions.length > 0 && !filters.permissions.includes(project.permissions)) {
      return false;
    }

    return true;
  });

  // Event handlers
  const handleProjectUpdate = useCallback((updatedProject: Project) => {
    setProjects(prev => prev.map(p => 
      p.id === updatedProject.id ? updatedProject : p
    ));
  }, []);

  const handleProjectDelete = useCallback((projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
  }, []);

  const handleProjectMove = useCallback((projectId: string, newFolderId: string) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, metadata: { ...p.metadata, folderId: newFolderId } }
        : p
    ));
  }, []);

  const handleFiltersChange = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    handleFiltersChange({ ...filters, query });
  }, [filters, handleFiltersChange]);

  const handleClearFilters = useCallback(() => {
    const defaultFilters: SearchFilters = {
      query: '',
      status: [],
      priority: [],
      categories: [],
      tags: [],
      assignees: [],
      teams: [],
      dateRange: { type: 'all' },
      permissions: [],
      health: [],
      hasBudget: false,
      isStarred: false,
      sortBy: 'lastActivity',
      sortOrder: 'desc'
    };
    setFilters(defaultFilters);
    setSearchQuery('');
  }, []);

  const handleCreateProject = () => {
    // Navigate to create project page
    window.location.href = '/projects/create';
  };

  const handleExport = () => {
    // Export functionality
    console.log('Export projects');
  };

  const handleImport = () => {
    // Import functionality
    console.log('Import projects');
  };

  const activeProjectsCount = filteredProjects.filter(p => p.status === 'active').length;
  const overdueProjectsCount = filteredProjects.filter(p => 
    p.dueDate < new Date() && p.status !== 'completed'
  ).length;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          {/* Loading skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            <div className="flex gap-2">
              <div className="h-8 w-24 bg-muted rounded animate-pulse" />
              <div className="h-8 w-24 bg-muted rounded animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-muted rounded-lg" />
                    <div className="w-16 h-6 bg-muted rounded" />
                  </div>
                  <div className="space-y-2">
                    <div className="w-24 h-8 bg-muted rounded" />
                    <div className="w-full h-2 bg-muted rounded" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="space-y-3">
                  <div className="w-3/4 h-4 bg-muted rounded" />
                  <div className="w-1/2 h-3 bg-muted rounded" />
                  <div className="w-full h-2 bg-muted rounded" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProjectErrorBoundary feature="projects-page">
      <div className="container mx-auto p-6 space-y-6">
        {/* Keyboard Shortcuts */}
        <KeyboardShortcuts
          onSearch={handleSearchShortcut}
          onCreateProject={handleCreateProjectShortcut}
          onToggleView={handleToggleViewShortcut}
          onToggleFilters={() => {}}
          onRefresh={handleRefreshShortcut}
          onExport={handleExportShortcut}
          onImport={handleImportShortcut}
          onSelectAll={handleSelectAllShortcut}
          onClearSelection={handleClearSelectionShortcut}
          onBulkActions={handleBulkActionsShortcut}
          onNext={handleNextProject}
          onPrevious={handlePreviousProject}
          onEnter={handleEnterProject}
          onEscape={handleEscapeProject}
          onHelp={() => setShowKeyboardHelp(true)}
        />

        {/* Keyboard Shortcuts Help Dialog */}
        <ShortcutsHelp 
          isOpen={showKeyboardHelp} 
          onClose={() => setShowKeyboardHelp(false)} 
        />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track your projects across all teams
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleImport}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            <Button variant="ghost" onClick={() => setShowKeyboardHelp(true)}>
              <HelpCircle className="h-4 w-4" />
            </Button>

            <Button onClick={handleCreateProject}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Projects</p>
              <p className="text-2xl font-bold">{filteredProjects.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold">{activeProjectsCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold">{overdueProjectsCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Starred</p>
              <p className="text-2xl font-bold">
                {filteredProjects.filter(p => p.isStarred).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

        {/* Main Content */}
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <DataErrorBoundary>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="stats">Stats</TabsTrigger>
                  <TabsTrigger value="folders">Folders</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4">
                  <ScrollArea className="h-96">
                    <div className="space-y-2">
                      <Button
                        variant={activeTab === 'all' ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setSelectedFolderId(undefined)}
                      >
                        <View className="h-4 w-4 mr-2" />
                        All Projects
                        <Badge variant="secondary" className="ml-auto">
                          {filteredProjects.length}
                        </Badge>
                      </Button>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="stats" className="mt-4">
                  <ScrollArea className="h-96">
                    <ProjectErrorBoundary feature="project-stats">
                      <ProjectStats
                        projects={filteredProjects}
                        showTrends={true}
                        showHealthBreakdown={true}
                        compact={true}
                      />
                    </ProjectErrorBoundary>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="folders" className="mt-4">
                  <ScrollArea className="h-96">
                    <ProjectErrorBoundary feature="project-folders">
                      <ProjectDraggable
                        projects={filteredProjects}
                        folders={folders}
                        selectedProjectId={undefined}
                        onProjectMove={handleProjectMove}
                        onFolderCreate={(parentId, name) => {
                          console.log('Create folder', parentId, name);
                        }}
                        onFolderUpdate={(folderId, updates) => {
                          console.log('Update folder', folderId, updates);
                        }}
                        onFolderDelete={(folderId) => {
                          console.log('Delete folder', folderId);
                        }}
                      />
                    </ProjectErrorBoundary>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </DataErrorBoundary>
          </div>

          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-9">
            <DataErrorBoundary>
              <Card className="p-6">
                {/* Filters */}
                <ProjectErrorBoundary feature="project-filters">
                  <ProjectFilters
                    projects={filteredProjects}
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onSearch={handleSearch}
                    onClearFilters={handleClearFilters}
                  />
                </ProjectErrorBoundary>

                {/* View Controls */}
                <div className="flex items-center justify-between mt-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleRefreshShortcut}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Project Grid */}
                <ProjectErrorBoundary feature="project-grid">
                  <ProjectGrid
                    projects={filteredProjects}
                    viewMode={viewMode}
                    onProjectUpdate={handleProjectUpdate}
                    onProjectDelete={handleProjectDelete}
                    onProjectMove={handleProjectMove}
                    isLoading={isLoading}
                  />
                </ProjectErrorBoundary>
              </Card>
            </DataErrorBoundary>
          </div>
        </div>

        {/* Keyboard Shortcuts Indicator */}
        {selectedProjects.size > 0 && (
          <div className="fixed bottom-4 right-4 z-40">
            <div className="bg-muted/90 backdrop-blur border rounded-lg p-3 shadow-lg">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {selectedProjects.size} selected
                </span>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 text-xs bg-background border rounded">
                    Enter
                  </kbd>
                  <span className="text-xs text-muted-foreground">open</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 text-xs bg-background border rounded">
                    Esc
                  </kbd>
                  <span className="text-xs text-muted-foreground">clear</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProjectErrorBoundary>
  );
}
