import { Ollama } from 'ollama';

const ollama = new Ollama({ 
  host: 'http://localhost:11434' // Default Ollama port
});

export class FeedbackClusteringService {
  constructor() {
    this.model = 'llama3.2';
  }

  async processFeedback(feedbackText) {
    try {
      const prompt = `
        Analyze this citizen feedback/complaint and extract the following information in JSON format:
        
        Feedback: "${feedbackText}"
        
        Please provide:
        {
          "cleanedContent": "Professional version without profanity or excessive emotion",
          "category": "One of: infrastructure, public_services, environment, safety, transport, governance, other",
          "urgency": "One of: low, medium, high",
          "sentiment": "One of: positive, negative, neutral",
          "tags": ["array", "of", "relevant", "keywords"],
          "location": "extracted location if mentioned, or null",
          "summary": "Brief 1-sentence summary of the main issue"
        }
        
        Only respond with valid JSON, no additional text.
      `;

      const response = await ollama.generate({
        model: this.model,
        prompt: prompt,
        stream: false,
        format: 'json'
      });

      return JSON.parse(response.response);
    } catch (error) {
      console.error('Error processing feedback with Ollama:', error);
      throw error;
    }
  }

  async findSimilarFeedbacks(newFeedback, existingFeedbacks) {
    try {
      const prompt = `
        Compare this new feedback with existing feedbacks and determine similarity:
        
        New Feedback: "${newFeedback.content}"
        Category: ${newFeedback.category}
        Tags: ${JSON.stringify(newFeedback.tags)}
        
        Existing Feedbacks:
        ${existingFeedbacks.map((f, i) => `
        ${i + 1}. Content: "${f.content}"
           Category: ${f.category}
           Tags: ${JSON.stringify(f.tags)}
           Cluster ID: ${f.clusterId}
        `).join('\n')}
        
        Determine which existing feedback is most similar (if any) and suggest cluster assignment.
        Response format:
        {
          "mostSimilarId": number or null,
          "similarityScore": 0-100,
          "suggestedClusterId": number or null,
          "shouldCreateNewCluster": boolean,
          "reasoning": "brief explanation"
        }
        
        Only respond with valid JSON.
      `;

      const response = await ollama.generate({
        model: this.model,
        prompt: prompt,
        stream: false,
        format: 'json'
      });

      return JSON.parse(response.response);
    } catch (error) {
      console.error('Error finding similar feedbacks:', error);
      throw error;
    }
  }

  async generateClusterName(feedbacks) {
    try {
      const prompt = `
        Based on these similar feedbacks, generate a cluster name and description:
        
        Feedbacks:
        ${feedbacks.map((f, i) => `
        ${i + 1}. "${f.content}" (Category: ${f.category})
        `).join('\n')}
        
        Generate:
        {
          "name": "Concise cluster name (2-4 words)",
          "description": "Brief description of common theme",
          "keywords": ["array", "of", "key", "terms"]
        }
        
        Only respond with valid JSON.
      `;

      const response = await ollama.generate({
        model: this.model,
        prompt: prompt,
        stream: false,
        format: 'json'
      });

      return JSON.parse(response.response);
    } catch (error) {
      console.error('Error generating cluster name:', error);
      throw error;
    }
  }

  async generateResponse(prompt) {
    try {
      const response = await ollama.generate({
        model: this.model,
        prompt: prompt,
        stream: false
      });

      return response.response;
    } catch (error) {
      console.error('Error generating response with Ollama:', error);
      throw error;
    }
  }
}

export const clusteringService = new FeedbackClusteringService();
