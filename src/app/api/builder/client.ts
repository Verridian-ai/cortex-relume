/**
 * API Client for AI Site Builder
 * Provides a clean, typed interface for interacting with the Builder API
 */

import {
  ApiResponse,
  SitemapGenerationRequest,
  SitemapGenerationResponse,
  WireframeGenerationRequest,
  WireframeGenerationResponse,
  StyleGuideGenerationRequest,
  StyleGuideGenerationResponse,
  ProjectCreationRequest,
  ProjectUpdateRequest,
  ProjectListResponse,
  ProjectWithStats,
  ErrorResponse,
  RequestMetadata,
  ApiClientOptions
} from './types'

/**
 * Builder API Client
 * Provides methods for all Builder API endpoints
 */
export class BuilderAPIClient {
  private baseUrl: string
  private headers: Record<string, string>
  private timeout: number

  constructor(token: string, options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl || ''
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
    this.timeout = options.timeout || 30000 // 30 seconds
  }

  /**
   * Generic request method
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: errorData.error || {
            code: `HTTP_${response.status}`,
            message: `HTTP error ${response.status}`
          }
        }
      }

      const data = await response.json()
      return data

    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: {
            code: 'TIMEOUT',
            message: 'Request timeout'
          }
        }
      }

      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error'
        }
      }
    }
  }

  // =============================================================================
  // Sitemap Generation Methods
  // =============================================================================

  /**
   * Generate sitemap from prompt
   */
  async generateSitemap(
    request: SitemapGenerationRequest,
    options?: { projectId?: string }
  ): Promise<ApiResponse<SitemapGenerationResponse>> {
    let endpoint = '/api/builder/sitemap'
    if (options?.projectId) {
      endpoint += `?projectId=${options.projectId}`
    }

    return this.request<SitemapGenerationResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(request)
    })
  }

  /**
   * Get sitemap generation capabilities
   */
  async getSitemapCapabilities(): Promise<ApiResponse<any>> {
    return this.request<any>('/api/builder/sitemap', {
      method: 'GET'
    })
  }

  // =============================================================================
  // Wireframe Generation Methods
  // =============================================================================

  /**
   * Generate wireframe from sitemap
   */
  async generateWireframe(
    request: WireframeGenerationRequest,
    options?: { projectId?: string }
  ): Promise<ApiResponse<WireframeGenerationResponse>> {
    let endpoint = '/api/builder/wireframe'
    if (options?.projectId) {
      endpoint += `?projectId=${options.projectId}`
    }

    return this.request<WireframeGenerationResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(request)
    })
  }

  /**
   * Get wireframe generation capabilities
   */
  async getWireframeCapabilities(): Promise<ApiResponse<any>> {
    return this.request<any>('/api/builder/wireframe', {
      method: 'GET'
    })
  }

  // =============================================================================
  // Style Guide Generation Methods
  // =============================================================================

  /**
   * Generate style guide from wireframe and brand guidelines
   */
  async generateStyleGuide(
    request: StyleGuideGenerationRequest,
    options?: { projectId?: string }
  ): Promise<ApiResponse<StyleGuideGenerationResponse>> {
    let endpoint = '/api/builder/style-guide'
    if (options?.projectId) {
      endpoint += `?projectId=${options.projectId}`
    }

    return this.request<StyleGuideGenerationResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(request)
    })
  }

  /**
   * Get style guide generation capabilities
   */
  async getStyleGuideCapabilities(): Promise<ApiResponse<any>> {
    return this.request<any>('/api/builder/style-guide', {
      method: 'GET'
    })
  }

  // =============================================================================
  // Project Management Methods
  // =============================================================================

  /**
   * Create a new project
   */
  async createProject(
    request: ProjectCreationRequest
  ): Promise<ApiResponse<{ project: any; message: string }>> {
    return this.request('/api/builder/project', {
      method: 'POST',
      body: JSON.stringify(request)
    })
  }

  /**
   * Get list of projects
   */
  async getProjects(params?: {
    status?: string
    type?: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: string
  }): Promise<ApiResponse<ProjectListResponse>> {
    const queryParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const endpoint = `/api/builder/project${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    
    return this.request<ProjectListResponse>(endpoint, {
      method: 'GET'
    })
  }

  /**
   * Get specific project by ID
   */
  async getProject(id: string): Promise<ApiResponse<{ project: ProjectWithStats }>> {
    return this.request(`/api/builder/project/${id}`, {
      method: 'GET'
    })
  }

  /**
   * Update project
   */
  async updateProject(
    id: string,
    request: ProjectUpdateRequest
  ): Promise<ApiResponse<{ project: any; message: string }>> {
    return this.request(`/api/builder/project/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request)
    })
  }

  /**
   * Delete project
   */
  async deleteProject(
    id: string
  ): Promise<ApiResponse<{ message: string; deletedProjectId: string }>> {
    return this.request(`/api/builder/project/${id}`, {
      method: 'DELETE'
    })
  }
}

