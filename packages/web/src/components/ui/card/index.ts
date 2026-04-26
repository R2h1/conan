import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Card } from "./Card.vue"
export { default as CardContent } from "./CardContent.vue"
export { default as CardDescription } from "./CardDescription.vue"
export { default as CardFooter } from "./CardFooter.vue"
export { default as CardHeader } from "./CardHeader.vue"
export { default as CardTitle } from "./CardTitle.vue"

export const cardVariants = cva(
  "rounded-xl border bg-card text-card-foreground shadow transition-all duration-200",
  {
    variants: {
      variant: {
        default: "",
        glass: "glass border-white/20 bg-white/10 backdrop-blur-sm",
        gradient: "bg-gradient-to-br from-warm-50 to-warm-200 border-warm-200",
        interactive: "cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-primary/50 transition-transform duration-300",
        bordered: "border-2 border-primary/20",
        elevated: "shadow-lg border-0",
        flat: "shadow-none border-0 bg-transparent",
      },
      padding: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
        none: "p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
)

export type CardVariants = VariantProps<typeof cardVariants>
