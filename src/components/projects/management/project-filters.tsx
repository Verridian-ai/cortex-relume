'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  Tag,
  Users,
  FolderOpen,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Archive,
  SortAsc,
  SortDesc,
  MoreHorizontal
} from 'lucide-react';
import { Project } from './project-grid';

export interface SearchFilters {
  query: string;
  status: string[];
  priority: string[];
  categories: string[];
  tags: string[];
  assignees: string[];
  teams: string[];
  dateRange: {
    type: 'all' | 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
    start?: Date;
    end?: Date;
  };
  permissions: string[];
  health: string[];
  hasBudget: boolean;
  isStarred: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface ProjectFiltersProps {
  projects: Project[];
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: (query: string) => void;
  onClearFilters: () => void;
  className?: string;
}

const defaultFilters: SearchFilters = {
  query: '',
  status: [],
  priority: [],
  categories: [],
  tags: [],
  assignees: [],
  teams: [],
  dateRange: { type: 'all' },
  permissions: [],
  health: [],
  hasBudget: false,
  isStarred: false,
  sortBy: 'lastActivity',
  sortOrder: 'desc'
};

const statusOptions = [
  { value: 'active', label: 'Active', icon: CheckCircle2, color: 'text-green-600' },
  { value: 'paused', label: 'Paused', icon: Clock, color: 'text-yellow-600' },
  { value: 'completed', label: 'Completed', icon: CheckCircle2, color: 'text-blue-600' },
  { value: 'archived', label: 'Archived', icon: Archive, color: 'text-gray-600' }
];

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-gray-500' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500' }
];

const healthOptions = [
  { value: 'healthy', label: 'Healthy', color: 'text-green-600' },
  { value: 'warning', label: 'Warning', color: 'text-yellow-600' },
  { value: 'at-risk', label: 'At Risk', color: 'text-orange-600' },
  { value: 'critical', label: 'Critical', color: 'text-red-600' }
];

const permissionOptions = [
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
  { value: 'viewer', label: 'Viewer' }
];

const sortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'status', label: 'Status' },
  { value: 'priority', label: 'Priority' },
  { value: 'progress', label: 'Progress' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'lastActivity', label: 'Last Activity' },
  { value: 'createdAt', label: 'Created Date' },
  { value: 'health', label: 'Health' }
];

const dateRangePresets = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' }
];

