import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Shield, 
  Star, 
  ArrowRight, 
  Download,
  Share2,
  Sparkles,
  Zap,
  Award,
  TrendingUp,
  Clock,
  Mail,
  Phone,
  User,
  FileText
} from 'lucide-react';
import { VerificationType, VerificationStatus } from '@/lib/verification/verification-status';

interface VerificationSuccessProps {
  verificationType: VerificationType;
  verificationData?: any;
  onContinue?: () => void;
  onViewDetails?: () => void;
  onShare?: () => void;
  showCelebration?: boolean;
  showNextSteps?: boolean;
}

interface VerificationBadge {
  type: VerificationType;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

export const VerificationSuccessComponent: React.FC<VerificationSuccessProps> = ({
  verificationType,
  verificationData,
  onContinue,
  onViewDetails,
  onShare,
  showCelebration = true,
  showNextSteps = true
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (showCelebration) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showCelebration]);

  const verificationBadges: VerificationBadge[] = [
    {
      type: VerificationType.EMAIL,
      label: 'Email Verified',
      icon: Mail,
      color: 'from-blue-500 to-cyan-500',
      description: 'Your email address has been verified'
    },
    {
      type: VerificationType.PHONE,
      label: 'Phone Verified',
      icon: Phone,
      color: 'from-green-500 to-teal-500',
      description: 'Your phone number has been verified'
    },
    {
      type: VerificationType.IDENTITY,
      label: 'Identity Verified',
      icon: User,
      color: 'from-purple-500 to-pink-500',
      description: 'Your identity has been confirmed'
    },
    {
    type: VerificationType.DOCUMENT,
      label: 'Documents Verified',
      icon: FileText,
      color: 'from-orange-500 to-red-500',
      description: 'Your documents have been verified'
    }
  ];

  const getCurrentBadge = () => {
    return verificationBadges.find(badge => badge.type === verificationType);
  };

  const getBenefits = (type: VerificationType) => {
    const benefits = {
      [VerificationType.EMAIL]: [
        'Enhanced account security',
        'Password recovery enabled',
        'Important notifications delivery',
        'Two-factor authentication support'
      ],
      [VerificationType.PHONE]: [
        'SMS notifications enabled',
        'Two-factor authentication',
        'Account recovery assistance',
        'Enhanced security verification'
      ],
      [VerificationType.IDENTITY]: [
        'Access to premium features',
        'Higher transaction limits',
        'Enhanced trust score',
        'Compliance verification'
      ],
      [VerificationType.DOCUMENT]: [
        'Document verification complete',
        'Regulatory compliance',
        'Enhanced account standing',
        'Access to all services'
      ]
    };
    return benefits[type] || [];
  };

  const getNextSteps = (type: VerificationType) => {
    const steps = {
      [VerificationType.EMAIL]: [
        'Complete your profile setup',
        'Explore premium features',
        'Set up two-factor authentication'
      ],
      [VerificationType.PHONE]: [
        'Configure SMS preferences',
        'Set up phone-based 2FA',
        'Update security settings'
      ],
      [VerificationType.IDENTITY]: [
        'Access premium features',
        'Complete payment setup',
        'Explore advanced tools'
      ],
      [VerificationType.DOCUMENT]: [
        'Review verification status',
        'Access restricted features',
        'Complete account setup'
      ]
    };
    return steps[type] || [];
  };

  const currentBadge = getCurrentBadge();
  const benefits = getBenefits(verificationType);
  const nextSteps = getNextSteps(verificationType);

  const Confetti = () => (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: -10,
            opacity: 1,
          }}
          animate={{
            y: window.innerHeight + 10,
            opacity: 0,
            rotate: 360,
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: Math.random() * 0.5,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );

  return (
    <>
      {showConfetti && <Confetti />}
      
      <div className="w-full max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 text-center overflow-hidden relative">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 opacity-50" />
            
            {/* Content */}
            <div className="relative space-y-6">
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto"
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>

              {/* Success Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Verification Complete! 🎉
                </h1>
                <p className="text-lg text-gray-600">
                  {currentBadge?.description}
                </p>
              </motion.div>

              {/* Verification Badge */}
              {currentBadge && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Badge 
                    className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${currentBadge.color} text-white text-sm font-medium`}
                  >
                    <currentBadge.icon className="w-4 h-4" />
                    {currentBadge.label}
                  </Badge>
                </motion.div>
              )}

              {/* Verification Details */}
              {verificationData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="p-4 bg-white/80 backdrop-blur-sm rounded-lg border"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-sm text-gray-500">Verified</p>
                      <p className="font-medium text-gray-900">
                        {verificationType === VerificationType.EMAIL && verificationData.email}
                        {verificationType === VerificationType.PHONE && `${verificationData.countryCode}${verificationData.phoneNumber}`}
                        {verificationType === VerificationType.IDENTITY && `${verificationData.firstName} ${verificationData.lastName}`}
                        {verificationType === VerificationType.DOCUMENT && 'Document Package'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Status</p>
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Benefits */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="text-left"
              >
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  What's Now Available
                </h3>
                <div className="space-y-2">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={benefit}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 + index * 0.1 }}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {benefit}
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Security Score */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
                className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Security Score</span>
                  <span className="text-sm font-bold text-blue-600">+25 points</span>
                </div>
                <Progress value={85} className="h-2" />
                <p className="text-xs text-gray-600 mt-2">
                  Your account security has been enhanced
                </p>
              </motion.div>

              {/* Next Steps */}
              {showNextSteps && nextSteps.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6 }}
                  className="text-left"
                >
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-500" />
                    Next Steps
                  </h3>
                  <div className="space-y-2">
                    {nextSteps.map((step, index) => (
                      <div
                        key={step}
                        className="flex items-center gap-2 text-sm text-gray-600"
                      >
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                          {index + 1}
                        </div>
                        {step}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                {onContinue && (
                  <Button
                    onClick={onContinue}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    Continue
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                )}
                
                {onViewDetails && (
                  <Button
                    onClick={onViewDetails}
                    variant="outline"
                    className="flex-1"
                  >
                    View Details
                  </Button>
                )}
              </motion.div>

              {/* Additional Actions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.0 }}
                className="flex justify-center gap-4 pt-4 border-t border-gray-200"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onShare}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Success
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Certificate
                </Button>
              </motion.div>

              {/* Celebration Stats */}
              {showCelebration && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.2 }}
                  className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      <TrendingUp className="w-6 h-6 mx-auto" />
                    </div>
                    <div className="text-sm text-gray-600">Security</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      <Award className="w-6 h-6 mx-auto" />
                    </div>
                    <div className="text-sm text-gray-600">Trust</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      <Shield className="w-6 h-6 mx-auto" />
                    </div>
                    <div className="text-sm text-gray-600">Verified</div>
                  </div>
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default VerificationSuccessComponent;
