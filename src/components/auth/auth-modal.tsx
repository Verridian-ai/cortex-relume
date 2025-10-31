'use client'

import React, { useState, useCallback, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoginForm } from './login-form'
import { SignupForm } from './signup-form'
import { Loader2 } from 'lucide-react'
import { useEnhancedAuth } from '@/lib/auth/auth-context'

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: 'signin' | 'signup'
  redirectTo?: string
  onSuccess?: () => void
  onCancel?: () => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function AuthModal({
  open,
  onOpenChange,
  defaultTab = 'signin',
  redirectTo,
  onSuccess,
  onCancel,
  size = 'md',
  className = ''
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [isLoading, setIsLoading] = useState(false)
  
  const { user, loading } = useEnhancedAuth()

  // Handle successful authentication
  const handleAuthSuccess = useCallback(() => {
    setIsLoading(true)
    
    // Give a brief moment for the UI to update
    setTimeout(() => {
      onOpenChange(false)
      onSuccess?.()
      setIsLoading(false)
    }, 500)
  }, [onOpenChange, onSuccess])

  // Handle modal close
  const handleClose = useCallback(() => {
    if (isLoading) return
    onOpenChange(false)
    onCancel?.()
  }, [onOpenChange, onCancel, isLoading])

  // Switch tabs
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as 'signin' | 'signup')
  }, [])

  // Close modal on successful authentication
  useEffect(() => {
    if (user && open) {
      handleAuthSuccess()
    }
  }, [user, open, handleAuthSuccess])

  // Update default tab when modal opens
  useEffect(() => {
    if (open && defaultTab !== activeTab) {
      setActiveTab(defaultTab)
    }
  }, [open, defaultTab, activeTab])

  // Prevent closing when loading
  const handleInteractOutside = useCallback((event: Event) => {
    if (isLoading) {
      event.preventDefault()
    }
  }, [isLoading])

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-sm'
      case 'lg':
        return 'max-w-lg'
      default:
        return 'max-w-md'
    }
  }

  // Don't render if user is already authenticated
  if (user) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className={`${getSizeClasses()} ${className}`}
        onInteractOutside={handleInteractOutside}
      >
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-2xl font-bold text-center sr-only">
            {activeTab === 'signin' ? 'Sign In' : 'Create Account'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {activeTab === 'signin' 
              ? 'Sign in to your existing account' 
              : 'Create a new account to get started'
            }
          </DialogDescription>
        </DialogHeader>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-md">
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Completing sign in...</p>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4 mt-4">
            <LoginForm
              redirectTo={redirectTo}
              showSocialAuth={true}
              showForgotPassword={true}
              showRememberMe={true}
              className="border-0 shadow-none p-0"
            />
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 mt-4">
            <SignupForm
              redirectTo={redirectTo}
              showSocialAuth={true}
              requireEmailVerification={true}
              enableOnboarding={true}
              className="border-0 shadow-none p-0"
            />
          </TabsContent>
        </Tabs>

        {/* Footer with additional actions */}
        <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
          <Button
            variant="link"
            className="h-auto p-0 text-xs"
            onClick={() => {/* Handle forgot password */}}
            disabled={isLoading}
          >
            Forgot password?
          </Button>
          <span>•</span>
          <Button
            variant="link"
            className="h-auto p-0 text-xs"
            onClick={() => {/* Handle need help */}}
            disabled={isLoading}
          >
            Need help?
          </Button>
          <span>•</span>
          <Button
            variant="link"
            className="h-auto p-0 text-xs"
            onClick={() => {/* Handle privacy policy */}}
            disabled={isLoading}
          >
            Privacy Policy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Simplified version for trigger-based auth
export function AuthDialog({
  trigger,
  open,
  onOpenChange,
  ...props
}: AuthModalProps & {
  trigger?: React.ReactNode
}) {
  const handleTriggerClick = useCallback(() => {
    onOpenChange(true)
  }, [onOpenChange])

  return (
    <>
      {trigger && (
        <div onClick={handleTriggerClick}>
          {trigger}
        </div>
      )}
      <AuthModal
        open={open}
        onOpenChange={onOpenChange}
        {...props}
      />
    </>
  )
}

// Hook for easy modal management
export function useAuthModal() {
  const [open, setOpen] = useState(false)

  const openModal = useCallback((tab?: 'signin' | 'signup', redirectTo?: string) => {
    // You could store these in state if needed
    setOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setOpen(false)
  }, [])

  return {
    open,
    setOpen,
    openModal,
    closeModal
  }
}

// Auth button that opens modal
export function AuthButton({
  children = 'Sign In',
  variant = 'default',
  size = 'default',
  redirectTo,
  ...props
}: {
  children?: React.ReactNode
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg'
  redirectTo?: string
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen } = useAuthModal()

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
        {...props}
      >
        {children}
      </Button>
      <AuthModal
        open={open}
        onOpenChange={setOpen}
        redirectTo={redirectTo}
      />
    </>
  )
}

export default AuthModal
