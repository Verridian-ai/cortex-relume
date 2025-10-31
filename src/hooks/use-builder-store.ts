/**
 * Main Zustand store for AI Site Builder state management
 * Provides global state for sitemap, wireframe, and style generation workflows
 */

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { 
  SitemapStructure, 
  SitemapGenerationRequest, 
  SitemapGenerationResponse,
  SitemapValidationResult
} from '../types/sitemap';
import { 
  Wireframe, 
  GenerationOptions,
  GenerationResult,
  CanvasState
} from '../types/wireframe';
import { 
  StyleGuide, 
  StyleGenerationRequest, 
  StyleGenerationResponse,
  BrandGuidelines 
} from '../types/style-guide';
import { v4 as uuidv4 } from 'uuid';

// Base project interface
export interface Project {
  id: string;
  name: string;
  description?: string;
  websiteType?: string;
  createdAt: Date;
  updatedAt: Date;
  version: string;
  currentStep: WorkflowStep;
  status: 'draft' | 'in-progress' | 'completed' | 'archived';
  metadata?: Record<string, any>;
}

// Workflow steps
export type WorkflowStep = 
  | 'initial'
  | 'sitemap'
  | 'wireframe' 
  | 'style'
  | 'review'
  | 'export';

// Generation states
export interface GenerationState {
  status: 'idle' | 'generating' | 'success' | 'error';
  progress: number;
  message?: string;
  error?: string;
  startTime?: Date;
  endTime?: Date;
  confidence?: number;
}

// Main builder state interface
interface BuilderState {
  // Current project
  currentProject: Project | null;
  
  // Workflow data
  sitemap: SitemapStructure | null;
  wireframes: Record<string, Wireframe>; // pageId -> wireframe
  styleGuide: StyleGuide | null;
  
  // Generation states
  sitemapGeneration: GenerationState;
  wireframeGeneration: GenerationState;
  styleGeneration: GenerationState;
  
  // UI state
  activeStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  sidebarCollapsed: boolean;
  selectedPageId: string | null;
  
  // Canvas state
  canvasState: CanvasState | null;
  
  // History and undo/redo
  history: ProjectHistoryEntry[];
  historyIndex: number;
  maxHistorySize: number;
  
  // Persistence
  lastSaved: Date | null;
  autoSaveEnabled: boolean;
  autoSaveInterval: number; // seconds
  
  // Error handling
  errors: BuilderError[];
  warnings: BuilderWarning[];
}

// History tracking
export interface ProjectHistoryEntry {
  id: string;
  timestamp: Date;
  action: 'create' | 'update' | 'generate-sitemap' | 'generate-wireframe' | 'generate-style' | 'export';
  description: string;
  data?: any;
  userId?: string;
}

// Error handling
export interface BuilderError {
  id: string;
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  step?: WorkflowStep;
  timestamp: Date;
  resolved: boolean;
  metadata?: Record<string, any>;
}

export interface BuilderWarning {
  id: string;
  code: string;
  message: string;
  step?: WorkflowStep;
  timestamp: Date;
  acknowledged: boolean;
  metadata?: Record<string, any>;
}

// Actions
interface BuilderActions {
  // Project management
  createProject: (name: string, description?: string, websiteType?: string) => string;
  updateProject: (updates: Partial<Project>) => void;
  loadProject: (projectId: string) => Promise<void>;
  deleteProject: (projectId: string) => void;
  
  // Workflow management
  setActiveStep: (step: WorkflowStep) => void;
  completeStep: (step: WorkflowStep) => void;
  resetWorkflow: () => void;
  
  // Sitemap management
  setSitemap: (sitemap: SitemapStructure) => void;
  generateSitemap: (request: SitemapGenerationRequest) => Promise<void>;
  validateSitemap: () => Promise<SitemapValidationResult>;
  updateSitemapPage: (pageId: string, updates: Partial<SitemapStructure['pages'][0]>) => void;
  
