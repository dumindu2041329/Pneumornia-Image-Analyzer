import type { DetectionStatus } from './database';

export interface XRayScan {
  id: string;
  user_id: string;
  image_url: string;
  image_storage_path: string;
  file_name: string;
  file_size: number;
  upload_date: string;
  created_at: string;
}

export interface DetectionResult {
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
}

export interface AnalysisRecord extends XRayScan {
  detection_result: DetectionResult;
}

export interface DetectionResponse {
  status: DetectionStatus;
  confidence: number;
  processingTime: number;
  modelVersion: string;
  notes?: string;
}

export * from './database';
