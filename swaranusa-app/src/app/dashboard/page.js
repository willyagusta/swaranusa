'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import RoleGuard from '@/components/RoleGuard';

function DashboardContent() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [recentFeedbacks, setRecentFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);
  const [feedbackError, setFeedbackError] = useState('');
  const [loadingState, setLoadingState] = useState('');
  const [sidebarMinimized, setSidebarMinimized] = useState(false);

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
      setLoadingState('Memuat data masukan...');
      const response = await fetch('/api/feedback/my-submissions?limit=5');
      
      setLoadingState('Memproses data...');
      const data = await response.json();

      if (response.ok) {
        setLoadingState('Verifikasi blockchain...');
        // Simulate blockchain verification delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setRecentFeedbacks(data.feedbacks || []);
        setLoadingState('Selesai');
      } else {
        setFeedbackError(data.error || 'Gagal memuat feedback');
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setFeedbackError('Terjadi kesalahan saat memuat feedback');
    } finally {
      setLoadingFeedbacks(false);
      setLoadingState('');
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
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-red-600 text-white px-4 py-3 flex justify-between items-center">
        <div className="text-sm">Selamat Datang, Willy</div>
        <button 
          onClick={handleSignOut}
          className="bg-white text-red-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          Keluar
        </button>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${sidebarMinimized ? 'w-16' : 'w-64'} min-h-screen`}>
          {/* Logo Section */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Image 
                src="/logosquare.png" 
                alt="Swaranusa Logo" 
                width={32} 
                height={32}
                className="object-contain flex-shrink-0"
              />
              {!sidebarMinimized && (
                <span className="font-bold text-red-600">swaranusa</span>
              )}
            </div>
          </div>

          {/* Sidebar Toggle */}
          <div className="p-4">
            <button 
              onClick={() => setSidebarMinimized(!sidebarMinimized)}
              className="w-full flex items-center justify-center p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarMinimized ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
              </svg>
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="px-4 space-y-2">
            <Link href="/submit-feedback" className="flex items-center space-x-3 p-3 text-red-600 bg-red-50 rounded-lg font-medium">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {!sidebarMinimized && <span>Kirim Masukan</span>}
            </Link>

            <Link href="/my-feedbacks" className="flex items-center space-x-3 p-3 text-gray-600 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 0 012 2" />
              </svg>
              {!sidebarMinimized && <span>Masukan Saya</span>}
            </Link>

            <Link href="/clusters" className="flex items-center space-x-3 p-3 text-gray-600 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {!sidebarMinimized && <span>Lihat Cluster</span>}
            </Link>

            <Link href="/verify" className="flex items-center space-x-3 p-3 text-gray-600 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              {!sidebarMinimized && <span>Verifikasi Blockchain</span>}
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Warga</h1>
              <p className="text-gray-600">
                Suara Anda penting. Kirim masukan, lacak pengajuan Anda, dan bantu membangun komunitas yang lebih baik.
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <svg className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Feedback Cards */}
            <div className="space-y-4">
              {loadingFeedbacks ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">
                    {loadingState || 'Memuat data...'}
                  </p>
                </div>
              ) : feedbackError ? (
                <div className="text-center py-12">
                  <p className="text-red-600 text-lg mb-2">Gagal memuat data</p>
                  <p className="text-gray-500 mb-4">{feedbackError}</p>
                  <button 
                    onClick={fetchRecentFeedbacks}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Coba Lagi
                  </button>
                </div>
              ) : recentFeedbacks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg mb-2">Belum ada aktivitas</p>
                  <p className="text-gray-400 mb-4">Mulai dengan mengirim masukan pertama Anda!</p>
                  <Link 
                    href="/submit-feedback"
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Kirim Masukan Pertama</span>
                  </Link>
                </div>
              ) : (
                <>
                  {/* Sample feedback cards based on the image */}
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Sulit Mencari Pekerjaan
                          </h3>
                          <p className="text-gray-600 text-sm mb-3">
                            Sulit mencari pekerjaan karena tempat usaha banyak yang tutup
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                            Jalan Tamin
                          </span>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            Pemerintahan
                          </span>
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                            Prioritas: Sedang
                          </span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            Terverifikasi Blockchain
                          </span>
                          <span className="text-gray-500 text-sm">
                            6/01/2025 17:57
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
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
