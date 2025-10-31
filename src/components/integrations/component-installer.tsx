'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Download, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertCircle, 
  Package,
  Code,
  FileText,
  Settings,
  X,
  ExternalLink,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Component {
  id: string
  name: string
  description: string
  category: string
  version: string
  size: string
  dependencies: string[]
  preview?: string
  tags: string[]
  license: string
}

interface ComponentInstallerProps {
  projectId?: string
  onClose?: () => void
  onInstall?: (components: Component[]) => void
  selectedComponents?: string[]
}

export function ComponentInstaller({ 
  projectId, 
  onClose, 
  onInstall,
  selectedComponents = []
}: ComponentInstallerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selected, setSelected] = useState<string[]>(selectedComponents)
  const [installing, setInstalling] = useState<string[]>([])
  const [installed, setInstalled] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  // Mock component data - replace with actual API call
  const components: Component[] = [
    {
      id: 'nav-header',
      name: 'Navigation Header',
      description: 'Responsive navigation header with dropdown support',
      category: 'Navigation',
      version: '2.1.0',
      size: '15.2 KB',
      dependencies: ['react', 'lucide-react'],
      tags: ['navigation', 'menu', 'responsive'],
      license: 'MIT'
    },
    {
      id: 'contact-form',
      name: 'Contact Form',
      description: 'Complete contact form with validation and submission',
      category: 'Forms',
      version: '1.8.3',
      size: '12.7 KB',
      dependencies: ['react-hook-form', 'zod'],
      tags: ['form', 'validation', 'contact'],
      license: 'MIT'
    },
    {
      id: 'hero-section',
      name: 'Hero Section',
      description: 'Eye-catching hero section with call-to-action',
      category: 'Layout',
      version: '3.0.1',
      size: '8.9 KB',
      dependencies: ['react'],
      tags: ['hero', 'cta', 'banner'],
      license: 'MIT'
    },
    {
      id: 'image-gallery',
      name: 'Image Gallery',
      description: 'Responsive image gallery with lightbox',
      category: 'Content',
      version: '2.4.2',
      size: '22.1 KB',
      dependencies: ['react', 'next/image'],
      tags: ['gallery', 'images', 'lightbox'],
      license: 'MIT'
    },
    {
      id: 'modal-dialog',
      name: 'Modal Dialog',
      description: 'Accessible modal dialog component',
      category: 'Interactive',
      version: '1.5.0',
      size: '6.3 KB',
      dependencies: ['react', '@radix-ui/react-dialog'],
      tags: ['modal', 'dialog', 'popup'],
      license: 'MIT'
    }
  ]

  const categories = ['all', ...Array.from(new Set(components.map(c => c.category)))]

  const filteredComponents = components.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = categoryFilter === 'all' || component.category === categoryFilter
    
    return matchesSearch && matchesCategory
  })

  const toggleSelection = (componentId: string) => {
    setSelected(prev => 
      prev.includes(componentId) 
        ? prev.filter(id => id !== componentId)
        : [...prev, componentId]
    )
  }

  const handleInstall = async (componentId: string) => {
    setInstalling(prev => [...prev, componentId])
    setError(null)

    try {
      // Simulate installation process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setInstalled(prev => [...prev, componentId])
      setInstalling(prev => prev.filter(id => id !== componentId))
      
      // Call onInstall with all installed components
      const installedComponents = components.filter(c => installed.includes(c.id) || c.id === componentId)
      onInstall?.(installedComponents)
      
    } catch (err) {
      setError('Failed to install component. Please try again.')
      setInstalling(prev => prev.filter(id => id !== componentId))
    }
  }

  const handleInstallSelected = async () => {
    for (const componentId of selected) {
      if (!installed.includes(componentId) && !installing.includes(componentId)) {
        await handleInstall(componentId)
      }
    }
  }

  const getSelectedComponents = () => {
    return components.filter(c => selected.includes(c.id))
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Component Installer</h2>
            <p className="text-muted-foreground mt-1">
              Install components directly to your project
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {selected.length > 0 && (
              <Badge variant="outline" className="flex items-center space-x-1">
                <Package className="h-3 w-3" />
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

        {/* Search and Filters */}
        <div className="p-6 border-b space-y-4">
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
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          {selected.length > 0 && (
            <Card className="bg-brand-500/5 border-brand-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-brand-500" />
                    <span className="text-sm font-medium">
                      {selected.length} component{selected.length !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleInstallSelected}
                      disabled={installing.length > 0}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Install Selected
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelected([])}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Components Grid */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {error && (
            <Card className="mb-6 bg-red-500/5 border-red-500/20">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredComponents.map((component) => {
              const isSelected = selected.includes(component.id)
              const isInstalled = installed.includes(component.id)
              const isInstalling = installing.includes(component.id)

              return (
                <Card 
                  key={component.id} 
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-md',
                    isSelected && 'ring-2 ring-brand-500',
                    isInstalled && 'bg-green-500/5 border-green-500/20'
                  )}
                  onClick={() => !isInstalled && toggleSelection(component.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{component.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {component.category}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            v{component.version}
                          </Badge>
                        </div>
                      </div>
                      {isInstalled && (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      )}
                      {isSelected && !isInstalled && (
                        <div className="h-5 w-5 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm mb-4 line-clamp-2">
                      {component.description}
                    </CardDescription>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Size: {component.size}</span>
                        <span>License: {component.license}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {component.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1 mb-1">
                          <Code className="h-3 w-3" />
                          <span>Dependencies:</span>
                        </div>
                        <div className="text-xs">
                          {component.dependencies.join(', ')}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 pt-2">
                        {isInstalled ? (
                          <Button size="sm" variant="outline" disabled className="flex-1">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Installed
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleInstall(component.id)
                            }}
                            disabled={isInstalling}
                          >
                            {isInstalling ? (
                              <>
                                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                                Installing...
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4 mr-2" />
                                Install
                              </>
                            )}
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Info className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredComponents.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No components found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or category filter.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {selected.length > 0 && (
          <div className="border-t p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {selected.length} component{selected.length !== 1 ? 's' : ''} ready to install
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={() => setSelected([])}>
                  Cancel
                </Button>
                <Button onClick={handleInstallSelected} disabled={installing.length > 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Install {selected.length} Component{selected.length !== 1 ? 's' : ''}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
