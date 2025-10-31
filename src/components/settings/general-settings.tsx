import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Clock, 
  Calendar, 
  DollarSign, 
  Save, 
  RotateCcw, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info,
  MapPin,
  Languages,
  Keyboard
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
import { usePreferencesStore } from '../../lib/preferences/preferences-manager';

interface GeneralSettingsProps {
  onSave?: () => void;
  onReset?: () => void;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  onSave,
  onReset,
}) => {
  const preferences = usePreferencesStore();
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Supported languages with native names and flags
  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  ];

  // Time zones grouped by region
  const timeZones = [
    {
      region: 'UTC',
      zones: [
        { value: 'UTC', label: 'UTC - Coordinated Universal Time' },
      ],
    },
    {
      region: 'North America',
      zones: [
        { value: 'America/New_York', label: 'EST - Eastern Standard Time' },
        { value: 'America/Chicago', label: 'CST - Central Standard Time' },
        { value: 'America/Denver', label: 'MST - Mountain Standard Time' },
        { value: 'America/Los_Angeles', label: 'PST - Pacific Standard Time' },
        { value: 'America/Anchorage', label: 'AKST - Alaska Standard Time' },
        { value: 'Pacific/Honolulu', label: 'HST - Hawaii Standard Time' },
      ],
    },
    {
      region: 'Europe',
      zones: [
        { value: 'Europe/London', label: 'GMT - Greenwich Mean Time' },
        { value: 'Europe/Paris', label: 'CET - Central European Time' },
        { value: 'Europe/Berlin', label: 'CET - Central European Time' },
        { value: 'Europe/Madrid', label: 'CET - Central European Time' },
        { value: 'Europe/Rome', label: 'CET - Central European Time' },
        { value: 'Europe/Moscow', label: 'MSK - Moscow Time' },
      ],
    },
    {
      region: 'Asia Pacific',
      zones: [
        { value: 'Asia/Tokyo', label: 'JST - Japan Standard Time' },
        { value: 'Asia/Shanghai', label: 'CST - China Standard Time' },
        { value: 'Asia/Kolkata', label: 'IST - India Standard Time' },
        { value: 'Asia/Singapore', label: 'SGT - Singapore Time' },
        { value: 'Australia/Sydney', label: 'AEST - Australian Eastern Time' },
        { value: 'Pacific/Auckland', label: 'NZST - New Zealand Time' },
      ],
    },
  ];

  // Date formats
  const dateFormats = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US Format)', example: '12/25/2023' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (European)', example: '25/12/2023' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)', example: '2023-12-25' },
    { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY', example: '25-12-2023' },
    { value: 'MMM DD, YYYY', label: 'MMM DD, YYYY', example: 'Dec 25, 2023' },
    { value: 'DD MMM YYYY', label: 'DD MMM YYYY', example: '25 Dec 2023' },
  ];

  // Currencies
  const currencies = [
    { value: 'USD', label: 'USD - US Dollar', symbol: '$' },
    { value: 'EUR', label: 'EUR - Euro', symbol: '€' },
    { value: 'GBP', label: 'GBP - British Pound', symbol: '£' },
    { value: 'JPY', label: 'JPY - Japanese Yen', symbol: '¥' },
    { value: 'CAD', label: 'CAD - Canadian Dollar', symbol: 'C$' },
    { value: 'AUD', label: 'AUD - Australian Dollar', symbol: 'A$' },
    { value: 'CHF', label: 'CHF - Swiss Franc', symbol: 'CHF' },
    { value: 'CNY', label: 'CNY - Chinese Yuan', symbol: '¥' },
    { value: 'INR', label: 'INR - Indian Rupee', symbol: '₹' },
    { value: 'KRW', label: 'KRW - South Korean Won', symbol: '₩' },
    { value: 'BRL', label: 'BRL - Brazilian Real', symbol: 'R$' },
    { value: 'MXN', label: 'MXN - Mexican Peso', symbol: '$' },
  ];

  // Auto-detect region based on timezone
  const detectRegion = () => {
    const tz = preferences.timezone;
    if (tz.startsWith('America')) return 'North America';
    if (tz.startsWith('Europe')) return 'Europe';
    if (tz.startsWith('Asia') || tz.startsWith('Australia') || tz.startsWith('Pacific')) return 'Asia Pacific';
    return 'UTC';
  };

  // Handle changes and mark as dirty
  const handleChange = (key: string, value: any) => {
    preferences.updatePreference(key as any, value);
    setIsDirty(true);
  };

  // Save settings
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastSaved(new Date());
      setIsDirty(false);
      onSave?.();
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = () => {
    if (confirm('Are you sure you want to reset all general settings to their default values?')) {
      preferences.resetSection('general');
      setIsDirty(true);
    }
  };

  // Apply region-based suggestions
  const applyRegionDefaults = () => {
    const region = detectRegion();
    const suggestions: Record<string, string> = {
      'North America': { dateFormat: 'MM/DD/YYYY', currency: 'USD' },
      'Europe': { dateFormat: 'DD/MM/YYYY', currency: 'EUR' },
      'Asia Pacific': { dateFormat: 'YYYY-MM-DD', currency: 'USD' },
      'UTC': { dateFormat: 'YYYY-MM-DD', currency: 'USD' },
    };

    const suggestion = suggestions[region];
    if (suggestion) {
      Object.entries(suggestion).forEach(([key, value]) => {
        preferences.updatePreference(key as any, value);
      });
      setIsDirty(true);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Tabs defaultValue="language" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="language">
            <Languages className="h-4 w-4 mr-2" />
            Language
          </TabsTrigger>
          <TabsTrigger value="locale">
            <MapPin className="h-4 w-4 mr-2" />
            Location
          </TabsTrigger>
          <TabsTrigger value="format">
            <Calendar className="h-4 w-4 mr-2" />
            Format
          </TabsTrigger>
          <TabsTrigger value="currency">
            <DollarSign className="h-4 w-4 mr-2" />
            Currency
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Keyboard className="h-4 w-4 mr-2" />
            Advanced
          </TabsTrigger>
        </TabsList>

        {/* Language Settings */}
        <TabsContent value="language" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Language & Region
              </CardTitle>
              <CardDescription>
                Choose your preferred language and regional settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="language-select">Interface Language</Label>
                <Select 
                  value={preferences.language} 
                  onValueChange={(value) => handleChange('language', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <div className="flex items-center">
                          <span className="mr-3 text-lg">{lang.flag}</span>
                          <div>
                            <div className="font-medium">{lang.nativeName}</div>
                            <div className="text-xs text-muted-foreground">{lang.name}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  This will change the interface language. Some features may still show in English.
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <Info className="h-5 w-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium">Translation Status</h4>
                    <p className="text-sm text-muted-foreground">
                      Translations are community-powered and may be incomplete.
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">Community</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location Settings */}
        <TabsContent value="locale" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Timezone & Location
              </CardTitle>
              <CardDescription>
                Set your timezone for accurate time display and scheduling.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="timezone-select">Timezone</Label>
                <Select 
                  value={preferences.timezone} 
                  onValueChange={(value) => handleChange('timezone', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your timezone" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {timeZones.map((region) => (
                      <div key={region.region}>
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted">
                          {region.region}
                        </div>
                        {region.zones.map((zone) => (
                          <SelectItem key={zone.value} value={zone.value}>
                            {zone.label}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Current detected region: {detectRegion()}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Auto-detect timezone</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically detect and set your timezone
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={applyRegionDefaults}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Apply Region Defaults
                </Button>
                <p className="text-sm text-muted-foreground">
                  Set language and date format based on your region
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Format Settings */}
        <TabsContent value="format" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Date & Time Formats
              </CardTitle>
              <CardDescription>
                Customize how dates and times are displayed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="date-format-select">Date Format</Label>
                <Select 
                  value={preferences.dateFormat} 
                  onValueChange={(value) => handleChange('dateFormat', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    {dateFormats.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        <div>
                          <div className="font-medium">{format.label}</div>
                          <div className="text-sm text-muted-foreground">Example: {format.example}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Day of Week</Label>
                  <Select defaultValue="sunday">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunday">Sunday</SelectItem>
                      <SelectItem value="monday">Monday</SelectItem>
                      <SelectItem value="saturday">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Time Format</Label>
                  <Select defaultValue="12h">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12-hour (3:30 PM)</SelectItem>
                      <SelectItem value="24h">24-hour (15:30)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Format Preview</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Today is: {new Date().toLocaleDateString('en-US', {
                        timeZone: preferences.timezone,
                        dateStyle: 'full',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Currency Settings */}
        <TabsContent value="currency" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Currency & Pricing
              </CardTitle>
              <CardDescription>
                Set your preferred currency for pricing and financial data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="currency-select">Default Currency</Label>
                <Select 
                  value={preferences.currency} 
                  onValueChange={(value) => handleChange('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{currency.label}</span>
                          <span className="text-muted-foreground">{currency.symbol}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Number Format</Label>
                  <Select defaultValue="us">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">1,234.56 (US)</SelectItem>
                      <SelectItem value="eu">1.234,56 (EU)</SelectItem>
                      <SelectItem value="in">1,23,456.78 (India)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Decimal Places</Label>
                  <Select defaultValue="2">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0 (Whole numbers)</SelectItem>
                      <SelectItem value="2">2 (Standard)</SelectItem>
                      <SelectItem value="3">3 (Precise)</SelectItem>
                      <SelectItem value="4">4 (Very precise)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Currency Preview</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Sample amount: {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: preferences.currency,
                      }).format(1234.56)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced General Settings</CardTitle>
              <CardDescription>
                Additional configuration options for power users.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto-detect locale</h4>
                    <p className="text-sm text-muted-foreground">
                      Automatically detect language and format settings
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Sync settings across devices</h4>
                    <p className="text-sm text-muted-foreground">
                      Keep preferences synchronized across all your devices
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Show regional holidays</h4>
                    <p className="text-sm text-muted-foreground">
                      Display holidays in the calendar based on your region
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Import/Export Settings</h4>
                <div className="flex space-x-3">
                  <Button variant="outline" size="sm">
                    Export Settings
                  </Button>
                  <Button variant="outline" size="sm">
                    Import Settings
                  </Button>
                  <Button variant="outline" size="sm">
                    Reset to Defaults
                  </Button>
                </div>
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
              <AlertCircle className="h-4 w-4 mr-2" />
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

export default GeneralSettings;