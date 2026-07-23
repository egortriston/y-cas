import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold tracking-[-0.02em] transition will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yandex-yellow/70 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border border-white/20 bg-white text-black shadow-[0_20px_70px_rgba(188,112,255,.2),inset_0_1px_0_rgba(255,255,255,.62)] hover:-translate-y-0.5 hover:bg-[#f4efff]",
        secondary:
          "border border-white/14 bg-white/[0.055] text-white/74 shadow-[inset_0_1px_0_rgba(255,255,255,.1)] hover:-translate-y-0.5 hover:border-[#bb70ff]/38 hover:bg-white/[0.09]",
        ghost: "text-white/62 hover:bg-white/[0.06] hover:text-white",
      },
      size: {
        default: "h-11 px-5 py-2",
        lg: "h-14 px-7 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
