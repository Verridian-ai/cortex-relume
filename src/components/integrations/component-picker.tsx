'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Filter, 
  Check, 
  Plus, 
  Eye,
  Code,
  Grid3X3,
  Package,
  Layout,
  Target,
  Puzzle,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Component {
  id: string
  name: string
  description: string
  category: string
  preview?: string
  tags: string[]
  complexity: 'Simple' | 'Medium' | 'Complex'
  customizable: boolean
}

interface ComponentPickerProps {
  projectId: string
  onSelect?: (components: Component[]) => void
  onClose?: () => void
  maxSelections?: number
  initialSelection?: string[]
  categoryFilter?: string
}

export function ComponentPicker({
  projectId,
  onSelect,
  onClose,
  maxSelections = 10,
  initialSelection = [],
  categoryFilter
}: ComponentPickerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter || 'all')
  const [complexityFilter, setComplexityFilter] = useState('all')
  const [selected, setSelected] = useState<string[]>(initialSelection)
  const [components, setComponents] = useState<Component[]>([])
  const [loading, setLoading] = useState(true)

  // Mock component data - replace with actual API call
  useEffect(() => {
    const loadComponents = async () => {
      setLoading(true)
      // Simulate API call
      setTimeout(() => {
        const mockComponents: Component[] = [
          {
            id: 'nav-header',
            name: 'Navigation Header',
            description: 'Responsive navigation header with dropdown menus',
            category: 'Navigation',
            tags: ['navigation', 'menu', 'header'],
            complexity: 'Medium',
            customizable: true
          },
          {
            id: 'hero-section',
            name: 'Hero Section',
            description: 'Full-width hero section with call-to-action',
            category: 'Layout',
            tags: ['hero', 'banner', 'cta'],
            complexity: 'Simple',
            customizable: true
          },
          {
            id: 'contact-form',
            name: 'Contact Form',
            description: 'Complete contact form with validation',
            category: 'Forms',
            tags: ['form', 'contact', 'validation'],
            complexity: 'Medium',
            customizable: true
          },
          {
            id: 'image-gallery',
            name: 'Image Gallery',
            description: 'Responsive grid gallery with lightbox',
            category: 'Content',
            tags: ['gallery', 'images', 'grid'],
            complexity: 'Complex',
            customizable: true
          },
          {
            id: 'testimonial-card',
            name: 'Testimonial Card',
            description: 'Customer testimonial with avatar',
            category: 'Content',
            tags: ['testimonial', 'review', 'quote'],
            complexity: 'Simple',
            customizable: true
          },
          {
            id: 'modal-dialog',
            name: 'Modal Dialog',
            description: 'Accessible modal for important content',
            category: 'Interactive',
            tags: ['modal', 'dialog', 'popup'],
            complexity: 'Medium',
            customizable: true
          },
          {
            id: 'pricing-table',
            name: 'Pricing Table',
            description: 'Clean pricing comparison table',
            category: 'Content',
            tags: ['pricing', 'table', 'plans'],
            complexity: 'Complex',
            customizable: true
          },
          {
            id: 'search-bar',
            name: 'Search Bar',
            description: 'Search input with suggestions',
            category: 'Forms',
            tags: ['search', 'input', 'filter'],
            complexity: 'Simple',
            customizable: true
          }
        ]
        setComponents(mockComponents)
        setLoading(false)
      }, 500)
    }

    loadComponents()
  }, [])

  const categories = ['all', ...Array.from(new Set(components.map(c => c.category)))]
  const complexityLevels = ['all', 'Simple', 'Medium', 'Complex']

  const filteredComponents = components.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory
    const matchesComplexity = complexityFilter === 'all' || component.complexity === complexityFilter
    
    return matchesSearch && matchesCategory && matchesComplexity
  })

  const toggleSelection = (componentId: string) => {
    setSelected(prev => {
      if (prev.includes(componentId)) {
        return prev.filter(id => id !== componentId)
      } else if (prev.length < maxSelections) {
        return [...prev, componentId]
      }
      return prev
    })
  }

  const getSelectedComponents = () => {
    return components.filter(c => selected.includes(c.id))
  }

  const handleConfirm = () => {
    const selectedComponents = getSelectedComponents()
    onSelect?.(selectedComponents)
    onClose?.()
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Simple': return 'text-green-500 bg-green-500/10'
      case 'Medium': return 'text-yellow-500 bg-yellow-500/10'
      case 'Complex': return 'text-red-500 bg-red-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'navigation': return Grid3X3
      case 'forms': return Package
      case 'layout': return Layout
      case 'content': return Target
      case 'interactive': return Puzzle
      default: return Code
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold">Pick Components</h2>
            <p className="text-muted-foreground mt-1">
              Select components to add to your project ({selected.length}/{maxSelections})
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {selected.length > 0 && (
              <Badge variant="outline" className="flex items-center space-x-1">
                <Check className="h-3 w-3" />
                <span>{selected.length} selected</span>
              </Badge>
            )}
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b space-y-4 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search components..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
            <select
              value={complexityFilter}
              onChange={(e) => setComplexityFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              {complexityLevels.map(level => (
                <option key={level} value={level}>
                  {level === 'all' ? 'All Levels' : level}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Components Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredComponents.map((component) => {
                const isSelected = selected.includes(component.id)
                const isAtLimit = selected.length >= maxSelections && !isSelected
                const CategoryIcon = getCategoryIcon(component.category)

                return (
                  <Card 
                    key={component.id} 
                    className={cn(
                      'cursor-pointer transition-all hover:shadow-md',
                      isSelected && 'ring-2 ring-brand-500 bg-brand-500/5',
                      isAtLimit && 'opacity-50 cursor-not-allowed'
                    )}
                    onClick={() => !isAtLimit && toggleSelection(component.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="h-10 w-10 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                            <CategoryIcon className="h-5 w-5 text-brand-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg truncate">{component.name}</CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {component.category}
                              </Badge>
                              <Badge variant="secondary" className={cn('text-xs', getComplexityColor(component.complexity))}>
                                {component.complexity}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="h-6 w-6 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <CardDescription className="text-sm mb-4">
                        {component.description}
                      </CardDescription>
                      
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-1">
                          {component.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{component.customizable ? 'Customizable' : 'Fixed'}</span>
                          {isAtLimit && (
                            <span className="text-orange-500">Max {maxSelections} reached</span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 pt-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                          <Button size="sm" variant="outline">
                            <Code className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {!loading && filteredComponents.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No components found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selected.length > 0 ? (
                <>
                  <span className="font-medium">{selected.length}</span> component{selected.length !== 1 ? 's' : ''} selected
                  {maxSelections && (
                    <span> • Max {maxSelections}</span>
                  )}
                </>
              ) : (
                'No components selected'
              )}
            </div>
            <div className="flex items-center space-x-2">
              {onClose && (
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              )}
              <Button 
                onClick={handleConfirm} 
                disabled={selected.length === 0}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add {selected.length} Component{selected.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
