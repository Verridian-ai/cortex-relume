'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { 
  Folder, 
  Tag, 
  Hash, 
  Search, 
  Filter, 
  Grid3X3, 
  List,
  Plus,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  FolderTree,
} from './folder-tree'
import {
  TagManagerComponent,
  SelectedTags
} from './tag-manager'
import {
  CategoryManagerComponent
} from './category-manager'
import {
  ProjectSearchAndFilter,
} from './project-search-filter'
import {
  BulkOperations
} from './bulk-operations'
import {
  AISmartOrganizationComponent
} from './ai-smart-organization'
import {
  SearchManager,
  SearchFilters,
  Folder as FolderType,
  Tag as TagType,
  Category as CategoryType,
  Project
} from '@/lib/projects/organization'
import { useAuth } from '@/components/auth-provider'

interface OrganizationDashboardProps {
  initialProjects?: Project[]
  onProjectSelect?: (project: Project) => void
  onProjectsUpdate?: () => void
  className?: string
}

export function OrganizationDashboard({
  initialProjects = [],
  onProjectSelect,
  onProjectsUpdate,
  className
}: OrganizationDashboardProps) {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [loading, setLoading] = useState(true)
  const [searchResults, setSearchResults] = useState<{
    projects: Project[]
    total_count: number
    has_more: boolean
  }>({ projects: [], total_count: 0, has_more: false })
  const [searching, setSearching] = useState(false)
  
  // Organization data
  const [folders, setFolders] = useState<FolderType[]>([])
  const [tags, setTags] = useState<TagType[]>([])
  const [categories, setCategories] = useState<CategoryType[]>([])
  
  // UI state
  const [selectedFolder, setSelectedFolder] = useState<FolderType | null>(null)
  const [selectedTags, setSelectedTags] = useState<TagType[]>([])
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null)
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({})
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('projects')

  useEffect(() => {
    if (user) {
      loadOrganizationData()
    }
  }, [user])

  useEffect(() => {
    performSearch()
  }, [searchFilters, selectedFolder, selectedTags, selectedCategory])

  const loadOrganizationData = async () => {
    try {
      setLoading(true)
      
      // Load folders, tags, and categories in parallel
      const [foldersData, tagsData, categoriesData] = await Promise.all([
        SearchManager.searchProjects({}, user!.id, 1).then(() => []), // Placeholder for folder loading
        // TagManager.getTags(user!.id),
        // CategoryManager.getCategories(user!.id)
      ])
      
      // For now, use mock data since we don't have the full implementation
      setFolders([])
      setTags([])
      setCategories([])
      
    } catch (error) {
      console.error('Failed to load organization data:', error)
    } finally {
      setLoading(false)
    }
  }

  const performSearch = useCallback(async () => {
    try {
      setSearching(true)
      
      // Build search filters
      const filters: SearchFilters = {
        ...searchFilters,
        folder_id: selectedFolder?.id || null,
        category_ids: selectedCategory ? [selectedCategory.id] : [],
        tag_ids: selectedTags.map(t => t.id)
      }
      
      const results = await SearchManager.searchProjects(filters, user!.id, 50, 0)
      setSearchResults(results)
      
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setSearching(false)
    }
  }, [searchFilters, selectedFolder, selectedTags, selectedCategory, user])

  const handleSearch = async (query: string) => {
    setSearchFilters(prev => ({ ...prev, query }))
  }

  const handleFiltersChange = (filters: SearchFilters) => {
    setSearchFilters(filters)
  }

  const handleProjectAction = (action: string, project: Project) => {
    switch (action) {
      case 'select':
        onProjectSelect?.(project)
        break
      case 'view':
        onProjectSelect?.(project)
        break
      case 'duplicate':
        // Handle duplicate
        break
      case 'delete':
        // Handle delete
        break
    }
  }

  const handleRefresh = () => {
    loadOrganizationData()
    onProjectsUpdate?.()
  }

  const displayedProjects = searchResults.projects.length > 0 
    ? searchResults.projects 
    : projects

  return (
    <div className={cn('h-full flex flex-col', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold">Project Organization</h1>
          <p className="text-muted-foreground">
            Organize and manage your projects with folders, tags, and categories
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
            Refresh
          </Button>
          
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* Sidebar */}
          <div className="w-80 border-r bg-muted/20 overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="folders" className="text-xs">
                  <Folder className="h-4 w-4 mr-1" />
                  Folders
                </TabsTrigger>
                <TabsTrigger value="tags" className="text-xs">
                  <Hash className="h-4 w-4 mr-1" />
                  Tags
                </TabsTrigger>
                <TabsTrigger value="categories" className="text-xs">
                  <Tag className="h-4 w-4 mr-1" />
                  Categories
                </TabsTrigger>
                <TabsTrigger value="ai" className="text-xs">
                  <Search className="h-4 w-4 mr-1" />
                  AI
                </TabsTrigger>
              </TabsList>
              
              <div className="p-4">
                <TabsContent value="folders" className="mt-0">
                  <FolderTree
                    onFolderSelect={setSelectedFolder}
                    selectedFolderId={selectedFolder?.id || null}
                  />
                </TabsContent>
                
                <TabsContent value="tags" className="mt-0">
                  <TagManagerComponent
                    selectedTags={selectedTags}
                    onTagToggle={(tag) => {
                      const isSelected = selectedTags.some(t => t.id === tag.id)
                      if (isSelected) {
                        setSelectedTags(prev => prev.filter(t => t.id !== tag.id))
                      } else {
                        setSelectedTags(prev => [...prev, tag])
                      }
                    }}
                  />
                  
                  {selectedTags.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <SelectedTags
                        tags={selectedTags}
                        onTagRemove={(tag) => {
                          setSelectedTags(prev => prev.filter(t => t.id !== tag.id))
                        }}
                      />
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="categories" className="mt-0">
                  <CategoryManagerComponent
                    selectedCategoryId={selectedCategory?.id || null}
                    onCategoryToggle={setSelectedCategory}
                  />
                </TabsContent>
                
                <TabsContent value="ai" className="mt-0">
                  <AISmartOrganizationComponent
                    projects={projects}
                    onProjectsUpdate={onProjectsUpdate}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search and Filters */}
            <div className="p-4 border-b">
              <ProjectSearchAndFilter
                onFiltersChange={handleFiltersChange}
                onSearch={handleSearch}
                folders={folders}
                tags={tags}
                categories={categories}
                showDateRange={true}
                showAdvancedFilters={true}
              />
            </div>

            {/* Bulk Operations */}
            <div className="p-4 border-b">
              <BulkOperations
                projects={displayedProjects}
                selectedProjectIds={selectedProjectIds}
                onSelectionChange={setSelectedProjectIds}
                onProjectsUpdate={onProjectsUpdate}
                folders={folders}
                tags={tags}
              />
            </div>

            {/* Projects Display */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <div className="h-20 bg-muted rounded" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : searching ? (
                <div className="flex items-center justify-center h-64">
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>Searching projects...</span>
                  </div>
                </div>
              ) : displayedProjects.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Showing {displayedProjects.length} of {searchResults.total_count || projects.length} projects
                    </p>
                    
                    <div className="flex items-center space-x-2">
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
                  </div>

                  {viewMode === 'grid' ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {displayedProjects.map((project) => (
                        <Card 
                          key={project.id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleProjectAction('select', project)}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-lg">{project.name}</CardTitle>
                                <CardDescription className="line-clamp-2">
                                  {project.description || 'No description'}
                                </CardDescription>
                              </div>
                              
                              <input
                                type="checkbox"
                                checked={selectedProjectIds.includes(project.id)}
                                onChange={(e) => {
                                  e.stopPropagation()
                                  if (e.target.checked) {
                                    setSelectedProjectIds(prev => [...prev, project.id])
                                  } else {
                                    setSelectedProjectIds(prev => prev.filter(id => id !== project.id))
                                  }
                                }}
                                className="rounded"
                              />
                            </div>
                          </CardHeader>
                          
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs px-2 py-1 bg-muted rounded">
                                  {project.type}
                                </span>
                                <span className="text-xs px-2 py-1 bg-muted rounded">
                                  {project.status}
                                </span>
                              </div>
                              
                              <div className="text-xs text-muted-foreground">
                                {new Date(project.updated_at).toLocaleDateString()}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {displayedProjects.map((project) => (
                        <Card 
                          key={project.id}
                          className="cursor-pointer hover:shadow-sm transition-shadow"
                          onClick={() => handleProjectAction('select', project)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <input
                                  type="checkbox"
                                  checked={selectedProjectIds.includes(project.id)}
                                  onChange={(e) => {
                                    e.stopPropagation()
                                    if (e.target.checked) {
                                      setSelectedProjectIds(prev => [...prev, project.id])
                                    } else {
                                      setSelectedProjectIds(prev => prev.filter(id => id !== project.id))
                                    }
                                  }}
                                  className="rounded"
                                />
                                
                                <div className="flex-1">
                                  <div className="font-medium">{project.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {project.description || 'No description'}
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs px-2 py-1 bg-muted rounded">
                                    {project.type}
                                  </span>
                                  <span className="text-xs px-2 py-1 bg-muted rounded">
                                    {project.status}
                                  </span>
                                </div>
                                
                                <div className="text-xs text-muted-foreground">
                                  {new Date(project.updated_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No projects found
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {Object.keys(searchFilters).length > 0
                        ? 'Try adjusting your search or filters.'
                        : 'Create your first project to get started.'
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}