'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, 
  TreePine, 
  Layout, 
  Palette, 
  CheckCircle, 
  Circle,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type BuilderStep = 'prompt' | 'sitemap' | 'wireframe' | 'style-guide' | 'complete'

interface BuilderNavProps {
  currentStep: BuilderStep
  onStepChange?: (step: BuilderStep) => void
  className?: string
}

const STEPS = [
  {
    id: 'prompt' as BuilderStep,
    title: 'Prompt',
    description: 'Describe your vision',
    icon: Sparkles,
  },
  {
    id: 'sitemap' as BuilderStep,
    title: 'Sitemap',
    description: 'Structure & pages',
    icon: TreePine,
  },
  {
    id: 'wireframe' as BuilderStep,
    title: 'Wireframe',
    description: 'Layout & design',
    icon: Layout,
  },
  {
    id: 'style-guide' as BuilderStep,
    title: 'Style Guide',
    description: 'Design system',
    icon: Palette,
  },
  {
    id: 'complete' as BuilderStep,
    title: 'Complete',
    description: 'Ready to build',
    icon: CheckCircle,
  },
] as const

export function BuilderNav({ currentStep, onStepChange, className }: BuilderNavProps) {
  const currentIndex = STEPS.findIndex(step => step.id === currentStep)
  const completedSteps = Math.max(0, currentIndex)
  
  return (
    <div className={cn('w-full', className)}>
      {/* Progress Bar */}
      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            const isActive = step.id === currentStep
            const isCompleted = index < currentIndex
            const isAccessible = index <= currentIndex + 1 // Allow going back one step
            
            return (
              <div key={step.id} className="flex flex-col items-center group">
                <button
                  onClick={() => onStepChange?.(step.id)}
                  disabled={!isAccessible}
                  className={cn(
                    'relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200',
                    isActive && 'border-brand-500 bg-brand-500 text-white shadow-lg scale-110',
                    isCompleted && 'border-green-500 bg-green-500 text-white',
                    !isActive && !isCompleted && 'border-muted-foreground/30 bg-background text-muted-foreground',
                    isAccessible && !isActive && 'hover:border-brand-400 hover:text-brand-500 cursor-pointer',
                    !isAccessible && 'cursor-not-allowed opacity-50'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className={cn(
                      'w-5 h-5 transition-transform duration-200',
                      isActive && 'scale-110'
                    )} />
                  )}
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -inset-1 border-2 border-brand-500 rounded-full animate-pulse" />
                  )}
                </button>
                
                {/* Step Info */}
                <div className="mt-3 text-center min-w-0">
                  <div className={cn(
                    'text-sm font-medium transition-colors',
                    isActive && 'text-brand-500',
                    isCompleted && 'text-green-500',
                    !isActive && !isCompleted && 'text-muted-foreground'
                  )}>
                    {step.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </div>
                </div>

                {/* Progress Badge */}
                {isActive && (
                  <Badge variant="ai" className="mt-2 text-xs">
                    Step {index + 1}
                  </Badge>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Labels - Mobile View */}
      <div className="flex md:hidden justify-between text-xs text-muted-foreground mb-4">
        <span>Step {currentIndex + 1} of {STEPS.length}</span>
        <span>{Math.round((currentIndex / (STEPS.length - 1)) * 100)}% complete</span>
      </div>

      {/* Progress Indicators - Desktop */}
      <div className="hidden md:flex justify-center space-x-2">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex
          return (
            <div
              key={step.id}
              className={cn(
                'h-1 rounded-full transition-all duration-300',
                isCompleted ? 'bg-green-500' : index === currentIndex ? 'bg-brand-500 w-8' : 'bg-muted w-4'
              )}
            />
          )
        })}
      </div>

      {/* Current Step Details */}
      <div className="mt-6 text-center">
        <h3 className="text-lg font-semibold mb-2">
          {STEPS[currentIndex]?.title} 
          {currentIndex < STEPS.length - 1 && (
            <span className="text-muted-foreground font-normal">
              {' → '}{STEPS[currentIndex + 1]?.title}
            </span>
          )}
        </h3>
        <p className="text-sm text-muted-foreground">
          {STEPS[currentIndex]?.description}
        </p>
        
        {currentIndex < STEPS.length - 1 && (
          <div className="flex items-center justify-center mt-3 text-sm text-brand-500">
            <span>Next: {STEPS[currentIndex + 1]?.title}</span>
            <ArrowRight className="w-3 h-3 ml-1" />
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center gap-2 mt-6">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex
          const isActive = step.id === currentStep
          
          if (!isActive && !isCompleted && index !== currentIndex + 1) {
            return null
          }
          
          return (
            <Badge
              key={step.id}
              variant={isActive ? 'ai' : isCompleted ? 'success' : 'outline'}
              className="cursor-pointer"
              onClick={() => onStepChange?.(step.id)}
            >
              {step.title}
            </Badge>
          )
        })}
      </div>
    </div>
  )
}