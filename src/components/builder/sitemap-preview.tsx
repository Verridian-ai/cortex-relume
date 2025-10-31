'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ArrowRight, TreePine, FileText, Users, Globe, Settings, ArrowUpDown } from 'lucide-react'
import { toast } from 'sonner'

interface SitemapNode {
  id: string
  title: string
  description?: string
  icon: React.ComponentType<{ className?: string }>
  children?: SitemapNode[]
  type: 'page' | 'section'
}

interface SitemapPreviewProps {
  onNext: (sitemap: SitemapNode[]) => void
  onBack: () => void
  loading?: boolean
  sitemap?: SitemapNode[]
}

const DEFAULT_SITEMAP: SitemapNode[] = [
  {
    id: 'home',
    title: 'Home',
    description: 'Landing page with hero section and overview',
    icon: Globe,
    type: 'page',
    children: [
      {
        id: 'hero',
        title: 'Hero Section',
        description: 'Main banner with call-to-action',
        icon: ArrowUpDown,
        type: 'section',
      },
      {
        id: 'features',
        title: 'Features Overview',
        description: 'Key feature highlights',
        icon: Settings,
        type: 'section',
      },
    ],
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Main application interface',
    icon: FileText,
    type: 'page',
    children: [
      {
        id: 'analytics',
        title: 'Analytics',
        description: 'Data visualization and insights',
        icon: Users,
        type: 'section',
      },
      {
        id: 'projects',
        title: 'Projects',
        description: 'Project management interface',
        icon: Settings,
        type: 'section',
      },
    ],
  },
  {
    id: 'profile',
    title: 'User Profile',
    description: 'Account settings and preferences',
    icon: Users,
    type: 'page',
  },
]

export function SitemapPreview({ onNext, onBack, loading = false, sitemap = DEFAULT_SITEMAP }: SitemapPreviewProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['home', 'dashboard']))
  const [editingNode, setEditingNode] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const startEditing = (nodeId: string, currentTitle: string) => {
    setEditingNode(nodeId)
    setEditTitle(currentTitle)
  }

  const saveEdit = (nodeId: string) => {
    // In a real app, this would update the sitemap state
    toast.success('Page updated successfully!')
    setEditingNode(null)
    setEditTitle('')
  }

  const renderNode = (node: SitemapNode, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expandedNodes.has(node.id)
    const Icon = node.icon

    return (
      <div key={node.id} className={`${depth > 0 ? 'ml-6' : ''}`}>
        <Card
          className={`mb-3 transition-all duration-200 hover:shadow-md ${
            depth === 0 ? 'border-l-4 border-l-brand-500' : 'border-l-2 border-l-muted-foreground/30'
          }`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className={`p-2 rounded-lg ${depth === 0 ? 'bg-brand-500/10' : 'bg-muted'}`}>
                  <Icon className={`w-4 h-4 ${depth === 0 ? 'text-brand-500' : 'text-muted-foreground'}`} />
                </div>
                
                <div className="flex-1">
                  {editingNode === node.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="font-semibold bg-transparent border-b border-brand-500 focus:outline-none"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(node.id)
                          if (e.key === 'Escape') setEditingNode(null)
                        }}
                      />
                      <Button size="sm" variant="ghost" onClick={() => saveEdit(node.id)}>
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{node.title}</CardTitle>
                      <Badge variant={node.type === 'page' ? 'default' : 'secondary'} className="text-xs">
                        {node.type}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditing(node.id, node.title)}
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✏️
                      </Button>
                    </div>
                  )}
                  
                  {node.description && (
                    <CardDescription className="text-sm mt-1">
                      {node.description}
                    </CardDescription>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {hasChildren && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(node.id)}
                    className="h-8 w-8 p-0"
                  >
                    {isExpanded ? '−' : '+'}
                  </Button>
                )}
                <Badge variant="outline" className="text-xs">
                  {node.id}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {hasChildren && isExpanded && (
          <div className="space-y-2">
            {node.children!.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Badge variant="ai" className="px-3 py-1">
            <TreePine className="w-3 h-3 mr-1" />
            Step 2
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">Your Sitemap</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Review and customize your website structure. Click on page titles to edit them, 
          and expand sections to see the full hierarchy.
        </p>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack} disabled={loading}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Prompt
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Regenerate
          </Button>
          <Button
            variant="ai"
            size="lg"
            onClick={() => onNext(sitemap)}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                Generate Wireframes
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Sitemap Tree */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TreePine className="w-5 h-5 text-brand-500" />
            Website Structure
          </CardTitle>
          <CardDescription>
            Click on any page title to edit it. Use +/− buttons to expand or collapse sections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 group">
            {sitemap.map((node) => renderNode(node))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-brand-500">
              {sitemap.filter(n => n.type === 'page').length}
            </div>
            <div className="text-sm text-muted-foreground">Main Pages</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-brand-500">
              {sitemap.reduce((acc, node) => acc + (node.children?.length || 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Sections</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-brand-500">
              {sitemap.length + sitemap.reduce((acc, node) => acc + (node.children?.length || 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Components</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}