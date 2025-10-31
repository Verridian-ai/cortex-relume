import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET /api/components/export/formats - Available export formats
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get framework information to provide contextual format suggestions
    const { data: components } = await supabase
      .from('components')
      .select('framework, category')
      .eq('is_public', true)
      .limit(1000) // Sample for framework statistics

    const frameworks = [...new Set(components?.map(c => c.framework) || [])]
    const categories = [...new Set(components?.map(c => c.category) || [])]

    const exportFormats = {
      single_component: {
        title: 'Single Component Export',
        description: 'Export individual components in various formats',
        formats: [
          {
            id: 'json',
            name: 'JSON',
            description: 'Complete component data in JSON format',
            extension: '.json',
            content_type: 'application/json',
            supports_options: [
              'include_dependencies',
              'include_variants', 
              'include_metadata',
              'minify_code',
              'add_comments',
            ],
            recommended_for: ['data_exchange', 'archival', 'backup'],
            file_size_estimate: 'small',
            popular: true,
          },
          {
            id: 'react',
            name: 'React Component',
            description: 'Ready-to-use React component with TypeScript',
            extension: '.tsx',
            content_type: 'application/javascript',
            supports_options: [
              'include_dependencies',
              'include_variants',
              'include_metadata',
              'minify_code',
              'add_comments',
              'framework_version',
              'export_structure',
              'responsive',
              'dark_mode',
            ],
            recommended_for: ['react_development', 'react_apps'],
            file_size_estimate: 'small',
            popular: frameworks.includes('React'),
          },
          {
            id: 'vue',
            name: 'Vue Component',
            description: 'Single File Component (SFC) for Vue.js',
            extension: '.vue',
            content_type: 'text/html',
            supports_options: [
              'include_dependencies',
              'include_variants',
              'include_metadata',
              'minify_code',
              'add_comments',
              'framework_version',
              'export_structure',
            ],
            recommended_for: ['vue_development', 'vue_apps'],
            file_size_estimate: 'small',
            popular: frameworks.includes('Vue'),
          },
          {
            id: 'angular',
            name: 'Angular Component',
            description: 'Complete Angular component with TypeScript, HTML, and SCSS',
            extension: '.component.ts',
            content_type: 'application/javascript',
            supports_options: [
              'include_dependencies',
              'include_variants',
              'include_metadata',
              'minify_code',
              'add_comments',
              'framework_version',
              'export_structure',
            ],
            recommended_for: ['angular_development', 'angular_apps'],
            file_size_estimate: 'medium',
            popular: frameworks.includes('Angular'),
          },
          {
            id: 'html',
            name: 'HTML Snippet',
            description: 'Pure HTML markup for direct integration',
            extension: '.html',
            content_type: 'text/html',
            supports_options: [
              'minify_code',
              'add_comments',
              'responsive',
              'dark_mode',
            ],
            recommended_for: ['static_sites', 'html_integration'],
            file_size_estimate: 'small',
            popular: true,
          },
          {
            id: 'css',
            name: 'CSS Styles',
            description: 'Component styles in CSS format',
            extension: '.css',
            content_type: 'text/css',
            supports_options: [
              'minify_code',
              'add_comments',
              'responsive',
              'dark_mode',
            ],
            recommended_for: ['styling', 'css_projects'],
            file_size_estimate: 'small',
            popular: true,
          },
          {
            id: 'figma',
            name: 'Figma Design',
            description: 'Component specifications for Figma design system',
            extension: '.json',
            content_type: 'application/json',
            supports_options: [
              'include_metadata',
              'include_variants',
            ],
            recommended_for: ['design_systems', 'figma_integration'],
            file_size_estimate: 'small',
            popular: categories.includes('Design System'),
          },
          {
            id: 'svg',
            name: 'SVG Graphic',
            description: 'Vector graphic representation of the component',
            extension: '.svg',
            content_type: 'image/svg+xml',
            supports_options: [
              'minify_code',
              'add_comments',
            ],
            recommended_for: ['icons', 'graphics', 'vector_graphics'],
            file_size_estimate: 'very_small',
            popular: categories.includes('Icons'),
          },
        ],
      },

      bulk_export: {
        title: 'Bulk Component Export',
        description: 'Export multiple components together',
        formats: [
          {
            id: 'zip',
            name: 'ZIP Archive',
            description: 'Complete bundle with multiple files and documentation',
            extension: '.zip',
            content_type: 'application/zip',
            supports_options: [
              'include_dependencies',
              'include_variants',
              'include_metadata',
              'include_documentation',
              'minify_code',
              'add_comments',
              'framework_version',
              'export_structure',
              'create_npm_package',
              'create_readme',
              'include_tests',
            ],
            recommended_for: ['project_migration', 'backup', 'sharing'],
            file_size_estimate: 'large',
            popular: true,
            max_components: 50,
            rate_limit: '2 per minute',
          },
          {
            id: 'json',
            name: 'Bulk JSON',
            description: 'All components in a single JSON file',
            extension: '.json',
            content_type: 'application/json',
            supports_options: [
              'include_dependencies',
              'include_variants',
              'include_metadata',
              'include_documentation',
              'minify_code',
              'add_comments',
            ],
            recommended_for: ['data_analysis', 'bulk_processing'],
            file_size_estimate: 'medium',
            popular: true,
            max_components: 50,
          },
          {
            id: 'tar',
            name: 'TAR Archive',
            description: 'Unix-style archive with compression options',
            extension: '.tar.gz',
            content_type: 'application/x-tar',
            supports_options: [
              'include_dependencies',
              'include_variants',
              'include_metadata',
              'include_documentation',
              'minify_code',
              'add_comments',
              'export_structure',
            ],
            recommended_for: ['unix_systems', 'server_deployment'],
            file_size_estimate: 'large',
            popular: false,
            max_components: 50,
          },
          {
            id: 'react-package',
            name: 'React NPM Package',
            description: 'Complete React component library package',
            extension: '.tgz',
            content_type: 'application/gzip',
            supports_options: [
              'include_dependencies',
              'include_variants',
              'include_metadata',
              'include_documentation',
              'minify_code',
              'add_comments',
              'framework_version',
              'create_readme',
              'include_tests',
            ],
            recommended_for: ['npm_publishing', 'react_libraries'],
            file_size_estimate: 'large',
            popular: frameworks.includes('React'),
            max_components: 50,
            rate_limit: '2 per minute',
          },
          {
            id: 'vue-package',
            name: 'Vue NPM Package',
            description: 'Complete Vue component library package',
            extension: '.tgz',
            content_type: 'application/gzip',
            supports_options: [
              'include_dependencies',
              'include_variants',
              'include_metadata',
              'include_documentation',
              'minify_code',
              'add_comments',
              'framework_version',
              'create_readme',
              'include_tests',
            ],
            recommended_for: ['npm_publishing', 'vue_libraries'],
            file_size_estimate: 'large',
            popular: frameworks.includes('Vue'),
            max_components: 50,
            rate_limit: '2 per minute',
          },
          {
            id: 'angular-package',
            name: 'Angular Package',
            description: 'Complete Angular component library package',
            extension: '.tgz',
            content_type: 'application/gzip',
            supports_options: [
              'include_dependencies',
              'include_variants',
              'include_metadata',
              'include_documentation',
              'minify_code',
              'add_comments',
              'framework_version',
              'create_readme',
              'include_tests',
            ],
            recommended_for: ['npm_publishing', 'angular_libraries'],
            file_size_estimate: 'large',
            popular: frameworks.includes('Angular'),
            max_components: 50,
            rate_limit: '2 per minute',
          },
        ],
      },

      metadata: {
        export_options: {
          include_dependencies: {
            description: 'Include component dependency information',
            default: true,
            impact: 'increases_file_size',
          },
          include_variants: {
            description: 'Include all component style variants',
            default: true,
            impact: 'increases_file_size',
          },
          include_metadata: {
            description: 'Include usage statistics and quality metrics',
            default: true,
            impact: 'small_increase',
          },
          include_documentation: {
            description: 'Include README and usage documentation',
            default: true,
            impact: 'medium_increase',
          },
          minify_code: {
            description: 'Minify code for production use',
            default: false,
            impact: 'reduces_file_size',
          },
          add_comments: {
            description: 'Include helpful comments in exported code',
            default: true,
            impact: 'increases_readability',
          },
          framework_version: {
            description: 'Specify target framework version',
            default: 'latest',
            impact: 'compatibility',
          },
          export_structure: {
            description: 'How to organize exported files',
            default: 'hierarchical',
            options: ['flat', 'hierarchical', 'by-category'],
            impact: 'organization',
          },
          create_npm_package: {
            description: 'Create complete NPM package structure',
            default: false,
            impact: 'adds_package_files',
          },
          create_readme: {
            description: 'Generate README.md files',
            default: true,
            impact: 'adds_documentation',
          },
          include_tests: {
            description: 'Include basic test files',
            default: false,
            impact: 'adds_test_files',
          },
          responsive: {
            description: 'Add responsive design classes',
            default: false,
            impact: 'adds_responsive_code',
          },
          dark_mode: {
            description: 'Include dark mode styles',
            default: false,
            impact: 'adds_dark_mode',
          },
        },

        rate_limits: {
          single_export: {
            limit: '10 per minute',
            window: '60 seconds',
            applies_to: ['single component exports'],
          },
          bulk_export: {
            limit: '2 per minute',
            window: '60 seconds',
            applies_to: ['bulk exports', 'package creation'],
          },
          ai_powered_features: {
            limit: '10 per minute',
            window: '60 seconds',
            applies_to: ['semantic search', 'AI-powered exports'],
          },
        },

        file_size_estimates: {
          very_small: '< 1 KB',
          small: '1 - 10 KB',
          medium: '10 - 100 KB',
          large: '100 KB - 10 MB',
          very_large: '> 10 MB',
        },

        usage_recommendations: {
          react_development: ['react', 'react-package'],
          vue_development: ['vue', 'vue-package'],
          angular_development: ['angular', 'angular-package'],
          data_exchange: ['json'],
          backup: ['zip', 'tar'],
          design_systems: ['figma'],
          static_sites: ['html', 'css'],
          npm_publishing: ['react-package', 'vue-package', 'angular-package'],
          project_migration: ['zip'],
          sharing: ['zip', 'json'],
        },

        framework_compatibility: {
          React: {
            versions: ['16.8+', '17.x', '18.x', '19.x'],
            recommended_formats: ['react', 'react-package'],
            additional_deps: ['react', 'react-dom'],
          },
          Vue: {
            versions: ['2.6+', '3.x'],
            recommended_formats: ['vue', 'vue-package'],
            additional_deps: ['vue'],
          },
          Angular: {
            versions: ['12+', '13.x', '14.x', '15.x'],
            recommended_formats: ['angular', 'angular-package'],
            additional_deps: ['@angular/core', '@angular/common'],
          },
          'Vanilla JS': {
            versions: ['ES6+'],
            recommended_formats: ['html', 'css', 'json'],
            additional_deps: [],
          },
          HTML: {
            versions: ['HTML5'],
            recommended_formats: ['html', 'css'],
            additional_deps: [],
          },
        },

        quality_metrics: {
          component_quality: {
            performance_score: '0-100 scale (higher is better)',
            accessibility_score: '0-100 scale (higher is better)',
            complexity_score: '1-5 scale (5 is most complex)',
            code_quality: 'Based on best practices and patterns',
          },
          usage_metrics: {
            usage_count: 'Total times component has been used',
            rating: 'Community rating (0-5 stars)',
            popularity_trend: 'Usage trend over time',
          },
        },

        last_updated: new Date().toISOString(),
        version: '1.0.0',
      },
    }

    // Calculate popular formats based on current usage
    const popularFormats = calculatePopularFormats(exportFormats, frameworks, categories)

    return NextResponse.json({
      data: {
        ...exportFormats,
        popular_formats: popularFormats,
        platform_stats: {
          total_frameworks: frameworks.length,
          supported_frameworks: frameworks,
          total_categories: categories.length,
          popular_frameworks: frameworks.slice(0, 5),
        },
      },
      success: true,
    })

  } catch (error: any) {
    console.error('Error fetching export formats:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch export formats',
        message: error.message,
        success: false 
      },
      { status: 500 }
    )
  }
}

