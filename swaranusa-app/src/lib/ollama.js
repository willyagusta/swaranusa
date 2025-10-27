import { Ollama } from 'ollama';

const ollama = new Ollama({ 
  host: 'http://localhost:11434' // Default Ollama port
});

export class FeedbackClusteringService {
  constructor() {
    this.model = 'llama3.2:latest';
  }

  async processFeedback(feedbackText, locationData = {}) {
    try {
      const { provinsi, kota, kabupaten, location } = locationData;
      
      const prompt = `
      Analyze this Indonesian feedback. Respond ONLY in JSON format:
      
      Feedback: "${feedbackText}"
      Location: ${provinsi}, ${kota}, ${kabupaten}${location ? `, ${location}` : ''}
      
      {
        "cleanedContent": "Professional version in Indonesian",
        "category": "single_category_only",
        "urgency": "low|medium|high",
        "sentiment": "positive|negative|neutral",
        "tags": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
        "locationRelevance": "high|medium|low",
        "suggestedDepartment": "Department name in Indonesian"
      }

      INSTRUCTIONS FOR cleanedContent:
      - Rewrite the original feedback in formal, professional Indonesian
      - Keep the core message and meaning intact
      - Remove any offensive language, slang, or informal words
      - Make it suitable for government review
      - Example: "jalan rusak parah bgt gk bisa lewat" → "Jalan mengalami kerusakan parah dan tidak dapat dilalui"

      IMPORTANT TAG INSTRUCTIONS:
      - Generate 3-7 specific, relevant tags (NOT generic ones like "masukan" or "warga")
      - Tags should capture: main issue, affected facilities, specific problems, action words
      - Extract actual keywords from the feedback content
      - Examples:
        * "Jalan rusak di depan sekolah" → ["jalan-rusak", "sekolah", "akses-pendidikan", "infrastruktur-jalan"]
        * "Sampah menumpuk di pasar" → ["sampah", "pasar", "kebersihan", "pengelolaan-sampah", "lingkungan"]
        * "Rumah sakit kekurangan obat" → ["rumah-sakit", "obat", "fasilitas-kesehatan", "ketersediaan-obat"]
      - AVOID generic tags like: "masukan", "warga", "keluhan", "feedback"

      Be aware of the terms mentioned in the feedback and categorize the feedback accordingly. EXAMPLE: "kurang sekolah sangat sulit mengakses pendidikan formal" → category should be "pendidikan"
      CATEGORY RULES:
      - Choose EXACTLY ONE category from the list below
      - Return ONLY the category name, no pipes or multiple values
      - Example: "pendidikan" NOT "pendidikan|sekolah" or "pendidikan|sosial"
      
    Available Categories (choose ONE):
    - infrastruktur: roads, bridges, water, electricity, jalan, jembatan, air bersih, listrik
    - kesehatan: hospitals, medical facilities, rumah sakit, fasilitas kesehatan, dokter, obat
    - pendidikan: schools, education, sekolah, pendidikan, guru, fasilitas belajar, akses sekolah
    - lingkungan: garbage, pollution, cleanliness, sampah, polusi, kebersihan, taman
    - transportasi: transport, traffic, transportasi, lalu lintas, parkir, angkutan umum
    - keamanan: security, safety, keamanan, keselamatan, polisi, kejahatan
    - ekonomi: business, economy, bisnis, ekonomi, pasar, pengangguran, kesejahteraan
    - sosial: social services, layanan sosial, bantuan sosial, program masyarakat
    - pemerintahan: government services, bureaucracy, layanan pemerintah, birokrasi, korupsi
    - teknologi: digital services, tech, layanan digital, internet, teknologi
      
      Respond ONLY with JSON. No markdown, no explanations.
      `;

      const response = await ollama.chat({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      });

      let result;
      try {
        result = JSON.parse(response.message.content);
      } catch (parseError) {
        console.warn('Failed to parse AI response as JSON:', response.message.content);
        result = {
          cleanedContent: feedbackText,
          category: 'sosial',
          urgency: 'medium',
          sentiment: 'neutral',
          tags: ['masukan', 'warga'],
          locationRelevance: 'medium',
          suggestedDepartment: 'Pemerintah Daerah'
        };
      }

      return {
        ...result,
        originalLocation: { provinsi, kota, kabupaten, location }
      };

    } catch (error) {
      console.error('Error processing feedback with Ollama:', error);
      return {
        cleanedContent: feedbackText,
        category: 'sosial',
        urgency: 'medium',
        sentiment: 'neutral',
        tags: ['masukan', 'warga'],
        locationRelevance: 'medium',
        suggestedDepartment: 'Pemerintah Daerah',
        originalLocation: locationData
      };
    }
  }

