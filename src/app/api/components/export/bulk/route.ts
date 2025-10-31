import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { componentDatabaseHelpers } from '@/lib/supabase/components'
import { z } from 'zod'

const bulkExportSchema = z.object({
  component_ids: z.array(z.string().uuid()).min(2, 'Bulk export requires at least 2 components').max(50, 'Maximum 50 components per bulk export'),
  format: z.enum(['zip', 'json', 'tar', 'react-package', 'vue-package', 'angular-package']),
  options: z.object({
    include_dependencies: z.boolean().default(true),
    include_variants: z.boolean().default(true),
    include_metadata: z.boolean().default(true),
    include_documentation: z.boolean().default(true),
    minify_code: z.boolean().default(false),
    add_comments: z.boolean().default(true),
    framework_version: z.string().optional(),
    export_structure: z.enum(['flat', 'hierarchical', 'by-category']).default('hierarchical'),
    create_npm_package: z.boolean().default(false),
    create_readme: z.boolean().default(true),
    include_tests: z.boolean().default(false),
  }).optional(),
  metadata: z.object({
    project_name: z.string().optional(),
    project_description: z.string().optional(),
    author: z.string().optional(),
    version: z.string().default('1.0.0'),
    license: z.string().default('MIT'),
    repository_url: z.string().optional(),
    homepage_url: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  }).optional(),
})

// Rate limiting for bulk exports
const bulkExportRateLimitMap = new Map<string, { count: number; resetTime: number }>()
const BULK_EXPORT_RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const BULK_EXPORT_RATE_LIMIT_MAX_REQUESTS = 2 // 2 bulk exports per minute

function checkBulkExportRateLimit(identifier: string): boolean {
  const now = Date.now()
  const limit = bulkExportRateLimitMap.get(identifier)
  
  if (!limit || now > limit.resetTime) {
    bulkExportRateLimitMap.set(identifier, { count: 1, resetTime: now + BULK_EXPORT_RATE_LIMIT_WINDOW })
    return true
  }
  
  if (limit.count >= BULK_EXPORT_RATE_LIMIT_MAX_REQUESTS) {
    return false
  }
  
  limit.count++
  return true
}

// POST /api/components/export/bulk - Bulk export multiple components
export async function POST(request: NextRequest) {
  try {
    // Get authentication
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required for bulk exports', success: false },
        { status: 401 }
      )
    }

    // Rate limiting
    const rateLimitKey = `user:${user.id}`
    if (!checkBulkExportRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { 
          error: 'Bulk export rate limit exceeded. Please try again later.',
          success: false,
          retry_after: 60,
        },
        { status: 429 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = bulkExportSchema.parse(body)

    const { component_ids, format, options = {}, metadata = {} } = validatedData

    // Start timing the export
    const startTime = Date.now()

    // Fetch all components with related data
    const componentsResult = await fetchComponentsForBulkExport(supabase, component_ids, options)

    if (!componentsResult.success) {
      return NextResponse.json(
        { error: componentsResult.error || 'Failed to fetch components', success: false },
        { status: 500 }
      )
    }

    const components = componentsResult.data

    if (!components.length) {
      return NextResponse.json(
        { error: 'No components found for export', success: false },
        { status: 404 }
      )
    }

    // Perform bulk export based on format
    const exportResult = await performBulkExport({
      components,
      format,
      options,
      metadata,
      userId: user.id,
    })

    if (!exportResult.success) {
      return NextResponse.json(
        { error: exportResult.error || 'Bulk export failed', success: false },
        { status: 500 }
      )
    }

    const endTime = Date.now()
    const exportDuration = endTime - startTime

    // Log the bulk export for analytics
    await logBulkExport(supabase, {
      component_ids,
      format,
      user_id: user.id,
      options,
      file_size: exportResult.data?.file_size || 0,
      export_duration: exportDuration,
      components_count: components.length,
    })

    // Return the exported file
    return new NextResponse(exportResult.data?.content || '', {
      status: 200,
      headers: {
        'Content-Type': exportResult.data?.content_type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${exportResult.data?.filename || 'export'}"`,
        'Content-Length': (exportResult.data?.file_size || 0).toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'X-Export-Success': 'true',
        'X-Export-Format': format,
        'X-Export-Size': (exportResult.data?.file_size || 0).toString(),
        'X-Export-Duration': exportDuration.toString(),
        'X-Export-Count': components.length.toString(),
        'X-Export-Type': 'bulk',
      },
    })

  } catch (error: any) {
    console.error('Error in bulk component export:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid bulk export parameters',
          details: error.errors,
          success: false 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Bulk export service temporarily unavailable',
        message: error.message,
        success: false 
      },
      { status: 503 }
    )
  }
}

