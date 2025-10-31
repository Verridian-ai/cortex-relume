/**
 * Comprehensive Component Taxonomy System
 * 
 * This file defines the complete categorization structure for all UI components
 * including metadata, accessibility, performance, and quality metrics.
 */

export interface ComponentMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  
  // Technical Details
  props: ComponentProp[];
  dependencies: string[];
  peerDependencies?: string[];
  
  // Accessibility (WCAG Compliance)
  wcagLevel: 'A' | 'AA' | 'AAA';
  accessibilityFeatures: string[];
  ariaSupport: boolean;
  keyboardNavigation: boolean;
  screenReaderSupport: boolean;
  
  // Performance & Compatibility
  bundleSize: string;
  renderComplexity: 'low' | 'medium' | 'high';
  browserSupport: BrowserCompatibility[];
  mobileOptimized: boolean;
  
  // SEO & Usage
  seoScore: number; // 0-100
  seoConsiderations: string[];
  usageGuidelines: string[];
  bestPractices: string[];
  commonPatterns: string[];
  
  // Code Quality
  testCoverage: number; // 0-100
  documentation: 'minimal' | 'good' | 'excellent';
  maintainabilityScore: number; // 0-100
  
  // Tags for Search & Filter
  tags: string[];
  keywords: string[];
  relatedComponents: string[];
  
  // Examples & Usage
  examples: ComponentExample[];
  variants: ComponentVariant[];
  
  // Validation Rules
  validation: ValidationRules;
}

export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  default?: any;
  description: string;
  options?: string[]; // For union types
  validation?: string; // Additional validation rules
}

export interface BrowserCompatibility {
  browser: 'chrome' | 'firefox' | 'safari' | 'edge' | 'ie';
  version: string;
  support: 'full' | 'partial' | 'none';
  notes?: string;
}

export interface ComponentExample {
  name: string;
  code: string;
  description: string;
  preview?: string;
}

export interface ComponentVariant {
  name: string;
  description: string;
  props: Record<string, any>;
  useCase: string;
}

export interface ValidationRules {
  codeQuality: ValidationRule[];
  accessibility: ValidationRule[];
  performance: ValidationRule[];
  mobile: ValidationRule[];
  crossBrowser: ValidationRule[];
}

export interface ValidationRule {
  name: string;
  severity: 'error' | 'warning' | 'info';
  description: string;
  checkFunction: string;
}

/**
 * Main Component Categories
 */
