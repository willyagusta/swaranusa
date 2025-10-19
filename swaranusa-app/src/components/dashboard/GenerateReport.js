'use client';

export default function GenerateReport({ dashboardData, generating, generateReport }) {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (item) => {
    if (item.report_status === 'no_report') {
      return (
        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
          ✨ Baru - Belum ada laporan
        </span>
      );
    } else if (item.report_status === 'new_feedbacks_available') {
      return (
        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
          🔄 {item.new_feedback_count} feedback baru tersedia
        </span>
      );
    } else {
      return (
        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
          ✓ Laporan sudah dibuat
        </span>
      );
    }
  };

  const canGenerateReport = (item) => {
    return item.report_status === 'no_report' || item.report_status === 'new_feedbacks_available';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Generate Report Section */}
      {dashboardData?.availableReports && dashboardData.availableReports.length > 0 ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Buat Laporan AI
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Pilih kombinasi kategori dan lokasi untuk membuat laporan otomatis dengan AI
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto">
            {dashboardData.availableReports.map((item, index) => (
              <div 
                key={index} 
                className={`flex justify-between items-center p-3 rounded-lg border transition-colors ${
                  canGenerateReport(item) 
                    ? 'bg-gray-50 border-gray-200 hover:bg-gray-100' 
                    : 'bg-gray-100 border-gray-300'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900">{item.category}</p>
                    {getStatusBadge(item)}
                  </div>
                  <p className="text-sm text-gray-600">{item.location_display}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.report_status === 'new_feedbacks_available' ? (
                      <>
                        Total: {item.feedback_count} feedback • 
                        <span className="font-semibold text-blue-600"> {item.new_feedback_count} baru</span> • 
                        {item.high_priority_count} prioritas tinggi
                      </>
                    ) : (
                      <>
                        {item.feedback_count} feedback • {item.high_priority_count} prioritas tinggi
                      </>
                    )}
                  </p>
                  {item.last_report_date && (
                    <p className="text-xs text-gray-400 mt-1">
                      Laporan terakhir: {formatDate(item.last_report_date)}
                    </p>
                  )}
                </div>
                <div className="ml-3">
                  {canGenerateReport(item) ? (
                    <button
                      onClick={() => generateReport(item.category, item.kota, item.kabupaten, item.provinsi)}
                      disabled={generating}
                      className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition-colors"
                    >
                      {generating ? 'Membuat...' : 
                       item.report_status === 'new_feedbacks_available' ? 'Buat Laporan Baru' : 'Buat Laporan'}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="bg-gray-300 text-gray-500 px-3 py-2 rounded-lg text-sm cursor-not-allowed whitespace-nowrap"
                      title="Laporan sudah dibuat. Tunggu feedback baru (minimal 3) untuk membuat laporan berikutnya."
                    >
                      Sudah Dibuat
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {generating && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">⏳ AI sedang membuat laporan...</span> Proses ini memerlukan waktu 2-3 menit. Silakan tunggu.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Kombinasi Tersedia</h3>
          <p className="text-gray-600">
            Tidak ada kombinasi kategori dan lokasi yang memiliki cukup feedback untuk membuat laporan.
            <br />
            Silakan tunggu hingga lebih banyak feedback masuk.
          </p>
        </div>
      )}
    {/* Info Banner */}
    <div className="bg-purple-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-purple-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <h3 className="font-semibold text-purple-900 mb-1">Tentang Pembuatan Laporan</h3>
            <p className="text-sm text-purple-800">
              • Laporan hanya bisa dibuat untuk kombinasi yang memiliki minimal 3 feedback<br />
              • Setelah laporan dibuat, Anda bisa membuat laporan baru ketika ada minimal 3 feedback baru<br />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}