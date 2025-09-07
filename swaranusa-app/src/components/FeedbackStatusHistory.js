'use client';

import { useState, useEffect } from 'react';

const STATUS_LABELS = {
  'belum_dilihat': 'Belum Dilihat',
  'dilihat': 'Dilihat', 
  'masuk_daftar_bahasan': 'Masuk Daftar Bahasan',
  'dirapatkan': 'Dirapatkan',
  'ditindak_lanjuti': 'Ditindak Lanjuti',
  'selesai': 'Selesai'
};

const STATUS_COLORS = {
  'belum_dilihat': 'bg-gray-100 text-gray-800',
  'dilihat': 'bg-blue-100 text-blue-800',
  'masuk_daftar_bahasan': 'bg-yellow-100 text-yellow-800',
  'dirapatkan': 'bg-orange-100 text-orange-800',
  'ditindak_lanjuti': 'bg-purple-100 text-purple-800',
  'selesai': 'bg-green-100 text-green-800'
};

export default function FeedbackStatusHistory({ feedbackId }) {
  const [statusHistory, setStatusHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatusHistory();
  }, [feedbackId, fetchStatusHistory]);

  const fetchStatusHistory = async () => {
    try {
      const response = await fetch(`/api/feedback/status?feedbackId=${feedbackId}`);
      const data = await response.json();

      if (response.ok) {
        setStatusHistory(data.statusHistory || []);
      } else {
        setError(data.error || 'Gagal memuat riwayat status');
      }
    } catch (error) {
      console.error('Error fetching status history:', error);
      setError('Terjadi kesalahan saat memuat riwayat status');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta'
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-16 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-sm">
        {error}
      </div>
    );
  }

  if (statusHistory.length === 0) {
    return (
      <div className="text-gray-500 text-sm">
        Belum ada riwayat perubahan status
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Riwayat Status</h4>
      
      <div className="space-y-3">
        {statusHistory.map((history, index) => (
          <div key={history.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {history.old_status && (
                  <>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[history.old_status]}`}>
                      {STATUS_LABELS[history.old_status]}
                    </span>
                    <span className="text-gray-400">→</span>
                  </>
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[history.new_status]}`}>
                  {STATUS_LABELS[history.new_status]}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {formatDate(history.created_at)}
              </span>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>
                Diubah oleh: <span className="font-medium">
                  {history.first_name} {history.last_name}
                  {history.department && ` - ${history.department}`}
                </span>
              </p>
              {history.note && (
                <p className="mt-1 italic">
                  Catatan: {history.note}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}