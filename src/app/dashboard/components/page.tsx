'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Puzzle, 
  Clock, 
  Star, 
  TrendingUp,
  Calendar,
  BarChart3,
  Target,
  Layout,
  Search,
  Filter,
  Download,
  Eye,
  Heart,
  Grid3X3,
  Package,
  Code,
  Zap,
  ArrowRight,
  BookmarkPlus,
  History
} from 'lucide-react'
import { Nav } from '@/components/layout/nav'
import { format, formatDistanceToNow } from 'date-fns'

interface ComponentUsage {
  id: string
  name: string
  category: string
  lastUsed: string
  usageCount: number
  favorite: boolean
  preview?: string
}

interface ComponentStats {
  totalComponents: number
  recentlyUsed: number
  favorites: number
  categories: number
}

export default function ComponentLibraryDashboard() {
  const { user } = useAuth()
  const [recentComponents, setRecentComponents] = useState<ComponentUsage[]>([])
  const [favoriteComponents, setFavoriteComponents] = useState<ComponentUsage[]>([])
  const [stats, setStats] = useState<ComponentStats>({
    totalComponents: 0,
    recentlyUsed: 0,
    favorites: 0,
    categories: 5
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading component data
    const loadComponentData = async () => {
      setLoading(true)
      
      // Mock data - replace with actual API calls
      setTimeout(() => {
        const mockRecentComponents: ComponentUsage[] = [
          {
            id: '1',
            name: 'Navigation Header',
            category: 'Navigation',
            lastUsed: '2025-01-28T10:30:00Z',
            usageCount: 12,
            favorite: true
          },
          {
            id: '2',
            name: 'Contact Form',
            category: 'Forms',
            lastUsed: '2025-01-27T16:45:00Z',
            usageCount: 8,
            favorite: false
          },
          {
            id: '3',
            name: 'Hero Section',
            category: 'Layout',
            lastUsed: '2025-01-26T09:15:00Z',
            usageCount: 15,
            favorite: true
          },
          {
            id: '4',
            name: 'Image Gallery',
            category: 'Content',
            lastUsed: '2025-01-25T14:20:00Z',
            usageCount: 6,
            favorite: false
          },
          {
            id: '5',
            name: 'Modal Dialog',
            category: 'Interactive',
            lastUsed: '2025-01-24T11:00:00Z',
            usageCount: 9,
            favorite: true
          }
        ]

        const mockFavoriteComponents: ComponentUsage[] = [
          {
            id: '1',
            name: 'Navigation Header',
            category: 'Navigation',
            lastUsed: '2025-01-28T10:30:00Z',
            usageCount: 12,
            favorite: true
          },
          {
            id: '3',
            name: 'Hero Section',
            category: 'Layout',
            lastUsed: '2025-01-26T09:15:00Z',
            usageCount: 15,
            favorite: true
          },
          {
            id: '5',
            name: 'Modal Dialog',
            category: 'Interactive',
            lastUsed: '2025-01-24T11:00:00Z',
            usageCount: 9,
            favorite: true
          }
        ]

        setRecentComponents(mockRecentComponents)
        setFavoriteComponents(mockFavoriteComponents)
        setStats({
          totalComponents: 250,
          recentlyUsed: 42,
          favorites: 18,
          categories: 5
        })
        setLoading(false)
      }, 1000)
    }

    if (user) {
      loadComponentData()
    }
  }, [user])

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'navigation': return Grid3X3
      case 'forms': return Package
      case 'layout': return Layout
      case 'content': return Target
      case 'interactive': return Puzzle
      default: return Code
    }
  }

  const toggleFavorite = (componentId: string) => {
    setRecentComponents(prev => 
      prev.map(comp => 
        comp.id === componentId 
          ? { ...comp, favorite: !comp.favorite }
          : comp
      )
    )
    setFavoriteComponents(prev => {
      const component = recentComponents.find(c => c.id === componentId)
      if (component) {
        if (component.favorite) {
          return prev.filter(c => c.id !== componentId)
        } else {
          return [...prev, { ...component, favorite: true }]
        }
      }
      return prev
    })
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
                Component Library
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your reusable components and boost your development workflow.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild variant="outline">
                <Link href="/app/components/browse">
                  <Search className="h-4 w-4 mr-2" />
                  Browse Components
                </Link>
              </Button>
              <Button asChild>
                <Link href="/app/components/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Component
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Components</CardTitle>
                <Puzzle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalComponents}</div>
                <p className="text-xs text-muted-foreground">
                  Available in library
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recently Used</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.recentlyUsed}</div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Favorites</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.favorites}</div>
                <p className="text-xs text-muted-foreground">
                  Quick access list
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <Layout className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.categories}</div>
                <p className="text-xs text-muted-foreground">
                  Organized sections
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card className="card-hover cursor-pointer" asChild>
              <Link href="/app/components/integrations">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Download className="h-8 w-8 text-brand-500" />
                    <CardTitle>Component Installer</CardTitle>
                  </div>
                  <CardDescription>
                    Install components directly to your projects
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>
            
            <Card className="card-hover cursor-pointer" asChild>
              <Link href="/app/components/assistant">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Zap className="h-8 w-8 text-brand-500" />
                    <CardTitle>AI Assistant</CardTitle>
                  </div>
                  <CardDescription>
                    Get intelligent component recommendations
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>
            
            <Card className="card-hover cursor-pointer" asChild>
              <Link href="/app/components/wireframe">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Target className="h-8 w-8 text-brand-500" />
                    <CardTitle>Wireframe Converter</CardTitle>
                  </div>
                  <CardDescription>
                    Convert wireframe elements to components
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Recent Components */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Recently Used</h2>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/app/components/history">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 bg-muted rounded"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4"></div>
                            <div className="h-3 bg-muted rounded w-1/2"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {recentComponents.map((component) => {
                    const CategoryIcon = getCategoryIcon(component.category)
                    return (
                      <Card key={component.id} className="card-hover">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4">
                            <div className="h-10 w-10 rounded-lg bg-brand-500/10 flex items-center justify-center">
                              <CategoryIcon className="h-5 w-5 text-brand-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">{component.name}</h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {component.category}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(component.lastUsed))} ago
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleFavorite(component.id)}
                                className={component.favorite ? 'text-yellow-500' : 'text-muted-foreground'}
                              >
                                <Star className={`h-4 w-4 ${component.favorite ? 'fill-current' : ''}`} />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Favorite Components */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Favorites</h2>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/app/components/favorites">
                    Manage
                    <Star className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 bg-muted rounded"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4"></div>
                            <div className="h-3 bg-muted rounded w-1/2"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {favoriteComponents.map((component) => {
                    const CategoryIcon = getCategoryIcon(component.category)
                    return (
                      <Card key={component.id} className="card-hover">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4">
                            <div className="h-10 w-10 rounded-lg bg-brand-500/10 flex items-center justify-center">
                              <CategoryIcon className="h-5 w-5 text-brand-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">{component.name}</h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {component.category}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  Used {component.usageCount} times
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Component Categories Overview */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Browse by Category</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {[
                { name: 'Layout', icon: Layout, count: 45, color: 'text-blue-500' },
                { name: 'Navigation', icon: Grid3X3, count: 32, color: 'text-green-500' },
                { name: 'Forms', icon: Package, count: 28, color: 'text-purple-500' },
                { name: 'Interactive', icon: Puzzle, count: 38, color: 'text-orange-500' },
                { name: 'Content', icon: Target, count: 25, color: 'text-pink-500' }
              ].map((category) => {
                const Icon = category.icon
                return (
                  <Card key={category.name} className="card-hover cursor-pointer" asChild>
                    <Link href={`/app/components/browse?category=${category.name.toLowerCase()}`}>
                      <CardContent className="p-6 text-center">
                        <Icon className={`h-8 w-8 ${category.color} mx-auto mb-2`} />
                        <h3 className="font-medium mb-1">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.count} components</p>
                      </CardContent>
                    </Link>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
