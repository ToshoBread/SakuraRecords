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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      address: {
        Row: {
          address: string
          clientid: number
          created_at: string
          deleted_at: string | null
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          address: string
          clientid: number
          created_at?: string
          deleted_at?: string | null
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          address?: string
          clientid?: number
          created_at?: string
          deleted_at?: string | null
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "address_clientid_fkey"
            columns: ["clientid"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
        ]
      }
      client: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      delivery: {
        Row: {
          addressid: number
          clientid: number | null
          created_at: string
          deleted_at: string | null
          delivered: boolean
          delivery_date: string
          deliveryrequirementid: number
          id: number
          payment_terms: number
          poid: string | null
          productid: number
          shipped_quantity: number
          transactiondocumentid: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          addressid: number
          clientid?: number | null
          created_at?: string
          deleted_at?: string | null
          delivered?: boolean
          delivery_date: string
          deliveryrequirementid: number
          id?: number
          payment_terms?: number
          poid?: string | null
          productid: number
          shipped_quantity: number
          transactiondocumentid: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          addressid?: number
          clientid?: number | null
          created_at?: string
          deleted_at?: string | null
          delivered?: boolean
          delivery_date?: string
          deliveryrequirementid?: number
          id?: number
          payment_terms?: number
          poid?: string | null
          productid?: number
          shipped_quantity?: number
          transactiondocumentid?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_addressid_fkey"
            columns: ["addressid"]
            isOneToOne: false
            referencedRelation: "address"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_clientid_fkey"
            columns: ["clientid"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_deliveryrequirementid_fkey"
            columns: ["deliveryrequirementid"]
            isOneToOne: false
            referencedRelation: "delivery_requirement"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_poid_fkey"
            columns: ["poid"]
            isOneToOne: false
            referencedRelation: "purchase_order"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_productid_fkey"
            columns: ["productid"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_transactiondocumentid_fkey"
            columns: ["transactiondocumentid"]
            isOneToOne: false
            referencedRelation: "transaction_document"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_requirement: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: number
          requirement: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: number
          requirement: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: number
          requirement?: string
          updated_at?: string
        }
        Relationships: []
      }
      po_product: {
        Row: {
          created_at: string
          deleted_at: string | null
          ordered_quantity: number
          poid: string
          price_per_kg: number
          productid: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          ordered_quantity: number
          poid: string
          price_per_kg?: number
          productid: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          ordered_quantity?: number
          poid?: string
          price_per_kg?: number
          productid?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "po_product_poid_fkey"
            columns: ["poid"]
            isOneToOne: false
            referencedRelation: "purchase_order"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "po_product_productid_fkey"
            columns: ["productid"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      product: {
        Row: {
          code: string
          created_at: string
          deleted_at: string | null
          description: string | null
          id: number
          kg: number
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: number
          kg?: number
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: number
          kg?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      purchase_order: {
        Row: {
          clientid: number
          created_at: string
          deleted_at: string | null
          id: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          clientid: number
          created_at?: string
          deleted_at?: string | null
          id: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          clientid?: number
          created_at?: string
          deleted_at?: string | null
          id?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_clientid_fkey"
            columns: ["clientid"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_document: {
        Row: {
          created_at: string
          deleted_at: string | null
          document: string
          id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          document: string
          id?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          document?: string
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      delivery_search: {
        Row: {
          id: number
          poid: string | null
          clientid: number | null
          productid: number
          shipped_quantity: number
          unit_price: number
          delivery_date: string
          payment_terms: number
          delivered: boolean
          addressid: number
          transactiondocumentid: number
          deliveryrequirementid: number
          created_at: string
          updated_at: string
          deleted_at: string | null
          address_clientid: number
          product_name: string | null
          product_code: string | null
          direct_client_name: string | null
          po_number: string | null
          address_name: string | null
          client_name: string | null
          po_client_name: string | null
          transaction_document_name: string | null
          delivery_requirement_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_role: { Args: never; Returns: string }
      link_delivery_to_po: {
        Args: { p_delivery_id: number; p_poid: string }
        Returns: undefined
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
