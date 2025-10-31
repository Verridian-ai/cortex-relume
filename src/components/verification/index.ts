// Verification Components
export { default as VerificationPrompt } from './verification-prompt';
export { default as EmailVerificationComponent } from './email-verification';
export { default as PhoneVerificationComponent } from './phone-verification';
export { default as IdentityVerificationComponent } from './identity-verification';
export { default as VerificationSuccessComponent } from './verification-success';

// Verification Types and Utilities
export type {
  BaseVerification,
  EmailVerification,
  PhoneVerification,
  IdentityVerification,
  VerificationRequirements,
  VerificationSettings,
  VerificationResult
} from '@/lib/verification/verification-status';
export {
  VerificationType,
  VerificationStatus,
  getVerificationTypeLabel,
  getVerificationStatusLabel,
  getVerificationStatusColor,
  isVerificationCompleted,
  isVerificationFailed,
  isVerificationExpired,
  canRetryVerification,
  calculateProgress,
  sortVerificationsByPriority
} from '@/lib/verification/verification-status';

// Verification Services
export { 
  emailVerificationService,
  EmailVerificationService 
} from '@/lib/verification/email-verification';
export { 
  phoneVerificationService,
  PhoneVerificationService 
} from '@/lib/verification/phone-verification';
export { 
  identityVerificationService,
  IdentityVerificationService 
} from '@/lib/verification/identity-verification';

// Verification Utilities
export {
  generateVerificationRequirements,
  createVerificationSettings,
  getVerificationPrompt,
  validateVerificationData,
  getVerificationProgress,
  generateReminderMessage,
  calculateUrgencyScore,
  sortVerificationsByPriority,
  getNextAction,
  createVerificationAnalytics
} from '@/lib/verification/verification-utils';
