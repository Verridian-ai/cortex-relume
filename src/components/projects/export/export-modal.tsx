import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Download, 
  FileText, 
  Archive, 
  Database, 
  XCircle,
  Loader2,
  CheckCircle,
  Info
} from 'lucide-react';
import { getExportTemplates, getExportFormatDescription } from '@/lib/projects/export';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  userId: string;
  onExportComplete: () => void;
}

interface ExportOptions {
  format: 'json' | 'csv' | 'pdf' | 'zip';
  includeAssets: boolean;
  includeHistory: boolean;
  includeVersions: boolean;
  includeComponents: boolean;
  minify: boolean;
  template?: string;
  customSettings?: Record<string, any>;
}

export function ExportModal({ 
  isOpen, 
  onClose, 
  projectId, 
  projectName, 
  userId, 
  onExportComplete 
}: ExportModalProps) {
  const [step, setStep] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [options, setOptions] = useState<ExportOptions>({
    format: 'json',
    includeAssets: true,
    includeHistory: false,
    includeVersions: false,
    includeComponents: true,
    minify: false
  });
  const [exportName, setExportName] = useState('');
  const [exportDescription, setExportDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      setExportName(`${projectName} Export ${new Date().toLocaleDateString()}`);
    }
  }, [isOpen, projectName]);

  const loadTemplates = async () => {
    try {
      const templatesData = await getExportTemplates(userId);
      setTemplates(templatesData);
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setOptions(prev => ({
        ...prev,
        format: template.format as any,
        ...template.settings
      }));
      setStep(2); // Move to options step
    }
  };

  const handleFormatChange = (format: string) => {
    setOptions(prev => ({
      ...prev,
      format: format as any,
      // Auto-adjust options based on format
      includeAssets: format === 'zip' ? true : prev.includeAssets,
      minify: format === 'json' ? prev.minify : false
    }));
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setError(null);
      setExportProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const response = await fetch(`/api/projects/${projectId}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`
        },
        body: JSON.stringify({
          action: 'createExportJob',
          options: {
            ...options,
            name: exportName,
            description: exportDescription
          }
        })
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error('Failed to start export');
      }

      const { jobId } = await response.json();
      setExportProgress(100);

      // Wait a moment for processing
      setTimeout(() => {
        setStep(3); // Success step
        onExportComplete();
      }, 1000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleClose = () => {
    setStep(1);
    setIsExporting(false);
    setExportProgress(0);
    setError(null);
    onClose();
  };

  const formatOptions = [
    {
      value: 'json',
      label: 'JSON',
      description: 'Structured data format, ideal for developers',
      icon: Database,
      color: 'bg-blue-500'
    },
    {
      value: 'zip',
      label: 'ZIP Archive',
      description: 'Complete archive with all files and assets',
      icon: Archive,
      color: 'bg-green-500'
    },
    {
      value: 'csv',
      label: 'CSV',
      description: 'Tabular data for spreadsheet applications',
      icon: FileText,
      color: 'bg-orange-500'
    },
    {
      value: 'pdf',
      label: 'PDF Report',
      description: 'Document format for sharing and printing',
      icon: FileText,
      color: 'bg-red-500'
    }
  ];

  const getCurrentFormatOption = () => {
    return formatOptions.find(opt => opt.value === options.format);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Project</DialogTitle>
          <DialogDescription>
            Export "{projectName}" in various formats for different use cases
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {step > 1 ? <CheckCircle className="h-4 w-4" /> : '1'}
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {step > 2 ? <CheckCircle className="h-4 w-4" /> : '2'}
            </div>
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-500' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 3 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {step === 3 ? <CheckCircle className="h-4 w-4" /> : '3'}
            </div>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            {/* Template Selection */}
            {templates.length > 0 && (
              <div>
                <Label className="text-base font-semibold">Quick Start Templates</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {templates.map((template) => (
                    <Card 
                      key={template.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">{template.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {template.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Manual Format Selection */}
            <div>
              <Label className="text-base font-semibold">Choose Export Format</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {formatOptions.map((option) => {
                  const IconComponent = option.icon;
                  const isSelected = options.format === option.value;
                  
                  return (
                    <Card 
                      key={option.value}
                      className={`cursor-pointer transition-all ${
                        isSelected 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => handleFormatChange(option.value)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded ${option.color}`}>
                            <IconComponent className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {option.description}
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                              {getExportFormatDescription(option.value)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {/* Export Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="exportName">Export Name</Label>
                <Input
                  id="exportName"
                  value={exportName}
                  onChange={(e) => setExportName(e.target.value)}
                  placeholder="Enter export name"
                />
              </div>
              <div>
                <Label htmlFor="format">Format</Label>
                <Select value={options.format} onValueChange={handleFormatChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formatOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={exportDescription}
                onChange={(e) => setExportDescription(e.target.value)}
                placeholder="Describe the purpose of this export"
                rows={3}
              />
            </div>

            {/* Export Options */}
            <div>
              <Label className="text-base font-semibold">Include in Export</Label>
              <div className="space-y-4 mt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeAssets"
                    checked={options.includeAssets}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, includeAssets: !!checked }))
                    }
                  />
                  <Label htmlFor="includeAssets" className="text-sm">
                    Assets (images, styles, scripts)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeComponents"
                    checked={options.includeComponents}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, includeComponents: !!checked }))
                    }
                  />
                  <Label htmlFor="includeComponents" className="text-sm">
                    Custom Components
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeHistory"
                    checked={options.includeHistory}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, includeHistory: !!checked }))
                    }
                  />
                  <Label htmlFor="includeHistory" className="text-sm">
                    Project History
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeVersions"
                    checked={options.includeVersions}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, includeVersions: !!checked }))
                    }
                  />
                  <Label htmlFor="includeVersions" className="text-sm">
                    Version History
                  </Label>
                </div>

                {options.format === 'json' && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="minify"
                      checked={options.minify}
                      onCheckedChange={(checked) => 
                        setOptions(prev => ({ ...prev, minify: !!checked }))
                      }
                    />
                    <Label htmlFor="minify" className="text-sm">
                      Minify JSON (reduce file size)
                    </Label>
                  </div>
                )}
              </div>
            </div>

            {/* Export Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Export Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Format:</span>
                  <span className="font-medium">{getCurrentFormatOption()?.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Include Assets:</span>
                  <span className="font-medium">{options.includeAssets ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Include Components:</span>
                  <span className="font-medium">{options.includeComponents ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Estimated Size:</span>
                  <span className="font-medium">~2.5 MB</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-green-100 rounded-full">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">Export Complete!</h3>
              <p className="text-muted-foreground mt-2">
                Your project has been successfully exported and is ready for download.
              </p>
            </div>

            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                Export Another
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Download Now
              </Button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Export Progress */}
        {isExporting && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Exporting project...</span>
              <span>{exportProgress}%</span>
            </div>
            <Progress value={exportProgress} />
          </div>
        )}

        <DialogFooter className="flex justify-between">
          <div>
            {step > 1 && step < 3 && (
              <Button 
                variant="outline" 
                onClick={() => setStep(step - 1)}
                disabled={isExporting}
              >
                Back
              </Button>
            )}
          </div>
          
          <div className="space-x-2">
            <Button variant="outline" onClick={handleClose} disabled={isExporting}>
              Cancel
            </Button>
            
            {step === 1 && (
              <Button 
                onClick={() => setStep(2)}
                disabled={!options.format}
              >
                Next
              </Button>
            )}
            
            {step === 2 && (
              <Button 
                onClick={handleExport}
                disabled={!exportName || isExporting}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Start Export
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
