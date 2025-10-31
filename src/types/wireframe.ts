// Wireframe data structures and type definitions

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Position {
  top: number;
  left: number;
  bottom?: number;
  right?: number;
}

export interface Breakpoint {
  name: string;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
}

// Wireframe Element Types
export type ElementType = 
  | 'header'
  | 'footer'
  | 'sidebar'
  | 'content'
  | 'navigation'
  | 'hero'
  | 'card'
  | 'button'
  | 'form'
  | 'image'
  | 'text'
  | 'container'
  | 'grid'
  | 'list'
  | 'table'
  | 'modal'
  | 'dropdown'
  | 'breadcrumb'
  | 'search'
  | 'user-menu'
  | 'banner'
  | 'testimonial'
  | 'pricing'
  | 'contact'
  | 'faq'
  | 'gallery'
  | 'video'
  | 'social'
  | 'map';

// Layout Patterns
export type LayoutPattern = 
  | 'single-column'
  | 'two-column'
  | 'three-column'
  | 'sidebar-left'
  | 'sidebar-right'
  | 'header-sidebar'
  | 'header-footer'
  | 'grid-layout'
  | 'magazine'
  | 'dashboard'
  | 'ecommerce'
  | 'blog'
  | 'landing-page'
  | 'product-page'
  | 'checkout';

// Component Properties
export interface ComponentProps {
  variant?: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  spacing?: 'compact' | 'comfortable' | 'spacious';
  color?: string;
  backgroundColor?: string;
  border?: boolean;
  shadow?: boolean;
  rounded?: boolean;
  icon?: string;
  imageSrc?: string;
  placeholder?: string;
  items?: ComponentItem[];
}

// Individual Component Item
export interface ComponentItem {
  id: string;
  type: ElementType;
  title?: string;
  content?: string;
  subItems?: ComponentItem[];
  props?: ComponentProps;
  position: Position;
  size: Size;
  zIndex?: number;
  visible?: boolean;
  responsive?: {
    [breakpointName: string]: {
      position: Partial<Position>;
      size: Partial<Size>;
      visible?: boolean;
    };
  };
}

// Layout Structure
export interface Layout {
  pattern: LayoutPattern;
  columns?: number;
  rows?: number;
  gap?: {
    horizontal: number;
    vertical: number;
  };
  containerWidth?: string; // e.g., '1200px', '100%', 'container'
  maxWidth?: number;
  breakpoints?: Breakpoint[];
  areas?: {
    header?: AreaConfig;
    sidebar?: AreaConfig;
    content?: AreaConfig;
    footer?: AreaConfig;
  };
}

// Area Configuration
export interface AreaConfig {
  width?: string | number;
  height?: string | number;
  position?: Position;
  gridArea?: string;
  order?: number;
  collapse?: {
    mobile: boolean;
    tablet?: boolean;
  };
}

// Wireframe Component
export interface WireframeComponent {
  id: string;
  name: string;
  type: ElementType;
  category: 'layout' | 'content' | 'form' | 'navigation' | 'data' | 'media';
  props: ComponentProps;
  children?: WireframeComponent[];
  variants?: ComponentVariant[];
  accessibility?: AccessibilityConfig;
}

// Component Variant
export interface ComponentVariant {
  id: string;
  name: string;
  props: Partial<ComponentProps>;
  description?: string;
}

// Accessibility Configuration
export interface AccessibilityConfig {
  ariaLabel?: string;
  ariaDescribedBy?: string;
  role?: string;
  tabIndex?: number;
  focusable?: boolean;
}

// Complete Wireframe
export interface Wireframe {
  id: string;
  name: string;
  description?: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Layout Structure
  layout: Layout;
  
  // Components
  components: WireframeComponent[];
  rootComponent: WireframeComponent;
  
  // Sitemap Integration
  sitemap?: string[];
  pageType?: string;
  targetAudience?: string;
  
  // Responsive Design
  breakpoints: Breakpoint[];
  defaultBreakpoint: string;
  activeBreakpoint: string;
  
  // Metadata
  metadata: {
    industry?: string;
    style?: string;
    colorScheme?: string;
    typography?: string;
    accessibilityLevel?: 'A' | 'AA' | 'AAA';
    designSystem?: string;
  };
  
