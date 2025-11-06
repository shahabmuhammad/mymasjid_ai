import { CardContent } from "@/components/ui/card";
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from "@/components/ui/conversation";
import { Orb } from "@/components/ui/orb";
import { ShimmeringText } from "@/components/ui/shimmering-text";
import { Message, MessageContent } from "@/components/ui/message";
import { Response } from "@/components/ui/response";
import { ChatActions, ChatAction } from "@/components/ui/chat-actions";
import { CheckIcon, CopyIcon } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatAreaProps {
  messages: ChatMessage[];
  agentState: "disconnected" | "connecting" | "connected" | "disconnecting" | null;
  isCallActive: boolean;
  copiedIndex: number | null;
  setCopiedIndex: (index: number | null) => void;
}

export function ChatArea({ messages, agentState, isCallActive, copiedIndex, setCopiedIndex }: ChatAreaProps) {
  return (
    <CardContent className="flex-1 overflow-hidden p-0 min-h-0">
      <Conversation className="h-full">
        <ConversationContent className="flex flex-col gap-2 min-h-0 min-w-0 p-6 pb-2 overflow-y-auto">
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<Orb className="size-12" />}
              title={
                agentState === "connecting" ? (
                  <ShimmeringText text="Starting conversation" />
                ) : agentState === "connected" ? (
                  <ShimmeringText text="Start talking or type" />
                ) : (
                  "Start a conversation"
                )
              }
              description={
                agentState === "connecting"
                  ? "Connecting..."
                  : agentState === "connected"
                  ? "Ready to chat"
                  : "Type a message or tap the voice button"
              }
            />
          ) : (
            messages.map((message, index) => (
              <div key={index} className="flex w-full flex-col gap-1">
                <Message from={message.role}>
                  <MessageContent className="max-w-full min-w-0">
                    <Response className="w-auto [overflow-wrap:anywhere] whitespace-pre-wrap">
                      {message.content}
                    </Response>
                  </MessageContent>
                  {message.role === "assistant" && (
                    <div className="ring-border size-6 flex-shrink-0 self-end overflow-hidden rounded-full ring-1">
                      <Orb
                        className="h-full w-full"
                        agentState={isCallActive && index === messages.length - 1 ? "talking" : null}
                      />
                    </div>
                  )}
                </Message>
                {message.role === "assistant" && (
                  <ChatActions>
                    <ChatAction
                      size="sm"
                      tooltip={copiedIndex === index ? "Copied!" : "Copy"}
                      onClick={() => {
                        navigator.clipboard.writeText(message.content);
                        setCopiedIndex(index);
                        setTimeout(() => setCopiedIndex(null), 2000);
                      }}
                    >
                      {copiedIndex === index ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
                    </ChatAction>
                  </ChatActions>
                )}
              </div>
            ))
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
    </CardContent>
  );
}
