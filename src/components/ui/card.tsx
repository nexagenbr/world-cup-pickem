import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="card" className={cn("rounded-[1.75rem] border border-line bg-surface shadow-[inset_0_1px_0_rgba(255,255,255,.035)]", className)} {...props} />;
}
