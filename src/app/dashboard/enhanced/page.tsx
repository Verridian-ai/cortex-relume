'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  Activity, 
  Users, 
  Target, 
  Zap, 
  Clock,
  BarChart3,
  PieChart,
  Calendar,
  Award,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download,
  Heart,
  MessageCircle
} from 'lucide-react'
import { UserStats } from '@/components/dashboard/user-stats'
import { ProjectOverview } from '@/components/dashboard/project-overview'
import { ActivityChart } from '@/components/dashboard/activity-chart'
import { GoalsProgress } from '@/components/dashboard/goals-progress'
import { Recommendations } from '@/components/dashboard/recommendations'
import { Analytics } from './analytics'
import { QuickActions } from './quick-actions'
import { RecentActivity } from './recent-activity'
import { useAuth } from '@/components/auth-provider'

export default function EnhancedDashboard() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    // Load dashboard data
    const loadDashboardData = async () => {
      setLoading(true)
      try {
        // Simulate API call - replace with actual data fetching
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock dashboard data
        const data = {
          overview: {
            totalProjects: 24,
            completedProjects: 18,
            activeProjects: 6,
            totalViews: 2847,
            totalDownloads: 423,
            totalBookmarks: 156,
            totalComments: 89,
            activeUsers: 1234,
            monthlyGrowth: 23.5,
            userGrowth: 18.2
          },
          activity: {
            today: 12,
            thisWeek: 87,
            thisMonth: 234,
            lastActivity: '2 hours ago'
          },
          topProjects: [
            {
              id: '1',
              name: 'E-commerce Website',
              type: 'sitemap',
              status: 'completed',
              views: 342,
              downloads: 56,
              rating: 4.8,
              growth: 15.3
            },
            {
              id: '2', 
              name: 'Corporate Landing Page',
              type: 'wireframe',
              status: 'in-progress',
              views: 289,
              downloads: 34,
              rating: 4.6,
              growth: 8.7
            },
            {
              id: '3',
              name: 'Portfolio Website',
              type: 'style-guide',
              status: 'completed',
              views: 187,
              downloads: 45,
              rating: 4.9,
              growth: 22.1
            }
          ]
        }
        
        setDashboardData(data)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadDashboardData()
    }
  }, [user])

  if (!user) {
    return null
  }

  if (loading || !dashboardData) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="flex-1 space-y-4 p-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-0 pb-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const { overview, activity, topProjects } = dashboardData

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 space-y-4 p-8">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {user.email?.split('@')[0]}!
            </h1>
            <p className="text-muted-foreground mt-2">
              Here's your activity overview and project insights
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild>
              <span>
                <Calendar className="h-4 w-4 mr-2" />
                Last 30 days
              </span>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.totalProjects}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                +{overview.monthlyGrowth}% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.totalViews.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                +12.5% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Downloads</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.totalDownloads}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                +8.3% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.activeUsers.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                +{overview.userGrowth}% growth
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Activity Overview</CardTitle>
                  <CardDescription>Your project activity over the last 30 days</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <ActivityChart />
                </CardContent>
              </Card>
              
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates from your projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentActivity />
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>User Statistics</CardTitle>
                  <CardDescription>Your usage patterns and insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <UserStats />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Project Overview</CardTitle>
                  <CardDescription>Detailed project metrics and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProjectOverview data={topProjects} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Recommendations</CardTitle>
                  <CardDescription>Personalized suggestions based on your activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <Recommendations />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Performance</CardTitle>
                <CardDescription>Detailed analysis of your projects</CardDescription>
              </CardHeader>
              <CardContent>
                <ProjectOverview data={topProjects} detailed />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                  <CardDescription>Your daily activity patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <ActivityChart detailed />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Activity Breakdown</CardTitle>
                  <CardDescription>Types of activities you perform most</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentActivity detailed />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Analytics />
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Goals & Progress</CardTitle>
                <CardDescription>Track your progress towards your objectives</CardDescription>
              </CardHeader>
              <CardContent>
                <GoalsProgress />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </div>
  )
}