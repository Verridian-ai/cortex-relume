import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ComponentDetailView } from '@/components/library/component-detail-view';
import { RelatedComponents } from '@/components/library/related-components';
import { ComponentReviews } from '@/components/library/component-reviews';
import { Container } from '@/components/ui/container';

// This would normally come from your database/API
async function getComponent(slug: string) {
  // Mock data for demonstration
  const components = {
    'advanced-form-builder': {
      id: '1',
      name: 'Advanced Form Builder',
      slug: 'advanced-form-builder',
      description: 'Complete form builder with validation, multiple input types, and real-time preview. Perfect for creating complex forms with dynamic validation and conditional fields.',
      category: 'Forms',
      framework: 'React',
      rating: 4.9,
      review_count: 156,
      usage_count: 15420,
      downloads: 8750,
      version: '2.1.0',
      last_updated: '2024-01-15',
      complexity_score: 4,
      accessibility_score: 95,
      performance_score: 92,
      author: {
        name: 'UI Team',
        avatar: '/avatars/ui-team.jpg',
        bio: 'Specialized in creating accessible and performant UI components',
        verified: true,
      },
      tags: ['Forms', 'Validation', 'Interactive', 'Accessible', 'React'],
      framework_versions: {
        react: '>=16.8.0',
        typescript: '>=4.0.0',
      },
      dependencies: [
        { name: 'react-hook-form', version: '^7.45.0', type: 'peer' },
        { name: 'zod', version: '^3.21.0', type: 'peer' },
      ],
      preview_url: '/preview/advanced-form-builder',
      code_examples: {
        basic: `import { FormBuilder } from '@cortex-relume/react-form-builder';

export default function MyForm() {
  return (
    <FormBuilder
      schema={{
        fields: [
          { name: 'email', type: 'email', label: 'Email', required: true },
          { name: 'password', type: 'password', label: 'Password', required: true },
        ],
      }}
      onSubmit={(data) => console.log(data)}
    />
  );
}`,
        advanced: `import { FormBuilder } from '@cortex-relume/react-form-builder';

export default function AdvancedForm() {
  return (
    <FormBuilder
      schema={{
        fields: [
          {
            name: 'userType',
            type: 'select',
            label: 'User Type',
            options: [
              { value: 'individual', label: 'Individual' },
              { value: 'business', label: 'Business' },
            ],
          },
          {
            name: 'businessName',
            type: 'text',
            label: 'Business Name',
            required: true,
            showIf: { field: 'userType', equals: 'business' },
          },
        ],
        validation: {
          email: { pattern: 'email', message: 'Invalid email format' },
          password: { minLength: 8, message: 'Password too short' },
        },
      }}
      onSubmit={handleSubmit}
      validationMode="onChange"
      showResetButton={true}
    />
  );
}`,
      },
    },
  };

  return components[slug as keyof typeof components] || null;
}

interface Props {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const component = await getComponent(params.slug);
  
  if (!component) {
    return {
      title: 'Component Not Found | Cortex Relume',
    };
  }

  return {
    title: `${component.name} | Component Library | Cortex Relume`,
    description: component.description,
    keywords: [component.name, 'component', 'react', component.category, ...component.tags],
    openGraph: {
      title: component.name,
      description: component.description,
      type: 'website',
    },
  };
}

export default async function ComponentDetailPage({ params }: Props) {
  const component = await getComponent(params.slug);

  if (!component) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Component Detail View */}
      <Container size="lg" className="py-8">
        <ComponentDetailView component={component} />
      </Container>

      {/* Related Components */}
      <section className="py-12 border-t border-border/40 bg-muted/20">
        <Container size="lg">
          <RelatedComponents 
            currentComponentId={component.id}
            category={component.category}
          />
        </Container>
      </section>

      {/* Reviews Section */}
      <section className="py-12">
        <Container size="lg">
          <ComponentReviews componentId={component.id} />
        </Container>
      </section>
    </div>
  );
}