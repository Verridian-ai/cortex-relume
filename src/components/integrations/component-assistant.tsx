'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Sparkles, 
  MessageSquare, 
  Send, 
  Lightbulb,
  Zap,
  Target,
  RefreshCw,
  Copy,
  Download,
  Star,
  TrendingUp,
  ArrowRight,
  Code,
  Layout,
  Grid3X3,
  Package,
  Puzzle,
  Eye,
  Heart
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SuggestedComponent {
  id: string
  name: string
  description: string
  category: string
  confidence: number
  reason: string
  tags: string[]
  benefits: string[]
  preview?: string
}

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  components?: SuggestedComponent[]
}

interface ComponentAssistantProps {
  projectId?: string
  projectType?: string
  currentComponents?: string[]
  onSelect?: (components: SuggestedComponent[]) => void
  onClose?: () => void
}

export function ComponentAssistant({
  projectId,
  projectType = 'website',
  currentComponents = [],
  onSelect,
  onClose
}: ComponentAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<SuggestedComponent[]>([])
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([])

  const initialMessage: ChatMessage = {
    id: '1',
    type: 'assistant',
    content: `Hi! I'm your AI Component Assistant. I can help you find the perfect components for your ${projectType} project. 

Based on your project type, I've prepared some initial suggestions. You can also ask me questions like:
- "What components do I need for an e-commerce site?"
- "Show me components for a landing page"
- "I need forms for user registration"

What would you like to work on?`,
    timestamp: new Date(),
    components: []
  }

  useEffect(() => {
    setMessages([initialMessage])
    loadInitialSuggestions()
  }, [projectType])

  const loadInitialSuggestions = () => {
    const initialSuggestions: SuggestedComponent[] = [
      {
        id: 'hero-section',
        name: 'Hero Section',
        description: 'Eye-catching header section with call-to-action',
        category: 'Layout',
        confidence: 95,
        reason: 'Essential for any website to grab visitor attention',
        tags: ['hero', 'cta', 'header'],
        benefits: ['High conversion rate', 'Brand showcase', 'Clear value proposition']
      },
      {
        id: 'navigation',
        name: 'Navigation Menu',
        description: 'Responsive navigation with dropdown support',
        category: 'Navigation',
        confidence: 90,
        reason: 'Required for website usability and navigation',
        tags: ['navigation', 'menu', 'header'],
        benefits: ['Better UX', 'Easy navigation', 'Mobile-friendly']
      },
      {
        id: 'contact-form',
        name: 'Contact Form',
        description: 'Professional contact form with validation',
        category: 'Forms',
        confidence: 85,
        reason: 'Important for lead generation and user engagement',
        tags: ['form', 'contact', 'leads'],
        benefits: ['Lead capture', 'User engagement', 'Professional appearance']
      }
    ]
    setSuggestions(initialSuggestions)
  }

  const generateSuggestions = async (query: string): Promise<SuggestedComponent[]> => {
    // Mock AI-powered suggestion generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const mockSuggestions: SuggestedComponent[] = [
      {
        id: 'pricing-table',
        name: 'Pricing Table',
        description: 'Clean pricing comparison table with features',
        category: 'Content',
        confidence: 88,
        reason: 'Based on your query about pricing pages',
        tags: ['pricing', 'table', 'plans'],
        benefits: ['Clear pricing display', 'Feature comparison', 'Higher conversions']
      },
      {
        id: 'testimonial-slider',
        name: 'Testimonial Slider',
        description: 'Customer testimonials with photo and ratings',
        category: 'Content',
        confidence: 82,
        reason: 'Complements pricing with social proof',
        tags: ['testimonials', 'reviews', 'slider'],
        benefits: ['Social proof', 'Trust building', 'Customer validation']
      },
      {
        id: 'faq-section',
        name: 'FAQ Section',
        description: 'Expandable frequently asked questions',
        category: 'Interactive',
        confidence: 75,
        reason: 'Helps reduce support tickets and build confidence',
        tags: ['faq', 'questions', 'accordion'],
        benefits: ['Reduce support', 'Build trust', 'Better UX']
      }
    ]
    
    return mockSuggestions
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const aiSuggestions = await generateSuggestions(input)
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Based on your request, here are some components that would work great for your project:`,
        timestamp: new Date(),
        components: aiSuggestions
      }

      setMessages(prev => [...prev, assistantMessage])
      setSuggestions(aiSuggestions)
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error generating suggestions. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSuggestion = (suggestionId: string) => {
    setSelectedSuggestions(prev => 
      prev.includes(suggestionId)
        ? prev.filter(id => id !== suggestionId)
        : [...prev, suggestionId]
    )
  }

  const handleAddSelected = () => {
    const selectedComponents = suggestions.filter(c => selectedSuggestions.includes(c.id))
    onSelect?.(selectedComponents)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-500 bg-green-500/10'
    if (confidence >= 80) return 'text-yellow-500 bg-yellow-500/10'
    return 'text-orange-500 bg-orange-500/10'
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
      <div className="bg-background border rounded-lg shadow-lg w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-brand-500/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-brand-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">AI Component Assistant</h2>
              <p className="text-muted-foreground">
                Get intelligent component recommendations for your project
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {selectedSuggestions.length > 0 && (
              <Badge variant="outline" className="flex items-center space-x-1">
                <Heart className="h-3 w-3" />
                <span>{selectedSuggestions.length} selected</span>
              </Badge>
            )}
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ✕
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((message) => (
                <div key={message.id} className={cn(
                  'flex',
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                )}>
                  <div className={cn(
                    'max-w-[80%] rounded-lg p-4',
                    message.type === 'user' 
                      ? 'bg-brand-500 text-white' 
                      : 'bg-muted'
                  )}>
                    <div className="flex items-start space-x-2">
                      {message.type === 'assistant' && (
                        <Sparkles className="h-5 w-5 text-brand-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm">{message.content}</p>
                        <span className="text-xs opacity-70 mt-1 block">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    
                    {/* Suggested Components */}
                    {message.components && message.components.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {message.components.map((component) => {
                          const isSelected = selectedSuggestions.includes(component.id)
                          const CategoryIcon = getCategoryIcon(component.category)
                          
                          return (
                            <Card 
                              key={component.id}
                              className={cn(
                                'cursor-pointer transition-all',
                                isSelected && 'ring-2 ring-brand-500 bg-brand-500/5'
                              )}
                              onClick={() => toggleSuggestion(component.id)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start space-x-3">
                                  <div className="h-10 w-10 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                                    <CategoryIcon className="h-5 w-5 text-brand-500" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <h3 className="font-medium">{component.name}</h3>
                                      <Badge variant="outline" className={cn('text-xs', getConfidenceColor(component.confidence))}>
                                        {component.confidence}%
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {component.description}
                                    </p>
                                    <div className="flex items-center space-x-2 mt-2">
                                      <Badge variant="secondary" className="text-xs">
                                        {component.category}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {component.reason}
                                      </Badge>
                                    </div>
                                    <div className="mt-2">
                                      <div className="flex flex-wrap gap-1">
                                        {component.tags.map(tag => (
                                          <Badge key={tag} variant="outline" className="text-xs">
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="mt-2">
                                      <p className="text-xs text-muted-foreground">
                                        <strong>Benefits:</strong> {component.benefits.join(', ')}
                                      </p>
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <Star className="h-5 w-5 text-brand-500 fill-current flex-shrink-0" />
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-4 max-w-[80%]">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin h-4 w-4 border-2 border-brand-500 border-t-transparent rounded-full"></div>
                      <span className="text-sm">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t flex-shrink-0">
              <div className="flex items-center space-x-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me about components you need..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSend} 
                  disabled={isLoading || !input.trim()}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2 mt-3">
                <Button variant="outline" size="sm" onClick={loadInitialSuggestions}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Suggestions
                </Button>
                <Button variant="outline" size="sm">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Quick Start Guide
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar with Quick Actions */}
          <div className="w-80 border-l bg-muted/30 flex flex-col">
            <div className="p-6 border-b">
              <h3 className="font-semibold mb-3">Quick Suggestions</h3>
              <div className="space-y-2">
                {[
                  { icon: Target, label: 'Landing Page', query: 'Show me components for a landing page' },
                  { icon: Package, label: 'E-commerce', query: 'What components do I need for an online store?' },
                  { icon: Grid3X3, label: 'Blog', query: 'Components for a blog website' },
                  { icon: Puzzle, label: 'Dashboard', query: 'Dashboard UI components' }
                ].map((item) => (
                  <Button
                    key={item.label}
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={() => setInput(item.query)}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
            
            {selectedSuggestions.length > 0 && (
              <div className="p-6 border-b">
                <h3 className="font-semibold mb-3">Selected Components</h3>
                <div className="space-y-2">
                  {suggestions
                    .filter(c => selectedSuggestions.includes(c.id))
                    .map(component => (
                      <div key={component.id} className="flex items-center justify-between p-2 bg-background rounded-lg">
                        <span className="text-sm font-medium truncate">{component.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSuggestion(component.id)}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            )}
            
            <div className="mt-auto p-6">
              <Button 
                onClick={handleAddSelected} 
                disabled={selectedSuggestions.length === 0}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Add {selectedSuggestions.length} Component{selectedSuggestions.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
