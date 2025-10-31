// Settings UI Components Exports

// Main settings layout
export { SettingsLayout } from './settings-layout';

// Individual settings pages
export { GeneralSettings } from './general-settings';
export { AppearanceSettings } from './appearance-settings';
export { NotificationSettings } from './notification-settings';
export { PrivacySettings } from './privacy-settings';
export { AccessibilitySettings } from './accessibility-settings';

// Settings utilities and types
export interface SettingsSection {
  id: string;
  name: string;
  description: string;
  icon?: string;
  component: React.ComponentType;
  order: number;
  isEnabled?: boolean;
}

export interface SettingsConfig {
  sections: SettingsSection[];
  defaultSection?: string;
  showSearch?: boolean;
  showBreadcrumbs?: boolean;
  allowReset?: boolean;
}

// Default settings sections configuration
export const defaultSettingsSections: SettingsSection[] = [
  {
    id: 'general',
    name: 'General',
    description: 'General application preferences',
    icon: 'Settings',
    component: GeneralSettings,
    order: 1,
  },
  {
    id: 'appearance',
    name: 'Appearance',
    description: 'Theme and visual customization',
    icon: 'Palette',
    component: AppearanceSettings,
    order: 2,
  },
  {
    id: 'notifications',
    name: 'Notifications',
    description: 'Notification preferences and controls',
    icon: 'Bell',
    component: NotificationSettings,
    order: 3,
  },
  {
    id: 'privacy',
    name: 'Privacy',
    description: 'Privacy and data management settings',
    icon: 'Shield',
    component: PrivacySettings,
    order: 4,
  },
  {
    id: 'accessibility',
    name: 'Accessibility',
    description: 'Accessibility and usability features',
    icon: 'Accessibility',
    component: AccessibilitySettings,
    order: 5,
  },
];

// Settings utilities
export const getSettingsSection = (id: string): SettingsSection | undefined => {
  return defaultSettingsSections.find(section => section.id === id);
};

export const getSettingsSections = (): SettingsSection[] => {
  return [...defaultSettingsSections].sort((a, b) => a.order - b.order);
};

export const isSettingsSectionEnabled = (sectionId: string): boolean => {
  const section = getSettingsSection(sectionId);
  return section?.isEnabled !== false;
};

// Settings context for cross-component communication
export interface SettingsContextType {
  activeSection: string;
  setActiveSection: (sectionId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  resetToDefaults: () => void;
  exportSettings: () => string;
  importSettings: (config: string) => { success: boolean; errors: string[] };
}

// Default settings context provider (implementation would be in settings-layout.tsx)
export const createSettingsContext = (): SettingsContextType => {
  return {
    activeSection: 'general',
    setActiveSection: () => {},
    searchQuery: '',
    setSearchQuery: () => {},
    hasUnsavedChanges: false,
    setHasUnsavedChanges: () => {},
    resetToDefaults: () => {},
    exportSettings: () => '{}',
    importSettings: () => ({ success: true, errors: [] }),
  };
};