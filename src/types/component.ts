// Comprehensive Component Library TypeScript Interfaces
// Supports 1000+ components with proper categorization and performance optimization

// Base interfaces and enums
export interface BaseComponent {
  id: string;
  created_at: string;
  updated_at: string;
}

export enum ComponentStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  PUBLISHED = 'published',
  DEPRECATED = 'deprecated',
  ARCHIVED = 'archived'
}

export enum ComponentDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum FrameworkType {
  REACT = 'React',
  VUE = 'Vue',
  ANGULAR = 'Angular',
  SVELTE = 'Svelte',
  VANILLA_JS = 'Vanilla JS',
  HTML = 'HTML'
}

export enum DependencyType {
  RUNTIME = 'runtime',
  BUILD = 'build',
  PEER = 'peer',
  OPTIONAL = 'optional'
}

export enum TemplateDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

// Core Component Interface
export interface Component extends BaseComponent {
  // Basic information
  name: string;
  description?: string;
  category: string;
  framework: FrameworkType;
  
  // Content
  code?: string;
  preview_url?: string;
  props?: Record<string, any>;
  
  // Metadata
  tags?: string[];
  usage_count: number;
  rating?: number;
  author_id?: string;
  is_featured: boolean;
  is_public: boolean;
  status: ComponentStatus;
  
  // Enhanced fields
  category_id?: string;
  complexity_score: number; // 1-5 scale
  performance_score: number; // 0-100 scale
  accessibility_score: number; // 0-100 scale
  last_modified?: string;
  changelog?: ComponentChangelogEntry[];
}

export interface ComponentChangelogEntry {
  version: string;
  date: string;
  changes: string[];
  author?: string;
  breaking?: boolean;
}

// Component Category Interface
export interface ComponentCategory extends BaseComponent {
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  sort_order: number;
  icon?: string;
  color?: string; // Hex color
  is_active: boolean;
  component_count: number;
  
  // Hierarchical structure
  children?: ComponentCategory[];
  parent?: ComponentCategory;
}

// Component Tag Interface
export interface ComponentTag extends BaseComponent {
  name: string;
  slug: string;
  description?: string;
  category?: 'ui' | 'framework' | 'functionality' | 'styling' | 'accessibility';
  color?: string; // Hex color
  is_official: boolean;
  is_active: boolean;
  normalized_name?: string;
  component_count: number;
}

// Component Variant Interface
export interface ComponentVariant extends BaseComponent {
  component_id: string;
  name: string;
  slug: string;
  description?: string;
  code: string;
  preview_data?: Record<string, any>;
  preview_url?: string;
  is_default: boolean;
  is_active: boolean;
  sort_order: number;
  usage_count: number;
  rating?: number;
  
  // Associated component
  component?: Component;
}

// Component Dependency Interface
export interface ComponentDependency extends BaseComponent {
  component_id: string;
  depends_on_component_id: string;
  dependency_type: DependencyType;
  version_range?: string; // e.g., ">=1.0.0 <2.0.0"
  is_optional: boolean;
  reason?: string;
  
  // Related components
  component?: Component;
  depends_on?: Component;
}

// Component Usage Statistics Interface
export interface ComponentUsageStats extends BaseComponent {
  component_id: string;
  date: string;
  total_uses: number;
  unique_users: number;
  successful_imports: number;
  failed_imports: number;
  avg_rating?: number;
  review_count: number;
  trending_score: number;
  popularity_rank?: number;
  metadata?: Record<string, any>;
  
  // Associated component
  component?: Component;
}

// Component Template Interface
export interface ComponentTemplate extends BaseComponent {
  name: string;
  description?: string;
  category?: string;
  components: ComponentConfiguration[];
  layout_config?: LayoutConfiguration;
  data_schema?: DataSchema;
  
  // Metadata
  author_id?: string;
  is_public: boolean;
  is_official: boolean;
  is_featured: boolean;
  
  // Properties
  difficulty_level: TemplateDifficulty;
  estimated_time_minutes?: number;
  tags?: string[];
  
  // Statistics
  usage_count: number;
  rating?: number;
  review_count: number;
  download_count: number;
  fork_count: number;
  
  // Quality
  health_score?: number;
  last_quality_check?: string;
  
