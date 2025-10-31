import { Metadata } from 'next';
import { CollectionGrid, MyCollections } from '@/components/library/collections';
import { Container } from '@/components/ui/container';

export const metadata: Metadata = {
  title: 'Component Collections | Cortex Relume',
  description: 'Browse curated collections of React components. Find component sets for specific use cases, frameworks, and design systems.',
  keywords: ['component collections', 'react components', 'component sets', 'ui collections'],
};

export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-background via-background to-muted/20 border-b border-border/40">
        <Container size="lg" className="py-16">
          <div className="text-center space-y-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
                Component Collections
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Curated sets of components organized by use case, framework, and design patterns. 
                Save time by using pre-built collections for common development scenarios.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">50+</div>
                <div className="text-sm text-muted-foreground">Collections</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">1,200+</div>
                <div className="text-sm text-muted-foreground">Components</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">15</div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">25K+</div>
                <div className="text-sm text-muted-foreground">Downloads</div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Featured Collections */}
      <section className="py-12">
        <Container size="lg">
          <CollectionGrid limit={6} />
        </Container>
      </section>

      {/* User Collections Section */}
      <section className="py-12 border-t border-border/40 bg-muted/20">
        <Container size="lg">
          <MyCollections />
        </Container>
      </section>

      {/* Bottom CTA */}
      <section className="py-16">
        <Container size="lg" className="text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              Create Your Own Collection
            </h2>
            <p className="text-muted-foreground mb-8">
              Organize your favorite components into custom collections and share them with the community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/components/collections/create"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
              >
                Create Collection
              </a>
              <a
                href="/components"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Browse All Components
              </a>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}