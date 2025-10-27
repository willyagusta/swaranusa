'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import RoleGuard from '@/components/RoleGuard';
import FeedbackStatusManager from '@/components/FeedbackStatusManager';
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard';
import GenerateReport from '@/components/dashboard/GenerateReport';

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
    'belum_dilihat': 'bg-purple-100 text-purple-800',
    'dilihat': 'bg-purple-100 text-purple-800',
    'masuk_daftar_bahasan': 'bg-purple-100 text-purple-800',
    'dirapatkan': 'bg-purple-100 text-purple-800',
    'ditindak_lanjuti': 'bg-purple-100 text-purple-800',
    'selesai': 'bg-purple-100 text-purple-800'
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
  const [generating, setGenerating] = useState(false); // ADD THIS LINE
  const [loading_feedbacks, setLoadingFeedbacks] = useState(false);
  const [error, setError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const generateReport = async (category, kota, kabupaten, provinsi) => {
    setGenerating(true);
    try {
      const response = await fetch('/api/government/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category, kota, kabupaten, provinsi }),
      });

      const data = await response.json();
      
      if (data.success) {
        setReports([data.report, ...reports]);
        setSelectedReport(data.report);
        alert('Laporan berhasil dibuat! Silakan cek tab "Laporan" untuk melihatnya.');
        // Optionally refresh dashboard data
        fetchDashboardData();
      } else {
        setError(data.error);
        alert('Gagal membuat laporan: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Gagal membuat laporan');
      alert('Gagal membuat laporan');
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
      const footerHeight = 70; // Reserve more space for footer
      let yPosition = margin;

      // Preload Swaranusa logo as data URL for footer branding
      let swaranusaLogoDataUrl = null;
      try {
        const resp = await fetch('/logosquare.png');
        const blob = await resp.blob();
        swaranusaLogoDataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.warn('Could not load Swaranusa logo for PDF footer:', e);
      }

      // Helper function to strip HTML tags and clean text
      const stripHTML = (html) => {
        if (!html) return '';
        return html
          .replace(/<br\s*\/?><br\s*\/?>/gi, '\n\n')
          .replace(/<br\s*\/?>/gi, '\n')  
          .replace(/<strong>(.*?)<\/strong>/gi, '$1')
          .replace(/<em>(.*?)<\/em>/gi, '$1')
          .replace(/<[^>]*>/g, '')
          .replace(/\n\n\n+/g, '\n\n')
          .replace(/^\s+|\s+$/g, '')
          .trim();
      };

      // Simple function to add text with automatic page breaks
      const addText = (text, fontSize = 12, isBold = false, leftMargin = margin, lineHeightFactor = 0.6, trailingSpacing = 3) => {
        if (!text) return;
        
        pdf.setFontSize(fontSize);
        pdf.setFont(undefined, isBold ? 'bold' : 'normal');

        const cleanText = stripHTML(text);
        if (!cleanText) return;
        
        const lines = pdf.splitTextToSize(cleanText, pageWidth - leftMargin - margin);
        const lineHeight = fontSize * lineHeightFactor; // line spacing factor
        
        let idx = 0;
        while (idx < lines.length) {
          const remainingSpace = (pageHeight - footerHeight) - yPosition;
          let maxLines = Math.floor(remainingSpace / lineHeight);
          if (maxLines < 1) {
            pdf.addPage();
            yPosition = margin;
            continue;
          }
          const end = Math.min(idx + maxLines, lines.length);
          const chunk = lines.slice(idx, end);
          pdf.text(chunk, leftMargin, yPosition);
          yPosition += chunk.length * lineHeight + trailingSpacing;
          idx = end;
        }
      };

      const addSpacing = (space = 5) => {
        yPosition += space;
      };

      // Render formatted HTML: collapse double breaks, bold headings, bullets with spacing, compact paragraphs
      const renderFormattedHtml = (html) => {
        if (!html) return;
        const normalized = html.replace(/<br><br>/gi, '<br>');
        const tokens = normalized.split(/<br>/i).map(t => t.trim());
        let paragraphBuffer = [];

        const flushParagraph = () => {
          if (paragraphBuffer.length === 0) return;
          const text = paragraphBuffer.join(' ');
          addText(text, 11);
          paragraphBuffer = [];
        };

        tokens.forEach((token) => {
          if (!token) return;
          // Heading line only
          const h = token.match(/^<strong>(.*?)<\/strong>\s*$/i);
          if (h) {
            // Flush previous paragraph before heading
            flushParagraph();
            addText(h[1], 12, true);
            return; // No spacing here; content should follow immediately
          }

          // Bullet line
          if (/^\d+\.\s/.test(token) || /^[-•]\s/.test(token)) {
            flushParagraph();
            const text = token.replace(/^\d+\.\s|^[-•]\s/, '').trim();
            addText(`• ${text}`, 11, false, margin + 6, 0.6, 1); // minimal spacing between bullets
            return;
          }

          // Normal line (part of a paragraph)
          paragraphBuffer.push(token);
        });

        // Flush last paragraph
        flushParagraph();
      };

      // Add section header with smart page breaking
      const addSectionHeader = (title, content, fontSize = 14) => {
        const titleHeight = fontSize * 0.6;
        const contentPreview = stripHTML(content).substring(0, 200); // First 200 chars
        const contentLines = pdf.splitTextToSize(contentPreview, pageWidth - 2 * margin);
        const minContentHeight = Math.min(contentLines.length * 11 * 0.6, 50); // At least some content
        const requiredSpace = titleHeight + minContentHeight + 10;
        if (yPosition + requiredSpace > pageHeight - footerHeight) {
          pdf.addPage();
          yPosition = margin;
        }
        
        addText(title, fontSize, true);
        // No spacing after header - content follows immediately
      };

      // === DOCUMENT HEADER ===
      addText('PEMERINTAH REPUBLIK INDONESIA', 14, true);
      addText(`PEMERINTAH PROVINSI ${report.provinsi?.toUpperCase() || 'DAERAH'}`, 12, true);
      if (report.kota || report.kabupaten) {
        addText(`${report.kota ? 'KOTA' : 'KABUPATEN'} ${(report.kota || report.kabupaten)?.toUpperCase()}`, 12, true);
      }
      addSpacing(10);
      
      // Divider line
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      addSpacing(12);
      
      // === REPORT TITLE ===
      addText(report.title, 18, true);
      addSpacing(15);

      // === METADATA ===
      addText(`Kategori: ${report.category}`, 11, true);
      addText(`Lokasi: ${report.location}`, 11, true);
      addText(`Dibuat pada: ${formatDate(report.created_at)}`, 10);
      addText(`Total Feedback Dianalisis: ${report.totalFeedbacks || report.total_feedbacks || 0}`, 10);
      
      // Statistics
      if (report.sentimentBreakdown || report.sentiment_breakdown) {
        const sentiment = report.sentimentBreakdown || report.sentiment_breakdown;
        addText(`Analisis Sentimen: Positif ${sentiment.positive || 0}, Negatif ${sentiment.negative || 0}, Netral ${sentiment.neutral || 0}`, 10);
      }
      
      if (report.urgencyBreakdown || report.urgency_breakdown) {
        const urgency = report.urgencyBreakdown || report.urgency_breakdown;
        addText(`Tingkat Urgensi: Tinggi ${urgency.high || 0}, Sedang ${urgency.medium || 0}, Rendah ${urgency.low || 0}`, 10);
      }
      
      addSpacing(12);

      // === EXECUTIVE SUMMARY ===
      if (report.executiveSummary || report.executive_summary) {
        const execSummary = report.executiveSummary || report.executive_summary;
        // Force start on a new page for executive summary section
        pdf.addPage();
        yPosition = margin;
        addSectionHeader('RINGKASAN EKSEKUTIF', execSummary);
        renderFormattedHtml(execSummary);
      }

      // === FULL REPORT CONTENT ===
      if (report.reportContent || report.report_content) {
        const reportContent = report.reportContent || report.report_content;
        addSectionHeader('LAPORAN LENGKAP', reportContent);
        renderFormattedHtml(reportContent);
      }

      // === KEY FINDINGS ===
      const keyFindings = report.keyFindings || report.key_findings;
      if (keyFindings && keyFindings.length > 0) {
        const findings = Array.isArray(keyFindings) ? keyFindings : safeJSONParse(keyFindings, []);
        
        if (findings.length > 0) {
          const findingsText = findings.map((finding, index) => `${index + 1}. ${finding}`).join('\n');
          addSectionHeader('TEMUAN KUNCI', findingsText);
          findings.forEach((finding) => {
            addText(`• ${finding}`, 11, false, margin + 6, 0.6, 1); // minimal spacing between bullets
          });
          addSpacing(4);
        }
      }

      // === RECOMMENDATIONS ===
      const recommendations = report.recommendations;
      if (recommendations && recommendations.length > 0) {
        const recs = Array.isArray(recommendations) ? recommendations : safeJSONParse(recommendations, []);
        
        if (recs.length > 0) {
          const recsText = recs.map((rec, index) => `${index + 1}. ${rec.recommendation || rec}`).join('\n');
          addSectionHeader('REKOMENDASI', recsText);
          
          recs.forEach((rec, index) => {
            const recText = rec.recommendation || rec;
            addText(`${index + 1}. ${recText}`, 11, true);
            
            // Add recommendation details
            if (rec.priority) {
              addText(`Prioritas: ${rec.priority}`, 10, false, margin + 15);
            }
            if (rec.timeline) {
              addText(`Timeline: ${rec.timeline}`, 10, false, margin + 15);
            }
            if (rec.department) {
              addText(`Departemen: ${rec.department}`, 10, false, margin + 15);
            }

            if (rec.success_indicators) {
              addText(`Indikator Keberhasilan: ${rec.success_indicators}`, 10, false, margin + 15);
            }
            
            addSpacing(8);
          });
        }
      }

      // === ADD FOOTER TO ALL PAGES ===
      const addFooterToAllPages = () => {
        const totalPages = pdf.internal.getNumberOfPages();
        
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          
          const footerY = pageHeight - 50;
          
          // Footer line
          pdf.setLineWidth(0.3);
          pdf.line(margin, footerY, pageWidth - margin, footerY);
          
          // Footer text
          pdf.setFontSize(9);
          pdf.setFont(undefined, 'normal');
          pdf.text('Laporan ini dibuat berdasarkan analisis feedback warga melalui Platform Swaranusa', margin, footerY + 8);
          pdf.text('dengan dukungan teknologi AI dan verifikasi blockchain untuk memastikan integritas data.', margin, footerY + 16);
          
          if (swaranusaLogoDataUrl) {
            try {
              pdf.addImage(swaranusaLogoDataUrl, 'PNG', pageWidth - margin - 16, footerY + 6, 12, 12);
            } catch (e) {
              pdf.setFontSize(12);
              pdf.setFont(undefined, 'bold');
              pdf.text('SWARANUSA', pageWidth - margin - 40, footerY + 12);
            }
          } else {
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'bold');
            pdf.text('SWARANUSA', pageWidth - margin - 40, footerY + 12);
          }
          
          // Page number
          pdf.setFontSize(8);
          pdf.setFont(undefined, 'normal');
          pdf.text(`Halaman ${i} dari ${totalPages}`, pageWidth - margin - 25, footerY + 25);
        }
      };

      addFooterToAllPages();

      // === SAVE PDF ===
      const now = new Date();
      const jakartaDate = now.toLocaleDateString('id-ID', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '-');
      
      pdf.save(`Laporan_${report.category}_${report.location}_${jakartaDate}.pdf`);
      
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
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="flex items-center space-x-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Dashboard Pemerintah</h1>
                <p className="text-sm sm:text-base text-gray-600 truncate">
                  <span className="hidden sm:inline">Selamat datang, </span>
                  {user.firstName} {user.lastName}
                  {user.department && (
                    <span className="hidden md:inline"> - {user.department}</span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2 sm:space-x-4">
              <button
                onClick={handleSignOut}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Keluar</span>
                <span className="sm:hidden">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'feedbacks', label: 'Feedback Warga' },
              { id: 'reports', label: 'Laporan' },
              { id: 'generate-report', label: 'Buat Laporan AI' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          
          {/* Mobile Navigation */}
          <div className={`lg:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
            <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-md hover:bg-gray-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <nav className="p-4 space-y-2">
                {[
                  { id: 'dashboard', label: 'Dashboard' },
                  { id: 'feedbacks', label: 'Feedback Warga' },
                  { id: 'reports', label: 'Laporan' },
                  { id: 'generate-report', label: 'Buat Laporan AI' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-red-50 text-red-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
          
          {/* Mobile Tab Indicator */}
          <div className="lg:hidden py-3">
            <div className="text-sm font-medium text-gray-900">
              {[
                { id: 'dashboard', label: 'Dashboard' },
                { id: 'feedbacks', label: 'Feedback Warga' },
                { id: 'reports', label: 'Laporan' }
              ].find(tab => tab.id === activeTab)?.label}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
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
          <AnalyticsDashboard user={user} />
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
                  <div className="w-8 h-8 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
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
                            <span>📍 {feedback.kota && feedback.kabupaten 
                              ? `${feedback.kota}, ${feedback.kabupaten}` 
                              : feedback.kota || feedback.kabupaten || feedback.location || 'Tidak disebutkan'
                            }</span>
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
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                            >
                              Lihat Laporan
                            </button>
                            <button
                              onClick={() => downloadReportAsPDF(report)}
                              className="bg-white border-red-600 border text-red-600 px-3 py-1 rounded text-sm hover:text-red-700 hover:border-red-700"
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

        {/* Generate Report Tab */}
        {activeTab === 'generate-report' && (
          <GenerateReport dashboardData={dashboardData} generating={generating} generateReport={generateReport} />
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
                    <p className="text-gray-600">
                      {selectedFeedback.kota && selectedFeedback.kabupaten 
                        ? `${selectedFeedback.kota}, ${selectedFeedback.kabupaten}` 
                        : selectedFeedback.kota || selectedFeedback.kabupaten || selectedFeedback.location || 'Tidak disebutkan'
                      }
                    </p>
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
                <div className="flex items-center space-x-4">
                  <img src="/logosquare.png" alt="Logo Swaranusa" className="h-12 w-max" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedReport.title}</h2>
                    <p className="text-gray-600 mt-1">
                      {selectedReport.category} • {selectedReport.location} • {selectedReport.total_feedbacks} feedback
                    </p>
                  </div>
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
                <h3><strong>RINGKASAN LAPORAN</strong></h3>
                <div dangerouslySetInnerHTML={{ __html: selectedReport.executive_summary }} />
                
                <div className="my-8"></div>
                
                <h3><strong>LAPORAN LENGKAP</strong></h3>
                <div dangerouslySetInnerHTML={{ __html: selectedReport.report_content }} />

                {/* Recommendations Section */}
                <div className="my-8"></div>
                <h3><strong>REKOMENDASI</strong></h3>
                {(() => {
                  let recs = selectedReport.recommendations;
                  if (!Array.isArray(recs)) {
                    recs = safeJSONParse(recs, []);
                  }
                  if (!recs || recs.length === 0) {
                    return <p className="text-gray-600">Tidak ada rekomendasi</p>;
                  }
                  return (
                    <ol className="list-decimal ml-6 space-y-3">
                      {recs.map((rec, idx) => (
                        <li key={idx}>
                          <p className="font-semibold">{rec.recommendation || rec}</p>
                          {(rec.priority || rec.timeline || rec.department || rec.budget_estimate || rec.success_indicators) && (
                            <div className="text-sm text-gray-700 mt-1 space-y-1">
                              {rec.priority && (<p><span className="font-medium">Prioritas:</span> {rec.priority}</p>)}
                              {rec.timeline && (<p><span className="font-medium">Timeline:</span> {rec.timeline}</p>)}
                              {rec.department && (<p><span className="font-medium">Departemen:</span> {rec.department}</p>)}
                              {rec.success_indicators && (<p><span className="font-medium">Indikator Keberhasilan:</span> {rec.success_indicators}</p>)}
                            </div>
                          )}
                        </li>
                      ))}
                    </ol>
                  );
                })()}
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
