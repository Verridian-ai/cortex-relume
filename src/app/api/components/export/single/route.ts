import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { componentDatabaseHelpers } from '@/lib/supabase/components'
import { z } from 'zod'

const singleExportSchema = z.object({
  component_id: z.string().uuid('Valid component ID is required'),
  format: z.enum(['json', 'react', 'vue', 'angular', 'html', 'css', 'figma', 'svg']),
  options: z.object({
    include_dependencies: z.boolean().default(true),
    include_variants: z.boolean().default(true),
    include_metadata: z.boolean().default(true),
    minify_code: z.boolean().default(false),
    add_comments: z.boolean().default(true),
    framework_version: z.string().optional(),
    export_structure: z.enum(['flat', 'hierarchical']).default('flat'),
    responsive: z.boolean().default(false),
    dark_mode: z.boolean().default(false),
  }).optional(),
  metadata: z.object({
    project_name: z.string().optional(),
    project_description: z.string().optional(),
    author: z.string().optional(),
    version: z.string().optional(),
    license: z.string().optional(),
  }).optional(),
})

// Rate limiting for single exports
const singleExportRateLimitMap = new Map<string, { count: number; resetTime: number }>()
const SINGLE_EXPORT_RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const SINGLE_EXPORT_RATE_LIMIT_MAX_REQUESTS = 10 // 10 exports per minute

function checkSingleExportRateLimit(identifier: string): boolean {
  const now = Date.now()
  const limit = singleExportRateLimitMap.get(identifier)
  
  if (!limit || now > limit.resetTime) {
    singleExportRateLimitMap.set(identifier, { count: 1, resetTime: now + SINGLE_EXPORT_RATE_LIMIT_WINDOW })
    return true
  }
  
  if (limit.count >= SINGLE_EXPORT_RATE_LIMIT_MAX_REQUESTS) {
    return false
  }
  
  limit.count++
  return true
}

// POST /api/components/export/single - Export single component
export async function POST(request: NextRequest) {
  try {
    // Get authentication
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    // Rate limiting (allow limited anonymous exports)
    const rateLimitKey = user ? `user:${user.id}` : `ip:${request.headers.get('x-forwarded-for') || 'anonymous'}`
    
    if (!checkSingleExportRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { 
          error: 'Export rate limit exceeded. Please try again later.',
          success: false,
          retry_after: 60,
        },
        { status: 429 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = singleExportSchema.parse(body)

    const { component_id, format, options = {}, metadata = {} } = validatedData

    // Get component details with related data
    const componentResult = await componentDatabaseHelpers.components.getById(component_id)

    if (!componentResult.success || !componentResult.data) {
      return NextResponse.json(
        { error: componentResult.error?.message || 'Component not found', success: false },
        { status: 404 }
      )
    }

    const component = componentResult.data

    // Check access permissions
    if (!component.is_public && component.author_id !== user?.id) {
      return NextResponse.json(
        { error: 'Access denied to this component', success: false },
        { status: 403 }
      )
    }

    // Get additional data if needed
    const [variantsResult, dependenciesResult] = await Promise.all([
      (options as any).include_variants 
        ? componentDatabaseHelpers.variants.getByComponentId(component_id)
        : Promise.resolve({ success: true, data: [] }),
      (options as any).include_dependencies
        ? componentDatabaseHelpers.dependencies.getByComponentId(component_id)
        : Promise.resolve({ success: true, data: [] }),
    ])

    // Perform the export based on format
    const exportParams = {
      component,
      variants: variantsResult.success ? variantsResult.data : [],
      dependencies: dependenciesResult.success ? dependenciesResult.data : [],
      format,
      options,
      metadata,
      ...(user?.id ? { userId: user.id } : {}),
    }

    const exportResult = await performSingleComponentExport(exportParams)

    if (!exportResult.success) {
      return NextResponse.json(
        { error: exportResult.error || 'Export failed', success: false },
        { status: 500 }
      )
    }

    // Log the export for analytics
    await logSingleExport(supabase, {
      component_id,
      format,
      user_id: user?.id,
      options,
      file_size: exportResult.data?.file_size || 0,
      export_duration: exportResult.data?.export_duration || 0,
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
        'X-Export-Duration': (exportResult.data?.export_duration || 0).toString(),
      },
    })

  } catch (error: any) {
    console.error('Error in single component export:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid export parameters',
          details: error.errors,
          success: false 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Single export service temporarily unavailable',
        message: error.message,
        success: false 
      },
      { status: 503 }
    )
  }
}

