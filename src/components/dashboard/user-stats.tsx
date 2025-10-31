'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  User, 
  Activity, 
  Clock, 
  Target, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Award,
  Zap,
  Eye,
  Download,
  Heart,
  MessageCircle,
  BarChart3,
  Users,
  Star,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { format, subDays } from 'date-fns'
import { cn } from '@/lib/utils'

interface UserStats {
  totalSessions: number
  avgSessionDuration: number
  totalPageViews: number
  engagementRate: number
  mostActiveHours: number[]
  mostVisitedPages: string[]
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  completedActions: number
  streakDays: number
  achievements: Array<{
    id: string
    name: string
    description: string
    icon: string
    earned: boolean
    earnedDate?: Date
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
  }>
  weeklyActivity: Array<{
    day: string
    sessions: number
    duration: number
  }>
  userPreferences: {
    favoriteTimeToWork: string
    mostUsedFeature: string
    avgProjectsPerWeek: number
    collaborationScore: number
  }
  growthMetrics: {
    thisWeekVsLast: number
    thisMonthVsLast: number
    productivityScore: number
    learningProgress: number
  }
}

const mockAchievements = [
  {
    id: 'first_project',
    name: 'First Steps',
    description: 'Created your first project',
    icon: 'Target',
    earned: true,
    earnedDate: subDays(new Date(), 10),
    rarity: 'common' as const
  },
  {
    id: 'power_user',
    name: 'Power User',
    description: 'Used the platform for 7 days in a row',
    icon: 'Zap',
    earned: true,
    earnedDate: subDays(new Date(), 5),
    rarity: 'rare' as const
  },
  {
    id: 'collaborator',
    name: 'Team Player',
    description: 'Shared 5 projects with collaborators',
    icon: 'Users',
    earned: false,
    rarity: 'epic' as const
  },
  {
    id: 'innovator',
    name: 'Innovation Master',
    description: 'Created 10 unique projects',
    icon: 'Award',
    earned: false,
    rarity: 'legendary' as const
  }
]

