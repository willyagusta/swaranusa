'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ClusterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [cluster, setCluster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchClusterDetails();
    }
  }, [params.id]);

  const fetchClusterDetails = async () => {
    try {
      const response = await fetch(`/api/feedback/clusters/${params.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setCluster(data.cluster);
      } else {
        setError(data.error || 'Failed to fetch cluster details');
      }
    } catch (error) {
      console.error('Failed to fetch cluster details:', error);
      setError('Failed to fetch cluster details');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment >= 0.5) return 'text-green-600 bg-green-50';
    if (sentiment >= 0) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getSentimentLabel = (sentiment) => {
    if (sentiment >= 0.5) return 'Positif';
    if (sentiment >= 0) return 'Netral';
    return 'Negatif';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'resolved': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Menunggu';
      case 'in_progress': return 'Diproses';
      case 'resolved': return 'Selesai';
      case 'rejected': return 'Ditolak';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat detail cluster...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/dashboard">
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Kembali ke Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!cluster) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Cluster tidak ditemukan</h3>
          <Link href="/dashboard">
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Kembali ke Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-red-600 hover:text-red-700 mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Dashboard
          </Link>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{cluster.name}</h1>
                <p className="text-lg text-gray-600">{cluster.description}</p>
              </div>
              <div className="text-right">
                <span className="bg-red-50 text-red-600 px-4 py-2 rounded-full text-lg font-semibold">
                  {cluster.feedbackCount} masukan
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-1">Kategori</h3>
                <p className="text-purple-700">{cluster.category}</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-1">Sentimen Rata-rata</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(cluster.avgSentiment)}`}>
                  {getSentimentLabel(cluster.avgSentiment)} ({(cluster.avgSentiment * 100).toFixed(1)}%)
                </span>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-1">Dibuat</h3>
                <p className="text-purple-700">{formatDate(cluster.createdAt)}</p>
              </div>
            </div>

            {cluster.keywords && cluster.keywords.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Kata Kunci</h3>
                <div className="flex flex-wrap gap-2">
                  {cluster.keywords.map((keyword, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Feedbacks */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Masukan dalam Cluster Ini</h2>
          
          {cluster.feedbacks && cluster.feedbacks.length > 0 ? (
            <div className="space-y-6">
              {cluster.feedbacks.map((feedback) => (
                <div key={feedback.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{feedback.title}</h3>
                      <p className="text-gray-600 mb-3">{feedback.description}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(feedback.status)}`}>
                        {getStatusLabel(feedback.status)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(feedback.sentiment)}`}>
                        {getSentimentLabel(feedback.sentiment)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Kategori:</span> {feedback.category}
                    </div>
                    <div>
                      <span className="font-medium">Lokasi:</span> {feedback.location}
                    </div>
                    <div>
                      <span className="font-medium">Pengirim:</span> {feedback.userName || 'Anonim'}
                    </div>
                    <div>
                      <span className="font-medium">Tanggal:</span> {formatDate(feedback.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Tidak ada masukan</h3>
              <p className="text-gray-500">Cluster ini belum memiliki masukan yang terkait.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
