import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-xl border-0 bg-[#f2f3ff] px-3 text-sm text-[#131b2e] outline-none placeholder:text-[#777587] focus-visible:ring-2 focus-visible:ring-[#3525cd]/25 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
