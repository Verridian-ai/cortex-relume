'use client';

import { useState } from 'react';
import { SearchResults } from '@/components/search';
import { ComponentData } from '@/types/component';
import { componentAnalytics } from '@/lib/analytics/component-usage';
import { componentRecommendations } from '@/lib/ai/component-recommendations';

export default function ComponentSearchDemo() {
  const [selectedComponent, setSelectedComponent] = useState<ComponentData | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  const handleComponentSelect = async (component: ComponentData) => {
    setSelectedComponent(component);
    
    // Track component view
    await componentAnalytics.trackComponentView(component.id);
    
    // Get recommendations for similar components
    const relatedComponents = await componentRecommendations.getRelatedComponents(component.id, 6);
    setRecommendations(relatedComponents);
    
    // Get component performance metrics
    const performance = await componentAnalytics.getComponentPerformance(component.id);
    setAnalytics(performance);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Component Search & Discovery</h1>
          <p className="text-muted-foreground">
            Find, explore, and discover the perfect components for your projects
          </p>
        </div>

        {/* Search Results */}
        <SearchResults
          onComponentSelect={handleComponentSelect}
          className="mb-8"
        />

        {/* Selected Component Details */}
        {selectedComponent && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2">
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">{selectedComponent.name}</h2>
                <p className="text-muted-foreground mb-4">{selectedComponent.description}</p>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Props</h3>
                    {selectedComponent.props && selectedComponent.props.length > 0 ? (
                      <div className="space-y-2">
                        {selectedComponent.props.map((prop, index) => (
                          <div key={index} className="text-sm">
                            <code className="bg-muted px-2 py-1 rounded">
                              {prop.name}: {prop.type}
                            </code>
                            {prop.required && (
                              <span className="text-red-500 ml-2">required</span>
                            )}
                            {prop.description && (
                              <p className="text-muted-foreground mt-1">{prop.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No props defined</p>
                    )}
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Examples</h3>
                    {selectedComponent.examples && selectedComponent.examples.length > 0 ? (
                      <div className="space-y-2">
                        {selectedComponent.examples.map((example, index) => (
                          <div key={index} className="border rounded p-3">
                            <h4 className="font-medium text-sm">{example.title}</h4>
                            {example.description && (
                              <p className="text-xs text-muted-foreground">{example.description}</p>
                            )}
                            <pre className="text-xs bg-muted p-2 mt-2 rounded overflow-x-auto">
                              <code>{example.code}</code>
                            </pre>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No examples available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Performance Metrics */}
              {analytics && (
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="font-semibold mb-4">Performance</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Load Time</span>
                      <span className="text-sm font-medium">{analytics.averageLoadTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Error Rate</span>
                      <span className="text-sm font-medium">{analytics.errorRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">User Satisfaction</span>
                      <span className="text-sm font-medium">{analytics.userSatisfaction}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Community Score</span>
                      <span className="text-sm font-medium">{analytics.communityScore}/100</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Related Components */}
              {recommendations.length > 0 && (
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="font-semibold mb-4">Related Components</h3>
                  <div className="space-y-3">
                    {recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">{rec.component.name}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {rec.component.description}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {Math.round(rec.score * 100)}% match
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold mb-4">Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => componentAnalytics.trackComponentBookmark(selectedComponent.id)}
                    className="w-full text-left px-3 py-2 text-sm bg-secondary rounded hover:bg-secondary/80"
                  >
                    Bookmark Component
                  </button>
                  <button
                    onClick={() => componentAnalytics.trackComponentDownload(selectedComponent.id)}
                    className="w-full text-left px-3 py-2 text-sm bg-secondary rounded hover:bg-secondary/80"
                  >
                    Add to Project
                  </button>
                  {selectedComponent.documentation && (
                    <a
                      href={selectedComponent.documentation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-left px-3 py-2 text-sm bg-secondary rounded hover:bg-secondary/80"
                    >
                      View Documentation
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}