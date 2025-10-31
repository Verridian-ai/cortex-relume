'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Target, 
  ArrowRight, 
  Sparkles, 
  Copy, 
  Eye,
  Code,
  Palette,
  Grid3X3,
  Layout,
  Package,
  Puzzle,
  Target as TargetIcon,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Zap,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface WireframeElement {
  id: string
  type: string
  label: string
  position: { x: number; y: number }
  dimensions: { width: number; height: number }
  properties: Record<string, any>
}

interface ComponentMapping {
  id: string
  wireframeElementId: string
  componentName: string
  category: string
  confidence: number
  mapping: {
    elementType: string
    properties: Record<string, string>
    customizations: string[]
  }
  preview?: string
}

interface WireframeToComponentsProps {
  wireframeElements: WireframeElement[]
  onComplete?: (mappings: ComponentMapping[]) => void
  onClose?: () => void
}

export function WireframeToComponents({
  wireframeElements,
  onComplete,
  onClose
}: WireframeToComponentsProps) {
  const [mappings, setMappings] = useState<ComponentMapping[]>([])
  const [selectedElements, setSelectedElements] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState<'select' | 'mapping' | 'review'>('select')

  // Mock AI-powered component mapping
  const generateMappings = async (elements: WireframeElement[]): Promise<ComponentMapping[]> => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    return elements.map(element => {
      const mapping = getComponentMapping(element)
      return {
        id: `mapping-${element.id}`,
        wireframeElementId: element.id,
        componentName: mapping.name,
        category: mapping.category,
        confidence: mapping.confidence,
        mapping: mapping
      }
    })
  }

  const getComponentMapping = (element: WireframeElement): ComponentMapping['mapping'] => {
    const { type, properties, dimensions } = element
    
    // AI-powered mapping logic
    if (type === 'button') {
      return {
        elementType: 'button',
        properties: {
          variant: properties.style === 'primary' ? 'default' : 'outline',
          size: 'md',
          text: properties.text || 'Button'
        },
        customizations: ['Custom colors', 'Icon support', 'Loading states']
      }
    }
    
    if (type === 'input') {
      return {
        elementType: 'input',
        properties: {
          type: properties.type || 'text',
          placeholder: properties.placeholder || 'Enter text...',
          variant: 'default',
          size: 'md'
        },
        customizations: ['Validation states', 'Icons', 'Labels']
      }
    }
    
    if (type === 'image') {
      return {
        elementType: 'image',
        properties: {
          src: '/placeholder.jpg',
          alt: properties.alt || 'Image',
          aspectRatio: dimensions.width / dimensions.height
        },
        customizations: ['Responsive', 'Lazy loading', 'Placeholders']
      }
    }
    
    if (type === 'nav') {
      return {
        elementType: 'navigation',
        properties: {
          items: ['Home', 'About', 'Contact'],
          variant: 'horizontal',
          mobile: true
        },
        customizations: ['Dropdown menus', 'Active states', 'Mobile hamburger']
      }
    }
    
    // Default mapping
    return {
      elementType: 'div',
      properties: {
        className: 'custom-container'
      },
      customizations: ['Spacing', 'Background', 'Border radius']
    }
  }

  const getElementIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'button': return TargetIcon
      case 'input': return Package
      case 'image': return Eye
      case 'nav': return Grid3X3
      case 'text': return Code
      default: return Layout
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'navigation': return Grid3X3
      case 'forms': return Package
      case 'layout': return Layout
      case 'content': return TargetIcon
      case 'interactive': return Puzzle
      default: return Code
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-500 bg-green-500/10'
    if (confidence >= 80) return 'text-yellow-500 bg-yellow-500/10'
    return 'text-orange-500 bg-orange-500/10'
  }

  const handleElementSelection = (elementId: string) => {
    setSelectedElements(prev => 
      prev.includes(elementId)
        ? prev.filter(id => id !== elementId)
        : [...prev, elementId]
    )
  }

  const handleGenerateMappings = async () => {
    setIsProcessing(true)
    try {
      const selectedWireframeElements = wireframeElements.filter(el => 
        selectedElements.includes(el.id)
      )
      const generatedMappings = await generateMappings(selectedWireframeElements)
      setMappings(generatedMappings)
      setCurrentStep('mapping')
    } catch (error) {
      console.error('Failed to generate mappings:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const updateMapping = (mappingId: string, updates: Partial<ComponentMapping>) => {
    setMappings(prev => prev.map(m => 
      m.id === mappingId ? { ...m, ...updates } : m
    ))
  }

  const handleComplete = () => {
    onComplete?.(mappings)
  }

  // Mock wireframe elements for demo
  const mockElements: WireframeElement[] = wireframeElements.length > 0 ? wireframeElements : [
    {
      id: 'nav-1',
      type: 'nav',
      label: 'Main Navigation',
      position: { x: 0, y: 0 },
      dimensions: { width: 1200, height: 60 },
      properties: { items: ['Home', 'About', 'Contact'] }
    },
    {
      id: 'hero-1',
      type: 'text',
      label: 'Hero Title',
      position: { x: 50, y: 100 },
      dimensions: { width: 600, height: 80 },
      properties: { text: 'Welcome to our website', size: 'large' }
    },
    {
      id: 'button-1',
      type: 'button',
      label: 'CTA Button',
      position: { x: 50, y: 200 },
      dimensions: { width: 150, height: 40 },
      properties: { text: 'Get Started', style: 'primary' }
    },
    {
      id: 'form-1',
      type: 'input',
      label: 'Email Input',
      position: { x: 50, y: 300 },
      dimensions: { width: 300, height: 40 },
      properties: { type: 'email', placeholder: 'Enter your email' }
    },
    {
      id: 'image-1',
      type: 'image',
      label: 'Hero Image',
      position: { x: 700, y: 100 },
      dimensions: { width: 400, height: 300 },
      properties: { alt: 'Hero illustration' }
    }
  ]

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border rounded-lg shadow-lg w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-brand-500/10 flex items-center justify-center">
              <Target className="h-6 w-6 text-brand-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Wireframe to Components</h2>
              <p className="text-muted-foreground">
                Convert wireframe elements to production-ready components
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Target className="h-3 w-3" />
              <span>Step {currentStep === 'select' ? '1' : currentStep === 'mapping' ? '2' : '3'} of 3</span>
            </Badge>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ✕
              </Button>
            )}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center space-x-4">
            {[
              { key: 'select', label: 'Select Elements', icon: Target },
              { key: 'mapping', label: 'AI Mapping', icon: Sparkles },
              { key: 'review', label: 'Review & Export', icon: CheckCircle }
            ].map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.key
              const isCompleted = (currentStep === 'select' && index === 0) || 
                                (currentStep === 'mapping' && index <= 1) ||
                                (currentStep === 'review' && index <= 2)
              
              return (
                <div key={step.key} className="flex items-center space-x-2">
                  <div className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium',
                    isCompleted 
                      ? 'bg-brand-500 text-white' 
                      : isActive 
                        ? 'bg-brand-500/10 text-brand-500 border-2 border-brand-500'
                        : 'bg-muted text-muted-foreground'
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={cn(
                    'text-sm font-medium',
                    isActive ? 'text-brand-500' : 'text-muted-foreground'
                  )}>
                    {step.label}
                  </span>
                  {index < 2 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 'select' && (
            <div className="space-y-6">
              <Card className="bg-blue-500/5 border-blue-500/20">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-700">AI-Powered Conversion</h3>
                      <p className="text-sm text-blue-600 mt-1">
                        Select wireframe elements below to convert them into production-ready React components. 
                        Our AI will analyze each element's properties and suggest the best matching components.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                {mockElements.map((element) => {
                  const ElementIcon = getElementIcon(element.type)
                  const isSelected = selectedElements.includes(element.id)
                  
                  return (
                    <Card 
                      key={element.id}
                      className={cn(
                        'cursor-pointer transition-all hover:shadow-md',
                        isSelected && 'ring-2 ring-brand-500 bg-brand-500/5'
                      )}
                      onClick={() => handleElementSelection(element.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                            <ElementIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{element.label}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {element.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {element.dimensions.width} × {element.dimensions.height}
                              </span>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="h-6 w-6 rounded-full bg-brand-500 flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {currentStep === 'mapping' && (
            <div className="space-y-6">
              <Card className="bg-brand-500/5 border-brand-500/20">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Sparkles className="h-5 w-5 text-brand-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-brand-700">AI Mapping Complete</h3>
                      <p className="text-sm text-brand-600 mt-1">
                        Review the suggested component mappings below. You can adjust any component 
                        type or customization before generating the final code.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {mappings.map((mapping) => {
                  const CategoryIcon = getCategoryIcon(mapping.category)
                  const originalElement = mockElements.find(el => el.id === mapping.wireframeElementId)
                  const ElementIcon = getElementIcon(originalElement?.type || '')
                  
                  return (
                    <Card key={mapping.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                              <ElementIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{originalElement?.label}</CardTitle>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {originalElement?.type}
                                </Badge>
                                <Badge variant="secondary" className={cn('text-xs', getConfidenceColor(mapping.confidence))}>
                                  {mapping.confidence}% match
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2 mb-2">
                              <CategoryIcon className="h-4 w-4 text-brand-500" />
                              <span className="text-sm font-medium">{mapping.componentName}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {mapping.category}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium mb-2">Component Properties</h4>
                            <div className="bg-muted rounded-lg p-3">
                              <pre className="text-xs overflow-x-auto">
                                {JSON.stringify(mapping.mapping.properties, null, 2)}
                              </pre>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-2">Customizations Available</h4>
                            <div className="flex flex-wrap gap-1">
                              {mapping.mapping.customizations.map((custom, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {custom}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </Button>
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4 mr-2" />
                              Customize
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {currentStep === 'review' && (
            <div className="space-y-6">
              <Card className="bg-green-500/5 border-green-500/20">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-green-700">Ready to Export</h3>
                      <p className="text-sm text-green-600 mt-1">
                        All component mappings have been reviewed and are ready to be generated. 
                        You can download the complete React components with Tailwind CSS styling.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Target className="h-8 w-8 text-brand-500 mx-auto mb-2" />
                    <h3 className="font-medium">Components Generated</h3>
                    <p className="text-2xl font-bold text-brand-500 mt-1">{mappings.length}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <Code className="h-8 w-8 text-brand-500 mx-auto mb-2" />
                    <h3 className="font-medium">Code Quality</h3>
                    <div className="text-2xl font-bold text-green-500 mt-1">A+</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <Zap className="h-8 w-8 text-brand-500 mx-auto mb-2" />
                    <h3 className="font-medium">Time Saved</h3>
                    <div className="text-2xl font-bold text-brand-500 mt-1">~2hrs</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {currentStep === 'select' && `${selectedElements.length} element${selectedElements.length !== 1 ? 's' : ''} selected`}
              {currentStep === 'mapping' && `${mappings.length} component${mappings.length !== 1 ? 's' : ''} mapped`}
              {currentStep === 'review' && 'Ready to generate components'}
            </div>
            <div className="flex items-center space-x-2">
              {currentStep === 'select' && (
                <>
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleGenerateMappings}
                    disabled={selectedElements.length === 0 || isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Components
                      </>
                    )}
                  </Button>
                </>
              )}
              
              {currentStep === 'mapping' && (
                <>
                  <Button variant="outline" onClick={() => setCurrentStep('select')}>
                    Back
                  </Button>
                  <Button onClick={() => setCurrentStep('review')}>
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </>
              )}
              
              {currentStep === 'review' && (
                <>
                  <Button variant="outline" onClick={() => setCurrentStep('mapping')}>
                    Back
                  </Button>
                  <Button onClick={handleComplete}>
                    <Copy className="h-4 w-4 mr-2" />
                    Generate Components
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
