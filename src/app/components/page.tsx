import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Puzzle, 
  Search, 
  Download, 
  Zap,
  ArrowRight,
  Code,
  Palette,
  Target,
  Grid3X3,
  Package,
  Layout,
  Star,
  TrendingUp,
  BookOpen,
  Lightbulb,
  Sparkles,
  CheckCircle,
  Eye,
  PlayCircle,
  Users,
  BarChart3
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Component Library | Cortex Relume',
  description: 'Discover, customize, and integrate production-ready components into your projects. Powered by AI and built with modern best practices.',
  keywords: ['components', 'ui library', 'react', 'javascript', 'typescript', 'tailwind'],
}

export default function ComponentsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="h-16 w-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-6">
              <Puzzle className="h-8 w-8 text-brand-500" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Component Library
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Discover, customize, and integrate production-ready components into your projects. 
              Powered by AI and built with modern best practices.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button asChild size="lg">
                <Link href="/components/browse">
                  <Search className="h-5 w-5 mr-2" />
                  Browse Components
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/components/learn">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Learn Components
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-16">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <Package className="h-6 w-6 text-blue-500" />
              </div>
              <div className="text-3xl font-bold mb-2">250+</div>
              <p className="text-muted-foreground">Components Available</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <Download className="h-6 w-6 text-green-500" />
              </div>
              <div className="text-3xl font-bold mb-2">50K+</div>
              <p className="text-muted-foreground">Downloads</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="text-3xl font-bold mb-2">4.8</div>
              <p className="text-muted-foreground">Average Rating</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-purple-500" />
              </div>
              <div className="text-3xl font-bold mb-2">10x</div>
              <p className="text-muted-foreground">Faster Development</p>
            </CardContent>
          </Card>
        </div>

        {/* Key Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Component Library?</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-2 border-brand-500/20">
              <CardContent className="p-8 text-center">
                <div className="h-16 w-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="h-8 w-8 text-brand-500" />
                </div>
                <h3 className="text-xl font-bold mb-4">AI-Powered Assistance</h3>
                <p className="text-muted-foreground">
                  Get intelligent component recommendations based on your project needs with our AI assistant.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-brand-500/20">
              <CardContent className="p-8 text-center">
                <div className="h-16 w-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-6">
                  <Download className="h-8 w-8 text-brand-500" />
                </div>
                <h3 className="text-xl font-bold mb-4">One-Click Integration</h3>
                <p className="text-muted-foreground">
                  Install components directly into your projects with our powerful integration tools.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-brand-500/20">
              <CardContent className="p-8 text-center">
                <div className="h-16 w-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-6">
                  <Palette className="h-8 w-8 text-brand-500" />
                </div>
                <h3 className="text-xl font-bold mb-4">Fully Customizable</h3>
                <p className="text-muted-foreground">
                  Every component is built with customization in mind, adapting to your brand and style.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Component Categories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Browse by Category</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            {[
              { 
                name: 'Layout', 
                icon: Layout, 
                count: 45, 
                color: 'text-blue-500',
                bgColor: 'bg-blue-500/10',
                description: 'Headers, footers, containers',
                examples: ['Navigation', 'Hero', 'Footer']
              },
              { 
                name: 'Navigation', 
                icon: Grid3X3, 
                count: 32, 
                color: 'text-green-500',
                bgColor: 'bg-green-500/10',
                description: 'Menus, navbars, breadcrumbs',
                examples: ['Menus', 'Breadcrumbs', 'Tabs']
              },
              { 
                name: 'Forms', 
                icon: Package, 
                count: 28, 
                color: 'text-purple-500',
                bgColor: 'bg-purple-500/10',
                description: 'Inputs, buttons, form sections',
                examples: ['Contact Form', 'Login', 'Search']
              },
              { 
                name: 'Interactive', 
                icon: Puzzle, 
                count: 38, 
                color: 'text-orange-500',
                bgColor: 'bg-orange-500/10',
                description: 'Modals, dropdowns, tabs',
                examples: ['Modals', 'Tooltips', 'Accordions']
              },
              { 
                name: 'Content', 
                icon: Target, 
                count: 25, 
                color: 'text-pink-500',
                bgColor: 'bg-pink-500/10',
                description: 'Cards, galleries, articles',
                examples: ['Cards', 'Galleries', 'Testimonials']
              }
            ].map((category) => {
              const Icon = category.icon
              return (
                <Card key={category.name} className="card-hover cursor-pointer group" asChild>
                  <Link href={`/components/browse?category=${category.name.toLowerCase()}`}>
                    <CardContent className="p-6 text-center">
                      <div className={`h-16 w-16 rounded-2xl ${category.bgColor} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-8 w-8 ${category.color}`} />
                      </div>
                      <h3 className="font-bold text-lg mb-2">{category.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                      <Badge variant="secondary" className="mb-3">{category.count} components</Badge>
                      <div className="text-xs text-muted-foreground">
                        <div className="font-medium">Includes:</div>
                        <div>{category.examples.join(', ')}</div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Integration Tools */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful Integration Tools</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-2 border-brand-500/20">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-brand-500/10 flex items-center justify-center">
                    <Download className="h-5 w-5 text-brand-500" />
                  </div>
                  <CardTitle>Component Installer</CardTitle>
                </div>
                <CardDescription>
                  Install multiple components at once with dependency management and automatic code generation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Batch installation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Dependency resolution</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Auto-generated imports</span>
                  </li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="/components/browse">
                    Try Installer
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-brand-500/20">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-brand-500/10 flex items-center justify-center">
                    <Lightbulb className="h-5 w-5 text-brand-500" />
                  </div>
                  <CardTitle>AI Assistant</CardTitle>
                </div>
                <CardDescription>
                  Get intelligent component recommendations based on your project type and requirements.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Smart suggestions</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Project analysis</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Custom recommendations</span>
                  </li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="/components/browse">
                    Chat with AI
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-brand-500/20">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-brand-500/10 flex items-center justify-center">
                    <Target className="h-5 w-5 text-brand-500" />
                  </div>
                  <CardTitle>Wireframe Converter</CardTitle>
                </div>
                <CardDescription>
                  Convert your wireframe elements directly into production-ready React components.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>AI-powered mapping</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Automatic code generation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Customization support</span>
                  </li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="/components/browse">
                    Convert Wireframes
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Learning Resources */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Learn Components</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="border-2 border-blue-200 bg-blue-50/50">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                  </div>
                  <CardTitle className="text-blue-700">Getting Started Guide</CardTitle>
                </div>
                <CardDescription className="text-blue-600">
                  New to components? Start with our comprehensive guide covering basics, 
                  customization, and best practices.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4 text-sm text-blue-600">
                  <div className="flex items-center space-x-2">
                    <PlayCircle className="h-4 w-4" />
                    <span>15-minute tutorial</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Code className="h-4 w-4" />
                    <span>5 hands-on lessons</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4" />
                    <span>Beginner friendly</span>
                  </div>
                </div>
                <Button asChild className="w-full" variant="outline" style={{ borderColor: 'rgb(59 130 246)' }}>
                  <Link href="/components/learn/getting-started">
                    Start Learning
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 bg-purple-50/50">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                  </div>
                  <CardTitle className="text-purple-700">Advanced Patterns</CardTitle>
                </div>
                <CardDescription className="text-purple-600">
                  Master advanced component patterns, performance optimization, 
                  and accessibility best practices.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4 text-sm text-purple-600">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4" />
                    <span>Performance optimization</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4" />
                    <span>Accessibility patterns</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Code className="h-4 w-4" />
                    <span>Advanced customization</span>
                  </div>
                </div>
                <Button asChild className="w-full" variant="outline" style={{ borderColor: 'rgb(147 51 234)' }}>
                  <Link href="/components/learn">
                    Explore Tutorials
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-brand-500/5 to-purple-500/5 border-brand-500/20">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Build Faster?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of developers who are already building amazing interfaces 
              with our component library.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button asChild size="lg">
                <Link href="/components/browse">
                  <Search className="h-5 w-5 mr-2" />
                  Browse Components
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/dashboard/components">
                  <Puzzle className="h-5 w-5 mr-2" />
                  Go to Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}