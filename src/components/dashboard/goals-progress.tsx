'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Target, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Award,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  ArrowRight,
  Star,
  Zap,
  Users,
  BarChart3,
  Trophy,
  Flag
} from 'lucide-react'
import { format, addDays, differenceInDays } from 'date-fns'
import { cn } from '@/lib/utils'

interface Goal {
  id: string
  title: string
  description: string
  category: 'productivity' | 'learning' | 'collaboration' | 'quality' | 'growth'
  target: number
  current: number
  unit: string
  targetDate: Date
  status: 'on-track' | 'at-risk' | 'behind' | 'achieved' | 'paused'
  priority: 'low' | 'medium' | 'high' | 'critical'
  milestones: Array<{
    id: string
    title: string
    target: number
    achieved: boolean
    achievedDate?: Date
  }>
  progress: number // percentage
  weeklyProgress: number
  createdAt: Date
  updatedAt: Date
  tags: string[]
}

interface Milestone {
  id: string
  goalId: string
  title: string
  target: number
  achieved: boolean
  achievedDate?: Date
  targetDate: Date
}

const mockGoals: Goal[] = [
  {
    id: '1',
    title: 'Complete 10 Projects',
    description: 'Finish 10 complete projects to improve skills and portfolio',
    category: 'productivity',
    target: 10,
    current: 7,
    unit: 'projects',
    targetDate: addDays(new Date(), 60),
    status: 'on-track',
    priority: 'high',
    milestones: [
      {
        id: 'm1',
        goalId: '1',
        title: 'First 5 Projects',
        target: 5,
        achieved: true,
        achievedDate: addDays(new Date(), -20)
      },
      {
        id: 'm2',
        goalId: '1',
        title: 'Complete 8 Projects',
        target: 8,
        achieved: false,
        targetDate: addDays(new Date(), 30)
      }
    ],
    progress: 70,
    weeklyProgress: 12,
    createdAt: addDays(new Date(), -45),
    updatedAt: new Date(),
    tags: ['portfolio', 'skill-building']
  },
  {
    id: '2',
    title: 'Increase User Engagement',
    description: 'Boost daily active users and session duration',
    category: 'growth',
    target: 1000,
    current: 650,
    unit: 'users',
    targetDate: addDays(new Date(), 90),
    status: 'at-risk',
    priority: 'medium',
    milestones: [
      {
        id: 'm3',
        goalId: '2',
        title: 'Reach 500 DAU',
        target: 500,
        achieved: true,
        achievedDate: addDays(new Date(), -10)
      },
      {
        id: 'm4',
        goalId: '2',
        title: '800 Daily Active Users',
        target: 800,
        achieved: false,
        targetDate: addDays(new Date(), 45)
      }
    ],
    progress: 65,
    weeklyProgress: 8,
    createdAt: addDays(new Date(), -30),
    updatedAt: new Date(),
    tags: ['analytics', 'engagement']
  },
  {
    id: '3',
    title: 'Master Advanced Features',
    description: 'Learn and implement advanced platform features',
    category: 'learning',
    target: 5,
    current: 3,
    unit: 'features',
    targetDate: addDays(new Date(), 45),
    status: 'on-track',
    priority: 'medium',
    milestones: [
      {
        id: 'm5',
        goalId: '3',
        title: 'Complete Basic Training',
        target: 3,
        achieved: true,
        achievedDate: addDays(new Date(), -15)
      }
    ],
    progress: 60,
    weeklyProgress: 15,
    createdAt: addDays(new Date(), -20),
    updatedAt: new Date(),
    tags: ['training', 'skills']
  },
  {
    id: '4',
    title: 'Improve Code Quality',
    description: 'Maintain high code quality standards across all projects',
    category: 'quality',
    target: 95,
    current: 92,
    unit: '%',
    targetDate: addDays(new Date(), 30),
    status: 'on-track',
    priority: 'high',
    milestones: [
      {
        id: 'm6',
        goalId: '4',
        title: '90% Quality Score',
        target: 90,
        achieved: true,
        achievedDate: addDays(new Date(), -5)
      }
    ],
    progress: 92,
    weeklyProgress: 2,
    createdAt: addDays(new Date(), -25),
    updatedAt: new Date(),
    tags: ['quality', 'standards']
  },
  {
    id: '5',
    title: 'Build Team Collaboration',
    description: 'Increase team collaboration and shared projects',
    category: 'collaboration',
    target: 8,
    current: 5,
    unit: 'collaborations',
    targetDate: addDays(new Date(), 75),
    status: 'behind',
    priority: 'low',
    milestones: [
      {
        id: 'm7',
        goalId: '5',
        title: '3 Team Projects',
        target: 3,
        achieved: true,
        achievedDate: addDays(new Date(), -12)
      },
      {
        id: 'm8',
        goalId: '5',
        title: '6 Collaborative Projects',
        target: 6,
        achieved: false,
        targetDate: addDays(new Date(), 50)
      }
    ],
    progress: 62.5,
    weeklyProgress: 5,
    createdAt: addDays(new Date(), -35),
    updatedAt: new Date(),
    tags: ['teamwork', 'collaboration']
  }
]

const categoryIcons = {
  'productivity': Target,
  'learning': Star,
  'collaboration': Users,
  'quality': Award,
  'growth': TrendingUp
}

