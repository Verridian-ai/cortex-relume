'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  PlayCircle, 
  Code, 
  Palette, 
  Zap,
  ArrowRight,
  Clock,
  Users,
  Star,
  Target,
  Grid3X3,
  Package,
  Layout,
  Puzzle,
  CheckCircle,
  Lightbulb,
  Settings,
  Download,
  ExternalLink
} from 'lucide-react'
import { Nav } from '@/components/layout/nav'

interface Tutorial {
  id: string
  title: string
  description: string
  category: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  lessons: number
  rating: number
  tags: string[]
  prerequisite?: string[]
  featured?: boolean
}

interface CategoryGuide {
  id: string
  name: string
  description: string
  icon: any
  color: string
  tutorials: Tutorial[]
}

export default function ComponentTutorialsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const tutorials: Tutorial[] = [
    {
      id: 'getting-started',
      title: 'Getting Started with Components',
      description: 'Learn the basics of using and customizing components in your projects',
      category: 'basics',
      difficulty: 'Beginner',
      duration: '15 min',
      lessons: 5,
      rating: 4.8,
      tags: ['basics', 'getting-started', 'customization'],
      featured: true
    },
    {
      id: 'component-anatomy',
      title: 'Understanding Component Anatomy',
      description: 'Deep dive into the structure and properties of components',
      category: 'basics',
      difficulty: 'Beginner',
      duration: '20 min',
      lessons: 7,
      rating: 4.9,
      tags: ['structure', 'properties', 'props']
    },
    {
      id: 'customization-guide',
      title: 'Component Customization Masterclass',
      description: 'Master the art of customizing components to match your brand',
      category: 'customization',
      difficulty: 'Intermediate',
      duration: '45 min',
      lessons: 12,
      rating: 4.7,
      tags: ['customization', 'styling', 'themes'],
      prerequisite: ['getting-started']
    },
    {
      id: 'responsive-components',
      title: 'Building Responsive Components',
      description: 'Create components that work perfectly on all devices',
      category: 'advanced',
      difficulty: 'Intermediate',
      duration: '35 min',
      lessons: 9,
      rating: 4.6,
      tags: ['responsive', 'mobile', 'breakpoints'],
      prerequisite: ['component-anatomy']
    },
    {
      id: 'form-components',
      title: 'Working with Form Components',
      description: 'Build interactive forms with validation and state management',
      category: 'forms',
      difficulty: 'Intermediate',
      duration: '40 min',
      lessons: 10,
      rating: 4.8,
      tags: ['forms', 'validation', 'state'],
      prerequisite: ['component-anatomy']
    },
    {
      id: 'navigation-patterns',
      title: 'Navigation Component Patterns',
      description: 'Implement various navigation patterns for modern web apps',
      category: 'layout',
      difficulty: 'Intermediate',
      duration: '30 min',
      lessons: 8,
      rating: 4.5,
      tags: ['navigation', 'menus', 'routing'],
      prerequisite: ['component-anatomy']
    },
    {
      id: 'accessibility-best-practices',
      title: 'Accessibility in Components',
      description: 'Make your components accessible to everyone with ARIA and semantic HTML',
      category: 'accessibility',
      difficulty: 'Advanced',
      duration: '50 min',
      lessons: 15,
      rating: 4.9,
      tags: ['accessibility', 'aria', 'semantic'],
      prerequisite: ['component-anatomy']
    },
    {
      id: 'performance-optimization',
      title: 'Component Performance Optimization',
      description: 'Optimize your components for better performance and user experience',
      category: 'advanced',
      difficulty: 'Advanced',
      duration: '60 min',
      lessons: 18,
      rating: 4.7,
      tags: ['performance', 'optimization', 'memo'],
      prerequisite: ['component-anatomy', 'customization-guide']
    }
  ]

  const categoryGuides: CategoryGuide[] = [
    {
      id: 'basics',
      name: 'Getting Started',
      description: 'Essential tutorials for beginners',
      icon: BookOpen,
      color: 'text-blue-500',
      tutorials: tutorials.filter(t => t.category === 'basics')
    },
    {
      id: 'customization',
      name: 'Customization',
      description: 'Learn to style and modify components',
      icon: Palette,
      color: 'text-purple-500',
      tutorials: tutorials.filter(t => t.category === 'customization')
    },
    {
      id: 'layout',
      name: 'Layout & Navigation',
      description: 'Layout and navigation components',
      icon: Grid3X3,
      color: 'text-green-500',
      tutorials: tutorials.filter(t => t.category === 'layout')
    },
    {
      id: 'forms',
      name: 'Forms & Interactions',
      description: 'Form components and user interactions',
      icon: Package,
      color: 'text-orange-500',
      tutorials: tutorials.filter(t => t.category === 'forms')
    },
    {
      id: 'advanced',
      name: 'Advanced Patterns',
      description: 'Advanced concepts and optimization',
      icon: Zap,
      color: 'text-red-500',
      tutorials: tutorials.filter(t => t.category === 'advanced')
    },
    {
      id: 'accessibility',
      name: 'Accessibility',
      description: 'Building inclusive components',
      icon: Target,
      color: 'text-pink-500',
      tutorials: tutorials.filter(t => t.category === 'accessibility')
    }
  ]

  const filteredTutorials = selectedCategory === 'all' 
    ? tutorials 
    : tutorials.filter(t => t.category === selectedCategory)

  const featuredTutorials = tutorials.filter(t => t.featured)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-500 bg-green-500/10'
      case 'Intermediate': return 'text-yellow-500 bg-yellow-500/10'
      case 'Advanced': return 'text-red-500 bg-red-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Nav isAppLayout />
      
      <main className="flex-1">
        <div className="container py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Component Library Tutorials
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Master the art of building with components. From basics to advanced patterns, 
              learn how to create amazing user interfaces efficiently.
            </p>
          </div>

          {/* Quick Start */}
          <Card className="mb-12 bg-gradient-to-r from-brand-500/5 to-purple-500/5 border-brand-500/20">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-brand-500/10 flex items-center justify-center">
                      <PlayCircle className="h-6 w-6 text-brand-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Start Your Journey</h2>
                      <p className="text-muted-foreground">
                        New to components? Start with our comprehensive getting started guide.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">15 minutes</Badge>
                    <Badge variant="secondary">5 lessons</Badge>
                    <Badge variant="secondary">Beginner friendly</Badge>
                  </div>
                </div>
                <div className="ml-8">
                  <Button asChild size="lg">
                    <Link href="/components/learn/getting-started">
                      <PlayCircle className="h-5 w-5 mr-2" />
                      Start Learning
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Featured Tutorials */}
          {featuredTutorials.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Featured Tutorials</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {featuredTutorials.map((tutorial) => (
                  <Card key={tutorial.id} className="card-hover">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className={getDifficultyColor(tutorial.difficulty)}>
                          {tutorial.difficulty}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{tutorial.rating}</span>
                        </div>
                      </div>
                      <CardTitle className="text-xl">{tutorial.title}</CardTitle>
                      <CardDescription>{tutorial.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{tutorial.duration}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{tutorial.lessons} lessons</span>
                          </div>
                        </div>
                        <Button asChild>
                          <Link href={`/components/learn/${tutorial.id}`}>
                            Start Tutorial
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                All Tutorials
              </Button>
              {categoryGuides.map((guide) => (
                <Button
                  key={guide.id}
                  variant={selectedCategory === guide.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(guide.id)}
                >
                  <guide.icon className="h-4 w-4 mr-2" />
                  {guide.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Tutorial Categories */}
          {selectedCategory === 'all' && (
            <div className="space-y-12">
              {categoryGuides.map((guide) => {
                const GuideIcon = guide.icon
                return (
                  <div key={guide.id}>
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <GuideIcon className={`h-5 w-5 ${guide.color}`} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{guide.name}</h2>
                        <p className="text-muted-foreground">{guide.description}</p>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {guide.tutorials.map((tutorial) => (
                        <Card key={tutorial.id} className="card-hover">
                          <CardHeader>
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline" className={getDifficultyColor(tutorial.difficulty)}>
                                {tutorial.difficulty}
                              </Badge>
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-medium">{tutorial.rating}</span>
                              </div>
                            </div>
                            <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                            <CardDescription className="line-clamp-2">
                              {tutorial.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{tutorial.duration}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <BookOpen className="h-4 w-4" />
                                  <span>{tutorial.lessons} lessons</span>
                                </div>
                              </div>
                              
                              {tutorial.prerequisite && (
                                <div className="text-xs text-muted-foreground">
                                  <span className="font-medium">Prerequisites:</span>{' '}
                                  {tutorial.prerequisite.length} tutorial{tutorial.prerequisite.length !== 1 ? 's' : ''}
                                </div>
                              )}
                              
                              <div className="flex flex-wrap gap-1">
                                {tutorial.tags.slice(0, 3).map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              
                              <Button asChild className="w-full">
                                <Link href={`/components/learn/${tutorial.id}`}>
                                  Start Tutorial
                                  <ArrowRight className="h-4 w-4 ml-2" />
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Filtered Tutorials */}
          {selectedCategory !== 'all' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">
                {categoryGuides.find(g => g.id === selectedCategory)?.name} Tutorials
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredTutorials.map((tutorial) => (
                  <Card key={tutorial.id} className="card-hover">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className={getDifficultyColor(tutorial.difficulty)}>
                          {tutorial.difficulty}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{tutorial.rating}</span>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                      <CardDescription>{tutorial.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{tutorial.duration}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{tutorial.lessons} lessons</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {tutorial.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <Button asChild className="w-full">
                          <Link href={`/components/learn/${tutorial.id}`}>
                            Start Tutorial
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Learning Paths */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Recommended Learning Paths</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-2 border-blue-200 bg-blue-50/50">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-blue-500" />
                    </div>
                    <CardTitle className="text-blue-700">Beginner Path</CardTitle>
                  </div>
                  <CardDescription className="text-blue-600">
                    Start your component journey with these foundational tutorials
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      <span>Getting Started</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      <span>Component Anatomy</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      <span>Basic Customization</span>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="w-full border-blue-200">
                    <Link href="/components/learn/path/beginner">
                      Start Path
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 bg-purple-50/50">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <Palette className="h-5 w-5 text-purple-500" />
                    </div>
                    <CardTitle className="text-purple-700">Designer Path</CardTitle>
                  </div>
                  <CardDescription className="text-purple-600">
                    Learn to customize and style components for your brand
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-purple-500" />
                      <span>Customization Guide</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-purple-500" />
                      <span>Responsive Design</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-purple-500" />
                      <span>Theming Systems</span>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="w-full border-purple-200">
                    <Link href="/components/learn/path/designer">
                      Start Path
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 bg-green-50/50">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Code className="h-5 w-5 text-green-500" />
                    </div>
                    <CardTitle className="text-green-700">Developer Path</CardTitle>
                  </div>
                  <CardDescription className="text-green-600">
                    Advanced patterns and performance optimization techniques
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Performance Optimization</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Advanced Patterns</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Accessibility</span>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="w-full border-green-200">
                    <Link href="/components/learn/path/developer">
                      Start Path
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Additional Resources */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Additional Resources</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="text-center p-6">
                <Download className="h-8 w-8 text-brand-500 mx-auto mb-3" />
                <h3 className="font-medium mb-2">Component Library</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Download complete component library
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/components/download">
                    Download
                  </Link>
                </Button>
              </Card>

              <Card className="text-center p-6">
                <Settings className="h-8 w-8 text-brand-500 mx-auto mb-3" />
                <h3 className="font-medium mb-2">API Reference</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete API documentation
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/components/api">
                    View Docs
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </Card>

              <Card className="text-center p-6">
                <Users className="h-8 w-8 text-brand-500 mx-auto mb-3" />
                <h3 className="font-medium mb-2">Community</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Join our developer community
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/components/community">
                    Join
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </Card>

              <Card className="text-center p-6">
                <Lightbulb className="h-8 w-8 text-brand-500 mx-auto mb-3" />
                <h3 className="font-medium mb-2">Examples</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Browse component examples
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/components/examples">
                    Browse
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
