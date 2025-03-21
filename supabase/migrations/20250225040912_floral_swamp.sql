/*
  # Ensure profiles exist for all users

  1. Changes
    - Add function to automatically create profiles for new users
    - Add trigger to call the function on user creation
    - Add function to ensure profiles exist for existing users
  
  2. Security
    - Functions execute with security definer to bypass RLS
*/

-- Function to handle profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', new.email),
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to create profiles for existing users
CREATE OR REPLACE FUNCTION public.create_profile_for_existing_users()
RETURNS void AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  SELECT 
    id,
    COALESCE(raw_user_meta_data->>'username', email),
    raw_user_meta_data->>'avatar_url'
  FROM auth.users
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute function to create profiles for existing users
SELECT public.create_profile_for_existing_users();