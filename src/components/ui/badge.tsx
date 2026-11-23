import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        gold: "border-gold-500/40 bg-gold-500/10 text-gold-700 dark:text-gold-300 font-semibold",
        "rarity-5":
          "border-amber-500/40 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-700 dark:text-amber-300 font-semibold shadow-sm",
        "rarity-4":
          "border-purple-500/40 bg-purple-500/15 text-purple-700 dark:text-purple-300 font-semibold shadow-sm",
        pyro: "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400 font-medium",
        hydro: "border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium",
        anemo: "border-teal-500/40 bg-teal-500/10 text-teal-600 dark:text-teal-400 font-medium",
        electro: "border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium",
        dendro: "border-lime-500/40 bg-lime-500/10 text-lime-600 dark:text-lime-400 font-medium",
        cryo: "border-cyan-500/40 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-medium",
        geo: "border-amber-600/40 bg-amber-600/10 text-amber-700 dark:text-amber-400 font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
