'use client';

import { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Link, 
  Mail,
  Users,
  Eye,
  Download,
  Star,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CollectionShareProps {
  collection: {
    id: string;
    name: string;
    description: string;
    author: {
      name: string;
      avatar?: string;
    };
    component_count: number;
    follower_count: number;
    rating: number;
    is_public: boolean;
    tags: string[];
  };
  shareUrl: string;
  onClose?: () => void;
}

export function CollectionShare({ collection, shareUrl, onClose }: CollectionShareProps) {
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [customMessage, setCustomMessage] = useState('');

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [type]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [type]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareText = `Check out "${collection.name}" - ${collection.description} ${shareUrl}`;
  
  const socialUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(`Check out ${collection.name}`)}&body=${encodeURIComponent(shareText + (customMessage ? `\n\n${customMessage}` : ''))}`,
  };

  const embedCode = `<iframe 
  src="${shareUrl}" 
  width="600" 
  height="400" 
  frameborder="0" 
  scrolling="no" 
  allowtransparency="true">
</iframe>`;

  const markdownCode = `[![${collection.name}](${shareUrl}/preview)](${shareUrl})

> ${collection.description}

**Components:** ${collection.component_count}  
**Rating:** ${collection.rating}/5 ⭐  
**Tags:** ${collection.tags.join(', ')}

[View Collection](${shareUrl})`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Share Collection</h2>
        <p className="text-muted-foreground">
          Share "{collection.name}" with the community
        </p>
      </div>

      {/* Collection Preview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
              <Share2 className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{collection.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{collection.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{collection.component_count} components</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{collection.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{collection.is_public ? 'Public' : 'Private'}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mt-2">
                {collection.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Options */}
      <Tabs defaultValue="link" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="link">Link</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="embed">Embed</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        {/* Link Sharing */}
        <TabsContent value="link" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Share Link</CardTitle>
              <CardDescription>
                Copy and share the direct link to your collection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Collection URL</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(shareUrl, 'link')}
                  >
                    {copiedStates.link ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label>Custom Message (Optional)</Label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Add a personal message..."
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-sm"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => copyToClipboard(shareText, 'custom')}
                  className="flex-1"
                >
                  Copy with Message
                </Button>
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(shareUrl + (customMessage ? `\n\n${customMessage}` : ''), 'custom-message')}
                >
                  {copiedStates['custom-message'] ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media */}
        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Share on Social Media</CardTitle>
              <CardDescription>
                Share directly to your favorite platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => window.open(socialUrls.twitter, '_blank')}
                >
                  <div className="flex items-center gap-3 w-full">
                    <Twitter className="w-5 h-5 text-blue-400" />
                    <div className="text-left">
                      <div className="font-medium">Share on Twitter</div>
                      <div className="text-sm text-muted-foreground">Post to Twitter</div>
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => window.open(socialUrls.facebook, '_blank')}
                >
                  <div className="flex items-center gap-3 w-full">
                    <Facebook className="w-5 h-5 text-blue-600" />
                    <div className="text-left">
                      <div className="font-medium">Share on Facebook</div>
                      <div className="text-sm text-muted-foreground">Post to Facebook</div>
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => window.open(socialUrls.linkedin, '_blank')}
                >
                  <div className="flex items-center gap-3 w-full">
                    <Linkedin className="w-5 h-5 text-blue-700" />
                    <div className="text-left">
                      <div className="font-medium">Share on LinkedIn</div>
                      <div className="text-sm text-muted-foreground">Post to LinkedIn</div>
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => window.open(socialUrls.email, '_blank')}
                >
                  <div className="flex items-center gap-3 w-full">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <div className="text-left">
                      <div className="font-medium">Share via Email</div>
                      <div className="text-sm text-muted-foreground">Send via email</div>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Embed */}
        <TabsContent value="embed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Embed Collection</CardTitle>
              <CardDescription>
                Embed this collection in your website or blog
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>HTML Embed Code</Label>
                <div className="relative">
                  <textarea
                    value={embedCode}
                    readOnly
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-muted font-mono text-sm"
                    rows={6}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(embedCode, 'embed')}
                  >
                    {copiedStates.embed ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label>Preview</Label>
                <div className="mt-1 p-4 border rounded-lg bg-muted/20">
                  <iframe
                    src="data:text/html;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCI+PC9zdmc+"
                    className="w-full h-32 border rounded"
                    title="Collection Preview"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export */}
        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Export Collection</CardTitle>
              <CardDescription>
                Export collection data in various formats
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">Download JSON</div>
                      <div className="text-sm text-muted-foreground">Collection data</div>
                    </div>
                  </div>
                </Button>

                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">Download CSV</div>
                      <div className="text-sm text-muted-foreground">Component list</div>
                    </div>
                  </div>
                </Button>

                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">Download ZIP</div>
                      <div className="text-sm text-muted-foreground">All components</div>
                    </div>
                  </div>
                </Button>

                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">Export README</div>
                      <div className="text-sm text-muted-foreground">Markdown file</div>
                    </div>
                  </div>
                </Button>
              </div>

              <div>
                <Label>Markdown README</Label>
                <div className="relative">
                  <textarea
                    value={markdownCode}
                    readOnly
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-muted font-mono text-sm"
                    rows={10}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(markdownCode, 'markdown')}
                  >
                    {copiedStates.markdown ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Collection Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{collection.component_count}</div>
              <div className="text-sm text-muted-foreground">Components</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{collection.follower_count}</div>
              <div className="text-sm text-muted-foreground">Followers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{collection.rating}</div>
              <div className="text-sm text-muted-foreground">Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Actions */}
      <div className="flex gap-3">
        <Button 
          className="flex-1"
          onClick={() => {
            copyToClipboard(shareUrl, 'footer');
            if (onClose) onClose();
          }}
        >
          <Link className="w-4 h-4 mr-2" />
          Copy Link & Close
        </Button>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}