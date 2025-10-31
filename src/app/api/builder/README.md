# AI Site Builder API Routes

This document describes the API routes for the AI Site Builder workflow, which generates sitemaps, wireframes, and style guides using GPT-5.

## Overview

The AI Site Builder API provides endpoints for:

1. **Sitemap Generation** - Convert prompts to structured website sitemaps
2. **Wireframe Generation** - Create wireframes from sitemaps
3. **Style Guide Generation** - Generate design systems from wireframes
4. **Project Management** - CRUD operations for building projects

## Base URL

```
/api/builder
```

## Authentication

All endpoints require authentication via Supabase Auth. Include the JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

- **Sitemap Generation**: 5 requests per minute
- **Wireframe Generation**: 3 requests per minute  
- **Style Guide Generation**: 3 requests per minute
- **Project Management**: 10-30 requests per minute (varies by operation)

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` - Request data validation failed
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `RATE_LIMIT_EXCEEDED` - Rate limit exceeded
- `AI_GENERATION_FAILED` - AI service error
- `PROJECT_NOT_FOUND` - Project doesn't exist
- `DATABASE_ERROR` - Database operation failed

---

## Endpoints

### 1. Sitemap Generation

#### POST `/api/builder/sitemap`

Generate a sitemap from a user prompt.

**Request Body:**

```json
{
  "prompt": "Create a website for a sustainable fashion brand",
  "websiteType": "business",
  "domain": "ecofashion.com",
  "requirements": [
    "Showcase products",
    "Include blog about sustainability",
    "Contact form for wholesale inquiries"
  ],
  "options": {
    "minPages": 8,
    "maxPages": 15,
    "includeBlog": true,
    "includeAuth": false,
    "detailedMetadata": true
  },
  "preferences": {
    "style": "modern",
    "tone": "professional",
    "targetAudience": "Environmentally conscious consumers",
    "businessGoals": ["awareness", "sales", "community"]
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "sitemap": {
      "id": "uuid",
      "title": "EcoFashion - Sustainable Style",
      "description": "Modern sustainable fashion for conscious consumers",
      "websiteType": "business",
      "pages": [...],
      "metadata": {...},
      "statistics": {
        "totalPages": 12,
        "criticalPages": 8,
        "maxDepth": 2
      }
    },
    "metadata": {
      "processingTime": 2500,
      "tokensUsed": 1500,
      "cost": 0.15
    },
    "suggestions": {...}
  }
}
```

#### GET `/api/builder/sitemap`

Get API capabilities and limits for sitemap generation.

---

### 2. Wireframe Generation

#### POST `/api/builder/wireframe`

Generate wireframes from sitemap data.

**Request Body:**

```json
{
  "sitemapData": {
    "title": "EcoFashion Website",
    "description": "Sustainable fashion brand website",
    "pages": [
      {
        "id": "home",
        "title": "Home",
        "path": "/",
        "description": "Landing page with hero and featured products"
      }
    ]
  },
  "options": {
    "layoutPreference": "sidebar-right",
    "includeNavigation": true,
    "includeFooter": true,
    "includeSidebar": true,
    "industry": "fashion",
    "targetAudience": "consumers",
    "style": "modern",
    "accessibilityLevel": "AA"
  }
}
```

**Query Parameters:**

- `projectId` (optional) - Associate wireframe with a project

**Response:**

```json
{
  "success": true,
  "data": {
    "wireframe": {
      "id": "uuid",
      "name": "EcoFashion Wireframe",
      "layout": {...},
      "components": [...]
    },
    "confidence": 0.85,
    "suggestions": [...],
    "warnings": [],
    "metadata": {
      "processingTime": 3200,
      "tokensUsed": 2100,
      "cost": 0.21,
      "sitemapPages": 12,
      "components": 15
    }
  }
}
```

#### GET `/api/builder/wireframe`

Get API capabilities and limits for wireframe generation.

---

### 3. Style Guide Generation

#### POST `/api/builder/style-guide`

Generate a complete style guide from wireframe and brand guidelines.

**Request Body:**

```json
{
  "wireframeData": {
    "components": [...],
    "colorScheme": "green and brown tones",
    "typography": "modern sans-serif"
  },
  "brandGuidelines": {
    "name": "EcoFashion",
    "industry": "Sustainable Fashion",
    "targetAudience": "Environmentally conscious millennials",
    "brandPersonality": ["Sustainable", "Modern", "Trustworthy", "Innovative"],
    "brandValues": ["Sustainability", "Transparency", "Quality", "Ethics"],
    "colorPreferences": ["Forest Green", "Earth Brown", "Off White"],
    "typographyPreference": "sans-serif"
  },
  "designStyle": "modern",
  "wireframeDescription": "Clean, minimalist design with focus on product imagery",
  "existingColors": ["#2D5A27", "#8B4513"],
  "preferences": {
    "colorIntensity": "balanced",
    "typographyStyle": "modern",
    "spacingDensity": "comfortable"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "styleGuide": {
      "id": "uuid",
      "name": "EcoFashion Modern Style",
      "colorPalette": {
        "primary": {"50": "#f0fdf4", ...},
        "secondary": {"50": "#fefce8", ...}
      },
      "typography": {
        "fontFamily": {
          "sans": ["Inter", "system-ui", "sans-serif"],
          ...
        }
      },
      "componentStyles": {
        "button": {...},
        "card": {...}
      }
    },
    "warnings": [],
    "metadata": {
      "processingTime": 4100,
      "tokensUsed": 2800,
      "cost": 0.28,
      "components": 4,
      "brandAlignment": 85
    }
  }
}
```

#### GET `/api/builder/style-guide`

Get API capabilities and limits for style guide generation.

---

### 4. Project Management

#### POST `/api/builder/project`

Create a new project.

**Request Body:**

```json
{
  "name": "EcoFashion Website",
  "description": "Sustainable fashion brand website project",
  "type": "website",
  "isPublic": false,
  "settings": {
    "framework": "react",
    "styling": "tailwind"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "project": {
      "id": "uuid",
      "name": "EcoFashion Website",
      "status": "draft",
      "created_at": "2025-01-01T00:00:00Z"
    },
    "message": "Project created successfully"
  }
}
```

#### GET `/api/builder/project`

List user's projects with pagination and filtering.

**Query Parameters:**

- `status` - Filter by project status (draft, active, archived, completed)
- `type` - Filter by project type
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sortBy` - Sort field (default: created_at)
- `sortOrder` - asc or desc (default: desc)