  // Author
  author?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface ComponentConfiguration {
  component_id: string;
  variant_id?: string;
  props: Record<string, any>;
  position?: PositionConfig;
  dependencies?: string[]; // Component IDs this component depends on
}

export interface PositionConfig {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  z_index?: number;
  order?: number;
}

export interface LayoutConfiguration {
  type: 'grid' | 'flex' | 'absolute' | 'fixed';
  responsive_breakpoints?: Record<string, BreakpointConfig>;
  spacing?: SpacingConfig;
  alignment?: AlignmentConfig;
}

export interface BreakpointConfig {
  width?: number;
  height?: number;
  layout?: 'horizontal' | 'vertical' | 'stack';
  spacing?: SpacingConfig;
}

export interface SpacingConfig {
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
  gap?: string | number;
  padding?: SpacingConfig;
  margin?: SpacingConfig;
}

export interface AlignmentConfig {
  horizontal?: 'left' | 'center' | 'right' | 'stretch';
  vertical?: 'top' | 'center' | 'bottom' | 'stretch';
}

export interface DataSchema {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean';
  properties?: Record<string, DataSchema>;
  required?: string[];
  default?: any;
  validation_rules?: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
  custom_function?: string;
}

// Component Collection Interface
export interface ComponentCollection extends BaseComponent {
  name: string;
  slug: string;
  description?: string;
  author_id?: string;
  is_public: boolean;
  is_official: boolean;
  cover_image_url?: string;
  color?: string; // Hex color
  component_count: number;
  follower_count: number;
  featured_position?: number;
  is_curated: boolean;
  
  // Author
  author?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
  
  // Components in collection
  components?: CollectionComponent[];
}

export interface CollectionComponent extends BaseComponent {
  collection_id: string;
  component_id: string;
  sort_order: number;
  is_featured: boolean;
  
