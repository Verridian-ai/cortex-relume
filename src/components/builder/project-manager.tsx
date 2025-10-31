'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FolderOpen, 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Calendar,
  Clock,
  Star,
  MoreVertical,
  ExternalLink,
  Trash2,
  Share2,
  Edit3,
  Download,
  Eye,
  Copy
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface Project {
  id: string
  name: string
  description: string | null
  type: 'sitemap' | 'wireframe' | 'style-guide'
  status: 'draft' | 'in-progress' | 'completed'
  created_at: string
  updated_at: string
  data: {
    pages?: number
    wireframes?: number
    components?: number
    progress?: number
  }
  is_public?: boolean
}

interface ProjectManagerProps {
  onSelectProject?: (project: Project) => void
  selectedProjectId?: string
  showCreateButton?: boolean
  className?: string
}

export function ProjectManager({ 
  onSelectProject, 
  selectedProjectId,
  showCreateButton = true,
  className 
}: ProjectManagerProps) {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    loadUserProjects()
  }, [user])

  const loadUserProjects = async () => {
    if (!user) return
    
    setLoading(true)
    // Simulate API call - replace with actual Supabase query
    setTimeout(() => {
      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'E-commerce Website',
          description: 'Modern online store with shopping cart functionality and payment integration',
          type: 'sitemap',
          status: 'completed',
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-16T14:30:00Z',
          data: { pages: 12, wireframes: 8 },
          is_public: false
        },
        {
          id: '2',
          name: 'Corporate Landing Page',
          description: 'Professional landing page for tech startup with hero section and features',
          type: 'wireframe',
          status: 'in-progress',
          created_at: '2025-01-20T09:15:00Z',
          updated_at: '2025-01-22T11:45:00Z',
          data: { pages: 3, progress: 65 },
          is_public: true
        },
        {
          id: '3',
          name: 'Portfolio Website',
          description: 'Creative portfolio with blog functionality and project showcase',
          type: 'style-guide',
          status: 'draft',
          created_at: '2025-01-25T16:20:00Z',
          updated_at: '2025-01-25T16:20:00Z',
          data: { components: 15, pages: 5 },
          is_public: false
        },
        {
          id: '4',
          name: 'SaaS Dashboard',
          description: 'Modern SaaS dashboard with analytics and user management',
          type: 'sitemap',
          status: 'completed',
          created_at: '2025-01-18T08:30:00Z',
          updated_at: '2025-01-19T16:20:00Z',
          data: { pages: 20, wireframes: 15 },
          is_public: true
        },
        {
          id: '5',
          name: 'Restaurant Website',
          description: 'Restaurant website with menu, reservation system, and gallery',
          type: 'wireframe',
          status: 'in-progress',
          created_at: '2025-01-22T14:10:00Z',
          updated_at: '2025-01-24T10:15:00Z',
          data: { pages: 8, progress: 40 },
          is_public: false
        }
      ]
      setProjects(mockProjects)
      setLoading(false)
    }, 800)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'in-progress': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'draft': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sitemap': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'wireframe': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      case 'style-guide': return 'bg-pink-500/10 text-pink-500 border-pink-500/20'
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sitemap': return FolderOpen
      case 'wireframe': return Eye
      case 'style-guide': return Star
      default: return FolderOpen
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || project.type === filterType
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus
    
    return matchesSearch && matchesType && matchesStatus
  })

  const handleProjectAction = (action: string, project: Project) => {
    switch (action) {
      case 'view':
        onSelectProject?.(project)
        break
      case 'duplicate':
        // Handle duplicate project
        break
      case 'export':
        // Handle export project
        break
      case 'share':
        // Handle share project
        break
      case 'delete':
        // Handle delete project
        break
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Please sign in to view your projects.</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Projects</h2>
          <p className="text-muted-foreground">
            Manage and organize your website design projects
          </p>
        </div>
        {showCreateButton && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">All Types</option>
                <option value="sitemap">Sitemap</option>
                <option value="wireframe">Wireframe</option>
                <option value="style-guide">Style Guide</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
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
        </CardHeader>
      </Card>

      {/* Projects Grid/List */}
      {loading ? (
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' 
            : 'space-y-4'
        )}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' 
            : 'space-y-4'
        )}>
          {filteredProjects.map((project) => {
            const TypeIcon = getTypeIcon(project.type)
            return (
              <Card 
                key={project.id} 
                className={cn(
                  'card-hover group cursor-pointer',
                  selectedProjectId === project.id && 'ring-2 ring-brand-500'
                )}
                onClick={() => onSelectProject?.(project)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <TypeIcon className="h-5 w-5 text-brand-500" />
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      {project.is_public && (
                        <Badge variant="outline" className="text-xs">
                          Public
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className={getTypeColor(project.type)}>
                      {project.type.replace('-', ' ')}
                    </Badge>
                    <Badge variant="outline" className={getStatusColor(project.status)}>
                      {project.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  
                  {viewMode === 'grid' ? (
                    <>
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        {project.data.pages && (
                          <div>• {project.data.pages} pages</div>
                        )}
                        {project.data.wireframes && (
                          <div>• {project.data.wireframes} wireframes</div>
                        )}
                        {project.data.components && (
                          <div>• {project.data.components} components</div>
                        )}
                        {project.data.progress && (
                          <div>• {project.data.progress}% complete</div>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(project.updated_at), 'MMM dd, yyyy')}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleProjectAction('view', project)
                            }}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleProjectAction('duplicate', project)
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-muted-foreground">
                          {project.data.pages && `${project.data.pages} pages`}
                          {project.data.wireframes && ` • ${project.data.wireframes} wireframes`}
                          {project.data.components && ` • ${project.data.components} components`}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(project.updated_at), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery || filterType !== 'all' || filterStatus !== 'all' 
                ? 'No matching projects' 
                : 'No projects yet'
              }
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Get started by creating your first project with our AI Site Builder.'
              }
            </p>
            {(!searchQuery && filterType === 'all' && filterStatus === 'all') && showCreateButton && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}