// Fetch components for bulk export
async function fetchComponentsForBulkExport(supabase: any, componentIds: string[], options: any) {
  try {
    // Fetch components
    const { data: components, error: componentsError } = await supabase
      .from('components')
      .select(`
        *,
        profiles!components_author_id_fkey(full_name, avatar_url),
        component_categories(name, slug, color, icon)
      `)
      .in('id', componentIds)
      .or(`is_public.eq.true,author_id.eq.${supabase.auth.getUser().then((r: any) => r.data.user?.id)}`)

    if (componentsError) {
      throw componentsError
    }

    if (!components || components.length !== componentIds.length) {
      return {
        success: false,
        error: 'Some components not found or access denied',
        data: [],
      }
    }

    // Fetch additional data in parallel if requested
    let variants: any[] = []
    let dependencies: any[] = []
    let usageStats: any[] = []

    if (options.include_variants || options.include_dependencies) {
      const [variantsResult, dependenciesResult, usageStatsResult] = await Promise.all([
        options.include_variants 
          ? supabase
              .from('component_variants')
              .select('*')
              .in('component_id', componentIds)
              .eq('is_active', true)
          : Promise.resolve({ data: [] }),
        options.include_dependencies
          ? supabase
              .from('component_dependencies')
              .select(`
                *,
                component:component_dependencies_component_id_fkey(name),
                depends_on:component_dependencies_depends_on_component_id_fkey(name)
              `)
              .in('component_id', componentIds)
          : Promise.resolve({ data: [] }),
        options.include_metadata
          ? supabase
              .from('component_usage_stats')
              .select('*')
              .in('component_id', componentIds)
              .order('date', { ascending: false })
              .limit(30) // Last 30 days
          : Promise.resolve({ data: [] }),
      ])

      variants = variantsResult.data || []
      dependencies = dependenciesResult.data || []
      usageStats = usageStatsResult.data || []
    }

    // Group additional data by component ID
    const variantsByComponent = groupDataByComponent(variants)
    const dependenciesByComponent = groupDataByComponent(dependencies)
    const usageStatsByComponent = groupDataByComponent(usageStats)

    // Enhance components with related data
    const enhancedComponents = components.map((component: any) => ({
      ...component,
      variants: variantsByComponent.get(component.id) || [],
      dependencies: dependenciesByComponent.get(component.id) || [],
      usage_stats: usageStatsByComponent.get(component.id) || [],
      preview_data: {
        category: component.component_categories,
        author: component.profiles,
      },
    }))

    return {
      success: true,
      data: enhancedComponents,
    }

  } catch (error: any) {
    console.error('Error fetching components for bulk export:', error)
    return {
      success: false,
      error: error.message,
      data: [],
    }
  }
}

