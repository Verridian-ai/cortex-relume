import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '@/lib/onboarding/onboarding-state';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  Component, 
  Search, 
  Users, 
  Download, 
  Palette,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  CheckCircle,
  Lightbulb,
  Code,
  Zap
} from 'lucide-react';

interface FeaturesStepProps {
  onNext?: () => void;
  onPrevious?: () => void;
}

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  demo?: React.ReactNode;
  benefits: string[];
}

export const FeaturesStep: React.FC<FeaturesStepProps> = ({ 
  onNext, 
  onPrevious 
}) => {
  const { data, updateProfile, completeStep, skipStep, nextStep } = useOnboardingStore();
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedFeatures, setCompletedFeatures] = useState<Set<string>>(new Set());

  const features: Feature[] = [
    {
      id: 'ai-components',
      title: 'AI-Powered Component Generation',
      description: 'Generate custom React components using natural language descriptions',
      icon: Sparkles,
      color: 'from-blue-500 to-cyan-500',
      benefits: [
        'Generate components from plain English descriptions',
        'Get production-ready code with TypeScript support',
        'Built-in accessibility and responsive design',
        'Customizable styling with Tailwind CSS'
      ],
      demo: (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">AI Prompt</span>
          </div>
          <div className="bg-gray-50 rounded p-3 text-sm">
            "Create a responsive card component with hover effects..."
          </div>
          <div className="mt-3 h-1 bg-gray-200 rounded">
            <motion.div
              className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </div>
      )
    },
    {
      id: 'component-library',
      title: 'Extensive Component Library',
      description: 'Browse and use 1000+ pre-built, production-ready components',
      icon: Component,
      color: 'from-purple-500 to-pink-500',
      benefits: [
        'Over 1000 carefully crafted components',
        'Organized by categories and complexity',
        'Live previews and interactive examples',
        'Copy-paste ready code'
      ],
      demo: (
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gradient-to-br from-purple-100 to-pink-100 rounded p-3 aspect-square flex items-center justify-center">
              <Component className="w-6 h-6 text-purple-600" />
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'search-discovery',
      title: 'Smart Search & Discovery',
      description: 'Find the perfect component quickly with intelligent search',
      icon: Search,
      color: 'from-green-500 to-teal-500',
      benefits: [
        'AI-powered search with natural language',
        'Filter by framework, category, and complexity',
        'Visual similarity matching',
        'Usage analytics and recommendations'
      ],
      demo: (
        <div className="space-y-3">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <Search className="w-4 h-4 text-gray-400 mb-2" />
            <div className="text-sm text-gray-600">Search components...</div>
          </div>
          <div className="space-y-2">
            {['Buttons', 'Cards', 'Forms', 'Navigation'].map((category) => (
              <Badge key={category} variant="secondary" className="mr-2">
                {category}
              </Badge>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'collaboration',
      title: 'Team Collaboration',
      description: 'Work together with your team on component collections',
      icon: Users,
      color: 'from-orange-500 to-red-500',
      benefits: [
        'Share component collections with team members',
        'Real-time collaboration and comments',
        'Version control for component updates',
        'Team analytics and insights'
      ],
      demo: (
        <div className="space-y-3">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-red-400 border-2 border-white"
              />
            ))}
          </div>
          <div className="text-sm text-gray-600">
            4 team members collaborating
          </div>
        </div>
      )
    }
  ];

  const currentFeature = features[currentFeatureIndex];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentFeatureIndex((prev) => {
          const next = (prev + 1) % features.length;
          if (next === 0) {
            setIsPlaying(false);
          }
          return next;
        });
      }, 4000);
    }

    return () => clearInterval(interval);
  }, [isPlaying, features.length]);

  const markFeatureComplete = (featureId: string) => {
    setCompletedFeatures(prev => new Set([...prev, featureId]));
  };

  const handleNext = () => {
    markFeatureComplete(currentFeature.id);
    if (currentFeatureIndex < features.length - 1) {
      setCurrentFeatureIndex(prev => prev + 1);
    } else {
      completeStep('features');
      updateProfile({ interests: [...data.profile.interests, ...features.map(f => f.title)] });
      if (onNext) onNext();
      else nextStep();
    }
  };

  const handleSkip = () => {
    skipStep('features');
    if (onNext) onNext();
    else nextStep();
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const progress = ((currentFeatureIndex + 1) / features.length) * 100;

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <Zap className="w-8 h-8 text-white" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Discover Powerful Features
          </h2>
          <p className="text-gray-600">
            Explore what makes Cortex Relume the ultimate component development platform
          </p>

          {/* Progress Bar */}
          <div className="mt-6 max-w-md mx-auto">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Feature {currentFeatureIndex + 1} of {features.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Feature Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Features Overview</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={togglePlayback}
                  className="p-2"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              </div>

              <div className="space-y-2">
                {features.map((feature, index) => (
                  <button
                    key={feature.id}
                    onClick={() => setCurrentFeatureIndex(index)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      index === currentFeatureIndex
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200'
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center flex-shrink-0`}>
                        <feature.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900 truncate">{feature.title}</h4>
                          {completedFeatures.has(feature.id) && (
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Feature Content */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white/80 backdrop-blur-sm">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFeatureIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Feature Header */}
                  <div className="text-center">
                    <div className={`w-20 h-20 bg-gradient-to-r ${currentFeature.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                      <currentFeature.icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {currentFeature.title}
                    </h3>
                    <p className="text-gray-600">
                      {currentFeature.description}
                    </p>
                  </div>

                  {/* Feature Demo */}
                  {currentFeature.demo && (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        Live Demo
                      </h4>
                      {currentFeature.demo}
                    </div>
                  )}

                  {/* Benefits */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Key Benefits
                    </h4>
                    <ul className="space-y-2">
                      {currentFeature.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <Button
                  onClick={onPrevious}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSkip}
                    variant="outline"
                    size="sm"
                  >
                    Skip Tour
                  </Button>
                  
                  <Button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 flex items-center gap-2"
                  >
                    {currentFeatureIndex === features.length - 1 ? 'Complete Tour' : 'Next Feature'}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FeaturesStep;
