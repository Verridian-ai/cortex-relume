'use client';

import { useState, useEffect } from 'react';
import { Grid, List, SortAsc, SortDesc } from 'lucide-react';
import { ComponentData } from '@/types/component';
import { ComponentCard } from './component-card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchFilters } from '@/lib/search/component-search';

interface ComponentGridProps {
  components: ComponentData[];
  isLoading?: boolean;
  onComponentView?: (component: ComponentData) => void;
  onComponentAdd?: (component: ComponentData) => void;
  onComponentBookmark?: (component: ComponentData) => void;
  className?: string;
  compact?: boolean;
}

type SortOption = 'relevance' | 'name' | 'popularity' | 'recent' | 'rating';
type ViewMode = 'grid' | 'list';

export function ComponentGrid({
  components,
  isLoading = false,
  onComponentView,
  onComponentAdd,
  onComponentBookmark,
  className = '',
  compact = false
}: ComponentGridProps) {
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortedComponents, setSortedComponents] = useState<ComponentData[]>(components);

  useEffect(() => {
    setSortedComponents([...components]);
  }, [components]);

  useEffect(() => {
    const sorted = [...components].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'popularity':
          return (b.popularity || 0) - (a.popularity || 0);
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'relevance':
        default:
          return (b.popularity || 0) - (a.popularity || 0);
      }
    });
    setSortedComponents(sorted);
  }, [components, sortBy]);

  const GridView = () => (
    <div className={`grid gap-4 ${
      compact 
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    }`}>
      {sortedComponents.map((component) => (
        <ComponentCard
          key={component.id}
          component={component}
          onViewDetails={onComponentView}
          onAddToProject={onComponentAdd}
          onBookmark={onComponentBookmark}
          compact={compact}
        />
      ))}
    </div>
  );

  const ListView = () => (
    <div className="space-y-3">
      {sortedComponents.map((component) => (
        <ComponentCard
          key={component.id}
          component={component}
          onViewDetails={onComponentView}
          onAddToProject={onComponentAdd}
          onBookmark={onComponentBookmark}
          compact={true}
          className="w-full"
        />
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Grid className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No components found</h3>
      <p className="text-muted-foreground max-w-sm">
        Try adjusting your search terms or filters to find what you're looking for.
      </p>
    </div>
  );

  const LoadingState = () => (
    <div className={`grid gap-4 ${
      compact 
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    }`}>
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="border rounded-lg p-4 animate-pulse"
        >
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-full"></div>
            <div className="h-3 bg-muted rounded w-2/3"></div>
            <div className="flex gap-2">
              <div className="h-6 bg-muted rounded w-16"></div>
              <div className="h-6 bg-muted rounded w-12"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return <LoadingState />;
  }

  if (components.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={className}>
      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {components.length} component{components.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none border-r"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">
                <div className="flex items-center gap-2">
                  <SortDesc className="h-3 w-3" />
                  Relevance
                </div>
              </SelectItem>
              <SelectItem value="name">
                <div className="flex items-center gap-2">
                  <SortAsc className="h-3 w-3" />
                  Name (A-Z)
                </div>
              </SelectItem>
              <SelectItem value="popularity">
                <div className="flex items-center gap-2">
                  <SortDesc className="h-3 w-3" />
                  Popularity
                </div>
              </SelectItem>
              <SelectItem value="rating">
                <div className="flex items-center gap-2">
                  <SortDesc className="h-3 w-3" />
                  Rating
                </div>
              </SelectItem>
              <SelectItem value="recent">
                <div className="flex items-center gap-2">
                  <SortDesc className="h-3 w-3" />
                  Recently Updated
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Components Grid/List */}
      {viewMode === 'grid' ? <GridView /> : <ListView />}

      {/* Load More Button (if needed for pagination) */}
      {components.length >= 20 && (
        <div className="flex justify-center mt-8">
          <Button variant="outline">
            Load More Components
          </Button>
        </div>
      )}
    </div>
  );
}