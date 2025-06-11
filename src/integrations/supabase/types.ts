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
      admin_users: {
        Row: {
          created_at: string | null
          id: number
          password_hash: string
          role: string
          status: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          password_hash: string
          role: string
          status?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          id?: number
          password_hash?: string
          role?: string
          status?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      hostel_access_logs: {
        Row: {
          created_at: string | null
          entry_time: string | null
          exit_time: string | null
          log_date: string | null
          log_id: number
          nfc_uid_scanner: string
          reader_id: string | null
        }
        Insert: {
          created_at?: string | null
          entry_time?: string | null
          exit_time?: string | null
          log_date?: string | null
          log_id?: number
          nfc_uid_scanner: string
          reader_id?: string | null
        }
        Update: {
          created_at?: string | null
          entry_time?: string | null
          exit_time?: string | null
          log_date?: string | null
          log_id?: number
          nfc_uid_scanner?: string
          reader_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_nfc_uid_hostel"
            columns: ["nfc_uid_scanner"]
            isOneToOne: false
            referencedRelation: "nfc_rings"
            referencedColumns: ["nfc_uid"]
          },
        ]
      }
      library_access_logs: {
        Row: {
          created_at: string | null
          entry_time: string | null
          exit_time: string | null
          log_date: string | null
          log_id: number
          nfc_uid_scanner: string
          reader_id: string | null
        }
        Insert: {
          created_at?: string | null
          entry_time?: string | null
          exit_time?: string | null
          log_date?: string | null
          log_id?: number
          nfc_uid_scanner: string
          reader_id?: string | null
        }
        Update: {
          created_at?: string | null
          entry_time?: string | null
          exit_time?: string | null
          log_date?: string | null
          log_id?: number
          nfc_uid_scanner?: string
          reader_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_nfc_uid_library"
            columns: ["nfc_uid_scanner"]
            isOneToOne: false
            referencedRelation: "nfc_rings"
            referencedColumns: ["nfc_uid"]
          },
        ]
      }
      library_book_transactions: {
        Row: {
          book_id: string
          created_at: string | null
          due_date: string
          issue_date: string
          nfc_uid_scanner: string
          return_date: string | null
          status: string | null
          transaction_id: number
          updated_at: string | null
        }
        Insert: {
          book_id: string
          created_at?: string | null
          due_date: string
          issue_date?: string
          nfc_uid_scanner: string
          return_date?: string | null
          status?: string | null
          transaction_id?: number
          updated_at?: string | null
        }
        Update: {
          book_id?: string
          created_at?: string | null
          due_date?: string
          issue_date?: string
          nfc_uid_scanner?: string
          return_date?: string | null
          status?: string | null
          transaction_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_nfc_uid_book"
            columns: ["nfc_uid_scanner"]
            isOneToOne: false
            referencedRelation: "nfc_rings"
            referencedColumns: ["nfc_uid"]
          },
        ]
      }
      nfc_rings: {
        Row: {
          assigned_date: string | null
          created_at: string | null
          last_seen_description: string | null
          last_seen_timestamp: string | null
          nfc_uid: string
          status: string | null
          student_usn: string
          updated_at: string | null
        }
        Insert: {
          assigned_date?: string | null
          created_at?: string | null
          last_seen_description?: string | null
          last_seen_timestamp?: string | null
          nfc_uid: string
          status?: string | null
          student_usn: string
          updated_at?: string | null
        }
        Update: {
          assigned_date?: string | null
          created_at?: string | null
          last_seen_description?: string | null
          last_seen_timestamp?: string | null
          nfc_uid?: string
          status?: string | null
          student_usn?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_student_usn"
            columns: ["student_usn"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["usn"]
          },
        ]
      }
      students: {
        Row: {
          address: string | null
          blood_group: string | null
          contact_no: string | null
          created_at: string | null
          dob: string | null
          image_url: string | null
          name: string
          staying_at_hostel: boolean | null
          updated_at: string | null
          usn: string
          valid_upto: string
        }
        Insert: {
          address?: string | null
          blood_group?: string | null
          contact_no?: string | null
          created_at?: string | null
          dob?: string | null
          image_url?: string | null
          name: string
          staying_at_hostel?: boolean | null
          updated_at?: string | null
          usn: string
          valid_upto: string
        }
        Update: {
          address?: string | null
          blood_group?: string | null
          contact_no?: string | null
          created_at?: string | null
          dob?: string | null
          image_url?: string | null
          name?: string
          staying_at_hostel?: boolean | null
          updated_at?: string | null
          usn?: string
          valid_upto?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
