import { useState, useEffect } from 'react';
import { supabase, AttendanceRecord, AttendanceStatus } from '@/lib/supabase';

export const useAttendance = (userId?: string) => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchAttendance();
    }
  }, [userId]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching attendance:', error);
      } else {
        setAttendance(data || []);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (
    studentUserId: string,
    date: string,
    status: AttendanceStatus,
    remarks?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .upsert({
          user_id: studentUserId,
          date,
          status,
          remarks: remarks || '',
          recorded_by: userId,
        })
        .select()
        .single();

      if (error) {
        console.error('Error marking attendance:', error);
        return { data: null, error };
      }

      setAttendance(prev => {
        const existing = prev.find(record => record.date === date);
        if (existing) {
          return prev.map(record => record.date === date ? data : record);
        } else {
          return [data, ...prev];
        }
      });

      return { data, error: null };
    } catch (error) {
      console.error('Error marking attendance:', error);
      return { data: null, error };
    }
  };

  const getAttendanceStats = () => {
    const totalDays = attendance.length;
    const presentDays = attendance.filter(record => record.status === 'present').length;
    const lateDays = attendance.filter(record => record.status === 'late').length;
    const absentDays = attendance.filter(record => record.status === 'absent').length;
    const excusedDays = attendance.filter(record => record.status === 'excused').length;

    const attendanceRate = totalDays > 0 ? ((presentDays + lateDays) / totalDays) * 100 : 0;

    return {
      totalDays,
      presentDays,
      lateDays,
      absentDays,
      excusedDays,
      attendanceRate: Math.round(attendanceRate * 10) / 10,
    };
  };

  const getTodaysAttendance = () => {
    const today = new Date().toISOString().split('T')[0];
    return attendance.find(record => record.date === today);
  };

  return {
    attendance,
    loading,
    markAttendance,
    getAttendanceStats,
    getTodaysAttendance,
    refetch: fetchAttendance,
  };
};