'use client';

import { useState, useEffect } from 'react';
import { 
  Grid3X3, 
  List, 
  Star, 
  Users, 
  Download, 
  Eye, 
  Heart,
  ArrowRight,
  Crown,
  Filter,
  SortAsc
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Collection {
  id: string;
  name: string;
  description: string;
  author: {
    name: string;
    avatar?: string;
    verified?: boolean;
  };
  cover_image?: string;
  color?: string;
  component_count: number;
  follower_count: number;
  download_count: number;
  is_official: boolean;
  is_featured: boolean;
  is_curated: boolean;
  featured_position?: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  rating: number;
}

interface CollectionGridProps {
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  onCollectionSelect?: (collection: Collection) => void;
  showFilters?: boolean;
  limit?: number;
}

const collectionsData: Collection[] = [
  {
    id: '1',
    name: 'Essential UI Components',
    description: 'A curated collection of fundamental UI components every developer needs. Includes buttons, inputs, modals, and more.',
    author: { name: 'UI Foundation Team', verified: true },
    cover_image: '/collections/essential-ui.jpg',
    color: '#3B82F6',
    component_count: 24,
    follower_count: 15420,
    download_count: 8750,
    is_official: true,
    is_featured: true,
    is_curated: true,
    featured_position: 1,
    tags: ['UI', 'Fundamental', 'Essential'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    rating: 4.9,
  },
  {
    id: '2',
    name: 'Advanced Form Systems',
    description: 'Comprehensive form components with validation, multi-step forms, file uploads, and dynamic field generation.',
    author: { name: 'Form Experts', verified: true },
    cover_image: '/collections/advanced-forms.jpg',
    color: '#10B981',
    component_count: 18,
    follower_count: 8900,
    download_count: 5200,
    is_official: true,
    is_featured: true,
    is_curated: true,
    featured_position: 2,
    tags: ['Forms', 'Advanced', 'Validation'],
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-14T00:00:00Z',
    rating: 4.8,
  },
  {
    id: '3',
    name: 'Data Visualization Suite',
    description: 'Complete set of charts, graphs, and data display components with interactive features and customization options.',
    author: { name: 'DataViz Team', verified: false },
    cover_image: '/collections/data-viz.jpg',
    color: '#8B5CF6',
    component_count: 32,
    follower_count: 6700,
    download_count: 3400,
    is_official: false,
    is_featured: false,
    is_curated: true,
    featured_position: 3,
    tags: ['Charts', 'Data', 'Visualization'],
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-13T00:00:00Z',
    rating: 4.7,
  },
  {
    id: '4',
    name: 'Navigation & Layout Pack',
    description: 'Modern navigation patterns and layout components including headers, sidebars, breadcrumbs, and responsive grids.',
    author: { name: 'Layout Masters', verified: true },
    cover_image: '/collections/nav-layout.jpg',
    color: '#F59E0B',
    component_count: 15,
    follower_count: 12400,
    download_count: 6800,
    is_official: true,
    is_featured: true,
    is_curated: true,
    featured_position: 4,
    tags: ['Navigation', 'Layout', 'Responsive'],
    created_at: '2024-01-04T00:00:00Z',
    updated_at: '2024-01-12T00:00:00Z',
    rating: 4.6,
  },
  {
    id: '5',
    name: 'Accessibility First Components',
    description: 'WCAG AA/AAA compliant components designed with accessibility as the primary focus. Perfect for government and enterprise applications.',
    author: { name: 'A11y Champions', verified: true },
    cover_image: '/collections/accessibility.jpg',
    color: '#EF4444',
    component_count: 28,
    follower_count: 5600,
    download_count: 2900,
    is_official: true,
    is_featured: false,
    is_curated: true,
    tags: ['Accessibility', 'WCAG', 'Inclusive'],
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-11T00:00:00Z',
    rating: 4.9,
  },
  {
    id: '6',
    name: 'E-commerce Component Kit',
    description: 'Specialized components for e-commerce applications including product cards, shopping carts, checkout flows, and payment forms.',
    author: { name: 'E-commerce Pro', verified: false },
    cover_image: '/collections/ecommerce.jpg',
    color: '#EC4899',
    component_count: 22,
    follower_count: 7300,
    download_count: 3800,
    is_official: false,
    is_featured: false,
    is_curated: false,
    tags: ['E-commerce', 'Shopping', 'Payment'],
    created_at: '2024-01-06T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z',
    rating: 4.5,
  },
];

export function CollectionGrid({ 
  viewMode = 'grid', 
  onViewModeChange,
  onCollectionSelect,
  showFilters = true,
  limit 
}: CollectionGridProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'popularity' | 'newest' | 'rating'>('popularity');
  const [filterBy, setFilterBy] = useState<'all' | 'official' | 'featured' | 'curated'>('all');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      let filteredCollections = [...collectionsData];

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredCollections = filteredCollections.filter(collection =>
          collection.name.toLowerCase().includes(query) ||
          collection.description.toLowerCase().includes(query) ||
          collection.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      // Apply collection type filter
      switch (filterBy) {
        case 'official':
          filteredCollections = filteredCollections.filter(c => c.is_official);
          break;
        case 'featured':
          filteredCollections = filteredCollections.filter(c => c.is_featured);
          break;
        case 'curated':
          filteredCollections = filteredCollections.filter(c => c.is_curated);
          break;
      }

      // Apply sorting
      filteredCollections.sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'popularity':
            return b.follower_count - a.follower_count;
          case 'newest':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          case 'rating':
            return b.rating - a.rating;
          default:
            return 0;
        }
      });

      if (limit) {
        filteredCollections = filteredCollections.slice(0, limit);
      }

      setCollections(filteredCollections);
      setLoading(false);
    }, 300);
  }, [searchQuery, sortBy, filterBy, limit]);

  const handleCollectionSelect = (collection: Collection) => {
    onCollectionSelect?.(collection);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {showFilters && (
          <div className="flex gap-4">
            <div className="h-10 w-64 bg-muted rounded" />
            <div className="h-10 w-32 bg-muted rounded" />
            <div className="h-10 w-32 bg-muted rounded" />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-32 bg-muted rounded mb-3" />
                <div className="h-5 w-3/4 bg-muted rounded mb-2" />
                <div className="h-4 w-full bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <div className="h-4 w-16 bg-muted rounded" />
                  <div className="h-4 w-16 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">
              Component Collections
            </h2>
            <p className="text-muted-foreground">
              {collections.length} collections found
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <Input
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />

            {/* Filter */}
            <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="official">Official</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="curated">Curated</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Popular</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange?.('grid')}
                className="rounded-r-none"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange?.('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Collections Grid */}
      {collections.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Grid3X3 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No collections found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search terms or filters
          </p>
          <Button variant="outline">
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
        }>
          {collections.map((collection) => (
            <Card 
              key={collection.id} 
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20 overflow-hidden"
              onClick={() => handleCollectionSelect(collection)}
            >
              {/* Cover Image */}
              <div 
                className="h-32 relative overflow-hidden"
                style={{ backgroundColor: collection.color }}
              >
                {collection.cover_image ? (
                  <img 
                    src={collection.cover_image} 
                    alt={collection.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Grid3X3 className="w-12 h-12 text-white/80" />
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {collection.is_featured && (
                    <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
                      <Crown className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  {collection.is_official && (
                    <Badge variant="secondary">
                      Official
                    </Badge>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1 mb-1">
                      {collection.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {collection.description}
                    </CardDescription>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {collection.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {collection.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{collection.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Author */}
                <div className="flex items-center gap-2 mb-4">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={collection.author.avatar} alt={collection.author.name} />
                    <AvatarFallback className="text-xs">
                      {collection.author.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">
                    {collection.author.name}
                  </span>
                  {collection.author.verified && (
                    <Badge variant="secondary" className="text-xs">✓</Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground mb-4">
                  <div className="text-center">
                    <div className="font-medium text-foreground">{collection.component_count}</div>
                    <div className="text-xs">Components</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium text-foreground">{collection.rating}</span>
                    </div>
                    <div className="text-xs">Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="w-3 h-3" />
                      <span className="font-medium text-foreground">{collection.follower_count}</span>
                    </div>
                    <div className="text-xs">Followers</div>
                  </div>
                </div>

                {/* Action Button */}
                <Button className="w-full group/btn">
                  View Collection
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Load More */}
      {limit && collections.length === limit && (
        <div className="text-center pt-8">
          <Button variant="outline" size="lg">
            Load More Collections
          </Button>
        </div>
      )}
    </div>
  );
}