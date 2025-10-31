'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  FolderOpen, 
  Zap, 
  Clock, 
  Star, 
  TrendingUp,
  Calendar,
  BarChart3,
  Target,
  Layout,
  Palette,
  Code,
  MoreVertical,
  ExternalLink,
  Trash2,
  Share2
} from 'lucide-react'
import { Nav } from '@/components/layout/nav'
import { format } from 'date-fns'

interface Project {
  id: string
  name: string
  description: string | null
  type: string
  status: string
  created_at: string
  updated_at: string
  data: any
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    thisMonth: 0,
    lastActivity: null as string | null
  })

  useEffect(() => {
    // Simulate loading user projects
    const loadUserData = async () => {
      setLoading(true)
      // Simulate API call - replace with actual Supabase query
      setTimeout(() => {
        const mockProjects: Project[] = [
          {
            id: '1',
            name: 'E-commerce Website',
            description: 'Modern online store with shopping cart functionality',
            type: 'sitemap',
            status: 'completed',
            created_at: '2025-01-15T10:00:00Z',
            updated_at: '2025-01-16T14:30:00Z',
            data: { pages: 12, wireframes: 8 }
          },
          {
            id: '2',
            name: 'Corporate Landing Page',
            description: 'Professional landing page for tech startup',
            type: 'wireframe',
            status: 'in-progress',
            created_at: '2025-01-20T09:15:00Z',
            updated_at: '2025-01-22T11:45:00Z',
            data: { pages: 3, progress: 65 }
          },
          {
            id: '3',
            name: 'Portfolio Website',
            description: 'Creative portfolio with blog functionality',
            type: 'style-guide',
            status: 'draft',
            created_at: '2025-01-25T16:20:00Z',
            updated_at: '2025-01-25T16:20:00Z',
            data: { components: 15, pages: 5 }
          }
        ]
        
        setProjects(mockProjects)
        setStats({
          totalProjects: mockProjects.length,
          completedProjects: mockProjects.filter(p => p.status === 'completed').length,
          thisMonth: mockProjects.filter(p => {
            const createdDate = new Date(p.created_at)
            const now = new Date()
            return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear()
          }).length,
          lastActivity: mockProjects[0]?.updated_at || null
        })
        setLoading(false)
      }, 1000)
    }

    if (user) {
      loadUserData()
    }
  }, [user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'in-progress': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'draft': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sitemap': return Layout
      case 'wireframe': return Target
      case 'style-guide': return Palette
      default: return Code
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Nav isAppLayout />
      
      <main className="flex-1">
        <div className="container py-8">
          {/* Header */}
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome back, {user.email?.split('@')[0]}!
              </h1>
              <p className="text-muted-foreground mt-2">
                Here's what's happening with your projects today.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild>
                <Link href="/app/builder">
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProjects}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.thisMonth} from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedProjects}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((stats.completedProjects / stats.totalProjects) * 100)}% completion rate
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.thisMonth}</div>
                <p className="text-xs text-muted-foreground">
                  Projects created
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.lastActivity ? format(new Date(stats.lastActivity), 'MMM dd') : 'None'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Last project update
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card className="card-hover cursor-pointer" asChild>
              <Link href="/app/builder">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Zap className="h-8 w-8 text-brand-500" />
                    <CardTitle>AI Site Builder</CardTitle>
                  </div>
                  <CardDescription>
                    Create sitemaps and wireframes with AI in minutes
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>
            
            <Card className="card-hover cursor-pointer" asChild>
              <Link href="/app/builder?step=wireframe">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Target className="h-8 w-8 text-brand-500" />
                    <CardTitle>Wireframe Editor</CardTitle>
                  </div>
                  <CardDescription>
                    Design and refine your website layouts
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>
            
            <Card className="card-hover cursor-pointer" asChild>
              <Link href="/app/builder?step=style">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Palette className="h-8 w-8 text-brand-500" />
                    <CardTitle>Style Guide</CardTitle>
                  </div>
                  <CardDescription>
                    Generate comprehensive design systems
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>
          </div>

          {/* Recent Projects */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Projects</h2>
              <Button variant="outline" asChild>
                <Link href="/app/projects">
                  View All
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>

            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
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
            ) : projects.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => {
                  const TypeIcon = getTypeIcon(project.type)
                  return (
                    <Card key={project.id} className="card-hover group">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <TypeIcon className="h-5 w-5 text-brand-500" />
                            <CardTitle className="text-lg">{project.name}</CardTitle>
                          </div>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {project.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className={getStatusColor(project.status)}>
                            {project.status.replace('-', ' ')}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(project.updated_at), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/app/projects/${project.id}`}>
                              View Details
                            </Link>
                          </Button>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Get started by creating your first project with our AI Site Builder.
                  </p>
                  <Button asChild>
                    <Link href="/app/builder">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Project
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}