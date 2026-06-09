import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LayerConfig } from '../types'
import { apiFetch } from '../services/api'

export const useLayersStore = defineStore('layers', () => {
  const layers = ref<LayerConfig[]>([])
  
  async function fetchLayers(workspaceId: string) {
    layers.value = await apiFetch<LayerConfig[]>(`/layers?workspaceId=${workspaceId}`)
    layers.value.sort((a, b) => {
      const aBase = a.basemap ? 1 : 0
      const bBase = b.basemap ? 1 : 0
      if (aBase !== bBase) {
        return bBase - aBase
      }
      return a.zIndex - b.zIndex
    })
  }

  async function updateLayer(id: string, updates: Partial<LayerConfig>) {
    const res = await apiFetch<LayerConfig>(`/layers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
    const index = layers.value.findIndex(l => l.id === id)
    if (index !== -1) {
      layers.value[index] = res
    }
  }

  function reorderLayers(newLayers: LayerConfig[]) {
    newLayers.forEach((l, i) => {
      l.zIndex = i * 10
    })
    layers.value = newLayers
  }

  return { layers, fetchLayers, updateLayer, reorderLayers }
})
