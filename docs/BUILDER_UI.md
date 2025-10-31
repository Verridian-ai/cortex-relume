# AI Site Builder Workflow UI

A complete, modern interface for building websites using AI, similar to Relume.io's workflow but with enhanced features and clean design.

## 🎯 Overview

The AI Site Builder workflow guides users through a 4-step process:
1. **Prompt Input** - Describe your website vision
2. **Sitemap Preview** - Review and customize structure  
3. **Wireframe Editor** - Visualize layout and components
4. **Style Guide** - Complete design system with export options

## 🏗️ Component Architecture

### Main Components

#### `BuilderWorkflow` (`src/components/builder/workflow.tsx`)
- **Purpose**: Main orchestrator component that manages the entire workflow
- **Features**:
  - State management for all workflow data
  - Step navigation and validation
  - Loading states with AI processing simulation
  - Complete flow from prompt to final build
  - Progress tracking and data persistence

#### `BuilderNav` (`src/components/builder/builder-nav.tsx`)
- **Purpose**: Navigation component showing progress and allowing step jumping
- **Features**:
  - Visual progress bar with completion indicators
  - Interactive step selection
  - Responsive design (mobile-friendly)
  - Current step highlighting
  - Quick action badges

#### `PromptInput` (`src/components/builder/prompt-input.tsx`)
- **Purpose**: First step - gather user requirements
- **Features**:
  - Pre-built template examples (SaaS, E-commerce, Portfolio)
  - Rich text input with character count
  - Pro tips and guidance
  - Form validation
  - Smooth loading states

#### `SitemapPreview` (`src/components/builder/sitemap-preview.tsx`)
- **Purpose**: Second step - display and customize website structure
- **Features**:
  - Hierarchical tree view of website pages
  - In-line editing of page titles and descriptions
  - Expandable/collapsible sections
  - Element type badges (page vs section)
  - Statistics dashboard (pages, sections, components)

#### `WireframeEditor` (`src/components/builder/wireframe-editor.tsx`)
- **Purpose**: Third step - visual layout design
- **Features**:
  - Multi-viewport support (Desktop, Tablet, Mobile)
  - Interactive wireframe canvas
  - Element selection and property inspection
  - Grid overlay and labeling options
  - Component previews and styling

#### `StyleGuideView` (`src/components/builder/style-guide-view.tsx`)
- **Purpose**: Fourth step - complete design system
- **Features**:
  - Tabbed interface (Colors, Typography, Spacing, Components)
  - Color palette with copy-to-clipboard
  - Typography scale with samples
  - Spacing system visualization
  - Component previews
  - CSS variables export

#### `BuilderPage` (`src/app/builder/page.tsx`)
- **Purpose**: Main page wrapper
- **Features**:
  - SEO-optimized metadata
  - Clean page structure
  - Responsive layout
  - Integration with workflow component

## 🎨 Design Features

### Visual Design
- **Modern Interface**: Clean, minimal design inspired by Relume.io
- **Consistent Branding**: Brand colors, gradients, and typography
- **Smooth Animations**: Subtle transitions and loading states
- **Professional Icons**: Lucide React icons throughout

### User Experience
- **Intuitive Navigation**: Clear step progression with visual indicators
- **Real-time Feedback**: Loading states, success messages, and error handling
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Accessibility**: Proper ARIA labels, keyboard navigation, and contrast ratios

### Interactive Elements
- **Smart Validation**: Step progression requires completion of previous steps
- **Copy-to-Clipboard**: Easy copying of values and CSS variables
- **Preview Modes**: Toggle grid, labels, and different viewports
- **Export Options**: Multiple format support for design assets

## 🚀 Key Features

### 1. Intelligent Progress Tracking
```typescript
type BuilderStep = 'prompt' | 'sitemap' | 'wireframe' | 'style-guide' | 'complete'
```
- Tracks completion state across all steps
- Allows backward navigation with validation
- Visual progress indicators with percentage completion

### 2. Data Management
```typescript
interface WorkflowData {
  prompt?: string
  sitemap?: any[]
  wireframes?: any[]
  styleGuide?: any
}
```
- Centralized state management
- Data persistence across step transitions
- Type-safe interfaces for all workflow data

