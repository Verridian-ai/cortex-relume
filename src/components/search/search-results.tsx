'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { SearchResult, SearchOptions } from '@/lib/search/component-search';
import { ComponentData } from '@/types/component';
import { ComponentSearchBar } from './component-search-bar';
import { ComponentFilters } from './component-filters';
import { ComponentGrid } from './component-grid';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchFilters as SearchFiltersType } from '@/lib/search/component-search';

interface SearchResultsProps {
  onComponentSelect?: (component: ComponentData) => void;
  className?: string;
  showFilters?: boolean;
  showSearchBar?: boolean;
}

export function SearchResults({
  onComponentSelect,
  className = '',
  showFilters = true,
  showSearchBar = true
}: SearchResultsProps) {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [searchTime, setSearchTime] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  
  // Search state
  const [currentQuery, setCurrentQuery] = useState('');
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [sortBy, setSortBy] = useState<'relevance' | 'popularity' | 'name' | 'recent'>('relevance');
  
  // Available filters
  const [availableFilters, setAvailableFilters] = useState({
    categories: [] as string[],
    tags: [] as string[],
    frameworks: [] as string[],
    licenses: [] as string[]
  });

  // Load available filters on mount
  useEffect(() => {
    loadAvailableFilters();
  }, []);

  const loadAvailableFilters = async () => {
    // In a real app, these would come from the database
    const filters = {
      categories: [
        'UI Components', 'Layout', 'Forms', 'Navigation', 'Data Display',
        'Feedback', 'Charts', 'Tables', 'Media', 'Typography'
      ],
      tags: [
        'responsive', 'accessibility', 'dark-mode', 'animation', 'interactive',
        'form', 'button', 'modal', 'dropdown', 'calendar', 'chart', 'table'
      ],
      frameworks: [
        'React', 'Vue', 'Angular', 'Svelte', 'Vanilla JS', 'Next.js', 'Nuxt.js'
      ],
      licenses: [
        'MIT', 'Apache 2.0', 'GPL 3.0', 'BSD 3.0', 'ISC', 'Unlicense'
      ]
    };
    
    setAvailableFilters(filters);
  };

  const handleSearch = useCallback(async (searchOptions: SearchOptions) => {
    setIsLoading(true);
    setCurrentPage(1);
    
    try {
      // Import componentSearch dynamically to avoid SSR issues
      const { componentSearch } = await import('@/lib/search/component-search');
      
      const result = await componentSearch.search({
        ...searchOptions,
        query: currentQuery || searchOptions.query,
        filters,
        sortBy,
        offset: 0,
        limit: itemsPerPage
      });

      setSearchResults(result.results);
      setTotalResults(result.total);
      setSearchTime(result.took);
      setCurrentQuery(searchOptions.query);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentQuery, filters, sortBy, itemsPerPage]);

  const handleFilterChange = useCallback((newFilters: SearchFiltersType) => {
    setFilters(newFilters);
    
    // Re-run search with new filters
    if (currentQuery) {
      setCurrentPage(1);
      handleSearch({
        query: currentQuery,
        filters: newFilters,
        sortBy,
        offset: 0,
        limit: itemsPerPage
      });
    }
  }, [currentQuery, sortBy, handleSearch, itemsPerPage]);

  const handleSortChange = useCallback((newSortBy: 'relevance' | 'popularity' | 'name' | 'recent') => {
    setSortBy(newSortBy);
    
    // Re-run search with new sort
    if (currentQuery) {
      handleSearch({
        query: currentQuery,
        filters,
        sortBy: newSortBy,
        offset: 0,
        limit: itemsPerPage
      });
    }
  }, [currentQuery, filters, handleSearch, itemsPerPage]);

  // Pagination
  const totalPages = Math.ceil(totalResults / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalResults);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    
    if (currentQuery) {
      const offset = (page - 1) * itemsPerPage;
      handleSearch({
        query: currentQuery,
        filters,
        sortBy,
        offset,
        limit: itemsPerPage
      });
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentQuery, filters, sortBy, handleSearch, itemsPerPage]);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handleComponentView = (component: ComponentData) => {
    onComponentSelect?.(component);
  };

  const handleComponentAdd = (component: ComponentData) => {
    // Implement add to project logic
    console.log('Add component to project:', component.name);
  };

  const handleComponentBookmark = (component: ComponentData) => {
    // Implement bookmark logic
    console.log('Bookmark component:', component.name);
  };

  return (
    <div className={className}>
      {/* Search Bar */}
      {showSearchBar && (
        <div className="mb-6">
          <ComponentSearchBar
            onSearch={handleSearch}
            placeholder="Search components, categories, or tags..."
            autoFocus={false}
          />
        </div>
      )}

      {/* Search Summary */}
      {currentQuery && (
        <div className="mb-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Search results for:</span>
              <Badge variant="secondary">"{currentQuery}"</Badge>
            </div>
            {searchTime > 0 && (
              <div className="text-sm text-muted-foreground">
                Found {totalResults} results in {searchTime.toFixed(0)}ms
              </div>
            )}
          </div>
          
          {Object.keys(filters).length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              <div className="flex gap-1 flex-wrap">
                {filters.category?.map(cat => (
                  <Badge key={cat} variant="outline" className="text-xs">
                    Category: {cat}
                  </Badge>
                ))}
                {filters.complexity && (
                  <Badge variant="outline" className="text-xs">
                    Level: {filters.complexity}
                  </Badge>
                )}
                {filters.accessibility && (
                  <Badge variant="outline" className="text-xs">
                    Accessible
                  </Badge>
                )}
                {filters.framework?.map(fw => (
                  <Badge key={fw} variant="outline" className="text-xs">
                    {fw}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="lg:col-span-1">
            <ComponentFilters
              filters={filters}
              onFiltersChange={handleFilterChange}
              availableFilters={availableFilters}
            />
          </div>
        )}

        {/* Results Area */}
        <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
          {/* Results Header */}
          {totalResults > 0 && (
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">
                Showing {startItem}-{endItem} of {totalResults} results
              </div>
            </div>
          )}

          {/* Component Grid */}
          <ComponentGrid
            components={searchResults.map(r => r.component)}
            isLoading={isLoading}
            onComponentView={handleComponentView}
            onComponentAdd={handleComponentAdd}
            onComponentBookmark={handleComponentBookmark}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  <React.Fragment key={index}>
                    {page === '...' ? (
                      <span className="px-2 text-muted-foreground">...</span>
                    ) : (
                      <Button
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(page as number)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}