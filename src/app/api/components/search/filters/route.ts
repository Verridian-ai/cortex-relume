import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET /api/components/filters - Available filter options
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get all filter options in parallel
    const [
      categoriesResult,
      tagsResult,
      frameworksResult,
      componentsResult,
    ] = await Promise.all([
      // Get categories with counts
      supabase
        .from('component_categories')
        .select(`
          id,
          name,
          slug,
          description,
          icon,
          color,
          component_count,
          is_active
        `)
        .eq('is_active', true)
        .order('component_count', { ascending: false }),

      // Get tags with counts
      supabase
        .from('component_tags')
        .select(`
          id,
          name,
          slug,
          description,
          category,
          color,
          component_count,
          is_official,
          is_active
        `)
        .eq('is_active', true)
        .order('component_count', { ascending: false }),

      // Get frameworks with counts
      supabase
        .from('components')
        .select('framework')
        .eq('is_public', true),

      // Get components for additional filtering data
      supabase
        .from('components')
        .select(`
          category,
          framework,
          complexity_score,
          performance_score,
          accessibility_score,
          rating,
          usage_count,
          created_at,
          tags
        `)
        .eq('is_public', true),
    ])

    // Process frameworks
    const frameworks = processFrameworks(frameworksResult.data || [])
    
    // Process difficulty levels from complexity scores
    const difficultyLevels = processDifficultyLevels(componentsResult.data || [])
    
    // Process rating ranges
    const ratingRanges = processRatingRanges(componentsResult.data || [])
    
    // Process usage ranges
    const usageRanges = processUsageRanges(componentsResult.data || [])
    
    // Process date ranges
    const dateRanges = processDateRanges(componentsResult.data || [])

    // Process tags by category
    const tagsByCategory = processTagsByCategory(tagsResult.data || [])

    const filters = {
      categories: {
        title: 'Categories',
        type: 'multi-select',
        options: categoriesResult.data?.map(category => ({
          id: category.id,
          value: category.slug,
          label: category.name,
          description: category.description,
          count: category.component_count,
          icon: category.icon,
          color: category.color,
          is_active: category.is_active,
        })) || [],
        total_count: (categoriesResult.data || []).reduce((sum, cat) => sum + (cat.component_count || 0), 0),
      },

      frameworks: {
        title: 'Frameworks',
        type: 'multi-select',
        options: frameworks,
        total_count: frameworks.reduce((sum, fw) => sum + fw.count, 0),
      },

      tags: {
        title: 'Tags',
        type: 'multi-select',
        options: tagsByCategory,
        grouped: true,
        total_count: tagsResult.data?.reduce((sum, tag) => sum + (tag.component_count || 0), 0) || 0,
      },

      difficulty_levels: {
        title: 'Difficulty Level',
        type: 'multi-select',
        options: difficultyLevels,
        description: 'Based on component complexity score',
      },

      rating_ranges: {
        title: 'Rating',
        type: 'range',
        options: ratingRanges,
        description: 'Component ratings from the community',
      },

      usage_ranges: {
        title: 'Popularity',
        type: 'range',
        options: usageRanges,
        description: 'Based on component usage count',
      },

      date_ranges: {
        title: 'Created Date',
        type: 'date-range',
        options: dateRanges,
        description: 'Filter by component creation date',
      },

      sorting_options: {
        title: 'Sort By',
        type: 'single-select',
        options: [
          { value: 'relevance', label: 'Relevance', description: 'Best match for your search' },
          { value: 'popularity', label: 'Popularity', description: 'Most used components' },
          { value: 'rating', label: 'Rating', description: 'Highest rated components' },
          { value: 'recent', label: 'Recently Updated', description: 'Recently modified components' },
          { value: 'name', label: 'Name', description: 'Alphabetical order' },
          { value: 'created', label: 'Recently Created', description: 'Newest components first' },
        ],
      },

      feature_filters: {
        title: 'Features',
        type: 'checkboxes',
        options: [
          { 
            value: 'is_featured', 
            label: 'Featured Components', 
            description: 'Editor\'s pick components',
            icon: 'star',
          },
          { 
            value: 'is_accessible', 
            label: 'Accessible', 
            description: 'WCAG compliant components',
            icon: 'accessibility',
          },
          { 
            value: 'has_preview', 
            label: 'Has Live Preview', 
            description: 'Components with interactive demos',
            icon: 'play',
          },
          { 
            value: 'has_variants', 
            label: 'Multiple Variants', 
            description: 'Components with style variations',
            icon: 'layers',
          },
        ],
      },

      metadata: {
        total_components: componentsResult.data?.length || 0,
        last_updated: new Date().toISOString(),
        filter_version: '1.0',
      },
    }

    return NextResponse.json({
      data: filters,
      success: true,
    })

  } catch (error: any) {
    console.error('Error fetching filter options:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch filter options',
        message: error.message,
        success: false 
      },
      { status: 500 }
    )
  }
}

