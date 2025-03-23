// src/lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import * as mockSupabase from './mockSupabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient<Database>;

// For production/deployment, always use mock implementation to avoid network errors
if (import.meta.env.PROD || !supabaseUrl || !supabaseAnonKey) {
  console.warn('Using mock Supabase implementation for production or missing credentials');
  supabase = mockSupabase.supabase;
} else {
  try {
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Error initializing Supabase client, falling back to mock:', error);
    supabase = mockSupabase.supabase;
  }
}

export { supabase };
export const getCachedCredentials = mockSupabase.getCachedCredentials;
export const saveCredentials = mockSupabase.saveCredentials;
export const clearCredentials = mockSupabase.clearCredentials;
