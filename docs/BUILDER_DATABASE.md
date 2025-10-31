# AI Site Builder Database Schema Documentation

## Overview

This document describes the comprehensive database schema designed for the AI Site Builder application. The schema supports real-time collaboration, version history, session tracking, and efficient querying patterns for building websites through AI-powered tools.

## Schema Architecture

### Core Tables

#### 1. `projects`
The central table for storing user projects with metadata and settings.

```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- 'website', 'landing-page', 'portfolio', etc.
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'active', 'archived'
    data JSONB DEFAULT '{}'::jsonb, -- Project-specific configuration
    settings JSONB DEFAULT '{}'::jsonb, -- User preferences and options
    collaborators UUID[] DEFAULT '{}', -- Array of user IDs
    is_public BOOLEAN DEFAULT FALSE
);
```

**Key Features:**
- JSONB fields for flexible data storage
- Collaboration support with multiple users
- Public/private project visibility
- Automatic versioning through triggers

#### 2. `sitemaps`
Stores generated sitemap data with version tracking.

```sql
CREATE TABLE sitemaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    pages JSONB DEFAULT '{}'::jsonb, -- Site structure and pages
    metadata JSONB DEFAULT '{}'::jsonb, -- Additional metadata
    version INTEGER NOT NULL DEFAULT 1
);
```

**Key Features:**
- Version-controlled sitemap generation
- Flexible page structure storage
- Project-scoped relationship

#### 3. `wireframes`
Stores wireframe data and versions for each sitemap.

```sql
CREATE TABLE wireframes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sitemap_id UUID NOT NULL REFERENCES sitemaps(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    layout JSONB DEFAULT '{}'::jsonb, -- Wireframe layout data
    style_guide JSONB DEFAULT '{}'::jsonb, -- Associated style information
    components TEXT[] DEFAULT '{}', -- Array of component IDs
    version INTEGER NOT NULL DEFAULT 1
);
```

**Key Features:**
- Layout data stored as JSONB
- Component reference tracking
- Version history support

#### 4. `style_guides`
Stores style guide data and versions for each wireframe.

```sql
CREATE TABLE style_guides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    wireframe_id UUID NOT NULL REFERENCES wireframes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    colors JSONB DEFAULT '{}'::jsonb, -- Color palette
    typography JSONB DEFAULT '{}'::jsonb, -- Font settings
    spacing JSONB DEFAULT '{}'::jsonb, -- Spacing rules
    components JSONB DEFAULT '{}'::jsonb, -- Component styles
    grid JSONB DEFAULT '{}'::jsonb, -- Grid system
    breakpoints JSONB DEFAULT '{}'::jsonb, -- Responsive breakpoints
    version INTEGER NOT NULL DEFAULT 1
);
```

**Key Features:**
- Comprehensive style system storage
- Responsive design support
- Component-specific styling

#### 5. `builder_sessions`
Tracks user sessions during the building process.

```sql
CREATE TABLE builder_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    session_token TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    current_step TEXT NOT NULL DEFAULT 'initializing',
    step_data JSONB DEFAULT '{}'::jsonb, -- Current step data
    progress JSONB DEFAULT '{}'::jsonb, -- Overall progress tracking
    metadata JSONB DEFAULT '{}'::jsonb, -- Session metadata
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- Duration in seconds
    ip_address INET,
    user_agent TEXT
);
```

**Key Features:**
- Session state tracking
- Progress monitoring
- Analytics data collection
- Automatic duration calculation

#### 6. `version_history`
Centralized version tracking for all entities.

```sql
CREATE TABLE version_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    entity_type TEXT NOT NULL, -- 'projects', 'sitemaps', 'wireframes', 'style_guides'
    entity_id UUID NOT NULL,
    version_number INTEGER NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    changes JSONB DEFAULT '{}'::jsonb, -- What changed
    data JSONB DEFAULT '{}'::jsonb, -- Full entity data at this version
    message TEXT, -- Human-readable change description
    is_major BOOLEAN DEFAULT FALSE
);
```

