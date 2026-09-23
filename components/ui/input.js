import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-xl border-0 bg-[#fff4ee] px-3 text-sm text-[#25170f] outline-none placeholder:text-[#96877f] focus-visible:ring-2 focus-visible:ring-[#f6671e]/25 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
