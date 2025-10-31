'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Star, 
  Users, 
  Download, 
  Eye, 
  Heart,
  ArrowRight,
  Crown,
  Settings,
  Trash2,
  Edit,
  Share,
  Grid3X3,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MyCollection {
  id: string;
  name: string;
  description: string;
  cover_image?: string;
  color?: string;
  component_count: number;
  follower_count: number;
  download_count: number;
  is_public: boolean;
  is_official: boolean;
  is_featured: boolean;
  featured_position?: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  rating: number;
  is_owner: boolean;
}

interface MyCollectionsProps {
  onCreateCollection?: () => void;
  onEditCollection?: (collection: MyCollection) => void;
  onSelectCollection?: (collection: MyCollection) => void;
}

const myCollectionsData: MyCollection[] = [
  {
    id: 'my-1',
    name: 'Dashboard Components',
    description: 'Personal collection of dashboard-specific components including widgets, charts, and status indicators.',
    cover_image: '/collections/my-dashboard.jpg',
    color: '#3B82F6',
    component_count: 12,
    follower_count: 45,
    download_count: 23,
    is_public: true,
    is_official: false,
    is_featured: false,
    tags: ['Dashboard', 'Widgets', 'Analytics'],
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z',
    rating: 4.2,
    is_owner: true,
  },
  {
    id: 'my-2',
    name: 'Admin Panel Essentials',
    description: 'Essential components for admin interfaces including user management, settings, and data tables.',
    cover_image: '/collections/my-admin.jpg',
    color: '#10B981',
    component_count: 8,
    follower_count: 12,
    download_count: 5,
    is_public: false,
    is_official: false,
    is_featured: false,
    tags: ['Admin', 'Management', 'Tables'],
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-22T00:00:00Z',
    rating: 3.8,
    is_owner: true,
  },
  {
    id: 'my-3',
    name: 'Mobile-First Components',
    description: 'Responsive components optimized for mobile devices and touch interactions.',
    cover_image: '/collections/my-mobile.jpg',
    color: '#8B5CF6',
    component_count: 15,
    follower_count: 28,
    download_count: 12,
    is_public: true,
    is_official: false,
    is_featured: false,
    tags: ['Mobile', 'Responsive', 'Touch'],
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-01-25T00:00:00Z',
    rating: 4.5,
    is_owner: true,
  },
];

const favoritedCollections = [
  {
    id: 'fav-1',
    name: 'Essential UI Components',
    description: 'A curated collection of fundamental UI components every developer needs.',
    author: { name: 'UI Foundation Team', verified: true },
    cover_image: '/collections/essential-ui.jpg',
    color: '#3B82F6',
    component_count: 24,
    follower_count: 15420,
    rating: 4.9,
    tags: ['UI', 'Fundamental'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'fav-2',
    name: 'Accessibility First Components',
    description: 'WCAG AA/AAA compliant components designed with accessibility as the primary focus.',
    author: { name: 'A11y Champions', verified: true },
    cover_image: '/collections/accessibility.jpg',
    color: '#EF4444',
    component_count: 28,
    follower_count: 5600,
    rating: 4.9,
    tags: ['Accessibility', 'WCAG'],
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-11T00:00:00Z',
  },
];

export function MyCollections({ 
  onCreateCollection,
  onEditCollection,
  onSelectCollection 
}: MyCollectionsProps) {
  const [collections, setCollections] = useState<MyCollection[]>([]);
  const [favorited, setFavorited] = useState<typeof favoritedCollections>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my-collections');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'updated' | 'popularity'>('updated');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      let sortedCollections = [...myCollectionsData];
      
      switch (sortBy) {
        case 'name':
          sortedCollections.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'updated':
          sortedCollections.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
          break;
        case 'popularity':
          sortedCollections.sort((a, b) => b.follower_count - a.follower_count);
          break;
      }

      setCollections(sortedCollections);
      setFavorited(favoritedCollections);
      setLoading(false);
    }, 300);
  }, [sortBy]);

  const handleSelectCollection = (collection: MyCollection) => {
    onSelectCollection?.(collection);
  };

  const handleEditCollection = (collection: MyCollection, e: React.MouseEvent) => {
    e.stopPropagation();
    onEditCollection?.(collection);
  };

  const handleDeleteCollection = (collectionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // In a real app, this would show a confirmation dialog
    setCollections(prev => prev.filter(c => c.id !== collectionId));
  };

  const toggleCollectionVisibility = (collectionId: string) => {
    setCollections(prev => 
      prev.map(c => 
        c.id === collectionId 
          ? { ...c, is_public: !c.is_public }
          : c
      )
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-10 w-32 bg-muted rounded" />
        </div>
        <Tabs value={activeTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-collections">My Collections</TabsTrigger>
            <TabsTrigger value="favorited">Favorited</TabsTrigger>
          </TabsList>
          <TabsContent value="my-collections" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
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
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">My Collections</h2>
          <p className="text-muted-foreground">
            Manage your component collections
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Recently Updated</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="popularity">Most Popular</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          <Button onClick={onCreateCollection}>
            <Plus className="w-4 h-4 mr-2" />
            New Collection
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-collections">
            My Collections ({collections.length})
          </TabsTrigger>
          <TabsTrigger value="favorited">
            Favorited ({favorited.length})
          </TabsTrigger>
        </TabsList>

        {/* My Collections Tab */}
        <TabsContent value="my-collections" className="space-y-6">
          {collections.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No collections yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first collection to organize your favorite components
              </p>
              <Button onClick={onCreateCollection}>
                <Plus className="w-4 h-4 mr-2" />
                Create Collection
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
                  onClick={() => handleSelectCollection(collection)}
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
                      {collection.is_public ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                          Private
                        </Badge>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="h-8 w-8 p-0"
                        onClick={(e) => handleEditCollection(collection, e)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="h-8 w-8 p-0"
                        onClick={(e) => handleDeleteCollection(collection.id, e)}
                      >
                        <Trash2 className="w-4 h-4" />
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

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button className="flex-1 group/btn">
                        View Collection
                        <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCollectionVisibility(collection.id);
                        }}
                        title={collection.is_public ? 'Make Private' : 'Make Public'}
                      >
                        <Share className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Favorited Collections Tab */}
        <TabsContent value="favorited" className="space-y-6">
          {favorited.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No favorited collections</h3>
              <p className="text-muted-foreground mb-4">
                Favorite collections to access them quickly
              </p>
              <Button variant="outline">
                Browse Collections
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorited.map((collection) => (
                <Card 
                  key={collection.id} 
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20 overflow-hidden"
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

                    {/* Heart Badge */}
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-red-500 hover:bg-red-600 text-white">
                        <Heart className="w-3 h-3 mr-1 fill-current" />
                        Favorite
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1 mb-1">
                      {collection.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {collection.description}
                    </CardDescription>

                    {/* Author */}
                    <div className="flex items-center gap-2 mt-2">
                      <Avatar className="h-6 w-6">
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

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {collection.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}