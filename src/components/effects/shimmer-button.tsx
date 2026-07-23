import * as React from "react";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "@/components/ui/button";

export const ShimmerButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, children, ...props }, ref) => (
  <Button
    ref={ref}
    className={cn(
      "relative isolate overflow-hidden before:absolute before:inset-0 before:-z-10 before:animate-shimmer before:bg-[linear-gradient(110deg,transparent,rgba(255,255,255,.55),transparent)] before:bg-[length:220%_100%]",
      className,
    )}
    {...props}
  >
    {children}
  </Button>
));
ShimmerButton.displayName = "ShimmerButton";
