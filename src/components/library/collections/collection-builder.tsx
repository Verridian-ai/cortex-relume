'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  X, 
  Save, 
  Eye, 
  EyeOff, 
  Star, 
  Tag,
  Settings,
  ArrowLeft,
  ArrowRight,
  Grid3X3,
  List,
  Trash2,
  GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface Component {
  id: string;
  name: string;
  description: string;
  category: string;
  framework: string;
  rating: number;
  usage_count: number;
  author: {
    name: string;
    avatar?: string;
  };
  tags: string[];
  is_selected?: boolean;
}

interface CollectionBuilderProps {
  onSave?: (collection: CollectionData) => void;
  onCancel?: () => void;
  initialData?: Partial<CollectionData>;
}

interface CollectionData {
  name: string;
  description: string;
  tags: string[];
  is_public: boolean;
  color: string;
  components: Component[];
}

const availableComponents: Component[] = [
  {
    id: 'comp-1',
    name: 'Advanced Button',
    description: 'Customizable button with multiple variants and states',
    category: 'Forms',
    framework: 'React',
    rating: 4.8,
    usage_count: 12000,
    author: { name: 'UI Team' },
    tags: ['Button', 'Interactive', 'Responsive'],
  },
  {
    id: 'comp-2',
    name: 'Input Field Pro',
    description: 'Enhanced input field with validation and formatting',
    category: 'Forms',
    framework: 'React',
    rating: 4.7,
    usage_count: 8900,
    author: { name: 'Form Experts' },
    tags: ['Input', 'Validation', 'Form'],
  },
  {
    id: 'comp-3',
    name: 'Modal System',
    description: 'Accessible modal system with focus management',
    category: 'Content',
    framework: 'React',
    rating: 4.9,
    usage_count: 15000,
    author: { name: 'A11y Team' },
    tags: ['Modal', 'Accessibility', 'Dialog'],
  },
  {
    id: 'comp-4',
    name: 'Data Table',
    description: 'Powerful data table with sorting and filtering',
    category: 'Data Display',
    framework: 'React',
    rating: 4.6,
    usage_count: 7800,
    author: { name: 'Data Team' },
    tags: ['Table', 'Data', 'Sorting'],
  },
  {
    id: 'comp-5',
    name: 'Navigation Header',
    description: 'Responsive navigation header with mobile menu',
    category: 'Navigation',
    framework: 'React',
    rating: 4.5,
    usage_count: 6500,
    author: { name: 'Nav Team' },
    tags: ['Navigation', 'Header', 'Mobile'],
  },
];

const presetColors = [
  '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', 
  '#EF4444', '#EC4899', '#14B8A6', '#6B7280'
];

