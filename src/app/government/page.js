'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import RoleGuard from '@/components/RoleGuard';

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

function GovernmentDashboardContent() {
  const { user, loading } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && user) {
      fetchDashboardData();
      fetchReports();
    }
  }, [user, loading]);

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
      setError('Failed to load dashboard data');
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
        setError(data.error || 'Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Network error while fetching reports');
    }
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
      setError('Failed to generate report');
    } finally {
      setGenerating(false);
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

      addText(`Category: ${report.category}`, 12, true);
      addText(`Location: ${report.location}`, 12, true);
      addText(`Generated: ${formatDate(report.created_at)}`, 12);
      addText(`Total Feedbacks: ${report.total_feedbacks}`, 12);
      yPosition += 10;

      addText('EXECUTIVE SUMMARY', 14, true);
      addText(report.executive_summary, 11);
      yPosition += 10;

      addText('KEY FINDINGS', 14, true);
      // Safe JSON parsing with fallback
      const keyFindings = safeJSONParse(report.key_findings, []);
      keyFindings.forEach((finding, index) => {
        addText(`${index + 1}. ${finding}`, 11);
      });
      yPosition += 10;

      addText('RECOMMENDATIONS', 14, true);
      // Safe JSON parsing with fallback
      const recommendations = safeJSONParse(report.recommendations, []);
      recommendations.forEach((rec, index) => {
        addText(`${index + 1}. ${rec.recommendation || rec}`, 11, true);
        if (rec.priority && rec.timeline && rec.department) {
          addText(`   Priority: ${rec.priority} | Timeline: ${rec.timeline} | Department: ${rec.department}`, 10);
        }
        yPosition += 5;
      });

      yPosition += 10;
      addText('DATA ANALYSIS', 14, true);
      
      // Safe JSON parsing with fallback
      const sentiment = safeJSONParse(report.sentiment_breakdown, {});
      addText(`Sentiment Analysis: ${sentiment.positive || 0} Positive, ${sentiment.negative || 0} Negative, ${sentiment.neutral || 0} Neutral`, 11);
      
      // Safe JSON parsing with fallback
      const urgency = safeJSONParse(report.urgency_breakdown, {});
      addText(`Urgency Levels: ${urgency.high || 0} High, ${urgency.medium || 0} Medium, ${urgency.low || 0} Low`, 11);

      if (yPosition + 50 > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      
      addText('DETAILED REPORT', 14, true);
      addText(report.report_content, 10);

      pdf.save(`${report.category}_${report.location}_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  if (loading) {
    return (
      <div 
        className="flex justify-center items-center min-h-screen"
        suppressHydrationWarning={true}
      >
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Government Access Required</h1>
          <p className="mb-4">Please sign in with government credentials.</p>
          <Link href="/" className="bg-blue-500 text-white px-4 py-2 rounded">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center text-red-600">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gray-50"
      suppressHydrationWarning={true}
    >
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Government Dashboard</h1>
              <p className="text-gray-600">
                Welcome, {dashboardData?.user?.name} - {dashboardData?.user?.department}
              </p>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={() => {
                  document.getElementById('reports-section').scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                View Generated Reports
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Total Feedbacks</h3>
              <p className="text-3xl font-bold text-blue-600">{dashboardData.stats.total_feedbacks}</p>
              <p className="text-sm text-gray-500">Last 30 days</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">High Priority</h3>
              <p className="text-3xl font-bold text-red-600">{dashboardData.stats.high_urgency}</p>
              <p className="text-sm text-gray-500">Requires immediate attention</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Verified</h3>
              <p className="text-3xl font-bold text-green-600">{dashboardData.stats.verified_feedbacks}</p>
              <p className="text-sm text-gray-500">Blockchain verified</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Negative Sentiment</h3>
              <p className="text-3xl font-bold text-orange-600">{dashboardData.stats.negative_sentiment}</p>
              <p className="text-sm text-gray-500">Citizen dissatisfaction</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Reports */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Generate New Reports</h2>
              <p className="text-gray-600">Available category-location combinations</p>
            </div>
            <div className="p-6">
              {dashboardData?.availableReports?.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.availableReports.slice(0, 10).map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-semibold">{item.category} - {item.location}</p>
                        <p className="text-sm text-gray-600">
                          {item.feedback_count} feedbacks, {item.high_priority_count} high priority
                        </p>
                      </div>
                      <button
                        onClick={() => generateReport(item.category, item.location)}
                        disabled={generating}
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50"
                      >
                        {generating ? 'Generating...' : 'Generate Report'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No data available for report generation</p>
              )}
            </div>
          </div>

          {/* Recent High Priority Issues */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">High Priority Issues</h2>
              <p className="text-gray-600">Recent urgent citizen complaints</p>
            </div>
            <div className="p-6">
              {dashboardData?.recentHighPriority?.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.recentHighPriority.map((feedback) => (
                    <div key={feedback.id} className="p-3 bg-red-50 rounded border-l-4 border-red-500">
                      <p className="font-semibold">{feedback.title}</p>
                      <p className="text-sm text-gray-600">
                        {feedback.category} - {feedback.location}
                      </p>
                      <p className="text-xs text-gray-500">
                        By {feedback.first_name} {feedback.last_name} - {formatDate(feedback.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No high priority issues</p>
              )}
            </div>
          </div>
        </div>

        {/* Generated Reports */}
        <div id="reports-section" className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Generated Reports</h2>
            <p className="text-gray-600">Your AI-compiled government reports</p>
          </div>
          <div className="p-6">
            {reports.length > 0 ? (
              <div className="grid gap-4">
                {reports.map((report) => (
                  <div key={report.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold">{report.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {report.total_feedbacks} feedbacks analyzed
                        </p>
                        <p className="text-xs text-gray-500">
                          Generated on {formatDate(report.created_at)}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          View Report
                        </button>
                        <button
                          onClick={() => downloadReportAsPDF(report)}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                        >
                          Download PDF
                        </button>
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
                <h3 className="mt-2 text-sm font-medium text-gray-900">No reports generated yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Generate your first report using the combinations above
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Preview Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-screen overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedReport.title}</h2>
                  <p className="text-gray-600 mt-1">
                    {selectedReport.category} • {selectedReport.location} • {selectedReport.total_feedbacks} feedbacks
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => downloadReportAsPDF(selectedReport)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Download PDF</span>
                  </button>
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
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-8">
                {/* Report Metadata */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-gray-700">Generated:</span>
                      <p className="text-gray-600">{formatDate(selectedReport.created_at)}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Status:</span>
                      <p className="text-gray-600 capitalize">{selectedReport.status}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Category:</span>
                      <p className="text-gray-600 capitalize">{selectedReport.category}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Location:</span>
                      <p className="text-gray-600">{selectedReport.location}</p>
                    </div>
                  </div>
                </div>

                {/* Executive Summary */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 border-b pb-2">Executive Summary</h3>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{selectedReport.executive_summary}</p>
                  </div>
                </div>
                
                {/* Key Findings */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 border-b pb-2">Key Findings</h3>
                  <div className="space-y-2">
                    {safeJSONParse(selectedReport.key_findings, []).map((finding, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                        <span className="flex-shrink-0 w-6 h-6 bg-yellow-500 text-white text-sm font-bold rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                        <p className="text-gray-700">{finding}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Data Analysis */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 border-b pb-2">Data Analysis</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-3">Sentiment Analysis</h4>
                      {(() => {
                        const sentiment = safeJSONParse(selectedReport.sentiment_breakdown, {});
                        return (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-green-600">Positive:</span>
                              <span className="font-medium">{sentiment.positive || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-red-600">Negative:</span>
                              <span className="font-medium">{sentiment.negative || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Neutral:</span>
                              <span className="font-medium">{sentiment.neutral || 0}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-3">Urgency Levels</h4>
                      {(() => {
                        const urgency = safeJSONParse(selectedReport.urgency_breakdown, {});
                        return (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-red-600">High Priority:</span>
                              <span className="font-medium">{urgency.high || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-yellow-600">Medium Priority:</span>
                              <span className="font-medium">{urgency.medium || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-green-600">Low Priority:</span>
                              <span className="font-medium">{urgency.low || 0}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 border-b pb-2">Recommendations</h3>
                  <div className="space-y-4">
                    {safeJSONParse(selectedReport.recommendations, []).map((rec, index) => (
                      <div key={index} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                        <div className="flex items-start space-x-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-sm font-bold rounded-full flex items-center justify-center">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 mb-2">{rec.recommendation || rec}</p>
                            {rec.priority && rec.timeline && rec.department && (
                              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                <span className={`px-2 py-1 rounded ${
                                  rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                                  rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  Priority: {rec.priority}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                  Timeline: {rec.timeline}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                  Department: {rec.department}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Full Report */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 border-b pb-2">Detailed Report</h3>
                  <div className="prose max-w-none bg-white p-6 rounded-lg border">
                    <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                      {selectedReport.report_content}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Report ID: {selectedReport.id} • Generated on {formatDateTime(selectedReport.created_at)}
                </p>
                <button
                  onClick={() => downloadReportAsPDF(selectedReport)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download as PDF</span>
                </button>
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
      <GovernmentDashboardContent />
    </RoleGuard>
  );
}
