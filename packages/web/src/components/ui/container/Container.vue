<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

interface Props {
  size?: "sm" | "md" | "lg" | "xl" | "full"
  centered?: boolean
  padded?: boolean
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  size: "md",
  centered: true,
  padded: true,
})

const sizeClasses = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  full: "max-w-full",
}

const paddingClasses = props.padded ? "px-4 sm:px-6 lg:px-8" : ""
const centerClasses = props.centered ? "mx-auto" : ""
</script>

<template>
  <div
    :class="
      cn(
        'w-full',
        sizeClasses[size],
        paddingClasses,
        centerClasses,
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>