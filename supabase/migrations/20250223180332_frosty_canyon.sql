/*
  # Create storage bucket for resumes

  1. New Storage Bucket
    - Creates a new storage bucket called 'resumes' for storing user resumes
    - Bucket is private by default
  
  2. Security
    - Adds policies to allow authenticated users to upload their own resumes
    - Adds policies to allow users to read their own resumes
*/

-- Create storage bucket for resumes if it doesn't exist
INSERT INTO storage.buckets (id, name)
VALUES ('resumes', 'resumes')
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload their own resumes
CREATE POLICY "Users can upload own resumes"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create policy to allow users to read their own resumes
CREATE POLICY "Users can read own resumes"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );