import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Button } from "./Button.vue"

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // 温暖友好变体
        warm: "bg-warm-600 text-white shadow hover:bg-warm-800 transition-all duration-200 hover:shadow-md",
        "outline-warm": "border border-warm-200 text-warm-600 bg-transparent shadow-sm hover:bg-warm-50 hover:text-warm-800 transition-all duration-200",
        soft: "bg-warm-200 text-warm-600 shadow-sm hover:bg-warm-400 hover:text-warm-800 transition-all duration-200",
        gradient: "bg-gradient-to-r from-warm-400 to-warm-600 text-white shadow hover:from-warm-600 hover:to-warm-800 transition-all duration-200 hover:shadow-md",
        glass: "bg-white/20 backdrop-blur-sm border border-white/30 text-warm-800 shadow-sm hover:bg-white/30 hover:shadow transition-all duration-200",
      },
      size: {
        "default": "h-9 px-4 py-2",
        "xs": "h-7 rounded px-2",
        "sm": "h-8 rounded-md px-3 text-xs",
        "lg": "h-10 rounded-md px-8",
        "xl": "h-12 rounded-lg px-10 text-base",
        "icon": "h-9 w-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
        "icon-xl": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
