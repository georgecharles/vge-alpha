import { cn } from "@/lib/utils";
import React from "react";

interface MarqueeProps {
  children: React.ReactNode;
  direction?: "left" | "right" | "up" | "down";
  pauseOnHover?: boolean;
  reverse?: boolean;
  fade?: boolean;
  className?: string;
  vertical?: boolean;
}

export const Marquee = ({
  children,
  direction = "left",
  pauseOnHover = false,
  reverse = false,
  fade = false,
  className,
  vertical = false,
}: MarqueeProps) => {
  return (
    <div
      className={cn(
        "group flex gap-4 overflow-hidden",
        vertical ? "flex-col" : "flex-row",
        className
      )}
    >
      <div
        className={cn(
          "flex min-w-full shrink-0 animate-marquee items-center justify-around gap-4",
          vertical ? "flex-col" : "flex-row",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
          reverse && "animate-marquee-reverse"
        )}
      >
        {children}
      </div>
      <div
        className={cn(
          "flex min-w-full shrink-0 animate-marquee items-center justify-around gap-4",
          vertical ? "flex-col" : "flex-row",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
          reverse && "animate-marquee-reverse"
        )}
      >
        {children}
      </div>
    </div>
  );
}; 