// Perform the actual single component export
async function performSingleComponentExport(params: {
  component: any,
  variants: any[],
  dependencies: any[],
  format: string,
  options: any,
  metadata: any,
  userId?: string,
}) {
  const startTime = Date.now()

  try {
    const { component, variants, dependencies, format, options, metadata } = params

    let exportData

    switch (format.toLowerCase()) {
      case 'json':
        exportData = await exportAsComprehensiveJSON(component, variants, dependencies, options, metadata)
        break
      case 'react':
        exportData = await exportAsReactComponent(component, variants, dependencies, options, metadata)
        break
      case 'vue':
        exportData = await exportAsVueComponent(component, variants, dependencies, options, metadata)
        break
      case 'angular':
        exportData = await exportAsAngularComponent(component, variants, dependencies, options, metadata)
        break
      case 'html':
        exportData = await exportAsHTMLSnippet(component, options, metadata)
        break
      case 'css':
        exportData = await exportAsCSSStyles(component, options, metadata)
        break
      case 'figma':
        exportData = await exportAsFigmaDesign(component, variants, options, metadata)
        break
      case 'svg':
        exportData = await exportAsSVGGraphic(component, options, metadata)
        break
      default:
        return {
          success: false,
          error: `Unsupported export format: ${format}`,
        }
    }

    const endTime = Date.now()
    const exportDuration = endTime - startTime

    return {
      success: true,
      data: {
        ...exportData,
        export_duration: exportDuration,
      },
    }

  } catch (error: any) {
    console.error('Error in performSingleComponentExport:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Export as comprehensive JSON
async function exportAsComprehensiveJSON(component: any, variants: any[], dependencies: any[], options: any, metadata: any) {
  const exportData = {
    component: {
      ...component,
      variants: options.include_variants ? variants : undefined,
      dependencies: options.include_dependencies ? dependencies : undefined,
    },
    export_info: {
      exported_at: new Date().toISOString(),
      format: 'json',
      version: '1.0.0',
      options: {
        ...options,
        include_variants: options.include_variants,
        include_dependencies: options.include_dependencies,
        include_metadata: options.include_metadata,
        minify_code: options.minify_code,
      },
      metadata,
      user_agent: 'Component Library Exporter',
    },
    usage_instructions: generateUsageInstructions(component, 'json'),
  }

  // Minify if requested
  let content = JSON.stringify(exportData, null, options.minify_code ? 0 : 2)
  if (options.minify_code) {
    content = JSON.stringify(exportData)
  }

  const filename = `${component.name.toLowerCase().replace(/\s+/g, '-')}-complete.json`

  return {
    content,
    content_type: 'application/json',
    filename,
    file_size: content.length,
  }
}

// Export as React component
async function exportAsReactComponent(component: any, variants: any[], dependencies: any[], options: any, metadata: any) {
  const componentName = component.name.replace(/[^a-zA-Z0-9]/g, '')
  const componentFileName = `${componentName}.tsx`

  // Process the main code
  let processedCode = component.code || '// Component code not available'
  
  if (options.minify_code) {
    // Basic minification (remove comments and extra whitespace)
    processedCode = processedCode
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      .replace(/\n\s*\n/g, '\n')
      .trim()
  } else if (options.add_comments) {
    // Add comprehensive header comments
    const header = `/**
 * ${component.name}
 * ${component.description || 'Generated React component'}
 * 
 * Exported from Component Library on ${new Date().toISOString()}
 * Framework: React ${options.framework_version || '18.0'}
 * Category: ${component.category}
 * Complexity: ${component.complexity_score}/5
 * Performance Score: ${component.performance_score}/100
 * Accessibility Score: ${component.accessibility_score}/100
 * Tags: ${component.tags?.join(', ') || 'None'}
 * ${metadata.project_name ? `Project: ${metadata.project_name}` : ''}
 * ${metadata.author ? `Author: ${metadata.author}` : ''}
 * ${metadata.version ? `Version: ${metadata.version}` : ''}
 * ${metadata.license ? `License: ${metadata.license}` : ''}
 */

`
    processedCode = header + processedCode
  }

  // Add TypeScript interfaces if props exist
  let tsInterfaces = ''
  if (component.props && Object.keys(component.props).length > 0) {
    const propsTypeName = `${componentName}Props`
    tsInterfaces = `
interface ${propsTypeName} {
${Object.entries(component.props).map(([key, value]) => `  ${key}: ${typeof value === 'string' ? 'string' : 'any'};`).join('\n')}
}

// Usage: <${componentName} {...props} />
`
  }

  // Add export statement
  const exportStatement = `\nexport default ${componentName};`

  // Create the complete component
  const reactComponent = tsInterfaces + processedCode + exportStatement

  // Create additional files for a complete React package
  const files: Record<string, string> = {}
  files[componentFileName] = reactComponent

  // Add index file
  files['index.ts'] = `export { default } from './${componentFileName.replace('.tsx', '')}';`

  // Add package.json for the component
  files['package.json'] = JSON.stringify({
    name: component.name.toLowerCase().replace(/\s+/g, '-'),
    version: metadata.version || '1.0.0',
    description: component.description || `React component: ${component.name}`,
    main: 'index.ts',
    types: 'index.ts',
    license: metadata.license || 'MIT',
    dependencies: generateDependencyList(dependencies, 'react'),
    peerDependencies: {
      react: options.framework_version || '^18.0.0',
      'react-dom': options.framework_version || '^18.0.0',
    },
  }, null, 2)

  // Add README
  files['README.md'] = `# ${component.name}

${component.description || 'Generated React component'}

## Installation

\`\`\`bash
npm install ${component.name.toLowerCase().replace(/\s+/g, '-')}
\`\`\`

## Usage

\`\`\`jsx
import ${componentName} from '${component.name.toLowerCase().replace(/\s+/g, '-')}';

function App() {
  return (
    <${componentName} 
      ${Object.entries(component.props || {}).map(([key]) => `${key}={value}`).join('\n      ')}
    />
  );
}
\`\`\`

## Props

${Object.entries(component.props || {}).map(([key, value]) => `- **${key}**: ${typeof value === 'string' ? 'string' : 'any'}`).join('\n')}

## Props Interface

\`\`\`typescript
${tsInterfaces}
\`\`\`

## Development

\`\`\`bash
npm install
npm run build
npm run test
\`\`\`

## License

${metadata.license || 'MIT'}

---

Generated from Component Library on ${new Date().toISOString()}
`

  // If multiple files, create a ZIP-like structure in JSON
  const completePackage = {
    component: component,
    files,
    instructions: generateUsageInstructions(component, 'react'),
    variants: options.include_variants ? variants : undefined,
  }

  const content = JSON.stringify(completePackage, null, options.minify_code ? 0 : 2)

  return {
    content,
    content_type: 'application/json',
    filename: `${component.name.toLowerCase().replace(/\s+/g, '-')}-react-package.json`,
    file_size: content.length,
  }
}

// Export as Vue component
async function exportAsVueComponent(component: any, variants: any[], dependencies: any[], options: any, metadata: any) {
  const componentName = component.name.replace(/[^a-zA-Z0-9]/g, '')
  const componentFileName = `${componentName}.vue`

  // Process template code
  let templateCode = component.code || '<!-- Component template not available -->'
  
  if (options.minify_code) {
    templateCode = templateCode
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\n\s*\n/g, '\n')
      .trim()
  } else if (options.add_comments) {
    const header = `<!--
  ${component.name}
  ${component.description || 'Generated Vue component'}
  
  Exported from Component Library on ${new Date().toISOString()}
  Framework: Vue ${options.framework_version || '3.0'}
  Category: ${component.category}
  Complexity: ${component.complexity_score}/5
  Performance Score: ${component.performance_score}/100
  Accessibility Score: ${component.accessibility_score}/100
  Tags: ${component.tags?.join(', ') || 'None'}
  ${metadata.project_name ? `Project: ${metadata.project_name}` : ''}
  ${metadata.author ? `Author: ${metadata.author}` : ''}
  ${metadata.version ? `Version: ${metadata.version}` : ''}
  ${metadata.license ? `License: ${metadata.license}` : ''}
-->

`
    templateCode = header + templateCode
  }

  // Generate Vue SFC
  const vueSFC = `<template>
${templateCode}
</template>

<script>
export default {
  name: '${componentName}',
  props: ${JSON.stringify(component.props || {}, null, options.minify_code ? 0 : 2)},
  ${options.add_comments ? `// Exported from Component Library on ${new Date().toISOString()}` : ''}
}
</script>

<style scoped>
/* Component styles would go here */
/* Consider using CSS modules or scoped styles for better encapsulation */
</style>`

  // Create complete package
  const completePackage = {
    component,
    files: {
      [componentFileName]: vueSFC,
      'README.md': generateVueReadme(component, componentName, metadata),
      'package.json': JSON.stringify({
        name: component.name.toLowerCase().replace(/\s+/g, '-'),
        version: metadata.version || '1.0.0',
        description: component.description || `Vue component: ${component.name}`,
        main: componentFileName,
        license: metadata.license || 'MIT',
        dependencies: generateDependencyList(dependencies, 'vue'),
        peerDependencies: {
          vue: options.framework_version || '^3.0.0',
        },
      }, null, 2),
    },
    instructions: generateUsageInstructions(component, 'vue'),
    variants: options.include_variants ? variants : undefined,
  }

  const content = JSON.stringify(completePackage, null, options.minify_code ? 0 : 2)

  return {
    content,
    content_type: 'application/json',
    filename: `${component.name.toLowerCase().replace(/\s+/g, '-')}-vue-package.json`,
    file_size: content.length,
  }
}

// Export as Angular component
async function exportAsAngularComponent(component: any, variants: any[], dependencies: any[], options: any, metadata: any) {
  const componentClassName = component.name.replace(/[^a-zA-Z0-9]/g, '')
  
  // Component TypeScript file
  const componentTS = `import { Component, Input } from '@angular/core';

${options.add_comments ? `/**
 * ${component.name}
 * ${component.description || 'Generated Angular component'}
 * 
 * Exported from Component Library on ${new Date().toISOString()}
 * Framework: Angular ${options.framework_version || '15.0'}
 * Category: ${component.category}
 * Complexity: ${component.complexity_score}/5
 * Performance Score: ${component.performance_score}/100
 * Accessibility Score: ${component.accessibility_score}/100
 * Tags: ${component.tags?.join(', ') || 'None'}
 * ${metadata.project_name ? `Project: ${metadata.project_name}` : ''}
 * ${metadata.author ? `Author: ${metadata.author}` : ''}
 * ${metadata.version ? `Version: ${metadata.version}` : ''}
 * ${metadata.license ? `License: ${metadata.license}` : ''}
 */` : ''}

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

  // SCSS styles
  const stylesSCSS = `/**
 * ${component.name} Styles
 * Generated from Component Library
 * 
 * Component: ${component.name}
 * Category: ${component.category}
 * Performance Score: ${component.performance_score}/100
 * Accessibility Score: ${component.accessibility_score}/100
 */

.${component.name.toLowerCase().replace(/\s+/g, '-')} {
  /* Component styles */
}`

  // Create complete package
  const completePackage = {
    component,
    files: {
      [`${componentClassName.toLowerCase()}.component.ts`]: componentTS,
      [`${componentClassName.toLowerCase()}.component.html`]: templateHTML,
      [`${componentClassName.toLowerCase()}.component.scss`]: stylesSCSS,
      'README.md': generateAngularReadme(component, componentClassName, metadata),
      'package.json': JSON.stringify({
        name: component.name.toLowerCase().replace(/\s+/g, '-'),
        version: metadata.version || '1.0.0',
        description: component.description || `Angular component: ${component.name}`,
        license: metadata.license || 'MIT',
        dependencies: generateDependencyList(dependencies, 'angular'),
      }, null, 2),
    },
    instructions: generateUsageInstructions(component, 'angular'),
    variants: options.include_variants ? variants : undefined,
  }

  const content = JSON.stringify(completePackage, null, options.minify_code ? 0 : 2)

  return {
    content,
    content_type: 'application/json',
    filename: `${component.name.toLowerCase().replace(/\s+/g, '-')}-angular-package.json`,
    file_size: content.length,
  }
}

// Export as HTML snippet
async function exportAsHTMLSnippet(component: any, options: any, metadata: any) {
  let htmlCode = component.code || '<!-- Component HTML not available -->'

  if (options.minify_code) {
    htmlCode = htmlCode
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\n\s*\n/g, '\n')
      .trim()
  } else if (options.add_comments) {
    const comment = `<!--
  ${component.name}
  ${component.description || 'Generated HTML component'}
  
  Exported from Component Library on ${new Date().toISOString()}
  Framework: HTML
  Category: ${component.category}
  Tags: ${component.tags?.join(', ') || 'None'}
  Accessibility Score: ${component.accessibility_score}/100
  ${metadata.author ? `Author: ${metadata.author}` : ''}
  ${metadata.license ? `License: ${metadata.license}` : ''}
-->

`
    htmlCode = comment + htmlCode
  }

  // Add responsive classes if requested
  if (options.responsive) {
    htmlCode = htmlCode.replace(
      /class="([^"]*)"/g,
      'class="$1 responsive-component"'
    )
  }

  // Add dark mode support if requested
  if (options.dark_mode) {
    htmlCode = htmlCode.replace(
      /class="([^"]*)"/g,
      'class="$1 dark-mode-support"'
    )
  }

  return {
    content: htmlCode,
    content_type: 'text/html',
    filename: `${component.name.toLowerCase().replace(/\s+/g, '-')}.html`,
    file_size: htmlCode.length,
  }
}

