<template>
  <div class="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
    <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Workspace</label>
    <select v-model="selected" class="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-teal-500 focus:border-teal-500 block p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white font-medium shadow-sm transition-colors">
      <option v-for="ws in workspaces" :key="ws.id" :value="ws.id">{{ ws.name }}</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { Workspace } from '../../types'
import { apiFetch } from '../../services/api'
import { useLayersStore } from '../../stores/layers'

const workspaces = ref<Workspace[]>([])
const selected = ref('ws-1')
const layersStore = useLayersStore()

onMounted(async () => {
  workspaces.value = await apiFetch<Workspace[]>('/workspaces')
  if (workspaces.value.length > 0) {
    const firstWorkspace = workspaces.value[0]
    if (firstWorkspace) {
      selected.value = firstWorkspace.id
      layersStore.fetchLayers(selected.value)
    }
  }
})

watch(selected, (newWs) => {
  layersStore.fetchLayers(newWs)
})
</script>
