import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useLayersStore } from './layers'
import type { LayerConfig } from '../types'

export const useLayerTableStore = defineStore('layerTable', () => {
  const activeLayerId = ref<string | null>(null)
  const selectedFeatureId = ref<string | number | null>(null)
  const isMinimized = ref(false)
  const isMaximized = ref(false)
  const layersStore = useLayersStore()

  const isOpen = computed(() => activeLayerId.value !== null)

  const activeLayer = computed<LayerConfig | null>(() => {
    if (!activeLayerId.value) return null
    return layersStore.layers.find(l => l.id === activeLayerId.value) || null
  })

  function openTable(layerId: string) {
    if (activeLayerId.value === layerId) {
      if (isMinimized.value) {
        isMinimized.value = false
      }
      return
    }
    activeLayerId.value = layerId
    selectedFeatureId.value = null
    isMinimized.value = false
  }

  function closeTable() {
    activeLayerId.value = null
    selectedFeatureId.value = null
    isMinimized.value = false
    isMaximized.value = false
  }

  function toggleTable(layerId: string) {
    if (activeLayerId.value === layerId) {
      closeTable()
    } else {
      openTable(layerId)
    }
  }

  function selectFeature(featureId: string | number | null) {
    selectedFeatureId.value = featureId
  }

  function toggleMinimize() {
    isMinimized.value = !isMinimized.value
  }

  function toggleMaximize() {
    isMaximized.value = !isMaximized.value
    if (isMaximized.value) {
      isMinimized.value = false
    }
  }

  return {
    activeLayerId,
    selectedFeatureId,
    isMinimized,
    isMaximized,
    isOpen,
    activeLayer,
    openTable,
    closeTable,
    toggleTable,
    selectFeature,
    toggleMinimize,
    toggleMaximize
  }
})
