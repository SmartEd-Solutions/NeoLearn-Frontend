import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type UserRole = 'student' | 'teacher' | 'admin';
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type ThemeOption = 'light' | 'dark' | 'system';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
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
}

export interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  status: AttendanceStatus;
  remarks: string;
  recorded_by?: string;
  created_at: string;
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