**Key Features:**
- Universal version tracking
- Change diff storage
- User attribution
- Major/minor version support

## Relationships

```
auth.users (1) --> (n) profiles
auth.users (1) --> (n) projects
auth.users (1) --> (n) builder_sessions
auth.users (1) --> (n) version_history

projects (1) --> (n) sitemaps
projects (1) --> (n) builder_sessions
projects (1) --> (n) version_history

sitemaps (1) --> (n) wireframes
sitemaps (1) --> (n) version_history

wireframes (1) --> (n) style_guides
wireframes (1) --> (n) version_history

style_guides (1) --> (n) version_history
```

## Performance Optimizations

### Indexes

```sql
-- Project indexes
CREATE INDEX idx_projects_user_id_status ON projects(user_id, status);
CREATE INDEX idx_projects_updated_at ON projects(updated_at);

-- Sitemap indexes
CREATE INDEX idx_sitemaps_project_id_updated ON sitemaps(project_id, updated_at);
CREATE INDEX idx_sitemaps_version ON sitemaps(project_id, version);

-- Wireframe indexes
CREATE INDEX idx_wireframes_sitemap_id_updated ON wireframes(sitemap_id, updated_at);
CREATE INDEX idx_wireframes_version ON wireframes(sitemap_id, version);

-- Style guide indexes
CREATE INDEX idx_style_guides_wireframe_id_updated ON style_guides(wireframe_id, updated_at);
CREATE INDEX idx_style_guides_version ON style_guides(wireframe_id, version);

-- Session indexes
CREATE INDEX idx_builder_sessions_user_id ON builder_sessions(user_id);
CREATE INDEX idx_builder_sessions_status ON builder_sessions(status);
CREATE INDEX idx_builder_sessions_session_token ON builder_sessions(session_token);

-- Version history indexes
CREATE INDEX idx_version_history_entity ON version_history(entity_type, entity_id);
CREATE INDEX idx_version_history_user_id ON version_history(user_id);
```

### Real-time Support

All builder tables are enabled for real-time subscriptions:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE sitemaps;
ALTER PUBLICATION supabase_realtime ADD TABLE wireframes;
ALTER PUBLICATION supabase_realtime ADD TABLE style_guides;
ALTER PUBLICATION supabase_realtime ADD TABLE builder_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE version_history;
```

## Security & Row Level Security (RLS)

### RLS Policies

```sql
-- Projects: Users can only access their own projects or public ones
CREATE POLICY "Users can view their projects" ON projects
    FOR SELECT USING (
        auth.uid() = user_id OR 
        is_public = true
    );

CREATE POLICY "Users can insert their projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their projects" ON projects
    FOR UPDATE USING (auth.uid() = user_id);

-- Builder Sessions: Strict user isolation
CREATE POLICY "Users can manage their sessions" ON builder_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Version History: Users can only see versions they created
CREATE POLICY "Users can view their version history" ON version_history
    FOR SELECT USING (auth.uid() = user_id);
```

## Utility Functions

### Session Management

```sql
-- Update session duration automatically
CREATE OR REPLACE FUNCTION update_session_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ended_at IS NOT NULL AND OLD.ended_at IS NULL THEN
        NEW.duration = EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at))::INTEGER;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Version Control

