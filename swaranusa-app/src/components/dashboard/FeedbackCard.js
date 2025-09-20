'use client';

import Link from 'next/link';

export default function FeedbackCard({ feedback, formatDate }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {feedback.title || "Sulit Mencari Pekerjaan"}
          </h3>
          <p className="text-gray-600 text-sm mb-3">
            {feedback.content || "Sulit mencari pekerjaan karena tempat usaha banyak yang tutup"}
          </p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
            {feedback.location || "Jalan Tamin"}
          </span>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            {feedback.category || "Pemerintahan"}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            feedback.urgency === 'high' 
              ? 'bg-red-100 text-red-800' 
              : feedback.urgency === 'medium'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
          }`}>
            Prioritas: {
              feedback.urgency === 'high' ? 'Tinggi' : 
              feedback.urgency === 'medium' ? 'Sedang' : 
              'Sedang'
            }
          </span>
          {feedback.blockchain_verified && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
              Terverifikasi Blockchain
            </span>
          )}
          <span className="text-gray-500 text-sm">
            {formatDate ? formatDate(feedback.created_at) : "6/01/2025 17:57"}
          </span>
        </div>
      </div>

      {/* Additional details for detailed view */}
      {feedback.showDetails && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Lokasi:</span>
              <p className="text-gray-600 capitalize">{feedback.location}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Kategori:</span>
              <p className="text-gray-600 capitalize">{feedback.category}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Prioritas:</span>
              <p className={`capitalize ${
                feedback.urgency === 'high' ? 'text-red-600' :
                feedback.urgency === 'medium' ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {feedback.urgency === 'high' ? 'Tinggi' : feedback.urgency === 'medium' ? 'Sedang' : 'Rendah'}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Dikirim:</span>
              <p className="text-gray-600">{formatDate(feedback.created_at)}</p>
            </div>
          </div>

          {feedback.blockchain_verified && (
            <div className="flex items-center text-green-600 text-sm mb-4">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Terverifikasi di Blockchain
              {feedback.blockchain_hash && (
                <Link 
                  href={`/verify?hash=${feedback.blockchain_hash}`}
                  className="ml-2 text-blue-600 hover:text-blue-800 underline"
                >
                  Lihat Bukti
                </Link>
              )}
            </div>
          )}

          {feedback.status_updated_by_name && (
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600">
                Status diperbarui oleh: <span className="font-medium">
                  {feedback.status_updated_by_name} {feedback.status_updated_by_lastname}
                  {feedback.status_updated_by_department && ` - ${feedback.status_updated_by_department}`}
                </span>
                {feedback.status_updated_at && (
                  <span> pada {formatDate(feedback.status_updated_at)}</span>
                )}
              </p>
              {feedback.status_note && (
                <p className="text-sm text-gray-600 italic mt-1">
                  Catatan: {feedback.status_note}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
