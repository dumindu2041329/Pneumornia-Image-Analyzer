import { CheckCircle, AlertTriangle, HelpCircle, Clock, Cpu } from 'lucide-react';
import type { DetectionStatus } from '../types';

interface ResultsDisplayProps {
  status: DetectionStatus;
  confidence: number;
  processingTime: number;
  modelVersion: string;
  notes?: string;
}

export function ResultsDisplay({
  status,
  confidence,
  processingTime,
  modelVersion,
  notes,
}: ResultsDisplayProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'positive':
        return {
          icon: AlertTriangle,
          color: 'red',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          textColor: 'text-red-900',
          title: 'Pneumonia Detected',
          description: 'Abnormalities consistent with pneumonia have been identified.',
        };
      case 'negative':
        return {
          icon: CheckCircle,
          color: 'green',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          textColor: 'text-green-900',
          title: 'No Pneumonia Detected',
          description: 'No significant abnormalities detected in the X-ray.',
        };
      case 'inconclusive':
        return {
          icon: HelpCircle,
          color: 'yellow',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          textColor: 'text-yellow-900',
          title: 'Inconclusive Results',
          description: 'Analysis could not determine a definitive result.',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const getConfidenceColor = () => {
    if (confidence >= 80) return 'bg-green-500';
    if (confidence >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className={`${config.bgColor} border-b-2 ${config.borderColor} p-6`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 bg-white rounded-full shadow-md flex-shrink-0`}>
            <Icon className={`w-8 h-8 ${config.iconColor}`} />
          </div>
          <div className="flex-1">
            <h2 className={`text-2xl font-bold ${config.textColor} mb-1`}>
              {config.title}
            </h2>
            <p className={`text-sm ${config.textColor} opacity-80`}>
              {config.description}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Confidence Score
            </span>
            <span className="text-lg font-bold text-gray-900">
              {confidence.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full ${getConfidenceColor()} transition-all duration-500 ease-out`}
              style={{ width: `${confidence}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {confidence >= 80 && 'High confidence in the analysis'}
            {confidence >= 60 && confidence < 80 && 'Moderate confidence in the analysis'}
            {confidence < 60 && 'Lower confidence - consider additional imaging'}
          </p>
        </div>

        {notes && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              Analysis Notes
            </h3>
            <p className="text-sm text-blue-800 leading-relaxed">
              {notes}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Processing Time</p>
              <p className="text-sm font-semibold text-gray-900">
                {(processingTime / 1000).toFixed(2)}s
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Cpu className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Model Version</p>
              <p className="text-sm font-semibold text-gray-900">
                {modelVersion}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-xs text-amber-800">
            <strong>Important:</strong> This analysis is for educational and demonstration
            purposes only. Always consult with qualified healthcare professionals for
            medical diagnosis and treatment decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
