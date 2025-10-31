'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Activity, 
  FileText, 
  Download, 
  Eye, 
  Heart, 
  Share2, 
  User, 
  Clock,
  Calendar,
  TrendingUp,
  Target,
  Palette,
  Layout,
  Code,
  Star,
  MessageCircle,
  ArrowRight,
  Filter
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface ActivityItem {
  id: string
  type: 'project_created' | 'project_updated' | 'component_viewed' | 'component_downloaded' | 'component_liked' | 'project_shared' | 'comment_added'
  title: string
  description: string
  timestamp: string
  metadata?: {
    projectName?: string
    componentName?: string
    userName?: string
    rating?: number
    downloadCount?: number
    viewCount?: number
  }
  icon: any
  color: string
}

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'project_created',
    title: 'New Project Created',
    description: 'Created "E-commerce Website" project',
    timestamp: '2025-01-31T08:30:00Z',
    metadata: {
      projectName: 'E-commerce Website'
    },
    icon: FileText,
    color: 'text-blue-500'
  },
  {
    id: '2',
    type: 'component_downloaded',
    title: 'Component Downloaded',
    description: 'Downloaded "Navigation Bar" component',
    timestamp: '2025-01-31T07:45:00Z',
    metadata: {
      componentName: 'Navigation Bar'
    },
    icon: Download,
    color: 'text-green-500'
  },
  {
    id: '3',
    type: 'project_updated',
    title: 'Project Updated',
    description: 'Updated wireframes for "Corporate Landing Page"',
    timestamp: '2025-01-31T06:20:00Z',
    metadata: {
      projectName: 'Corporate Landing Page'
    },
    icon: Target,
    color: 'text-purple-500'
  },
  {
    id: '4',
    type: 'component_viewed',
    title: 'Component Viewed',
    description: 'Viewed "Hero Section" component details',
    timestamp: '2025-01-31T05:15:00Z',
    metadata: {
      componentName: 'Hero Section',
      viewCount: 147
    },
    icon: Eye,
    color: 'text-orange-500'
  },
  {
    id: '5',
    type: 'component_liked',
    title: 'Component Liked',
    description: 'Liked "Pricing Table" component',
    timestamp: '2025-01-31T04:30:00Z',
    metadata: {
      componentName: 'Pricing Table',
      rating: 4.8
    },
    icon: Heart,
    color: 'text-red-500'
  },
  {
    id: '6',
    type: 'project_shared',
    title: 'Project Shared',
    description: 'Shared "Portfolio Website" with team',
    timestamp: '2025-01-31T03:45:00Z',
    metadata: {
      projectName: 'Portfolio Website'
    },
    icon: Share2,
    color: 'text-cyan-500'
  },
  {
    id: '7',
    type: 'comment_added',
    title: 'Comment Added',
    description: 'Added comment to "Dashboard Layout" component',
    timestamp: '2025-01-31T02:10:00Z',
    metadata: {
      componentName: 'Dashboard Layout'
    },
    icon: MessageCircle,
    color: 'text-indigo-500'
  },
  {
    id: '8',
    type: 'project_updated',
    title: 'Style Guide Generated',
    description: 'Generated style guide for "Tech Startup" project',
    timestamp: '2025-01-30T18:20:00Z',
    metadata: {
      projectName: 'Tech Startup'
    },
    icon: Palette,
    color: 'text-pink-500'
  }
]

const activityFilters = [
  { id: 'all', label: 'All Activity', count: mockActivities.length },
  { id: 'project', label: 'Projects', count: mockActivities.filter(a => a.type.includes('project')).length },
  { id: 'component', label: 'Components', count: mockActivities.filter(a => a.type.includes('component')).length },
  { id: 'social', label: 'Social', count: mockActivities.filter(a => ['component_liked', 'project_shared', 'comment_added'].includes(a.type)).length }
]

export function RecentActivity({ detailed = false }: { detailed?: boolean }) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    // Simulate loading activities
    const loadActivities = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 500))
      setActivities(mockActivities)
      setLoading(false)
    }

    loadActivities()
  }, [])

  const filteredActivities = activities.filter(activity => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'project') return activity.type.includes('project')
    if (activeFilter === 'component') return activity.type.includes('component')
    if (activeFilter === 'social') return ['component_liked', 'project_shared', 'comment_added'].includes(activity.type)
    return true
  })

  const displayActivities = detailed ? filteredActivities : filteredActivities.slice(0, 5)

  const getActivityAction = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'project_created':
        return 'created'
      case 'project_updated':
        return 'updated'
      case 'component_viewed':
        return 'viewed'
      case 'component_downloaded':
        return 'downloaded'
      case 'component_liked':
        return 'liked'
      case 'project_shared':
        return 'shared'
      case 'comment_added':
        return 'commented on'
      default:
        return 'interacted with'
    }
  }

  const getTargetLink = (activity: ActivityItem) => {
    if (activity.metadata?.projectName) {
      return `/projects/${activity.id}`
    }
    if (activity.metadata?.componentName) {
      return `/components/${activity.id}`
    }
    return '#'
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3 p-3 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-muted"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!detailed) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Recent Activity</h3>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/enhanced/activity">
              View All
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
        
        <ScrollArea className="h-64">
          <div className="space-y-3 pr-3">
            {displayActivities.map((activity) => {
              const Icon = activity.icon
              return (
                <div key={activity.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={cn("p-1.5 rounded-full bg-muted", activity.color)}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-xs font-medium">
                      <span className="capitalize">{getActivityAction(activity)}</span>
                      {' '}
                      <span className="text-muted-foreground">
                        {activity.metadata?.projectName || activity.metadata?.componentName}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Tabs value={activeFilter} onValueChange={setActiveFilter} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          {activityFilters.map((filter) => (
            <TabsTrigger key={filter.id} value={filter.id}>
              {filter.label}
              <Badge variant="secondary" className="ml-2">
                {filter.count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeFilter} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Activity Timeline
              </CardTitle>
              <CardDescription>
                Detailed view of all your activities and interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4 pr-3">
                  {filteredActivities.map((activity) => {
                    const Icon = activity.icon
                    return (
                      <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className={cn("p-2 rounded-full bg-muted", activity.color)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-sm font-medium">{activity.title}</h4>
                              <p className="text-sm text-muted-foreground">{activity.description}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {format(new Date(activity.timestamp), 'MMM dd, HH:mm')}
                            </Badge>
                          </div>
                          
                          {activity.metadata && (
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              {activity.metadata.projectName && (
                                <span className="flex items-center">
                                  <FileText className="h-3 w-3 mr-1" />
                                  {activity.metadata.projectName}
                                </span>
                              )}
                              {activity.metadata.componentName && (
                                <span className="flex items-center">
                                  <Code className="h-3 w-3 mr-1" />
                                  {activity.metadata.componentName}
                                </span>
                              )}
                              {activity.metadata.rating && (
                                <span className="flex items-center">
                                  <Star className="h-3 w-3 mr-1" />
                                  {activity.metadata.rating}
                                </span>
                              )}
                              {activity.metadata.viewCount && (
                                <span className="flex items-center">
                                  <Eye className="h-3 w-3 mr-1" />
                                  {activity.metadata.viewCount} views
                                </span>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                            </span>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={getTargetLink(activity)}>
                                View
                                <ArrowRight className="h-3 w-3 ml-1" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}