"use client"

import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Bot, Loader2 } from "lucide-react"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  code?: string
  files?: Array<{ name: string; content: string }>
}

interface ChatMessagesProps {
  messages: Message[]
  isGenerating: boolean
}

export function ChatMessages({ messages, isGenerating }: ChatMessagesProps) {
  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto">
      {messages.map((message) => (
        <Card key={message.id} className="p-4">
          <div className="flex items-start space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback>
                {message.type === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="font-medium">{message.type === "user" ? "You" : "v0"}</div>
              <div className="text-sm text-gray-600 whitespace-pre-wrap">{message.content}</div>
              {message.files && message.files.length > 0 && (
                <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  Generated {message.files.length} file{message.files.length > 1 ? "s" : ""}:{" "}
                  {message.files.map((f) => f.name).join(", ")}
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}

      {isGenerating && (
        <Card className="p-4">
          <div className="flex items-start space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback>
                <Bot className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="font-medium">v0</div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating your component...</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
