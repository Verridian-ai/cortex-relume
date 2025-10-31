'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft,
  Calendar as CalendarIcon,
  Users,
  DollarSign,
  Tag,
  FileText,
  Settings,
  Save,
  Plus,
  X,
  FolderOpen,
  Star,
  Clock,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';

const projectTemplates = [
  {
    id: 'web-development',
    name: 'Web Development',
    description: 'Complete web development project',
    icon: '💻',
    categories: ['Web Development'],
    defaultSettings: {
      priority: 'medium',
      tags: ['web', 'development'],
      folderId: 'folder1'
    }
  },
  {
    id: 'mobile-app',
    name: 'Mobile App',
    description: 'Mobile application development',
    icon: '📱',
    categories: ['Mobile Development'],
    defaultSettings: {
      priority: 'high',
      tags: ['mobile', 'app'],
      folderId: 'folder2'
    }
  },
  {
    id: 'marketing',
    name: 'Marketing Campaign',
    description: 'Marketing and promotional campaign',
    icon: '📢',
    categories: ['Marketing'],
    defaultSettings: {
      priority: 'medium',
      tags: ['marketing', 'campaign'],
      folderId: 'folder3'
    }
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure',
    description: 'Infrastructure and deployment project',
    icon: '🏗️',
    categories: ['Infrastructure'],
    defaultSettings: {
      priority: 'high',
      tags: ['infrastructure', 'deployment'],
      folderId: 'folder2'
    }
  }
];

const categories = [
  'Web Development',
  'Mobile Development',
  'Marketing',
  'Infrastructure',
  'Design',
  'Research',
  'Documentation',
  'Other'
];

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-gray-500' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500' }
];

const teamOptions = [
  { id: 'team1', name: 'Development Team', members: 5 },
  { id: 'team2', name: 'Design Team', members: 3 },
  { id: 'team3', name: 'Marketing Team', members: 4 },
  { id: 'team4', name: 'QA Team', members: 2 }
];

