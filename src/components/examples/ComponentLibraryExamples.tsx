/**
 * Component Library Example Usage
 * This file demonstrates how to use the React component generator and template library
 */

import React, { useState } from 'react';
import { 
  // Navigation Components
  Header, Navbar, Sidebar, MobileMenu,
  
  // Form Components  
  Input, Textarea, Select, Checkbox, Radio, Switch, FormField,
  
  // Layout Components
  Container, Grid, Flex, Stack, Center, AspectRatio,
  
  // Content Components
  Card, CardHeader, CardContent, CardFooter, ArticleCard, ProductCard, 
  List, ListItem, Image, Avatar, Badge, Skeleton,
  
  // Interactive Components
  Modal, Dropdown, Tooltip, Popover, Toast, ToastProvider, useToast, Accordion,
  
  // Preview System
  ComponentPreview, ComponentGallery,
  
  // Customization
  ComponentCustomizer
} from '../components';

// Example 1: Basic Navigation
export function NavigationExample() {
  const navigation = [
    { label: 'Home', href: '/', icon: () => null },
    { label: 'Products', href: '/products' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const actions = [
    { label: 'Sign In', href: '/signin', variant: 'ghost' },
    { label: 'Get Started', href: '/signup', variant: 'primary' },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Navigation Examples</h2>
      
      {/* Header Component */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Header Component</h3>
        </CardHeader>
        <CardContent>
          <Header 
            logo="MyApp"
            navigation={navigation}
            actions={actions}
            sticky={true}
          />
        </CardContent>
      </Card>

      {/* Navbar Component */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Navbar Component</h3>
        </CardHeader>
        <CardContent>
          <Navbar
            brand={{ name: 'Brand', logo: '/logo.png', href: '/' }}
            menu={[
              {
                label: 'Products',
                href: '/products',
                children: [
                  { label: 'Product 1', href: '/products/1' },
                  { label: 'Product 2', href: '/products/2' },
                ]
              },
              { label: 'About', href: '/about' },
              { label: 'Contact', href: '/contact' },
            ]}
            actions={[
              { label: 'Sign In', href: '/signin', variant: 'outline' },
              { label: 'Get Started', href: '/signup', variant: 'primary' },
            ]}
            variant="light"
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Example 2: Form Components
export function FormExample() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    bio: '',
    country: '',
    newsletter: true,
    notifications: 'email',
  });

  const countries = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Form Examples</h2>
      
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Complete Form</h3>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <FormField label="Email" required>
              <Input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Password" required>
              <Input
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Bio">
              <Textarea
                placeholder="Tell us about yourself"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
              />
            </FormField>

            <FormField label="Country">
              <Select
                placeholder="Select a country"
                options={countries}
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </FormField>

            <div className="space-y-4">
              <Checkbox
                label="Subscribe to newsletter"
                description="Get updates about new features"
                checked={formData.newsletter}
                onChange={(e) => setFormData({ ...formData, newsletter: e.target.checked })}
              />

              <div>
                <label className="block text-sm font-medium mb-2">Notification Preferences</label>
                <Radio
                  name="notifications"
                  options={[
                    { value: 'email', label: 'Email notifications' },
                    { value: 'sms', label: 'SMS notifications' },
                    { value: 'none', label: 'No notifications' },
                  ]}
                  value={formData.notifications}
                  onChange={(e) => setFormData({ ...formData, notifications: e.target.value })}
                />
              </div>

              <Switch
                label="Enable dark mode"
                description="Switch between light and dark themes"
                onChange={(checked) => console.log('Dark mode:', checked)}
              />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Example 3: Layout Components
export function LayoutExample() {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Layout Examples</h2>
      
      {/* Container */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Container</h3>
        </CardHeader>
        <CardContent>
          <Container size="lg" center padding="lg">
            <div className="bg-blue-50 p-4 rounded">
              This content is centered in a large container
            </div>
          </Container>
        </CardContent>
      </Card>

      {/* Grid */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Grid System</h3>
        </CardHeader>
        <CardContent>
          <Grid cols={3} gap="md">
            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <h4 className="font-semibold">Column 1</h4>
                <p className="text-sm text-gray-600">Responsive grid item</p>
              </CardContent>
            </Card>
            <Card className="bg-green-50">
              <CardContent className="p-4">
                <h4 className="font-semibold">Column 2</h4>
                <p className="text-sm text-gray-600">Responsive grid item</p>
              </CardContent>
            </Card>
            <Card className="bg-purple-50">
              <CardContent className="p-4">
                <h4 className="font-semibold">Column 3</h4>
                <p className="text-sm text-gray-600">Responsive grid item</p>
              </CardContent>
            </Card>
          </Grid>
        </CardContent>
      </Card>

      {/* Flex */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Flex Layout</h3>
        </CardHeader>
        <CardContent>
          <Flex gap="md" justify="between" items="center">
            <div className="flex-1">
              <h4 className="font-semibold">Flexible Item 1</h4>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">Flexible Item 2</h4>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">Flexible Item 3</h4>
            </div>
          </Flex>
        </CardContent>
      </Card>
    </div>
  );
}

// Example 4: Content Components
export function ContentExample() {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Content Examples</h2>
      
      {/* Article Card */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Article Cards</h3>
        </CardHeader>
        <CardContent>
          <Grid cols={2} gap="md">
            <ArticleCard
              title="Building Modern Web Applications"
              description="Learn how to create scalable and maintainable web applications using the latest technologies."
              image={{
                src: '/api/placeholder/400/200',
                alt: 'Web development',
                aspectRatio: 'video'
              }}
              author={{
                name: 'John Doe',
                avatar: '/api/placeholder/32/32'
              }}
              publishedAt="2024-01-15"
              readTime="5 min read"
              tags={['React', 'JavaScript', 'Web Development']}
              href="/articles/modern-web-apps"
            />
            <ArticleCard
              title="Design Systems Best Practices"
              description="Discover the key principles and patterns for creating effective design systems."
              image={{
                src: '/api/placeholder/400/200',
                alt: 'Design system',
                aspectRatio: 'video'
              }}
              author={{
                name: 'Jane Smith',
                avatar: '/api/placeholder/32/32'
              }}
              publishedAt="2024-01-10"
              readTime="8 min read"
              tags={['Design', 'UI/UX', 'Systems']}
              href="/articles/design-systems"
            />
          </Grid>
        </CardContent>
      </Card>

      {/* Product Card */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Product Cards</h3>
        </CardHeader>
        <CardContent>
          <Grid cols={3} gap="md">
            <ProductCard
              name="Premium Wireless Headphones"
              price={299.99}
              originalPrice={399.99}
              image={{
                src: '/api/placeholder/300/300',
                alt: 'Headphones'
              }}
              rating={4.5}
              reviews={128}
              badges={['Bestseller', 'New']}
              onAddToCart={() => console.log('Added to cart')}
              onAddToWishlist={() => console.log('Added to wishlist')}
            />
            <ProductCard
              name="Smart Watch Pro"
              price={449.99}
              image={{
                src: '/api/placeholder/300/300',
                alt: 'Smartwatch'
              }}
              rating={4.8}
              reviews={89}
              badges={['Featured']}
            />
            <ProductCard
              name="Bluetooth Speaker"
              price={129.99}
              originalPrice={159.99}
              image={{
                src: '/api/placeholder/300/300',
                alt: 'Speaker'
              }}
              rating={4.2}
              reviews={67}
              badges={['Sale']}
            />
          </Grid>
        </CardContent>
      </Card>

      {/* Avatar Examples */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Avatars</h3>
        </CardHeader>
        <CardContent>
          <Flex gap="md" items="center">
            <Avatar size="xs" src="/api/placeholder/24/24" />
            <Avatar size="sm" src="/api/placeholder/32/32" />
            <Avatar size="md" src="/api/placeholder/40/40" />
            <Avatar size="lg" src="/api/placeholder/48/48" />
            <Avatar size="xl" src="/api/placeholder/64/64" />
            <Avatar size="2xl" src="/api/placeholder/80/80" />
            <Avatar size="full" src="/api/placeholder/100/100" />
          </Flex>
          
          <div className="mt-4">
            <Flex gap="md" items="center">
              <Avatar variant="circle" src="/api/placeholder/40/40" status="online" />
              <Avatar variant="rounded" src="/api/placeholder/40/40" status="offline" />
              <Avatar variant="square" src="/api/placeholder/40/40" status="away" />
              <Avatar src="/api/placeholder/40/40" fallback="JS" status="busy" />
            </Flex>
          </div>
        </CardContent>
      </Card>

      {/* Badge Examples */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Badges</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Variants</h4>
              <Flex gap="sm" wrap>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="error">Error</Badge>
                <Badge variant="info">Info</Badge>
              </Flex>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Sizes</h4>
              <Flex gap="sm" wrap items="center">
                <Badge size="xs">Extra Small</Badge>
                <Badge size="sm">Small</Badge>
                <Badge size="md">Medium</Badge>
                <Badge size="lg">Large</Badge>
              </Flex>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">With Icons</h4>
              <Flex gap="sm" wrap>
                <Badge dot>New Feature</Badge>
                <Badge variant="success" dot>Verified</Badge>
                <Badge variant="warning" dot>Warning</Badge>
              </Flex>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Example 5: Interactive Components
export function InteractiveExample() {
  const { toasts, addToast, dismissToast } = useToast();

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Interactive Examples</h2>
      
      {/* Modal */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Modal</h3>
        </CardHeader>
        <CardContent>
          <ModalExample />
        </CardContent>
      </Card>

      {/* Dropdown */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Dropdown</h3>
        </CardHeader>
        <CardContent>
          <DropdownExample />
        </CardContent>
      </Card>

      {/* Tooltip */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Tooltip</h3>
        </CardHeader>
        <CardContent>
          <Flex gap="lg" justify="center" items="center">
            <Tooltip content="This is a tooltip" position="top">
              <button className="px-4 py-2 bg-blue-500 text-white rounded">Hover me</button>
            </Tooltip>
            <Tooltip content="Tooltip on the right" position="right">
              <button className="px-4 py-2 bg-green-500 text-white rounded">Right</button>
            </Tooltip>
            <Tooltip content="Tooltip below" position="bottom">
              <button className="px-4 py-2 bg-purple-500 text-white rounded">Bottom</button>
            </Tooltip>
            <Tooltip content="Tooltip on the left" position="left">
              <button className="px-4 py-2 bg-red-500 text-white rounded">Left</button>
            </Tooltip>
          </Flex>
        </CardContent>
      </Card>

      {/* Toast Notifications */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Toast Notifications</h3>
        </CardHeader>
        <CardContent>
          <Flex gap="sm" wrap>
            <button
              onClick={() => addToast({ type: 'success', title: 'Success!', message: 'Operation completed successfully' })}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Show Success
            </button>
            <button
              onClick={() => addToast({ type: 'error', title: 'Error!', message: 'Something went wrong' })}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Show Error
            </button>
            <button
              onClick={() => addToast({ type: 'warning', title: 'Warning!', message: 'Please check your input' })}
              className="px-4 py-2 bg-yellow-500 text-white rounded"
            >
              Show Warning
            </button>
            <button
              onClick={() => addToast({ type: 'info', title: 'Info', message: 'Here is some information' })}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Show Info
            </button>
          </Flex>
        </CardContent>
      </Card>

      {/* Accordion */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Accordion</h3>
        </CardHeader>
        <CardContent>
          <Accordion
            items={[
              {
                id: '1',
                title: 'Getting Started',
                content: (
                  <div>
                    <p>Welcome to our component library! This section will help you get started quickly.</p>
                    <ul className="mt-2 list-disc list-inside">
                      <li>Install the library</li>
                      <li>Import components</li>
                      <li>Start building</li>
                    </ul>
                  </div>
                )
              },
              {
                id: '2',
                title: 'Components Overview',
                content: (
                  <div>
                    <p>Our library includes:</p>
                    <ul className="mt-2 list-disc list-inside">
                      <li>Navigation components</li>
                      <li>Form controls</li>
                      <li>Layout utilities</li>
                      <li>Interactive elements</li>
                    </ul>
                  </div>
                )
              },
              {
                id: '3',
                title: 'Customization',
                content: (
                  <div>
                    <p>All components can be customized using:</p>
                    <ul className="mt-2 list-disc list-inside">
                      <li>Tailwind CSS classes</li>
                      <li>Component props</li>
                      <li>Theme system</li>
                      <li>Style overrides</li>
                    </ul>
                  </div>
                )
              }
            ]}
            allowMultiple={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Modal Example Component
function ModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Open Modal
      </button>
      
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Modal Example"
        description="This is an example of a modal dialog"
        size="lg"
      >
        <div className="space-y-4">
          <p>This is the modal content. You can put any content here.</p>
          
          <div className="bg-gray-50 p-4 rounded">
            <h4 className="font-semibold mb-2">Features:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Esc key to close</li>
              <li>Click outside to close</li>
              <li>Focus management</li>
              <li>Responsive design</li>
            </ul>
          </div>
          
          <Flex gap="sm" justify="end">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Confirm
            </button>
          </Flex>
        </div>
      </Modal>
    </div>
  );
}

// Dropdown Example Component
function DropdownExample() {
  const options = [
    {
      value: 'profile',
      label: 'Profile Settings',
      description: 'Manage your account settings',
      icon: () => <div>👤</div>
    },
    {
      value: 'settings',
      label: 'Application Settings',
      description: 'Configure app preferences',
      icon: () => <div>⚙️</div>
    },
    {
      value: 'help',
      label: 'Help & Support',
      description: 'Get help and contact support',
      icon: () => <div>❓</div>
    },
    {
      value: 'logout',
      label: 'Sign Out',
      description: 'Sign out of your account',
      onClick: () => console.log('Logging out...'),
      icon: () => <div>🚪</div>
    }
  ];

  return (
    <Dropdown
      trigger={
        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
          User Menu
        </button>
      }
      options={options}
      align="end"
    />
  );
}

// Example 6: Component Preview System
export function PreviewExample() {
  // Example components to preview
  const exampleComponents = [
    {
      name: 'Button',
      component: () => (
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Click me
        </button>
      ),
      category: 'Basic',
      description: 'A basic button component'
    },
    {
      name: 'Input Field',
      component: () => (
        <input
          type="text"
          placeholder="Enter text..."
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ),
      category: 'Forms',
      description: 'An input field component'
    },
    {
      name: 'Card',
      component: () => (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-2">Card Title</h3>
          <p className="text-gray-600">This is a card component example.</p>
        </div>
      ),
      category: 'Layout',
      description: 'A card layout component'
    }
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Preview System Examples</h2>
      
      {/* Component Preview */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Interactive Component Preview</h3>
        </CardHeader>
        <CardContent>
          <ComponentPreview
            component={({ children, className }) => (
              <button className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${className}`}>
                {children || 'Click me'}
              </button>
            )}
            componentProps={{
              children: 'Custom Button Text'
            }}
            showControls={true}
            showCode={true}
            showPreview={true}
          />
        </CardContent>
      </Card>

      {/* Component Gallery */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Component Gallery</h3>
        </CardHeader>
        <CardContent>
          <ComponentGallery
            components={exampleComponents}
            categories={['Basic', 'Forms', 'Layout']}
            onComponentSelect={(component, props) => {
              console.log('Selected component:', component, 'with props:', props);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Example 7: Component Customization
export function CustomizationExample() {
  const customizer = new ComponentCustomizer({
    colors: {
      primary: '#3b82f6',
      secondary: '#6b7280',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    spacing: {
      baseUnit: 4,
      scale: 'normal'
    },
    typography: {
      fontFamily: {
        sans: 'Inter, sans-serif'
      }
    }
  });

  const buttonVariants = customizer.generateVariants('button', {
    children: 'Custom Button',
    disabled: false,
    loading: false
  });

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Customization Examples</h2>
      
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Dynamic Class Generation</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Generated button variants:</p>
            <div className="grid grid-cols-5 gap-4">
              {Object.entries(buttonVariants).map(([variant, props]) => (
                <button
                  key={variant}
                  className={props.className}
                  {...props}
                >
                  {variant}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main Example Container
export default function ComponentLibraryExamples() {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto py-12 px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              React Component Generator & Template Library
            </h1>
            <p className="text-lg text-gray-600">
              A comprehensive collection of React components with AI-powered generation,
              customization, and preview capabilities.
            </p>
          </div>

          <NavigationExample />
          <FormExample />
          <LayoutExample />
          <ContentExample />
          <InteractiveExample />
          <PreviewExample />
          <CustomizationExample />
        </div>
      </div>
    </ToastProvider>
  );
}