export function UserStats() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading user stats
    const loadUserStats = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Mock user stats data
      const data: UserStats = {
        totalSessions: 47,
        avgSessionDuration: 425, // seconds
        totalPageViews: 284,
        engagementRate: 78.5,
        mostActiveHours: [9, 14, 19], // 9AM, 2PM, 7PM
        mostVisitedPages: ['/dashboard', '/components', '/builder', '/profile'],
        skillLevel: 'intermediate',
        completedActions: 156,
        streakDays: 5,
        achievements: mockAchievements,
        weeklyActivity: [
          { day: 'Mon', sessions: 8, duration: 320 },
          { day: 'Tue', sessions: 12, duration: 480 },
          { day: 'Wed', sessions: 6, duration: 245 },
          { day: 'Thu', sessions: 10, duration: 395 },
          { day: 'Fri', sessions: 7, duration: 280 },
          { day: 'Sat', sessions: 2, duration: 85 },
          { day: 'Sun', sessions: 2, duration: 120 }
        ],
        userPreferences: {
          favoriteTimeToWork: '14:00',
          mostUsedFeature: 'AI Builder',
          avgProjectsPerWeek: 2.3,
          collaborationScore: 65
        },
        growthMetrics: {
          thisWeekVsLast: 23.5,
          thisMonthVsLast: 18.7,
          productivityScore: 82,
          learningProgress: 67
        }
      }
      
      setStats(data)
      setLoading(false)
    }

    loadUserStats()
  }, [])

  if (loading || !stats) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-muted rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-500'
      case 'intermediate': return 'text-blue-500'
      case 'advanced': return 'text-purple-500'
      default: return 'text-gray-500'
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-500 bg-gray-100'
      case 'rare': return 'text-blue-500 bg-blue-100'
      case 'epic': return 'text-purple-500 bg-purple-100'
      case 'legendary': return 'text-yellow-500 bg-yellow-100'
      default: return 'text-gray-500 bg-gray-100'
    }
  }

  const getHourLabel = (hour: number) => {
    if (hour === 0) return '12 AM'
    if (hour === 12) return '12 PM'
    if (hour < 12) return `${hour} AM`
    return `${hour - 12} PM`
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Engagement Rate</span>
            <Badge variant={stats.engagementRate > 70 ? 'default' : 'secondary'}>
              {stats.engagementRate}%
            </Badge>
          </div>
          <Progress value={stats.engagementRate} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {stats.engagementRate > 70 ? 'Excellent' : 'Good'} engagement level
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Learning Progress</span>
            <Badge variant={stats.growthMetrics.learningProgress > 60 ? 'default' : 'secondary'}>
              {stats.growthMetrics.learningProgress}%
            </Badge>
          </div>
          <Progress value={stats.growthMetrics.learningProgress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {stats.growthMetrics.learningProgress > 60 ? 'Advanced' : 'Developing'} skill level
          </p>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stats.growthMetrics.thisWeekVsLast > 0 ? (
                <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-1 text-red-500" />
              )}
              {Math.abs(stats.growthMetrics.thisWeekVsLast)}% from last week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(stats.avgSessionDuration / 60)}m {stats.avgSessionDuration % 60}s
            </div>
            <p className="text-xs text-muted-foreground">
              Above platform average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.streakDays} days</div>
            <p className="text-xs text-muted-foreground">
              Keep it up!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Weekly Activity</h4>
          <Badge variant="outline">{stats.growthMetrics.productivityScore}% Productivity</Badge>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {stats.weeklyActivity.map((day) => {
            const maxSessions = Math.max(...stats.weeklyActivity.map(d => d.sessions))
            const height = (day.sessions / maxSessions) * 60
            
            return (
              <div key={day.day} className="text-center">
                <div className="h-16 flex items-end justify-center mb-2">
                  <div 
                    className="bg-brand-500 rounded-t w-6 transition-all hover:bg-brand-600"
                    style={{ height: `${height}px` }}
                    title={`${day.sessions} sessions (${Math.floor(day.duration / 60)}m)`}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{day.day}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Skills & Preferences */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Skills & Activity</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Skill Level</span>
              <Badge className={getSkillLevelColor(stats.skillLevel)}>
                {stats.skillLevel}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Actions Completed</span>
              <span className="text-sm font-medium">{stats.completedActions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Projects/Week</span>
              <span className="text-sm font-medium">{stats.userPreferences.avgProjectsPerWeek}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Preferences</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Best Time</span>
              <span className="text-sm font-medium">
                {getHourLabel(stats.userPreferences.favoriteTimeToWork)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Top Feature</span>
              <span className="text-sm font-medium">{stats.userPreferences.mostUsedFeature}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Collaboration</span>
              <span className="text-sm font-medium">{stats.userPreferences.collaborationScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Achievements</h4>
          <Badge variant="outline">
            {stats.achievements.filter(a => a.earned).length}/{stats.achievements.length}
          </Badge>
        </div>
        <div className="grid gap-2">
          {stats.achievements.map((achievement) => {
            const IconComponent = 
              achievement.icon === 'Target' ? Target :
              achievement.icon === 'Zap' ? Zap :
              achievement.icon === 'Users' ? Users :
              achievement.icon === 'Award' ? Award : Award

            return (
              <div 
                key={achievement.id} 
                className={cn(
                  "flex items-center space-x-3 p-2 rounded-lg border",
                  achievement.earned 
                    ? "bg-muted/50 border-primary/20" 
                    : "opacity-60 border-muted"
                )}
              >
                <div className={cn(
                  "p-2 rounded-full",
                  achievement.earned 
                    ? getRarityColor(achievement.rarity)
                    : "bg-muted"
                )}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{achievement.name}</p>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  {achievement.earned && achievement.earnedDate && (
                    <p className="text-xs text-muted-foreground">
                      Earned {format(achievement.earnedDate, 'MMM dd, yyyy')}
                    </p>
                  )}
                </div>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", getRarityColor(achievement.rarity))}
                >
                  {achievement.rarity}
                </Badge>
              </div>
            )
          })}
        </div>
      </div>

      {/* Most Active Hours */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Most Active Hours</h4>
        <div className="flex flex-wrap gap-2">
          {stats.mostActiveHours.map((hour) => (
            <Badge key={hour} variant="secondary">
              {getHourLabel(hour)}
            </Badge>
          ))}
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Weekly Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{stats.growthMetrics.thisWeekVsLast}%
            </div>
            <p className="text-xs text-muted-foreground">
              Compared to last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{stats.growthMetrics.thisMonthVsLast}%
            </div>
            <p className="text-xs text-muted-foreground">
              Compared to last month
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}