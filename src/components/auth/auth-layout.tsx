'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Shield, Zap, Users, CheckCircle } from 'lucide-react'

interface AuthLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  showBackButton?: boolean
  showFeatures?: boolean
  backgroundImage?: string
  className?: string
}

const FEATURES = [
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your data is protected with enterprise-grade security'
  },
  {
    icon: Zap,
    title: 'Fast & Reliable',
    description: 'Lightning-fast performance with 99.9% uptime'
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Work together seamlessly with your team'
  },
  {
    icon: CheckCircle,
    title: 'Easy to Use',
    description: 'Intuitive interface designed for productivity'
  }
]

export function AuthLayout({
  children,
  title,
  description,
  showBackButton = true,
  showFeatures = false,
  backgroundImage,
  className = ''
}: AuthLayoutProps) {
  const router = useRouter()

  return (
    <div className={`min-h-screen flex ${className}`}>
      {/* Background Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {backgroundImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/70" />
        )}
        
        <div className="relative flex flex-col justify-center px-12 text-white">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight">
                Welcome to Our Platform
              </h1>
              <p className="text-xl text-primary-foreground/90 leading-relaxed">
                Join thousands of users who trust us to power their workflows
                and achieve their goals.
              </p>
            </div>

            {showFeatures && (
              <div className="space-y-6 pt-8">
                {FEATURES.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                        <feature.icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">{feature.title}</h3>
                      <p className="text-primary-foreground/80">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Trust indicators */}
            <div className="flex items-center space-x-8 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-sm text-primary-foreground/80">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">99.9%</div>
                <div className="text-sm text-primary-foreground/80">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm text-primary-foreground/80">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Header */}
          <div className="space-y-2 text-center lg:text-left">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}

            {title && (
              <h2 className="text-3xl font-bold tracking-tight">
                {title}
              </h2>
            )}
            
            {description && (
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="mt-8">
            {children}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-muted-foreground">
            <p>
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
      </div>

      {/* Mobile Features Section */}
      {showFeatures && (
        <div className="lg:hidden border-t bg-muted/30 px-4 py-8">
          <div className="mx-auto max-w-sm">
            <h3 className="text-lg font-semibold text-center mb-6">
              Why Choose Us?
            </h3>
            <div className="space-y-4">
              {FEATURES.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <feature.icon className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">{feature.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {feature.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Specialized layout for sign in/up pages
export function AuthPageLayout({
  children,
  type = 'signin'
}: {
  children: React.ReactNode
  type?: 'signin' | 'signup'
}) {
  const title = type === 'signin' ? 'Welcome back' : 'Create your account'
  const description = type === 'signin' 
    ? 'Sign in to your account to continue'
    : 'Join us and get started in minutes'

  return (
    <AuthLayout
      title={title}
      description={description}
      showFeatures={true}
      className="bg-gradient-to-br from-background to-muted/20"
    >
      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          {children}
        </CardContent>
      </Card>
    </AuthLayout>
  )
}

// Layout for verification pages
export function VerificationLayout({
  children,
  type = 'email'
}: {
  children: React.ReactNode
  type?: 'email' | 'phone' | '2fa'
}) {
  const titles = {
    email: 'Verify your email',
    phone: 'Verify your phone',
    '2fa': 'Two-factor authentication'
  }

  const descriptions = {
    email: 'We\'ve sent a verification link to your email address',
    phone: 'We\'ve sent a verification code to your phone',
    '2fa': 'Enter your authentication code to continue'
  }

  return (
    <AuthLayout
      title={titles[type]}
      description={descriptions[type]}
      showBackButton={true}
      showFeatures={false}
      className="bg-gradient-to-br from-background to-muted/20"
    >
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8">
          {children}
        </CardContent>
      </Card>
    </AuthLayout>
  )
}

// Loading layout
export function AuthLoadingLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">
            Loading...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Error layout
export function AuthErrorLayout({
  title = 'Something went wrong',
  description = 'We encountered an error while processing your request',
  action,
  showBackButton = true
}: {
  title?: string
  description?: string
  action?: React.ReactNode
  showBackButton?: boolean
}) {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            {showBackButton && (
              <Button variant="outline" onClick={() => router.back()}>
                Go Back
              </Button>
            )}
            <Button onClick={() => router.push('/')}>
              Go Home
            </Button>
          </div>

          {action}
        </CardContent>
      </Card>
    </div>
  )
}

export default AuthLayout
