import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Spotlight({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className={cn(
        "pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,204,0,.18),rgba(255,204,0,.06)_34%,transparent_66%)] blur-2xl",
        className,
      )}
    />
  );
}
