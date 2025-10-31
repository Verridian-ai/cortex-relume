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
  Crown,
  Puzzle,
  Search,
  Grid3X3,
  Package,
  ExternalLink,
  ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavProps {
  isAppLayout?: boolean
}

export function Nav({ isAppLayout = false }: NavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isComponentsDropdownOpen, setIsComponentsDropdownOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const componentCategories = [
    {
      name: 'Layout Components',
      description: 'Headers, footers, containers',
      href: '/app/components/browse?category=layout',
      icon: Layout
    },
    {
      name: 'Navigation',
      description: 'Menus, navbars, breadcrumbs',
      href: '/app/components/browse?category=navigation',
      icon: Grid3X3
    },
    {
      name: 'Forms',
      description: 'Inputs, buttons, form sections',
      href: '/app/components/browse?category=forms',
      icon: Package
    },
    {
      name: 'Interactive',
      description: 'Modals, dropdowns, tabs',
      href: '/app/components/browse?category=interactive',
      icon: Puzzle
    },
    {
      name: 'Content',
      description: 'Cards, galleries, articles',
      href: '/app/components/browse?category=content',
      icon: FolderOpen
    }
  ]

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
      name: 'Components',
      href: '/app/components',
      icon: Puzzle,
      public: false,
      hasDropdown: true,
      dropdownItems: componentCategories
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
              const isActive = pathname === item.href || (item.href !== '/app/components' && pathname.startsWith(item.href))
              const hasDropdown = item.hasDropdown
              
              return (
                <div key={item.name} className="relative">
                  {hasDropdown ? (
                    <div 
                      className="relative"
                      onMouseEnter={() => setIsComponentsDropdownOpen(true)}
                      onMouseLeave={() => setIsComponentsDropdownOpen(false)}
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                          pathname.startsWith('/app/components')
                            ? 'bg-brand-500/10 text-brand-500' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                      
                      {/* Components Dropdown */}
                      {isComponentsDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1 w-80 bg-background border border-border rounded-lg shadow-lg z-50 p-2">
                          <div className="mb-3">
                            <div className="flex items-center space-x-2 px-3 py-2">
                              <Search className="h-4 w-4 text-muted-foreground" />
                              <input
                                type="text"
                                placeholder="Search components..."
                                className="flex-1 text-sm bg-transparent border-none outline-none placeholder:text-muted-foreground"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            {componentCategories.map((category) => {
                              const CategoryIcon = category.icon
                              return (
                                <Link
                                  key={category.name}
                                  href={category.href}
                                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
                                >
                                  <CategoryIcon className="h-5 w-5 text-brand-500 mt-0.5" />
                                  <div>
                                    <div className="text-sm font-medium">{category.name}</div>
                                    <div className="text-xs text-muted-foreground">{category.description}</div>
                                  </div>
                                </Link>
                              )
                            })}
                          </div>
                          <div className="border-t border-border mt-2 pt-2">
                            <Link
                              href="/app/components/browse"
                              className="flex items-center justify-center space-x-2 p-2 text-sm text-brand-500 hover:bg-brand-500/5 rounded-lg transition-colors"
                            >
                              <span>Browse All Components</span>
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
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
                  )}
                </div>
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
                    <ChevronDown className="h-3 w-3 hidden sm:inline" />
                  </Button>
                  {/* User Dropdown */}
                  <div className="absolute top-full right-0 mt-1 w-48 bg-background border border-border rounded-lg shadow-lg z-50 p-2">
                    <div className="px-3 py-2 text-sm text-muted-foreground border-b border-border">
                      {user.email}
                    </div>
                    <Link
                      href="/app/settings"
                      className="flex items-center space-x-2 p-2 text-sm hover:bg-muted rounded-lg transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleSignOut}
                      className="w-full justify-start px-2 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
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
              {/* Components Search in Mobile */}
              <div className="px-4 mb-4">
                <div className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search components..."
                    className="flex-1 text-sm bg-transparent border-none outline-none placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              
              {filteredNavigation.slice(1).map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href !== '/app/components' && pathname.startsWith(item.href))
                const hasDropdown = item.hasDropdown
                
                return (
                  <div key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                        pathname.startsWith('/app/components')
                          ? 'bg-brand-500/10 text-brand-500' 
                          : isActive 
                            ? 'bg-brand-500/10 text-brand-500' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                      {hasDropdown && <ChevronDown className="h-3 w-3 ml-auto" />}
                    </Link>
                    
                    {/* Mobile Components Submenu */}
                    {hasDropdown && (
                      <div className="pl-8 space-y-1">
                        {componentCategories.map((category) => {
                          const CategoryIcon = category.icon
                          return (
                            <Link
                              key={category.name}
                              href={category.href}
                              className="flex items-center space-x-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <CategoryIcon className="h-4 w-4" />
                              <span>{category.name}</span>
                            </Link>
                          )
                        })}
                        <Link
                          href="/app/components/browse"
                          className="flex items-center space-x-3 px-3 py-2 text-sm text-brand-500 hover:bg-brand-500/5 rounded-lg transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>Browse All Components</span>
                        </Link>
                      </div>
                    )}
                  </div>
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