import React from 'react';
import { Header } from './header';
import { HeroSection } from './hero-section';

interface LandingPageProps {
  onStartQuiz: () => void;
}

export function LandingPage({ onStartQuiz }: LandingPageProps) {
  return (
    <div className="h-screen bg-background overflow-hidden">
      <Header onStartQuiz={onStartQuiz} />
      <HeroSection onStartQuiz={onStartQuiz} />
    </div>
  );
}
