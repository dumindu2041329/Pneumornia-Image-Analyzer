import { supabase } from '../lib/supabase';
import type { AnalysisResult } from '../types';

const BUCKET_NAME = 'xray-images';

export class StorageService {
  async uploadImage(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return publicUrl;
  }

  async saveAnalysis(
    userId: string,
    imageUrl: string,
    fileName: string,
    fileSize: number,
    prediction: 'normal' | 'pneumonia',
    confidence: number,
    processingTime: number,
    modelVersion: string
  ): Promise<AnalysisResult> {
    const { data, error } = await supabase
      .from('xray_analyses')
      .insert({
        user_id: userId,
        image_url: imageUrl,
        file_name: fileName,
        file_size: fileSize,
        prediction,
        confidence,
        processing_time: processingTime,
        model_version: modelVersion,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save analysis: ${error.message}`);
    }

    return {
      id: data.id,
      prediction: data.prediction,
      confidence: data.confidence,
      imageUrl: data.image_url,
      fileName: data.file_name,
      fileSize: data.file_size,
      processingTime: data.processing_time,
      createdAt: data.created_at,
    };
  }

  async getAnalysisHistory(userId: string): Promise<AnalysisResult[]> {
    const { data, error } = await supabase
      .from('xray_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw new Error(`Failed to fetch history: ${error.message}`);
    }

    return data.map(item => ({
      id: item.id,
      prediction: item.prediction,
      confidence: item.confidence,
      imageUrl: item.image_url,
      fileName: item.file_name,
      fileSize: item.file_size,
      processingTime: item.processing_time,
      createdAt: item.created_at,
    }));
  }

  async deleteAnalysis(analysisId: string): Promise<void> {
    const { error } = await supabase
      .from('xray_analyses')
      .delete()
      .eq('id', analysisId);

    if (error) {
      throw new Error(`Failed to delete analysis: ${error.message}`);
    }
  }
}

export const storageService = new StorageService();
