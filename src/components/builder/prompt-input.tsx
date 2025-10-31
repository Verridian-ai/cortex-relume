'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Lightbulb, Target, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

interface PromptInputProps {
  onNext: (prompt: string) => void
  loading?: boolean
}

const EXAMPLE_PROMPTS = [
  {
    title: 'SaaS Dashboard',
    description: 'Create a modern SaaS analytics dashboard with user management',
    icon: Target,
  },
  {
    title: 'E-commerce Store',
    description: 'Design a clean e-commerce platform with product catalog and cart',
    icon: Sparkles,
  },
  {
    title: 'Portfolio Website',
    description: 'Build a creative portfolio with project showcase and contact form',
    icon: Lightbulb,
  },
]

export function PromptInput({ onNext, loading = false }: PromptInputProps) {
  const [prompt, setPrompt] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) {
      toast.error('Please enter a prompt for your website')
      return
    }
    onNext(prompt.trim())
  }

  const handleTemplateSelect = (template: string) => {
    setSelectedTemplate(template)
    setPrompt(template)
    toast.success('Template selected! You can customize it below.')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Badge variant="ai" className="px-3 py-1">
            <Sparkles className="w-3 h-3 mr-1" />
            Step 1
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">Describe Your Vision</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Tell our AI about your website idea. Be as detailed or creative as you'd like - 
          the more context you provide, the better your results will be.
        </p>
      </div>

      {/* Example Templates */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-center">Need inspiration? Try these templates:</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {EXAMPLE_PROMPTS.map((template, index) => {
            const Icon = template.icon
            return (
              <Card
                key={index}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                  selectedTemplate === template.description ? 'ring-2 ring-brand-500 shadow-lg' : ''
                }`}
                onClick={() => handleTemplateSelect(template.description)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-brand-500" />
                    <CardTitle className="text-base">{template.title}</CardTitle>
                  </div>
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Main Input Form */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-500" />
            Your Website Description
          </CardTitle>
          <CardDescription>
            Describe what you want to build. Include details about purpose, target audience, key features, and style preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="prompt" className="text-sm font-medium">
                Project Details
              </label>
              <textarea
                id="prompt"
                placeholder="e.g., I want to create a modern SaaS dashboard for project management. It should have a clean, minimal design with dark mode support, user authentication, real-time data visualization, and integration with popular tools like Slack and GitHub. The color scheme should be professional with blue accents, and it should work great on both desktop and mobile devices."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full min-h-[120px] p-4 border border-input rounded-md resize-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
                disabled={loading}
              />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Be specific about features, design style, and functionality</span>
                <span>{prompt.length} characters</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                variant="ai"
                size="lg"
                disabled={!prompt.trim() || loading}
                className="flex-1 md:flex-none"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    Generate Sitemap
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Tips */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Pro Tips for Better Results
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Mention your target audience and industry</li>
              <li>• Specify key features and functionality you need</li>
              <li>• Describe your preferred design style (modern, minimalist, corporate, etc.)</li>
              <li>• Include any specific requirements or constraints</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}