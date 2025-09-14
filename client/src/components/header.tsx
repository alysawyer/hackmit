import { Button } from "@/components/ui/button"
import { Mic, Menu } from "lucide-react"
import { useState } from "react"
import { Cross2Icon } from "@radix-ui/react-icons"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 z-50 w-full bg-background border-b-4 border-primary">
      <div className="container">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary flex items-center justify-center geometric-shape">
              <Mic className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-2xl font-black text-foreground tracking-tight">VOICE</span>
              <span className="text-2xl font-black text-primary">LEARN</span>
            </div>
          </div>

          <nav className="hidden lg:block">
            <div className="flex gap-2">
              <a
                href="#features"
                className="px-4 py-2 bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground font-mono text-sm uppercase transition-all"
              >
                FEATURES
              </a>
              <a
                href="#testimonials"
                className="px-4 py-2 bg-muted text-muted-foreground hover:bg-secondary hover:text-secondary-foreground font-mono text-sm uppercase transition-all"
              >
                REVIEWS
              </a>
              <a
                href="#pricing"
                className="px-4 py-2 bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground font-mono text-sm uppercase transition-all"
              >
                PRICING
              </a>
              <a
                href="#about"
                className="px-4 py-2 bg-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground font-mono text-sm uppercase transition-all"
              >
                ABOUT
              </a>
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground font-bold uppercase bg-transparent"
            >
              SIGN IN
            </Button>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-wider glow-effect"
            >
              START NOW
            </Button>

            {/* Mobile menu button */}
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <Cross2Icon className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden border-t-2 border-primary bg-card p-4">
            <div className="space-y-2">
              <a href="#features" className="block px-4 py-3 bg-primary text-primary-foreground font-mono uppercase">
                FEATURES
              </a>
              <a
                href="#testimonials"
                className="block px-4 py-3 bg-secondary text-secondary-foreground font-mono uppercase"
              >
                REVIEWS
              </a>
              <a href="#pricing" className="block px-4 py-3 bg-accent text-accent-foreground font-mono uppercase">
                PRICING
              </a>
              <a href="#about" className="block px-4 py-3 bg-muted text-muted-foreground font-mono uppercase">
                ABOUT
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
