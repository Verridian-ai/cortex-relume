// Onboarding Components
export { default as OnboardingModal } from './onboarding-modal';
export { WelcomeStep } from './welcome-step';
export { ProfileStep } from './profile-step';
export { PreferencesStep } from './preferences-step';
export { FeaturesStep } from './features-step';
export { CompletionStep } from './completion-step';

// Onboarding Types and Utilities
export type { OnboardingStep, UserProfile, OnboardingData } from '@/lib/onboarding/onboarding-state';
export { 
  getOnboardingFlow,
  getStepById,
  getNextStep,
  getPreviousStep,
  getStepProgress,
  validateStepCompletion,
  getOnboardingAnalytics
} from '@/lib/onboarding/onboarding-flow';
export { useOnboardingStore } from '@/lib/onboarding/onboarding-state';

// Re-export from lib for convenience
export { WelcomeScreen } from '@/lib/onboarding/welcome-screen';
export { ProfileSetup } from '@/lib/onboarding/profile-setup';
export { FeatureTour } from '@/lib/onboarding/feature-tour';
