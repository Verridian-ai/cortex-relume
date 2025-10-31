'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SearchFiltersProps {
  onFiltersChange?: (filters: ComponentFilters) => void;
  onSearchChange?: (query: string) => void;
  initialFilters?: ComponentFilters;
}

export interface ComponentFilters {
  search: string;
  categories: string[];
  frameworks: string[];
  tags: string[];
  difficulty: string[];
  rating: number | null;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const FRAMEWORKS = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue.js' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'html', label: 'HTML' },
  { value: 'tailwind', label: 'Tailwind CSS' },
  { value: 'bootstrap', label: 'Bootstrap' },
  { value: 'material-ui', label: 'Material UI' },
];

const TAGS = [
  'Accessible', 'Responsive', 'Dark Mode', 'Animation', 'Interactive',
  'Button', 'Input', 'Modal', 'Dropdown', 'Card', 'Table'
];

const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'rating', label: 'Rating' },
  { value: 'recent', label: 'Recently Added' },
  { value: 'name', label: 'Name' },
];

export function SearchAndFilters({ 
  onFiltersChange, 
  onSearchChange, 
  initialFilters 
}: SearchFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<ComponentFilters>({
    search: '',
    categories: [],
    frameworks: [],
    tags: [],
    difficulty: [],
    rating: null,
    sortBy: 'popularity',
    sortOrder: 'desc',
    ...initialFilters,
  });

  useEffect(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  const handleSearchChange = (value: string) => {
    const newFilters = { ...filters, search: value };
    setFilters(newFilters);
    onSearchChange?.(value);
  };

  const handleFilterChange = (key: keyof ComponentFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleArrayFilterChange = (key: 'categories' | 'frameworks' | 'tags' | 'difficulty', value: string) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    handleFilterChange(key, newArray);
  };

  const clearAllFilters = () => {
    const clearedFilters: ComponentFilters = {
      search: '',
      categories: [],
      frameworks: [],
      tags: [],
      difficulty: [],
      rating: null,
      sortBy: 'popularity',
      sortOrder: 'desc',
    };
    setFilters(clearedFilters);
  };

  const activeFiltersCount = 
    filters.categories.length + 
    filters.frameworks.length + 
    filters.tags.length + 
    filters.difficulty.length +
    (filters.rating ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search components..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="relative">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="destructive" className="ml-2 min-w-[20px] h-5 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </CollapsibleTrigger>
        </Collapsible>

        {/* Sort Options */}
        <Select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onValueChange={(value) => {
            const [sortBy, sortOrder] = value.split('-');
            handleFilterChange('sortBy', sortBy);
            handleFilterChange('sortOrder', sortOrder);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={`${option.value}-desc`} value={`${option.value}-desc`}>
                {option.label} (High to Low)
              </SelectItem>
            ))}
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={`${option.value}-asc`} value={`${option.value}-asc`}>
                {option.label} (Low to High)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="w-4 h-4 mr-1" />
            Clear ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Filters Panel */}
      <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <CollapsibleContent className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4 rounded-lg border bg-muted/20">
            {/* Frameworks Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Frameworks</Label>
              <div className="space-y-2">
                {FRAMEWORKS.map((framework) => (
                  <div key={framework.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`framework-${framework.value}`}
                      checked={filters.frameworks.includes(framework.value)}
                      onCheckedChange={() => handleArrayFilterChange('frameworks', framework.value)}
                    />
                    <Label htmlFor={`framework-${framework.value}`} className="text-sm">
                      {framework.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Tags</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {TAGS.map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag}`}
                      checked={filters.tags.includes(tag)}
                      onCheckedChange={() => handleArrayFilterChange('tags', tag)}
                    />
                    <Label htmlFor={`tag-${tag}`} className="text-sm">
                      {tag}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Difficulty</Label>
              <div className="space-y-2">
                {DIFFICULTY_LEVELS.map((level) => (
                  <div key={level.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`difficulty-${level.value}`}
                      checked={filters.difficulty.includes(level.value)}
                      onCheckedChange={() => handleArrayFilterChange('difficulty', level.value)}
                    />
                    <Label htmlFor={`difficulty-${level.value}`} className="text-sm">
                      {level.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Minimum Rating</Label>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <Checkbox
                      id={`rating-${rating}`}
                      checked={filters.rating === rating}
                      onCheckedChange={(checked) => 
                        handleFilterChange('rating', checked ? rating : null)
                      }
                    />
                    <Label htmlFor={`rating-${rating}`} className="text-sm flex items-center">
                      {Array.from({ length: rating }, (_, i) => (
                        <span key={i} className="text-yellow-400">★</span>
                      ))}
                      <span className="ml-1 text-xs text-muted-foreground">& up</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Filter Tags */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.frameworks.map((framework) => (
                <Badge
                  key={`framework-${framework}`}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleArrayFilterChange('frameworks', framework)}
                >
                  {FRAMEWORKS.find(f => f.value === framework)?.label}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
              {filters.tags.map((tag) => (
                <Badge
                  key={`tag-${tag}`}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleArrayFilterChange('tags', tag)}
                >
                  {tag}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
              {filters.difficulty.map((difficulty) => (
                <Badge
                  key={`difficulty-${difficulty}`}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleArrayFilterChange('difficulty', difficulty)}
                >
                  {DIFFICULTY_LEVELS.find(d => d.value === difficulty)?.label}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
              {filters.rating && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleFilterChange('rating', null)}
                >
                  {filters.rating}★ & up
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}