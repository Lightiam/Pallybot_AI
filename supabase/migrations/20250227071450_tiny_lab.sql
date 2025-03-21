/*
  # Super Admin System

  1. New Tables
    - `admin_roles` - Defines admin role types and permissions
    - `admin_users` - Links profiles to admin roles
    - `admin_logs` - Tracks admin actions for auditing
    - `user_bans` - Stores user ban information
    - `app_analytics` - Stores application usage analytics

  2. Security
    - Enable RLS on all new tables
    - Add policies for admin access
    - Add functions for admin operations
*/

-- Create admin_roles table
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role_id uuid REFERENCES public.admin_roles(id) ON DELETE CASCADE NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- Create admin_logs table
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES public.admin_users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Create user_bans table
CREATE TABLE IF NOT EXISTS public.user_bans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reason text,
  banned_by uuid REFERENCES public.admin_users(id) ON DELETE SET NULL,
  banned_until timestamptz,
  is_permanent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create app_analytics table
CREATE TABLE IF NOT EXISTS public.app_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  event_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_analytics ENABLE ROW LEVEL SECURITY;

-- Create default admin roles
INSERT INTO public.admin_roles (name, description, permissions)
VALUES 
  ('super_admin', 'Full system access with all permissions', '{
    "users": {"view": true, "create": true, "update": true, "delete": true, "ban": true},
    "content": {"view": true, "create": true, "update": true, "delete": true, "approve": true},
    "analytics": {"view": true, "export": true},
    "settings": {"view": true, "update": true},
    "roles": {"view": true, "create": true, "update": true, "delete": true, "assign": true},
    "logs": {"view": true}
  }'::jsonb),
  ('content_admin', 'Manages content and moderate users', '{
    "users": {"view": true, "update": true, "ban": true},
    "content": {"view": true, "create": true, "update": true, "delete": true, "approve": true},
    "analytics": {"view": true},
    "settings": {"view": true},
    "logs": {"view": true}
  }'::jsonb),
  ('user_admin', 'Manages users and user-related issues', '{
    "users": {"view": true, "create": true, "update": true, "ban": true},
    "content": {"view": true},
    "analytics": {"view": true},
    "settings": {"view": false},
    "logs": {"view": true}
  }'::jsonb);

-- Create function to check if user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(role_name text DEFAULT NULL)
RETURNS boolean AS $$
DECLARE
  is_admin boolean;
BEGIN
  IF role_name IS NULL THEN
    -- Check if user is any type of admin
    SELECT EXISTS (
      SELECT 1 FROM public.admin_users au
      JOIN public.admin_roles ar ON au.role_id = ar.id
      WHERE au.user_id = auth.uid() AND au.is_active = true
    ) INTO is_admin;
  ELSE
    -- Check if user has specific admin role
    SELECT EXISTS (
      SELECT 1 FROM public.admin_users au
      JOIN public.admin_roles ar ON au.role_id = ar.id
      WHERE au.user_id = auth.uid() AND ar.name = role_name AND au.is_active = true
    ) INTO is_admin;
  END IF;
  
  RETURN is_admin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user has specific permission
CREATE OR REPLACE FUNCTION public.has_permission(permission_path text)
RETURNS boolean AS $$
DECLARE
  admin_permissions jsonb;
  permission_parts text[];
  current_path jsonb;
BEGIN
  -- Get user's permissions from their admin role
  SELECT ar.permissions INTO admin_permissions
  FROM public.admin_users au
  JOIN public.admin_roles ar ON au.role_id = ar.id
  WHERE au.user_id = auth.uid() AND au.is_active = true
  LIMIT 1;
  
  -- If no permissions found, user doesn't have access
  IF admin_permissions IS NULL THEN
    RETURN false;
  END IF;
  
  -- Parse permission path (e.g., "users.create")
  permission_parts := string_to_array(permission_path, '.');
  
  -- Navigate through the permission JSON
  IF array_length(permission_parts, 1) = 2 THEN
    RETURN (admin_permissions -> permission_parts[1] -> permission_parts[2])::boolean;
  ELSE
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  action text,
  entity_type text,
  entity_id uuid,
  details jsonb DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  admin_user_id uuid;
  log_id uuid;
