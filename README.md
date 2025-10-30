# Cortex Relume

An AI-powered website design accelerator built with React, Next.js, Supabase, and OpenAI GPT-5.

## Overview

Cortex Relume is a comprehensive platform that uses GPT-5 to accelerate the website design and building process. It serves as an AI design ally, helping designers and developers create marketing websites faster.

## Features

### 🚀 AI Site Builder
- **Prompt to Sitemap**: Generate sitemaps instantly using GPT-5 based on company descriptions
- **Sitemap to Wireframe**: Convert sitemaps into un-styled wireframes with AI-generated copy
- **Wireframes to Style Guide**: Streamline visual concepts and design systems
- **Export to Figma/Webflow**: Direct integration with popular design tools

### 📚 Component Libraries
- **1000+ React Components**: Built with Tailwind CSS and Shadcn UI
- **Search & Filter**: Advanced component discovery system
- **Export Functionality**: Copy as React or HTML
- **Categorization**: Organized by component types and use cases

### 🤖 AI-Powered Features
- **AI Copywriting**: Generate website copy and content
- **Smart Wireframing**: Convert concepts to wireframes
- **Style Guide Generation**: Automatic design system creation
- **Component Customization**: AI-assisted component modifications

### 👥 Collaboration
- **User Management**: Authentication and profiles
- **Project Sharing**: Team collaboration features
- **Comments & Reviews**: Design approval workflows
- **Version Control**: Project history and revisions

## Technology Stack

- **Frontend**: React 18, Next.js 14, TypeScript
- **UI Framework**: Tailwind CSS, Shadcn/ui
- **Backend**: Supabase (Database, Auth, Storage, Edge Functions)
- **AI Integration**: OpenAI GPT-5 API
- **Deployment**: Vercel
- **Database**: PostgreSQL (via Supabase)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- OpenAI API key with GPT-5 access
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cortex-relume.git
   cd cortex-relume
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```
   OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Database setup**
   ```bash
   npx supabase db reset
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## Project Structure

```
cortex-relume/
├── src/
│   ├── app/                    # Next.js app directory
│   ├── components/             # React components
│   │   ├── ui/                # Shadcn/ui components
│   │   ├── layout/            # Layout components
│   │   └── features/          # Feature-specific components
│   ├── lib/                   # Utilities and configurations
│   │   ├── supabase/          # Supabase client setup
│   │   ├── openai/            # OpenAI/GPT-5 integration
│   │   └── utils.ts           # Helper functions
│   ├── types/                 # TypeScript type definitions
│   └── hooks/                 # Custom React hooks
├── supabase/                  # Supabase configuration
│   ├── migrations/            # Database migrations
│   └── functions/             # Edge functions
├── public/                    # Static assets
├── docs/                      # Documentation
└── tests/                     # Test files
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key with GPT-5 access | ✅ |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key | Optional |

## GPT-5 Configuration

Cortex Relume uses multiple GPT-5 models optimized for different tasks:

- **gpt-5**: Complex coding and agentic tasks
- **gpt-5-mini**: Cost-effective bulk operations
- **gpt-5-nano**: Simple tasks and classification

### Model Parameters
- **Reasoning Effort**: Medium (balanced quality/speed)
- **Verbosity**: Medium (detailed but not verbose)
- **Context Length**: Up to 272k tokens
- **Caching**: 90% discount on repeated inputs

## API Endpoints

### AI Site Builder
- `POST /api/ai/sitemap` - Generate sitemap from prompt
- `POST /api/ai/wireframe` - Convert sitemap to wireframe
- `POST /api/ai/copywriting` - Generate AI copy
- `POST /api/ai/styleguide` - Create style guide

### Component Library
- `GET /api/components` - List components
- `POST /api/components/search` - Search components
- `GET /api/components/:id` - Get component details
- `POST /api/components/export` - Export component

### User Management
- `POST /api/auth/login` - User authentication
- `GET /api/user/profile` - Get user profile
- `POST /api/user/projects` - Create project
- `GET /api/user/projects` - List user projects

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@cortexrelume.com or join our [Discord community](https://discord.gg/cortexrelume).

---

**Built with ❤️ by the Cortex Relume team**