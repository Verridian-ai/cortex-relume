'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  ArrowRight, 
  Layout, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Maximize2, 
  Download,
  Eye,
  Code,
  Palette
} from 'lucide-react'
import { toast } from 'sonner'

interface WireframeData {
  id: string
  title: string
  elements: WireframeElement[]
  viewport: 'desktop' | 'tablet' | 'mobile'
}

interface WireframeElement {
  id: string
  type: 'header' | 'navigation' | 'hero' | 'content' | 'sidebar' | 'footer' | 'button' | 'form' | 'image'
  x: number
  y: number
  width: number
  height: number
  label: string
  properties?: Record<string, any>
}

interface WireframeEditorProps {
  onNext: (wireframes: WireframeData[]) => void
  onBack: () => void
  loading?: boolean
  sitemap?: any[]
}

const WIREFRAME_ELEMENTS: WireframeElement[] = [
  {
    id: 'header',
    type: 'header',
    x: 0,
    y: 0,
    width: 100,
    height: 80,
    label: 'Header / Navigation',
    properties: { sticky: true, logo: 'Logo' }
  },
  {
    id: 'hero',
    type: 'hero',
    x: 0,
    y: 80,
    width: 70,
    height: 400,
    label: 'Hero Section',
    properties: { title: 'Main Headline', subtitle: 'Supporting text', cta: 'Get Started' }
  },
  {
    id: 'sidebar',
    type: 'sidebar',
    x: 70,
    y: 80,
    width: 30,
    height: 400,
    label: 'Sidebar',
    properties: { position: 'right' }
  },
  {
    id: 'content',
    type: 'content',
    x: 0,
    y: 480,
    width: 100,
    height: 300,
    label: 'Main Content',
    properties: { type: 'features-grid' }
  },
  {
    id: 'footer',
    type: 'footer',
    x: 0,
    y: 780,
    width: 100,
    height: 120,
    label: 'Footer',
    properties: { links: ['Privacy', 'Terms', 'Contact'] }
  }
]

const VIEWPORTS = [
  { key: 'desktop', label: 'Desktop', icon: Monitor, width: 1200 },
  { key: 'tablet', label: 'Tablet', icon: Tablet, width: 768 },
  { key: 'mobile', label: 'Mobile', icon: Smartphone, width: 375 },
] as const

export function WireframeEditor({ onNext, onBack, loading = false, sitemap = [] }: WireframeEditorProps) {
  const [selectedViewport, setSelectedViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [showGrid, setShowGrid] = useState(true)
  const [showLabels, setShowLabels] = useState(true)

  const currentViewport = VIEWPORTS.find(v => v.key === selectedViewport)!
  
  const handleElementSelect = (elementId: string) => {
    setSelectedElement(elementId === selectedElement ? null : elementId)
  }

  const handleGenerateWireframes = () => {
    const wireframe: WireframeData = {
      id: 'main',
      title: 'Home Page Wireframe',
      elements: WIREFRAME_ELEMENTS,
      viewport: selectedViewport
    }
    onNext([wireframe])
  }

  const selectedElementData = selectedElement ? WIREFRAME_ELEMENTS.find(e => e.id === selectedElement) : null

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Badge variant="ai" className="px-3 py-1">
            <Layout className="w-3 h-3 mr-1" />
            Step 3
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">Wireframe Design</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Visualize your website layout. Click on elements to view details and customize them. 
          Switch between different viewports to see responsive behavior.
        </p>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack} disabled={loading}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sitemap
        </Button>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowGrid(!showGrid)}>
            Grid
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowLabels(!showLabels)}>
            Labels
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            variant="ai"
            size="lg"
            onClick={handleGenerateWireframes}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                Generate Style Guide
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {/* Viewport Controls */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Viewports</CardTitle>
            <CardDescription>Preview at different screen sizes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {VIEWPORTS.map((viewport) => {
              const Icon = viewport.icon
              return (
                <Button
                  key={viewport.key}
                  variant={selectedViewport === viewport.key ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setSelectedViewport(viewport.key)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {viewport.label}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {viewport.width}px
                  </span>
                </Button>
              )
            })}
          </CardContent>
        </Card>

        {/* Wireframe Canvas */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="w-5 h-5 text-brand-500" />
                  {currentViewport.label} Wireframe
                </CardTitle>
                <CardDescription>
                  Click elements to view and edit properties
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {currentViewport.width} × 800
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Wireframe Canvas */}
            <div 
              className="relative mx-auto border border-border rounded-lg overflow-hidden bg-background"
              style={{ 
                width: Math.min(currentViewport.width, 600), 
                height: 600,
                backgroundImage: showGrid ? 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)' : 'none',
                backgroundSize: showGrid ? '20px 20px' : 'auto'
              }}
            >
              {WIREFRAME_ELEMENTS.map((element) => {
                const isSelected = selectedElement === element.id
                return (
                  <div
                    key={element.id}
                    className={`absolute border-2 transition-all duration-200 cursor-pointer ${
                      isSelected 
                        ? 'border-brand-500 bg-brand-500/10 shadow-lg' 
                        : 'border-muted-foreground/30 bg-muted/20 hover:border-brand-400'
                    }`}
                    style={{
                      left: `${(element.x / 100) * Math.min(currentViewport.width, 600)}px`,
                      top: `${element.y}px`,
                      width: `${(element.width / 100) * Math.min(currentViewport.width, 600)}px`,
                      height: `${element.height}px`,
                    }}
                    onClick={() => handleElementSelect(element.id)}
                  >
                    {showLabels && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-center px-2 bg-background/90 rounded">
                          {element.label}
                        </span>
                      </div>
                    )}
                    
                    {isSelected && (
                      <div className="absolute -inset-1 border-2 border-brand-500 rounded pointer-events-none" />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {['header', 'hero', 'sidebar', 'content', 'footer'].map((type) => (
                <Badge key={type} variant="outline" className="text-xs">
                  {type}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Element Properties */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Code className="w-4 h-4" />
              Element Details
            </CardTitle>
            <CardDescription>
              {selectedElement ? 'Selected element properties' : 'Click an element to edit'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedElementData ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Element Type</label>
                  <div className="mt-1 capitalize font-mono text-sm bg-muted px-2 py-1 rounded">
                    {selectedElementData.type}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Label</label>
                  <div className="mt-1 text-sm bg-muted px-2 py-1 rounded">
                    {selectedElementData.label}
                  </div>
                </div>

                {selectedElementData.properties && (
                  <div>
                    <label className="text-sm font-medium">Properties</label>
                    <div className="mt-2 space-y-2">
                      {Object.entries(selectedElementData.properties).map(([key, value]) => (
                        <div key={key} className="text-xs">
                          <span className="font-medium">{key}:</span>
                          <span className="ml-1 font-mono text-muted-foreground">
                            {typeof value === 'string' ? value : JSON.stringify(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-3 h-3 mr-1" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm">
                    <Palette className="w-3 h-3 mr-1" />
                    Style
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Layout className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select an element to view its properties</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}