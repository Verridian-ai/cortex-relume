'use client'

import { useState, useEffect } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { Folder, FolderPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FolderManager, Folder as FolderType } from '@/lib/projects/organization'
import { useAuth } from '@/components/auth-provider'

interface FolderTreeProps {
  onFolderSelect?: (folder: FolderType | null) => void
  selectedFolderId?: string | null
  className?: string
}

export function FolderTree({ onFolderSelect, selectedFolderId, className }: FolderTreeProps) {
  const { user } = useAuth()
  const [folders, setFolders] = useState<FolderType[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (user) {
      loadFolders()
    }
  }, [user])

  const loadFolders = async () => {
    try {
      setLoading(true)
      const hierarchy = await FolderManager.getFolderHierarchy(user!.id)
      setFolders(hierarchy)
    } catch (error) {
      console.error('Failed to load folders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFolderClick = (folder: FolderType) => {
    onFolderSelect?.(folder)
  }

  const handleAddFolder = async (parentId?: string) => {
    try {
      const name = prompt('Enter folder name:')
      if (name && name.trim()) {
        await FolderManager.createFolder({ name: name.trim(), parent_id: parentId }, user!.id)
        await loadFolders()
      }
    } catch (error) {
      console.error('Failed to create folder:', error)
    }
  }

  const toggleFolderExpanded = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const renderFolder = (folder: FolderType, level = 0) => {
    const isSelected = selectedFolderId === folder.id
    const isExpanded = expandedFolders.has(folder.id)
    const hasChildren = folder.children && folder.children.length > 0

    return (
      <div key={folder.id} className="select-none">
        <div
          className={cn(
            'flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer group',
            isSelected && 'bg-primary/10 text-primary',
            level > 0 && 'ml-4'
          )}
          style={{ paddingLeft: `${(level + 1) * 12}px` }}
          onClick={() => handleFolderClick(folder)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleFolderExpanded(folder.id)
              }}
              className="p-0.5 hover:bg-muted rounded"
            >
              <svg
                className={cn(
                  'h-3 w-3 transition-transform',
                  isExpanded ? 'rotate-90' : ''
                )}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M8 5l4 4-4 4" />
              </svg>
            </button>
          )}
          {!hasChildren && <div className="w-4" />}
          
          <Folder className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm font-medium flex-1 truncate">{folder.name}</span>
          <span className="text-xs text-muted-foreground">({folder.project_count})</span>
          
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
              <DropdownMenuItem onClick={() => handleAddFolder(folder.id)}>
                <FolderPlus className="h-4 w-4 mr-2" />
                Add Subfolder
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {isExpanded && hasChildren && (
          <div className="mt-1">
            {folder.children!.map(child => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-2 p-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex items-center space-x-2 p-2">
            <div className="w-4 h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-32" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between p-2">
        <h3 className="font-semibold text-sm">Folders</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleAddFolder()}
          className="h-6 w-6 p-0"
        >
          <FolderPlus className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="space-y-1">
        <div
          className={cn(
            'flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer',
            !selectedFolderId && 'bg-primary/10 text-primary'
          )}
          onClick={() => onFolderSelect?.(null)}
        >
          <Folder className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm font-medium">All Projects</span>
        </div>
        
        {folders.map(folder => renderFolder(folder))}
      </div>
    </div>
  )
}

// Drag and Drop wrapper for folders
interface DraggableFolderProps {
  folder: FolderType
  children: React.ReactNode
}

export function DraggableFolder({ folder, children }: DraggableFolderProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDroppable({
    id: folder.id,
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        isDragging && 'opacity-50',
        'transition-opacity'
      )}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  )
}