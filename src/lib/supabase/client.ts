import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: {
        'x-application-name': 'cortex-relume',
      },
    },
  }
)

// Database schema types
export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']

export type Enums<T extends keyof Database['public']['Enums']> = 
  Database['public']['Enums'][T]

// Auth types
export type Profile = Tables<'profiles'>
export type Project = Tables<'projects'>
export type Component = Tables<'components'>
export type ComponentLibrary = Tables<'component_libraries'>
export type Sitemap = Tables<'sitemaps'>
export type Wireframe = Tables<'wireframes'>
export type StyleGuide = Tables<'style_guides'>

// Auth helpers
export const authHelpers = {
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })
    return { data, error }
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    })
    return { data, error }
  },

  updateProfile: async (updates: Partial<Profile>) => {
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    })
    return { data, error }
  },
}

// Project helpers
export const projectHelpers = {
  create: async (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select()
      .single()
    return { data, error }
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        sitemaps(*),
        wireframes(*),
        style_guides(*)
      `)
      .eq('id', id)
      .single()
    return { data, error }
  },

  getByUser: async (userId: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    return { data, error }
  },

  update: async (id: string, updates: Partial<Project>) => {
    const { data, error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
    return { error }
  },
}

// Component helpers
export const componentHelpers = {
  getAll: async (filters?: {
    category?: string
    search?: string
    limit?: number
    offset?: number
  }) => {
    let query = supabase.from('components').select('*')
    
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    
    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }
    
    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1)
    }
    
    const { data, error } = await query.order('name')
    return { data, error }
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  search: async (query: string, limit: number = 20) => {
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
      .limit(limit)
    return { data, error }
  },

  getByCategory: async (category: string) => {
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .eq('category', category)
      .order('name')
    return { data, error }
  },
}

// Storage helpers
export const storageHelpers = {
  uploadFile: async (bucket: string, path: string, file: File) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      })
    return { data, error }
  },

  getSignedUrl: async (bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 3600) // 1 hour
    return { data, error }
  },

  deleteFile: async (bucket: string, path: string) => {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])
    return { error }
  },
}

// Real-time helpers
export const realtimeHelpers = {
  subscribeToProject: (projectId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`project:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `id=eq.${projectId}`,
        },
        callback
      )
      .subscribe()
  },

  subscribeToComponent: (componentId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`component:${componentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'components',
          filter: `id=eq.${componentId}`,
        },
        callback
      )
      .subscribe()
  },
}

// Edge function helpers
export const edgeFunctionHelpers = {
  invoke: async (functionName: string, payload: any) => {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload,
    })
    return { data, error }
  },

  aiSiteBuilder: async (payload: {
    prompt: string
    projectId?: string
    options?: Record<string, any>
  }) => {
    return edgeFunctionHelpers.invoke('ai-site-builder', payload)
  },

  generateComponent: async (payload: {
    prompt: string
    category?: string
    framework?: string
  }) => {
    return edgeFunctionHelpers.invoke('generate-component', payload)
  },

  aiCopywriting: async (payload: {
    prompt: string
    tone?: string
    length?: string
    audience?: string
  }) => {
    return edgeFunctionHelpers.invoke('ai-copywriting', payload)
  },
}