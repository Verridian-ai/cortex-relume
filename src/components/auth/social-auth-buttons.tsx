'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'
import { useEnhancedAuth } from '@/lib/auth/auth-context'
import { getEnabledProviders, SocialProvider, getProviderConfig } from '@/lib/auth/social-providers'

interface SocialAuthButtonsProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  disabled?: boolean
  providers?: SocialProvider[]
  variant?: 'default' | 'outline' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
  showLabels?: boolean
  className?: string
}

interface ProviderInfo {
  name: string
  icon: string
  color: string
  hoverColor: string
}

const PROVIDER_INFO: Record<SocialProvider, ProviderInfo> = {
  google: {
    name: 'Google',
    icon: 'M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z',
    color: '#4285F4',
    hoverColor: '#3367d6'
  },
  github: {
    name: 'GitHub',
    icon: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z',
    color: '#333',
    hoverColor: '#24292e'
  },
  discord: {
    name: 'Discord',
    icon: 'M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z',
    color: '#5865F2',
    hoverColor: '#4752c4'
  },
  linkedin: {
    name: 'LinkedIn',
    icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
    color: '#0077B5',
    hoverColor: '#005885'
  }
}

export function SocialAuthButtons({
  onSuccess,
  onError,
  disabled = false,
  providers,
  variant = 'outline',
  size = 'default',
  showLabels = true,
  className = ''
}: SocialAuthButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [availableProviders, setAvailableProviders] = useState<SocialProvider[]>([])
  
  const { signInWithProvider, getEnabledProviders } = useEnhancedAuth()

  // Get available providers on mount
  useEffect(() => {
    const enabledProviders = getEnabledProviders()
    const requestedProviders = providers || enabledProviders
    const available = requestedProviders.filter(provider => {
      const config = getProviderConfig(provider)
      return config && config.clientId
    })
    setAvailableProviders(available)
  }, [providers, getEnabledProviders])

  // Clear error when component mounts or when provider changes
  useEffect(() => {
    setError(null)
  }, [availableProviders])

  const handleProviderAuth = useCallback(async (provider: SocialProvider) => {
    if (disabled || loading) return

    setLoading(provider)
    setError(null)

    try {
      const { error: signInError } = await signInWithProvider(provider)

      if (signInError) {
        const errorMessage = signInError.message || `Failed to sign in with ${provider}`
        setError(errorMessage)
        onError?.(errorMessage)
        return
      }

      // Success will be handled by the auth context
      onSuccess?.()
    } catch (err) {
      const errorMessage = `An unexpected error occurred with ${provider}`
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(null)
    }
  }, [signInWithProvider, onSuccess, onError, disabled, loading])

  if (availableProviders.length === 0) {
    return null
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className={availableProviders.length === 1 ? 'w-full' : 'grid grid-cols-2 gap-2'}>
        {availableProviders.map((provider) => {
          const info = PROVIDER_INFO[provider]
          const isLoading = loading === provider

          return (
            <Button
              key={provider}
              variant={variant}
              size={size}
              onClick={() => handleProviderAuth(provider)}
              disabled={disabled || !!loading}
              className={`relative ${variant === 'default' ? 'text-white' : ''} ${className}`}
              style={
                variant === 'default'
                  ? {
                      backgroundColor: info.color,
                      borderColor: info.color,
                    }
                  : {}
              }
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <div
                  className="mr-2 h-4 w-4"
                  style={{
                    mask: `url("data:image/svg+xml,${encodeURIComponent(
                      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${info.icon}"/></svg>`
                    )}") center/contain no-repeat`,
                    WebkitMask: `url("data:image/svg+xml,${encodeURIComponent(
                      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${info.icon}"/></svg>`
                    )}") center/contain no-repeat`,
                    backgroundColor: 'currentColor',
                  }}
                />
              )}
              
              {showLabels ? info.name : null}
              
              {isLoading && (
                <span className="sr-only">Signing in with {info.name}...</span>
              )}
            </Button>
          )
        })}
      </div>

      {/* Helper text */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          By continuing, you agree to our{' '}
          <Button variant="link" className="p-0 h-auto text-xs">
            Terms of Service
          </Button>{' '}
          and{' '}
          <Button variant="link" className="p-0 h-auto text-xs">
            Privacy Policy
          </Button>
        </p>
      </div>
    </div>
  )
}

// Compact version for use in other components
export function SocialAuthButton({
  provider,
  onClick,
  disabled = false,
  variant = 'outline',
  size = 'sm',
  className = ''
}: {
  provider: SocialProvider
  onClick?: () => void
  disabled?: boolean
  variant?: 'default' | 'outline' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}) {
  const [loading, setLoading] = useState(false)
  const { signInWithProvider } = useEnhancedAuth()
  const info = PROVIDER_INFO[provider]

  const handleClick = useCallback(async () => {
    if (disabled || loading) return

    setLoading(true)
    try {
      await signInWithProvider(provider)
      onClick?.()
    } finally {
      setLoading(false)
    }
  }, [provider, signInWithProvider, onClick, disabled, loading])

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled || loading}
      className={className}
      style={
        variant === 'default'
          ? {
              backgroundColor: info.color,
              borderColor: info.color,
              color: 'white',
            }
          : {}
      }
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <div
          className="h-4 w-4"
          style={{
            mask: `url("data:image/svg+xml,${encodeURIComponent(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${info.icon}"/></svg>`
            )}") center/contain no-repeat`,
            WebkitMask: `url("data:image/svg+xml,${encodeURIComponent(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${info.icon}"/></svg>`
            )}") center/contain no-repeat`,
            backgroundColor: 'currentColor',
          }}
        />
      )}
      <span className="sr-only">Sign in with {info.name}</span>
    </Button>
  )
}

export default SocialAuthButtons