// Process framework data
function processFrameworks(components: any[]) {
  const frameworkCounts = components.reduce((acc, component) => {
    acc[component.framework] = (acc[component.framework] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Define framework metadata
  const frameworkMeta: Record<string, { label: string; color: string; icon: string }> = {
    'React': { label: 'React', color: '#61DAFB', icon: '⚛️' },
    'Vue': { label: 'Vue.js', color: '#4FC08D', icon: '💚' },
    'Angular': { label: 'Angular', color: '#DD0031', icon: '🅰️' },
    'Svelte': { label: 'Svelte', color: '#FF3E00', icon: '🔥' },
    'Vanilla JS': { label: 'Vanilla JavaScript', color: '#F7DF1E', icon: '🟨' },
    'HTML': { label: 'HTML', color: '#E34F26', icon: '📄' },
  }

  return Object.entries(frameworkCounts)
    .map(([framework, count]) => ({
      id: framework,
      value: framework,
      label: frameworkMeta[framework]?.label || framework,
      description: `${count} components`,
      count,
      color: frameworkMeta[framework]?.color || '#6B7280',
      icon: frameworkMeta[framework]?.icon || '🔧',
    }))
    .sort((a, b) => b.count - a.count)
}

// Process difficulty levels from complexity scores
function processDifficultyLevels(components: any[]) {
  const difficultyCounts = components.reduce((acc, component) => {
    const score = component.complexity_score || 1
    let level = 'beginner'
    
    if (score >= 4) level = 'advanced'
    else if (score >= 3) level = 'intermediate'
    else if (score >= 2) level = 'beginner'
    
    acc[level] = (acc[level] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const levelMeta = {
    beginner: { label: 'Beginner', description: 'Easy to understand and implement', color: '#10B981' },
    intermediate: { label: 'Intermediate', description: 'Moderate complexity', color: '#F59E0B' },
    advanced: { label: 'Advanced', description: 'Complex components', color: '#EF4444' },
  }

  return Object.entries(difficultyCounts).map(([level, count]) => ({
    id: level,
    value: level,
    label: levelMeta[level as keyof typeof levelMeta]?.label || level,
    description: levelMeta[level as keyof typeof levelMeta]?.description || '',
    count,
    color: levelMeta[level as keyof typeof levelMeta]?.color || '#6B7280',
  }))
}

// Process rating ranges
function processRatingRanges(components: any[]) {
  const ratedComponents = components.filter(c => c.rating && c.rating > 0)
  
  if (ratedComponents.length === 0) {
    return []
  }

  const ranges = [
    { min: 4.5, max: 5.0, label: 'Excellent (4.5★+)', color: '#10B981' },
    { min: 4.0, max: 4.5, label: 'Very Good (4.0-4.5★)', color: '#059669' },
    { min: 3.5, max: 4.0, label: 'Good (3.5-4.0★)', color: '#F59E0B' },
    { min: 3.0, max: 3.5, label: 'Average (3.0-3.5★)', color: '#F97316' },
    { min: 0, max: 3.0, label: 'Below Average (<3.0★)', color: '#EF4444' },
  ]

  return ranges.map(range => {
    const count = ratedComponents.filter(c => 
      c.rating >= range.min && c.rating <= range.max
    ).length

    return {
      id: `${range.min}-${range.max}`,
      value: { min: range.min, max: range.max },
      label: range.label,
      description: `${count} components`,
      count,
      color: range.color,
    }
  })
}

// Process usage ranges
function processUsageRanges(components: any[]) {
  const usageCounts = components.map(c => c.usage_count || 0).sort((a, b) => a - b)
  
  if (usageCounts.length === 0) {
    return []
  }

  const percentiles = [75, 50, 25, 10]
  const ranges = percentiles.map((percentile, index) => {
    const threshold = usageCounts[Math.floor((percentile / 100) * usageCounts.length)]
    const nextThreshold = index < percentiles.length - 1 
      ? usageCounts[Math.floor(((percentiles[index + 1]) / 100) * usageCounts.length)]
      : 0

    return {
      min: nextThreshold,
      max: threshold === nextThreshold ? Infinity : threshold,
      label: `${percentile}+th percentile`,
      description: `${threshold}+ uses`,
    }
  })

  return ranges.map((range, index) => {
    const count = components.filter(c => {
      const usage = c.usage_count || 0
      return usage >= range.min && (range.max === Infinity || usage <= range.max)
    }).length

    const colors = ['#10B981', '#059669', '#F59E0B', '#F97316']
    
    return {
      id: range.label,
      value: range,
      label: range.label,
      description: range.description,
      count,
      color: colors[index] || '#6B7280',
    }
  })
}

// Process date ranges
function processDateRanges(components: any[]) {
  if (!components.length) {
    return []
  }

  const dates = components.map(c => new Date(c.created_at)).sort((a, b) => a.getTime() - b.getTime())
  const now = new Date()
  const ranges = [
    {
      label: 'Last week',
      days: 7,
      color: '#10B981',
    },
    {
      label: 'Last month',
      days: 30,
      color: '#059669',
    },
    {
      label: 'Last 3 months',
      days: 90,
      color: '#F59E0B',
    },
    {
      label: 'Last year',
      days: 365,
      color: '#F97316',
    },
  ]

  return ranges.map(range => {
    const cutoffDate = new Date(now.getTime() - range.days * 24 * 60 * 60 * 1000)
    const count = components.filter(c => new Date(c.created_at) >= cutoffDate).length

    return {
      id: range.label.toLowerCase().replace(' ', '_'),
      value: { 
        from: cutoffDate.toISOString(),
        to: now.toISOString(),
      },
      label: range.label,
      description: `${count} components`,
      count,
      color: range.color,
    }
  })
}

// Process tags by category
function processTagsByCategory(tags: any[]) {
  const tagsByCategory = tags.reduce((acc, tag) => {
    const category = tag.category || 'other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(tag)
    return acc
  }, {} as Record<string, any[]>)

  const categoryMeta = {
    framework: { label: 'Framework', icon: '⚛️', color: '#3B82F6' },
    ui: { label: 'UI Elements', icon: '🎨', color: '#8B5CF6' },
    functionality: { label: 'Functionality', icon: '⚡', color: '#10B981' },
    styling: { label: 'Styling', icon: '🎭', color: '#F59E0B' },
    other: { label: 'Other', icon: '🏷️', color: '#6B7280' },
  }

  return Object.entries(tagsByCategory).map(([category, categoryTags]) => ({
    category,
    label: categoryMeta[category as keyof typeof categoryMeta]?.label || category,
    icon: categoryMeta[category as keyof typeof categoryMeta]?.icon || '🏷️',
    color: categoryMeta[category as keyof typeof categoryMeta]?.color || '#6B7280',
    options: categoryTags.map(tag => ({
      id: tag.id,
      value: tag.slug,
      label: tag.name,
      description: tag.description,
      count: tag.component_count,
      color: tag.color,
      is_official: tag.is_official,
    })),
  }))
}