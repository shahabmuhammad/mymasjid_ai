import { CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendIcon, AudioLinesIcon, PhoneOffIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

interface ChatFooterProps {
  textInput: string;
  onTextInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSendText: () => void;
  onCall: () => void;
  isCallActive: boolean;
  isTransitioning: boolean;
}

export function ChatFooter({
  textInput,
  onTextInputChange,
  onKeyDown,
  onSendText,
  onCall,
  isCallActive,
  isTransitioning,
}: ChatFooterProps) {
  return (
    <CardFooter className="shrink-0 border-t">
      <div className="flex w-full items-center gap-2">
        <div className="flex flex-1 items-center gap-2">
          <Input
            value={textInput}
            onChange={onTextInputChange}
            onKeyDown={onKeyDown}
            placeholder="Type a message..."
            className="h-9 focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={isTransitioning}
          />
          <Button
            onClick={onSendText}
            size="icon"
            variant="ghost"
            className="rounded-full"
            disabled={!textInput.trim() || isTransitioning}
          >
            <SendIcon className="size-4" />
            <span className="sr-only">Send message</span>
          </Button>
          {!isCallActive && (
            <Button
              onClick={onCall}
              size="icon"
              variant="ghost"
              className={cn("relative shrink-0 rounded-full transition-all")}
              disabled={isTransitioning}
            >
              <AudioLinesIcon className="size-4" />
              <span className="sr-only">Start voice call</span>
            </Button>
          )}
          {isCallActive && (
            <Button
              onClick={onCall}
              size="icon"
              variant="secondary"
              className={cn("relative shrink-0 rounded-full transition-all")}
              disabled={isTransitioning}
            >
              <PhoneOffIcon className="size-4" />
              <span className="sr-only">End call</span>
            </Button>
          )}
        </div>
      </div>
    </CardFooter>
  );
}