export const COMPONENT_CATEGORIES = {
  NAVIGATION: {
    id: 'navigation',
    name: 'Navigation',
    description: 'Navigation components for site and app structure',
    icon: 'navigation',
    color: '#3B82F6',
    components: [
      'header', 'navbar', 'breadcrumb', 'sidebar', 'pagination', 
      'tabs', 'menu', 'nav-item', 'dropdown-menu', 'mega-menu',
      'sticky-nav', 'mobile-nav', 'breadcrumb-nav', 'stepper',
      'tree-view', 'accordion-nav'
    ]
  },
  
  FORMS: {
    id: 'forms',
    name: 'Forms',
    description: 'Input components and form elements with validation',
    icon: 'form',
    color: '#10B981',
    components: [
      'input', 'textarea', 'select', 'checkbox', 'radio', 'switch',
      'button', 'submit-button', 'reset-button', 'file-upload',
      'date-picker', 'time-picker', 'color-picker', 'slider',
      'rating', 'tags-input', 'autocomplete', 'search-box',
      'form-group', 'form-field', 'form-validation', 'form-wizard',
      'multi-step-form', 'inline-form', 'contact-form'
    ]
  },
  
  LAYOUT: {
    id: 'layout',
    name: 'Layout',
    description: 'Layout and grid system components',
    icon: 'grid',
    color: '#8B5CF6',
    components: [
      'grid', 'flexbox', 'container', 'wrapper', 'section',
      'column', 'row', 'stack', 'spacer', 'divider',
      'panel', 'card-container', 'masonry', 'split-pane',
      'scrollable', 'sticky', 'responsive', 'fullscreen'
    ]
  },
  
  CONTENT: {
    id: 'content',
    name: 'Content',
    description: 'Content display and media components',
    icon: 'file-text',
    color: '#F59E0B',
    components: [
      'text', 'heading', 'paragraph', 'link', 'blockquote',
      'image', 'video', 'audio', 'gallery', 'carousel',
      'lightbox', 'video-player', 'audio-player', 'image-zoom',
      'code-block', 'syntax-highlighter', 'markdown', 'richtext',
      'avatar', 'icon', 'progress-bar', 'tooltip'
    ]
  },
  
  INTERACTIVE: {
    id: 'interactive',
    name: 'Interactive',
    description: 'Interactive components and user interactions',
    icon: 'cursor',
    color: '#EF4444',
    components: [
      'modal', 'dialog', 'tooltip', 'popover', 'dropdown',
      'context-menu', 'toast', 'snackbar', 'alert', 'notification',
      'loader', 'spinner', 'skeleton', 'progress', 'meter',
      'accordion', 'tabs', 'collapsible', 'drawer', 'offcanvas',
      'modal-stack', 'tooltip-manager', 'confirmation-dialog'
    ]
  },
  
  DATA_DISPLAY: {
    id: 'data-display',
    name: 'Data Display',
    description: 'Components for displaying and organizing data',
    icon: 'table',
    color: '#06B6D4',
    components: [
      'table', 'data-table', 'sortable-table', 'filterable-table',
      'card', 'list', 'virtual-list', 'tree', 'calendar',
      'timeline', 'kanban', 'gantt', 'heatmap', 'badge',
      'chip', 'tag', 'statistic', 'counter', 'progress-circle',
      'data-grid', 'pagination-table', 'infinite-scroll'
    ]
  },
  
  FEEDBACK: {
    id: 'feedback',
    name: 'Feedback',
    description: 'User feedback and status components',
    icon: 'message-circle',
    color: '#84CC16',
    components: [
      'alert', 'banner', 'notification', 'toast', 'snackbar',
      'message', 'info-box', 'warning', 'error', 'success',
      'loading', 'spinner', 'skeleton', 'placeholder', 'empty-state',
      'error-boundary', 'loading-states', 'progress-indicators',
      'achievement', 'confirmation', 'feedback-form'
    ]
  },
  
  CHARTS: {
    id: 'charts',
    name: 'Charts & Visualization',
    description: 'Data visualization and chart components',
    icon: 'bar-chart',
    color: '#F97316',
    components: [
      'line-chart', 'bar-chart', 'pie-chart', 'donut-chart',
      'area-chart', 'scatter-plot', 'bubble-chart', 'radar-chart',
      'heatmap', 'treemap', 'sankey-diagram', 'gantt-chart',
      'gauge', 'progress-ring', 'candlestick', 'funnel-chart',
      'waterfall', 'trellis-chart', 'dashboard-widgets'
    ]
  },
  
  ECOMMERCE: {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'E-commerce specific components',
    icon: 'shopping-cart',
    color: '#EC4899',
    components: [
      'product-card', 'product-gallery', 'product-detail',
      'shopping-cart', 'cart-item', 'cart-summary', 'checkout',
      'payment-form', 'address-form', 'shipping-options',
      'order-summary', 'order-history', 'wishlist', 'compare',
      'filters', 'sort-options', 'search-results', 'coupon',
      'invoice', 'receipt', 'inventory-display'
    ]
  },
  
  SOCIAL: {
    id: 'social',
    name: 'Social',
    description: 'Social media and community features',
    icon: 'users',
    color: '#6366F1',
    components: [
      'comment', 'comment-thread', 'user-profile', 'post',
      'timeline', 'feed', 'activity-stream', 'social-share',
      'like-button', 'follow-button', 'message', 'chat',
      'conversation', 'group', 'community', 'rating', 'review',
      'testimonial', 'social-login', 'user-avatar', 'mention'
    ]
  },
  
  MARKETING: {
    id: 'marketing',
    name: 'Marketing',
    description: 'Marketing and conversion components',
    icon: 'megaphone',
    color: '#DC2626',
    components: [
      'hero', 'cta', 'testimonial', 'review', 'rating',
      'promo-banner', 'newsletter', 'signup-form', 'lead-form',
      'pricing-table', 'comparison-table', 'feature-list',
      'benefit-list', 'case-study', 'faq', 'about-us',
      'contact-info', 'location-map', 'social-proof'
    ]
  },
  
  AUTHENTICATION: {
    id: 'authentication',
    name: 'Authentication',
    description: 'User authentication and security components',
    icon: 'lock',
    color: '#7C3AED',
    components: [
      'login-form', 'signup-form', 'password-reset', 'two-factor',
      'social-login', 'email-verification', 'security-settings',
      'privacy-settings', 'account-settings', 'profile-edit',
      'user-registration', 'session-manager', 'role-permission',
      'mfa-setup', 'recovery-options'
    ]
  },
  
  DASHBOARD: {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Dashboard and analytics components',
    icon: 'layout-dashboard',
    color: '#059669',
    components: [
      'widget', 'metric-card', 'chart-widget', 'table-widget',
      'map-widget', 'weather', 'calendar-widget', 'news-feed',
      'activity-log', 'user-stats', 'system-status', 'alerts',
      'quick-actions', 'recent-items', 'favorites', 'shortcuts',
      'analytics-overview', 'kpi-dashboard'
    ]
  },
  
  BLOG: {
    id: 'blog',
    name: 'Blog/Content',
    description: 'Blog and content management components',
    icon: 'book',
    color: '#0891B2',
    components: [
      'article', 'post', 'blog-list', 'tag-cloud', 'category',
      'author-bio', 'related-posts', 'comments-section',
      'social-share', 'bookmark', 'reading-progress', 'toc',
      'search', 'archive', 'sitemap', 'content-filter',
      'pagination', 'infinite-scroll', 'content-grid'
    ]
  },
  
  MOBILE: {
    id: 'mobile',
    name: 'Mobile-Specific',
    description: 'Mobile-optimized components',
    icon: 'smartphone',
    color: '#BE185D',
    components: [
      'mobile-nav', 'mobile-menu', 'swipe-gesture', 'pull-refresh',
      'mobile-modal', 'mobile-sheet', 'bottom-sheet', 'floating-action',
      'mobile-tabs', 'mobile-scroll', 'touch-feedback',
      'mobile-form', 'mobile-input', 'mobile-date-picker',
      'mobile-gallery', 'mobile-video', 'app-bar', 'toolbar'
    ]
  },
  
  ACCESSIBILITY: {
    id: 'accessibility',
    name: 'Accessibility',
    description: 'Accessibility-specific components',
    icon: 'accessibility',
    color: '#059669',
    components: [
      'skip-link', 'focus-manager', 'screen-reader-text',
      'aria-live', 'keyboard-shortcuts', 'high-contrast',
      'font-size-controls', 'color-blind-friendly', 'reduced-motion',
      'captions', 'alt-text', 'tab-manager'
    ]
  }
} as const;

