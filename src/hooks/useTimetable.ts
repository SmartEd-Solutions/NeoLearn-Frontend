import { useState, useEffect } from 'react';
import { supabase, TimetableEntry, DayOfWeek } from '@/lib/supabase';

export const useTimetable = (userId?: string) => {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchTimetable();
    }
  }, [userId]);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('timetable')
        .select('*')
        .eq('user_id', userId)
        .order('day', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching timetable:', error);
      } else {
        setTimetable(data || []);
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTimetableEntry = async (entry: Omit<TimetableEntry, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('timetable')
        .insert([entry])
        .select()
        .single();

      if (error) {
        console.error('Error adding timetable entry:', error);
        return { data: null, error };
      }

      setTimetable(prev => [...prev, data]);
      return { data, error: null };
    } catch (error) {
      console.error('Error adding timetable entry:', error);
      return { data: null, error };
    }
  };

  const updateTimetableEntry = async (id: string, updates: Partial<TimetableEntry>) => {
    try {
      const { data, error } = await supabase
        .from('timetable')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating timetable entry:', error);
        return { data: null, error };
      }

      setTimetable(prev => prev.map(entry => entry.id === id ? data : entry));
      return { data, error: null };
    } catch (error) {
      console.error('Error updating timetable entry:', error);
      return { data: null, error };
    }
  };

  const deleteTimetableEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('timetable')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting timetable entry:', error);
        return { error };
      }

      setTimetable(prev => prev.filter(entry => entry.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Error deleting timetable entry:', error);
      return { error };
    }
  };

  const getTodaysTimetable = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }) as DayOfWeek;
    return timetable.filter(entry => entry.day === today);
  };

  return {
    timetable,
    loading,
    addTimetableEntry,
    updateTimetableEntry,
    deleteTimetableEntry,
    getTodaysTimetable,
    refetch: fetchTimetable,
  };
};