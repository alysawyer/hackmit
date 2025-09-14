import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Mic,
  Upload,
  Brain,
  MessageSquare,
  Zap,
  Target,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react"
import { ChevronDownIcon } from "@radix-ui/react-icons"

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-24 h-24 bg-primary geometric-shape opacity-10 float-effect"></div>
        <div className="absolute bottom-32 right-20 w-32 h-32 bg-secondary rotate-45 opacity-15"></div>
      </div>

      <div className="container relative z-10 py-12 px-4 md:px-6">
        <div className="space-y-12">
          {/* Left side content - now with proper spacing */}
          <div className="pl-4 lg:pl-8 space-y-8 min-h-[60vh] flex flex-col justify-center">
            <div className="inline-block px-4 py-2 bg-primary text-primary-foreground text-sm font-mono uppercase tracking-wider">
              VOICE.LEARN.DOMINATE
            </div>
            <h1 className="text-6xl lg:text-8xl xl:text-9xl font-black leading-none tracking-tight">
              <span className="block text-foreground">SPEAK</span>
              <span className="block text-primary glitch-effect">LEARN</span>
              <span className="block text-secondary">CONQUER</span>
            </h1>
            <p className="text-lg text-muted-foreground font-mono">
              Revolutionary speech-to-text learning platform. Import slides. Create flashcards. Speak answers. Get AI
              feedback.
            </p>

            <div className="space-y-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-wider glow-effect"
              >
                <Zap className="mr-2 h-5 w-5" />
                START LEARNING NOW
              </Button>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground font-bold bg-transparent"
                >
                  <Target className="mr-2 h-4 w-4" />
                  DEMO
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground font-bold bg-transparent"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  FEATURES
                </Button>
              </div>
            </div>
          </div>

          {/* Right side - exe screen moved below */}
          <div className="relative max-w-4xl mx-auto px-4">
            <Card className="p-0 bg-card border-2 border-primary overflow-hidden shadow-2xl">
              {/* Terminal header */}
              <div className="bg-primary p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-destructive rounded-full"></div>
                  <div className="w-3 h-3 bg-accent rounded-full"></div>
                  <div className="w-3 h-3 bg-secondary rounded-full"></div>
                  <span className="ml-4 font-mono text-primary-foreground text-sm font-bold">VOICE_LEARN.EXE</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/20">
                    <Play className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/20">
                    <Pause className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/20">
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="h-[500px] overflow-y-auto bg-background/95 backdrop-blur">
                <div className="p-6 space-y-6">
                  {/* Session info */}
                  <div className="border-l-4 border-secondary pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-secondary animate-pulse rounded-full"></div>
                      <span className="font-mono text-xs uppercase text-secondary">SESSION ACTIVE</span>
                    </div>
                    <p className="font-mono text-sm text-muted-foreground">Biology Study Set • 47 cards remaining</p>
                  </div>

                  {/* Current question */}
                  <div className="bg-muted/50 p-6 border border-primary/20 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-xs uppercase text-primary-foreground bg-primary px-2 py-1 rounded">
                        QUESTION 12/47
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">DIFFICULTY: MEDIUM</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">
                      What is the process by which plants convert sunlight into energy?
                    </h3>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span className="bg-accent text-accent-foreground px-2 py-1 rounded font-mono">BIOLOGY</span>
                      <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded font-mono">
                        PHOTOSYNTHESIS
                      </span>
                    </div>
                  </div>

                  {/* Voice input interface */}
                  <div className="bg-gradient-to-r from-secondary/10 to-primary/10 border-2 border-dashed border-secondary/50 p-8 text-center rounded-lg">
                    <div className="relative">
                      <Mic className="h-16 w-16 text-secondary mx-auto mb-4 animate-pulse" />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-secondary-foreground rounded-full animate-ping"></div>
                      </div>
                    </div>
                    <p className="font-mono text-secondary font-bold mb-2">LISTENING...</p>
                    <p className="text-sm text-foreground mb-4">Speak your answer clearly</p>

                    {/* Audio visualization */}
                    <div className="flex justify-center gap-1 mb-4">
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-secondary rounded-full animate-pulse"
                          style={{
                            height: `${Math.random() * 20 + 10}px`,
                            animationDelay: `${i * 0.1}s`,
                          }}
                        ></div>
                      ))}
                    </div>

                    <div className="text-xs font-mono text-muted-foreground">
                      DETECTED: "Photosynthesis is the process..."
                    </div>
                  </div>

                  {/* AI Feedback section */}
                  <div className="bg-accent/5 border border-accent/20 p-6 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="h-5 w-5 text-accent" />
                      <span className="font-mono text-sm font-bold text-accent">AI FEEDBACK</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Correct definition identified</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm">Consider mentioning chlorophyll</span>
                      </div>
                      <div className="bg-accent/10 p-3 rounded text-sm font-mono">
                        "Great answer! You correctly identified photosynthesis. Try to include the role of chlorophyll
                        next time."
                      </div>
                    </div>
                  </div>

                  {/* Progress and stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-primary" />
                        <span className="font-mono text-xs uppercase text-primary">ACCURACY</span>
                      </div>
                      <div className="text-2xl font-black text-primary">87%</div>
                      <div className="text-xs text-muted-foreground">+3% from last session</div>
                    </div>
                    <div className="bg-secondary/5 border border-secondary/20 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-secondary" />
                        <span className="font-mono text-xs uppercase text-secondary">STREAK</span>
                      </div>
                      <div className="text-2xl font-black text-secondary">12</div>
                      <div className="text-xs text-muted-foreground">cards in a row</div>
                    </div>
                  </div>

                  {/* Feature showcase */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-primary p-3 text-primary-foreground text-center rounded">
                      <Upload className="h-4 w-4 mx-auto mb-1" />
                      <span className="text-xs font-mono block">IMPORT</span>
                    </div>
                    <div className="bg-secondary p-3 text-secondary-foreground text-center rounded">
                      <Brain className="h-4 w-4 mx-auto mb-1" />
                      <span className="text-xs font-mono block">AI FEEDBACK</span>
                    </div>
                    <div className="bg-accent p-3 text-accent-foreground text-center rounded">
                      <MessageSquare className="h-4 w-4 mx-auto mb-1" />
                      <span className="text-xs font-mono block">PRACTICE</span>
                    </div>
                    <div className="bg-muted p-3 text-muted-foreground text-center rounded">
                      <Mic className="h-4 w-4 mx-auto mb-1" />
                      <span className="text-xs font-mono block">SPEECH</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scroll indicator */}
              <div className="bg-primary/10 p-2 text-center">
                <ChevronDownIcon className="h-4 w-4 text-primary mx-auto animate-bounce" />
                <span className="text-xs font-mono text-primary-foreground bg-primary px-2 py-1 rounded">
                  SCROLL TO EXPLORE
                </span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
