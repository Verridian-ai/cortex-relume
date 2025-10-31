import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Copy, Check, Eye, Code, Smartphone, Tablet, Monitor, Settings, Play, RotateCcw } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ComponentCustomizer } from '../utils/component-customizer';

// Preview Component
export interface ComponentPreviewProps {
  component: React.ComponentType<any>;
  componentProps?: Record<string, any>;
  customizer?: ComponentCustomizer;
  showControls?: boolean;
  showCode?: boolean;
  showPreview?: boolean;
  defaultView?: 'mobile' | 'tablet' | 'desktop' | 'full';
  className?: string;
}

export const ComponentPreview: React.FC<ComponentPreviewProps> = ({
  component: Component,
  componentProps = {},
  customizer,
  showControls = true,
  showCode = true,
  showPreview = true,
  defaultView = 'desktop',
  className = '',
}) => {
  const [editableProps, setEditableProps] = useState(componentProps);
  const [activeView, setActiveView] = useState(defaultView);
  const [showCodePanel, setShowCodePanel] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);

  // Generate dynamic classes for the component
  const dynamicClasses = useMemo(() => {
    const componentType = getComponentType(Component);
    return customizer?.generateClasses(componentType, editableProps) || '';
  }, [Component, editableProps, customizer]);

  // Generate component code
  const componentCode = useMemo(() => {
    const componentName = Component.displayName || Component.name || 'Component';
    const propsString = Object.entries(editableProps)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `${key}="${value}"`;
        } else if (typeof value === 'boolean') {
          return value ? key : '';
        } else if (typeof value === 'number') {
          return `${key}={${value}}`;
        } else if (Array.isArray(value)) {
          return `${key}={${JSON.stringify(value)}}`;
        } else if (typeof value === 'object') {
          return `${key}={${JSON.stringify(value)}}`;
        }
        return '';
      })
      .filter(Boolean)
      .join(' ');

    return `<${componentName}${propsString ? ` ${propsString}` : ''} />`;
  }, [Component, editableProps]);

  const handlePropChange = (key: string, value: any) => {
    setEditableProps(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleReset = () => {
    setEditableProps(componentProps);
    setIsInteractive(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getComponentType = (Component: React.ComponentType<any>): string => {
    const name = Component.displayName || Component.name || '';
    if (name.toLowerCase().includes('button')) return 'button';
    if (name.toLowerCase().includes('input')) return 'input';
    if (name.toLowerCase().includes('card')) return 'card';
    if (name.toLowerCase().includes('modal')) return 'modal';
    if (name.toLowerCase().includes('dropdown')) return 'dropdown';
    if (name.toLowerCase().includes('tooltip')) return 'tooltip';
    if (name.toLowerCase().includes('badge')) return 'badge';
    if (name.toLowerCase().includes('avatar')) return 'avatar';
    return 'component';
  };

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden bg-white ${className}`}>
      {/* Preview Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Preview</span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setActiveView('mobile')}
              className={`p-1 rounded ${
                activeView === 'mobile' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Mobile view"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveView('tablet')}
              className={`p-1 rounded ${
                activeView === 'tablet' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Tablet view"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveView('desktop')}
              className={`p-1 rounded ${
                activeView === 'desktop' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Desktop view"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveView('full')}
              className={`p-1 rounded ${
                activeView === 'full' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Full width"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsInteractive(!isInteractive)}
            className={`p-1 rounded ${
              isInteractive ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Interactive mode"
          >
            <Play className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-1 rounded text-gray-400 hover:text-gray-600"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowCodePanel(!showCodePanel)}
            className={`p-1 rounded ${
              showCodePanel ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Toggle code"
          >
            <Code className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex">
        {/* Preview Panel */}
        {showPreview && (
          <div className={`${showCodePanel ? 'w-1/2' : 'w-full'} border-r border-gray-200`}>
            <div className={`p-8 ${getViewportClasses(activeView)} bg-white`}>
              <div className="min-h-[200px] flex items-center justify-center">
                <div className={dynamicClasses}>
                  <Component
                    {...editableProps}
                    className={`${editableProps.className || ''} ${dynamicClasses}`}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Code Panel */}
        {showCodePanel && (
          <div className={`${showPreview ? 'w-1/2' : 'w-full'} flex flex-col`}>
            <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
              <span className="text-sm font-medium text-gray-700">Code</span>
              <button
                onClick={() => copyToClipboard(componentCode)}
                className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <SyntaxHighlighter
                language="jsx"
                style={tomorrow}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  background: '#f8f9fa',
                  fontSize: '12px',
                }}
              >
                {componentCode}
              </SyntaxHighlighter>
            </div>
          </div>
        )}
      </div>

      {/* Controls Panel */}
      {showControls && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Settings className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Properties</span>
            </div>
            <ComponentControls
              component={Component}
              props={editableProps}
              onChange={handlePropChange}
              isInteractive={isInteractive}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Component Controls
interface ComponentControlsProps {
  component: React.ComponentType<any>;
  props: Record<string, any>;
  onChange: (key: string, value: any) => void;
  isInteractive: boolean;
}

const ComponentControls: React.FC<ComponentControlsProps> = ({
  component,
  props,
  onChange,
  isInteractive,
}) => {
  const controlConfigs = getControlConfigs(component);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {controlConfigs.map((config) => (
        <ControlInput
          key={config.name}
          config={config}
          value={props[config.name]}
          onChange={(value) => onChange(config.name, value)}
          isInteractive={isInteractive}
        />
      ))}
    </div>
  );
};

// Control Input Component
interface ControlInputProps {
  config: ControlConfig;
  value: any;
  onChange: (value: any) => void;
  isInteractive: boolean;
}

const ControlInput: React.FC<ControlInputProps> = ({
  config,
  value,
  onChange,
  isInteractive,
}) => {
  const { type, name, label, options, min, max, step } = config;

  const handleChange = (newValue: any) => {
    onChange(newValue);
  };

  if (isInteractive) {
    return null; // Hide controls in interactive mode
  }

  const renderInput = () => {
    switch (type) {
      case 'string':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleChange(Number(e.target.value))}
            min={min}
            max={max}
            step={step || 1}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'boolean':
        return (
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              {value ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select {label.toLowerCase()}</option>
            {options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'color':
        return (
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
          />
        );

      case 'array':
        return (
          <input
            type="text"
            value={Array.isArray(value) ? value.join(', ') : ''}
            onChange={(e) => handleChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter comma-separated values"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {renderInput()}
    </div>
  );
};

// Utility Functions
interface ControlConfig {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'color' | 'array';
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

function getControlConfigs(component: React.ComponentType<any>): ControlConfig[] {
  const name = component.displayName || component.name || '';
  
  // Common props that most components might have
  const commonConfigs: ControlConfig[] = [
    { name: 'className', label: 'Class Name', type: 'string' },
    { name: 'children', label: 'Children', type: 'string' },
  ];

  // Component-specific configs
  const componentConfigs: Record<string, ControlConfig[]> = {
    Button: [
      { name: 'variant', label: 'Variant', type: 'select', options: ['primary', 'secondary', 'outline', 'ghost'] },
      { name: 'size', label: 'Size', type: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'disabled', label: 'Disabled', type: 'boolean' },
      { name: 'loading', label: 'Loading', type: 'boolean' },
      { name: 'children', label: 'Text', type: 'string' },
    ],
    Input: [
      { name: 'type', label: 'Type', type: 'select', options: ['text', 'email', 'password', 'number'] },
      { name: 'placeholder', label: 'Placeholder', type: 'string' },
      { name: 'disabled', label: 'Disabled', type: 'boolean' },
      { name: 'required', label: 'Required', type: 'boolean' },
      { name: 'error', label: 'Error State', type: 'boolean' },
      { name: 'size', label: 'Size', type: 'select', options: ['sm', 'md', 'lg'] },
      { name: 'variant', label: 'Variant', type: 'select', options: ['outline', 'filled', 'flushed'] },
    ],
    Card: [
      { name: 'variant', label: 'Variant', type: 'select', options: ['default', 'elevated', 'outlined', 'ghost'] },
      { name: 'padding', label: 'Padding', type: 'select', options: ['none', 'sm', 'md', 'lg'] },
      { name: 'hover', label: 'Hover Effect', type: 'boolean' },
      { name: 'clickable', label: 'Clickable', type: 'boolean' },
    ],
    Badge: [
      { name: 'variant', label: 'Variant', type: 'select', options: ['primary', 'secondary', 'success', 'warning', 'error'] },
      { name: 'size', label: 'Size', type: 'select', options: ['xs', 'sm', 'md', 'lg'] },
      { name: 'dot', label: 'Show Dot', type: 'boolean' },
      { name: 'removable', label: 'Removable', type: 'boolean' },
      { name: 'children', label: 'Text', type: 'string' },
    ],
    Modal: [
      { name: 'isOpen', label: 'Open', type: 'boolean' },
      { name: 'size', label: 'Size', type: 'select', options: ['sm', 'md', 'lg', 'xl'] },
      { name: 'closeOnOverlayClick', label: 'Close on Overlay', type: 'boolean' },
      { name: 'closeOnEscape', label: 'Close on Escape', type: 'boolean' },
      { name: 'title', label: 'Title', type: 'string' },
      { name: 'description', label: 'Description', type: 'string' },
    ],
    Dropdown: [
      { name: 'align', label: 'Alignment', type: 'select', options: ['start', 'center', 'end'] },
      { name: 'disabled', label: 'Disabled', type: 'boolean' },
    ],
    Avatar: [
      { name: 'size', label: 'Size', type: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'variant', label: 'Shape', type: 'select', options: ['circle', 'rounded', 'square'] },
      { name: 'border', label: 'Show Border', type: 'boolean' },
      { name: 'status', label: 'Status', type: 'select', options: ['online', 'offline', 'away', 'busy'] },
    ],
  };

  // Return component-specific configs if available, otherwise common configs
  return componentConfigs[name] || commonConfigs;
}

function getViewportClasses(view: string): string {
  const viewportClasses = {
    mobile: 'max-w-sm mx-auto',
    tablet: 'max-w-2xl mx-auto',
    desktop: 'max-w-4xl mx-auto',
    full: 'w-full',
  };

  return viewportClasses[view as keyof typeof viewportClasses] || viewportClasses.desktop;
}

// Component Gallery
export interface ComponentGalleryProps {
  components: Array<{
    name: string;
    component: React.ComponentType<any>;
    props?: Record<string, any>;
    category?: string;
    description?: string;
  }>;
  categories?: string[];
  searchTerm?: string;
  onComponentSelect?: (component: React.ComponentType<any>, props?: Record<string, any>) => void;
  className?: string;
}

export const ComponentGallery: React.FC<ComponentGalleryProps> = ({
  components,
  categories = [],
  searchTerm = '',
  onComponentSelect,
  className = '',
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredComponents, setFilteredComponents] = useState(components);

  useEffect(() => {
    let filtered = components;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(comp => comp.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(comp =>
        comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredComponents(filtered);
  }, [components, selectedCategory, searchTerm]);

  return (
    <div className={`bg-white ${className}`}>
      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="border-b border-gray-200 p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Component Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {filteredComponents.map((item) => (
          <ComponentCard
            key={item.name}
            name={item.name}
            component={item.component}
            props={item.props}
            description={item.description}
            category={item.category}
            onSelect={onComponentSelect}
          />
        ))}
      </div>

      {filteredComponents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No components found</div>
          <div className="text-gray-400 text-sm mt-2">
            Try adjusting your search or category filter
          </div>
        </div>
      )}
    </div>
  );
};

// Component Card
interface ComponentCardProps {
  name: string;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  description?: string;
  category?: string;
  onSelect?: (component: React.ComponentType<any>, props?: Record<string, any>) => void;
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  name,
  component,
  props = {},
  description,
  category,
  onSelect,
}) => {
  const [showPreview, setShowPreview] = useState(false);

  const handleSelect = () => {
    onSelect?.(component, props);
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {/* Preview Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-900">{name}</h3>
          {category && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {category}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </div>

      {/* Component Preview */}
      <div className="p-8 bg-gray-50 min-h-[120px] flex items-center justify-center">
        {showPreview ? (
          <div className="transform scale-50 origin-center">
            <Component
              {...props}
            />
          </div>
        ) : (
          <Component
            {...props}
          />
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 flex justify-between">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
        <button
          onClick={handleSelect}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Use Component
        </button>
      </div>
    </div>
  );
};

// Export all preview-related components
export default {
  ComponentPreview,
  ComponentGallery,
  ComponentControls,
  ComponentCard,
};