import { clusteringService } from './ollama';

class GovernmentReportGenerator {
  async generateReport(feedbacks, category, location) {
    if (!feedbacks || feedbacks.length === 0) {
      throw new Error('No feedbacks provided for report generation');
    }

    // Analyze sentiment and urgency distribution
    const sentimentBreakdown = this.analyzeSentiment(feedbacks);
    const urgencyBreakdown = this.analyzeUrgency(feedbacks);
    
    // Extract key themes and issues
    const keyFindings = await this.extractKeyFindings(feedbacks);
    
    // Generate executive summary
    const executiveSummary = await this.generateExecutiveSummary(
      feedbacks, category, location, sentimentBreakdown, urgencyBreakdown
    );
    
    // Generate detailed report content
    const reportContent = await this.generateDetailedReport(
      feedbacks, category, location, keyFindings
    );
    
    // Generate recommendations
    const recommendations = await this.generateRecommendations(keyFindings, urgencyBreakdown);
    
    return {
      title: `${category} Issues Report - ${location}`,
      category,
      location,
      reportContent,
      executiveSummary,
      keyFindings,
      recommendations,
      feedbackIds: feedbacks.map(f => f.id),
      totalFeedbacks: feedbacks.length,
      sentimentBreakdown,
      urgencyBreakdown,
      status: 'draft'
    };
  }

  analyzeSentiment(feedbacks) {
    const breakdown = { positive: 0, negative: 0, neutral: 0 };
    feedbacks.forEach(feedback => {
      const sentiment = feedback.sentiment || 'neutral';
      breakdown[sentiment] = (breakdown[sentiment] || 0) + 1;
    });
    return breakdown;
  }

  analyzeUrgency(feedbacks) {
    const breakdown = { low: 0, medium: 0, high: 0 };
    feedbacks.forEach(feedback => {
      const urgency = feedback.urgency || 'medium';
      breakdown[urgency] = (breakdown[urgency] || 0) + 1;
    });
    return breakdown;
  }

  async extractKeyFindings(feedbacks) {
    const prompt = `
    Analyze the following citizen feedbacks and extract the top 5 key findings/issues. 
    Focus on recurring themes, common problems, and significant concerns.
    
    Feedbacks:
    ${feedbacks.map((f, i) => `${i + 1}. ${f.title}: ${f.content}`).join('\n\n')}
    
    Provide your response as a JSON array of strings, each representing a key finding.
    Example: ["Infrastructure issues with roads", "Lack of public transportation", ...]
    `;

    try {
      const response = await clusteringService.generateResponse(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error extracting key findings:', error);
      // Fallback: extract from titles and categories
      const commonIssues = this.extractCommonIssues(feedbacks);
      return commonIssues.slice(0, 5);
    }
  }

  async generateExecutiveSummary(feedbacks, category, location, sentimentBreakdown, urgencyBreakdown) {
    const prompt = `
    Generate a professional executive summary for a government report about ${category} issues in ${location}.
    
    Data:
    - Total feedbacks: ${feedbacks.length}
    - Sentiment: ${sentimentBreakdown.positive} positive, ${sentimentBreakdown.negative} negative, ${sentimentBreakdown.neutral} neutral
    - Urgency: ${urgencyBreakdown.high} high, ${urgencyBreakdown.medium} medium, ${urgencyBreakdown.low} low priority
    
    Sample feedbacks:
    ${feedbacks.slice(0, 3).map(f => `- ${f.title}: ${f.content.substring(0, 200)}...`).join('\n')}
    
    Write a concise, professional executive summary (2-3 paragraphs) suitable for government officials.
    `;

    try {
      return await clusteringService.generateResponse(prompt);
    } catch (error) {
      console.error('Error generating executive summary:', error);
      return `This report analyzes ${feedbacks.length} citizen feedbacks related to ${category} issues in ${location}. The feedback shows ${sentimentBreakdown.negative > sentimentBreakdown.positive ? 'significant concerns' : 'mixed reactions'} from citizens, with ${urgencyBreakdown.high} cases marked as high priority requiring immediate attention.`;
    }
  }

  async generateDetailedReport(feedbacks, category, location, keyFindings) {
    const prompt = `
    Generate a detailed, formal government report about ${category} issues in ${location}.
    
    Key Findings:
    ${keyFindings.map((finding, i) => `${i + 1}. ${finding}`).join('\n')}
    
    Based on ${feedbacks.length} citizen feedbacks, create a comprehensive report with:
    1. Introduction
    2. Methodology
    3. Detailed analysis of each key finding
    4. Data overview
    5. Conclusion
    
    Write in formal government report style, approximately 800-1000 words.
    `;

    try {
      return await clusteringService.generateResponse(prompt);
    } catch (error) {
      console.error('Error generating detailed report:', error);
      return this.generateFallbackReport(feedbacks, category, location, keyFindings);
    }
  }

  async generateRecommendations(keyFindings, urgencyBreakdown) {
    const prompt = `
    Based on these key findings from citizen feedback, generate 5-7 actionable recommendations for government action:
    
    Key Findings:
    ${keyFindings.map((finding, i) => `${i + 1}. ${finding}`).join('\n')}
    
    Urgency breakdown: ${urgencyBreakdown.high} high priority, ${urgencyBreakdown.medium} medium, ${urgencyBreakdown.low} low priority issues.
    
    Provide recommendations as a JSON array of objects with this format:
    [
      {
        "priority": "high|medium|low",
        "recommendation": "Specific actionable recommendation",
        "timeline": "Short-term|Medium-term|Long-term",
        "department": "Relevant government department"
      }
    ]
    `;

    try {
      const response = await clusteringService.generateResponse(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return this.generateFallbackRecommendations(keyFindings, urgencyBreakdown);
    }
  }

  extractCommonIssues(feedbacks) {
    const issues = {};
    feedbacks.forEach(feedback => {
      const words = feedback.title.toLowerCase().split(' ');
      words.forEach(word => {
        if (word.length > 3) {
          issues[word] = (issues[word] || 0) + 1;
        }
      });
    });
    
    return Object.entries(issues)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => `Issues related to ${word}`);
  }

  generateFallbackReport(feedbacks, category, location, keyFindings) {
    return `
# ${category} Issues Report - ${location}

## Introduction
This report analyzes ${feedbacks.length} citizen feedbacks submitted regarding ${category} issues in ${location}. The analysis was conducted using AI-powered clustering and sentiment analysis to identify key themes and concerns.

## Key Findings
${keyFindings.map((finding, i) => `${i + 1}. ${finding}`).join('\n')}

## Data Overview
The feedback collection period shows consistent citizen engagement with ${category} issues. Citizens have expressed various levels of concern, with detailed descriptions of their experiences and suggested improvements.

## Conclusion
The citizen feedback reveals important insights into ${category} issues in ${location}. Government attention and action are recommended to address the identified concerns and improve citizen satisfaction.
    `;
  }

  generateFallbackRecommendations(keyFindings, urgencyBreakdown) {
    return [
      {
        priority: urgencyBreakdown.high > 0 ? "high" : "medium",
        recommendation: "Conduct detailed investigation of reported issues",
        timeline: "Short-term",
        department: "Relevant Service Department"
      },
      {
        priority: "medium",
        recommendation: "Implement citizen feedback monitoring system",
        timeline: "Medium-term",
        department: "Administration"
      },
      {
        priority: "low",
        recommendation: "Regular community engagement sessions",
        timeline: "Long-term",
        department: "Community Relations"
      }
    ];
  }
}

export const reportGenerator = new GovernmentReportGenerator();
