/**
 * State Management System Index
 * Central export point for all hooks and utilities
 */

// Main store
export { useBuilderStore, default as useBuilderStoreDefault } from './use-builder-store';
export * from './use-builder-store';

// Workflow hooks
export { useSitemapGenerator, default as useSitemapGeneratorDefault } from './use-sitemap-generator';
export { useWireframeGenerator, default as useWireframeGeneratorDefault } from './use-wireframe-generator';
export { useStyleGenerator, default as useStyleGeneratorDefault } from './use-style-generator';

// Component hooks
export { useWorkflowState, default as useWorkflowStateDefault } from './use-workflow-state';
export { useProjectData, default as useProjectDataDefault } from './use-project-data';

// Convenience selectors
export {
  useCurrentProject,
  useSitemap,
  useWireframes,
  useStyleGuide,
  useActiveStep,
  useCompletedSteps,
  useSelectedPageId,
  useErrors,
  useWarnings,
  useCanvasState,
  useHistory,
  useSitemapGenerationState,
  useWireframeGenerationState,
  useStyleGenerationState,
  useCanProceedToStep,
  useWorkflowProgress,
} from './use-builder-store';

// Type exports
export type {
  Project,
  WorkflowStep,
  GenerationState,
  ProjectHistoryEntry,
  BuilderError,
  BuilderWarning,
  BuilderStore,
} from './use-builder-store';

export type {
  UseSitemapGeneratorReturn,
} from './use-sitemap-generator';

export type {
  UseWireframeGeneratorReturn,
} from './use-wireframe-generator';

export type {
  UseStyleGeneratorReturn,
} from './use-style-generator';

export type {
  UseWorkflowStateReturn,
} from './use-workflow-state';

export type {
  UseProjectDataReturn,
  CreateProjectData,
  ProjectStats,
  ProjectFilters,
  ProjectSortBy,
  DataIntegrityReport,
  ProjectAnalytics,
  CompletionInsights,
} from './use-project-data';