import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { componentDatabaseHelpers } from '@/lib/supabase/components'
import { componentExportHelpers } from '@/lib/export/component-exporter'
import { z } from 'zod'

const exportSchema = z.object({
  component_ids: z.array(z.string().uuid()).min(1, 'At least one component ID is required'),
  format: z.enum(['json', 'zip', 'react', 'vue', 'angular', 'html', 'css', 'figma']),
  options: z.object({
    include_dependencies: z.boolean().default(true),
    include_variants: z.boolean().default(true),
    include_metadata: z.boolean().default(true),
    minify_code: z.boolean().default(false),
    add_comments: z.boolean().default(true),
    framework_version: z.string().optional(),
    export_structure: z.enum(['flat', 'hierarchical']).default('flat'),
  }).optional(),
  metadata: z.object({
    project_name: z.string().optional(),
    project_description: z.string().optional(),
    author: z.string().optional(),
    version: z.string().optional(),
  }).optional(),
})

// Rate limiting for export operations
const exportRateLimitMap = new Map<string, { count: number; resetTime: number }>()
const EXPORT_RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const EXPORT_RATE_LIMIT_MAX_REQUESTS = 5 // 5 exports per minute

function checkExportRateLimit(identifier: string): boolean {
  const now = Date.now()
  const limit = exportRateLimitMap.get(identifier)
  
  if (!limit || now > limit.resetTime) {
    exportRateLimitMap.set(identifier, { count: 1, resetTime: now + EXPORT_RATE_LIMIT_WINDOW })
    return true
  }
  
  if (limit.count >= EXPORT_RATE_LIMIT_MAX_REQUESTS) {
    return false
  }
  
  limit.count++
  return true
}

// POST /api/components/export - General export endpoint
export async function POST(request: NextRequest) {
  try {
    // Get authentication
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required for exports', success: false },
        { status: 401 }
      )
    }

    // Rate limiting
    const rateLimitKey = `user:${user.id}`
    if (!checkExportRateLimit(rateLimitKey)) {
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
    const validatedData = exportSchema.parse(body)

    // Determine export type based on component count
    const isBulkExport = validatedData.component_ids.length > 1

    // Route to appropriate handler
    if (isBulkExport) {
      return handleBulkExport(request, validatedData, user.id)
    } else {
      return handleSingleExport(request, validatedData, user.id)
    }

  } catch (error: any) {
    console.error('Error in export endpoint:', error)
    
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
        error: 'Export service temporarily unavailable',
        message: error.message,
        success: false 
      },
      { status: 503 }
    )
  }
}

// Handle single component export
async function handleSingleExport(request: NextRequest, data: any, userId: string) {
  try {
    const { component_ids, format, options = {}, metadata = {} } = data
    const componentId = component_ids[0]

    const supabase = createRouteHandlerClient({ cookies })

    // Verify component access
    const { data: component, error: componentError } = await supabase
      .from('components')
      .select('*')
      .eq('id', componentId)
      .single()

    if (componentError || !component) {
      return NextResponse.json(
        { error: 'Component not found', success: false },
        { status: 404 }
      )
    }

    // Check permissions
    if (!component.is_public && component.author_id !== userId) {
      return NextResponse.json(
        { error: 'Access denied to component', success: false },
        { status: 403 }
      )
    }

    // Export the component
    const exportResult = await performComponentExport(component, format, options, metadata)

    if (!exportResult.success) {
      return NextResponse.json(
        { error: exportResult.error || 'Export failed', success: false },
        { status: 500 }
      )
    }

    // Log export for analytics
    await logExportAnalytics(supabase, {
      component_id: componentId,
      format,
      user_id: userId,
      export_type: 'single',
      file_size: exportResult.data?.file_size || 0,
    })

    return new NextResponse(exportResult.data.content, {
      status: 200,
      headers: {
        'Content-Type': exportResult.data.content_type,
        'Content-Disposition': `attachment; filename="${exportResult.data.filename}"`,
        'Content-Length': exportResult.data.content.length.toString(),
        'X-Export-Success': 'true',
        'X-Export-Format': format,
        'X-Export-Size': exportResult.data.file_size.toString(),
      },
    })

  } catch (error: any) {
    console.error('Error in single export:', error)
    return NextResponse.json(
      { 
        error: 'Single export failed',
        message: error.message,
        success: false 
      },
      { status: 500 }
    )
  }
}

