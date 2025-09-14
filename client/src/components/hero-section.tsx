import { Button } from "@/components/ui/button"
import { Mic, Upload, Brain, MessageSquare } from "lucide-react"

interface HeroSectionProps {
  onStartQuiz: () => void;
}

export function HeroSection({ onStartQuiz }: HeroSectionProps) {
  return (
    <section className="min-h-[calc(100vh-80px)] flex items-center justify-center pt-20">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center space-y-12">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Learn Through
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent block">
                Speech
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Import your study materials, create flashcards, and practice with AI-powered speech recognition and
              feedback.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 bg-primary/80 hover:bg-primary text-white border-0"
              onClick={onStartQuiz}
            >
              Start Learning Now
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white bg-transparent"
            >
              Watch Demo
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            <div className="flex flex-col items-center gap-3 p-4 group hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <span className="text-sm font-medium">Import Slides</span>
            </div>
            <div className="flex flex-col items-center gap-3 p-4 group hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg flex items-center justify-center group-hover:from-accent/30 group-hover:to-primary/30 transition-colors">
                <MessageSquare className="h-6 w-6 text-accent" />
              </div>
              <span className="text-sm font-medium">Create Cards</span>
            </div>
            <div className="flex flex-col items-center gap-3 p-4 group hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
                <Mic className="h-6 w-6 text-primary" />
              </div>
              <span className="text-sm font-medium">Speak Answers</span>
            </div>
            <div className="flex flex-col items-center gap-3 p-4 group hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg flex items-center justify-center group-hover:from-accent/30 group-hover:to-primary/30 transition-colors">
                <Brain className="h-6 w-6 text-accent" />
              </div>
              <span className="text-sm font-medium">AI Feedback</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
