// Enhanced Database Types for Project Management System
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      // Existing tables would be here...
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          status: string
          type: string
          is_public: boolean | null
          data: Json | null
          settings: Json | null
          collaborators: string[] | null
          created_at: string | null
          updated_at: string | null
          // New project management fields
          folder_id: string | null
          category_id: string | null
          template_id: string | null
          version: number | null
          is_template: boolean | null
          template_data: Json | null
          last_edited_at: string | null
          view_count: number | null
          share_count: number | null
          export_count: number | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          status?: string
          type: string
          is_public?: boolean | null
          data?: Json | null
          settings?: Json | null
          collaborators?: string[] | null
          created_at?: string | null
          updated_at?: string | null
          folder_id?: string | null
          category_id?: string | null
          template_id?: string | null
          version?: number | null
          is_template?: boolean | null
          template_data?: Json | null
          last_edited_at?: string | null
          view_count?: number | null
          share_count?: number | null
          export_count?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          status?: string
          type?: string
          is_public?: boolean | null
          data?: Json | null
          settings?: Json | null
          collaborators?: string[] | null
          created_at?: string | null
          updated_at?: string | null
          folder_id?: string | null
          category_id?: string | null
          template_id?: string | null
          version?: number | null
          is_template?: boolean | null
          template_data?: Json | null
          last_edited_at?: string | null
          view_count?: number | null
          share_count?: number | null
          export_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "project_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "project_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "project_templates"
            referencedColumns: ["id"]
          }
        ]
      }
      project_folders: {
        Row: {
          id: string
          name: string
          description: string | null
          parent_id: string | null
          owner_id: string
          is_root: boolean | null
          sort_order: number | null
          color: string | null
          icon: string | null
          settings: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          parent_id?: string | null
          owner_id: string
          is_root?: boolean | null
          sort_order?: number | null
          color?: string | null
          icon?: string | null
          settings?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          parent_id?: string | null
          owner_id?: string
          is_root?: boolean | null
          sort_order?: number | null
          color?: string | null
          icon?: string | null
          settings?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "project_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_folders_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      project_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          color: string | null
          icon: string | null
          parent_id: string | null
          is_active: boolean | null
          project_count: number | null
          sort_order: number | null
          settings: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          color?: string | null
          icon?: string | null
          parent_id?: string | null
          is_active?: boolean | null
          project_count?: number | null
          sort_order?: number | null
          settings?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          color?: string | null
          icon?: string | null
          parent_id?: string | null
          is_active?: boolean | null
          project_count?: number | null
          sort_order?: number | null
          settings?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "project_categories"
            referencedColumns: ["id"]
          }
        ]
      }
      project_tags: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          color: string | null
          category: string | null
          is_official: boolean | null
          project_count: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          color?: string | null
          category?: string | null
          is_official?: boolean | null
          project_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          color?: string | null
          category?: string | null
          is_official?: boolean | null
          project_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_tags_relations: {
        Row: {
          id: string
          project_id: string
          tag_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          tag_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          tag_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_tags_relations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tags_relations_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "project_tags"
            referencedColumns: ["id"]
          }
        ]
      }
      project_sharing: {
        Row: {
          id: string
          project_id: string
          user_id: string
          permission_level: string
          granted_by: string | null
          granted_at: string | null
          expires_at: string | null
          is_active: boolean | null
          metadata: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          permission_level: string
          granted_by?: string | null
          granted_at?: string | null
          expires_at?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          permission_level?: string
          granted_by?: string | null
          granted_at?: string | null
          expires_at?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_sharing_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_sharing_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      project_share_links: {
        Row: {
          id: string
          project_id: string
          token: string
          permission_level: string
          expires_at: string | null
          access_count: number | null
          max_access_count: number | null
          is_active: boolean | null
          password_hash: string | null
          created_by: string | null
          created_at: string | null
          last_accessed_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          token: string
          permission_level: string
          expires_at?: string | null
          access_count?: number | null
          max_access_count?: number | null
          is_active?: boolean | null
          password_hash?: string | null
          created_by?: string | null
          created_at?: string | null
          last_accessed_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          token?: string
          permission_level?: string
          expires_at?: string | null
          access_count?: number | null
          max_access_count?: number | null
          is_active?: boolean | null
          password_hash?: string | null
          created_by?: string | null
          created_at?: string | null
          last_accessed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_share_links_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_share_links_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      project_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string | null
          author_id: string
          project_data: Json
          preview_image_url: string | null
          tags: string[] | null
          is_public: boolean | null
          is_featured: boolean | null
          usage_count: number | null
          rating: number | null
          rating_count: number | null
          difficulty_level: string | null
          estimated_time_minutes: number | null
          framework: string | null
          dependencies: Json | null
          settings: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category?: string | null
          author_id: string
          project_data: Json
          preview_image_url?: string | null
          tags?: string[] | null
          is_public?: boolean | null
          is_featured?: boolean | null
          usage_count?: number | null
          rating?: number | null
          rating_count?: number | null
          difficulty_level?: string | null
          estimated_time_minutes?: number | null
          framework?: string | null
          dependencies?: Json | null
          settings?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string | null
          author_id?: string
          project_data?: Json
          preview_image_url?: string | null
          tags?: string[] | null
          is_public?: boolean | null
          is_featured?: boolean | null
          usage_count?: number | null
          rating?: number | null
          rating_count?: number | null
          difficulty_level?: string | null
          estimated_time_minutes?: number | null
          framework?: string | null
          dependencies?: Json | null
          settings?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_templates_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      project_analytics: {
        Row: {
          id: string
          project_id: string
          user_id: string | null
          session_id: string | null
          event_type: string
          event_data: Json | null
          duration_seconds: number | null
          metadata: Json | null
          ip_address: unknown | null
          user_agent: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          user_id?: string | null
          session_id?: string | null
          event_type: string
          event_data?: Json | null
          duration_seconds?: number | null
          metadata?: Json | null
          ip_address?: unknown | null
          user_agent?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string | null
          session_id?: string | null
          event_type?: string
          event_data?: Json | null
          duration_seconds?: number | null
          metadata?: Json | null
          ip_address?: unknown | null
          user_agent?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_analytics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      project_usage_stats: {
        Row: {
          id: string
          project_id: string
          date: string
          total_views: number | null
          unique_viewers: number | null
          total_edits: number | null
          total_collaborators: number | null
          total_exports: number | null
          total_shares: number | null
          avg_session_duration: number | null
          engagement_score: number | null
          metadata: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          date?: string
          total_views?: number | null
          unique_viewers?: number | null
          total_edits?: number | null
          total_collaborators?: number | null
          total_exports?: number | null
          total_shares?: number | null
          avg_session_duration?: number | null
          engagement_score?: number | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          date?: string
          total_views?: number | null
          unique_viewers?: number | null
          total_edits?: number | null
          total_collaborators?: number | null
          total_exports?: number | null
          total_shares?: number | null
          avg_session_duration?: number | null
          engagement_score?: number | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_usage_stats_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      project_exports: {
        Row: {
          id: string
          project_id: string
          user_id: string
          export_type: string
          format: string
          status: string | null
          file_path: string | null
          file_size_bytes: number | null
          download_count: number | null
          expires_at: string | null
          export_settings: Json | null
          error_message: string | null
          metadata: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          export_type: string
          format: string
          status?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          download_count?: number | null
          expires_at?: string | null
          export_settings?: Json | null
          error_message?: string | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          export_type?: string
          format?: string
          status?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          download_count?: number | null
          expires_at?: string | null
          export_settings?: Json | null
          error_message?: string | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_exports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_exports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      // Enhanced project management functions
      can_access_project: {
        Args: {
          project_uuid: string
          user_uuid: string
        }
        Returns: boolean
      }
      check_project_permission: {
        Args: {
          project_uuid: string
          user_uuid: string
          required_permission: string
        }
        Returns: boolean
      }
      get_project_analytics_summary: {
        Args: {
          project_uuid: string
          days_back?: number
        }
        Returns: {
          total_views: number
          unique_viewers: number
          total_edits: number
          total_exports: number
          avg_session_duration: number
          engagement_score: number
          top_collaborators: Json
          popular_tags: string[]
        }[]
      }
      get_project_collaborators: {
        Args: {
          project_uuid: string
        }
        Returns: {
          user_id: string
          full_name: string
          email: string
          permission_level: string
          granted_at: string
          avatar_url: string
        }[]
      }
      search_projects: {
        Args: {
          search_query?: string
          user_uuid?: string
          category_uuid?: string
          tag_slugs?: string[]
          folder_uuid?: string
          limit_count?: number
          offset_count?: number
        }
        Returns: {
          id: string
          name: string
          description: string
          status: string
          type: string
          is_public: boolean
          created_at: string
          updated_at: string
          folder_id: string
          category_id: string
          view_count: number
          share_count: number
          owner_name: string
          tags: string[]
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "public">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// Helper types for project management
export type ProjectPermission = 'owner' | 'admin' | 'editor' | 'viewer' | 'commenter'
export type ProjectStatus = 'draft' | 'active' | 'archived' | 'deleted'
export type ProjectType = 'website' | 'app' | 'component' | 'template' | 'other'
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'expired'