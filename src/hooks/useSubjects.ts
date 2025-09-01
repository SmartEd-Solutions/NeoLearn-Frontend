import { useState, useEffect } from 'react';
import { supabase, Subject } from '@/lib/supabase';

export const useSubjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching subjects:', error);
      } else {
        setSubjects(data || []);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSubject = async (subjectData: Omit<Subject, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert([subjectData])
        .select()
        .single();

      if (error) {
        console.error('Error adding subject:', error);
        return { data: null, error };
      }

      setSubjects(prev => [...prev, data]);
      return { data, error: null };
    } catch (error) {
      console.error('Error adding subject:', error);
      return { data: null, error };
    }
  };

  const updateSubject = async (id: string, updates: Partial<Subject>) => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating subject:', error);
        return { data: null, error };
      }

      setSubjects(prev => prev.map(subject => subject.id === id ? data : subject));
      return { data, error: null };
    } catch (error) {
      console.error('Error updating subject:', error);
      return { data: null, error };
    }
  };

  const deleteSubject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting subject:', error);
        return { error };
      }

      setSubjects(prev => prev.filter(subject => subject.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Error deleting subject:', error);
      return { error };
    }
  };

  return {
    subjects,
    loading,
    addSubject,
    updateSubject,
    deleteSubject,
    refetch: fetchSubjects,
  };
};