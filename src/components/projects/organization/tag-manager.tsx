'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Tag, Plus, X, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TagManager, Tag as TagType, TagCreateInput } from '@/lib/projects/organization'
import { useAuth } from '@/components/auth-provider'

interface TagManagerComponentProps {
  onTagSelect?: (tags: TagType[]) => void
  selectedTags?: TagType[]
  onTagToggle?: (tag: TagType) => void
  className?: string
  showBulkActions?: boolean
  selectedTagIds?: string[]
}

const TAG_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#6B7280', '#84CC16', '#06B6D4', '#F97316',
  '#14B8A6', '#F43F5E', '#8B5A2B', '#6366F1', '#DC2626'
]

export function TagManagerComponent({
  onTagSelect,
  selectedTags = [],
  onTagToggle,
  className,
  showBulkActions = false,
  selectedTagIds = []
}: TagManagerComponentProps) {
  const { user } = useAuth()
  const [tags, setTags] = useState<TagType[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<TagType | null>(null)
  const [filter, setFilter] = useState('')
  
  // Create tag form state
  const [newTag, setNewTag] = useState<TagCreateInput>({
    name: '',
    color: TAG_COLORS[0],
    description: ''
  })

  useEffect(() => {
    if (user) {
      loadTags()
    }
  }, [user])

  const loadTags = async () => {
    try {
      setLoading(true)
      const userTags = await TagManager.getTags(user!.id)
      setTags(userTags)
    } catch (error) {
      console.error('Failed to load tags:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTag = async () => {
    try {
      if (!newTag.name.trim()) return
      
      await TagManager.createTag(newTag, user!.id)
      setNewTag({ name: '', color: TAG_COLORS[0], description: '' })
      setIsCreateDialogOpen(false)
      await loadTags()
    } catch (error) {
      console.error('Failed to create tag:', error)
    }
  }

  const handleUpdateTag = async () => {
    try {
      if (!editingTag || !newTag.name.trim()) return
      
      await TagManager.updateTag(editingTag.id, newTag)
      setEditingTag(null)
      setNewTag({ name: '', color: TAG_COLORS[0], description: '' })
      setIsEditDialogOpen(false)
      await loadTags()
    } catch (error) {
      console.error('Failed to update tag:', error)
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm('Are you sure you want to delete this tag?')) return
    
    try {
      await TagManager.deleteTag(tagId)
      await loadTags()
    } catch (error) {
      console.error('Failed to delete tag:', error)
    }
  }

  const handleEditTag = (tag: TagType) => {
    setEditingTag(tag)
    setNewTag({
      name: tag.name,
      color: tag.color,
      description: tag.description || ''
    })
    setIsEditDialogOpen(true)
  }

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(filter.toLowerCase()) ||
    tag.description?.toLowerCase().includes(filter.toLowerCase())
  )

  const handleTagClick = (tag: TagType) => {
    onTagToggle?.(tag)
  }

  const TagForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="tag-name">Tag Name</Label>
        <Input
          id="tag-name"
          value={newTag.name}
          onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
          placeholder="Enter tag name..."
        />
      </div>
      
      <div>
        <Label htmlFor="tag-color">Color</Label>
        <div className="flex items-center space-x-2 mt-2">
          <div
            className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: newTag.color }}
          />
          <select
            value={newTag.color}
            onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
            className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-sm"
          >
            {TAG_COLORS.map(color => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="tag-description">Description (Optional)</Label>
        <Textarea
          id="tag-description"
          value={newTag.description}
          onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
          placeholder="Tag description..."
          rows={3}
        />
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse flex items-center space-x-3">
            <div className="w-4 h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-20" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Tags</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Plus className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Tag</DialogTitle>
            </DialogHeader>
            <TagForm />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTag} disabled={!newTag.name.trim()}>
                Create Tag
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        <Input
          placeholder="Search tags..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-8 text-xs"
        />
        
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {filteredTags.length > 0 ? (
            filteredTags.map(tag => {
              const isSelected = selectedTags.some(t => t.id === tag.id) || 
                               selectedTagIds.includes(tag.id)
              
              return (
                <div
                  key={tag.id}
                  className={cn(
                    'flex items-center space-x-2 p-2 rounded-lg cursor-pointer group hover:bg-muted/50',
                    isSelected && 'bg-primary/10 text-primary'
                  )}
                  onClick={() => handleTagClick(tag)}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  
                  <Tag className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{tag.name}</div>
                    {tag.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {tag.description}
                      </div>
                    )}
                  </div>
                  
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {tag.project_count}
                  </span>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditTag(tag)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteTag(tag.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {filter ? 'No matching tags' : 'No tags created yet'}
              </p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
          </DialogHeader>
          <TagForm />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTag} disabled={!newTag.name.trim()}>
              Update Tag
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Component for displaying selected tags
interface SelectedTagsProps {
  tags: TagType[]
  onTagRemove?: (tag: TagType) => void
  className?: string
}

export function SelectedTags({ tags, onTagRemove, className }: SelectedTagsProps) {
  if (tags.length === 0) return null

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {tags.map(tag => (
        <div
          key={tag.id}
          className="inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium text-white"
          style={{ backgroundColor: tag.color }}
        >
          <span>{tag.name}</span>
          {onTagRemove && (
            <button
              onClick={() => onTagRemove(tag)}
              className="hover:bg-black/20 rounded p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}