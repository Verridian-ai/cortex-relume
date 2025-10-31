// Component Templates Library
// Pre-built component templates for various frameworks and industries

export interface ComponentTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  framework: Framework;
  industry: Industry[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // minutes
  tags: string[];
  preview: {
    image?: string;
    demo?: string;
    features: string[];
  };
  template: {
    source: string;
    styles?: string;
    props?: string;
    types?: string;
    documentation: {
      usage: string;
      props: Array<{
        name: string;
        type: string;
        description: string;
        required: boolean;
        default?: any;
      }>;
      examples: Array<{
        title: string;
        description: string;
        code: string;
        preview?: string;
      }>;
    };
  };
  metadata: {
    author: string;
    version: string;
    lastUpdated: number;
    license: 'MIT' | 'Apache-2.0' | 'GPL-3.0' | 'Unlicense';
    dependencies: string[];
    peerDependencies?: string[];
    bundleSize?: number;
    accessibilityScore: number;
    browserSupport: string[];
  };
  customization: {
    themes: Array<{
      name: string;
      colors: Record<string, string>;
      fonts?: Record<string, string>;
      spacing?: Record<string, string>;
    }>;
    variants: Array<{
      name: string;
      description: string;
      props: Record<string, any>;
    }>;
    variables: Array<{
      name: string;
      type: 'color' | 'spacing' | 'typography' | 'number' | 'boolean';
      default: any;
      description: string;
      options?: any[];
    }>;
  };
  analytics: {
    downloads: number;
    likes: number;
    forks: number;
    rating: number;
    reviews: number;
    usage: number;
  };
  related: string[]; // Template IDs
}

export type TemplateCategory = 
  | 'navigation'
  | 'forms'
  | 'layout'
  | 'content'
  | 'interactive'
  | 'data-display'
  | 'feedback'
  | 'media'
  | 'charts'
  | 'ecommerce'
  | 'blog'
  | 'dashboard'
  | 'landing'
  | 'authentication'
  | 'marketing';

export type Framework = 
  | 'react'
  | 'vue'
  | 'angular'
  | 'svelte'
  | 'vanilla-js'
  | 'html'
  | 'css'
  | 'tailwind'
  | 'bootstrap'
  | 'material-ui'
  | 'chakra-ui';

export type Industry = 
  | 'technology'
  | 'ecommerce'
  | 'healthcare'
  | 'finance'
  | 'education'
  | 'entertainment'
  | 'real-estate'
  | 'food'
  | 'travel'
  | 'automotive'
  | 'fashion'
  | 'sports'
  | 'news'
  | 'social'
  | 'productivity'
  | 'gaming';

