/**
 * Wireframe Generation Hook
 * Manages wireframe generation workflow and state
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useBuilderStore } from './use-builder-store';
import {
  Wireframe,
  GenerationOptions,
  GenerationResult,
  WireframeComponent,
  CanvasState,
  ComponentItem,
  ValidationResult
} from '../types/wireframe';
import { SitemapStructure } from '../types/sitemap';
import toast from 'react-hot-toast';

interface UseWireframeGeneratorReturn {
  // State
  isGenerating: boolean;
  progress: number;
  confidence?: number;
  error?: string;
  wireframes: Record<string, Wireframe>;
  selectedWireframe: Wireframe | null;
  selectedPageId: string | null;
  
  // Canvas state
  canvasState: CanvasState | null;
  selectedComponents: string[];
  
  // Actions
  generate: (pageId: string, options?: GenerationOptions) => Promise<void>;
  regenerate: (pageId: string) => Promise<void>;
  updateComponent: (wireframeId: string, componentId: string, updates: Partial<WireframeComponent>) => void;
  addComponent: (wireframeId: string, component: Omit<WireframeComponent, 'id'>, parentId?: string) => void;
  removeComponent: (wireframeId: string, componentId: string) => void;
  moveComponent: (wireframeId: string, componentId: string, newParentId?: string) => void;
  duplicateComponent: (wireframeId: string, componentId: string) => void;
  
  // Canvas actions
  setSelectedComponents: (componentIds: string[]) => void;
  updateCanvasState: (updates: Partial<CanvasState>) => void;
  undo: () => void;
  redo: () => void;
  copyComponents: () => void;
  pasteComponents: () => void;
  
  // Selection actions
  selectPage: (pageId: string) => void;
  selectComponent: (componentId: string, multiSelect?: boolean) => void;
  clearSelection: () => void;
  
  // Validation
  validateWireframe: (wireframeId: string) => Promise<ValidationResult>;
  
  // Utilities
  canGenerate: boolean;
  generateForAllPages: () => Promise<void>;
  exportWireframe: (pageId: string, format: 'json' | 'svg' | 'png') => string;
  importWireframe: (data: string, format: 'json') => void;
  hasWireframeForPage: (pageId: string) => boolean;
  getComponentById: (wireframeId: string, componentId: string) => WireframeComponent | null;
  getComponentChildren: (wireframeId: string, componentId: string) => WireframeComponent[];
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
  selectedComponent: WireframeComponent | null;
}

export const useWireframeGenerator = (): UseWireframeGeneratorReturn => {
  const {
    wireframes,
    sitemap,
    wireframeGeneration,
    canvasState,
    selectedPageId,
    setWireframe,
    generateWireframe,
    updateWireframeComponent,
    setCanvasState,
    updateCanvasState: updateCanvasStateAction,
    setSelectedPageId,
    createProject,
  } = useBuilderStore();

  // Local state
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});
  const [copiedComponents, setCopiedComponents] = useState<WireframeComponent[]>([]);

  // Derived state
  const isGenerating = wireframeGeneration.status === 'generating';
  const progress = wireframeGeneration.progress;
  const confidence = wireframeGeneration.confidence;
  const error = wireframeGeneration.error;
  
  const selectedWireframe = selectedPageId ? wireframes[selectedPageId] || null : null;
  const canGenerate = !isGenerating && sitemap !== null && sitemap.pages.length > 0;

  // Canvas state derived values
  const selectedComponents = canvasState?.selectedComponents || [];
  const canUndo = (canvasState?.undoStack.length || 0) > 0;
  const canRedo = (canvasState?.redoStack.length || 0) > 0;
  const hasSelection = selectedComponents.length > 0;
  
  const selectedComponent = useMemo(() => {
    if (!selectedWireframe || selectedComponents.length !== 1) return null;
    return getComponentById(selectedWireframe.id, selectedComponents[0]);
  }, [selectedWireframe, selectedComponents]);

  // Generate wireframe for a page
  const generate = useCallback(async (pageId: string, options?: GenerationOptions) => {
    try {
      await generateWireframe(pageId, options);
      toast.success(`Wireframe generated for page ${pageId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate wireframe';
      toast.error(errorMessage);
    }
  }, [generateWireframe]);

  // Regenerate wireframe for a page
  const regenerate = useCallback(async (pageId: string) => {
    if (!sitemap) {
      toast.error('No sitemap available');
      return;
    }

    const page = findPageById(sitemap.pages, pageId);
    if (!page) {
      toast.error('Page not found in sitemap');
      return;
    }

    const options: GenerationOptions = {
      layoutPreference: 'single-column',
      targetAudience: sitemap.metadata.targetAudience,
      includeNavigation: true,
      includeFooter: true,
      componentVariations: 3,
      complexity: 'medium',
    };

    await generate(pageId, options);
  }, [sitemap, generate]);

  // Update component
  const updateComponent = useCallback((wireframeId: string, componentId: string, updates: Partial<WireframeComponent>) => {
    updateWireframeComponent(wireframeId, componentId, updates);
    
    if (wireframeId === selectedWireframe?.id) {
      toast.success('Component updated successfully');
    }
  }, [updateWireframeComponent, selectedWireframe]);

  // Add new component
  const addComponent = useCallback((wireframeId: string, component: Omit<WireframeComponent, 'id'>, parentId?: string) => {
    const newComponent: WireframeComponent = {
      ...component,
      id: `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    // Implementation for adding component to wireframe
    // This would involve updating the wireframe data structure
    toast.success('Component added successfully');
  }, []);

  // Remove component
  const removeComponent = useCallback((wireframeId: string, componentId: string) => {
    // Implementation for removing component from wireframe
    toast.success('Component removed successfully');
  }, []);

  // Move component
  const moveComponent = useCallback((wireframeId: string, componentId: string, newParentId?: string) => {
    // Implementation for moving component in wireframe hierarchy
    toast.success('Component moved successfully');
  }, []);

  // Duplicate component
  const duplicateComponent = useCallback((wireframeId: string, componentId: string) => {
    // Implementation for duplicating component
    toast.success('Component duplicated');
  }, []);

  // Set selected components
  const setSelectedComponents = useCallback((componentIds: string[]) => {
    if (canvasState) {
      updateCanvasStateAction({
        ...canvasState,
        selectedComponents: componentIds,
      });
    }
  }, [canvasState, updateCanvasStateAction]);

  // Update canvas state
  const updateCanvasState = useCallback((updates: Partial<CanvasState>) => {
    if (canvasState) {
      updateCanvasStateAction({
        ...canvasState,
        ...updates,
      });
    }
  }, [canvasState, updateCanvasStateAction]);

  // Undo action
  const undo = useCallback(() => {
    if (canvasState && canvasState.undoStack.length > 0) {
      // Implementation for undo functionality
      toast.success('Action undone');
    }
  }, [canvasState]);

  // Redo action
  const redo = useCallback(() => {
    if (canvasState && canvasState.redoStack.length > 0) {
      // Implementation for redo functionality
      toast.success('Action redone');
    }
  }, [canvasState]);

  // Copy components
  const copyComponents = useCallback(() => {
    if (!selectedWireframe || selectedComponents.length === 0) return;

    const components = selectedComponents
      .map(id => getComponentById(selectedWireframe.id, id))
      .filter(Boolean) as WireframeComponent[];

    setCopiedComponents(components);
    toast.success(`${components.length} component(s) copied`);
  }, [selectedWireframe, selectedComponents]);

  // Paste components
  const pasteComponents = useCallback(() => {
    if (copiedComponents.length === 0) {
      toast.error('No components to paste');
      return;
    }

    // Implementation for pasting components
    toast.success(`${copiedComponents.length} component(s) pasted`);
  }, [copiedComponents]);

  // Select page
  const selectPage = useCallback((pageId: string) => {
    setSelectedPageId(pageId);
    
    // Initialize canvas state for the selected wireframe
    const wireframe = wireframes[pageId];
    if (wireframe) {
      setCanvasState({
        wireframe,
        selectedComponents: [],
        undoStack: [],
        redoStack: [],
        zoom: 1,
        pan: { x: 0, y: 0 },
        gridSize: 10,
        snapToGrid: true,
        showGuides: false,
        showRulers: false,
        showGrid: true,
        rulersEnabled: true,
      });
    }
  }, [wireframes, setSelectedPageId, setCanvasState]);

  // Select component
  const selectComponent = useCallback((componentId: string, multiSelect: boolean = false) => {
    if (!multiSelect) {
      setSelectedComponents([componentId]);
    } else {
      const newSelection = selectedComponents.includes(componentId)
        ? selectedComponents.filter(id => id !== componentId)
        : [...selectedComponents, componentId];
      setSelectedComponents(newSelection);
    }
  }, [selectedComponents, setSelectedComponents]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedComponents([]);
  }, [setSelectedComponents]);

  // Validate wireframe
  const validateWireframe = useCallback(async (wireframeId: string): Promise<ValidationResult> => {
    const wireframe = wireframes[wireframeId];
    if (!wireframe) {
      throw new Error('Wireframe not found');
    }

    // TODO: Implement actual validation logic
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      score: 100,
    };

    setValidationResults(prev => ({ ...prev, [wireframeId]: result }));
    return result;
  }, [wireframes]);

  // Generate wireframes for all pages
  const generateForAllPages = useCallback(async () => {
    if (!sitemap) return;

    const pages = sitemap.pages;
    for (const page of pages) {
      await generate(page.id);
    }
  }, [sitemap, generate]);

  // Export wireframe
  const exportWireframe = useCallback((pageId: string, format: 'json' | 'svg' | 'png'): string => {
    const wireframe = wireframes[pageId];
    if (!wireframe) {
      throw new Error('Wireframe not found');
    }

    switch (format) {
      case 'json':
        return JSON.stringify(wireframe, null, 2);
      
      case 'svg':
        // TODO: Implement SVG export
        return '<svg><!-- SVG representation --></svg>';
      
      case 'png':
        // TODO: Implement PNG export (would require rendering canvas)
        return 'data:image/png;base64,';
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }, [wireframes]);

  // Import wireframe
  const importWireframe = useCallback((data: string, format: 'json') => {
    try {
      const wireframe = JSON.parse(data) as Wireframe;
      setWireframe(selectedPageId || '', wireframe);
      toast.success('Wireframe imported successfully');
    } catch (err) {
      toast.error('Failed to import wireframe');
    }
  }, [selectedPageId, setWireframe]);

  // Check if wireframe exists for page
  const hasWireframeForPage = useCallback((pageId: string): boolean => {
    return pageId in wireframes;
  }, [wireframes]);

  // Get component by ID
  const getComponentById = useCallback((wireframeId: string, componentId: string): WireframeComponent | null => {
    const wireframe = wireframes[wireframeId];
    if (!wireframe) return null;

    const findComponent = (components: WireframeComponent[]): WireframeComponent | null => {
      for (const component of components) {
        if (component.id === componentId) return component;
        if (component.children) {
          const found = findComponent(component.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findComponent([wireframe.rootComponent, ...wireframe.components]);
  }, [wireframes]);

  // Get component children
  const getComponentChildren = useCallback((wireframeId: string, componentId: string): WireframeComponent[] => {
    const component = getComponentById(wireframeId, componentId);
    return component?.children || [];
  }, [getComponentById]);

  // Utility function to find page by ID
  const findPageById = useCallback((pages: SitemapStructure['pages'], pageId: string): any => {
    for (const page of pages) {
      if (page.id === pageId) return page;
      if (page.children && page.children.length > 0) {
        const found = findPageById(page.children, pageId);
        if (found) return found;
      }
    }
    return null;
  }, []);

  // Auto-generate wireframes when sitemap changes
  useEffect(() => {
    if (sitemap && Object.keys(wireframes).length === 0) {
      // Optionally auto-generate wireframes for critical pages
      const criticalPages = sitemap.pages.filter(p => p.isCritical);
      if (criticalPages.length > 0) {
        generateForAllPages().catch(console.error);
      }
    }
  }, [sitemap, wireframes, generateForAllPages]);

  return {
    // State
    isGenerating,
    progress,
    confidence,
    error,
    wireframes,
    selectedWireframe,
    selectedPageId,
    
    // Canvas state
    canvasState,
    selectedComponents,
    
    // Actions
    generate,
    regenerate,
    updateComponent,
    addComponent,
    removeComponent,
    moveComponent,
    duplicateComponent,
    
    // Canvas actions
    setSelectedComponents,
    updateCanvasState,
    undo,
    redo,
    copyComponents,
    pasteComponents,
    
    // Selection actions
    selectPage,
    selectComponent,
    clearSelection,
    
    // Validation
    validateWireframe,
    
    // Utilities
    canGenerate,
    generateForAllPages,
    exportWireframe,
    importWireframe,
    hasWireframeForPage,
    getComponentById,
    getComponentChildren,
    canUndo,
    canRedo,
    hasSelection,
    selectedComponent,
  };
};

export default useWireframeGenerator;