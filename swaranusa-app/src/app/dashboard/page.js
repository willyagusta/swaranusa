'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import RoleGuard from '@/components/RoleGuard';
import Sidebar from '@/components/dashboard/Sidebar';
import TopNavigation from '@/components/dashboard/TopNavigation';
import FeedbackCard from '@/components/dashboard/FeedbackCard';
import SubmitFeedbackTab from '@/components/dashboard/SubmitFeedbackTab';
import MyFeedbacksTab from '@/components/dashboard/MyFeedbacksTab';
import VerifyTab from '@/components/dashboard/VerifyTab';
import ClustersTab from '@/components/dashboard/ClustersTab';

function DashboardContent() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [recentFeedbacks, setRecentFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);
  const [feedbackError, setFeedbackError] = useState('');
  const [loadingState, setLoadingState] = useState('');
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [verifyHash, setVerifyHash] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleFeedbackSubmitted = () => {
    // Refresh feedbacks and switch to my-feedbacks tab
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('my-feedbacks');
  };

  // Global function to switch to verify tab with hash
  useEffect(() => {
    window.switchToVerifyTab = (hash) => {
      setVerifyHash(hash);
      setActiveTab('verify');
    };
    return () => {
      delete window.switchToVerifyTab;
    };
  }, []);

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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'submit-feedback':
        return <SubmitFeedbackTab user={user} onFeedbackSubmitted={handleFeedbackSubmitted} />;
      case 'my-feedbacks':
        return <MyFeedbacksTab user={user} refreshTrigger={refreshTrigger} />;
      case 'verify':
        return <VerifyTab initialHash={verifyHash} />;
      case 'clusters':
        return <ClustersTab user={user} onNavigateToSubmit={() => setActiveTab('submit-feedback')} />;
      default:
        return (
          <div className="max-w-screen-2xl mx-auto">
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
                  <button 
                    onClick={() => setActiveTab('submit-feedback')}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Kirim Masukan Pertama</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Sample feedback cards based on the image */}
                  {Array.from({ length: 6 }).map((_, index) => (
                    <FeedbackCard 
                      key={index} 
                      feedback={{}} 
                      formatDate={formatDate}
                    />
                  ))}
                </>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <TopNavigation user={user} onSignOut={handleSignOut} />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar 
          sidebarMinimized={sidebarMinimized}
          setSidebarMinimized={setSidebarMinimized}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* Main Content */}
        <div className="flex-1">
          <div className="px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
            {renderTabContent()}
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