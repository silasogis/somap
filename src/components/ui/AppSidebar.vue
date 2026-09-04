<template>
  <aside class="w-80 flex-shrink-0 flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 overflow-hidden" :class="{ '-ml-80': !isOpen }">
    <WorkspaceSwitcher class="flex-shrink-0" />
    <LayerPanel class="flex-1 min-h-0" />
  </aside>
</template>

<script setup lang="ts">
import WorkspaceSwitcher from '../workspace/WorkspaceSwitcher.vue'
import LayerPanel from '../layers/LayerPanel.vue'

defineProps<{ isOpen: boolean }>()
</script>
