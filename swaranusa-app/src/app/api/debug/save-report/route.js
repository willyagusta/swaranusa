import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function GET() {
  try {
    // Use the report data from your test
    const reportData = {
      title: "infrastructure Issues Report - Jakarta",
      category: "infrastructure",
      location: "Jakarta",
      reportContent: "Test report content",
      executiveSummary: "Test executive summary",
      keyFindings: ["Issues related to street", "Issues related to traffic"],
      recommendations: [{"priority": "high", "recommendation": "Test recommendation"}],
      feedbackIds: [11, 10, 9],
      totalFeedbacks: 3,
      sentimentBreakdown: {"positive": 0, "negative": 2, "neutral": 1},
      urgencyBreakdown: {"low": 1, "medium": 1, "high": 1},
      status: "draft"
    };

    // Try to save to database
    const [newReport] = await sql`
      INSERT INTO government_reports (
        title, category, location, report_content, executive_summary,
        key_findings, recommendations, feedback_ids, total_feedbacks,
        sentiment_breakdown, urgency_breakdown, generated_by, status
      )
      VALUES (
        ${reportData.title},
        ${reportData.category},
        ${reportData.location},
        ${reportData.reportContent},
        ${reportData.executiveSummary},
        ${JSON.stringify(reportData.keyFindings)},
        ${JSON.stringify(reportData.recommendations)},
        ${JSON.stringify(reportData.feedbackIds)},
        ${reportData.totalFeedbacks},
        ${JSON.stringify(reportData.sentimentBreakdown)},
        ${JSON.stringify(reportData.urgencyBreakdown)},
        ${1}, -- Using user ID 1
        ${reportData.status}
      )
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      message: 'Report saved successfully',
      report: newReport
    });

  } catch (error) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
      message: "Database insert failed"
    }, { status: 500 });
  }
}
