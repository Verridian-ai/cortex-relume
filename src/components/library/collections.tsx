'use client';

import React, { useState } from 'react';
import { Plus, Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Collection {
  id: string;
  name: string;
  description: string;
  componentCount: number;
  createdAt: string;
}

export default function CollectionsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [collections] = useState<Collection[]>([]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Collections</h1>
          <p className="text-muted-foreground">Manage your component collections</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Collection
          </Button>
        </div>
      </div>

      {collections.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Grid3X3 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No collections yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first collection to organize components
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Collection
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {/* Collections will be rendered here */}
        </div>
      )}
    </div>
  );
}