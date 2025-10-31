# User Onboarding & Verification System

A comprehensive user onboarding flow and verification system built for React/TypeScript applications with modern UI components and smooth animations.

## Features

### 🎯 User Onboarding
- **Step-by-step flow** with progress tracking
- **Welcome screen** with feature highlights
- **Profile setup** with validation
- **Preferences configuration** with interests and goals
- **Interactive feature tour** with tooltips
- **Completion screen** with next steps
- **Skip options** and completion tracking
- **Smooth transitions** and animations

### ✅ User Verification
- **Email verification** with 6-digit codes
- **Phone verification** via SMS
- **Identity verification** with document upload
- **Multiple verification types** (email, phone, identity, documents)
- **Automated verification** with confidence scoring
- **Manual review** capability
- **Rate limiting** and security measures

### 🎨 UI Components
- **Modern design** with Tailwind CSS
- **Framer Motion** animations
- **Radix UI** primitives
- **Responsive layout** for all devices
- **Accessibility compliant**
- **Dark mode ready**

## Directory Structure

```
src/
├── lib/
│   ├── onboarding/
│   │   ├── onboarding-state.ts      # Zustand state management
│   │   ├── onboarding-flow.ts       # Flow configuration
│   │   ├── welcome-screen.tsx       # Welcome component
│   │   ├── profile-setup.tsx        # Profile setup
│   │   └── feature-tour.tsx         # Interactive tour
│   └── verification/
│       ├── verification-status.ts   # Type definitions
│       ├── email-verification.ts    # Email service
│       ├── phone-verification.ts    # Phone service
│       ├── identity-verification.ts # Identity service
│       └── verification-utils.ts    # Helper functions
├── components/
│   ├── onboarding/
│   │   ├── onboarding-modal.tsx     # Main modal wrapper
│   │   ├── welcome-step.tsx         # Welcome step
│   │   ├── profile-step.tsx         # Profile step
│   │   ├── preferences-step.tsx     # Preferences step
│   │   ├── features-step.tsx        # Features step
│   │   └── completion-step.tsx      # Completion step
│   └── verification/
│       ├── verification-prompt.tsx  # Verification prompt
│       ├── email-verification.tsx   # Email verification UI
│       ├── phone-verification.tsx   # Phone verification UI
│       ├── identity-verification.tsx # Identity verification UI
│       └── verification-success.tsx # Success screen
```

## Quick Start

### Basic Onboarding Flow

```tsx
import { OnboardingModal } from '@/components/onboarding';

function App() {
  const [showOnboarding, setShowOnboarding] = useState(true);

  return (
    <div className="app">
      {/* Your app content */}
      
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        userType="new" // 'new' | 'returning' | 'enterprise'
      />
    </div>
  );
}
```

### Individual Onboarding Steps

```tsx
import { WelcomeStep } from '@/components/onboarding';

function CustomOnboarding() {
  return (
    <div className="onboarding-container">
      <WelcomeStep onNext={() => handleNext()} />
    </div>
  );
}
```

### Email Verification

```tsx
import { EmailVerificationComponent } from '@/components/verification';

function EmailVerification() {
  const handleSuccess = (verification) => {
    console.log('Email verified:', verification);
    // Proceed with next step
  };

  const handleError = (error) => {
    console.error('Verification failed:', error);
    // Handle error
  };

  return (
    <EmailVerificationComponent
      email="user@example.com"
      userId="user-123"
      onSuccess={handleSuccess}
      onError={handleError}
      autoSend={true}
    />
  );
}
```

### Phone Verification

```tsx
import { PhoneVerificationComponent } from '@/components/verification';

function PhoneVerification() {
  return (
    <PhoneVerificationComponent
      phoneNumber="123-456-7890"
      countryCode="+1"
      userId="user-123"
      onSuccess={(verification) => console.log('Phone verified')}
      onError={(error) => console.error(error)}
    />
  );
}
```

### Identity Verification

```tsx
import { IdentityVerificationComponent } from '@/components/verification';

function IdentityVerification() {
  return (
    <IdentityVerificationComponent
      userId="user-123"
      onSuccess={(verification) => console.log('Identity verified')}
      onError={(error) => console.error(error)}
    />
  );
}
```

### Verification Prompt

```tsx
import { VerificationPrompt } from '@/components/verification';

function VerificationNeeded() {
  return (
    <VerificationPrompt
      verificationId="ver-123"
      type={VerificationType.EMAIL}
      status={VerificationStatus.PENDING}
      isRequired={true}
      onVerify={() => startVerification()}
      onSkip={() => skipVerification()}
    />
  );
}
```

## Configuration

### Onboarding Flow Configuration

```tsx
import { getOnboardingFlow } from '@/lib/onboarding/onboarding-flow';

const flow = getOnboardingFlow('new'); // 'new' | 'returning' | 'enterprise'

console.log(flow.steps); // Array of onboarding steps
console.log(flow.settings); // Flow configuration
```

### Verification Settings

