"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/app/lib/utils";

export function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border border-white/10 bg-white/10 p-0.5 transition-colors data-[state=checked]:bg-[#2f6bff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f6bff]/40",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block size-5.5 rounded-full bg-white shadow-md transition-transform data-[state=checked]:translate-x-5" />
    </SwitchPrimitive.Root>
  );
}