// Perform bulk export based on format
async function performBulkExport(params: {
  components: any[],
  format: string,
  options: any,
  metadata: any,
  userId?: string,
}) {
  const { components, format, options, metadata } = params

  try {
    let exportData

    switch (format.toLowerCase()) {
      case 'zip':
        exportData = await exportAsZipArchive(components, options, metadata)
        break
      case 'json':
        exportData = await exportAsBulkJSON(components, options, metadata)
        break
      case 'tar':
        exportData = await exportAsTarArchive(components, options, metadata)
        break
      case 'react-package':
        exportData = await exportAsReactPackage(components, options, metadata)
        break
      case 'vue-package':
        exportData = await exportAsVuePackage(components, options, metadata)
        break
      case 'angular-package':
        exportData = await exportAsAngularPackage(components, options, metadata)
        break
      default:
        return {
          success: false,
          error: `Unsupported bulk export format: ${format}`,
        }
    }

    return {
      success: true,
      data: exportData,
    }

  } catch (error: any) {
    console.error('Error in performBulkExport:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Export as ZIP archive (conceptual - in real implementation would use a ZIP library)
async function exportAsZipArchive(components: any[], options: any, metadata: any) {
  const files: Record<string, string> = {}

  // Add main manifest
  const manifest = {
    exported_at: new Date().toISOString(),
    format: 'zip',
    version: '1.0.0',
    component_count: components.length,
    metadata,
    options,
    components: components.map(c => ({
      id: c.id,
      name: c.name,
      category: c.category,
      framework: c.framework,
      file: `components/${c.name.toLowerCase().replace(/\s+/g, '-')}.json`,
    })),
  }

  files['manifest.json'] = JSON.stringify(manifest, null, 2)

  // Add individual component files
  components.forEach(component => {
    const fileName = `components/${component.name.toLowerCase().replace(/\s+/g, '-')}.json`
    const componentData = {
      component,
      variants: options.include_variants ? component.variants : undefined,
      dependencies: options.include_dependencies ? component.dependencies : undefined,
      usage_stats: options.include_metadata ? component.usage_stats : undefined,
    }
    files[fileName] = JSON.stringify(componentData, null, options.minify_code ? 0 : 2)
  })

  // Add documentation if requested
  if (options.include_documentation) {
    files['README.md'] = generateBulkReadme(components, metadata)
    files['CHANGELOG.md'] = generateBulkChangelog(components)
    files['COMPONENTS.md'] = generateComponentsIndex(components)
  }

  // Simulate ZIP creation (in real implementation, would use a ZIP library)
  const zipContent = JSON.stringify(files, null, 2) // Simplified for demo
  const totalSize = Object.values(files).reduce((sum, content) => sum + content.length, 0)

  return {
    content: zipContent,
    content_type: 'application/zip',
    filename: `${metadata.project_name || 'components-bundle'}.zip`,
    file_size: totalSize,
  }
}

// Export as bulk JSON
async function exportAsBulkJSON(components: any[], options: any, metadata: any) {
  const bulkData = {
    bundle: {
      exported_at: new Date().toISOString(),
      format: 'bulk-json',
      version: '1.0.0',
      component_count: components.length,
      metadata,
      options,
      summary: {
        categories: [...new Set(components.map(c => c.category))],
        frameworks: [...new Set(components.map(c => c.framework))],
        total_usage: components.reduce((sum, c) => sum + (c.usage_count || 0), 0),
        average_rating: components.filter(c => c.rating).reduce((sum, c, _, arr) => sum + (c.rating || 0) / arr.length, 0),
      },
    },
    components: components.map(component => ({
      ...component,
      variants: options.include_variants ? component.variants : undefined,
      dependencies: options.include_dependencies ? component.dependencies : undefined,
      usage_stats: options.include_metadata ? component.usage_stats : undefined,
      preview_data: undefined, // Clean up circular references
    })),
  }

  let content = JSON.stringify(bulkData, null, options.minify_code ? 0 : 2)
  if (options.minify_code) {
    content = JSON.stringify(bulkData)
  }

  return {
    content,
    content_type: 'application/json',
    filename: `${metadata.project_name || 'components-bundle'}.json`,
    file_size: content.length,
  }
}

// Export as React package
async function exportAsReactPackage(components: any[], options: any, metadata: any) {
  const files: Record<string, string> = {}
  const componentExports: string[] = []

  // Main package.json
  const packageJson = {
    name: metadata.project_name?.toLowerCase().replace(/\s+/g, '-') || 'component-bundle',
    version: metadata.version || '1.0.0',
    description: metadata.project_description || 'React component bundle exported from Component Library',
    main: 'index.js',
    module: 'index.js',
    types: 'index.d.ts',
    license: metadata.license || 'MIT',
    repository: metadata.repository_url ? { type: 'git', url: metadata.repository_url } : undefined,
    homepage: metadata.homepage_url,
    keywords: metadata.keywords || ['react', 'components', 'ui'],
    dependencies: extractAllDependencies(components, 'react'),
    peerDependencies: {
      react: '^16.8.0 || ^17.0.0 || ^18.0.0',
      'react-dom': '^16.8.0 || ^17.0.0 || ^18.0.0',
    },
    scripts: {
      build: 'rollup -c',
      dev: 'rollup -c -w',
      test: 'jest',
      'test:watch': 'jest --watch',
      lint: 'eslint src --ext .js,.jsx,.ts,.tsx',
    },
  }

  files['package.json'] = JSON.stringify(packageJson, null, 2)

  // Individual component files
  components.forEach(component => {
    const componentName = component.name.replace(/[^a-zA-Z0-9]/g, '')
    const fileName = `src/components/${componentName}.tsx`
    
    let componentCode = component.code || '// Component code not available'
    
    if (options.add_comments) {
      const header = `/**
 * ${component.name}
 * ${component.description || 'React component'}
 * 
 * Exported from Component Library
 * Category: ${component.category}
 * Framework: ${component.framework}
 * Complexity: ${component.complexity_score}/5
 * Performance Score: ${component.performance_score}/100
 * Accessibility Score: ${component.accessibility_score}/100
 */

`
      componentCode = header + componentCode
    }

    // Add TypeScript interfaces
    let tsInterface = ''
    if (component.props && Object.keys(component.props).length > 0) {
      const propsTypeName = `${componentName}Props`
      tsInterface = `
interface ${propsTypeName} {
${Object.entries(component.props).map(([key, value]) => `  ${key}: ${typeof value === 'string' ? 'string' : 'any'};`).join('\n')}
}

`
      componentCode = componentCode.replace('export default', `export interface ${propsTypeName} {}\nexport default`)
    }

    files[fileName] = tsInterface + componentCode
    componentExports.push(`export { default as ${componentName} } from './components/${componentName}.tsx';`)
  })

  // Main index file
  files['src/index.ts'] = componentExports.join('\n') + '\n'

  // Rollup config for building
  files['rollup.config.js'] = `import typescript from 'rollup-plugin-typescript2';
import { babel } from '@rollup/plugin-babel';

export default {
  input: 'src/index.ts',
  output: {
    file: 'index.js',
    format: 'esm',
    sourcemap: true,
  },
  plugins: [
    typescript(),
    babel({ extensions: ['.js', '.jsx', '.ts', '.tsx'] })
  ],
  external: ['react', 'react-dom'],
};`

  // Add documentation
  if (options.include_documentation) {
    files['README.md'] = generateReactBundleReadme(components, metadata)
    files['CHANGELOG.md'] = generateBulkChangelog(components)
    files['COMPONENTS.md'] = generateComponentsIndex(components)
  }

  // Create bundle
  const bundle = {
    package_info: packageJson,
    files,
    instructions: generateUsageInstructions(components, 'react-bundle'),
  }

  const content = JSON.stringify(bundle, null, options.minify_code ? 0 : 2)
  const totalSize = Object.values(files).reduce((sum, content) => sum + content.length, 0)

  return {
    content,
    content_type: 'application/json',
    filename: `${metadata.project_name || 'react-components-bundle'}.json`,
    file_size: totalSize,
  }
}

// Export as Vue package
async function exportAsVuePackage(components: any[], options: any, metadata: any) {
  const files: Record<string, string> = {}
  const componentExports: string[] = []

  // Package.json
  const packageJson = {
    name: metadata.project_name?.toLowerCase().replace(/\s+/g, '-') || 'vue-component-bundle',
    version: metadata.version || '1.0.0',
    description: metadata.project_description || 'Vue component bundle exported from Component Library',
    main: 'index.js',
    module: 'index.js',
    license: metadata.license || 'MIT',
    repository: metadata.repository_url ? { type: 'git', url: metadata.repository_url } : undefined,
    keywords: metadata.keywords || ['vue', 'components', 'ui'],
    dependencies: extractAllDependencies(components, 'vue'),
    peerDependencies: {
      vue: '^2.6.0 || ^3.0.0',
    },
  }

  files['package.json'] = JSON.stringify(packageJson, null, 2)

  // Individual component files
  components.forEach(component => {
    const componentName = component.name.replace(/[^a-zA-Z0-9]/g, '')
    const fileName = `src/components/${componentName}.vue`
    
    let templateCode = component.code || '<!-- Component template not available -->'
    
    if (options.add_comments) {
      const header = `<!--
  ${component.name}
  ${component.description || 'Vue component'}
  
  Exported from Component Library
  Category: ${component.category}
  Framework: ${component.framework}
  Complexity: ${component.complexity_score}/5
  Performance Score: ${component.performance_score}/100
  Accessibility Score: ${component.accessibility_score}/100
-->

`
      templateCode = header + templateCode
    }

    const vueComponent = `<template>
${templateCode}
</template>

<script>
export default {
  name: '${componentName}',
  props: ${JSON.stringify(component.props || {}, null, options.minify_code ? 0 : 2)},
}
</script>

<style scoped>
/* Component styles would go here */
</style>`

    files[fileName] = vueComponent
    componentExports.push(`export { default as ${componentName} } from './components/${componentName}.vue';`)
  })

  // Main index file
  files['src/index.js'] = componentExports.join('\n') + '\n'

  // Add documentation
  if (options.include_documentation) {
    files['README.md'] = generateVueBundleReadme(components, metadata)
    files['COMPONENTS.md'] = generateComponentsIndex(components)
  }

  const bundle = {
    package_info: packageJson,
    files,
    instructions: generateUsageInstructions(components, 'vue-bundle'),
  }

  const content = JSON.stringify(bundle, null, options.minify_code ? 0 : 2)
  const totalSize = Object.values(files).reduce((sum, content) => sum + content.length, 0)

  return {
    content,
    content_type: 'application/json',
    filename: `${metadata.project_name || 'vue-components-bundle'}.json`,
    file_size: totalSize,
  }
}

// Export as Angular package
async function exportAsAngularPackage(components: any[], options: any, metadata: any) {
  const files: Record<string, string> = {}

  // Package.json
  const packageJson = {
    name: metadata.project_name?.toLowerCase().replace(/\s+/g, '-') || 'angular-component-bundle',
    version: metadata.version || '1.0.0',
    description: metadata.project_description || 'Angular component bundle exported from Component Library',
    license: metadata.license || 'MIT',
    repository: metadata.repository_url ? { type: 'git', url: metadata.repository_url } : undefined,
    keywords: metadata.keywords || ['angular', 'components', 'ui'],
    dependencies: extractAllDependencies(components, 'angular'),
    peerDependencies: {
      '@angular/core': '^12.0.0 || ^13.0.0 || ^14.0.0 || ^15.0.0',
    },
  }

  files['package.json'] = JSON.stringify(packageJson, null, 2)

  // Individual component files
  components.forEach(component => {
    const componentClassName = component.name.replace(/[^a-zA-Z0-9]/g, '')
    
    // TypeScript component
    const componentTS = `import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-${component.name.toLowerCase().replace(/\s+/g, '-')}',
  templateUrl: './${componentClassName.toLowerCase()}.component.html',
  styleUrls: ['./${componentClassName.toLowerCase()}.component.scss']
})
export class ${componentClassName}Component {
  ${Object.entries(component.props || {}).map(([key, value]) => 
    `@Input() ${key}: ${typeof value === 'string' ? 'string' : 'any'} = ${JSON.stringify(value)};`
  ).join('\n  ')}
}`

    // Template HTML
    const templateHTML = component.code || '<!-- Component template not available -->'

    // Styles SCSS
    const stylesSCSS = `/**
 * ${component.name} Styles
 * Generated from Component Library
 */

.${component.name.toLowerCase().replace(/\s+/g, '-')} {
  /* Component styles */
}`

    files[`src/lib/${componentClassName.toLowerCase()}/${componentClassName.toLowerCase()}.component.ts`] = componentTS
    files[`src/lib/${componentClassName.toLowerCase()}/${componentClassName.toLowerCase()}.component.html`] = templateHTML
    files[`src/lib/${componentClassName.toLowerCase()}/${componentClassName.toLowerCase()}.component.scss`] = stylesSCSS
  })

  // Public API index
  const publicApi = components.map(component => {
    const componentClassName = component.name.replace(/[^a-zA-Z0-9]/g, '')
    return `export * from './lib/${componentClassName.toLowerCase()}/${componentClassName.toLowerCase()}.component';`
  }).join('\n')

  files['src/public-api.ts'] = publicApi

  // Module file
  const moduleComponents = components.map(component => {
    const componentClassName = component.name.replace(/[^a-zA-Z0-9]/g, '')
    return componentClassName
  }).join(', ')

  files['src/lib/component-bundle.module.ts'] = `import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
${components.map(component => {
  const componentClassName = component.name.replace(/[^a-zA-Z0-9]/g, '')
  return `import { ${componentClassName}Component } from './${componentClassName.toLowerCase()}/${componentClassName.toLowerCase()}.component';`
}).join('\n')}

@NgModule({
  declarations: [
    ${moduleComponents}
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ${moduleComponents}
  ]
})
export class ComponentBundleModule { }`

  // Add documentation
  if (options.include_documentation) {
    files['README.md'] = generateAngularBundleReadme(components, metadata)
    files['COMPONENTS.md'] = generateComponentsIndex(components)
  }

  const bundle = {
    package_info: packageJson,
    files,
    instructions: generateUsageInstructions(components, 'angular-bundle'),
  }

  const content = JSON.stringify(bundle, null, options.minify_code ? 0 : 2)
  const totalSize = Object.values(files).reduce((sum, content) => sum + content.length, 0)

  return {
    content,
    content_type: 'application/json',
    filename: `${metadata.project_name || 'angular-components-bundle'}.json`,
    file_size: totalSize,
  }
}

// Export as TAR archive (placeholder)
async function exportAsTarArchive(components: any[], options: any, metadata: any) {
  // Similar to ZIP but with TAR format
  return await exportAsZipArchive(components, options, { ...metadata, format: 'tar' })
}

// Helper functions
function groupDataByComponent(data: any[]): Map<string, any[]> {
  const grouped = new Map<string, any[]>()
  data.forEach(item => {
    const componentId = item.component_id
    if (!grouped.has(componentId)) {
      grouped.set(componentId, [])
    }
    grouped.get(componentId)!.push(item)
  })
  return grouped
}

function extractAllDependencies(components: any[], framework: string): Record<string, string> {
  const allDeps: Record<string, string> = {}
  
  // Add framework-specific base dependencies
  switch (framework.toLowerCase()) {
    case 'react':
      allDeps.react = '^18.0.0'
      allDeps['react-dom'] = '^18.0.0'
      allDeps['@types/react'] = '^18.0.0'
      allDeps['@types/react-dom'] = '^18.0.0'
      break
    case 'vue':
      allDeps.vue = '^3.0.0'
      break
    case 'angular':
      allDeps['@angular/core'] = '^15.0.0'
      allDeps['@angular/common'] = '^15.0.0'
      break
  }

  // Collect dependencies from all components
  components.forEach(component => {
    component.dependencies?.forEach((dep: any) => {
      const packageName = dep.depends_on?.name?.toLowerCase().replace(/\s+/g, '-') || 'unknown'
      allDeps[packageName] = dep.version_range || '^1.0.0'
    })
  })

  return allDeps
}

function generateBulkReadme(components: any[], metadata: any): string {
  return `# ${metadata.project_name || 'Component Bundle'}

${metadata.project_description || 'Component bundle exported from Component Library'}

## Components

This bundle contains ${components.length} components:

${components.map(c => `- **${c.name}** (${c.category}, ${c.framework})`).join('\n')}

## Usage

1. Extract the ZIP file
2. Navigate to the components directory
3. Import components as needed in your project

## Categories

${[...new Set(components.map(c => c.category))].map(cat => `- ${cat}`).join('\n')}

## Frameworks

${[...new Set(components.map(c => c.framework))].map(fw => `- ${fw}`).join('\n')}

## License

${metadata.license || 'MIT'}

Generated on ${new Date().toISOString()}
Exported from Component Library`
}

function generateBulkChangelog(components: any[]): string {
  return `# Changelog

All notable changes to this component bundle will be documented in this file.

## [1.0.0] - ${new Date().toISOString().split('T')[0]}

### Added
${components.map(c => `- Initial release of ${c.name} component`).join('\n')}

### Components by Category
${[...new Set(components.map(c => c.category))].map(cat => {
  const catComponents = components.filter(c => c.category === cat)
  return `#### ${cat}\n${catComponents.map(c => `- ${c.name}`).join('\n')}`
}).join('\n\n')}`
}

function generateComponentsIndex(components: any[]): string {
  const categories = [...new Set(components.map(c => c.category))]
  
  return `# Component Index

## Components by Category

${categories.map(category => {
  const catComponents = components.filter(c => c.category === category)
  return `### ${category}

${catComponents.map(component => {
  const componentName = component.name.toLowerCase().replace(/\s+/g, '-')
  return `- **${component.name}** (\`${componentName}\`)
  - Framework: ${component.framework}
  - Complexity: ${component.complexity_score}/5
  - Performance: ${component.performance_score}/100
  - Accessibility: ${component.accessibility_score}/100
  - Usage Count: ${component.usage_count || 0}
  - Rating: ${component.rating ? component.rating.toFixed(1) + '★' : 'No rating'}
  ${component.description ? `- ${component.description}` : ''}`
}).join('\n\n')}`
}).join('\n\n')}

## Summary

- **Total Components**: ${components.length}
- **Categories**: ${categories.length}
- **Total Usage**: ${components.reduce((sum, c) => sum + (c.usage_count || 0), 0)}
- **Average Rating**: ${components.filter(c => c.rating).length > 0 
  ? (components.filter(c => c.rating).reduce((sum, c) => sum + (c.rating || 0), 0) / components.filter(c => c.rating).length).toFixed(1) + '★' 
  : 'No ratings'}
`
}

function generateReactBundleReadme(components: any[], metadata: any): string {
  return `# ${metadata.project_name || 'React Component Bundle'}

${metadata.project_description || 'React component bundle exported from Component Library'}

## Installation

\`\`\`bash
npm install ${metadata.project_name?.toLowerCase().replace(/\s+/g, '-')}
\`\`\`

## Usage

\`\`\`jsx
import React from 'react';
${components.slice(0, 3).map(component => {
  const componentName = component.name.replace(/[^a-zA-Z0-9]/g, '')
  return `import { ${componentName} } from '${metadata.project_name?.toLowerCase().replace(/\s+/g, '-')}';`
}).join('\n')}

function App() {
  return (
    <div>
      ${components.slice(0, 3).map(component => {
        const componentName = component.name.replace(/[^a-zA-Z0-9]/g, '')
        return `<${componentName} />`
      }).join('\n      ')}
    </div>
  );
}
\`\`\`

## Available Components

${components.map((c, index) => `${index + 1}. **${c.name}** - ${c.description || 'React component'}`).join('\n')}

## Component Details

${components.map(c => {
  const componentName = c.name.replace(/[^a-zA-Z0-9]/g, '')
  return `### ${c.name}

\`\`\`jsx
import { ${componentName} } from '${metadata.project_name?.toLowerCase().replace(/\s+/g, '-')}';

<${componentName} 
  ${Object.entries(c.props || {}).slice(0, 3).map(([key]) => `${key}={value}`).join('\n  ')}
/>
\`\`\`

- **Category**: ${c.category}
- **Framework**: ${c.framework}
- **Complexity**: ${c.complexity_score}/5
- **Performance Score**: ${c.performance_score}/100
- **Accessibility Score**: ${c.accessibility_score}/100
- **Usage Count**: ${c.usage_count || 0}
- **Rating**: ${c.rating ? c.rating.toFixed(1) + '★' : 'No rating'}
`
}).join('\n')}