  async findSimilarFeedbacks(newFeedback, existingFeedbacks) {
    if (!existingFeedbacks || existingFeedbacks.length === 0) {
      return {
        suggestedClusterId: null,
        shouldCreateNewCluster: true,
        similarityScore: 0,
        reason: 'No existing feedbacks to compare'
      };
    }

    try {
      const prompt = `
        Analyze if this new Indonesian feedback should be clustered with existing ones.
        All reasoning must be in Indonesian language.
        
        NEW FEEDBACK:
        Content: "${newFeedback.content}"
        Category: ${newFeedback.category}
        Location: ${newFeedback.originalLocation?.provinsi}, ${newFeedback.originalLocation?.kota}, ${newFeedback.originalLocation?.kabupaten}
        Tags: ${JSON.stringify(newFeedback.tags)}
        Urgency: ${newFeedback.urgency}
        Sentiment: ${newFeedback.sentiment}
        
        EXISTING FEEDBACKS:
        ${existingFeedbacks.map((fb, idx) => `
        ${idx + 1}. ID: ${fb.id}, Content: "${fb.content.substring(0, 200)}...", Category: ${fb.category}, Cluster: ${fb.clusterId}
        `).join('')}
        
        CLUSTERING RULES (apply in order):
        1. CATEGORY MATCH (40 points): Must be same category
        2. LOCATION PROXIMITY (25 points):
          - Same city/kabupaten: +25 points
          - Same province only: +15 points
          - Different province: +0 points
        3. TAG SIMILARITY (20 points):
          - 3+ matching tags: +20 points
          - 2 matching tags: +12 points
          - 1 matching tag: +6 points
        4. CONTENT SEMANTIC SIMILARITY (15 points):
          - Very similar problem/issue: +15 points
          - Somewhat related: +8 points
          - Different issues: +0 points

        DECISION CRITERIA:
        - Score 80+: MUST cluster together (high confidence)
        - Score 60-79: Cluster together (moderate confidence)
        - Score 40-59: Create new cluster (low similarity)
        - Score <40: Definitely separate cluster
        
        Respond with JSON (reason must be in Indonesian):
        {
          "suggestedClusterId": number or null,
          "shouldCreateNewCluster": boolean,
          "similarityScore": number (0-100),
          "reason": "explanation in Indonesian language"
        }
        
        Respond ONLY with valid JSON. No markdown, no explanations.
      `;

      const response = await ollama.chat({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      });

      try {
        return JSON.parse(response.message.content);
      } catch (parseError) {
        console.warn('Failed to parse clustering response:', response.message.content);
        return {
          suggestedClusterId: null,
          shouldCreateNewCluster: true,
          similarityScore: 0,
          reason: 'Gagal menganalisis kemiripan'
        };
      }

    } catch (error) {
      console.error('Error finding similar feedbacks:', error);
      return {
        suggestedClusterId: null,
        shouldCreateNewCluster: true,
        similarityScore: 0,
        reason: 'Error dalam analisis clustering'
      };
    }
  }

