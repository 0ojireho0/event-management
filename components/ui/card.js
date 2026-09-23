import * as React from "react";

import { cn } from "@/lib/utils";

function Card({ className, ...props }) {
  return (
    <div
      data-slot="card"
      className={cn(
        "rounded-2xl bg-white text-[#25170f] shadow-[0_1px_3px_rgba(40,48,68,0.08)] transition-shadow hover:shadow-[0_8px_24px_rgba(40,48,68,0.09)]",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }) {
  return <div data-slot="card-content" className={cn("p-6", className)} {...props} />;
}

export { Card, CardContent };
