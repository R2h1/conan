<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

interface Props {
  orientation?: "horizontal" | "vertical"
  variant?: "solid" | "dashed" | "dotted" | "gradient"
  size?: "sm" | "md" | "lg"
  color?: "default" | "primary" | "secondary" | "muted" | "warm"
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  orientation: "horizontal",
  variant: "solid",
  size: "md",
  color: "default",
})

const orientationClasses = {
  horizontal: "w-full h-px my-4",
  vertical: "h-full w-px mx-4",
}

const variantClasses = {
  solid: "",
  dashed: "border-dashed",
  dotted: "border-dotted",
  gradient: "bg-gradient-to-r from-transparent via-current to-transparent border-0",
}

const sizeClasses = {
  sm: {
    horizontal: "my-2",
    vertical: "mx-2",
  },
  md: {
    horizontal: "my-4",
    vertical: "mx-4",
  },
  lg: {
    horizontal: "my-6",
    vertical: "mx-6",
  },
}

const colorClasses = {
  default: "border-border",
  primary: "border-primary",
  secondary: "border-secondary",
  muted: "border-muted",
  warm: "border-warm-200",
}
</script>

<template>
  <div
    v-if="variant === 'gradient'"
    :class="
      cn(
        orientationClasses[orientation],
        sizeClasses[size][orientation],
        variantClasses[variant],
        colorClasses[color],
        props.class,
      )
    "
    aria-orientation="orientation"
    role="separator"
  />
  <hr
    v-else
    :class="
      cn(
        'border-0 border-t',
        orientationClasses[orientation],
        sizeClasses[size][orientation],
        variantClasses[variant],
        colorClasses[color],
        props.class,
      )
    "
    aria-orientation="orientation"
  />
</template>