// =============================================================================
// React Hooks for Easy Integration
// =============================================================================

import { useState, useCallback } from 'react'

/**
 * Hook for generating sitemaps
 */
export function useSitemapGeneration(token: string, options?: {
  onSuccess?: (data: SitemapGenerationResponse) => void
  onError?: (error: ErrorResponse) => void
}) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<SitemapGenerationResponse | null>(null)
  const [error, setError] = useState<ErrorResponse | null>(null)

  const generate = useCallback(async (request: SitemapGenerationRequest, projectId?: string) => {
    setLoading(true)
    setError(null)

    try {
      const client = new BuilderAPIClient(token)
      const response = await client.generateSitemap(request, { projectId })

      if (response.success && response.data) {
        setData(response.data)
        options?.onSuccess?.(response.data)
      } else if (response.error) {
        setError(response.error)
        options?.onError?.(response.error)
      }
    } catch (err) {
      const errorResponse: ErrorResponse = {
        code: 'UNKNOWN_ERROR',
        message: err instanceof Error ? err.message : 'An unknown error occurred'
      }
      setError(errorResponse)
      options?.onError?.(errorResponse)
    } finally {
      setLoading(false)
    }
  }, [token, options])

  return { generate, loading, data, error }
}

/**
 * Hook for generating wireframes
 */
export function useWireframeGeneration(token: string, options?: {
  onSuccess?: (data: WireframeGenerationResponse) => void
  onError?: (error: ErrorResponse) => void
}) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<WireframeGenerationResponse | null>(null)
  const [error, setError] = useState<ErrorResponse | null>(null)

  const generate = useCallback(async (request: WireframeGenerationRequest, projectId?: string) => {
    setLoading(true)
    setError(null)

    try {
      const client = new BuilderAPIClient(token)
      const response = await client.generateWireframe(request, { projectId })

      if (response.success && response.data) {
        setData(response.data)
        options?.onSuccess?.(response.data)
      } else if (response.error) {
        setError(response.error)
        options?.onError?.(response.error)
      }
    } catch (err) {
      const errorResponse: ErrorResponse = {
        code: 'UNKNOWN_ERROR',
        message: err instanceof Error ? err.message : 'An unknown error occurred'
      }
      setError(errorResponse)
      options?.onError?.(errorResponse)
    } finally {
      setLoading(false)
    }
  }, [token, options])

  return { generate, loading, data, error }
}

/**
 * Hook for generating style guides
 */
export function useStyleGuideGeneration(token: string, options?: {
  onSuccess?: (data: StyleGuideGenerationResponse) => void
  onError?: (error: ErrorResponse) => void
}) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<StyleGuideGenerationResponse | null>(null)
  const [error, setError] = useState<ErrorResponse | null>(null)

  const generate = useCallback(async (request: StyleGuideGenerationRequest, projectId?: string) => {
    setLoading(true)
    setError(null)

    try {
      const client = new BuilderAPIClient(token)
      const response = await client.generateStyleGuide(request, { projectId })

      if (response.success && response.data) {
        setData(response.data)
        options?.onSuccess?.(response.data)
      } else if (response.error) {
        setError(response.error)
        options?.onError?.(response.error)
      }
    } catch (err) {
      const errorResponse: ErrorResponse = {
        code: 'UNKNOWN_ERROR',
        message: err instanceof Error ? err.message : 'An unknown error occurred'
      }
      setError(errorResponse)
      options?.onError?.(errorResponse)
    } finally {
      setLoading(false)
    }
  }, [token, options])

  return { generate, loading, data, error }
}

/**
 * Hook for project management
 */
