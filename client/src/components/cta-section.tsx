import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mic } from "lucide-react"
import { ArrowRightIcon } from "@radix-ui/react-icons"

export function CTASection() {
  return (
    <section className="py-20 bg-primary/5">
      <div className="container">
        <Card className="mx-auto max-w-4xl border-0 shadow-lg bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary mb-6">
              <Mic className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-balance mb-4">
              Ready to revolutionize your learning?
            </h2>
            <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto mb-8">
              Join thousands of students and educators who are already using VoiceLearn to make studying more effective
              and engaging.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Start Learning Today
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg">
                Schedule a Demo
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Free 14-day trial • No credit card required • Cancel anytime
            </p>
          </div>
        </Card>
      </div>
    </section>
  )
}
