import { defineStore } from 'pinia'
import { ref } from 'vue'
import { geeService, type NdviResponse, type ClimateResponse } from '../services/geeService'
import { useRouteStore } from './route'

export const useNdviClimateStore = defineStore('ndviClimate', () => {
  const isActive = ref(false)
  const isDrawing = ref(false)
  const datePeriods = ref<[string, string][]>([['2024-01-01', '2024-01-28']])
  
  const roi = ref<{ type: 'Polygon'; coordinates: number[][][] } | null>(null)
  const centroid = ref<[number, number] | null>(null)
  
  const ndviData = ref<NdviResponse | null>(null)
  const climateData = ref<ClimateResponse | null>(null)
  
  const selectedPeriodKey = ref<string>('period_1')
  const tileOpacity = ref<number>(0.8)
  const tileVisible = ref<boolean>(true)
  
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)

  function toggleActive() {
    isActive.value = !isActive.value
    if (isActive.value) {
      // Deactivate routing store to prevent map interaction conflicts
      const routeStore = useRouteStore()
      if (routeStore.isActive) {
        routeStore.toggleActive()
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
      // If we remove the selected period, default to first period
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
    if (!roi.value || !centroid.value || datePeriods.value.length === 0) return
    
    isLoading.value = true
    errorMessage.value = null
    ndviData.value = null
    climateData.value = null

    try {
      // Call both GEE API endpoints concurrently
      const [ndviResult, climateResult] = await Promise.all([
        geeService.getNdviComposite(roi.value, datePeriods.value),
        geeService.getClimateStats(
          { type: 'Point', coordinates: centroid.value },
          datePeriods.value
        )
      ])

      ndviData.value = ndviResult
      climateData.value = climateResult

      // Default to period_1 as active layer when data arrives
      selectedPeriodKey.value = 'period_1'
    } catch (err: any) {
      console.error('Error fetching NDVI-Climate data:', err)
      errorMessage.value = err.data?.message || err.message || 'Erro ao processar dados no Earth Engine.'
    } finally {
      isLoading.value = false
    }
  }

  function clearAnalysis() {
    roi.value = null
    centroid.value = null
    ndviData.value = null
    climateData.value = null
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
    ndviData,
    climateData,
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
