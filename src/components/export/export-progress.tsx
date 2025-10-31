'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Component } from '@/types/component';
import { 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Package,
  FileCode,
  Layers,
  Globe,
  Code2
} from 'lucide-react';

export interface ExportProgressProps {
  status: 'idle' | 'exporting' | 'complete' | 'error';
  progress: number;
  error?: string;
  components: string[];
  formats: Array<{
    id: string;
    name: string;
    description: string;
    icon: React.ComponentType<any>;
    selected: boolean;
    options?: any;
  }>;
}

export interface ExportStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  progress: number;
  startTime?: Date;
  endTime?: Date;
}

export function ExportProgress({ 
  status, 
  progress, 
  error, 
  components, 
  formats 
}: ExportProgressProps) {
  const [steps, setSteps] = React.useState<ExportStep[]>([]);
  const [currentStep, setCurrentStep] = React.useState<string>('');
  const [exportSummary, setExportSummary] = React.useState<any>(null);

  React.useEffect(() => {
    if (status === 'exporting') {
      initializeSteps();
    }
  }, [status, components, formats]);

  const initializeSteps = () => {
    const initialSteps: ExportStep[] = [
      {
        id: 'preparing',
        name: 'Preparing Components',
        description: 'Analyzing component structure and dependencies',
        status: 'pending',
        progress: 0,
      },
      {
        id: 'exporting',
        name: 'Exporting Formats',
        description: 'Generating code and assets for selected formats',
        status: 'pending',
        progress: 0,
      },
      {
        id: 'compressing',
        name: 'Creating Archive',
        description: 'Packaging files into downloadable archive',
        status: 'pending',
        progress: 0,
      },
      {
        id: 'complete',
        name: 'Export Complete',
        description: 'Your components are ready for download',
        status: 'pending',
        progress: 0,
      },
    ];

    setSteps(initialSteps);
    setCurrentStep('preparing');
  };

  const getStatusIcon = (stepStatus: ExportStep['status']) => {
    switch (stepStatus) {
      case 'pending':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'running':
        return <Download className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (stepStatus: ExportStep['status']) => {
    switch (stepStatus) {
      case 'pending':
        return 'border-muted';
      case 'running':
        return 'border-blue-500 bg-blue-50';
      case 'complete':
        return 'border-green-500 bg-green-50';
      case 'error':
        return 'border-red-500 bg-red-50';
      default:
        return 'border-muted';
    }
  };

  const formatDuration = (start?: Date, end?: Date) => {
    if (!start || !end) return '';
    const diff = end.getTime() - start.getTime();
    if (diff < 1000) return `${diff}ms`;
    if (diff < 60000) return `${Math.round(diff / 1000)}s`;
    return `${Math.round(diff / 60000)}m`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const renderStatusContent = () => {
    if (status === 'error' && error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Export Failed:</strong> {error}
          </AlertDescription>
        </Alert>
      );
    }

    if (status === 'complete') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Export Complete!</h3>
            <p className="text-muted-foreground">
              Your components have been successfully exported and are ready for download.
            </p>
          </div>

          {exportSummary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{exportSummary.componentCount}</div>
                <div className="text-sm text-muted-foreground">Components</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{exportSummary.formatCount}</div>
                <div className="text-sm text-muted-foreground">Formats</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{exportSummary.fileCount}</div>
                <div className="text-sm text-muted-foreground">Files</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{formatFileSize(exportSummary.totalSize)}</div>
                <div className="text-sm text-muted-foreground">Archive Size</div>
              </Card>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-medium">Exported Formats:</h4>
            <div className="flex flex-wrap gap-2">
              {formats.map((format) => {
                const Icon = format.icon;
                return (
                  <Badge key={format.id} variant="outline" className="flex items-center gap-1">
                    <Icon className="h-3 w-3" />
                    {format.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Export Steps */}
        <div className="space-y-4">
          <h4 className="font-medium">Export Steps</h4>
          <div className="space-y-3">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`border rounded-lg p-4 transition-colors ${getStatusColor(step.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(step.status)}
                    <div>
                      <div className="font-medium">{step.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{step.progress}%</div>
                    {step.startTime && (
                      <div className="text-xs text-muted-foreground">
                        {formatDuration(step.startTime, step.endTime)}
                      </div>
                    )}
                  </div>
                </div>
                
                {step.status === 'running' && (
                  <div className="mt-3">
                    <Progress value={step.progress} className="h-1" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Component Details */}
        <div className="space-y-3">
          <h4 className="font-medium">Processing Components</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
            {components.map((componentId, index) => (
              <div key={componentId} className="flex items-center space-x-2 text-sm">
                <Package className="h-3 w-3 text-muted-foreground" />
                <span className="truncate">Component {index + 1}</span>
                <Badge variant="secondary" className="text-xs ml-auto">
                  Processing...
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Current Operation */}
        {currentStep && (
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Download className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">
                {steps.find(s => s.id === currentStep)?.description || 'Processing...'}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">
          {status === 'complete' ? 'Export Complete' : 'Exporting Components'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {status === 'exporting' 
            ? 'Please wait while we process your components...'
            : status === 'complete'
            ? 'Your components are ready for download'
            : 'Preparing export...'
          }
        </p>
      </div>

      {/* Status Content */}
      {renderStatusContent()}

      {/* Export Stats */}
      {status !== 'idle' && (
        <Card className="p-4">
          <h4 className="font-medium mb-3">Export Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Components</div>
              <div className="font-medium">{components.length}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Formats</div>
              <div className="font-medium">{formats.length}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Estimated Files</div>
              <div className="font-medium">
                {components.length * formats.length + formats.length}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
