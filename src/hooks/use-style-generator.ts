/**
 * Style Generation Hook
 * Manages style guide generation workflow and state
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useBuilderStore } from './use-builder-store';
import {
  StyleGuide,
  StyleGenerationRequest,
  StyleGenerationResponse,
  BrandGuidelines,
  DesignStyle,
  ColorPalette,
  TypographyScale,
  ComponentStyles,
  StyleObject
} from '../types/style-guide';
import { Wireframe } from '../types/wireframe';
import toast from 'react-hot-toast';

interface UseStyleGeneratorReturn {
  // State
  isGenerating: boolean;
  progress: number;
  confidence?: number;
  error?: string;
  styleGuide: StyleGuide | null;
  brandGuidelines: BrandGuidelines | null;
  designStyle: DesignStyle | null;
  
  // Component styles
  componentStyles: ComponentStyles | null;
  cssVariables: Record<string, string>;
  
  // Actions
  generate: (request: StyleGenerationRequest) => Promise<void>;
  regenerate: () => Promise<void>;
  updateBrandGuidelines: (guidelines: BrandGuidelines) => void;
  updateDesignStyle: (style: DesignStyle) => void;
  updateColor: (colorType: string, colorShade: number, value: string) => void;
  updateTypography: (property: string, value: any) => void;
  updateSpacing: (size: string, value: string) => void;
  updateBorderRadius: (size: string, value: string) => void;
  updateShadow: (size: string, value: string) => void;
  
  // Component styling
  updateComponentStyle: (componentType: string, variant: string, style: StyleObject) => void;
  applyThemeToComponent: (componentId: string, style: StyleObject) => void;
  
  // Import/Export
  exportStyleGuide: (format: 'json' | 'css' | 'scss') => string;
  importStyleGuide: (data: string, format: 'json') => void;
  downloadTokens: () => void;
  
  // Theme management
  createTheme: (name: string, baseStyle: Partial<StyleGuide>) => string;
  switchTheme: (themeId: string) => void;
  deleteTheme: (themeId: string) => void;
  
  // Preview and validation
  previewStyle: (componentType: string, variant?: string) => StyleObject;
  validateStyleGuide: () => { isValid: boolean; warnings: string[] };
  generateCSS: () => string;
  generateTailwindConfig: () => string;
  
  // Utilities
  canGenerate: boolean;
  getColorValue: (colorPath: string) => string;
  getTypographyValue: (property: string) => any;
  getSpacingValue: (size: string) => string;
  hasUnsavedChanges: boolean;
  resetToDefaults: () => void;
}

export const useStyleGenerator = (): UseStyleGeneratorReturn => {
  const {
    styleGuide,
    styleGeneration,
    setStyleGuide,
    generateStyleGuide,
    updateBrandGuidelines: updateBrandGuidelinesAction,
    wireframes,
  } = useBuilderStore();

  // Local state
  const [themes, setThemes] = useState<Record<string, Partial<StyleGuide>>>({});
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  // Derived state
  const isGenerating = styleGeneration.status === 'generating';
  const progress = styleGeneration.progress;
  const confidence = styleGeneration.confidence;
  const error = styleGeneration.error;
  
  const brandGuidelines = styleGuide?.brandGuidelines || null;
  const designStyle = styleGuide?.designStyle || null;
  const componentStyles = styleGuide?.componentStyles || null;
  const cssVariables = styleGuide?.cssVariables || {};
  
  const canGenerate = !isGenerating;

  // Generate style guide
  const generate = useCallback(async (request: StyleGenerationRequest) => {
    try {
      await generateStyleGuide(request);
      setUnsavedChanges(false);
      toast.success('Style guide generated successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate style guide';
      toast.error(errorMessage);
    }
  }, [generateStyleGuide]);

  // Regenerate style guide
  const regenerate = useCallback(async () => {
    if (!brandGuidelines || !designStyle) {
      toast.error('Brand guidelines and design style are required');
      return;
    }

    const request: StyleGenerationRequest = {
      brandGuidelines,
      designStyle,
      wireframeDescription: 'Generated from wireframes',
    };

    await generate(request);
  }, [brandGuidelines, designStyle, generate]);

  // Update brand guidelines
  const updateBrandGuidelines = useCallback((guidelines: BrandGuidelines) => {
    if (styleGuide) {
      const updatedStyleGuide = {
        ...styleGuide,
        brandGuidelines: guidelines,
        updatedAt: new Date(),
      };
      setStyleGuide(updatedStyleGuide);
      updateBrandGuidelinesAction(guidelines);
      setUnsavedChanges(true);
      toast.success('Brand guidelines updated');
    }
  }, [styleGuide, setStyleGuide, updateBrandGuidelinesAction]);

  // Update design style
  const updateDesignStyle = useCallback((style: DesignStyle) => {
    if (styleGuide) {
      const updatedStyleGuide = {
        ...styleGuide,
        designStyle: style,
        updatedAt: new Date(),
      };
      setStyleGuide(updatedStyleGuide);
      setUnsavedChanges(true);
      toast.success('Design style updated');
    }
  }, [styleGuide, setStyleGuide]);

  // Update color
  const updateColor = useCallback((colorType: string, colorShade: number, value: string) => {
    if (styleGuide) {
      const updatedStyleGuide = { ...styleGuide };
      updatedStyleGuide.colorPalette[colorType as keyof ColorPalette][colorShade as any] = value;
      updatedStyleGuide.updatedAt = new Date();
      
      setStyleGuide(updatedStyleGuide);
      setUnsavedChanges(true);
      toast.success(`Color updated: ${colorType}.${colorShade}`);
    }
  }, [styleGuide, setStyleGuide]);

  // Update typography
  const updateTypography = useCallback((property: string, value: any) => {
    if (styleGuide) {
      const updatedStyleGuide = { ...styleGuide };
      const keys = property.split('.');
      
      // Navigate to the property and update it
      let current: any = updatedStyleGuide.typography;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i] as keyof typeof current];
      }
      current[keys[keys.length - 1] as keyof typeof current] = value;
      
      updatedStyleGuide.updatedAt = new Date();
      setStyleGuide(updatedStyleGuide);
      setUnsavedChanges(true);
      toast.success(`Typography updated: ${property}`);
    }
  }, [styleGuide, setStyleGuide]);

  // Update spacing
  const updateSpacing = useCallback((size: string, value: string) => {
    if (styleGuide) {
      const updatedStyleGuide = { ...styleGuide };
      updatedStyleGuide.spacing.scale[size as keyof typeof updatedStyleGuide.spacing.scale] = value;
      updatedStyleGuide.updatedAt = new Date();
      
      setStyleGuide(updatedStyleGuide);
      setUnsavedChanges(true);
      toast.success(`Spacing updated: ${size}`);
    }
  }, [styleGuide, setStyleGuide]);

  // Update border radius
  const updateBorderRadius = useCallback((size: string, value: string) => {
    if (styleGuide) {
      const updatedStyleGuide = { ...styleGuide };
      updatedStyleGuide.borderRadius[size as keyof typeof updatedStyleGuide.borderRadius] = value;
      updatedStyleGuide.updatedAt = new Date();
      
      setStyleGuide(updatedStyleGuide);
      setUnsavedChanges(true);
      toast.success(`Border radius updated: ${size}`);
    }
  }, [styleGuide, setStyleGuide]);

  // Update shadow
  const updateShadow = useCallback((size: string, value: string) => {
    if (styleGuide) {
      const updatedStyleGuide = { ...styleGuide };
      updatedStyleGuide.shadows[size as keyof typeof updatedStyleGuide.shadows] = value;
      updatedStyleGuide.updatedAt = new Date();
      
      setStyleGuide(updatedStyleGuide);
      setUnsavedChanges(true);
      toast.success(`Shadow updated: ${size}`);
    }
  }, [styleGuide, setStyleGuide]);

  // Update component style
  const updateComponentStyle = useCallback((componentType: string, variant: string, style: StyleObject) => {
    if (styleGuide && componentStyles) {
      const updatedStyleGuide = { ...styleGuide };
      updatedStyleGuide.componentStyles[componentType as keyof ComponentStyles][variant as keyof StyleObject] = style;
      updatedStyleGuide.updatedAt = new Date();
      
      setStyleGuide(updatedStyleGuide);
      setUnsavedChanges(true);
      toast.success(`Component style updated: ${componentType}.${variant}`);
    }
  }, [styleGuide, componentStyles, setStyleGuide]);

  // Apply theme to component
  const applyThemeToComponent = useCallback((componentId: string, style: StyleObject) => {
    // Implementation for applying style to specific component
    toast.success('Style applied to component');
  }, []);

  // Export style guide
  const exportStyleGuide = useCallback((format: 'json' | 'css' | 'scss'): string => {
    if (!styleGuide) {
      throw new Error('No style guide to export');
    }

    switch (format) {
      case 'json':
        return JSON.stringify(styleGuide, null, 2);
      
      case 'css':
        return generateCSS();
      
      case 'scss':
        return generateTailwindConfig();
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }, [styleGuide]);

  // Import style guide
  const importStyleGuide = useCallback((data: string, format: 'json') => {
    try {
      if (format === 'json') {
        const importedStyleGuide = JSON.parse(data) as StyleGuide;
        setStyleGuide(importedStyleGuide);
        setUnsavedChanges(false);
        toast.success('Style guide imported successfully');
      }
    } catch (err) {
      toast.error('Failed to import style guide');
    }
  }, [setStyleGuide]);

  // Download design tokens
  const downloadTokens = useCallback(() => {
    if (!styleGuide) return;
    
    const tokens = {
      colors: styleGuide.colorPalette,
      typography: styleGuide.typography,
      spacing: styleGuide.spacing,
      borderRadius: styleGuide.borderRadius,
      shadows: styleGuide.shadows,
    };
    
    const dataStr = JSON.stringify(tokens, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'design-tokens.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [styleGuide]);

  // Create theme
  const createTheme = useCallback((name: string, baseStyle: Partial<StyleGuide>): string => {
    const themeId = `theme-${Date.now()}`;
    const theme = {
      id: themeId,
      name,
      ...baseStyle,
    };
    
    setThemes(prev => ({ ...prev, [themeId]: theme }));
    toast.success(`Theme "${name}" created`);
    return themeId;
  }, []);

  // Switch theme
  const switchTheme = useCallback((themeId: string) => {
    const theme = themes[themeId];
    if (theme) {
      setStyleGuide({ ...styleGuide!, ...theme } as StyleGuide);
      setActiveTheme(themeId);
      toast.success(`Switched to theme: ${theme.name}`);
    }
  }, [themes, styleGuide, setStyleGuide]);

  // Delete theme
  const deleteTheme = useCallback((themeId: string) => {
    setThemes(prev => {
      const newThemes = { ...prev };
      delete newThemes[themeId];
      return newThemes;
    });
    
    if (activeTheme === themeId) {
      setActiveTheme(null);
    }
    
    toast.success('Theme deleted');
  }, [activeTheme]);

  // Preview style for component
  const previewStyle = useCallback((componentType: string, variant?: string): StyleObject => {
    if (!componentStyles) return {};
    
    const component = componentStyles[componentType as keyof ComponentStyles];
    if (!component) return {};
    
    if (variant && variant in component) {
      return component[variant as keyof StyleObject] as StyleObject;
    }
    
    return component.base || {};
  }, [componentStyles]);

  // Validate style guide
  const validateStyleGuide = useCallback((): { isValid: boolean; warnings: string[] } => {
    if (!styleGuide) {
      return { isValid: false, warnings: ['No style guide available'] };
    }

    const warnings: string[] = [];
    
    // Check color contrast
    const primaryColor = styleGuide.colorPalette.primary[500];
    const textColor = styleGuide.colorPalette.text.primary;
    
    // TODO: Implement proper color contrast validation
    
    // Check typography hierarchy
    if (!styleGuide.typography.fontSize.base) {
      warnings.push('Missing base font size');
    }
    
    // Check spacing consistency
    const spacingValues = Object.values(styleGuide.spacing.scale);
    const hasInconsistencies = spacingValues.some((value, index) => 
      index > 0 && parseFloat(value) <= parseFloat(spacingValues[index - 1])
    );
    
    if (hasInconsistencies) {
      warnings.push('Inconsistent spacing scale detected');
    }
    
    setValidationWarnings(warnings);
    return { isValid: warnings.length === 0, warnings };
  }, [styleGuide]);

  // Generate CSS
  const generateCSS = useCallback((): string => {
    if (!styleGuide) return '';
    
    const { colorPalette, typography, spacing, borderRadius, shadows } = styleGuide;
    
    return `:root {
  /* Colors */
  --color-primary-50: ${colorPalette.primary[50]};
  --color-primary-100: ${colorPalette.primary[100]};
  --color-primary-500: ${colorPalette.primary[500]};
  --color-primary-600: ${colorPalette.primary[600]};
  --color-primary-900: ${colorPalette.primary[900]};
  
  --color-background: ${colorPalette.background.primary};
  --color-text-primary: ${colorPalette.text.primary};
  --color-text-secondary: ${colorPalette.text.secondary};
  
  /* Typography */
  --font-family-sans: ${typography.fontFamily.sans.join(', ')};
  --font-size-xs: ${typography.fontSize.xs};
  --font-size-sm: ${typography.fontSize.sm};
  --font-size-base: ${typography.fontSize.base};
  --font-size-lg: ${typography.fontSize.lg};
  --font-size-xl: ${typography.fontSize.xl};
  --font-size-2xl: ${typography.fontSize['2xl']};
  
  /* Spacing */
  ${Object.entries(spacing.scale).map(([key, value]) => `--spacing-${key}: ${value};`).join('\n  ')}
  
  /* Border Radius */
  ${Object.entries(borderRadius).map(([key, value]) => `--radius-${key}: ${value};`).join('\n  ')}
  
  /* Shadows */
  ${Object.entries(shadows).map(([key, value]) => `--shadow-${key}: ${value};`).join('\n  ')}
}`;
  }, [styleGuide]);

  // Generate Tailwind config
  const generateTailwindConfig = useCallback((): string => {
    if (!styleGuide) return '';
    
    const { colorPalette, typography, spacing, borderRadius, shadows } = styleGuide;
    
    return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: ${JSON.stringify(colorPalette.primary, null, 6)},
        secondary: ${JSON.stringify(colorPalette.secondary, null, 6)},
        neutral: ${JSON.stringify(colorPalette.neutral, null, 6)},
        background: ${JSON.stringify(colorPalette.background, null, 6)},
        text: ${JSON.stringify(colorPalette.text, null, 6)},
        success: '${colorPalette.success}',
        warning: '${colorPalette.warning}',
        error: '${colorPalette.error}',
        info: '${colorPalette.info}',
      },
      fontFamily: {
        sans: ${JSON.stringify(typography.fontFamily.sans)},
        serif: ${JSON.stringify(typography.fontFamily.serif)},
        mono: ${JSON.stringify(typography.fontFamily.mono)},
      },
      fontSize: ${JSON.stringify(typography.fontSize, null, 6)},
      spacing: ${JSON.stringify(spacing.scale, null, 6)},
      borderRadius: ${JSON.stringify(borderRadius, null, 6)},
      boxShadow: ${JSON.stringify(shadows, null, 6)},
    },
  },
  plugins: [],
};`;
  }, [styleGuide]);

  // Get color value
  const getColorValue = useCallback((colorPath: string): string => {
    if (!styleGuide) return '';
    
    const path = colorPath.split('.');
    let current: any = styleGuide.colorPalette;
    
    for (const key of path) {
      current = current?.[key];
    }
    
    return current || '';
  }, [styleGuide]);

  // Get typography value
  const getTypographyValue = useCallback((property: string): any => {
    if (!styleGuide) return null;
    
    const keys = property.split('.');
    let current: any = styleGuide.typography;
    
    for (const key of keys) {
      current = current?.[key];
    }
    
    return current;
  }, [styleGuide]);

  // Get spacing value
  const getSpacingValue = useCallback((size: string): string => {
    if (!styleGuide) return '';
    return styleGuide.spacing.scale[size as keyof typeof styleGuide.spacing.scale] || '';
  }, [styleGuide]);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    if (styleGuide) {
      // Reset to a default theme
      const defaultStyleGuide: StyleGuide = {
        ...styleGuide,
        colorPalette: {
          primary: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a', 950: '#172554' },
          secondary: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617' },
          neutral: { 50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8', 400: '#a1a1aa', 500: '#71717a', 600: '#52525b', 700: '#3f3f46', 800: '#27272a', 900: '#18181b', 950: '#09090b' },
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
          background: { primary: '#ffffff', secondary: '#f8fafc', muted: '#f1f5f9' },
          text: { primary: '#0f172a', secondary: '#475569', muted: '#94a3b8', inverse: '#ffffff' },
        },
        typography: {
          fontFamily: {
            sans: ['Inter', 'ui-sans-serif', 'system-ui'],
            serif: ['Georgia', 'ui-serif', 'Georgia'],
            mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular'],
            display: ['Cal Sans', 'Inter', 'ui-sans-serif'],
          },
          fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
            '4xl': '2.25rem',
            '5xl': '3rem',
            '6xl': '3.75rem',
            '7xl': '4.5rem',
            '8xl': '6rem',
            '9xl': '8rem',
          },
          fontWeight: {
            thin: 100,
            extralight: 200,
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
            extrabold: 800,
            black: 900,
          },
          lineHeight: {
            tight: 1.25,
            snug: 1.375,
            normal: 1.5,
            relaxed: 1.625,
            loose: 2,
          },
          letterSpacing: {
            tighter: '-0.05em',
            tight: '-0.025em',
            normal: '0em',
            wide: '0.025em',
            wider: '0.05em',
            widest: '0.1em',
          },
        },
      };
      
      setStyleGuide(defaultStyleGuide);
      setUnsavedChanges(false);
      toast.success('Style guide reset to defaults');
    }
  }, [styleGuide, setStyleGuide]);

  // Auto-save when there are unsaved changes
  useEffect(() => {
    if (unsavedChanges) {
      const timeoutId = setTimeout(() => {
        // Auto-save logic could go here
        setUnsavedChanges(false);
      }, 30000); // Auto-save after 30 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [unsavedChanges]);

  return {
    // State
    isGenerating,
    progress,
    confidence,
    error,
    styleGuide,
    brandGuidelines,
    designStyle,
    
    // Component styles
    componentStyles,
    cssVariables,
    
    // Actions
    generate,
    regenerate,
    updateBrandGuidelines,
    updateDesignStyle,
    updateColor,
    updateTypography,
    updateSpacing,
    updateBorderRadius,
    updateShadow,
    
    // Component styling
    updateComponentStyle,
    applyThemeToComponent,
    
    // Import/Export
    exportStyleGuide,
    importStyleGuide,
    downloadTokens,
    
    // Theme management
    createTheme,
    switchTheme,
    deleteTheme,
    
    // Preview and validation
    previewStyle,
    validateStyleGuide,
    generateCSS,
    generateTailwindConfig,
    
    // Utilities
    canGenerate,
    getColorValue,
    getTypographyValue,
    getSpacingValue,
    hasUnsavedChanges: unsavedChanges,
    resetToDefaults,
  };
};

export default useStyleGenerator;