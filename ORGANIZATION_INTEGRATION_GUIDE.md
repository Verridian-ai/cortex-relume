# Organization System Integration Guide

## Overview

This guide shows how to integrate the new Project Organization System into the existing Cortex Relume application.

## 🔧 Integration Steps

### 1. Update Navigation

Add organization link to the main navigation:

```tsx
// src/components/layout/nav.tsx
import { OrganizationDashboard } from '@/components/projects/organization'

// Add to navigation items
const navigationItems = [
  // ... existing items
  {
    title: 'Organization',
    href: '/dashboard/organization',
    icon: Folder,
    description: 'Organize projects'
  }
]
```

### 2. Create Organization Route

```tsx
// src/app/dashboard/organization/page.tsx
'use client'

import { OrganizationDashboard } from '@/components/projects/organization'
import { useAuth } from '@/components/auth-provider'

export default function OrganizationPage() {
  const { user } = useAuth()

  if (!user) {
    return <div>Please sign in to access organization.</div>
  }

  return (
    <OrganizationDashboard
      onProjectSelect={(project) => {
        // Navigate to project
        window.location.href = `/builder/${project.id}`
      }}
      onProjectsUpdate={() => {
        // Refresh projects data
        window.location.reload()
      }}
    />
  )
}
```

### 3. Update Project Data Structure

Ensure your project data matches the expected interface:

```typescript
// src/types/project.ts
export interface Project {
  id: string
  name: string
  description: string | null
  type: 'sitemap' | 'wireframe' | 'style-guide'
  status: 'draft' | 'in-progress' | 'completed'
  created_at: string
  updated_at: string
  user_id: string
  folder_id: string | null  // Add this field
  category_id: string | null  // Add this field
  data: {
    pages?: number
    wireframes?: number
    components?: number
    progress?: number
  }
  is_public: boolean
}
```

### 4. Update Database Schema

Add the new organization tables to your Supabase database:

```sql
-- Create folders table
CREATE TABLE project_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES project_folders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tags table
CREATE TABLE project_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create project_tags_relations table
CREATE TABLE project_tags_relations (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES project_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (project_id, tag_id)
);

-- Create categories table
CREATE TABLE project_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL,
  icon TEXT,
  is_predefined BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(CASE WHEN user_id IS NULL THEN name ELSE NULL END)
);

-- Create bulk_operations table
CREATE TABLE bulk_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('move', 'tag', 'delete', 'export')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  project_ids UUID[] NOT NULL,
  target_folder_id UUID REFERENCES project_folders(id),
  tags_to_add UUID[],
  tags_to_remove UUID[],
  progress INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for performance
CREATE INDEX idx_projects_folder_id ON projects(folder_id);
CREATE INDEX idx_projects_category_id ON projects(category_id);
CREATE INDEX idx_project_folders_parent_id ON project_folders(parent_id);
CREATE INDEX idx_project_folders_user_id ON project_folders(user_id);
CREATE INDEX idx_project_tags_user_id ON project_tags(user_id);
CREATE INDEX idx_project_tags_relations_project_id ON project_tags_relations(project_id);
CREATE INDEX idx_project_tags_relations_tag_id ON project_tags_relations(tag_id);

-- Add foreign key constraints
ALTER TABLE projects ADD CONSTRAINT fk_projects_folder_id 
  FOREIGN KEY (folder_id) REFERENCES project_folders(id);
ALTER TABLE projects ADD CONSTRAINT fk_projects_category_id 
  FOREIGN KEY (category_id) REFERENCES project_categories(id);
```

### 5. Update Existing Components

#### Update ProjectManager Component

```tsx
// src/components/builder/project-manager.tsx
// Add organization fields to the interface
interface Project {
  // ... existing fields
  folder_id: string | null
  category_id: string | null
}

// Add organization actions to the project card
<Card /* ...existing props... */>
  <CardHeader>
    {/* ...existing content... */}
    {project.folder_id && (
      <Badge variant="outline">
        <Folder className="h-3 w-3 mr-1" />
        In Folder
      </Badge>
    )}
  </CardHeader>
</Card>
```

