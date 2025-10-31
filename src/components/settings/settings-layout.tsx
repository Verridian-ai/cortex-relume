import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Palette, 
  Bell, 
  Shield, 
  Keyboard, 
  Monitor, 
  Moon, 
  Sun,
  ChevronLeft,
  ChevronRight,
  Save,
  RotateCcw,
  Download,
  Upload,
  Search,
  Filter,
  Sliders
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { usePreferencesStore, preferencesManager } from '../../lib/preferences/preferences-manager';
import { useThemePreferencesStore, themeUtils } from '../../lib/preferences/theme-preferences';
import { useNotificationPreferencesStore } from '../../lib/preferences/notification-preferences';
import { usePrivacyPreferencesStore } from '../../lib/preferences/privacy-preferences';
import { useAccessibilityPreferencesStore } from '../../lib/preferences/accessibility-preferences';

interface SettingsLayoutProps {
  children?: React.ReactNode;
  defaultSection?: string;
  onClose?: () => void;
}

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ComponentType<any>;
  badge?: string;
  hasUnsavedChanges?: boolean;
}

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({
  children,
  defaultSection = 'general',
  onClose,
}) => {
  const [activeSection, setActiveSection] = useState(defaultSection);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Store instances
  const preferencesStore = usePreferencesStore();
  const themeStore = useThemePreferencesStore();
  const notificationStore = useNotificationPreferencesStore();
  const privacyStore = usePrivacyPreferencesStore();
  const accessibilityStore = useAccessibilityPreferencesStore();
  
  // Settings sections configuration
  const settingsSections: SettingsSection[] = [
    {
      id: 'general',
      title: 'General',
      description: 'Language, timezone, and basic preferences',
      icon: <SettingsIcon className="h-4 w-4" />,
      component: () => <GeneralSettings />,
    },
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Theme, colors, and visual customization',
      icon: <Palette className="h-4 w-4" />,
      component: () => <AppearanceSettings />,
      hasUnsavedChanges: themeStore.hasUnsavedChanges,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Manage notification preferences and channels',
      icon: <Bell className="h-4 w-4" />,
      component: () => <NotificationSettings />,
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      description: 'Data collection, sharing, and privacy controls',
      icon: <Shield className="h-4 w-4" />,
      component: () => <PrivacySettings />,
      badge: privacyStore.privacyScore < 70 ? 'Low Score' : undefined,
    },
    {
      id: 'accessibility',
      title: 'Accessibility',
      description: 'Assistive technology and accessibility features',
      icon: <User className="h-4 w-4" />,
      component: () => <AccessibilitySettings />,
      badge: accessibilityStore.complianceScore < 80 ? 'Needs Review' : undefined,
    },
    {
      id: 'keyboard',
      title: 'Keyboard Shortcuts',
      description: 'Customize keyboard shortcuts and key bindings',
      icon: <Keyboard className="h-4 w-4" />,
      component: () => <KeyboardSettings />,
    },
    {
      id: 'display',
      title: 'Display & UI',
      description: 'Layout, density, and interface preferences',
      icon: <Monitor className="h-4 w-4" />,
      component: () => <DisplaySettings />,
    },
  ];
  
  // Filter and search sections
  const filteredSections = settingsSections.filter(section => {
    const matchesSearch = searchQuery === '' || 
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterCategory === 'all' || 
      (filterCategory === 'core' && ['general', 'appearance', 'notifications'].includes(section.id)) ||
      (filterCategory === 'security' && ['privacy', 'accessibility'].includes(section.id)) ||
      (filterCategory === 'advanced' && ['keyboard', 'display'].includes(section.id));
    
    return matchesSearch && matchesFilter;
  });
  
  // Calculate overall state
  const hasUnsavedChanges = preferencesStore.hasUnsavedChanges || 
    themeStore.hasUnsavedChanges ||
    notificationStore.hasUnsavedChanges ||
    privacyStore.hasUnsavedChanges ||
    accessibilityStore.hasUnsavedChanges;
  
  // Save changes handler
  const handleSave = () => {
    // This would trigger save for all stores
    preferencesStore.exportPreferences();
    console.log('Settings saved');
  };
  
  // Reset changes handler
  const handleReset = () => {
    if (confirm('Are you sure you want to reset all changes? This cannot be undone.')) {
      preferencesStore.resetToDefaults();
      themeStore.resetToDefaults();
      notificationStore.resetToDefaults();
      privacyStore.resetToDefaults();
      accessibilityStore.resetToDefaults();
    }
  };
  
  // Export/Import handlers
  const handleExport = () => {
    const data = preferencesStore.exportPreferences();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'preferences-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result as string;
          const success = preferencesStore.importPreferences(data);
          if (success) {
            alert('Preferences imported successfully!');
          } else {
            alert('Failed to import preferences. Please check the file format.');
          }
        } catch (error) {
          alert('Error reading file. Please try again.');
        }
      };
      reader.readAsText(file);
    }
  };
  
  const ActiveComponent = settingsSections.find(s => s.id === activeSection)?.component || GeneralSettings;
  
  return (
    <div className="flex h-full bg-background">
      {/* Sidebar */}
      <div className={`flex flex-col border-r bg-card transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-80'
      }`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <SettingsIcon className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Settings</h2>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        
        {/* Search and Filter */}
        {!sidebarCollapsed && (
          <div className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant={filterCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterCategory('all')}
              >
                All
              </Button>
              <Button
                variant={filterCategory === 'core' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterCategory('core')}
              >
                Core
              </Button>
              <Button
                variant={filterCategory === 'security' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterCategory('security')}
              >
                Security
              </Button>
              <Button
                variant={filterCategory === 'advanced' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterCategory('advanced')}
              >
                Advanced
              </Button>
            </div>
          </div>
        )}
        
        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav className="p-2 space-y-1">
            {filteredSections.map((section) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? 'secondary' : 'ghost'}
                className={`w-full justify-start ${
                  sidebarCollapsed ? 'px-2' : 'px-3'
                }`}
                onClick={() => setActiveSection(section.id)}
              >
                <div className="flex items-center space-x-3 flex-1">
                  {section.icon}
                  {!sidebarCollapsed && (
                    <div className="flex-1 text-left">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{section.title}</span>
                        {section.badge && (
                          <Badge variant="destructive" className="text-xs">
                            {section.badge}
                          </Badge>
                        )}
                        {section.hasUnsavedChanges && (
                          <Badge variant="secondary" className="text-xs">
                            Unsaved
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {section.description}
                      </p>
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </nav>
        </ScrollArea>
        
        {/* Sidebar Footer */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t space-y-2">
            <div className="flex space-x-2">
              <Button
                onClick={handleSave}
                disabled={!hasUnsavedChanges}
                className="flex-1"
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleExport}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <div className="relative flex-1">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Button variant="outline" size="sm" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Content Header */}
        <div className="flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {settingsSections.find(s => s.id === activeSection)?.icon}
              <div>
                <h1 className="text-xl font-semibold">
                  {settingsSections.find(s => s.id === activeSection)?.title}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {settingsSections.find(s => s.id === activeSection)?.description}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-amber-600 border-amber-600">
                Unsaved Changes
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
};

// Component imports (these would be imported from separate files)
const GeneralSettings: React.FC = () => {
  const preferences = usePreferencesStore();
  
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Preferences</CardTitle>
          <CardDescription>
            Configure basic application settings and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                value={preferences.language}
                onChange={(e) => preferences.updatePreference('language', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                value={preferences.timezone}
                onChange={(e) => preferences.updatePreference('timezone', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="UTC">UTC</option>
                <option value="EST">Eastern Time</option>
                <option value="PST">Pacific Time</option>
                <option value="GMT">Greenwich Mean Time</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AppearanceSettings: React.FC = () => {
  const themeStore = useThemePreferencesStore();
  
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme & Appearance</CardTitle>
          <CardDescription>
            Customize the visual appearance of the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {themeStore.availablePresets.map((preset) => (
              <Card key={preset.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl mb-2">{preset.preview}</div>
                    <h3 className="font-medium">{preset.name}</h3>
                    <p className="text-sm text-muted-foreground">{preset.description}</p>
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => themeStore.applyPreset(preset.name)}
                    >
                      Apply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const NotificationSettings: React.FC = () => {
  const notificationStore = useNotificationPreferencesStore();
  
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Manage how and when you receive notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Notifications</Label>
              <input
                type="checkbox"
                checked={notificationStore.enabled}
                onChange={(e) => notificationStore.updateNotificationPreference('enabled', e.target.checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const PrivacySettings: React.FC = () => {
  const privacyStore = usePrivacyPreferencesStore();
  
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Privacy & Security</CardTitle>
          <CardDescription>
            Control how your data is collected and shared.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">
              {privacyStore.privacyScore}/100
            </div>
            <p className="text-muted-foreground">Privacy Score</p>
            <div className="mt-4">
              <Button variant="outline">
                View Privacy Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AccessibilitySettings: React.FC = () => {
  const accessibilityStore = useAccessibilityPreferencesStore();
  
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Accessibility Features</CardTitle>
          <CardDescription>
            Customize accessibility settings and assistive technology.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">
              {accessibilityStore.complianceScore}%
            </div>
            <p className="text-muted-foreground">WCAG Compliance</p>
            <div className="mt-4">
              <Button variant="outline">
                Run Accessibility Test
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const KeyboardSettings: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Keyboard Shortcuts</CardTitle>
          <CardDescription>
            Customize keyboard shortcuts and key bindings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Keyboard shortcuts configuration coming soon...
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const DisplaySettings: React.FC = () => {
  const preferences = usePreferencesStore();
  
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Display & UI</CardTitle>
          <CardDescription>
            Configure layout, density, and interface preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="density">Layout Density</Label>
            <select
              id="density"
              value={preferences.density}
              onChange={(e) => preferences.updatePreference('density', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="compact">Compact</option>
              <option value="comfortable">Comfortable</option>
              <option value="spacious">Spacious</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsLayout;