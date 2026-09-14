import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#3525cd]/30 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[#3525cd] text-white shadow-sm hover:bg-[#4f46e5] hover:shadow-md",
        secondary:
          "bg-[#f2f3ff] text-[#131b2e] hover:bg-[#e2e7ff]",
        success:
          "bg-[#006c49] text-white shadow-sm hover:bg-[#005a3e]",
        amber:
          "bg-[#885500] text-white shadow-sm hover:bg-[#684000]",
        ghost: "text-[#464555] hover:bg-[#f2f3ff] hover:text-[#131b2e]",
        link: "h-auto rounded-none p-0 text-[#3525cd] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 px-5",
        icon: "size-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