```tsx
import { createVerificationSettings, generateVerificationRequirements } from '@/lib/verification/verification-utils';

const context = {
  userId: 'user-123',
  email: 'user@example.com',
  phoneNumber: '123-456-7890',
  requiredVerifications: [VerificationType.IDENTITY],
};

const requirements = generateVerificationRequirements(context);
const settings = createVerificationSettings('user-123', requirements);
```

## State Management

### Onboarding Store

```tsx
import { useOnboardingStore } from '@/lib/onboarding/onboarding-state';

function OnboardingComponent() {
  const {
    isActive,
    currentStepIndex,
    data,
    startOnboarding,
    completeStep,
    updateProfile,
  } = useOnboardingStore();

  // Access onboarding state and methods
}
```

### Verification Store

```tsx
import { useVerificationStore } from '@/lib/verification/verification-store';

// Access verification state
```

## Customization

### Styling

All components use Tailwind CSS classes and can be customized:

```tsx
// Custom button styles
<Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
  Custom Button
</Button>

// Custom card styles
<Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-xl">
  Custom Card
</Card>
```

### Animations

Components use Framer Motion for animations:

```tsx
import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

<motion.div {...fadeInUp}>
  Your content
</motion.div>
```

### Custom Steps

Create custom onboarding steps:

```tsx
import { OnboardingStep } from '@/lib/onboarding/onboarding-state';
import { CustomStep } from './custom-step';

const customStep: OnboardingStep = {
  id: 'custom',
  name: 'Custom Step',
  title: 'Custom Onboarding Step',
  description: 'This is a custom step',
  isCompleted: false,
  isSkippable: true,
  isOptional: false,
  component: CustomStep,
};
```

## API Integration

### Email Verification Service

```tsx
import { emailVerificationService } from '@/lib/verification/email-verification';

// Send verification
const result = await emailVerificationService.sendVerification({
  email: 'user@example.com',
  userId: 'user-123'
});

// Verify code
const verifyResult = await emailVerificationService.verifyEmail({
  token: 'verification-token',
  code: '123456'
});
```

### Phone Verification Service

```tsx
import { phoneVerificationService } from '@/lib/verification/phone-verification';

// Send verification
const result = await phoneVerificationService.sendVerification({
  phoneNumber: '123-456-7890',
  countryCode: '+1',
  userId: 'user-123'
});
```

### Identity Verification Service

```tsx
import { identityVerificationService } from '@/lib/verification/identity-verification';

// Create verification
const result = await identityVerificationService.createVerification('user-123');

// Upload documents
const uploadResult = await identityVerificationService.uploadDocument({
  verificationId: 'ver-123',
  documentType: 'passport',
  frontImage: file,
  selfieImage: selfieFile
});
```

## Utilities

### Verification Helpers

```tsx
import { 
  getVerificationProgress,
  calculateUrgencyScore,
  getNextAction,
  createVerificationAnalytics
} from '@/lib/verification/verification-utils';

const progress = getVerificationProgress(verifications);
const urgency = calculateUrgencyScore(verification);
const nextAction = getNextAction(verification);
const analytics = createVerificationAnalytics(verifications);
```

### Validation

```tsx
import { validateVerificationData } from '@/lib/verification/verification-utils';

const validation = validateVerificationData(VerificationType.EMAIL, {
  email: 'user@example.com'
});

if (!validation.isValid) {
  console.error(validation.errors);
}
```

## Dependencies

### Required Dependencies

```json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "typescript": "^5.0.0",
  "framer-motion": "^10.0.0",
  "zustand": "^4.0.0",
  "class-variance-authority": "^0.7.0",
  "@radix-ui/react-switch": "^1.0.0",
  "@radix-ui/react-slot": "^1.0.0",
  "tailwindcss": "^3.0.0",
  "lucide-react": "^0.200.0"
}
```

### Installation

```bash
npm install framer-motion zustand class-variance-authority @radix-ui/react-switch @radix-ui/react-slot
npm install -D tailwindcss lucide-react
```

## Best Practices

### 1. State Management
- Use the provided Zustand stores for consistent state management
- Persist important state using the persist middleware
- Update profile data as users progress through onboarding

### 2. Error Handling
- Always handle verification errors gracefully
- Provide clear error messages to users
- Implement retry mechanisms for failed verifications

### 3. Security
- Validate all inputs on both client and server
- Implement rate limiting for verification attempts
- Use secure token generation for verification codes

### 4. UX Guidelines
- Keep onboarding steps concise and focused
- Provide progress indicators
- Allow users to skip optional steps
- Give immediate feedback for user actions

### 5. Performance
- Lazy load step components
- Optimize image uploads for identity verification
- Use proper loading states during async operations

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Accessibility

All components follow WCAG 2.1 guidelines:
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management
- Semantic HTML structure

## Examples

See the `/examples` directory for complete implementation examples:
- Basic onboarding flow
- Verification-only flow
- Custom step implementation
- API integration examples

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Test accessibility compliance

## License

MIT License - see LICENSE file for details.