// Pre-built Component Templates
export const COMPONENT_TEMPLATES: ComponentTemplate[] = [
  // Navigation Templates
  {
    id: 'nav-header-basic',
    name: 'Basic Header Navigation',
    description: 'A clean and simple header navigation component with logo and menu items',
    category: 'navigation',
    framework: 'react',
    industry: ['technology', 'ecommerce', 'general'],
    difficulty: 'beginner',
    estimatedTime: 30,
    tags: ['header', 'navigation', 'menu', 'responsive'],
    preview: {
      features: ['Responsive design', 'Mobile-friendly', 'Logo support', 'Dropdown menus']
    },
    template: {
      source: `import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  logo?: string;
  navigation: Array<{
    label: string;
    href: string;
    dropdown?: Array<{ label: string; href: string }>;
  }>;
  actions?: Array<{
    label: string;
    href: string;
    variant?: 'primary' | 'secondary';
  }>;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  logo = 'Logo',
  navigation = [],
  actions = [],
  className = ''
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className={\`bg-white shadow-sm \${className}\`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="text-xl font-bold text-gray-900">
              {logo}
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item, index) => (
              <div key={index} className="relative group">
                <a
                  href={item.href}
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  {item.label}
                </a>
                {/* Dropdown menu would go here */}
              </div>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {actions.map((action, index) => (
              <a
                key={index}
                href={action.href}
                className={\`px-4 py-2 rounded-md text-sm font-medium \${
                  action.variant === 'primary'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }\`}
              >
                {action.label}
              </a>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-400 hover:text-gray-500"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {navigation.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="text-gray-500 hover:text-gray-900 block px-3 py-2 text-base font-medium"
                >
                  {item.label}
                </a>
              ))}
              {actions.map((action, index) => (
                <a
                  key={index}
                  href={action.href}
                  className="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900"
                >
                  {action.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};`,
      styles: `/* Additional styles for header component */
.header-scrolled {
  @apply shadow-lg;
}

.nav-dropdown {
  @apply absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-50;
}

.nav-dropdown a {
  @apply block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100;
}`,
      documentation: {
        usage: 'Import and use the Header component in your application. It provides responsive navigation with desktop and mobile versions.',
        props: [
          {
            name: 'logo',
            type: 'string',
            description: 'The logo text or element to display',
            required: false,
            default: '\'Logo\''
          },
          {
            name: 'navigation',
            type: 'Array<{label: string, href: string, dropdown?: Array}>',
            description: 'Navigation menu items',
            required: false,
            default: '[]'
          },
          {
            name: 'actions',
            type: 'Array<{label: string, href: string, variant?: string}>',
            description: 'Action buttons for the header',
            required: false,
            default: '[]'
          },
          {
            name: 'className',
            type: 'string',
            description: 'Additional CSS classes',
            required: false,
            default: '\'\''
          }
        ],
        examples: [
          {
            title: 'Basic Header',
            description: 'Simple header with navigation',
            code: `import { Header } from './components/Header';

function App() {
  const navigation = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' }
  ];

  const actions = [
    { label: 'Sign In', href: '/login', variant: 'secondary' },
    { label: 'Get Started', href: '/signup', variant: 'primary' }
  ];

  return (
    <Header 
      logo="MyApp" 
      navigation={navigation} 
      actions={actions} 
    />
  );
}`
          }
        ]
      }
    },
    metadata: {
      author: 'Component Library Team',
      version: '1.0.0',
      lastUpdated: Date.now(),
      license: 'MIT',
      dependencies: ['react', 'lucide-react'],
      bundleSize: 2450,
      accessibilityScore: 95,
      browserSupport: ['Chrome', 'Firefox', 'Safari', 'Edge']
    },
    customization: {
      themes: [
        {
          name: 'Light',
          colors: {
            'bg-primary': '#ffffff',
            'text-primary': '#1f2937',
            'text-secondary': '#6b7280',
            'border-color': '#e5e7eb'
          }
        },
        {
          name: 'Dark',
          colors: {
            'bg-primary': '#1f2937',
            'text-primary': '#f9fafb',
            'text-secondary': '#d1d5db',
            'border-color': '#374151'
          }
        }
      ],
      variants: [
        {
          name: 'Centered',
          description: 'Centered logo with navigation on sides',
          props: { layout: 'centered' }
        },
        {
          name: 'Transparent',
          description: 'Transparent background for landing pages',
          props: { transparent: true }
        }
      ],
      variables: [
        {
          name: 'headerHeight',
          type: 'spacing',
          default: '4rem',
          description: 'Height of the header component'
        },
        {
          name: 'logoSize',
          type: 'typography',
          default: '1.25rem',
          description: 'Size of the logo text'
        }
      ]
    },
    analytics: {
      downloads: 1247,
      likes: 89,
      forks: 23,
      rating: 4.6,
      reviews: 34,
      usage: 892
    },
    related: ['nav-sidebar-basic', 'nav-footer-basic', 'nav-breadcrumb-basic']
  },

  // Form Templates
  {
    id: 'form-contact-basic',
    name: 'Contact Form',
    description: 'A comprehensive contact form with validation and multiple input types',
    category: 'forms',
    framework: 'react',
    industry: ['general', 'business', 'services'],
    difficulty: 'intermediate',
    estimatedTime: 45,
    tags: ['form', 'contact', 'validation', 'inputs'],
    preview: {
      features: ['Form validation', 'Multiple input types', 'Error handling', 'Success states']
    },
    template: {
      source: `import React, { useState } from 'react';
import { Mail, User, MessageSquare, Phone } from 'lucide-react';

interface ContactFormProps {
  onSubmit: (data: FormData) => void;
  className?: string;
}

interface FormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  type: 'general' | 'support' | 'sales';
}

export const ContactForm: React.FC<ContactFormProps> = ({
  onSubmit,
  className = ''
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    type: 'general'
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\\S+@\\S+\\.\\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    if (formData.phone && !/^[\\d\\s\\-\\+\\(\\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      
      // Reset form on success
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        type: 'general'
      });
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={\`bg-white rounded-lg shadow-md p-6 \${className}\`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Us</h2>
        <p className="text-gray-600">We'd love to hear from you. Send us a message!</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              <User size={16} className="inline mr-1" />
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={\`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 \${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }\`}
              placeholder="Your full name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              <Mail size={16} className="inline mr-1" />
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={\`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 \${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }\`}
              placeholder="your@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              <Phone size={16} className="inline mr-1" />
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={\`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 \${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }\`}
              placeholder="+1 (555) 123-4567"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Type Field */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Subject Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="general">General Inquiry</option>
              <option value="support">Technical Support</option>
              <option value="sales">Sales</option>
            </select>
          </div>
        </div>

        {/* Subject Field */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
            Subject *
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className={\`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 \${
              errors.subject ? 'border-red-500' : 'border-gray-300'
            }\`}
            placeholder="Brief description of your inquiry"
          />
          {errors.subject && (
            <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
          )}
        </div>

        {/* Message Field */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            <MessageSquare size={16} className="inline mr-1" />
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            value={formData.message}
            onChange={handleChange}
            className={\`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical \${
              errors.message ? 'border-red-500' : 'border-gray-300'
            }\`}
            placeholder="Please provide details about your inquiry..."
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600">{errors.message}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {formData.message.length}/500 characters
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={\`px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors \${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }\`}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : (
              'Send Message'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};`,
      documentation: {
        usage: 'Use the ContactForm component to create a comprehensive contact form with validation. Pass an onSubmit handler to handle form submission.',
        props: [
          {
            name: 'onSubmit',
            type: '(data: FormData) => void',
            description: 'Callback function called when form is successfully submitted',
            required: true
          },
          {
            name: 'className',
            type: 'string',
            description: 'Additional CSS classes for styling',
            required: false,
            default: '\'\''
          }
        ],
        examples: [
          {
            title: 'Basic Contact Form',
            description: 'Simple contact form with submission handler',
            code: `import { ContactForm } from './components/ContactForm';

function App() {
  const handleSubmit = async (data) => {
    console.log('Form submitted:', data);
    // Send to your API
    await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    alert('Message sent successfully!');
  };

  return <ContactForm onSubmit={handleSubmit} />;
}`
          }
        ]
      }
    },
    metadata: {
      author: 'Component Library Team',
      version: '1.0.0',
      lastUpdated: Date.now(),
      license: 'MIT',
      dependencies: ['react', 'lucide-react'],
      bundleSize: 3890,
      accessibilityScore: 98,
      browserSupport: ['Chrome', 'Firefox', 'Safari', 'Edge']
    },
    customization: {
      themes: [
        {
          name: 'Default',
          colors: {
            'primary': '#3B82F6',
            'primary-hover': '#2563EB',
            'error': '#EF4444',
            'text-primary': '#111827',
            'text-secondary': '#6B7280'
          }
        }
      ],
      variants: [
        {
          name: 'Compact',
          description: 'Smaller form with reduced spacing',
          props: { spacing: 'compact', fontSize: 'sm' }
        },
        {
          name: 'Large',
          description: 'Larger form with more spacious design',
          props: { spacing: 'large', fontSize: 'lg' }
        }
      ],
      variables: [
        {
          name: 'borderRadius',
          type: 'number',
          default: 6,
          description: 'Border radius for form inputs'
        },
        {
          name: 'inputHeight',
          type: 'spacing',
          default: '2.5rem',
          description: 'Height of input fields'
        }
      ]
    },
    analytics: {
      downloads: 2156,
      likes: 145,
      forks: 67,
      rating: 4.8,
      reviews: 89,
      usage: 1876
    },
    related: ['form-newsletter', 'form-search', 'form-login']
  },

  // Layout Templates
  {
    id: 'layout-dashboard-basic',
    name: 'Dashboard Layout',
    description: 'A comprehensive dashboard layout with sidebar navigation and main content area',
    category: 'layout',
    framework: 'react',
    industry: ['technology', 'productivity', 'analytics'],
    difficulty: 'intermediate',
    estimatedTime: 60,
    tags: ['layout', 'dashboard', 'sidebar', 'navigation'],
    preview: {
      features: ['Responsive sidebar', 'Collapsible menu', 'Main content area', 'Header actions']
    },
    template: {
      source: `import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  BarChart3, 
  Menu, 
  X, 
  Bell, 
  Search,
  ChevronDown
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  navigation?: Array<{
    label: string;
    icon: React.ComponentType<{ size?: number }>;
    href: string;
    badge?: string;
    children?: Array<{
      label: string;
      href: string;
    }>;
  }>;
  actions?: React.ReactNode;
  className?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  user = { name: 'John Doe', email: 'john@example.com' },
  navigation = [],
  actions,
  className = ''
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const defaultNavigation = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      badge: '12'
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      href: '/analytics'
    },
    {
      label: 'Users',
      icon: Users,
      href: '/users',
      badge: '3 new'
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/settings'
    }
  ];

  const nav = navigation.length > 0 ? navigation : defaultNavigation;

  return (
    <div className={\`flex h-screen bg-gray-100 \${className}\`}>
      {/* Sidebar */}
      <div className={\`bg-white shadow-lg transition-all duration-300 \${
        sidebarCollapsed ? 'w-16' : 'w-64'
      } \${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
      md:translate-x-0 fixed md:static inset-y-0 left-0 z-50\`}>
        
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          {!sidebarCollapsed && (
            <h1 className="text-xl font-bold text-gray-800">
              Dashboard
            </h1>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          {nav.map((item, index) => (
            <div key={index} className="mb-2">
              <a
                href={item.href}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <item.icon size={20} className="mr-3 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </a>
              
              {/* Sub-navigation would go here for collapsed sidebar */}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Search */}
            <div className="flex-1 max-w-lg mx-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Actions and User Menu */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell size={20} />
                <span className="absolute top-0 right-0 block h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user.name}
                  </span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};`,
      documentation: {
        usage: 'Use DashboardLayout as a wrapper for your dashboard pages. It provides a responsive sidebar, header with search and user menu, and main content area.',
        props: [
          {
            name: 'children',
            type: 'React.ReactNode',
            description: 'Main content to be displayed in the dashboard',
            required: true
          },
          {
            name: 'user',
            type: 'object',
            description: 'User information for the header',
            required: false,
            default: '{ name: \'John Doe\', email: \'john@example.com\' }'
          },
          {
            name: 'navigation',
            type: 'array',
            description: 'Navigation items for the sidebar',
            required: false,
            default: '[]'
          },
          {
            name: 'actions',
            type: 'React.ReactNode',
            description: 'Additional actions for the header',
            required: false
          }
        ],
        examples: [
          {
            title: 'Basic Dashboard',
            description: 'Simple dashboard with default navigation',
            code: `import { DashboardLayout } from './components/DashboardLayout';

function App() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">Welcome to your Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Your dashboard content */}
        </div>
      </div>
    </DashboardLayout>
  );
}`
          }
        ]
      }
    },
    metadata: {
      author: 'Component Library Team',
      version: '1.0.0',
      lastUpdated: Date.now(),
      license: 'MIT',
      dependencies: ['react', 'lucide-react'],
      bundleSize: 5670,
      accessibilityScore: 92,
      browserSupport: ['Chrome', 'Firefox', 'Safari', 'Edge']
    },
    customization: {
      themes: [
        {
          name: 'Light',
          colors: {
            'sidebar-bg': '#ffffff',
            'sidebar-text': '#374151',
            'sidebar-hover': '#f3f4f6',
            'header-bg': '#ffffff',
            'content-bg': '#f9fafb'
          }
        },
        {
          name: 'Dark',
          colors: {
            'sidebar-bg': '#1f2937',
            'sidebar-text': '#f9fafb',
            'sidebar-hover': '#374151',
            'header-bg': '#1f2937',
            'content-bg': '#111827'
          }
        }
      ],
      variants: [
        {
          name: 'Compact',
          description: 'More compact layout with smaller spacing',
          props: { spacing: 'compact', fontSize: 'sm' }
        },
        {
          name: 'Spacious',
          description: 'More spacious layout with larger elements',
          props: { spacing: 'spacious', fontSize: 'lg' }
        }
      ],
      variables: [
        {
          name: 'sidebarWidth',
          type: 'spacing',
          default: '16rem',
          description: 'Width of the sidebar when expanded'
        },
        {
          name: 'sidebarCollapsedWidth',
          type: 'spacing',
          default: '4rem',
          description: 'Width of the sidebar when collapsed'
        },
        {
          name: 'headerHeight',
          type: 'spacing',
          default: '4rem',
          description: 'Height of the header'
        }
      ]
    },
    analytics: {
      downloads: 3456,
      likes: 234,
      forks: 123,
      rating: 4.7,
      reviews: 156,
      usage: 2789
    },
    related: ['layout-landing', 'layout-blog', 'layout-ecommerce']
  },

  // Content Templates
  {
    id: 'content-card-basic',
    name: 'Content Card',
    description: 'A flexible content card component for displaying various types of content',
    category: 'content',
    framework: 'react',
    industry: ['general', 'blog', 'ecommerce', 'news'],
    difficulty: 'beginner',
    estimatedTime: 20,
    tags: ['card', 'content', 'display', 'responsive'],
    preview: {
      features: ['Flexible content', 'Image support', 'Actions', 'Hover effects']
    },
    template: {
      source: `import React from 'react';
import { ArrowRight, Heart, Share2 } from 'lucide-react';

interface ContentCardProps {
  title: string;
  description?: string;
  image?: {
    src: string;
    alt: string;
    aspectRatio?: 'square' | 'video' | 'photo';
  };
  author?: {
    name: string;
    avatar?: string;
    date?: string;
  };
  tags?: string[];
  actions?: Array<{
    label: string;
    href: string;
    variant?: 'primary' | 'secondary' | 'ghost';
    icon?: React.ComponentType<{ size?: number }>;
  }>;
  metadata?: {
    readTime?: string;
    views?: number;
    likes?: number;
    comments?: number;
  };
  onClick?: () => void;
  onLike?: () => void;
  onShare?: () => void;
  variant?: 'default' | 'featured' | 'compact' | 'detailed';
  className?: string;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  title,
  description,
  image,
  author,
  tags = [],
  actions = [],
  metadata,
  onClick,
  onLike,
  onShare,
  variant = 'default',
  className = ''
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick && !(e.target as HTMLElement).closest('button, a')) {
      onClick();
    }
  };

  const getAspectRatioClass = (ratio?: string) => {
    switch (ratio) {
      case 'square':
        return 'aspect-square';
      case 'video':
        return 'aspect-video';
      case 'photo':
        return 'aspect-[4/3]';
      default:
        return 'aspect-[4/3]';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'featured':
        return 'border-2 border-blue-200 shadow-lg';
      case 'compact':
        return 'p-4';
      case 'detailed':
        return 'p-6 space-y-4';
      default:
        return 'p-6';
    }
  };

  return (
    <article 
      className={\`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer \${getVariantClasses()} \${className}\`}
      onClick={handleClick}
    >
      {/* Image */}
      {image && (
        <div className={\`relative \${variant === 'compact' ? 'mb-3' : 'mb-4'} \${getAspectRatioClass(image.aspectRatio)}\`}>
          <img
            src={image.src}
            alt={image.alt}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {variant === 'featured' && (
            <div className="absolute top-2 left-2">
              <span className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                Featured
              </span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className={\`space-y-3 \${variant === 'detailed' ? 'space-y-4' : ''}\`}>
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <h3 className={\`font-bold text-gray-900 line-clamp-2 \${variant === 'compact' ? 'text-sm' : 'text-lg'}\`}>
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className={\`text-gray-600 line-clamp-3 \${variant === 'compact' ? 'text-sm' : ''}\`}>
            {description}
          </p>
        )}

        {/* Author */}
        {author && (
          <div className="flex items-center space-x-3">
            {author.avatar ? (
              <img
                src={author.avatar}
                alt={author.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {author.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">{author.name}</p>
              {author.date && (
                <p className="text-xs text-gray-500">{author.date}</p>
              )}
            </div>
          </div>
        )}

        {/* Metadata */}
        {metadata && (
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {metadata.readTime && (
              <span>{metadata.readTime}</span>
            )}
            {metadata.views !== undefined && (
              <span>{metadata.views} views</span>
            )}
            {metadata.likes !== undefined && (
              <button 
                onClick={(e) => { e.stopPropagation(); onLike?.(); }}
                className="flex items-center space-x-1 hover:text-red-500 transition-colors"
              >
                <Heart size={14} />
                <span>{metadata.likes}</span>
              </button>
            )}
            {metadata.comments !== undefined && (
              <span>{metadata.comments} comments</span>
            )}
          </div>
        )}

        {/* Actions */}
        {actions.length > 0 && (
          <div className={\`flex items-center space-x-2 \${variant === 'compact' ? 'pt-2' : 'pt-4'}\`}>
            {actions.map((action, index) => (
              <a
                key={index}
                href={action.href}
                onClick={(e) => e.stopPropagation()}
                className={\`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors \${
                  action.variant === 'primary'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : action.variant === 'secondary'
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'text-gray-600 hover:text-gray-900'
                }\`}
              >
                {action.icon && <action.icon size={16} className="mr-2" />}
                {action.label}
                {action.label === 'Read More' && <ArrowRight size={14} className="ml-1" />}
              </a>
            ))}
            
            {onShare && (
              <button
                onClick={(e) => { e.stopPropagation(); onShare(); }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Share2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
};`,
      documentation: {
        usage: 'Use ContentCard to display content in a card format. It supports images, author info, tags, metadata, and various actions.',
        props: [
          {
            name: 'title',
            type: 'string',
            description: 'The main title of the card',
            required: true
          },
          {
            name: 'description',
            type: 'string',
            description: 'Optional description text',
            required: false
          },
          {
            name: 'image',
            type: 'object',
            description: 'Optional image configuration',
            required: false
          },
          {
            name: 'author',
            type: 'object',
            description: 'Author information',
            required: false
          },
          {
            name: 'tags',
            type: 'string[]',
            description: 'Array of tags',
            required: false,
            default: '[]'
          },
          {
            name: 'actions',
            type: 'array',
            description: 'Array of action buttons',
            required: false,
            default: '[]'
          },
          {
            name: 'variant',
            type: 'string',
            description: 'Card variant style',
            required: false,
            default: '\'default\''
          }
        ],
        examples: [
          {
            title: 'Blog Post Card',
            description: 'Card for displaying blog post information',
            code: `import { ContentCard } from './components/ContentCard';

function BlogList({ posts }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map(post => (
        <ContentCard
          key={post.id}
          title={post.title}
          description={post.excerpt}
          image={{
            src: post.image,
            alt: post.title,
            aspectRatio: 'photo'
          }}
          author={{
            name: post.author,
            date: post.publishedAt
          }}
          tags={post.categories}
          metadata={{
            readTime: post.readTime,
            views: post.views,
            likes: post.likes
          }}
          actions={[
            {
              label: 'Read More',
              href: \`/posts/\${post.slug}\`,
              variant: 'primary'
            }
          ]}
        />
      ))}
    </div>
  );
}`
          }
        ]
      }
    },
    metadata: {
      author: 'Component Library Team',
      version: '1.0.0',
      lastUpdated: Date.now(),
      license: 'MIT',
      dependencies: ['react', 'lucide-react'],
      bundleSize: 2340,
      accessibilityScore: 94,
      browserSupport: ['Chrome', 'Firefox', 'Safari', 'Edge']
    },
    customization: {
      themes: [
        {
          name: 'Default',
          colors: {
            'bg-primary': '#ffffff',
            'text-primary': '#111827',
            'text-secondary': '#6b7280',
            'border-color': '#e5e7eb',
            'hover-bg': '#f9fafb'
          }
        },
        {
          name: 'Dark',
          colors: {
            'bg-primary': '#1f2937',
            'text-primary': '#f9fafb',
            'text-secondary': '#d1d5db',
            'border-color': '#374151',
            'hover-bg': '#374151'
          }
        }
      ],
      variants: [
        {
          name: 'Minimal',
          description: 'Minimal card with just title and description',
          props: { showImage: false, showAuthor: false, showActions: false }
        },
        {
          name: 'Social',
          description: 'Card optimized for social media content',
          props: { showShareButton: true, showLikeButton: true }
        }
      ],
      variables: [
        {
          name: 'cardBorderRadius',
          type: 'number',
          default: 8,
          description: 'Border radius for the card'
        },
        {
          name: 'imageAspectRatio',
          type: 'string',
          default: '4/3',
          description: 'Default aspect ratio for images'
        }
      ]
    },
    analytics: {
      downloads: 8765,
      likes: 567,
      forks: 234,
      rating: 4.5,
      reviews: 345,
      usage: 7234
    },
    related: ['content-grid', 'content-list', 'content-masonry']
  },

  // Interactive Templates
  {
    id: 'interactive-modal-basic',
    name: 'Modal Dialog',
    description: 'A flexible modal component for dialogs, confirmations, and forms',
    category: 'interactive',
    framework: 'react',
    industry: ['general', 'applications', 'ecommerce'],
    difficulty: 'intermediate',
    estimatedTime: 40,
    tags: ['modal', 'dialog', 'popup', 'overlay'],
    preview: {
      features: ['Backdrop click', 'ESC key support', 'Focus management', 'Animations']
    },
    template: {
      source: `import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  className?: string;
  modalClassName?: string;
  backdropClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEsc = true,
  showCloseButton = true,
  className = '',
  modalClassName = '',
  backdropClassName = ''
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Focus the modal
      setTimeout(() => {
        if (modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusableElements.length > 0) {
            (focusableElements[0] as HTMLElement).focus();
          }
        }
      }, 100);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = 'unset';
      
      // Restore focus to the previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
        previousActiveElement.current = null;
      }
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // ESC key handling
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEsc) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose, closeOnEsc]);

  // Backdrop click handling
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose();
    }
  };

  // Prevent click propagation inside modal
  const handleModalClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'md':
        return 'max-w-lg';
      case 'lg':
        return 'max-w-2xl';
      case 'xl':
        return 'max-w-4xl';
      case 'full':
        return 'max-w-7xl mx-4';
      default:
        return 'max-w-lg';
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={\`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity \${backdropClassName}\`}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={\`bg-white rounded-lg shadow-xl w-full transform transition-all duration-300 ease-out \${getSizeClasses()} \${className}\`}
        onClick={handleModalClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              {title && (
                <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-description" className="mt-1 text-sm text-gray-500">
                  {description}
                </p>
              )}
            </div>
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-4 p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Confirmation Modal Component
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  loading = false
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'danger':
        return {
          confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          icon: 'text-red-600'
        };
      case 'warning':
        return {
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
          icon: 'text-yellow-600'
        };
      case 'info':
      default:
        return {
          confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          icon: 'text-blue-600'
        };
    }
  };

  const variantClasses = getVariantClasses();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center">
        <div className={\`mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-opacity-10 \${variantClasses.icon.replace('text-', 'bg-')}\`}>
          <svg className={\`h-6 w-6 \${variantClasses.icon}\`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="mt-2 text-sm text-gray-500">{message}</p>
        </div>
      </div>

      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
        <button
          type="button"
          disabled={loading}
          onClick={onConfirm}
          className={\`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed \${variantClasses.confirmButton}\`}
        >
          {loading ? 'Loading...' : confirmText}
        </button>
        
        <button
          type="button"
          disabled={loading}
          onClick={onClose}
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cancelText}
        </button>
      </div>
    </Modal>
  );
};`,
      documentation: {
        usage: 'Use the Modal component for dialogs, confirmations, and forms. The ConfirmModal is a pre-built confirmation dialog.',
        props: [
          {
            name: 'isOpen',
            type: 'boolean',
            description: 'Controls whether the modal is visible',
            required: true
          },
          {
            name: 'onClose',
            type: '() => void',
            description: 'Callback when modal is closed',
            required: true
          },
          {
            name: 'title',
            type: 'string',
            description: 'Modal title',
            required: false
          },
          {
            name: 'description',
            type: 'string',
            description: 'Modal description',
            required: false
          },
          {
            name: 'children',
            type: 'React.ReactNode',
            description: 'Modal content',
            required: false
          },
          {
            name: 'footer',
            type: 'React.ReactNode',
            description: 'Modal footer content',
            required: false
          },
          {
            name: 'size',
            type: 'string',
            description: 'Modal size',
            required: false,
            default: '\'md\''
          }
        ],
        examples: [
          {
            title: 'Basic Modal',
            description: 'Simple modal with content',
            code: `import { Modal } from './components/Modal';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>
        Open Modal
      </button>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Edit Profile"
      >
        <form>
          <input type="text" placeholder="Name" />
          <input type="email" placeholder="Email" />
        </form>
        <footer>
          <button onClick={() => setIsModalOpen(false)}>Cancel</button>
          <button onClick={() => setIsModalOpen(false)}>Save</button>
        </footer>
      </Modal>
    </>
  );
}`
          },
          {
            title: 'Confirmation Dialog',
            description: 'Simple confirmation dialog',
            code: `import { ConfirmModal } from './components/Modal';

function App() {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    // Perform deletion
    setShowConfirm(false);
  };

  return (
    <>
      <button onClick={handleDelete}>
        Delete Item
      </button>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        variant="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}`
          }
        ]
      }
    },
    metadata: {
      author: 'Component Library Team',
      version: '1.0.0',
      lastUpdated: Date.now(),
      license: 'MIT',
      dependencies: ['react'],
      bundleSize: 4230,
      accessibilityScore: 96,
      browserSupport: ['Chrome', 'Firefox', 'Safari', 'Edge']
    },
    customization: {
      themes: [
        {
          name: 'Light',
          colors: {
            'modal-bg': '#ffffff',
            'modal-text': '#111827',
            'backdrop-bg': 'rgba(0, 0, 0, 0.5)',
            'border-color': '#e5e7eb'
          }
        },
        {
          name: 'Dark',
          colors: {
            'modal-bg': '#1f2937',
            'modal-text': '#f9fafb',
            'backdrop-bg': 'rgba(0, 0, 0, 0.7)',
            'border-color': '#374151'
          }
        }
      ],
      variants: [
        {
          name: 'Minimal',
          description: 'Modal without header and footer',
          props: { showHeader: false, showFooter: false }
        },
        {
          name: 'Centered',
          description: 'Centered modal with minimal styling',
          props: { position: 'center', showCloseButton: false }
        }
      ],
      variables: [
        {
          name: 'modalBorderRadius',
          type: 'number',
          default: 8,
          description: 'Border radius for modal'
        },
        {
          name: 'modalPadding',
          type: 'spacing',
          default: '1.5rem',
          description: 'Padding inside modal'
        }
      ]
    },
    analytics: {
      downloads: 5432,
      likes: 423,
      forks: 156,
      rating: 4.6,
      reviews: 234,
      usage: 4567
    },
    related: ['interactive-tooltip', 'interactive-dropdown', 'interactive-tabs']
  },

  // E-commerce Templates
  {
    id: 'ecommerce-product-card',
    name: 'Product Card',
    description: 'Product card component for e-commerce websites with image, price, and actions',
    category: 'ecommerce',
    framework: 'react',
    industry: ['ecommerce', 'retail', 'marketplace'],
    difficulty: 'beginner',
    estimatedTime: 25,
    tags: ['product', 'ecommerce', 'card', 'shopping'],
    preview: {
      features: ['Product image', 'Price display', 'Add to cart', 'Wishlist', 'Quick view']
    },
    template: {
      source: `import React, { useState } from 'react';
import { Heart, ShoppingCart, Eye, Star } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: {
    src: string;
    alt: string;
  };
  rating?: number;
  reviews?: number;
  badge?: string;
  category: string;
  inStock: boolean;
  tags?: string[];
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  onProductClick?: (product: Product) => void;
  showQuickActions?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onAddToWishlist,
  onQuickView,
  onProductClick,
  showQuickActions = true,
  variant = 'default',
  className = ''
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(product);
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    onAddToWishlist?.(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickView?.(product);
  };

  const handleProductClick = () => {
    onProductClick?.(product);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const calculateDiscount = () => {
    if (!product.originalPrice) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'compact':
        return 'p-3';
      case 'detailed':
        return 'p-6 space-y-4';
      default:
        return 'p-4';
    }
  };

  return (
    <div 
      className={\`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer \${getVariantClasses()} \${className}\`}
      onClick={handleProductClick}
    >
      {/* Image Container */}
      <div className="relative group">
        <div className={\`relative overflow-hidden rounded-lg \${variant === 'compact' ? 'aspect-square' : 'aspect-[4/5]'}\`}>
          {!imageError ? (
            <img
              src={product.image.src}
              alt={product.image.alt}
              className={\`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 \${imageLoaded ? 'opacity-100' : 'opacity-0'}\`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">Image not available</span>
            </div>
          )}
          
          {/* Loading skeleton */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}

          {/* Badge */}
          {product.badge && (
            <div className="absolute top-2 left-2">
              <span className="bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                {product.badge}
              </span>
            </div>
          )}

          {/* Discount Badge */}
          {product.originalPrice && (
            <div className="absolute top-2 right-2">
              <span className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                -{calculateDiscount()}%
              </span>
            </div>
          )}

          {/* Stock Status */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-medium">Out of Stock</span>
            </div>
          )}

          {/* Quick Actions */}
          {showQuickActions && (
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex space-x-2">
                <button
                  onClick={handleQuickView}
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                  title="Quick View"
                >
                  <Eye size={16} className="text-gray-700" />
                </button>
                
                <button
                  onClick={handleAddToWishlist}
                  className={\`p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors \${
                    isWishlisted ? 'text-red-500' : 'text-gray-700'
                  }\`}
                  title="Add to Wishlist"
                >
                  <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={\`space-y-2 \${variant === 'detailed' ? 'space-y-4' : ''}\`}>
        {/* Category */}
        {variant === 'detailed' && (
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            {product.category}
          </p>
        )}

        {/* Product Name */}
        <h3 className={\`font-medium text-gray-900 line-clamp-2 \${variant === 'compact' ? 'text-sm' : 'text-base'}\`}>
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center space-x-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={\`\${
                    i < Math.floor(product.rating!)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }\`}
                />
              ))}
            </div>
            {product.reviews && (
              <span className="text-xs text-gray-500">
                ({product.reviews})
              </span>
            )}
          </div>
        )}

        {/* Tags */}
        {variant === 'detailed' && product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center space-x-2">
          <span className={\`font-bold text-gray-900 \${variant === 'compact' ? 'text-sm' : 'text-lg'}\`}>
            {formatPrice(product.price)}
          </span>
          
          {product.originalPrice && (
            <span className={\`text-gray-500 line-through \${variant === 'compact' ? 'text-xs' : 'text-sm'}\`}>
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className={\`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-md font-medium transition-colors \${
            product.inStock
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          \} \${variant === 'compact' ? 'text-sm' : ''}\`}
        >
          <ShoppingCart size={16} />
          <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
        </button>
      </div>
    </div>
  );
};`,
      documentation: {
        usage: 'Use ProductCard to display products in e-commerce interfaces. It supports images, pricing, ratings, and shopping actions.',
        props: [
          {
            name: 'product',
            type: 'object',
            description: 'Product data object',
            required: true
          },
          {
            name: 'onAddToCart',
            type: 'function',
            description: 'Callback when add to cart is clicked',
            required: false
          },
          {
            name: 'onAddToWishlist',
            type: 'function',
            description: 'Callback when add to wishlist is clicked',
            required: false
          },
          {
            name: 'onQuickView',
            type: 'function',
            description: 'Callback when quick view is clicked',
            required: false
          },
          {
            name: 'variant',
            type: 'string',
            description: 'Card variant style',
            required: false,
            default: '\'default\''
          }
        ],
        examples: [
          {
            title: 'Product Grid',
            description: 'Grid of product cards for store listing',
            code: `import { ProductCard } from './components/ProductCard';

function ProductGrid({ products }) {
  const handleAddToCart = (product) => {
    console.log('Adding to cart:', product);
    // Add to cart logic
  };

  const handleAddToWishlist = (product) => {
    console.log('Adding to wishlist:', product);
    // Add to wishlist logic
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={handleAddToCart}
          onAddToWishlist={handleAddToWishlist}
          showQuickActions={true}
        />
      ))}
    </div>
  );
}`
          }
        ]
      }
    },
    metadata: {
      author: 'Component Library Team',
      version: '1.0.0',
      lastUpdated: Date.now(),
      license: 'MIT',
      dependencies: ['react'],
      bundleSize: 3450,
      accessibilityScore: 91,
      browserSupport: ['Chrome', 'Firefox', 'Safari', 'Edge']
    },
    customization: {
      themes: [
        {
          name: 'Default',
          colors: {
            'bg-primary': '#ffffff',
            'text-primary': '#111827',
            'text-secondary': '#6b7280',
            'price-color': '#059669',
            'badge-bg': '#dc2626'
          }
        },
        {
          name: 'Dark',
          colors: {
            'bg-primary': '#1f2937',
            'text-primary': '#f9fafb',
            'text-secondary': '#d1d5db',
            'price-color': '#10b981',
            'badge-bg': '#dc2626'
          }
        }
      ],
      variants: [
        {
          name: 'List',
          description: 'Horizontal product card for list views',
          props: { layout: 'horizontal', showImage: true, compact: false }
        },
        {
          name: 'Minimal',
          description: 'Minimal product card without actions',
          props: { showQuickActions: false, showRating: false }
        }
      ],
      variables: [
        {
          name: 'cardBorderRadius',
          type: 'number',
          default: 8,
          description: 'Border radius for product card'
        },
        {
          name: 'imageAspectRatio',
          type: 'string',
          default: '4/5',
          description: 'Aspect ratio for product images'
        }
      ]
    },
    analytics: {
      downloads: 6789,
      likes: 445,
      forks: 189,
      rating: 4.4,
      reviews: 267,
      usage: 5892
    },
    related: ['ecommerce-cart', 'ecommerce-filter', 'ecommerce-search']
  }
];