// Export as CSS styles
async function exportAsCSSStyles(component: any, options: any, metadata: any) {
  const componentName = component.name.toLowerCase().replace(/\s+/g, '-')
  
  let cssCode = `/**
 * ${component.name} Styles
 * ${component.description || 'Generated CSS styles'}
 * 
 * Exported from Component Library on ${new Date().toISOString()}
 * Framework: CSS
 * Category: ${component.category}
 * Performance Score: ${component.performance_score}/100
 * Accessibility Score: ${component.accessibility_score}/100
 * Tags: ${component.tags?.join(', ') || 'None'}
 * ${metadata.author ? `Author: ${metadata.author}` : ''}
 * ${metadata.license ? `License: ${metadata.license}` : ''}
 */

.${componentName} {
  /* Main component styles */
}

/* Component elements */
.${componentName}__element {
  /* Element-specific styles */
}

/* Component modifiers */
.${componentName}--modifier {
  /* Modifier-specific styles */
}`

  if (options.minify_code) {
    cssCode = cssCode
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\n\s*\n/g, '\n')
      .trim()
  }

  // Add dark mode styles if requested
  if (options.dark_mode) {
    cssCode += `

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .${componentName} {
    /* Dark mode styles */
  }
}`

  }

  // Add responsive styles if requested
  if (options.responsive) {
    cssCode += `

/* Responsive styles */
@media (max-width: 768px) {
  .${componentName} {
    /* Mobile styles */
  }
}

@media (max-width: 480px) {
  .${componentName} {
    /* Small mobile styles */
  }
}`
  }

  return {
    content: cssCode,
    content_type: 'text/css',
    filename: `${componentName}.css`,
    file_size: cssCode.length,
  }
}

