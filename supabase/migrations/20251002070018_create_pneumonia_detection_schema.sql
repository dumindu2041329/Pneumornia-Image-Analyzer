/*
  # Pneumonia Detection Application Schema

  ## Overview
  This migration creates the complete database schema for a pneumonia detection application
  that allows users to upload chest X-rays and receive AI-powered analysis results.

  ## Tables Created

  ### 1. profiles
  Stores user profile information linked to Supabase auth.users
  - `id` (uuid, primary key) - Links to auth.users.id
  - `email` (text, unique) - User's email address
  - `full_name` (text, nullable) - User's full name
  - `created_at` (timestamptz) - Profile creation timestamp
  - `updated_at` (timestamptz) - Last profile update timestamp

  ### 2. xray_analyses
  Stores X-ray image analysis results
  - `id` (uuid, primary key) - Unique analysis identifier
  - `user_id` (uuid, foreign key) - References profiles.id
  - `image_url` (text) - URL to stored X-ray image
  - `file_name` (text) - Original filename
  - `file_size` (integer) - File size in bytes
  - `prediction` (text) - Analysis result: 'normal' or 'pneumonia'
  - `confidence` (numeric) - Prediction confidence score (0-1)
  - `processing_time` (integer, nullable) - Processing time in milliseconds
  - `model_version` (text) - AI model version used
  - `created_at` (timestamptz) - Analysis timestamp

  ## Storage

  ### Bucket: xray-images
  Stores uploaded chest X-ray images with public read access

  ## Security (Row Level Security)

  ### profiles table
  - Users can view their own profile
  - Users can update their own profile
  - Users can insert their own profile (on signup)

  ### xray_analyses table
  - Users can view only their own analyses
  - Users can insert their own analyses
  - Users can update their own analyses
  - Users can delete their own analyses

  ## Indexes
  - `idx_xray_analyses_user_id` - Fast lookups of user's analyses
  - `idx_xray_analyses_created_at` - Fast sorting by date

  ## Important Notes
  1. All tables have RLS enabled for security
  2. Foreign key constraints ensure data integrity
  3. Timestamps use `timestamptz` for timezone awareness
  4. Storage bucket configured for image uploads
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create xray_analyses table
CREATE TABLE IF NOT EXISTS xray_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  file_name text NOT NULL,
  file_size integer NOT NULL DEFAULT 0,
  prediction text NOT NULL CHECK (prediction IN ('normal', 'pneumonia')),
  confidence numeric NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  processing_time integer,
  model_version text DEFAULT 'v1.0',
  created_at timestamptz DEFAULT now()
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
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses"
  ON xray_analyses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses"
  ON xray_analyses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses"
  ON xray_analyses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create storage bucket for X-ray images
INSERT INTO storage.buckets (id, name, public)
VALUES ('xray-images', 'xray-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for xray-images bucket
CREATE POLICY "Users can upload own X-ray images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'xray-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own X-ray images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'xray-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Public can view X-ray images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'xray-images');

CREATE POLICY "Users can delete own X-ray images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'xray-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

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