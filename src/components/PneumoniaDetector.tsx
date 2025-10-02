import { useState } from 'react';
import { Activity, RotateCcw, LogOut } from 'lucide-react';
import { FileUpload } from './FileUpload';
import { ImagePreview } from './ImagePreview';
import { LoadingAnalysis } from './LoadingAnalysis';
import { ResultsDisplay } from './ResultsDisplay';
import { AnalysisHistory } from './AnalysisHistory';
import { detectionService } from '../services/detectionService';
import { storageService } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import type { DetectionResponse } from '../types';

type AnalysisState = 'idle' | 'analyzing' | 'complete' | 'error';

export function PneumoniaDetector() {
  const { user, signOut } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [results, setResults] = useState<DetectionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historyRefresh, setHistoryRefresh] = useState(0);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setResults(null);
    setError(null);
    setAnalysisState('idle');
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setResults(null);
    setError(null);
    setAnalysisState('idle');
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !user) return;

    setAnalysisState('analyzing');
    setError(null);

    try {
      const detectionResult = await detectionService.analyzeXRay(selectedFile);

      const { url, path } = await storageService.uploadXRay(selectedFile, user.id);

      const scanRecord = await storageService.saveScanRecord({
        userId: user.id,
        imageUrl: url,
        imagePath: path,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
      });

      await storageService.saveDetectionResult({
        scanId: scanRecord.id,
        userId: user.id,
        detectionStatus: detectionResult.status,
        confidenceScore: detectionResult.confidence,
        modelVersion: detectionResult.modelVersion,
        processingTimeMs: detectionResult.processingTime,
        notes: detectionResult.notes,
      });

      setResults(detectionResult);
      setAnalysisState('complete');
      setHistoryRefresh(prev => prev + 1);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze X-ray');
      setAnalysisState('error');
    }
  };

  const handleReset = () => {
    handleClearFile();
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Pneumonia Detector
                </h1>
                <p className="text-sm text-gray-600">
                  AI-Powered Chest X-Ray Analysis
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.user_metadata?.full_name || user?.email}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Upload X-Ray Image
              </h2>
              <FileUpload
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
                onClear={handleClearFile}
                disabled={analysisState === 'analyzing'}
              />

              {selectedFile && analysisState === 'idle' && (
                <button
                  onClick={handleAnalyze}
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Activity className="w-5 h-5" />
                  Analyze X-Ray
                </button>
              )}

              {analysisState === 'complete' && (
                <button
                  onClick={handleReset}
                  className="w-full mt-6 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Analyze Another X-Ray
                </button>
              )}

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                  <button
                    onClick={handleReset}
                    className="mt-3 text-sm text-red-700 font-medium hover:text-red-800"
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>

            {selectedFile && (
              <ImagePreview file={selectedFile} />
            )}
          </div>

          <div className="space-y-6">
            {analysisState === 'analyzing' && <LoadingAnalysis />}

            {analysisState === 'complete' && results && (
              <ResultsDisplay
                status={results.status}
                confidence={results.confidence}
                processingTime={results.processingTime}
                modelVersion={results.modelVersion}
                notes={results.notes}
              />
            )}

            {analysisState === 'idle' && !selectedFile && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Ready to Analyze
                </h3>
                <p className="text-gray-600">
                  Upload a chest X-ray image to begin pneumonia detection analysis
                </p>
              </div>
            )}

            <AnalysisHistory refreshTrigger={historyRefresh} />
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            <strong>Medical Disclaimer:</strong> This tool is for educational and demonstration
            purposes only. It should not be used for clinical diagnosis or treatment decisions.
            Always consult with qualified healthcare professionals for medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
