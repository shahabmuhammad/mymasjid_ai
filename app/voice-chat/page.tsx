"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { ComponentProps } from "react"
import { useConversation } from "@elevenlabs/react"
import {
  AudioLinesIcon,
  CheckIcon,
  CopyIcon,
  PhoneOffIcon,
  SendIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChatHeader } from "@/components/ui/chat-header"
import { ChatArea } from "@/components/ui/chat-area"
import { ChatFooter } from "@/components/ui/chat-footer"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@radix-ui/react-tooltip"

type SystemMessageType = "initial" | "connecting" | "connected" | "error"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp?: Date
  type?: SystemMessageType
}

const DEFAULT_AGENT = {
  agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!,
  name: "My Masjid",
  description: "AI Voice Assistant",
}

type ChatActionsProps = ComponentProps<"div">

const ChatActions = ({ className, children, ...props }: ChatActionsProps) => (
  <div className={cn("flex items-center gap-1", className)} {...props}>
    {children}
  </div>
)

type ChatActionProps = ComponentProps<typeof Button> & {
  tooltip?: string
  label?: string
}

const ChatAction = ({
  tooltip,
  children,
  label,
  className,
  variant = "ghost",
  size = "sm",
  ...props
}: ChatActionProps) => {
  const button = (
    <Button
      className={cn(
        "text-muted-foreground hover:text-foreground relative size-9 p-1.5",
        className
      )}
      size={size}
      type="button"
      variant={variant}
      {...props}
    >
      {children}
      <span className="sr-only">{label || tooltip}</span>
    </Button>
  )

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return button
}

export default function Page() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [agentState, setAgentState] = useState<
    "disconnected" | "connecting" | "connected" | "disconnecting" | null
  >("disconnected")
  const [textInput, setTextInput] = useState("")
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const isTextOnlyModeRef = useRef<boolean>(true)

  const conversation = useConversation({
    onConnect: () => {
      if (!isTextOnlyModeRef.current) {
        setMessages([])
      }
    },
    onDisconnect: () => {
      if (!isTextOnlyModeRef.current) {
        setMessages([])
      }
    },
    onMessage: (message) => {
      if (message.message) {
        const newMessage: ChatMessage = {
          role: message.source === "user" ? "user" : "assistant",
          content: message.message,
        }
        setMessages((prev) => [...prev, newMessage])
      }
    },
    onError: (error) => {
      console.error("Error:", error)
      setAgentState("disconnected")
    },
    onDebug: (debug) => {
      console.log("Debug:", debug)
    },
  })

  const getMicStream = useCallback(async () => {
    if (mediaStreamRef.current) return mediaStreamRef.current

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream
      setErrorMessage(null)
      return stream
    } catch (error) {
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setErrorMessage("Please enable microphone permissions in your browser.")
      }
      throw error
    }
  }, [])

  const startConversation = useCallback(
    async (textOnly: boolean = true, skipConnectingMessage: boolean = false) => {
      try {
        isTextOnlyModeRef.current = textOnly

        if (!skipConnectingMessage) {
          setMessages([])
        }

        if (!textOnly) {
          await getMicStream()
        }

        await conversation.startSession({
          agentId: DEFAULT_AGENT.agentId,
          connectionType: textOnly ? "websocket" : "webrtc",
          overrides: {
            conversation: {
              textOnly: textOnly,
            },
            agent: {
              firstMessage: textOnly ? "" : undefined,
            },
          },
          onStatusChange: (status) => setAgentState(status.status),
        })
      } catch (error) {
        console.error(error)
        setAgentState("disconnected")
        setMessages([])
      }
    },
    [conversation, getMicStream]
  )

  const handleCall = useCallback(async () => {
    if (agentState === "disconnected" || agentState === null) {
      setAgentState("connecting")
      try {
        await startConversation(false)
      } catch {
        setAgentState("disconnected")
      }
    } else if (agentState === "connected") {
      conversation.endSession()
      setAgentState("disconnected")

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop())
        mediaStreamRef.current = null
      }
    }
  }, [agentState, conversation, startConversation])

  const handleTextInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTextInput(e.target.value)
    },
    []
  )

  const handleSendText = useCallback(async () => {
    if (!textInput.trim()) return

    const messageToSend = textInput

    if (agentState === "disconnected" || agentState === null) {
      const userMessage: ChatMessage = {
        role: "user",
        content: messageToSend,
      }
      setTextInput("")
      setAgentState("connecting")

      try {
        await startConversation(true, true)
        setMessages([userMessage])
        conversation.sendUserMessage(messageToSend)
      } catch (error) {
        console.error("Failed to start conversation:", error)
      }
    } else if (agentState === "connected") {
      const newMessage: ChatMessage = {
        role: "user",
        content: messageToSend,
      }
      setMessages((prev) => [...prev, newMessage])
      setTextInput("")

      conversation.sendUserMessage(messageToSend)
    }
  }, [textInput, agentState, conversation, startConversation])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSendText()
      }
    },
    [handleSendText]
  )

  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  const isCallActive = agentState === "connected"
  const isTransitioning =
    agentState === "connecting" || agentState === "disconnecting"

  const getInputVolume = useCallback(() => {
    const rawValue = conversation.getInputVolume?.() ?? 0
    return Math.min(1.0, Math.pow(rawValue, 0.5) * 2.5)
  }, [conversation])

  const getOutputVolume = useCallback(() => {
    const rawValue = conversation.getOutputVolume?.() ?? 0
    return Math.min(1.0, Math.pow(rawValue, 0.5) * 2.5)
  }, [conversation])

  return (
    <div className="flex justify-center h-screen w-full px-[15%] py-2">
      <Card className="mx-auto flex h-full w-full flex-col gap-0 overflow-hidden">
        <ChatHeader
          agentName={DEFAULT_AGENT.name}
          errorMessage={errorMessage}
          agentState={agentState}
          isTransitioning={isTransitioning}
          getInputVolume={getInputVolume}
          getOutputVolume={getOutputVolume}
        />
        <ChatArea
          messages={messages}
          agentState={agentState}
          isCallActive={isCallActive}
          copiedIndex={copiedIndex}
          setCopiedIndex={setCopiedIndex}
        />
        <ChatFooter
          textInput={textInput}
          onTextInputChange={handleTextInputChange}
          onKeyDown={handleKeyDown}
          onSendText={handleSendText}
          onCall={handleCall}
          isCallActive={isCallActive}
          isTransitioning={isTransitioning}
        />
      </Card>
    </div>
  )
}
