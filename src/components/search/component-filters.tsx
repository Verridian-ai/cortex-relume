'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react';
import { SearchFilters } from '@/lib/search/component-search';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface ComponentFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  availableFilters: {
    categories: string[];
    tags: string[];
    frameworks: string[];
    licenses: string[];
  };
  className?: string;
}

export function ComponentFilters({
  filters,
  onFiltersChange,
  availableFilters,
  className = ''
}: ComponentFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    // Count active filters
    let count = 0;
    if (filters.category?.length) count++;
    if (filters.tags?.length) count++;
    if (filters.complexity) count++;
    if (filters.accessibility) count++;
    if (filters.framework?.length) count++;
    if (filters.license?.length) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const toggleArrayFilter = (key: 'category' | 'tags' | 'framework' | 'license', value: string) => {
    const currentValues = filters[key] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    updateFilter(key, newValues.length > 0 ? newValues : undefined);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const FilterSection = ({ 
    title, 
    children,
    defaultExpanded = false 
  }: { 
    title: string; 
    children: React.ReactNode;
    defaultExpanded?: boolean;
  }) => {
    const [expanded, setExpanded] = useState(defaultExpanded);

    return (
      <div className="border-b border-border last:border-b-0">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between py-3 px-4 text-left hover:bg-accent/50"
        >
          <span className="font-medium text-sm">{title}</span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {expanded && (
          <div className="px-4 pb-3">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs"
            >
              Clear all
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <FilterSection title="Category" defaultExpanded={true}>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {availableFilters.categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={filters.category?.includes(category) || false}
                  onCheckedChange={() => toggleArrayFilter('category', category)}
                />
                <Label 
                  htmlFor={`category-${category}`}
                  className="text-sm cursor-pointer capitalize"
                >
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Complexity">
          <RadioGroup
            value={filters.complexity || ''}
            onValueChange={(value) => updateFilter('complexity', value || undefined)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="" id="complexity-all" />
              <Label htmlFor="complexity-all" className="text-sm cursor-pointer">
                All levels
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="beginner" id="complexity-beginner" />
              <Label htmlFor="complexity-beginner" className="text-sm cursor-pointer">
                Beginner
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="intermediate" id="complexity-intermediate" />
              <Label htmlFor="complexity-intermediate" className="text-sm cursor-pointer">
                Intermediate
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="advanced" id="complexity-advanced" />
              <Label htmlFor="complexity-advanced" className="text-sm cursor-pointer">
                Advanced
              </Label>
            </div>
          </RadioGroup>
        </FilterSection>

        <FilterSection title="Accessibility">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="accessibility-compliant"
              checked={filters.accessibility || false}
              onCheckedChange={(checked) => updateFilter('accessibility', checked || undefined)}
            />
            <Label 
              htmlFor="accessibility-compliant"
              className="text-sm cursor-pointer"
            >
              WCAG Compliant
            </Label>
          </div>
        </FilterSection>

        <FilterSection title="Framework">
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {availableFilters.frameworks.map((framework) => (
              <div key={framework} className="flex items-center space-x-2">
                <Checkbox
                  id={`framework-${framework}`}
                  checked={filters.framework?.includes(framework) || false}
                  onCheckedChange={() => toggleArrayFilter('framework', framework)}
                />
                <Label 
                  htmlFor={`framework-${framework}`}
                  className="text-sm cursor-pointer"
                >
                  {framework}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Tags">
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {availableFilters.tags.map((tag) => (
              <div key={tag} className="flex items-center space-x-2">
                <Checkbox
                  id={`tag-${tag}`}
                  checked={filters.tags?.includes(tag) || false}
                  onCheckedChange={() => toggleArrayFilter('tags', tag)}
                />
                <Label 
                  htmlFor={`tag-${tag}`}
                  className="text-sm cursor-pointer"
                >
                  {tag}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="License">
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {availableFilters.licenses.map((license) => (
              <div key={license} className="flex items-center space-x-2">
                <Checkbox
                  id={`license-${license}`}
                  checked={filters.license?.includes(license) || false}
                  onCheckedChange={() => toggleArrayFilter('license', license)}
                />
                <Label 
                  htmlFor={`license-${license}`}
                  className="text-sm cursor-pointer"
                >
                  {license}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>
      </CardContent>
    </Card>
  );
}