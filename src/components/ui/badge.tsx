import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex h-9 items-center rounded-full border border-white/12 bg-white/[0.055] px-4 text-sm font-medium text-white/70",
        className,
      )}
      {...props}
    />
  );
}