## Development

\`\`\`bash
# Install dependencies
npm install

# Build the bundle
npm run build

# Run tests
npm test

# Lint code
npm run lint
\`\`\`

## Bundle Statistics

- **Total Components**: ${components.length}
- **Categories**: ${[...new Set(components.map(c => c.category))].length}
- **Frameworks**: ${[...new Set(components.map(c => c.framework))].length}
- **Total Usage**: ${components.reduce((sum, c) => sum + (c.usage_count || 0), 0)}

## License

${metadata.license || 'MIT'}

Generated on ${new Date().toISOString()} from Component Library`
}

function generateVueBundleReadme(components: any[], metadata: any): string {
  return `# ${metadata.project_name || 'Vue Component Bundle'}

${metadata.project_description || 'Vue component bundle exported from Component Library'}

## Installation

\`\`\`bash
npm install ${metadata.project_name?.toLowerCase().replace(/\s+/g, '-')}
\`\`\`

## Usage

\`\`\`vue
<template>
  <div>
    ${components.slice(0, 3).map(component => {
      const componentName = component.name.replace(/[^a-zA-Z0-9]/g, '')
      return `<${componentName} />`
    }).join('\n    ')}
  </div>
</template>

<script>
import { 
${components.slice(0, 3).map(component => {
  const componentName = component.name.replace(/[^a-zA-Z0-9]/g, '')
  return `  ${componentName}`
}).join(',\n')}
} from '${metadata.project_name?.toLowerCase().replace(/\s+/g, '-')}'

export default {
  components: {
${components.slice(0, 3).map(component => {
  const componentName = component.name.replace(/[^a-zA-Z0-9]/g, '')
  return `    ${componentName}`
}).join(',\n')}
  }
}
</script>
\`\`\`

## Available Components

${components.map((c, index) => `${index + 1}. **${c.name}** - ${c.description || 'Vue component'}`).join('\n')}

## Component Details

${components.map(c => {
  const componentName = c.name.replace(/[^a-zA-Z0-9]/g, '')
  return `### ${c.name}

\`\`\`vue
<template>
  <${componentName} 
    ${Object.entries(c.props || {}).slice(0, 3).map(([key]) => `${key}="${key}"`).join('\n    ')}
  />
</template>

<script>
import { ${componentName} } from '${metadata.project_name?.toLowerCase().replace(/\s+/g, '-')}'

export default {
  components: {
    ${componentName}
  }
}
</script>
\`\`\`

- **Category**: ${c.category}
- **Framework**: ${c.framework}
- **Complexity**: ${c.complexity_score}/5
- **Performance Score**: ${c.performance_score}/100
- **Accessibility Score**: ${c.accessibility_score}/100
`
}).join('\n')}

