'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Sparkles, 
  TrendingUp, 
  Target, 
  Lightbulb,
  Star,
  Clock,
  Users,
  Zap,
  BookOpen,
  BarChart3,
  Award,
  CheckCircle,
  ArrowRight,
  ThumbsUp,
  MessageSquare,
  ExternalLink,
  RefreshCw,
  Filter
} from 'lucide-react'
import { format, addDays } from 'date-fns'
import { cn } from '@/lib/utils'

interface Recommendation {
  id: string
  type: 'feature' | 'optimization' | 'learning' | 'productivity' | 'collaboration'
  title: string
  description: string
  reasoning: string
  priority: 'high' | 'medium' | 'low'
  impact: 'high' | 'medium' | 'low'
  effort: 'low' | 'medium' | 'high'
  category: string
  actionItems: Array<{
    id: string
    title: string
    description: string
    completed: boolean
  }>
  estimatedTime: string
  benefits: string[]
  tags: string[]
  relatedGoals?: string[]
  confidence: number // AI confidence score 0-1
  createdAt: Date
  status: 'pending' | 'in-progress' | 'completed' | 'dismissed'
}

interface UserInsight {
  type: 'strength' | 'opportunity' | 'pattern' | 'trend'
  title: string
  description: string
  data: Record<string, any>
  confidence: number
  actionable: boolean
}

const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    type: 'optimization',
    title: 'Optimize Your Peak Activity Hours',
    description: 'Based on your activity patterns, you\'re most productive between 2-4 PM. Consider scheduling important tasks during this time.',
    reasoning: 'Your usage data shows 40% higher engagement during afternoon hours compared to mornings.',
    priority: 'medium',
    impact: 'medium',
    effort: 'low',
    category: 'productivity',
    actionItems: [
      {
        id: 'a1',
        title: 'Schedule deep work sessions',
        description: 'Block 2-4 PM for complex tasks',
        completed: false
      },
      {
        id: 'a2',
        title: 'Set up time reminders',
        description: 'Get notified when entering peak hours',
        completed: false
      }
    ],
    estimatedTime: '1 week to implement',
    benefits: ['Increased productivity', 'Better work-life balance', 'Reduced stress'],
    tags: ['productivity', 'time-management'],
    confidence: 0.85,
    createdAt: addDays(new Date(), -2),
    status: 'pending'
  },
  {
    id: '2',
    type: 'feature',
    title: 'Try the Collaboration Features',
    description: 'You have several completed projects that would benefit from team collaboration to enhance their impact.',
    reasoning: 'Your project completion rate is high, but collaboration usage is below average for users with your skill level.',
    priority: 'high',
    impact: 'high',
    effort: 'medium',
    category: 'collaboration',
    actionItems: [
      {
        id: 'a3',
        title: 'Invite team members to recent projects',
        description: 'Share your completed e-commerce project',
        completed: false
      },
      {
        id: 'a4',
        title: 'Explore real-time collaboration',
        description: 'Try editing with others simultaneously',
        completed: false
      }
    ],
    estimatedTime: '2-3 days to get started',
    benefits: ['Enhanced project quality', 'Knowledge sharing', 'Network building'],
    tags: ['collaboration', 'networking'],
    relatedGoals: ['collaboration-goal'],
    confidence: 0.78,
    createdAt: addDays(new Date(), -1),
    status: 'pending'
  },
  {
    id: '3',
    type: 'learning',
    title: 'Advance to Advanced Wireframing',
    description: 'You\'ve mastered basic wireframing. Advanced techniques could significantly speed up your workflow.',
    reasoning: 'Your wireframing skill progression shows rapid improvement and high engagement with intermediate features.',
    priority: 'medium',
    impact: 'high',
    effort: 'medium',
    category: 'learning',
    actionItems: [
      {
        id: 'a5',
        title: 'Complete advanced wireframing tutorial',
        description: 'Learn advanced layout techniques',
        completed: false
      },
      {
        id: 'a6',
        title: 'Practice with complex components',
        description: 'Build a dashboard wireframe',
        completed: false
      }
    ],
    estimatedTime: '1-2 weeks',
    benefits: ['Faster design process', 'Better design quality', 'New career opportunities'],
    tags: ['learning', 'skills', 'advancement'],
    confidence: 0.92,
    createdAt: addDays(new Date(), -3),
    status: 'pending'
  },
  {
    id: '4',
    type: 'productivity',
    title: 'Set Up Project Templates',
    description: 'Creating templates for your common project types could save you significant time on setup.',
    reasoning: 'You\'ve created 3 similar e-commerce projects in the past month. Templates would streamline this process.',
    priority: 'high',
    impact: 'medium',
    effort: 'low',
    category: 'productivity',
    actionItems: [
      {
        id: 'a7',
        title: 'Create e-commerce template',
        description: 'Extract reusable components from existing projects',
        completed: false
      },
      {
        id: 'a8',
        title: 'Document template usage',
        description: 'Create quick-start guide for templates',
        completed: false
      }
    ],
    estimatedTime: '3-5 days',
    benefits: ['Faster project creation', 'Consistent quality', 'Reduced setup time'],
    tags: ['productivity', 'templates', 'automation'],
    confidence: 0.88,
    createdAt: addDays(new Date(), -4),
    status: 'pending'
  },
  {
    id: '5',
    type: 'optimization',
    title: 'Improve Mobile Experience',
    description: 'Your projects show lower engagement on mobile devices. Consider mobile-first design principles.',
    reasoning: 'Mobile traffic accounts for 35% of your views but has 60% higher bounce rate than desktop.',
    priority: 'high',
    impact: 'high',
    effort: 'high',
    category: 'optimization',
    actionItems: [
      {
        id: 'a9',
        title: 'Audit mobile layouts',
        description: 'Review existing projects for mobile issues',
        completed: false
      },
      {
        id: 'a10',
        title: 'Implement responsive patterns',
        description: 'Add mobile-first design components',
        completed: false
      }
    ],
    estimatedTime: '2-3 weeks',
    benefits: ['Better mobile user experience', 'Increased mobile engagement', 'Broader audience reach'],
    tags: ['mobile', 'responsive', 'user-experience'],
    confidence: 0.75,
    createdAt: addDays(new Date(), -5),
    status: 'pending'
  }
]

