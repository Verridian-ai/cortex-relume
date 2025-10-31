# Project Organization System

A comprehensive project organization system with advanced features for managing projects, folders, tags, categories, and AI-powered suggestions.

## Features

### 🗂️ Folder Management
- **Hierarchical Folder Structure**: Create unlimited nested folder hierarchies
- **Drag & Drop Organization**: Move projects between folders intuitively
- **Folder Operations**: Create, rename, delete, and move folders
- **Visual Organization**: Color-coded folders with custom icons
- **Project Counting**: Automatic project count per folder

### 🏷️ Tag System
- **Color-Coded Tags**: 15 predefined colors with custom tag creation
- **Bulk Tagging**: Apply multiple tags to projects simultaneously
- **Tag Management**: Create, edit, and delete tags with descriptions
- **Tag Filtering**: Search and filter projects by tags
- **Visual Tags**: Color-coded tags for easy identification

### 📂 Category System
- **Predefined Categories**: Built-in categories for common project types
- **Custom Categories**: Create user-defined project categories
- **Category Assignment**: Assign categories to projects
- **Icon System**: Rich icon support for visual categorization
- **Filtering**: Filter projects by categories

### 🔍 Search & Filter
- **Advanced Search**: Full-text search across project names and descriptions
- **Multi-Filter Support**: Combine folder, category, tag, type, and status filters
- **Date Range Filtering**: Filter by creation or modification dates
- **Sorting Options**: Sort by name, creation date, modification date, or last accessed
- **Real-time Results**: Instant search results as you type
- **Active Filter Display**: Visual badges showing applied filters

### ⚡ Bulk Operations
- **Project Selection**: Select multiple projects for batch operations
- **Bulk Move**: Move multiple projects to different folders
- **Bulk Tagging**: Apply or remove tags from multiple projects
- **Bulk Delete**: Delete multiple projects with confirmation
- **Bulk Export**: Export multiple projects
- **Operation Tracking**: Real-time progress tracking for bulk operations

### 🤖 AI Smart Organization
- **Pattern Recognition**: AI analyzes project names and content for patterns
- **Smart Suggestions**: Generates folder and tag suggestions based on analysis
- **Confidence Scoring**: Each suggestion comes with confidence level
- **Automated Organization**: Apply AI suggestions with one click
- **Custom Analysis**: Provide custom prompts for specific organization needs

## Component Architecture

### Core Components

#### OrganizationDashboard
Main dashboard that brings together all organization features:
```tsx
<OrganizationDashboard
  initialProjects={projects}
  onProjectSelect={handleSelect}
  onProjectsUpdate={handleUpdate}
  className="custom-class"
/>
```

#### FolderTree
Hierarchical folder navigation component:
```tsx
<FolderTree
  onFolderSelect={setSelectedFolder}
  selectedFolderId={selectedFolder?.id || null}
/>
```

#### TagManagerComponent
Comprehensive tag management interface:
```tsx
<TagManagerComponent
  selectedTags={selectedTags}
  onTagToggle={handleTagToggle}
  showBulkActions={true}
/>
```

#### CategoryManagerComponent
Category management with predefined and custom categories:
```tsx
<CategoryManagerComponent
  selectedCategoryId={selectedCategory?.id}
  onCategoryToggle={setSelectedCategory}
/>
```

#### ProjectSearchAndFilter
Advanced search and filtering interface:
```tsx
<ProjectSearchAndFilter
  onFiltersChange={setFilters}
  onSearch={handleSearch}
  folders={folders}
  tags={tags}
  categories={categories}
/>
```

#### BulkOperations
Bulk action management with progress tracking:
```tsx
<BulkOperations
  projects={projects}
  selectedProjectIds={selectedIds}
  onSelectionChange={setSelectedIds}
  folders={folders}
  tags={tags}
/>
```

#### AISmartOrganizationComponent
AI-powered organization suggestions:
```tsx
<AISmartOrganizationComponent
  projects={projects}
  onSuggestionApply={handleSuggestion}
  onProjectsUpdate={handleUpdate}
/>
```

### Library Functions

#### FolderManager
```typescript
// Create a new folder
const folder = await FolderManager.createFolder({
  name: "Client Projects",
  description: "Projects for external clients",
  color: "#3B82F6",
  icon: "building"
}, userId)

// Move project to folder
await FolderManager.moveProjectToFolder(projectId, folderId)

// Get folder hierarchy
const hierarchy = await FolderManager.getFolderHierarchy(userId)
```

#### TagManager
```typescript
// Create a new tag
const tag = await TagManager.createTag({
  name: "Priority",
  color: "#EF4444",
  description: "High priority projects"
}, userId)

// Add tag to project
await TagManager.addTagToProject(projectId, tagId)

// Get all tags
const tags = await TagManager.getTags(userId)
```

#### CategoryManager
```typescript
// Create custom category
const category = await CategoryManager.createCategory({
  name: "Web Development",
  description: "Web application projects",
  color: "#10B981",
  icon: "laptop"
}, userId)

// Get categories (predefined + custom)
const categories = await CategoryManager.getCategories(userId)
```

#### SearchManager
```typescript
// Search with filters
const results = await SearchManager.searchProjects({
  query: "ecommerce",
  folder_id: "folder-123",
  category_ids: ["cat-1", "cat-2"],
  tag_ids: ["tag-1"],
  type: "sitemap",
  status: "completed"
}, userId, 50, 0)
```

#### BulkOperationManager
```typescript
// Create bulk move operation
const operation = await BulkOperationManager.createBulkOperation({
  type: "move",
  project_ids: ["proj-1", "proj-2"],
  target_folder_id: "folder-123"
})

// Process the operation
await BulkOperationManager.processBulkOperation(operation.id)
```

#### AISmartOrganization
```typescript
// Generate AI suggestions
const suggestions = await AISmartOrganization.suggestOrganization(projects)

// Apply a suggestion
await AISmartOrganization.applySuggestion(suggestion, projectIds, userId)
```

## Data Models

### Project
```typescript
interface Project {
  id: string
  name: string
  description: string | null
  type: 'sitemap' | 'wireframe' | 'style-guide'
  status: 'draft' | 'in-progress' | 'completed'
  created_at: string
  updated_at: string
  user_id: string
  folder_id: string | null
  category_id: string | null
  data: {
    pages?: number
    wireframes?: number
    components?: number
    progress?: number
  }
  is_public: boolean
}
```

### Folder
```typescript
interface Folder {
  id: string
  name: string
  description?: string
  parent_id?: string | null
  user_id: string
  color?: string
  icon?: string
  created_at: string
  updated_at: string
  project_count: number
  children?: Folder[]
}
```

### Tag
```typescript
interface Tag {
  id: string
  name: string
  color: string
  description?: string
  created_at: string
  project_count: number
}
```

### Category
```typescript
interface Category {
  id: string
  name: string
  description?: string
  color: string
  icon?: string
  is_predefined: boolean
  user_id?: string
  created_at: string
  project_count: number
}
```

## Usage Examples

### Basic Organization Setup
```tsx
import { OrganizationDashboard } from '@/components/projects/organization'

function MyProjectsPage() {
  const handleProjectSelect = (project) => {
    // Navigate to project editor or view
  }

  return (
    <div className="container mx-auto p-4">
      <OrganizationDashboard
        initialProjects={myProjects}
        onProjectSelect={handleProjectSelect}
        onProjectsUpdate={() => {
          // Refresh project list
          loadProjects()
        }}
      />
    </div>
  )
}
```

### Custom Organization Interface
```tsx
import { 
  FolderTree, 
  TagManagerComponent, 
  ProjectSearchAndFilter,
  BulkOperations 
} from '@/components/projects/organization'

function CustomOrganization() {
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])
  const [filters, setFilters] = useState({})

  return (
    <div className="grid grid-cols-4 gap-6">
      {/* Sidebar */}
      <div className="space-y-6">
        <FolderTree
          onFolderSelect={setSelectedFolder}
          selectedFolderId={selectedFolder?.id}
        />
        <TagManagerComponent
          selectedTags={selectedTags}
          onTagToggle={(tag) => {
            // Handle tag selection
            setSelectedTags(prev => 
              prev.find(t => t.id === tag.id)
                ? prev.filter(t => t.id !== tag.id)
                : [...prev, tag]
            )
          }}
        />
      </div>

      {/* Main Content */}
      <div className="col-span-3 space-y-4">
        <ProjectSearchAndFilter
          onFiltersChange={setFilters}
          folders={folders}
          tags={tags}
          categories={categories}
        />
        
        <BulkOperations
          projects={filteredProjects}
          selectedProjectIds={selectedIds}
          onSelectionChange={setSelectedIds}
          folders={folders}
          tags={tags}
        />
        
        {/* Project Grid/List */}
        <ProjectList
          projects={filteredProjects}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      </div>
    </div>
  )
}
```

### AI-Powered Organization
```tsx
import { AISmartOrganizationComponent } from '@/components/projects/organization'

function SmartOrganization() {
  return (
    <div className="space-y-6">
      <AISmartOrganizationComponent
        projects={projects}
        onSuggestionApply={(suggestion, projectIds) => {
          // Handle AI suggestion application
          console.log('Applied suggestion:', suggestion)
        }}
        onProjectsUpdate={() => {
          // Refresh after AI organization
          refreshProjects()
        }}
      />
    </div>
  )
}
```

## Error Handling

The system includes comprehensive error handling with custom error types:

```typescript
import { OrganizationError, OrganizationErrorCodes } from '@/lib/projects/organization'

try {
  await FolderManager.createFolder(folderData, userId)
} catch (error) {
  if (error instanceof OrganizationError) {
    switch (error.code) {
      case OrganizationErrorCodes.NAME_TAKEN:
        // Handle duplicate name error
        break
      case OrganizationErrorCodes.UNAUTHORIZED:
        // Handle unauthorized access
        break
      default:
        // Handle other errors
    }
  }
}
```

## Performance Considerations

1. **Lazy Loading**: Components load data on demand
2. **Debounced Search**: Search inputs are debounced to reduce API calls
3. **Virtual Scrolling**: Large lists use virtual scrolling for performance
4. **Caching**: Folder hierarchies and tag lists are cached
5. **Bulk Operations**: Large operations are processed asynchronously

## Accessibility

- Keyboard navigation support
- Screen reader compatible
- High contrast mode support
- Focus management for modals and dropdowns
- ARIA labels and roles throughout

## Future Enhancements

- Drag and drop for project organization
- Project templates based on organization patterns
- Collaborative folder sharing
- Advanced AI analytics
- Export/import organization settings
- Real-time collaboration features