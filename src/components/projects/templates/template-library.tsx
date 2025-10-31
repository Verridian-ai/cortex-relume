"use client";

import { useState, useEffect } from "react";
import { Template, TemplateLibrary } from "@/lib/projects/templates";
import { Search, Filter, Star, Download, Eye, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TemplateLibraryProps {
  onTemplateSelect?: (template: Template) => void;
  selectedCategory?: string;
  showCreateButton?: boolean;
}

export function TemplateLibraryComponent({
  onTemplateSelect,
  selectedCategory,
  showCreateButton = true
}: TemplateLibraryProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(selectedCategory || "");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [sortBy, setSortBy] = useState("popularity");
  
  const templateLibrary = TemplateLibrary.getInstance();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchQuery, selectedCategoryFilter, selectedDifficulty, showFeaturedOnly, showPremiumOnly, sortBy]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [templatesData, categoriesData] = await Promise.all([
        templateLibrary.getTemplates(),
        templateLibrary.getCategories()
      ]);
      
      setTemplates(templatesData.templates);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading template data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = [...templates];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (template) =>
          template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategoryFilter) {
      filtered = filtered.filter((template) => template.category === selectedCategoryFilter);
    }

    // Difficulty filter
    if (selectedDifficulty) {
      filtered = filtered.filter((template) => template.difficulty_level === selectedDifficulty);
    }

    // Featured filter
    if (showFeaturedOnly) {
      filtered = filtered.filter((template) => template.is_featured);
    }

    // Premium filter
    if (showPremiumOnly) {
      filtered = filtered.filter((template) => template.is_premium);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "popularity":
          return b.usage_count - a.usage_count;
        case "rating":
          return b.rating - a.rating;
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredTemplates(filtered);
  };

  const handleTemplateClick = (template: Template) => {
    onTemplateSelect?.(template);
    templateLibrary.incrementTemplateUsage(template.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={selectedCategoryFilter} onValueChange={setSelectedCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.icon} {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Any Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Difficulty</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Most Popular</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex gap-4">
        <Button
          variant={showFeaturedOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
        >
          <Star className="h-4 w-4 mr-2" />
          Featured
        </Button>
        <Button
          variant={showPremiumOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setShowPremiumOnly(!showPremiumOnly)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Premium
        </Button>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {filteredTemplates.length} template{filteredTemplates.length !== 1 ? "s" : ""} found
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onClick={() => handleTemplateClick(template)}
          />
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No templates found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

interface TemplateCardProps {
  template: Template;
  onClick: () => void;
}

function TemplateCard({ template, onClick }: TemplateCardProps) {
  const difficultyColors = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800",
    advanced: "bg-red-100 text-red-800",
  };

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
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
        {template.is_featured && (
          <Badge className="absolute top-2 left-2 bg-yellow-500">
            <Star className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        )}
        {template.is_premium && (
          <Badge className="absolute top-2 right-2 bg-purple-600">
            Premium
          </Badge>
        )}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-1">{template.name}</CardTitle>
        <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline">{template.category}</Badge>
          <Badge className={difficultyColors[template.difficulty_level]}>
            {template.difficulty_level}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 mr-1" />
            {template.rating.toFixed(1)}
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {template.usage_count}
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {template.estimated_time}m
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Use Template
          </Button>
          <Button size="sm" variant="outline">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function TemplatePreview({ template }: { template: Template }) {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="aspect-video relative">
        <img
          src={template.thumbnail}
          alt={template.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <Button variant="secondary" size="lg">
            <Eye className="h-5 w-5 mr-2" />
            Live Preview
          </Button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">{template.name}</h2>
            <p className="text-gray-600">{template.description}</p>
          </div>
          <div className="flex gap-2">
            {template.is_featured && (
              <Badge className="bg-yellow-500">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            {template.is_premium && (
              <Badge className="bg-purple-600">Premium</Badge>
            )}
          </div>
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Template Info</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Category:</span>
                    <span>{template.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Difficulty:</span>
                    <span>{template.difficulty_level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Time:</span>
                    <span>{template.estimated_time} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Version:</span>
                    <span>{template.version}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Usage Statistics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Usage Count:</span>
                    <span>{template.usage_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rating:</span>
                    <span className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      {template.rating.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>SEO Score:</span>
                    <span>{template.metadata.seo_score}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Performance:</span>
                    <span>{template.metadata.performance_score}/100</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="components" className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Template Structure</h4>
              <div className="grid grid-cols-2 gap-4">
                {template.components.map((component, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{component.type}</span>
                      <Badge variant="outline" className="text-xs">
                        {component.variant}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{template.metadata.seo_score}</div>
                <div className="text-sm text-gray-600">SEO Score</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{template.metadata.performance_score}</div>
                <div className="text-sm text-gray-600">Performance</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{template.metadata.accessibility_score}</div>
                <div className="text-sm text-gray-600">Accessibility</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}