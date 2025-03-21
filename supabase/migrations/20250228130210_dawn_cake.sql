-- Check if direct_messages table exists, if not create it
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security if not already enabled
ALTER TABLE IF EXISTS public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own messages" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can update read status of received messages" ON public.direct_messages;

-- Create policies
CREATE POLICY "Users can view their own messages"
  ON public.direct_messages
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = sender_id OR
    auth.uid() = receiver_id
  );

CREATE POLICY "Users can send messages"
  ON public.direct_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
  );

-- Fix the policy that was causing the error by removing the WITH CHECK clause
CREATE POLICY "Users can update read status of received messages"
  ON public.direct_messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id);

-- Create indexes for faster message retrieval if they don't exist
CREATE INDEX IF NOT EXISTS direct_messages_sender_receiver_idx
  ON public.direct_messages (sender_id, receiver_id);

CREATE INDEX IF NOT EXISTS direct_messages_receiver_sender_idx
  ON public.direct_messages (receiver_id, sender_id);

CREATE INDEX IF NOT EXISTS direct_messages_created_at_idx
  ON public.direct_messages (created_at DESC);

-- Add online_status column to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name = 'online_status'
  ) THEN
    ALTER TABLE public.profiles
    ADD COLUMN online_status boolean DEFAULT false;
  END IF;
END $$;

-- Add last_seen column to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name = 'last_seen'
  ) THEN
    ALTER TABLE public.profiles
    ADD COLUMN last_seen timestamptz DEFAULT now();
  END IF;
END $$;

-- Function to update user's online status
CREATE OR REPLACE FUNCTION public.update_user_online_status(
  user_id uuid,
  status boolean
)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET 
    online_status = status,
    last_seen = CASE WHEN status = false THEN now() ELSE last_seen END
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION public.mark_messages_as_read(
  sender_id uuid
)
RETURNS void AS $$
BEGIN
  UPDATE public.direct_messages
  SET read = true
  WHERE 
    sender_id = mark_messages_as_read.sender_id AND
    receiver_id = auth.uid() AND
    read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;