BEGIN
  -- Get admin user ID
  SELECT id INTO admin_user_id
  FROM public.admin_users
  WHERE user_id = auth.uid() AND is_active = true
  LIMIT 1;
  
  -- Insert log entry
  INSERT INTO public.admin_logs (
    admin_id,
    action,
    entity_type,
    entity_id,
    details,
    ip_address
  )
  VALUES (
    admin_user_id,
    action,
    entity_type,
    entity_id,
    details,
    current_setting('request.headers', true)::json->>'x-forwarded-for'
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to ban a user
CREATE OR REPLACE FUNCTION public.ban_user(
  target_user_id uuid,
  ban_reason text,
  ban_duration interval DEFAULT NULL,
  is_permanent boolean DEFAULT false
)
RETURNS boolean AS $$
DECLARE
  admin_user_id uuid;
  ban_until timestamptz;
BEGIN
  -- Check if caller has ban permission
  IF NOT public.has_permission('users.ban') THEN
    RAISE EXCEPTION 'Permission denied: users.ban';
  END IF;
  
  -- Get admin user ID
  SELECT id INTO admin_user_id
  FROM public.admin_users
  WHERE user_id = auth.uid() AND is_active = true
  LIMIT 1;
  
  -- Calculate ban end time if not permanent
  IF NOT is_permanent AND ban_duration IS NOT NULL THEN
    ban_until := now() + ban_duration;
  ELSE
    ban_until := NULL;
  END IF;
  
  -- Insert or update ban record
  INSERT INTO public.user_bans (
    user_id,
    reason,
    banned_by,
    banned_until,
    is_permanent
  )
  VALUES (
    target_user_id,
    ban_reason,
    admin_user_id,
    ban_until,
    is_permanent
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    reason = EXCLUDED.reason,
    banned_by = EXCLUDED.banned_by,
    banned_until = EXCLUDED.banned_until,
    is_permanent = EXCLUDED.is_permanent,
    updated_at = now();
  
  -- Log the action
  PERFORM public.log_admin_action(
    'ban_user',
    'profiles',
    target_user_id,
    jsonb_build_object(
      'reason', ban_reason,
      'duration', ban_duration,
      'is_permanent', is_permanent
    )
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to unban a user
CREATE OR REPLACE FUNCTION public.unban_user(target_user_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Check if caller has ban permission
  IF NOT public.has_permission('users.ban') THEN
    RAISE EXCEPTION 'Permission denied: users.ban';
  END IF;
  
  -- Delete ban record
  DELETE FROM public.user_bans
  WHERE user_id = target_user_id;
  
  -- Log the action
  PERFORM public.log_admin_action(
    'unban_user',
    'profiles',
    target_user_id,
    NULL
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if a user is banned
CREATE OR REPLACE FUNCTION public.is_user_banned(check_user_id uuid DEFAULT NULL)
RETURNS boolean AS $$
DECLARE
  user_id uuid;
  is_banned boolean;
BEGIN
  -- Use provided user ID or current user
  user_id := COALESCE(check_user_id, auth.uid());
  
  -- Check if user has an active ban
  SELECT EXISTS (
    SELECT 1 FROM public.user_bans
    WHERE user_id = user_id
    AND (
      is_permanent = true
      OR banned_until > now()
    )
  ) INTO is_banned;
  
  RETURN is_banned;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to promote a user to admin
CREATE OR REPLACE FUNCTION public.promote_to_admin(
  target_user_id uuid,
  role_name text DEFAULT 'user_admin'
)
RETURNS boolean AS $$
DECLARE
  role_id uuid;
BEGIN
  -- Check if caller has permission to assign roles
  IF NOT public.has_permission('roles.assign') THEN
    RAISE EXCEPTION 'Permission denied: roles.assign';
  END IF;
  
  -- Get role ID
  SELECT id INTO role_id
  FROM public.admin_roles
  WHERE name = role_name;
  
  IF role_id IS NULL THEN
    RAISE EXCEPTION 'Invalid role name: %', role_name;
  END IF;
  
  -- Add user to admin_users
  INSERT INTO public.admin_users (
    user_id,
    role_id,
    is_active
  )
  VALUES (
    target_user_id,
    role_id,
    true
  )
  ON CONFLICT (user_id, role_id) DO UPDATE
  SET
    is_active = true,
    updated_at = now();
  
  -- Log the action
  PERFORM public.log_admin_action(
    'promote_to_admin',
    'profiles',
    target_user_id,
    jsonb_build_object('role', role_name)
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to revoke admin privileges
CREATE OR REPLACE FUNCTION public.revoke_admin(target_user_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Check if caller has permission to assign roles
  IF NOT public.has_permission('roles.assign') THEN
    RAISE EXCEPTION 'Permission denied: roles.assign';
  END IF;
  
  -- Set admin user as inactive
  UPDATE public.admin_users
  SET is_active = false, updated_at = now()
  WHERE user_id = target_user_id;
  
  -- Log the action
  PERFORM public.log_admin_action(
    'revoke_admin',
    'profiles',
    target_user_id,
    NULL
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to track analytics events
CREATE OR REPLACE FUNCTION public.track_analytics_event(
  event_type text,
  event_data jsonb DEFAULT '{}'::jsonb,
  session_id text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  analytics_id uuid;
BEGIN
  INSERT INTO public.app_analytics (
    event_type,
    event_data,
    user_id,
    session_id
  )
  VALUES (
    event_type,
    event_data,
    auth.uid(),
    session_id
  )
  RETURNING id INTO analytics_id;
  
  RETURN analytics_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies

-- Admin Roles policies
CREATE POLICY "Super admins can manage roles"
  ON public.admin_roles
  USING (public.is_admin('super_admin'));

-- Admin Users policies
CREATE POLICY "Super admins can manage admin users"
  ON public.admin_users
  USING (public.is_admin('super_admin'));

-- Admin Logs policies
CREATE POLICY "Admins can view logs"
  ON public.admin_logs
  FOR SELECT
  USING (public.has_permission('logs.view'));

-- User Bans policies
CREATE POLICY "Admins can manage bans"
  ON public.user_bans
  USING (public.has_permission('users.ban'));

CREATE POLICY "Users can see if they are banned"
  ON public.user_bans
  FOR SELECT
  USING (auth.uid() = user_id);

-- App Analytics policies
CREATE POLICY "Admins can view analytics"
  ON public.app_analytics
  FOR SELECT
  USING (public.has_permission('analytics.view'));

CREATE POLICY "Anyone can insert analytics"
  ON public.app_analytics
  FOR INSERT
  WITH CHECK (true);