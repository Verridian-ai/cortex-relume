'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Star,
  StarOff,
  Users,
  FileText,
  Calendar,
  Zap
} from 'lucide-react';

// Loading skeleton for project cards
export function ProjectCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-6 w-6 rounded" />
          </div>
        </div>

        {/* Description */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />

        {/* Tags */}
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>

        {/* Status and Priority */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-3 w-3 rounded-full" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-8" />
          </div>
        </div>
      </div>
    </Card>
  );
}

// Loading skeleton for project list
export function ProjectListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="border rounded-lg bg-card">
      {/* Header */}
      <div className="border-b bg-muted/30 p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-4" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-20" />
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <Skeleton className="h-4 w-4" />
            
            {/* Project Name */}
            <div className="flex items-center gap-2 flex-1">
              <Skeleton className="h-4 w-4" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>

            {/* Status */}
            <Skeleton className="h-4 w-16" />

            {/* Priority */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 w-12" />
            </div>

            {/* Progress */}
            <Skeleton className="h-4 w-20" />

            {/* Assignee */}
            <Skeleton className="h-6 w-24" />

            {/* Due Date */}
            <Skeleton className="h-4 w-24" />

            {/* Team */}
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-4" />
            </div>

            {/* Health */}
            <Skeleton className="h-4 w-4" />

            {/* Actions */}
            <Skeleton className="h-6 w-6" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Loading skeleton for project detail modal
export function ProjectDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20" />
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Progress Section */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-2 w-full" />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-12" />
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-16 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Loading skeleton for project stats
export function ProjectStatsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-6 w-12" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-2 w-full" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Additional stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-6" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="space-y-1">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Optimistic update component
interface OptimisticUpdateProps {
  isOptimistic: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function OptimisticUpdate({ 
  isOptimistic, 
  children, 
  fallback 
}: OptimisticUpdateProps) {
  if (isOptimistic && fallback) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Project action feedback
interface ProjectActionFeedbackProps {
  projectId: string;
  action: 'create' | 'update' | 'delete' | 'move' | 'star' | 'unstar';
  isLoading?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function ProjectActionFeedback({
  projectId,
  action,
  isLoading = false,
  isSuccess = false,
  isError = false,
  onRetry,
  onDismiss,
  className
}: ProjectActionFeedbackProps) {
  const getActionText = () => {
    switch (action) {
      case 'create':
        return 'Creating project...';
      case 'update':
        return 'Updating project...';
      case 'delete':
        return 'Deleting project...';
      case 'move':
        return 'Moving project...';
      case 'star':
        return 'Adding to favorites...';
      case 'unstar':
        return 'Removing from favorites...';
      default:
        return 'Processing...';
    }
  };

  const getSuccessText = () => {
    switch (action) {
      case 'create':
        return 'Project created successfully';
      case 'update':
        return 'Project updated successfully';
      case 'delete':
        return 'Project deleted successfully';
      case 'move':
        return 'Project moved successfully';
      case 'star':
        return 'Added to favorites';
      case 'unstar':
        return 'Removed from favorites';
      default:
        return 'Action completed successfully';
    }
  };

  const getErrorText = () => {
    switch (action) {
      case 'create':
        return 'Failed to create project';
      case 'update':
        return 'Failed to update project';
      case 'delete':
        return 'Failed to delete project';
      case 'move':
        return 'Failed to move project';
      case 'star':
        return 'Failed to add to favorites';
      case 'unstar':
        return 'Failed to remove from favorites';
      default:
        return 'Action failed';
    }
  };

  if (isLoading) {
    return (
      <div className={cn(
        "flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg",
        className
      )}>
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        <span className="text-sm text-blue-700 dark:text-blue-300">
          {getActionText()}
        </span>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className={cn(
        "flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg",
        className
      )}>
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <span className="text-sm text-green-700 dark:text-green-300">
          {getSuccessText()}
        </span>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1 ml-auto"
            onClick={onDismiss}
          >
            <span className="sr-only">Dismiss</span>
            ×
          </Button>
        )}
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn(
        "flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg",
        className
      )}>
        <AlertCircle className="h-4 w-4 text-red-600" />
        <span className="text-sm text-red-700 dark:text-red-300 flex-1">
          {getErrorText()}
        </span>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="h-auto py-1 px-2"
          >
            Retry
          </Button>
        )}
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1"
            onClick={onDismiss}
          >
            <span className="sr-only">Dismiss</span>
            ×
          </Button>
        )}
      </div>
    );
  }

  return null;
}

// Bulk action feedback
interface BulkActionFeedbackProps {
  action: string;
  totalItems: number;
  completedItems: number;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  errors?: string[];
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function BulkActionFeedback({
  action,
  totalItems,
  completedItems,
  isLoading,
  isSuccess,
  isError,
  errors = [],
  onRetry,
  onDismiss,
  className
}: BulkActionFeedbackProps) {
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  if (isLoading) {
    return (
      <Card className={cn("p-4", className)}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Processing {totalItems} items...</span>
          <span className="text-xs text-muted-foreground">
            {completedItems} / {totalItems}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">
          Please wait while we process your request.
        </p>
      </Card>
    );
  }

  if (isSuccess) {
    return (
      <Card className={cn("p-4 border-green-200 dark:border-green-800", className)}>
        <div className="flex items-center gap-2 text-green-600 mb-2">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm font-medium">
            Successfully processed {completedItems} of {totalItems} items
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          All {action.toLowerCase()} operations completed successfully.
        </p>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1 mt-2"
            onClick={onDismiss}
          >
            Dismiss
          </Button>
        )}
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className={cn("p-4 border-red-200 dark:border-red-800", className)}>
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-medium">
            {errors.length > 0 
              ? `Failed to process ${errors.length} of ${totalItems} items`
              : 'Bulk action failed'
            }
          </span>
        </div>
        
        {errors.length > 0 && (
          <div className="space-y-1">
            {errors.slice(0, 3).map((error, index) => (
              <p key={index} className="text-xs text-red-600 dark:text-red-400">
                • {error}
              </p>
            ))}
            {errors.length > 3 && (
              <p className="text-xs text-muted-foreground">
                And {errors.length - 3} more errors...
              </p>
            )}
          </div>
        )}

        <div className="flex gap-2 mt-3">
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
            >
              Retry
            </Button>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
            >
              Dismiss
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return null;
}

// Optimistic project card update
interface OptimisticProjectCardProps {
  project: any;
  optimisticProject?: any;
  isUpdating: boolean;
  children: React.ReactNode;
}

export function OptimisticProjectCard({
  project,
  optimisticProject,
  isUpdating,
  children
}: OptimisticProjectCardProps) {
  const displayProject = isUpdating && optimisticProject ? optimisticProject : project;

  return (
    <div className={cn(
      "transition-all duration-200",
      isUpdating && "opacity-50 scale-[0.98]"
    )}>
      {React.cloneElement(children as React.ReactElement, { project: displayProject })}
    </div>
  );
}

// Skeleton component (to be added to ui components)
export { Skeleton } from '@/components/ui/skeleton';
