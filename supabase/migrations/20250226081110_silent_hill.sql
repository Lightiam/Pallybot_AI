/*
  # Webcall Monitoring System Schema

  1. New Tables
    - training_sessions
      - Core session information
      - Scheduling and status tracking
    - session_participants
      - Participant tracking
      - Attendance and role management
    - session_recordings
      - Video/audio recording storage
      - Recording metadata
    - session_messages
      - Chat message history
    - participation_metrics
      - Speaking time
      - Chat activity
      - Engagement metrics
    - session_analytics
      - Aggregated session statistics
      - Performance metrics

  2. Security
    - RLS enabled on all tables
    - Role-based access policies
    - Secure file storage policies

  3. Storage
    - session_recordings bucket
    - Secure access controls
*/

-- Create training_sessions table
CREATE TABLE IF NOT EXISTS public.training_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  trainer_id uuid REFERENCES public.profiles(id) NOT NULL,
  start_time timestamptz NOT NULL,
  duration integer NOT NULL, -- in minutes
  status text CHECK (status IN ('scheduled', 'in_progress', 'completed')) DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create session_participants table
CREATE TABLE IF NOT EXISTS public.session_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.training_sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text CHECK (role IN ('trainer', 'trainee')) DEFAULT 'trainee',
  joined_at timestamptz,
  left_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(session_id, user_id)
);

-- Create session_recordings table
CREATE TABLE IF NOT EXISTS public.session_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.training_sessions(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  duration integer, -- in seconds
  created_at timestamptz DEFAULT now()
);

-- Create session_messages table
CREATE TABLE IF NOT EXISTS public.session_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.training_sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create participation_metrics table
CREATE TABLE IF NOT EXISTS public.participation_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.training_sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  speaking_time integer DEFAULT 0, -- in seconds
  chat_messages integer DEFAULT 0,
  reactions_count integer DEFAULT 0,
  screen_shares integer DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(session_id, user_id)
);

-- Create session_analytics table
CREATE TABLE IF NOT EXISTS public.session_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.training_sessions(id) ON DELETE CASCADE,
  total_participants integer DEFAULT 0,
  avg_participation_rate numeric(5,2),
  total_chat_messages integer DEFAULT 0,
  total_speaking_time integer DEFAULT 0, -- in seconds
  created_at timestamptz DEFAULT now(),
  UNIQUE(session_id)
);

-- Enable Row Level Security
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participation_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_analytics ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for recordings
INSERT INTO storage.buckets (id, name)
VALUES ('session_recordings', 'session_recordings')
ON CONFLICT (id) DO NOTHING;

-- RLS Policies

-- Training Sessions
CREATE POLICY "Trainers can create sessions"
  ON public.training_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Users can view sessions they're part of"
  ON public.training_sessions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.session_participants
      WHERE session_id = id AND user_id = auth.uid()
    ) OR trainer_id = auth.uid()
  );

-- Session Participants
CREATE POLICY "Users can join sessions"
  ON public.session_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.training_sessions
      WHERE id = session_id AND status != 'completed'
    )
  );

CREATE POLICY "Users can view session participants"
  ON public.session_participants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.session_participants sp
      WHERE sp.session_id = session_id AND sp.user_id = auth.uid()
    )
  );

-- Session Recordings
CREATE POLICY "Trainers can create recordings"
  ON public.session_recordings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.training_sessions
      WHERE id = session_id AND trainer_id = auth.uid()
    )
  );

CREATE POLICY "Users can view session recordings"
  ON public.session_recordings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.session_participants
      WHERE session_id = session_id AND user_id = auth.uid()
    )
  );

-- Session Messages
CREATE POLICY "Users can send messages in their sessions"
  ON public.session_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.session_participants
      WHERE session_id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view session messages"
  ON public.session_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.session_participants
      WHERE session_id = session_id AND user_id = auth.uid()
    )
  );

-- Storage Policies
CREATE POLICY "Trainers can upload recordings"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'session_recordings' AND
    EXISTS (
      SELECT 1 FROM public.training_sessions
      WHERE id = (storage.foldername(name))[1]::uuid
      AND trainer_id = auth.uid()
    )
  );