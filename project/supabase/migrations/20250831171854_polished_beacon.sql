/*
  # Create assistant logs table

  1. New Tables
    - `assistant_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users.id)
      - `prompt` (text)
      - `response` (text)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on `assistant_logs` table
    - Add policies for users to manage their own chat logs
    - Add policy for admins to read all logs for moderation
*/

-- Create assistant_logs table
CREATE TABLE IF NOT EXISTS assistant_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  response text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE assistant_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own assistant logs"
  ON assistant_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assistant logs"
  ON assistant_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all assistant logs"
  ON assistant_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );