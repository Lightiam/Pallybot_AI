// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import * as mockSupabase from './mockSupabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables, using mock implementation');
  supabase = mockSupabase.supabase;
} else {
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
}

export { supabase };
export const getCachedCredentials = mockSupabase.getCachedCredentials;
export const saveCredentials = mockSupabase.saveCredentials;
export const clearCredentials = mockSupabase.clearCredentials;
