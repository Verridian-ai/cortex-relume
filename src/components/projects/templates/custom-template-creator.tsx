"use client";

import { useState, useEffect } from "react";
import { TemplateLibrary, CustomTemplate } from "@/lib/projects/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Star, Users, Eye, Save } from "lucide-react";

interface CustomTemplateCreatorProps {
  projectId: string;
  projectData?: any;
  onTemplateCreated?: (template: CustomTemplate) => void;
}

export function CustomTemplateCreator({
  projectId,
  projectData,
  onTemplateCreated
}: CustomTemplateCreatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  
  // Form state
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  
  const templateLibrary = TemplateLibrary.getInstance();

  useEffect(() => {
    loadCustomTemplates();
  }, []);

  const loadCustomTemplates = async () => {
    try {
      // This would need user authentication context
      const templates = await templateLibrary.getCustomTemplates("current-user-id");
      setCustomTemplates(templates);
    } catch (error) {
      console.error("Error loading custom templates:", error);
    }
  };

  const handleCreateTemplate = async () => {
    if (!templateName.trim() || !templateDescription.trim() || !projectData) {
      return;
    }

    try {
      setIsLoading(true);
      
      // Extract components and styles from project data
      const components = templateLibrary.extractComponentsFromProject(projectData);
      const styles = templateLibrary.extractStylesFromProject(projectData);
      
      // Validate template data
      const templateData = {
        name: templateName,
        description: templateDescription,
        components,
        styles
      };

      if (!templateLibrary.validateTemplateData(templateData)) {
        throw new Error("Invalid template data");
      }

      // Create custom template
      const newTemplate = await templateLibrary.createCustomTemplate(
        templateName,
        templateDescription,
        projectId,
        "current-user-id", // This should come from auth context
        templateData,
        isPublic
      );

      // Add to local state
      setCustomTemplates(prev => [newTemplate, ...prev]);
      
      // Call callback
      onTemplateCreated?.(newTemplate);
      
      // Reset form and close dialog
      setTemplateName("");
      setTemplateDescription("");
      setIsPublic(false);
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating custom template:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await templateLibrary.deleteCustomTemplate(templateId, "current-user-id");
      setCustomTemplates(prev => prev.filter(t => t.id !== templateId));
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Template Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Templates</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Custom Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name"
                />
              </div>
              <div>
                <Label htmlFor="template-description">Description</Label>
                <Textarea
                  id="template-description"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Describe what this template includes"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="public-template"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <Label htmlFor="public-template">Make this template public</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTemplate}
                  disabled={isLoading || !templateName.trim() || !templateDescription.trim()}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Create Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Custom Templates Grid */}
      {customTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customTemplates.map((template) => (
            <CustomTemplateCard
              key={template.id}
              template={template}
              onDelete={handleDeleteTemplate}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Save className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No custom templates yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first custom template from an existing project to reuse components and styles.
            </p>
            <Button onClick={() => setIsOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface CustomTemplateCardProps {
  template: CustomTemplate;
  onDelete: (templateId: string) => void;
}

function CustomTemplateCard({ template, onDelete }: CustomTemplateCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(template.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {template.description}
            </p>
          </div>
          <div className="flex gap-1 ml-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Template</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{template.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-3">
          <Badge variant={template.is_public ? "default" : "secondary"}>
            {template.is_public ? "Public" : "Private"}
          </Badge>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="h-4 w-4 mr-1" />
            {template.usage_count}
          </div>
        </div>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Components:</span>
            <span>{template.components.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Created:</span>
            <span>{new Date(template.created_at).toLocaleDateString()}</span>
          </div>
          {template.rating && (
            <div className="flex justify-between">
              <span>Rating:</span>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                {template.rating.toFixed(1)}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 flex gap-2">
          <Button size="sm" className="flex-1">
            Use Template
          </Button>
          <Button size="sm" variant="outline">
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Template Categories Component
export function TemplateCategories({
  selectedCategory,
  onCategorySelect
}: {
  selectedCategory?: string;
  onCategorySelect: (category: string) => void;
}) {
  const [categories, setCategories] = useState<any[]>([]);
  const templateLibrary = TemplateLibrary.getInstance();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesData = await templateLibrary.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <Card
        className={`cursor-pointer transition-all hover:shadow-md ${
          !selectedCategory ? "ring-2 ring-blue-500" : ""
        }`}
        onClick={() => onCategorySelect("")}
      >
        <CardContent className="text-center p-6">
          <div className="text-2xl mb-2">🌟</div>
          <div className="font-semibold">All Templates</div>
        </CardContent>
      </Card>
      
      {categories.map((category) => (
        <Card
          key={category.id}
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedCategory === category.name ? "ring-2 ring-blue-500" : ""
          }`}
          onClick={() => onCategorySelect(category.name)}
        >
          <CardContent className="text-center p-6">
            <div className="text-2xl mb-2" style={{ color: category.color }}>
              {category.icon}
            </div>
            <div className="font-semibold text-sm">{category.name}</div>
            <div className="text-xs text-gray-500 mt-1">
              {category.template_count} templates
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Template Search Component
export function TemplateSearch({
  onSearch,
  placeholder = "Search templates..."
}: {
  onSearch: (query: string) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, onSearch]);

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-10"
      />
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
        <div className="h-4 w-4 text-gray-400">🔍</div>
      </div>
    </div>
  );
}

// Featured Templates Component
export function FeaturedTemplates({
  onTemplateSelect
}: {
  onTemplateSelect: (template: any) => void;
}) {
  const [featuredTemplates, setFeaturedTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const templateLibrary = TemplateLibrary.getInstance();

  useEffect(() => {
    loadFeaturedTemplates();
  }, []);

  const loadFeaturedTemplates = async () => {
    try {
      setLoading(true);
      const templates = await templateLibrary.getFeaturedTemplates();
      setFeaturedTemplates(templates);
    } catch (error) {
      console.error("Error loading featured templates:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Featured Templates</h3>
        <Badge className="bg-yellow-500">
          <Star className="h-3 w-3 mr-1" />
          Featured
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {featuredTemplates.slice(0, 6).map((template) => (
          <Card
            key={template.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onTemplateSelect(template)}
          >
            <div className="aspect-video relative overflow-hidden rounded-t-lg bg-gray-100">
              <img
                src={template.thumbnail}
                alt={template.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder-template.jpg";
                }}
              />
              <Badge className="absolute top-2 left-2 bg-yellow-500">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            </div>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-1 line-clamp-1">{template.name}</h4>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{template.description}</p>
              <div className="flex items-center justify-between text-sm">
                <Badge variant="outline">{template.category}</Badge>
                <div className="flex items-center text-gray-500">
                  <Star className="h-3 w-3 text-yellow-400 mr-1" />
                  {template.rating.toFixed(1)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}