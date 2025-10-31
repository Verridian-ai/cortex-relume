'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Grid3X3, 
  List, 
  SortAsc, 
  SortDesc, 
  Eye, 
  Star, 
  Download, 
  Heart,
  Share,
  Filter,
  Search,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ComponentFilters } from './search-filters';
import { ComponentCard } from '../search/component-card';

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
  complexity_score: number;
  accessibility_score: number;
  created_at: string;
  updated_at: string;
}

interface ComponentExplorerProps {
  searchQuery?: string;
  selectedCategory?: string;
  filters?: ComponentFilters;
  onComponentSelect?: (component: Component) => void;
}

export function ComponentExplorer({ 
  searchQuery = '', 
  selectedCategory, 
  filters,
  onComponentSelect 
}: ComponentExplorerProps) {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalComponents, setTotalComponents] = useState(0);
  
  const itemsPerPage = 20;

  // Mock data for demonstration
  const mockComponents: Component[] = Array.from({ length: 185 }, (_, i) => ({
    id: `component-${i + 1}`,
    name: `Component ${i + 1}`,
    description: `This is a sample component description for component ${i + 1}. It provides enhanced functionality and can be customized for various use cases.`,
    category: ['Navigation', 'Forms', 'Layout', 'Content', 'Data Display', 'Feedback', 'Media', 'Charts', 'Templates'][Math.floor(i / 20)],
    framework: ['React', 'Vue', 'Angular', 'Svelte', 'HTML'][i % 5],
    rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 - 5.0
    usage_count: Math.floor(Math.random() * 15000) + 500,
    downloads: Math.floor(Math.random() * 8000) + 200,
    author: { 
      name: `Author ${Math.floor(i / 10) + 1}`, 
      avatar: `/avatars/author-${Math.floor(i / 10) + 1}.jpg` 
    },
    preview_url: `/preview/component-${i + 1}`,
    tags: ['Accessible', 'Responsive', 'Interactive', 'Modern'].slice(0, Math.floor(Math.random() * 3) + 1),
    is_featured: Math.random() > 0.8,
    complexity_score: Math.floor(Math.random() * 5) + 1,
    accessibility_score: Math.floor(Math.random() * 20) + 80,
    created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  }));

  useEffect(() => {
    setLoading(true);
    // Simulate API call with filtering
    setTimeout(() => {
      let filteredComponents = [...mockComponents];

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredComponents = filteredComponents.filter(component =>
          component.name.toLowerCase().includes(query) ||
          component.description.toLowerCase().includes(query) ||
          component.category.toLowerCase().includes(query) ||
          component.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      // Apply category filter
      if (selectedCategory) {
        filteredComponents = filteredComponents.filter(component =>
          component.category.toLowerCase() === selectedCategory.toLowerCase()
        );
      }

      // Apply additional filters
      if (filters) {
        if (filters.frameworks.length > 0) {
          filteredComponents = filteredComponents.filter(component =>
            filters.frameworks.includes(component.framework.toLowerCase())
          );
        }

        if (filters.tags.length > 0) {
          filteredComponents = filteredComponents.filter(component =>
            filters.tags.some(tag => component.tags.includes(tag))
          );
        }

        if (filters.difficulty.length > 0) {
          filteredComponents = filteredComponents.filter(component => {
            const complexity = component.complexity_score;
            return filters.difficulty.some(difficulty => {
              switch (difficulty) {
                case 'beginner': return complexity <= 2;
                case 'intermediate': return complexity >= 3 && complexity <= 4;
                case 'advanced': return complexity >= 5;
                default: return true;
              }
            });
          });
        }

        if (filters.rating) {
          filteredComponents = filteredComponents.filter(component =>
            component.rating >= filters.rating!
          );
        }

        // Apply sorting
        if (filters.sortBy) {
          filteredComponents.sort((a, b) => {
            const order = filters.sortOrder === 'asc' ? 1 : -1;
            switch (filters.sortBy) {
              case 'popularity':
                return (a.usage_count - b.usage_count) * order;
              case 'rating':
                return (a.rating - b.rating) * order;
              case 'recent':
                return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * order;
              case 'name':
                return a.name.localeCompare(b.name) * order;
              default:
                return 0;
            }
          });
        }
      }

      setComponents(filteredComponents);
      setTotalComponents(filteredComponents.length);
      setCurrentPage(1);
      setLoading(false);
    }, 300);
  }, [searchQuery, selectedCategory, filters]);

  const paginatedComponents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return components.slice(startIndex, startIndex + itemsPerPage);
  }, [components, currentPage]);

  const totalPages = Math.ceil(components.length / itemsPerPage);

  const handleComponentSelect = (component: Component) => {
    onComponentSelect?.(component);
  };

  const renderPagination = () => {
    const pages = [];
    const showPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    let endPage = Math.min(totalPages, startPage + showPages - 1);

    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        
        {startPage > 1 && (
          <>
            <Button
              variant={currentPage === 1 ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(1)}
            >
              1
            </Button>
            {startPage > 2 && <span className="text-muted-foreground">...</span>}
          </>
        )}

        {pages.map(page => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </Button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-muted-foreground">...</span>}
            <Button
              variant={currentPage === totalPages ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
            >
              {totalPages}
            </Button>
          </>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-6 w-32 bg-muted rounded mb-2" />
            <div className="h-4 w-48 bg-muted rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-20 bg-muted rounded" />
            <div className="h-9 w-20 bg-muted rounded" />
          </div>
        </div>

        {/* Grid Loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 w-24 bg-muted rounded mb-2" />
                <div className="h-5 w-32 bg-muted rounded" />
                <div className="h-4 w-full bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 w-16 bg-muted rounded" />
                  <div className="h-6 w-16 bg-muted rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-4 w-16 bg-muted rounded" />
                  <div className="h-4 w-16 bg-muted rounded" />
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            {selectedCategory 
              ? `${selectedCategory} Components`
              : 'All Components'
            }
          </h2>
          <p className="text-muted-foreground">
            {totalComponents.toLocaleString()} components found
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* Results Info */}
          <div className="text-sm text-muted-foreground hidden sm:block">
            {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalComponents)} of {totalComponents}
          </div>
        </div>
      </div>

      {/* Components Grid/List */}
      {paginatedComponents.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No components found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search terms or filters
          </p>
          <Button variant="outline">
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
        }>
          {paginatedComponents.map((component) => (
            <ComponentCard
              key={component.id}
              component={{
                name: component.name,
                description: component.description,
                category: component.category,
                framework: component.framework,
                rating: component.rating,
                usage_count: component.usage_count,
                author: component.author,
                tags: component.tags,
                is_featured: component.is_featured,
              }}
              viewMode={viewMode}
              onClick={() => handleComponentSelect(component)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && renderPagination()}
    </div>
  );
}