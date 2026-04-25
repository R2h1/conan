<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import type { CardVariants } from "."
import { cn } from "@/lib/utils"
import { cardVariants } from "."

interface Props {
  variant?: CardVariants["variant"]
  padding?: CardVariants["padding"]
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  variant: "default",
  padding: "default",
})
</script>

<template>
  <div
    :class="
      cn(
        cardVariants({ variant, padding }),
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
