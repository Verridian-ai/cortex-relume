'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Component } from '@/types/component';
import { 
  Search, 
  Check, 
  Package, 
  Code, 
  Palette, 
  Layers,
  Filter,
  Grid3X3,
  List
} from 'lucide-react';

export interface ComponentSelectionProps {
  components: Component[];
  selectedComponents: string[];
  onSelectionChange: (selected: string[]) => void;
}

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'selected' | 'unselected';
type SortBy = 'name' | 'date' | 'category';

export function ComponentSelection({ 
  components, 
  selectedComponents, 
  onSelectionChange 
}: ComponentSelectionProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');
  const [filterType, setFilterType] = React.useState<FilterType>('all');
  const [sortBy, setSortBy] = React.useState<SortBy>('name');

  // Filter components
  const filteredComponents = React.useMemo(() => {
    let filtered = [...components];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(component =>
        component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        component.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        component.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply selection filter
    switch (filterType) {
      case 'selected':
        filtered = filtered.filter(component => selectedComponents.includes(component.id));
        break;
      case 'unselected':
        filtered = filtered.filter(component => !selectedComponents.includes(component.id));
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
        case 'category':
          return (a.category || '').localeCompare(b.category || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [components, searchQuery, filterType, sortBy, selectedComponents]);

  const handleComponentToggle = (componentId: string) => {
    const isSelected = selectedComponents.includes(componentId);
    
    if (isSelected) {
      onSelectionChange(selectedComponents.filter(id => id !== componentId));
    } else {
      onSelectionChange([...selectedComponents, componentId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedComponents.length === filteredComponents.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(filteredComponents.map(c => c.id));
    }
  };

  const getComponentIcon = (component: Component) => {
    // Return appropriate icon based on component type/category
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      'button': Code,
      'card': Package,
      'form': Package,
      'navigation': Layers,
      'layout': Grid3X3,
    };
    
    return iconMap[component.category || ''] || Package;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Select Components</h3>
          <p className="text-sm text-muted-foreground">
            Choose the components you want to export
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {selectedComponents.length} of {components.length} selected
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
          >
            {selectedComponents.length === filteredComponents.length ? 'Deselect All' : 'Select All'}
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterType)}
            className="px-3 py-2 border border-border rounded-md bg-background text-sm"
          >
            <option value="all">All Components</option>
            <option value="selected">Selected</option>
            <option value="unselected">Unselected</option>
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-3 py-2 border border-border rounded-md bg-background text-sm"
          >
            <option value="name">Name</option>
            <option value="date">Last Modified</option>
            <option value="category">Category</option>
          </select>
        </div>

        {/* View Mode */}
        <div className="flex items-center border border-border rounded-md">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="rounded-r-none"
          >
            <Grid3X3 className="h-4 w-4" />
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
      </div>

      {/* Component Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredComponents.map((component) => {
            const Icon = getComponentIcon(component);
            const isSelected = selectedComponents.includes(component.id);
            
            return (
              <Card
                key={component.id}
                className={`
                  p-4 cursor-pointer transition-all duration-200 hover:shadow-md
                  ${isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'}
                `}
                onClick={() => handleComponentToggle(component.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <h4 className="font-medium truncate">{component.name}</h4>
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {component.description || 'No description available'}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {component.category && (
                      <Badge variant="outline" className="text-xs">
                        {component.category}
                      </Badge>
                    )}
                    {component.tags && component.tags.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {component.tags.length} tag{component.tags.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(component.updatedAt)}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 text-sm font-medium">Component</th>
                <th className="text-left p-3 text-sm font-medium">Category</th>
                <th className="text-left p-3 text-sm font-medium">Tags</th>
                <th className="text-left p-3 text-sm font-medium">Modified</th>
                <th className="text-left p-3 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComponents.map((component) => {
                const Icon = getComponentIcon(component);
                const isSelected = selectedComponents.includes(component.id);
                
                return (
                  <tr
                    key={component.id}
                    className={`
                      border-t cursor-pointer transition-colors
                      ${isSelected ? 'bg-primary/5' : 'hover:bg-muted/50'}
                    `}
                    onClick={() => handleComponentToggle(component.id)}
                  >
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{component.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {component.description || 'No description'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      {component.category && (
                        <Badge variant="outline">{component.category}</Badge>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {component.tags?.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {component.tags && component.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{component.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {formatDate(component.updatedAt)}
                    </td>
                    <td className="p-3">
                      <Button
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleComponentToggle(component.id);
                        }}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {filteredComponents.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No components found</h3>
          <p className="text-muted-foreground">
            {searchQuery || filterType !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'No components available to export'
            }
          </p>
        </div>
      )}
    </div>
  );
}