// Handle bulk component export
async function handleBulkExport(request: NextRequest, data: any, userId: string) {
  try {
    const { component_ids, format, options = {}, metadata = {} } = data

    const supabase = createRouteHandlerClient({ cookies })

    // Verify all components exist and are accessible
    const { data: components, error: componentsError } = await supabase
      .from('components')
      .select('*')
      .in('id', component_ids)
      .or(`is_public.eq.true,author_id.eq.${userId}`)

    if (componentsError) {
      return NextResponse.json(
        { error: 'Failed to fetch components', success: false },
        { status: 500 }
      )
    }

    if (!components || components.length !== component_ids.length) {
      return NextResponse.json(
        { error: 'Some components not found or access denied', success: false },
        { status: 404 }
      )
    }

    // For bulk exports, prefer ZIP format
    const exportFormat = format === 'json' ? 'zip' : format

    // Perform bulk export
    const exportResult = await componentDatabaseHelpers.export.exportComponents(
      component_ids,
      exportFormat.toUpperCase() as any
    )

    if (!exportResult.success) {
      return NextResponse.json(
        { error: exportResult.error || 'Bulk export failed', success: false },
        { status: 500 }
      )
    }

    // Additional processing based on format
    let finalContent = exportResult.data
    let contentType = 'application/zip'
    let filename = `components-export-${Date.now()}.zip`

    if (format === 'json') {
      finalContent = JSON.stringify(exportResult.data, null, 2)
      contentType = 'application/json'
      filename = `components-export-${Date.now()}.json`
    }

    // Log export for analytics
    await logExportAnalytics(supabase, {
      component_ids,
      format,
      user_id: userId,
      export_type: 'bulk',
      file_size: finalContent.length,
    })

    return new NextResponse(finalContent, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': finalContent.length.toString(),
        'X-Export-Success': 'true',
        'X-Export-Format': format,
        'X-Export-Size': finalContent.length.toString(),
        'X-Export-Count': component_ids.length.toString(),
      },
    })

  } catch (error: any) {
    console.error('Error in bulk export:', error)
    return NextResponse.json(
      { 
        error: 'Bulk export failed',
        message: error.message,
        success: false 
      },
      { status: 500 }
    )
  }
}

