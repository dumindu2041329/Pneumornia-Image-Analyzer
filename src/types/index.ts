export interface AnalysisResult {
  id: string;
  prediction: 'normal' | 'pneumonia';
  confidence: number;
  imageUrl: string;
  fileName: string;
  fileSize: number;
  processingTime: number | null;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  fullName?: string;
}
