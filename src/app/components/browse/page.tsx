'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Star,
  Download,
  Eye,
  Heart,
  Code,
  Layout,
  Package,
  Target,
  Puzzle,
  ExternalLink,
  SlidersHorizontal,
  CheckCircle,
  X,
  ChevronDown
} from 'lucide-react'
import { Nav } from '@/components/layout/nav'
import { ComponentInstaller } from '@/components/integrations/component-installer'
import { ComponentPicker } from '@/components/integrations/component-picker'
import { ComponentAssistant } from '@/components/integrations/component-assistant'
import { cn } from '@/lib/utils'

interface Component {
  id: string
  name: string
  description: string
  category: string
  subcategory?: string
  tags: string[]
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  downloads: number
  rating: number
  featured?: boolean
  premium?: boolean
  preview?: string
  code?: string
  dependencies: string[]
  version: string
  author: string
  updatedAt: string
}

export default function ComponentsBrowsePage() {
  const searchParams = useSearchParams()
  const [components, setComponents] = useState<Component[]>([])
  const [filteredComponents, setFilteredComponents] = useState<Component[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [sortBy, setSortBy] = useState('popularity')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [selectedComponents, setSelectedComponents] = useState<string[]>([])
  const [showInstaller, setShowInstaller] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [showAssistant, setShowAssistant] = useState(false)
  const [loading, setLoading] = useState(true)

  // Mock component data
  useEffect(() => {
    const loadComponents = async () => {
      setLoading(true)
      // Simulate API call
      setTimeout(() => {
        const mockComponents: Component[] = [
          {
            id: 'nav-header',
            name: 'Navigation Header',
            description: 'Responsive navigation header with dropdown support and mobile menu',
            category: 'Navigation',
            subcategory: 'Header',
            tags: ['navigation', 'menu', 'header', 'responsive'],
            difficulty: 'Intermediate',
            downloads: 1234,
            rating: 4.8,
            featured: true,
            dependencies: ['react', 'lucide-react'],
            version: '2.1.0',
            author: 'Core Team',
            updatedAt: '2025-01-20'
          },
          {
            id: 'hero-section',
            name: 'Hero Section',
            description: 'Eye-catching hero section with call-to-action, background image support',
            category: 'Layout',
            subcategory: 'Hero',
            tags: ['hero', 'banner', 'cta', 'intro'],
            difficulty: 'Beginner',
            downloads: 2156,
            rating: 4.9,
            featured: true,
            premium: true,
            dependencies: ['react', 'next/image'],
            version: '3.0.1',
            author: 'Design Team',
            updatedAt: '2025-01-22'
          },
          {
            id: 'contact-form',
            name: 'Contact Form',
            description: 'Complete contact form with validation, spam protection, and submission',
            category: 'Forms',
            subcategory: 'Contact',
            tags: ['form', 'contact', 'validation', 'submission'],
            difficulty: 'Intermediate',
            downloads: 987,
            rating: 4.7,
            dependencies: ['react-hook-form', 'zod'],
            version: '1.8.3',
            author: 'Forms Team',
            updatedAt: '2025-01-18'
          },
          {
            id: 'image-gallery',
            name: 'Image Gallery',
            description: 'Responsive image gallery with lightbox, lazy loading, and masonry layout',
            category: 'Content',
            subcategory: 'Gallery',
            tags: ['gallery', 'images', 'lightbox', 'masonry'],
            difficulty: 'Advanced',
            downloads: 756,
            rating: 4.6,
            dependencies: ['react', 'next/image', 'framer-motion'],
            version: '2.4.2',
            author: 'Media Team',
            updatedAt: '2025-01-15'
          },
          {
            id: 'pricing-table',
            name: 'Pricing Table',
            description: 'Clean pricing comparison table with features, billing toggle, and CTAs',
            category: 'Content',
            subcategory: 'Pricing',
            tags: ['pricing', 'table', 'plans', 'billing'],
            difficulty: 'Intermediate',
            downloads: 1123,
            rating: 4.5,
            premium: true,
            dependencies: ['react'],
            version: '1.5.0',
            author: 'Business Team',
            updatedAt: '2025-01-25'
          },
          {
            id: 'testimonial-slider',
            name: 'Testimonial Slider',
            description: 'Customer testimonials with photos, ratings, and auto-play functionality',
            category: 'Content',
            subcategory: 'Testimonials',
            tags: ['testimonials', 'reviews', 'slider', 'carousel'],
            difficulty: 'Intermediate',
            downloads: 654,
            rating: 4.4,
            dependencies: ['react', 'framer-motion'],
            version: '1.3.1',
            author: 'UI Team',
            updatedAt: '2025-01-12'
          },
          {
            id: 'footer',
            name: 'Website Footer',
            description: 'Comprehensive footer with links, social media, newsletter signup, and sitemap',
            category: 'Layout',
            subcategory: 'Footer',
            tags: ['footer', 'links', 'social', 'newsletter'],
            difficulty: 'Beginner',
            downloads: 845,
            rating: 4.3,
            dependencies: ['react'],
            version: '2.0.0',
            author: 'Core Team',
            updatedAt: '2025-01-20'
          },
          {
            id: 'modal-dialog',
            name: 'Modal Dialog',
            description: 'Accessible modal dialog with focus trap, escape key, and backdrop click',
            category: 'Interactive',
            subcategory: 'Modal',
            tags: ['modal', 'dialog', 'popup', 'accessibility'],
            difficulty: 'Advanced',
            downloads: 543,
            rating: 4.8,
            premium: true,
            dependencies: ['react', '@radix-ui/react-dialog'],
            version: '2.1.0',
            author: 'A11y Team',
            updatedAt: '2025-01-28'
          }
        ]
        setComponents(mockComponents)
        setFilteredComponents(mockComponents)
        setLoading(false)
      }, 500)
    }

    loadComponents()
  }, [])

  const categories = [
    { id: 'all', name: 'All Components', icon: Grid3X3 },
    { id: 'layout', name: 'Layout', icon: Layout },
    { id: 'navigation', name: 'Navigation', icon: Grid3X3 },
    { id: 'forms', name: 'Forms', icon: Package },
    { id: 'content', name: 'Content', icon: Target },
    { id: 'interactive', name: 'Interactive', icon: Puzzle }
  ]

  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced']

  useEffect(() => {
    let filtered = components

    // Apply filters
    if (searchTerm) {
      filtered = filtered.filter(component =>
        component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        component.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        component.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(component =>
        component.category.toLowerCase() === selectedCategory
      )
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(component =>
        component.difficulty === selectedDifficulty
      )
    }

    // Apply sorting
    switch (sortBy) {
      case 'popularity':
        filtered.sort((a, b) => b.downloads - a.downloads)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    setFilteredComponents(filtered)
  }, [components, searchTerm, selectedCategory, selectedDifficulty, sortBy])

  const toggleFavorite = (componentId: string) => {
    setFavorites(prev =>
      prev.includes(componentId)
        ? prev.filter(id => id !== componentId)
        : [...prev, componentId]
    )
  }

  const toggleSelection = (componentId: string) => {
    setSelectedComponents(prev =>
      prev.includes(componentId)
        ? prev.filter(id => id !== componentId)
        : [...prev, componentId]
    )
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-500 bg-green-500/10'
      case 'Intermediate': return 'text-yellow-500 bg-yellow-500/10'
      case 'Advanced': return 'text-red-500 bg-red-500/10'
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
    <div className="flex flex-col min-h-screen bg-background">
      <Nav isAppLayout />
      
      <main className="flex-1">
        <div className="container py-8">
          {/* Header */}
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Component Library
              </h1>
              <p className="text-muted-foreground mt-2">
                Browse and discover production-ready components for your projects
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => setShowAssistant(true)}>
                AI Assistant
              </Button>
              <Button variant="outline" onClick={() => setShowPicker(true)}>
                Component Picker
              </Button>
              <Button onClick={() => setShowInstaller(true)}>
                <Download className="h-4 w-4 mr-2" />
                Install Components
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4 mb-8">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search components..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="popularity">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest</option>
                  <option value="name">Name</option>
                </select>
                <div className="flex items-center border border-input rounded-md">
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
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <Card className="p-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Difficulty</label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                      {difficulties.map(difficulty => (
                        <option key={difficulty} value={difficulty}>
                          {difficulty === 'all' ? 'All Levels' : difficulty}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm('')
                        setSelectedCategory('all')
                        setSelectedDifficulty('all')
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {category.name}
                </Button>
              )
            })}
          </div>

          {/* Selection Bar */}
          {selectedComponents.length > 0 && (
            <Card className="mb-6 bg-brand-500/5 border-brand-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-brand-500" />
                    <span className="font-medium">
                      {selectedComponents.length} component{selectedComponents.length !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedComponents([])}>
                      Clear
                    </Button>
                    <Button size="sm" onClick={() => setShowInstaller(true)}>
                      <Download className="h-4 w-4 mr-2" />
                      Install Selected
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Components Grid */}
          {loading ? (
            <div className={cn(
              viewMode === 'grid' 
                ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' 
                : 'space-y-4'
            )}>
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
            <div className={cn(
              viewMode === 'grid' 
                ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' 
                : 'space-y-4'
            )}>
              {filteredComponents.map((component) => {
                const CategoryIcon = getCategoryIcon(component.category)
                const isSelected = selectedComponents.includes(component.id)
                const isFavorite = favorites.includes(component.id)
                
                return (
                  <Card 
                    key={component.id} 
                    className={cn(
                      'card-hover transition-all',
                      isSelected && 'ring-2 ring-brand-500 bg-brand-500/5',
                      component.featured && 'border-brand-500/20 bg-brand-500/5'
                    )}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="h-10 w-10 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                            <CategoryIcon className="h-5 w-5 text-brand-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <CardTitle className="text-lg truncate">{component.name}</CardTitle>
                              {component.featured && (
                                <Badge variant="secondary" className="text-xs">
                                  Featured
                                </Badge>
                              )}
                              {component.premium && (
                                <Badge variant="outline" className="text-xs">
                                  Premium
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {component.category}
                              </Badge>
                              <Badge variant="secondary" className={cn('text-xs', getDifficultyColor(component.difficulty))}>
                                {component.difficulty}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle className="h-5 w-5 text-brand-500 flex-shrink-0" />
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <CardDescription className="text-sm mb-4 line-clamp-2">
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
                          <div className="flex items-center space-x-1">
                            <Download className="h-3 w-3" />
                            <span>{component.downloads.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span>{component.rating}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Code className="h-3 w-3" />
                            <span>v{component.version}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 pt-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => toggleSelection(component.id)}
                          >
                            {isSelected ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Selected
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </>
                            )}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => toggleFavorite(component.id)}
                            className={isFavorite ? 'text-red-500' : 'text-muted-foreground'}
                          >
                            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredComponents.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No components found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search terms or filters.
              </p>
              <Button variant="outline" onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
                setSelectedDifficulty('all')
              }}>
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showInstaller && (
        <ComponentInstaller
          selectedComponents={selectedComponents}
          onClose={() => setShowInstaller(false)}
          onInstall={(components) => {
            console.log('Installing components:', components)
            setShowInstaller(false)
          }}
        />
      )}

      {showPicker && (
        <ComponentPicker
          projectId="current-project"
          onSelect={(components) => {
            console.log('Selected components:', components)
            setSelectedComponents(components.map(c => c.id))
            setShowPicker(false)
          }}
          onClose={() => setShowPicker(false)}
        />
      )}

      {showAssistant && (
        <ComponentAssistant
          projectType="website"
          onClose={() => setShowAssistant(false)}
          onSelect={(components) => {
            console.log('AI suggested components:', components)
            setShowPicker(false)
          }}
        />
      )}
    </div>
  )
}
