
import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import AIQueryBox from '@/components/AIQueryBox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Mail, Phone, MapPin } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Features />
      
      {/* AI Demo Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Experience AI-Powered School Management
            </h2>
            <p className="text-lg text-muted-foreground">
              Try our intelligent assistant that helps you analyze school data and get insights instantly.
            </p>
          </div>
          <AIQueryBox />
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Schools Choose EduManager
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Trusted by over 500+ educational institutions worldwide for comprehensive school management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="shadow-card hover-lift border-0 bg-gradient-card">
              <CardContent className="p-6">
                <CheckCircle className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Easy Implementation</h3>
                <p className="text-muted-foreground text-sm">Get started in minutes with our intuitive setup process and comprehensive onboarding support.</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-card hover-lift border-0 bg-gradient-card">
              <CardContent className="p-6">
                <CheckCircle className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Secure & Reliable</h3>
                <p className="text-muted-foreground text-sm">Enterprise-grade security with 99.9% uptime guarantee and automatic data backups.</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-card hover-lift border-0 bg-gradient-card">
              <CardContent className="p-6">
                <CheckCircle className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-2">24/7 Support</h3>
                <p className="text-muted-foreground text-sm">Dedicated support team available around the clock to help you succeed.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-hero text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your School Management?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of educators who have streamlined their school operations with EduManager. 
            Start your free trial today and see the difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-background text-primary hover:bg-background/90 shadow-elegant hover:shadow-glow transition-all duration-300" asChild>
              <a href="/register">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-black hover:bg-white/10 backdrop-blur-sm transition-smooth" asChild>
              <a href="/dashboard">View Demo</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-card border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-hero p-2 rounded-xl shadow-glow">
                  <CheckCircle className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">EduManager</h3>
                  <p className="text-xs text-muted-foreground">School Management System</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                Empowering educational institutions with modern technology to enhance learning outcomes and streamline operations.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>support@edumanager.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>San Francisco, CA</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-smooth">Features</a></li>
                <li><a href="/dashboard" className="hover:text-primary transition-smooth">Dashboard</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-smooth">About</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Careers</a></li>
                <li><a href="#contact" className="hover:text-primary transition-smooth">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 EduManager. All rights reserved. Built with modern web technologies for educational excellence.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
