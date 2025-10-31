'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Code2, 
  Palette, 
  Globe, 
  Layers, 
  FileCode,
  Settings,
  Check,
  Info,
  Zap
} from 'lucide-react';

export interface ExportFormatsProps {
  formats: Array<{
    id: string;
    name: string;
    description: string;
    icon: React.ComponentType<any>;
    selected: boolean;
    options?: any;
  }>;
  onFormatChange: (formatId: string, selected: boolean, options?: any) => void;
  options: {
    includeCSS: boolean;
    includeJS: boolean;
    minify: boolean;
    framework: string;
    responsive: boolean;
    semantic: boolean;
  };
  onOptionsChange: (options: any) => void;
}

const AVAILABLE_FORMATS = [
  {
    id: 'react-ts',
    name: 'React (TypeScript)',
    description: 'Modern React components with TypeScript support',
    icon: Code2,
    category: 'Framework',
    popular: true,
    options: {
      styling: 'styled-components',
      includeProps: true,
      includeTypes: true,
      includeTests: true,
    },
  },
  {
    id: 'react-js',
    name: 'React (JavaScript)',
    description: 'React components without TypeScript',
    icon: Code2,
    category: 'Framework',
    popular: true,
    options: {
      styling: 'styled-components',
      includeProps: true,
      includeTests: true,
    },
  },
  {
    id: 'vue',
    name: 'Vue.js',
    description: 'Vue.js single file components',
    icon: Layers,
    category: 'Framework',
    options: {
      version: '3',
      lang: 'ts',
    },
  },
  {
    id: 'css',
    name: 'CSS/SCSS',
    description: 'Plain CSS and SCSS stylesheets',
    icon: Palette,
    category: 'Styles',
    popular: true,
    options: {
      format: 'scss',
      includeVariables: true,
      includeMixins: true,
      prefix: '',
    },
  },
  {
    id: 'figma',
    name: 'Figma',
    description: 'Figma JSON and design tokens',
    icon: Palette,
    category: 'Design',
    options: {
      tokenFormat: 'style-dictionary',
      includeAssets: true,
      includeStyles: true,
    },
  },
  {
    id: 'webflow',
    name: 'Webflow',
    description: 'Webflow-compatible HTML and interactions',
    icon: Globe,
    category: 'CMS',
    options: {
      includeInteractions: true,
      includeResponsive: true,
      includeCMS: true,
    },
  },
  {
    id: 'html',
    name: 'HTML/CSS',
    description: 'Plain HTML and CSS',
    icon: FileCode,
    category: 'Static',
    options: {
      framework: 'vanilla',
      responsive: true,
      semantic: true,
      minify: false,
    },
  },
  {
    id: 'styled-components',
    name: 'Styled Components',
    description: 'CSS-in-JS styled components',
    icon: Code2,
    category: 'Styles',
    options: {
      theming: true,
      globalStyles: true,
    },
  },
];

