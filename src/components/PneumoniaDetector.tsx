import { useState, useEffect } from 'react';
import { Activity, RotateCcw, LogOut, Moon, Sun } from 'lucide-react';
import { FileUpload } from './FileUpload';
import { ImagePreview } from './ImagePreview';
import { LoadingAnalysis } from './LoadingAnalysis';
import { ResultsDisplay } from './ResultsDisplay';
import { AnalysisHistory } from './AnalysisHistory';
import { detectionService } from '../services/detectionService';
import { storageService } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import type { AnalysisResult } from '../types';

type AnalysisState = 'initializing' | 'idle' | 'analyzing' | 'complete' | 'error';

export function PneumoniaDetector() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisState>('initializing');
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historyRefresh, setHistoryRefresh] = useState(0);

  useEffect(() => {
    const initModel = async () => {
      try {
        await detectionService.initialize();
        setAnalysisState('idle');
      } catch (err) {
        setError('Failed to initialize AI model. Please refresh the page.');
        setAnalysisState('error');
      }
    };
    initModel();
  }, []);

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
      const detectionResult = await detectionService.analyzeImage(selectedFile);

      const imageUrl = await storageService.uploadImage(selectedFile, user.id);

      const analysisResult = await storageService.saveAnalysis(
        user.id,
        imageUrl,
        selectedFile.name,
        selectedFile.size,
        detectionResult.prediction,
        detectionResult.confidence,
        detectionResult.processingTime,
        detectionService.getModelVersion()
      );

      setResults(analysisResult);
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

  if (analysisState === 'initializing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-slate-300">Initializing AI model...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <header className="glass-card border-b border-white/20 dark:border-slate-700/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-2 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Pneumonia Detector
                </h1>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  AI-Powered Chest X-Ray Analysis
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.user_metadata?.full_name || user?.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 glass-button text-gray-700 dark:text-slate-200 hover:bg-white/30 dark:hover:bg-slate-800/30 transition-all duration-300"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 glass-button text-gray-700 dark:text-slate-200 hover:bg-white/30 dark:hover:bg-slate-800/30 transition-all duration-300"
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
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
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
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Activity className="w-5 h-5" />
                  Analyze with AI
                </button>
              )}

              {analysisState === 'complete' && (
                <button
                  onClick={handleReset}
                  className="w-full mt-6 glass-button py-3 px-6 text-gray-700 dark:text-slate-200 hover:bg-white/30 dark:hover:bg-slate-800/30 font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Analyze Another X-Ray
                </button>
              )}

              {error && (
                <div className="mt-6 p-4 glass-card border border-red-300 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  <button
                    onClick={handleReset}
                    className="mt-3 text-sm text-red-700 dark:text-red-400 font-medium hover:text-red-800 dark:hover:text-red-300"
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
                prediction={results.prediction}
                confidence={results.confidence}
                processingTime={results.processingTime || 0}
                fileName={results.fileName}
              />
            )}

            {analysisState === 'idle' && !selectedFile && (
              <div className="glass-card p-12 text-center">
                <Activity className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Ready to Analyze
                </h3>
                <p className="text-gray-600 dark:text-slate-400">
                  Upload a chest X-ray image to begin pneumonia detection analysis
                </p>
              </div>
            )}

            <AnalysisHistory refreshTrigger={historyRefresh} />
          </div>
        </div>
      </main>

      <footer className="glass-card border-t border-white/20 dark:border-slate-700/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600 dark:text-slate-400">
            <strong>Medical Disclaimer:</strong> This tool is for educational and demonstration
            purposes only. It should not be used for clinical diagnosis or treatment decisions.
            Always consult with qualified healthcare professionals for medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
