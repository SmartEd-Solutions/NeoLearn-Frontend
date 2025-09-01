-- Create enum types for better data integrity
CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused');
CREATE TYPE day_of_week AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
CREATE TYPE student_status AS ENUM ('active', 'inactive', 'graduated', 'transferred');

-- Create users table for additional profile information
CREATE TABLE public.users (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  phone TEXT,
  address TEXT,
  date_of_birth DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create classes table
CREATE TABLE public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  grade_level INTEGER NOT NULL,
  academic_year TEXT NOT NULL DEFAULT EXTRACT(YEAR FROM now())::TEXT,
  teacher_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  max_students INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  grade_levels INTEGER[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL UNIQUE,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  parent_name TEXT NOT NULL,
  parent_email TEXT,
  parent_phone TEXT,
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status student_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create teacher_subjects table for many-to-many relationship
CREATE TABLE public.teacher_subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(teacher_id, subject_id, class_id)
);

-- Create timetable table
CREATE TABLE public.timetable (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  day day_of_week NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status attendance_status NOT NULL,
  remarks TEXT DEFAULT '',
  recorded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create performance table
CREATE TABLE public.performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  grade TEXT NOT NULL,
  score NUMERIC(5,2) NOT NULL,
  max_score NUMERIC(5,2) NOT NULL DEFAULT 100,
  remarks TEXT DEFAULT '',
  recorded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assistant_logs table
CREATE TABLE public.assistant_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_settings table
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  theme TEXT NOT NULL DEFAULT 'system',
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  language TEXT NOT NULL DEFAULT 'en',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.users WHERE id = user_id;
$$;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile and admins can view all" ON public.users
  FOR SELECT USING (auth.uid() = id OR public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can update their own profile and admins can update all" ON public.users
  FOR UPDATE USING (auth.uid() = id OR public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Only admins can insert users" ON public.users
  FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for classes table
CREATE POLICY "Everyone can view classes" ON public.classes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can manage classes" ON public.classes
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for subjects table
CREATE POLICY "Everyone can view subjects" ON public.subjects
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can manage subjects" ON public.subjects
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for students table
CREATE POLICY "Students can view their own record, teachers their class students, admins all" ON public.students
  FOR SELECT USING (
    user_id = auth.uid() OR
    public.get_user_role(auth.uid()) = 'admin' OR
    (public.get_user_role(auth.uid()) = 'teacher' AND class_id IN (
      SELECT id FROM public.classes WHERE teacher_id = auth.uid()
    ))
  );

CREATE POLICY "Only admins can manage students" ON public.students
  FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Only admins can update students" ON public.students
  FOR UPDATE USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Only admins can delete students" ON public.students
  FOR DELETE USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for teacher_subjects table
CREATE POLICY "Teachers can view their subjects, admins all" ON public.teacher_subjects
  FOR SELECT USING (
    teacher_id = auth.uid() OR
    public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Only admins can manage teacher subjects" ON public.teacher_subjects
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for timetable table
CREATE POLICY "Users can view their own timetable, teachers their class timetables, admins all" ON public.timetable
  FOR SELECT USING (
    user_id = auth.uid() OR
    public.get_user_role(auth.uid()) = 'admin' OR
    (public.get_user_role(auth.uid()) = 'teacher' AND class_id IN (
      SELECT id FROM public.classes WHERE teacher_id = auth.uid()
    ))
  );

CREATE POLICY "Only admins and teachers can manage timetables" ON public.timetable
  FOR ALL USING (
    public.get_user_role(auth.uid()) IN ('admin', 'teacher')
  );

-- RLS Policies for attendance table
CREATE POLICY "Users can view their own attendance, teachers their class attendance, admins all" ON public.attendance
  FOR SELECT USING (
    user_id = auth.uid() OR
    public.get_user_role(auth.uid()) = 'admin' OR
    (public.get_user_role(auth.uid()) = 'teacher' AND class_id IN (
      SELECT id FROM public.classes WHERE teacher_id = auth.uid()
    ))
  );

CREATE POLICY "Teachers and admins can manage attendance" ON public.attendance
  FOR ALL USING (
    public.get_user_role(auth.uid()) IN ('admin', 'teacher')
  );

-- RLS Policies for performance table
CREATE POLICY "Users can view their own performance, teachers their class performance, admins all" ON public.performance
  FOR SELECT USING (
    user_id = auth.uid() OR
    public.get_user_role(auth.uid()) = 'admin' OR
    (public.get_user_role(auth.uid()) = 'teacher' AND recorded_by = auth.uid())
  );

CREATE POLICY "Teachers and admins can manage performance" ON public.performance
  FOR ALL USING (
    public.get_user_role(auth.uid()) IN ('admin', 'teacher')
  );

-- RLS Policies for assistant_logs table
CREATE POLICY "Users can view their own assistant logs, admins all" ON public.assistant_logs
  FOR SELECT USING (
    user_id = auth.uid() OR
    public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Authenticated users can insert their own assistant logs" ON public.assistant_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for user_settings table
CREATE POLICY "Users can manage their own settings" ON public.user_settings
  FOR ALL USING (user_id = auth.uid());

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    COALESCE((new.raw_user_meta_data ->> 'role')::user_role, 'student')
  );
  
  INSERT INTO public.user_settings (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user_settings updated_at
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default subjects
INSERT INTO public.subjects (name, code, description, grade_levels) VALUES
('Mathematics', 'MATH', 'Mathematics and Algebra', ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]),
('English', 'ENG', 'English Language and Literature', ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]),
('Science', 'SCI', 'General Science', ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]),
('History', 'HIST', 'World and Local History', ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]),
('Geography', 'GEO', 'Physical and Human Geography', ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]),
('Physical Education', 'PE', 'Physical Education and Sports', ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]),
('Art', 'ART', 'Visual Arts and Creativity', ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]),
('Music', 'MUS', 'Music Theory and Practice', ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]);