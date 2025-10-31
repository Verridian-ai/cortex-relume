"use client";

import { useState, useEffect } from "react";
import { ProjectAnalyticsManager, TemplateAnalytics } from "@/lib/projects/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Star,
  Users,
  Clock,
  Globe,
  Calendar,
  Award,
  Eye,
  ThumbsUp,
  Target,
  Activity
} from "lucide-react";

interface TemplateUsageAnalyticsProps {
  templateId?: string;
  timeRange?: '24h' | '7d' | '30d' | '90d';
}

export function TemplateUsageAnalytics({
  templateId,
  timeRange = '30d'
}: TemplateUsageAnalyticsProps) {
  const [analytics, setAnalytics] = useState<TemplateAnalytics | null>(null);
  const [trendingTemplates, setTrendingTemplates] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'template' | 'trending'>('template');

  const analyticsManager = ProjectAnalyticsManager.getInstance();

  useEffect(() => {
    loadAnalytics();
  }, [templateId, timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      if (templateId) {
        // Load specific template analytics
        const templateAnalytics = await analyticsManager.getTemplateAnalytics(templateId);
        setAnalytics(templateAnalytics);
      } else {
        // Load trending templates
        const trending = await analyticsManager.getTrendingTemplates(10);
        setTrendingTemplates(trending);
        
        // Load template usage data (simulated - would come from database)
        const usageData = generateUsageData();
        setAnalyticsData(usageData);
      }
    } catch (error) {
      console.error("Error loading template analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (activeView === 'template' && !templateId) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Template Usage Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-600">Please select a template to view its analytics.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (activeView === 'trending') {
    return (
      <div className="space-y-6">
        {/* Trending Templates Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Trending Templates
              </CardTitle>
              <div className="flex gap-2">
                <Select value={timeRange} onValueChange={(value: any) => loadAnalytics()}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24 Hours</SelectItem>
                    <SelectItem value="7d">7 Days</SelectItem>
                    <SelectItem value="30d">30 Days</SelectItem>
                    <SelectItem value="90d">90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Trending Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingTemplates.map((template, index) => (
            <TrendingTemplateCard key={template.id} template={template} rank={index + 1} />
          ))}
        </div>

        {/* Usage Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Usage</p>
                  <p className="text-2xl font-bold">
                    {trendingTemplates.reduce((sum, t) => sum + t.usage_count, 0).toLocaleString()}
                  </p>
                </div>
                <Download className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold">
                    {(trendingTemplates.reduce((sum, t) => sum + t.rating, 0) / trendingTemplates.length).toFixed(1)}
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Categories</p>
                  <p className="text-2xl font-bold">
                    {new Set(trendingTemplates.map(t => t.category)).size}
                  </p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Growth</p>
                  <p className="text-2xl font-bold text-green-600">+15%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Template Analytics
            </CardTitle>
            <div className="flex gap-2">
              <Select value={timeRange} onValueChange={(value: any) => loadAnalytics()}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24 Hours</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="90d">90 Days</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setActiveView(activeView === 'template' ? 'trending' : 'template')}
              >
                {activeView === 'template' ? 'View Trending' : 'View Template'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {analytics && (
        <TemplateAnalyticsDetailedView analytics={analytics} />
      )}
    </div>
  );
}

function TrendingTemplateCard({ template, rank }: { template: any; rank: number }) {
  const isTopRank = rank <= 3;
  
  return (
    <Card className={`hover:shadow-lg transition-shadow ${isTopRank ? 'ring-2 ring-yellow-400' : ''}`}>
      <div className="aspect-video relative overflow-hidden rounded-t-lg bg-gray-100">
        <img
          src={template.thumbnail}
          alt={template.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder-template.jpg";
          }}
        />
        {isTopRank && (
          <Badge className="absolute top-2 left-2 bg-yellow-500">
            <Award className="h-3 w-3 mr-1" />
            #{rank}
          </Badge>
        )}
        <Badge className="absolute top-2 right-2 bg-blue-600">
          <Download className="h-3 w-3 mr-1" />
          {template.usage_count}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h4 className="font-semibold mb-1 line-clamp-1">{template.name}</h4>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{template.description}</p>
        
        <div className="flex items-center justify-between text-sm">
          <Badge variant="outline">{template.category}</Badge>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-400" />
            <span>{template.rating.toFixed(1)}</span>
          </div>
        </div>
        
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="font-semibold text-green-600">{template.metadata.seo_score}</div>
            <div className="text-gray-500">SEO</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-blue-600">{template.metadata.performance_score}</div>
            <div className="text-gray-500">Perf</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-purple-600">{template.metadata.accessibility_score}</div>
            <div className="text-gray-500">A11y</div>
          </div>
        </div>
        
        <div className="mt-3 flex gap-1">
          {template.is_featured && (
            <Badge size="sm" className="bg-yellow-500 text-xs">
              <Star className="h-2 w-2 mr-1" />
              Featured
            </Badge>
          )}
          {template.is_premium && (
            <Badge size="sm" className="bg-purple-600 text-xs">
              Premium
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TemplateAnalyticsDetailedView({ analytics }: { analytics: TemplateAnalytics }) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="usage">Usage</TabsTrigger>
        <TabsTrigger value="performance">Performance</TabsTrigger>
        <TabsTrigger value="feedback">Feedback</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Usage</p>
                  <p className="text-2xl font-bold">{analytics.usage_count.toLocaleString()}</p>
                </div>
                <Download className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+25% this month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Downloads</p>
                  <p className="text-2xl font-bold">{analytics.download_count.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+18% this month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rating</p>
                  <p className="text-2xl font-bold">{analytics.rating.toFixed(1)}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-600">{analytics.review_count} reviews</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold">{(analytics.success_rate * 100).toFixed(1)}%</p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-600">{analytics.average_time_to_deploy}min avg deploy</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Template Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Template Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(analytics.demographic_breakdown).reduce((sum, val) => sum + val, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Demographics</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Object.keys(analytics.geographic_breakdown).length}
                </div>
                <div className="text-sm text-gray-600">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Object.keys(analytics.integration_analytics).length}
                </div>
                <div className="text-sm text-gray-600">Integrations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {(analytics.user_satisfaction * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Satisfaction</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="usage" className="space-y-6">
        {/* Usage Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.trend_data.map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{trend.date}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold">{trend.usage} uses</div>
                      <div className="text-sm text-gray-600">
                        Rating: {trend.rating.toFixed(1)}
                      </div>
                    </div>
                    <div className="w-24">
                      <Progress value={(trend.usage / Math.max(...analytics.trend_data.map(t => t.usage))) * 100} className="h-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Demographics */}
        <Card>
          <CardHeader>
            <CardTitle>Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.demographic_breakdown).map(([demo, percentage]: [string, any]) => (
                <div key={demo} className="flex items-center justify-between">
                  <span className="capitalize">{demo}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32">
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

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.geographic_breakdown)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .map(([country, count]: [string, any]) => (
                <div key={country} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{count} uses</span>
                    <div className="w-20">
                      <Progress 
                        value={(count / Math.max(...Object.values(analytics.geographic_breakdown))) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="performance" className="space-y-6">
        {/* Integration Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Integration Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.integration_analytics).map(([integration, data]: [string, any]) => (
                <div key={integration} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium capitalize">{integration}</h4>
                    <Badge variant="outline">
                      {(data.success_rate * 100).toFixed(1)}% success
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Usage: </span>
                      <span className="font-medium">{data.usage}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Success Rate: </span>
                      <span className="font-medium">{(data.success_rate * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Progress value={data.success_rate * 100} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">{analytics.average_time_to_deploy}m</div>
              <div className="text-sm text-gray-600">Avg Deploy Time</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">{(analytics.success_rate * 100).toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">{(analytics.user_satisfaction * 100).toFixed(0)}%</div>
              <div className="text-sm text-gray-600">User Satisfaction</div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="feedback" className="space-y-6">
        {/* Rating Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Rating Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-yellow-600">{analytics.rating.toFixed(1)}</div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.floor(analytics.rating) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">Based on {analytics.review_count} reviews</p>
            </div>
          </CardContent>
        </Card>

        {/* User Feedback Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Feedback Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Most Appreciated</span>
                </div>
                <span className="text-sm text-gray-600">Easy customization</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Most Used Feature</span>
                </div>
                <span className="text-sm text-gray-600">Responsive design</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium">Top Use Case</span>
                </div>
                <span className="text-sm text-gray-600">Business websites</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

// Helper function to generate usage data (would be replaced with actual API call)
function generateUsageData() {
  return Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usage: Math.floor(Math.random() * 100) + 20,
    rating: Math.random() * 2 + 3 // 3-5 rating
  }));
}