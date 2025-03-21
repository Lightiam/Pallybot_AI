-- Check if calendar_events table exists before creating it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'calendar_events'
  ) THEN
    -- Create calendar_events table
    CREATE TABLE public.calendar_events (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
      title text NOT NULL,
      description text,
      start_time timestamptz NOT NULL,
      end_time timestamptz,
      all_day boolean DEFAULT false,
      location text,
      color text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    -- Enable Row Level Security
    ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

    -- Create indexes for faster event retrieval
    CREATE INDEX calendar_events_user_id_idx
      ON public.calendar_events (user_id);

    CREATE INDEX calendar_events_start_time_idx
      ON public.calendar_events (start_time);
  END IF;
END $$;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can create their own events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can update their own events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can delete their own events" ON public.calendar_events;

-- Create policies
CREATE POLICY "Users can view their own events"
  ON public.calendar_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own events"
  ON public.calendar_events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events"
  ON public.calendar_events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events"
  ON public.calendar_events
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_calendar_event_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists and recreate it
DROP TRIGGER IF EXISTS update_calendar_event_updated_at ON public.calendar_events;
CREATE TRIGGER update_calendar_event_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_calendar_event_updated_at();

-- Create or replace function to get upcoming events
CREATE OR REPLACE FUNCTION public.get_upcoming_events(
  days_ahead integer DEFAULT 7
)
RETURNS SETOF public.calendar_events AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.calendar_events
  WHERE user_id = auth.uid()
    AND start_time >= now()
    AND start_time <= now() + (days_ahead || ' days')::interval
  ORDER BY start_time ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;