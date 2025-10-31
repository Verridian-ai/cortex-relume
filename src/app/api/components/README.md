# Component Library API Documentation

Comprehensive REST API for the Component Library system providing CRUD operations, analytics, search, and export functionality for UI components.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Component Management](#component-management)
- [Analytics API](#analytics-api)
- [Search API](#search-api)
- [Export API](#export-api)
- [Error Handling](#error-handling)
- [Response Format](#response-format)
- [Real-time Subscriptions](#real-time-subscriptions)

## Overview

The Component Library API provides a complete backend for managing, discovering, and exporting UI components. It supports multiple frameworks (React, Vue, Angular, etc.) and provides comprehensive analytics and search capabilities.

### Base URL
```
https://your-domain.com/api/components
```

### Content Types
- Request: `application/json`
- Response: `application/json`
- File Downloads: Based on export format

## Authentication

Most endpoints require authentication. The API uses Supabase Auth.

### Bearer Token
```http
Authorization: Bearer <your_supabase_token>
```

### Anonymous Access
Some endpoints allow anonymous access with rate limiting:
- Public component reading
- Search (with AI feature rate limiting)
- Format information

## Rate Limiting

| Endpoint Category | Limit | Window |
|-------------------|--------|--------|
| Single Exports | 10 requests | 1 minute |
| Bulk Exports | 2 requests | 1 minute |
| AI-Powered Features | 10 requests | 1 minute |
| Search Suggestions | 30 requests | 1 minute |
| Analytics | 60 requests | 1 minute |

## Component Management

### List Components

**GET** `/api/components`

Query parameters:
- `query` - Search query
- `categories` - Comma-separated category list
- `frameworks` - Comma-separated framework list  
- `tags` - Comma-separated tag list
- `rating_min` - Minimum rating (0-5)
- `usage_min` - Minimum usage count
- `sort_by` - Sort field (popularity, rating, recent, name)
- `sort_order` - Sort direction (asc, desc)
- `limit` - Results per page (1-100, default 50)
- `offset` - Pagination offset

**Response:**
```json
{
  "data": [...],
  "meta": {
    "total": 150,
    "page": 1,
    "per_page": 50,
    "has_next": true,
    "has_prev": false
  },
  "success": true
}
```

### Create Component

**POST** `/api/components`

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Button Component",
  "description": "A customizable button component",
  "category": "Forms",
  "framework": "React",
  "code": "export default Button() { ... }",
  "preview_url": "https://...",
  "props": {
    "variant": "primary",
    "size": "medium"
  },
  "tags": ["button", "form", "interactive"],
  "is_public": true,
  "complexity_score": 2,
  "performance_score": 95,
  "accessibility_score": 100
}
```

### Get Component Details

**GET** `/api/components/{slug}`

Returns detailed component information including variants, dependencies, and quality metrics.

### Update Component

**PUT** `/api/components/{slug}`

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

### Delete Component

**DELETE** `/api/components/{slug}`

**Headers:**
```http
Authorization: Bearer <token>
```

### Bulk Operations

**PUT** `/api/components` (bulk update)
**DELETE** `/api/components` (bulk delete)

```json
{
  "operation": "update|delete",
  "component_ids": ["uuid1", "uuid2"],
  "data": { ... } // For update operations
}
```

## Analytics API

### Get Analytics Overview

**GET** `/api/components/analytics`

Query parameters:
- `timeframe` - Data period (7d, 30d, 90d, 1y)
- `categories` - Filter by categories
- `frameworks` - Filter by frameworks
- `limit` - Result limit (1-100)

**Response:**
```json
{
  "data": {
    "overview": { ... },
    "trending": [ ... ],
    "popular": [ ... ],
    "usage": { ... }
  },
  "success": true
}
```

### Popular Components

**GET** `/api/components/analytics/popular`

Returns the most popular components based on usage metrics.

### Trending Components

**GET** `/api/components/analytics/trending`

Identifies components with growing usage patterns.

### Usage Statistics

**GET** `/api/components/analytics/usage`

Get detailed usage statistics for components.

Query parameters:
- `component_id` - Specific component (optional)
- `timeframe` - Analysis period
- `granularity` - Data granularity (hourly, daily, weekly, monthly)

### Track Usage

**POST** `/api/components/analytics/track`

Track component interactions for analytics.

**Request Body:**
```json
{
  "component_id": "uuid",
  "action": "view|import|copy|download|favorite|share",
  "metadata": { ... },
  "session_id": "session-uuid"
}
```

## Search API

### Search Components

**POST** `/api/components/search`

**Request Body:**
```json
{
  "query": "button component",
  "categories": ["Forms", "Navigation"],
  "frameworks": ["React", "Vue"],
  "tags": ["interactive", "accessible"],
  "rating_min": 4.0,
  "usage_min": 100,
  "sort_by": "relevance",
  "sort_order": "desc",
  "limit": 20,
  "offset": 0,
  "include_fuzzy": true,
  "include_semantic": true,
  "highlight_matches": true
}
```

**Response:**
```json
{
  "data": {
    "results": [ ... ],
    "meta": {
      "total_results": 42,
      "search_duration_ms": 156,
      "search_method": "semantic",
      "has_more": true,
      "next_offset": 20
    },
    "suggestions": [ ... ]
  },
  "success": true
}
```

### Auto-complete Suggestions

**GET** `/api/components/search/suggestions`

Query parameters:
- `query` - Partial search term
- `limit` - Suggestion count (1-20, default 10)
- `types` - Suggestion types (components, categories, tags, frameworks)

### Available Filters

**GET** `/api/components/search/filters`

Returns all available filter options for search.

## Export API

### General Export

**POST** `/api/components/export`

Exports components in various formats.

**Request Body:**
```json
{
  "component_ids": ["uuid1", "uuid2"],
  "format": "json|zip|react|vue|angular|html|css|figma",
  "options": {
    "include_dependencies": true,
    "include_variants": true,
    "include_metadata": true,
    "minify_code": false,
    "add_comments": true
  },
  "metadata": {
    "project_name": "My Project",
    "author": "Developer Name",
    "version": "1.0.0",
    "license": "MIT"
  }
}
```

### Single Component Export

**POST** `/api/components/export/single`

Exports a single component with detailed formatting options.

**Request Body:**
```json
{
  "component_id": "uuid",
  "format": "react|vue|angular|html|css|json|svg|figma",
  "options": {
    "include_dependencies": true,
    "include_variants": true,
    "include_metadata": true,
    "minify_code": false,
    "add_comments": true,
    "framework_version": "18.0",
    "export_structure": "flat",
    "responsive": true,
    "dark_mode": false
  },
  "metadata": {
    "project_name": "My App",
    "version": "1.0.0"
  }
}
```

### Bulk Component Export

**POST** `/api/components/export/bulk`

Exports multiple components as a bundle.

**Request Body:**
```json
{
  "component_ids": ["uuid1", "uuid2", "uuid3"],
  "format": "zip|json|tar|react-package|vue-package|angular-package",
  "options": {
    "include_dependencies": true,
    "include_variants": true,
    "include_metadata": true,
    "include_documentation": true,
    "minify_code": false,
    "add_comments": true,
    "framework_version": "18.0",
    "export_structure": "hierarchical",
    "create_npm_package": true,
    "create_readme": true,
    "include_tests": false
  },
  "metadata": {
    "project_name": "Component Bundle",
    "project_description": "My component library",
    "version": "1.0.0",
    "license": "MIT"
  }
}
```

### Available Export Formats

**GET** `/api/components/export/formats`

Returns comprehensive information about all supported export formats.

## Error Handling

All endpoints return errors in a consistent format:

```json
{
  "error": "Error message",
  "details": { ... }, // Additional error context
  "success": false
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Rate Limited |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

### Error Types

- `VALIDATION_ERROR` - Request validation failed
- `AUTHENTICATION_REQUIRED` - Missing or invalid authentication
- `ACCESS_DENIED` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `EXPORT_FAILED` - Export operation failed
- `SEARCH_ERROR` - Search operation failed

## Response Format

All successful responses follow this structure:

```json
{
  "data": { ... }, // Response data
  "meta": { ... }, // Additional metadata (pagination, etc.)
  "success": true
}
```

### Pagination Meta

For list endpoints:
```json
{
  "meta": {
    "total": 150,
    "page": 1,
    "per_page": 50,
    "has_next": true,
    "has_prev": false,
    "total_pages": 3
  }
}
```

### Search Meta

For search endpoints:
```json
{
  "meta": {
    "total_results": 42,
    "search_duration_ms": 156,
    "search_method": "semantic",
    "filters_applied": { ... },
    "performance_score": "excellent",
    "has_more": true
  }
}
```

## Real-time Subscriptions

The API supports real-time updates via Supabase subscriptions:

### Subscribe to Component Updates

```javascript
const subscription = supabase
  .channel('component_updates')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'components'
  }, (payload) => {
    console.log('Component updated:', payload)
  })
  .subscribe()
```

### Subscribe to Usage Statistics

```javascript
const subscription = supabase
  .channel(`usage_stats:${componentId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'component_usage_stats',
    filter: `component_id=eq.${componentId}`
  }, (payload) => {
    console.log('Usage stats updated:', payload)
  })
  .subscribe()
```

## SDK Usage Examples

### JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
)

// Search components
const { data, error } = await supabase.functions.invoke('search-components', {
  body: { query: 'button', frameworks: ['React'] }
})

// Export component
const { data: exportData } = await supabase.functions.invoke('export-component', {
  body: {
    component_id: 'uuid',
    format: 'react',
    options: { include_metadata: true }
  }
})
```

### cURL Examples

#### Search Components
```bash
curl -X POST https://your-domain.com/api/components/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "query": "button component",
    "limit": 10
  }'
```

#### Export Component
```bash
curl -X POST https://your-domain.com/api/components/export/single \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "component_id": "uuid",
    "format": "react"
  }' \
  --output component.zip
```

#### Get Analytics
```bash
curl -X GET "https://your-domain.com/api/components/analytics/popular?limit=10" \
  -H "Authorization: Bearer <token>"
```

## Performance Considerations

### Caching
- Analytics data is cached for 5 minutes
- Search results are cached for 1 hour
- Component lists are cached for 30 minutes
- Export format information is cached for 24 hours

### Optimization
- Use pagination for large result sets
- Apply filters to reduce search scope
- Use specific timeframes for analytics
- Leverage bulk operations for multiple components

### Best Practices
1. **Search**: Use specific queries and filters for better performance
2. **Export**: Bundle multiple components when possible
3. **Analytics**: Use appropriate timeframes for your use case
4. **Real-time**: Subscribe only to components you need

## Support

For API support:
- Check the error messages for specific guidance
- Review rate limiting headers in responses
- Use the search suggestions API for better queries
- Monitor the analytics endpoints for API usage patterns

## Changelog

### v1.0.0
- Initial API release
- Full CRUD operations for components
- Comprehensive analytics and search
- Multiple export formats
- Real-time subscriptions
- Rate limiting and authentication