const mockInsights: UserInsight[] = [
  {
    type: 'strength',
    title: 'Consistent Creator',
    description: 'You maintain a consistent creation schedule, completing projects at a steady pace.',
    data: {
      completedProjects: 7,
      avgCompletionTime: '12 days',
      consistency: '85%'
    },
    confidence: 0.91,
    actionable: true
  },
  {
    type: 'opportunity',
    title: 'Collaboration Underutilization',
    description: 'You rarely use collaboration features despite having high-quality projects that could benefit from team input.',
    data: {
      collaborationRate: '12%',
      peerAverage: '34%',
      potentialImprovement: '+180%'
    },
    confidence: 0.87,
    actionable: true
  },
  {
    type: 'pattern',
    title: 'Afternoon Productivity Peak',
    description: 'Your most productive hours are consistently between 2-4 PM, with 40% higher output during this time.',
    data: {
      peakHours: ['14:00', '15:00', '16:00'],
      productivityBoost: '40%',
      consistency: '92%'
    },
    confidence: 0.89,
    actionable: true
  },
  {
    type: 'trend',
    title: 'Rising Skill Level',
    description: 'Your skill progression shows accelerating improvement, particularly in design and user experience.',
    data: {
      skillGrowth: '+25% this month',
      learningRate: 'Accelerating',
      nextLevel: 'Advanced'
    },
    confidence: 0.83,
    actionable: false
  }
]

const typeIcons = {
  'feature': Zap,
  'optimization': Target,
  'learning': BookOpen,
  'productivity': BarChart3,
  'collaboration': Users
}

const priorityColors = {
  'high': 'bg-red-500/10 text-red-500 border-red-500/20',
  'medium': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  'low': 'bg-green-500/10 text-green-500 border-green-500/20'
}

const impactColors = {
  'high': 'text-green-500',
  'medium': 'text-blue-500',
  'low': 'text-gray-500'
}

