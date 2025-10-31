// Enhanced Auth System - Component Exports
export { LoginForm } from './login-form'
export { SignupForm } from './signup-form'
export { SocialAuthButtons, SocialAuthButton } from './social-auth-buttons'
export { AuthModal, AuthDialog, useAuthModal, AuthButton } from './auth-modal'
export { AuthLayout, AuthPageLayout, VerificationLayout, AuthLoadingLayout, AuthErrorLayout } from './auth-layout'

// Re-export from existing components (for backward compatibility)
export { AuthGuard } from '../auth-guard'
export { AuthProvider, useAuth } from '../auth-provider'

// Main auth context
export { 
  EnhancedAuthProvider, 
  useEnhancedAuth 
} from '@/lib/auth/auth-context'

// Auth utilities and helpers
export {
  createEnhancedAuthClient,
  EnhancedAuthClient,
  type AuthState,
  type SignInOptions,
  type SignUpOptions,
  type UpdateProfileOptions,
  type TwoFASetup
} from '@/lib/auth/auth-client'

export {
  SOCIAL_PROVIDERS,
  getSocialAuthConfig,
  getProviderConfig,
  isProviderEnabled,
  getEnabledProviders,
  getAuthUrl,
  getCallbackUrl,
  generateState,
  generateCodeVerifier,
  generateCodeChallenge,
  getProviderIcon,
  getProviderColor,
  validateProviderConfig,
  validateAllProviderConfigs
} from '@/lib/auth/social-providers'

export {
  createSessionManager,
  SessionManager,
  type SessionInfo,
  type SessionValidationResult,
  type RefreshTokenResult,
  formatTimeRemaining,
  formatLastActivity
} from '@/lib/auth/session-manager'

export {
  createAuthMiddleware,
  AuthMiddleware,
  type AuthRequirement,
  type MiddlewareContext,
  type RouteRule,
  getUserRole,
  getUserSubscription,
  hasPermission,
  hasAnyRole,
  hasAnySubscription
} from '@/lib/auth/auth-middleware'

// User management exports
export {
  createProfileManager,
  ProfileManager,
  type UserProfile,
  type CreateProfileData,
  type UpdateProfileData,
  type ProfileSearchOptions,
  type ProfileStats,
  formatProfileCompletion,
  getProfileCompletenessColor,
  validateProfileData
} from '@/lib/user/profile-manager'

export {
  createUserPreferencesManager,
  UserPreferencesManager,
  type UserPreferences,
  type CreatePreferencesData,
  type UpdatePreferencesData,
  type PreferencesTemplate,
  getThemePreference,
  isDarkModePreferred,
  getNotificationIconCount,
  getAccessibilityScore
} from '@/lib/user/user-preferences'

export {
  createUserVerificationManager,
  UserVerificationManager,
  type UserVerification,
  type VerificationRequest,
  type VerificationResult,
  type VerificationStats,
  getVerificationScoreLevel,
  getVerificationStatusColor,
  formatVerificationStatus,
  calculateOverallVerificationLevel
} from '@/lib/user/user-verification'

export {
  createUserSecurityManager,
  UserSecurityManager,
  type UserSecurity,
  type SecurityEvent,
  type SecurityAlert,
  type SecurityConfig,
  getSecurityLevel,
  formatSecurityLevel,
  getSecurityLevelColor
} from '@/lib/user/user-security'

// Database types
export type { Database } from '@/types/database'
export type { Tables, Profile } from '@/lib/supabase/client'
