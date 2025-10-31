import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '@/lib/onboarding/onboarding-state';
import { getOnboardingFlow } from '@/lib/onboarding/onboarding-flow';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle,
  Clock,
  SkipForward
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType?: 'new' | 'returning' | 'enterprise';
  initialStep?: string;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  userType = 'new',
  initialStep
}) => {
  const {
    isActive,
    currentStepIndex,
    steps,
    data,
    startOnboarding,
    nextStep,
    previousStep,
    completeStep,
    skipStep,
    exitOnboarding,
    completeOnboarding,
    getCurrentStep,
    getProgress,
  } = useOnboardingStore();

  const [timeSpent, setTimeSpent] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const flow = getOnboardingFlow(userType);

  useEffect(() => {
    if (isOpen && !isActive) {
      startOnboarding();
    }
  }, [isOpen, isActive, startOnboarding]);

  useEffect(() => {
    if (steps.length === 0 && flow.steps.length > 0) {
      // Set up steps from flow
      useOnboardingStore.setState({ steps: flow.steps });
    }
  }, [flow.steps, steps.length]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive]);

  const handleClose = () => {
    if (data.completedSteps.length > 0 || data.skippedSteps.length > 0) {
      setShowExitConfirm(true);
    } else {
      exitOnboarding();
      onClose();
    }
  };

  const handleConfirmExit = () => {
    exitOnboarding();
    onClose();
    setShowExitConfirm(false);
  };

  const handleCancelExit = () => {
    setShowExitConfirm(false);
  };

  const handleNext = () => {
    const currentStep = getCurrentStep();
    if (currentStep) {
      // Mark current step as completed
      completeStep(currentStep.id);
    }
    nextStep();
  };

  const handlePrevious = () => {
    previousStep();
  };

  const handleSkip = () => {
    const currentStep = getCurrentStep();
    if (currentStep) {
      skipStep(currentStep.id);
    }
  };

  const handleComplete = () => {
    completeOnboarding();
    onClose();
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const currentStep = getCurrentStep();
  const progress = getProgress();
  const isLastStep = currentStepIndex === steps.length - 1;
  const StepComponent = currentStep?.component;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {flow.name}
                  </h2>
                  {flow.settings.showTimeEstimate && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {formatTime(timeSpent)}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {steps.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {data.completedSteps.length} of {steps.length} completed
                      </span>
                      <Progress value={progress} className="w-32" />
                    </div>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="p-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Step Progress Indicator */}
              {steps.length > 0 && flow.settings.showProgress && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    {steps.map((step, index) => (
                      <div
                        key={step.id}
                        className={`flex items-center ${
                          index < steps.length - 1 ? 'flex-1' : ''
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                            data.completedSteps.includes(step.id)
                              ? 'bg-green-500 text-white'
                              : data.skippedSteps.includes(step.id)
                              ? 'bg-gray-300 text-gray-600'
                              : index === currentStepIndex
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {data.completedSteps.includes(step.id) ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        {index < steps.length - 1 && (
                          <div
                            className={`flex-1 h-0.5 mx-2 transition-all duration-200 ${
                              data.completedSteps.includes(step.id)
                                ? 'bg-green-500'
                                : 'bg-gray-200'
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    Step {currentStepIndex + 1} of {steps.length}: {currentStep?.title}
                  </p>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto max-h-[calc(90vh-200px)]">
              {StepComponent ? (
                <StepComponent
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                />
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500">Loading step...</p>
                </div>
              )}
            </div>

            {/* Footer Navigation */}
            {steps.length > 0 && (
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {flow.settings.allowBack && currentStepIndex > 0 && (
                      <Button
                        onClick={handlePrevious}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Previous
                      </Button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {currentStep?.isSkippable && flow.settings.allowSkip && (
                      <Button
                        onClick={handleSkip}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <SkipForward className="w-4 h-4" />
                        Skip
                      </Button>
                    )}

                    {isLastStep ? (
                      <Button
                        onClick={handleComplete}
                        size="sm"
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 flex items-center gap-2"
                      >
                        Complete Setup
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNext}
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 flex items-center gap-2"
                      >
                        Next
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Exit Confirmation Modal */}
          <AnimatePresence>
            {showExitConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 flex items-center justify-center"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-lg p-6 max-w-md mx-4"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Exit Onboarding?
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Your progress will be saved. You can continue the onboarding later.
                  </p>
                  <div className="flex gap-2 justify-end">
                    <Button
                      onClick={handleCancelExit}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConfirmExit}
                      size="sm"
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Exit
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OnboardingModal;
