import { useState, useEffect } from 'react';
import { supabase, AssistantLog } from '@/lib/supabase';

export const useAssistant = (userId?: string) => {
  const [logs, setLogs] = useState<AssistantLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchLogs();
    }
  }, [userId]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('assistant_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching assistant logs:', error);
      } else {
        setLogs(data || []);
      }
    } catch (error) {
      console.error('Error fetching assistant logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveInteraction = async (prompt: string, response: string) => {
    if (!userId) return { data: null, error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('assistant_logs')
        .insert([{
          user_id: userId,
          prompt,
          response,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error saving assistant interaction:', error);
        return { data: null, error };
      }

      setLogs(prev => [data, ...prev]);
      return { data, error: null };
    } catch (error) {
      console.error('Error saving assistant interaction:', error);
      return { data: null, error };
    }
  };

  const generateMockResponse = async (prompt: string): Promise<string> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate contextual responses based on prompt keywords
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('attendance')) {
      return `Based on your attendance data, here are the insights: Your current attendance rate is excellent at 94.2%. You've been present for 47 out of 50 school days this semester. Consider maintaining this consistency for optimal academic performance.`;
    }
    
    if (lowerPrompt.includes('performance') || lowerPrompt.includes('grade')) {
      return `Your academic performance shows strong progress across subjects. Your average score is 87.3%, with Mathematics being your strongest subject at 92% and English showing room for improvement at 81%. I recommend focusing on essay writing skills to boost your English performance.`;
    }
    
    if (lowerPrompt.includes('timetable') || lowerPrompt.includes('schedule')) {
      return `Your current timetable is well-balanced with 6 subjects across the week. You have the heaviest load on Tuesdays and Thursdays. Consider using your free periods on Mondays and Fridays for study sessions or homework completion.`;
    }
    
    if (lowerPrompt.includes('help') || lowerPrompt.includes('support')) {
      return `I can help you with various aspects of your school management: analyzing attendance patterns, reviewing academic performance, optimizing your study schedule, and providing insights on your educational progress. What specific area would you like to explore?`;
    }

    // Default response
    return `Thank you for your query: "${prompt}". I'm analyzing your school data to provide personalized insights. This AI assistant will help you understand patterns in your attendance, performance, and schedule to optimize your educational experience. What specific aspect of your school data would you like me to analyze?`;
  };

  const askQuestion = async (prompt: string) => {
    if (!userId) return { response: '', error: 'User not authenticated' };

    try {
      const response = await generateMockResponse(prompt);
      await saveInteraction(prompt, response);
      return { response, error: null };
    } catch (error) {
      console.error('Error processing question:', error);
      return { response: '', error: 'Failed to process question' };
    }
  };

  return {
    logs,
    loading,
    askQuestion,
    refetch: fetchLogs,
  };
};