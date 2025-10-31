/**
 * TypeScript types for sitemap generation and management
 */

export type WebsiteType = 
  | 'business'
  | 'portfolio'
  | 'blog'
  | 'e-commerce'
  | 'saas'
  | 'landing-page'
  | 'news'
  | 'documentation'
  | 'educational'
  | 'nonprofit'
  | 'other';

export type PagePurpose = 
  | 'information'
  | 'conversion'
  | 'navigation'
  | 'entertainment'
  | 'transaction'
  | 'support'
  | 'collection'
  | 'profile'
  | 'auth';

export interface SitemapPage {
  /** Unique identifier for the page */
  id: string;
  /** Human-readable page title */
  title: string;
  /** Brief description of the page's purpose */
  description?: string;
  /** URL path (relative to domain, without protocol) */
  path: string;
  /** Parent page ID for hierarchical structure */
  parentId?: string;
  /** Child pages */
  children?: SitemapPage[];
  /** Page priority (1-10) for SEO */
  priority: number;
  /** Estimated update frequency */
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  /** Page purpose/type */
  purpose: PagePurpose;
  /** Estimated importance score (1-100) */
  importance: number;
  /** Additional metadata */
  metadata?: {
    keywords?: string[];
    targetAudience?: string;
    contentType?: string;
    features?: string[];
    requiredComponents?: string[];
    seoTitle?: string;
    seoDescription?: string;
  };
  /** Whether this is a critical page */
  isCritical: boolean;
  /** Whether page requires authentication */
  requiresAuth: boolean;
  /** Order within parent (for display) */
  order: number;
}

export interface SitemapStructure {
  /** Unique sitemap identifier */
  id: string;
  /** Sitemap title */
  title: string;
  /** Brief description */
  description?: string;
  /** Website type */
  websiteType: WebsiteType;
  /** All pages in the sitemap */
  pages: SitemapPage[];
  /** Site-level metadata */
  metadata: {
    /** Target domain (optional) */
    domain?: string;
    /** Primary language */
    language?: string;
    /** Currency (for e-commerce) */
    currency?: string;
    /** Target audience */
    targetAudience?: string;
    /** Business model */
    businessModel?: string;
    /** Key features */
    keyFeatures?: string[];
    /** SEO keywords */
    keywords?: string[];
    /** Competitive advantages */
    valuePropositions?: string[];
  };
  /** Generated timestamp */
  createdAt: Date;
  /** Last updated timestamp */
  updatedAt: Date;
  /** AI model used for generation */
  modelUsed?: string;
  /** Version number */
  version: number;
  /** Generation statistics */
  statistics?: {
    totalPages: number;
    criticalPages: number;
    averagePriority: number;
    maxDepth: number;
    totalKeywords: number;
  };
}

export interface SitemapGenerationRequest {
  /** User prompt describing the desired website */
  prompt: string;
  /** Website type hint */
  websiteType?: WebsiteType;
  /** Target domain (optional) */
  domain?: string;
  /** Specific requirements or constraints */
  requirements?: string[];
  /** Exclude certain page types */
  excludeTypes?: string[];
  /** Include specific pages */
  includePages?: string[];
  /** Generation options */
  options?: {
    /** Minimum number of pages */
    minPages?: number;
    /** Maximum number of pages */
    maxPages?: number;
    /** Include blog/product pages */
    includeBlog?: boolean;
    /** Include auth pages */
    includeAuth?: boolean;
    /** Include admin/management pages */
    includeAdmin?: boolean;
    /** Generate detailed metadata */
    detailedMetadata?: boolean;
  };
  /** User preferences */
  preferences?: {
    style?: string;
    tone?: string;
    targetAudience?: string;
    businessGoals?: string[];
  };
}

export interface SitemapGenerationResponse {
  /** Generated sitemap structure */
  sitemap: SitemapStructure;
  /** Generation metadata */
  metadata: {
    /** Processing time in milliseconds */
    processingTime: number;
    /** Number of tokens used */
    tokensUsed: number;
    /** Cost in credits/tokens */
    cost?: number;
    /** Any warnings or suggestions */
    warnings?: string[];
    /** Confidence score (0-1) */
    confidence?: number;
  };
  /** Alternative suggestions */
  suggestions?: {
    /** Suggested improvements */
    improvements?: string[];
    /** Alternative structures */
    alternatives?: Partial<SitemapStructure>[];
    /** Additional features to consider */
    features?: string[];
  };
}

export interface SitemapValidationError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Affected page ID (if applicable) */
  pageId?: string;
  /** Error severity */
  severity: 'error' | 'warning' | 'info';
  /** Suggestion for fixing the error */
  suggestion?: string;
}

export interface SitemapValidationResult {
  /** Whether the sitemap is valid */
  isValid: boolean;
  /** All errors found */
  errors: SitemapValidationError[];
  /** Sitemap statistics */
  statistics: {
    totalPages: number;
    rootPages: number;
    averageDepth: number;
    maxDepth: number;
    orphanedPages: number;
    duplicatePaths: number;
  };
}

export interface SitemapOperation {
  /** Operation type */
  type: 'validate' | 'merge' | 'split' | 'optimize' | 'export';
  /** Target sitemap */
  sitemap: SitemapStructure;
  /** Operation parameters */
  params?: Record<string, any>;
  /** Operation result */
  result?: any;
  /** Any errors encountered */
  error?: string;
}

export interface SitemapTemplate {
  /** Template identifier */
  id: string;
  /** Template name */
  name: string;
  /** Template description */
  description?: string;
  /** Associated website type */
  websiteType: WebsiteType;
  /** Base structure */
  baseStructure: Omit<SitemapStructure, 'id' | 'createdAt' | 'updatedAt' | 'version'>;
  /** Usage count */
  usageCount: number;
  /** Average rating */
  rating?: number;
  /** Tags for categorization */
  tags?: string[];
  /** Whether template is public */
  isPublic: boolean;
  /** Author ID (if private) */
  authorId?: string;
}

export interface ExportFormat {
  /** Format type */
  type: 'xml' | 'json' | 'csv' | 'markdown' | 'html';
  /** Options for export */
  options?: {
    /** Include metadata */
    includeMetadata?: boolean;
    /** Include statistics */
    includeStatistics?: boolean;
    /** Pretty print JSON */
    prettyPrint?: boolean;
    /** Custom template for HTML/Markdown */
    template?: string;
  };
}