// Calculate popular formats based on platform statistics
function calculatePopularFormats(exportFormats: any, frameworks: string[], categories: string[]) {
  const popular: any[] = []

  // Check single component formats
  exportFormats.single_component.formats.forEach((format: any) => {
    let popularityScore = 0
    
    // Base popularity
    if (format.popular) popularityScore += 10
    
    // Framework-specific popularity
    if (format.id === 'react' && frameworks.includes('React')) popularityScore += 20
    if (format.id === 'vue' && frameworks.includes('Vue')) popularityScore += 20
    if (format.id === 'angular' && frameworks.includes('Angular')) popularityScore += 20
    
    // Category-specific popularity
    if (format.id === 'figma' && categories.includes('Design System')) popularityScore += 15
    if (format.id === 'svg' && categories.includes('Icons')) popularityScore += 15
    
    if (popularityScore >= 10) {
      popular.push({
        category: 'single',
        format: format.id,
        name: format.name,
        popularity_score: popularityScore,
      })
    }
  })

  // Check bulk export formats
  exportFormats.bulk_export.formats.forEach((format: any) => {
    let popularityScore = 0
    
    if (format.popular) popularityScore += 15
    
    if (format.id === 'react-package' && frameworks.includes('React')) popularityScore += 25
    if (format.id === 'vue-package' && frameworks.includes('Vue')) popularityScore += 25
    if (format.id === 'angular-package' && frameworks.includes('Angular')) popularityScore += 25
    if (format.id === 'zip') popularityScore += 20 // ZIP is generally popular
    
    if (popularityScore >= 15) {
      popular.push({
        category: 'bulk',
        format: format.id,
        name: format.name,
        popularity_score: popularityScore,
      })
    }
  })

  // Sort by popularity score
  return popular
    .sort((a, b) => b.popularity_score - a.popularity_score)
    .slice(0, 8) // Top 8 most popular
}