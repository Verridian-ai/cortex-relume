'use client'

import { ReactNode } from 'react'
import { AuthGuard } from '@/components/auth-guard'

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <AuthGuard requireAuth>
      {children}
    </AuthGuard>
  )
}