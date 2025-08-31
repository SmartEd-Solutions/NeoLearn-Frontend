/*
  # Create performance table

  1. New Tables
    - `performance`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users.id)
      - `subject` (text)
      - `grade` (text)
      - `score` (integer)
      - `max_score` (integer)
      - `remarks` (text)
      - `recorded_by` (uuid, foreign key to users.id)
      - `recorded_at` (timestamp)
  
  2. Security
    - Enable RLS on `performance` table
    - Add policies for users to read their own performance
    - Add policies for teachers and admins to manage performance records
*/

-- Create performance table
CREATE TABLE IF NOT EXISTS performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  grade text NOT NULL DEFAULT '',
  score integer NOT NULL DEFAULT 0,
  max_score integer NOT NULL DEFAULT 100,
  remarks text DEFAULT '',
  recorded_by uuid REFERENCES users(id),
  recorded_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE performance ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own performance"
  ON performance
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Teachers and admins can read all performance"
  ON performance
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers and admins can insert performance"
  ON performance
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers and admins can update performance"
  ON performance
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );