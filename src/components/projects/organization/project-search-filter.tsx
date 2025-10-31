'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Search, Filter, X, Calendar, SortAsc, SortDesc, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SearchManager,
  SearchFilters,
  ProjectType,
  ProjectStatus,
  Folder,
  Tag,
  Category
} from '@/lib/projects/organization'
import { format } from 'date-fns'

interface ProjectSearchAndFilterProps {
  onFiltersChange?: (filters: SearchFilters) => void
  onSearch?: (query: string) => void
  className?: string
  folders?: Folder[]
  tags?: Tag[]
  categories?: Category[]
  initialFilters?: SearchFilters
  showDateRange?: boolean
  showAdvancedFilters?: boolean
}

export function ProjectSearchAndFilter({
  onFiltersChange,
  onSearch,
  className,
  folders = [],
  tags = [],
  categories = [],
  initialFilters,
  showDateRange = true,
  showAdvancedFilters = true
}: ProjectSearchAndFilterProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    folder_id: null,
    category_ids: [],
    tag_ids: [],
    type: 'all',
    status: 'all',
    sort_by: 'updated_at',
    sort_order: 'desc',
    date_range: undefined,
    ...initialFilters
  })

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [searchInput, setSearchInput] = useState(filters.query || '')

  useEffect(() => {
    onFiltersChange?.(filters)
  }, [filters, onFiltersChange])

  const handleSearchChange = (query: string) => {
    setSearchInput(query)
    setFilters(prev => ({ ...prev, query: query || '' }))
    onSearch?.(query)
  }

  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({ 
      ...prev, 
      sort_by: sortBy as SearchFilters['sort_by'],
      sort_order: sortBy === prev.sort_by && prev.sort_order === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleTypeFilter = (type: string) => {
    setFilters(prev => ({ ...prev, type: type as ProjectType | 'all' }))
  }

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status: status as ProjectStatus | 'all' }))
  }

  const handleFolderSelect = (folderId: string | null) => {
    setFilters(prev => ({ ...prev, folder_id: folderId }))
  }

  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      category_ids: checked
        ? [...prev.category_ids!, categoryId]
        : prev.category_ids!.filter(id => id !== categoryId)
    }))
  }

  const handleTagToggle = (tagId: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      tag_ids: checked
        ? [...prev.tag_ids!, tagId]
        : prev.tag_ids!.filter(id => id !== tagId)
    }))
  }

  const handleDateRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      setFilters(prev => ({
        ...prev,
        date_range: {
          start: range.from!.toISOString(),
          end: range.to!.toISOString()
        }
      }))
    } else {
      setFilters(prev => ({ ...prev, date_range: undefined }))
    }
  }

  const clearFilters = () => {
    setSearchInput('')
    setFilters({
      query: '',
      folder_id: null,
      category_ids: [],
      tag_ids: [],
      type: 'all',
      status: 'all',
      sort_by: 'updated_at',
      sort_order: 'desc',
      date_range: undefined
    })
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.query) count++
    if (filters.folder_id) count++
    if (filters.category_ids?.length) count += filters.category_ids.length
    if (filters.tag_ids?.length) count += filters.tag_ids.length
    if (filters.type !== 'all') count++
    if (filters.status !== 'all') count++
    if (filters.date_range) count++
    return count
  }

  const hasActiveFilters = getActiveFilterCount() > 0

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Search and Quick Filters */}
      <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-y-0 md:space-x-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-4"
          />
          {searchInput && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Quick Filters */}
        <div className="flex items-center space-x-2">
          <Select value={filters.type} onValueChange={handleTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="sitemap">Sitemap</SelectItem>
              <SelectItem value="wireframe">Wireframe</SelectItem>
              <SelectItem value="style-guide">Style Guide</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {filters.sort_order === 'asc' ? (
                  <SortAsc className="h-4 w-4 mr-1" />
                ) : (
                  <SortDesc className="h-4 w-4 mr-1" />
                )}
                {filters.sort_by?.replace('_', ' ')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleSortChange('name')}>
                Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('created_at')}>
                Created
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('updated_at')}>
                Updated
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('last_accessed')}>
                Last Accessed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Advanced Filters Toggle */}
          {showAdvancedFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={cn(showAdvanced && 'bg-primary text-primary-foreground')}
            >
              <Filter className="h-4 w-4 mr-1" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.query && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => handleSearchChange('')}>
              Search: "{filters.query}"
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          
          {filters.folder_id && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => handleFolderSelect(null)}>
              Folder: {folders.find(f => f.id === filters.folder_id)?.name || 'Unknown'}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          
          {filters.category_ids?.map(categoryId => (
            <Badge
              key={categoryId}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => handleCategoryToggle(categoryId, false)}
            >
              {categories.find(c => c.id === categoryId)?.name || 'Unknown'}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          
          {filters.tag_ids?.map(tagId => (
            <Badge
              key={tagId}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => handleTagToggle(tagId, false)}
            >
              {tags.find(t => t.id === tagId)?.name || 'Unknown'}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          
          {filters.type !== 'all' && (
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={() => handleTypeFilter('all')}
            >
              Type: {filters.type}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          
          {filters.status !== 'all' && (
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={() => handleStatusFilter('all')}
            >
              Status: {filters.status}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          
          {filters.date_range && (
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={() => handleDateRangeSelect(undefined)}
            >
              Date: {format(new Date(filters.date_range.start), 'MMM dd')} - {format(new Date(filters.date_range.end), 'MMM dd')}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/20">
          {/* Folder Filter */}
          <div>
            <Label className="text-sm font-medium">Folder</Label>
            <Select value={filters.folder_id || 'all'} onValueChange={(value) => handleFolderSelect(value === 'all' ? null : value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Folders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Folders</SelectItem>
                {folders.map(folder => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Categories</Label>
              <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                {categories.map(category => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={filters.category_ids?.includes(category.id)}
                      onCheckedChange={(checked) => handleCategoryToggle(category.id, !!checked)}
                    />
                    <label
                      htmlFor={`category-${category.id}`}
                      className="text-sm cursor-pointer flex-1 truncate"
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tag Filter */}
          {tags.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Tags</Label>
              <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                {tags.map(tag => (
                  <div key={tag.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag.id}`}
                      checked={filters.tag_ids?.includes(tag.id)}
                      onCheckedChange={(checked) => handleTagToggle(tag.id, !!checked)}
                    />
                    <label
                      htmlFor={`tag-${tag.id}`}
                      className="text-sm cursor-pointer flex-1 truncate"
                    >
                      <span
                        className="inline-block w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Date Range Filter */}
          {showDateRange && (
            <div className="md:col-span-2 lg:col-span-3">
              <Label className="text-sm font-medium">Created Date Range</Label>
              <div className="mt-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'justify-start text-left font-normal',
                        !filters.date_range && 'text-muted-foreground'
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {filters.date_range ? (
                        <>
                          {format(new Date(filters.date_range.start), 'MMM dd, yyyy')} -{' '}
                          {format(new Date(filters.date_range.end), 'MMM dd, yyyy')}
                        </>
                      ) : (
                        'Pick a date range'
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="range"
                      defaultMonth={filters.date_range ? new Date(filters.date_range.start) : undefined}
                      selected={{
                        from: filters.date_range ? new Date(filters.date_range.start) : undefined,
                        to: filters.date_range ? new Date(filters.date_range.end) : undefined
                      }}
                      onSelect={handleDateRangeSelect}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}