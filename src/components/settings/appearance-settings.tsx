import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Sun, 
  Moon, 
  Monitor, 
  Eye, 
  Type, 
  Layout,
  Zap,
  Save,
  RotateCcw,
  Download,
  Upload,
  Plus,
  Trash2,
  Copy,
  EyeOff,
  RefreshCw,
  Grid,
  Circle,
  Square,
  Sparkles,
  Contrast,
  Droplets,
  Waves,
  Mountain,
  Sunset,
  Shirt
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
import { useThemePreferencesStore } from '../../lib/preferences/theme-preferences';
import { usePreferencesStore } from '../../lib/preferences/preferences-manager';

interface AppearanceSettingsProps {
  onSave?: () => void;
  onReset?: () => void;
}

export const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({
  onSave,
  onReset,
}) => {
  const themeStore = useThemePreferencesStore();
  const preferencesStore = usePreferencesStore();
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [customThemeName, setCustomThemeName] = useState('');

  // Theme mode icons
  const modeIcons = {
    light: <Sun className="h-4 w-4" />,
    dark: <Moon className="h-4 w-4" />,
    auto: <Monitor className="h-4 w-4" />,
    custom: <Palette className="h-4 w-4" />,
  };

  // Color scheme options with previews
  const colorSchemes = [
    {
      id: 'default',
      name: 'Default',
      description: 'Clean and professional',
      colors: { primary: '#3b82f6', secondary: '#6366f1', accent: '#10b981' },
      preview: '🌟',
    },
    {
      id: 'ocean',
      name: 'Ocean',
      description: 'Calming blue tones',
      colors: { primary: '#0ea5e9', secondary: '#06b6d4', accent: '#0891b2' },
      preview: '🌊',
    },
    {
      id: 'forest',
      name: 'Forest',
      description: 'Natural green palette',
      colors: { primary: '#059669', secondary: '#10b981', accent: '#84cc16' },
      preview: '🌲',
    },
    {
      id: 'sunset',
      name: 'Sunset',
      description: 'Warm orange and pink',
      colors: { primary: '#ea580c', secondary: '#dc2626', accent: '#f59e0b' },
      preview: '🌅',
    },
    {
      id: 'purple',
      name: 'Purple Haze',
      description: 'Rich purple theme',
      colors: { primary: '#9333ea', secondary: '#a855f7', accent: '#c084fc' },
      preview: '🟣',
    },
    {
      id: 'custom',
      name: 'Custom',
      description: 'Create your own',
      colors: { primary: themeStore.customColors.primary, secondary: themeStore.customColors.secondary, accent: themeStore.customColors.accent },
      preview: '🎨',
    },
  ];

  // Typography options
  const fontFamilies = [
    { value: 'system', label: 'System Default', description: 'Uses your OS font' },
    { value: 'sans', label: 'Sans Serif', description: 'Clean, modern fonts' },
    { value: 'serif', label: 'Serif', description: 'Traditional, readable fonts' },
    { value: 'mono', label: 'Monospace', description: 'Code-like fonts' },
  ];

  const fontSizes = [
    { value: 'small', label: 'Small', size: '14px', description: 'Compact view' },
    { value: 'medium', label: 'Medium', size: '16px', description: 'Standard size' },
    { value: 'large', label: 'Large', size: '18px', description: 'Enhanced readability' },
    { value: 'xlarge', label: 'Extra Large', size: '20px', description: 'Maximum readability' },
  ];

  // Density options
  const densityOptions = [
    {
      value: 'compact',
      label: 'Compact',
      description: 'Maximum content density',
      icon: <Grid className="h-4 w-4" />,
    },
    {
      value: 'comfortable',
      label: 'Comfortable',
      description: 'Balanced spacing',
      icon: <Layout className="h-4 w-4" />,
    },
    {
      value: 'spacious',
      label: 'Spacious',
      description: 'Generous whitespace',
      icon: <Eye className="h-4 w-4" />,
    },
  ];

  // Border radius options
  const borderRadiusOptions = [
    { value: 'none', label: 'None', style: '0px' },
    { value: 'small', label: 'Small', style: '4px' },
    { value: 'medium', label: 'Medium', style: '8px' },
    { value: 'large', label: 'Large', style: '16px' },
    { value: 'full', label: 'Full', style: '9999px' },
  ];

  // Shadow options
  const shadowOptions = [
    { value: 'none', label: 'None', description: 'No shadows' },
    { value: 'subtle', label: 'Subtle', description: 'Light shadows for depth' },
    { value: 'medium', label: 'Medium', description: 'Balanced shadows' },
    { value: 'strong', label: 'Strong', description: 'Dramatic shadows' },
  ];

  // Handle theme mode change
  const handleModeChange = (mode: typeof themeStore.mode) => {
    themeStore.setMode(mode);
    setIsDirty(true);
  };

  // Handle color scheme change
  const handleColorSchemeChange = (scheme: typeof themeStore.colorScheme) => {
    themeStore.setColorScheme(scheme);
    setIsDirty(true);
  };

  // Handle custom color change
  const handleColorChange = (colorKey: keyof typeof themeStore.customColors, value: string) => {
    themeStore.updateColor(colorKey, value);
    setIsDirty(true);
  };

  // Handle typography change
  const handleTypographyChange = (property: string, value: any) => {
    themeStore.updateThemePreference(property as any, value);
    setIsDirty(true);
  };

  // Create custom theme
  const handleCreateCustomTheme = () => {
    if (!customThemeName.trim()) return;
    
    const themeId = themeStore.createCustomTheme(customThemeName, {
      customColors: themeStore.customColors,
      typography: {
        fontFamily: themeStore.fontFamily,
        fontSize: themeStore.fontSize,
        density: themeStore.density,
      },
      layout: {
        borderRadius: themeStore.borderRadius,
        shadows: themeStore.shadows,
      },
    });
    
    setCustomThemeName('');
    setIsDirty(true);
  };

  // Delete custom theme
  const handleDeleteCustomTheme = (id: string) => {
    if (confirm('Are you sure you want to delete this custom theme?')) {
      themeStore.deleteCustomTheme(id);
      setIsDirty(true);
    }
  };

  // Duplicate theme
  const handleDuplicateTheme = (id: string, name: string) => {
    const newName = prompt('Enter name for duplicated theme:', `${name} Copy`);
    if (newName) {
      themeStore.duplicateTheme(id, newName);
      setIsDirty(true);
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
      console.error('Failed to save appearance settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = () => {
    if (confirm('Are you sure you want to reset all appearance settings to defaults?')) {
      themeStore.resetToDefaults();
      setIsDirty(true);
    }
  };

  // Apply system preferences
  const applySystemPreferences = () => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    themeStore.updateThemePreference('mode', prefersDark ? 'dark' : 'light');
    themeStore.updateThemePreference('reducedMotion', prefersReducedMotion);
    setIsDirty(true);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Tabs defaultValue="theme" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="theme">
            <Palette className="h-4 w-4 mr-2" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="colors">
            <Waves className="h-4 w-4 mr-2" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="typography">
            <Type className="h-4 w-4 mr-2" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="layout">
            <Layout className="h-4 w-4 mr-2" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Sparkles className="h-4 w-4 mr-2" />
            Advanced
          </TabsTrigger>
        </TabsList>

        {/* Theme Settings */}
        <TabsContent value="theme" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {modeIcons[themeStore.mode]}
                <span className="ml-2">Theme Mode</span>
              </CardTitle>
              <CardDescription>
                Choose how the interface appears in different lighting conditions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(modeIcons).map(([mode, icon]) => (
                  <Card 
                    key={mode}
                    className={`cursor-pointer transition-all ${
                      themeStore.mode === mode ? 'ring-2 ring-primary' : 'hover:shadow-md'
                    }`}
                    onClick={() => handleModeChange(mode as any)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center mb-2">{icon}</div>
                      <h3 className="font-medium capitalize">{mode}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {mode === 'light' && 'Bright theme for day use'}
                        {mode === 'dark' && 'Dark theme for night use'}
                        {mode === 'auto' && 'Follow system preference'}
                        {mode === 'custom' && 'Use custom settings'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Separator />

              <div>
                <Label>Color Scheme</Label>
                <div className="grid grid-cols-3 gap-4 mt-3">
                  {colorSchemes.map((scheme) => (
                    <Card 
                      key={scheme.id}
                      className={`cursor-pointer transition-all ${
                        themeStore.colorScheme === scheme.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                      }`}
                      onClick={() => handleColorSchemeChange(scheme.id as any)}
                    >
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl mb-2">{scheme.preview}</div>
                          <h3 className="font-medium">{scheme.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {scheme.description}
                          </p>
                          <div className="flex justify-center space-x-1 mt-3">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: scheme.colors.primary }}
                            />
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: scheme.colors.secondary }}
                            />
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: scheme.colors.accent }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={applySystemPreferences}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Use System Preferences
                </Button>
                <p className="text-sm text-muted-foreground">
                  Apply system dark mode and reduced motion settings
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Color Customization */}
        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Waves className="h-5 w-5 mr-2" />
                Color Customization
              </CardTitle>
              <CardDescription>
                Customize colors for the interface. Click on a color to change it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {Object.entries(themeStore.customColors).map(([key, color]) => (
                  <div key={key} className="space-y-2">
                    <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => handleColorChange(key as any, e.target.value)}
                        className="w-12 h-10 rounded border cursor-pointer"
                      />
                      <Input
                        value={color}
                        onChange={(e) => handleColorChange(key as any, e.target.value)}
                        placeholder="#000000"
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Color Accessibility</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Color Blindness Mode</Label>
                    <Select 
                      value={themeStore.colorBlindnessMode} 
                      onValueChange={(value) => handleTypographyChange('colorBlindnessMode', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="protanopia">Protanopia (Red-blind)</SelectItem>
                        <SelectItem value="deuteranopia">Deuteranopia (Green-blind)</SelectItem>
                        <SelectItem value="tritanopia">Tritanopia (Blue-blind)</SelectItem>
                        <SelectItem value="achromatopsia">Achromatopsia (Color-blind)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>High Contrast Mode</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Switch 
                        checked={themeStore.highContrast}
                        onCheckedChange={(checked) => handleTypographyChange('highContrast', checked)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {themeStore.highContrast ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Typography Settings */}
        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Type className="h-5 w-5 mr-2" />
                Typography & Fonts
              </CardTitle>
              <CardDescription>
                Customize fonts, sizes, and text appearance for optimal readability.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Font Family</Label>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  {fontFamilies.map((font) => (
                    <Card 
                      key={font.value}
                      className={`cursor-pointer transition-all ${
                        themeStore.fontFamily === font.value ? 'ring-2 ring-primary' : 'hover:shadow-md'
                      }`}
                      onClick={() => handleTypographyChange('fontFamily', font.value)}
                    >
                      <CardContent className="p-4">
                        <h3 className="font-medium">{font.label}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {font.description}
                        </p>
                        <div 
                          className="mt-3 text-lg"
                          style={{ fontFamily: font.value }}
                        >
                          Sample Text 123
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <Label>Font Size</Label>
                <div className="grid grid-cols-4 gap-4 mt-3">
                  {fontSizes.map((size) => (
                    <Card 
                      key={size.value}
                      className={`cursor-pointer transition-all ${
                        themeStore.fontSize === size.value ? 'ring-2 ring-primary' : 'hover:shadow-md'
                      }`}
                      onClick={() => handleTypographyChange('fontSize', size.value)}
                    >
                      <CardContent className="p-4 text-center">
                        <h3 className="font-medium">{size.label}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {size.description}
                        </p>
                        <div 
                          className="mt-3"
                          style={{ fontSize: size.size }}
                        >
                          Sample Text
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Line Height</Label>
                  <div className="mt-3">
                    <Slider
                      value={[themeStore.lineHeight]}
                      onValueChange={([value]) => handleTypographyChange('lineHeight', value)}
                      min={1.0}
                      max={2.0}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>1.0</span>
                      <span>{themeStore.lineHeight}</span>
                      <span>2.0</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Letter Spacing</Label>
                  <div className="mt-3">
                    <Slider
                      value={[themeStore.letterSpacing]}
                      onValueChange={([value]) => handleTypographyChange('letterSpacing', value)}
                      min={0}
                      max={0.1}
                      step={0.01}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>0</span>
                      <span>{themeStore.letterSpacing}</span>
                      <span>0.1</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Layout Settings */}
        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Layout className="h-5 w-5 mr-2" />
                Layout & Spacing
              </CardTitle>
              <CardDescription>
                Customize layout density, spacing, and component appearance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Layout Density</Label>
                <div className="grid grid-cols-3 gap-4 mt-3">
                  {densityOptions.map((option) => (
                    <Card 
                      key={option.value}
                      className={`cursor-pointer transition-all ${
                        themeStore.density === option.value ? 'ring-2 ring-primary' : 'hover:shadow-md'
                      }`}
                      onClick={() => handleTypographyChange('density', option.value)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          {option.icon}
                          <h3 className="font-medium">{option.label}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <Label>Border Radius</Label>
                <div className="grid grid-cols-5 gap-4 mt-3">
                  {borderRadiusOptions.map((option) => (
                    <Card 
                      key={option.value}
                      className={`cursor-pointer transition-all ${
                        themeStore.borderRadius === option.value ? 'ring-2 ring-primary' : 'hover:shadow-md'
                      }`}
                      onClick={() => handleTypographyChange('borderRadius', option.value)}
                    >
                      <CardContent className="p-4 text-center">
                        <h3 className="font-medium">{option.label}</h3>
                        <div className="mt-3">
                          <div 
                            className="w-full h-8 bg-primary"
                            style={{ borderRadius: option.style }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <Label>Shadow Intensity</Label>
                <div className="grid grid-cols-4 gap-4 mt-3">
                  {shadowOptions.map((option) => (
                    <Card 
                      key={option.value}
                      className={`cursor-pointer transition-all ${
                        themeStore.shadows === option.value ? 'ring-2 ring-primary' : 'hover:shadow-md'
                      }`}
                      onClick={() => handleTypographyChange('shadows', option.value)}
                    >
                      <CardContent className="p-4 text-center">
                        <h3 className="font-medium">{option.label}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {option.description}
                        </p>
                        <div className="mt-3">
                          <div 
                            className="w-full h-8 bg-background border"
                            style={{ 
                              boxShadow: option.value === 'none' ? 'none' :
                                        option.value === 'subtle' ? '0 1px 3px rgba(0,0,0,0.12)' :
                                        option.value === 'medium' ? '0 4px 8px rgba(0,0,0,0.12)' :
                                        '0 8px 16px rgba(0,0,0,0.12)'
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2" />
                Advanced Customization
              </CardTitle>
              <CardDescription>
                Fine-tune animation, motion, and advanced visual settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Animation Duration</Label>
                  <div className="mt-3">
                    <Slider
                      value={[themeStore.animationDuration]}
                      onValueChange={([value]) => handleTypographyChange('animationDuration', value)}
                      min={0}
                      max={1000}
                      step={50}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>0ms</span>
                      <span>{themeStore.animationDuration}ms</span>
                      <span>1000ms</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Animation Easing</Label>
                  <Select 
                    value={themeStore.animationEase} 
                    onValueChange={(value) => handleTypographyChange('animationEase', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linear">Linear</SelectItem>
                      <SelectItem value="ease">Ease</SelectItem>
                      <SelectItem value="ease-in">Ease In</SelectItem>
                      <SelectItem value="ease-out">Ease Out</SelectItem>
                      <SelectItem value="ease-in-out">Ease In Out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Reduced Motion</h4>
                    <p className="text-sm text-muted-foreground">
                      Minimize animations for accessibility
                    </p>
                  </div>
                  <Switch 
                    checked={themeStore.reducedMotion}
                    onCheckedChange={(checked) => handleTypographyChange('reducedMotion', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Blur Effects</h4>
                    <p className="text-sm text-muted-foreground">
                      Enable backdrop blur and blur effects
                    </p>
                  </div>
                  <Switch 
                    checked={themeStore.blurEffects || false}
                    onCheckedChange={(checked) => handleTypographyChange('blurEffects', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Background Patterns</h4>
                    <p className="text-sm text-muted-foreground">
                      Show subtle background patterns
                    </p>
                  </div>
                  <Switch 
                    checked={themeStore.backgroundPatterns || false}
                    onCheckedChange={(checked) => handleTypographyChange('backgroundPatterns', checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Component Styles</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Button Style</Label>
                    <Select 
                      value={themeStore.buttonStyle || 'filled'} 
                      onValueChange={(value) => handleTypographyChange('buttonStyle', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="filled">Filled</SelectItem>
                        <SelectItem value="outline">Outline</SelectItem>
                        <SelectItem value="ghost">Ghost</SelectItem>
                        <SelectItem value="link">Link</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Card Style</Label>
                    <Select 
                      value={themeStore.cardStyle || 'elevated'} 
                      onValueChange={(value) => handleTypographyChange('cardStyle', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flat">Flat</SelectItem>
                        <SelectItem value="elevated">Elevated</SelectItem>
                        <SelectItem value="bordered">Bordered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Input Style</Label>
                    <Select 
                      value={themeStore.inputStyle || 'outline'} 
                      onValueChange={(value) => handleTypographyChange('inputStyle', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="filled">Filled</SelectItem>
                        <SelectItem value="outline">Outline</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Custom CSS</h4>
                <p className="text-sm text-muted-foreground">
                  Add custom CSS to further customize the appearance (advanced users only).
                </p>
                <textarea
                  value={themeStore.customCSS || ''}
                  onChange={(e) => handleTypographyChange('customCSS', e.target.value)}
                  placeholder="/* Enter your custom CSS here */"
                  className="w-full h-32 p-3 border rounded-md font-mono text-sm"
                />
                {!themeStore.validateCustomCSS() && (
                  <p className="text-sm text-destructive">
                    ⚠️ Invalid CSS detected. Please check your syntax.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Custom Themes */}
          {themeStore.customThemes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Custom Themes</span>
                  <Badge variant="secondary">{themeStore.customThemes.length}</Badge>
                </CardTitle>
                <CardDescription>
                  Manage your custom created themes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {themeStore.customThemes.map((theme) => (
                    <Card key={theme.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium">{theme.name}</h3>
                          <div className="flex space-x-1">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleDuplicateTheme(theme.id, theme.name)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleDeleteCustomTheme(theme.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Created {theme.createdAt.toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Create New Theme */}
          <Card>
            <CardHeader>
              <CardTitle>Create Custom Theme</CardTitle>
              <CardDescription>
                Save your current settings as a custom theme.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="theme-name">Theme Name</Label>
                <Input
                  id="theme-name"
                  value={customThemeName}
                  onChange={(e) => setCustomThemeName(e.target.value)}
                  placeholder="My Custom Theme"
                />
              </div>
              <Button 
                onClick={handleCreateCustomTheme}
                disabled={!customThemeName.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Theme
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Bar */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t">
        <div className="flex items-center space-x-4">
          {isDirty && (
            <div className="flex items-center text-amber-600">
              <Eye className="h-4 w-4 mr-2" />
              <span className="text-sm">You have unsaved changes</span>
            </div>
          )}
          {lastSaved && (
            <div className="flex items-center text-green-600">
              <EyeOff className="h-4 w-4 mr-2" />
              <span className="text-sm">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            </div>
          )}
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

export default AppearanceSettings;