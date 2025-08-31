/*
  # Create settings table

  1. New Tables
    - `settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users.id, unique)
      - `theme` (enum: light, dark, system)
      - `notifications_enabled` (boolean)
      - `language` (text)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `settings` table
    - Add policies for users to manage their own settings
*/

-- Create enum for theme options
CREATE TYPE theme_option AS ENUM ('light', 'dark', 'system');

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  theme theme_option NOT NULL DEFAULT 'system',
  notifications_enabled boolean NOT NULL DEFAULT true,
  language text NOT NULL DEFAULT 'en',
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own settings"
  ON settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to create default settings for new users
CREATE OR REPLACE FUNCTION create_user_settings()
RETURNS trigger AS $$
BEGIN
  INSERT INTO settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create settings when user is created
DROP TRIGGER IF EXISTS on_user_created ON users;
CREATE TRIGGER on_user_created
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_user_settings();