import { CardHeader } from "@/components/ui/card";
import { Orb } from "@/components/ui/orb";
import { ShimmeringText } from "@/components/ui/shimmering-text";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  agentName: string;
  errorMessage: string | null;
  agentState: "disconnected" | "connecting" | "connected" | "disconnecting" | null;
  isTransitioning: boolean;
  getInputVolume: () => number;
  getOutputVolume: () => number;
}

export function ChatHeader({
  agentName,
  errorMessage,
  agentState,
  isTransitioning,
  getInputVolume,
  getOutputVolume,
}: ChatHeaderProps) {
  return (
    <CardHeader className="flex shrink-0 flex-row items-center justify-between pb-4">
      <div className="flex items-center gap-4">
        <div className="ring-border relative size-10 overflow-hidden rounded-full ring-1">
          <Orb
            className="h-full w-full"
            volumeMode="manual"
            getInputVolume={getInputVolume}
            getOutputVolume={getOutputVolume}
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-sm leading-none font-medium">{agentName}</p>
          <div className="flex items-center gap-2">
            {errorMessage ? (
              <p className="text-destructive text-xs">{errorMessage}</p>
            ) : agentState === "disconnected" || agentState === null ? (
              <p className="text-muted-foreground text-xs">Tap to start voice chat</p>
            ) : agentState === "connected" ? (
              <p className="text-xs text-green-600">Connected</p>
            ) : isTransitioning ? (
              <ShimmeringText text={agentState || ""} className="text-xs capitalize" />
            ) : null}
          </div>
        </div>
      </div>
      <div
        className={cn(
          "flex h-2 w-2 rounded-full transition-all duration-300",
          agentState === "connected" && "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]",
          isTransitioning && "animate-pulse bg-white/40"
        )}
      />
    </CardHeader>
  );
}