  async generateClusterName(feedbacks) {
    try {
      const prompt = `
        Generate a cluster name and description for these related Indonesian feedbacks.
        All outputs must be in Indonesian language.
        
        FEEDBACKS:
        ${feedbacks.map((fb, idx) => `
        ${idx + 1}. Category: ${fb.category}, Content: "${fb.content.substring(0, 150)}..."
        Location: ${fb.originalLocation ? `${fb.originalLocation.provinsi}, ${fb.originalLocation.kota}` : 'Unknown'}
        `).join('')}
        
        Create a cluster that represents the common theme of these feedbacks.
        Focus on the main issue/problem, not the location or government department.
        
        Respond with JSON (all text in Indonesian):
        {
          "name": "Short descriptive name in Indonesian (max 50 characters)",
          "description": "Brief description of the common issue in Indonesian (max 200 characters)",
          "keywords": ["array", "of", "key", "terms", "in", "Indonesian"]
        }
        
        Examples of good cluster names:
        - "Masalah Jalan Rusak"
        - "Keluhan Fasilitas Kesehatan"
        - "Permasalahan Sampah"
        - "Kendala Transportasi Umum"
        
        Respond ONLY with valid JSON.
      `;

      const response = await ollama.chat({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      });

      try {
        return JSON.parse(response.message.content);
      } catch (parseError) {
        console.warn('Failed to parse cluster name response:', response.message.content);
        return {
          name: `Cluster ${feedbacks[0]?.category || 'Umum'}`,
          description: 'Kumpulan masukan dengan tema serupa',
          keywords: ['masukan', 'warga', feedbacks[0]?.category || 'umum']
        };
      }

    } catch (error) {
      console.error('Error generating cluster name:', error);
      return {
        name: `Cluster ${feedbacks[0]?.category || 'Umum'}`,
        description: 'Kumpulan masukan dengan tema serupa',
        keywords: ['masukan', 'warga', feedbacks[0]?.category || 'umum']
      };
    }
  }

  // Method for generating responses (used by report generator)
  async generateResponse(prompt) {
    try {
      const response = await ollama.chat({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      });

      return response.message.content;
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  }
}

export const clusteringService = new FeedbackClusteringService();

// Image Analysis Function
export async function analyzeMediaWithAI(base64Data, mimeType, fileName) {
  const isImage = mimeType.startsWith('image/');
  
  try {
    // Try to use Ollama directly (skip the list check since we know it's running)

    // Only process images now
    if (!isImage) {
      return {
        success: false,
        error: 'Format file tidak didukung. Hanya gambar yang diperbolehkan.'
      };
    }

    const prompt = `
    Analyze this Indonesian image and extract information for a government feedback form.
    Respond ONLY in JSON format:
    
    Image: ${fileName}
    Type: ${mimeType}
    
    {
      "title": "Clear, descriptive title in Indonesian (max 60 characters)",
      "content": "Detailed description of what you see in the image in Indonesian (max 500 characters). Focus on problems, issues, or observations that would be relevant for government feedback.",
      "location": "Specific location mentioned in image (if any) or 'Tidak teridentifikasi'",
      "category": "single_category_only",
      "urgency": "low|medium|high",
      "sentiment": "positive|negative|neutral",
      "tags": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
      "description": "What you observe in the image in Indonesian"
    }

    INSTRUCTIONS FOR TITLE:
    - Create a clear, descriptive title that summarizes the main issue/problem visible in the image
    - Use formal Indonesian language
    - Focus on the problem or situation, not just "Gambar" or "Foto"
    - Examples: "Jalan Rusak di Depan Sekolah", "Sampah Menumpuk di Pasar", "Fasilitas Kesehatan Tidak Memadai"

    INSTRUCTIONS FOR CONTENT:
    - Describe what you see in detail, focusing on problems or issues
    - Use formal Indonesian language suitable for government review
    - Include specific details about the condition, location, or situation
    - If you see text/signs in the image, include that information
    - Focus on actionable observations that government could address

    CATEGORY RULES:
    - Choose EXACTLY ONE category from the list below
    - Return ONLY the category name, no pipes or multiple values
    
    Available Categories (choose ONE):
    - infrastruktur: roads, bridges, water, electricity, jalan, jembatan, air bersih, listrik
    - kesehatan: hospitals, medical facilities, rumah sakit, fasilitas kesehatan, dokter, obat
    - pendidikan: schools, education, sekolah, pendidikan, guru, fasilitas belajar, akses sekolah
    - lingkungan: garbage, pollution, cleanliness, sampah, polusi, kebersihan, taman
    - transportasi: transport, traffic, transportasi, lalu lintas, parkir, angkutan umum
    - keamanan: security, safety, keamanan, keselamatan, polisi, kejahatan
    - ekonomi: business, economy, bisnis, ekonomi, pasar, pengangguran, kesejahteraan
    - sosial: social services, layanan sosial, bantuan sosial, program masyarakat
    - pemerintahan: government services, bureaucracy, layanan pemerintah, birokrasi, korupsi
    - teknologi: digital services, tech, layanan digital, internet, teknologi

    IMPORTANT TAG INSTRUCTIONS:
    - Generate 3-7 specific, relevant tags based on what you see in the image
    - Tags should capture: main issue, affected facilities, specific problems, action words
    - Extract actual keywords from what's visible in the image
    - AVOID generic tags like: "gambar", "foto", "masukan", "warga"

    Respond ONLY with JSON. No markdown, no explanations.
    `;

      // Use the same model and options as voice feedback processing
      const response = await ollama.chat({
        model: 'llama3.2:latest',
        messages: [{ role: 'user', content: prompt }],
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        }
      });

      let result;
      try {
        // Try to parse JSON response with same logic as voice feedback
        const content = response.message.content.trim();
        
        // Sometimes LLM wraps JSON in markdown code blocks
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                         content.match(/```\n([\s\S]*?)\n```/) ||
                         [null, content];
        
        result = JSON.parse(jsonMatch[1] || content);
        
        // Validate required fields
        if (!result.title || !result.content) {
          throw new Error('Missing required fields');
        }
        
      } catch (parseError) {
        console.warn('Failed to parse AI response as JSON:', response.message.content);
        result = generateFallbackAnalysis(fileName, mimeType, isImage).data;
      }

    return {
      success: true,
      data: result
    };

  } catch (error) {
    console.error('Error analyzing media with AI:', error);
    return generateFallbackAnalysis(fileName, mimeType, isImage);
  }
}

