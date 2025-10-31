'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Clock,
  Users,
  Eye,
  MousePointer,
  Download,
  Heart,
  MessageCircle,
  BarChart3,
  LineChart,
  PieChart
} from 'lucide-react'
import { format, subDays, subHours } from 'date-fns'
import { cn } from '@/lib/utils'

interface ActivityData {
  timestamp: Date
  value: number
  category?: string
  metadata?: Record<string, any>
}

interface ActivityChartProps {
  detailed?: boolean
  timeRange?: '1h' | '24h' | '7d' | '30d'
  showComparison?: boolean
}

const mockActivityData = {
  '1h': generateHourlyData(1),
  '24h': generateHourlyData(24),
  '7d': generateDailyData(7),
  '30d': generateDailyData(30)
}

function generateHourlyData(hours: number): ActivityData[] {
  const data: ActivityData[] = []
  const now = new Date()
  
  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
    data.push({
      timestamp,
      value: Math.floor(Math.random() * 50) + 10,
      category: 'general'
    })
  }
  
  return data
}

function generateDailyData(days: number): ActivityData[] {
  const data: ActivityData[] = []
  const now = new Date()
  
  for (let i = days; i >= 0; i--) {
    const timestamp = subDays(now, i)
    data.push({
      timestamp,
      value: Math.floor(Math.random() * 200) + 50,
      category: 'general'
    })
  }
  
  return data
}

const activityTypes = [
  { id: 'page_views', label: 'Page Views', color: 'bg-blue-500', icon: Eye },
  { id: 'user_interactions', label: 'Interactions', color: 'bg-green-500', icon: MousePointer },
  { id: 'downloads', label: 'Downloads', color: 'bg-purple-500', icon: Download },
  { id: 'engagement', label: 'Engagement', color: 'bg-orange-500', icon: Heart }
]