// Template Categories and Filters
export const TEMPLATE_CATEGORIES = {
  navigation: 'Navigation components',
  forms: 'Form and input components',
  layout: 'Layout and structure components',
  content: 'Content display components',
  interactive: 'Interactive UI components',
  'data-display': 'Data visualization components',
  feedback: 'Feedback and notification components',
  media: 'Media and image components',
  charts: 'Charts and graphs',
  ecommerce: 'E-commerce components',
  blog: 'Blog and content components',
  dashboard: 'Dashboard components',
  landing: 'Landing page components',
  authentication: 'Authentication components',
  marketing: 'Marketing components'
} as const;

export const FRAMEWORKS = {
  'react': 'React',
  'vue': 'Vue.js',
  'angular': 'Angular',
  'svelte': 'Svelte',
  'vanilla-js': 'Vanilla JavaScript',
  'html': 'HTML',
  'css': 'CSS',
  'tailwind': 'Tailwind CSS',
  'bootstrap': 'Bootstrap',
  'material-ui': 'Material-UI',
  'chakra-ui': 'Chakra UI'
} as const;

export const INDUSTRIES = {
  technology: 'Technology',
  ecommerce: 'E-commerce',
  healthcare: 'Healthcare',
  finance: 'Finance',
  education: 'Education',
  entertainment: 'Entertainment',
  'real-estate': 'Real Estate',
  food: 'Food & Beverage',
  travel: 'Travel',
  automotive: 'Automotive',
  fashion: 'Fashion',
  sports: 'Sports',
  news: 'News & Media',
  social: 'Social',
  productivity: 'Productivity',
  gaming: 'Gaming'
} as const;

