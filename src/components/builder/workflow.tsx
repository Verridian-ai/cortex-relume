'use client'

import React, { useState, useCallback } from 'react'
import { BuilderNav, type BuilderStep } from './builder-nav'
import { PromptInput } from './prompt-input'
import { SitemapPreview } from './sitemap-preview'
import { WireframeEditor } from './wireframe-editor'
import { StyleGuideView } from './style-guide-view'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Download, Eye, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

interface WorkflowData {
  prompt?: string
  sitemap?: any[]
  wireframes?: any[]
  styleGuide?: any
}

export function BuilderWorkflow() {
  const [currentStep, setCurrentStep] = useState<BuilderStep>('prompt')
  const [workflowData, setWorkflowData] = useState<WorkflowData>({})
  const [loading, setLoading] = useState(false)

  // Simulate AI processing delay
  const processWithDelay = async (action: () => void, delay = 1500) => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, delay))
    action()
    setLoading(false)
  }

  const updateWorkflowData = useCallback((key: keyof WorkflowData, value: any) => {
    setWorkflowData(prev => ({ ...prev, [key]: value }))
  }, [])

  const handlePromptSubmit = useCallback((prompt: string) => {
    updateWorkflowData('prompt', prompt)
    
    processWithDelay(() => {
      setCurrentStep('sitemap')
      toast.success('Sitemap generated successfully!')
    })
  }, [updateWorkflowData])

  const handleSitemapNext = useCallback((sitemap: any[]) => {
    updateWorkflowData('sitemap', sitemap)
    
    processWithDelay(() => {
      setCurrentStep('wireframe')
      toast.success('Wireframes generated successfully!')
    })
  }, [updateWorkflowData])

  const handleWireframeNext = useCallback((wireframes: any[]) => {
    updateWorkflowData('wireframes', wireframes)
    
    processWithDelay(() => {
      setCurrentStep('style-guide')
      toast.success('Style guide generated successfully!')
    })
  }, [updateWorkflowData])

  const handleStyleGuideNext = useCallback((styleGuide: any) => {
    updateWorkflowData('styleGuide', styleGuide)
    
    processWithDelay(() => {
      setCurrentStep('complete')
      toast.success('Your website is ready! 🎉')
    }, 2000)
  }, [updateWorkflowData])

  const handleStepChange = useCallback((step: BuilderStep) => {
    if (step === 'prompt' || 
        (step === 'sitemap' && workflowData.prompt) ||
        (step === 'wireframe' && workflowData.sitemap) ||
        (step === 'style-guide' && workflowData.wireframes) ||
        (step === 'complete' && workflowData.styleGuide)) {
      setCurrentStep(step)
    } else {
      toast.error('Please complete the current step first')
    }
  }, [workflowData])

  const handleRestart = useCallback(() => {
    setCurrentStep('prompt')
    setWorkflowData({})
    setLoading(false)
    toast.info('Build process restarted')
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="glow" className="px-3 py-1">
                <CheckCircle className="w-3 h-3 mr-1" />
                AI Site Builder
              </Badge>
              {workflowData.prompt && (
                <span className="text-sm text-muted-foreground">
                  Building: {workflowData.prompt.slice(0, 60)}...
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {currentStep !== 'prompt' && currentStep !== 'complete' && (
                <Button variant="outline" size="sm" onClick={handleRestart}>
                  Restart
                </Button>
              )}
              
              {currentStep === 'complete' && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button variant="ai" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="default" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Deploy
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <BuilderNav 
          currentStep={currentStep} 
          onStepChange={handleStepChange}
          className="mb-8"
        />

        {/* Step Content */}
        <div className="relative">
          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">AI is working...</h3>
                  <p className="text-sm text-muted-foreground">
                    Generating your {currentStep === 'prompt' ? 'sitemap' : 
                                    currentStep === 'sitemap' ? 'wireframes' :
                                    currentStep === 'wireframe' ? 'style guide' : 'website'}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step Components */}
          <div className={`transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
            {currentStep === 'prompt' && (
              <PromptInput 
                onNext={handlePromptSubmit}
                loading={loading}
              />
            )}

            {currentStep === 'sitemap' && (
              <SitemapPreview
                onNext={handleSitemapNext}
                onBack={() => setCurrentStep('prompt')}
                loading={loading}
                sitemap={workflowData.sitemap}
              />
            )}

            {currentStep === 'wireframe' && (
              <WireframeEditor
                onNext={handleWireframeNext}
                onBack={() => setCurrentStep('sitemap')}
                loading={loading}
                sitemap={workflowData.sitemap}
              />
            )}

            {currentStep === 'style-guide' && (
              <StyleGuideView
                onNext={handleStyleGuideNext}
                onBack={() => setCurrentStep('wireframe')}
                loading={loading}
                wireframes={workflowData.wireframes}
              />
            )}

            {currentStep === 'complete' && (
              <BuildComplete 
                workflowData={workflowData}
                onRestart={handleRestart}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Build Complete Component
interface BuildCompleteProps {
  workflowData: WorkflowData
  onRestart: () => void
}

function BuildComplete({ workflowData, onRestart }: BuildCompleteProps) {
  return (
    <div className="text-center space-y-8 max-w-4xl mx-auto">
      {/* Success Animation */}
      <div className="relative">
        <div className="w-24 h-24 mx-auto bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        <div className="absolute inset-0 w-24 h-24 mx-auto border-4 border-green-400 rounded-full animate-ping" />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          🎉 Your Website is Ready!
        </h1>
        <p className="text-xl text-muted-foreground">
          Complete design system generated successfully
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center p-6 border-2 border-green-200 dark:border-green-800">
          <CardContent className="p-0">
            <div className="text-2xl font-bold text-green-600 mb-2">4</div>
            <div className="text-sm text-muted-foreground">Main Pages</div>
          </CardContent>
        </Card>
        
        <Card className="text-center p-6 border-2 border-blue-200 dark:border-blue-800">
          <CardContent className="p-0">
            <div className="text-2xl font-bold text-blue-600 mb-2">12</div>
            <div className="text-sm text-muted-foreground">Components</div>
          </CardContent>
        </Card>
        
        <Card className="text-center p-6 border-2 border-purple-200 dark:border-purple-800">
          <CardContent className="p-0">
            <div className="text-2xl font-bold text-purple-600 mb-2">3</div>
            <div className="text-sm text-muted-foreground">Viewports</div>
          </CardContent>
        </Card>
        
        <Card className="text-center p-6 border-2 border-orange-200 dark:border-orange-800">
          <CardContent className="p-0">
            <div className="text-2xl font-bold text-orange-600 mb-2">100%</div>
            <div className="text-sm text-muted-foreground">Responsive</div>
          </CardContent>
        </Card>
      </div>

      {/* Next Steps */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">What would you like to do next?</h2>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="ai" size="lg" className="flex-1 max-w-xs">
            <Eye className="w-4 h-4 mr-2" />
            Preview Website
          </Button>
          
          <Button variant="outline" size="lg" className="flex-1 max-w-xs">
            <Download className="w-4 h-4 mr-2" />
            Download Assets
          </Button>
          
          <Button variant="outline" size="lg" className="flex-1 max-w-xs">
            <ExternalLink className="w-4 h-4 mr-2" />
            Deploy Live
          </Button>
        </div>
        
        <div className="pt-4">
          <Button variant="ghost" onClick={onRestart}>
            Start New Project
          </Button>
        </div>
      </div>

      {/* Export Options */}
      <Card className="text-left">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Available Exports</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Design Files</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Figma Design System</li>
                <li>• Sketch Library</li>
                <li>• Adobe XD Components</li>
                <li>• SVG Assets</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Code & Resources</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• React Components</li>
                <li>• CSS Variables</li>
                <li>• Tailwind Config</li>
                <li>• Storybook Stories</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}