#### Update Dashboard Overview

```tsx
// src/components/dashboard/project-overview.tsx
import { FolderTree } from '@/components/projects/organization'

export function ProjectOverview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Statistics cards */}
        <StatsCard />
        <RecentActivity />
        <OrganizationQuickView />
      </div>
      
      {/* Organization quick view */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Organization</CardTitle>
          <CardDescription>Access your project organization tools</CardDescription>
        </CardHeader>
        <CardContent>
          <FolderTree
            onFolderSelect={(folder) => {
              // Navigate to organization with folder filter
              window.location.href = `/dashboard/organization?folder=${folder?.id}`
            }}
            className="max-h-64 overflow-y-auto"
          />
        </CardContent>
      </Card>
    </div>
  )
}
```

### 6. Add Organization Shortcuts

```tsx
// src/lib/shortcuts/shortcuts-manager.tsx
export const organizationShortcuts = [
  {
    key: 'o',
    modifiers: ['Ctrl'],
    action: () => window.location.href = '/dashboard/organization',
    description: 'Open organization'
  },
  {
    key: 'n',
    modifiers: ['Ctrl', 'Shift'],
    action: () => {
      // Create new folder
      const folderName = prompt('Enter folder name:')
      if (folderName) {
        // Create folder logic
      }
    },
    description: 'New folder'
  }
]
```

### 7. Update Settings

```tsx
// src/app/settings/page.tsx
import { OrganizationSettings } from './organization-settings'

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="ai">AI</TabsTrigger>
        </TabsList>
        
        <TabsContent value="organization">
          <OrganizationSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

## 🎯 Usage Examples

### Basic Integration

```tsx
// Add to your main layout
import { OrganizationDashboard } from '@/components/projects/organization'

function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Existing layout */}
      <nav>{/* ...existing nav... */}</nav>
      <main>{/* ...existing content... */}</main>
      
      {/* Organization route */}
      <Route path="/organization" component={OrganizationDashboard} />
    </div>
  )
}
```

### Custom Organization View

```tsx
// For a custom organization interface
import { 
  FolderTree, 
  TagManagerComponent, 
  ProjectSearchAndFilter,
  AISmartOrganizationComponent
} from '@/components/projects/organization'

function CustomOrganization() {
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="col-span-3 space-y-6">
        <FolderTree onFolderSelect={setSelectedFolder} />
        <TagManagerComponent 
          selectedTags={selectedTags}
          onTagToggle={(tag) => {
            setSelectedTags(prev => 
              prev.find(t => t.id === tag.id)
                ? prev.filter(t => t.id !== tag.id)
                : [...prev, tag]
            )
          }}
        />
        <AISmartOrganizationComponent
          projects={projects}
          onProjectsUpdate={() => refreshProjects()}
        />
      </div>

      {/* Main Content */}
      <div className="col-span-9 flex flex-col">
        <ProjectSearchAndFilter
          onFiltersChange={handleFilters}
          folders={folders}
          tags={tags}
          categories={categories}
        />
        
        <div className="flex-1 overflow-hidden">
          <ProjectGrid
            projects={filteredProjects}
            selectedTags={selectedTags}
            selectedFolder={selectedFolder}
          />
        </div>
      </div>
    </div>
  )
}
```

## 🔧 Configuration Options

### Custom Colors

```tsx
// Custom tag colors
const CUSTOM_TAG_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
  '#10AC84', '#EE5A6F', '#C44569', '#F8B500', '#6C5CE7'
]

// Custom folder icons
const FOLDER_ICONS = ['folder', 'folder-open', 'archive', 'bookmark', 'star']
```

### AI Configuration

```tsx
// Configure AI suggestions
const AI_CONFIG = {
  maxSuggestions: 10,
  minConfidence: 0.6,
  analysisDepth: 'medium', // 'basic', 'medium', 'deep'
  customPrompts: {
    organization: 'Organize by complexity and timeline',
    tags: 'Suggest tags based on technology stack',
    folders: 'Create folders by client or project type'
  }
}
```

### Search Configuration

```tsx
// Customize search behavior
const SEARCH_CONFIG = {
  debounceMs: 300,
  maxResults: 50,
  includeFields: ['name', 'description', 'tags'],
  facets: ['type', 'status', 'folder', 'category', 'tags']
}
```

## 📱 Mobile Considerations

The organization system is designed to be responsive, but you may want to add mobile-specific features:

```tsx
// Mobile-optimized organization
function MobileOrganization() {
  return (
    <div className="md:hidden">
      <Tabs defaultValue="projects">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="organize">Organize</TabsTrigger>
          <TabsTrigger value="ai">AI</TabsTrigger>
        </TabsList>
        
        <TabsContent value="organize" className="space-y-4">
          <FolderTree compact />
          <TagManagerComponent compact />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

## 🔄 Migration Guide

### Existing Projects

Add organization fields to existing projects:

```sql
-- Add new columns to existing projects
ALTER TABLE projects ADD COLUMN folder_id UUID REFERENCES project_folders(id);
ALTER TABLE projects ADD COLUMN category_id UUID REFERENCES project_categories(id);

-- Create some default categories
INSERT INTO project_categories (name, color, icon, is_predefined) VALUES
  ('Web Development', '#3B82F6', 'laptop', true),
  ('Mobile Apps', '#10B981', 'smartphone', true),
  ('UI/UX Design', '#8B5CF6', 'palette', true),
  ('Marketing', '#F59E0B', 'megaphone', true),
  ('Business', '#6B7280', 'briefcase', true);

-- Migrate existing projects to categories based on type
UPDATE projects 
SET category_id = (
  SELECT id FROM project_categories 
  WHERE name = CASE 
    WHEN type = 'sitemap' THEN 'Web Development'
    WHEN type = 'wireframe' THEN 'UI/UX Design'
    WHEN type = 'style-guide' THEN 'UI/UX Design'
    ELSE 'Web Development'
  END
);
```

## 🎯 Testing

### Component Testing

```tsx
// Example test for organization dashboard
import { render, screen, fireEvent } from '@testing-library/react'
import { OrganizationDashboard } from '@/components/projects/organization'

test('renders organization dashboard', () => {
  render(<OrganizationDashboard initialProjects={mockProjects} />)
  
  expect(screen.getByText('Project Organization')).toBeInTheDocument()
  expect(screen.getByText('Folders')).toBeInTheDocument()
  expect(screen.getByText('Tags')).toBeInTheDocument()
})

test('filters projects by folder', async () => {
  render(<OrganizationDashboard initialProjects={mockProjects} />)
  
  const folder = await screen.findByText('Web Projects')
  fireEvent.click(folder)
  
  // Test that projects are filtered
  expect(screen.getAllByRole('card')).toHaveLength(2)
})
```

### Integration Testing

```tsx
// Test organization workflow
test('complete organization workflow', async () => {
  // 1. Create folder
  const folder = await FolderManager.createFolder({ name: 'Test Folder' }, userId)
  
  // 2. Create tag
  const tag = await TagManager.createTag({ name: 'Test Tag', color: '#FF0000' }, userId)
  
  // 3. Apply tag to project
  await TagManager.addTagToProject(projectId, tag.id)
  
  // 4. Move project to folder
  await FolderManager.moveProjectToFolder(projectId, folder.id)
  
  // 5. Verify changes
  const updatedProject = await getProject(projectId)
  expect(updatedProject.folder_id).toBe(folder.id)
  expect(updatedProject.tags).toContain(tag)
})
```

## 🚀 Deployment

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Database Migrations

Run the organization schema migration:

```bash
# Create and run migration
supabase db reset
```

### Build and Deploy

```bash
# Build the application
npm run build

# Deploy to your platform
npm run deploy
```

## 📚 Resources

- **Documentation**: `/src/components/projects/organization/README.md`
- **Demo**: `/app/organization/page.tsx`
- **Types**: `/src/types/organization.ts`
- **Integration**: This guide

The organization system is now ready for production use and can be customized further based on your specific requirements.