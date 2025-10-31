/**
 * Sitemap Generation Hook
 * Manages sitemap generation workflow and state
 */

import { useState, useCallback, useEffect } from 'react';
import { useBuilderStore } from './use-builder-store';
import {
  SitemapGenerationRequest,
  SitemapGenerationResponse,
  SitemapStructure,
  SitemapValidationResult,
  WebsiteType
} from '../types/sitemap';
import toast from 'react-hot-toast';

interface UseSitemapGeneratorReturn {
  // State
  isGenerating: boolean;
  progress: number;
  confidence?: number;
  error?: string;
  
  // Actions
  generate: (request: SitemapGenerationRequest) => Promise<void>;
  validate: () => Promise<SitemapValidationResult>;
  regenerate: () => Promise<void>;
  updatePage: (pageId: string, updates: Partial<SitemapStructure['pages'][0]>) => void;
  addPage: (parentId?: string) => void;
  removePage: (pageId: string) => void;
  movePage: (pageId: string, newParentId?: string, newOrder?: number) => void;
  
  // Utilities
  canGenerate: boolean;
  hasSitemap: boolean;
  isValid: boolean;
  statistics: SitemapStructure['statistics'] | null;
  exportSitemap: (format: 'json' | 'xml' | 'csv') => string;
}

export const useSitemapGenerator = (): UseSitemapGeneratorReturn => {
  const {
    sitemap,
    sitemapGeneration,
    setSitemap,
    generateSitemap,
    validateSitemap,
    updateSitemapPage,
    createProject,
    currentProject,
  } = useBuilderStore();

  // Local state
  const [validationResult, setValidationResult] = useState<SitemapValidationResult | null>(null);

  // Derived state
  const isGenerating = sitemapGeneration.status === 'generating';
  const progress = sitemapGeneration.progress;
  const confidence = sitemapGeneration.confidence;
  const error = sitemapGeneration.error || sitemapGeneration.error;
  
  const canGenerate = !isGenerating && currentProject !== null;
  const hasSitemap = sitemap !== null;
  const isValid = validationResult?.isValid ?? false;
  const statistics = sitemap?.statistics ?? null;

  // Generate sitemap
  const generate = useCallback(async (request: SitemapGenerationRequest) => {
    try {
      await generateSitemap(request);
      toast.success('Sitemap generated successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate sitemap';
      toast.error(errorMessage);
    }
  }, [generateSitemap]);

  // Validate sitemap
  const validate = useCallback(async (): Promise<SitemapValidationResult> => {
    if (!sitemap) {
      throw new Error('No sitemap to validate');
    }

    try {
      const result = await validateSitemap();
      setValidationResult(result);
      
      if (result.errors.length > 0) {
        const errorCount = result.errors.filter(e => e.severity === 'error').length;
        const warningCount = result.errors.filter(e => e.severity === 'warning').length;
        
        if (errorCount > 0) {
          toast.error(`Found ${errorCount} error(s) in sitemap`);
        } else if (warningCount > 0) {
          toast.success(`Sitemap valid with ${warningCount} warning(s)`);
        } else {
          toast.success('Sitemap is valid!');
        }
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Validation failed';
      toast.error(errorMessage);
      throw err;
    }
  }, [sitemap, validateSitemap]);

  // Regenerate sitemap
  const regenerate = useCallback(async () => {
    if (!sitemap || !currentProject) {
      toast.error('No sitemap to regenerate');
      return;
    }

    const request: SitemapGenerationRequest = {
      prompt: currentProject.description || '',
      websiteType: currentProject.websiteType as WebsiteType,
    };

    await generate(request);
  }, [sitemap, currentProject, generate]);

  // Update page
  const updatePage = useCallback((pageId: string, updates: Partial<SitemapStructure['pages'][0]>) => {
    updateSitemapPage(pageId, updates);
    toast.success('Page updated successfully');
  }, [updateSitemapPage]);

  // Add new page
  const addPage = useCallback((parentId?: string) => {
    if (!sitemap) return;

    const newPage = {
      id: `page-${Date.now()}`,
      title: 'New Page',
      description: '',
      path: '/new-page',
      priority: 5,
      changefreq: 'monthly' as const,
      purpose: 'information' as const,
      importance: 50,
      isCritical: false,
      requiresAuth: false,
      order: sitemap.pages.length + 1,
      ...(parentId && { parentId }),
      metadata: {},
    };

    updateSitemapPage(newPage.id, newPage);
    toast.success('New page added');
  }, [sitemap, updateSitemapPage]);

  // Remove page
  const removePage = useCallback((pageId: string) => {
    if (!sitemap) return;

    // Find and remove the page and its children
    const removePageRecursively = (pages: typeof sitemap.pages, id: string): void => {
      const index = pages.findIndex(p => p.id === id);
      if (index >= 0) {
        pages.splice(index, 1);
      } else {
        pages.forEach(page => {
          if (page.children) {
            removePageRecursively(page.children, id);
          }
        });
      }
    };

    removePageRecursively(sitemap.pages, pageId);
    toast.success('Page removed successfully');
  }, [sitemap, updateSitemapPage]);

  // Move page
  const movePage = useCallback((pageId: string, newParentId?: string, newOrder?: number) => {
    if (!sitemap) return;

    // Find the page to move
    let pageToMove: any = null;
    let currentParent: any = null;

    const findPage = (pages: typeof sitemap.pages, id: string, parent: any = null): any => {
      for (const page of pages) {
        if (page.id === id) {
          pageToMove = page;
          currentParent = parent;
          return;
        }
        if (page.children) {
          findPage(page.children, id, page);
        }
      }
    };

    findPage(sitemap.pages, pageId);

    if (!pageToMove) {
      toast.error('Page not found');
      return;
    }

    // Remove from current position
    if (currentParent) {
      currentParent.children = currentParent.children?.filter((p: any) => p.id !== pageId);
    } else {
      sitemap.pages = sitemap.pages.filter(p => p.id !== pageId);
    }

    // Add to new position
    if (newParentId) {
      const newParent = sitemap.pages.find(p => p.id === newParentId);
      if (newParent) {
        if (!newParent.children) newParent.children = [];
        newParent.children.push(pageToMove);
      }
    } else {
      sitemap.pages.push(pageToMove);
    }

    toast.success('Page moved successfully');
  }, [sitemap, updateSitemapPage]);

  // Export sitemap
  const exportSitemap = useCallback((format: 'json' | 'xml' | 'csv'): string => {
    if (!sitemap) {
      throw new Error('No sitemap to export');
    }

    switch (format) {
      case 'json':
        return JSON.stringify(sitemap, null, 2);
      
      case 'xml':
        const generateXML = (pages: typeof sitemap.pages, baseUrl = ''): string => {
          return pages.map(page => {
            const url = baseUrl ? `${baseUrl}/${page.path}` : page.path;
            const changefreq = page.changefreq === 'always' ? 'always' : 
                              page.changefreq === 'hourly' ? 'hourly' :
                              page.changefreq === 'daily' ? 'daily' :
                              page.changefreq === 'weekly' ? 'weekly' :
                              page.changefreq === 'monthly' ? 'monthly' :
                              page.changefreq === 'yearly' ? 'yearly' : 'never';
            
            const priority = (page.priority / 10).toFixed(1);
            
            let xml = `  <url>\n    <loc>${url}</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
            
            if (page.children && page.children.length > 0) {
              xml += '\n' + generateXML(page.children, url);
            }
            
            return xml;
          }).join('\n');
        };

        return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${generateXML(sitemap.pages)}
</urlset>`;
      
      case 'csv':
        const generateCSV = (pages: typeof sitemap.pages): string => {
          const rows = [['URL', 'Title', 'Description', 'Priority', 'Changefreq', 'Last Modified']];
          
          const processPages = (pages: typeof sitemap.pages, basePath = '') => {
            pages.forEach(page => {
              const url = basePath ? `${basePath}/${page.path}` : page.path;
              rows.push([
                url,
                page.title,
                page.description || '',
                page.priority.toString(),
                page.changefreq,
                new Date().toISOString().split('T')[0]
              ]);
              
              if (page.children && page.children.length > 0) {
                processPages(page.children, url);
              }
            });
          };
          
          processPages(pages);
          return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        };

        return generateCSV(sitemap.pages);
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }, [sitemap]);

  // Auto-validate when sitemap changes
  useEffect(() => {
    if (sitemap && !validationResult) {
      validate().catch(console.error);
    }
  }, [sitemap, validate, validationResult]);

  return {
    // State
    isGenerating,
    progress,
    confidence,
    error,
    
    // Actions
    generate,
    validate,
    regenerate,
    updatePage,
    addPage,
    removePage,
    movePage,
    
    // Utilities
    canGenerate,
    hasSitemap,
    isValid,
    statistics,
    exportSitemap,
  };
};

export default useSitemapGenerator;