import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useRouteStore } from './route'
import { useNdviClimateStore } from './ndviClimate'
import { useSentinelRgbStore } from './sentinelRgb'

export interface IdentifiedFeature {
  layerName: string
  properties: Record<string, any>
}

export const useIdentifyStore = defineStore('identify', () => {
  const isActive = ref(false)
  const loading = ref(false)
  const features = ref<IdentifiedFeature[]>([])
  const coordinate = ref<[number, number] | null>(null)

  const routeStore = useRouteStore()
  const ndviClimateStore = useNdviClimateStore()
  const sentinelRgbStore = useSentinelRgbStore()

  function toggleActive() {
    isActive.value = !isActive.value
    if (isActive.value) {
      // Deactivate other analytical/drawing stores to prevent map interactions conflicts
      if (routeStore.isActive) {
        routeStore.isActive = false
      }
      if (ndviClimateStore.isActive) {
        ndviClimateStore.clearAnalysis()
        ndviClimateStore.isActive = false
      }
      if (sentinelRgbStore.isActive) {
        sentinelRgbStore.clearAnalysis()
        sentinelRgbStore.isActive = false
      }
      clear()
    }
  }

  function clear() {
    features.value = []
    coordinate.value = null
    loading.value = false
  }

  // Deactivate identify if other modes are activated
  watch(
    () => [routeStore.isActive, ndviClimateStore.isActive, sentinelRgbStore.isActive],
    ([routeActive, ndviActive, sentinelActive]) => {
      if (routeActive || ndviActive || sentinelActive) {
        isActive.value = false
        clear()
      }
    }
  )

  return {
    isActive,
    loading,
    features,
    coordinate,
    toggleActive,
    clear
  }
})
