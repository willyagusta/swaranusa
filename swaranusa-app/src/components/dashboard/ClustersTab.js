'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ClustersTab({ user, onNavigateToSubmit }) {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchClusters();
    }
  }, [user]);

  const fetchClusters = async () => {
    try {
      const response = await fetch('/api/feedback/clusters');
      const data = await response.json();
      if (response.ok) {
        setClusters(data.clusters);
      }
    } catch (error) {
      console.error('Failed to fetch clusters:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          AI-Clustered Citizen Feedback
        </h2>
        <p className="text-xl text-gray-600">
          Similar complaints are automatically grouped together to identify common issues
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat cluster...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clusters.map((cluster) => (
            <div key={cluster.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">{cluster.name}</h3>
                <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                  {cluster.feedbackCount} masukan
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{cluster.description}</p>
              
              <div className="mb-4">
                <span className="inline-block bg-blue-50 text-blue-600 px-2 py-1 rounded text-sm font-medium mb-2">
                  {cluster.category}
                </span>
              </div>
              
              {cluster.keywords && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {cluster.keywords.slice(0, 5).map((keyword, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
              
              <Link href={`/clusters/${cluster.id}`}>
                <button className="w-full bg-red-50 hover:bg-red-600 hover:text-white text-red-600 px-4 py-2 rounded-lg font-medium transition-all">
                  Lihat Detail
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}

      {!loading && clusters.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Belum ada cluster</h3>
          <p className="text-gray-500 mb-6">Kirim beberapa masukan untuk melihat pengelompokan AI yang canggih.</p>
          <button 
            onClick={onNavigateToSubmit}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Kirim Masukan Pertama
          </button>
        </div>
      )}
    </div>
  );
}
