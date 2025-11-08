"use client"

import { memo, type ComponentProps, type ReactNode } from "react"
import { Streamdown } from "streamdown"

import { cn } from "@/lib/utils"

type ResponseProps = Omit<ComponentProps<typeof Streamdown>, "children"> & {
  children?: ReactNode
}


export const Response = memo(
  ({ className, children, ...props }: ResponseProps) => {
    // If children is not a string, render directly (for shimmer, etc)
    if (typeof children !== "string") {
      return (
        <div className={cn("size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0", className)}>
          {children}
        </div>
      );
    }
    // Otherwise, render markdown as before
    return (
      <Streamdown
        className={cn(
          "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
          className
        )}
        {...props}
      >
        {children}
      </Streamdown>
    );
  },
  (prevProps, nextProps) => prevProps.children === nextProps.children
)

Response.displayName = "Response"
