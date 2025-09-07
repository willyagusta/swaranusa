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
  const [success, setSuccess] = useState(null);
  const { user } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(null);

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
        setSuccess(data);
        // Reset form
        setFormData({ title: '', content: '' });
        
        // Redirect after showing success message
        setTimeout(() => {
          router.push('/dashboard?success=feedback-submitted');
        }, 5000);
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
            <span className="font-semibold text-emerald"> Each submission is automatically verified on the blockchain for transparency.</span>
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <strong>Feedback submitted successfully!</strong>
              </div>
              
              {success.blockchain?.verified && (
                <div className="mt-3 p-3 bg-green-100 rounded border">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold text-green-800">Blockchain Verified!</span>
                  </div>
                  <p className="text-sm text-green-700 mb-2">
                    Your feedback has been permanently recorded on the blockchain for transparency and immutability.
                  </p>
                  <div className="text-xs text-green-600">
                    <p><strong>Transaction Hash:</strong> {success.blockchain.transactionHash}</p>
                    <a 
                      href={success.blockchain.verificationUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-800 underline"
                    >
                      View on Blockchain Explorer →
                    </a>
                  </div>
                </div>
              )}
              
              <p className="text-sm mt-2">Redirecting to dashboard in 5 seconds...</p>
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            <div className="bg-emerald/5 border border-emerald/20 rounded-lg p-4">
              <h3 className="font-semibold text-emerald mb-2">What happens next?</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• AI will analyze and clean your complaint</li>
                <li>• Automatically categorize by topic (infrastructure, safety, etc.)</li>
                <li>• Cluster with similar complaints from other citizens</li>
                <li>• Generate a professional document</li>
                <li>• <strong className="text-emerald">Create blockchain verification for transparency</strong></li>
                <li>• Provide you with a permanent verification link</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald hover:bg-sage text-white px-6 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing & Verifying...
                </div>
              ) : (
                'Submit Complaint'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
