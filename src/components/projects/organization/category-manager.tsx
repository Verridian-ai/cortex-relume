'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Folder, Plus, Edit, Trash2, Settings } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { CategoryManager, Category as CategoryType, CategoryCreateInput } from '@/lib/projects/organization'
import { useAuth } from '@/components/auth-provider'

interface CategoryManagerComponentProps {
  onCategorySelect?: (category: CategoryType | null) => void
  selectedCategoryId?: string | null
  onCategoryToggle?: (category: CategoryType) => void
  selectedCategories?: CategoryType[]
  className?: string
  showBulkActions?: boolean
}

const CATEGORY_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#6B7280', '#84CC16', '#06B6D4', '#F97316',
  '#14B8A6', '#F43F5E', '#8B5A2B', '#6366F1', '#DC2626'
]

const CATEGORY_ICONS = [
  'building', 'briefcase', 'home', 'shopping-cart', 'gamepad-2',
  'music', 'film', 'book-open', 'graduation-cap', 'laptop',
  'smartphone', 'camera', 'palette', 'hammer', 'heart'
]

export function CategoryManagerComponent({
  onCategorySelect,
  selectedCategoryId,
  onCategoryToggle,
  selectedCategories = [],
  className,
  showBulkActions = false
}: CategoryManagerComponentProps) {
  const { user } = useAuth()
  const [categories, setCategories] = useState<CategoryType[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryType | null>(null)
  const [filter, setFilter] = useState('')
  const [showPredefined, setShowPredefined] = useState(true)
  const [showCustom, setShowCustom] = useState(true)
  
  // Create category form state
  const [newCategory, setNewCategory] = useState<CategoryCreateInput>({
    name: '',
    color: CATEGORY_COLORS[0],
    icon: CATEGORY_ICONS[0],
    description: ''
  })

  useEffect(() => {
    if (user) {
      loadCategories()
    }
  }, [user])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const userCategories = await CategoryManager.getCategories(user?.id)
      setCategories(userCategories)
    } catch (error) {
      console.error('Failed to load categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async () => {
    try {
      if (!newCategory.name.trim()) return
      
      await CategoryManager.createCategory(newCategory, user!.id)
      setNewCategory({
        name: '',
        color: CATEGORY_COLORS[0],
        icon: CATEGORY_ICONS[0],
        description: ''
      })
      setIsCreateDialogOpen(false)
      await loadCategories()
    } catch (error) {
      console.error('Failed to create category:', error)
    }
  }

  const handleUpdateCategory = async () => {
    try {
      if (!editingCategory || !newCategory.name.trim()) return
      
      await CategoryManager.updateCategory(editingCategory.id, newCategory)
      setEditingCategory(null)
      setNewCategory({
        name: '',
        color: CATEGORY_COLORS[0],
        icon: CATEGORY_ICONS[0],
        description: ''
      })
      setIsEditDialogOpen(false)
      await loadCategories()
    } catch (error) {
      console.error('Failed to update category:', error)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This will remove it from all projects.')) return
    
    try {
      await CategoryManager.deleteCategory(categoryId)
      await loadCategories()
    } catch (error) {
      console.error('Failed to delete category:', error)
    }
  }

  const handleEditCategory = (category: CategoryType) => {
    setEditingCategory(category)
    setNewCategory({
      name: category.name,
      color: category.color,
      icon: category.icon || CATEGORY_ICONS[0],
      description: category.description || ''
    })
    setIsEditDialogOpen(true)
  }

  const filteredCategories = categories.filter(category => {
    if (!category.name.toLowerCase().includes(filter.toLowerCase())) return false
    
    // Apply visibility filters
    if (category.is_predefined && !showPredefined) return false
    if (!category.is_predefined && !showCustom) return false
    
    return true
  })

  const predefinedCategories = filteredCategories.filter(c => c.is_predefined)
  const customCategories = filteredCategories.filter(c => !c.is_predefined)

  const handleCategoryClick = (category: CategoryType) => {
    onCategoryToggle?.(category)
  }

  const CategoryForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="category-name">Category Name</Label>
        <Input
          id="category-name"
          value={newCategory.name}
          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
          placeholder="Enter category name..."
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category-color">Color</Label>
          <div className="flex items-center space-x-2 mt-2">
            <div
              className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: newCategory.color }}
            />
            <select
              value={newCategory.color}
              onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
              className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-sm"
            >
              {CATEGORY_COLORS.map(color => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div>
          <Label htmlFor="category-icon">Icon</Label>
          <select
            id="category-icon"
            value={newCategory.icon}
            onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm mt-2"
          >
            {CATEGORY_ICONS.map(icon => (
              <option key={icon} value={icon}>
                {icon.charAt(0).toUpperCase() + icon.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="category-description">Description (Optional)</Label>
        <Textarea
          id="category-description"
          value={newCategory.description}
          onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
          placeholder="Category description..."
          rows={3}
        />
      </div>
    </div>
  )

  const CategoryIcon = ({ icon, className }: { icon: string; className?: string }) => {
    // This is a simplified icon rendering - in a real app you'd use an icon library
    return <Folder className={cn('h-4 w-4', className)} />
  }

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse flex items-center space-x-3">
            <div className="w-4 h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-24" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Categories</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Plus className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            <CategoryForm />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCategory} disabled={!newCategory.name.trim()}>
                Create Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        <Input
          placeholder="Search categories..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-8 text-xs"
        />
        
        <div className="flex items-center space-x-4 text-xs">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showPredefined}
              onChange={(e) => setShowPredefined(e.target.checked)}
              className="rounded border-input"
            />
            <span>Predefined</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showCustom}
              onChange={(e) => setShowCustom(e.target.checked)}
              className="rounded border-input"
            />
            <span>Custom</span>
          </label>
        </div>
      </div>

      <div className="space-y-1 max-h-60 overflow-y-auto">
        {predefinedCategories.length > 0 && (
          <>
            <div className="text-xs font-medium text-muted-foreground px-2 py-1">
              Predefined Categories
            </div>
            {predefinedCategories.map(category => {
              const isSelected = selectedCategoryId === category.id || 
                               selectedCategories.some(c => c.id === category.id)
              
              return (
                <div
                  key={category.id}
                  className={cn(
                    'flex items-center space-x-2 p-2 rounded-lg cursor-pointer group hover:bg-muted/50',
                    isSelected && 'bg-primary/10 text-primary'
                  )}
                  onClick={() => handleCategoryClick(category)}
                >
                  <CategoryIcon icon={category.icon || 'folder'} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{category.name}</div>
                    {category.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {category.description}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {category.project_count}
                  </span>
                </div>
              )
            })}
          </>
        )}

        {customCategories.length > 0 && predefinedCategories.length > 0 && (
          <div className="h-px bg-border my-2" />
        )}

        {customCategories.length > 0 && (
          <>
            <div className="text-xs font-medium text-muted-foreground px-2 py-1">
              Custom Categories
            </div>
            {customCategories.map(category => {
              const isSelected = selectedCategoryId === category.id || 
                               selectedCategories.some(c => c.id === category.id)
              
              return (
                <div
                  key={category.id}
                  className={cn(
                    'flex items-center space-x-2 p-2 rounded-lg cursor-pointer group hover:bg-muted/50',
                    isSelected && 'bg-primary/10 text-primary'
                  )}
                  onClick={() => handleCategoryClick(category)}
                >
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <CategoryIcon icon={category.icon || 'folder'} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{category.name}</div>
                    {category.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {category.description}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {category.project_count}
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
                      <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            })}
          </>
        )}

        {filteredCategories.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {filter ? 'No matching categories' : 'No categories available'}
            </p>
          </div>
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <CategoryForm />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCategory} disabled={!newCategory.name.trim()}>
              Update Category
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Component for displaying category badges
interface CategoryBadgeProps {
  category: CategoryType
  onClick?: () => void
  className?: string
}

export function CategoryBadge({ category, onClick, className }: CategoryBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        'cursor-pointer hover:opacity-80',
        className
      )}
      style={{
        backgroundColor: `${category.color}20`,
        color: category.color,
        borderColor: category.color
      }}
      onClick={onClick}
    >
      <span className="mr-1">{category.icon}</span>
      {category.name}
    </Badge>
  )
}