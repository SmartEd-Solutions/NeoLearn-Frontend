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
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate contextual responses based on prompt keywords
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('attendance')) {
      return `📊 **Attendance Analysis**: Current school-wide attendance rate is 92.8%. Top performing classes: Grade 10A (96.5%), Grade 9B (94.2%). Classes needing attention: Grade 8A (87.3%). Recommendation: Implement early intervention for students with >3 consecutive absences.`;
    }
    
    if (lowerPrompt.includes('performance') || lowerPrompt.includes('grade')) {
      return `📈 **Performance Insights**: School average: 84.7%. Strongest subjects: Mathematics (89.2%), Science (87.1%). Areas for improvement: English (78.9%), History (81.3%). Trend: 3.2% improvement over last semester. Recommendation: Focus on reading comprehension programs.`;
    }
    
    if (lowerPrompt.includes('timetable') || lowerPrompt.includes('schedule')) {
      return `📅 **Schedule Analysis**: Current timetables show optimal distribution across 14 classes. Peak hours: 10-11 AM (highest engagement). Recommendation: Schedule core subjects during peak hours, electives during afternoon slots for better learning outcomes.`;
    }
    
    if (lowerPrompt.includes('student') || lowerPrompt.includes('class')) {
      return `👥 **Student Overview**: Total enrolled: 420 students across 14 classes. Average class size: 30 students. Student-teacher ratio: 15:1. Top performing classes by attendance: Grade 12A, Grade 11B. Classes needing support: Grade 8A, Grade 9A.`;
    }
    
    if (lowerPrompt.includes('help') || lowerPrompt.includes('support')) {
      return `🤖 **AI Assistant Capabilities**: I can analyze attendance patterns, performance trends, schedule optimization, student progress tracking, class comparisons, and generate detailed reports. Ask me about specific classes, subjects, or time periods for detailed insights.`;
    }

    // Default response
    return `🔍 **Query Processed**: "${prompt}". I'm your school management AI assistant. I can provide insights on attendance trends, academic performance, schedule optimization, student analytics, and administrative reports. Try asking about specific classes, subjects, or time periods for detailed analysis.`;
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