import { Header } from "@/components/header"
import { ChatInterface } from "@/components/chat-interface"
import { CommunitySection } from "@/components/community-section"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <ChatInterface />
        <CommunitySection />
      </main>
    </div>
  )
}
