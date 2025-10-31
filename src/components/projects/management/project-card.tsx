'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  MoreVertical, 
  Star, 
  StarOff,
  Clock,
  Users,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  PauseCircle,
  Archive
} from 'lucide-react';
import { Project } from './project-grid';

interface ProjectCardProps {
  project: Project;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onUpdate: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onMove: (projectId: string, newFolderId: string) => void;
  onClick: () => void;
  onQuickActionsClick: () => void;
  className?: string;
}

const statusConfig = {
  active: { label: 'Active', color: 'bg-green-500', icon: CheckCircle2 },
  paused: { label: 'Paused', color: 'bg-yellow-500', icon: PauseCircle },
  completed: { label: 'Completed', color: 'bg-blue-500', icon: CheckCircle2 },
  archived: { label: 'Archived', color: 'bg-gray-500', icon: Archive }
};

const priorityConfig = {
  low: { label: 'Low', color: 'bg-gray-500' },
  medium: { label: 'Medium', color: 'bg-blue-500' },
  high: { label: 'High', color: 'bg-orange-500' },
  critical: { label: 'Critical', color: 'bg-red-500' }
};

const healthConfig = {
  healthy: { color: 'text-green-600', icon: CheckCircle2 },
  warning: { color: 'text-yellow-600', icon: AlertTriangle },
  atRisk: { color: 'text-orange-600', icon: AlertTriangle },
  critical: { color: 'text-red-600', icon: XCircle }
};

export function ProjectCard({
  project,
  selected,
  onSelect,
  onUpdate,
  onDelete,
  onMove,
  onClick,
  onQuickActionsClick,
  className
}: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isTogglingStar, setIsTogglingStar] = useState(false);

  const statusInfo = statusConfig[project.status];
  const priorityInfo = priorityConfig[project.priority];
  const healthInfo = healthConfig[project.health];

  const StatusIcon = statusInfo.icon;
  const HealthIcon = healthInfo.icon;

  const handleStarToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTogglingStar(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      onUpdate({
        ...project,
        isStarred: !project.isStarred
      });
    } catch (error) {
      console.error('Failed to toggle star:', error);
    } finally {
      setIsTogglingStar(false);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelect(e.target.checked);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const isOverdue = project.dueDate < new Date() && project.status !== 'completed';
  const daysUntilDue = Math.ceil((project.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card
      className={cn(
        "relative group cursor-pointer transition-all duration-200 hover:shadow-lg",
        selected && "ring-2 ring-primary",
        isOverdue && "border-l-4 border-l-red-500",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Selection Checkbox */}
      <div className={cn(
        "absolute top-3 left-3 z-10 transition-opacity",
        isHovered || selected ? "opacity-100" : "opacity-0"
      )}>
        <input
          type="checkbox"
          checked={selected}
          onChange={handleCheckboxChange}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
      </div>

      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between mb-2">
          <h3 className={cn(
            "font-semibold text-sm line-clamp-2",
            selected ? "text-primary" : "text-foreground"
          )}>
            {project.name}
          </h3>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleStarToggle}
              disabled={isTogglingStar}
            >
              {project.isStarred ? (
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ) : (
                <StarOff className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onQuickActionsClick();
              }}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {project.description}
          </p>
        )}

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {project.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0.5">
                {tag}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                +{project.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Progress</span>
          <span className="text-xs font-medium">{project.progress}%</span>
        </div>
        <Progress value={project.progress} className="h-1.5" />
      </div>

      {/* Status and Priority */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", statusInfo.color)} />
            <span className="text-xs text-muted-foreground">{statusInfo.label}</span>
          </div>
          <div className={cn("w-2 h-2 rounded-full", priorityInfo.color)} />
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-muted/30 border-t">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {/* Left side - Due date and health */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span className={cn(
                isOverdue && "text-red-600 font-medium"
              )}>
                {formatDate(project.dueDate)}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <HealthIcon className={cn("h-3 w-3", healthInfo.color)} />
            </div>
          </div>

          {/* Right side - Stats */}
          <div className="flex items-center gap-3">
            {project.assignee && (
              <div className="flex items-center gap-1" title={`Assigned to ${project.assignee.name}`}>
                <Users className="h-3 w-3" />
                <span>1</span>
              </div>
            )}
            
            <div className="flex items-center gap-1" title={`${project.files} files`}>
              <FileText className="h-3 w-3" />
              <span>{project.files}</span>
            </div>
          </div>
        </div>

        {/* Team info */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{project.team.members} members</span>
          </div>
          
          {project.budget && (
            <div className="text-xs text-muted-foreground">
              {project.budget.currency} {project.budget.spent.toLocaleString()} / {project.budget.allocated.toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
