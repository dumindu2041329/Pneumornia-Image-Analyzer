import { supabase } from '../lib/supabase';
import type { XRayScan, DetectionResult } from '../types';

export class StorageService {
  async uploadXRay(file: File, userId: string): Promise<{ path: string; url: string }> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('xray-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from('xray-images')
      .getPublicUrl(filePath);

    return {
      path: filePath,
      url: urlData.publicUrl,
    };
  }

  async saveScanRecord(data: {
    userId: string;
    imageUrl: string;
    imagePath: string;
    fileName: string;
    fileSize: number;
  }): Promise<XRayScan> {
    const { data: scan, error } = await supabase
      .from('xray_scans')
      .insert({
        user_id: data.userId,
        image_url: data.imageUrl,
        image_storage_path: data.imagePath,
        file_name: data.fileName,
        file_size: data.fileSize,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save scan record: ${error.message}`);
    }

    return scan;
  }

  async saveDetectionResult(data: {
    scanId: string;
    userId: string;
    detectionStatus: 'positive' | 'negative' | 'inconclusive';
    confidenceScore: number;
    modelVersion: string;
    processingTimeMs: number;
    notes?: string;
  }): Promise<DetectionResult> {
    const { data: result, error } = await supabase
      .from('detection_results')
      .insert({
        scan_id: data.scanId,
        user_id: data.userId,
        detection_status: data.detectionStatus,
        confidence_score: data.confidenceScore,
        model_version: data.modelVersion,
        processing_time_ms: data.processingTimeMs,
        notes: data.notes || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save detection result: ${error.message}`);
    }

    return result;
  }

  async getAnalysisHistory(userId: string, limit: number = 20) {
    const { data, error } = await supabase
      .from('xray_scans')
      .select(`
        *,
        detection_results (*)
      `)
      .eq('user_id', userId)
      .order('upload_date', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch analysis history: ${error.message}`);
    }

    return data.map((scan) => ({
      ...scan,
      detection_result: Array.isArray(scan.detection_results)
        ? scan.detection_results[0]
        : scan.detection_results,
    }));
  }

  async deleteScan(scanId: string, userId: string, storagePath: string): Promise<void> {
    const { error: storageError } = await supabase.storage
      .from('xray-images')
      .remove([storagePath]);

    if (storageError) {
      console.error('Failed to delete image from storage:', storageError);
    }

    const { error: dbError } = await supabase
      .from('xray_scans')
      .delete()
      .eq('id', scanId)
      .eq('user_id', userId);

    if (dbError) {
      throw new Error(`Failed to delete scan: ${dbError.message}`);
    }
  }
}

export const storageService = new StorageService();
