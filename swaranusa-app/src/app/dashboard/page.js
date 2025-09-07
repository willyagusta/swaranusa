'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import RoleGuard from '@/components/RoleGuard';

function DashboardContent() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [recentFeedbacks, setRecentFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);
  const [feedbackError, setFeedbackError] = useState('');

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Fetch user's recent feedback submissions
  useEffect(() => {
    if (user) {
      fetchRecentFeedbacks();
    }
  }, [user]);

  const fetchRecentFeedbacks = async () => {
    try {
      const response = await fetch('/api/feedback/my-submissions?limit=5');
      const data = await response.json();

      if (response.ok) {
        setRecentFeedbacks(data.feedbacks || []);
      } else {
        setFeedbackError(data.error || 'Gagal memuat feedback');
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setFeedbackError('Terjadi kesalahan saat memuat feedback');
    } finally {
      setLoadingFeedbacks(false);
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

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald/5 via-white to-sage/10">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-onyx">Swaranusa</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                Selamat datang, {user.firstName} {user.lastName}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-onyx mb-4">Dashboard Warga</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Suara Anda penting. Kirim masukan, lacak pengajuan Anda, dan bantu membangun komunitas yang lebih baik.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Link href="/submit-feedback" className="group">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <div className="w-16 h-16 bg-emerald/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald/20 transition-colors">
                <svg className="w-8 h-8 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-onyx mb-4">Kirim Masukan</h3>
              <p className="text-gray-600">
                Bagikan kekhawatiran dan saran Anda. AI kami akan membantu mengubahnya menjadi laporan profesional.
              </p>
            </div>
          </Link>

          {/* My Feedbacks */}
          <Link href="/my-feedbacks" className="group">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-onyx mb-4">Masukan Saya</h3>
              <p className="text-gray-600">
                Lihat semua masukan yang telah Anda kirim dan pantau status penanganannya.
              </p>
            </div>
          </Link>

          <Link href="/clusters" className="group">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <div className="w-16 h-16 bg-sage/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-sage/20 transition-colors">
                <svg className="w-8 h-8 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-onyx mb-4">Lihat Cluster</h3>
              <p className="text-gray-600">
                Jelajahi bagaimana masukan Anda dikelompokkan dengan masalah serupa dari warga lain.
              </p>
            </div>
          </Link>

          <Link href="/verify" className="group">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <div className="w-16 h-16 bg-copper/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-copper/20 transition-colors">
                <svg className="w-8 h-8 text-copper" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-onyx mb-4">Verifikasi Blockchain</h3>
              <p className="text-gray-600">
                Verifikasi bahwa pengajuan masukan Anda tercatat secara permanen di blockchain.
              </p>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 border border-gray-100 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-onyx">Aktivitas Terkini</h3>
            {/* Additional CTA Button in the header */}
            {recentFeedbacks.length > 0 && (
              <Link 
                href="/my-feedbacks"
                className="bg-emerald hover:bg-sage text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span>Lihat Semua</span>
              </Link>
            )}
          </div>
          
          {loadingFeedbacks ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-emerald/30 border-t-emerald rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat data...</p>
            </div>
          ) : feedbackError ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-600 text-lg mb-2">Gagal memuat data</p>
              <p className="text-gray-500">{feedbackError}</p>
              <button 
                onClick={fetchRecentFeedbacks}
                className="mt-4 bg-emerald hover:bg-sage text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          ) : recentFeedbacks.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500 text-lg mb-2">Belum ada aktivitas</p>
              <p className="text-gray-400 mb-4">Mulai dengan mengirim masukan pertama Anda!</p>
              {/* CTA for empty state */}
              <Link 
                href="/submit-feedback"
                className="bg-emerald hover:bg-sage text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Kirim Masukan Pertama</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentFeedbacks.map((feedback) => (
                <div key={feedback.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{feedback.title}</h4>
                      <p className="text-gray-600 text-sm mb-3">{truncateText(feedback.content)}</p>
                    </div>
                    <div className="ml-4 flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${feedback.statusColor}`}>
                        {feedback.statusLabel}
                      </span>
                      {feedback.blockchain_verified && (
                        <div className="flex items-center text-green-600 text-xs">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Terverifikasi Blockchain
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span className="capitalize">📍 {feedback.location}</span>
                      <span className="capitalize">📂 {feedback.category}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        feedback.urgency === 'high' ? 'bg-red-100 text-red-700' :
                        feedback.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        Prioritas: {feedback.urgency === 'high' ? 'Tinggi' : feedback.urgency === 'medium' ? 'Sedang' : 'Rendah'}
                      </span>
                    </div>
                    <span>📅 {formatDate(feedback.created_at)}</span>
                  </div>

                  {/* Status Information */}
                  {feedback.status_updated_by_name && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Status diperbarui oleh: <span className="font-medium">
                          {feedback.status_updated_by_name} {feedback.status_updated_by_lastname}
                          {feedback.status_updated_by_department && ` - ${feedback.status_updated_by_department}`}
                        </span>
                        {feedback.status_updated_at && (
                          <span> pada {formatDate(feedback.status_updated_at)}</span>
                        )}
                      </p>
                      {feedback.status_note && (
                        <p className="text-xs text-gray-600 italic mt-1">
                          Catatan: {feedback.status_note}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Bottom CTA */}
              <div className="text-center pt-6 border-t border-gray-100">
                <Link 
                  href="/my-feedbacks" 
                  className="bg-emerald hover:bg-sage text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <span>Lihat Semua Masukan Saya</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <RoleGuard allowedRoles={['citizen', 'admin']}>
      <DashboardContent />
    </RoleGuard>
  );
}
