"use client";

import { useState, useEffect } from "react";
import { ProjectAnalyticsManager, ProjectHealthScore, AutomatedRecommendation } from "@/lib/projects/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Target,
  Zap,
  Eye,
  Globe,
  Smartphone,
  Monitor,
  Laptop
} from "lucide-react";

interface ProjectAnalyticsDashboardProps {
  projectId: string;
}

export function ProjectAnalyticsDashboard({ projectId }: ProjectAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [healthScore, setHealthScore] = useState<ProjectHealthScore | null>(null);
  const [recommendations, setRecommendations] = useState<AutomatedRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const analyticsManager = ProjectAnalyticsManager.getInstance();

  useEffect(() => {
    loadDashboardData();
  }, [projectId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsData, healthScoreData, recommendationsData] = await Promise.all([
        analyticsManager.getProjectAnalytics(projectId),
        analyticsManager.calculateProjectHealthScore(projectId),
        analyticsManager.getRecommendations(projectId)
      ]);

      setAnalytics(analyticsData);
      setHealthScore(healthScoreData);
      setRecommendations(recommendationsData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendationUpdate = async (id: string, status: 'completed' | 'dismissed') => {
    try {
      await analyticsManager.updateRecommendationStatus(id, status);
      setRecommendations(prev =>
        prev.map(rec =>
          rec.id === id ? { ...rec, status } : rec
        )
      );
      
      // Recalculate health score if recommendation was completed
      if (status === 'completed') {
        const newHealthScore = await analyticsManager.calculateProjectHealthScore(projectId);
        setHealthScore(newHealthScore);
      }
    } catch (error) {
      console.error("Error updating recommendation:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics || !healthScore) {
    return (
      <Alert>
        <XCircle className="h-4 w-4" />
        <AlertTitle>No Analytics Data</AlertTitle>
        <AlertDescription>
          No analytics data available for this project. Please ensure the project is published and receiving traffic.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Health Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Project Analytics Dashboard
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold">{healthScore.overall_score}</div>
                <div className="text-sm text-gray-600">Health Score</div>
              </div>
              <Badge
                className={`text-lg px-4 py-2 ${
                  healthScore.grade === 'A' ? 'bg-green-600' :
                  healthScore.grade === 'B' ? 'bg-blue-600' :
                  healthScore.grade === 'C' ? 'bg-yellow-600' :
                  healthScore.grade === 'D' ? 'bg-orange-600' : 'bg-red-600'
                }`}
              >
                Grade {healthScore.grade}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{healthScore.performance_score}</div>
              <div className="text-sm text-gray-600">Performance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{healthScore.seo_score}</div>
              <div className="text-sm text-gray-600">SEO</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{healthScore.accessibility_score}</div>
              <div className="text-sm text-gray-600">Accessibility</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{healthScore.ux_score}</div>
              <div className="text-sm text-gray-600">UX</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{healthScore.technical_score}</div>
              <div className="text-sm text-gray-600">Technical</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab analytics={analytics} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <PerformanceTab metrics={analytics.performance_metrics} />
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <SEOTab metrics={analytics.seo_metrics} />
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-6">
          <AccessibilityTab metrics={analytics.accessibility_metrics} />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <RecommendationsTab
            recommendations={recommendations}
            healthScore={healthScore}
            onUpdateStatus={handleRecommendationUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OverviewTab({ analytics }: { analytics: any }) {
  return (
    <>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Visits</p>
                <p className="text-2xl font-bold">{analytics.total_visits.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+12% from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Visitors</p>
                <p className="text-2xl font-bold">{analytics.unique_visitors.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+8% from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Session</p>
                <p className="text-2xl font-bold">{Math.round(analytics.average_session_duration / 60)}m</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              <span className="text-sm text-red-600">-5% from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
                <p className="text-2xl font-bold">{(analytics.bounce_rate * 100).toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">-3% from last week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.traffic_sources.map((source: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <span className="capitalize">{source.source}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24">
                      <Progress value={source.percentage} className="h-2" />
                    </div>
                    <span className="text-sm text-gray-600 w-12">
                      {source.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.device_breakdown).map(([device, percentage]: [string, any]) => (
                <div key={device} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {device === 'mobile' && <Smartphone className="h-4 w-4 text-gray-500" />}
                    {device === 'tablet' && <Tablet className="h-4 w-4 text-gray-500" />}
                    {device === 'desktop' && <Monitor className="h-4 w-4 text-gray-500" />}
                    <span className="capitalize">{device}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24">
                      <Progress value={percentage} className="h-2" />
                    </div>
                    <span className="text-sm text-gray-600 w-12">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Pages */}
      <Card>
        <CardHeader>
          <CardTitle>Top Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.top_pages.map((page: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <span className="font-medium">{page.page}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{page.views.toLocaleString()} views</span>
                  <div className="w-20">
                    <Progress value={page.percentage} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function PerformanceTab({ metrics }: { metrics: any }) {
  return (
    <div className="space-y-6">
      {/* Core Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">First Contentful Paint</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {metrics.first_contentful_paint.toFixed(2)}s
            </div>
            <Progress value={Math.min(100, (1.8 / metrics.first_contentful_paint) * 100)} className="h-2" />
            <p className="text-sm text-gray-600 mt-2">
              {metrics.first_contentful_paint < 1.8 ? "Good" : "Needs Improvement"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Largest Contentful Paint</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {metrics.largest_contentful_paint.toFixed(2)}s
            </div>
            <Progress value={Math.min(100, (2.5 / metrics.largest_contentful_paint) * 100)} className="h-2" />
            <p className="text-sm text-gray-600 mt-2">
              {metrics.largest_contentful_paint < 2.5 ? "Good" : "Needs Improvement"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cumulative Layout Shift</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {metrics.cumulative_layout_shift.toFixed(3)}
            </div>
            <Progress value={Math.min(100, (0.1 / metrics.cumulative_layout_shift) * 100)} className="h-2" />
            <p className="text-sm text-gray-600 mt-2">
              {metrics.cumulative_layout_shift < 0.1 ? "Good" : "Needs Improvement"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.first_input_delay.toFixed(0)}ms</div>
              <div className="text-sm text-gray-600">First Input Delay</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.speed_index.toFixed(1)}s</div>
              <div className="text-sm text-gray-600">Speed Index</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.time_to_interactive.toFixed(1)}s</div>
              <div className="text-sm text-gray-600">Time to Interactive</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.load_time.toFixed(1)}s</div>
              <div className="text-sm text-gray-600">Load Time</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SEOTab({ metrics }: { metrics: any }) {
  return (
    <div className="space-y-6">
      {/* SEO Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Health Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-5xl font-bold mb-4">{metrics.seo_score}/100</div>
            <Progress value={metrics.seo_score} className="h-3" />
            <p className="text-gray-600 mt-2">
              {metrics.seo_score >= 80 ? "Excellent SEO" : 
               metrics.seo_score >= 60 ? "Good SEO" : "Needs Improvement"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* SEO Issues */}
      {metrics.issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              SEO Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.issues.map((issue: any, index: number) => (
                <Alert key={index}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="capitalize">{issue.type}</AlertTitle>
                  <AlertDescription>{issue.message}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SEO Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold mb-1">{metrics.meta_title_length}</div>
            <div className="text-sm text-gray-600">Meta Title Length</div>
            <p className="text-xs text-gray-500 mt-1">
              {metrics.meta_title_length >= 50 && metrics.meta_title_length <= 60 ? "✓ Good" : "⚠ Needs Work"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold mb-1">{metrics.meta_description_length}</div>
            <div className="text-sm text-gray-600">Meta Description</div>
            <p className="text-xs text-gray-500 mt-1">
              {metrics.meta_description_length >= 150 && metrics.meta_description_length <= 160 ? "✓ Good" : "⚠ Needs Work"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold mb-1">{metrics.heading_structure_score}/100</div>
            <div className="text-sm text-gray-600">Heading Structure</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold mb-1">{metrics.image_alt_text_coverage}%</div>
            <div className="text-sm text-gray-600">Image Alt Text</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AccessibilityTab({ metrics }: { metrics: any }) {
  return (
    <div className="space-y-6">
      {/* Accessibility Score */}
      <Card>
        <CardHeader>
          <CardTitle>Accessibility Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-5xl font-bold mb-4">{metrics.accessibility_score}/100</div>
            <Progress value={metrics.accessibility_score} className="h-3" />
            <p className="text-gray-600 mt-2">
              {metrics.accessibility_score >= 80 ? "Excellent Accessibility" : 
               metrics.accessibility_score >= 60 ? "Good Accessibility" : "Needs Improvement"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Issues */}
      {metrics.issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Accessibility Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.issues.map((issue: any, index: number) => (
                <Alert key={index}>
                  <XCircle className="h-4 w-4" />
                  <AlertTitle className="capitalize">{issue.type}</AlertTitle>
                  <AlertDescription>{issue.message}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accessibility Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold mb-1">{metrics.color_contrast_score}/100</div>
            <div className="text-sm text-gray-600">Color Contrast</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold mb-1">{metrics.keyboard_navigation_score}/100</div>
            <div className="text-sm text-gray-600">Keyboard Navigation</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold mb-1">{metrics.heading_structure_score}/100</div>
            <div className="text-sm text-gray-600">Heading Structure</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RecommendationsTab({
  recommendations,
  healthScore,
  onUpdateStatus
}: {
  recommendations: AutomatedRecommendation[];
  healthScore: ProjectHealthScore;
  onUpdateStatus: (id: string, status: 'completed' | 'dismissed') => void;
}) {
  const priorityColors = {
    critical: 'border-red-500 bg-red-50',
    high: 'border-orange-500 bg-orange-50',
    medium: 'border-yellow-500 bg-yellow-50',
    low: 'border-green-500 bg-green-50'
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {recommendations.filter(r => r.priority === 'high' || r.priority === 'critical').length}
              </div>
              <div className="text-sm text-gray-600">High Priority</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {recommendations.filter(r => r.priority === 'medium').length}
              </div>
              <div className="text-sm text-gray-600">Medium Priority</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {recommendations.filter(r => r.priority === 'low').length}
              </div>
              <div className="text-sm text-gray-600">Low Priority</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Improvement Areas */}
      <Card>
        <CardHeader>
          <CardTitle>Top Improvement Areas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {healthScore.improvement_areas.map((area, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{area.area}</div>
                  <div className="text-sm text-gray-600">{area.description}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">
                      Impact: {area.impact === 5 ? 'High' : area.impact === 3 ? 'Medium' : 'Low'}
                    </Badge>
                    <Badge variant="outline">
                      {area.difficulty}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">+{area.impact * 5}</div>
                  <div className="text-sm text-gray-600">Score Points</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Recommendations */}
      <div className="space-y-4">
        {recommendations.map((recommendation) => (
          <Card key={recommendation.id} className={priorityColors[recommendation.priority]}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                  <p className="text-gray-600 mt-1">{recommendation.description}</p>
                </div>
                <div className="flex gap-2">
                  <Badge
                    className={
                      recommendation.priority === 'critical' ? 'bg-red-600' :
                      recommendation.priority === 'high' ? 'bg-orange-600' :
                      recommendation.priority === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
                    }
                  >
                    {recommendation.priority}
                  </Badge>
                  <Badge variant="outline">
                    {recommendation.category}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">+{recommendation.estimated_improvement}</div>
                  <div className="text-sm text-gray-600">Score Improvement</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{recommendation.effort}</div>
                  <div className="text-sm text-gray-600">Effort Required</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{recommendation.impact}</div>
                  <div className="text-sm text-gray-600">Impact Level</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Action Items:</h4>
                {recommendation.action_items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{item.description}</span>
                    <span className="text-xs text-gray-500">{item.estimated_time}min</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  onClick={() => onUpdateStatus(recommendation.id, 'completed')}
                  disabled={recommendation.status === 'completed'}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark Complete
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateStatus(recommendation.id, 'dismissed')}
                  disabled={recommendation.status === 'dismissed'}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {recommendations.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
            <p className="text-gray-600">
              No recommendations at this time. Your project is performing well!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Tablet icon component
function Tablet({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}