/**
 * Component Templates Structure
 */
export const COMPONENT_TEMPLATES = {
  // Base components (atomic level)
  ATOMIC: [
    'Button', 'Input', 'Label', 'Icon', 'Text', 'Link', 'Image',
    'Badge', 'Chip', 'Avatar', 'Divider', 'Spacer', 'Tooltip'
  ],
  
  // Composite components (molecular level)
  MOLECULAR: [
    'InputGroup', 'FormField', 'Card', 'NavItem', 'BreadcrumbItem',
    'TableCell', 'ListItem', 'MenuItem', 'TabItem', 'StepItem'
  ],
  
  // Complex components (organism level)
  ORGANISM: [
    'NavigationBar', 'DataTable', 'Form', 'CardGrid', 'ImageGallery',
    'CommentSystem', 'UserProfile', 'ProductCard', 'ShoppingCart'
  ],
  
  // Page templates (template level)
  TEMPLATE: [
    'LandingPage', 'DashboardPage', 'ProductPage', 'ProfilePage',
    'BlogPost', 'Checkout', 'SearchResults', 'ErrorPage'
  ]
};

/**
 * Search and Filter Configuration
 */
export const SEARCH_CONFIG = {
  // Search scoring weights
  weights: {
    name: 10,
    description: 8,
    category: 6,
    tags: 4,
    keywords: 3,
    relatedComponents: 2
  },
  
  // Filter options
  filters: {
    category: Object.keys(COMPONENT_CATEGORIES),
    accessibility: ['A', 'AA', 'AAA'],
    complexity: ['low', 'medium', 'high'],
    mobileOptimized: [true, false],
    testCoverage: ['high', 'medium', 'low'],
    bundleSize: ['small', 'medium', 'large'],
    browserSupport: ['modern', 'legacy', 'all']
  },
  
  // Sort options
  sortOptions: [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'category', label: 'Category' },
    { value: 'complexity', label: 'Complexity' },
    { value: 'accessibility', label: 'Accessibility Level' },
    { value: 'popularity', label: 'Popularity' },
    { value: 'updated', label: 'Recently Updated' }
  ]
};

/**
 * Validation Configuration
 */
export const VALIDATION_CONFIG = {
  // Code quality checks
  codeQuality: [
    {
      name: 'TypeScript Coverage',
      threshold: 90,
      severity: 'warning'
    },
    {
      name: 'Test Coverage',
      threshold: 80,
      severity: 'error'
    },
    {
      name: 'Bundle Size',
      threshold: '50KB',
      severity: 'warning'
    }
  ],
  
  // Accessibility standards
  accessibility: [
    {
      name: 'WCAG Compliance',
      level: 'AA',
      severity: 'error'
    },
    {
      name: 'Keyboard Navigation',
      required: true,
      severity: 'error'
    },
    {
      name: 'Screen Reader Support',
      required: true,
      severity: 'warning'
    }
  ],
  
  // Performance requirements
  performance: [
    {
      name: 'First Contentful Paint',
      threshold: 1.5, // seconds
      severity: 'warning'
    },
    {
      name: 'Largest Contentful Paint',
      threshold: 2.5, // seconds
      severity: 'warning'
    },
    {
      name: 'Cumulative Layout Shift',
      threshold: 0.1,
      severity: 'warning'
    }
  ]
};

export type ComponentCategory = keyof typeof COMPONENT_CATEGORIES;
export type ComponentTemplate = keyof typeof COMPONENT_TEMPLATES;