  // Related entities
  collection?: ComponentCollection;
  component?: Component;
}

// Search and Filtering Interfaces
export interface ComponentSearchFilters {
  query?: string;
  categories?: string[];
  frameworks?: FrameworkType[];
  tags?: string[];
  difficulty_levels?: ComponentDifficulty[];
  rating_min?: number;
  usage_min?: number;
  is_featured?: boolean;
  is_public?: boolean;
  sort_by?: ComponentSortOption;
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export enum ComponentSortOption {
  NAME = 'name',
  POPULARITY = 'popularity',
  RATING = 'rating',
  RECENT = 'recent',
  USAGE = 'usage',
  UPDATED = 'updated',
  CREATED = 'created',
  COMPLEXITY = 'complexity',
  PERFORMANCE = 'performance',
  ACCESSIBILITY = 'accessibility'
}

export interface ComponentSearchResult extends Component {
  search_rank?: number; // Calculated search ranking
  relevance_score?: number;
  matched_terms?: string[];
}

// Component Export/Import Interfaces
export interface ComponentExportData {
  components: ExportedComponent[];
  variants: ExportedComponentVariant[];
  dependencies: ExportedComponentDependency[];
  templates?: ExportedComponentTemplate[];
  metadata: {
    exported_at: string;
    version: string;
    total_components: number;
    framework: FrameworkType;
  };
}

export interface ExportedComponent {
  name: string;
  description?: string;
  category: string;
  framework: FrameworkType;
  code?: string;
  preview_url?: string;
  props?: Record<string, any>;
  tags?: string[];
  complexity_score?: number;
  performance_score?: number;
  accessibility_score?: number;
  version?: string;
}

export interface ExportedComponentVariant {
  component_name: string;
  name: string;
  description?: string;
  code: string;
  preview_data?: Record<string, any>;
  is_default?: boolean;
}

export interface ExportedComponentDependency {
  component_name: string;
  depends_on_name: string;
  dependency_type: DependencyType;
  version_range?: string;
  is_optional?: boolean;
  reason?: string;
}

export interface ExportedComponentTemplate {
  name: string;
  description?: string;
  category?: string;
  components: ComponentConfiguration[];
  layout_config?: LayoutConfiguration;
  difficulty_level: TemplateDifficulty;
  estimated_time_minutes?: number;
  tags?: string[];
}

// Analytics and Reporting Interfaces
export interface ComponentAnalytics {
  total_components: number;
  public_components: number;
  featured_components: number;
  total_usage: number;
  average_rating: number;
  top_categories: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  top_frameworks: Array<{
    name: FrameworkType;
    count: number;
    percentage: number;
  }>;
  usage_trends: Array<{
    date: string;
    uses: number;
    unique_users: number;
  }>;
  popular_components: Array<{
    id: string;
    name: string;
    usage_count: number;
    rating?: number;
  }>;
  trending_components: Array<{
    id: string;
    name: string;
    trending_score: number;
    change: number;
  }>;
}

export interface ComponentRecommendations {
  similar: ComponentSearchResult[];
  popular: ComponentSearchResult[];
  trending: ComponentSearchResult[];
  based_on_tags: ComponentSearchResult[];
  based_on_usage: ComponentSearchResult[];
}

// Quality Assessment Interfaces
export interface ComponentQualityAssessment {
  component_id: string;
  overall_score: number; // 0-100
  code_quality: QualityMetrics;
  accessibility: QualityMetrics;
  performance: QualityMetrics;
  documentation: QualityMetrics;
  testing: QualityMetrics;
  issues: QualityIssue[];
  recommendations: QualityRecommendation[];
}

export interface QualityMetrics {
  score: number; // 0-100
  passed_checks: number;
  failed_checks: number;
  total_checks: number;
  details: QualityCheckResult[];
}

export interface QualityCheckResult {
  name: string;
  passed: boolean;
  score: number;
  message: string;
  suggestions?: string[];
  severity: 'info' | 'warning' | 'error';
}

export interface QualityIssue {
  type: 'accessibility' | 'performance' | 'security' | 'maintainability';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  suggestion: string;
  line_number?: number;
}

export interface QualityRecommendation {
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  category: string;
}

// Bulk Operations Interface
export interface BulkComponentOperation {
  operation: 'create' | 'update' | 'delete' | 'export' | 'import';
  component_ids: string[];
  data?: Partial<Component>;
  options?: BulkOperationOptions;
  callback?: (result: BulkOperationResult) => void;
}

export interface BulkOperationOptions {
  skip_validation?: boolean;
  preserve_history?: boolean;
  notify_users?: boolean;
  batch_size?: number;
  dry_run?: boolean;
}

export interface BulkOperationResult {
  success: boolean;
  processed: number;
  successful: number;
  failed: number;
  errors: Array<{
    component_id: string;
    error: string;
  }>;
  warnings: Array<{
    component_id: string;
    warning: string;
  }>;
  duration: number;
}

// Real-time Updates Interface
export interface ComponentUpdateEvent {
  type: 'create' | 'update' | 'delete' | 'usage' | 'rating';
  component_id: string;
  user_id?: string;
  data?: any;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ComponentSubscription {
  component_ids: string[];
  categories?: string[];
  tags?: string[];
  frameworks?: FrameworkType[];
  callback: (event: ComponentUpdateEvent) => void;
  unsubscribe: () => void;
}

// Performance Monitoring Interface
export interface ComponentPerformanceMetrics {
  component_id: string;
  load_time: number; // milliseconds
  render_time: number; // milliseconds
  bundle_size: number; // bytes
  dependencies_count: number;
  tree_shakeable: boolean;
  tree_shake_size: number; // bytes after tree shaking
  caching_effectiveness: number; // 0-1
  cache_hit_rate: number; // 0-1
  memory_usage: number; // bytes
  accessibility_score: number; // 0-100
  seo_score: number; // 0-100
  last_measured: string;
}

// API Response Wrapper
export interface ComponentApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    per_page: number;
    has_next: boolean;
    has_prev: boolean;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  success: boolean;
}

// Validation Schemas for Runtime Validation
export interface ComponentValidationSchema {
  type: 'object';
  properties: Record<string, ComponentPropertySchema>;
  required?: string[];
  additionalProperties?: boolean;
}

export interface ComponentPropertySchema {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'function';
  description?: string;
  required?: boolean;
  default?: any;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    enum?: any[];
    custom?: string; // Custom validation function name
  };
  children?: ComponentValidationSchema; // For object/array types
}

// Type guards for runtime type checking
export const isComponent = (obj: any): obj is Component => {
  return obj && 
    typeof obj.id === 'string' && 
    typeof obj.name === 'string' && 
    typeof obj.framework === 'string' &&
    typeof obj.category === 'string';
};

export const isComponentCategory = (obj: any): obj is ComponentCategory => {
  return obj && 
    typeof obj.id === 'string' && 
    typeof obj.name === 'string' && 
    typeof obj.slug === 'string';
};

export const isComponentTag = (obj: any): obj is ComponentTag => {
  return obj && 
    typeof obj.id === 'string' && 
    typeof obj.name === 'string' && 
    typeof obj.slug === 'string';
};

export const isComponentVariant = (obj: any): obj is ComponentVariant => {
  return obj && 
    typeof obj.id === 'string' && 
    typeof obj.component_id === 'string' && 
    typeof obj.name === 'string' &&
    typeof obj.slug === 'string';
};

export const isComponentTemplate = (obj: any): obj is ComponentTemplate => {
  return obj && 
    typeof obj.id === 'string' && 
    typeof obj.name === 'string' && 
    Array.isArray(obj.components);
};

// Utility types for easier usage
export type ComponentFilter = Partial<ComponentSearchFilters>;
export type ComponentSort = ComponentSortOption;
export type ComponentExportFormat = 'json' | 'yaml' | 'zip';
export type ComponentImportFormat = 'json' | 'zip';

// Constants for validation
export const COMPONENT_CONSTANTS = {
  MAX_NAME_LENGTH: 255,
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_CODE_LENGTH: 50000,
  MAX_TAGS_COUNT: 20,
  MIN_RATING: 0,
  MAX_RATING: 5,
  MIN_COMPLEXITY: 1,
  MAX_COMPLEXITY: 5,
  MIN_SCORE: 0,
  MAX_SCORE: 100,
  VALID_FRAMEWORKS: Object.values(FrameworkType),
  VALID_STATUSES: Object.values(ComponentStatus),
  VALID_DIFFICULTIES: Object.values(ComponentDifficulty),
  VALID_DEPENDENCY_TYPES: Object.values(DependencyType),
  VALID_TEMPLATE_DIFFICULTIES: Object.values(TemplateDifficulty)
} as const;