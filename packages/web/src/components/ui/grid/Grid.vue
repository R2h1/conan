<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

interface Props {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  sm?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  md?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  lg?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  gap?: "none" | "sm" | "md" | "lg" | "xl"
  gapX?: "none" | "sm" | "md" | "lg" | "xl"
  gapY?: "none" | "sm" | "md" | "lg" | "xl"
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  cols: 1,
  gap: "md",
})

const gridColsClasses = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  7: "grid-cols-7",
  8: "grid-cols-8",
  9: "grid-cols-9",
  10: "grid-cols-10",
  11: "grid-cols-11",
  12: "grid-cols-12",
}

const smColsClasses = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-5",
  6: "sm:grid-cols-6",
  7: "sm:grid-cols-7",
  8: "sm:grid-cols-8",
  9: "sm:grid-cols-9",
  10: "sm:grid-cols-10",
  11: "sm:grid-cols-11",
  12: "sm:grid-cols-12",
}

const mdColsClasses = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
  6: "md:grid-cols-6",
  7: "md:grid-cols-7",
  8: "md:grid-cols-8",
  9: "md:grid-cols-9",
  10: "md:grid-cols-10",
  11: "md:grid-cols-11",
  12: "md:grid-cols-12",
}

const lgColsClasses = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
  7: "lg:grid-cols-7",
  8: "lg:grid-cols-8",
  9: "lg:grid-cols-9",
  10: "lg:grid-cols-10",
  11: "lg:grid-cols-11",
  12: "lg:grid-cols-12",
}

const gapClasses = {
  none: "gap-0",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
}

const gapXClasses = {
  none: "gap-x-0",
  sm: "gap-x-2",
  md: "gap-x-4",
  lg: "gap-x-6",
  xl: "gap-x-8",
}

const gapYClasses = {
  none: "gap-y-0",
  sm: "gap-y-2",
  md: "gap-y-4",
  lg: "gap-y-6",
  xl: "gap-y-8",
}
</script>

<template>
  <div
    :class="
      cn(
        'grid',
        gridColsClasses[cols],
        sm && smColsClasses[sm],
        md && mdColsClasses[md],
        lg && lgColsClasses[lg],
        gapClasses[gap],
        gapX && gapXClasses[gapX],
        gapY && gapYClasses[gapY],
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>