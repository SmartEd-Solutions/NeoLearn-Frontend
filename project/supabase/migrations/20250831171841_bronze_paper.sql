/*
  # Create attendance table

  1. New Tables
    - `attendance`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users.id)
      - `date` (date)
      - `status` (enum: present, absent, late, excused)
      - `remarks` (text)
      - `recorded_by` (uuid, foreign key to users.id)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on `attendance` table
    - Add policies for users to read their own attendance
    - Add policies for teachers and admins to manage attendance
*/

-- Create enum for attendance status
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused');

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  status attendance_status NOT NULL DEFAULT 'present',
  remarks text DEFAULT '',
  recorded_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own attendance"
  ON attendance
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Teachers and admins can read all attendance"
  ON attendance
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers and admins can insert attendance"
  ON attendance
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers and admins can update attendance"
  ON attendance
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );