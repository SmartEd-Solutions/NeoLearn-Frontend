/*
  # Create timetable table

  1. New Tables
    - `timetable`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users.id)
      - `subject` (text)
      - `day` (enum: Monday–Sunday)
      - `start_time` (time)
      - `end_time` (time)
      - `location` (text)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on `timetable` table
    - Add policies for users to manage their own timetable entries
    - Add policy for teachers and admins to read relevant timetables
*/

-- Create enum for days of the week
CREATE TYPE day_of_week AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');

-- Create timetable table
CREATE TABLE IF NOT EXISTS timetable (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  day day_of_week NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  location text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own timetable"
  ON timetable
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own timetable"
  ON timetable
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own timetable"
  ON timetable
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own timetable"
  ON timetable
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Teachers and admins can read all timetables"
  ON timetable
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );