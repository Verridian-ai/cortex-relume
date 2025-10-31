'use client';

import { useState } from 'react';
import { 
  ExternalLink, 
  Star, 
  Download, 
  Shield, 
  Code, 
  Clock,
  Users,
  Heart,
  BookOpen,
  GitBranch
} from 'lucide-react';
import { ComponentData } from '@/types/component';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ButtonProps } from '@/components/ui/button';

interface ComponentCardProps {
  component: ComponentData;
  onViewDetails?: (component: ComponentData) => void;
  onAddToProject?: (component: ComponentData) => void;
  onBookmark?: (component: ComponentData) => void;
  className?: string;
  showActions?: boolean;
  compact?: boolean;
}

export function ComponentCard({
  component,
  onViewDetails,
  onAddToProject,
  onBookmark,
  className = '',
  showActions = true,
  compact = false
}: ComponentCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleBookmark = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      setIsBookmarked(!isBookmarked);
      onBookmark?.(component);
    } catch (error) {
      console.error('Error bookmarking component:', error);
      setIsBookmarked(!isBookmarked);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    setIsLiked(!isLiked);
  };

  const formatNumber = (num?: number) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'beginner': return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'intermediate': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'advanced': return 'bg-red-500/10 text-red-700 dark:text-red-400';
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  const getPopularityColor = (popularity?: number) => {
    if (!popularity) return 'bg-gray-500/10 text-gray-700';
    if (popularity >= 90) return 'bg-green-500/10 text-green-700';
    if (popularity >= 70) return 'bg-blue-500/10 text-blue-700';
    if (popularity >= 50) return 'bg-yellow-500/10 text-yellow-700';
    return 'bg-red-500/10 text-red-700';
  };

  return (
    <Card className={`group hover:shadow-md transition-all duration-200 ${className}`}>
      <CardHeader className={compact ? 'pb-2' : 'pb-3'}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className={`${compact ? 'text-base' : 'text-lg'} line-clamp-1 group-hover:text-primary transition-colors`}>
              {component.name}
            </CardTitle>
            {!compact && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {component.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleBookmark}
              disabled={isLoading}
            >
              <Heart 
                className={`h-4 w-4 ${isBookmarked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
              />
            </Button>
            
            {component.repository && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                asChild
              >
                <a href={component.repository} target="_blank" rel="noopener noreferrer">
                  <GitBranch className="h-4 w-4 text-muted-foreground" />
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge 
            variant="outline" 
            className={`text-xs ${getComplexityColor(component.complexity)}`}
          >
            {component.complexity}
          </Badge>
          
          {component.popularity && (
            <Badge 
              variant="outline" 
              className={`text-xs ${getPopularityColor(component.popularity)}`}
            >
              <Star className="h-3 w-3 mr-1" />
              {component.popularity}
            </Badge>
          )}
          
          {component.accessibility?.compliant && (
            <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-700">
              <Shield className="h-3 w-3 mr-1" />
              A11y
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className={compact ? 'pt-0' : 'pt-0'}>
        {!compact && (
          <div className="space-y-3">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {component.downloads && (
                <div className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  <span>{formatNumber(component.downloads)}</span>
                </div>
              )}
              
              {component.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{component.rating.toFixed(1)}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatDate(component.updatedAt)}</span>
              </div>
            </div>

            {component.tags && component.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {component.tags.slice(0, 4).map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
                {component.tags.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{component.tags.length - 4} more
                  </Badge>
                )}
              </div>
            )}

            {component.supportedFrameworks && component.supportedFrameworks.length > 0 && (
              <div className="flex items-center gap-2">
                <Code className="h-3 w-3 text-muted-foreground" />
                <div className="flex gap-1">
                  {component.supportedFrameworks.slice(0, 3).map((framework, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {framework}
                    </Badge>
                  ))}
                  {component.supportedFrameworks.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{component.supportedFrameworks.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {showActions && (
          <div className="flex items-center gap-2 mt-4">
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={() => onViewDetails?.(component)}
            >
              <BookOpen className="h-3 w-3 mr-1" />
              View Details
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onAddToProject?.(component)}
            >
              Add to Project
            </Button>
          </div>
        )}

        {compact && component.tags && component.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {component.tags.slice(0, 2).map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs"
              >
                {tag}
              </Badge>
            ))}
            {component.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{component.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}