export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_activity_log: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_title: string | null
          entity_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_title?: string | null
          entity_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_title?: string | null
          entity_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      application_replies: {
        Row: {
          application_id: string
          author_email: string | null
          created_at: string
          id: string
          message: string
        }
        Insert: {
          application_id: string
          author_email?: string | null
          created_at?: string
          id?: string
          message: string
        }
        Update: {
          application_id?: string
          author_email?: string | null
          created_at?: string
          id?: string
          message?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_replies_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author: string
          category: string
          content: string
          created_at: string
          date: string
          excerpt: string
          id: string
          image_url: string | null
          meta_description: string | null
          meta_title: string | null
          og_image: string | null
          publish_at: string | null
          published: boolean
          read_time: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author: string
          category: string
          content: string
          created_at?: string
          date: string
          excerpt: string
          id?: string
          image_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          publish_at?: string | null
          published?: boolean
          read_time: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          category?: string
          content?: string
          created_at?: string
          date?: string
          excerpt?: string
          id?: string
          image_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          publish_at?: string | null
          published?: boolean
          read_time?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      careers: {
        Row: {
          created_at: string
          department: string
          description: string
          id: string
          location: string
          published: boolean
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department: string
          description: string
          id?: string
          location: string
          published?: boolean
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string
          description?: string
          id?: string
          location?: string
          published?: boolean
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      case_studies: {
        Row: {
          challenge: string
          created_at: string
          id: string
          image_url: string | null
          industry: string
          meta_description: string | null
          meta_title: string | null
          metrics: Json
          og_image: string | null
          publish_at: string | null
          published: boolean
          results: string[]
          slug: string
          solution: string
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          challenge: string
          created_at?: string
          id?: string
          image_url?: string | null
          industry: string
          meta_description?: string | null
          meta_title?: string | null
          metrics: Json
          og_image?: string | null
          publish_at?: string | null
          published?: boolean
          results: string[]
          slug: string
          solution: string
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          challenge?: string
          created_at?: string
          id?: string
          image_url?: string | null
          industry?: string
          meta_description?: string | null
          meta_title?: string | null
          metrics?: Json
          og_image?: string | null
          publish_at?: string | null
          published?: boolean
          results?: string[]
          slug?: string
          solution?: string
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      consultation_requests: {
        Row: {
          admin_notes: string | null
          budget: string | null
          company: string
          created_at: string
          email: string
          id: string
          industry: string | null
          message: string | null
          name: string
          phone: string | null
          replied_at: string | null
          replied_by: string | null
          size: string | null
          status: string
        }
        Insert: {
          admin_notes?: string | null
          budget?: string | null
          company: string
          created_at?: string
          email: string
          id?: string
          industry?: string | null
          message?: string | null
          name: string
          phone?: string | null
          replied_at?: string | null
          replied_by?: string | null
          size?: string | null
          status?: string
        }
        Update: {
          admin_notes?: string | null
          budget?: string | null
          company?: string
          created_at?: string
          email?: string
          id?: string
          industry?: string | null
          message?: string | null
          name?: string
          phone?: string | null
          replied_at?: string | null
          replied_by?: string | null
          size?: string | null
          status?: string
        }
        Relationships: []
      }
      content_views: {
        Row: {
          browser: string | null
          city: string | null
          content_id: string
          content_type: string
          converted_to: string | null
          country: string | null
          created_at: string
          device_type: string | null
          id: string
          is_returning: boolean | null
          os: string | null
          referrer: string | null
          scroll_depth: number | null
          session_id: string | null
          time_on_page: number | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          content_id: string
          content_type: string
          converted_to?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          is_returning?: boolean | null
          os?: string | null
          referrer?: string | null
          scroll_depth?: number | null
          session_id?: string | null
          time_on_page?: number | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          content_id?: string
          content_type?: string
          converted_to?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          is_returning?: boolean | null
          os?: string | null
          referrer?: string | null
          scroll_depth?: number | null
          session_id?: string | null
          time_on_page?: number | null
        }
        Relationships: []
      }
      inquiry_notes: {
        Row: {
          author_email: string | null
          created_at: string
          id: string
          inquiry_id: string
          message: string
        }
        Insert: {
          author_email?: string | null
          created_at?: string
          id?: string
          inquiry_id: string
          message: string
        }
        Update: {
          author_email?: string | null
          created_at?: string
          id?: string
          inquiry_id?: string
          message?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiry_notes_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "consultation_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          career_id: string | null
          cover_letter: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          resume_url: string | null
          status: string
        }
        Insert: {
          career_id?: string | null
          cover_letter?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          resume_url?: string | null
          status?: string
        }
        Update: {
          career_id?: string | null
          cover_letter?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          resume_url?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_career_id_fkey"
            columns: ["career_id"]
            isOneToOne: false
            referencedRelation: "careers"
            referencedColumns: ["id"]
          },
        ]
      }
      known_sessions: {
        Row: {
          first_seen: string | null
          session_id: string
        }
        Insert: {
          first_seen?: string | null
          session_id: string
        }
        Update: {
          first_seen?: string | null
          session_id?: string
        }
        Relationships: []
      }
      newsletter_sends: {
        Row: {
          failed_count: number
          html_preview: string
          id: string
          sent_at: string
          sent_count: number
          subject: string
        }
        Insert: {
          failed_count?: number
          html_preview: string
          id?: string
          sent_at?: string
          sent_count?: number
          subject: string
        }
        Update: {
          failed_count?: number
          html_preview?: string
          id?: string
          sent_at?: string
          sent_count?: number
          subject?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string | null
        }
        Relationships: []
      }
      resources: {
        Row: {
          created_at: string
          description: string
          featured: boolean
          file_url: string | null
          id: string
          published: boolean
          slug: string
          title: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description: string
          featured?: boolean
          file_url?: string | null
          id?: string
          published?: boolean
          slug: string
          title: string
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          featured?: boolean
          file_url?: string | null
          id?: string
          published?: boolean
          slug?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          role: string
          user_id: string
        }
        Insert: {
          role: string
          user_id: string
        }
        Update: {
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_analytics_detail: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          browser: string
          city: string
          content_id: string
          content_type: string
          converted_to: string
          country: string
          created_at: string
          device_type: string
          id: string
          is_returning: boolean
          os: string
          referrer: string
          scroll_depth: number
          session_id: string
          time_on_page: number
          title: string
        }[]
      }
      get_audience_breakdown: {
        Args: never
        Returns: {
          count: number
          dimension: string
          value: string
        }[]
      }
      get_content_analytics: {
        Args: never
        Returns: {
          avg_scroll_depth: number
          avg_time_on_page: number
          content_id: string
          content_type: string
          title: string
          view_count: number
        }[]
      }
      get_conversion_stats: {
        Args: never
        Returns: {
          conversion_rate: number
          converted_to: string
          count: number
        }[]
      }
      get_daily_views: {
        Args: { days_back?: number }
        Returns: {
          unique_sessions: number
          view_count: number
          view_date: string
        }[]
      }
      has_role:
        | { Args: { app_role: string; uid: string }; Returns: boolean }
        | {
            Args: { role: Database["public"]["Enums"]["app_role"]; uid: string }
            Returns: boolean
          }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
