import { Loader2, Brain, ScanSearch, FileSearch } from 'lucide-react';

interface LoadingAnalysisProps {
  stage?: string;
}

export function LoadingAnalysis({ stage = 'Analyzing X-ray image...' }: LoadingAnalysisProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-20 h-20 text-blue-600 animate-spin" />
          </div>
          <div className="w-20 h-20 flex items-center justify-center">
            <Brain className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-gray-900">
            Analyzing X-Ray
          </h3>
          <p className="text-sm text-gray-600">
            {stage}
          </p>
        </div>

        <div className="w-full max-w-xs space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FileSearch className="w-4 h-4 text-blue-600" />
            </div>
            <span>Processing image data</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <ScanSearch className="w-4 h-4 text-blue-600" />
            </div>
            <span>Running detection algorithm</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Brain className="w-4 h-4 text-blue-600" />
            </div>
            <span>Generating confidence scores</span>
          </div>
        </div>

        <div className="w-full max-w-xs">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '70%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