  // Wireframe management
  setWireframe: (pageId: string, wireframe: Wireframe) => void;
  generateWireframe: (pageId: string, options?: GenerationOptions) => Promise<void>;
  updateWireframeComponent: (wireframeId: string, componentId: string, updates: any) => void;
  deleteWireframe: (pageId: string) => void;
  
  // Style management
  setStyleGuide: (styleGuide: StyleGuide) => void;
  generateStyleGuide: (request: StyleGenerationRequest) => Promise<void>;
  updateBrandGuidelines: (guidelines: BrandGuidelines) => void;
  applyStyleToComponent: (componentId: string, styleUpdates: any) => void;
  
  // Canvas management
  setCanvasState: (state: CanvasState) => void;
  updateCanvasState: (updates: Partial<CanvasState>) => void;
  
  // UI state management
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSelectedPageId: (pageId: string | null) => void;
  
  // History management
  addHistoryEntry: (action: ProjectHistoryEntry['action'], description: string, data?: any) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  
  // Persistence
  saveProject: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
  clearStorage: () => void;
  enableAutoSave: (enabled: boolean) => void;
  setAutoSaveInterval: (interval: number) => void;
  
  // Error handling
  addError: (code: string, message: string, severity: BuilderError['severity'], step?: WorkflowStep) => void;
  removeError: (errorId: string) => void;
  markErrorResolved: (errorId: string) => void;
  addWarning: (code: string, message: string, step?: WorkflowStep) => void;
  acknowledgeWarning: (warningId: string) => void;
  clearErrors: () => void;
  clearWarnings: () => void;
  
  // Utility actions
  reset: () => void;
  exportData: (format: 'json' | 'csv' | 'xml') => string;
  importData: (data: string, format: 'json') => void;
}

// Combined store type
type BuilderStore = BuilderState & BuilderActions;

// Default values
const defaultGenerationState: GenerationState = {
  status: 'idle',
  progress: 0,
};

const defaultCanvasState: CanvasState = {
  wireframe: {
    id: '',
    name: '',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    layout: { pattern: 'single-column' },
    components: [],
    rootComponent: {
      id: 'root',
      name: 'Root',
      type: 'container',
      category: 'layout',
      props: {},
      children: [],
    },
    breakpoints: [],
    defaultBreakpoint: 'desktop',
    activeBreakpoint: 'desktop',
    metadata: {},
    exportConfig: {
      format: 'json',
      includeComments: true,
      includeAnnotations: true,
    },
  },
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
};

