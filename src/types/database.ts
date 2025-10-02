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
      }
    }
  }
}
