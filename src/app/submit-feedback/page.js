'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function SubmitComplaint() {
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/dashboard?success=feedback-submitted');
      } else {
        setError(data.error || 'Failed to submit feedback');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!user) {
    return <div>Please sign in to submit feedback.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald/5 via-white to-sage/10">
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-onyx">Submit Complaint</h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-emerald transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 border border-gray-100 shadow-lg">
          <h2 className="text-3xl font-bold text-onyx mb-6">
            Submit Your Citizen Complaint
          </h2>
          <p className="text-gray-600 mb-8">
            Share your concerns and we'll transform them into a professional document. 
            Our AI will automatically categorize and cluster your feedback with similar issues.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Complaint Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald focus:border-transparent transition-all"
                placeholder="Brief title for your complaint..."
                required
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Your Complaint *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald focus:border-transparent transition-all resize-none"
                placeholder="Describe your issue in detail. Don't worry about formal language - our AI will clean it up and make it professional..."
                required
              />
            </div>

            <div className="bg-emerald/5 border border-emerald/20 rounded-lg p-4">
              <h3 className="font-semibold text-emerald mb-2">What happens next?</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• AI will analyze and clean your complaint</li>
                <li>• Automatically categorize by topic (infrastructure, safety, etc.)</li>
                <li>• Cluster with similar complaints from other citizens</li>
                <li>• Generate a professional document</li>
                <li>• Create blockchain verification</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald hover:bg-sage text-white px-6 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Processing...' : 'Submit Complaint'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
