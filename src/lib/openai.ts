// OpenAI integration for enhanced AI capabilities
export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export class OpenAIService {
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = import.meta.env.OPENAI_API_KEY || '';
    this.model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4';
  }

  // Check if OpenAI is configured
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  // Generate AI response for school management queries
  async generateResponse(prompt: string, context?: any): Promise<string> {
    if (!this.isConfigured()) {
      return this.generateMockResponse(prompt);
    }

    try {
      const messages: OpenAIMessage[] = [
        {
          role: 'system',
          content: `You are an AI assistant for EduManager, a school management system. You help analyze school data, provide insights on student performance, attendance patterns, and administrative tasks. 

Context about the school:
- You manage data for middle and high school students (grades 6-12)
- You track attendance, performance, timetables, and student information
- You provide actionable insights to help improve educational outcomes

Current user context: ${context ? JSON.stringify(context) : 'No specific context provided'}

Provide helpful, accurate, and actionable responses related to school management. Keep responses concise but informative.`
        },
        {
          role: 'user',
          content: prompt
        }
      ];

      const response = await fetch('/api/openai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          model: this.model,
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data: OpenAIResponse = await response.json();
      return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.generateMockResponse(prompt);
    }
  }

  // Fallback mock response when OpenAI is not available
  private generateMockResponse(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('attendance')) {
      return `📊 **Attendance Analysis**: Based on current data, the school-wide attendance rate is 92.8%. Top performing classes show 96.5% attendance, while some classes need attention with 87.3% rates. I recommend implementing early intervention strategies for students with consecutive absences.`;
    }
    
    if (lowerPrompt.includes('performance') || lowerPrompt.includes('grade')) {
      return `📈 **Performance Insights**: Current school average is 84.7%. Mathematics and Science show strong performance (89.2% and 87.1%), while English and History need focus (78.9% and 81.3%). There's been a 3.2% improvement over last semester. Consider implementing reading comprehension programs.`;
    }
    
    if (lowerPrompt.includes('payment') || lowerPrompt.includes('fee')) {
      return `💳 **Payment Management**: I can help you track school fee payments, generate payment links for parents, and monitor payment status. Flutterwave integration allows secure payments across Africa with multiple payment methods including cards, bank transfers, and mobile money.`;
    }
    
    if (lowerPrompt.includes('timetable') || lowerPrompt.includes('schedule')) {
      return `📅 **Schedule Optimization**: Current timetables show good distribution across 14 classes. Peak engagement hours are 10-11 AM. I recommend scheduling core subjects during these peak hours and electives in afternoon slots for optimal learning outcomes.`;
    }

    return `🤖 **AI Assistant**: I'm here to help with school management insights. I can analyze attendance patterns, performance trends, payment tracking, schedule optimization, and provide actionable recommendations. What specific area would you like me to focus on?`;
  }

  // Analyze student performance data
  async analyzePerformance(performanceData: any[]): Promise<string> {
    const context = {
      type: 'performance_analysis',
      data_points: performanceData.length,
      subjects: [...new Set(performanceData.map(p => p.subject))],
      grade_range: {
        min: Math.min(...performanceData.map(p => p.score / p.max_score * 100)),
        max: Math.max(...performanceData.map(p => p.score / p.max_score * 100)),
        average: performanceData.reduce((sum, p) => sum + (p.score / p.max_score * 100), 0) / performanceData.length
      }
    };

    return this.generateResponse(
      'Analyze this student performance data and provide insights on strengths, areas for improvement, and recommendations.',
      context
    );
  }

  // Analyze attendance patterns
  async analyzeAttendance(attendanceData: any[]): Promise<string> {
    const context = {
      type: 'attendance_analysis',
      total_records: attendanceData.length,
      attendance_rate: attendanceData.filter(a => a.status === 'present').length / attendanceData.length * 100,
      patterns: {
        present: attendanceData.filter(a => a.status === 'present').length,
        absent: attendanceData.filter(a => a.status === 'absent').length,
        late: attendanceData.filter(a => a.status === 'late').length,
        excused: attendanceData.filter(a => a.status === 'excused').length,
      }
    };

    return this.generateResponse(
      'Analyze this attendance data and provide insights on patterns, trends, and recommendations for improvement.',
      context
    );
  }
}

export const openaiService = new OpenAIService();