// Export as Figma design
async function exportAsFigmaDesign(component: any, variants: any[], options: any, metadata: any) {
  const figmaData = {
    component,
    design_specs: {
      name: component.name,
      description: component.description,
      preview_url: component.preview_url,
      category: component.category,
      tags: component.tags,
      accessibility_score: component.accessibility_score,
      performance_score: component.performance_score,
    },
    figma_nodes: [], // Would contain actual Figma node data
    variants: options.include_variants ? variants : undefined,
    export_info: {
      exported_at: new Date().toISOString(),
      format: 'figma',
      version: '1.0.0',
      options,
      metadata,
    },
  }

  const content = JSON.stringify(figmaData, null, options.minify_code ? 0 : 2)

  return {
    content,
    content_type: 'application/json',
    filename: `${component.name.toLowerCase().replace(/\s+/g, '-')}-figma.json`,
    file_size: content.length,
  }
}

// Export as SVG graphic
async function exportAsSVGGraphic(component: any, options: any, metadata: any) {
  // This would parse component code to extract SVG or generate SVG representation
  let svgCode = '<!-- SVG representation would be generated here -->'
  
  if (component.preview_url && component.preview_url.includes('svg')) {
    // If the component has an SVG preview, we could fetch it
    svgCode = `<!-- 
  ${component.name} SVG
  Generated from Component Library
  Category: ${component.category}
  Exported: ${new Date().toISOString()}
-->`
  }

  return {
    content: svgCode,
    content_type: 'image/svg+xml',
    filename: `${component.name.toLowerCase().replace(/\s+/g, '-')}.svg`,
    file_size: svgCode.length,
  }
}

