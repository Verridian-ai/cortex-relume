'use client';

import { useState, useEffect } from 'react';
import { Star, Download, Eye, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Component {
  id: string;
  name: string;
  description: string;
  category: string;
  framework: string;
  rating: number;
  usage_count: number;
  downloads: number;
  author: {
    name: string;
    avatar?: string;
  };
  preview_url?: string;
  tags: string[];
  is_featured: boolean;
}

interface FeaturedComponentsProps {
  limit?: number;
  onComponentSelect?: (component: Component) => void;
}

const featuredComponentsData: Component[] = [
  {
    id: '1',
    name: 'Advanced Form Builder',
    description: 'Complete form builder with validation, multiple input types, and real-time preview',
    category: 'Forms',
    framework: 'React',
    rating: 4.9,
    usage_count: 15420,
    downloads: 8750,
    author: { name: 'UI Team', avatar: '/avatars/ui-team.jpg' },
    preview_url: '/preview/form-builder',
    tags: ['Forms', 'Validation', 'Interactive'],
    is_featured: true,
  },
  {
    id: '2',
    name: 'Data Table Pro',
    description: 'Powerful data table with sorting, filtering, pagination, and export functionality',
    category: 'Data Display',
    framework: 'React',
    rating: 4.8,
    usage_count: 12300,
    downloads: 6800,
    author: { name: 'Data Lab', avatar: '/avatars/data-lab.jpg' },
    preview_url: '/preview/data-table',
    tags: ['Tables', 'Data', 'Interactive'],
    is_featured: true,
  },
  {
    id: '3',
    name: 'Modal System',
    description: 'Accessible modal system with focus management and multiple trigger types',
    category: 'Content',
    framework: 'React',
    rating: 4.7,
    usage_count: 9800,
    downloads: 5200,
    author: { name: 'A11y Team', avatar: '/avatars/a11y.jpg' },
    preview_url: '/preview/modal-system',
    tags: ['Modal', 'Accessibility', 'Interactive'],
    is_featured: true,
  },
  {
    id: '4',
    name: 'Navigation Suite',
    description: 'Complete navigation system including header, sidebar, and mobile menu',
    category: 'Navigation',
    framework: 'Vue',
    rating: 4.6,
    usage_count: 8700,
    downloads: 4500,
    author: { name: 'Nav Experts', avatar: '/avatars/nav.jpg' },
    preview_url: '/preview/navigation-suite',
    tags: ['Navigation', 'Responsive', 'Mobile'],
    is_featured: true,
  },
];

export function FeaturedComponents({ limit = 4, onComponentSelect }: FeaturedComponentsProps) {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setComponents(featuredComponentsData.slice(0, limit));
      setLoading(false);
    }, 500);
  }, [limit]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="h-8 w-48 bg-muted rounded mx-auto mb-2" />
          <div className="h-4 w-96 bg-muted rounded mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 w-24 bg-muted rounded mb-2" />
                <div className="h-6 w-32 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted rounded" />
                  <div className="h-4 w-3/4 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-3xl font-bold">Featured Components</h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover our most popular and highly-rated components, perfect for building modern web applications.
        </p>
      </div>

      {/* Components Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {components.map((component) => (
          <Card 
            key={component.id} 
            className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20"
            onClick={() => onComponentSelect?.(component)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between mb-2">
                <Badge variant="secondary" className="text-xs">
                  {component.category}
                </Badge>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium">{component.rating}</span>
                </div>
              </div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">
                {component.name}
              </CardTitle>
              <CardDescription className="text-sm line-clamp-2">
                {component.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {component.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {component.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{component.tags.length - 2}
                  </Badge>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{component.usage_count.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    <span>{component.downloads.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={component.author.avatar} alt={component.author.name} />
                    <AvatarFallback className="text-xs">
                      {component.author.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    {component.author.name}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View All Button */}
      <div className="text-center">
        <Button variant="outline" size="lg" className="group">
          View All Components
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}