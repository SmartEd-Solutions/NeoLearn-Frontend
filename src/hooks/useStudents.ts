import { useState, useEffect } from 'react';
import { supabase, Student, Class, User } from '@/lib/supabase';

export interface StudentWithDetails extends Student {
  user?: User;
  class?: Class;
}

export const useStudents = (userRole?: string, userId?: string) => {
  const [students, setStudents] = useState<StudentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchStudents();
    }
  }, [userId, userRole]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('students')
        .select(`
          *,
          user:users(*),
          class:classes(*)
        `);

      // Apply role-based filtering
      if (userRole === 'teacher') {
        // Teachers can only see students in their assigned classes
        const { data: teacherClasses } = await supabase
          .from('classes')
          .select('id')
          .eq('teacher_id', userId);
        
        const classIds = teacherClasses?.map(c => c.id) || [];
        if (classIds.length > 0) {
          query = query.in('class_id', classIds);
        } else {
          // Teacher has no classes, return empty array
          setStudents([]);
          setLoading(false);
          return;
        }
      } else if (userRole === 'student') {
        // Students can only see their own record
        query = query.eq('user_id', userId);
      }
      // Admins can see all students (no additional filter)

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching students:', error);
      } else {
        setStudents(data || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async (studentData: {
    full_name: string;
    email: string;
    student_id: string;
    class_id?: string;
    parent_name: string;
    parent_email?: string;
    parent_phone?: string;
    enrollment_date: string;
  }) => {
    try {
      // First create the user account
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: studentData.email,
        password: 'temp123456', // Temporary password
        email_confirm: true,
        user_metadata: {
          full_name: studentData.full_name,
          role: 'student'
        }
      });

      if (authError) {
        console.error('Error creating user:', authError);
        return { data: null, error: authError };
      }

      // Then create the student record
      const { data, error } = await supabase
        .from('students')
        .insert([{
          user_id: authData.user.id,
          student_id: studentData.student_id,
          class_id: studentData.class_id,
          parent_name: studentData.parent_name,
          parent_email: studentData.parent_email,
          parent_phone: studentData.parent_phone,
          enrollment_date: studentData.enrollment_date,
        }])
        .select(`
          *,
          user:users(*),
          class:classes(*)
        `)
        .single();

      if (error) {
        console.error('Error creating student:', error);
        return { data: null, error };
      }

      setStudents(prev => [data, ...prev]);
      return { data, error: null };
    } catch (error) {
      console.error('Error creating student:', error);
      return { data: null, error };
    }
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          user:users(*),
          class:classes(*)
        `)
        .single();

      if (error) {
        console.error('Error updating student:', error);
        return { data: null, error };
      }

      setStudents(prev => prev.map(student => student.id === id ? data : student));
      return { data, error: null };
    } catch (error) {
      console.error('Error updating student:', error);
      return { data: null, error };
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting student:', error);
        return { error };
      }

      setStudents(prev => prev.filter(student => student.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Error deleting student:', error);
      return { error };
    }
  };

  const getStudentsByClass = (classId: string) => {
    return students.filter(student => student.class_id === classId);
  };

  return {
    students,
    loading,
    addStudent,
    updateStudent,
    deleteStudent,
    getStudentsByClass,
    refetch: fetchStudents,
  };
};