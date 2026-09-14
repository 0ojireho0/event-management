import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] leading-4 font-semibold whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-[#e2dfff] text-[#3525cd]",
        success: "bg-[#6cf8bb] text-[#00714d]",
        neutral: "bg-[#e2e7ff] text-[#464555]",
        dark: "bg-[#006c49] text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({ className, variant, ...props }) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