// Helper functions
function generateDependencyList(dependencies: any[], framework: string): Record<string, string> {
  const depList: Record<string, string> = {}
  
  dependencies?.forEach(dep => {
    const packageName = dep.depends_on?.name?.toLowerCase().replace(/\s+/g, '-') || 'unknown'
    depList[packageName] = dep.version_range || '^1.0.0'
  })

  // Add framework-specific base dependencies
  switch (framework.toLowerCase()) {
    case 'react':
      depList.react = '^18.0.0'
      depList['react-dom'] = '^18.0.0'
      break
    case 'vue':
      depList.vue = '^3.0.0'
      break
    case 'angular':
      depList['@angular/core'] = '^15.0.0'
      break
  }

  return depList
}

function generateUsageInstructions(component: any, format: string): string {
  switch (format) {
    case 'json':
      return `To use this component data:
1. Parse the JSON file
2. Extract the component object
3. Access properties: component.name, component.code, etc.`
    case 'react':
      return `To use this React component:
1. Import the component: import ${component.name.replace(/[^a-zA-Z0-9]/g, '')} from './component'
2. Use in JSX: <${component.name.replace(/[^a-zA-Z0-9]/g, '')} {...props} />`
    case 'vue':
      return `To use this Vue component:
1. Import the component
2. Register it in your Vue app
3. Use in template: <${component.name.replace(/[^a-zA-Z0-9]/g, '')} {...props} />`
    case 'angular':
      return `To use this Angular component:
1. Import and declare in a module
2. Use in template: <app-${component.name.toLowerCase().replace(/\s+/g, '-')} {...props}></app-${component.name.toLowerCase().replace(/\s+/g, '-')}>`
    default:
      return 'Refer to the component documentation for usage instructions.'
  }
}

