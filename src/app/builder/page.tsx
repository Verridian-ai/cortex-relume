import { BuilderWorkflow } from '@/components/builder/workflow'
import { Metadata } from 'next'
import { Nav } from '@/components/layout/nav'

export const metadata: Metadata = {
  title: 'AI Site Builder - Cortex Relume',
  description: 'Create professional websites in minutes with AI-powered design tools. Generate sitemaps, wireframes, and style guides automatically.',
  keywords: [
    'AI website builder',
    'wireframe generator',
    'sitemap creation',
    'design system',
    'website design',
    'AI design tools',
    'web design automation',
  ],
}

export default function BuilderPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Nav isAppLayout />
      <main className="flex-1">
        <BuilderWorkflow />
      </main>
    </div>
  )
}