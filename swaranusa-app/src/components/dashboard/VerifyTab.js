'use client';

import { useState, useEffect } from 'react';

export default function VerifyTab({ initialHash = '' }) {
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputHash, setInputHash] = useState(initialHash);

  useEffect(() => {
    if (initialHash && initialHash !== inputHash) {
      setInputHash(initialHash);
      handleVerify(initialHash);
    }
  }, [initialHash]);

  const handleVerify = async (hash) => {
    if (!hash) return;
    
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Verifikasi Blockchain
        </h2>
        <p className="text-gray-600">
          Masukkan hash transaksi untuk memverifikasi bahwa masukan telah tercatat secara permanen di blockchain.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg">
        <div className="mb-6">
          <label htmlFor="hash" className="block text-sm font-medium text-gray-700 mb-2">
            Hash Transaksi
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="hash"
              value={inputHash}
              onChange={(e) => setInputHash(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              placeholder="0x..."
              disabled={loading}
            />
            <button
              onClick={() => handleVerify(inputHash)}
              disabled={loading || !inputHash}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                'Verifikasi'
              )}
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
                  <h3 className="text-xl font-bold text-green-800">✓ Terverifikasi di Blockchain</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Hash Transaksi:</span>
                    <p className="text-gray-600 break-all">{verificationData.transactionHash}</p>
                  </div>
                  
                  {verificationData.blockchainData?.blockNumber && (
                    <div>
                      <span className="font-semibold text-gray-700">Nomor Blok:</span>
                      <p className="text-gray-600">{verificationData.blockchainData.blockNumber}</p>
                    </div>
                  )}
                  
                  {verificationData.blockchainData?.blockTimestamp && (
                    <div>
                      <span className="font-semibold text-gray-700">Waktu Blok:</span>
                      <p className="text-gray-600">
                        {new Date(verificationData.blockchainData.blockTimestamp).toLocaleString('id-ID', {
                          timeZone: 'Asia/Jakarta'
                        })}
                      </p>
                    </div>
                  )}
                  
                  {verificationData.blockchainData?.gasUsed && (
                    <div>
                      <span className="font-semibold text-gray-700">Gas Terpakai:</span>
                      <p className="text-gray-600">{verificationData.blockchainData.gasUsed}</p>
                    </div>
                  )}
                </div>

                {verificationData.verificationUrl && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <a
                      href={verificationData.verificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-green-700 hover:text-green-900 font-medium"
                    >
                      Lihat di Blockchain Explorer
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <svg className="w-6 h-6 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-xl font-bold text-red-800">Verifikasi Gagal</h3>
                </div>
                <p className="text-red-700">
                  Transaksi ini tidak dapat diverifikasi di blockchain. Silakan periksa hash dan coba lagi.
                </p>
              </div>
            )}
          </div>
        )}

        {!verificationData && !loading && !error && (
          <div className="text-center py-8">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="text-gray-500">Masukkan hash transaksi untuk memulai verifikasi</p>
          </div>
        )}
      </div>
    </div>
  );
}
