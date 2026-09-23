import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#f6671e]/30 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[#f6671e] text-white shadow-sm hover:bg-[#dc4f0a] hover:shadow-md",
        secondary:
          "bg-[#fff4ee] text-[#25170f] hover:bg-[#ffdece]",
        success:
          "bg-[#006c49] text-white shadow-sm hover:bg-[#005a3e]",
        amber:
          "bg-[#885500] text-white shadow-sm hover:bg-[#684000]",
        ghost: "text-[#6f625b] hover:bg-[#fff4ee] hover:text-[#25170f]",
        link: "h-auto rounded-none p-0 text-[#f6671e] underline-offset-4 hover:underline",
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
