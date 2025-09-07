'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import RoleGuard from '@/components/RoleGuard';

function DashboardContent() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

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
              <h1 className="text-2xl font-bold text-onyx">Swaranusa</h1>
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-onyx mb-4">Citizen Dashboard</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your voice matters. Submit feedback, track your submissions, and help build a better community.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <Link href="/submit-feedback" className="group">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <div className="w-16 h-16 bg-emerald/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald/20 transition-colors">
                <svg className="w-8 h-8 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-onyx mb-4">Submit Feedback</h3>
              <p className="text-gray-600">
                Share your concerns and suggestions. Our AI will help transform them into professional reports.
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
              <h3 className="text-2xl font-bold text-onyx mb-4">View Clusters</h3>
              <p className="text-gray-600">
                Explore how your feedback is grouped with similar issues from other citizens.
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
              <h3 className="text-2xl font-bold text-onyx mb-4">Blockchain Verify</h3>
              <p className="text-gray-600">
                Verify that your feedback submissions are permanently recorded on the blockchain.
              </p>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 border border-gray-100 shadow-lg">
          <h3 className="text-2xl font-bold text-onyx mb-6">Recent Activity</h3>
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500 text-lg">No recent activity</p>
            <p className="text-gray-400">Start by submitting your first feedback!</p>
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
