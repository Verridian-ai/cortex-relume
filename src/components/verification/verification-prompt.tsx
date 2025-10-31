import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Mail, 
  Phone, 
  User, 
  FileText, 
  MapPin,
  X, 
  AlertCircle,
  CheckCircle,
  Clock,
  Shield,
  ArrowRight,
  Zap,
  Star
} from 'lucide-react';
import { VerificationType, VerificationStatus } from '@/lib/verification/verification-status';
import { getVerificationPrompt, calculateUrgencyScore } from '@/lib/verification/verification-utils';

interface VerificationPromptProps {
  verificationId: string;
  type: VerificationType;
  status: VerificationStatus;
  title?: string;
  description?: string;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  deadline?: string;
  isRequired: boolean;
  onVerify: () => void;
  onSkip?: () => void;
  onDismiss?: () => void;
  benefits?: string[];
  progress?: number; // 0-100
}

export const VerificationPrompt: React.FC<VerificationPromptProps> = ({
  verificationId,
  type,
  status,
  title,
  description,
  urgency = 'medium',
  deadline,
  isRequired,
  onVerify,
  onSkip,
  onDismiss,
  benefits,
  progress = 0
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Use provided title/description or get defaults
  const promptConfig = getVerificationPrompt(type);
  const finalTitle = title || promptConfig.title;
  const finalDescription = description || promptConfig.description;
  const finalBenefits = benefits || promptConfig.benefits;
  const finalUrgency = urgency || promptConfig.urgency;

  const getTypeIcon = (type: VerificationType) => {
    const iconProps = { className: 'w-6 h-6' };
    switch (type) {
      case VerificationType.EMAIL:
        return <Mail {...iconProps} />;
      case VerificationType.PHONE:
        return <Phone {...iconProps} />;
      case VerificationType.IDENTITY:
        return <User {...iconProps} />;
      case VerificationType.ADDRESS:
        return <MapPin {...iconProps} />;
      case VerificationType.DOCUMENT:
        return <FileText {...iconProps} />;
      default:
        return <Shield {...iconProps} />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'from-red-500 to-red-600';
      case 'high':
        return 'from-orange-500 to-orange-600';
      case 'medium':
        return 'from-yellow-500 to-yellow-600';
      case 'low':
        return 'from-blue-500 to-blue-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusIcon = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.VERIFIED:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case VerificationStatus.FAILED:
      case VerificationStatus.EXPIRED:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case VerificationStatus.PENDING:
      case VerificationStatus.REQUIRES_ACTION:
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const formatDeadline = (deadline?: string) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return 'Expired';
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `Due in ${days} days`;
  };

  const urgencyScore = calculateUrgencyScore({
    id: verificationId,
    userId: '',
    type,
    status,
    createdAt: '',
    updatedAt: '',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-lg mx-auto"
    >
      <Card className={`overflow-hidden border-l-4 ${
        isRequired ? 'border-l-red-500' : 'border-l-blue-500'
      } ${status === VerificationStatus.VERIFIED ? 'bg-green-50' : 'bg-white'}`}>
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 bg-gradient-to-r ${getUrgencyColor(finalUrgency)} rounded-lg flex items-center justify-center text-white`}>
                {getTypeIcon(type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{finalTitle}</h3>
                  {isRequired && (
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  )}
                  {getStatusIcon(status)}
                </div>
                <p className="text-sm text-gray-600 mt-1">{finalDescription}</p>
              </div>
            </div>
            
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="p-1 h-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Progress Bar */}
          {progress > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="text-sm font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Deadline */}
          {deadline && (
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {formatDeadline(deadline)}
              </span>
              {finalUrgency === 'critical' && (
                <Badge variant="destructive" className="text-xs">Urgent</Badge>
              )}
            </div>
          )}

          {/* Benefits */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-4"
              >
                <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Benefits
                </h4>
                <ul className="space-y-1">
                  {finalBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6">
          <div className="flex gap-2">
            {status !== VerificationStatus.VERIFIED ? (
              <>
                <Button
                  onClick={onVerify}
                  className={`flex-1 bg-gradient-to-r ${getUrgencyColor(finalUrgency)} hover:opacity-90 text-white`}
                >
                  {status === VerificationStatus.PENDING ? 'Complete' : 'Start'} Verification
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                
                {!isRequired && onSkip && (
                  <Button
                    onClick={onSkip}
                    variant="outline"
                    size="sm"
                  >
                    Skip
                  </Button>
                )}
              </>
            ) : (
              <Button
                onClick={onVerify}
                variant="outline"
                className="flex-1"
              >
                <CheckCircle className="mr-2 w-4 h-4 text-green-500" />
                Verified
              </Button>
            )}
          </div>

          {/* Expand/Collapse */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full mt-2 text-xs"
          >
            {isExpanded ? 'Hide details' : 'Show details'}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default VerificationPrompt;
