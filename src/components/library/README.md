# React Component Generator & Template Library

A comprehensive React component library with AI-powered generation, extensive customization options, and interactive preview capabilities.

## 🚀 Features

- **100+ Starter Components**: Pre-built, production-ready components
- **AI-Powered Generation**: Generate components from wireframes using GPT-5
- **Component Customization**: Dynamic prop configuration, style customization, and theme integration
- **Interactive Preview System**: Real-time component demos with code preview
- **Type-Safe**: Full TypeScript support with comprehensive type definitions
- **Performance Optimized**: Efficient rendering for large component sets
- **Responsive Design**: Mobile-first approach with breakpoint customization
- **Accessibility Ready**: Built-in ARIA labels and keyboard navigation

## 📦 Installation

```bash
npm install react-syntax-highlighter @types/react-syntax-highlighter clsx tailwind-merge
```

## 🎯 Quick Start

### Basic Usage

```tsx
import {
  Button,
  Input,
  Card,
  Modal,
  ComponentPreview
} from '@/components';

function App() {
  return (
    <div className="p-6">
      <Card>
        <h2>Welcome to our App</h2>
        <Input placeholder="Enter your email" />
        <Button variant="primary">Submit</Button>
      </Card>
    </div>
  );
}
```

### Component Preview System

```tsx
import { ComponentPreview } from '@/components';

function MyPreview() {
  return (
    <ComponentPreview
      component={Button}
      componentProps={{
        variant: 'primary',
        children: 'Click me',
        disabled: false
      }}
      showControls={true}
      showCode={true}
    />
  );
}
```

## 🏗️ Component Categories

### Navigation Components

- **Header**: Sticky navigation header with branding and actions
- **Navbar**: Responsive navigation bar with dropdowns
- **Sidebar**: Collapsible sidebar navigation
- **MobileMenu**: Full-screen mobile navigation overlay

```tsx
import { Header, Navbar } from '@/components';

<Header 
  logo="MyApp"
  navigation={[
    { label: 'Home', href: '/', icon: HomeIcon },
    { label: 'Products', href: '/products' },
    { label: 'About', href: '/about' }
  ]}
  actions={[
    { label: 'Sign In', href: '/signin', variant: 'ghost' },
    { label: 'Get Started', href: '/signup', variant: 'primary' }
  ]}
  sticky={true}
/>
```

### Form Components

- **Input**: Text inputs with validation and styling variants
- **Textarea**: Multi-line text input with resize options
- **Select**: Dropdown selection with search functionality
- **Checkbox**: Single and multi-select checkboxes
- **Radio**: Radio button groups
- **Switch**: Toggle switches with animations
- **FormField**: Wrapper component for form validation

```tsx
import { Input, Select, FormField } from '@/components';

<FormField label="Email" required error={emailError}>
  <Input
    type="email"
    placeholder="Enter your email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    leftIcon={MailIcon}
    required
  />
</FormField>

<Select
  label="Country"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' }
  ]}
  placeholder="Select a country"
/>
```

### Layout Components

- **Container**: Responsive container with size options
- **Grid**: CSS Grid-based layout system
- **Flex**: Flexbox utility component
- **Stack**: Vertical spacing utility
- **Center**: Center content in viewport
- **AspectRatio**: Maintain aspect ratios
- **SafeArea**: Handle device safe areas

```tsx
import { Container, Grid, Flex } from '@/components';

<Container size="lg" center padding="lg">
  <Grid cols={3} gap="md">
    <Card>Column 1</Card>
    <Card>Column 2</Card>
    <Card>Column 3</Card>
  </Grid>
</Container>

<Flex gap="md" justify="between" items="center">
  <div>Left Content</div>
  <div>Right Content</div>
</Flex>
```

### Content Components

- **Card**: Content container with variants
- **ArticleCard**: Blog article preview cards
- **ProductCard**: E-commerce product display
- **List**: Bulleted and numbered lists
- **Image**: Responsive images with fallbacks
- **Avatar**: User avatars with status indicators
- **Badge**: Status and label badges
- **Skeleton**: Loading placeholders

```tsx
import { Card, CardHeader, CardContent, Badge } from '@/components';

<Card variant="elevated" padding="lg">
  <CardHeader>
    <h3>Article Title</h3>
    <Badge variant="success" dot>Published</Badge>
  </CardHeader>
  <CardContent>
    <p>This is the article content...</p>
  </CardContent>
</Card>
```

### Interactive Components

- **Modal**: Dialog modals with focus management
- **Dropdown**: Context menus and dropdowns
- **Tooltip**: Information tooltips
- **Popover**: Content popovers
- **Toast**: Notification toasts
- **Accordion**: Expandable content sections

```tsx
import { Modal, Dropdown, Toast, ToastProvider, useToast } from '@/components';

function MyComponent() {
  const { addToast } = useToast();
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Confirm Action"
      size="md"
    >
      <p>Are you sure you want to proceed?</p>
      <button onClick={() => {
        addToast({
          type: 'success',
          title: 'Action completed',
          message: 'Your action was successful'
        });
      }}>
        Confirm
      </button>
    </Modal>
  );
}

// Wrap with ToastProvider at app level
<ToastProvider>
  <MyComponent />
</ToastProvider>
```

## 🎨 Component Customization

### Using the ComponentCustomizer

