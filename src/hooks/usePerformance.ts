import { useState, useEffect } from 'react';
import { supabase, PerformanceRecord } from '@/lib/supabase';

export const usePerformance = (userId?: string) => {
  const [performance, setPerformance] = useState<PerformanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchPerformance();
    }
  }, [userId]);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('performance')
        .select('*')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false });

      if (error) {
        console.error('Error fetching performance:', error);
      } else {
        setPerformance(data || []);
      }
    } catch (error) {
      console.error('Error fetching performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPerformanceRecord = async (record: Omit<PerformanceRecord, 'id' | 'recorded_at'> & { recorded_by?: string }) => {
    try {
      const { data, error } = await supabase
        .from('performance')
        .insert([{
          ...record,
          recorded_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding performance record:', error);
        return { data: null, error };
      }

      setPerformance(prev => [data, ...prev]);
      return { data, error: null };
    } catch (error) {
      console.error('Error adding performance record:', error);
      return { data: null, error };
    }
  };

  const getPerformanceStats = () => {
    if (performance.length === 0) {
      return {
        averageScore: 0,
        totalRecords: 0,
        subjectStats: {},
        recentGrade: 'N/A',
      };
    }

    const totalScore = performance.reduce((sum, record) => {
      const percentage = (record.score / record.max_score) * 100;
      return sum + percentage;
    }, 0);

    const averageScore = totalScore / performance.length;

    // Group by subject
    const subjectStats = performance.reduce((acc, record) => {
      const subject = record.subject;
      if (!acc[subject]) {
        acc[subject] = { total: 0, count: 0, scores: [] };
      }
      const percentage = (record.score / record.max_score) * 100;
      acc[subject].total += percentage;
      acc[subject].count += 1;
      acc[subject].scores.push(percentage);
      return acc;
    }, {} as Record<string, { total: number; count: number; scores: number[] }>);

    // Calculate averages for each subject
    Object.keys(subjectStats).forEach(subject => {
      (subjectStats[subject] as any).average = subjectStats[subject].total / subjectStats[subject].count;
    });

    const recentGrade = performance.length > 0 ? performance[0].grade : 'N/A';

    return {
      averageScore: Math.round(averageScore * 10) / 10,
      totalRecords: performance.length,
      subjectStats,
      recentGrade,
    };
  };

  return {
    performance,
    loading,
    addPerformanceRecord,
    getPerformanceStats,
    refetch: fetchPerformance,
  };
};