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
        "category": "infrastruktur|kesehatan|pendidikan|lingkungan|transportasi|keamanan|ekonomi|sosial|pemerintahan|teknologi",
        "urgency": "low|medium|high",
        "sentiment": "positive|negative|neutral",
        "tags": ["keyword1", "keyword2"],
        "locationRelevance": "high|medium|low",
        "suggestedDepartment": "Department name in Indonesian"
      }

      Be aware of the terms mentioned in the feedback and categorize the feedback accordingly. EXAMPLE: "kurang sekolah sangat sulit mengakses pendidikan formal" → category should be "pendidikan"
      
    Categories:
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
      
      Respond ONLY with JSON.
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
        
        EXISTING FEEDBACKS:
        ${existingFeedbacks.map((fb, idx) => `
        ${idx + 1}. ID: ${fb.id}, Content: "${fb.content.substring(0, 200)}...", Category: ${fb.category}, Cluster: ${fb.clusterId}
        `).join('')}
        
        Rules for clustering:
        - Same category + similar location (same province/city) + similar content = cluster together
        - Different categories = separate clusters
        - Same category but very different locations = separate clusters
        - Similarity score: 80+ = cluster together, 50-79 = maybe, <50 = separate
        
        Respond with JSON (reason must be in Indonesian):
        {
          "suggestedClusterId": number or null,
          "shouldCreateNewCluster": boolean,
          "similarityScore": number (0-100),
          "reason": "explanation in Indonesian language"
        }
        
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
