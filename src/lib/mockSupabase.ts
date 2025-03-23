// Mock implementation of Supabase client
import { Database } from '../types/supabase';

// Mock data for different tables
const mockData: Record<string, any> = {
  profiles: {
    id: 'mock-profile-id',
    user_id: 'mock-user-id',
    full_name: 'Mock User',
    avatar_url: 'https://via.placeholder.com/150',
    created_at: new Date().toISOString()
  },
  user_settings: {
    user_id: 'mock-user-id',
    groq_api_key: 'mock-groq-api-key',
    theme: 'light',
    updated_at: new Date().toISOString()
  },
  courses: [
    {
      id: 'mock-course-1',
      title: 'Introduction to JavaScript',
      description: 'Learn the basics of JavaScript programming',
      level: 'beginner',
      created_at: new Date().toISOString()
    },
    {
      id: 'mock-course-2',
      title: 'Advanced React Patterns',
      description: 'Master advanced React patterns and techniques',
      level: 'advanced',
      created_at: new Date().toISOString()
    }
  ]
};

class MockSupabaseClient {
  auth = {
    getUser: async () => ({ 
      data: { 
        user: { 
          id: 'mock-user-id',
          email: 'mock@example.com',
          user_metadata: {
            full_name: 'Mock User'
          }
        } 
      }, 
      error: null 
    }),
    signInWithPassword: async () => ({ 
      data: { 
        user: { 
          id: 'mock-user-id',
          email: 'mock@example.com' 
        } 
      }, 
      error: null 
    }),
    signUp: async () => ({ 
      data: { 
        user: { 
          id: 'mock-user-id',
          email: 'mock@example.com' 
        } 
      }, 
      error: null 
    }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: (callback: any) => ({
      data: { subscription: { unsubscribe: () => {} } },
      error: null
    }),
    getSession: async () => ({
      data: { 
        session: { 
          user: { 
            id: 'mock-user-id', 
            email: 'mock@example.com' 
          }
        }
      },
      error: null
    })
  };
  
  from = (table: string) => ({
    select: () => ({
      eq: (field: string, value: any) => ({
        single: async () => ({ 
          data: mockData[table] || null, 
          error: null 
        })
      }),
      order: () => ({
        limit: () => ({
          data: mockData[table] || [],
          error: null
        })
      })
    }),
    insert: () => ({
      data: { id: 'new-mock-id' },
      error: null
    }),
    upsert: () => ({
      data: { id: 'upsert-mock-id' },
      error: null
    }),
    update: () => ({
      eq: () => ({
        data: { id: 'updated-mock-id' },
        error: null
      })
    }),
    delete: () => ({
      eq: () => ({
        data: null,
        error: null
      })
    })
  });
}

export const supabase = new MockSupabaseClient() as any;

// Helper functions
export const getCachedCredentials = () => {
  return { email: 'demo@example.com', rememberMe: true };
};

export const saveCredentials = (email: string, rememberMe: boolean) => {
  console.log('Mock: Saving credentials', { email, rememberMe });
};

export const clearCredentials = () => {
  console.log('Mock: Clearing credentials');
};
