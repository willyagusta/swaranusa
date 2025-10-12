'use client';

import Link from 'next/link';

export default function FeedbackCard({ feedback, formatDate }) {
  const currentDate = new Date();
  const demoDate = formatDate ? formatDate(currentDate.toISOString()) : 
    currentDate.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'numeric', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta'
    });
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-0 sm:flex-1 sm:mr-4">
          {feedback.title || "Sulit Mencari Pekerjaan"}
        </h3>
        {/* Date - moved to top on mobile */}
        <span className="text-gray-500 text-sm whitespace-nowrap order-first sm:order-last mb-1 sm:mb-0">
          {feedback.created_at ? formatDate(feedback.created_at) : demoDate}
        </span>
      </div>
      
      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {feedback.content || "Sulit mencari pekerjaan karena tempat usaha banyak yang tutup"}
      </p>
      
      {/* Tags - Stack on mobile, horizontal on desktop */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        {/* Location and Category */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-gray-600 px-2 py-1 rounded-full text-xs font-medium bg-gray-50 flex-shrink-0">
            📍 <span className="hidden xs:inline">{feedback.location || "Tidak Ada Lokasi"}</span>
            <span className="xs:hidden">Lokasi</span>
          </span>
          <span className="text-gray-600 px-2 py-1 rounded-full text-xs font-medium bg-gray-50 flex-shrink-0">
            🔖 <span className="hidden xs:inline">{feedback.category || "Tidak Terkategori"}</span>
            <span className="xs:hidden">Kategori</span>
          </span>
        </div>
        
        {/* Priority and Blockchain */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
              feedback.urgency === "high"
                ? "bg-red-100 text-red-800"
                : feedback.urgency === "medium"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            <span className="hidden xs:inline">Prioritas: </span>
            {feedback.urgency === "high"
              ? "Tinggi"
              : feedback.urgency === "medium"
              ? "Sedang"
              : "Sedang"}
          </span>
          {feedback.blockchain_verified !== false && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0">
              <span className="hidden xs:inline">Terverifikasi </span>
              <span className="xs:hidden">✓ </span>
              Blockchain
            </span>
          )}
        </div>
      </div>

      {/* Additional details */}
      {feedback.showDetails && (
        <>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="font-medium text-gray-700 block">Lokasi:</span>
                <p className="text-gray-600 capitalize mt-1">{feedback.location}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="font-medium text-gray-700 block">Kategori:</span>
                <p className="text-gray-600 capitalize mt-1">{feedback.category}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="font-medium text-gray-700 block">Prioritas:</span>
                <p className={`capitalize mt-1 font-medium ${
                  feedback.urgency === 'high' ? 'text-red-600' :
                  feedback.urgency === 'medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {feedback.urgency === 'high' ? 'Tinggi' : feedback.urgency === 'medium' ? 'Sedang' : 'Rendah'}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="font-medium text-gray-700 block">Dikirim:</span>
                <p className="text-gray-600 mt-1 text-xs sm:text-sm">{formatDate(feedback.created_at)}</p>
              </div>
            </div>

            {feedback.blockchain_verified && (
              <div className="flex flex-col sm:flex-row sm:items-center text-green-600 text-sm mb-4 bg-green-50 p-3 rounded-lg">
                <div className="flex items-center mb-2 sm:mb-0">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Terverifikasi di Blockchain</span>
                </div>
                {feedback.blockchain_hash && (
                  <Link 
                    href={`/verify?hash=${feedback.blockchain_hash}`}
                    className="sm:ml-4 text-blue-600 hover:text-blue-800 underline font-medium"
                  >
                    Lihat Bukti
                  </Link>
                )}
              </div>
            )}

            {feedback.status_updated_by_name && (
              <div className="border-t border-gray-200 pt-4 bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Status diperbarui oleh:</span>
                  <br className="sm:hidden" />
                  <span className="font-medium text-blue-700">
                    {feedback.status_updated_by_name} {feedback.status_updated_by_lastname}
                    {feedback.status_updated_by_department && (
                      <span className="block sm:inline"> - {feedback.status_updated_by_department}</span>
                    )}
                  </span>
                  {feedback.status_updated_at && (
                    <span className="block sm:inline text-gray-600"> pada {formatDate(feedback.status_updated_at)}</span>
                  )}
                </p>
                {feedback.status_note && (
                  <p className="text-sm text-gray-600 italic mt-2 bg-white p-2 rounded border-l-4 border-blue-300">
                    <span className="font-medium">Catatan:</span> {feedback.status_note}
                  </p>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}