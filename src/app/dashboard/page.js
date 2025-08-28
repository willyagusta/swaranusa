'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald/5 via-white to-sage/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald/30 border-t-emerald rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald/5 via-white to-sage/10">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-onyx">PublishPro™</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                Welcome, {user.firstName} {user.lastName}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-onyx mb-4">
            Welcome to Your Dashboard
          </h2>
          <p className="text-xl text-gray-600">
            Start creating amazing financial content with AI
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 border border-gray-100 shadow-lg">
            <div className="w-12 h-12 bg-emerald rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-onyx mb-2">Content Creation</h3>
            <p className="text-gray-600 mb-4">Generate AI-powered financial content</p>
            <Link href="/content">
              <button className="bg-emerald hover:bg-sage text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Start Creating
              </button>
            </Link>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 border border-gray-100 shadow-lg">
            <div className="w-12 h-12 bg-copper rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-onyx mb-2">Distribution</h3>
            <p className="text-gray-600 mb-4">Manage and distribute your content</p>
            <Link href="/distribution">
              <button className="bg-copper hover:bg-brown text-white px-4 py-2 rounded-lg font-medium transition-colors">
                View Content
              </button>
            </Link>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 border border-gray-100 shadow-lg">
            <div className="w-12 h-12 bg-sage rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-onyx mb-2">Analytics</h3>
            <p className="text-gray-600 mb-4">Track your content performance</p>
            <Link href="/analytics">
              <button className="bg-sage hover:bg-emerald text-white px-4 py-2 rounded-lg font-medium transition-colors">
                View Analytics
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}