## License

${metadata.license || 'MIT'}

Generated on ${new Date().toISOString()} from Component Library`
}

function generateAngularBundleReadme(components: any[], metadata: any): string {
  return `# ${metadata.project_name || 'Angular Component Bundle'}

${metadata.project_description || 'Angular component bundle exported from Component Library'}

## Installation

1. Copy the component bundle files to your Angular project
2. Update your module imports

## Module Setup

\`\`\`typescript
import { ComponentBundleModule } from 'component-bundle';

@NgModule({
  imports: [
    ComponentBundleModule,
    // ... other imports
  ],
  // ...
})
export class AppModule { }
\`\`\`

## Usage

\`\`\`html
${components.slice(0, 3).map(component => {
  const componentTag = `app-${component.name.toLowerCase().replace(/\s+/g, '-')}`
  return `<${componentTag}></${componentTag}>`
}).join('\n')}
\`\`\`

## Available Components

${components.map((c, index) => `${index + 1}. **${c.name}** - ${c.description || 'Angular component'}`).join('\n')}

## Component Reference

${components.map(c => {
  const componentClassName = c.name.replace(/[^a-zA-Z0-9]/g, '')
  const selector = `app-${c.name.toLowerCase().replace(/\s+/g, '-')}`
  return `### ${c.name}

