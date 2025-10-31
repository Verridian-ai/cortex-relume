'use client';

import { useState, useEffect } from 'react';
import { 
  Star, 
  Download, 
  Eye, 
  Heart, 
  Share, 
  Copy, 
  Check, 
  Code, 
  Play, 
  ExternalLink,
  GitBranch,
  Shield,
  Zap,
  Users,
  Clock,
  Globe,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ComponentData {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  framework: string;
  rating: number;
  review_count: number;
  usage_count: number;
  downloads: number;
  version: string;
  last_updated: string;
  complexity_score: number;
  accessibility_score: number;
  performance_score: number;
  author: {
    name: string;
    avatar?: string;
    bio?: string;
    verified?: boolean;
  };
  tags: string[];
  framework_versions: Record<string, string>;
  dependencies: Array<{ name: string; version: string; type: string }>;
  preview_url?: string;
  code_examples: {
    basic: string;
    advanced: string;
  };
}

interface ComponentDetailViewProps {
  component: ComponentData;
}

export function ComponentDetailView({ component }: ComponentDetailViewProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [previewProps, setPreviewProps] = useState({
    variant: 'primary',
    size: 'md',
    disabled: false,
  });

  useEffect(() => {
    // Check if component is liked/followed from localStorage or API
    const liked = localStorage.getItem(`liked-${component.id}`);
    const following = localStorage.getItem(`following-${component.author.name}`);
    setIsLiked(liked === 'true');
    setIsFollowing(following === 'true');
  }, [component.id, component.author.name]);

  const handleLike = () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    localStorage.setItem(`liked-${component.id}`, newLiked.toString());
    // In a real app, this would make an API call
  };

  const handleFollow = () => {
    const newFollowing = !isFollowing;
    setIsFollowing(newFollowing);
    localStorage.setItem(`following-${component.author.name}`, newFollowing.toString());
    // In a real app, this would make an API call
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(type);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const installCommand = `npm install @cortex-relume/${component.slug}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{component.category}</Badge>
                <Badge variant="outline">{component.framework}</Badge>
                <Badge variant="outline">v{component.version}</Badge>
              </div>
              
              <h1 className="text-3xl font-bold">{component.name}</h1>
              
              <p className="text-lg text-muted-foreground max-w-3xl">
                {component.description}
              </p>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-foreground">{component.rating}</span>
                  <span>({component.review_count} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{component.usage_count.toLocaleString()} uses</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  <span>{component.downloads.toLocaleString()} downloads</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLike}
                className={isLiked ? 'text-red-500 border-red-200' : ''}
              >
                <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked ? 'Liked' : 'Like'}
              </Button>
              <Button variant="outline" size="sm">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {component.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Live Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Live Preview
            </CardTitle>
            <CardDescription>
              Try different props and configurations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-6 bg-muted/20 min-h-[200px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
                  <Code className="w-12 h-12 text-primary" />
                </div>
                <p className="text-muted-foreground">
                  Interactive preview coming soon
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex gap-2 justify-center">
                    <Button
                      size="sm"
                      variant={previewProps.variant === 'primary' ? 'default' : 'outline'}
                      onClick={() => setPreviewProps(prev => ({ ...prev, variant: 'primary' }))}
                    >
                      Primary
                    </Button>
                    <Button
                      size="sm"
                      variant={previewProps.variant === 'secondary' ? 'default' : 'outline'}
                      onClick={() => setPreviewProps(prev => ({ ...prev, variant: 'secondary' }))}
                    >
                      Secondary
                    </Button>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPreviewProps(prev => ({ ...prev, size: 'sm' }))}
                    >
                      Small
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPreviewProps(prev => ({ ...prev, size: 'md' }))}
                    >
                      Medium
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPreviewProps(prev => ({ ...prev, size: 'lg' }))}
                    >
                      Large
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documentation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="installation">Installation</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
            <TabsTrigger value="props">Props & API</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {component.description}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Features</h3>
              <ul className="space-y-2">
                {[
                  'Accessible and keyboard navigable',
                  'TypeScript support with full type definitions',
                  'Customizable styling with CSS variables',
                  'Tree-shakeable for optimal bundle size',
                  'Comprehensive test coverage',
                  'Documented with interactive examples',
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="installation" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Installation</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Using npm:</p>
                  <div className="bg-muted p-3 rounded-lg font-mono text-sm relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-6 px-2"
                      onClick={() => copyToClipboard(installCommand, 'npm')}
                    >
                      {copiedCode === 'npm' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                    <code>{installCommand}</code>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Using yarn:</p>
                  <div className="bg-muted p-3 rounded-lg font-mono text-sm">
                    <code>yarn add @cortex-relume/{component.slug}</code>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Requirements</h3>
              <div className="space-y-2">
                {Object.entries(component.framework_versions).map(([framework, version]) => (
                  <div key={framework} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <span className="capitalize">{framework}</span>
                    <Badge variant="outline">{version}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {component.dependencies.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Dependencies</h3>
                <div className="space-y-2">
                  {component.dependencies.map((dep, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <span>{dep.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{dep.version}</Badge>
                        <Badge variant="secondary" className="text-xs">{dep.type}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="examples" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Basic Usage</h3>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-6 px-2"
                  onClick={() => copyToClipboard(component.code_examples.basic, 'basic')}
                >
                  {copiedCode === 'basic' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
                <ScrollArea className="h-[400px]">
                  <pre className="whitespace-pre-wrap">
                    <code>{component.code_examples.basic}</code>
                  </pre>
                </ScrollArea>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Advanced Usage</h3>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-6 px-2"
                  onClick={() => copyToClipboard(component.code_examples.advanced, 'advanced')}
                >
                  {copiedCode === 'advanced' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
                <ScrollArea className="h-[400px]">
                  <pre className="whitespace-pre-wrap">
                    <code>{component.code_examples.advanced}</code>
                  </pre>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="props" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Props</h3>
              <div className="space-y-4">
                {[
                  {
                    name: 'variant',
                    type: 'primary | secondary | outline',
                    default: 'primary',
                    description: 'Visual style variant of the component'
                  },
                  {
                    name: 'size',
                    type: 'sm | md | lg',
                    default: 'md',
                    description: 'Size of the component'
                  },
                  {
                    name: 'disabled',
                    type: 'boolean',
                    default: 'false',
                    description: 'Whether the component is disabled'
                  },
                  {
                    name: 'onClick',
                    type: '() => void',
                    default: '-',
                    description: 'Click event handler'
                  },
                ].map((prop, index) => (
                  <div key={index} className="border border-border/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <code className="font-semibold">{prop.name}</code>
                      <Badge variant="outline">{prop.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{prop.description}</p>
                    <div className="text-xs text-muted-foreground">
                      Default: <code className="bg-muted px-1 rounded">{prop.default}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Quick Actions */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <Button size="lg" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download Component
            </Button>
            
            <Button variant="outline" size="lg" className="w-full">
              <ExternalLink className="w-4 h-4 mr-2" />
              View on GitHub
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="ghost" size="sm" className="w-full">
                <GitBranch className="w-4 h-4 mr-2" />
                Fork
              </Button>
              <Button variant="ghost" size="sm" className="w-full">
                <AlertCircle className="w-4 h-4 mr-2" />
                Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Author Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Author</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="flex items-start gap-3 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={component.author.avatar} alt={component.author.name} />
                <AvatarFallback>
                  {component.author.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{component.author.name}</h4>
                  {component.author.verified && (
                    <Badge variant="secondary" className="text-xs">Verified</Badge>
                  )}
                </div>
                {component.author.bio && (
                  <p className="text-sm text-muted-foreground">
                    {component.author.bio}
                  </p>
                )}
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={handleFollow}
            >
              {isFollowing ? 'Following' : 'Follow Author'}
            </Button>
          </CardContent>
        </Card>

        {/* Component Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Component Stats</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-sm">Accessibility</span>
              </div>
              <Badge variant="secondary">{component.accessibility_score}%</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Performance</span>
              </div>
              <Badge variant="secondary">{component.performance_score}%</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-500" />
                <span className="text-sm">Complexity</span>
              </div>
              <Badge variant="secondary">{component.complexity_score}/5</Badge>
            </div>

            <Separator />

            <div className="flex items-center justify-between text-sm">
              <span>Version</span>
              <span className="font-mono">{component.version}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span>Last Updated</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{component.last_updated}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-3">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <BookOpen className="w-4 h-4 mr-2" />
              View Documentation
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Globe className="w-4 h-4 mr-2" />
              Live Demo
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Users className="w-4 h-4 mr-2" />
              Community
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}