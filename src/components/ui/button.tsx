import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva("inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition duration-300 ease-out disabled:pointer-events-none disabled:opacity-45 active:scale-[.98]", {
  variants: {
    variant: {
      primary: "bg-accent text-[#17150f] hover:bg-[#d2b76e]",
      secondary: "border border-line bg-white/[.04] text-foreground hover:bg-white/[.08]",
      ghost: "text-muted hover:bg-white/[.05] hover:text-foreground",
      danger: "border border-danger/30 bg-danger/10 text-danger hover:bg-danger/15",
    },
    size: { default: "h-12", sm: "h-10 min-h-10 px-4", lg: "h-14 px-7 text-base", icon: "size-11 min-h-11 p-0" },
  },
  defaultVariants: { variant: "primary", size: "default" },
});

export function Button({ className, variant, size, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return <button data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