```tsx
import { ComponentCustomizer } from '@/lib/utils/component-customizer';

const customizer = new ComponentCustomizer({
  colors: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    success: '#10b981'
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

// Generate component variants
const buttonVariants = customizer.generateVariants('button', {
  children: 'Click me',
  variant: 'primary'
});

// Create themed components
const theme = {
  name: 'Dark Theme',
  colors: {
    primary: '#3b82f6',
    background: '#1a1a1a',
    text: '#ffffff'
  }
};

const themedProps = customizer.applyTheme('button', theme);
```

### Dynamic Styling

```tsx
import { generateDynamicStyles } from '@/lib/utils/component-customizer';

const styles = generateDynamicStyles('button', {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  padding: '12px 24px'
});
```

## 🔍 Component Preview System

### Component Preview

```tsx
import { ComponentPreview } from '@/components/component-preview';

<ComponentPreview
  component={Button}
  componentProps={{
    variant: 'primary',
    size: 'md',
    disabled: false,
    children: 'Click me'
  }}
  showControls={true}
  showCode={true}
  showPreview={true}
  defaultView="desktop"
/>
```

### Component Gallery

```tsx
import { ComponentGallery } from '@/components/component-preview';

const components = [
  {
    name: 'Button',
    component: Button,
    category: 'Basic',
    description: 'A customizable button component'
  },
  {
    name: 'Input',
    component: Input,
    category: 'Forms',
    description: 'Text input with validation'
  }
];

<ComponentGallery
  components={components}
  categories={['Basic', 'Forms', 'Layout']}
  onComponentSelect={(component, props) => {
    console.log('Selected:', component, props);
  }}
/>
```

## 🤖 AI Component Generation

### Generate from Wireframe

```tsx
import { ComponentGenerator } from '@/lib/ai/component-generator';

const generator = new ComponentGenerator({
  includeTypescript: true,
  includeTailwind: true,
  includeAccessibility: true,
  includeVariants: true
});

const wireframeData = {
  components: [
    {
      id: '1',
      type: 'button',
      position: { x: 100, y: 100 },
      size: { width: 120, height: 40 },
      properties: {
        text: 'Submit',
        variant: 'primary'
      }
    }
  ],
  layout: 'grid',
  spacing: 'normal',
  theme: 'light'
};

const components = await generator.generateComponent(wireframeData);
```

### Generate from Description

```tsx
const components = await generator.generateFromDescription(
  'Create a pricing card component with a title, description, price, and CTA button'
);
```

### Batch Generation

```tsx
const components = await generator.batchGenerate(wireframeElements);
```

## 📱 Responsive Design

### Responsive Props

All components support responsive variants using Tailwind's breakpoint system:

```tsx
<Button
  size="sm md:md lg:lg"
  className="w-full md:w-auto"
>
  Responsive Button
</Button>

<Grid
  cols={1}
  sm={2}
  md={3}
  lg={4}
  gap="md"
>
  {/* Items */}
</Grid>
```

### Viewport Previews

```tsx
<ComponentPreview
  defaultView="mobile" // mobile | tablet | desktop | full
  // ... other props
/>
```

## ♿ Accessibility

All components include built-in accessibility features:

- ARIA labels and roles
- Keyboard navigation
- Focus management
- Screen reader support
- Color contrast compliance

```tsx
// Example: Modal with accessibility
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Dialog Title"
  description="Dialog description for screen readers"
  closeOnEscape={true}
  closeOnOverlayClick={true}
>
  {/* Content */}
</Modal>
```

## 🎯 Theming & Customization

### CSS Custom Properties

```css
:root {
  --primary-color: #3b82f6;
  --secondary-color: #6b7280;
  --border-radius: 8px;
  --spacing-unit: 4px;
}
```

### Theme Configuration

```tsx
const theme = {
  name: 'Custom Theme',
  colors: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  },
  spacing: {
    baseUnit: 4,
    scale: 'normal'
  },
  typography: {
    fontFamily: {
      sans: 'Inter, sans-serif'
    }
  },
  components: {
    borderRadius: {
      md: '8px'
    }
  }
};
```

## 📚 Examples

See the complete examples in `/src/components/examples/ComponentLibraryExamples.tsx`:

- Navigation components
- Form examples
- Layout patterns
- Content components
- Interactive elements
- Preview system
- Customization examples

## 🛠️ Development

### Building Components

```tsx
// Create a new component
export interface MyComponentProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700'
  };

  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`
        font-medium rounded-lg transition-colors
        ${variantClasses[variant]}
        ${sizeClasses[size]}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};
```

### Adding to Library

1. Create component in appropriate category folder
2. Add to main export in `/src/components/index.ts`
3. Add types to `/src/types/component-library.ts`
4. Add example to documentation

## 📖 API Reference

### Component Props

All components follow a consistent prop pattern:

- **variant**: Style variant ('primary', 'secondary', 'outline', etc.)
- **size**: Size variant ('xs', 'sm', 'md', 'lg', 'xl')
- **disabled**: Boolean for disabled state
- **loading**: Boolean for loading state
- **className**: Additional CSS classes
- **children**: Component content

### Event Handlers

Standard React event patterns:

- `onClick`: Click events
- `onChange`: Input change events
- `onFocus`: Focus events
- `onBlur`: Blur events

### Accessibility

All interactive components include:

- `aria-label`: Descriptive labels
- `aria-describedby`: Associated descriptions
- `role`: Semantic roles
- `tabIndex`: Keyboard navigation
- `aria-expanded`: Toggle states

## 🤝 Contributing

1. Follow the established component patterns
2. Include TypeScript types
3. Add accessibility attributes
4. Write comprehensive examples
5. Update documentation

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Built with React and TypeScript
- Styled with Tailwind CSS
- Icons by Lucide React
- Syntax highlighting by React Syntax Highlighter