**Response:**

```json
{
  "success": true,
  "data": {
    "projects": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

#### GET `/api/builder/project/[id]`

Get a specific project with all related data.

**Response:**

```json
{
  "success": true,
  "data": {
    "project": {
      "id": "uuid",
      "name": "EcoFashion Website",
      "sitemaps": [...],
      "wireframes": [...],
      "style_guides": [...],
      "stats": {
        "sitemapCount": 2,
        "wireframeCount": 1,
        "styleGuideCount": 1,
        "totalCost": 0.64
      }
    }
  }
}
```

#### PUT `/api/builder/project/[id]`

Update a project.

**Request Body:**

```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "status": "active",
  "data": {...},
  "settings": {...},
  "isPublic": true,
  "collaborators": ["user-id-1", "user-id-2"]
}
```

#### DELETE `/api/builder/project/[id]`

Delete a project and all related data.

---

## Cost Optimization

The API includes several cost optimization features:

1. **Token Estimation**: Estimates tokens before API calls to prevent overruns
2. **Model Selection**: Automatically selects optimal GPT-5 model based on task complexity
3. **Cost Tracking**: Tracks and reports costs for each generation
4. **Quota Management**: Enforces daily and hourly spending limits
5. **Caching**: Intelligent caching of similar requests (future enhancement)

### Quota Limits

- **Hourly**: $5.00
- **Daily**: $20.00
- **Request-based**: Varies by endpoint

## Monitoring & Logging

All API calls are logged for:

1. **Usage Tracking**: Monitor API usage patterns
2. **Error Analysis**: Track and analyze error rates
3. **Cost Optimization**: Monitor spending and optimize costs
4. **Performance**: Track response times and identify bottlenecks

Log entries include:

- User ID
- Request ID
- Endpoint
- Processing time
- Token usage
- Cost
- Success/failure status

## Integration Examples

### JavaScript/TypeScript

```typescript
// Generate sitemap
const sitemapResponse = await fetch('/api/builder/sitemap', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: 'Create a website for my bakery',
    websiteType: 'business'
  })
});

const sitemapResult = await sitemapResponse.json();

// Generate wireframe
const wireframeResponse = await fetch('/api/builder/wireframe', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sitemapData: sitemapResult.data.sitemap,
    options: { style: 'modern' }
  })
});

// Generate style guide
const styleResponse = await fetch('/api/builder/style-guide', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    wireframeData: wireframeResult.data.wireframe,
    brandGuidelines: {
      name: 'My Bakery',
      industry: 'Food Service',
      brandPersonality: ['Warm', 'Friendly', 'Traditional'],
      brandValues: ['Quality', 'Freshness', 'Community']
    },
    designStyle: 'classic'
  })
});
```

### cURL

```bash
# Generate sitemap
curl -X POST https://your-app.com/api/builder/sitemap \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a website for a local restaurant",
    "websiteType": "business"
  }'

# Create project
curl -X POST https://your-app.com/api/builder/project \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Restaurant Website",
    "type": "website",
    "description": "Local Italian restaurant"
  }'
```

## Best Practices

1. **Error Handling**: Always handle API errors gracefully
2. **Rate Limiting**: Implement exponential backoff for rate limit errors
3. **Cost Monitoring**: Monitor your usage to avoid unexpected charges
4. **Validation**: Validate input data before sending requests
5. **Caching**: Cache responses when appropriate to reduce API calls
6. **Progressive Enhancement**: Start with simple requests and add complexity

## Troubleshooting

### Common Issues

1. **Rate Limit Errors**
   - Implement exponential backoff
   - Monitor your request frequency
   - Consider upgrading your plan

2. **Authentication Errors**
   - Ensure JWT token is valid and not expired
   - Check token permissions

3. **Validation Errors**
   - Verify request data against schema
   - Check field lengths and formats

4. **Cost Limit Errors**
   - Monitor your usage in the dashboard
   - Implement usage tracking in your application

### Support

For issues or questions about the API:

1. Check the error messages and codes
2. Review request/response logs
3. Consult this documentation
4. Contact support with request IDs for assistance

---

## API Versioning

This API is currently at version 1.0. Breaking changes will be introduced in v2.0 with appropriate deprecation notices.

## Changelog

### v1.0.0 (Current)
- Initial release
- Sitemap, wireframe, and style guide generation
- Project management
- Rate limiting and cost optimization
- Comprehensive error handling
