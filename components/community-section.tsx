import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

const communityProjects = [
  {
    title: "Social Media Dashboard",
    author: "Hayden Bleasel",
    description: "A comprehensive dashboard for managing social media accounts with analytics and scheduling features.",
    image: "/social-media-dashboard-dark-theme.png",
  },
  {
    title: "Tactical Ops Interface",
    author: "Alex Chen",
    description: "Military-style tactical operations interface with real-time data visualization and command controls.",
    image: "/tactical-military-interface-dark-theme.jpg",
  },
  {
    title: "AI Agent Platform",
    author: "Sarah Kim",
    description:
      "Unleash the power of AI agents with this comprehensive platform for automation and intelligent workflows.",
    image: "/ai-agent-platform-gradient-interface.jpg",
  },
]

export function CommunitySection() {
  return (
    <section className="py-16 px-4">
      <div className="container max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">From the Community</h2>
            <p className="text-muted-foreground">Explore what the community is building with v0.</p>
          </div>
          <Button variant="ghost" className="text-primary">
            Browse All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communityProjects.map((project, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <div className="aspect-video bg-muted">
                <img
                  src={project.image || "/placeholder.svg"}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 text-balance">{project.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 text-pretty">{project.description}</p>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-xs text-primary-foreground font-medium">{project.author.charAt(0)}</span>
                  </div>
                  <span className="text-sm font-medium">{project.author}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
