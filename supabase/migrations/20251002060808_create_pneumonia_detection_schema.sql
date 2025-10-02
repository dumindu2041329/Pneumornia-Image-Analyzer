/*
  # Pneumonia Detection System Database Schema

  ## Overview
  Creates a comprehensive database schema for a pneumonia detection system that uses AI to analyze chest X-ray images.

  ## Tables Created

  ### 1. profiles
  Stores user profile information linked to Supabase auth.users
  - `id` (uuid, primary key) - Links to auth.users.id
  - `email` (text) - User's email address
  - `full_name` (text) - User's full name
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last profile update timestamp

  ### 2. xray_analyses
  Stores X-ray image analysis results and metadata
  - `id` (uuid, primary key) - Unique analysis identifier
  - `user_id` (uuid, foreign key) - Links to profiles.id
  - `image_url` (text) - URL to stored X-ray image
  - `file_name` (text) - Original filename
  - `file_size` (integer) - File size in bytes
  - `prediction` (text) - Detection result: 'normal' or 'pneumonia'
  - `confidence` (numeric) - Confidence score (0-1)
  - `processing_time` (integer) - Analysis duration in milliseconds
  - `model_version` (text) - AI model version used
  - `created_at` (timestamptz) - Analysis timestamp

  ## Security

  ### Row Level Security (RLS)
  - All tables have RLS enabled
  - Users can only access their own data
  - Policies enforce authentication and ownership

  ### Policies Created

  #### profiles table:
  1. Users can view their own profile
  2. Users can insert their own profile
  3. Users can update their own profile

  #### xray_analyses table:
  1. Users can view their own analyses
  2. Users can insert their own analyses
  3. Users can delete their own analyses

  ## Indexes
  - Index on xray_analyses.user_id for fast user-specific queries
  - Index on xray_analyses.created_at for chronological sorting

  ## Important Notes
  - All timestamps use timestamptz for timezone awareness
  - Foreign key constraints ensure referential integrity
  - Default values are set for timestamps and IDs
  - Confidence scores are constrained between 0 and 1
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create xray_analyses table
CREATE TABLE IF NOT EXISTS xray_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  file_name text NOT NULL,
  file_size integer NOT NULL,
  prediction text NOT NULL CHECK (prediction IN ('normal', 'pneumonia')),
  confidence numeric NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  processing_time integer,
  model_version text DEFAULT 'v1.0' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_xray_analyses_user_id ON xray_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_xray_analyses_created_at ON xray_analyses(created_at DESC);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE xray_analyses ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- X-ray analyses policies
CREATE POLICY "Users can view own analyses"
  ON xray_analyses FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own analyses"
  ON xray_analyses FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own analyses"
  ON xray_analyses FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update profiles.updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();