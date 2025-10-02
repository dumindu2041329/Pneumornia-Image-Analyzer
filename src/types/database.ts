export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type DetectionStatus = 'positive' | 'negative' | 'inconclusive';
export type UserRole = 'patient' | 'doctor' | 'admin';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
      };
      xray_scans: {
        Row: {
          id: string;
          user_id: string;
          image_url: string;
          image_storage_path: string;
          file_name: string;
          file_size: number;
          upload_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          image_url: string;
          image_storage_path: string;
          file_name: string;
          file_size: number;
          upload_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          image_url?: string;
          image_storage_path?: string;
          file_name?: string;
          file_size?: number;
          upload_date?: string;
          created_at?: string;
        };
      };
      detection_results: {
        Row: {
          id: string;
          scan_id: string;
          user_id: string;
          detection_status: DetectionStatus;
          confidence_score: number;
          model_version: string;
          analysis_date: string;
          processing_time_ms: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          scan_id: string;
          user_id: string;
          detection_status: DetectionStatus;
          confidence_score: number;
          model_version?: string;
          analysis_date?: string;
          processing_time_ms?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          scan_id?: string;
          user_id?: string;
          detection_status?: DetectionStatus;
          confidence_score?: number;
          model_version?: string;
          analysis_date?: string;
          processing_time_ms?: number;
          notes?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
