'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function VerifyContent() {
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputHash, setInputHash] = useState('');
  
  const searchParams = useSearchParams();
  const hashFromUrl = searchParams.get('hash');

  const handleVerify = async (hash) => {
    setLoading(true);
    setError('');
    setVerificationData(null);

    try {
      const response = await fetch(`/api/feedback/verify?transactionHash=${hash}`);
      const data = await response.json();

      if (response.ok) {
        setVerificationData(data);
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-verify if hash is in URL
  useEffect(() => {
    if (hashFromUrl) {
      setInputHash(hashFromUrl);
      handleVerify(hashFromUrl);
    }
  }, [hashFromUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald/5 via-white to-sage/10">
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-onyx">Blockchain Verification</h1>
            <a href="/dashboard" className="text-gray-600 hover:text-emerald transition-colors">
              Back to Dashboard
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 border border-gray-100 shadow-lg">
          <h2 className="text-3xl font-bold text-onyx mb-6">
            Verify Feedback on Blockchain
          </h2>
          <p className="text-gray-600 mb-8">
            Enter a transaction hash to verify that a feedback submission exists permanently on the blockchain.
          </p>

          <div className="mb-6">
            <label htmlFor="hash" className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Hash
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="hash"
                value={inputHash}
                onChange={(e) => setInputHash(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald focus:border-transparent transition-all"
                placeholder="0x..."
                disabled={loading}
              />
              <button
                onClick={() => handleVerify(inputHash)}
                disabled={loading || !inputHash}
                className="bg-emerald hover:bg-sage text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {verificationData && (
            <div className="space-y-6">
              {verificationData.verified ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <svg className="w-6 h-6 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-xl font-bold text-green-800">✓ Verified on Blockchain</h3>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-gray-700">Transaction Hash:</span>
                      <p className="text-gray-600 break-all">{verificationData.transactionHash}</p>
                    </div>
                    
                    {verificationData.blockchainData.blockNumber && (
                      <div>
                        <span className="font-semibold text-gray-700">Block Number:</span>
                        <p className="text-gray-600">{verificationData.blockchainData.blockNumber}</p>
                      </div>
                    )}
                    
                    {verificationData.blockchainData.blockTimestamp && (
                      <div>
                        <span className="font-semibold text-gray-700">Block Timestamp:</span>
                        <p className="text-gray-600">
                          {new Date(verificationData.blockchainData.blockTimestamp).toLocaleString()}
                        </p>
                      </div>
                    )}
                    
                    {verificationData.blockchainData.gasUsed && (
                      <div>
                        <span className="font-semibold text-gray-700">Gas Used:</span>
                        <p className="text-gray-600">{verificationData.blockchainData.gasUsed}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-green-200">
                    <a
                      href={verificationData.verificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-green-700 hover:text-green-900 font-medium"
                    >
                      View on Blockchain Explorer
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <svg className="w-6 h-6 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-xl font-bold text-red-800">Verification Failed</h3>
                  </div>
                  <p className="text-red-700">
                    This transaction could not be verified on the blockchain. Please check the hash and try again.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald/5 via-white to-sage/10">
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-onyx">Blockchain Verification</h1>
            <a href="/dashboard" className="text-gray-600 hover:text-emerald transition-colors">
              Back to Dashboard
            </a>
          </div>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 border border-gray-100 shadow-lg">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-8"></div>
            <div className="h-12 bg-gray-200 rounded mb-6"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyContent />
    </Suspense>
  );
}