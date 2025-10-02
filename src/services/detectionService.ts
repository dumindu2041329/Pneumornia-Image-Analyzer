import type { DetectionResponse, DetectionStatus } from '../types';

export interface DetectionServiceConfig {
  mode: 'mock' | 'api';
  apiEndpoint?: string;
  apiKey?: string;
}

class DetectionService {
  private config: DetectionServiceConfig;

  constructor(config: DetectionServiceConfig = { mode: 'mock' }) {
    this.config = config;
  }

  async analyzeXRay(imageFile: File): Promise<DetectionResponse> {
    if (this.config.mode === 'mock') {
      return this.mockAnalysis(imageFile);
    } else {
      return this.apiAnalysis(imageFile);
    }
  }

  private async mockAnalysis(imageFile: File): Promise<DetectionResponse> {
    const startTime = Date.now();

    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

    const random = Math.random();
    let status: DetectionStatus;
    let confidence: number;
    let notes: string;

    if (random < 0.3) {
      status = 'positive';
      confidence = 65 + Math.random() * 30;
      notes = 'Detected opacity patterns consistent with pneumonia. Areas of concern identified in lung regions. Clinical correlation recommended.';
    } else if (random < 0.85) {
      status = 'negative';
      confidence = 70 + Math.random() * 25;
      notes = 'No significant abnormalities detected. Lung fields appear clear. Normal cardiac silhouette.';
    } else {
      status = 'inconclusive';
      confidence = 45 + Math.random() * 20;
      notes = 'Image quality or positioning may affect accuracy. Consider retaking X-ray or additional imaging for conclusive diagnosis.';
    }

    const processingTime = Date.now() - startTime;

    return {
      status,
      confidence: Math.round(confidence * 100) / 100,
      processingTime,
      modelVersion: 'mock-v1.0',
      notes,
    };
  }

  private async apiAnalysis(imageFile: File): Promise<DetectionResponse> {
    if (!this.config.apiEndpoint) {
      throw new Error('API endpoint not configured');
    }

    const startTime = Date.now();

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: this.config.apiKey
          ? { 'Authorization': `Bearer ${this.config.apiKey}` }
          : {},
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();

      const processingTime = Date.now() - startTime;

      return {
        status: data.status || data.prediction,
        confidence: data.confidence || data.score,
        processingTime,
        modelVersion: data.model_version || 'api-v1.0',
        notes: data.notes || data.description,
      };
    } catch (error) {
      console.error('API analysis error:', error);
      throw new Error(
        'Failed to analyze X-ray via API. Please check your connection and try again.'
      );
    }
  }

  setConfig(config: Partial<DetectionServiceConfig>) {
    this.config = { ...this.config, ...config };
  }

  getConfig(): DetectionServiceConfig {
    return { ...this.config };
  }
}

export const detectionService = new DetectionService({ mode: 'mock' });