export function ExportFormats({ 
  formats, 
  onFormatChange, 
  options, 
  onOptionsChange 
}: ExportFormatsProps) {
  const [expandedFormat, setExpandedFormat] = React.useState<string | null>(null);
  const [formatOptions, setFormatOptions] = React.useState<{ [key: string]: any }>({});

  React.useEffect(() => {
    // Initialize format options
    const initialOptions: { [key: string]: any } = {};
    AVAILABLE_FORMATS.forEach(format => {
      initialOptions[format.id] = format.options;
    });
    setFormatOptions(initialOptions);
  }, []);

  const handleFormatToggle = (formatId: string) => {
    const format = AVAILABLE_FORMATS.find(f => f.id === formatId);
    if (!format) return;

    const isSelected = formats.some(f => f.id === formatId);
    onFormatChange(formatId, !isSelected, formatOptions[formatId]);
  };

  const handleOptionChange = (formatId: string, optionKey: string, value: any) => {
    const newOptions = {
      ...formatOptions[formatId],
      [optionKey]: value,
    };
    
    setFormatOptions(prev => ({
      ...prev,
      [formatId]: newOptions,
    }));

    onFormatChange(formatId, true, newOptions);
  };

  const handleGlobalOptionChange = (key: string, value: any) => {
    onOptionsChange({
      ...options,
      [key]: value,
    });
  };

  const groupFormats = React.useMemo(() => {
    const groups: { [key: string]: typeof AVAILABLE_FORMATS } = {};
    AVAILABLE_FORMATS.forEach(format => {
      if (!groups[format.category]) {
        groups[format.category] = [];
      }
      groups[format.category].push(format);
    });
    return groups;
  }, []);

  const renderFormatOption = (format: any, selected: boolean) => {
    const isExpanded = expandedFormat === format.id;
    
    return (
      <div key={format.id} className="border rounded-lg overflow-hidden">
        <div 
          className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setExpandedFormat(isExpanded ? null : format.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant={selected ? 'default' : 'outline'}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFormatToggle(format.id);
                }}
              >
                {selected ? <Check className="h-4 w-4" /> : <span className="h-4 w-4" />}
              </Button>
              
              <format.icon className="h-5 w-5 text-muted-foreground" />
              
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium">{format.name}</h4>
                  {format.popular && (
                    <Badge variant="secondary" className="text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {format.description}
                </p>
              </div>
            </div>
            
            <Badge variant="outline" className="text-xs">
              {format.category}
            </Badge>
          </div>
        </div>

        {isExpanded && (
          <div className="border-t bg-muted/30 p-4 space-y-4">
            {renderFormatOptions(format, formatOptions[format.id] || format.options)}
          </div>
        )}
      </div>
    );
  };

  const renderFormatOptions = (format: any, currentOptions: any) => {
    const commonOptions = (
      <div className="space-y-3">
        {format.id === 'react-ts' || format.id === 'react-js' ? (
          <>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Include Props</label>
              <Switch
                checked={currentOptions.includeProps}
                onCheckedChange={(checked) => handleOptionChange(format.id, 'includeProps', checked)}
              />
            </div>
            {format.id === 'react-ts' && (
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Include TypeScript Types</label>
                <Switch
                  checked={currentOptions.includeTypes}
                  onCheckedChange={(checked) => handleOptionChange(format.id, 'includeTypes', checked)}
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Include Tests</label>
              <Switch
                checked={currentOptions.includeTests}
                onCheckedChange={(checked) => handleOptionChange(format.id, 'includeTests', checked)}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Styling Library</label>
              <select
                value={currentOptions.styling}
                onChange={(e) => handleOptionChange(format.id, 'styling', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
              >
                <option value="styled-components">Styled Components</option>
                <option value="emotion">Emotion</option>
                <option value="css-modules">CSS Modules</option>
                <option value="tailwind">Tailwind CSS</option>
                <option value="plain-css">Plain CSS</option>
              </select>
            </div>
          </>
        ) : format.id === 'css' ? (
          <>
            <div>
              <label className="text-sm font-medium block mb-2">CSS Format</label>
              <select
                value={currentOptions.format}
                onChange={(e) => handleOptionChange(format.id, 'format', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
              >
                <option value="css">CSS</option>
                <option value="scss">SCSS</option>
                <option value="sass">Sass</option>
                <option value="less">Less</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Include Variables</label>
              <Switch
                checked={currentOptions.includeVariables}
                onCheckedChange={(checked) => handleOptionChange(format.id, 'includeVariables', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Include Mixins</label>
              <Switch
                checked={currentOptions.includeMixins}
                onCheckedChange={(checked) => handleOptionChange(format.id, 'includeMixins', checked)}
              />
            </div>
          </>
        ) : format.id === 'figma' ? (
          <>
            <div>
              <label className="text-sm font-medium block mb-2">Token Format</label>
              <select
                value={currentOptions.tokenFormat}
                onChange={(e) => handleOptionChange(format.id, 'tokenFormat', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
              >
                <option value="style-dictionary">Style Dictionary</option>
                <option value="custom">Custom</option>
                <option value="css-variables">CSS Variables</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Include Assets</label>
              <Switch
                checked={currentOptions.includeAssets}
                onCheckedChange={(checked) => handleOptionChange(format.id, 'includeAssets', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Include Styles</label>
              <Switch
                checked={currentOptions.includeStyles}
                onCheckedChange={(checked) => handleOptionChange(format.id, 'includeStyles', checked)}
              />
            </div>
          </>
        ) : format.id === 'webflow' ? (
          <>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Include Interactions</label>
              <Switch
                checked={currentOptions.includeInteractions}
                onCheckedChange={(checked) => handleOptionChange(format.id, 'includeInteractions', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Responsive Design</label>
              <Switch
                checked={currentOptions.includeResponsive}
                onCheckedChange={(checked) => handleOptionChange(format.id, 'includeResponsive', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">CMS Integration</label>
              <Switch
                checked={currentOptions.includeCMS}
                onCheckedChange={(checked) => handleOptionChange(format.id, 'includeCMS', checked)}
              />
            </div>
          </>
        ) : format.id === 'html' ? (
          <>
            <div>
              <label className="text-sm font-medium block mb-2">Framework</label>
              <select
                value={currentOptions.framework}
                onChange={(e) => handleOptionChange(format.id, 'framework', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
              >
                <option value="vanilla">Vanilla HTML</option>
                <option value="bootstrap">Bootstrap</option>
                <option value="tailwind">Tailwind CSS</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Responsive Design</label>
              <Switch
                checked={currentOptions.responsive}
                onCheckedChange={(checked) => handleOptionChange(format.id, 'responsive', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Semantic HTML</label>
              <Switch
                checked={currentOptions.semantic}
                onCheckedChange={(checked) => handleOptionChange(format.id, 'semantic', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Minify Output</label>
              <Switch
                checked={currentOptions.minify}
                onCheckedChange={(checked) => handleOptionChange(format.id, 'minify', checked)}
              />
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">
            No additional options for this format.
          </div>
        )}
      </div>
    );

    return commonOptions;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Export Formats</h3>
        <p className="text-sm text-muted-foreground">
          Choose the output formats for your components
        </p>
      </div>

      {/* Global Options */}
      <Card className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="h-4 w-4" />
          <h4 className="font-medium">Global Options</h4>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Include CSS</label>
            <Switch
              checked={options.includeCSS}
              onCheckedChange={(checked) => handleGlobalOptionChange('includeCSS', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Include JavaScript</label>
            <Switch
              checked={options.includeJS}
              onCheckedChange={(checked) => handleGlobalOptionChange('includeJS', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Minify Output</label>
            <Switch
              checked={options.minify}
              onCheckedChange={(checked) => handleGlobalOptionChange('minify', checked)}
            />
          </div>
        </div>
      </Card>

      {/* Format Selection */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <h4 className="font-medium">Choose Formats</h4>
          <Badge variant="secondary">
            {formats.filter(f => f.selected).length} selected
          </Badge>
        </div>

        {Object.entries(groupFormats).map(([category, categoryFormats]) => (
          <div key={category} className="space-y-3">
            <h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              {category}
            </h5>
            <div className="space-y-2">
              {categoryFormats.map(format => {
                const selected = formats.some(f => f.id === format.id);
                return renderFormatOption(format, selected);
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Selection Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Select multiple formats to export components in different styles and frameworks. 
          Each format will be included as a separate folder in the export archive.
        </AlertDescription>
      </Alert>
    </div>
  );
}