// Template Search and Filter Functions
export const searchTemplates = (
  query: string,
  filters: {
    category?: TemplateCategory;
    framework?: Framework;
    industry?: Industry;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    tags?: string[];
  } = {}
): ComponentTemplate[] => {
  let filtered = COMPONENT_TEMPLATES;

  // Text search
  if (query.trim()) {
    const searchTerm = query.toLowerCase();
    filtered = filtered.filter(template =>
      template.name.toLowerCase().includes(searchTerm) ||
      template.description.toLowerCase().includes(searchTerm) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  // Category filter
  if (filters.category) {
    filtered = filtered.filter(template => template.category === filters.category);
  }

  // Framework filter
  if (filters.framework) {
    filtered = filtered.filter(template => template.framework === filters.framework);
  }

  // Industry filter
  if (filters.industry) {
    filtered = filtered.filter(template => template.industry.includes(filters.industry!));
  }

  // Difficulty filter
  if (filters.difficulty) {
    filtered = filtered.filter(template => template.difficulty === filters.difficulty);
  }

  // Tags filter
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(template =>
      filters.tags!.some(tag => template.tags.includes(tag))
    );
  }

  return filtered;
};

export const getTemplatesByCategory = (category: TemplateCategory): ComponentTemplate[] => {
  return COMPONENT_TEMPLATES.filter(template => template.category === category);
};

export const getTemplatesByFramework = (framework: Framework): ComponentTemplate[] => {
  return COMPONENT_TEMPLATES.filter(template => template.framework === framework);
};

export const getFeaturedTemplates = (limit: number = 6): ComponentTemplate[] => {
  return COMPONENT_TEMPLATES
    .sort((a, b) => b.analytics.rating - a.analytics.rating)
    .slice(0, limit);
};

export const getRecentTemplates = (limit: number = 6): ComponentTemplate[] => {
  return COMPONENT_TEMPLATES
    .sort((a, b) => b.metadata.lastUpdated - a.metadata.lastUpdated)
    .slice(0, limit);
};

export const getPopularTemplates = (limit: number = 6): ComponentTemplate[] => {
  return COMPONENT_TEMPLATES
    .sort((a, b) => b.analytics.downloads - a.analytics.downloads)
    .slice(0, limit);
};

export const getRelatedTemplates = (templateId: string, limit: number = 4): ComponentTemplate[] => {
  const template = COMPONENT_TEMPLATES.find(t => t.id === templateId);
  if (!template) return [];

  return COMPONENT_TEMPLATES
    .filter(t => t.id !== templateId)
    .filter(t => 
      t.category === template.category ||
      t.framework === template.framework ||
      t.tags.some(tag => template.tags.includes(tag))
    )
    .slice(0, limit);
};

export const getAllTags = (): string[] => {
  const tags = new Set<string>();
  COMPONENT_TEMPLATES.forEach(template => {
    template.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
};

export const getTemplateById = (id: string): ComponentTemplate | undefined => {
  return COMPONENT_TEMPLATES.find(template => template.id === id);
};

export const getTemplateStats = (): {
  total: number;
  byCategory: Record<TemplateCategory, number>;
  byFramework: Record<Framework, number>;
  byDifficulty: Record<string, number>;
  averageRating: number;
  totalDownloads: number;
} => {
  const stats = {
    total: COMPONENT_TEMPLATES.length,
    byCategory: {} as Record<TemplateCategory, number>,
    byFramework: {} as Record<Framework, number>,
    byDifficulty: {} as Record<string, number>,
    averageRating: 0,
    totalDownloads: 0
  };

  COMPONENT_TEMPLATES.forEach(template => {
    // Count by category
    stats.byCategory[template.category] = (stats.byCategory[template.category] || 0) + 1;
    
    // Count by framework
    stats.byFramework[template.framework] = (stats.byFramework[template.framework] || 0) + 1;
    
    // Count by difficulty
    stats.byDifficulty[template.difficulty] = (stats.byDifficulty[template.difficulty] || 0) + 1;
    
    // Sum ratings and downloads
    stats.averageRating += template.analytics.rating;
    stats.totalDownloads += template.analytics.downloads;
  });

  // Calculate average rating
  stats.averageRating = stats.averageRating / COMPONENT_TEMPLATES.length;

  return stats;
};