export function ActivityChart({ 
  detailed = false, 
  timeRange = '24h', 
  showComparison = false 
}: ActivityChartProps) {
  const [data, setData] = useState<ActivityData[]>([])
  const [selectedMetric, setSelectedMetric] = useState('page_views')
  const [loading, setLoading] = useState(true)
  const [timeRangeState, setTimeRangeState] = useState(timeRange)

  useEffect(() => {
    // Simulate loading activity data
    const loadActivityData = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 600))
      
      // Generate mock data based on time range
      const activityData = mockActivityData[timeRangeState]
      setData(activityData)
      setLoading(false)
    }

    loadActivityData()
  }, [timeRangeState])

  const maxValue = Math.max(...data.map(d => d.value))
  const avgValue = data.reduce((sum, d) => sum + d.value, 0) / data.length
  const totalValue = data.reduce((sum, d) => sum + d.value, 0)

  // Calculate trends
  const recentData = data.slice(-7)
  const previousData = data.slice(-14, -7)
  const recentAvg = recentData.reduce((sum, d) => sum + d.value, 0) / recentData.length
  const previousAvg = previousData.reduce((sum, d) => sum + d.value, 0) / previousData.length
  const trend = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0

  const formatTimestamp = (timestamp: Date) => {
    if (timeRangeState === '1h' || timeRangeState === '24h') {
      return format(timestamp, 'HH:mm')
    }
    return format(timestamp, 'MMM dd')
  }

  const formatValue = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`
    }
    return value.toString()
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
        <div className="h-40 bg-muted rounded animate-pulse"></div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!detailed) {
    // Simplified chart for overview
    return (
      <div className="space-y-4">
        {/* Chart */}
        <div className="relative h-32">
          <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="activityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            
            {/* Area fill */}
            <path
              d={`M 0 100 L 0 ${100 - (data[0]?.value / maxValue) * 80} `}
              fill="none"
            />
            
            {/* Area */}
            <path
              d={`M 0 ${100 - (data[0]?.value / maxValue) * 80} 
                  ${data.map((d, i) => 
                    `L ${(i / (data.length - 1)) * 400} ${100 - (d.value / maxValue) * 80}`
                  ).join(' ')} 
                  L 400 100 L 0 100 Z`}
              fill="url(#activityGradient)"
            />
            
            {/* Line */}
            <path
              d={`M 0 ${100 - (data[0]?.value / maxValue) * 80} 
                  ${data.map((d, i) => 
                    `L ${(i / (data.length - 1)) * 400} ${100 - (d.value / maxValue) * 80}`
                  ).join(' ')}`}
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              fill="none"
            />
            
            {/* Data points */}
            {data.map((d, i) => (
              <circle
                key={i}
                cx={(i / (data.length - 1)) * 400}
                cy={100 - (d.value / maxValue) * 80}
                r="3"
                fill="hsl(var(--primary))"
                className="opacity-80 hover:opacity-100 cursor-pointer"
              >
                <title>{`${formatValue(d.value)} at ${formatTimestamp(d.timestamp)}`}</title>
              </circle>
            ))}
          </svg>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold">{formatValue(totalValue)}</div>
            <div className="text-xs text-muted-foreground">Total Activity</div>
          </div>
          <div>
            <div className="text-lg font-semibold">{formatValue(Math.round(avgValue))}</div>
            <div className="text-xs text-muted-foreground">Avg. per Period</div>
          </div>
          <div className="flex items-center justify-center space-x-1">
            <div className="text-lg font-semibold">{Math.abs(trend).toFixed(1)}%</div>
            {trend > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <div className="text-xs text-muted-foreground">vs. last period</div>
          </div>
        </div>
      </div>
    )
  }

  // Detailed chart with multiple views
  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium">Activity Overview</h3>
          <Badge variant="outline">
            {timeRangeState === '1h' ? 'Hourly' : timeRangeState === '24h' ? '24h' : 'Daily'}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Tabs value={selectedMetric} onValueChange={setSelectedMetric}>
            <TabsList className="grid w-full grid-cols-4">
              {activityTypes.map((type) => {
                const Icon = type.icon
                return (
                  <TabsTrigger key={type.id} value={type.id} className="text-xs">
                    <Icon className="h-3 w-3 mr-1" />
                    {type.label}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>
          <div className="flex items-center space-x-1">
            {(['1h', '24h', '7d', '30d'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRangeState === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRangeState(range)}
                className="text-xs"
              >
                {range === '1h' ? '1H' : range.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity Timeline</CardTitle>
          <CardDescription>
            {activityTypes.find(t => t.id === selectedMetric)?.label} over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative h-64">
            <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="detailedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map(i => (
                <line
                  key={i}
                  x1="0"
                  y1={i * 40}
                  x2="800"
                  y2={i * 40}
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
              ))}
              
              {/* Area fill */}
              <path
                d={`M 0 200 
                    L 0 ${200 - (data[0]?.value / maxValue) * 160} 
                    ${data.map((d, i) => 
                      `L ${(i / (data.length - 1)) * 800} ${200 - (d.value / maxValue) * 160}`
                    ).join(' ')} 
                    L 800 200 L 0 200 Z`}
                fill="url(#detailedGradient)"
              />
              
              {/* Line */}
              <path
                d={`M 0 ${200 - (data[0]?.value / maxValue) * 160} 
                    ${data.map((d, i) => 
                      `L ${(i / (data.length - 1)) * 800} ${200 - (d.value / maxValue) * 160}`
                    ).join(' ')}`}
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                fill="none"
              />
              
              {/* Data points */}
              {data.map((d, i) => (
                <g key={i}>
                  <circle
                    cx={(i / (data.length - 1)) * 800}
                    cy={200 - (d.value / maxValue) * 160}
                    r="4"
                    fill="hsl(var(--primary))"
                    className="cursor-pointer hover:r-6 transition-all"
                  >
                    <title>{`${formatValue(d.value)} at ${formatTimestamp(d.timestamp)}`}</title>
                  </circle>
                </g>
              ))}
            </svg>
            
            {/* Time labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground px-2">
              <span>{formatTimestamp(data[0]?.timestamp)}</span>
              <span>{formatTimestamp(data[data.length - 1]?.timestamp)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Tabs */}
      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Peak Activity</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatValue(maxValue)}</div>
                <p className="text-xs text-muted-foreground">
                  Highest activity period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatValue(Math.round(avgValue))}</div>
                <p className="text-xs text-muted-foreground">
                  Per {timeRangeState === '1h' || timeRangeState === '24h' ? 'hour' : 'day'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatValue(totalValue)}</div>
                <p className="text-xs text-muted-foreground">
                  Overall activity
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trend</CardTitle>
                {trend > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className={cn("text-2xl font-bold", trend > 0 ? "text-green-500" : "text-red-500")}>
                  {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  vs. previous period
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Activity Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Activity Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activityTypes.map((type) => {
                    const Icon = type.icon
                    const percentage = (type.id === selectedMetric ? 100 : Math.random() * 60 + 20)
                    return (
                      <div key={type.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={cn("w-3 h-3 rounded-full", type.color)}></div>
                            <span className="text-sm">{type.label}</span>
                          </div>
                          <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={cn("h-2 rounded-full", type.color)}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Time Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Time Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Morning', 'Afternoon', 'Evening', 'Night'].map((period, index) => {
                    const percentage = [25, 35, 25, 15][index]
                    return (
                      <div key={period} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{period}</span>
                          <span className="text-sm font-medium">{percentage}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Key Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Peak Hours</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Most activity occurs between 2-4 PM and 7-9 PM
                  </p>
                </div>
                
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Growth Pattern</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {trend > 0 ? 'Activity is increasing' : 'Activity is declining'} compared to last period
                  </p>
                </div>
                
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">User Behavior</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Users are most engaged during weekday afternoons
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Schedule Content</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Post important updates during peak hours (2-4 PM)
                  </p>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <MessageCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Increase Engagement</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Focus on interactive features during evening hours
                  </p>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Activity className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Monitor Trends</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {trend > 0 ? 'Continue current strategy' : 'Investigate declining activity'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}