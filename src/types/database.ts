export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      xray_analyses: {
        Row: {
          id: string
          user_id: string
          image_url: string
          file_name: string
          file_size: number
          prediction: 'normal' | 'pneumonia'
          confidence: number
          processing_time: number | null
          model_version: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          image_url: string
          file_name: string
          file_size: number
          prediction: 'normal' | 'pneumonia'
          confidence: number
          processing_time?: number | null
          model_version?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          image_url?: string
          file_name?: string
          file_size?: number
          prediction?: 'normal' | 'pneumonia'
          confidence?: number
          processing_time?: number | null
          model_version?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "xray_analyses_user_id_fkey"
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
