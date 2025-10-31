import { Metadata } from 'next'
import { EnhancedDashboardShell } from './shell'

export const metadata: Metadata = {
  title: 'Dashboard | Enhanced Analytics',
  description: 'Comprehensive user dashboard with activity tracking and insights',
}

export default function EnhancedDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <EnhancedDashboardShell>{children}</EnhancedDashboardShell>
}