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
    const index = layers.value.findIndex(l => l.id === id)
    if (index === -1) return

    const current = layers.value[index]
    if (!current) return

    if (current.isLocal) {
      layers.value[index] = { ...current, ...updates } as LayerConfig
      return
    }

    const res = await apiFetch<LayerConfig>(`/layers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
    layers.value[index] = res
  }

  function addLocalLayer(layer: LayerConfig) {
    const maxZIndex = layers.value.reduce((max, l) => Math.max(max, l.zIndex || 0), 0)
    layer.zIndex = maxZIndex + 10
    layers.value.push(layer)
  }

  function removeLayer(id: string) {
    layers.value = layers.value.filter(l => l.id !== id)
  }

  function reorderLayers(newLayers: LayerConfig[]) {
    newLayers.forEach((l, i) => {
      l.zIndex = i * 10
    })
    layers.value = newLayers
  }

  return { layers, fetchLayers, updateLayer, addLocalLayer, removeLayer, reorderLayers }
})
