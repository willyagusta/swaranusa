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
        Location: ${provinsi}, ${kota}, ${kabupaten}${location ? `, ${location}` : ''}
        
        Please provide:
        {
          "cleanedContent": "Professional version without profanity or excessive emotion, in Indonesian",
          "category": "One of: infrastruktur, kesehatan, pendidikan, lingkungan, transportasi, keamanan, ekonomi, sosial, pemerintahan, teknologi",
          "urgency": "One of: low, medium, high",
          "sentiment": "One of: positive, negative, neutral",
          "tags": ["array", "of", "relevant", "keywords", "in", "Indonesian"],
          "locationRelevance": "How relevant is the location to this issue (high/medium/low)",
          "suggestedDepartment": "Which government department should handle this"
        }

        Consider the location context when determining category and urgency.
        Respond only with valid JSON.
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
          category: 'pemerintahan',
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
        category: 'pemerintahan',
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
        Analyze if this new feedback should be clustered with existing ones:
        
        NEW FEEDBACK:
        Content: "${newFeedback.content}"
        Category: ${newFeedback.category}
        Location: ${newFeedback.originalLocation?.provinsi}, ${newFeedback.originalLocation?.kota}, ${newFeedback.originalLocation?.kabupaten}
        Tags: ${JSON.stringify(newFeedback.tags)}
        
        EXISTING FEEDBACKS:
        ${existingFeedbacks.map((fb, idx) => `
        ${idx + 1}. ID: ${fb.id}, Content: "${fb.content.substring(0, 200)}...", Category: ${fb.category}, Cluster: ${fb.clusterId}
        `).join('')}
        
        Respond with JSON:
        {
          "suggestedClusterId": number or null,
          "shouldCreateNewCluster": boolean,
          "similarityScore": number (0-100),
          "reason": "explanation in Indonesian"
        }
        
        Consider location proximity, category match, and content similarity.
        Feedbacks from same province/city with similar issues should cluster together.
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
        Generate a cluster name and description for these related feedbacks in Indonesian:
        
        ${feedbacks.map((fb, idx) => `
        ${idx + 1}. Category: ${fb.category}, Content: "${fb.content.substring(0, 150)}..."
        Location: ${fb.originalLocation ? `${fb.originalLocation.provinsi}, ${fb.originalLocation.kota}` : 'Unknown'}
        `).join('')}
        
        Respond with JSON:
        {
          "name": "Short descriptive name in Indonesian (max 50 chars)",
          "description": "Brief description of the common issue (max 200 chars)",
          "keywords": ["array", "of", "key", "terms", "in", "Indonesian"]
        }
        
        Focus on the common theme and location if relevant.
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

  // New method for generating responses (used by report generator)
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
