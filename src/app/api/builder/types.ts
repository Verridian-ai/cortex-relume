/**
 * TypeScript definitions for AI Site Builder API routes
 * Provides comprehensive types for request/response data
 */

import { NextRequest } from 'next/server'

// =============================================================================
// API Response Types
// =============================================================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  metadata?: {
    processingTime: number
    tokensUsed?: number
    cost?: number
    rateLimitRemaining?: number
  }
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

// =============================================================================
// Sitemap Generation Types
// =============================================================================

export interface SitemapGenerationRequest {
  prompt: string
  websiteType?: 'business' | 'portfolio' | 'blog' | 'e-commerce' | 'saas' | 'landing-page' | 'news' | 'documentation' | 'educational' | 'nonprofit' | 'other'
  domain?: string
  requirements?: string[]
  options?: {
    minPages?: number
    maxPages?: number
    includeBlog?: boolean
    includeAuth?: boolean
    includeAdmin?: boolean
    detailedMetadata?: boolean
  }
  preferences?: {
    style?: 'modern' | 'classic' | 'minimal' | 'corporate'
    tone?: 'professional' | 'casual' | 'friendly' | 'formal'
    targetAudience?: string
    businessGoals?: string[]
  }
}

export interface SitemapGenerationResponse {
  sitemap: {
    id: string
    title: string
    description: string
    websiteType: string
    pages: Array<{
      id: string
      title: string
      description: string
      path: string
      parentId?: string
      priority: number
      changefreq: string
      purpose: string
      importance: number
      metadata: {
        keywords: string[]
        targetAudience: string
        contentType: string
        features: string[]
        seoTitle: string
        seoDescription: string
      }
      isCritical: boolean
      requiresAuth: boolean
      order: number
      children?: any[]
    }>
    metadata: {
      domain?: string
      language: string
      targetAudience: string
      businessModel: string
      keyFeatures: string[]
      keywords: string[]
      valuePropositions: string[]
    }
    statistics: {
      totalPages: number
      criticalPages: number
      averagePriority: number
      maxDepth: number
      totalKeywords: number
    }
    version: number
    createdAt: string
    updatedAt: string
  }
  metadata: {
    processingTime: number
    tokensUsed: number
    cost: number
    confidence: number
  }
  suggestions: {
    improvements: string[]
    alternatives: string[]
    features: string[]
  }
}

// =============================================================================
// Wireframe Generation Types
// =============================================================================

export interface WireframeGenerationRequest {
  sitemapData: {
    title: string
    description: string
    pages: Array<{
      id?: string
      title: string
      path: string
      description: string
      children?: any[]
    }>
  }
  options?: {
    layoutPreference?: 'single-column' | 'two-column' | 'three-column' | 'sidebar-left' | 'sidebar-right' | 'header-sidebar' | 'header-footer'
    includeNavigation?: boolean
    includeFooter?: boolean
    includeSidebar?: boolean
    industry?: string
    targetAudience?: string
    style?: 'modern' | 'classic' | 'minimal' | 'corporate'
    colorScheme?: string
    accessibilityLevel?: 'A' | 'AA' | 'AAA'
  }
}

export interface WireframeGenerationResponse {
  wireframe: {
    id: string
    name: string
    description: string
    version: string
    createdAt: string
    updatedAt: string
    layout: any
    components: any[]
    rootComponent: any
    sitemap: string[]
    pageType: string
    targetAudience?: string
    breakpoints: Array<{
      name: string
      minWidth: number
      maxWidth: number
    }>
    defaultBreakpoint: string
    activeBreakpoint: string
    metadata: {
      industry?: string
      style?: string
      colorScheme?: string
      accessibilityLevel: string
    }
    exportConfig: {
      format: string
      includeComments: boolean
      includeAnnotations: boolean
    }
  }
  confidence: number
  suggestions: Array<{
    type: string
    title: string
    description: string
    priority: 'low' | 'medium' | 'high'
    actionRequired: boolean
  }>
  warnings: string[]
  metadata: {
    processingTime: number
    tokensUsed: number
    cost: number
    sitemapPages: number
    components: number
  }
}

// =============================================================================
// Style Guide Generation Types
// =============================================================================

export interface StyleGuideGenerationRequest {
  wireframeData: {
    components: any[]
    colorScheme?: string
    typography?: string
  }
  brandGuidelines: {
    name: string
    industry: string
    targetAudience: string
    brandPersonality: string[]
    brandValues: string[]
    colorPreferences?: string[]
    colorAvoid?: string[]
    typographyPreference?: 'sans-serif' | 'serif' | 'mixed'
  }
  designStyle: 'modern' | 'classic' | 'minimal' | 'corporate' | 'playful' | 'luxury' | 'tech'
  wireframeDescription?: string
  existingColors?: string[]
  preferences?: {
    colorIntensity?: 'muted' | 'balanced' | 'vibrant'
    typographyStyle?: 'classic' | 'modern' | 'futuristic'
    spacingDensity?: 'compact' | 'comfortable' | 'spacious'
  }
}

export interface StyleGuideGenerationResponse {
  styleGuide: {
    id: string
    name: string
    description: string
    createdAt: string
    updatedAt: string
    brandGuidelines: any
    designStyle: string
    colorPalette: {
      primary: Record<string, string>
      secondary: Record<string, string>
      neutral: Record<string, string>
      success: string
      warning: string
      error: string
      info: string
      background: {
        primary: string
        secondary: string
        muted: string
      }
      text: {
        primary: string
        secondary: string
        muted: string
        inverse: string
      }
    }
    typography: {
      fontFamily: {
        sans: string[]
        serif: string[]
        mono: string[]
        display: string[]
      }
      fontSize: Record<string, string>
      fontWeight: Record<string, number>
      lineHeight: Record<string, number>
      letterSpacing: Record<string, string>
    }
    spacing: {
      base: number
      scale: Record<string, string>
    }
    borderRadius: Record<string, string>
    shadows: Record<string, string>
    componentStyles: {
      button: {
        primary: any
        secondary: any
        outline: any
        ghost: any
      }
      card: {
        base: any
        elevated: any
        outlined: any
      }
      input: {
        base: any
        focus: any
        error: any
      }
      badge: {
        primary: any
        secondary: any
        outline: any
      }
    }
    cssVariables: Record<string, string>
  }
  warnings: string[]
  metadata: {
    processingTime: number
    tokensUsed: number
    cost: number
    components: number
    brandAlignment: number
  }
}

// =============================================================================
// Project Management Types
// =============================================================================

export interface ProjectCreationRequest {
  name: string
  description?: string
  type: string
  isPublic?: boolean
  settings?: Record<string, any>
}

export interface ProjectUpdateRequest {
  name?: string
  description?: string
  status?: 'draft' | 'active' | 'archived' | 'completed'
  data?: Record<string, any>
  settings?: Record<string, any>
  isPublic?: boolean
  collaborators?: string[]
}

export interface ProjectResponse {
  id: string
  created_at: string
  updated_at: string
  user_id: string
  name: string
  description?: string
  type: string
  status: string
  data?: Record<string, any>
  settings?: Record<string, any>
  collaborators?: string[]
  is_public: boolean
}

export interface ProjectListResponse {
  projects: ProjectResponse[]
  pagination: PaginationInfo
  filters: {
    status?: string
    type?: string
    sortBy?: string
    sortOrder?: string
  }
}

export interface ProjectWithStats extends ProjectResponse {
  sitemaps?: any[]
  wireframes?: any[]
  style_guides?: any[]
  ai_generations?: any[]
  stats: {
    sitemapCount: number
    wireframeCount: number
    styleGuideCount: number
    aiGenerationCount: number
    lastActivity?: string
    totalCost: number
    status: string
  }
}

// =============================================================================
// Utility Types
// =============================================================================

export interface RateLimitInfo {
  resetTime: number
  remaining: number
}

export interface ErrorResponse {
  code: string
  message: string
  details?: any
}

export interface RequestMetadata {
  processingTime: number
  tokensUsed?: number
  cost?: number
  rateLimitRemaining?: number
}

// =============================================================================
// API Client Helper Types
// =============================================================================

export interface ApiClientOptions {
  baseUrl?: string
  headers?: Record<string, string>
  timeout?: number
}

export interface ApiClient {
  // Sitemap methods
  generateSitemap(request: SitemapGenerationRequest, options?: { projectId?: string }): Promise<ApiResponse<SitemapGenerationResponse>>
  getSitemapCapabilities(): Promise<ApiResponse<any>>
  
  // Wireframe methods
  generateWireframe(request: WireframeGenerationRequest, options?: { projectId?: string }): Promise<ApiResponse<WireframeGenerationResponse>>
  getWireframeCapabilities(): Promise<ApiResponse<any>>
  
  // Style guide methods
  generateStyleGuide(request: StyleGuideGenerationRequest, options?: { projectId?: string }): Promise<ApiResponse<StyleGuideGenerationResponse>>
  getStyleGuideCapabilities(): Promise<ApiResponse<any>>
  
  // Project methods
  createProject(request: ProjectCreationRequest): Promise<ApiResponse<{ project: ProjectResponse; message: string }>>
  getProjects(params?: {
    status?: string
    type?: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: string
  }): Promise<ApiResponse<ProjectListResponse>>
  getProject(id: string): Promise<ApiResponse<{ project: ProjectWithStats }>>
  updateProject(id: string, request: ProjectUpdateRequest): Promise<ApiResponse<{ project: ProjectResponse; message: string }>>
  deleteProject(id: string): Promise<ApiResponse<{ message: string; deletedProjectId: string }>>
}

// =============================================================================
// Hook Types for React
// =============================================================================

export interface UseSitemapGenerationOptions {
  onSuccess?: (data: SitemapGenerationResponse) => void
  onError?: (error: ErrorResponse) => void
  onProgress?: (progress: number) => void
}

export interface UseWireframeGenerationOptions {
  onSuccess?: (data: WireframeGenerationResponse) => void
  onError?: (error: ErrorResponse) => void
  onProgress?: (progress: number) => void
}

export interface UseStyleGuideGenerationOptions {
  onSuccess?: (data: StyleGuideGenerationResponse) => void
  onError?: (error: ErrorResponse) => void
  onProgress?: (progress: number) => void
}

export interface UseProjectOptions {
  onSuccess?: (data: any) => void
  onError?: (error: ErrorResponse) => void
}

// =============================================================================
// Configuration Types
// =============================================================================

export interface RateLimitConfig {
  requests: number
  window: number // milliseconds
}

export interface ApiConfig {
  rateLimits: {
    sitemap: RateLimitConfig
    wireframe: RateLimitConfig
    styleGuide: RateLimitConfig
    project: RateLimitConfig
  }
  quotas: {
    maxCostPerHour: number
    maxCostPerDay: number
  }
  endpoints: {
    sitemap: string
    wireframe: string
    styleGuide: string
    project: string
  }
}

// =============================================================================
// Export all types
// =============================================================================



// Default export for convenience
export default {}
