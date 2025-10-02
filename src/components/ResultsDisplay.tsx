import { CheckCircle, AlertTriangle, Clock, FileText } from 'lucide-react';

interface ResultsDisplayProps {
  prediction: 'normal' | 'pneumonia';
  confidence: number;
  processingTime: number;
  fileName: string;
}

export function ResultsDisplay({
  prediction,
  confidence,
  processingTime,
  fileName,
}: ResultsDisplayProps) {
  const getStatusConfig = () => {
    if (prediction === 'pneumonia') {
      return {
        icon: AlertTriangle,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconColor: 'text-red-600',
        textColor: 'text-red-900',
        title: 'Pneumonia Detected',
        description: 'The AI model has identified patterns consistent with pneumonia in this X-ray image.',
      };
    } else {
      return {
        icon: CheckCircle,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        iconColor: 'text-green-600',
        textColor: 'text-green-900',
        title: 'Normal X-Ray',
        description: 'No significant abnormalities consistent with pneumonia were detected.',
      };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const getConfidenceColor = () => {
    const confidencePercent = confidence * 100;
    if (confidencePercent >= 80) return 'bg-green-500';
    if (confidencePercent >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const confidencePercent = confidence * 100;

  return (
    <div className="glass-card overflow-hidden">
      <div className={`${config.bgColor} dark:bg-opacity-20 border-b-2 ${config.borderColor} dark:border-opacity-30 p-6`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 bg-white dark:bg-slate-800 rounded-full shadow-md flex-shrink-0`}>
            <Icon className={`w-8 h-8 ${config.iconColor}`} />
          </div>
          <div className="flex-1">
            <h2 className={`text-2xl font-bold ${config.textColor} dark:text-${prediction === 'pneumonia' ? 'red' : 'green'}-400 mb-1`}>
              {config.title}
            </h2>
            <p className={`text-sm ${config.textColor} dark:text-slate-300 opacity-80`}>
              {config.description}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Confidence Score
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {confidencePercent.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full ${getConfidenceColor()} transition-all duration-500 ease-out`}
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
            {confidencePercent >= 80 && 'High confidence in the analysis'}
            {confidencePercent >= 60 && confidencePercent < 80 && 'Moderate confidence in the analysis'}
            {confidencePercent < 60 && 'Lower confidence - consider additional imaging'}
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
            File Information
          </h3>
          <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-300">
            <FileText className="w-4 h-4" />
            <span className="truncate">{fileName}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg">
              <Clock className="w-5 h-5 text-gray-600 dark:text-slate-300" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400">Processing Time</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {processingTime}ms
              </p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <p className="text-xs text-amber-800 dark:text-amber-300">
            <strong>Important:</strong> This analysis is for educational and demonstration
            purposes only. Always consult with qualified healthcare professionals for
            medical diagnosis and treatment decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
