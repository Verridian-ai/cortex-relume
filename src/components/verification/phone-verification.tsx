import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Phone, 
  ArrowRight, 
  ArrowLeft, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { phoneVerificationService, SendPhoneVerificationParams, VerifyPhoneParams } from '@/lib/verification/phone-verification';
import { PhoneVerification, VerificationResult } from '@/lib/verification/verification-status';

interface PhoneVerificationProps {
  phoneNumber?: string;
  countryCode?: string;
  userId: string;
  onSuccess: (verification: PhoneVerification) => void;
  onError: (error: string) => void;
  onBack?: () => void;
  autoSend?: boolean;
}

const countryCodes = [
  { code: '+1', country: 'US/CA', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+61', country: 'AU', flag: '🇦🇺' },
  { code: '+49', country: 'DE', flag: '🇩🇪' },
  { code: '+33', country: 'FR', flag: '🇫🇷' },
  { code: '+34', country: 'ES', flag: '🇪🇸' },
  { code: '+39', country: 'IT', flag: '🇮🇹' },
  { code: '+81', country: 'JP', flag: '🇯🇵' },
  { code: '+82', country: 'KR', flag: '🇰🇷' },
  { code: '+86', country: 'CN', flag: '🇨🇳' },
  { code: '+91', country: 'IN', flag: '🇮🇳' },
  { code: '+55', country: 'BR', flag: '🇧🇷' },
];

export const PhoneVerificationComponent: React.FC<PhoneVerificationProps> = ({
  phoneNumber: initialPhoneNumber,
  countryCode: initialCountryCode,
  userId,
  onSuccess,
  onError,
  onBack,
  autoSend = false
}) => {
  const [verification, setVerification] = useState<PhoneVerification | null>(null);
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber || '');
  const [countryCode, setCountryCode] = useState(initialCountryCode || '+1');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [step, setStep] = useState<'input' | 'send' | 'verify'>('input');

  useEffect(() => {
    if (autoSend && phoneNumber && countryCode && userId) {
      handleSendVerification();
    }
  }, [autoSend, phoneNumber, countryCode, userId]);

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
      const params: SendPhoneVerificationParams = {
        phoneNumber,
        countryCode,
        userId,
        customData: {
          source: 'onboarding',
          timestamp: new Date().toISOString(),
        }
      };

      const result: VerificationResult<PhoneVerification> = await phoneVerificationService.sendVerification(params);

      if (result.success && result.verification) {
        setVerification(result.verification);
        setStep('verify');
        setCountdown(60); // 1 minute cooldown for resend
      } else {
        setError(result.error?.message || 'Failed to send verification SMS');
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
      const params: VerifyPhoneParams = {
        token: verification.token,
        code: code.trim()
      };

      const result: VerificationResult<PhoneVerification> = await phoneVerificationService.verifyPhone(params);

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
      const result = await phoneVerificationService.resendVerification({
        userId,
        phoneNumber,
        countryCode
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

  const formatPhoneNumber = (number: string) => {
    // Simple formatting for US numbers
    if (countryCode === '+1' && number.length >= 6) {
      return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6, 10)}`;
    }
    return number;
  };

  const handlePhoneSubmit = () => {
    if (!phoneNumber.trim()) {
      setError('Phone number is required');
      return;
    }
    setStep('send');
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
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Verify Your Phone
            </h2>
            <p className="text-gray-600">
              We'll send you a verification code via SMS
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
                Phone number verified successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* Phone Number Input */}
          {step === 'input' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex gap-2">
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countryCodes.map((cc) => (
                        <SelectItem key={cc.code} value={cc.code}>
                          {cc.flag} {cc.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="123-456-7890"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  We'll send you a verification code via SMS
                </p>
              </div>

              <Button
                onClick={handlePhoneSubmit}
                disabled={!phoneNumber.trim()}
                className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
              >
                Continue
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Send Verification */}
          {step === 'send' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-sm text-blue-800">
                  We'll send a verification code to:
                </p>
                <p className="font-medium text-blue-900">
                  {countryCode} {formatPhoneNumber(phoneNumber)}
                </p>
              </div>

              <Button
                onClick={handleSendVerification}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
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
                  Enter the 6-digit code sent to {countryCode} {formatPhoneNumber(phoneNumber)}
                </p>
              </div>

              <Button
                onClick={handleVerifyCode}
                disabled={isVerifying || code.length !== 6}
                className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Phone Number
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
            
            {step === 'send' && (
              <Button
                onClick={() => setStep('input')}
                variant="outline"
              >
                Change Number
              </Button>
            )}
            
            <div className="flex-1" />
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Didn't receive the SMS?
            </h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Check your phone's messaging app</li>
              <li>• Make sure {countryCode} {formatPhoneNumber(phoneNumber)} is correct</li>
              <li>• Try resending the code</li>
              <li>• Contact support if the problem persists</li>
            </ul>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default PhoneVerificationComponent;
