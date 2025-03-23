// Mock implementation of Groq AI service
import { supabase } from './supabase';

// Mock Groq client
class MockGroq {
  apiKey: string;
  
  constructor(config: { apiKey: string }) {
    this.apiKey = config.apiKey;
  }
  
  chat = {
    completions: {
      create: async (params: any) => {
        console.log('Mock Groq API call with params:', params);
        return {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  title: "Mock Curriculum",
                  description: "This is a mock curriculum generated locally",
                  modules: [
                    {
                      title: "Module 1",
                      description: "Introduction to the topic",
                      content: "Mock content for module 1"
                    },
                    {
                      title: "Module 2",
                      description: "Advanced concepts",
                      content: "Mock content for module 2"
                    }
                  ],
                  learningObjectives: [
                    "Understand basic concepts",
                    "Apply advanced techniques"
                  ]
                })
              }
            }
          ]
        };
      }
    }
  };
}

class GroqAIService {
  private static instance: GroqAIService;
  private client: MockGroq | null = null;
  private apiKey: string | null = null;

  private constructor() {}

  public static getInstance(): GroqAIService {
    if (!GroqAIService.instance) {
      GroqAIService.instance = new GroqAIService();
    }
    return GroqAIService.instance;
  }

  public async initialize(): Promise<void> {
    try {
      // Get API key from Supabase secure storage
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: settings, error } = await supabase
        .from('user_settings')
        .select('groq_api_key')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      if (!settings?.groq_api_key) {
        console.warn('Groq API key not found, using mock implementation');
        this.apiKey = 'mock-api-key';
      } else {
        this.apiKey = settings.groq_api_key;
      }
      
      this.client = new MockGroq({
        apiKey: this.apiKey || 'mock-api-key'
      });
    } catch (error) {
      console.error('Error initializing Groq AI:', error);
      // Initialize with mock client anyway
      this.apiKey = 'mock-api-key';
      this.client = new MockGroq({
        apiKey: this.apiKey
      });
    }
  }

  public async generateCurriculum(topic: string, skillLevel: string, duration: string): Promise<any> {
    if (!this.client) {
      this.apiKey = 'mock-api-key';
      this.client = new MockGroq({
        apiKey: this.apiKey
      });
    }

    try {
      const completion = await this.client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert curriculum designer specializing in technical education.'
          },
          {
            role: 'user',
            content: `Create a detailed curriculum for ${topic} at ${skillLevel} level with ${duration} duration. Include learning objectives, prerequisites, modules, and target audience.`
          }
        ],
        model: 'mixtral-8x7b-32768',
        temperature: 0.7,
        max_tokens: 4000,
        top_p: 1,
        stream: false
      });

      return this.parseCurriculumResponse(completion.choices[0]?.message?.content || '');
    } catch (error) {
      console.error('Error generating curriculum:', error);
      throw error;
    }
  }

  public async generateModule(topic: string, type: string, difficulty: string): Promise<any> {
    if (!this.client) {
      this.apiKey = 'mock-api-key';
      this.client = new MockGroq({
        apiKey: this.apiKey
      });
    }

    try {
      const completion = await this.client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert technical instructor specializing in creating educational modules.'
          },
          {
            role: 'user',
            content: `Create a detailed ${type} module about ${topic} for ${difficulty} level. Include learning objectives, content sections, and assessments.`
          }
        ],
        model: 'mixtral-8x7b-32768',
        temperature: 0.7,
        max_tokens: 4000,
        top_p: 1,
        stream: false
      });

      return this.parseModuleResponse(completion.choices[0]?.message?.content || '');
    } catch (error) {
      console.error('Error generating module:', error);
      throw error;
    }
  }

  private parseCurriculumResponse(response: string): any {
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Error parsing curriculum response:', error);
      throw error;
    }
  }

  private parseModuleResponse(response: string): any {
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Error parsing module response:', error);
      throw error;
    }
  }

  public async saveApiKey(apiKey: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          groq_api_key: apiKey,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      this.apiKey = apiKey;
      this.client = new MockGroq({
        apiKey: apiKey
      });
    } catch (error) {
      console.error('Error saving API key:', error);
      throw error;
    }
  }
}

export const groqAI = GroqAIService.getInstance();
