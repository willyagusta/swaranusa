'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function GovernmentStatsTab({ user }) {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState('overview');

  useEffect(() => {
    fetchGovernmentStats();
  }, []);

  const fetchGovernmentStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/government/statistics');
      const data = await response.json();

      if (response.ok && data.success) {
        setStatsData(data.data);
      } else {
        setError(data.error || 'Gagal memuat statistik pemerintah');
      }
    } catch (error) {
      console.error('Error fetching government stats:', error);
      setError('Terjadi kesalahan saat memuat statistik pemerintah');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Belum ada aktivitas';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta'
    });
  };

  const getPartyLogo = (partyName) => {
    const partyLogos = {
      'PDI-P': '/party-logos/pdip.png',
      'Golkar': '/party-logos/golkar.png',
      'Gerindra': '/party-logos/gerindra.png',
      'PKB': '/party-logos/pkb.png',
      'Nasdem': '/party-logos/nasdem.png',
      'PKS': '/party-logos/pks.png',
      'PAN': '/party-logos/pan.png',
      'PPP': '/party-logos/ppp.png',
      'Demokrat': '/party-logos/demokrat.png',
      'PSI': '/party-logos/psi.png'
    };
    return partyLogos[partyName] || '/party-logos/default.svg';
  };

  const getStatusColor = (status) => {
    const colors = {
      'dilihat': 'bg-blue-100 text-blue-800',
      'masuk_daftar_bahasan': 'bg-yellow-100 text-yellow-800',
      'dirapatkan': 'bg-purple-100 text-purple-800',
      'ditindak_lanjuti': 'bg-orange-100 text-orange-800',
      'selesai': 'bg-green-100 text-green-800',
      'belum_dilihat': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Memuat statistik pemerintah...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchGovernmentStats}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Statistik Pemerintah</h2>
        <p className="text-sm sm:text-base text-gray-600">Lihat kinerja dan aktivitas pejabat pemerintah dalam menangani masukan warga</p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6 sm:mb-8">
        <nav className="flex space-x-4 sm:space-x-8 border-b border-gray-200 overflow-x-auto scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0">
          {[
            { id: 'overview', label: 'Ringkasan' },
            { id: 'parties', label: 'Partai Politik' },
            { id: 'departments', label: 'Departemen' },
            { id: 'individuals', label: 'Individual' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                activeView === tab.id
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeView === 'overview' && statsData && (
        <div className="space-y-8">
          {/* Overall Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-lg">
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">Total Pejabat</h3>
              <p className="text-2xl sm:text-3xl font-bold text-red-600">{statsData.overallStats.total_government_users || 0}</p>
              <p className="text-xs sm:text-sm text-gray-500">Pejabat pemerintah aktif</p>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-lg">
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">Partai Politik</h3>
              <p className="text-2xl sm:text-3xl font-bold text-red-600">{statsData.overallStats.total_political_parties || 0}</p>
              <p className="text-xs sm:text-sm text-gray-500">Partai yang terwakili</p>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-lg">
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">Laporan Dibaca</h3>
              <p className="text-2xl sm:text-3xl font-bold text-red-600">{statsData.overallStats.total_reports_read || 0}</p>
              <p className="text-xs sm:text-sm text-gray-500">Total laporan yang telah dibaca</p>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-lg">
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">Belum Dibaca</h3>
              <p className="text-2xl sm:text-3xl font-bold text-red-600">{statsData.overallStats.total_reports_unread || 0}</p>
              <p className="text-xs sm:text-sm text-gray-500">Laporan menunggu perhatian</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-lg">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Status Laporan</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg">
                <p className="text-xl sm:text-2xl font-bold text-purple-600">{statsData.overallStats.total_reports_read || 0}</p>
                <p className="text-xs sm:text-sm text-purple-700">Dilihat</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-yellow-50 rounded-lg">
                <p className="text-xl sm:text-2xl font-bold text-yellow-600">{statsData.overallStats.total_reports_in_discussion || 0}</p>
                <p className="text-xs sm:text-sm text-yellow-700">Masuk Pembahasan</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg col-span-2 sm:col-span-1">
                <p className="text-xl sm:text-2xl font-bold text-gray-600">{statsData.overallStats.total_reports_unread || 0}</p>
                <p className="text-xs sm:text-sm text-gray-700">Belum Dibaca</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Political Parties Tab */}
      {activeView === 'parties' && statsData && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-lg">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Statistik Partai Politik</h3>
            <div className="grid gap-4 sm:gap-6">
              {statsData.partyStats.map((party, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-4">
                  <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                      <Image
                        src={getPartyLogo(party.political_party)}
                        alt={party.political_party}
                        width={32}
                        height={32}
                        className="object-contain"
                        onError={(e) => {
                          e.target.src = '/party-logos/default.svg';
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{party.political_party}</h4>
                      <p className="text-xs sm:text-sm text-gray-600">{party.member_count} anggota</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center w-full sm:w-auto">
                    <div>
                      <p className="text-base sm:text-lg font-bold text-blue-600">{party.total_reports_read || 0}</p>
                      <p className="text-xs text-gray-500">Dibaca</p>
                    </div>
                    <div>
                      <p className="text-base sm:text-lg font-bold text-yellow-600">{party.total_reports_in_discussion || 0}</p>
                      <p className="text-xs text-gray-500">Pembahasan</p>
                    </div>
                    <div>
                      <p className="text-base sm:text-lg font-bold text-gray-600">{party.total_reports_unread || 0}</p>
                      <p className="text-xs text-gray-500">Belum Dibaca</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Departments Tab */}
      {activeView === 'departments' && statsData && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-lg">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Statistik Departemen</h3>
            <div className="grid gap-4">
              {statsData.departmentStats.map((dept, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-4">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{dept.department}</h4>
                    <p className="text-xs sm:text-sm text-gray-600">{dept.member_count} anggota</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-center w-full sm:w-auto">
                    <div>
                      <p className="text-base sm:text-lg font-bold text-blue-600">{dept.reports_read || 0}</p>
                      <p className="text-xs text-gray-500">Dibaca</p>
                    </div>
                    <div>
                      <p className="text-base sm:text-lg font-bold text-yellow-600">{dept.reports_in_discussion || 0}</p>
                      <p className="text-xs text-gray-500">Pembahasan</p>
                    </div>
                    <div>
                      <p className="text-base sm:text-lg font-bold text-gray-600">{dept.reports_unread || 0}</p>
                      <p className="text-xs text-gray-500">Belum Dibaca</p>
                    </div>
                    <div>
                      <p className="text-base sm:text-lg font-bold text-green-600">{dept.total_reports_handled || 0}</p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Individuals Tab */}
      {activeView === 'individuals' && statsData && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-lg">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Statistik Individual</h3>
            <div className="grid gap-4">
              {statsData.governmentStats.map((official, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between mb-4 gap-3">
                    <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                        {official.political_party && (
                          <Image
                            src={getPartyLogo(official.political_party)}
                            alt={official.political_party}
                            width={32}
                            height={32}
                            className="object-contain"
                            onError={(e) => {
                              e.target.src = '/party-logos/default.svg';
                            }}
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                          {official.first_name} {official.last_name}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600">{official.position}</p>
                        <p className="text-xs sm:text-sm text-gray-500">{official.department}</p>
                        {official.political_party && (
                          <p className="text-xs sm:text-sm text-red-600 font-medium">{official.political_party}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-left sm:text-right w-full sm:w-auto">
                      <p className="text-xs sm:text-sm text-gray-500">Aktivitas Terakhir</p>
                      <p className="text-xs sm:text-sm font-medium break-words">{formatDate(official.last_activity)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 text-center">
                    <div className="bg-purple-50 p-2 sm:p-3 rounded">
                      <p className="text-base sm:text-lg font-bold text-purple-600">{official.reports_read || 0}</p>
                      <p className="text-xs text-purple-700">Dibaca</p>
                    </div>
                    <div className="bg-purple-50 p-2 sm:p-3 rounded">
                      <p className="text-base sm:text-lg font-bold text-purple-600">{official.reports_in_discussion || 0}</p>
                      <p className="text-xs text-purple-700">Pembahasan</p>
                    </div>
                    <div className="bg-purple-50 p-2 sm:p-3 rounded">
                      <p className="text-base sm:text-lg font-bold text-purple-600">{official.reports_in_meeting || 0}</p>
                      <p className="text-xs text-purple-700">Rapat</p>
                    </div>
                    <div className="bg-purple-50 p-2 sm:p-3 rounded">
                      <p className="text-base sm:text-lg font-bold text-purple-600">{official.reports_followed_up || 0}</p>
                      <p className="text-xs text-purple-700">Tindak Lanjut</p>
                    </div>
                    <div className="bg-green-50 p-2 sm:p-3 rounded">
                      <p className="text-base sm:text-lg font-bold text-green-600">{official.reports_completed || 0}</p>
                      <p className="text-xs text-green-700">Selesai</p>
                    </div>
                    <div className="bg-gray-50 p-2 sm:p-3 rounded">
                      <p className="text-base sm:text-lg font-bold text-gray-600">{official.reports_unread || 0}</p>
                      <p className="text-xs text-gray-700">Belum Dibaca</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
