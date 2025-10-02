/*
  # Pneumonia Detection Application Schema

  ## Overview
  This migration creates the complete database schema for a pneumonia detection application
  that analyzes chest X-ray images using machine learning.

  ## Tables Created

  ### 1. profiles
  - Stores user profile information linked to auth.users
  - Fields: id (references auth.users), email, full_name, role, created_at, updated_at
  - Used to extend the built-in Supabase auth with custom user data

  ### 2. xray_scans
  - Stores metadata about uploaded X-ray images
  - Fields: id, user_id, image_url, image_storage_path, file_name, file_size, upload_date
  - Links to profiles table via user_id
  - Tracks all uploaded X-ray images with their storage locations

  ### 3. detection_results
  - Stores pneumonia detection analysis results
  - Fields: id, scan_id, user_id, detection_status, confidence_score, model_version, 
    analysis_date, processing_time_ms, notes
  - Links to xray_scans and profiles tables
  - Captures detailed detection results including confidence scores and metadata

  ## Security (Row Level Security)

  ### profiles table
  1. Users can view their own profile
  2. Users can update their own profile
  3. Users can insert their own profile on signup

  ### xray_scans table
  1. Users can view only their own scans
  2. Users can insert their own scans
  3. Users can delete their own scans

  ### detection_results table
  1. Users can view only their own detection results
  2. Users can insert their own detection results

  ## Indexes
  - Created on foreign keys for optimal query performance
  - Created on frequently queried fields (user_id, analysis_date, detection_status)

  ## Important Notes
  1. All tables have RLS enabled for security
  2. Policies ensure users can only access their own data
  3. Timestamps use timestamptz for proper timezone handling
  4. Detection status uses enum for data consistency
  5. All foreign keys include ON DELETE CASCADE for data cleanup
*/

-- Create enum for detection status
DO $$ BEGIN
  CREATE TYPE detection_status AS ENUM ('positive', 'negative', 'inconclusive');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create enum for user role
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role user_role DEFAULT 'patient',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create xray_scans table
CREATE TABLE IF NOT EXISTS xray_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  image_storage_path text NOT NULL,
  file_name text NOT NULL,
  file_size integer NOT NULL,
  upload_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create detection_results table
CREATE TABLE IF NOT EXISTS detection_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid NOT NULL REFERENCES xray_scans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  detection_status detection_status NOT NULL,
  confidence_score numeric(5,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  model_version text DEFAULT 'mock-v1',
  analysis_date timestamptz DEFAULT now(),
  processing_time_ms integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_xray_scans_user_id ON xray_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_xray_scans_upload_date ON xray_scans(upload_date DESC);
CREATE INDEX IF NOT EXISTS idx_detection_results_scan_id ON detection_results(scan_id);
CREATE INDEX IF NOT EXISTS idx_detection_results_user_id ON detection_results(user_id);
CREATE INDEX IF NOT EXISTS idx_detection_results_analysis_date ON detection_results(analysis_date DESC);
CREATE INDEX IF NOT EXISTS idx_detection_results_status ON detection_results(detection_status);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE xray_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE detection_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for xray_scans table
CREATE POLICY "Users can view own scans"
  ON xray_scans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scans"
  ON xray_scans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scans"
  ON xray_scans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for detection_results table
CREATE POLICY "Users can view own detection results"
  ON detection_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own detection results"
  ON detection_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles table
DO $$ BEGIN
  CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile
DO $$ BEGIN
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;