export function useProjects(token: string, options?: {
  onSuccess?: (data: any) => void
  onError?: (error: ErrorResponse) => void
}) {
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState<ProjectWithStats[]>([])
  const [error, setError] = useState<ErrorResponse | null>(null)

  const loadProjects = useCallback(async (params?: {
    status?: string
    type?: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: string
  }) => {
    setLoading(true)
    setError(null)

    try {
      const client = new BuilderAPIClient(token)
      const response = await client.getProjects(params)

      if (response.success && response.data) {
        setProjects(response.data.projects)
        options?.onSuccess?.(response.data)
      } else if (response.error) {
        setError(response.error)
        options?.onError?.(response.error)
      }
    } catch (err) {
      const errorResponse: ErrorResponse = {
        code: 'UNKNOWN_ERROR',
        message: err instanceof Error ? err.message : 'An unknown error occurred'
      }
      setError(errorResponse)
      options?.onError?.(errorResponse)
    } finally {
      setLoading(false)
    }
  }, [token, options])

  const createProject = useCallback(async (request: ProjectCreationRequest) => {
    setLoading(true)
    setError(null)

    try {
      const client = new BuilderAPIClient(token)
      const response = await client.createProject(request)

      if (response.success && response.data) {
        // Refresh projects list
        await loadProjects()
        options?.onSuccess?.(response.data)
      } else if (response.error) {
        setError(response.error)
        options?.onError?.(response.error)
      }
    } catch (err) {
      const errorResponse: ErrorResponse = {
        code: 'UNKNOWN_ERROR',
        message: err instanceof Error ? err.message : 'An unknown error occurred'
      }
      setError(errorResponse)
      options?.onError?.(errorResponse)
    } finally {
      setLoading(false)
    }
  }, [token, options, loadProjects])

  const updateProject = useCallback(async (id: string, request: ProjectUpdateRequest) => {
    setLoading(true)
    setError(null)

    try {
      const client = new BuilderAPIClient(token)
      const response = await client.updateProject(id, request)

      if (response.success && response.data) {
        // Refresh projects list
        await loadProjects()
        options?.onSuccess?.(response.data)
      } else if (response.error) {
        setError(response.error)
        options?.onError?.(response.error)
      }
    } catch (err) {
      const errorResponse: ErrorResponse = {
        code: 'UNKNOWN_ERROR',
        message: err instanceof Error ? err.message : 'An unknown error occurred'
      }
      setError(errorResponse)
      options?.onError?.(errorResponse)
    } finally {
      setLoading(false)
    }
  }, [token, options, loadProjects])

  const deleteProject = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const client = new BuilderAPIClient(token)
      const response = await client.deleteProject(id)

      if (response.success) {
        // Refresh projects list
        await loadProjects()
        options?.onSuccess?.(response.data)
      } else if (response.error) {
        setError(response.error)
        options?.onError?.(response.error)
      }
    } catch (err) {
      const errorResponse: ErrorResponse = {
        code: 'UNKNOWN_ERROR',
        message: err instanceof Error ? err.message : 'An unknown error occurred'
      }
      setError(errorResponse)
      options?.onError?.(errorResponse)
    } finally {
      setLoading(false)
    }
  }, [token, options, loadProjects])

  return {
    projects,
    loading,
    error,
    loadProjects,
    createProject,
    updateProject,
    deleteProject
  }
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Create a Builder API client instance
 */
export function createBuilderClient(token: string, options?: ApiClientOptions): BuilderAPIClient {
  return new BuilderAPIClient(token, options)
}

/**
 * Check if API response is successful
 */
export function isSuccessful<T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true; data: T } {
  return response.success === true && response.data !== undefined
}

/**
 * Check if API response has an error
 */
export function hasError<T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: false; error: ErrorResponse } {
  return response.success === false && response.error !== undefined
}

/**
 * Get error message from API response
 */
export function getErrorMessage<T>(response: ApiResponse<T>): string | null {
  return hasError(response) ? response.error.message : null
}

// =============================================================================
// Export everything
// =============================================================================

export {
  BuilderAPIClient,
  useSitemapGeneration,
  useWireframeGeneration,
  useStyleGuideGeneration,
  useProjects,
  createBuilderClient,
  isSuccessful,
  hasError,
  getErrorMessage
}

export default BuilderAPIClient
