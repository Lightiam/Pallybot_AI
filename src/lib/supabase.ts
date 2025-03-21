import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage,
    storageKey: 'supabase.auth.token',
    flowType: 'pkce'
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'Cache-Control': 'public, max-age=300'
    }
  },
  // Enable local storage caching
  persistSession: true,
  localStorage: {
    key: 'supabase.auth.token',
    expiryDays: 30 // Cache for 30 days
  }
});

// Helper function to get cached credentials
export const getCachedCredentials = () => {
  const cachedEmail = localStorage.getItem('auth.email');
  const rememberMe = localStorage.getItem('auth.rememberMe') === 'true';
  return { email: cachedEmail, rememberMe };
};

// Helper function to save credentials
export const saveCredentials = (email: string, rememberMe: boolean) => {
  if (rememberMe) {
    localStorage.setItem('auth.email', email);
    localStorage.setItem('auth.rememberMe', 'true');
  } else {
    localStorage.removeItem('auth.email');
    localStorage.removeItem('auth.rememberMe');
  }
};

// Helper function to clear credentials
export const clearCredentials = () => {
  localStorage.removeItem('auth.email');
  localStorage.removeItem('auth.rememberMe');
};