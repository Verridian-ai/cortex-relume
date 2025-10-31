'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Zap, 
  Target, 
  Palette, 
  FileText, 
  Download, 
  Share2, 
  Settings,
  Plus,
  Search,
  BookOpen,
  Users,
  BarChart3,
  Clock,
  Star,
  Bookmark,
  TrendingUp,
  Award,
  Activity,
  Layout,
  Code,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: any
  href: string
  category: 'create' | 'manage' | 'analyze' | 'discover'
  color: string
  featured?: boolean
}

const quickActions: QuickAction[] = [
  {
    id: '1',
    title: 'AI Site Builder',
    description: 'Create complete websites with AI assistance',
    icon: Zap,
    href: '/app/builder',
    category: 'create',
    color: 'text-blue-500',
    featured: true
  },
  {
    id: '2',
    title: 'Wireframe Editor',
    description: 'Design and refine website layouts',
    icon: Target,
    href: '/app/builder?step=wireframe',
    category: 'create',
    color: 'text-green-500'
  },
  {
    id: '3',
    title: 'Style Guide Generator',
    description: 'Generate comprehensive design systems',
    icon: Palette,
    href: '/app/builder?step=style',
    category: 'create',
    color: 'text-purple-500'
  },
  {
    id: '4',
    title: 'Sitemap Creator',
    description: 'Plan your website structure',
    icon: Layout,
    href: '/app/builder?step=sitemap',
    category: 'create',
    color: 'text-orange-500'
  },
  {
    id: '5',
    title: 'Project Manager',
    description: 'Manage and organize your projects',
    icon: FileText,
    href: '/dashboard/projects',
    category: 'manage',
    color: 'text-indigo-500'
  },
  {
    id: '6',
    title: 'Analytics Dashboard',
    description: 'View detailed performance metrics',
    icon: BarChart3,
    href: '/dashboard/enhanced/analytics',
    category: 'analyze',
    color: 'text-pink-500'
  },
  {
    id: '7',
    title: 'Component Library',
    description: 'Browse and use pre-built components',
    icon: Code,
    href: '/components',
    category: 'discover',
    color: 'text-cyan-500'
  },
  {
    id: '8',
    title: 'Export Tools',
    description: 'Export projects in various formats',
    icon: Download,
    href: '/app/export',
    category: 'manage',
    color: 'text-red-500'
  }
]

const recentActions = [
  { action: 'Updated E-commerce Website', time: '2 hours ago', icon: FileText },
  { action: 'Downloaded 3 Components', time: '4 hours ago', icon: Download },
  { action: 'Created Wireframe for Landing Page', time: '1 day ago', icon: Target },
  { action: 'Generated Style Guide', time: '2 days ago', icon: Palette },
  { action: 'Shared Project with Team', time: '3 days ago', icon: Share2 }
]

const popularActions = [
  { action: 'AI Site Builder', usage: 234, trend: '+12%' },
  { action: 'Component Library', usage: 189, trend: '+8%' },
  { action: 'Analytics Dashboard', usage: 156, trend: '+15%' },
  { action: 'Export Tools', usage: 143, trend: '+5%' },
  { action: 'Wireframe Editor', usage: 127, trend: '+3%' }
]

export function QuickActions() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const categories = [
    { id: 'all', label: 'All Actions', count: quickActions.length },
    { id: 'create', label: 'Create', count: quickActions.filter(a => a.category === 'create').length },
    { id: 'manage', label: 'Manage', count: quickActions.filter(a => a.category === 'manage').length },
    { id: 'analyze', label: 'Analyze', count: quickActions.filter(a => a.category === 'analyze').length },
    { id: 'discover', label: 'Discover', count: quickActions.filter(a => a.category === 'discover').length }
  ]

  const filteredActions = quickActions.filter(action => {
    const matchesSearch = action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         action.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === 'all' || action.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Quick Actions Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Fast access to your most common tasks and tools
          </CardDescription>
          
          {/* Search and Filter */}
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search actions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="flex items-center space-x-2 overflow-x-auto">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory(category.id)}
                  className="whitespace-nowrap"
                >
                  {category.label}
                  <Badge variant="secondary" className="ml-2">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {filteredActions.map((action) => {
              const Icon = action.icon
              return (
                <Card 
                  key={action.id} 
                  className={cn(
                    "group cursor-pointer transition-all hover:shadow-md",
                    action.featured && "border-brand-200 bg-brand-50/50 dark:border-brand-800 dark:bg-brand-950/20"
                  )}
                  asChild
                >
                  <Link href={action.href}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className={cn("p-2 rounded-lg bg-muted", action.color)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        {action.featured && (
                          <Badge variant="default" className="text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base group-hover:text-brand-600 transition-colors">
                        {action.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-sm">
                        {action.description}
                      </CardDescription>
                    </CardContent>
                  </Link>
                </Card>
              )
            })}
          </div>
          
          {filteredActions.length === 0 && (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No actions found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search query or category filter
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity & Popular Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Recent Actions
            </CardTitle>
            <CardDescription>
              Your latest activities and tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActions.map((item, index) => {
                const Icon = item.icon
                return (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="p-1.5 rounded-full bg-muted">
                      <Icon className="h-3 w-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.time}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4" asChild>
              <Link href="/dashboard/enhanced/activity">
                View All Activity
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Popular Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Popular Actions
            </CardTitle>
            <CardDescription>
              Most used tools and features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {popularActions.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {item.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.usage} uses
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {item.trend}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}