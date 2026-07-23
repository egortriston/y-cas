import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "min-h-[220px] w-full resize-none rounded-md border border-white/12 bg-white/[0.055] px-4 py-4 text-base leading-relaxed text-white outline-none transition placeholder:text-white/32 focus:border-yandex-yellow/70 focus:bg-white/[0.075] focus:ring-4 focus:ring-yandex-yellow/10",
      className,
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
