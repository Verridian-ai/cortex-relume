'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ComponentSelection } from './component-selection';
import { ExportFormats } from './export-formats';
import { ExportProgress } from './export-progress';
import { BulkExport } from './bulk-export';
import { Component } from '@/types/component';
import { 
  Download, 
  Package, 
  FileText, 
  Code, 
  Settings,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  components: Component[];
  onExport: (config: ExportConfig) => void;
}

export interface ExportConfig {
  selectedComponents: string[];
  formats: ExportFormat[];
  options: ExportOptions;
  bulkExport: boolean;
}

export interface ExportFormat {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  selected: boolean;
  options: any;
}

export interface ExportOptions {
  includeCSS: boolean;
  includeJS: boolean;
  minify: boolean;
  framework: string;
  responsive: boolean;
  semantic: boolean;
}

type Step = 'select' | 'configure' | 'export' | 'complete';

export function ExportModal({ isOpen, onClose, components, onExport }: ExportModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('select');
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [formats, setFormats] = useState<ExportFormat[]>([]);
  const [options, setOptions] = useState<ExportOptions>({
    includeCSS: true,
    includeJS: false,
    minify: false,
    framework: 'react',
    responsive: true,
    semantic: true,
  });
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'complete' | 'error'>('idle');
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  const steps = [
    { id: 'select', name: 'Select Components', icon: Package },
    { id: 'configure', name: 'Configure Export', icon: Settings },
    { id: 'export', name: 'Export', icon: Download },
    { id: 'complete', name: 'Complete', icon: CheckCircle },
  ] as const;

  if (!isOpen) return null;

  const handleNext = () => {
    switch (currentStep) {
      case 'select':
        if (selectedComponents.length > 0) {
          setCurrentStep('configure');
        }
        break;
      case 'configure':
        if (formats.some(f => f.selected)) {
          setCurrentStep('export');
          handleExport();
        }
        break;
      case 'complete':
        onClose();
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'configure':
        setCurrentStep('select');
        break;
      case 'export':
        setCurrentStep('configure');
        break;
    }
  };

  const handleExport = async () => {
    setExportStatus('exporting');
    setExportProgress(0);
    setError('');

    try {
      const config: ExportConfig = {
        selectedComponents,
        formats: formats.filter(f => f.selected),
        options,
        bulkExport: selectedComponents.length > 1,
      };

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      await onExport(config);

      clearInterval(progressInterval);
      setExportProgress(100);
      setExportStatus('complete');
      setCurrentStep('complete');
    } catch (err) {
      setExportStatus('error');
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  const handleFormatChange = (formatId: string, selected: boolean, options?: any) => {
    setFormats(prev => prev.map(format => 
      format.id === formatId 
        ? { ...format, selected, options: options || format.options }
        : format
    ));
  };

  const getCurrentStepIndex = () => steps.findIndex(step => step.id === currentStep);

  const renderStepContent = () => {
    switch (currentStep) {
      case 'select':
        return (
          <ComponentSelection
            components={components}
            selectedComponents={selectedComponents}
            onSelectionChange={setSelectedComponents}
          />
        );

      case 'configure':
        return (
          <div className="space-y-6">
            <ExportFormats
              formats={formats}
              onFormatChange={handleFormatChange}
              options={options}
              onOptionsChange={setOptions}
            />
            {selectedComponents.length > 1 && (
              <BulkExport
                selectedCount={selectedComponents.length}
                onBulkOptionsChange={(bulkOptions) => {
                  // Handle bulk export options
                }}
              />
            )}
          </div>
        );

      case 'export':
        return (
          <ExportProgress
            status={exportStatus}
            progress={exportProgress}
            error={error}
            components={selectedComponents}
            formats={formats.filter(f => f.selected)}
          />
        );

      case 'complete':
        return (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Export Complete!</h3>
            <p className="text-muted-foreground mb-6">
              Your components have been exported successfully.
            </p>
            {downloadUrl && (
              <Button onClick={() => window.open(downloadUrl, '_blank')}>
                <Download className="h-4 w-4 mr-2" />
                Download Files
              </Button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const isNextDisabled = () => {
    switch (currentStep) {
      case 'select':
        return selectedComponents.length === 0;
      case 'configure':
        return formats.filter(f => f.selected).length === 0;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Export Components</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                    ${
                      index <= getCurrentStepIndex()
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }
                  `}
                >
                  <step.icon className="h-4 w-4" />
                </div>
                <span
                  className={`
                    ml-2 text-sm font-medium
                    ${index <= getCurrentStepIndex() ? 'text-foreground' : 'text-muted-foreground'}
                  `}
                >
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`
                      ml-4 w-16 h-0.5
                      ${index < getCurrentStepIndex() ? 'bg-primary' : 'bg-muted'}
                    `}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderStepContent()}
        </div>

        {/* Footer */}
        {currentStep !== 'complete' && (
          <div className="flex items-center justify-between p-6 border-t">
            <div className="flex items-center space-x-2">
              {currentStep !== 'select' && (
                <Badge variant="secondary">
                  {selectedComponents.length} component{selectedComponents.length !== 1 ? 's' : ''} selected
                </Badge>
              )}
              {currentStep === 'configure' && (
                <Badge variant="secondary">
                  {formats.filter(f => f.selected).length} format{formats.filter(f => f.selected).length !== 1 ? 's' : ''} selected
                </Badge>
              )}
            </div>
            
            <div className="flex space-x-2">
              {currentStep !== 'select' && currentStep !== 'complete' && (
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}
              <Button 
                onClick={handleNext}
                disabled={isNextDisabled() || exportStatus === 'exporting'}
              >
                {currentStep === 'export' ? (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Exporting...
                  </>
                ) : currentStep === 'complete' ? (
                  'Close'
                ) : (
                  'Next'
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
