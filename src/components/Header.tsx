import React from 'react';
import { Button } from '@/components/ui/button';
import { GraduationCap, Menu, X } from 'lucide-react';
import { useState } from 'react';
import '../index.css'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-card shadow-card border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-hero p-2 rounded-xl shadow-glow">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-black">EduManager</h1>
              <p className="text-xs  text-black">School Management System</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-muted-foreground hover:text-primary transition-smooth">Features</a>
            <a href="#about" className="text-muted-foreground hover:text-primary transition-smooth">About</a>
            <a href="#contact" className="text-muted-foreground hover:text-primary transition-smooth">Contact</a>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <a href="/login">Login</a>
            </Button>
            <Button variant="default" className="bg-gradient-hero hover:shadow-glow transition-smooth" asChild>
              <a href="/register">Get Started</a>
            </Button>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t mt-4 pt-4">
            <nav className="flex flex-col space-y-4">
              <a href="#features" className="text-muted-foreground hover:text-primary transition-smooth">Features</a>
              <a href="#about" className="text-muted-foreground hover:text-primary transition-smooth">About</a>
              <a href="#contact" className="text-muted-foreground hover:text-primary transition-smooth">Contact</a>
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="ghost" asChild className="justify-start">
                  <a href="/login">Login</a>
                </Button>
                <Button variant="default" className="bg-gradient-hero justify-start" asChild>
                  <a href="/register">Get Started</a>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;