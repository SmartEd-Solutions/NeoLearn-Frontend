import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, BookOpen, Brain, Clock, BarChart3 } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Calendar,
      title: 'Smart Timetable Management',
      description: 'Create, manage, and optimize class schedules with intelligent conflict detection and automatic adjustments.',
      color: 'bg-blue-500/10 text-blue-600'
    },
    {
      icon: Users,
      title: 'Attendance Tracking',
      description: 'Digital attendance system with real-time notifications and comprehensive reporting for teachers and parents.',
      color: 'bg-emerald-500/10 text-emerald-600'
    },
    {
      icon: BookOpen,
      title: 'Performance Analytics',
      description: 'Track student progress with detailed analytics, grade management, and personalized learning insights.',
      color: 'bg-purple-500/10 text-purple-600'
    },
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Natural language queries to analyze school data and get actionable recommendations for improved outcomes.',
      color: 'bg-orange-500/10 text-orange-600'
    },
    {
      icon: Clock,
      title: 'Real-time Updates',
      description: 'Stay connected with instant notifications about schedule changes, events, and important announcements.',
      color: 'bg-pink-500/10 text-pink-600'
    },
    {
      icon: BarChart3,
      title: 'Comprehensive Reports',
      description: 'Generate detailed reports on attendance, performance, and school metrics for data-driven decisions.',
      color: 'bg-indigo-500/10 text-indigo-600'
    }
  ];

  return (
    <section id="features" className="py-16 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need to Manage Your School
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools designed specifically for middle and high schools to streamline operations and improve educational outcomes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={feature.title} className="shadow-card hover-lift transition-all duration-300 border-0 bg-gradient-card">
              <CardHeader>
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;