export function Recommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>(mockRecommendations)
  const [insights, setInsights] = useState<UserInsight[]>(mockInsights)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [loading, setLoading] = useState(false)

  const types = [
    { id: 'all', label: 'All', count: recommendations.length },
    { id: 'feature', label: 'Features', count: recommendations.filter(r => r.type === 'feature').length },
    { id: 'optimization', label: 'Optimization', count: recommendations.filter(r => r.type === 'optimization').length },
    { id: 'learning', label: 'Learning', count: recommendations.filter(r => r.type === 'learning').length },
    { id: 'productivity', label: 'Productivity', count: recommendations.filter(r => r.type === 'productivity').length },
    { id: 'collaboration', label: 'Collaboration', count: recommendations.filter(r => r.type === 'collaboration').length }
  ]

  const filteredRecommendations = selectedType === 'all' 
    ? recommendations 
    : recommendations.filter(r => r.type === selectedType)

  const pendingRecommendations = recommendations.filter(r => r.status === 'pending')
  const highPriorityRecommendations = recommendations.filter(r => r.priority === 'high')

  const handleAcceptRecommendation = (id: string) => {
    setRecommendations(prev => 
      prev.map(r => 
        r.id === id ? { ...r, status: 'in-progress' } : r
      )
    )
  }

  const handleDismissRecommendation = (id: string) => {
    setRecommendations(prev => 
      prev.map(r => 
        r.id === id ? { ...r, status: 'dismissed' } : r
      )
    )
  }

  const handleRefreshRecommendations = () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-brand-500" />
            AI Recommendations
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Personalized suggestions based on your activity and goals
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefreshRecommendations} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRecommendations.length}</div>
            <p className="text-xs text-muted-foreground">
              {highPriorityRecommendations.length} high priority
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Confidence</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              AI confidence score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Impact</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">High</div>
            <p className="text-xs text-muted-foreground">
              Expected improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Type Filter */}
      <div className="flex flex-wrap gap-2">
        {types.map((type) => (
          <Button
            key={type.id}
            variant={selectedType === type.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType(type.id)}
            className="text-xs"
          >
            {type.label}
            <Badge variant="secondary" className="ml-2">
              {type.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="space-y-4">
            {filteredRecommendations.map((recommendation) => {
              const TypeIcon = typeIcons[recommendation.type]
              
              return (
                <Card key={recommendation.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {recommendation.description}
                          </CardDescription>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline" className={cn("text-xs", priorityColors[recommendation.priority])}>
                              {recommendation.priority} priority
                            </Badge>
                            <Badge variant="outline" className={cn("text-xs", impactColors[recommendation.impact])}>
                              {recommendation.impact} impact
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {recommendation.effort} effort
                            </Badge>
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <Target className="h-3 w-3" />
                              <span>{Math.round(recommendation.confidence * 100)}% confidence</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Reasoning */}
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Lightbulb className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">AI Reasoning</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{recommendation.reasoning}</p>
                      </div>

                      {/* Action Items */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Action Items</span>
                          <span className="text-xs text-muted-foreground">
                            {recommendation.actionItems.filter(item => item.completed).length}/{recommendation.actionItems.length} completed
                          </span>
                        </div>
                        <div className="space-y-2">
                          {recommendation.actionItems.map((item) => (
                            <div key={item.id} className="flex items-start space-x-2 p-2 border rounded-lg">
                              {item.completed ? (
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                              ) : (
                                <div className="w-4 h-4 border-2 border-muted-foreground rounded mt-0.5" />
                              )}
                              <div className="flex-1">
                                <p className={cn(
                                  "text-sm",
                                  item.completed ? "line-through text-muted-foreground" : ""
                                )}>
                                  {item.title}
                                </p>
                                <p className="text-xs text-muted-foreground">{item.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Benefits */}
                      <div className="space-y-2">
                        <span className="text-sm font-medium">Expected Benefits</span>
                        <div className="flex flex-wrap gap-2">
                          {recommendation.benefits.map((benefit) => (
                            <Badge key={benefit} variant="secondary" className="text-xs">
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Tags */}
                      {recommendation.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {recommendation.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>⏱️ {recommendation.estimatedTime}</span>
                          <span>📅 {format(recommendation.createdAt, 'MMM dd')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAcceptRecommendation(recommendation.id)}
                            disabled={recommendation.status !== 'pending'}
                          >
                            {recommendation.status === 'pending' ? 'Accept' : 
                             recommendation.status === 'in-progress' ? 'In Progress' : 'Completed'}
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDismissRecommendation(recommendation.id)}
                            disabled={recommendation.status === 'dismissed'}
                          >
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {insights.map((insight, index) => {
              const getInsightIcon = (type: string) => {
                switch (type) {
                  case 'strength': return Award
                  case 'opportunity': return TrendingUp
                  case 'pattern': return BarChart3
                  case 'trend': return Target
                  default: return Lightbulb
                }
              }

              const Icon = getInsightIcon(insight.type)
              
              return (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5 text-brand-500" />
                      <CardTitle className="text-base">{insight.title}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(insight.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    <CardDescription>{insight.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {Object.entries(insight.data).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                            <div className="font-medium">{String(value)}</div>
                          </div>
                        ))}
                      </div>
                      {insight.actionable && (
                        <Button variant="outline" size="sm" className="w-full">
                          Take Action
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trending Recommendations</CardTitle>
              <CardDescription>
                Most popular suggestions among users with similar profiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  'Implement dark mode for better user experience',
                  'Add interactive prototypes to showcase work',
                  'Use component libraries for faster development',
                  'Set up automated testing for quality assurance',
                  'Create a personal design system'
                ].map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-xs text-white">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium">{trend}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {Math.floor(Math.random() * 30) + 10}% adoption
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}