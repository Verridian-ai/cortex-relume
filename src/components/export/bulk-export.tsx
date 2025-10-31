'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, 
  Archive, 
  FileText, 
  Settings,
  Download,
  Info,
  Zap,
  Users
} from 'lucide-react';

export interface BulkExportProps {
  selectedCount: number;
  onBulkOptionsChange: (options: BulkExportOptions) => void;
}

export interface BulkExportOptions {
  createReadme: boolean;
  includePackageJson: boolean;
  includeDocumentation: boolean;
  includeExamples: boolean;
  compressArchive: boolean;
  archiveName: string;
  groupByCategory: boolean;
  separateFolders: boolean;
  maxFileSize: number;
  skipLargeAssets: boolean;
}

export function BulkExport({ selectedCount, onBulkOptionsChange }: BulkExportProps) {
  const [options, setOptions] = React.useState<BulkExportOptions>({
    createReadme: true,
    includePackageJson: true,
    includeDocumentation: true,
    includeExamples: true,
    compressArchive: true,
    archiveName: `components-export-${new Date().toISOString().split('T')[0]}`,
    groupByCategory: false,
    separateFolders: true,
    maxFileSize: 10, // MB
    skipLargeAssets: false,
  });

  React.useEffect(() => {
    onBulkOptionsChange(options);
  }, [options, onBulkOptionsChange]);

  const handleOptionChange = (key: keyof BulkExportOptions, value: any) => {
    setOptions(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const estimatedFiles = selectedCount * 8; // Rough estimate
  const estimatedSize = estimatedFiles * 15; // Rough estimate in KB

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Archive className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Bulk Export Options</h3>
        <Badge variant="secondary">
          {selectedCount} component{selectedCount !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Archive Settings */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <Settings className="h-4 w-4" />
          <h4 className="font-medium">Archive Settings</h4>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">Archive Name</label>
            <Input
              value={options.archiveName}
              onChange={(e) => handleOptionChange('archiveName', e.target.value)}
              placeholder="Enter archive name..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Compress Archive</label>
              <Switch
                checked={options.compressArchive}
                onCheckedChange={(checked) => handleOptionChange('compressArchive', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Group by Category</label>
              <Switch
                checked={options.groupByCategory}
                onCheckedChange={(checked) => handleOptionChange('groupByCategory', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Separate Folders</label>
              <Switch
                checked={options.separateFolders}
                onCheckedChange={(checked) => handleOptionChange('separateFolders', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Skip Large Assets</label>
              <Switch
                checked={options.skipLargeAssets}
                onCheckedChange={(checked) => handleOptionChange('skipLargeAssets', checked)}
              />
            </div>
          </div>

          {options.skipLargeAssets && (
            <div>
              <label className="text-sm font-medium block mb-2">
                Max File Size: {options.maxFileSize} MB
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={options.maxFileSize}
                onChange={(e) => handleOptionChange('maxFileSize', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Documentation */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4" />
          <h4 className="font-medium">Documentation</h4>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Create README</label>
            <Switch
              checked={options.createReadme}
              onCheckedChange={(checked) => handleOptionChange('createReadme', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Include package.json</label>
            <Switch
              checked={options.includePackageJson}
              onCheckedChange={(checked) => handleOptionChange('includePackageJson', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Include Documentation</label>
            <Switch
              checked={options.includeDocumentation}
              onCheckedChange={(checked) => handleOptionChange('includeDocumentation', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Include Examples</label>
            <Switch
              checked={options.includeExamples}
              onCheckedChange={(checked) => handleOptionChange('includeExamples', checked)}
            />
          </div>
        </div>
      </Card>

      {/* Export Summary */}
      <Card className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Info className="h-4 w-4" />
          <h4 className="font-medium">Export Summary</h4>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Estimated Files</div>
            <div className="font-medium">{estimatedFiles}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Estimated Size</div>
            <div className="font-medium">{formatBytes(estimatedSize * 1024)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Formats</div>
            <div className="font-medium">React, CSS, HTML</div>
          </div>
          <div>
            <div className="text-muted-foreground">Documentation</div>
            <div className="font-medium">
              {options.createReadme ? 'Yes' : 'No'}
            </div>
          </div>
        </div>
      </Card>

      {/* Performance Notice */}
      {selectedCount > 20 && (
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription>
            <strong>Large Export Detected:</strong> You're exporting {selectedCount} components. 
            This may take a few minutes to complete. Consider splitting into smaller batches for faster processing.
          </AlertDescription>
        </Alert>
      )}

      {/* Tips */}
      <Alert>
        <Users className="h-4 w-4" />
        <AlertDescription>
          <strong>Pro Tip:</strong> For team collaboration, enable "Group by Category" to organize 
          components into logical folders. Include documentation to help team members understand 
          how to use each component.
        </AlertDescription>
      </Alert>
    </div>
  );
}
