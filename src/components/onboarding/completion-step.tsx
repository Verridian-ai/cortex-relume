import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '@/lib/onboarding/onboarding-state';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Rocket, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Users,
  BookOpen,
  Download,
  Github,
  Twitter,
  Star
} from 'lucide-react';

interface CompletionStepProps {
  onNext?: () => void;
  onPrevious?: () => void;
}

export const CompletionStep: React.FC<CompletionStepProps> = ({ 
  onNext, 
  onPrevious 
}) => {
  const { data, updateProfile, completeStep, completeOnboarding, nextStep } = useOnboardingStore();
  const [timeToComplete, setTimeToComplete] = useState(0);

  useEffect(() => {
    const startTime = new Date(data.startedAt).getTime();
    const currentTime = new Date().getTime();
    const difference = Math.floor((currentTime - startTime) / 1000);
    setTimeToComplete(difference);
  }, [data.startedAt]);

  const handleComplete = () => {
    completeStep('completion');
    completeOnboarding();
    if (onNext) onNext();
    else nextStep();
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const nextSteps = [
    {
      title: 'Explore Component Library',
      description: 'Browse our extensive collection of 1000+ components',
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500',
      action: 'Browse Library'
    },
    {
      title: 'Generate Your First Component',
      description: 'Use AI to create a custom component from a description',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500',
      action: 'Generate Component'
    },
    {
      title: 'Join the Community',
      description: 'Connect with other developers and share your work',
      icon: Users,
      color: 'from-green-500 to-teal-500',
      action: 'Join Community'
    },
    {
      title: 'Download Resources',
      description: 'Get helpful resources, guides, and templates',
      icon: Download,
      color: 'from-orange-500 to-red-500',
      action: 'Download'
    }
  ];

  const socialLinks = [
    {
      name: 'GitHub',
      icon: Github,
      url: 'https://github.com/cortex-relume',
      color: 'hover:text-gray-900'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: 'https://twitter.com/cortex_relume',
      color: 'hover:text-blue-400'
    }
  ];

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* Success Header */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            🎉 You're all set!
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-gray-600 mb-6"
          >
            Welcome to Cortex Relume, {data.profile.fullName || 'Developer'}! 
            Your profile has been set up successfully.
          </motion.p>

          {/* Completion Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-3 gap-6 max-w-lg mx-auto"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {data.completedSteps.length}
              </div>
              <div className="text-sm text-gray-600">
                Steps Completed
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {formatTime(timeToComplete)}
              </div>
              <div className="text-sm text-gray-600">
                Time Spent
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {Math.round(((data.completedSteps.length / 4) * 100) || 0)}%
              </div>
              <div className="text-sm text-gray-600">
                Completion
              </div>
            </div>
          </motion.div>
        </div>

        {/* What's Next */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Card className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 border-0">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              What's next?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {nextSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                >
                  <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${step.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <step.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                        <p className="text-gray-600 text-sm mb-4">{step.description}</p>
                        <Button size="sm" variant="outline" className="flex items-center gap-2">
                          {step.action}
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Profile Summary */}
        {data.profile.fullName && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
          >
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Your Profile Summary</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <span className="ml-2 font-medium">{data.profile.fullName}</span>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>
                  <span className="ml-2 font-medium">{data.profile.email}</span>
                </div>
                {data.profile.role && (
                  <div>
                    <span className="text-gray-500">Role:</span>
                    <span className="ml-2 font-medium">{data.profile.role}</span>
                  </div>
                )}
                {data.profile.company && (
                  <div>
                    <span className="text-gray-500">Company:</span>
                    <span className="ml-2 font-medium">{data.profile.company}</span>
                  </div>
                )}
                {data.profile.experience && (
                  <div>
                    <span className="text-gray-500">Experience:</span>
                    <Badge variant="secondary" className="ml-2 capitalize">
                      {data.profile.experience}
                    </Badge>
                  </div>
                )}
              </div>
              
              {data.profile.interests.length > 0 && (
                <div className="mt-4">
                  <span className="text-gray-500 text-sm">Interests:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {data.profile.interests.slice(0, 3).map((interest) => (
                      <Badge key={interest} variant="outline" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                    {data.profile.interests.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{data.profile.interests.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            onClick={handleComplete}
            size="lg"
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            Get Started Building
            <Rocket className="w-5 h-5" />
          </Button>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0 }}
          className="text-center"
        >
          <p className="text-gray-600 mb-4">
            Follow us for updates, tips, and community news
          </p>
          <div className="flex justify-center gap-4">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 text-gray-500 ${link.color} transition-colors duration-200`}
              >
                <link.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </motion.div>

        {/* Thank You Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="text-center"
        >
          <p className="text-gray-500 text-sm">
            Thank you for choosing Cortex Relume! We're excited to be part of your development journey. 🚀
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CompletionStep;
