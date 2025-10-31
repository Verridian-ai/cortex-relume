'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Eye, 
  EyeOff, 
  Volume2, 
  VolumeX, 
  Keyboard, 
  Zap,
  Palette,
  Type,
  Contrast,
  MousePointer,
  Headphones
} from 'lucide-react';

// High contrast theme for accessibility
export const highContrastTheme = {
  dark: {
    background: '#000000',
    foreground: '#ffffff',
    primary: '#ffffff',
    secondary: '#000000',
    muted: '#333333',
    border: '#ffffff',
    text: '#ffffff'
  },
  light: {
    background: '#ffffff',
    foreground: '#000000',
    primary: '#000000',
    secondary: '#ffffff',
    muted: '#f5f5f5',
    border: '#000000',
    text: '#000000'
  }
};

// Screen reader announcements
export function useA11yAnnouncements() {
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const currentAnnouncement = announcements[announcements.length - 1];

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncements(prev => [...prev, `${priority}:${message}`]);
    
    // Clear after 3 seconds to avoid stale announcements
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a !== `${priority}:${message}`));
    }, 3000);
  }, []);

  return { currentAnnouncement, announce };
}

// Live region for screen reader announcements
export function LiveRegion({ 
  message, 
  priority = 'polite' 
}: { 
  message: string; 
  priority?: 'polite' | 'assertive';
}) {
  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

// Focus management component
export function useFocusManagement() {
  const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  
  const trapFocus = useCallback((element: HTMLElement) => {
    const focusableContent = element.querySelectorAll(focusableElements);
    const firstFocusableElement = focusableContent[0] as HTMLElement;
    const lastFocusableElement = focusableContent[focusableContent.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusableElement) {
            firstFocusableElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    firstFocusableElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  }, [focusableElements]);

  const restoreFocus = useCallback((element: HTMLElement) => {
    element.focus();
  }, []);

  return { trapFocus, restoreFocus };
}

// Keyboard navigation helper
export function useKeyboardNavigation({
  items,
  onSelect,
  orientation = 'vertical',
  wrap = true,
  multiSelect = false
}: {
  items: any[];
  onSelect: (item: any, index: number) => void;
  orientation?: 'vertical' | 'horizontal';
  wrap?: boolean;
  multiSelect?: boolean;
}) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    let newIndex = focusedIndex;

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        newIndex = focusedIndex + 1;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = focusedIndex - 1;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = items.length - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect(items[focusedIndex], focusedIndex);
        break;
    }

    // Wrap around
    if (wrap) {
      if (newIndex >= items.length) newIndex = 0;
      if (newIndex < 0) newIndex = items.length - 1;
    } else {
      newIndex = Math.max(0, Math.min(newIndex, items.length - 1));
    }

    if (newIndex !== focusedIndex) {
      setFocusedIndex(newIndex);
    }
  }, [focusedIndex, items, onSelect, wrap]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
      return () => container.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown]);

  return { focusedIndex, setFocusedIndex, containerRef };
}

// Skip to content link
export function SkipToContentLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      Skip to main content
    </a>
  );
}

// High contrast toggle
export function HighContrastToggle({ 
  isEnabled, 
  onToggle 
}: { 
  isEnabled: boolean; 
  onToggle: (enabled: boolean) => void;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onToggle(!isEnabled)}
      aria-pressed={isEnabled}
      aria-label={isEnabled ? 'Disable high contrast' : 'Enable high contrast'}
      className="flex items-center gap-2"
    >
      {isEnabled ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      High Contrast
    </Button>
  );
}

// Text size controls
export function TextSizeControls({
  size,
  onSizeChange
}: {
  size: 'small' | 'normal' | 'large' | 'extra-large';
  onSizeChange: (size: 'small' | 'normal' | 'large' | 'extra-large') => void;
}) {
  return (
    <div className="flex items-center gap-2" role="group" aria-label="Text size controls">
      <Button
        variant={size === 'small' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onSizeChange('small')}
        aria-label="Small text"
      >
        <Type className="h-3 w-3" />
      </Button>
      <Button
        variant={size === 'normal' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onSizeChange('normal')}
        aria-label="Normal text"
      >
        <Type className="h-4 w-4" />
      </Button>
      <Button
        variant={size === 'large' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onSizeChange('large')}
        aria-label="Large text"
      >
        <Type className="h-5 w-5" />
      </Button>
      <Button
        variant={size === 'extra-large' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onSizeChange('extra-large')}
        aria-label="Extra large text"
      >
        <Type className="h-6 w-6" />
      </Button>
    </div>
  );
}

// Motion controls
export function MotionControls({
  reduceMotion,
  onToggleReduceMotion
}: {
  reduceMotion: boolean;
  onToggleReduceMotion: (reduce: boolean) => void;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onToggleReduceMotion(!reduceMotion)}
      aria-pressed={reduceMotion}
      aria-label={reduceMotion ? 'Enable animations' : 'Disable animations'}
      className="flex items-center gap-2"
    >
      <Zap className={cn("h-4 w-4", reduceMotion && "text-muted-foreground")} />
      Animations
    </Button>
  );
}