### 3. Responsive Components
- **Mobile-First**: Optimized for all screen sizes
- **Flexible Layouts**: Grid systems that adapt to content
- **Touch-Friendly**: Large tap targets and gestures

### 4. Export & Integration
- **CSS Variables**: Ready-to-use design tokens
- **Multiple Formats**: Figma, Sketch, Adobe XD, React, HTML
- **Component Library**: Reusable UI components

## 📱 Mobile Responsive Design

### Breakpoint Strategy
- **Mobile (< 768px)**: Single column layout, stacked navigation
- **Tablet (768px - 1024px)**: Two-column layout with collapsible sidebar
- **Desktop (> 1024px)**: Multi-column layout with full navigation

### Mobile-Specific Features
- Touch-optimized controls
- Simplified navigation with step badges
- Responsive typography and spacing
- Gesture-friendly interactions

## 🔧 Technical Implementation

### Technologies Used
- **React 18**: Latest React with hooks and concurrent features
- **TypeScript**: Full type safety across all components
- **Next.js 13+**: App Router with server components
- **Tailwind CSS**: Utility-first styling with custom design system
- **Radix UI**: Accessible component primitives
- **Lucide Icons**: Beautiful, consistent iconography

### State Management
```typescript
const [currentStep, setCurrentStep] = useState<BuilderStep>('prompt')
const [workflowData, setWorkflowData] = useState<WorkflowData>({})
const [loading, setLoading] = useState(false)
```

### Form Handling
- Controlled components with validation
- Real-time feedback and error states
- Progressive enhancement approach

## 🎭 Animation & Interactions

### Loading States
- AI processing simulation with realistic delays
- Animated progress indicators
- Smooth transitions between steps

### Micro-Interactions
- Button hover effects with gradients and shadows
- Card lift animations on hover
- Smooth expand/collapse animations
- Copy-to-clipboard feedback

## 🔒 Accessibility Features

### WCAG Compliance
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Color Contrast**: Meets AA standards for all text
- **Focus Management**: Clear focus indicators and logical tab order

### Error Handling
- Clear error messages with recovery suggestions
- Form validation with helpful feedback
- Graceful degradation for older browsers

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Modern web browser

### Installation
```bash
# Navigate to project directory
cd cortex-relume

# Install dependencies
npm install

# Start development server
npm run dev
```

### Usage
1. **Access Builder**: Navigate to `/builder` in your browser
2. **Start Workflow**: Click "Get Started" on the home page
3. **Follow Steps**: Complete each step in order
4. **Export Results**: Download your completed design system

## 📊 Performance Optimizations

### Code Splitting
- Dynamic imports for heavy components
- Lazy loading of non-critical features
- Optimized bundle sizes

### Image Optimization
- Next.js Image component for automatic optimization
- Responsive images with proper sizing
- Modern formats (WebP, AVIF) support

### Caching Strategy
- Static generation where appropriate
- API route caching for design tokens
- Browser caching for assets

## 🔮 Future Enhancements

### Planned Features
- [ ] Real-time collaboration
- [ ] Version history and rollback
- [ ] Advanced export formats (Zeplin, Avocode)
- [ ] Design token synchronization
- [ ] Component testing integration

### Potential Improvements
- [ ] AI-powered content generation
- [ ] Advanced styling options
- [ ] Multi-language support
- [ ] Offline capability with PWA

## 📈 Analytics & Monitoring

### User Experience Tracking
- Step completion rates
- Time spent on each step
- Drop-off points analysis
- Feature usage statistics

### Performance Monitoring
- Core Web Vitals tracking
- Error rate monitoring
- Load time optimization

## 🤝 Contributing

### Code Style
- ESLint configuration for consistency
- Prettier for code formatting
- TypeScript strict mode enabled
- Consistent component patterns

### Testing Strategy
- Unit tests for utility functions
- Component testing with React Testing Library
- E2E tests for critical user flows
- Visual regression testing for UI consistency

## 📄 License

This project is part of Cortex Relume and follows the same licensing terms.

---

**Built with ❤️ by the Cortex Relume Team**

*Ready to accelerate your design workflow with AI-powered tools.*