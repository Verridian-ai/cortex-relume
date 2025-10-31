import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Sparkles, 
  Rocket, 
  ArrowRight,
  CheckCircle
} from 'lucide-react';

interface WelcomeStepProps {
  onNext?: () => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto text-center space-y-8"
      >
        {/* Logo and Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Cortex Relume
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed">
            Let's get you started with the most powerful component development platform. 
            We'll guide you through everything in just a few steps.
          </p>
        </motion.div>

        {/* What to Expect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              What to expect in this onboarding:
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4 text-left">
              {[
                {
                  title: 'Profile Setup',
                  description: 'Tell us about yourself to personalize your experience',
                  icon: CheckCircle
                },
                {
                  title: 'Preferences',
                  description: 'Customize your notifications and theme preferences',
                  icon: CheckCircle
                },
                {
                  title: 'Feature Tour',
                  description: 'Explore the powerful features available to you',
                  icon: CheckCircle
                },
                {
                  title: 'Quick Start',
                  description: 'Get ready to build amazing components',
                  icon: CheckCircle
                }
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <item.icon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-3 gap-6"
        >
          {[
            { number: '1000+', label: 'Components' },
            { number: '50K+', label: 'Developers' },
            { number: '99.9%', label: 'Uptime' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + index * 0.1 }}
              className="text-center"
            >
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {stat.number}
              </div>
              <div className="text-sm text-gray-600">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            onClick={onNext}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Let's Get Started
            <Rocket className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>

        {/* Skip Option */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <p className="text-sm text-gray-500">
            Onboarding usually takes 2-3 minutes. You can skip any step you want.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomeStep;
