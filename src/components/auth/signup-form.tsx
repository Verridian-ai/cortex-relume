'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Mail, Lock, Eye, EyeOff, AlertCircle, User, Building, MapPin } from 'lucide-react'
import { useEnhancedAuth } from '@/lib/auth/auth-context'
import { SocialAuthButtons } from './social-auth-buttons'
import { useRouter, useSearchParams } from 'next/navigation'

interface SignupFormProps {
  redirectTo?: string
  showSocialAuth?: boolean
  requireEmailVerification?: boolean
  enableOnboarding?: boolean
  className?: string
}

interface FormData {
  email: string
  password: string
  confirmPassword: string
  fullName: string
  company?: string
  jobTitle?: string
  location?: string
  bio?: string
  agreedToTerms: boolean
  subscribedToNewsletter: boolean
}

export function SignupForm({
  redirectTo = '/onboarding',
  showSocialAuth = true,
  requireEmailVerification = true,
  enableOnboarding = true,
  className = ''
}: SignupFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    company: '',
    jobTitle: '',
    location: '',
    bio: '',
    agreedToTerms: false,
    subscribedToNewsletter: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { signUp, authError, clearError } = useEnhancedAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get redirect URL from query params
  const queryRedirect = searchParams?.get('redirect')
  const finalRedirect = queryRedirect || redirectTo

  // Clear errors when component mounts or inputs change
  useEffect(() => {
    clearError()
    setError(null)
  }, [formData.email, formData.password, clearError])

  // Validation functions
  const validateStep1 = useCallback(() => {
    if (!formData.email) {
      setError('Email is required')
      return false
    }
    
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address')
      return false
    }
    
    if (!formData.password) {
      setError('Password is required')
      return false
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return false
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    
    if (!formData.agreedToTerms) {
      setError('You must agree to the terms and conditions')
      return false
    }
    
    return true
  }, [formData])

  const validateStep2 = useCallback(() => {
    if (!formData.fullName) {
      setError('Full name is required')
      return false
    }
    
    if (formData.fullName.trim().length < 2) {
      setError('Full name must be at least 2 characters long')
      return false
    }
    
    return true
  }, [formData])

  // Handle step navigation
  const handleNextStep = useCallback(() => {
    setError(null)
    
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3)
    }
  }, [currentStep, validateStep1, validateStep2])

  const handlePrevStep = useCallback(() => {
    setError(null)
    setCurrentStep(Math.max(1, currentStep - 1))
  }, [currentStep])

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!validateStep2()) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { user, session, error: signUpError } = await signUp({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        options: {
          emailRedirectTo: requireEmailVerification ? `${window.location.origin}/auth/verify-email` : undefined,
          data: {
            full_name: formData.fullName.trim(),
            company: formData.company?.trim() || null,
            job_title: formData.jobTitle?.trim() || null,
            location: formData.location?.trim() || null,
            bio: formData.bio?.trim() || null,
            newsletter_subscribed: formData.subscribedToNewsletter,
            onboarding_completed: !enableOnboarding
          }
        }
      })

      if (signUpError) {
        setError(signUpError.message || 'Failed to create account')
        return
      }

      if (user) {
        if (requireEmailVerification) {
          router.push('/auth/verify-email')
        } else if (enableOnboarding) {
          router.push('/onboarding')
        } else {
          router.push(finalRedirect)
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [formData, signUp, requireEmailVerification, enableOnboarding, router, finalRedirect, validateStep2])

  // Handle input changes
  const handleInputChange = useCallback((field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null) // Clear error when user starts typing
  }, [error])

  // Handle successful social auth callback
  const handleSocialAuthSuccess = useCallback(() => {
    if (enableOnboarding) {
      router.push('/onboarding')
    } else {
      router.push(finalRedirect)
    }
  }, [router, enableOnboarding, finalRedirect])

  // Handle social auth error
  const handleSocialAuthError = useCallback((errorMessage: string) => {
    setError(errorMessage)
  }, [])

  const isLastStep = currentStep === 3
  const isFirstStep = currentStep === 1

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Create your account</CardTitle>
        <CardDescription className="text-center">
          {enableOnboarding ? 'Join us and get started in minutes' : 'Sign up to get started'}
        </CardDescription>
        
        {/* Progress indicator */}
        {enableOnboarding && (
          <div className="flex justify-center space-x-2 pt-4">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-2 w-8 rounded-full ${
                  step <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Error Alert */}
        {(error || authError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || authError}
            </AlertDescription>
          </Alert>
        )}

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-10 pr-10"
                  disabled={isLoading}
                  autoComplete="new-password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters long
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="pl-10 pr-10"
                  disabled={isLoading}
                  autoComplete="new-password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreedToTerms}
                  onCheckedChange={(checked) => handleInputChange('agreedToTerms', checked as boolean)}
                />
                <Label
                  htmlFor="terms"
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the{' '}
                  <Button variant="link" className="p-0 h-auto text-sm" type="button">
                    Terms of Service
                  </Button>{' '}
                  and{' '}
                  <Button variant="link" className="p-0 h-auto text-sm" type="button">
                    Privacy Policy
                  </Button>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="newsletter"
                  checked={formData.subscribedToNewsletter}
                  onCheckedChange={(checked) => handleInputChange('subscribedToNewsletter', checked as boolean)}
                />
                <Label
                  htmlFor="newsletter"
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Subscribe to our newsletter for updates and tips
                </Label>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Profile Information */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company (optional)</Label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="company"
                  type="text"
                  placeholder="Your company name"
                  value={formData.company || ''}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  autoComplete="organization"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job title (optional)</Label>
              <Input
                id="jobTitle"
                type="text"
                placeholder="Your job title"
                value={formData.jobTitle || ''}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                disabled={isLoading}
                autoComplete="organization-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location (optional)</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  type="text"
                  placeholder="City, Country"
                  value={formData.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  autoComplete="address-level2"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio (optional)</Label>
              <Textarea
                id="bio"
                placeholder="Tell us a bit about yourself"
                value={formData.bio || ''}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                disabled={isLoading}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                This will help others understand who you are
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Social Authentication */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Almost done!</h3>
              <p className="text-sm text-muted-foreground">
                You can create your account with email or sign up with a social provider
              </p>
            </div>

            {showSocialAuth && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Sign up with
                    </span>
                  </div>
                </div>

                <SocialAuthButtons
                  onSuccess={handleSocialAuthSuccess}
                  onError={handleSocialAuthError}
                  disabled={isLoading}
                  providers={['google', 'github', 'discord', 'linkedin']}
                />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between space-x-2">
          {!isFirstStep && (
            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={isLoading}
            >
              Previous
            </Button>
          )}
          
          {isLastStep ? (
            <Button
              onClick={handleSubmit}
              className={isFirstStep ? 'w-full' : ''}
              disabled={isLoading || !formData.fullName}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNextStep}
              className={isFirstStep ? 'w-full' : ''}
              disabled={isLoading}
            >
              Next
            </Button>
          )}
        </div>

        {/* Sign in link */}
        <div className="text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Button
            variant="link"
            className="p-0 font-normal text-sm"
            onClick={() => router.push(`/auth/signin${finalRedirect ? `?redirect=${encodeURIComponent(finalRedirect)}` : ''}`)}
          >
            Sign in
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default SignupForm
