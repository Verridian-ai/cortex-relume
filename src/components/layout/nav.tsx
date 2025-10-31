'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bot, 
  Sparkles, 
  Menu, 
  X, 
  Home, 
  Layout, 
  FolderOpen, 
  Settings, 
  LogOut,
  User,
  Zap,
  Crown
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavProps {
  isAppLayout?: boolean
}

export function Nav({ isAppLayout = false }: NavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const navigation = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      public: true
    },
    {
      name: 'Dashboard',
      href: '/app/dashboard',
      icon: FolderOpen,
      public: false
    },
    {
      name: 'Builder',
      href: '/app/builder',
      icon: Zap,
      public: false
    },
    {
      name: 'Projects',
      href: '/app/projects',
      icon: Layout,
      public: false
    },
    {
      name: 'Settings',
      href: '/app/settings',
      icon: Settings,
      public: false
    }
  ]

  const filteredNavigation = navigation.filter(item => {
    if (item.public) return true
    return user
  })

  if (isAppLayout) {
    // App layout navigation (for authenticated users)
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/app/dashboard" className="flex items-center space-x-2">
            <Bot className="h-8 w-8 text-brand-500" />
            <span className="text-xl font-bold gradient-text">Cortex Relume</span>
            <Badge variant="secondary" className="ml-2 hidden sm:inline-flex">
              <Sparkles className="h-3 w-3 mr-1" />
              GPT-5
            </Badge>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {filteredNavigation.slice(1).map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive 
                      ? 'bg-brand-500/10 text-brand-500' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <Badge variant="outline" className="hidden sm:inline-flex">
                  <Crown className="h-3 w-3 mr-1 text-yellow-500" />
                  Free Plan
                </Badge>
                <div className="relative group">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-brand-500/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-brand-500" />
                    </div>
                    <span className="hidden sm:inline text-sm font-medium">
                      {user.email?.split('@')[0]}
                    </span>
                  </Button>
                  {/* Dropdown would go here - simplified for now */}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSignOut}
                  className="hidden sm:inline-flex"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur">
            <div className="container py-4 space-y-2">
              {filteredNavigation.slice(1).map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      isActive 
                        ? 'bg-brand-500/10 text-brand-500' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              <div className="pt-2 border-t">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start px-4 py-3 text-muted-foreground"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    )
  }

  // Public landing page navigation
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="h-8 w-8 text-brand-500" />
          <span className="text-xl font-bold gradient-text">Cortex Relume</span>
          <Badge variant="secondary" className="ml-2">
            <Sparkles className="h-3 w-3 mr-1" />
            GPT-5 Powered
          </Badge>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link 
            href="#features" 
            className="transition-colors hover:text-brand-500"
          >
            Features
          </Link>
          <Link 
            href="/app/dashboard" 
            className="transition-colors hover:text-brand-500"
          >
            Dashboard
          </Link>
          <Link 
            href="/app/builder" 
            className="transition-colors hover:text-brand-500"
          >
            Builder
          </Link>
          {!user && (
            <Link 
              href="/auth/signin" 
              className="transition-colors hover:text-brand-500"
            >
              Sign In
            </Link>
          )}
        </nav>
        
        <div className="flex items-center space-x-2">
          {user ? (
            <Button asChild>
              <Link href="/app/dashboard">
                Go to Dashboard
                <Zap className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/app/builder">
                Get Started
                <Zap className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}