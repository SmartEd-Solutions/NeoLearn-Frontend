import { useState, useEffect } from 'react';
import { supabase, Class, User } from '@/lib/supabase';

export interface ClassWithDetails extends Class {
  teacher?: User;
  student_count?: number;
}

export const useClasses = () => {
  const [classes, setClasses] = useState<ClassWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          teacher:users(*),
          students(count)
        `)
        .order('grade_level', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching classes:', error);
      } else {
        const classesWithCount = data?.map(cls => ({
          ...cls,
          student_count: cls.students?.[0]?.count || 0
        })) || [];
        setClasses(classesWithCount);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const addClass = async (classData: Omit<Class, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .insert([classData])
        .select(`
          *,
          teacher:users(*)
        `)
        .single();

      if (error) {
        console.error('Error adding class:', error);
        return { data: null, error };
      }

      setClasses(prev => [...prev, { ...data, student_count: 0 }]);
      return { data, error: null };
    } catch (error) {
      console.error('Error adding class:', error);
      return { data: null, error };
    }
  };

  const updateClass = async (id: string, updates: Partial<Class>) => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          teacher:users(*)
        `)
        .single();

      if (error) {
        console.error('Error updating class:', error);
        return { data: null, error };
      }

      setClasses(prev => prev.map(cls => cls.id === id ? { ...data, student_count: cls.student_count } : cls));
      return { data, error: null };
    } catch (error) {
      console.error('Error updating class:', error);
      return { data: null, error };
    }
  };

  const deleteClass = async (id: string) => {
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting class:', error);
        return { error };
      }

      setClasses(prev => prev.filter(cls => cls.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Error deleting class:', error);
      return { error };
    }
  };

  return {
    classes,
    loading,
    addClass,
    updateClass,
    deleteClass,
    refetch: fetchClasses,
  };
};