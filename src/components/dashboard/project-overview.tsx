'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  FolderOpen, 
  TrendingUp, 
  TrendingDown,
  Eye, 
  Download, 
  Star,
  Calendar,
  Clock,
  Target,
  Layout,
  Palette,
  Code,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Share2,
  Trash2,
  Edit,
  BarChart3,
  Users
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Project {
  id: string
  name: string
  type: 'sitemap' | 'wireframe' | 'style-guide'
  status: 'completed' | 'in-progress' | 'draft'
  created_at: string
  updated_at: string
  views: number
  downloads: number
  rating: number
  growth: number
  collaborators?: number
  tags?: string[]
  progress?: number
}

interface ProjectOverviewProps {
  data: Project[]
  detailed?: boolean
}

const projectTypeIcons = {
  'sitemap': Layout,
  'wireframe': Target,
  'style-guide': Palette
}

const statusColors = {
  'completed': 'bg-green-500/10 text-green-500 border-green-500/20',
  'in-progress': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'draft': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
}

export function ProjectOverview({ data, detailed = false }: ProjectOverviewProps) {
  const [projects, setProjects] = useState<Project[]>(data)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(false)

  const stats = {
    total: projects.length,
    completed: projects.filter(p => p.status === 'completed').length,
    inProgress: projects.filter(p => p.status === 'in-progress').length,
    draft: projects.filter(p => p.status === 'draft').length,
    totalViews: projects.reduce((sum, p) => sum + p.views, 0),
    totalDownloads: projects.reduce((sum, p) => sum + p.downloads, 0),
    avgRating: projects.reduce((sum, p) => sum + p.rating, 0) / projects.length || 0,
    avgGrowth: projects.reduce((sum, p) => sum + p.growth, 0) / projects.length || 0
  }

  const getProjectTypeIcon = (type: string) => {
    return projectTypeIcons[type as keyof typeof projectTypeIcons] || Code
  }

  const getStatusColor = (status: string) => {
    return statusColors[status as keyof typeof statusColors] || statusColors.draft
  }

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-500'
    if (growth < 0) return 'text-red-500'
    return 'text-gray-500'
  }

  if (!detailed) {
    return (
      <div className="space-y-4">
        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completion Rate</span>
              <span className="text-sm text-muted-foreground">
                {Math.round((stats.completed / stats.total) * 100)}%
              </span>
            </div>
            <Progress value={(stats.completed / stats.total) * 100} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Avg. Rating</span>
              <span className="text-sm text-muted-foreground">
                {stats.avgRating.toFixed(1)}/5
              </span>
            </div>
            <Progress value={(stats.avgRating / 5) * 100} className="h-2" />
          </div>
        </div>

        {/* Project List */}
        <div className="space-y-3">
          {projects.slice(0, 3).map((project) => {
            const TypeIcon = getProjectTypeIcon(project.type)
            return (
              <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <TypeIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">{project.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className={cn("text-xs", getStatusColor(project.status))}>
                        {project.status.replace('-', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-3 w-3" />
                    <span>{project.views}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Download className="h-3 w-3" />
                    <span>{project.downloads}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3" />
                    <span>{project.rating}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href="/dashboard/projects">
            View All Projects
            <ArrowUpRight className="h-3 w-3 ml-2" />
          </Link>
        </Button>
      </div>
    )
  }

  // Detailed view for analytics tab
  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stats.avgGrowth > 0 ? (
                <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-1 text-red-500" />
              )}
              {Math.abs(stats.avgGrowth).toFixed(1)}% avg growth
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDownloads}</div>
            <p className="text-xs text-muted-foreground">
              Total project exports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Out of 5 stars
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Project Analysis Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Project Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Completed</span>
                    </div>
                    <span className="text-sm font-medium">{stats.completed}</span>
                  </div>
                  <Progress value={(stats.completed / stats.total) * 100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm">In Progress</span>
                    </div>
                    <span className="text-sm font-medium">{stats.inProgress}</span>
                  </div>
                  <Progress value={(stats.inProgress / stats.total) * 100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm">Draft</span>
                    </div>
                    <span className="text-sm font-medium">{stats.draft}</span>
                  </div>
                  <Progress value={(stats.draft / stats.total) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Project Types */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Project Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(
                  projects.reduce((acc, p) => {
                    acc[p.type] = (acc[p.type] || 0) + 1
                    return acc
                  }, {} as Record<string, number>)
                ).map(([type, count]) => {
                  const TypeIcon = getProjectTypeIcon(type)
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TypeIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm capitalize">{type.replace('-', ' ')}</span>
                      </div>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Updates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {projects
                  .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                  .slice(0, 3)
                  .map((project) => (
                    <div key={project.id} className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{project.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="space-y-4">
            {projects.map((project) => {
              const TypeIcon = getProjectTypeIcon(project.type)
              return (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <TypeIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{project.name}</CardTitle>
                          <CardDescription>
                            {project.type.replace('-', ' ')} • {project.status}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={cn("text-xs", getStatusColor(project.status))}>
                          {project.status.replace('-', ' ')}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Views</span>
                          <span className="text-sm font-medium">{project.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {project.views > 100 ? 'High' : project.views > 50 ? 'Medium' : 'Low'} traffic
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Downloads</span>
                          <span className="text-sm font-medium">{project.downloads}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Download className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {project.downloads > 20 ? 'Popular' : project.downloads > 10 ? 'Good' : 'Needs work'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Rating</span>
                          <span className="text-sm font-medium">{project.rating}/5</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {project.rating > 4 ? 'Excellent' : project.rating > 3 ? 'Good' : 'Needs improvement'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Growth</span>
                          <span className={cn("text-sm font-medium", getGrowthColor(project.growth))}>
                            {project.growth > 0 ? '+' : ''}{project.growth}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {project.growth > 0 ? (
                            <TrendingUp className="h-3 w-3 text-green-500" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-500" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {project.growth > 0 ? 'Growing' : 'Declining'} trend
                          </span>
                        </div>
                      </div>
                    </div>

                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {project.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Project Timeline</CardTitle>
              <CardDescription>
                Chronological view of your project activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects
                  .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                  .map((project, index) => {
                    const TypeIcon = getProjectTypeIcon(project.type)
                    const isLast = index === projects.length - 1
                    
                    return (
                      <div key={project.id} className="flex items-start space-x-4">
                        <div className="flex flex-col items-center">
                          <div className="p-2 rounded-full bg-muted">
                            <TypeIcon className="h-4 w-4" />
                          </div>
                          {!isLast && <div className="w-px h-8 bg-border mt-2"></div>}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">{project.name}</h4>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(project.updated_at), 'MMM dd, HH:mm')}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {project.type.replace('-', ' ')} • {project.status}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>{project.views} views</span>
                            <span>{project.downloads} downloads</span>
                            <span>{project.rating}/5 rating</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}