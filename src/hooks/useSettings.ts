import { useState, useEffect } from 'react';
import { supabase, UserSettings, ThemeOption } from '@/lib/supabase';

export const useSettings = (userId?: string) => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchSettings();
    }
  }, [userId]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching settings:', error);
      } else {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<Omit<UserSettings, 'id' | 'user_id' | 'updated_at'>>) => {
    if (!userId) return { data: null, error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating settings:', error);
        return { data: null, error };
      }

      setSettings(data);
      return { data, error: null };
    } catch (error) {
      console.error('Error updating settings:', error);
      return { data: null, error };
    }
  };

  const updateTheme = async (theme: ThemeOption) => {
    return updateSettings({ theme });
  };

  const toggleNotifications = async () => {
    const newValue = !settings?.notifications_enabled;
    return updateSettings({ notifications_enabled: newValue });
  };

  const updateLanguage = async (language: string) => {
    return updateSettings({ language });
  };

  return {
    settings,
    loading,
    updateSettings,
    updateTheme,
    toggleNotifications,
    updateLanguage,
    refetch: fetchSettings,
  };
};