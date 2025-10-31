/**
 * Workflow State Hook
 * Manages UI workflow state and step navigation
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useBuilderStore } from './use-builder-store';
import { WorkflowStep, Project } from './use-builder-store';
import toast from 'react-hot-toast';

interface UseWorkflowStateReturn {
  // Current workflow state
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  canProceedToStep: (step: WorkflowStep) => boolean;
  canGoBackToStep: (step: WorkflowStep) => boolean;
  
  // Navigation actions
  goToStep: (step: WorkflowStep) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  resetWorkflow: () => void;
  
  // Step validation
  validateCurrentStep: () => { isValid: boolean; errors: string[] };
  canAdvanceFromCurrentStep: boolean;
  requiredDataForNextStep: string[];
  
  // Progress tracking
  workflowProgress: number;
  stepTitles: Record<WorkflowStep, string>;
  stepDescriptions: Record<WorkflowStep, string>;
  stepIcons: Record<WorkflowStep, string>;
  
  // Workflow history
  stepHistory: WorkflowStep[];
  canUndoStep: boolean;
  undoLastStep: () => void;
  
  // Auto-navigation
  enableAutoAdvance: (enabled: boolean) => void;
  autoAdvanceEnabled: boolean;
  autoAdvanceDelay: number;
  setAutoAdvanceDelay: (delay: number) => void;
  
  // Validation rules for each step
  validateStepRequirements: (step: WorkflowStep) => {
    isComplete: boolean;
    missingItems: string[];
    warnings: string[];
  };
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  'initial',
  'sitemap', 
  'wireframe',
  'style',
  'review',
  'export'
];

const STEP_TITLES: Record<WorkflowStep, string> = {
  initial: 'Project Setup',
  sitemap: 'Sitemap Generation',
  wireframe: 'Wireframe Creation',
  style: 'Style Guide Design',
  review: 'Review & Refinement',
  export: 'Export & Deploy'
};

const STEP_DESCRIPTIONS: Record<WorkflowStep, string> = {
  initial: 'Configure your project details and preferences',
  sitemap: 'Generate the structure and pages for your website',
  wireframe: 'Create wireframes for each page layout',
  style: 'Design the visual style and branding',
  review: 'Review and refine all components',
  export: 'Export your website and deploy it'
};

const STEP_ICONS: Record<WorkflowStep, string> = {
  initial: '⚙️',
  sitemap: '🗺️',
  wireframe: '📐',
  style: '🎨',
  review: '👀',
  export: '🚀'
};

export const useWorkflowState = (): UseWorkflowStateReturn => {
  const {
    currentProject,
    activeStep,
    completedSteps,
    sitemap,
    wireframes,
    styleGuide,
    setActiveStep,
    completeStep,
    resetWorkflow: resetWorkflowAction,
  } = useBuilderStore();

  // Local state
  const [stepHistory, setStepHistory] = useState<WorkflowStep[]>([activeStep]);
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(false);
  const [autoAdvanceDelay, setAutoAdvanceDelay] = useState(2000); // 2 seconds

  // Current workflow state
  const currentStep = activeStep;
  const canProceedToStep = useCallback((step: WorkflowStep): boolean => {
    const currentIndex = WORKFLOW_STEPS.indexOf(currentStep);
    const targetIndex = WORKFLOW_STEPS.indexOf(step);
    
    // Can only proceed to next step or current step
    return targetIndex <= currentIndex + 1;
  }, [currentStep]);

  const canGoBackToStep = useCallback((step: WorkflowStep): boolean => {
    const targetIndex = WORKFLOW_STEPS.indexOf(step);
    const currentIndex = WORKFLOW_STEPS.indexOf(currentStep);
    
    // Can go back to any previous step
    return targetIndex < currentIndex;
  }, [currentStep]);

  // Navigation actions
  const goToStep = useCallback((step: WorkflowStep) => {
    if (!canProceedToStep(step)) {
      toast.error('Cannot proceed to this step yet');
      return;
    }

    setActiveStep(step);
    setStepHistory(prev => [...prev, step]);
    toast.success(`Moved to: ${STEP_TITLES[step]}`);
  }, [canProceedToStep, setActiveStep]);

  const goToNextStep = useCallback(() => {
    const currentIndex = WORKFLOW_STEPS.indexOf(currentStep);
    if (currentIndex < WORKFLOW_STEPS.length - 1) {
      const nextStep = WORKFLOW_STEPS[currentIndex + 1];
      
      if (validateCurrentStep().isValid) {
        goToStep(nextStep);
      } else {
        toast.error('Current step is not complete yet');
      }
    }
  }, [currentStep, goToStep]);

  const goToPreviousStep = useCallback(() => {
    const currentIndex = WORKFLOW_STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      const previousStep = WORKFLOW_STEPS[currentIndex - 1];
      goToStep(previousStep);
    }
  }, [currentStep, goToStep]);

  const resetWorkflow = useCallback(() => {
    resetWorkflowAction();
    setStepHistory(['initial']);
    toast.success('Workflow reset');
  }, [resetWorkflowAction]);

  // Step validation
  const validateCurrentStep = useCallback((): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    switch (currentStep) {
      case 'initial':
        if (!currentProject) {
          errors.push('No project created');
        } else if (!currentProject.name.trim()) {
          errors.push('Project name is required');
        }
        break;

      case 'sitemap':
        if (!sitemap) {
          errors.push('No sitemap generated');
        } else if (!sitemap.pages || sitemap.pages.length === 0) {
          errors.push('Sitemap must have at least one page');
        }
        break;

      case 'wireframe':
        if (!sitemap || !sitemap.pages.length) {
          errors.push('Sitemap is required for wireframes');
        } else if (Object.keys(wireframes).length === 0) {
          errors.push('No wireframes generated');
        }
        break;

      case 'style':
        if (!sitemap || !sitemap.pages.length) {
          errors.push('Sitemap is required for styling');
        } else if (!styleGuide) {
          errors.push('No style guide generated');
        }
        break;

      case 'review':
        if (!sitemap || !styleGuide) {
          errors.push('Sitemap and style guide are required for review');
        } else if (Object.keys(wireframes).length === 0) {
          errors.push('Wireframes are required for review');
        }
        break;

      case 'export':
        if (!sitemap || !styleGuide || Object.keys(wireframes).length === 0) {
          errors.push('All previous steps must be completed for export');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [currentStep, currentProject, sitemap, wireframes, styleGuide]);

  const canAdvanceFromCurrentStep = useMemo(() => {
    return validateCurrentStep().isValid;
  }, [validateCurrentStep]);

  const requiredDataForNextStep = useMemo(() => {
    switch (currentStep) {
      case 'initial':
        return ['Project name', 'Website type'];
      case 'sitemap':
        return ['At least one page'];
      case 'wireframe':
        return ['Wireframe for main pages'];
      case 'style':
        return ['Brand guidelines', 'Design style'];
      case 'review':
        return ['All previous steps completed'];
      default:
        return [];
    }
  }, [currentStep]);

  // Progress tracking
  const workflowProgress = useMemo(() => {
    const completedCount = completedSteps.length;
    return Math.min((completedCount / (WORKFLOW_STEPS.length - 1)) * 100, 100);
  }, [completedSteps]);

  // Workflow history
  const canUndoStep = stepHistory.length > 1;

  const undoLastStep = useCallback(() => {
    if (canUndoStep) {
      const newHistory = stepHistory.slice(0, -1);
      const previousStep = newHistory[newHistory.length - 1];
      setStepHistory(newHistory);
      setActiveStep(previousStep);
      toast.success(`Moved back to: ${STEP_TITLES[previousStep]}`);
    }
  }, [canUndoStep, stepHistory, setActiveStep]);

  // Auto-navigation
  const enableAutoAdvance = useCallback((enabled: boolean) => {
    setAutoAdvanceEnabled(enabled);
    if (enabled) {
      toast.success('Auto-advance enabled');
    } else {
      toast.success('Auto-advance disabled');
    }
  }, []);

  // Auto-advance when current step is completed
  useEffect(() => {
    if (autoAdvanceEnabled && canAdvanceFromCurrentStep) {
      const timeoutId = setTimeout(() => {
        goToNextStep();
      }, autoAdvanceDelay);

      return () => clearTimeout(timeoutId);
    }
  }, [autoAdvanceEnabled, canAdvanceFromCurrentStep, autoAdvanceDelay, goToNextStep]);

  // Validation rules for each step
  const validateStepRequirements = useCallback((step: WorkflowStep): {
    isComplete: boolean;
    missingItems: string[];
    warnings: string[];
  } => {
    const missingItems: string[] = [];
    const warnings: string[] = [];

    switch (step) {
      case 'initial':
        if (!currentProject) {
          missingItems.push('Create a new project');
        } else {
          if (!currentProject.name?.trim()) {
            missingItems.push('Project name');
          }
          if (!currentProject.websiteType) {
            missingItems.push('Website type');
          }
        }
        break;

      case 'sitemap':
        if (!sitemap) {
          missingItems.push('Generate sitemap');
        } else {
          if (!sitemap.pages || sitemap.pages.length === 0) {
            missingItems.push('At least one page');
          }
          const criticalPages = sitemap.pages.filter(p => p.isCritical);
          if (criticalPages.length === 0) {
            warnings.push('No critical pages defined');
          }
        }
        break;

      case 'wireframe':
        if (!sitemap || sitemap.pages.length === 0) {
          missingItems.push('Valid sitemap');
        } else if (Object.keys(wireframes).length === 0) {
          missingItems.push('Generate wireframes');
        } else {
          const criticalWireframes = sitemap.pages
            .filter(p => p.isCritical)
            .filter(p => wireframes[p.id]);
          
          if (criticalWireframes.length < sitemap.pages.filter(p => p.isCritical).length) {
            missingItems.push('Wireframes for critical pages');
          }
        }
        break;

      case 'style':
        if (!sitemap) {
          missingItems.push('Valid sitemap');
        } else if (!styleGuide) {
          missingItems.push('Generate style guide');
        } else {
          if (!styleGuide.brandGuidelines.name?.trim()) {
            missingItems.push('Brand name');
          }
          if (!styleGuide.colorPalette.primary[500]) {
            missingItems.push('Primary color');
          }
        }
        break;

      case 'review':
        if (!sitemap) {
          missingItems.push('Complete sitemap');
        } else if (Object.keys(wireframes).length === 0) {
          missingItems.push('Complete wireframes');
        } else if (!styleGuide) {
          missingItems.push('Complete style guide');
        }
        break;

      case 'export':
        if (!sitemap || !styleGuide || Object.keys(wireframes).length === 0) {
          missingItems.push('Complete all previous steps');
        }
        break;
    }

    return {
      isComplete: missingItems.length === 0,
      missingItems,
      warnings
    };
  }, [currentProject, sitemap, wireframes, styleGuide]);

  // Listen for step completion and auto-advance if enabled
  useEffect(() => {
    const isComplete = validateStepRequirements(currentStep).isComplete;
    
    if (isComplete && !completedSteps.includes(currentStep)) {
      completeStep(currentStep);
    }
  }, [currentStep, completedSteps, validateStepRequirements, completeStep]);

  return {
    // Current workflow state
    currentStep,
    completedSteps,
    canProceedToStep,
    canGoBackToStep,
    
    // Navigation actions
    goToStep,
    goToNextStep,
    goToPreviousStep,
    resetWorkflow,
    
    // Step validation
    validateCurrentStep,
    canAdvanceFromCurrentStep,
    requiredDataForNextStep,
    
    // Progress tracking
    workflowProgress,
    stepTitles: STEP_TITLES,
    stepDescriptions: STEP_DESCRIPTIONS,
    stepIcons: STEP_ICONS,
    
    // Workflow history
    stepHistory,
    canUndoStep,
    undoLastStep,
    
    // Auto-navigation
    enableAutoAdvance,
    autoAdvanceEnabled,
    autoAdvanceDelay,
    setAutoAdvanceDelay,
    
    // Validation rules for each step
    validateStepRequirements,
  };
};

export default useWorkflowState;