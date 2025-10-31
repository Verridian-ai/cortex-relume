'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Palette, 
  Type, 
  Layout, 
  Download, 
  Copy, 
  Check, 
  Sparkles,
  FileCode,
  Eye,
  Settings
} from 'lucide-react'
import { toast } from 'sonner'

interface StyleGuideData {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    muted: string
  }
  typography: {
    heading: string
    body: string
    fontSize: {
      sm: string
      base: string
      lg: string
      xl: string
      '2xl': string
      '3xl': string
    }
    fontWeight: {
      normal: number
      medium: number
      semibold: number
      bold: number
    }
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
  }
  borderRadius: {
    sm: string
    md: string
    lg: string
    full: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
  }
}

interface StyleGuideViewProps {
  onNext: (styleGuide: StyleGuideData) => void
  onBack: () => void
  loading?: boolean
  wireframes?: any[]
}

const DEFAULT_STYLE_GUIDE: StyleGuideData = {
  colors: {
    primary: '#3B82F6',
    secondary: '#64748B',
    accent: '#8B5CF6',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#0F172A',
    muted: '#94A3B8'
  },
  typography: {
    heading: 'Inter',
    body: 'Inter',
    fontSize: {
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  },
  borderRadius: {
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
  }
}

const COLOR_PREVIEW_COMPONENTS = [
  {
    name: 'Primary Button',
    className: 'bg-primary text-primary-foreground hover:bg-primary/90',
    label: 'Button'
  },
  {
    name: 'Secondary Button',
    className: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    label: 'Secondary'
  },
  {
    name: 'Card',
    className: 'bg-card text-card-foreground border border-border',
    label: 'Card'
  },
  {
    name: 'Input',
    className: 'bg-background border border-input',
    label: 'Input'
  }
]

export function StyleGuideView({ onNext, onBack, loading = false, wireframes = [] }: StyleGuideViewProps) {
  const [styleGuide, setStyleGuide] = useState<StyleGuideData>(DEFAULT_STYLE_GUIDE)
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'spacing' | 'components'>('colors')
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates(prev => ({ ...prev, [key]: true }))
      toast.success('Copied to clipboard!')
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }))
      }, 2000)
    } catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const generateCSSVariables = () => {
    return `:root {
  --color-primary: ${styleGuide.colors.primary};
  --color-secondary: ${styleGuide.colors.secondary};
  --color-accent: ${styleGuide.colors.accent};
  --color-background: ${styleGuide.colors.background};
  --color-surface: ${styleGuide.colors.surface};
  --color-text: ${styleGuide.colors.text};
  --color-muted: ${styleGuide.colors.muted};
  
  --font-family-heading: ${styleGuide.typography.heading};
  --font-family-body: ${styleGuide.typography.body};
  
  --spacing-xs: ${styleGuide.spacing.xs};
  --spacing-sm: ${styleGuide.spacing.sm};
  --spacing-md: ${styleGuide.spacing.md};
  --spacing-lg: ${styleGuide.spacing.lg};
  --spacing-xl: ${styleGuide.spacing.xl};
  --spacing-2xl: ${styleGuide.spacing['2xl']};
  
  --border-radius-sm: ${styleGuide.borderRadius.sm};
  --border-radius-md: ${styleGuide.borderRadius.md};
  --border-radius-lg: ${styleGuide.borderRadius.lg};
  --border-radius-full: ${styleGuide.borderRadius.full};
  
  --shadow-sm: ${styleGuide.shadows.sm};
  --shadow-md: ${styleGuide.shadows.md};
  --shadow-lg: ${styleGuide.shadows.lg};
  --shadow-xl: ${styleGuide.shadows.xl};
}`
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Badge variant="ai" className="px-3 py-1">
            <Palette className="w-3 h-3 mr-1" />
            Step 4
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">Style Guide</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Your complete design system. Review colors, typography, spacing, and component styles. 
          Everything is ready to export as CSS or copy individual values.
        </p>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack} disabled={loading}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Wireframes
        </Button>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button
            variant="ai"
            size="lg"
            onClick={() => onNext(styleGuide)}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Complete Build
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {/* Tab Navigation */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Style Guide</CardTitle>
            <CardDescription>Design system overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { key: 'colors', label: 'Colors', icon: Palette },
              { key: 'typography', label: 'Typography', icon: Type },
              { key: 'spacing', label: 'Spacing', icon: Layout },
              { key: 'components', label: 'Components', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <Button
                  key={tab.key}
                  variant={activeTab === tab.key ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab(tab.key as any)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </Button>
              )
            })}
          </CardContent>
        </Card>

        {/* Content Area */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {activeTab === 'colors' && <Palette className="w-5 h-5 text-brand-500" />}
                  {activeTab === 'typography' && <Type className="w-5 h-5 text-brand-500" />}
                  {activeTab === 'spacing' && <Layout className="w-5 h-5 text-brand-500" />}
                  {activeTab === 'components' && <Settings className="w-5 h-5 text-brand-500" />}
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </CardTitle>
                <CardDescription>
                  {activeTab === 'colors' && 'Brand colors and semantic color system'}
                  {activeTab === 'typography' && 'Font families, sizes, and weights'}
                  {activeTab === 'spacing' && 'Spacing scale and layout system'}
                  {activeTab === 'components' && 'Component styles and variations'}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activeTab === 'colors' && (
              <div className="space-y-6">
                {/* Color Palette */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(styleGuide.colors).map(([name, value]) => (
                    <Card key={name} className="overflow-hidden">
                      <div 
                        className="h-16 w-full" 
                        style={{ backgroundColor: value }}
                      />
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium capitalize text-sm">{name}</div>
                            <div className="text-xs font-mono text-muted-foreground">{value}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(value, `color-${name}`)}
                            className="h-6 w-6 p-0"
                          >
                            {copiedStates[`color-${name}`] ? 
                              <Check className="w-3 h-3 text-green-500" /> : 
                              <Copy className="w-3 h-3" />
                            }
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Component Previews */}
                <div>
                  <h4 className="font-semibold mb-3">Component Previews</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {COLOR_PREVIEW_COMPONENTS.map((component, index) => (
                      <div key={index} className="text-center">
                        <Button 
                          className={`w-full ${component.className}`}
                          size="sm"
                        >
                          {component.label}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'typography' && (
              <div className="space-y-6">
                {/* Typography Scale */}
                <div>
                  <h4 className="font-semibold mb-3">Font Sizes</h4>
                  <div className="space-y-2">
                    {Object.entries(styleGuide.typography.fontSize).map(([name, value]) => (
                      <div key={name} className="flex items-center justify-between p-3 border rounded">
                        <div style={{ fontSize: value, fontWeight: styleGuide.typography.fontWeight.bold }}>
                          {name} - {value}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(value, `font-${name}`)}
                        >
                          {copiedStates[`font-${name}`] ? 
                            <Check className="w-3 h-3 text-green-500" /> : 
                            <Copy className="w-3 h-3" />
                          }
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sample Text */}
                <div>
                  <h4 className="font-semibold mb-3">Sample Text</h4>
                  <div className="space-y-4 p-4 border rounded">
                    <h1 className="text-3xl font-bold">Heading 1</h1>
                    <h2 className="text-2xl font-semibold">Heading 2</h2>
                    <h3 className="text-xl font-medium">Heading 3</h3>
                    <p className="text-base">Body text - This is how your content will look with the selected typography system.</p>
                    <p className="text-sm text-muted-foreground">Small text and captions</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'spacing' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Spacing Scale</h4>
                  <div className="space-y-2">
                    {Object.entries(styleGuide.spacing).map(([name, value]) => (
                      <div key={name} className="flex items-center gap-4 p-3 border rounded">
                        <div className="flex-1">
                          <div className="font-medium">{name}</div>
                          <div className="text-sm font-mono text-muted-foreground">{value}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div 
                            className="bg-brand-500 rounded"
                            style={{ width: value, height: '20px' }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(value, `spacing-${name}`)}
                          >
                            {copiedStates[`spacing-${name}`] ? 
                              <Check className="w-3 h-3 text-green-500" /> : 
                              <Copy className="w-3 h-3" />
                            }
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'components' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Component Examples</h4>
                  <div className="grid gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Card Example</CardTitle>
                        <CardDescription>Card with content and actions</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-4">This is how cards will look with your style guide.</p>
                        <div className="flex gap-2">
                          <Button size="sm">Primary</Button>
                          <Button variant="outline" size="sm">Secondary</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CSS Export */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-brand-500" />
            CSS Variables Export
          </CardTitle>
          <CardDescription>
            Copy these CSS variables to use in your project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
              <code>{generateCSSVariables()}</code>
            </pre>
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => copyToClipboard(generateCSSVariables(), 'css-vars')}
            >
              {copiedStates['css-vars'] ? 
                <Check className="w-4 h-4 mr-2 text-green-500" /> : 
                <Copy className="w-4 h-4 mr-2" />
              }
              Copy CSS
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}