import Link from 'next/link'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Nav } from '@/components/layout/nav'
import { 
  Zap, 
  Target, 
  Palette, 
  Code, 
  ArrowRight, 
  Sparkles,
  Layers,
  Download,
  Users,
  Bot,
  CheckCircle,
  Play,
  FolderOpen,
  Calendar,
  TrendingUp
} from 'lucide-react'

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <Nav />

      {/* Hero Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-purple-500/10 to-blue-500/10" />
        <div className="container relative flex flex-col items-center space-y-8 text-center">
          <Badge variant="outline" className="animate-pulse-slow">
            <Sparkles className="h-3 w-3 mr-1" />
            Powered by GPT-5
          </Badge>
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
            AI-Powered Website Design
            <span className="block gradient-text">Accelerator</span>
          </h1>
          <p className="max-w-2xl text-xl text-muted-foreground leading-relaxed">
            Create sitemaps, wireframes, and style guides in minutes using GPT-5. 
            The ultimate design ally that accelerates your workflow without replacing your creativity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild className="animate-fade-in">
              <Link href={user ? "/app/dashboard" : "/app/builder"}>
                {user ? "Go to Dashboard" : "Start Building for Free"}
                <Zap className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="animate-fade-in">
              <Link href="#features">
                Explore Features
                <Play className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="flex items-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>7-Day Free Trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>500k+ Websites Built</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Everything You Need to Build Faster
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From concept to wireframe, our AI-powered tools streamline every step of your design process.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="card-hover cursor-pointer" asChild>
              <Link href={user ? "/app/builder" : "/app/builder"}>
                <CardHeader>
                  <Target className="h-10 w-10 text-brand-500 mb-2" />
                  <CardTitle>AI Site Builder</CardTitle>
                  <CardDescription>
                    Generate sitemaps and wireframes from simple prompts using GPT-5's advanced reasoning capabilities.
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>
            
            <Card className="card-hover">
              <CardHeader>
                <Layers className="h-10 w-10 text-brand-500 mb-2" />
                <CardTitle>Component Library</CardTitle>
                <CardDescription>
                  Access 1000+ responsive components for React, Figma, and Webflow with advanced search and filtering.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="card-hover">
              <CardHeader>
                <Palette className="h-10 w-10 text-brand-500 mb-2" />
                <CardTitle>Style Guide Generation</CardTitle>
                <CardDescription>
                  Automatically create design systems and style guides from your wireframes and components.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="card-hover">
              <CardHeader>
                <Code className="h-10 w-10 text-brand-500 mb-2" />
                <CardTitle>Export & Integration</CardTitle>
                <CardDescription>
                  Export to Figma, Webflow, React, or HTML. Seamless integration with your existing workflow.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="card-hover">
              <CardHeader>
                <Bot className="h-10 w-10 text-brand-500 mb-2" />
                <CardTitle>AI Copywriting</CardTitle>
                <CardDescription>
                  Generate compelling website copy and content tailored to your brand and target audience.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="card-hover">
              <CardHeader>
                <Users className="h-10 w-10 text-brand-500 mb-2" />
                <CardTitle>Team Collaboration</CardTitle>
                <CardDescription>
                  Share projects, leave comments, and streamline approvals with your team in real-time.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Ready to Accelerate Your Design Process?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join 700k+ designers and developers who trust Cortex Relume to build better websites faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href={user ? "/app/dashboard" : "/app/builder"}>
                  {user ? "Continue Building" : "Start Free Trial"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">
                  View Pricing
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Bot className="h-6 w-6 text-brand-500" />
                <span className="font-bold">Cortex Relume</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered website design accelerator for modern designers and developers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-brand-500">Features</Link></li>
                <li><Link href="/app/builder" className="hover:text-brand-500">AI Builder</Link></li>
                <li><Link href="/app/dashboard" className="hover:text-brand-500">Dashboard</Link></li>
                <li><Link href="/pricing" className="hover:text-brand-500">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/docs" className="hover:text-brand-500">Documentation</Link></li>
                <li><Link href="/tutorials" className="hover:text-brand-500">Tutorials</Link></li>
                <li><Link href="/blog" className="hover:text-brand-500">Blog</Link></li>
                <li><Link href="/support" className="hover:text-brand-500">Support</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-brand-500">About</Link></li>
                <li><Link href="/careers" className="hover:text-brand-500">Careers</Link></li>
                <li><Link href="/privacy" className="hover:text-brand-500">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-brand-500">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2025 Cortex Relume. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Badge variant="secondary" className="gpt-5-indicator">
                <Sparkles className="h-3 w-3 mr-1" />
                Powered by GPT-5
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}