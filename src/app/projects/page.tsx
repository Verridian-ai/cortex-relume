'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ProjectsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage your website projects</p>
        </div>
        
        <Button>
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </Button>
      </div>

      <Card className="p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <svg className="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Welcome to Cortex Relume</h3>
          <p className="text-muted-foreground mb-6">
            Your AI-powered website design accelerator is ready!
          </p>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">✅ AI Site Builder</p>
            <p className="text-sm text-muted-foreground">✅ Component Library</p>
            <p className="text-sm text-muted-foreground">✅ Project Management</p>
            <p className="text-sm text-muted-foreground">✅ User Dashboard</p>
          </div>
        </div>
      </Card>
    </div>
  );
}