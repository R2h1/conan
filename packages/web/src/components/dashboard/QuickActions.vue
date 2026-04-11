<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <a
      v-for="action in actions"
      :key="action.label"
      :href="action.href"
      class="card-clickable p-4 block"
    >
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg bg-primary/10">
          <component :is="action.icon" class="h-5 w-5 text-primary" />
        </div>
        <div>
          <p class="font-medium">{{ action.label }}</p>
          <p class="text-sm text-muted-foreground">{{ action.description }}</p>
        </div>
      </div>
    </a>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  actions: Array<{
    label: string;
    description: string;
    href: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
  }>;
}>();
</script>
