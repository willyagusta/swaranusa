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
      title: `Laporan ${category} - ${location}`,
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

  // Improved JSON parsing with better error handling
  safeParseJSON(response, fallback = []) {
    try {
      // Clean the response - remove any markdown formatting
      let cleanResponse = response.trim();
      
      // Remove markdown code blocks if present
      cleanResponse = cleanResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Try to find JSON content if it's embedded in text
      const jsonMatch = cleanResponse.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanResponse = jsonMatch[0];
      }
      
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.warn('JSON parsing failed, using fallback:', error.message);
      return fallback;
    }
  }

  async extractKeyFindings(feedbacks) {
    const prompt = `
    Analisis feedback warga berikut dan ekstrak 5 temuan kunci/masalah utama. 
    Fokus pada tema berulang, masalah umum, dan kekhawatiran signifikan.
    
    Feedback:
    ${feedbacks.slice(0, 10).map((f, i) => `${i + 1}. ${f.title}: ${f.content.substring(0, 200)}`).join('\n\n')}
    
    Berikan respons sebagai array JSON berisi string, masing-masing mewakili temuan kunci.
    Format: ["Masalah infrastruktur jalan", "Kurangnya transportasi umum", ...]
    
    HANYA berikan array JSON, tidak ada teks tambahan.
    `;

    try {
      const response = await clusteringService.generateResponse(prompt);
      const parsed = this.safeParseJSON(response, []);
      
      // Validate that we got an array
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(0, 5);
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error extracting key findings:', error);
      // Fallback: extract from titles and categories
      return this.extractCommonIssues(feedbacks);
    }
  }

  async generateExecutiveSummary(feedbacks, category, location, sentimentBreakdown, urgencyBreakdown) {
    const prompt = `
    Buat ringkasan eksekutif profesional untuk laporan pemerintah tentang masalah ${category} di ${location}.
    
    Data:
    - Total feedback: ${feedbacks.length}
    - Sentimen: ${sentimentBreakdown.positive} positif, ${sentimentBreakdown.negative} negatif, ${sentimentBreakdown.neutral} netral
    - Urgensi: ${urgencyBreakdown.high} tinggi, ${urgencyBreakdown.medium} sedang, ${urgencyBreakdown.low} rendah
    
    Contoh feedback:
    ${feedbacks.slice(0, 3).map(f => `- ${f.title}: ${f.content.substring(0, 150)}...`).join('\n')}
    
    Tulis ringkasan eksekutif yang ringkas dan profesional (2-3 paragraf) yang cocok untuk pejabat pemerintah.
    Gunakan bahasa Indonesia formal.
    `;

    try {
      const response = await clusteringService.generateResponse(prompt);
      return response.trim();
    } catch (error) {
      console.error('Error generating executive summary:', error);
      return `Laporan ini menganalisis ${feedbacks.length} feedback warga terkait masalah ${category} di ${location}. Feedback menunjukkan ${sentimentBreakdown.negative > sentimentBreakdown.positive ? 'kekhawatiran signifikan' : 'reaksi beragam'} dari warga, dengan ${urgencyBreakdown.high} kasus ditandai sebagai prioritas tinggi yang memerlukan perhatian segera.

Analisis menunjukkan perlunya tindakan pemerintah untuk mengatasi masalah yang diidentifikasi dan meningkatkan kepuasan warga. Rekomendasi tindak lanjut disediakan berdasarkan temuan kunci dari feedback warga.`;
    }
  }

  async generateDetailedReport(feedbacks, category, location, keyFindings) {
    const prompt = `
    Buat laporan pemerintah formal dan detail tentang masalah ${category} di ${location}.
    
    Temuan Kunci:
    ${keyFindings.map((finding, i) => `${i + 1}. ${finding}`).join('\n')}
    
    Berdasarkan ${feedbacks.length} feedback warga, buat laporan komprehensif dengan:
    1. Pendahuluan
    2. Metodologi
    3. Analisis detail setiap temuan kunci
    4. Gambaran data
    5. Kesimpulan
    
    Tulis dalam gaya laporan pemerintah formal, sekitar 600-800 kata, dalam bahasa Indonesia.
    `;

    try {
      const response = await clusteringService.generateResponse(prompt);
      return response.trim();
    } catch (error) {
      console.error('Error generating detailed report:', error);
      return this.generateFallbackReport(feedbacks, category, location, keyFindings);
    }
  }

  async generateRecommendations(keyFindings, urgencyBreakdown) {
    const prompt = `
    Berdasarkan temuan kunci dari feedback warga ini, buat 5-7 rekomendasi yang dapat ditindaklanjuti untuk tindakan pemerintah:
    
    Temuan Kunci:
    ${keyFindings.map((finding, i) => `${i + 1}. ${finding}`).join('\n')}
    
    Breakdown urgensi: ${urgencyBreakdown.high} prioritas tinggi, ${urgencyBreakdown.medium} sedang, ${urgencyBreakdown.low} prioritas rendah.
    
    Berikan rekomendasi sebagai array JSON dengan format ini:
    [
      {
        "priority": "high",
        "recommendation": "Rekomendasi spesifik yang dapat ditindaklanjuti",
        "timeline": "Jangka pendek",
        "department": "Departemen pemerintah yang relevan"
      }
    ]
    
    HANYA berikan array JSON, tidak ada teks tambahan.
    `;

    try {
      const response = await clusteringService.generateResponse(prompt);
      const parsed = this.safeParseJSON(response, []);
      
      // Validate that we got an array of objects with required fields
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].recommendation) {
        return parsed.slice(0, 7);
      }
      
      throw new Error('Invalid recommendations format');
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return this.generateFallbackRecommendations(keyFindings, urgencyBreakdown);
    }
  }

  extractCommonIssues(feedbacks) {
    const issues = {};
    const commonWords = ['masalah', 'problem', 'issue', 'keluhan', 'complaint'];
    
    feedbacks.forEach(feedback => {
      const title = feedback.title.toLowerCase();
      const content = feedback.content.toLowerCase();
      const text = `${title} ${content}`;
      
      // Extract meaningful phrases
      const words = text.split(/\s+/);
      words.forEach((word, index) => {
        if (word.length > 4 && !commonWords.includes(word)) {
          // Try to capture 2-word phrases for better context
          const phrase = index < words.length - 1 ? `${word} ${words[index + 1]}` : word;
          issues[phrase] = (issues[phrase] || 0) + 1;
        }
      });
    });
    
    return Object.entries(issues)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([phrase]) => `Masalah terkait ${phrase}`);
  }

  generateFallbackReport(feedbacks, category, location, keyFindings) {
    return `
LAPORAN ${category.toUpperCase()} - ${location.toUpperCase()}

PENDAHULUAN
Laporan ini menganalisis ${feedbacks.length} feedback warga yang disampaikan mengenai masalah ${category} di ${location}. Analisis dilakukan menggunakan sistem clustering dan analisis sentimen berbasis AI untuk mengidentifikasi tema dan kekhawatiran utama.

TEMUAN KUNCI
${keyFindings.map((finding, i) => `${i + 1}. ${finding}`).join('\n')}

GAMBARAN DATA
Periode pengumpulan feedback menunjukkan keterlibatan warga yang konsisten terhadap masalah ${category}. Warga telah menyampaikan berbagai tingkat kekhawatiran, dengan deskripsi rinci tentang pengalaman mereka dan saran perbaikan.

METODOLOGI
Data feedback dikumpulkan melalui platform digital dan dianalisis menggunakan teknologi AI untuk mengidentifikasi pola, sentimen, dan tingkat urgensi. Setiap feedback diverifikasi menggunakan teknologi blockchain untuk memastikan integritas data.

KESIMPULAN
Feedback warga mengungkapkan wawasan penting tentang masalah ${category} di ${location}. Perhatian dan tindakan pemerintah direkomendasikan untuk mengatasi kekhawatiran yang teridentifikasi dan meningkatkan kepuasan warga.

REKOMENDASI TINDAK LANJUT
Berdasarkan analisis feedback, diperlukan koordinasi antar departemen terkait untuk menangani masalah yang telah diidentifikasi secara komprehensif dan berkelanjutan.
    `;
  }

  generateFallbackRecommendations(keyFindings, urgencyBreakdown) {
    return [
      {
        priority: urgencyBreakdown.high > 0 ? "high" : "medium",
        recommendation: "Melakukan investigasi mendalam terhadap masalah yang dilaporkan warga",
        timeline: "Jangka pendek",
        department: "Departemen Layanan Terkait"
      },
      {
        priority: "medium",
        recommendation: "Mengimplementasikan sistem monitoring feedback warga secara berkelanjutan",
        timeline: "Jangka menengah",
        department: "Bagian Administrasi"
      },
      {
        priority: "medium",
        recommendation: "Meningkatkan koordinasi antar departemen untuk penanganan masalah terintegrasi",
        timeline: "Jangka menengah",
        department: "Sekretariat Daerah"
      },
      {
        priority: "low",
        recommendation: "Mengadakan sesi keterlibatan masyarakat secara rutin",
        timeline: "Jangka panjang",
        department: "Hubungan Masyarakat"
      }
    ];
  }
}

export const reportGenerator = new GovernmentReportGenerator();
