import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Medical Student",
    avatar: "/medical-student.png",
    content:
      "VoiceLearn transformed how I study anatomy. Speaking the answers out loud helps me remember so much better than just reading flashcards.",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "High School Teacher",
    avatar: "/diverse-classroom-teacher.png",
    content:
      "My students love using this for language learning. The speech recognition is incredibly accurate and the feedback is constructive.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "College Student",
    avatar: "/diverse-college-students.png",
    content:
      "Being able to import my lecture slides and turn them into interactive flashcards saves me hours of study prep time.",
    rating: 5,
  },
  {
    name: "Dr. James Wilson",
    role: "Professor",
    avatar: "/diverse-professor-lecturing.png",
    content:
      "The adaptive learning feature is brilliant. It focuses on exactly what each student needs to work on most.",
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-balance">
            Loved by students and educators
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Join thousands of learners who have transformed their study habits with VoiceLearn.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="text-lg leading-relaxed mb-4">"{testimonial.content}"</blockquote>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                    <AvatarFallback>
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
