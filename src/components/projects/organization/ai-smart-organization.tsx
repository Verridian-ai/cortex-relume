'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { 
  Sparkles, 
  Folder, 
  Tag, 
  Hash, 
  Check, 
  X, 
  Lightbulb,
  Brain,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  AISmartOrganization,
  AISuggestion,
  Project
} from '@/lib/projects/organization'

interface AISmartOrganizationProps {
  projects: Project[]
  onSuggestionApply?: (suggestion: AISuggestion, projectIds: string[]) => void
  onProjectsUpdate?: () => void
  className?: string
}

export function AISmartOrganizationComponent({
  projects,
  onSuggestionApply,
  onProjectsUpdate,
  className
}: AISmartOrganizationProps) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedSuggestions, setExpandedSuggestions] = useState<Set<string>>(new Set())
  const [isAnalyzeDialogOpen, setIsAnalyzeDialogOpen] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    if (projects.length > 0) {
      generateSuggestions()
    }
  }, [projects])

  const generateSuggestions = async () => {
    try {
      setLoading(true)
      const newSuggestions = await AISmartOrganization.suggestOrganization(projects)
      setSuggestions(newSuggestions)
    } catch (error) {
      console.error('Failed to generate AI suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestionApply = async (suggestion: AISuggestion) => {
    try {
      await AISmartOrganization.applySuggestion(suggestion, projects.map(p => p.id), '')
      onSuggestionApply?.(suggestion, projects.map(p => p.id))
      onProjectsUpdate?.()
      
      // Remove applied suggestion
      setSuggestions(prev => prev.filter(s => s !== suggestion))
    } catch (error) {
      console.error('Failed to apply suggestion:', error)
      alert('Failed to apply suggestion. Please try again.')
    }
  }

  const handleAnalyzeNow = async () => {
    setAnalyzing(true)
    try {
      // Custom AI analysis could be implemented here
      // For now, just regenerate suggestions
      await generateSuggestions()
      setIsAnalyzeDialogOpen(false)
      setCustomPrompt('')
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  const toggleSuggestionExpanded = (suggestionId: string) => {
    const newExpanded = new Set(expandedSuggestions)
    if (newExpanded.has(suggestionId)) {
      newExpanded.delete(suggestionId)
    } else {
      newExpanded.add(suggestionId)
    }
    setExpandedSuggestions(newExpanded)
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'folder': return Folder
      case 'tag': return Hash
      case 'category': return Tag
      case 'organization': return Sparkles
      default: return Lightbulb
    }
  }

  const getSuggestionColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50 border-green-200'
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-blue-600 bg-blue-50 border-blue-200'
  }

  if (projects.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>AI Smart Organization</span>
          </CardTitle>
          <CardDescription>
            Create some projects first to get AI-powered organization suggestions.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <>
      <Card className={cn('space-y-4', className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-500" />
                <span>AI Smart Organization</span>
              </CardTitle>
              <CardDescription>
                Get AI-powered suggestions to organize your projects better
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAnalyzeDialogOpen(true)}
              disabled={loading}
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <Sparkles className="h-4 w-4 mr-1" />
              )}
              Analyze
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse p-4 border rounded-lg">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground mb-4">
                {suggestions.length} suggestion{suggestions.length === 1 ? '' : 's'} found
              </div>
              
              {suggestions.map((suggestion, index) => {
                const SuggestionIcon = getSuggestionIcon(suggestion.type)
                const isExpanded = expandedSuggestions.has(suggestion.type + index)
                
                return (
                  <Collapsible key={`${suggestion.type}-${index}`}>
                    <CollapsibleTrigger
                      className="w-full"
                      onClick={() => toggleSuggestionExpanded(suggestion.type + index)}
                    >
                      <div className={cn(
                        'flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors',
                        getSuggestionColor(suggestion.confidence)
                      )}>
                        <SuggestionIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        
                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{suggestion.title}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className="text-xs">
                                {Math.round(suggestion.confidence * 100)}%
                              </Badge>
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {suggestion.description}
                          </p>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="mt-2">
                      <div className="ml-8 p-3 bg-muted/20 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-3">
                          {suggestion.data.reason}
                        </p>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleSuggestionApply(suggestion)}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Apply
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSuggestions(prev => prev.filter(s => s !== suggestion))
                            }}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No suggestions yet</h3>
              <p className="text-muted-foreground mb-4">
                Click "Analyze" to generate AI-powered organization suggestions for your projects.
              </p>
              <Button onClick={() => setIsAnalyzeDialogOpen(true)}>
                <Brain className="h-4 w-4 mr-2" />
                Start Analysis
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Analysis Dialog */}
      <Dialog open={isAnalyzeDialogOpen} onOpenChange={setIsAnalyzeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-500" />
              <span>AI Analysis</span>
            </DialogTitle>
            <DialogDescription>
              Analyze your projects to get personalized organization suggestions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="analysis-prompt">Custom Instructions (Optional)</Label>
              <Textarea
                id="analysis-prompt"
                placeholder="e.g., 'Organize projects by their complexity level' or 'Create folders based on project deadlines'"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={3}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Add specific instructions to guide the AI analysis
              </p>
            </div>
            
            <div className="bg-muted/20 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Analysis will consider:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Project naming patterns</li>
                <li>• Project types and statuses</li>
                <li>• Content and descriptions</li>
                <li>• Creation and modification dates</li>
                <li>• Current organization structure</li>
              </ul>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsAnalyzeDialogOpen(false)}
                disabled={analyzing}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAnalyzeNow}
                disabled={analyzing}
              >
                {analyzing ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {analyzing ? 'Analyzing...' : 'Start Analysis'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Component for showing applied suggestions
interface AppliedSuggestionsProps {
  appliedSuggestions: AISuggestion[]
  onUndo?: (index: number) => void
  className?: string
}

export function AppliedSuggestions({ 
  appliedSuggestions, 
  onUndo, 
  className 
}: AppliedSuggestionsProps) {
  if (appliedSuggestions.length === 0) return null

  return (
    <Card className={cn('space-y-4', className)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Check className="h-5 w-5 text-green-500" />
          <span>Applied Suggestions</span>
        </CardTitle>
        <CardDescription>
          AI suggestions that have been applied to your organization
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {appliedSuggestions.map((suggestion, index) => {
          const SuggestionIcon = getSuggestionIcon(suggestion.type)
          
          return (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <SuggestionIcon className="h-4 w-4 text-green-600" />
                <div>
                  <div className="font-medium text-sm">{suggestion.title}</div>
                  <div className="text-xs text-green-600">
                    {suggestion.data.reason}
                  </div>
                </div>
              </div>
              
              {onUndo && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onUndo(index)}
                  className="text-green-600 hover:text-green-700"
                >
                  Undo
                </Button>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

// Helper function to get suggestion icon (duplicated for the component)
function getSuggestionIcon(type: string) {
  switch (type) {
    case 'folder': return Folder
    case 'tag': return Hash
    case 'category': return Tag
    case 'organization': return Sparkles
    default: return Lightbulb
  }
}