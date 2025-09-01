/*
  # Enhanced School Management System Schema

  1. New Tables
    - `classes` - Class/grade information (e.g., Grade 9A, Grade 10B)
      - `id` (uuid, primary key)
      - `name` (text) - Class name like "Grade 9A"
      - `grade_level` (integer) - Grade level (9, 10, 11, 12)
      - `academic_year` (text) - Academic year like "2024-2025"
      - `teacher_id` (uuid) - Class teacher reference
      - `max_students` (integer) - Maximum students allowed
      - `created_at` (timestamp)

    - `students` - Student information
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to auth.users
      - `student_id` (text) - Unique student identifier
      - `class_id` (uuid) - Reference to classes table
      - `parent_name` (text) - Parent/guardian name
      - `parent_email` (text) - Parent contact email
      - `parent_phone` (text) - Parent contact phone
      - `enrollment_date` (date) - When student enrolled
      - `status` (text) - active, inactive, graduated, transferred
      - `created_at` (timestamp)

    - `subjects` - Subject information
      - `id` (uuid, primary key)
      - `name` (text) - Subject name
      - `code` (text) - Subject code like "MATH101"
      - `description` (text) - Subject description
      - `grade_levels` (integer[]) - Which grades this subject is for
      - `created_at` (timestamp)

    - `teacher_subjects` - Many-to-many relationship between teachers and subjects
      - `id` (uuid, primary key)
      - `teacher_id` (uuid) - Reference to users table
      - `subject_id` (uuid) - Reference to subjects table
      - `class_id` (uuid) - Reference to classes table
      - `created_at` (timestamp)

  2. Updated Tables
    - Enhanced `timetable` table with class and subject references
    - Enhanced `attendance` table with class context
    - Enhanced `performance` table with subject references
    - Enhanced `users` table with additional fields

  3. Security
    - Enable RLS on all new tables
    - Add comprehensive policies for role-based access
    - Students can only see their own data
    - Teachers can see data for their assigned classes
    - Admins can see all data
*/

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  grade_level integer NOT NULL CHECK (grade_level >= 6 AND grade_level <= 12),
  academic_year text NOT NULL DEFAULT '2024-2025',
  teacher_id uuid REFERENCES users(id),
  max_students integer DEFAULT 30,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text DEFAULT '',
  grade_levels integer[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id text UNIQUE NOT NULL,
  class_id uuid REFERENCES classes(id),
  parent_name text NOT NULL DEFAULT '',
  parent_email text DEFAULT '',
  parent_phone text DEFAULT '',
  enrollment_date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated', 'transferred')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create teacher_subjects junction table
CREATE TABLE IF NOT EXISTS teacher_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(teacher_id, subject_id, class_id)
);

ALTER TABLE teacher_subjects ENABLE ROW LEVEL SECURITY;

-- Add new columns to existing tables
DO $$
BEGIN
  -- Add class_id and subject_id to timetable
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'timetable' AND column_name = 'class_id'
  ) THEN
    ALTER TABLE timetable ADD COLUMN class_id uuid REFERENCES classes(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'timetable' AND column_name = 'subject_id'
  ) THEN
    ALTER TABLE timetable ADD COLUMN subject_id uuid REFERENCES subjects(id);
  END IF;

  -- Add class_id to attendance
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'attendance' AND column_name = 'class_id'
  ) THEN
    ALTER TABLE attendance ADD COLUMN class_id uuid REFERENCES classes(id);
  END IF;

  -- Add subject_id to performance
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'performance' AND column_name = 'subject_id'
  ) THEN
    ALTER TABLE performance ADD COLUMN subject_id uuid REFERENCES subjects(id);
  END IF;

  -- Add additional fields to users table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'phone'
  ) THEN
    ALTER TABLE users ADD COLUMN phone text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'address'
  ) THEN
    ALTER TABLE users ADD COLUMN address text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE users ADD COLUMN date_of_birth date;
  END IF;
END $$;

-- RLS Policies for classes table
CREATE POLICY "Admins can manage all classes"
  ON classes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Teachers can view their assigned classes"
  ON classes
  FOR SELECT
  TO authenticated
  USING (
    teacher_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Students can view their class"
  ON classes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.user_id = auth.uid() AND students.class_id = classes.id
    )
  );

-- RLS Policies for subjects table
CREATE POLICY "Everyone can view subjects"
  ON subjects
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage subjects"
  ON subjects
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- RLS Policies for students table
CREATE POLICY "Admins can manage all students"
  ON students
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Teachers can view students in their classes"
  ON students
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = students.class_id 
      AND classes.teacher_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Students can view their own data"
  ON students
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for teacher_subjects table
CREATE POLICY "Admins can manage teacher subjects"
  ON teacher_subjects
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Teachers can view their assignments"
  ON teacher_subjects
  FOR SELECT
  TO authenticated
  USING (
    teacher_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Insert sample data
INSERT INTO subjects (name, code, description, grade_levels) VALUES
  ('Mathematics', 'MATH', 'Core mathematics curriculum', ARRAY[6,7,8,9,10,11,12]),
  ('English Language Arts', 'ELA', 'Reading, writing, and literature', ARRAY[6,7,8,9,10,11,12]),
  ('Science', 'SCI', 'General science and laboratory work', ARRAY[6,7,8,9,10,11,12]),
  ('History', 'HIST', 'World and national history', ARRAY[6,7,8,9,10,11,12]),
  ('Physical Education', 'PE', 'Physical fitness and sports', ARRAY[6,7,8,9,10,11,12]),
  ('Art', 'ART', 'Visual arts and creativity', ARRAY[6,7,8,9,10,11,12]),
  ('Music', 'MUS', 'Music theory and performance', ARRAY[6,7,8,9,10,11,12]),
  ('Computer Science', 'CS', 'Programming and digital literacy', ARRAY[9,10,11,12]),
  ('Chemistry', 'CHEM', 'Advanced chemistry concepts', ARRAY[10,11,12]),
  ('Physics', 'PHYS', 'Physics principles and applications', ARRAY[10,11,12])
ON CONFLICT (code) DO NOTHING;

-- Insert sample classes
INSERT INTO classes (name, grade_level, academic_year, max_students) VALUES
  ('Grade 6A', 6, '2024-2025', 25),
  ('Grade 6B', 6, '2024-2025', 25),
  ('Grade 7A', 7, '2024-2025', 28),
  ('Grade 7B', 7, '2024-2025', 28),
  ('Grade 8A', 8, '2024-2025', 30),
  ('Grade 8B', 8, '2024-2025', 30),
  ('Grade 9A', 9, '2024-2025', 30),
  ('Grade 9B', 9, '2024-2025', 30),
  ('Grade 10A', 10, '2024-2025', 32),
  ('Grade 10B', 10, '2024-2025', 32),
  ('Grade 11A', 11, '2024-2025', 35),
  ('Grade 11B', 11, '2024-2025', 35),
  ('Grade 12A', 12, '2024-2025', 35),
  ('Grade 12B', 12, '2024-2025', 35)
ON CONFLICT DO NOTHING;