import { Button } from "@/components/ui/button"
import { Mic } from "lucide-react"

interface HeaderProps {
  onStartQuiz: () => void;
}

export function Header({ onStartQuiz }: HeaderProps) {
  return (
    <header className="w-full bg-background/80 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent flex items-center justify-center rounded-lg">
              <Mic className="h-4 w-4 text-white" />
            </div>
            <span
              className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent cursor-pointer"
            >
              VoiceLearn
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Features
            </a>
            <a href="#about" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
              About
            </a>
            <button
              onClick={onStartQuiz}
              className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium cursor-pointer"
            >
              Quiz
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="hover:text-primary">
              Sign In
            </Button>
            <Button 
              size="sm" 
              className="bg-primary/80 hover:bg-primary text-primary-foreground border-0"
              onClick={onStartQuiz}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