**Selector**: \`${selector}\`

\`\`\`typescript
import { ${componentClassName}Component } from 'component-bundle';

@Component({
  selector: '${selector}',
  templateUrl: './your-template.html',
  styleUrls: ['./your-styles.css']
})
export class YourComponent {
  ${Object.entries(c.props || {}).map(([key, value]) => 
    `${key}: ${typeof value === 'string' ? 'string' : 'any'} = ${JSON.stringify(value)};`
  ).join('\n  ')}
}
\`\`\`

**Properties**:

${Object.entries(c.props || {}).map(([key, value]) => `- **${key}**: ${typeof value === 'string' ? 'string' : 'any'} (default: ${JSON.stringify(value)})`).join('\n')}

- **Category**: ${c.category}
- **Complexity**: ${c.complexity_score}/5
- **Performance Score**: ${c.performance_score}/100
- **Accessibility Score**: ${c.accessibility_score}/100
`
}).join('\n')}

## License

${metadata.license || 'MIT'}

Generated on ${new Date().toISOString()} from Component Library`
}

function generateUsageInstructions(components: any[], format: string): string {
  return `## Usage Instructions for ${format}

1. Extract the exported files
2. Install any required dependencies
3. Import components according to your framework
4. Use components in your application

For detailed usage instructions, see the README.md file.

Total components: ${components.length}
Categories: ${[...new Set(components.map(c => c.category))].join(', ')}
`
}

async function logBulkExport(supabase: any, data: any) {
  try {
    const { error } = await supabase
      .from('export_analytics')
      .insert({
        ...data,
        export_type: 'bulk',
        created_at: new Date().toISOString(),
      })

    if (error) {
      console.warn('Failed to log bulk export analytics:', error)
    }
  } catch (error) {
    console.warn('Error logging bulk export analytics:', error)
  }
}