import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, Users, Brain } from 'lucide-react';

const Hero = () => {
  return (
    <section className="py-16 lg:py-24 bg-black text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPgogICAgPC9wYXR0ZXJuPgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPgo8L3N2Zz4=')] opacity-20"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Modern School Management
            <br />
            <span className="text-secondary-glow">Made Simple</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            Streamline your educational institution with our comprehensive management system. 
            Handle timetables, attendance, performance tracking, and AI-powered insights all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-white text-black hover:bg-white/90 shadow-elegant hover:shadow-glow transition-all duration-300" asChild>
              <a href="/register">Start Free Trial</a>
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-black hover:bg-white/10 backdrop-blur-sm transition-smooth" asChild>
              <a href="/dashboard">Explore Dashboard</a>
            </Button>
          </div>

          {/* Feature icons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            <div className="flex flex-col items-center space-y-2 text-white/90">
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <Calendar className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium">Timetables</span>
            </div>
            <div className="flex flex-col items-center space-y-2 text-white/90">
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <Users className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium">Attendance</span>
            </div>
            <div className="flex flex-col items-center space-y-2 text-white/90">
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <BookOpen className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium">Performance</span>
            </div>
            <div className="flex flex-col items-center space-y-2 text-white/90">
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <Brain className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium">AI Insights</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;