import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '@/lib/onboarding/onboarding-state';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Palette, 
  Bell, 
  Mail, 
  ArrowLeft,
  ArrowRight,
  Target,
  Heart
} from 'lucide-react';

interface PreferencesStepProps {
  onNext?: () => void;
  onPrevious?: () => void;
}

export const PreferencesStep: React.FC<PreferencesStepProps> = ({ 
  onNext, 
  onPrevious 
}) => {
  const { data, updateProfile, completeStep, skipStep, nextStep } = useOnboardingStore();
  const [preferences, setPreferences] = useState({
    theme: data.profile.preferences.theme || 'system',
    notifications: data.profile.preferences.notifications ?? true,
    emailUpdates: data.profile.preferences.emailUpdates ?? false,
    productUpdates: data.profile.preferences.productUpdates ?? true,
    marketingEmails: data.profile.preferences.marketingEmails ?? false,
  });

  const [interests, setInterests] = useState<string[]>(data.profile.interests || []);
  const [goals, setGoals] = useState<string[]>(data.profile.goals || []);

  const availableInterests = [
    'UI Components',
    'Design Systems',
    'React Development',
    'TypeScript',
    'Accessibility',
    'Performance',
    'Animation',
    'Mobile Development',
    'E-commerce',
    'SaaS Applications',
    'Open Source',
    'UI/UX Design'
  ];

  const availableGoals = [
    'Build a component library',
    'Learn React best practices',
    'Create design systems',
    'Improve code quality',
    'Speed up development',
    'Collaborate with team',
    'Contribute to open source',
    'Launch a product',
    'Get better at TypeScript',
    'Master accessibility',
    'Optimize performance',
    'Find new job opportunities'
  ];

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleGoalToggle = (goal: string) => {
    setGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const handleNext = () => {
    updateProfile({
      preferences,
      interests,
      goals
    });
    completeStep('preferences');
    if (onNext) onNext();
    else nextStep();
  };

  const handleSkip = () => {
    skipStep('preferences');
    if (onNext) onNext();
    else nextStep();
  };

  const handlePrevious = () => {
    if (onPrevious) onPrevious();
  };

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <Settings className="w-8 h-8 text-white" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Customize your experience
          </h2>
          <p className="text-gray-600">
            Set your preferences and let us know what interests you most.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Preferences */}
          <div className="space-y-6">
            {/* Theme Settings */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Appearance
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select 
                      value={preferences.theme} 
                      onValueChange={(value) => handlePreferenceChange('theme', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500">
                      Choose how Cortex Relume looks on your device
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Notification Settings */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Get notified about important updates
                      </p>
                    </div>
                    <Switch
                      checked={preferences.notifications}
                      onCheckedChange={(checked) => handlePreferenceChange('notifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Updates
                      </Label>
                      <p className="text-sm text-gray-500">
                        Receive email about new features
                      </p>
                    </div>
                    <Switch
                      checked={preferences.emailUpdates}
                      onCheckedChange={(checked) => handlePreferenceChange('emailUpdates', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Product Updates</Label>
                      <p className="text-sm text-gray-500">
                        News about improvements and fixes
                      </p>
                    </div>
                    <Switch
                      checked={preferences.productUpdates}
                      onCheckedChange={(checked) => handlePreferenceChange('productUpdates', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-gray-500">
                        Tips, tutorials, and promotional content
                      </p>
                    </div>
                    <Switch
                      checked={preferences.marketingEmails}
                      onCheckedChange={(checked) => handlePreferenceChange('marketingEmails', checked)}
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Interests & Goals */}
          <div className="space-y-6">
            {/* Interests */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  What interests you?
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  Select topics you'd like to learn more about (optional)
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {availableInterests.map((interest) => (
                    <Badge
                      key={interest}
                      variant={interests.includes(interest) ? "default" : "outline"}
                      className={`cursor-pointer transition-all duration-200 ${
                        interests.includes(interest)
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => handleInterestToggle(interest)}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Goals */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
            >
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  What are your goals?
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  Tell us what you want to achieve (optional)
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {availableGoals.map((goal) => (
                    <Badge
                      key={goal}
                      variant={goals.includes(goal) ? "default" : "outline"}
                      className={`cursor-pointer transition-all duration-200 ${
                        goals.includes(goal)
                          ? 'bg-purple-500 text-white hover:bg-purple-600'
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => handleGoalToggle(goal)}
                    >
                      {goal}
                    </Badge>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button
            onClick={handlePrevious}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex gap-2 flex-1">
            <Button
              onClick={handleSkip}
              variant="outline"
              className="flex-1"
            >
              Skip for Now
            </Button>
            
            <Button
              onClick={handleNext}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Continue
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PreferencesStep;
