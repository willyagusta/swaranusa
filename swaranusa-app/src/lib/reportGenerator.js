import { clusteringService } from './ollama';

class GovernmentReportGenerator {
  async generateReport(feedbacks, category, kota, kabupaten, provinsi) {
    console.log('🚀 Starting report generation...');
    console.log(`📊 Parameters: category=${category}, kota=${kota}, kabupaten=${kabupaten}, provinsi=${provinsi}`);
    console.log(`📝 Total feedbacks to analyze: ${feedbacks?.length || 0}`);
    
    if (!feedbacks || feedbacks.length === 0) {
      console.error('❌ No feedbacks provided for report generation');
      throw new Error('No feedbacks provided for report generation');
    }

    const startTime = Date.now();

    try {
      // Analyze sentiment and urgency distribution
      console.log('📈 Step 1/5: Analyzing sentiment and urgency distribution...');
      const sentimentStart = Date.now();
      const sentimentBreakdown = this.analyzeSentiment(feedbacks);
      const urgencyBreakdown = this.analyzeUrgency(feedbacks);
      console.log(`✅ Sentiment & urgency analysis completed in ${Date.now() - sentimentStart}ms`);
      console.log(`📊 Sentiment: ${JSON.stringify(sentimentBreakdown)}`);
      console.log(`⚡ Urgency: ${JSON.stringify(urgencyBreakdown)}`);
      
      // Extract key themes and issues
      console.log('🔍 Step 2/5: Extracting key findings with AI...');
      const findingsStart = Date.now();
      const keyFindings = await this.extractKeyFindings(feedbacks, kota, kabupaten, provinsi);
      console.log(`✅ Key findings extracted in ${Date.now() - findingsStart}ms`);
      console.log(`🎯 Found ${keyFindings.length} key findings:`, keyFindings);
      
      // Generate executive summary
      console.log('📋 Step 3/5: Generating executive summary with AI...');
      const summaryStart = Date.now();
      const executiveSummary = await this.generateExecutiveSummary(
        feedbacks, category, kota, kabupaten, provinsi, sentimentBreakdown, urgencyBreakdown
      );
      console.log(`✅ Executive summary generated in ${Date.now() - summaryStart}ms`);
      console.log(`📄 Summary length: ${executiveSummary.length} characters`);
      
      // Generate detailed report content with letterhead
      console.log('📝 Step 4/5: Generating detailed report content with AI...');
      const reportStart = Date.now();
      const reportContent = await this.generateDetailedReport(
        feedbacks, category, kota, kabupaten, provinsi, keyFindings
      );
      console.log(`✅ Detailed report generated in ${Date.now() - reportStart}ms`);
      console.log(`📖 Report content length: ${reportContent.length} characters`);
      
      // Generate recommendations
      console.log('💡 Step 5/5: Generating recommendations with AI...');
      const recStart = Date.now();
      const recommendations = await this.generateRecommendations(keyFindings, urgencyBreakdown, kota, kabupaten, provinsi);
      console.log(`✅ Recommendations generated in ${Date.now() - recStart}ms`);
      console.log(`🎯 Generated ${recommendations.length} recommendations`);
      
      // Create location display string
      const locationDisplay = this.formatLocationDisplay(kota, kabupaten, provinsi);
      
      const totalTime = Date.now() - startTime;
      console.log(`🎉 Report generation completed successfully in ${totalTime}ms (${(totalTime/1000).toFixed(2)}s)`);
      console.log(`📊 Final report stats: ${feedbacks.length} feedbacks, ${keyFindings.length} findings, ${recommendations.length} recommendations`);
      
      return {
        title: `Laporan ${category.toUpperCase()} - ${locationDisplay}`,
        category,
        kota,
        kabupaten,
        provinsi,
        location: locationDisplay,
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
    } catch (error) {
      console.error('❌ Report generation failed:', error);
      console.error('🔍 Error details:', error.message);
      throw error;
    }
  }

  formatLocationDisplay(kota, kabupaten, provinsi) {
    if (kota && kabupaten && kota !== kabupaten) {
      return `${kota}, ${kabupaten}, ${provinsi}`;
    } else if (kota) {
      return `${kota}, ${provinsi}`;
    } else if (kabupaten) {
      return `${kabupaten}, ${provinsi}`;
    }
    return provinsi;
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

  async extractKeyFindings(feedbacks, kota, kabupaten, provinsi) {
    console.log('🔍 Extracting key findings from feedbacks...');
    const locationContext = this.formatLocationDisplay(kota, kabupaten, provinsi);
    
    const prompt = `
    Analyze the following citizen feedback and extract 5 key findings/main issues for the region ${locationContext}.
    Focus on recurring themes, common problems, and significant concerns specific to this area.
    Consider the geographical context and characteristics of ${kota ? `city/regency ${kota}` : `regency ${kabupaten}`} in ${provinsi} province.
    
    Citizen feedback:
    ${feedbacks.slice(0, 10).map((f, i) => `${i + 1}. ${f.title}: ${f.content.substring(0, 200)}`).join('\n\n')}
    
    Provide response as a JSON array containing strings, each representing a key finding relevant to local conditions.
    All findings must be written in Indonesian language.
    Format: ["Masalah infrastruktur jalan di wilayah perkotaan", "Kurangnya fasilitas kesehatan di daerah terpencil", ...]
    
    Respond with ONLY the JSON array, no additional text.
    `;

    try {
      console.log('🤖 Sending key findings request to AI...');
      const aiStart = Date.now();
      const response = await clusteringService.generateResponse(prompt);
      console.log(`🤖 AI response received in ${Date.now() - aiStart}ms`);
      console.log('📝 Raw AI response (first 200 chars):', response.substring(0, 200) + '...');
      
      const parsed = this.safeParseJSON(response, []);
      
      // Validate that we got an array
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log('✅ Successfully parsed key findings from AI response');
        return parsed.slice(0, 5);
      }
      
      console.warn('⚠️ Invalid AI response format, using fallback method');
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('❌ Error extracting key findings:', error.message);
      console.log('🔄 Falling back to common issues extraction...');
      // Fallback: extract from titles and categories
      return this.extractCommonIssues(feedbacks, locationContext);
    }
  }

  async generateExecutiveSummary(feedbacks, category, kota, kabupaten, provinsi, sentimentBreakdown, urgencyBreakdown) {
    console.log('📋 Generating executive summary...');
    const locationContext = this.formatLocationDisplay(kota, kabupaten, provinsi);
    
    const prompt = `
    Create a professional executive summary for a government report about ${category} issues in ${locationContext}.
    Consider the context of ${kota ? `city/regency ${kota}` : `regency ${kabupaten}`} within ${provinsi} province.
    
    Analysis data:
    - Total citizen feedback: ${feedbacks.length} reports
    - Sentiment distribution: ${sentimentBreakdown.positive} positive, ${sentimentBreakdown.negative} negative, ${sentimentBreakdown.neutral} neutral
    - Urgency levels: ${urgencyBreakdown.high} high priority, ${urgencyBreakdown.medium} medium priority, ${urgencyBreakdown.low} low priority
    
    Representative feedback examples:
    ${feedbacks.slice(0, 3).map(f => `- ${f.title}: ${f.content.substring(0, 150)}...`).join('\n')}
    
    Write a comprehensive executive summary (3-4 paragraphs) suitable for local government officials.
    Use formal Indonesian language and include geographical and demographic context of the region.
    Focus on impact on local community and urgency of government action.
    
    FORMATTING REQUIREMENTS:
    - DO NOT include any title or header (no "Ringkasan Eksekutif" or similar)
    - Start directly with the content
    - Use <br><br> for paragraph breaks
    - Use <strong></strong> for any important terms within the text
    - DO NOT use ** or any markdown formatting
    
    Write the entire summary in Indonesian language with proper HTML formatting.
    `;

    try {
      console.log('🤖 Sending executive summary request to AI...');
      const aiStart = Date.now();
      const response = await clusteringService.generateResponse(prompt);
      console.log(`🤖 Executive summary AI response received in ${Date.now() - aiStart}ms`);
      console.log('📝 Summary preview (first 150 chars):', response.substring(0, 150) + '...');
      
      // Clean up formatting
      const cleanedResponse = response.trim()
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>');
      
      return cleanedResponse;
    } catch (error) {
      console.error('❌ Error generating executive summary:', error.message);
      console.log('🔄 Using fallback executive summary...');
      return `Laporan ini menganalisis ${feedbacks.length} feedback warga terkait masalah ${category} di wilayah ${locationContext}. Feedback menunjukkan ${sentimentBreakdown.negative > sentimentBreakdown.positive ? 'kekhawatiran signifikan' : 'reaksi beragam'} dari masyarakat, dengan ${urgencyBreakdown.high} kasus ditandai sebagai prioritas tinggi yang memerlukan perhatian segera dari pemerintah daerah.<br><br>

Analisis menunjukkan perlunya koordinasi antara pemerintah ${kota ? `kota/kabupaten ${kota}` : `kabupaten ${kabupaten}`} dan pemerintah provinsi ${provinsi} untuk mengatasi masalah yang diidentifikasi. Karakteristik geografis dan demografis wilayah ${locationContext} menjadi faktor penting dalam merumuskan solusi yang tepat sasaran.<br><br>

Rekomendasi tindak lanjut yang spesifik untuk kondisi lokal disediakan berdasarkan temuan kunci dari aspirasi dan keluhan warga. Implementasi solusi memerlukan pendekatan yang mempertimbangkan keunikan wilayah dan kebutuhan masyarakat setempat.`;
    }
  }

  async generateDetailedReport(feedbacks, category, kota, kabupaten, provinsi, keyFindings) {
    console.log('📝 Generating detailed report content...');
    const locationContext = this.formatLocationDisplay(kota, kabupaten, provinsi);
    
    const prompt = `
    Create a formal and comprehensive government report about ${category} issues in ${locationContext}.
    This report is intended for local government of ${kota ? `city/regency ${kota}` : `regency ${kabupaten}`}, ${provinsi} province.
    
    IMPORTANT: This report is based on citizen feedback submissions through the Swaranusa digital platform, NOT interviews or surveys.
    
    Identified Key Findings:
    ${keyFindings.map((finding, i) => `${i + 1}. ${finding}`).join('\n')}
    
    Based on analysis of ${feedbacks.length} citizen feedback submissions through Swaranusa app, create a report with this structure:
    
    1. PENDAHULUAN
    2. PROFIL WILAYAH  
    3. ANALISIS TEMUAN
    4. GAMBARAN STATISTIK
    5. KESIMPULAN DAN IMPLIKASI
    
    CRITICAL FORMATTING RULES - FOLLOW EXACTLY:
    - For section titles, use: <br><br><strong>SECTION TITLE</strong><br>
    - For paragraph breaks within sections, use: <br><br>
    - For line breaks, use: <br>
    - NEVER use ** or *** or any markdown formatting
    - ONLY use HTML tags: <strong>, <br>, <em>
    - Each section starts with <br><br> before the title
    - Content follows immediately after the title with just <br> (no double break)
    
    Example format:
    <br><br><strong>PENDAHULUAN</strong><br>
    First paragraph content here.<br><br>
    Second paragraph content here.<br><br>
    
    <br><br><strong>PROFIL WILAYAH</strong><br>
    Content here.<br><br>
    
    Write in formal Indonesian language. DO NOT include letterhead or logo.
    Start directly with the first section (PENDAHULUAN).
    `;

    try {
      console.log('🤖 Sending detailed report request to AI...');
      const aiStart = Date.now();
      const response = await clusteringService.generateResponse(prompt);
      console.log(`🤖 Detailed report AI response received in ${Date.now() - aiStart}ms`);
      console.log('📖 Report preview (first 200 chars):', response.substring(0, 200) + '...');
      
      // cleanup of markdown formatting
      let cleanedResponse = response.trim()
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Replace **text** with <strong>text</strong>
        .replace(/\*(.*?)\*/g, '<em>$1</em>')              // Replace *text* with <em>text</em>
        .replace(/\n\n/g, '<br><br>')                       // Replace double newlines with <br><br>
        .replace(/\n/g, '<br>');                            // Replace single newlines with <br>
      
      console.log('🧹 Cleaned response preview (first 200 chars):', cleanedResponse.substring(0, 200) + '...');
      
      return cleanedResponse;
    } catch (error) {
      console.error('❌ Error generating detailed report:', error.message);
      console.log('🔄 Using fallback detailed report...');
      return this.generateFallbackReport(feedbacks, category, kota, kabupaten, provinsi, keyFindings);
    }
  }

  async generateRecommendations(keyFindings, urgencyBreakdown, kota, kabupaten, provinsi) {
    console.log('💡 Generating recommendations...');
    const locationContext = this.formatLocationDisplay(kota, kabupaten, provinsi);
    
    const prompt = `
    Based on key findings from citizen feedback, create 6-8 specific and actionable recommendations 
    for local government of ${kota ? `city/regency ${kota}` : `regency ${kabupaten}`}, ${provinsi} province.
    
    Key Findings:
    ${keyFindings.map((finding, i) => `${i + 1}. ${finding}`).join('\n')}
    
    Regional context: ${locationContext}
    Urgency distribution: ${urgencyBreakdown.high} high priority, ${urgencyBreakdown.medium} medium priority, ${urgencyBreakdown.low} low priority.
    
    Consider:
    - Geographic and demographic characteristics of the region
    - Capacity and authority of local government
    - Coordination with provincial government if needed
    - Realistic resources and budget
    - Practical implementation timeline
    
    Provide recommendations as JSON array with this format (all text in Indonesian):
    [
      {
        "priority": "high/medium/low",
        "recommendation": "Specific actionable recommendation with local context in Indonesian",
        "timeline": "Jangka pendek (1-6 bulan)/Jangka menengah (6-18 bulan)/Jangka panjang (1-3 tahun)",
        "department": "Relevant local government department/agency in Indonesian",
        "budget_estimate": "Budget requirement estimate in Indonesian",
        "success_indicators": "Measurable success indicators in Indonesian"
      }
    ]
    
    Respond with ONLY the JSON array, no additional text.
    `;

    try {
      console.log('🤖 Sending recommendations request to AI...');
      const aiStart = Date.now();
      const response = await clusteringService.generateResponse(prompt);
      console.log(`🤖 Recommendations AI response received in ${Date.now() - aiStart}ms`);
      console.log('📝 Raw recommendations response (first 300 chars):', response.substring(0, 300) + '...');
      
      const parsed = this.safeParseJSON(response, []);
      
      // Validate that we got an array of objects with required fields
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].recommendation) {
        console.log(`✅ Successfully parsed ${parsed.length} recommendations from AI response`);
        return parsed.slice(0, 8);
      }
      
      console.warn('⚠️ Invalid recommendations format, using fallback');
      throw new Error('Invalid recommendations format');
    } catch (error) {
      console.error('❌ Error generating recommendations:', error.message);
      console.log('🔄 Using fallback recommendations...');
      return this.generateFallbackRecommendations(keyFindings, urgencyBreakdown, kota, kabupaten, provinsi);
    }
  }

  extractCommonIssues(feedbacks, locationContext) {
    console.log('🔄 Extracting common issues using fallback method...');
    const issues = {};
    const commonWords = ['masalah', 'problem', 'issue', 'keluhan', 'complaint', 'dan', 'atau', 'yang', 'ini', 'itu'];
    
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
    
    const commonIssues = Object.entries(issues)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([phrase]) => `Masalah terkait ${phrase} di wilayah ${locationContext}`);
    
    console.log(`📊 Extracted ${commonIssues.length} common issues using fallback method`);
    return commonIssues;
  }

  generateFallbackReport(feedbacks, category, kota, kabupaten, provinsi, keyFindings) {
    console.log('🔄 Generating fallback report...');
    const locationContext = this.formatLocationDisplay(kota, kabupaten, provinsi);
    
    return `
<br><br><strong>PENDAHULUAN</strong><br>
Laporan ini menyajikan hasil analisis komprehensif terhadap ${feedbacks.length} feedback warga yang disampaikan melalui platform digital Swaranusa mengenai masalah ${category} di wilayah ${locationContext}. Platform Swaranusa merupakan sistem aspirasi dan pengaduan masyarakat yang memungkinkan warga untuk menyampaikan keluhan, saran, dan masukan secara digital dengan verifikasi blockchain untuk memastikan integritas dan akurasi data.<br><br>

Wilayah ${kota ? `kota/kabupaten ${kota}` : `kabupaten ${kabupaten}`} dalam provinsi ${provinsi} memiliki karakteristik geografis dan demografis yang unik, yang menjadi pertimbangan penting dalam analisis feedback warga yang masuk melalui aplikasi Swaranusa.<br><br>

<br><br><strong>PROFIL WILAYAH</strong><br>
${locationContext} merupakan bagian integral dari provinsi ${provinsi} dengan karakteristik sosial-ekonomi yang beragam. Feedback warga yang disampaikan melalui platform Swaranusa mencerminkan kebutuhan dan tantangan spesifik yang dihadapi masyarakat di wilayah ini dalam kategori ${category}.<br><br>

<br><br><strong>TEMUAN KUNCI</strong><br>
Berdasarkan analisis terhadap feedback warga melalui Swaranusa, ditemukan beberapa temuan kunci sebagai berikut:<br><br>
${keyFindings.map((finding, i) => `${i + 1}. ${finding}<br>`).join('')}<br><br>

<br><br><strong>ANALISIS TEMUAN</strong><br>
Feedback yang masuk melalui platform Swaranusa menunjukkan pola-pola tertentu yang mencerminkan kondisi riil di lapangan. Setiap feedback telah diverifikasi menggunakan teknologi blockchain untuk memastikan keaslian dan mencegah manipulasi data. Analisis dilakukan dengan menggunakan teknologi AI untuk mengidentifikasi pola, sentimen, dan tingkat urgensi dari setiap submission warga.<br><br>

<br><br><strong>GAMBARAN STATISTIK</strong><br>
Periode pengumpulan feedback melalui Swaranusa menunjukkan keterlibatan aktif warga ${locationContext} dalam menyampaikan aspirasi dan keluhan terkait ${category}. Platform digital ini memungkinkan warga untuk berpartisipasi dalam proses pembangunan dengan cara yang lebih mudah dan transparan. Distribusi feedback menunjukkan berbagai tingkat kekhawatiran dengan deskripsi rinci tentang pengalaman masyarakat dan usulan perbaikan.<br><br>

<br><br><strong>KESIMPULAN DAN IMPLIKASI</strong><br>
Feedback warga yang disampaikan melalui platform Swaranusa mengungkapkan wawasan penting tentang kondisi ${category} di ${locationContext}. Temuan ini menunjukkan perlunya koordinasi antara pemerintah ${kota ? `kota/kabupaten ${kota}` : `kabupaten ${kabupaten}`} dengan pemerintah provinsi ${provinsi} untuk mengatasi masalah yang teridentifikasi.<br><br>

Platform digital Swaranusa telah membuktikan efektivitasnya sebagai sarana komunikasi antara masyarakat dan pemerintah. Data yang terkumpul melalui aplikasi ini memberikan gambaran yang akurat tentang aspirasi warga dan dapat menjadi dasar untuk perumusan kebijakan yang lebih responsif terhadap kebutuhan masyarakat.
    `;
  }

  generateFallbackRecommendations(keyFindings, urgencyBreakdown, kota, kabupaten, provinsi) {
    console.log('🔄 Generating fallback recommendations...');
    const locationContext = this.formatLocationDisplay(kota, kabupaten, provinsi);
    
    const fallbackRecs = [
      {
        priority: urgencyBreakdown.high > 0 ? "high" : "medium",
        recommendation: `Melakukan investigasi mendalam dan survei lapangan terhadap masalah yang dilaporkan warga di ${locationContext}`,
        timeline: "Jangka pendek (1-3 bulan)",
        department: `Dinas terkait ${kota ? `Kota/Kabupaten ${kota}` : `Kabupaten ${kabupaten}`}`,
        budget_estimate: "Rp 50-100 juta",
        success_indicators: "Tersusunnya laporan investigasi dan pemetaan masalah"
      },
      {
        priority: "high",
        recommendation: `Mengimplementasikan sistem monitoring feedback warga secara berkelanjutan untuk wilayah ${locationContext}`,
        timeline: "Jangka menengah (6-12 bulan)",
        department: "Bagian Humas dan Komunikasi Publik",
        budget_estimate: "Rp 100-200 juta",
        success_indicators: "Sistem monitoring aktif dan responsif terhadap keluhan warga"
      },
      {
        priority: "medium",
        recommendation: `Meningkatkan koordinasi antara pemerintah ${kota ? `kota/kabupaten ${kota}` : `kabupaten ${kabupaten}`} dengan pemerintah provinsi ${provinsi}`,
        timeline: "Jangka menengah (6-18 bulan)",
        department: "Sekretariat Daerah",
        budget_estimate: "Rp 75-150 juta",
        success_indicators: "Terbentuknya mekanisme koordinasi rutin dan efektif"
      },
      {
        priority: "medium",
        recommendation: `Mengadakan forum dialog publik rutin dengan warga ${locationContext} untuk membahas isu-isu prioritas`,
        timeline: "Jangka pendek (1-6 bulan)",
        department: "Bagian Partisipasi Masyarakat",
        budget_estimate: "Rp 25-50 juta per tahun",
        success_indicators: "Terselenggaranya forum dialog minimal 4 kali per tahun"
      },
      {
        priority: "low",
        recommendation: `Mengembangkan program edukasi dan sosialisasi kebijakan pemerintah daerah kepada masyarakat ${locationContext}`,
        timeline: "Jangka panjang (1-2 tahun)",
        department: "Dinas Komunikasi dan Informatika",
        budget_estimate: "Rp 200-300 juta per tahun",
        success_indicators: "Meningkatnya pemahaman masyarakat terhadap program pemerintah"
      }
    ];
    
    console.log(`✅ Generated ${fallbackRecs.length} fallback recommendations`);
    return fallbackRecs;
  }

  cleanupMarkdown(text) {
    console.log('🧹 Cleaning up markdown formatting...');
    
    let cleaned = text
      // Remove markdown bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Line breaks
      .replace(/\n\n\n+/g, '<br><br>')  // Multiple newlines
      .replace(/\n\n/g, '<br><br>')     // Double newlines
      .replace(/\n/g, '<br>')           // Single newlines
      // Clean up any remaining asterisks
      .replace(/\*\*/g, '')
      .replace(/\*/g, '');
    
    console.log('✅ Markdown cleanup completed');
    return cleaned;
  }
}

export const reportGenerator = new GovernmentReportGenerator();