export function CollectionBuilder({ onSave, onCancel, initialData }: CollectionBuilderProps) {
  const [activeStep, setActiveStep] = useState(1);
  const [collection, setCollection] = useState<CollectionData>({
    name: '',
    description: '',
    tags: [],
    is_public: true,
    color: '#3B82F6',
    components: [],
    ...initialData,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [availableComponentsState, setAvailableComponentsState] = useState<Component[]>([]);

  useEffect(() => {
    // Filter available components based on search and category
    let filtered = [...availableComponents];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(component =>
        component.name.toLowerCase().includes(query) ||
        component.description.toLowerCase().includes(query) ||
        component.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(component => 
        component.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Mark components that are already in the collection
    filtered = filtered.map(component => ({
      ...component,
      is_selected: collection.components.some(c => c.id === component.id)
    }));

    setAvailableComponentsState(filtered);
  }, [searchQuery, selectedCategory, collection.components]);

  const categories = Array.from(new Set(availableComponents.map(c => c.category)));

  const handleAddComponent = (component: Component) => {
    if (!collection.components.find(c => c.id === component.id)) {
      setCollection(prev => ({
        ...prev,
        components: [...prev.components, { ...component, is_selected: true }]
      }));
    }
  };

  const handleRemoveComponent = (componentId: string) => {
    setCollection(prev => ({
      ...prev,
      components: prev.components.filter(c => c.id !== componentId)
    }));
  };

  // const handleDragEnd = (result: any) => {
  //   if (!result.destination) return;

  //   const items = Array.from(collection.components);
  //   const [reorderedItem] = items.splice(result.source.index, 1);
  //   items.splice(result.destination.index, 0, reorderedItem);

  //   setCollection(prev => ({
  //     ...prev,
  //     components: items
  //   }));
  // };

  const addTag = (tag: string) => {
    if (tag && !collection.tags.includes(tag)) {
      setCollection(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tag: string) => {
    setCollection(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSave = () => {
    if (collection.name && collection.components.length > 0) {
      onSave?.(collection);
    }
  };

  const canProceedToStep = (step: number) => {
    switch (step) {
      case 2:
        return collection.name.length > 0 && collection.description.length > 0;
      case 3:
        return collection.components.length > 0;
      case 4:
        return true;
      default:
        return true;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Progress Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Create Collection</h1>
        <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex items-center ${
                step < 4 ? 'flex-1' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  activeStep >= step
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step}
              </div>
              {step < 4 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    activeStep > step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* <DragDropContext onDragEnd={handleDragEnd}> */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Basic Information */}
            {activeStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Tell us about your collection
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Collection Name *</Label>
                    <Input
                      id="name"
                      value={collection.name}
                      onChange={(e) => setCollection(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Essential Dashboard Components"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={collection.description}
                      onChange={(e) => setCollection(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what components are included and their use case..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {collection.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeTag(tag)}
                        >
                          {tag}
                          <X className="w-3 h-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                    <Input
                      placeholder="Add a tag..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addTag(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Appearance */}
            {activeStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>
                    Customize how your collection looks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Collection Color</Label>
                    <div className="grid grid-cols-4 gap-3 mt-2">
                      {presetColors.map((color) => (
                        <button
                          key={color}
                          className={`w-12 h-12 rounded-lg border-2 ${
                            collection.color === color ? 'border-primary' : 'border-border'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setCollection(prev => ({ ...prev, color }))}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="public"
                      checked={collection.is_public}
                      onCheckedChange={(checked) => 
                        setCollection(prev => ({ ...prev, is_public: !!checked }))
                      }
                    />
                    <Label htmlFor="public">Make this collection public</Label>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Add Components */}
            {activeStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Add Components</CardTitle>
                  <CardDescription>
                    Select components to include in your collection
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search and Filter */}
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search components..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Available Components */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {availableComponentsState.map((component) => (
                      <Card
                        key={component.id}
                        className={`cursor-pointer transition-colors ${
                          component.is_selected 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => component.is_selected 
                          ? handleRemoveComponent(component.id)
                          : handleAddComponent(component)
                        }
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-base">{component.name}</CardTitle>
                            {component.is_selected && (
                              <Badge variant="default" className="text-xs">
                                Added
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="text-sm">
                            {component.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex flex-wrap gap-1 mb-2">
                            {component.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{component.category}</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span>{component.rating}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Review & Preview */}
            {activeStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review & Preview</CardTitle>
                  <CardDescription>
                    Review your collection details and components
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Collection Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Collection Name</Label>
                      <p className="mt-1 font-medium">{collection.name}</p>
                    </div>
                    <div>
                      <Label>Visibility</Label>
                      <p className="mt-1">{collection.is_public ? 'Public' : 'Private'}</p>
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <p className="mt-1 text-muted-foreground">{collection.description}</p>
                  </div>

                  <div>
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {collection.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Components ({collection.components.length})</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      {collection.components.map((component) => (
                        <div key={component.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{component.name}</p>
                            <p className="text-xs text-muted-foreground">{component.category}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveComponent(component.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Collection Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="h-32 rounded-lg mb-3 flex items-center justify-center text-white relative overflow-hidden"
                  style={{ backgroundColor: collection.color }}
                >
                  <Grid3X3 className="w-8 h-8" />
                  {collection.is_public ? (
                    <Badge className="absolute top-2 right-2 bg-white/20 text-white">
                      <Eye className="w-3 h-3 mr-1" />
                      Public
                    </Badge>
                  ) : (
                    <Badge className="absolute top-2 right-2 bg-black/20 text-white">
                      <EyeOff className="w-3 h-3 mr-1" />
                      Private
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold mb-1 line-clamp-1">{collection.name || 'Collection Name'}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {collection.description || 'Collection description...'}
                </p>
                <div className="text-sm text-muted-foreground">
                  {collection.components.length} components
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={handleSave}
                disabled={!canProceedToStep(activeStep)}
              >
                <Save className="w-4 h-4 mr-2" />
                {activeStep === 4 ? 'Create Collection' : 'Save & Continue'}
              </Button>
              
              {onCancel && (
                <Button variant="outline" className="w-full" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                disabled={activeStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <Button
                onClick={() => setActiveStep(prev => Math.min(4, prev + 1))}
                disabled={activeStep === 4 || !canProceedToStep(activeStep + 1)}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round((activeStep / 4) * 100)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${(activeStep / 4) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      {/* </DragDropContext> */}
    </div>
  );
}