const statusColors = {
  'on-track': 'bg-green-500/10 text-green-500 border-green-500/20',
  'at-risk': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  'behind': 'bg-red-500/10 text-red-500 border-red-500/20',
  'achieved': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'paused': 'bg-gray-500/10 text-gray-500 border-gray-500/20'
}

const priorityColors = {
  'low': 'text-gray-500',
  'medium': 'text-blue-500',
  'high': 'text-orange-500',
  'critical': 'text-red-500'
}

export function GoalsProgress() {
  const [goals, setGoals] = useState<Goal[]>(mockGoals)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [loading, setLoading] = useState(false)

  const categories = [
    { id: 'all', label: 'All Goals', count: goals.length },
    { id: 'productivity', label: 'Productivity', count: goals.filter(g => g.category === 'productivity').length },
    { id: 'learning', label: 'Learning', count: goals.filter(g => g.category === 'learning').length },
    { id: 'growth', label: 'Growth', count: goals.filter(g => g.category === 'growth').length },
    { id: 'quality', label: 'Quality', count: goals.filter(g => g.category === 'quality').length },
    { id: 'collaboration', label: 'Collaboration', count: goals.filter(g => g.category === 'collaboration').length }
  ]

  const filteredGoals = selectedCategory === 'all' 
    ? goals 
    : goals.filter(g => g.category === selectedCategory)

  const stats = {
    total: goals.length,
    achieved: goals.filter(g => g.status === 'achieved').length,
    onTrack: goals.filter(g => g.status === 'on-track').length,
    atRisk: goals.filter(g => g.status === 'at-risk').length,
    behind: goals.filter(g => g.status === 'behind').length,
    avgProgress: goals.reduce((sum, g) => sum + g.progress, 0) / goals.length,
    completedMilestones: goals.reduce((sum, g) => 
      sum + g.milestones.filter(m => m.achieved).length, 0
    ),
    totalMilestones: goals.reduce((sum, g) => sum + g.milestones.length, 0)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'achieved': return CheckCircle
      case 'on-track': return Target
      case 'at-risk': return AlertTriangle
      case 'behind': return Clock
      case 'paused': return Pause
      default: return Target
    }
  }

  const getDaysRemaining = (targetDate: Date) => {
    const days = differenceInDays(targetDate, new Date())
    if (days < 0) return `${Math.abs(days)} days overdue`
    if (days === 0) return 'Due today'
    return `${days} days remaining`
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500'
    if (progress >= 70) return 'bg-blue-500'
    if (progress >= 50) return 'bg-yellow-500'
    return 'bg-gray-500'
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.achieved} achieved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Track</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.onTrack}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.onTrack / stats.total) * 100)}% of goals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.avgProgress)}%</div>
            <p className="text-xs text-muted-foreground">
              Overall completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Milestones</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.completedMilestones}/{stats.totalMilestones}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.completedMilestones / stats.totalMilestones) * 100)}% completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="text-xs"
          >
            {category.label}
            <Badge variant="secondary" className="ml-2">
              {category.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {filteredGoals.map((goal) => {
          const CategoryIcon = categoryIcons[goal.category]
          const StatusIcon = getStatusIcon(goal.status)
          const progressColor = getProgressColor(goal.progress)
          
          return (
            <Card key={goal.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <CategoryIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {goal.description}
                      </CardDescription>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline" className={cn("text-xs", statusColors[goal.status])}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {goal.status.replace('-', ' ')}
                        </Badge>
                        <Badge variant="outline" className={cn("text-xs", priorityColors[goal.priority])}>
                          <Flag className="h-3 w-3 mr-1" />
                          {goal.priority} priority
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {getDaysRemaining(goal.targetDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-2xl font-bold">{goal.current}</div>
                      <div className="text-xs text-muted-foreground">of {goal.target} {goal.unit}</div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className={cn("h-3 rounded-full transition-all", progressColor)}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Weekly: {goal.weeklyProgress > 0 ? '+' : ''}{goal.weeklyProgress}%</span>
                      <span>Updated {format(goal.updatedAt, 'MMM dd')}</span>
                    </div>
                  </div>

                  {/* Milestones */}
                  {goal.milestones.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Milestones</span>
                        <span className="text-xs text-muted-foreground">
                          {goal.milestones.filter(m => m.achieved).length}/{goal.milestones.length} completed
                        </span>
                      </div>
                      <div className="space-y-2">
                        {goal.milestones.map((milestone) => (
                          <div key={milestone.id} className="flex items-center justify-between p-2 border rounded-lg">
                            <div className="flex items-center space-x-2">
                              {milestone.achieved ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Clock className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className={cn(
                                "text-sm",
                                milestone.achieved ? "line-through text-muted-foreground" : ""
                              )}>
                                {milestone.title}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-muted-foreground">
                                {milestone.target} {goal.unit}
                              </span>
                              {milestone.achieved && milestone.achievedDate && (
                                <Badge variant="outline" className="text-xs">
                                  {format(milestone.achievedDate, 'MMM dd')}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {goal.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {goal.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Add Goal Button */}
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center space-y-2">
            <Plus className="h-8 w-8 text-muted-foreground mx-auto" />
            <h3 className="text-sm font-medium">Create New Goal</h3>
            <p className="text-xs text-muted-foreground">
              Set a new objective to track your progress
            </p>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}