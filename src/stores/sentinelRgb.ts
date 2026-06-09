import { defineStore } from 'pinia'
import { ref } from 'vue'
import { geeService, type SentinelRgbResponse } from '../services/geeService'
import { useRouteStore } from './route'
import { useNdviClimateStore } from './ndviClimate'

export const useSentinelRgbStore = defineStore('sentinelRgb', () => {
  const isActive = ref(false)
  const isDrawing = ref(false)
  const datePeriods = ref<[string, string][]>([['2024-01-01', '2024-01-28']])
  
  const roi = ref<{ type: 'Polygon'; coordinates: number[][][] } | null>(null)
  const centroid = ref<[number, number] | null>(null)
  
  const rgbData = ref<SentinelRgbResponse | null>(null)
  
  const selectedPeriodKey = ref<string>('period_1')
  const tileOpacity = ref<number>(0.8)
  const tileVisible = ref<boolean>(true)
  
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)

  function toggleActive() {
    isActive.value = !isActive.value
    if (isActive.value) {
      // Deactivate routing and NDVI stores to prevent map interaction conflicts
      const routeStore = useRouteStore()
      if (routeStore.isActive) {
        routeStore.toggleActive()
      }
      const ndviClimateStore = useNdviClimateStore()
      if (ndviClimateStore.isActive) {
        ndviClimateStore.toggleActive()
      }
    } else {
      clearAnalysis()
    }
  }

  function startDrawing() {
    if (!isActive.value) return
    isDrawing.value = true
    errorMessage.value = null
  }

  function stopDrawing() {
    isDrawing.value = false
  }

  function addDatePeriod(start: string, end: string) {
    datePeriods.value.push([start, end])
  }

  function removeDatePeriod(index: number) {
    if (datePeriods.value.length > 1) {
      datePeriods.value.splice(index, 1)
      const removedKey = `period_${index + 1}`
      if (selectedPeriodKey.value === removedKey) {
        selectedPeriodKey.value = 'period_1'
      }
    }
  }

  function updateDatePeriod(index: number, start: string, end: string) {
    if (datePeriods.value[index]) {
      datePeriods.value[index] = [start, end]
    }
  }

  async function setRoiAndCentroid(
    geojsonRoi: { type: 'Polygon'; coordinates: number[][][] },
    centroidCoord: [number, number]
  ) {
    roi.value = geojsonRoi
    centroid.value = centroidCoord
    isDrawing.value = false
    
    // Automatically trigger data fetch when ROI is drawn
    await fetchData()
  }

  async function fetchData() {
    if (!roi.value || datePeriods.value.length === 0) return
    
    isLoading.value = true
    errorMessage.value = null
    rgbData.value = null

    try {
      const result = await geeService.getSentinelRgb(roi.value, datePeriods.value)
      rgbData.value = result
      // Default to period_1 as active layer when data arrives
      selectedPeriodKey.value = 'period_1'
    } catch (err: any) {
      console.error('Error fetching Sentinel RGB data:', err)
      errorMessage.value = err.data?.message || err.message || 'Erro ao processar dados no Earth Engine.'
    } finally {
      isLoading.value = false
    }
  }

  function clearAnalysis() {
    roi.value = null
    centroid.value = null
    rgbData.value = null
    errorMessage.value = null
    isDrawing.value = false
    selectedPeriodKey.value = 'period_1'
  }

  return {
    isActive,
    isDrawing,
    datePeriods,
    roi,
    centroid,
    rgbData,
    selectedPeriodKey,
    tileOpacity,
    tileVisible,
    isLoading,
    errorMessage,
    toggleActive,
    startDrawing,
    stopDrawing,
    addDatePeriod,
    removeDatePeriod,
    updateDatePeriod,
    setRoiAndCentroid,
    fetchData,
    clearAnalysis
  }
})
