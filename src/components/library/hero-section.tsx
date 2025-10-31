'use client';

import { useState, useEffect } from 'react';
import { Search, Sparkles, Zap, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface HeroSectionProps {
  onSearchChange?: (query: string) => void;
  featuredComponents?: Array<{
    name: string;
    description: string;
    category: string;
    icon: string;
  }>;
}

export function LibraryHero({ onSearchChange, featuredComponents = [] }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);

  useEffect(() => {
    // Simulate trending searches - in real app, fetch from API
    setTrendingSearches(['Buttons', 'Forms', 'Navigation', 'Cards', 'Modals', 'Tables']);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange?.(value);
  };

  const handleTrendingSearch = (query: string) => {
    setSearchQuery(query);
    onSearchChange?.(query);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          {/* Badge */}
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            New: AI-Powered Component Generation
          </Badge>
          
          {/* Main Heading */}
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Component Library
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Discover, preview, and integrate high-quality React components into your project. 
            Browse our curated collection of 100+ UI components, layouts, and interactive elements.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">100+</div>
              <div className="text-sm text-muted-foreground">Components</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">9</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">15+</div>
              <div className="text-sm text-muted-foreground">Frameworks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">Collections</div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search components, categories, or tags..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-32 h-12 text-lg"
              />
              <Button 
                size="sm" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                variant="default"
              >
                Search
              </Button>
            </div>
          </div>

          {/* Trending Searches */}
          {trendingSearches.length > 0 && (
            <div className="mb-8">
              <p className="text-sm text-muted-foreground mb-3">
                <TrendingUp className="w-4 h-4 inline mr-1" />
                Trending searches:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {trendingSearches.map((search) => (
                  <Button
                    key={search}
                    variant="outline"
                    size="sm"
                    onClick={() => handleTrendingSearch(search)}
                    className="hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {search}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="group">
              <Zap className="w-4 h-4 mr-2 group-hover:animate-pulse" />
              Generate with AI
            </Button>
            <Button size="lg" variant="outline">
              Browse Collections
            </Button>
            <Button size="lg" variant="ghost">
              View Documentation
            </Button>
          </div>
        </div>

        {/* Featured Components Preview */}
        {featuredComponents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {featuredComponents.map((component) => (
              <div
                key={component.name}
                className="group relative p-6 rounded-xl border bg-card hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <div className="text-2xl mb-3">{component.icon}</div>
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                  {component.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {component.description}
                </p>
                <Badge variant="secondary" className="text-xs">
                  {component.category}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}