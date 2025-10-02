import { useState, useEffect } from 'react';
import { History, Calendar, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { storageService } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import type { AnalysisResult } from '../types';

interface AnalysisHistoryProps {
  onViewScan?: (imageUrl: string, result: any) => void;
  refreshTrigger?: number;
}

export function AnalysisHistory({ refreshTrigger }: AnalysisHistoryProps) {
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
      setHistory(data as unknown as HistoryRecord[]);
    } catch (err) {
      setError('Failed to load analysis history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  type HistoryRecord = AnalysisResult;

  useEffect(() => {
    fetchHistory();
  }, [user, refreshTrigger]);

  const handleDelete = async (analysisId: string) => {
    if (!user || !confirm('Are you sure you want to delete this analysis?')) return;

    try {
      setDeletingId(analysisId);
      await storageService.deleteAnalysis(analysisId);
      setHistory(prev => prev.filter(item => item.id !== analysisId));
    } catch (err) {
      alert('Failed to delete analysis');
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusIcon = (prediction: 'normal' | 'pneumonia') => {
    if (prediction === 'pneumonia') {
      return <AlertTriangle className="w-5 h-5 text-red-600" />;
    }
    return <CheckCircle className="w-5 h-5 text-green-600" />;
  };

  const getStatusColor = (prediction: 'normal' | 'pneumonia') => {
    if (prediction === 'pneumonia') {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    return 'bg-green-100 text-green-800 border-green-200';
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
      <div className="glass-card p-8">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6">
        <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6 text-white" />
          <h2 className="text-xl font-bold text-white">Analysis History</h2>
        </div>
      </div>

      <div className="p-6">
        {history.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-slate-400 mb-2">No analysis history yet</p>
            <p className="text-sm text-gray-500 dark:text-slate-500">
              Upload and analyze your first X-ray to get started
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((record) => (
              <div
                key={record.id}
                className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-500 transition bg-white/50 dark:bg-slate-800/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {record.fileName}
                      </h3>
                      <div className={`
                        flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium
                        ${getStatusColor(record.prediction)}
                      `}>
                        {getStatusIcon(record.prediction)}
                        <span className="capitalize">
                          {record.prediction}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(record.createdAt)}</span>
                      </div>
                      <span className="font-medium">
                        {(record.confidence * 100).toFixed(1)}% confidence
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(record.id)}
                      disabled={deletingId === record.id}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition disabled:opacity-50"
                      aria-label="Delete analysis"
                    >
                      {deletingId === record.id ? (
                        <div className="w-5 h-5 border-2 border-red-600 dark:border-red-400 border-t-transparent rounded-full animate-spin" />
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
