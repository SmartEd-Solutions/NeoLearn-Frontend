import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Send, Loader2 } from 'lucide-react';
import { useAuthContext } from '@/components/AuthProvider';
import { useAssistant } from '@/hooks/useAssistant';
import { openaiService } from '@/lib/openai';

const AIQueryBox = () => {
  const { userProfile } = useAuthContext();
  const { askQuestion } = useAssistant(userProfile?.id);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    
    try {
      // Try OpenAI first, fallback to mock response
      let aiResponse: string;
      
      if (openaiService.isConfigured()) {
        aiResponse = await openaiService.generateResponse(query, {
          user_role: userProfile?.role,
          user_name: userProfile?.full_name,
        });
      } else {
        const { response: mockResponse, error } = await askQuestion(query);
        if (error) {
          setResponse('Sorry, I encountered an error processing your question. Please try again.');
          return;
        }
        aiResponse = mockResponse;
      }
      
      setResponse(aiResponse);
      
      // Save interaction to database
      await askQuestion(query);
    } catch (error) {
      setResponse('Sorry, I encountered an error processing your question. Please try again.');
    } finally {
      setIsLoading(false);
      setQuery('');
    }
  };

  return (
    <Card className="shadow-card hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <div className="bg-gradient-hero p-2 rounded-lg">
            <Brain className="h-5 w-5 text-white" />
          </div>
          AI Query Assistant
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Ask questions about your school data in natural language
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., 'Show me attendance trends for Grade 9' or 'Which students need academic support?'"
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !query.trim()}
            className="bg-gradient-hero hover:shadow-glow transition-smooth"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>

        {response && (
          <div className="bg-gradient-card p-4 rounded-lg border">
            <h4 className="font-semibold text-primary mb-2">AI Response:</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">{response}</p>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <strong>Example queries:</strong> "Show me today's attendance", "Which classes have the highest performance?", "Generate weekly schedule report"
        </div>
      </CardContent>
    </Card>
  );
};

export default AIQueryBox;