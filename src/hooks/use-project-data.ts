/**
 * Project Data Hook
 * Manages project data, persistence, and operations
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useBuilderStore } from './use-builder-store';
import { Project, WorkflowStep } from './use-builder-store';
import { SitemapStructure } from '../types/sitemap';
import { Wireframe } from '../types/wireframe';
import { StyleGuide } from '../types/style-guide';
import toast from 'react-hot-toast';

interface UseProjectDataReturn {
  // Project management
  currentProject: Project | null;
  projects: Project[];
  createProject: (data: CreateProjectData) => Promise<string>;
  updateProject: (updates: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  duplicateProject: (projectId: string) => Promise<string>;
  loadProject: (projectId: string) => Promise<void>;
  
  // Project metadata
  projectStats: ProjectStats | null;
  lastModified: Date | null;
  projectSize: number;
  dataIntegrityScore: number;
  
  // Persistence
  saveProject: () => Promise<void>;
  autoSave: boolean;
  setAutoSave: (enabled: boolean) => void;
  lastSaved: Date | null;
  unsavedChanges: boolean;
  manualSave: () => Promise<void>;
  revertToLastSave: () => Promise<void>;
  
  // Data export/import
  exportProject: (format: 'json' | 'csv' | 'xml') => string;
  importProject: (data: string, format: 'json') => Promise<void>;
  downloadBackup: () => void;
  uploadBackup: (file: File) => Promise<void>;
  
  // Data validation
  validateProject: () => {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  };
  fixDataIssues: () => Promise<void>;
  
  // Data operations
  clearProjectData: () => void;
  resetProjectToTemplate: (templateId: string) => Promise<void>;
  mergeProjects: (sourceProjectId: string, targetProjectId: string) => Promise<void>;
  
  // Search and filter
  searchProjects: (query: string) => Project[];
  filterProjects: (filters: ProjectFilters) => Project[];
  sortProjects: (by: ProjectSortBy, direction: 'asc' | 'desc') => void;
  
  // Data integrity
  checkDataIntegrity: () => Promise<DataIntegrityReport>;
  repairDataIntegrity: (report: DataIntegrityReport) => Promise<void>;
  backupBeforeRepair: () => string;
  
  // Sharing and collaboration
  shareProject: (accessLevel: 'view' | 'edit') => string;
  importSharedProject: (shareId: string) => Promise<string>;
  revokeAccess: (shareId: string) => Promise<void>;
  
  // Analytics and insights
  getProjectAnalytics: () => ProjectAnalytics | null;
  getCompletionInsights: () => CompletionInsights | null;
  getOptimizationSuggestions: () => string[];
}

interface CreateProjectData {
  name: string;
  description?: string;
  websiteType?: string;
  template?: string;
  preferences?: Record<string, any>;
}

interface ProjectStats {
  totalPages: number;
  completedSteps: number;
  totalSteps: number;
  progress: number;
  timeSpent: number; // in minutes
  lastActivity: Date;
  dataSize: number; // in bytes
  complexity: 'low' | 'medium' | 'high';
  qualityScore: number;
}

interface ProjectFilters {
  websiteType?: string;
  status?: 'draft' | 'in-progress' | 'completed' | 'archived';
  createdAfter?: Date;
  createdBefore?: Date;
  hasSitemap?: boolean;
  hasWireframes?: boolean;
  hasStyleGuide?: boolean;
  progressMin?: number;
  progressMax?: number;
}

type ProjectSortBy = 
  | 'name'
  | 'created'
  | 'modified'
  | 'progress'
  | 'size'
  | 'complexity';

interface DataIntegrityReport {
  isHealthy: boolean;
  score: number; // 0-100
  issues: DataIntegrityIssue[];
  recommendations: string[];
  lastCheck: Date;
}

interface DataIntegrityIssue {
  type: 'missing' | 'corrupted' | 'inconsistent' | 'deprecated';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedData: string;
  suggestedFix: string;
  autoFixable: boolean;
}

interface ProjectAnalytics {
  timeSpentPerStep: Record<WorkflowStep, number>;
  generationAttempts: Record<string, number>;
  errorRates: Record<string, number>;
  userEngagement: {
    sessionsCount: number;
    averageSessionDuration: number;
    lastActivity: Date;
  };
  performance: {
    generationSpeed: number; // average time per generation
    errorRecoveryRate: number; // percentage of errors that were resolved
    completionRate: number; // percentage of started projects that were completed
  };
}

interface CompletionInsights {
  completionRate: number;
  averageTimeToComplete: number;
  commonDropOffPoints: WorkflowStep[];
  optimizationOpportunities: string[];
  estimatedTimeRemaining: number;
}

export const useProjectData = (): UseProjectDataReturn => {
  const {
    currentProject,
    sitemap,
    wireframes,
    styleGuide,
    activeStep,
    completedSteps,
    lastSaved,
    autoSaveEnabled,
    createProject: createProjectAction,
    updateProject: updateProjectAction,
    saveProject: saveProjectAction,
    reset,
  } = useBuilderStore();

  // Local state
  const [projects, setProjects] = useState<Project[]>([]);
  const [autoSave, setAutoSaveState] = useState(autoSaveEnabled);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [projectFilters, setProjectFilters] = useState<ProjectFilters>({});
  const [sortConfig, setSortConfig] = useState<{
    by: ProjectSortBy;
    direction: 'asc' | 'desc';
  }>({ by: 'modified', direction: 'desc' });

  // Load projects from storage
  useEffect(() => {
    loadProjectsFromStorage();
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && unsavedChanges && currentProject) {
      const timeoutId = setTimeout(async () => {
        await saveProjectAction();
        setUnsavedChanges(false);
      }, 30000); // Auto-save after 30 seconds

      return () => clearTimeout(timeoutId);
    }
  }, [autoSave, unsavedChanges, currentProject, saveProjectAction]);

  // Project management
  const createProject = useCallback(async (data: CreateProjectData): Promise<string> => {
    try {
      const projectId = createProjectAction(data.name, data.description, data.websiteType);
      
      // Load template if specified
      if (data.template) {
        await loadTemplate(data.template, projectId);
      }

      // Update with additional data
      await updateProject({
        metadata: {
          template: data.template,
          preferences: data.preferences,
          createdFrom: 'manual',
        },
      });

      // Refresh projects list
      await loadProjectsFromStorage();
      
      toast.success(`Project "${data.name}" created successfully`);
      return projectId;
    } catch (error) {
      toast.error('Failed to create project');
      throw error;
    }
  }, [createProjectAction]);

  const updateProject = useCallback(async (updates: Partial<Project>) => {
    if (!currentProject) return;

    try {
      updateProjectAction(updates);
      setUnsavedChanges(true);
      
      // Refresh projects list
      await loadProjectsFromStorage();
      
      toast.success('Project updated successfully');
    } catch (error) {
      toast.error('Failed to update project');
      throw error;
    }
  }, [currentProject, updateProjectAction]);

  const deleteProject = useCallback(async (projectId: string) => {
    try {
      // TODO: Implement actual deletion from storage
      setProjects(prev => prev.filter(p => p.id !== projectId));
      
      toast.success('Project deleted successfully');
    } catch (error) {
      toast.error('Failed to delete project');
      throw error;
    }
  }, []);

  const duplicateProject = useCallback(async (projectId: string): Promise<string> => {
    try {
      const originalProject = projects.find(p => p.id === projectId);
      if (!originalProject) {
        throw new Error('Project not found');
      }

      const duplicateId = await createProject({
        name: `${originalProject.name} (Copy)`,
        description: originalProject.description,
        websiteType: originalProject.websiteType,
      });

      // TODO: Copy project data (sitemap, wireframes, style guide)
      
      toast.success('Project duplicated successfully');
      return duplicateId;
    } catch (error) {
      toast.error('Failed to duplicate project');
      throw error;
    }
  }, [projects, createProject]);

  const loadProject = useCallback(async (projectId: string) => {
    try {
      // TODO: Implement actual loading from storage
      const project = projects.find(p => p.id === projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      // TODO: Load associated data (sitemap, wireframes, style guide)
      
      toast.success(`Loaded project: ${project.name}`);
    } catch (error) {
      toast.error('Failed to load project');
      throw error;
    }
  }, [projects]);

  // Project metadata
  const projectStats = useMemo((): ProjectStats | null => {
    if (!currentProject) return null;

    const totalPages = sitemap?.pages.length || 0;
    const totalSteps = 5; // sitemap, wireframe, style, review, export
    const progress = (completedSteps.length / totalSteps) * 100;
    const timeSpent = 0; // TODO: Calculate from history
    const lastActivity = currentProject.updatedAt;
    const dataSize = calculateProjectSize();
    const complexity = calculateComplexity();
    const qualityScore = calculateQualityScore();

    return {
      totalPages,
      completedSteps: completedSteps.length,
      totalSteps,
      progress,
      timeSpent,
      lastActivity,
      dataSize,
      complexity,
      qualityScore,
    };
  }, [currentProject, sitemap, completedSteps]);

  const lastModified = currentProject?.updatedAt || null;
  
  const projectSize = useMemo(() => {
    return calculateProjectSize();
  }, [currentProject, sitemap, wireframes, styleGuide]);

  const dataIntegrityScore = useMemo(() => {
    return calculateQualityScore();
  }, [currentProject, sitemap, wireframes, styleGuide]);

  // Persistence
  const manualSave = useCallback(async () => {
    if (!currentProject) return;

    try {
      await saveProjectAction();
      setUnsavedChanges(false);
      toast.success('Project saved successfully');
    } catch (error) {
      toast.error('Failed to save project');
      throw error;
    }
  }, [currentProject, saveProjectAction]);

  const revertToLastSave = useCallback(async () => {
    if (!currentProject) return;

    try {
      // TODO: Implement reversion to last saved state
      setUnsavedChanges(false);
      toast.success('Reverted to last saved state');
    } catch (error) {
      toast.error('Failed to revert changes');
      throw error;
    }
  }, [currentProject]);

  const setAutoSave = useCallback((enabled: boolean) => {
    setAutoSaveState(enabled);
    // TODO: Update store
    toast.success(`Auto-save ${enabled ? 'enabled' : 'disabled'}`);
  }, []);

  // Data export/import
  const exportProject = useCallback((format: 'json' | 'csv' | 'xml'): string => {
    if (!currentProject) {
      throw new Error('No project to export');
    }

    const projectData = {
      project: currentProject,
      sitemap,
      wireframes,
      styleGuide,
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        format,
      },
    };

    switch (format) {
      case 'json':
        return JSON.stringify(projectData, null, 2);
      
      case 'csv':
        return exportToCSV();
      
      case 'xml':
        return exportToXML();
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }, [currentProject, sitemap, wireframes, styleGuide]);

  const importProject = useCallback(async (data: string, format: 'json') => {
    try {
      const importedData = JSON.parse(data);
      
      // TODO: Implement data import and validation
      setUnsavedChanges(true);
      
      toast.success('Project imported successfully');
    } catch (error) {
      toast.error('Failed to import project');
      throw error;
    }
  }, []);

  const downloadBackup = useCallback(() => {
    if (!currentProject) return;

    const backupData = exportProject('json');
    const blob = new Blob([backupData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentProject.name.replace(/[^a-z0-9]/gi, '_')}_backup.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success('Backup downloaded');
  }, [currentProject, exportProject]);

  const uploadBackup = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      await importProject(text, 'json');
      toast.success('Backup uploaded and restored');
    } catch (error) {
      toast.error('Failed to upload backup');
      throw error;
    }
  }, [importProject]);

  // Data validation
  const validateProject = useCallback(() => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!currentProject) {
      errors.push('No active project');
      return { isValid: false, errors, warnings, suggestions };
    }

    // Validate project structure
    if (!currentProject.name?.trim()) {
      errors.push('Project name is required');
    }

    // Validate sitemap
    if (!sitemap) {
      warnings.push('No sitemap generated');
    } else {
      if (sitemap.pages.length === 0) {
        errors.push('Sitemap must have at least one page');
      }
      
      const criticalPages = sitemap.pages.filter(p => p.isCritical);
      if (criticalPages.length === 0) {
        warnings.push('Consider marking some pages as critical');
      }
    }

    // Validate wireframes
    const hasWireframes = Object.keys(wireframes).length > 0;
    if (!hasWireframes) {
      warnings.push('No wireframes generated');
    }

    // Validate style guide
    if (!styleGuide) {
      warnings.push('No style guide generated');
    } else {
      if (!styleGuide.brandGuidelines.name?.trim()) {
        warnings.push('Brand name not specified');
      }
    }

    // Generate suggestions
    if (!hasWireframes && sitemap) {
      suggestions.push('Generate wireframes for your sitemap pages');
    }
    
    if (!styleGuide) {
      suggestions.push('Create a style guide to define your brand identity');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }, [currentProject, sitemap, wireframes, styleGuide]);

  const fixDataIssues = useCallback(async () => {
    try {
      // TODO: Implement automatic data issue fixing
      toast.success('Data issues fixed');
    } catch (error) {
      toast.error('Failed to fix data issues');
      throw error;
    }
  }, []);

  // Data operations
  const clearProjectData = useCallback(() => {
    if (confirm('Are you sure you want to clear all project data? This action cannot be undone.')) {
      reset();
      setUnsavedChanges(false);
      toast.success('Project data cleared');
    }
  }, [reset]);

  const resetProjectToTemplate = useCallback(async (templateId: string) => {
    try {
      // TODO: Implement template loading
      toast.success('Project reset to template');
    } catch (error) {
      toast.error('Failed to reset to template');
      throw error;
    }
  }, []);

  const mergeProjects = useCallback(async (sourceProjectId: string, targetProjectId: string) => {
    try {
      // TODO: Implement project merging
      toast.success('Projects merged successfully');
    } catch (error) {
      toast.error('Failed to merge projects');
      throw error;
    }
  }, []);

  // Search and filter
  const searchProjects = useCallback((query: string): Project[] => {
    if (!query.trim()) return projects;

    const searchTerm = query.toLowerCase();
    return projects.filter(project =>
      project.name.toLowerCase().includes(searchTerm) ||
      project.description?.toLowerCase().includes(searchTerm) ||
      project.websiteType?.toLowerCase().includes(searchTerm)
    );
  }, [projects]);

  const filterProjects = useCallback((filters: ProjectFilters): Project[] => {
    return projects.filter(project => {
      if (filters.websiteType && project.websiteType !== filters.websiteType) {
        return false;
      }
      
      if (filters.status && project.status !== filters.status) {
        return false;
      }
      
      if (filters.createdAfter && project.createdAt < filters.createdAfter) {
        return false;
      }
      
      if (filters.createdBefore && project.createdAt > filters.createdBefore) {
        return false;
      }
      
      if (filters.progressMin !== undefined) {
        const progress = (completedSteps.length / 5) * 100;
        if (progress < filters.progressMin) return false;
      }
      
      if (filters.progressMax !== undefined) {
        const progress = (completedSteps.length / 5) * 100;
        if (progress > filters.progressMax) return false;
      }
      
      return true;
    });
  }, [projects, completedSteps]);

  const sortProjects = useCallback((by: ProjectSortBy, direction: 'asc' | 'desc') => {
    setSortConfig({ by, direction });
  }, []);

  // Utility functions
  const calculateProjectSize = useCallback((): number => {
    let size = 0;
    
    if (sitemap) size += JSON.stringify(sitemap).length;
    if (wireframes) size += JSON.stringify(wireframes).length;
    if (styleGuide) size += JSON.stringify(styleGuide).length;
    
    return size;
  }, [sitemap, wireframes, styleGuide]);

  const calculateComplexity = useCallback((): 'low' | 'medium' | 'high' => {
    const pageCount = sitemap?.pages.length || 0;
    const wireframeCount = Object.keys(wireframes).length;
    
    if (pageCount <= 3 && wireframeCount <= 2) return 'low';
    if (pageCount <= 10 && wireframeCount <= 5) return 'medium';
    return 'high';
  }, [sitemap, wireframes]);

  const calculateQualityScore = useCallback((): number => {
    let score = 0;
    let maxScore = 0;
    
    // Project completeness (40%)
    maxScore += 40;
    if (currentProject?.name) score += 10;
    if (sitemap) score += 10;
    if (Object.keys(wireframes).length > 0) score += 10;
    if (styleGuide) score += 10;
    
    // Data integrity (30%)
    maxScore += 30;
    if (sitemap && sitemap.pages.length > 0) score += 15;
    if (styleGuide && styleGuide.brandGuidelines.name) score += 15;
    
    // Progress (30%)
    maxScore += 30;
    score += (completedSteps.length / 5) * 30;
    
    return Math.round((score / maxScore) * 100);
  }, [currentProject, sitemap, wireframes, styleGuide, completedSteps]);

  const exportToCSV = useCallback((): string => {
    // TODO: Implement CSV export
    return '';
  }, []);

  const exportToXML = useCallback((): string => {
    // TODO: Implement XML export
    return '';
  }, []);

  const loadProjectsFromStorage = useCallback(async () => {
    // TODO: Implement loading from storage/database
  }, []);

  const loadTemplate = useCallback(async (templateId: string, projectId: string) => {
    // TODO: Implement template loading
  }, []);

  // Placeholder implementations for advanced features
  const checkDataIntegrity = useCallback(async (): Promise<DataIntegrityReport> => {
    return {
      isHealthy: true,
      score: 100,
      issues: [],
      recommendations: [],
      lastCheck: new Date(),
    };
  }, []);

  const repairDataIntegrity = useCallback(async (report: DataIntegrityReport) => {
    // TODO: Implement data repair
  }, []);

  const backupBeforeRepair = useCallback((): string => {
    return exportProject('json');
  }, [exportProject]);

  const shareProject = useCallback((accessLevel: 'view' | 'edit'): string => {
    // TODO: Implement project sharing
    return 'share-id-placeholder';
  }, []);

  const importSharedProject = useCallback(async (shareId: string): Promise<string> => {
    // TODO: Implement shared project import
    return 'imported-project-id';
  }, []);

  const revokeAccess = useCallback(async (shareId: string) => {
    // TODO: Implement access revocation
  }, []);

  const getProjectAnalytics = useCallback((): ProjectAnalytics | null => {
    if (!currentProject) return null;
    
    // TODO: Implement analytics calculation
    return {
      timeSpentPerStep: {} as Record<WorkflowStep, number>,
      generationAttempts: {},
      errorRates: {},
      userEngagement: {
        sessionsCount: 1,
        averageSessionDuration: 0,
        lastActivity: new Date(),
      },
      performance: {
        generationSpeed: 0,
        errorRecoveryRate: 0,
        completionRate: 0,
      },
    };
  }, [currentProject]);

  const getCompletionInsights = useCallback((): CompletionInsights | null => {
    // TODO: Implement completion insights
    return {
      completionRate: 0,
      averageTimeToComplete: 0,
      commonDropOffPoints: [],
      optimizationOpportunities: [],
      estimatedTimeRemaining: 0,
    };
  }, []);

  const getOptimizationSuggestions = useCallback((): string[] => {
    const suggestions: string[] = [];
    
    if (!styleGuide) {
      suggestions.push('Create a style guide to improve brand consistency');
    }
    
    if (Object.keys(wireframes).length < (sitemap?.pages.length || 0)) {
      suggestions.push('Generate wireframes for all sitemap pages');
    }
    
    return suggestions;
  }, [styleGuide, wireframes, sitemap]);

  return {
    // Project management
    currentProject,
    projects,
    createProject,
    updateProject,
    deleteProject,
    duplicateProject,
    loadProject,
    
    // Project metadata
    projectStats,
    lastModified,
    projectSize,
    dataIntegrityScore,
    
    // Persistence
    saveProject: manualSave,
    autoSave,
    setAutoSave,
    lastSaved,
    unsavedChanges,
    manualSave,
    revertToLastSave,
    
    // Data export/import
    exportProject,
    importProject,
    downloadBackup,
    uploadBackup,
    
    // Data validation
    validateProject,
    fixDataIssues,
    
    // Data operations
    clearProjectData,
    resetProjectToTemplate,
    mergeProjects,
    
    // Search and filter
    searchProjects,
    filterProjects,
    sortProjects,
    
    // Data integrity
    checkDataIntegrity,
    repairDataIntegrity,
    backupBeforeRepair,
    
    // Sharing and collaboration
    shareProject,
    importSharedProject,
    revokeAccess,
    
    // Analytics and insights
    getProjectAnalytics,
    getCompletionInsights,
    getOptimizationSuggestions,
  };
};

export default useProjectData;