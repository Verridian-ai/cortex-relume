import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  ArrowRight, 
  ArrowLeft, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { emailVerificationService, SendEmailVerificationParams, VerifyEmailParams } from '@/lib/verification/email-verification';
import { EmailVerification, VerificationResult } from '@/lib/verification/verification-status';

interface EmailVerificationProps {
  email: string;
  userId: string;
  onSuccess: (verification: EmailVerification) => void;
  onError: (error: string) => void;
  onBack?: () => void;
  autoSend?: boolean;
}

export const EmailVerificationComponent: React.FC<EmailVerificationProps> = ({
  email,
  userId,
  onSuccess,
  onError,
  onBack,
  autoSend = false
}) => {
  const [verification, setVerification] = useState<EmailVerification | null>(null);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [step, setStep] = useState<'send' | 'verify'>('send');

  useEffect(() => {
    if (autoSend && email && userId) {
      handleSendVerification();
    }
  }, [autoSend, email, userId]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendVerification = async () => {
    setIsLoading(true);
    setError('');

    try {
      const params: SendEmailVerificationParams = {
        email,
        userId,
        customData: {
          source: 'onboarding',
          timestamp: new Date().toISOString(),
        }
      };

      const result: VerificationResult<EmailVerification> = await emailVerificationService.sendVerification(params);

      if (result.success && result.verification) {
        setVerification(result.verification);
        setStep('verify');
        setCountdown(60); // 1 minute cooldown for resend
      } else {
        setError(result.error?.message || 'Failed to send verification email');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verification || !code.trim()) {
      setError('Please enter the verification code');
      return;
    }

    if (code.length !== 6) {
      setError('Verification code must be 6 digits');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const params: VerifyEmailParams = {
        token: verification.token,
        code: code.trim()
      };

      const result: VerificationResult<EmailVerification> = await emailVerificationService.verifyEmail(params);

      if (result.success && result.verification) {
        setVerification(result.verification);
        onSuccess(result.verification);
      } else {
        setError(result.error?.message || 'Invalid verification code');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!verification) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await emailVerificationService.resendVerification({
        userId,
        email
      });

      if (result.success && result.verification) {
        setVerification(result.verification);
        setCountdown(60);
        setCode('');
      } else {
        setError(result.error?.message || 'Failed to resend verification code');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCodeChange = (value: string) => {
    // Only allow numbers and max 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setCode(numericValue);
    setError('');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Verify Your Email
            </h2>
            <p className="text-gray-600">
              We've sent a verification code to{' '}
              <span className="font-medium text-gray-900">{email}</span>
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success State */}
          {verification?.isVerified && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Email verified successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* Verification Code Input */}
          {step === 'verify' && !verification?.isVerified && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Enter verification code</Label>
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="123456"
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                />
                <p className="text-xs text-gray-500 text-center">
                  Enter the 6-digit code from your email
                </p>
              </div>

              <Button
                onClick={handleVerifyCode}
                disabled={isVerifying || code.length !== 6}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Email
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Resend Code */}
          {step === 'verify' && countdown > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-4">
              <Clock className="w-4 h-4" />
              Resend available in {formatTime(countdown)}
            </div>
          )}

          {step === 'verify' && countdown === 0 && (
            <Button
              onClick={handleResendCode}
              variant="outline"
              disabled={isLoading}
              className="w-full mt-4"
            >
              {isLoading ? (
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 w-4 h-4" />
              )}
              Resend Code
            </Button>
          )}

          {/* Send Verification */}
          {step === 'send' && (
            <div className="space-y-4">
              <Button
                onClick={handleSendVerification}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Verification Code
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            {onBack && (
              <Button
                onClick={onBack}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            
            <div className="flex-1" />
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Didn't receive the email?
            </h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Check your spam or junk folder</li>
              <li>• Make sure {email} is spelled correctly</li>
              <li>• Try resending the code</li>
              <li>• Contact support if the problem persists</li>
            </ul>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default EmailVerificationComponent;
