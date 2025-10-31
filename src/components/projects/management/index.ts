// Project Management Components
export { ProjectGrid } from './project-grid';
export { ProjectCard } from './project-card';
export { ProjectList } from './project-list';
export { ProjectDraggable } from './project-draggable';
export { ProjectFilters } from './project-filters';
export { BulkActions } from './bulk-actions';
export { ProjectDetail } from './project-detail';
export { 
  QuickActions, 
  ProjectContextMenu, 
  FloatingActionButton 
} from './quick-actions';
export { 
  ProjectStats, 
  ProjectHealthIndicator, 
  ProjectStatsSkeleton 
} from './project-stats';
export { 
  KeyboardShortcuts, 
  useProjectShortcuts, 
  ShortcutsHelp, 
  ShortcutsIndicator 
} from './keyboard-shortcuts';
export { 
  MobileProjectGrid, 
  MobileFiltersSheet, 
  TouchDragHandle,
  useIsMobile,
  useSwipeGestures
} from './mobile-responsive';
export { 
  ProjectCardSkeleton,
  ProjectListSkeleton,
  ProjectDetailSkeleton,
  ProjectStatsSkeleton,
  OptimisticUpdate,
  ProjectActionFeedback,
  BulkActionFeedback,
  OptimisticProjectCard
} from './loading-states';

// Virtualization components
export { 
  VirtualizedProjectGrid, 
  VirtualizedProjectList, 
  InfiniteScroll 
} from './project-virtualization';

// Error handling components
export { 
  ErrorBoundary, 
  withErrorBoundary, 
  useErrorHandler,
  ProjectErrorBoundary,
  DataErrorBoundary,
  useErrorFeedback
} from './error-boundary';

// Accessibility components
export { 
  useA11yAnnouncements,
  LiveRegion,
  useFocusManagement,
  useKeyboardNavigation,
  SkipToContentLink,
  HighContrastToggle,
  TextSizeControls,
  MotionControls,
  AccessibilityProvider,
  useAccessibility,
  AccessibleButton,
  MainContent,
  Navigation,
  Complementary,
  AccessibleProjectCard,
  useFocusVisible,
  useA11yCompliance
} from './accessibility';

// Types
export type { Project, Column } from './project-grid';
export type { SearchFilters } from './project-filters';
export type { ProjectFolder } from './project-draggable';
