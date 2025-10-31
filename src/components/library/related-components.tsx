'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Star, Download, Eye } from 'lucide-react';
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
}

interface RelatedComponentsProps {
  currentComponentId: string;
  category: string;
  limit?: number;
  recommendationType?: 'similar' | 'popular' | 'trending';
}

const relatedComponentsData: Component[] = [
  {
    id: '2',
    name: 'Form Field System',
    description: 'Enhanced form field components with validation states and helper text',
    category: 'Forms',
    framework: 'React',
    rating: 4.8,
    usage_count: 9800,
    downloads: 5200,
    author: { name: 'UI Team', avatar: '/avatars/ui-team.jpg' },
    preview_url: '/preview/form-field-system',
    tags: ['Forms', 'Validation', 'Fields'],
  },
  {
    id: '3',
    name: 'Input Components',
    description: 'Complete set of input components including text, email, password, and more',
    category: 'Forms',
    framework: 'React',
    rating: 4.7,
    usage_count: 12400,
    downloads: 6800,
    author: { name: 'Input Experts', avatar: '/avatars/input.jpg' },
    preview_url: '/preview/input-components',
    tags: ['Forms', 'Input', 'Validation'],
  },
  {
    id: '4',
    name: 'Validation Engine',
    description: 'Powerful validation engine with real-time validation and custom rules',
    category: 'Forms',
    framework: 'Vue',
    rating: 4.6,
    usage_count: 6700,
    downloads: 3400,
    author: { name: 'Validation Team', avatar: '/avatars/validation.jpg' },
    preview_url: '/preview/validation-engine',
    tags: ['Forms', 'Validation', 'Vue'],
  },
  {
    id: '5',
    name: 'Select Dropdown',
    description: 'Advanced dropdown selection with search, filtering, and multi-select',
    category: 'Forms',
    framework: 'React',
    rating: 4.5,
    usage_count: 8900,
    downloads: 4600,
    author: { name: 'Dropdown Team', avatar: '/avatars/dropdown.jpg' },
    preview_url: '/preview/select-dropdown',
    tags: ['Forms', 'Select', 'Dropdown'],
  },
  {
    id: '6',
    name: 'Checkbox & Radio',
    description: 'Accessible checkbox and radio button components with groups',
    category: 'Forms',
    framework: 'Angular',
    rating: 4.4,
    usage_count: 5600,
    downloads: 2900,
    author: { name: 'A11y Team', avatar: '/avatars/a11y.jpg' },
    preview_url: '/preview/checkbox-radio',
    tags: ['Forms', 'Checkbox', 'Radio', 'Accessible'],
  },
  {
    id: '7',
    name: 'Date Picker',
    description: 'Feature-rich date picker with calendar, range selection, and localization',
    category: 'Forms',
    framework: 'React',
    rating: 4.3,
    usage_count: 7300,
    downloads: 3800,
    author: { name: 'Date Team', avatar: '/avatars/date.jpg' },
    preview_url: '/preview/date-picker',
    tags: ['Forms', 'Date', 'Calendar', 'Time'],
  },
];

export function RelatedComponents({ 
  currentComponentId, 
  category, 
  limit = 6,
  recommendationType = 'similar'
}: RelatedComponentsProps) {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call for related components
    setTimeout(() => {
      // Filter out current component and shuffle for variety
      const filtered = relatedComponentsData
        .filter(component => component.id !== currentComponentId)
        .sort(() => Math.random() - 0.5)
        .slice(0, limit);
      
      setComponents(filtered);
      setLoading(false);
    }, 300);
  }, [currentComponentId, category, limit]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="h-6 w-48 bg-muted rounded mx-auto mb-2" />
          <div className="h-4 w-64 bg-muted rounded mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 w-24 bg-muted rounded mb-2" />
                <div className="h-5 w-32 bg-muted rounded" />
                <div className="h-4 w-full bg-muted rounded" />
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

  const getRecommendationTitle = () => {
    switch (recommendationType) {
      case 'similar':
        return `Similar ${category} Components`;
      case 'popular':
        return 'Popular Components';
      case 'trending':
        return 'Trending Components';
      default:
        return 'Related Components';
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{getRecommendationTitle()}</h2>
        <p className="text-muted-foreground">
          Other components you might find useful
        </p>
      </div>

      {/* Components Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {components.map((component) => (
          <Card 
            key={component.id} 
            className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20"
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

              {/* Author & View Button */}
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
                <Button size="sm" variant="ghost" className="h-auto p-1">
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View All Button */}
      <div className="text-center">
        <Button variant="outline" size="lg" className="group">
          View All {category} Components
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}