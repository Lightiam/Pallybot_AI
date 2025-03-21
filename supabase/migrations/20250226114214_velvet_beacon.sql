/*
  # Training Management System Schema with Role Support

  1. Schema Updates
    - Add role column to profiles table
    - Create training management tables
    - Set up RLS policies
    - Add helper functions

  2. Changes
    - Added role column to profiles table
    - Created training-related tables
    - Implemented RLS policies
    - Added progress tracking functions

  3. Security
    - RLS enabled for all tables
    - Role-based access control
    - Secure data access patterns
*/

-- Add role column to profiles table if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles
    ADD COLUMN role text CHECK (role IN ('trainee', 'trainer', 'admin')) DEFAULT 'trainee';
  END IF;
END $$;

-- Create training_categories table
CREATE TABLE IF NOT EXISTS public.training_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create trainings table
CREATE TABLE IF NOT EXISTS public.trainings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category_id uuid REFERENCES public.training_categories(id),
  duration interval NOT NULL,
  learning_objectives text[],
  prerequisites text[],
  target_audience text,
  max_participants integer,
  status text CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  start_date timestamptz,
  end_date timestamptz,
  created_by uuid REFERENCES public.profiles(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create training_modules table
CREATE TABLE IF NOT EXISTS public.training_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid REFERENCES public.trainings(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  content jsonb NOT NULL,
  order_index integer NOT NULL,
  duration interval,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(training_id, order_index)
);

-- Create module_prerequisites table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.module_prerequisites (
  module_id uuid REFERENCES public.training_modules(id) ON DELETE CASCADE,
  prerequisite_id uuid REFERENCES public.training_modules(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (module_id, prerequisite_id),
  -- Prevent self-referencing prerequisites
  CONSTRAINT no_self_prerequisite CHECK (module_id != prerequisite_id)
);

-- Create training_enrollments table
CREATE TABLE IF NOT EXISTS public.training_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid REFERENCES public.trainings(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text CHECK (status IN ('enrolled', 'in_progress', 'completed', 'dropped')) DEFAULT 'enrolled',
  progress jsonb DEFAULT '{"completed_modules": [], "current_module": null, "progress_percentage": 0}'::jsonb,
  enrolled_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(training_id, user_id)
);

-- Create training_assessments table
CREATE TABLE IF NOT EXISTS public.training_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid REFERENCES public.trainings(id) ON DELETE CASCADE,
  module_id uuid REFERENCES public.training_modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  questions jsonb NOT NULL,
  passing_score integer NOT NULL,
  duration interval,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create training_submissions table
CREATE TABLE IF NOT EXISTS public.training_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid REFERENCES public.training_assessments(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  answers jsonb NOT NULL,
  score integer,
  feedback text,
  submitted_at timestamptz DEFAULT now(),
  UNIQUE(assessment_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.training_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_submissions ENABLE ROW LEVEL SECURITY;

-- Categories Policies
CREATE POLICY "Anyone can view categories"
  ON public.training_categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Trainers can manage categories"
  ON public.training_categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND (role = 'trainer' OR role = 'admin')
    )
  );

-- Trainings Policies
CREATE POLICY "Anyone can view published trainings"
  ON public.trainings
  FOR SELECT
  TO public
  USING (status = 'published');

CREATE POLICY "Trainers can manage trainings"
  ON public.trainings
  FOR ALL
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND (role = 'trainer' OR role = 'admin')
    )
  );

-- Modules Policies
CREATE POLICY "Enrolled users can view modules"
  ON public.training_modules
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.training_enrollments
      WHERE training_id = training_modules.training_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Trainers can manage modules"
  ON public.training_modules
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.trainings
      WHERE id = training_modules.training_id
      AND (created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid()
          AND (role = 'trainer' OR role = 'admin')
        )
      )
    )
  );

-- Prerequisites Policies
CREATE POLICY "Anyone can view prerequisites"
  ON public.module_prerequisites
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Trainers can manage prerequisites"
  ON public.module_prerequisites
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.training_modules m
      JOIN public.trainings t ON t.id = m.training_id
      WHERE m.id = module_prerequisites.module_id
      AND (t.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid()
          AND (role = 'trainer' OR role = 'admin')
        )
      )
    )
  );

-- Enrollments Policies
CREATE POLICY "Users can view own enrollments"
  ON public.training_enrollments
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can enroll in trainings"
  ON public.training_enrollments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.trainings
      WHERE id = training_id
      AND status = 'published'
    )
  );

-- Assessments Policies
CREATE POLICY "Enrolled users can view assessments"
  ON public.training_assessments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.training_enrollments
      WHERE training_id = training_assessments.training_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Trainers can manage assessments"
  ON public.training_assessments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.trainings
      WHERE id = training_assessments.training_id
      AND (created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid()
          AND (role = 'trainer' OR role = 'admin')
        )
      )
    )
  );

-- Submissions Policies
CREATE POLICY "Users can view own submissions"
  ON public.training_submissions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can submit assessments"
  ON public.training_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.training_enrollments
      WHERE training_id = (
        SELECT training_id FROM public.training_assessments
        WHERE id = assessment_id
      )
      AND user_id = auth.uid()
    )
  );

-- Functions

-- Function to update training progress
CREATE OR REPLACE FUNCTION public.update_training_progress()
RETURNS trigger AS $$
BEGIN
  WITH module_count AS (
    SELECT COUNT(*) as total_modules
    FROM public.training_modules
    WHERE training_id = NEW.training_id
  ),
  completed_count AS (
    SELECT ARRAY_LENGTH(NEW.progress->>'completed_modules', 1) as completed_modules
  )
  UPDATE public.training_enrollments
  SET progress = jsonb_set(
    NEW.progress,
    '{progress_percentage}',
    to_jsonb(
      ROUND(
        (completed_count.completed_modules::float / module_count.total_modules::float) * 100
      )::int
    )
  )
  FROM module_count, completed_count
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for progress updates
CREATE TRIGGER on_training_progress_update
  BEFORE UPDATE OF progress ON public.training_enrollments
  FOR EACH ROW
  WHEN (OLD.progress IS DISTINCT FROM NEW.progress)
  EXECUTE FUNCTION public.update_training_progress();

-- Function to check enrollment capacity
CREATE OR REPLACE FUNCTION public.check_enrollment_capacity()
RETURNS trigger AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.trainings t
    WHERE t.id = NEW.training_id
    AND t.max_participants IS NOT NULL
    AND (
      SELECT COUNT(*) FROM public.training_enrollments
      WHERE training_id = t.id
    ) >= t.max_participants
  ) THEN
    RAISE EXCEPTION 'Training has reached maximum capacity';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for enrollment capacity check
CREATE TRIGGER before_enrollment_insert
  BEFORE INSERT ON public.training_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.check_enrollment_capacity();