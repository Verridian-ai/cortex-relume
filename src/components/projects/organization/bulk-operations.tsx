'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { 
  Folder, 
  Tag, 
  Trash2, 
  Download, 
  Move, 
  Check, 
  X, 
  MoreHorizontal,
  CheckSquare,
  Square
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  BulkOperationManager,
  BulkOperation,
  Project,
  Folder as FolderType,
  Tag as TagType
} from '@/lib/projects/organization'

interface BulkOperationsProps {
  projects: Project[]
  selectedProjectIds: string[]
  onSelectionChange: (projectIds: string[]) => void
  onProjectsUpdate?: () => void
  folders: FolderType[]
  tags: TagType[]
  className?: string
}

export function BulkOperations({
  projects,
  selectedProjectIds,
  onSelectionChange,
  onProjectsUpdate,
  folders,
  tags,
  className
}: BulkOperationsProps) {
  const [isSelectAll, setIsSelectAll] = useState(false)
  const [bulkOperation, setBulkOperation] = useState<Omit<BulkOperation, 'id' | 'status' | 'progress' | 'created_at'> | null>(null)
  const [isOperationDialogOpen, setIsOperationDialogOpen] = useState(false)
  const [operationTarget, setOperationTarget] = useState<{
    type: 'folder' | 'tags'
    id: string | string[]
  } | null>(null)
  const [bulkOperations, setBulkOperations] = useState<BulkOperation[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadBulkOperations()
  }, [])

  useEffect(() => {
    setIsSelectAll(selectedProjectIds.length === projects.length && projects.length > 0)
  }, [selectedProjectIds, projects])

  const loadBulkOperations = async () => {
    try {
      setLoading(true)
      const operations = await BulkOperationManager.getBulkOperations('')
      setBulkOperations(operations)
    } catch (error) {
      console.error('Failed to load bulk operations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = () => {
    if (isSelectAll) {
      onSelectionChange([])
    } else {
      onSelectionChange(projects.map(p => p.id))
    }
  }

  const handleProjectSelect = (projectId: string) => {
    if (selectedProjectIds.includes(projectId)) {
      onSelectionChange(selectedProjectIds.filter(id => id !== projectId))
    } else {
      onSelectionChange([...selectedProjectIds, projectId])
    }
  }

  const handleBulkOperation = async (
    type: 'move' | 'tag' | 'delete' | 'export',
    target?: { type: 'folder' | 'tags', id: string | string[] }
  ) => {
    if (selectedProjectIds.length === 0) return

    const operation: Omit<BulkOperation, 'id' | 'status' | 'progress' | 'created_at'> = {
      type,
      project_ids: selectedProjectIds
    }

    if (type === 'move' && target?.type === 'folder') {
      operation.target_folder_id = target.id as string
    }

    if (type === 'tag' && target?.type === 'tags') {
      operation.tags_to_add = target.id as string[]
    }

    setBulkOperation(operation)
    setIsOperationDialogOpen(true)
  }

  const confirmBulkOperation = async () => {
    if (!bulkOperation) return

    try {
      const operation = await BulkOperationManager.createBulkOperation(bulkOperation)
      await BulkOperationManager.processBulkOperation(operation.id)
      
      onSelectionChange([])
      setIsOperationDialogOpen(false)
      setBulkOperation(null)
      setOperationTarget(null)
      
      onProjectsUpdate?.()
      loadBulkOperations()
    } catch (error) {
      console.error('Bulk operation failed:', error)
      alert('Bulk operation failed. Please try again.')
    }
  }

  const getOperationTitle = () => {
    if (!bulkOperation) return ''
    
    switch (bulkOperation.type) {
      case 'move':
        return 'Move Projects'
      case 'tag':
        return 'Apply Tags'
      case 'delete':
        return 'Delete Projects'
      case 'export':
        return 'Export Projects'
      default:
        return 'Bulk Operation'
    }
  }

  const getOperationDescription = () => {
    if (!bulkOperation) return ''
    
    const count = bulkOperation.project_ids.length
    
    switch (bulkOperation.type) {
      case 'move':
        return `This will move ${count} project${count === 1 ? '' : 's'} to the selected folder.`
      case 'tag':
        const addCount = bulkOperation.tags_to_add?.length || 0
        return `This will add ${addCount} tag${addCount === 1 ? '' : 's'} to ${count} project${count === 1 ? '' : 's'}.`
      case 'delete':
        return `This will permanently delete ${count} project${count === 1 ? '' : 's'}. This action cannot be undone.`
      case 'export':
        return `This will export ${count} project${count === 1 ? '' : 's'}.`
      default:
        return ''
    }
  }

  return (
    <>
      <div className={cn('flex items-center justify-between p-4 border rounded-lg bg-muted/20', className)}>
        <div className="flex items-center space-x-4">
          {/* Selection Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSelectAll}
              className="flex items-center space-x-2 hover:bg-muted/50 p-1 rounded"
            >
              {isSelectAll ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              <span className="text-sm">
                {selectedProjectIds.length > 0 
                  ? `${selectedProjectIds.length} selected`
                  : 'Select All'
                }
              </span>
            </button>
          </div>

          {/* Bulk Operations */}
          {selectedProjectIds.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                  Bulk Actions ({selectedProjectIds.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setIsOperationDialogOpen(true)}>
                  <Move className="h-4 w-4 mr-2" />
                  Move to Folder
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsOperationDialogOpen(true)}>
                  <Tag className="h-4 w-4 mr-2" />
                  Apply Tags
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleBulkOperation('export')}
                  className="text-blue-600"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleBulkOperation('delete')}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Recent Bulk Operations */}
        {bulkOperations.length > 0 && (
          <div className="text-xs text-muted-foreground">
            Recent: {bulkOperations[0].type} ({bulkOperations[0].status})
          </div>
        )}
      </div>

      {/* Bulk Operation Confirmation Dialog */}
      <Dialog open={isOperationDialogOpen} onOpenChange={setIsOperationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getOperationTitle()}</DialogTitle>
            <DialogDescription>
              {getOperationDescription()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Selected Projects Display */}
            <div>
              <Label>Selected Projects ({selectedProjectIds.length})</Label>
              <div className="max-h-32 overflow-y-auto mt-2 p-2 border rounded">
                {selectedProjectIds.slice(0, 5).map(projectId => {
                  const project = projects.find(p => p.id === projectId)
                  return (
                    <div key={projectId} className="text-sm py-1">
                      {project?.name || `Project ${projectId}`}
                    </div>
                  )
                })}
                {selectedProjectIds.length > 5 && (
                  <div className="text-sm text-muted-foreground">
                    ... and {selectedProjectIds.length - 5} more
                  </div>
                )}
              </div>
            </div>

            {/* Operation-specific configuration */}
            {bulkOperation?.type === 'move' && (
              <div>
                <Label>Move to folder</Label>
                <Select onValueChange={(value) => {
                  setBulkOperation(prev => prev ? { ...prev, target_folder_id: value } : null)
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a folder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No folder (Root)</SelectItem>
                    {folders.map(folder => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {bulkOperation?.type === 'tag' && (
              <div>
                <Label>Add tags</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto">
                  {tags.map(tag => (
                    <label key={tag.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded"
                        onChange={(e) => {
                          const currentTags = bulkOperation.tags_to_add || []
                          if (e.target.checked) {
                            setBulkOperation(prev => prev ? {
                              ...prev,
                              tags_to_add: [...currentTags, tag.id]
                            } : null)
                          } else {
                            setBulkOperation(prev => prev ? {
                              ...prev,
                              tags_to_add: currentTags.filter(id => id !== tag.id)
                            } : null)
                          }
                        }}
                      />
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="text-sm">{tag.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsOperationDialogOpen(false)
                  setBulkOperation(null)
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmBulkOperation}
                disabled={
                  !bulkOperation ||
                  (bulkOperation.type === 'move' && !bulkOperation.target_folder_id) ||
                  (bulkOperation.type === 'tag' && (!bulkOperation.tags_to_add || bulkOperation.tags_to_add.length === 0))
                }
              >
                Confirm {bulkOperation?.type}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Component for displaying bulk operation progress
interface BulkOperationProgressProps {
  operation: BulkOperation
  onComplete?: () => void
  className?: string
}

export function BulkOperationProgress({ operation, onComplete, className }: BulkOperationProgressProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500'
      case 'processing': return 'bg-blue-500'
      case 'completed': return 'bg-green-500'
      case 'failed': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return MoreHorizontal
      case 'processing': return MoreHorizontal
      case 'completed': return Check
      case 'failed': return X
      default: return MoreHorizontal
    }
  }

  useEffect(() => {
    if (operation.status === 'completed' || operation.status === 'failed') {
      onComplete?.()
    }
  }, [operation.status, onComplete])

  const StatusIcon = getStatusIcon(operation.status)

  return (
    <div className={cn('space-y-2 p-3 border rounded-lg', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <StatusIcon className="h-4 w-4" />
          <span className="text-sm font-medium capitalize">{operation.type}</span>
        </div>
        <Badge 
          variant="secondary" 
          className={getStatusColor(operation.status)}
        >
          {operation.status}
        </Badge>
      </div>
      
      {operation.status === 'processing' && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Progress</span>
            <span>{operation.progress}%</span>
          </div>
          <Progress value={operation.progress} className="h-2" />
        </div>
      )}
      
      <div className="text-xs text-muted-foreground">
        {operation.project_ids.length} projects
        {operation.error_message && (
          <div className="text-red-600 mt-1">{operation.error_message}</div>
        )}
      </div>
    </div>
  )
}