import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Upload, Brain, BarChart3, Users, Zap, ArrowRight } from "lucide-react"

const features = [
  {
    icon: Mic,
    title: "VOICE INTERACTION",
    description: "Advanced speech recognition that understands natural language. Speak your answers naturally.",
    color: "primary",
    delay: "0s",
  },
  {
    icon: Upload,
    title: "IMPORT SLIDES",
    description: "Upload presentations, PDFs, documents. Auto-generate flashcards instantly.",
    color: "secondary",
    delay: "0.2s",
  },
  {
    icon: Brain,
    title: "AI FEEDBACK",
    description: "Intelligent feedback on spoken answers. Personalized improvement suggestions.",
    color: "accent",
    delay: "0.4s",
  },
  {
    icon: BarChart3,
    title: "PROGRESS TRACKING",
    description: "Detailed analytics and performance insights. Monitor learning over time.",
    color: "primary",
    delay: "0.6s",
  },
  {
    icon: Users,
    title: "STUDY GROUPS",
    description: "Collaborate with classmates. Share flashcards. Virtual study sessions.",
    color: "secondary",
    delay: "0.8s",
  },
  {
    icon: Zap,
    title: "ADAPTIVE LEARNING",
    description: "Smart algorithms adjust difficulty. Focus on areas needing practice.",
    color: "accent",
    delay: "1s",
  },
]

interface FeaturesSectionProps {
  onStartQuiz: () => void;
}

export function FeaturesSection({ onStartQuiz }: FeaturesSectionProps) {
  return (
    <section id="features" className="py-32 bg-background relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-40 h-40 bg-primary/10 geometric-shape"></div>
        <div className="absolute bottom-20 left-10 w-32 h-32 bg-secondary/10 rotate-45"></div>
      </div>

      <div className="container relative z-10">
        <div className="mb-20">
          <div className="inline-block px-6 py-3 bg-primary text-primary-foreground font-mono uppercase tracking-wider mb-6">
            CORE FEATURES
          </div>
          <h2 className="text-5xl lg:text-7xl font-black leading-none tracking-tight mb-6">
            <span className="block text-foreground">EVERYTHING</span>
            <span className="block text-primary">YOU NEED</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl font-mono">
            Powerful features designed to revolutionize learning through voice interaction and AI technology.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`relative overflow-hidden border-2 border-${feature.color} bg-card hover:bg-${feature.color}/5 transition-all duration-300 float-effect group`}
              style={{ animationDelay: feature.delay }}
            >
              <div className={`absolute top-0 right-0 w-16 h-16 bg-${feature.color} diagonal-cut opacity-20`}></div>

              <CardHeader className="pb-4">
                <div className={`w-16 h-16 bg-${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className={`h-8 w-8 text-${feature.color}-foreground`} />
                </div>
                <CardTitle className="text-xl font-black uppercase tracking-wide text-foreground">
                  {feature.title}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <CardDescription className="text-base leading-relaxed text-muted-foreground font-mono mb-4">
                  {feature.description}
                </CardDescription>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className={`text-${feature.color} font-mono text-sm uppercase`}>LEARN MORE</span>
                  <ArrowRight className={`h-4 w-4 text-${feature.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-20 text-center">
          <div className="inline-block p-8 bg-primary text-primary-foreground">
            <h3 className="text-2xl font-black uppercase mb-4">READY TO START?</h3>
            <p className="font-mono mb-6">Join thousands of students already learning smarter.</p>
            <div className="flex gap-4 justify-center">
              <button 
                className="px-6 py-3 bg-secondary text-secondary-foreground font-bold uppercase hover:bg-secondary/90 transition-colors"
                onClick={onStartQuiz}
              >
                TRY FREE
              </button>
              <button className="px-6 py-3 bg-accent text-accent-foreground font-bold uppercase hover:bg-accent/90 transition-colors">
                VIEW DEMO
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
