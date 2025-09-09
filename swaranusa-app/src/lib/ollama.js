import { Ollama } from 'ollama';

const ollama = new Ollama({ 
  host: 'http://localhost:11434' // Default Ollama port
});

export class FeedbackClusteringService {
  constructor() {
    this.model = 'llama3.2';
  }

  async processFeedback(feedbackText, locationData = {}) {
    try {
      const { provinsi, kota, kabupaten, location } = locationData;
      
      const prompt = `
        Analyze this Indonesian citizen feedback/complaint and extract the following information in JSON format:
        
        Feedback: "${feedbackText}"
        Location: ${provinsi}${kota ? `, ${kota}` : ''}${kabupaten ? `, ${kabupaten}` : ''}${location ? `, ${location}` : ''}
        
        IMPORTANT: Categorize based on the MAIN PROBLEM being complained about, not who handles it.
        All text outputs must be in Indonesian language.
        
        Provide response in this exact format:
        {
          "cleanedContent": "Professional version without profanity or excessive emotion, in Indonesian",
          "category": "CHOOSE ONE from: infrastruktur, kesehatan, pendidikan, lingkungan, transportasi, keamanan, ekonomi, sosial, pemerintahan, teknologi",
          "urgency": "CHOOSE ONE from: low, medium, high",
          "sentiment": "CHOOSE ONE from: positive, negative, neutral",
          "tags": ["array", "of", "relevant", "keywords", "in", "Indonesian"],
          "locationRelevance": "CHOOSE ONE from: high, medium, low",
          "suggestedDepartment": "Which government department should handle this, in Indonesian"
        }

        CATEGORIZATION GUIDE:
        - infrastruktur: damaged roads, bridges, drainage, clean water, electricity
        - kesehatan: hospitals, clinics, medicines, doctors, medical facilities
        - pendidikan: schools, teachers, learning facilities, curriculum, scholarships
        - lingkungan: garbage, pollution, cleanliness, parks, environmental damage
        - transportasi: public transport, traffic, parking, transportation facilities
        - keamanan: crime, safety, security, police services
        - ekonomi: business permits, markets, economic development, unemployment
        - sosial: social services, community issues, social welfare
        - pemerintahan: government services, bureaucracy, administrative issues, corruption
        - teknologi: digital services, internet, technology infrastructure

        Consider the location context when determining category and urgency.
        Respond ONLY with valid JSON, no additional text.
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
