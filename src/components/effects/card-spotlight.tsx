import { useState } from "react";
import { cn } from "@/lib/utils";

export function CardSpotlight({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [position, setPosition] = useState({ x: 50, y: 50 });

  return (
    <div
      className={cn("relative overflow-hidden rounded-lg border border-white/12 bg-white/[0.055]", className)}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setPosition({
          x: ((event.clientX - rect.left) / rect.width) * 100,
          y: ((event.clientY - rect.top) / rect.height) * 100,
        });
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 hover:opacity-100"
        style={{
          background: `radial-gradient(circle at ${position.x}% ${position.y}%, rgba(255,204,0,.18), transparent 34%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