export default function CreateProjectPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('details');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    tags: [] as string[],
    startDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    isStarred: false,
    addToFolder: '',
    budget: {
      allocated: 0,
      currency: 'USD'
    },
    team: {
      id: '',
      name: '',
      members: 0
    },
    assignee: {
      id: '',
      name: '',
      email: ''
    },
    permissions: 'member' as 'owner' | 'admin' | 'member' | 'viewer'
  });

  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBudgetChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      budget: {
        ...prev.budget,
        [field]: value
      }
    }));
  };

  const handleTeamChange = (field: string, value: any) => {
    const selectedTeam = teamOptions.find(t => t.id === value);
    setFormData(prev => ({
      ...prev,
      team: {
        ...prev.team,
        id: value,
        name: selectedTeam?.name || '',
        members: selectedTeam?.members || 0
      }
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const applyTemplate = (template: typeof projectTemplates[0]) => {
    setFormData(prev => ({
      ...prev,
      category: template.categories[0],
      priority: template.defaultSettings.priority as any,
      tags: [...template.defaultSettings.tags]
    }));
    setSelectedTemplate(template.id);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, you would make an API call here
      console.log('Creating project:', formData);
      
      // Navigate back to projects list
      router.push('/projects');
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.name.trim() && formData.category;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
          <p className="text-muted-foreground mt-1">
            Set up a new project with templates and custom settings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>
                Configure your project settings and requirements
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="team">Team</TabsTrigger>
                  <TabsTrigger value="budget">Budget</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <div className="mt-6">
                  {/* Details Tab */}
                  <TabsContent value="details" className="space-y-6 mt-0">
                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Project Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter project name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your project goals and objectives"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={4}
                      />
                    </div>

                    {/* Category and Priority */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {priorityOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  <div className={cn("w-2 h-2 rounded-full", option.color)} />
                                  {option.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                      <Label>Tags</Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          placeholder="Add a tag"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                        />
                        <Button type="button" onClick={addTag}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="gap-1">
                            {tag}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 ml-1"
                              onClick={() => removeTag(tag)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {format(formData.startDate, 'PPP')}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formData.startDate}
                              onSelect={(date) => handleInputChange('startDate', date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label>Due Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {format(formData.dueDate, 'PPP')}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formData.dueDate}
                              onSelect={(date) => handleInputChange('dueDate', date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Team Tab */}
                  <TabsContent value="team" className="space-y-6 mt-0">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Team Assignment</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="team">Team</Label>
                        <Select value={formData.team.id} onValueChange={(value) => handleTeamChange('id', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a team" />
                          </SelectTrigger>
                          <SelectContent>
                            {teamOptions.map((team) => (
                              <SelectItem key={team.id} value={team.id}>
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  {team.name}
                                  <span className="text-muted-foreground">({team.members} members)</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="assignee">Primary Assignee</Label>
                        <Input
                          id="assignee"
                          placeholder="Enter assignee name"
                          value={formData.assignee.name}
                          onChange={(e) => handleInputChange('assignee', {
                            ...formData.assignee,
                            name: e.target.value
                          })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="assigneeEmail">Assignee Email</Label>
                        <Input
                          id="assigneeEmail"
                          type="email"
                          placeholder="assignee@example.com"
                          value={formData.assignee.email}
                          onChange={(e) => handleInputChange('assignee', {
                            ...formData.assignee,
                            email: e.target.value
                          })}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Budget Tab */}
                  <TabsContent value="budget" className="space-y-6 mt-0">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Budget Information</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="budget">Budget Amount</Label>
                          <Input
                            id="budget"
                            type="number"
                            placeholder="0"
                            value={formData.budget.allocated}
                            onChange={(e) => handleBudgetChange('allocated', parseFloat(e.target.value) || 0)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="currency">Currency</Label>
                          <Select value={formData.budget.currency} onValueChange={(value) => handleBudgetChange('currency', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD ($)</SelectItem>
                              <SelectItem value="EUR">EUR (€)</SelectItem>
                              <SelectItem value="GBP">GBP (£)</SelectItem>
                              <SelectItem value="CAD">CAD (C$)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Settings Tab */}
                  <TabsContent value="settings" className="space-y-6 mt-0">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Project Settings</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Star Project</Label>
                            <p className="text-sm text-muted-foreground">
                              Add this project to your favorites
                            </p>
                          </div>
                          <Switch
                            checked={formData.isStarred}
                            onCheckedChange={(checked) => handleInputChange('isStarred', checked)}
                          />
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <Label htmlFor="folder">Folder</Label>
                          <Select value={formData.addToFolder} onValueChange={(value) => handleInputChange('addToFolder', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select folder (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">No folder</SelectItem>
                              <SelectItem value="folder1">
                                <div className="flex items-center gap-2">
                                  <FolderOpen className="h-4 w-4" />
                                  Development
                                </div>
                              </SelectItem>
                              <SelectItem value="folder2">
                                <div className="flex items-center gap-2">
                                  <FolderOpen className="h-4 w-4" />
                                  Infrastructure
                                </div>
                              </SelectItem>
                              <SelectItem value="folder3">
                                <div className="flex items-center gap-2">
                                  <FolderOpen className="h-4 w-4" />
                                  Marketing
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="permissions">Default Permissions</Label>
                          <Select value={formData.permissions} onValueChange={(value) => handleInputChange('permissions', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="owner">Owner - Full access</SelectItem>
                              <SelectItem value="admin">Admin - Manage project</SelectItem>
                              <SelectItem value="member">Member - Edit access</SelectItem>
                              <SelectItem value="viewer">Viewer - Read-only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!isFormValid || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Project
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Templates Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Templates</CardTitle>
              <CardDescription>
                Start with a pre-configured template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {projectTemplates.map((template) => (
                <div
                  key={template.id}
                  className={cn(
                    "p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm",
                    selectedTemplate === template.id && "border-primary bg-primary/5"
                  )}
                  onClick={() => applyTemplate(template)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{template.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{template.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.categories.map((category) => (
                          <Badge key={category} variant="outline" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {selectedTemplate && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Template Applied</span>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                    Default settings have been applied to your project.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
