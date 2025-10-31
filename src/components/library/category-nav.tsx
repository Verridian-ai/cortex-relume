'use client';

import { useState, useEffect } from 'react';
import { 
  Navigation, 
  Form, 
  Layout, 
  MessageSquare, 
  Database, 
  Bell, 
  Image, 
  BarChart3, 
  FileText,
  ChevronRight,
  Grid3X3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  component_count: number;
  is_active: boolean;
  sort_order: number;
}

interface CategoryNavigationProps {
  onCategorySelect?: (category: Category) => void;
  selectedCategory?: string;
}

const iconMap = {
  navigation: Navigation,
  forms: Form,
  layout: Layout,
  content: MessageSquare,
  'data-display': Database,
  feedback: Bell,
  media: Image,
  charts: BarChart3,
  templates: FileText,
  default: Grid3X3,
};

const categoryData: Category[] = [
  {
    id: '1',
    name: 'Navigation',
    slug: 'navigation',
    description: 'Navigation components like menus, tabs, breadcrumbs',
    icon: 'navigation',
    color: '#3B82F6',
    component_count: 24,
    is_active: true,
    sort_order: 1,
  },
  {
    id: '2',
    name: 'Forms',
    slug: 'forms',
    description: 'Form elements including inputs, buttons, and validation',
    icon: 'forms',
    color: '#10B981',
    component_count: 31,
    is_active: true,
    sort_order: 2,
  },
  {
    id: '3',
    name: 'Layout',
    slug: 'layout',
    description: 'Layout components for structuring content',
    icon: 'layout',
    color: '#8B5CF6',
    component_count: 18,
    is_active: true,
    sort_order: 3,
  },
  {
    id: '4',
    name: 'Content',
    slug: 'content',
    description: 'Content display components like cards, modals, and tooltips',
    icon: 'content',
    color: '#F59E0B',
    component_count: 42,
    is_active: true,
    sort_order: 4,
  },
  {
    id: '5',
    name: 'Data Display',
    slug: 'data-display',
    description: 'Components for displaying data and information',
    icon: 'data-display',
    color: '#EF4444',
    component_count: 27,
    is_active: true,
    sort_order: 5,
  },
  {
    id: '6',
    name: 'Feedback',
    slug: 'feedback',
    description: 'User feedback components like alerts and notifications',
    icon: 'feedback',
    color: '#6366F1',
    component_count: 15,
    is_active: true,
    sort_order: 6,
  },
  {
    id: '7',
    name: 'Media',
    slug: 'media',
    description: 'Media-related components like images, videos, and galleries',
    icon: 'media',
    color: '#EC4899',
    component_count: 12,
    is_active: true,
    sort_order: 7,
  },
  {
    id: '8',
    name: 'Charts',
    slug: 'charts',
    description: 'Data visualization and chart components',
    icon: 'charts',
    color: '#14B8A6',
    component_count: 9,
    is_active: true,
    sort_order: 8,
  },
  {
    id: '9',
    name: 'Templates',
    slug: 'templates',
    description: 'Complete template and page layouts',
    icon: 'templates',
    color: '#6B7280',
    component_count: 7,
    is_active: true,
    sort_order: 9,
  },
];

export function CategoryNavigation({ onCategorySelect, selectedCategory }: CategoryNavigationProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCategories(categoryData);
      setLoading(false);
    }, 300);
  }, []);

  const handleCategoryClick = (category: Category) => {
    onCategorySelect?.(category);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="h-6 w-32 bg-muted rounded mx-auto mb-2" />
          <div className="h-4 w-64 bg-muted rounded mx-auto" />
        </div>
        <ScrollArea className="w-full">
          <div className="flex gap-4 p-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="flex-shrink-0">
                <Card className="w-40 h-32 animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-6 w-6 bg-muted rounded mb-2" />
                    <div className="h-4 w-20 bg-muted rounded mb-2" />
                    <div className="h-3 w-16 bg-muted rounded" />
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Browse by Category</h2>
        <p className="text-muted-foreground">
          Explore components organized by their primary functionality
        </p>
      </div>

      {/* Categories Grid/Scroll */}
      <ScrollArea className="w-full">
        <div className="flex gap-4 p-1">
          {categories.map((category) => {
            const IconComponent = iconMap[category.icon as keyof typeof iconMap] || iconMap.default;
            const isSelected = selectedCategory === category.slug;
            
            return (
              <Button
                key={category.id}
                variant={isSelected ? "default" : "outline"}
                className={`
                  flex-shrink-0 h-auto p-4 min-w-[160px] flex-col items-start space-y-2
                  ${isSelected ? 'shadow-md' : 'hover:shadow-sm'}
                `}
                onClick={() => handleCategoryClick(category)}
              >
                <div className="flex items-center justify-between w-full">
                  <IconComponent 
                    className="w-5 h-5" 
                    style={{ color: category.color }}
                  />
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </div>
                
                <div className="text-left w-full">
                  <div className="font-semibold text-sm mb-1">{category.name}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {category.description}
                  </div>
                  <div className="flex items-center justify-between w-full">
                    <Badge 
                      variant="secondary" 
                      className="text-xs"
                      style={{ 
                        backgroundColor: `${category.color}20`,
                        color: category.color,
                        borderColor: `${category.color}40`
                      }}
                    >
                      {category.component_count} components
                    </Badge>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border/50">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">9</div>
          <div className="text-xs text-muted-foreground">Categories</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">185</div>
          <div className="text-xs text-muted-foreground">Components</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">15+</div>
          <div className="text-xs text-muted-foreground">Frameworks</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">50+</div>
          <div className="text-xs text-muted-foreground">Collections</div>
        </div>
      </div>
    </div>
  );
}