// Fallback analysis function when Ollama is not available
function generateFallbackAnalysis(fileName, mimeType, isImage) {
  const fileType = 'gambar';
  const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
  
  // Generate basic analysis based on file type and name
  let title = `Masukan ${fileType} - ${fileName}`;
  let content = `File ${fileType} "${fileName}" telah diunggah untuk dianalisis lebih lanjut. `;
  let category = 'sosial';
  let tags = ['media', 'upload', fileType];
  
  // Try to infer category from filename
  const fileNameLower = fileName.toLowerCase();
  if (fileNameLower.includes('jalan') || fileNameLower.includes('road') || fileNameLower.includes('infra')) {
    category = 'infrastruktur';
    tags.push('infrastruktur', 'jalan');
    title = `Masukan Infrastruktur - ${fileName}`;
    content += 'File ini berkaitan dengan infrastruktur dan fasilitas umum.';
  } else if (fileNameLower.includes('sampah') || fileNameLower.includes('waste') || fileNameLower.includes('lingkungan')) {
    category = 'lingkungan';
    tags.push('lingkungan', 'sampah');
    title = `Masukan Lingkungan - ${fileName}`;
    content += 'File ini berkaitan dengan masalah lingkungan dan kebersihan.';
  } else if (fileNameLower.includes('sekolah') || fileNameLower.includes('school') || fileNameLower.includes('pendidikan')) {
    category = 'pendidikan';
    tags.push('pendidikan', 'sekolah');
    title = `Masukan Pendidikan - ${fileName}`;
    content += 'File ini berkaitan dengan fasilitas pendidikan.';
  } else if (fileNameLower.includes('rumah') || fileNameLower.includes('hospital') || fileNameLower.includes('kesehatan')) {
    category = 'kesehatan';
    tags.push('kesehatan', 'rumah-sakit');
    title = `Masukan Kesehatan - ${fileName}`;
    content += 'File ini berkaitan dengan fasilitas kesehatan.';
  }

  return {
    success: true,
    data: {
      title: title,
      content: content,
      location: 'Tidak teridentifikasi',
      category: category,
      urgency: 'medium',
      sentiment: 'neutral',
      tags: tags,
      description: `File ${fileType} ${fileName}`
    }
  };
}