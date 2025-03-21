export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string
          created_at: string
          user_id: string
          content: string
          image_url: string | null
          likes_count: number
          comments_count: number
          shares_count: number
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          content: string
          image_url?: string | null
          likes_count?: number
          comments_count?: number
          shares_count?: number
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          content?: string
          image_url?: string | null
          likes_count?: number
          comments_count?: number
          shares_count?: number
        }
      }
      comments: {
        Row: {
          id: string
          created_at: string
          user_id: string
          post_id: string
          content: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          post_id: string
          content: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          post_id?: string
          content?: string
        }
      }
      likes: {
        Row: {
          id: string
          created_at: string
          user_id: string
          post_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          post_id: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          post_id?: string
        }
      }
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}