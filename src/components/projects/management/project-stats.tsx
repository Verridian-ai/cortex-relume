'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Users,
  FileText,
  DollarSign,
  Target,
  Activity,
  Zap,
  Eye,
  Timer,
  Star,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { Project } from './project-grid';

interface ProjectStatsProps {
  projects: Project[];
  className?: string;
  showTrends?: boolean;
  showHealthBreakdown?: boolean;
  compact?: boolean;
}

interface HealthMetrics {
  total: number;
  healthy: number;
  warning: number;
  atRisk: number;
  critical: number;
  percentage: number;
}

interface TrendData {
  value: number;
  change: number;
  period: string;
}

const healthColors = {
  healthy: 'text-green-600',
  warning: 'text-yellow-600',
  'at-risk': 'text-orange-600',
  critical: 'text-red-600'
};

const healthBgColors = {
  healthy: 'bg-green-100 dark:bg-green-900/20',
  warning: 'bg-yellow-100 dark:bg-yellow-900/20',
  'at-risk': 'bg-orange-100 dark:bg-orange-900/20',
  critical: 'bg-red-100 dark:bg-red-900/20'
};

export function ProjectStats({
  projects,
  className,
  showTrends = true,
  showHealthBreakdown = false,
  compact = false
}: ProjectStatsProps) {
  if (projects.length === 0) {
    return (
      <div className={cn("text-center py-8 text-muted-foreground", className)}>
        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No projects to analyze</p>
      </div>
    );
  }

  // Calculate metrics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const archivedProjects = projects.filter(p => p.status === 'archived').length;
  
  const totalProgress = projects.reduce((sum, p) => sum + p.progress, 0);
  const averageProgress = totalProgress / totalProjects;
  
  const overdueProjects = projects.filter(p => 
    p.dueDate < new Date() && p.status !== 'completed'
  ).length;

  const healthMetrics: HealthMetrics = {
    total: totalProjects,
    healthy: projects.filter(p => p.health === 'healthy').length,
    warning: projects.filter(p => p.health === 'warning').length,
    'at-risk': projects.filter(p => p.health === 'at-risk').length,
    critical: projects.filter(p => p.health === 'critical').length,
    percentage: (projects.filter(p => p.health === 'healthy').length / totalProjects) * 100
  };

  const totalBudget = projects.reduce((sum, p) => sum + (p.budget?.allocated || 0), 0);
  const totalSpent = projects.reduce((sum, p) => sum + (p.budget?.spent || 0), 0);
  const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const totalTeamMembers = projects.reduce((sum, p) => sum + p.team.members, 0);
  const totalFiles = projects.reduce((sum, p) => sum + p.files, 0);
  const totalComments = projects.reduce((sum, p) => sum + p.comments, 0);

  // Mock trend data (in real app, this would come from historical data)
  const mockTrends = {
    totalProjects: { value: totalProjects, change: 12, period: 'vs last month' },
    activeProjects: { value: activeProjects, change: 8, period: 'vs last month' },
    averageProgress: { value: Math.round(averageProgress), change: 5, period: 'vs last month' },
    healthScore: { value: Math.round(healthMetrics.percentage), change: -2, period: 'vs last month' },
    budgetUtilization: { value: Math.round(budgetUtilization), change: 3, period: 'vs last month' }
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="h-3 w-3" />;
    if (change < 0) return <ArrowDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  if (compact) {
    return (
      <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Projects</p>
              <p className="text-2xl font-bold">{totalProjects}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-2xl font-bold">{activeProjects}</p>
            </div>
            <Activity className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Progress</p>
              <p className="text-2xl font-bold">{Math.round(averageProgress)}%</p>
            </div>
            <Target className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Health</p>
              <p className="text-2xl font-bold">{Math.round(healthMetrics.percentage)}%</p>
            </div>
            <CheckCircle2 className={cn(
              "h-8 w-8",
              healthMetrics.percentage >= 80 ? 'text-green-600' :
              healthMetrics.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
            )} />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Projects */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Total Projects</h3>
                <p className="text-sm text-muted-foreground">All time</p>
              </div>
            </div>
            {showTrends && (
              <Badge 
                variant="outline" 
                className={cn("flex items-center gap-1", getTrendColor(mockTrends.totalProjects.change))}
              >
                {getTrendIcon(mockTrends.totalProjects.change)}
                {Math.abs(mockTrends.totalProjects.change)}%
              </Badge>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">{totalProjects}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-600">{activeProjects} active</span>
              <span className="text-blue-600">{completedProjects} done</span>
            </div>
          </div>
        </Card>

        {/* Active Projects */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Active Projects</h3>
                <p className="text-sm text-muted-foreground">Currently running</p>
              </div>
            </div>
            {showTrends && (
              <Badge 
                variant="outline" 
                className={cn("flex items-center gap-1", getTrendColor(mockTrends.activeProjects.change))}
              >
                {getTrendIcon(mockTrends.activeProjects.change)}
                {Math.abs(mockTrends.activeProjects.change)}%
              </Badge>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">{activeProjects}</p>
            <div className="flex items-center gap-2 text-sm">
              <Progress value={(activeProjects / totalProjects) * 100} className="flex-1" />
              <span className="text-muted-foreground">
                {Math.round((activeProjects / totalProjects) * 100)}%
              </span>
            </div>
          </div>
        </Card>

        {/* Average Progress */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Average Progress</h3>
                <p className="text-sm text-muted-foreground">Across all projects</p>
              </div>
            </div>
            {showTrends && (
              <Badge 
                variant="outline" 
                className={cn("flex items-center gap-1", getTrendColor(mockTrends.averageProgress.change))}
              >
                {getTrendIcon(mockTrends.averageProgress.change)}
                {Math.abs(mockTrends.averageProgress.change)}%
              </Badge>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">{Math.round(averageProgress)}%</p>
            <Progress value={averageProgress} className="h-2" />
          </div>
        </Card>

        {/* Health Score */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                healthMetrics.percentage >= 80 ? 'bg-green-100 dark:bg-green-900/20' :
                healthMetrics.percentage >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                'bg-red-100 dark:bg-red-900/20'
              )}>
                <CheckCircle2 className={cn(
                  "h-6 w-6",
                  healthMetrics.percentage >= 80 ? 'text-green-600' :
                  healthMetrics.percentage >= 60 ? 'text-yellow-600' :
                  'text-red-600'
                )} />
              </div>
              <div>
                <h3 className="font-semibold">Health Score</h3>
                <p className="text-sm text-muted-foreground">Project health</p>
              </div>
            </div>
            {showTrends && (
              <Badge 
                variant="outline" 
                className={cn("flex items-center gap-1", getTrendColor(mockTrends.healthScore.change))}
              >
                {getTrendIcon(mockTrends.healthScore.change)}
                {Math.abs(mockTrends.healthScore.change)}%
              </Badge>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">{Math.round(healthMetrics.percentage)}%</p>
            <Progress value={healthMetrics.percentage} className="h-2" />
          </div>
        </Card>
      </div>

      {/* Health Breakdown */}
      {showHealthBreakdown && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">Project Health Breakdown</h3>
            <Badge variant="outline">
              {healthMetrics.healthy} of {healthMetrics.total} healthy
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(healthBgColors).map(([health, bgColor]) => {
              const count = healthMetrics[health as keyof HealthMetrics] as number;
              const percentage = (count / healthMetrics.total) * 100;
              
              return (
                <div key={health} className={cn("p-4 rounded-lg", bgColor)}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium capitalize">{health.replace('-', ' ')}</h4>
                    <span className="text-2xl font-bold">
                      {count}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {Math.round(percentage)}%
                    </span>
                    <Progress value={percentage} className="h-1 w-16" />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Budget Overview */}
        {totalBudget > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Budget Utilization</h3>
                <p className="text-sm text-muted-foreground">Total spending</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold">{Math.round(budgetUtilization)}%</p>
              <Progress value={budgetUtilization} className="h-2" />
              <p className="text-sm text-muted-foreground">
                ${totalSpent.toLocaleString()} / ${totalBudget.toLocaleString()}
              </p>
            </div>
          </Card>
        )}

        {/* Team Members */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">Team Members</h3>
              <p className="text-sm text-muted-foreground">Across all projects</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold">{totalTeamMembers}</p>
            <p className="text-sm text-muted-foreground">
              {Math.round(totalTeamMembers / totalProjects * 10) / 10} avg per project
            </p>
          </div>
        </Card>

        {/* Files & Documents */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold">Files & Docs</h3>
              <p className="text-sm text-muted-foreground">Total documents</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold">{totalFiles}</p>
            <p className="text-sm text-muted-foreground">
              {Math.round(totalFiles / totalProjects * 10) / 10} avg per project
            </p>
          </div>
        </Card>

        {/* Overdue Projects */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={cn(
              "p-2 rounded-lg",
              overdueProjects > 0 ? 'bg-red-100 dark:bg-red-900/20' : 'bg-green-100 dark:bg-green-900/20'
            )}>
              <Clock className={cn(
                "h-6 w-6",
                overdueProjects > 0 ? 'text-red-600' : 'text-green-600'
              )} />
            </div>
            <div>
              <h3 className="font-semibold">Overdue</h3>
              <p className="text-sm text-muted-foreground">Projects past deadline</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold">{overdueProjects}</p>
            <p className="text-sm text-muted-foreground">
              {Math.round((overdueProjects / totalProjects) * 100)}% of total
            </p>
          </div>
        </Card>
      </div>

      {/* Quick Health Indicators */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Quick Health Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium">On Track</p>
              <p className="text-sm text-muted-foreground">
                {projects.filter(p => p.health === 'healthy').length} projects
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium">Needs Attention</p>
              <p className="text-sm text-muted-foreground">
                {projects.filter(p => ['warning', 'at-risk'].includes(p.health)).length} projects
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium">Critical</p>
              <p className="text-sm text-muted-foreground">
                {projects.filter(p => p.health === 'critical').length} projects
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Project Health Indicator Component
interface ProjectHealthIndicatorProps {
  project: Project;
  className?: string;
}

export function ProjectHealthIndicator({
  project,
  className
}: ProjectHealthIndicatorProps) {
  const getHealthColor = (health: string) => {
    const colors = {
      healthy: 'text-green-600',
      warning: 'text-yellow-600',
      'at-risk': 'text-orange-600',
      critical: 'text-red-600'
    };
    return colors[health as keyof typeof colors] || 'text-gray-600';
  };

  const getHealthIcon = (health: string) => {
    const icons = {
      healthy: CheckCircle2,
      warning: AlertTriangle,
      'at-risk': AlertTriangle,
      critical: XCircle
    };
    return icons[health as keyof typeof icons] || CheckCircle2;
  };

  const IconComponent = getHealthIcon(project.health);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <IconComponent className={cn("h-4 w-4", getHealthColor(project.health))} />
      <span className={cn("text-sm font-medium", getHealthColor(project.health))}>
        {project.health.replace('-', ' ').charAt(0).toUpperCase() + project.health.replace('-', ' ').slice(1)}
      </span>
    </div>
  );
}

// Loading skeleton for stats
export function ProjectStatsSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-muted rounded-lg" />
                  <div className="space-y-1">
                    <div className="w-20 h-4 bg-muted rounded" />
                    <div className="w-16 h-3 bg-muted rounded" />
                  </div>
                </div>
                <div className="w-12 h-6 bg-muted rounded" />
              </div>
              <div className="space-y-2">
                <div className="w-16 h-8 bg-muted rounded" />
                <div className="w-full h-2 bg-muted rounded" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
