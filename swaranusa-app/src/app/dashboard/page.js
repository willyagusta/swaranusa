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

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-onyx mb-4">
            Your Citizen Advocacy Dashboard
          </h2>
          <p className="text-xl text-gray-600">
            Transform your complaints into professional documents that get results
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 border border-gray-100 shadow-lg">
            <div className="w-12 h-12 bg-emerald rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-onyx mb-2">Submit Feedback</h3>
            <p className="text-gray-600 mb-4">File a new citizen complaint and transform it into a professional document</p>
            <Link href="/submit-feedback">
              <button className="bg-emerald hover:bg-sage text-white px-4 py-2 rounded-lg font-medium transition-colors">
                New Complaint
              </button>
            </Link>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 border border-gray-100 shadow-lg">
            <div className="w-12 h-12 bg-copper rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-onyx mb-2">My Documents</h3>
            <p className="text-gray-600 mb-4">View and manage your processed complaint documents</p>
            <Link href="/my-documents">
              <button className="bg-copper hover:bg-brown text-white px-4 py-2 rounded-lg font-medium transition-colors">
                View Documents
              </button>
            </Link>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 border border-gray-100 shadow-lg">
            <div className="w-12 h-12 bg-sage rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-onyx mb-2">Verification</h3>
            <p className="text-gray-600 mb-4">Check blockchain verification status and share proof links</p>
            <Link href="/verification">
              <button className="bg-sage hover:bg-emerald text-white px-4 py-2 rounded-lg font-medium transition-colors">
                View Proofs
              </button>
            </Link>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 border border-gray-100 shadow-lg">
            <div className="w-12 h-12 bg-forest rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-onyx mb-2">AI Clusters</h3>
            <p className="text-gray-600 mb-4">View how similar complaints are grouped by AI</p>
            <Link href="/clusters">
              <button className="bg-forest hover:bg-jungle text-white px-4 py-2 rounded-lg font-medium transition-colors">
                View Clusters
              </button>
            </Link>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-onyx mb-6">Recent Activity</h3>
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 border border-gray-100 shadow-lg">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-600 mb-2">No complaints submitted yet</h4>
              <p className="text-gray-500 mb-6">Start by submitting your first citizen complaint to see your activity here.</p>
              <Link href="/submit-complaint">
                <button className="bg-emerald hover:bg-sage text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  Submit Your First Complaint
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid md:grid-cols-4 gap-6">
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 border border-gray-100 shadow-lg text-center">
            <div className="text-3xl font-bold text-emerald mb-2">0</div>
            <div className="text-gray-600">Complaints Submitted</div>
          </div>
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 border border-gray-100 shadow-lg text-center">
            <div className="text-3xl font-bold text-copper mb-2">0</div>
            <div className="text-gray-600">Documents Generated</div>
          </div>
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 border border-gray-100 shadow-lg text-center">
            <div className="text-3xl font-bold text-sage mb-2">0</div>
            <div className="text-gray-600">Blockchain Verified</div>
          </div>
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 border border-gray-100 shadow-lg text-center">
            <div className="text-3xl font-bold text-forest mb-2">0</div>
            <div className="text-gray-600">Community Upvotes</div>
          </div>
        </div>
      </div>
    </div>
  );
}



