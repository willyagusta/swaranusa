'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import FeedbackCard from './FeedbackCard';

export default function MyFeedbacksTab({ user, refreshTrigger }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchAllFeedbacks();
    }
  }, [user, refreshTrigger]);

  const fetchAllFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/feedback/my-submissions?limit=50');
      const data = await response.json();

      if (response.ok) {
        // Add showDetails flag for detailed view
        const feedbacksWithDetails = (data.feedbacks || []).map(feedback => ({
          ...feedback,
          showDetails: true
        }));
        setFeedbacks(feedbacksWithDetails);
      } else {
        setError(data.error || 'Gagal memuat feedback');
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setError('Terjadi kesalahan saat memuat feedback');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
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
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Memuat masukan Anda...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Semua Masukan Saya</h2>
        <p className="text-gray-600">Lihat semua masukan yang telah Anda kirimkan dan status terkininya</p>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchAllFeedbacks}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-lg text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500 text-lg mb-2">Belum ada masukan yang dikirimkan</p>
          <p className="text-gray-400 mb-6">Mulai dengan mengirim masukan pertama Anda!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {feedbacks.map((feedback) => (
            <div key={feedback.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feedback.title}</h3>
                  <p className="text-gray-600 mb-4">{feedback.content}</p>
                </div>
                <span className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${feedback.statusColor || 'bg-yellow-100 text-yellow-800'}`}>
                  {feedback.statusLabel || 'Diproses'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Lokasi:</span>
                  <p className="text-gray-600 capitalize">{feedback.location}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Kategori:</span>
                  <p className="text-gray-600 capitalize">{feedback.category}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Prioritas:</span>
                  <p className={`capitalize ${
                    feedback.urgency === 'high' ? 'text-red-600' :
                    feedback.urgency === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {feedback.urgency === 'high' ? 'Tinggi' : feedback.urgency === 'medium' ? 'Sedang' : 'Rendah'}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Dikirim:</span>
                  <p className="text-gray-600">{formatDate(feedback.created_at)}</p>
                </div>
              </div>

              {feedback.blockchain_verified && (
                <div className="flex items-center text-green-600 text-sm mb-4">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Terverifikasi di Blockchain
                  {feedback.blockchain_hash && (
                    <Link 
                      href={`#verify-${feedback.blockchain_hash}`}
                      className="ml-2 text-blue-600 hover:text-blue-800 underline"
                      onClick={(e) => {
                        e.preventDefault();
                        // This will be handled by the parent dashboard to switch to verify tab
                        if (window.switchToVerifyTab) {
                          window.switchToVerifyTab(feedback.blockchain_hash);
                        }
                      }}
                    >
                      Lihat Bukti
                    </Link>
                  )}
                </div>
              )}

              {feedback.status_updated_by_name && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-600">
                    Status diperbarui oleh: <span className="font-medium">
                      {feedback.status_updated_by_name} {feedback.status_updated_by_lastname}
                      {feedback.status_updated_by_department && ` - ${feedback.status_updated_by_department}`}
                    </span>
                    {feedback.status_updated_at && (
                      <span> pada {formatDate(feedback.status_updated_at)}</span>
                    )}
                  </p>
                  {feedback.status_note && (
                    <p className="text-sm text-gray-600 italic mt-1">
                      Catatan: {feedback.status_note}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
