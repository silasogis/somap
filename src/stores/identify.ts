import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useRouteStore } from './route'
import { useNdviClimateStore } from './ndviClimate'
import { useSentinelRgbStore } from './sentinelRgb'
import { useEudrComplianceStore } from './eudrCompliance'

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
  const eudrStore = useEudrComplianceStore()

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
      if (eudrStore.isActive) {
        eudrStore.clearAnalysis()
        eudrStore.isActive = false
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
    () => [routeStore.isActive, ndviClimateStore.isActive, sentinelRgbStore.isActive, eudrStore.isActive],
    ([routeActive, ndviActive, sentinelActive, eudrActive]) => {
      if (routeActive || ndviActive || sentinelActive || eudrActive) {
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
