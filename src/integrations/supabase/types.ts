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
      appointments: {
        Row: {
          agent: string | null
          client_name: string
          created_at: string
          created_by: string | null
          date: string
          id: string
          notes: string
          status: string
          time: string
          type: string
          updated_at: string
        }
        Insert: {
          agent?: string | null
          client_name?: string
          created_at?: string
          created_by?: string | null
          date?: string
          id?: string
          notes?: string
          status?: string
          time?: string
          type?: string
          updated_at?: string
        }
        Update: {
          agent?: string | null
          client_name?: string
          created_at?: string
          created_by?: string | null
          date?: string
          id?: string
          notes?: string
          status?: string
          time?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          assigned_agent: string | null
          created_at: string
          created_by: string | null
          email: string
          id: string
          name: string
          phone: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          assigned_agent?: string | null
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
          name: string
          phone?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          assigned_agent?: string | null
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      deals: {
        Row: {
          assigned_agent: string | null
          client_id: string | null
          client_name: string
          created_at: string
          created_by: string | null
          id: string
          policy_type: string
          priority: string
          stage: string
          updated_at: string
          value: number
        }
        Insert: {
          assigned_agent?: string | null
          client_id?: string | null
          client_name?: string
          created_at?: string
          created_by?: string | null
          id?: string
          policy_type?: string
          priority?: string
          stage?: string
          updated_at?: string
          value?: number
        }
        Update: {
          assigned_agent?: string | null
          client_id?: string | null
          client_name?: string
          created_at?: string
          created_by?: string | null
          id?: string
          policy_type?: string
          priority?: string
          stage?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "deals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      policies: {
        Row: {
          carrier: string
          client_id: string
          created_at: string
          created_by: string | null
          id: string
          policy_number: string
          premium: number
          renewal_date: string | null
          start_date: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          carrier?: string
          client_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          policy_number?: string
          premium?: number
          renewal_date?: string | null
          start_date?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          carrier?: string
          client_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          policy_number?: string
          premium?: number
          renewal_date?: string | null
          start_date?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "policies_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_suspended: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_suspended?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_suspended?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_superadmin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "superadmin" | "admin" | "manager"
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
      app_role: ["superadmin", "admin", "manager"],
    },
  },
} as const
