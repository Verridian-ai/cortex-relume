import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Download, 
  Settings,
  XCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { getExportTemplates } from '@/lib/projects/export';

interface ExportTemplateSelectorProps {
  projectId: string;
  userId: string;
  onTemplateSelect?: (template: any) => void;
}

interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'client-deliverable' | 'dev-handoff' | 'archive' | 'custom';
  format: string;
  settings: Record<string, any>;
  isDefault?: boolean;
  isPublic?: boolean;
}

export function ExportTemplateSelector({ 
  projectId, 
  userId, 
  onTemplateSelect 
}: ExportTemplateSelectorProps) {
  const [templates, setTemplates] = useState<ExportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const templatesData = await getExportTemplates(userId);
      setTemplates(templatesData);
      
      // Select first default template if available
      const defaultTemplate = templatesData.find(t => t.isDefault);
      if (defaultTemplate) {
        setSelectedTemplate(defaultTemplate.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'client-deliverable':
        return <FileText className="h-4 w-4" />;
      case 'dev-handoff':
        return <Settings className="h-4 w-4" />;
      case 'archive':
        return <Download className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      'client-deliverable': 'default',
      'dev-handoff': 'secondary',
      'archive': 'outline',
      'custom': 'outline'
    };

    return (
      <Badge variant={variants[type] || 'outline'}>
        {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  const getFormatDescription = (format: string) => {
    const descriptions = {
      json: 'Structured data format for developers',
      zip: 'Complete archive with all assets',
      csv: 'Tabular data for spreadsheets',
      pdf: 'Document format for sharing'
    };
    return descriptions[format] || 'Unknown format';
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template && onTemplateSelect) {
      onTemplateSelect(template);
    }
  };

  const applyTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      setIsApplyingTemplate(true);
      const template = templates.find(t => t.id === selectedTemplate);
      
      if (!template) {
        throw new Error('Template not found');
      }

      // Start export with template settings
      const response = await fetch(`/api/projects/${projectId}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`
        },
        body: JSON.stringify({
          action: 'createExportJob',
          options: {
            format: template.format,
            ...template.settings,
            template: template.name
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start export');
      }

      const { jobId } = await response.json();
      
      // In a real implementation, you might show a success message or redirect
      // to the export progress page
      alert('Export started successfully! You can track progress in the Export tab.');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply template');
    } finally {
      setIsApplyingTemplate(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-muted-foreground">Loading templates...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center p-4">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No export templates available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Template Selection */}
      <div>
        <label className="text-sm font-medium mb-2 block">Choose Template</label>
        <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Select an export template" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                <div className="flex items-center space-x-2">
                  {getTypeIcon(template.type)}
                  <span>{template.name}</span>
                  {template.isDefault && (
                    <Badge variant="secondary" className="text-xs">
                      Default
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Template Details */}
      {selectedTemplate && (() => {
        const template = templates.find(t => t.id === selectedTemplate);
        if (!template) return null;

        return (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  {getTypeIcon(template.type)}
                  {getTypeBadge(template.type)}
                </div>
              </div>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Template Settings Preview */}
              <div>
                <h4 className="text-sm font-medium mb-2">Template Settings</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Format:</span>
                    <span className="font-medium">{template.format.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Description:</span>
                    <span className="font-medium">{getFormatDescription(template.format)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">{template.type.replace('-', ' ')}</span>
                  </div>
                </div>
              </div>

              {/* Template Options */}
              <div>
                <h4 className="text-sm font-medium mb-2">Included Options</h4>
                <div className="space-y-1">
                  {Object.entries(template.settings || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="font-medium">
                        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Usage Notes */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-blue-700 font-medium mb-1">Usage Notes</p>
                    <p className="text-blue-600">
                      {template.type === 'client-deliverable' && 
                        'This template creates a professional package suitable for client handover, including documentation and source files.'
                      }
                      {template.type === 'dev-handoff' && 
                        'This template generates clean source code with proper documentation for development team handoff.'
                      }
                      {template.type === 'archive' && 
                        'This template creates a complete backup including all project history, versions, and assets.'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={applyTemplate}
                disabled={isApplyingTemplate}
                className="w-full"
              >
                {isApplyingTemplate ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Applying Template...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Use This Template
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        );
      })()}

      {/* All Templates Grid (Optional - for template browsing) */}
      <div>
        <h4 className="text-sm font-medium mb-3">All Available Templates</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {templates.map((template) => (
            <Card 
              key={template.id}
              className={`cursor-pointer transition-all ${
                selectedTemplate === template.id 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleTemplateSelect(template.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-muted rounded">
                    {getTypeIcon(template.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h5 className="font-medium text-sm truncate">{template.name}</h5>
                      {template.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      {getTypeBadge(template.type)}
                      <Badge variant="outline" className="text-xs">
                        {template.format.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
