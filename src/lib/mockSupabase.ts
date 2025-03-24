// Mock implementation of Supabase client
import { SupabaseClient, User, Session } from '@supabase/supabase-js';
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

// Create mock user and session objects
const createMockUser = (email: string = 'mock@example.com'): User => ({
  id: 'mock-user-id',
  app_metadata: {},
  user_metadata: {
    full_name: 'Mock User'
  },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: email,
  email_confirmed_at: new Date().toISOString(),
  phone: '',
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  role: 'authenticated',
  updated_at: new Date().toISOString()
});

const createMockSession = (user: User): Session => ({
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: user
});

class MockSupabaseClient {
  private mockUser: User = createMockUser();
  private mockSession: Session = createMockSession(this.mockUser);
  
  auth = {
    getUser: async () => ({ 
      data: { user: this.mockUser }, 
      error: null 
    }),
    
    signInWithPassword: async (credentials: { email: string, password: string }) => {
      console.log('Mock: Signing in with', credentials.email);
      // Accept any credentials, no validation required
      console.log('Mock: Authentication successful with any credentials');
      
      // Update mock user with provided email
      this.mockUser = createMockUser(credentials.email);
      this.mockSession = createMockSession(this.mockUser);
      
      return { 
        data: { 
          user: this.mockUser,
          session: this.mockSession
        }, 
        error: null 
      };
    },
    
    signUp: async (credentials: { email: string, password: string, options?: any }) => {
      console.log('Mock: Signing up with', credentials.email);
      try {
        // Simulate network request
        console.log('Mock: Account creation successful with any credentials');
        
        // Create mock user with provided email
        const mockUser = createMockUser(credentials.email);
        const mockSession = createMockSession(mockUser);
        
        return { 
          data: { 
            user: mockUser,
            session: mockSession
          }, 
          error: null 
        };
      } catch (error) {
        console.error('Mock: Error in signup (this should never happen but handling anyway):', error);
        // Even in case of error, return success for mock implementation
        return {
          data: {
            user: createMockUser(credentials.email),
            session: createMockSession(createMockUser(credentials.email))
          },
          error: null
        };
      }
    },
    
    signOut: async () => {
      console.log('Mock: Signing out');
      return { error: null };
    },
    
    onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
      // Call the callback immediately with the mock session
      console.log('Mock: Auth state change listener registered');
      setTimeout(() => {
        callback('SIGNED_IN', this.mockSession);
      }, 0);
      
      return {
        data: { 
          subscription: { 
            unsubscribe: () => {
              console.log('Mock: Auth state change listener unsubscribed');
            } 
          } 
        },
        error: null
      };
    },
    
    getSession: async () => ({
      data: { session: this.mockSession },
      error: null
    })
  };
  
  from = (table: string) => ({
    select: () => ({
      eq: (field: string, value: any) => {
        console.log(`Mock: Filtering ${table} where ${field} = ${value}`);
        return {
          single: async () => ({ 
            data: mockData[table] || null, 
            error: null 
          })
        };
      },
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
  
  // Add storage implementation
  storage = {
    from: (_bucket: string) => ({
      upload: async (path: string, _file: any) => {
        console.log(`Mock: Uploading file to ${path}`);
        return { 
          data: { path },
          error: null
        };
      },
      getPublicUrl: (path: string) => ({
        data: { publicUrl: `https://placeholder.com/${path}` }
      })
    })
  };
}

export const supabase = new MockSupabaseClient() as unknown as SupabaseClient<Database>;

// Helper functions
export const getCachedCredentials = () => {
  return { email: 'mock@example.com', rememberMe: true };
};

export const saveCredentials = (email: string, rememberMe: boolean) => {
  console.log('Mock: Saving credentials', { email, rememberMe });
};

export const clearCredentials = () => {
  console.log('Mock: Clearing credentials');
};