```sql
-- Get next version number for an entity
CREATE OR REPLACE FUNCTION get_next_version(entity_type_param TEXT, entity_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
    next_version INTEGER;
BEGIN
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version
    FROM version_history
    WHERE entity_type = entity_type_param AND entity_id = entity_id_param;
    
    RETURN next_version;
END;
$$ LANGUAGE plpgsql;

-- Create version history entry
CREATE OR REPLACE FUNCTION create_version_history(
    entity_type_param TEXT,
    entity_id_param UUID,
    user_id_param UUID,
    changes_param JSONB DEFAULT '{}'::jsonb,
    data_param JSONB DEFAULT '{}'::jsonb,
    message_param TEXT DEFAULT NULL,
    is_major_param BOOLEAN DEFAULT FALSE
)
RETURNS UUID AS $$
DECLARE
    next_version INTEGER;
    version_id UUID;
BEGIN
    next_version := get_next_version(entity_type_param, entity_id_param);
    
    INSERT INTO version_history (
        entity_type, entity_id, version_number, user_id,
        changes, data, message, is_major
    ) VALUES (
        entity_type_param, entity_id_param, next_version, user_id_param,
        changes_param, data_param, message_param, is_major_param
    ) RETURNING id INTO version_id;
    
    RETURN version_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Analytics

```sql
-- Get session analytics for user
CREATE OR REPLACE FUNCTION get_session_analytics(user_id_param UUID, days_param INTEGER DEFAULT 30)
RETURNS TABLE (
    total_sessions BIGINT,
    avg_duration NUMERIC,
    completed_sessions BIGINT,
    most_common_step TEXT,
    sessions_per_day NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_sessions,
        AVG(duration) as avg_duration,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_sessions,
        (SELECT current_step FROM builder_sessions WHERE user_id = user_id_param AND status = 'active' LIMIT 1) as most_common_step,
        COUNT(*) / days_param::NUMERIC as sessions_per_day
    FROM builder_sessions
    WHERE user_id = user_id_param 
    AND created_at >= NOW() - (days_param || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean up old sessions
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM builder_sessions 
    WHERE created_at < NOW() - INTERVAL '30 days' 
    AND status IN ('completed', 'cancelled');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## TypeScript Integration

### Database Types

The schema is fully typed in TypeScript:

```typescript
// src/types/database.ts
export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          name: string
          description: string | null
          type: string
          status: string
          data: Record<string, any> | null
          settings: Record<string, any> | null
          collaborators: string[] | null
          is_public: boolean
        }
        // ... Insert, Update types
      }
      builder_sessions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          project_id: string | null
          session_token: string
          status: string
          current_step: string
          step_data: Record<string, any> | null
          progress: Record<string, any> | null
          metadata: Record<string, any> | null
          started_at: string
          ended_at: string | null
          duration: number | null
          ip_address: string | null
          user_agent: string | null
        }
        // ... Insert, Update types
      }
      // ... other tables
    }
  }
}
```

### Builder Helpers

```typescript
// src/lib/supabase/builder.ts
export const builderHelpers = {
  // Session management
  session: {
    create: (data) => { /* ... */ },
    getByToken: (token) => { /* ... */ },
    updateProgress: (id, updates) => { /* ... */ },
    subscribe: (id, callback) => { /* ... */ },
  },
  
  // Project management
  project: {
    create: (project) => { /* ... */ },
    getWithRelations: (id) => { /* ... */ },
    update: (id, updates, userId) => { /* ... */ },
  },
  
  // Version control
  version: {
    getByEntity: (type, id) => { /* ... */ },
    revert: (versionId, userId) => { /* ... */ },
  },
  
  // Real-time collaboration
  collaboration: {
    subscribeToProject: (projectId, callback) => { /* ... */ },
    subscribeToSessions: (projectId, callback) => { /* ... */ },
  },
  
  // Analytics
  analytics: {
    getProjectStats: (projectId) => { /* ... */ },
    getUserAnalytics: (userId, days) => { /* ... */ },
  },
}
```

## Usage Examples

### Creating a New Project

```typescript
// Create complete project structure
const { data, error } = await builderHelpers.batch.createProjectStructure({
  project: {
    user_id: user.id,
    name: 'My New Website',
    type: 'website',
    status: 'draft',
  },
  sitemap: {
    title: 'Main Site Structure',
    description: 'Primary navigation and pages',
    pages: {
      home: { title: 'Home', path: '/' },
      about: { title: 'About', path: '/about' },
      contact: { title: 'Contact', path: '/contact' },
    },
  },
})
```

### Tracking User Sessions

```typescript
// Start a new builder session
const { data: session, error } = await builderHelpers.session.create({
  user_id: user.id,
  project_id: project.id,
  session_token: generateToken(),
  current_step: 'sitemap-generation',
  metadata: { userAgent: navigator.userAgent },
})

// Update session progress
await builderHelpers.session.updateProgress(session.id, {
  current_step: 'wireframe-design',
  progress: { completed: 25, total: 100 },
  step_data: { sitemapData: sitemap },
})

// Complete session
await builderHelpers.session.complete(session.id)
```

### Real-time Collaboration

```typescript
// Subscribe to project updates
const subscription = builderHelpers.collaboration.subscribeToProject(
  projectId,
  (payload) => {
    switch (payload.type) {
      case 'project':
        // Handle project updates
        break
      case 'sitemap':
        // Handle sitemap changes
        break
      case 'wireframe':
        // Handle wireframe updates
        break
      case 'style-guide':
        // Handle style guide changes
        break
    }
  }
)

// Subscribe to session updates
const sessionSubscription = builderHelpers.collaboration.subscribeToSessions(
  projectId,
  (payload) => {
    // Handle user session changes
    console.log(`User ${payload.new.user_id} is ${payload.new.status}`)
  }
)
```

### Version History

```typescript
// Get version history for an entity
const { data: versions } = await builderHelpers.version.getByEntity(
  'projects',
  projectId
)

// Revert to previous version
const { data: revertedProject } = await builderHelpers.version.revert(
  versionId,
  user.id
)
```

### Analytics

```typescript
// Get project statistics
const { data: stats } = await builderHelpers.analytics.getProjectStats(
  projectId
)

// Get user analytics
const { data: analytics } = await builderHelpers.analytics.getUserAnalytics(
  user.id,
  30 // Last 30 days
)
```

## Best Practices

### 1. Data Modeling
- Use JSONB fields for flexible, evolving data structures
- Keep relational data normalized for consistency
- Use version numbers for ordered relationships

### 2. Performance
- Create appropriate indexes for common query patterns
- Use partial indexes for filtered queries
- Consider read replicas for analytics queries

### 3. Security
- Enable Row Level Security on all tables
- Use security definer functions for complex operations
- Validate user permissions at the database level

### 4. Real-time
- Subscribe only to necessary channels
- Handle connection errors gracefully
- Implement reconnection logic for long-lived subscriptions

### 5. Version Control
- Use automatic triggers for common entities
- Provide manual versioning for major changes
- Include meaningful change messages

### 6. Analytics
- Collect session data for user experience insights
- Use batch operations for data aggregation
- Implement data retention policies

## Migration Strategy

### Running Migrations

1. **Development**: Apply migrations directly using Supabase CLI
2. **Staging**: Use migration scripts in CI/CD pipeline
3. **Production**: Require approval for migration execution

### Migration Files

```
src/lib/supabase/migrations/
├── 20241031_add_builder_sessions.sql
└── 20241031_enhance_builder_tables.sql
```

### Rollback Strategy

Each migration should include rollback instructions:

```sql
-- Rollback for builder_sessions
DROP TABLE IF EXISTS public.version_history;
DROP TABLE IF EXISTS public.builder_sessions;

-- Rollback triggers and functions
DROP FUNCTION IF EXISTS public.create_version_history;
DROP FUNCTION IF EXISTS public.get_next_version;
DROP FUNCTION IF EXISTS public.update_session_duration;
```

## Future Enhancements

### Planned Features
1. **Collaboration Comments**: User comments on entities
2. **Advanced Analytics**: Heatmaps, user behavior tracking
3. **Export/Import**: Project portability between users
4. **Template System**: Pre-built project templates
5. **AI Model Versions**: Track which AI models generated content

### Schema Evolution
The JSONB fields allow for schema evolution without breaking changes. New properties can be added to existing data structures without requiring migrations.

## Conclusion

This database schema provides a robust foundation for the AI Site Builder application with:
- ✅ Comprehensive project lifecycle management
- ✅ Real-time collaboration support
- ✅ Complete version history tracking
- ✅ Efficient querying patterns
- ✅ Strong security model
- ✅ Analytics and insights capabilities
- ✅ Extensible design for future features

The schema balances flexibility with structure, providing both immediate functionality and room for growth.