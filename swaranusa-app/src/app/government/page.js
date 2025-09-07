'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import RoleGuard from '@/components/RoleGuard';
import FeedbackStatusManager from '@/components/FeedbackStatusManager';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
    timeZone: 'Asia/Jakarta'
  });
};

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta'
  });
};

// Create a safe JSON parser helper function
const safeJSONParse = (jsonString, fallback = null) => {
  try {
    return JSON.parse(jsonString || (Array.isArray(fallback) ? '[]' : '{}'));
  } catch (error) {
    console.warn('JSON parse error:', error, 'Input:', jsonString);
    return fallback;
  }
};

// Status color helper
const getStatusColor = (status) => {
  const statusColors = {
    'belum_dilihat': 'bg-gray-100 text-gray-800',
    'dilihat': 'bg-blue-100 text-blue-800',
    'masuk_daftar_bahasan': 'bg-yellow-100 text-yellow-800',
    'dirapatkan': 'bg-orange-100 text-orange-800',
    'ditindak_lanjuti': 'bg-purple-100 text-purple-800',
    'selesai': 'bg-green-100 text-green-800'
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

const getStatusLabel = (status) => {
  const statusLabels = {
    'belum_dilihat': 'Belum Dilihat',
    'dilihat': 'Dilihat',
    'masuk_daftar_bahasan': 'Masuk Daftar Bahasan',
    'dirapatkan': 'Dirapatkan',
    'ditindak_lanjuti': 'Ditindak Lanjuti',
    'selesai': 'Selesai'
  };
  return statusLabels[status] || 'Status Tidak Diketahui';
};

function GovernmentContent() {
  const { user, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, feedbacks, reports
  const [dashboardData, setDashboardData] = useState(null);
  const [reports, setReports] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [loading_feedbacks, setLoadingFeedbacks] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && user) {
      fetchDashboardData();
      fetchReports();
      if (activeTab === 'feedbacks') {
        fetchFeedbacks();
      }
    }
  }, [user, loading, activeTab]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/government/dashboard');
      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data);
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Gagal memuat data dashboard');
    }
  };

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/government/reports', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setReports(data.reports);
      } else {
        setError(data.error || 'Gagal mengambil laporan');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Kesalahan jaringan saat mengambil laporan');
    }
  };

  const fetchFeedbacks = async () => {
    setLoadingFeedbacks(true);
    try {
      const response = await fetch('/api/government/feedbacks');
      const data = await response.json();
      
      if (data.success) {
        setFeedbacks(data.feedbacks || []);
      } else {
        setError(data.error || 'Gagal mengambil feedback');
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setError('Kesalahan jaringan saat mengambil feedback');
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  const viewFeedback = async (feedbackId) => {
    try {
      const response = await fetch('/api/feedback/view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedbackId }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSelectedFeedback(data.feedback);
        // Refresh feedbacks to show updated status
        fetchFeedbacks();
      } else {
        alert(data.error || 'Gagal melihat feedback');
      }
    } catch (error) {
      console.error('Error viewing feedback:', error);
      alert('Terjadi kesalahan saat melihat feedback');
    }
  };

  // NEW: Function to view report and mark associated feedbacks as viewed
  const viewReport = async (report) => {
    try {
      // First, mark all associated feedbacks as viewed
      const response = await fetch('/api/government/reports/view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reportId: report.id }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log(`${data.updatedCount} feedback ditandai sebagai dilihat`);
        // Refresh feedbacks if we're on that tab
        if (activeTab === 'feedbacks') {
          fetchFeedbacks();
        }
      }
    } catch (error) {
      console.error('Error marking report feedbacks as viewed:', error);
    }

    // Then show the report
    setSelectedReport(report);
  };

  const generateReport = async (category, location) => {
    setGenerating(true);
    try {
      const response = await fetch('/api/government/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category, location }),
      });

      const data = await response.json();
      
      if (data.success) {
        setReports([data.report, ...reports]);
        setSelectedReport(data.report);
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Gagal membuat laporan');
    } finally {
      setGenerating(false);
    }
  };

  const updateReportFeedbackStatus = async (reportId, newStatus) => {
    try {
      const response = await fetch('/api/government/reports/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          reportId, 
          newStatus,
          note: `Status diubah melalui laporan ID ${reportId}`
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Status berhasil diubah untuk ${data.updatedCount} feedback`);
        // Refresh feedbacks to show updated status
        if (activeTab === 'feedbacks') {
          fetchFeedbacks();
        }
      } else {
        alert(data.error || 'Gagal mengubah status');
      }
    } catch (error) {
      console.error('Error updating report status:', error);
      alert('Terjadi kesalahan saat mengubah status');
    }
  };

  const downloadReportAsPDF = async (report) => {
    try {
      const jsPDF = (await import('jspdf')).default;
      
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 20;
      let yPosition = margin;

      const addText = (text, fontSize = 12, isBold = false) => {
        pdf.setFontSize(fontSize);
        if (isBold) {
          pdf.setFont(undefined, 'bold');
        } else {
          pdf.setFont(undefined, 'normal');
        }

        const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
        
        if (yPosition + (lines.length * fontSize * 0.5) > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.text(lines, margin, yPosition);
        yPosition += lines.length * fontSize * 0.5 + 5;
      };

      // PDF Content
      addText(report.title, 18, true);
      yPosition += 10;

      addText(`Kategori: ${report.category}`, 12, true);
      addText(`Lokasi: ${report.location}`, 12, true);
      addText(`Dibuat: ${formatDate(report.created_at)}`, 12);
      addText(`Total Feedback: ${report.total_feedbacks}`, 12);
      yPosition += 10;

      addText('RINGKASAN EKSEKUTIF', 14, true);
      addText(report.executive_summary, 11);
      yPosition += 10;

      addText('TEMUAN KUNCI', 14, true);
      const keyFindings = safeJSONParse(report.key_findings, []);
      keyFindings.forEach((finding, index) => {
        addText(`${index + 1}. ${finding}`, 11);
      });
      yPosition += 10;

      addText('REKOMENDASI', 14, true);
      const recommendations = safeJSONParse(report.recommendations, []);
      recommendations.forEach((rec, index) => {
        addText(`${index + 1}. ${rec.recommendation || rec}`, 11, true);
        if (rec.priority && rec.timeline && rec.department) {
          addText(`   Prioritas: ${rec.priority} | Timeline: ${rec.timeline} | Departemen: ${rec.department}`, 10);
        }
        yPosition += 5;
      });

      pdf.save(`Laporan_${report.category}_${report.location}_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Gagal membuat PDF. Silakan coba lagi.');
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Akses Pemerintah Diperlukan</h1>
          <p className="mb-4">Silakan masuk dengan kredensial pemerintah.</p>
          <Link href="/signin" className="bg-blue-500 text-white px-4 py-2 rounded">
            Masuk
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Pemerintah</h1>
              <p className="text-gray-600">
                Selamat datang, {user.firstName} {user.lastName}
                {user.department && ` - ${user.department}`}
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleSignOut}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'feedbacks', label: 'Feedback Warga', icon: '💬' },
              { id: 'reports', label: 'Laporan', icon: '📄' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
            <button 
              onClick={() => setError('')}
              className="ml-4 text-red-600 hover:text-red-800 underline"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            {/* Statistics Cards */}
            {dashboardData && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-700">Total Feedback</h3>
                  <p className="text-3xl font-bold text-blue-600">{dashboardData.stats?.total_feedbacks || 0}</p>
                  <p className="text-sm text-gray-500">30 hari terakhir</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-700">Prioritas Tinggi</h3>
                  <p className="text-3xl font-bold text-red-600">{dashboardData.stats?.high_urgency || 0}</p>
                  <p className="text-sm text-gray-500">Perlu perhatian segera</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-700">Terverifikasi</h3>
                  <p className="text-3xl font-bold text-green-600">{dashboardData.stats?.verified_feedbacks || 0}</p>
                  <p className="text-sm text-gray-500">Terverifikasi blockchain</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-700">Sentimen Negatif</h3>
                  <p className="text-3xl font-bold text-orange-600">{dashboardData.stats?.negative_sentiment || 0}</p>
                  <p className="text-sm text-gray-500">Ketidakpuasan warga</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Available Reports */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-bold">Buat Laporan Baru</h2>
                  <p className="text-gray-600">Kombinasi kategori-lokasi yang tersedia</p>
                </div>
                <div className="p-6">
                  {dashboardData?.availableReports?.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardData.availableReports.slice(0, 10).map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-semibold">{item.category} - {item.location}</p>
                            <p className="text-sm text-gray-600">
                              {item.feedback_count} feedback, {item.high_priority_count} prioritas tinggi
                            </p>
                          </div>
                          <button
                            onClick={() => generateReport(item.category, item.location)}
                            disabled={generating}
                            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50"
                          >
                            {generating ? 'Membuat...' : 'Buat Laporan'}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Tidak ada data untuk membuat laporan</p>
                  )}
                </div>
              </div>

              {/* Recent High Priority Issues */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-bold">Masalah Prioritas Tinggi</h2>
                  <p className="text-gray-600">Keluhan warga yang mendesak</p>
                </div>
                <div className="p-6">
                  {dashboardData?.recentHighPriority?.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardData.recentHighPriority.map((feedback) => (
                        <div key={feedback.id} className="p-3 bg-red-50 rounded border-l-4 border-red-500">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-semibold">{feedback.title}</p>
                              <p className="text-sm text-gray-600">
                                {feedback.category} - {feedback.location}
                              </p>
                              <p className="text-xs text-gray-500">
                                Oleh {feedback.first_name} {feedback.last_name} - {formatDate(feedback.created_at)}
                              </p>
                            </div>
                            <button
                              onClick={() => viewFeedback(feedback.id)}
                              className="ml-2 text-blue-600 hover:text-blue-800 text-sm underline"
                            >
                              Lihat
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Tidak ada masalah prioritas tinggi</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Feedbacks Tab */}
        {activeTab === 'feedbacks' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Semua Feedback Warga</h2>
              <p className="text-gray-600">Kelola dan ubah status feedback</p>
            </div>
            <div className="p-6">
              {loading_feedbacks ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Memuat feedback...</p>
                </div>
              ) : feedbacks.length > 0 ? (
                <div className="space-y-4">
                  {feedbacks.map((feedback) => (
                    <div key={feedback.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{feedback.title}</h3>
                          <p className="text-gray-600 mt-1">{feedback.content}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>📍 {feedback.location}</span>
                            <span>📂 {feedback.category}</span>
                            <span>👤 {feedback.submitter_first_name} {feedback.submitter_last_name}</span>
                            <span>📅 {formatDate(feedback.created_at)}</span>
                          </div>
                        </div>
                        <div className="ml-4 flex flex-col items-end space-y-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(feedback.status)}`}>
                            {getStatusLabel(feedback.status)}
                          </span>
                          <button
                            onClick={() => viewFeedback(feedback.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm underline"
                          >
                            Lihat Detail
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Tidak ada feedback</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Laporan yang Dibuat</h2>
              <p className="text-gray-600">Laporan pemerintah yang dikompilasi AI</p>
            </div>
            <div className="p-6">
              {reports.length > 0 ? (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{report.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {report.total_feedbacks} feedback dianalisis
                          </p>
                          <p className="text-xs text-gray-500">
                            Dibuat pada {formatDate(report.created_at)}
                          </p>
                        </div>
                        <div className="ml-4 flex flex-col space-y-2">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => viewReport(report)}
                              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                            >
                              Lihat Laporan
                            </button>
                            <button
                              onClick={() => downloadReportAsPDF(report)}
                              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                            >
                              Download PDF
                            </button>
                          </div>
                          
                          {/* Status Update Buttons for Report */}
                          <div className="flex flex-wrap gap-1">
                            {['masuk_daftar_bahasan', 'dirapatkan', 'ditindak_lanjuti', 'selesai'].map((status) => (
                              <button
                                key={status}
                                onClick={() => updateReportFeedbackStatus(report.id, status)}
                                className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)} hover:opacity-80`}
                              >
                                → {getStatusLabel(status)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada laporan</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Buat laporan pertama Anda menggunakan kombinasi di atas
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Feedback Detail Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-hidden flex flex-col">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">{selectedFeedback.title}</h2>
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Konten Feedback:</h3>
                  <p className="text-gray-700">{selectedFeedback.content}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Lokasi:</span>
                    <p className="text-gray-600">{selectedFeedback.location}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Kategori:</span>
                    <p className="text-gray-600">{selectedFeedback.category}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Prioritas:</span>
                    <p className="text-gray-600">{selectedFeedback.urgency}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Dikirim:</span>
                    <p className="text-gray-600">{formatDateTime(selectedFeedback.created_at)}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Kelola Status:</h3>
                  <FeedbackStatusManager
                    feedbackId={selectedFeedback.id}
                    currentStatus={selectedFeedback.status}
                    onStatusUpdate={(newStatus, updatedBy, note) => {
                      setSelectedFeedback({
                        ...selectedFeedback,
                        status: newStatus,
                        status_updated_by_name: updatedBy.split(' - ')[0].split(' ')[0],
                        status_updated_by_lastname: updatedBy.split(' - ')[0].split(' ')[1],
                        status_updated_by_department: updatedBy.split(' - ')[1],
                        status_note: note
                      });
                      fetchFeedbacks(); // Refresh the feedbacks list
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Preview Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-screen overflow-hidden flex flex-col">
            <div className="p-6 border-b bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedReport.title}</h2>
                  <p className="text-gray-600 mt-1">
                    {selectedReport.category} • {selectedReport.location} • {selectedReport.total_feedbacks} feedback
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose max-w-none">
                <h3>Ringkasan Eksekutif</h3>
                <p>{selectedReport.executive_summary}</p>
                <h3>Laporan Lengkap</h3>
                <div className="whitespace-pre-line">{selectedReport.report_content}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GovernmentDashboard() {
  return (
    <RoleGuard allowedRoles={['government', 'admin']}>
      <GovernmentContent />
    </RoleGuard>
  );
}