function generateVueReadme(component: any, componentName: string, metadata: any): string {
  return `# ${component.name}

${component.description || 'Generated Vue component'}

## Installation

\`\`\`bash
npm install ${component.name.toLowerCase().replace(/\s+/g, '-')}
\`\`\`

## Usage

\`\`\`vue
<template>
  <${componentName} 
    ${Object.entries(component.props || {}).map(([key]) => `${key}="${key}"`).join('\n    ')}
  />
</template>

<script>
import ${componentName} from '${component.name.toLowerCase().replace(/\s+/g, '-')}'

export default {
  components: {
    ${componentName}
  }
}
</script>
\`\`\`

## Props

${Object.entries(component.props || {}).map(([key, value]) => `- **${key}**: ${typeof value === 'string' ? 'string' : 'any'}`).join('\n')}

## License

${metadata.license || 'MIT'}

Generated from Component Library on ${new Date().toISOString()}`
}

function generateAngularReadme(component: any, componentClassName: string, metadata: any): string {
  return `# ${component.name}

${component.description || 'Generated Angular component'}

## Installation

1. Copy the component files to your Angular project
2. Import the component in your module:
\`\`\`typescript
import { ${componentClassName}Component } from './path/to/component';

@NgModule({
  declarations: [${componentClassName}Component],
  // ...
})
export class AppModule { }
\`\`\`

## Usage

\`\`\`html
<app-${component.name.toLowerCase().replace(/\s+/g, '-')} 
  ${Object.entries(component.props || {}).map(([key]) => `${key}="${key}"`).join('\n  ')}
></app-${component.name.toLowerCase().replace(/\s+/g, '-')}>
\`\`\`

## Props

${Object.entries(component.props || {}).map(([key, value]) => `- **${key}**: ${typeof value === 'string' ? 'string' : 'any'}`).join('\n')}

## License

${metadata.license || 'MIT'}

Generated from Component Library on ${new Date().toISOString()}`
}

async function logSingleExport(supabase: any, data: any) {
  try {
    const { error } = await supabase
      .from('export_analytics')
      .insert({
        ...data,
        export_type: 'single',
        created_at: new Date().toISOString(),
      })

    if (error) {
      console.warn('Failed to log single export analytics:', error)
    }
  } catch (error) {
    console.warn('Error logging single export analytics:', error)
  }
}