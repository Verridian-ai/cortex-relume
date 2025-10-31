export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          type: 'sitemap' | 'wireframe' | 'style-guide'
          status: 'draft' | 'in-progress' | 'completed'
          created_at: string
          updated_at: string
          user_id: string
          folder_id: string | null
          category_id: string | null
          data: {
            pages?: number
            wireframes?: number
            components?: number
            progress?: number
          }
          is_public: boolean
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          type: 'sitemap' | 'wireframe' | 'style-guide'
          status?: 'draft' | 'in-progress' | 'completed'
          created_at?: string
          updated_at?: string
          user_id: string
          folder_id?: string | null
          category_id?: string | null
          data?: {
            pages?: number
            wireframes?: number
            components?: number
            progress?: number
          }
          is_public?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          type?: 'sitemap' | 'wireframe' | 'style-guide'
          status?: 'draft' | 'in-progress' | 'completed'
          created_at?: string
          updated_at?: string
          user_id?: string
          folder_id?: string | null
          category_id?: string | null
          data?: {
            pages?: number
            wireframes?: number
            components?: number
            progress?: number
          }
          is_public?: boolean
        }
      }
      project_folders: {
        Row: {
          id: string
          name: string
          description: string | null
          parent_id: string | null
          user_id: string
          color: string
          icon: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          parent_id?: string | null
          user_id: string
          color?: string
          icon?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          parent_id?: string | null
          user_id?: string
          color?: string
          icon?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      project_tags: {
        Row: {
          id: string
          name: string
          color: string
          description: string | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          description?: string | null
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          description?: string | null
          user_id?: string
          created_at?: string
        }
      }
      project_tags_relations: {
        Row: {
          project_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          project_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          project_id?: string
          tag_id?: string
          created_at?: string
        }
      }
      project_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string
          icon: string | null
          is_predefined: boolean
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color: string
          icon?: string | null
          is_predefined?: boolean
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string
          icon?: string | null
          is_predefined?: boolean
          user_id?: string | null
          created_at?: string
        }
      }
      bulk_operations: {
        Row: {
          id: string
          type: 'move' | 'tag' | 'delete' | 'export'
          status: 'pending' | 'processing' | 'completed' | 'failed'
          project_ids: string[]
          target_folder_id: string | null
          tags_to_add: string[]
          tags_to_remove: string[]
          progress: number
          error_message: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          type: 'move' | 'tag' | 'delete' | 'export'
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          project_ids: string[]
          target_folder_id?: string | null
          tags_to_add?: string[]
          tags_to_remove?: string[]
          progress?: number
          error_message?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          type?: 'move' | 'tag' | 'delete' | 'export'
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          project_ids?: string[]
          target_folder_id?: string | null
          tags_to_add?: string[]
          tags_to_remove?: string[]
          progress?: number
          error_message?: string | null
          created_at?: string
          completed_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}