export function ProjectFilters({
  projects,
  filters,
  onFiltersChange,
  onSearch,
  onClearFilters,
  className
}: ProjectFiltersProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Extract unique values from projects for filter options
  const filterOptions = useMemo(() => {
    const categories = [...new Set(projects.map(p => p.category))].filter(Boolean);
    const tags = [...new Set(projects.flatMap(p => p.tags))].filter(Boolean);
    const assignees = [...new Set(projects.map(p => p.assignee?.name).filter(Boolean))];
    const teams = [...new Set(projects.map(p => p.team.name))].filter(Boolean);

    return { categories, tags, assignees, teams };
  }, [projects]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.query !== '' ||
      filters.status.length > 0 ||
      filters.priority.length > 0 ||
      filters.categories.length > 0 ||
      filters.tags.length > 0 ||
      filters.assignees.length > 0 ||
      filters.teams.length > 0 ||
      filters.permissions.length > 0 ||
      filters.health.length > 0 ||
      filters.hasBudget ||
      filters.isStarred ||
      filters.dateRange.type !== 'all'
    );
  }, [filters]);

  const updateFilter = useCallback((key: keyof SearchFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  }, [filters, onFiltersChange]);

  const toggleArrayFilter = useCallback((key: keyof SearchFilters, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilter(key, newArray);
  }, [filters, updateFilter]);

  const formatDateRange = (dateRange: SearchFilters['dateRange']) => {
    if (dateRange.type === 'custom' && dateRange.start && dateRange.end) {
      return `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`;
    }
    return dateRangePresets.find(preset => preset.value === dateRange.type)?.label || 'All Time';
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.query) count++;
    count += filters.status.length;
    count += filters.priority.length;
    count += filters.categories.length;
    count += filters.tags.length;
    count += filters.assignees.length;
    count += filters.teams.length;
    count += filters.permissions.length;
    count += filters.health.length;
    if (filters.hasBudget) count++;
    if (filters.isStarred) count++;
    if (filters.dateRange.type !== 'all') count++;
    return count;
  }, [filters]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects, descriptions, tags..."
          value={filters.query}
          onChange={(e) => {
            const value = e.target.value;
            updateFilter('query', value);
            onSearch(value);
          }}
          className="pl-10 pr-10"
        />
        {filters.query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            onClick={() => {
              updateFilter('query', '');
              onSearch('');
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="start">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="people">People</TabsTrigger>
                  <TabsTrigger value="time">Time</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                <div className="p-4">
                  {/* Basic Filters */}
                  <TabsContent value="basic" className="space-y-4 mt-0">
                    {/* Status Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Status</label>
                      <div className="space-y-2">
                        {statusOptions.map((option) => {
                          const IconComponent = option.icon;
                          return (
                            <div key={option.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={`status-${option.value}`}
                                checked={filters.status.includes(option.value)}
                                onCheckedChange={() => toggleArrayFilter('status', option.value)}
                              />
                              <IconComponent className={cn("h-4 w-4", option.color)} />
                              <label htmlFor={`status-${option.value}`} className="text-sm cursor-pointer">
                                {option.label}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Priority Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Priority</label>
                      <div className="space-y-2">
                        {priorityOptions.map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`priority-${option.value}`}
                              checked={filters.priority.includes(option.value)}
                              onCheckedChange={() => toggleArrayFilter('priority', option.value)}
                            />
                            <div className={cn("w-2 h-2 rounded-full", option.color)} />
                            <label htmlFor={`priority-${option.value}`} className="text-sm cursor-pointer">
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Health Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Health</label>
                      <div className="space-y-2">
                        {healthOptions.map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`health-${option.value}`}
                              checked={filters.health.includes(option.value)}
                              onCheckedChange={() => toggleArrayFilter('health', option.value)}
                            />
                            <label htmlFor={`health-${option.value}`} className={cn("text-sm cursor-pointer", option.color)}>
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* People Filters */}
                  <TabsContent value="people" className="space-y-4 mt-0">
                    {/* Assignees Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Assignees</label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {filterOptions.assignees.map((assignee) => (
                          <div key={assignee} className="flex items-center space-x-2">
                            <Checkbox
                              id={`assignee-${assignee}`}
                              checked={filters.assignees.includes(assignee)}
                              onCheckedChange={() => toggleArrayFilter('assignees', assignee)}
                            />
                            <label htmlFor={`assignee-${assignee}`} className="text-sm cursor-pointer">
                              {assignee}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Teams Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Teams</label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {filterOptions.teams.map((team) => (
                          <div key={team} className="flex items-center space-x-2">
                            <Checkbox
                              id={`team-${team}`}
                              checked={filters.teams.includes(team)}
                              onCheckedChange={() => toggleArrayFilter('teams', team)}
                            />
                            <label htmlFor={`team-${team}`} className="text-sm cursor-pointer">
                              {team}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Permissions Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Permissions</label>
                      <div className="space-y-2">
                        {permissionOptions.map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`permission-${option.value}`}
                              checked={filters.permissions.includes(option.value)}
                              onCheckedChange={() => toggleArrayFilter('permissions', option.value)}
                            />
                            <label htmlFor={`permission-${option.value}`} className="text-sm cursor-pointer">
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Time Filters */}
                  <TabsContent value="time" className="space-y-4 mt-0">
                    {/* Date Range Preset */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Date Range</label>
                      <Select
                        value={filters.dateRange.type}
                        onValueChange={(value) => {
                          const dateRange = { type: value as SearchFilters['dateRange']['type'] };
                          updateFilter('dateRange', dateRange);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {dateRangePresets.map((preset) => (
                            <SelectItem key={preset.value} value={preset.value}>
                              {preset.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Custom Date Range */}
                    {filters.dateRange.type === 'custom' && (
                      <div className="space-y-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formatDateRange(filters.dateRange)}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="range"
                              selected={{
                                from: filters.dateRange.start,
                                to: filters.dateRange.end
                              }}
                              onSelect={(range) => {
                                updateFilter('dateRange', {
                                  type: 'custom',
                                  start: range?.from,
                                  end: range?.to
                                });
                              }}
                              numberOfMonths={2}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                  </TabsContent>

                  {/* Advanced Filters */}
                  <TabsContent value="advanced" className="space-y-4 mt-0">
                    {/* Categories Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Categories</label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {filterOptions.categories.map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox
                              id={`category-${category}`}
                              checked={filters.categories.includes(category)}
                              onCheckedChange={() => toggleArrayFilter('categories', category)}
                            />
                            <label htmlFor={`category-${category}`} className="text-sm cursor-pointer">
                              {category}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tags Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Tags</label>
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                        {filterOptions.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant={filters.tags.includes(tag) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleArrayFilter('tags', tag)}
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Additional Options */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="has-budget"
                          checked={filters.hasBudget}
                          onCheckedChange={(checked) => updateFilter('hasBudget', !!checked)}
                        />
                        <label htmlFor="has-budget" className="text-sm cursor-pointer">
                          Has Budget
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="is-starred"
                          checked={filters.isStarred}
                          onCheckedChange={(checked) => updateFilter('isStarred', !!checked)}
                        />
                        <label htmlFor="is-starred" className="text-sm cursor-pointer">
                          Starred Projects
                        </label>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </PopoverContent>
          </Popover>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <Select
              value={filters.sortBy}
              onValueChange={(value) => updateFilter('sortBy', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newOrder = filters.sortOrder === 'asc' ? 'desc' : 'asc';
                updateFilter('sortOrder', newOrder);
              }}
            >
              {filters.sortOrder === 'asc' ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.query && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.query}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  updateFilter('query', '');
                  onSearch('');
                }}
              />
            </Badge>
          )}
          
          {filters.status.map(status => (
            <Badge key={status} variant="secondary" className="gap-1">
              Status: {status}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleArrayFilter('status', status)}
              />
            </Badge>
          ))}
          
          {filters.priority.map(priority => (
            <Badge key={priority} variant="secondary" className="gap-1">
              Priority: {priority}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleArrayFilter('priority', priority)}
              />
            </Badge>
          ))}
          
          {/* Add more active filter displays as needed */}
        </div>
      )}
    </div>
  );
}
