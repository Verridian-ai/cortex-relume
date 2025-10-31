'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { 
  LayoutDashboard, 
  Activity, 
  Users, 
  Target, 
  BarChart3, 
  Settings, 
  HelpCircle,
  Menu,
  Search,
  Bell,
  User,
  LogOut,
  TrendingUp,
  Award,
  BookOpen,
  FileText,
  Calendar,
  Zap,
  ArrowLeft
} from 'lucide-react'
import { useAuth } from '@/components/auth-provider'

interface SidebarItem {
  title: string
  href: string
  icon: any
  badge?: string
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Overview',
    href: '/dashboard/enhanced',
    icon: LayoutDashboard,
  },
  {
    title: 'Projects',
    href: '/dashboard/enhanced/projects',
    icon: Target,
  },
  {
    title: 'Activity',
    href: '/dashboard/enhanced/activity',
    icon: Activity,
  },
  {
    title: 'Analytics',
    href: '/dashboard/enhanced/analytics',
    icon: BarChart3,
  },
  {
    title: 'Goals',
    href: '/dashboard/enhanced/goals',
    icon: Award,
  },
  {
    title: 'Insights',
    href: '/dashboard/enhanced/insights',
    icon: TrendingUp,
  },
]

const userMenuItems = [
  {
    title: 'Profile',
    href: '/profile',
    icon: User,
  },
  {
    title: 'Settings',
    href: '/profile/settings',
    icon: Settings,
  },
  {
    title: 'Help',
    href: '/help',
    icon: HelpCircle,
  },
]

interface EnhancedDashboardShellProps {
  children: React.ReactNode
}

export function EnhancedDashboardShell({ children }: EnhancedDashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const Sidebar = ({ className }: { className?: string }) => (
    <div className={cn('flex h-full w-64 flex-col bg-card border-r', className)}>
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard/enhanced" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold">Dashboard</span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Button
                key={item.href}
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  isActive && 'bg-secondary'
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                  {item.badge && (
                    <span className="ml-auto rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </Button>
            )
          })}
        </div>

        <div className="mt-8 space-y-1">
          <div className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            User
          </div>
          {userMenuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Button
                key={item.href}
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  isActive && 'bg-secondary'
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            )
          })}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.email?.split('@')[0]}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center border-b px-4 md:px-6">
          <div className="flex items-center space-x-4 md:space-x-0">
            {/* Mobile Menu Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
            </Sheet>

            {/* Back to App */}
            <Button variant="ghost" size="sm" asChild className="hidden md:flex">
              <Link href="/app">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to App
              </Link>
            </Button>
          </div>

          <div className="flex flex-1 items-center justify-end space-x-4">
            {/* Search */}
            <div className="hidden md:flex">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search dashboard..."
                  className="w-64 rounded-md border border-input bg-background pl-8 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"></span>
              <span className="sr-only">Notifications</span>
            </Button>

            {/* Quick Actions */}
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/app/builder">
                  <Zap className="mr-2 h-4 w-4" />
                  New Project
                </Link>
              </Button>
            </div>

            {/* User Menu */}
            <div className="md:hidden">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}