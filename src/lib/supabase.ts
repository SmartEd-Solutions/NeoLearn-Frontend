import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mswupuykzpooozfbitmx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zd3VwdXlrenBvb296ZmJpdG14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2Mjg0MzEsImV4cCI6MjA3MjIwNDQzMX0.uQ_CcDv9o1DcjDyoL2bybkDHs4LE9AqmpE4vXawm-Kg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type UserRole = 'student' | 'teacher' | 'admin';
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type StudentStatus = 'active' | 'inactive' | 'graduated' | 'transferred';
export type ThemeOption = 'light' | 'dark' | 'system';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  created_at: string;
}

export interface Class {
  id: string;
  name: string;
  grade_level: number;
  academic_year: string;
  teacher_id?: string;
  max_students: number;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  grade_levels: number[];
  created_at: string;
}

export interface Student {
  id: string;
  user_id: string;
  student_id: string;
  class_id?: string;
  parent_name: string;
  parent_email?: string;
  parent_phone?: string;
  enrollment_date: string;
  status: StudentStatus;
  created_at: string;
}

export interface TeacherSubject {
  id: string;
  teacher_id: string;
  subject_id: string;
  class_id: string;
  created_at: string;
}

export interface TimetableEntry {
  id: string;
  user_id: string;
  subject: string;
  day: DayOfWeek;
  start_time: string;
  end_time: string;
  location: string;
  created_at: string;
  class_id?: string;
  subject_id?: string;
}

export interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  status: AttendanceStatus;
  remarks: string;
  recorded_by?: string;
  created_at: string;
  class_id?: string;
}

export interface PerformanceRecord {
  id: string;
  user_id: string;
  subject: string;
  grade: string;
  score: number;
  max_score: number;
  remarks: string;
  recorded_by?: string;
  recorded_at: string;
  subject_id?: string;
}

export interface AssistantLog {
  id: string;
  user_id: string;
  prompt: string;
  response: string;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme: ThemeOption;
  notifications_enabled: boolean;
  language: string;
  updated_at: string;
}