// Main store creation
export const useBuilderStore = create<BuilderStore>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        // Initial state
        currentProject: null,
        sitemap: null,
        wireframes: {},
        styleGuide: null,
        sitemapGeneration: { ...defaultGenerationState },
        wireframeGeneration: { ...defaultGenerationState },
        styleGeneration: { ...defaultGenerationState },
        activeStep: 'initial',
        completedSteps: [],
        sidebarCollapsed: false,
        selectedPageId: null,
        canvasState: null,
        history: [],
        historyIndex: -1,
        maxHistorySize: 50,
        lastSaved: null,
        autoSaveEnabled: true,
        autoSaveInterval: 30,
        errors: [],
        warnings: [],

        // Project management actions
        createProject: (name: string, description?: string, websiteType?: string) => {
          const projectId = uuidv4();
          const now = new Date();
          
          set((state) => {
            const newProject: Project = {
              id: projectId,
              name,
              description,
              websiteType,
              createdAt: now,
              updatedAt: now,
              version: '1.0.0',
              currentStep: 'initial',
              status: 'draft',
              metadata: {},
            };
            
            state.currentProject = newProject;
            state.activeStep = 'initial';
            state.completedSteps = [];
            state.sitemap = null;
            state.wireframes = {};
            state.styleGuide = null;
            state.sitemapGeneration = { ...defaultGenerationState };
            state.wireframeGeneration = { ...defaultGenerationState };
            state.styleGeneration = { ...defaultGenerationState };
            state.errors = [];
            state.warnings = [];
            state.history = [];
            state.historyIndex = -1;
          });
          
          get().addHistoryEntry('create', `Created project: ${name}`);
          return projectId;
        },

        updateProject: (updates: Partial<Project>) => {
          set((state) => {
            if (state.currentProject) {
              state.currentProject = {
                ...state.currentProject,
                ...updates,
                updatedAt: new Date(),
              };
            }
          });
          
          get().addHistoryEntry('update', 'Updated project', updates);
        },

        loadProject: async (projectId: string) => {
          // TODO: Implement database loading logic
          set((state) => {
            state.currentProject = null;
          });
        },

        deleteProject: (projectId: string) => {
          // TODO: Implement database deletion logic
          get().addHistoryEntry('update', `Deleted project: ${projectId}`);
        },

        // Workflow management actions
        setActiveStep: (step: WorkflowStep) => {
          set((state) => {
            state.activeStep = step;
            if (state.currentProject) {
              state.currentProject.currentStep = step;
            }
          });
        },

        completeStep: (step: WorkflowStep) => {
          set((state) => {
            if (!state.completedSteps.includes(step)) {
              state.completedSteps.push(step);
            }
            state.activeStep = step;
          });
        },

        resetWorkflow: () => {
          set((state) => {
            state.activeStep = 'initial';
            state.completedSteps = [];
            state.sitemap = null;
            state.wireframes = {};
            state.styleGuide = null;
            state.selectedPageId = null;
            state.errors = [];
            state.warnings = [];
          });
        },

        // Sitemap management actions
        setSitemap: (sitemap: SitemapStructure) => {
          set((state) => {
            state.sitemap = sitemap;
            if (state.currentProject) {
              state.currentProject.updatedAt = new Date();
            }
          });
          
          get().addHistoryEntry('generate-sitemap', 'Sitemap generated');
        },

        generateSitemap: async (request: SitemapGenerationRequest) => {
          const state = get();
          
          set((state) => {
            state.sitemapGeneration = {
              ...defaultGenerationState,
              status: 'generating',
              startTime: new Date(),
              progress: 0,
            };
          });

          try {
            // TODO: Replace with actual API call
            // const response = await sitemapAPI.generate(request);
            
            // Simulate generation for now
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const mockResponse: SitemapGenerationResponse = {
              sitemap: {
                id: uuidv4(),
                title: 'Generated Sitemap',
                description: request.prompt,
                websiteType: request.websiteType || 'business',
                pages: [],
                metadata: {},
                createdAt: new Date(),
                updatedAt: new Date(),
                version: '1.0.0',
              },
              metadata: {
                processingTime: 2000,
                tokensUsed: 0,
                confidence: 0.85,
              },
            };

            set((state) => {
              state.sitemap = mockResponse.sitemap;
              state.sitemapGeneration = {
                status: 'success',
                progress: 100,
                endTime: new Date(),
                confidence: mockResponse.metadata.confidence,
              };
            });

            get().completeStep('sitemap');
            
          } catch (error) {
            set((state) => {
              state.sitemapGeneration = {
                ...defaultGenerationState,
                status: 'error',
                error: error instanceof Error ? error.message : 'Generation failed',
                endTime: new Date(),
              };
            });
            
            get().addError('SITEMAP_GENERATION_FAILED', 'Failed to generate sitemap', 'error', 'sitemap');
          }
        },

        validateSitemap: async (): Promise<SitemapValidationResult> => {
          const state = get();
          
          if (!state.sitemap) {
            throw new Error('No sitemap to validate');
          }

          // TODO: Implement actual validation logic
          return {
            isValid: true,
            errors: [],
            statistics: {
              totalPages: state.sitemap.pages.length,
              rootPages: state.sitemap.pages.length,
              averageDepth: 1,
              maxDepth: 1,
              orphanedPages: 0,
              duplicatePaths: 0,
            },
          };
        },

        updateSitemapPage: (pageId: string, updates: Partial<SitemapStructure['pages'][0]>) => {
          set((state) => {
            if (state.sitemap) {
              const pageIndex = state.sitemap.pages.findIndex(p => p.id === pageId);
              if (pageIndex >= 0) {
                state.sitemap.pages[pageIndex] = {
                  ...state.sitemap.pages[pageIndex],
                  ...updates,
                };
              }
            }
          });
        },

        // Wireframe management actions
        setWireframe: (pageId: string, wireframe: Wireframe) => {
          set((state) => {
            state.wireframes[pageId] = wireframe;
          });
          
          get().addHistoryEntry('generate-wireframe', `Wireframe generated for page: ${pageId}`);
        },

        generateWireframe: async (pageId: string, options?: GenerationOptions) => {
          const state = get();
          
          set((state) => {
            state.wireframeGeneration = {
              ...defaultGenerationState,
              status: 'generating',
              startTime: new Date(),
              progress: 0,
            };
          });

          try {
            // TODO: Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const mockWireframe: Wireframe = {
              id: uuidv4(),
              name: `Wireframe for ${pageId}`,
              version: '1.0.0',
              createdAt: new Date(),
              updatedAt: new Date(),
              layout: { pattern: 'single-column' },
              components: [],
              rootComponent: {
                id: 'root',
                name: 'Root',
                type: 'container',
                category: 'layout',
                props: {},
                children: [],
              },
              breakpoints: [],
              defaultBreakpoint: 'desktop',
              activeBreakpoint: 'desktop',
              metadata: options || {},
              exportConfig: {
                format: 'json',
                includeComments: true,
                includeAnnotations: true,
              },
            };

            set((state) => {
              state.wireframes[pageId] = mockWireframe;
              state.wireframeGeneration = {
                status: 'success',
                progress: 100,
                endTime: new Date(),
                confidence: 0.85,
              };
            });

            get().completeStep('wireframe');
            
          } catch (error) {
            set((state) => {
              state.wireframeGeneration = {
                ...defaultGenerationState,
                status: 'error',
                error: error instanceof Error ? error.message : 'Generation failed',
                endTime: new Date(),
              };
            });
            
            get().addError('WIREFRAME_GENERATION_FAILED', 'Failed to generate wireframe', 'error', 'wireframe');
          }
        },

        updateWireframeComponent: (wireframeId: string, componentId: string, updates: any) => {
          set((state) => {
            // Implementation for updating wireframe components
          });
        },

        deleteWireframe: (pageId: string) => {
          set((state) => {
            delete state.wireframes[pageId];
          });
        },

        // Style management actions
        setStyleGuide: (styleGuide: StyleGuide) => {
          set((state) => {
            state.styleGuide = styleGuide;
            if (state.currentProject) {
              state.currentProject.updatedAt = new Date();
            }
          });
          
          get().addHistoryEntry('generate-style', 'Style guide generated');
        },

        generateStyleGuide: async (request: StyleGenerationRequest) => {
          const state = get();
          
          set((state) => {
            state.styleGeneration = {
              ...defaultGenerationState,
              status: 'generating',
              startTime: new Date(),
              progress: 0,
            };
          });

          try {
            // TODO: Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const mockStyleGuide: StyleGuide = {
              id: uuidv4(),
              name: 'Generated Style Guide',
              description: 'AI-generated style guide',
              createdAt: new Date(),
              updatedAt: new Date(),
              brandGuidelines: request.brandGuidelines,
              designStyle: request.designStyle,
              colorPalette: {
                primary: { 50: '#ffffff', 100: '#f9fafb', 200: '#f3f4f6', 300: '#e5e7eb', 400: '#d1d5db', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827', 950: '#030712' },
                secondary: { 50: '#ffffff', 100: '#f9fafb', 200: '#f3f4f6', 300: '#e5e7eb', 400: '#d1d5db', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827', 950: '#030712' },
                neutral: { 50: '#ffffff', 100: '#f9fafb', 200: '#f3f4f6', 300: '#e5e7eb', 400: '#d1d5db', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827', 950: '#030712' },
                success: '#10b981',
                warning: '#f59e0b',
                error: '#ef4444',
                info: '#3b82f6',
                background: { primary: '#ffffff', secondary: '#f9fafb', muted: '#f3f4f6' },
                text: { primary: '#111827', secondary: '#6b7280', muted: '#9ca3af', inverse: '#ffffff' },
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
              spacing: {
                base: 4,
                scale: {
                  0: '0',
                  0.5: '0.125rem',
                  1: '0.25rem',
                  1.5: '0.375rem',
                  2: '0.5rem',
                  2.5: '0.625rem',
                  3: '0.75rem',
                  3.5: '0.875rem',
                  4: '1rem',
                  5: '1.25rem',
                  6: '1.5rem',
                  7: '1.75rem',
                  8: '2rem',
                  9: '2.25rem',
                  10: '2.5rem',
                  11: '2.75rem',
                  12: '3rem',
                  14: '3.5rem',
                  16: '4rem',
                  20: '5rem',
                  24: '6rem',
                  28: '7rem',
                  32: '8rem',
                  36: '9rem',
                  40: '10rem',
                  44: '11rem',
                  48: '12rem',
                  52: '13rem',
                  56: '14rem',
                  60: '15rem',
                  64: '16rem',
                  72: '18rem',
                  80: '20rem',
                  96: '24rem',
                },
              },
              borderRadius: {
                none: '0',
                sm: '0.125rem',
                base: '0.25rem',
                md: '0.375rem',
                lg: '0.5rem',
                xl: '0.75rem',
                '2xl': '1rem',
                '3xl': '1.5rem',
                full: '9999px',
              },
              shadows: {
                sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
                inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
                none: 'none',
              },
              componentStyles: {
                button: {
                  primary: { backgroundColor: '#3b82f6', color: '#ffffff', borderRadius: '0.375rem' },
                  secondary: { backgroundColor: '#6b7280', color: '#ffffff', borderRadius: '0.375rem' },
                  outline: { backgroundColor: 'transparent', color: '#3b82f6', borderWidth: '1px', borderColor: '#3b82f6' },
                  ghost: { backgroundColor: 'transparent', color: '#3b82f6' },
                },
                card: {
                  base: { backgroundColor: '#ffffff', borderRadius: '0.5rem', padding: '1.5rem' },
                  elevated: { backgroundColor: '#ffffff', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
                  outlined: { backgroundColor: '#ffffff', borderRadius: '0.5rem', padding: '1.5rem', borderWidth: '1px', borderColor: '#e5e7eb' },
                },
                input: {
                  base: { backgroundColor: '#ffffff', borderRadius: '0.375rem', padding: '0.5rem 0.75rem', borderWidth: '1px', borderColor: '#d1d5db' },
                  focus: { borderColor: '#3b82f6', outline: '2px solid rgb(59 130 246 / 0.2)' },
                  error: { borderColor: '#ef4444' },
                },
                badge: {
                  primary: { backgroundColor: '#3b82f6', color: '#ffffff', borderRadius: '0.25rem', padding: '0.125rem 0.5rem' },
                  secondary: { backgroundColor: '#6b7280', color: '#ffffff', borderRadius: '0.25rem', padding: '0.125rem 0.5rem' },
                  outline: { backgroundColor: 'transparent', color: '#3b82f6', borderWidth: '1px', borderColor: '#3b82f6' },
                },
              },
              cssVariables: {},
            };

            set((state) => {
              state.styleGuide = mockStyleGuide;
              state.styleGeneration = {
                status: 'success',
                progress: 100,
                endTime: new Date(),
                confidence: 0.85,
              };
            });

            get().completeStep('style');
            
          } catch (error) {
            set((state) => {
              state.styleGeneration = {
                ...defaultGenerationState,
                status: 'error',
                error: error instanceof Error ? error.message : 'Generation failed',
                endTime: new Date(),
              };
            });
            
            get().addError('STYLE_GENERATION_FAILED', 'Failed to generate style guide', 'error', 'style');
          }
        },

        updateBrandGuidelines: (guidelines: BrandGuidelines) => {
          set((state) => {
            if (state.styleGuide) {
              state.styleGuide.brandGuidelines = guidelines;
            }
          });
        },

        applyStyleToComponent: (componentId: string, styleUpdates: any) => {
          set((state) => {
            // Implementation for applying styles to components
          });
        },

        // Canvas management actions
        setCanvasState: (state: CanvasState) => {
          set((state) => {
            state.canvasState = state;
          });
        },

        updateCanvasState: (updates: Partial<CanvasState>) => {
          set((state) => {
            if (state.canvasState) {
              state.canvasState = { ...state.canvasState, ...updates };
            }
          });
        },

        // UI state management actions
        setSidebarCollapsed: (collapsed: boolean) => {
          set((state) => {
            state.sidebarCollapsed = collapsed;
          });
        },

        setSelectedPageId: (pageId: string | null) => {
          set((state) => {
            state.selectedPageId = pageId;
          });
        },

        // History management actions
        addHistoryEntry: (action: ProjectHistoryEntry['action'], description: string, data?: any) => {
          set((state) => {
            const entry: ProjectHistoryEntry = {
              id: uuidv4(),
              timestamp: new Date(),
              action,
              description,
              data,
            };
            
            // Remove entries after current index (for redo functionality)
            if (state.historyIndex < state.history.length - 1) {
              state.history = state.history.slice(0, state.historyIndex + 1);
            }
            
            state.history.push(entry);
            state.historyIndex = state.history.length - 1;
            
            // Limit history size
            if (state.history.length > state.maxHistorySize) {
              state.history = state.history.slice(-state.maxHistorySize);
              state.historyIndex = state.history.length - 1;
            }
          });
        },

        undo: () => {
          const state = get();
          if (state.historyIndex > 0) {
            set((state) => {
              state.historyIndex--;
            });
          }
        },

        redo: () => {
          const state = get();
          if (state.historyIndex < state.history.length - 1) {
            set((state) => {
              state.historyIndex++;
            });
          }
        },

        clearHistory: () => {
          set((state) => {
            state.history = [];
            state.historyIndex = -1;
          });
        },

        // Persistence actions
        saveProject: async () => {
          set((state) => {
            state.lastSaved = new Date();
          });
          
          // TODO: Implement database saving
          get().addHistoryEntry('update', 'Project saved');
        },

        loadFromStorage: async () => {
          // TODO: Implement storage loading
        },

        clearStorage: () => {
          // TODO: Implement storage clearing
        },

        enableAutoSave: (enabled: boolean) => {
          set((state) => {
            state.autoSaveEnabled = enabled;
          });
        },

        setAutoSaveInterval: (interval: number) => {
          set((state) => {
            state.autoSaveInterval = interval;
          });
        },

        // Error handling actions
        addError: (code: string, message: string, severity: BuilderError['severity'], step?: WorkflowStep) => {
          set((state) => {
            state.errors.push({
              id: uuidv4(),
              code,
              message,
              severity,
              step,
              timestamp: new Date(),
              resolved: false,
            });
          });
        },

        removeError: (errorId: string) => {
          set((state) => {
            state.errors = state.errors.filter(e => e.id !== errorId);
          });
        },

        markErrorResolved: (errorId: string) => {
          set((state) => {
            const error = state.errors.find(e => e.id === errorId);
            if (error) {
              error.resolved = true;
            }
          });
        },

        addWarning: (code: string, message: string, step?: WorkflowStep) => {
          set((state) => {
            state.warnings.push({
              id: uuidv4(),
              code,
              message,
              step,
              timestamp: new Date(),
              acknowledged: false,
            });
          });
        },

        acknowledgeWarning: (warningId: string) => {
          set((state) => {
            const warning = state.warnings.find(w => w.id === warningId);
            if (warning) {
              warning.acknowledged = true;
            }
          });
        },

        clearErrors: () => {
          set((state) => {
            state.errors = [];
          });
        },

        clearWarnings: () => {
          set((state) => {
            state.warnings = [];
          });
        },

        // Utility actions
        reset: () => {
          set((state) => {
            state.currentProject = null;
            state.sitemap = null;
            state.wireframes = {};
            state.styleGuide = null;
            state.sitemapGeneration = { ...defaultGenerationState };
            state.wireframeGeneration = { ...defaultGenerationState };
            state.styleGeneration = { ...defaultGenerationState };
            state.activeStep = 'initial';
            state.completedSteps = [];
            state.sidebarCollapsed = false;
            state.selectedPageId = null;
            state.canvasState = null;
            state.history = [];
            state.historyIndex = -1;
            state.lastSaved = null;
            state.errors = [];
            state.warnings = [];
          });
        },

        exportData: (format: 'json' | 'csv' | 'xml'): string => {
          const state = get();
          const data = {
            project: state.currentProject,
            sitemap: state.sitemap,
            wireframes: state.wireframes,
            styleGuide: state.styleGuide,
            metadata: {
              exportedAt: new Date().toISOString(),
              version: '1.0.0',
            },
          };

          switch (format) {
            case 'json':
              return JSON.stringify(data, null, 2);
            case 'csv':
              // TODO: Implement CSV export
              return '';
            case 'xml':
              // TODO: Implement XML export
              return '';
            default:
              return JSON.stringify(data, null, 2);
          }
        },

        importData: (data: string, format: 'json') => {
          try {
            const parsedData = JSON.parse(data);
            
            set((state) => {
              state.currentProject = parsedData.project || null;
              state.sitemap = parsedData.sitemap || null;
              state.wireframes = parsedData.wireframes || {};
              state.styleGuide = parsedData.styleGuide || null;
            });
            
            get().addHistoryEntry('update', 'Project data imported');
            
          } catch (error) {
            get().addError('IMPORT_FAILED', 'Failed to import project data', 'error');
          }
        },
      })),
      {
        name: 'ai-site-builder-store',
        version: 1,
        partialize: (state) => ({
          currentProject: state.currentProject,
          sitemap: state.sitemap,
          wireframes: state.wireframes,
          styleGuide: state.styleGuide,
          activeStep: state.activeStep,
          completedSteps: state.completedSteps,
          sidebarCollapsed: state.sidebarCollapsed,
          autoSaveEnabled: state.autoSaveEnabled,
          autoSaveInterval: state.autoSaveInterval,
          lastSaved: state.lastSaved,
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            console.log('Store rehydrated from storage');
          }
        },
      }
    )
  )
);

// Selectors for convenient access
export const useCurrentProject = () => useBuilderStore((state) => state.currentProject);
export const useSitemap = () => useBuilderStore((state) => state.sitemap);
export const useWireframes = () => useBuilderStore((state) => state.wireframes);
export const useStyleGuide = () => useBuilderStore((state) => state.styleGuide);
export const useActiveStep = () => useBuilderStore((state) => state.activeStep);
export const useCompletedSteps = () => useBuilderStore((state) => state.completedSteps);
export const useSelectedPageId = () => useBuilderStore((state) => state.selectedPageId);
export const useErrors = () => useBuilderStore((state) => state.errors);
export const useWarnings = () => useBuilderStore((state) => state.warnings);
export const useCanvasState = () => useBuilderStore((state) => state.canvasState);
export const useHistory = () => useBuilderStore((state) => state.history.slice(0, state.historyIndex + 1));

// Generation state selectors
export const useSitemapGenerationState = () => useBuilderStore((state) => state.sitemapGeneration);
export const useWireframeGenerationState = () => useBuilderStore((state) => state.wireframeGeneration);
export const useStyleGenerationState = () => useBuilderStore((state) => state.styleGeneration);

// Utility hooks
export const useCanProceedToStep = (step: WorkflowStep) => {
  const completedSteps = useCompletedSteps();
  const activeStep = useActiveStep();
  
  const stepOrder: WorkflowStep[] = ['initial', 'sitemap', 'wireframe', 'style', 'review', 'export'];
  const currentIndex = stepOrder.indexOf(activeStep);
  const targetIndex = stepOrder.indexOf(step);
  
  return targetIndex <= currentIndex + 1 && completedSteps.includes(stepOrder[targetIndex - 1]);
};

export const useWorkflowProgress = () => {
  const completedSteps = useCompletedSteps();
  const totalSteps = 4; // sitemap, wireframe, style, review
  
  return Math.min((completedSteps.length / totalSteps) * 100, 100);
};

export default useBuilderStore;