// Accessibility preferences context
export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState({
    highContrast: false,
    reduceMotion: false,
    textSize: 'normal' as 'small' | 'normal' | 'large' | 'extra-large',
    screenReader: false,
    keyboardNavigation: true
  });

  const updatePreference = useCallback((key: keyof typeof preferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    
    // Store in localStorage for persistence
    try {
      const stored = localStorage.getItem('accessibility-preferences');
      const storedPrefs = stored ? JSON.parse(stored) : {};
      localStorage.setItem('accessibility-preferences', JSON.stringify({
        ...storedPrefs,
        [key]: value
      }));
    } catch (error) {
      console.warn('Failed to save accessibility preferences:', error);
    }
  }, []);

  // Load preferences on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('accessibility-preferences');
      if (stored) {
        const storedPrefs = JSON.parse(stored);
        setPreferences(prev => ({ ...prev, ...storedPrefs }));
      }
    } catch (error) {
      console.warn('Failed to load accessibility preferences:', error);
    }
  }, []);

  // Detect user's system preferences
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setPreferences(prev => ({ ...prev, reduceMotion: true }));
    }

    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    if (highContrastQuery.matches) {
      setPreferences(prev => ({ ...prev, highContrast: true }));
    }
  }, []);

  const contextValue = {
    preferences,
    updatePreference
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
}

// React context for accessibility
const AccessibilityContext = React.createContext<{
  preferences: {
    highContrast: boolean;
    reduceMotion: boolean;
    textSize: 'small' | 'normal' | 'large' | 'extra-large';
    screenReader: boolean;
    keyboardNavigation: boolean;
  };
  updatePreference: (key: string, value: any) => void;
}>({
  preferences: {
    highContrast: false,
    reduceMotion: false,
    textSize: 'normal',
    screenReader: false,
    keyboardNavigation: true
  },
  updatePreference: () => {}
});

export function useAccessibility() {
  return React.useContext(AccessibilityContext);
}

// Accessible button with proper ARIA attributes
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
  'aria-describedby'?: string;
}

export function AccessibleButton({
  children,
  variant = 'default',
  size = 'md',
  loading = false,
  loadingText,
  disabled,
  'aria-describedby': ariaDescribedBy,
  className,
  ...props
}: AccessibleButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Button
      {...props}
      variant={variant}
      size={size}
      disabled={disabled || loading}
      aria-describedby={ariaDescribedBy}
      aria-pressed={props['aria-pressed'] !== undefined ? props['aria-pressed'] : isPressed}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={cn(
        className,
        loading && 'cursor-wait'
      )}
    >
      {loading && (
        <div className="sr-only" role="status" aria-live="polite">
          {loadingText || 'Loading...'}
        </div>
      )}
      {children}
    </Button>
  );
}

// ARIA landmark regions
export function MainContent({ children, id = 'main-content' }: { children: React.ReactNode; id?: string }) {
  return (
    <main id={id} role="main" tabIndex={-1} className="outline-none">
      {children}
    </main>
  );
}

export function Navigation({ children, label = 'Main navigation' }: { children: React.ReactNode; label?: string }) {
  return (
    <nav role="navigation" aria-label={label}>
      {children}
    </nav>
  );
}

export function Complementary({ children, label = 'Complementary content' }: { children: React.ReactNode; label?: string }) {
  return (
    <aside role="complementary" aria-label={label}>
      {children}
    </aside>
  );
}

// Accessible project card with proper semantic markup
interface AccessibleProjectCardProps {
  project: {
    id: string;
    name: string;
    description?: string;
    status: string;
    priority: string;
    progress: number;
    assignee?: { name: string };
    dueDate: Date;
  };
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  onClick?: () => void;
  onQuickActions?: () => void;
  children: React.ReactNode;
}

export function AccessibleProjectCard({
  project,
  isSelected = false,
  onSelect,
  onClick,
  onQuickActions,
  children
}: AccessibleProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <Card
      ref={cardRef}
      role="article"
      aria-labelledby={`project-${project.id}-title`}
      aria-describedby={`project-${project.id}-description`}
      aria-selected={isSelected}
      tabIndex={0}
      className={cn(
        "transition-all duration-200 cursor-pointer focus:ring-2 focus:ring-primary focus:ring-offset-2",
        isSelected && "ring-2 ring-primary bg-primary/5",
        "hover:shadow-md hover:scale-[1.01]"
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="sr-only">
        <div id={`project-${project.id}-title`}>
          Project {project.name}
        </div>
        <div id={`project-${project.id}-description`}>
          {project.description || 'No description available'}
        </div>
        <div>
          Status: {project.status}, Priority: {project.priority}
        </div>
        <div>
          Progress: {project.progress}% complete
        </div>
        <div>
          Due: {project.dueDate.toLocaleDateString()}
        </div>
        <div>
          {isSelected ? 'Selected' : 'Not selected'}
        </div>
      </div>
      {children}
    </Card>
  );
}

// Focus visible polyfill hook
export function useFocusVisible() {
  const [isFocusVisible, setIsFocusVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsFocusVisible(true);
      }
    };

    const handleMouseDown = () => {
      setIsFocusVisible(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return isFocusVisible;
}

// WCAG 2.1 compliance checker
export function useA11yCompliance() {
  const compliance = {
    ariaLabels: true,
    colorContrast: true,
    keyboardNavigation: true,
    focusManagement: true,
    screenReader: true,
    landmarks: true
  };

  const checkCompliance = useCallback(() => {
    const issues = [];

    // Check for missing alt text on images
    const images = document.querySelectorAll('img:not([alt])');
    if (images.length > 0) {
      issues.push(`${images.length} images missing alt text`);
    }

    // Check for missing labels on form elements
    const unlabeledInputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    if (unlabeledInputs.length > 0) {
      issues.push(`${unlabeledInputs.length} form inputs missing labels`);
    }

    // Check for missing landmarks
    const mainContent = document.querySelector('main');
    if (!mainContent) {
      issues.push('Missing main landmark');
    }

    return {
      isCompliant: issues.length === 0,
      issues
    };
  }, []);

  return { compliance, checkCompliance };
}
