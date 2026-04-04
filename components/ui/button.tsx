import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-primary-fixed/40 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-red-500 aria-invalid:ring-2 aria-invalid:ring-red-500/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Primary: teal sólido — CTA principal Meridian
        default:     "bg-primary-fixed text-white hover:bg-secondary active:opacity-90",
        primary:     "bg-primary-fixed text-white hover:bg-secondary active:opacity-90",
        // Secondary: navy sólido — acción secundaria de peso
        secondary:   "bg-primary text-white hover:bg-primary-container active:opacity-90",
        // Ghost: tonal sobre superficie
        ghost:       "hover:bg-surface-high text-on-surface hover:text-on-surface",
        // Outline: borde sutil
        outline:     "border-outline-variant text-on-surface hover:bg-surface-high",
        // Destructive
        destructive: "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-300 dark:hover:bg-red-900/50",
        // Link
        link:        "text-primary-fixed underline-offset-4 hover:underline",
      },
      size: {
        default:   "h-8 gap-1.5 px-3",
        xs:        "h-6 gap-1 rounded-md px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm:        "h-7 gap-1 rounded-md px-2.5 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg:        "h-10 gap-1.5 px-4",
        icon:      "size-8",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-md",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