// Perform individual component export
async function performComponentExport(
  component: any, 
  format: string, 
  options: any, 
  metadata: any
) {
  try {
    // Use the export helpers based on format
    switch (format.toLowerCase()) {
      case 'json':
        return await exportAsJSON(component, options, metadata)
      case 'react':
        return await exportAsReact(component, options, metadata)
      case 'vue':
        return await exportAsVue(component, options, metadata)
      case 'angular':
        return await exportAsAngular(component, options, metadata)
      case 'html':
        return await exportAsHTML(component, options, metadata)
      case 'css':
        return await exportAsCSS(component, options, metadata)
      case 'figma':
        return await exportAsFigma(component, options, metadata)
      default:
        return {
          success: false,
          error: `Unsupported export format: ${format}`,
        }
    }
  } catch (error: any) {
    console.error('Error performing component export:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Export as JSON
async function exportAsJSON(component: any, options: any, metadata: any) {
  const exportData = {
    component: {
      id: component.id,
      name: component.name,
      description: component.description,
      category: component.category,
      framework: component.framework,
      code: component.code,
      preview_url: component.preview_url,
      props: component.props,
      tags: component.tags,
      complexity_score: component.complexity_score,
      performance_score: component.performance_score,
      accessibility_score: component.accessibility_score,
    },
    metadata: {
      exported_at: new Date().toISOString(),
      format: 'json',
      version: '1.0.0',
      options,
      ...metadata,
    },
  }

  const content = JSON.stringify(exportData, null, 2)
  
  return {
    success: true,
    data: {
      content,
      content_type: 'application/json',
      filename: `${component.name.toLowerCase().replace(/\s+/g, '-')}.json`,
      file_size: content.length,
    },
  }
}

// Export as React component
async function exportAsReact(component: any, options: any, metadata: any) {
  // Use the existing React exporter if available
  if (componentExportHelpers?.react) {
    return await componentExportHelpers.react.exportComponent(component, options)
  }

  // Fallback to basic React export
  const componentCode = component.code || '// Component code not available'
  const reactCode = `/**
 * ${component.name}
 * ${component.description || 'Generated React component'}
 * 
 * Exported from Component Library on ${new Date().toISOString()}
 * Framework: React
 * Complexity: ${component.complexity_score}/5
 * Performance Score: ${component.performance_score}/100
 * Accessibility Score: ${component.accessibility_score}/100
 */

${options.add_comments ? componentCode : componentCode.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')}

export default ${component.name.replace(/\s+/g, '')};`

  return {
    success: true,
    data: {
      content: reactCode,
      content_type: 'application/javascript',
      filename: `${component.name.replace(/\s+/g, '')}.jsx`,
      file_size: reactCode.length,
    },
  }
}

// Export as Vue component
async function exportAsVue(component: any, options: any, metadata: any) {
  const componentCode = component.code || '<!-- Component code not available -->'
  const vueCode = `<template>
${componentCode}
</template>

<script>
${options.add_comments ? `/**
 * ${component.name}
 * ${component.description || 'Generated Vue component'}
 * 
 * Exported from Component Library on ${new Date().toISOString()}
 * Framework: Vue
 * Complexity: ${component.complexity_score}/5
 * Performance Score: ${component.performance_score}/100
 * Accessibility Score: ${component.accessibility_score}/100
 */` : ''}
// Component logic would go here
export default {
  name: '${component.name.replace(/\s+/g, '')}',
  props: ${JSON.stringify(component.props || {}, null, 2)}
}
</script>

<style scoped>
/* Component styles would go here */
</style>`

  return {
    success: true,
    data: {
      content: vueCode,
      content_type: 'text/html',
      filename: `${component.name.replace(/\s+/g, '')}.vue`,
      file_size: vueCode.length,
    },
  }
}

// Export as Angular component
async function exportAsAngular(component: any, options: any, metadata: any) {
  const componentClassName = component.name.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')
  const componentCode = component.code || '<!-- Component template not available -->'
  
  const angularCode = `import { Component, Input } from '@angular/core';

${options.add_comments ? `/**
 * ${component.name}
 * ${component.description || 'Generated Angular component'}
 * 
 * Exported from Component Library on ${new Date().toISOString()}
 * Framework: Angular
 * Complexity: ${component.complexity_score}/5
 * Performance Score: ${component.performance_score}/100
 * Accessibility Score: ${component.accessibility_score}/100
 */` : ''}

@Component({
  selector: 'app-${component.name.toLowerCase().replace(/\s+/g, '-')}',
  templateUrl: './${componentClassName.toLowerCase()}.component.html',
  styleUrls: ['./${componentClassName.toLowerCase()}.component.scss']
})
export class ${componentClassName}Component {
  @Input() ${Object.keys(component.props || {}).map(prop => `${prop}: any`).join('; ') || 'data: any'};
}

// Template file: ${componentClassName}.component.html
${componentCode}

// Styles file: ${componentClassName}.component.scss
/* Component styles would go here */`

  return {
    success: true,
    data: {
      content: angularCode,
      content_type: 'application/javascript',
      filename: `${componentClassName}.component.ts`,
      file_size: angularCode.length,
    },
  }
}

// Export as HTML
async function exportAsHTML(component: any, options: any, metadata: any) {
  const componentCode = component.code || '<!-- Component code not available -->'
  const htmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${component.name}</title>
    ${options.add_comments ? `<!-- 
    ${component.name}
    ${component.description || 'Generated HTML component'}
    
    Exported from Component Library on ${new Date().toISOString()}
    Framework: HTML
    Category: ${component.category}
    Tags: ${component.tags?.join(', ') || 'None'}
    -->` : ''}
</head>
<body>
${componentCode}
</body>
</html>`

  return {
    success: true,
    data: {
      content: htmlCode,
      content_type: 'text/html',
      filename: `${component.name.toLowerCase().replace(/\s+/g, '-')}.html`,
      file_size: htmlCode.length,
    },
  }
}

// Export as CSS
async function exportAsCSS(component: any, options: any, metadata: any) {
  const componentName = component.name.toLowerCase().replace(/\s+/g, '-')
  const cssCode = `${options.add_comments ? `/**
 * ${component.name} Styles
 * ${component.description || 'Generated CSS styles'}
 * 
 * Exported from Component Library on ${new Date().toISOString()}
 * Category: ${component.category}
 * Tags: ${component.tags?.join(', ') || 'None'}
 * Performance Score: ${component.performance_score}/100
 * Accessibility Score: ${component.accessibility_score}/100
 */

` : ''}.${componentName} {
    /* Component styles would go here */
}

${componentName}__element {
    /* Element styles */
}

${componentName}--modifier {
    /* Modifier styles */
}`

  return {
    success: true,
    data: {
      content: cssCode,
      content_type: 'text/css',
      filename: `${componentName}.css`,
      file_size: cssCode.length,
    },
  }
}

// Export as Figma design
async function exportAsFigma(component: any, options: any, metadata: any) {
  // This would integrate with Figma API
  // For now, return a placeholder response
  const figmaData = {
    component: {
      name: component.name,
      description: component.description,
      preview_url: component.preview_url,
      properties: component.props,
      tags: component.tags,
    },
    figma_nodes: [], // Would contain Figma node data
    exported_at: new Date().toISOString(),
    format: 'figma',
  }

  const content = JSON.stringify(figmaData, null, 2)

  return {
    success: true,
    data: {
      content,
      content_type: 'application/json',
      filename: `${component.name.toLowerCase().replace(/\s+/g, '-')}-figma.json`,
      file_size: content.length,
    },
  }
}

// Log export analytics
async function logExportAnalytics(supabase: any, data: any) {
  try {
    const { error } = await supabase
      .from('export_analytics')
      .insert({
        ...data,
        created_at: new Date().toISOString(),
      })

    if (error) {
      console.warn('Failed to log export analytics:', error)
    }
  } catch (error) {
    console.warn('Error logging export analytics:', error)
  }
}