  // Export Options
  exportConfig: {
    format: 'json' | 'svg' | 'png' | 'figma' | 'sketch';
    includeComments: boolean;
    includeAnnotations: boolean;
    pixelRatio?: number;
  };
}

// Sitemap Data
export interface SitemapNode {
  id: string;
  title: string;
  path: string;
  parentId?: string;
  children?: SitemapNode[];
  type?: 'page' | 'section' | 'component';
  priority?: number;
  description?: string;
  keywords?: string[];
  targetAudience?: string;
  layout?: LayoutPattern;
  components?: string[];
}

export interface SitemapTree {
  root: SitemapNode[];
  totalPages: number;
  maxDepth: number;
  pageTypes: string[];
  layoutPatterns: LayoutPattern[];
}

// AI Generation Options
export interface GenerationOptions {
  industry?: string;
  targetAudience?: string;
  layoutPreference?: LayoutPattern;
  style?: string;
  colorScheme?: string;
  accessibilityLevel?: 'A' | 'AA' | 'AAA';
  includeNavigation?: boolean;
  includeFooter?: boolean;
  includeSidebar?: boolean;
  responsiveBreakpoints?: string[];
  componentVariations?: number;
  complexity?: 'simple' | 'medium' | 'complex';
  brandPersonality?: string[];
}

// AI Generation Result
export interface GenerationResult {
  wireframe: Wireframe;
  confidence: number;
  suggestions: GenerationSuggestion[];
  warnings: string[];
}

export interface GenerationSuggestion {
  type: 'improvement' | 'optimization' | 'accessibility' | 'responsive';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionRequired: boolean;
  autoFixable?: boolean;
}

// Wireframe Validation
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number; // 0-100
}

export interface ValidationError {
  componentId: string;
  type: string;
  message: string;
  severity: 'error' | 'critical';
  suggestion?: string;
}

export interface ValidationWarning {
  componentId: string;
  type: string;
  message: string;
  recommendation?: string;
}

// Wireframe History
export interface WireframeHistory {
  id: string;
  wireframeId: string;
  version: string;
  timestamp: Date;
  changes: ChangeRecord[];
  userId: string;
  description?: string;
}

export interface ChangeRecord {
  type: 'create' | 'update' | 'delete' | 'move' | 'resize';
  componentId: string;
  before?: any;
  after?: any;
  timestamp: Date;
}

// Wireframe Template
export interface WireframeTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  layout: Layout;
  components: Omit<WireframeComponent, 'id'>[];
  preview?: string;
  isPublic: boolean;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  downloadCount: number;
  rating: number;
}

// Canvas State
export interface CanvasState {
  wireframe: Wireframe;
  selectedComponents: string[];
  clipboard?: WireframeComponent[];
  undoStack: ChangeRecord[];
  redoStack: ChangeRecord[];
  zoom: number;
  pan: Point;
  gridSize: number;
  snapToGrid: boolean;
  showGuides: boolean;
  showRulers: boolean;
  showGrid: boolean;
  rulersEnabled: boolean;
}

// Canvas Tools
export type CanvasTool = 
  | 'select'
  | 'pan'
  | 'zoom'
  | 'text'
  | 'rectangle'
  | 'circle'
  | 'line'
  | 'arrow'
  | 'image'
  | 'component';

// Export Types for different formats
export interface ExportOptions {
  format: 'json' | 'svg' | 'png' | 'pdf' | 'figma' | 'sketch' | 'html';
  quality?: 'low' | 'medium' | 'high';
  includeAssets?: boolean;
  includeComments?: boolean;
  includeAnnotations?: boolean;
  width?: number;
  height?: number;
  dpi?: number;
  transparent?: boolean;
}

// Style Definitions
export interface StyleDefinition {
  id: string;
  name: string;
  type: 'color' | 'typography' | 'spacing' | 'border' | 'shadow';
  value: any;
  category?: string;
  description?: string;
}

// Design Tokens
export interface DesignTokens {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  spacing: {
    px: string;
    0: string;
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
    8: string;
    10: string;
    12: string;
    16: string;
    20: string;
    24: string;
    32: string;
    40: string;
    48: string;
    56: string;
    64: string;
  };
  borderRadius: {
    none: string;
    sm: string;
    base: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    full: string;
  };
  shadows: {
    sm: string;
    base: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
}