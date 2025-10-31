import React, { useState, useEffect } from 'react';
import { 
  Accessibility, 
  Eye, 
  EyeOff, 
  Keyboard, 
  Volume2,
  VolumeX,
  Mouse,
  Touch,
  Brain,
  Heart,
  Zap,
  Monitor,
  Smartphone,
  Tablet,
  Settings,
  CheckCircle,
  AlertTriangle,
  Info,
  TestTube,
  RefreshCw,
  Save,
  RotateCcw,
  User,
  Users,
  Shield,
  Lightbulb,
  Gauge,
  Circle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Slider } from '../ui/slider';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Progress } from '../ui/progress';
import { useAccessibilityPreferencesStore } from '../../lib/preferences/accessibility-preferences';

interface AccessibilitySettingsProps {
  onSave?: () => void;
  onReset?: () => void;
}

export const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({
  onSave,
  onReset,
}) => {
  const accessibilityStore = useAccessibilityPreferencesStore();
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  // Handle accessibility settings change
  const handleChange = (key: string, value: any) => {
    accessibilityStore.updateAccessibilityPreference(key as any, value);
    setIsDirty(true);
  };

  // Handle nested setting change
  const handleNestedChange = (section: string, key: string, value: any) => {
    accessibilityStore.updateNestedPreference(section as any, key, value);
    setIsDirty(true);
  };

  // Handle specific feature toggles
  const handleFeatureToggle = (feature: string, enabled: boolean) => {
    switch (feature) {
      case 'high-contrast':
        if (enabled) accessibilityStore.enableHighContrast();
        else accessibilityStore.disableHighContrast();
        break;
      case 'screen-reader':
        if (enabled) accessibilityStore.enableScreenReader();
        else accessibilityStore.disableScreenReader();
        break;
      case 'keyboard-navigation':
        if (enabled) accessibilityStore.enableKeyboardNavigation();
        else accessibilityStore.disableKeyboardNavigation();
        break;
    }
    setIsDirty(true);
  };

  // Run accessibility test
  const handleRunTest = async () => {
    setIsTesting(true);
    try {
      const results = await accessibilityStore.testAccessibility('full-page');
      setTestResults(results);
    } catch (error) {
      console.error('Failed to run accessibility test:', error);
    } finally {
      setIsTesting(false);
    }
  };

  // Check WCAG compliance
  const handleCheckCompliance = async () => {
    try {
      const report = await accessibilityStore.checkWCAGCompliance();
      console.log('WCAG Compliance Report:', report);
    } catch (error) {
      console.error('Failed to check WCAG compliance:', error);
    }
  };

  // Save settings
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastSaved(new Date());
      setIsDirty(false);
      onSave?.();
    } catch (error) {
      console.error('Failed to save accessibility settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = () => {
    if (confirm('Are you sure you want to reset all accessibility settings to defaults?')) {
      accessibilityStore.resetToDefaults();
      setIsDirty(true);
    }
  };

  // Adjust for device type
  const handleDeviceAdjustment = (device: 'desktop' | 'tablet' | 'mobile') => {
    accessibilityStore.adjustForDevice(device);
    setIsDirty(true);
  };

  // Apply environmental presets
  const handleEnvironmentPreset = (environment: 'bright' | 'dim' | 'dark') => {
    accessibilityStore.adjustForEnvironment(environment);
    setIsDirty(true);
  };

  // Get compliance level color
  const getComplianceColor = (level: 'A' | 'AA' | 'AAA') => {
    switch (level) {
      case 'A': return 'text-yellow-600';
      case 'AA': return 'text-green-600';
      case 'AAA': return 'text-blue-600';
    }
  };

  // Get accessibility level color
  const getLevelColor = (level: 'basic' | 'enhanced' | 'comprehensive') => {
    switch (level) {
      case 'basic': return 'text-yellow-600';
      case 'enhanced': return 'text-green-600';
      case 'comprehensive': return 'text-blue-600';
    }
  };

  // Color blindness mode descriptions
  const colorBlindnessOptions = [
    {
      value: 'none',
      label: 'None',
      description: 'Normal color vision',
      icon: <Eye className="h-4 w-4" />,
    },
    {
      value: 'protanopia',
      label: 'Protanopia',
      description: 'Red-blind (no red cones)',
      icon: <Circle className="h-4 w-4 text-red-500" />,
    },
    {
      value: 'deuteranopia',
      label: 'Deuteranopia',
      description: 'Green-blind (no green cones)',
      icon: <Circle className="h-4 w-4 text-green-500" />,
    },
    {
      value: 'tritanopia',
      label: 'Tritanopia',
      description: 'Blue-blind (no blue cones)',
      icon: <Circle className="h-4 w-4 text-blue-500" />,
    },
    {
      value: 'achromatopsia',
      label: 'Achromatopsia',
      description: 'Complete color blindness',
      icon: <Circle className="h-4 w-4 text-gray-500" />,
    },
  ];

  // Focus indicator options
  const focusOptions = [
    { value: 'none', label: 'None', description: 'No visible focus indicators' },
    { value: 'subtle', label: 'Subtle', description: 'Light outline' },
    { value: 'strong', label: 'Strong', description: 'Bold outline' },
    { value: 'outline', label: 'Outline', description: 'Dashed outline' },
    { value: 'custom', label: 'Custom', description: 'Custom style' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Accessibility Overview Header */}
      <div className="mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getLevelColor(accessibilityStore.accessibilityLevel)}`}>
                    {accessibilityStore.complianceScore}%
                  </div>
                  <div className="text-sm text-muted-foreground">WCAG Compliance</div>
                </div>
                <div className="border-l pl-6">
                  <h2 className="text-xl font-semibold mb-2">Accessibility Overview</h2>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Accessibility Level</span>
                      <Badge variant="outline" className={getLevelColor(accessibilityStore.accessibilityLevel)}>
                        {accessibilityStore.accessibilityLevel.charAt(0).toUpperCase() + accessibilityStore.accessibilityLevel.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Detected Capabilities</span>
                      <div className="flex space-x-1">
                        {Object.entries(accessibilityStore.detectedCapabilities).map(([key, detected]) => (
                          <div
                            key={key}
                            className={`w-2 h-2 rounded-full ${
                              detected ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                            title={key}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right space-y-2">
                <Button 
                  variant="outline" 
                  onClick={handleRunTest}
                  disabled={isTesting}
                  className="w-full"
                >
                  {isTesting ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4 mr-2" />
                  )}
                  Run Test
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCheckCompliance}
                  className="w-full"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Check WCAG
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="visual" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="visual">
            <Eye className="h-4 w-4 mr-2" />
            Visual
          </TabsTrigger>
          <TabsTrigger value="motor">
            <Mouse className="h-4 w-4 mr-2" />
            Motor
          </TabsTrigger>
          <TabsTrigger value="cognitive">
            <Brain className="h-4 w-4 mr-2" />
            Cognitive
          </TabsTrigger>
          <TabsTrigger value="audio">
            <Volume2 className="h-4 w-4 mr-2" />
            Audio
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Settings className="h-4 w-4 mr-2" />
            Advanced
          </TabsTrigger>
        </TabsList>

        {/* Visual Accessibility Settings */}
        <TabsContent value="visual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Visual Accessibility
              </CardTitle>
              <CardDescription>
                Customize visual settings for better readability and visibility.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Font Size and Zoom */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Base Font Size ({accessibilityStore.visual.fontSize}px)</Label>
                  <div className="mt-3">
                    <Slider
                      value={[accessibilityStore.visual.fontSize]}
                      onValueChange={([value]) => handleNestedChange('visual', 'fontSize', value)}
                      min={12}
                      max={24}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>12px</span>
                      <span>{accessibilityStore.visual.fontSize}px</span>
                      <span>24px</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Zoom Level ({accessibilityStore.visual.zoomLevel}%)</Label>
                  <div className="mt-3">
                    <Slider
                      value={[accessibilityStore.visual.zoomLevel]}
                      onValueChange={([value]) => handleNestedChange('visual', 'zoomLevel', value)}
                      min={100}
                      max={200}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>100%</span>
                      <span>{accessibilityStore.visual.zoomLevel}%</span>
                      <span>200%</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Visual Enhancement Features */}
              <div className="space-y-4">
                <h4 className="font-medium">Visual Enhancements</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h5 className="font-medium">High Contrast Mode</h5>
                      <p className="text-sm text-muted-foreground">
                        Increase contrast for better visibility
                      </p>
                    </div>
                    <Switch 
                      checked={accessibilityStore.visual.highContrast}
                      onCheckedChange={(checked) => handleFeatureToggle('high-contrast', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h5 className="font-medium">Reduced Motion</h5>
                      <p className="text-sm text-muted-foreground">
                        Minimize animations and transitions
                      </p>
                    </div>
                    <Switch 
                      checked={accessibilityStore.visual.reducedMotion}
                      onCheckedChange={(checked) => handleNestedChange('visual', 'reducedMotion', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h5 className="font-medium">Blur Effects</h5>
                      <p className="text-sm text-muted-foreground">
                        Enable backdrop blur effects
                      </p>
                    </div>
                    <Switch 
                      checked={accessibilityStore.visual.blurEffects}
                      onCheckedChange={(checked) => handleNestedChange('visual', 'blurEffects', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h5 className="font-medium">Background Patterns</h5>
                      <p className="text-sm text-muted-foreground">
                        Show subtle background patterns
                      </p>
                    </div>
                    <Switch 
                      checked={accessibilityStore.visual.backgroundPatterns}
                      onCheckedChange={(checked) => handleNestedChange('visual', 'backgroundPatterns', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Color Blindness Support */}
              <div className="space-y-4">
                <h4 className="font-medium">Color Blindness Support</h4>
                
                <div>
                  <Label>Color Blindness Mode</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    {colorBlindnessOptions.map((option) => (
                      <Card 
                        key={option.value}
                        className={`cursor-pointer transition-all ${
                          accessibilityStore.visual.colorBlindnessMode === option.value 
                            ? 'ring-2 ring-primary' : 'hover:shadow-md'
                        }`}
                        onClick={() => handleNestedChange('visual', 'colorBlindnessMode', option.value)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            {option.icon}
                            <div>
                              <h5 className="font-medium">{option.label}</h5>
                              <p className="text-sm text-muted-foreground">{option.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Color Blindness Simulation Strength</Label>
                  <div className="mt-3">
                    <Slider
                      value={[accessibilityStore.visual.colorBlindnessStrength]}
                      onValueChange={([value]) => handleNestedChange('visual', 'colorBlindnessStrength', value)}
                      min={0}
                      max={100}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>0%</span>
                      <span>{accessibilityStore.visual.colorBlindnessStrength}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Animation Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Animation & Motion</h4>
                
                <div>
                  <Label>Animation Duration (ms)</Label>
                  <div className="mt-3">
                    <Slider
                      value={[accessibilityStore.visual.animationDuration]}
                      onValueChange={([value]) => handleNestedChange('visual', 'animationDuration', value)}
                      min={0}
                      max={1000}
                      step={50}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>0ms</span>
                      <span>{accessibilityStore.visual.animationDuration}ms</span>
                      <span>1000ms</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Focus Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Focus Management
              </CardTitle>
              <CardDescription>
                Customize how focus indicators appear and behave.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Focus Indicator Style</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  {focusOptions.map((option) => (
                    <Card 
                      key={option.value}
                      className={`cursor-pointer transition-all ${
                        accessibilityStore.focus.focusIndicators === option.value 
                          ? 'ring-2 ring-primary' : 'hover:shadow-md'
                      }`}
                      onClick={() => handleNestedChange('focus', 'focusIndicators', option.value)}
                    >
                      <CardContent className="p-4">
                        <h5 className="font-medium">{option.label}</h5>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Focus Ring Color</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <input
                      type="color"
                      value={accessibilityStore.focus.focusRingColor}
                      onChange={(e) => handleNestedChange('focus', 'focusRingColor', e.target.value)}
                      className="w-12 h-10 rounded border cursor-pointer"
                    />
                    <Input
                      value={accessibilityStore.focus.focusRingColor}
                      onChange={(e) => handleNestedChange('focus', 'focusRingColor', e.target.value)}
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label>Focus Ring Width (px)</Label>
                  <div className="mt-2">
                    <Slider
                      value={[accessibilityStore.focus.focusRingWidth]}
                      onValueChange={([value]) => handleNestedChange('focus', 'focusRingWidth', value)}
                      min={1}
                      max={5}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium">Trap Focus in Modals</h5>
                    <p className="text-sm text-muted-foreground">Keep focus within modal dialogs</p>
                  </div>
                  <Switch 
                    checked={accessibilityStore.focus.trapFocusInModals}
                    onCheckedChange={(checked) => handleNestedChange('focus', 'trapFocusInModals', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium">Skip to Content</h5>
                    <p className="text-sm text-muted-foreground">Enable skip navigation links</p>
                  </div>
                  <Switch 
                    checked={accessibilityStore.focus.skipToContent}
                    onCheckedChange={(checked) => handleNestedChange('focus', 'skipToContent', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium">Focus Visible Only</h5>
                    <p className="text-sm text-muted-foreground">Only show focus when using keyboard</p>
                  </div>
                  <Switch 
                    checked={accessibilityStore.focus.focusVisibleOnly}
                    onCheckedChange={(checked) => handleNestedChange('focus', 'focusVisibleOnly', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Motor Accessibility Settings */}
        <TabsContent value="motor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mouse className="h-5 w-5 mr-2" />
                Motor Accessibility
              </CardTitle>
              <CardDescription>
                Customize interaction methods and controls for motor impairments.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Touch Target Size */}
              <div>
                <Label>Touch Target Size</Label>
                <div className="grid grid-cols-4 gap-3 mt-3">
                  {[
                    { value: 'small', label: 'Small', size: '44px', description: 'Minimum size' },
                    { value: 'medium', label: 'Medium', size: '48px', description: 'Recommended' },
                    { value: 'large', label: 'Large', size: '56px', description: 'Easy to tap' },
                    { value: 'xlarge', label: 'Extra Large', size: '64px', description: 'Maximum comfort' },
                  ].map((option) => (
                    <Card 
                      key={option.value}
                      className={`cursor-pointer transition-all ${
                        accessibilityStore.motor.touchTargetSize === option.value 
                          ? 'ring-2 ring-primary' : 'hover:shadow-md'
                      }`}
                      onClick={() => handleNestedChange('motor', 'touchTargetSize', option.value)}
                    >
                      <CardContent className="p-4 text-center">
                        <div 
                          className="w-8 h-8 bg-primary mx-auto mb-2 rounded"
                          style={{ width: option.size, height: '20px' }}
                        />
                        <h5 className="font-medium text-sm">{option.label}</h5>
                        <p className="text-xs text-muted-foreground">{option.size}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Alternative Interaction Methods */}
              <div className="space-y-4">
                <h4 className="font-medium">Alternative Interaction Methods</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h5 className="font-medium">Drag & Drop Alternative</h5>
                      <p className="text-sm text-muted-foreground">
                        Provide alternative to drag and drop
                      </p>
                    </div>
                    <Switch 
                      checked={accessibilityStore.motor.dragAndDropAlternative}
                      onCheckedChange={(checked) => handleNestedChange('motor', 'dragAndDropAlternative', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h5 className="font-medium">Gesture Alternative</h5>
                      <p className="text-sm text-muted-foreground">
                        Provide alternative to complex gestures
                      </p>
                    </div>
                    <Switch 
                      checked={accessibilityStore.motor.gestureAlternative}
                      onCheckedChange={(checked) => handleNestedChange('motor', 'gestureAlternative', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h5 className="font-medium">Voice Control</h5>
                      <p className="text-sm text-muted-foreground">
                        Enable voice command support
                      </p>
                    </div>
                    <Switch 
                      checked={accessibilityStore.motor.voiceControl}
                      onCheckedChange={(checked) => handleNestedChange('motor', 'voiceControl', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h5 className="font-medium">Switch Control</h5>
                      <p className="text-sm text-muted-foreground">
                        Enable switch control support
                      </p>
                    </div>
                    <Switch 
                      checked={accessibilityStore.motor.switchControl}
                      onCheckedChange={(checked) => handleNestedChange('motor', 'switchControl', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Timeout Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Timeout Management</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">Adjustable Timeouts</h5>
                      <p className="text-sm text-muted-foreground">
                        Allow timeout duration adjustment
                      </p>
                    </div>
                    <Switch 
                      checked={accessibilityStore.motor.timeouts.adjustable}
                      onCheckedChange={(checked) => handleNestedChange('motor', 'timeouts', {
                        ...accessibilityStore.motor.timeouts,
                        adjustable: checked
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">Timeout Warnings</h5>
                      <p className="text-sm text-muted-foreground">
                        Show warnings before timeouts
                      </p>
                    </div>
                    <Switch 
                      checked={accessibilityStore.motor.timeouts.warning}
                      onCheckedChange={(checked) => handleNestedChange('motor', 'timeouts', {
                        ...accessibilityStore.motor.timeouts,
                        warning: checked
                      })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Timeout Extension (minutes)</Label>
                  <div className="mt-2">
                    <Slider
                      value={[accessibilityStore.motor.timeouts.extension]}
                      onValueChange={([value]) => handleNestedChange('motor', 'timeouts', {
                        ...accessibilityStore.motor.timeouts,
                        extension: value
                      })}
                      min={1}
                      max={30}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>1 min</span>
                      <span>{accessibilityStore.motor.timeouts.extension} min</span>
                      <span>30 min</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cognitive Accessibility Settings */}
        <TabsContent value="cognitive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                Cognitive Accessibility
              </CardTitle>
              <CardDescription>
                Customize interface and content for cognitive accessibility.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Interface Simplification */}
              <div className="space-y-4">
                <h4 className="font-medium">Interface Simplification</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h5 className="font-medium">Simplified Interface</h5>
                      <p className="text-sm text-muted-foreground">
                        Reduce interface complexity
                      </p>
                    </div>
                    <Switch 
                      checked={accessibilityStore.cognitive.simplifiedInterface}
                      onCheckedChange={(checked) => handleNestedChange('cognitive', 'simplifiedInterface', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h5 className="font-medium">Reading Mode</h5>
                      <p className="text-sm text-muted-foreground">
                        Enable distraction-free reading
                      </p>
                    </div>
                    <Switch 
                      checked={accessibilityStore.cognitive.readingMode}
                      onCheckedChange={(checked) => handleNestedChange('cognitive', 'readingMode', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Typography for Dyslexia */}
              <div className="space-y-4">
                <h4 className="font-medium">Dyslexia-Friendly Settings</h4>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Dyslexia Font</h5>
                    <p className="text-sm text-muted-foreground">
                      Use fonts optimized for dyslexia
                    </p>
                  </div>
                  <Switch 
                    checked={accessibilityStore.cognitive.dyslexiaFont}
                    onCheckedChange={(checked) => handleNestedChange('cognitive', 'dyslexiaFont', checked)}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Line Spacing</Label>
                    <div className="mt-3">
                      <Slider
                        value={[accessibilityStore.cognitive.lineSpacing]}
                        onValueChange={([value]) => handleNestedChange('cognitive', 'lineSpacing', value)}
                        min={1.0}
                        max={2.0}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>1.0</span>
                        <span>{accessibilityStore.cognitive.lineSpacing}</span>
                        <span>2.0</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Word Spacing (em)</Label>
                    <div className="mt-3">
                      <Slider
                        value={[accessibilityStore.cognitive.wordSpacing]}
                        onValueChange={([value]) => handleNestedChange('cognitive', 'wordSpacing', value)}
                        min={0}
                        max={1.0}
                        step={0.05}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>0</span>
                        <span>{accessibilityStore.cognitive.wordSpacing}</span>
                        <span>1.0</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Letter Spacing (em)</Label>
                    <div className="mt-3">
                      <Slider
                        value={[accessibilityStore.cognitive.letterSpacing]}
                        onValueChange={([value]) => handleNestedChange('cognitive', 'letterSpacing', value)}
                        min={0}
                        max={0.1}
                        step={0.01}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>0</span>
                        <span>{accessibilityStore.cognitive.letterSpacing}</span>
                        <span>0.1</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Content Simplification */}
              <div className="space-y-4">
                <h4 className="font-medium">Content Simplification</h4>
                
                <div className="space-y-3">
                  {Object.entries(accessibilityStore.cognitive.simplification).map(([key, enabled]) => {
                    const labels = {
                      complexWords: 'Simplify Complex Words',
                      jargon: 'Replace Jargon',
                      metaphors: 'Avoid Metaphors',
                      idioms: 'Avoid Idioms',
                    };
                    const descriptions = {
                      complexWords: 'Replace complex words with simpler alternatives',
                      jargon: 'Replace technical jargon with plain language',
                      metaphors: 'Use literal language instead of metaphors',
                      idioms: 'Use literal language instead of idioms',
                    };

                    return (
                      <div key={key} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <h5 className="font-medium text-sm">{labels[key as keyof typeof labels]}</h5>
                          <p className="text-xs text-muted-foreground">{descriptions[key as keyof typeof descriptions]}</p>
                        </div>
                        <Switch 
                          checked={enabled}
                          onCheckedChange={(checked) => handleNestedChange('cognitive', 'simplification', {
                            ...accessibilityStore.cognitive.simplification,
                            [key]: checked
                          })}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Advanced Features */}
              <div className="space-y-4">
                <h4 className="font-medium">Advanced Cognitive Support</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h5 className="font-medium">Text-to-Speech</h5>
                      <p className="text-sm text-muted-foreground">
                        Read content aloud
                      </p>
                    </div>
                    <Switch 
                      checked={accessibilityStore.cognitive.textToSpeech}
                      onCheckedChange={(checked) => handleNestedChange('cognitive', 'textToSpeech', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h5 className="font-medium">Speech-to-Text</h5>
                      <p className="text-sm text-muted-foreground">
                        Dictate text input
                      </p>
                    </div>
                    <Switch 
                      checked={accessibilityStore.cognitive.speechToText}
                      onCheckedChange={(checked) => handleNestedChange('cognitive', 'speechToText', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h5 className="font-medium">Pronunciation Guide</h5>
                      <p className="text-sm text-muted-foreground">
                        Show pronunciation for difficult words
                      </p>
                    </div>
                    <Switch 
                      checked={accessibilityStore.cognitive.pronunciationGuide}
                      onCheckedChange={(checked) => handleNestedChange('cognitive', 'pronunciationGuide', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h5 className="font-medium">Text Highlighting</h5>
                      <p className="text-sm text-muted-foreground">
                        Highlight selected text
                      </p>
                    </div>
                    <Switch 
                      checked={accessibilityStore.cognitive.textHighlighting || false}
                      onCheckedChange={(checked) => handleNestedChange('cognitive', 'textHighlighting', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audio Accessibility Settings */}
        <TabsContent value="audio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Volume2 className="h-5 w-5 mr-2" />
                Audio Accessibility
              </CardTitle>
              <CardDescription>
                Customize audio settings and alternative audio content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Audio Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Audio Descriptions</h5>
                    <p className="text-sm text-muted-foreground">
                      Provide audio descriptions of visual content
                    </p>
                  </div>
                  <Switch 
                    checked={accessibilityStore.audio.audioDescriptions}
                    onCheckedChange={(checked) => handleNestedChange('audio', 'audioDescriptions', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Captions</h5>
                    <p className="text-sm text-muted-foreground">
                      Show captions for videos
                    </p>
                  </div>
                  <Switch 
                    checked={accessibilityStore.audio.captions}
                    onCheckedChange={(checked) => handleNestedChange('audio', 'captions', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Subtitles</h5>
                    <p className="text-sm text-muted-foreground">
                      Show subtitles for audio content
                    </p>
                  </div>
                  <Switch 
                    checked={accessibilityStore.audio.subtitles}
                    onCheckedChange={(checked) => handleNestedChange('audio', 'subtitles', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Sign Language</h5>
                    <p className="text-sm text-muted-foreground">
                      Display sign language interpretation
                    </p>
                  </div>
                  <Switch 
                    checked={accessibilityStore.audio.signLanguage}
                    onCheckedChange={(checked) => handleNestedChange('audio', 'signLanguage', checked)}
                  />
                </div>
              </div>

              <Separator />

              {/* Audio Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Audio Preferences</h4>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h5 className="font-medium">Audio Notifications</h5>
                      <p className="text-sm text-muted-foreground">
                        Play sound for notifications
                      </p>
                    </div>
                    <Switch 
                      checked={accessibilityStore.audio.audioNotifications}
                      onCheckedChange={(checked) => handleNestedChange('audio', 'audioNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h5 className="font-medium">Sound Effects</h5>
                      <p className="text-sm text-muted-foreground">
                        Play interface sound effects
                      </p>
                    </div>
                    <Switch 
                      checked={accessibilityStore.audio.soundEffects}
                      onCheckedChange={(checked) => handleNestedChange('audio', 'soundEffects', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h5 className="font-medium">Background Noise</h5>
                      <p className="text-sm text-muted-foreground">
                        Play background ambient sounds
                      </p>
                    </div>
                    <Switch 
                      checked={accessibilityStore.audio.backgroundNoise}
                      onCheckedChange={(checked) => handleNestedChange('audio', 'backgroundNoise', checked)}
                    />
                  </div>
                </div>

                <div>
                  <Label>Volume Level ({accessibilityStore.audio.volumeLevel}%)</Label>
                  <div className="mt-3">
                    <Slider
                      value={[accessibilityStore.audio.volumeLevel]}
                      onValueChange={([value]) => handleNestedChange('audio', 'volumeLevel', value)}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>0%</span>
                      <span>{accessibilityStore.audio.volumeLevel}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-6">
          {/* Device Optimization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Monitor className="h-5 w-5 mr-2" />
                Device Optimization
              </CardTitle>
              <CardDescription>
                Optimize accessibility settings for your device type.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleDeviceAdjustment('desktop')}
                  className="h-20 flex-col space-y-2"
                >
                  <Monitor className="h-6 w-6" />
                  <span>Desktop</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDeviceAdjustment('tablet')}
                  className="h-20 flex-col space-y-2"
                >
                  <Tablet className="h-6 w-6" />
                  <span>Tablet</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDeviceAdjustment('mobile')}
                  className="h-20 flex-col space-y-2"
                >
                  <Smartphone className="h-6 w-6" />
                  <span>Mobile</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Environmental Presets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                Environmental Presets
              </CardTitle>
              <CardDescription>
                Apply accessibility settings based on your environment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:shadow-md" onClick={() => handleEnvironmentPreset('bright')}>
                  <CardContent className="p-4 text-center">
                    <Sun className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                    <h5 className="font-medium">Bright Environment</h5>
                    <p className="text-xs text-muted-foreground mt-1">High contrast, reduced motion</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md" onClick={() => handleEnvironmentPreset('dim')}>
                  <CardContent className="p-4 text-center">
                    <Moon className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <h5 className="font-medium">Dim Environment</h5>
                    <p className="text-xs text-muted-foreground mt-1">High contrast, longer animations</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md" onClick={() => handleEnvironmentPreset('dark')}>
                  <CardContent className="p-4 text-center">
                    <EyeOff className="h-6 w-6 mx-auto mb-2 text-gray-500" />
                    <h5 className="font-medium">Dark Environment</h5>
                    <p className="text-xs text-muted-foreground mt-1">High contrast, no patterns</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Accessibility Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TestTube className="h-5 w-5 mr-2" />
                Accessibility Testing
              </CardTitle>
              <CardDescription>
                Test and evaluate accessibility compliance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {testResults && (
                <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h5 className="font-medium text-green-900">Test Results</h5>
                  </div>
                  <div className="text-sm text-green-700">
                    <p>Score: {testResults.score}%</p>
                    <p>Status: {testResults.passed ? 'Passed' : 'Failed'}</p>
                    <p>Issues: {testResults.issues.length}</p>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={handleRunTest}
                  disabled={isTesting}
                >
                  {isTesting ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4 mr-2" />
                  )}
                  Run Accessibility Test
                </Button>
                <Button variant="outline" onClick={handleCheckCompliance}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  WCAG Compliance Check
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Emergency Features
              </CardTitle>
              <CardDescription>
                Emergency accessibility features for critical situations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Emergency Contact</h5>
                    <p className="text-sm text-muted-foreground">
                      Enable emergency contact features
                    </p>
                  </div>
                  <Switch 
                    checked={accessibilityStore.emergency.emergencyContact}
                    onCheckedChange={(checked) => handleNestedChange('emergency', 'emergencyContact', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Panic Button</h5>
                    <p className="text-sm text-muted-foreground">
                      Enable emergency panic button
                    </p>
                  </div>
                  <Switch 
                    checked={accessibilityStore.emergency.panicButton}
                    onCheckedChange={(checked) => handleNestedChange('emergency', 'panicButton', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Location Sharing</h5>
                    <p className="text-sm text-muted-foreground">
                      Share location in emergency
                    </p>
                  </div>
                  <Switch 
                    checked={accessibilityStore.emergency.locationSharing}
                    onCheckedChange={(checked) => handleNestedChange('emergency', 'locationSharing', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Medical Alert</h5>
                    <p className="text-sm text-muted-foreground">
                      Show medical information
                    </p>
                  </div>
                  <Switch 
                    checked={accessibilityStore.emergency.medicalAlert}
                    onCheckedChange={(checked) => handleNestedChange('emergency', 'medicalAlert', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assistive Technology Support */}
          <Card>
            <CardHeader>
              <CardTitle>Assistive Technology Support</CardTitle>
              <CardDescription>
                Current status of detected assistive technologies.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(accessibilityStore.detectedCapabilities).map(([technology, detected]) => (
                  <div key={technology} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      {technology === 'hasKeyboard' && <Keyboard className="h-4 w-4" />}
                      {technology === 'hasMouse' && <Mouse className="h-4 w-4" />}
                      {technology === 'hasTouch' && <Touch className="h-4 w-4" />}
                      {technology === 'hasScreenReader' && <Eye className="h-4 w-4" />}
                      {technology === 'hasHighContrast' && <Contrast className="h-4 w-4" />}
                      <span className="font-medium capitalize">
                        {technology.replace('has', '')}
                      </span>
                    </div>
                    <Badge variant={detected ? 'default' : 'secondary'}>
                      {detected ? 'Detected' : 'Not Detected'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Bar */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t">
        <div className="flex items-center space-x-4">
          {isDirty && (
            <div className="flex items-center text-amber-600">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="text-sm">You have unsaved changes</span>
            </div>
          )}
          {lastSaved && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span className="text-sm">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            </div>
          )}
          <div className="flex items-center text-blue-600">
            <Gauge className="h-4 w-4 mr-2" />
            <span className="text-sm">
              WCAG Compliance: {accessibilityStore.complianceScore}%
            </span>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleReset} disabled={!isDirty}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!isDirty || isSaving}
          >
            {isSaving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccessibilitySettings;