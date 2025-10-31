'use client'

import { useState, useEffect } from 'react'
import { OrganizationDashboard } from '@/components/projects/organization'
import { Project } from '@/lib/projects/organization'

// Mock projects for demonstration
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'E-commerce Website',
    description: 'Modern online store with shopping cart functionality and payment integration',
    type: 'sitemap',
    status: 'completed',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-16T14:30:00Z',
    user_id: 'user1',
    folder_id: null,
    category_id: null,
    data: { pages: 12, wireframes: 8 },
    is_public: false
  },
  {
    id: '2',
    name: 'Corporate Landing Page',
    description: 'Professional landing page for tech startup with hero section and features',
    type: 'wireframe',
    status: 'in-progress',
    created_at: '2025-01-20T09:15:00Z',
    updated_at: '2025-01-22T11:45:00Z',
    user_id: 'user1',
    folder_id: null,
    category_id: null,
    data: { pages: 3, progress: 65 },
    is_public: true
  },
  {
    id: '3',
    name: 'Portfolio Website',
    description: 'Creative portfolio with blog functionality and project showcase',
    type: 'style-guide',
    status: 'draft',
    created_at: '2025-01-25T16:20:00Z',
    updated_at: '2025-01-25T16:20:00Z',
    user_id: 'user1',
    folder_id: null,
    category_id: null,
    data: { components: 15, pages: 5 },
    is_public: false
  },
  {
    id: '4',
    name: 'SaaS Dashboard',
    description: 'Modern SaaS dashboard with analytics and user management',
    type: 'sitemap',
    status: 'completed',
    created_at: '2025-01-18T08:30:00Z',
    updated_at: '2025-01-19T16:20:00Z',
    user_id: 'user1',
    folder_id: null,
    category_id: null,
    data: { pages: 20, wireframes: 15 },
    is_public: true
  },
  {
    id: '5',
    name: 'Restaurant Website',
    description: 'Restaurant website with menu, reservation system, and gallery',
    type: 'wireframe',
    status: 'in-progress',
    created_at: '2025-01-22T14:10:00Z',
    updated_at: '2025-01-24T10:15:00Z',
    user_id: 'user1',
    folder_id: null,
    category_id: null,
    data: { pages: 8, progress: 40 },
    is_public: false
  }
]

export default function OrganizationDemo() {
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project)
    console.log('Selected project:', project)
  }

  const handleProjectsUpdate = () => {
    // In a real app, this would trigger a refresh of the projects list
    console.log('Projects updated')
  }

  return (
    <div className="h-screen flex flex-col">
      <OrganizationDashboard
        initialProjects={projects}
        onProjectSelect={handleProjectSelect}
        onProjectsUpdate={handleProjectsUpdate}
        className="flex-1"
      />
      
      {/* Selected project details (optional) */}
      {selectedProject && (
        <div className="border-t p-4 bg-muted/20">
          <h3 className="font-semibold mb-2">Selected Project</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Name:</span>
              <div className="font-medium">{selectedProject.name}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Type:</span>
              <div className="font-medium">{selectedProject.type}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>
              <div className="font-medium">{selectedProject.status}</div>
            </div>
          </div>
          {selectedProject.description && (
            <div className="mt-2">
              <span className="text-muted-foreground">Description:</span>
              <div className="text-sm">{selectedProject.description}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}