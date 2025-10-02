import { useState, useEffect } from 'react';
import { History, Calendar, AlertTriangle, CheckCircle, HelpCircle, Trash2, Eye } from 'lucide-react';
import { storageService } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import type { DetectionStatus } from '../types';

interface HistoryRecord {
  id: string;
  file_name: string;
  upload_date: string;
  image_url: string;
  image_storage_path: string;
  detection_result?: {
    detection_status: DetectionStatus;
    confidence_score: number;
    analysis_date: string;
  };
}

interface AnalysisHistoryProps {
  onViewScan?: (imageUrl: string, result: any) => void;
  refreshTrigger?: number;
}

export function AnalysisHistory({ onViewScan, refreshTrigger }: AnalysisHistoryProps) {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const data = await storageService.getAnalysisHistory(user.id);
      setHistory(data as HistoryRecord[]);
    } catch (err) {
      setError('Failed to load analysis history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user, refreshTrigger]);

  const handleDelete = async (scanId: string, storagePath: string) => {
    if (!user || !confirm('Are you sure you want to delete this scan?')) return;

    try {
      setDeletingId(scanId);
      await storageService.deleteScan(scanId, user.id, storagePath);
      setHistory(prev => prev.filter(item => item.id !== scanId));
    } catch (err) {
      alert('Failed to delete scan');
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusIcon = (status: DetectionStatus) => {
    switch (status) {
      case 'positive':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'negative':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'inconclusive':
        return <HelpCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: DetectionStatus) => {
    switch (status) {
      case 'positive':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'negative':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inconclusive':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-red-600 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6 text-white" />
          <h2 className="text-xl font-bold text-white">Analysis History</h2>
        </div>
      </div>

      <div className="p-6">
        {history.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No analysis history yet</p>
            <p className="text-sm text-gray-500">
              Upload and analyze your first X-ray to get started
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((record) => (
              <div
                key={record.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {record.file_name}
                      </h3>
                      {record.detection_result && (
                        <div className={`
                          flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium
                          ${getStatusColor(record.detection_result.detection_status)}
                        `}>
                          {getStatusIcon(record.detection_result.detection_status)}
                          <span className="capitalize">
                            {record.detection_result.detection_status}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(record.upload_date)}</span>
                      </div>
                      {record.detection_result && (
                        <span className="font-medium">
                          {record.detection_result.confidence_score.toFixed(1)}% confidence
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {onViewScan && record.detection_result && (
                      <button
                        onClick={() => onViewScan(record.image_url, record.detection_result)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                        aria-label="View scan"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(record.id, record.image_storage_path)}
                      disabled={deletingId === record.id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                      aria-label="Delete scan"
                    >
                      {deletingId === record.id ? (
                        <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
