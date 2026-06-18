import * as React from "react";

import { cn } from "@/app/lib/utils";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-[#181b23] text-white shadow-[0_14px_34px_rgba(0,0,0,0.2)]",
        className,
      )}
      {...props}
    />
  );
}
