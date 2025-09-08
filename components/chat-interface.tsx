"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Paperclip, ArrowUp, BarChart3, Camera, FileImage, Calculator, Layout, Loader2 } from "lucide-react"
import { ChatMessages } from "./chat-messages"
import { CodePreview } from "./code-preview"

const suggestions = [
  {
    icon: BarChart3,
    text: "Create a dashboard with charts and analytics",
    color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
  },
  {
    icon: Camera,
    text: "Build a photo gallery component",
    color: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  },
  {
    icon: FileImage,
    text: "Design a contact form with validation",
    color: "bg-purple-100 text-purple-700 hover:bg-purple-200",
  },
  {
    icon: Layout,
    text: "Create a modern landing page",
    color: "bg-orange-100 text-orange-700 hover:bg-orange-200",
  },
  {
    icon: Calculator,
    text: "Build a pricing table component",
    color: "bg-pink-100 text-pink-700 hover:bg-pink-200",
  },
]

interface GeneratedFile {
  name: string
  content: string
}

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  code?: string
  files?: GeneratedFile[]
}

export function ChatInterface() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([])
  const [apiError, setApiError] = useState<string | null>(null)
  const [customCode, setCustomCode] = useState("")

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: "test connection" }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          if (errorData.error?.includes("API key")) {
            setApiError("Google API key not configured. Please add GOOGLE_API_KEY to environment variables.")
          }
        }
      } catch (error) {
        console.error("API check error:", error)
      }
    }

    checkApiStatus()
  }, [])

  const handleSubmit = async () => {
    if (!message.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: message,
    }
    setMessages((prev) => [...prev, userMessage])
    setMessage("")
    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: message }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || "Failed to generate code")
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: data.explanation || "I've generated a Next.js project for you.",
        files: data.files || [],
      }

      setMessages((prev) => [...prev, assistantMessage])
      setGeneratedFiles(data.files || [])
    } catch (error) {
      console.error("Error generating code:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: `Sorry, I encountered an error: ${
          error instanceof Error ? error.message : "Unknown error"
        }. Please try again.`,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsGenerating(false)
    }
  }

const handleSuggestionClick = (suggestionText: string) => {
  setMessage(suggestionText)
}

const handleCustomPreview = () => {
  if (!customCode.trim()) return
  const manualMessage: Message = {
    id: Date.now().toString(),
    type: "assistant",
    content: "Previewing custom code",
    files: [
      {
        name: "app/page.tsx",
        content: customCode,
      },
    ],
  }
  setMessages((prev) => [...prev, manualMessage])
  setGeneratedFiles([
    {
      name: "app/page.tsx",
      content: customCode,
    },
  ])
}

  const downloadProject = () => {
    if (generatedFiles.length === 0) return

    const projectFiles = [
      {
        name: "package.json",
        content: JSON.stringify(
          {
            name: "v0-generated-project",
            version: "0.1.0",
            private: true,
            scripts: {
              dev: "next dev",
              build: "next build",
              start: "next start",
              lint: "next lint",
            },
            dependencies: {
              next: "^14.0.0",
              react: "^18.0.0",
              "react-dom": "^18.0.0",
              "@types/node": "^20.0.0",
              "@types/react": "^18.0.0",
              "@types/react-dom": "^18.0.0",
              typescript: "^5.0.0",
              tailwindcss: "^3.3.0",
            },
          },
          null,
          2,
        ),
      },
      {
        name: "next.config.js",
        content: "/** @type {import('next').NextConfig} */\nconst nextConfig = {}\n\nmodule.exports = nextConfig",
      },
      {
        name: "tailwind.config.js",
        content: `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`,
      },
      {
        name: "app/layout.tsx",
        content: `import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`,
      },
      {
        name: "app/globals.css",
        content: "@tailwind base;\n@tailwind components;\n@tailwind utilities;",
      },
      {
        name: "app/page.tsx",
        content: generatedFiles[0]?.content || "export default function Home() { return <div>Hello World</div> }",
      },
      ...generatedFiles.slice(1).map((file) => ({
        name: `components/${file.name}`,
        content: file.content,
      })),
    ]

    const projectData = JSON.stringify(projectFiles, null, 2)
    const blob = new Blob([projectData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "v0-project-files.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-4">
      <div className="w-full max-w-6xl space-y-8">
        {messages.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChatMessages messages={messages} isGenerating={isGenerating} />
            {messages.some((m) => m.files && m.files.length > 0) && (
              <CodePreview
                files={messages.findLast((m) => m.files && m.files.length > 0)?.files || []}
                onDownload={downloadProject}
              />
            )}
          </div>
        ) : (
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-balance">What can I help you build?</h1>
            {apiError && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                {apiError}
                <br />
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Get your free API key here (25 requests/day)
                </a>
              </div>
            )}
          </div>
        )}

        <Card className="relative">
          <div className="flex items-start space-x-4 p-4">
            <div className="flex-1">
              <Textarea
                placeholder="Ask v0 to build..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
                className="min-h-[100px] resize-none border-0 p-0 focus-visible:ring-0 text-base"
              />
            </div>
          </div>
          <div className="flex items-center justify-between p-4 pt-0">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                <BarChart3 className="w-3 h-3 mr-1" />
                v0-clone-gemini
              </Badge>
              <Badge variant="outline" className="text-xs">
                Powered by Google Gemini 2.0 Flash
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button size="sm" disabled={!message.trim() || isGenerating} onClick={handleSubmit}>
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="relative">
          <div className="flex items-start space-x-4 p-4">
            <div className="flex-1">
              <Textarea
                placeholder="Paste React code to preview..."
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                className="min-h-[100px] resize-none border-0 p-0 focus-visible:ring-0 text-base"
              />
            </div>
          </div>
          <div className="flex items-center justify-end p-4 pt-0">
            <Button size="sm" disabled={!customCode.trim()} onClick={handleCustomPreview}>
              Preview Code
            </Button>
          </div>
        </Card>

        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className={`${suggestion.color} border-0`}
                onClick={() => handleSuggestionClick(suggestion.text)}
              >
                <suggestion.icon className="w-4 h-4 mr-2" />
                {suggestion.text}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
