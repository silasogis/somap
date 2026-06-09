import { defineStore } from 'pinia'
import { ref } from 'vue'
import { routeService } from '../services/routeService'
import { geocodingService } from '../services/geocodingService'
import { useNdviClimateStore } from './ndviClimate'

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.asin(Math.sqrt(a))
}

function calcDistanceKm(geojson: any): number {
  let total = 0
  for (const feat of (geojson?.features ?? [])) {
    const geom = feat?.geometry
    if (!geom) continue
    if (geom.type === 'LineString') {
      const coords: number[][] = geom.coordinates ?? []
      for (let i = 1; i < coords.length; i++) {
        const p1 = coords[i - 1]
        const p2 = coords[i]
        if (p1 && p2) {
          const lon1 = p1[0]
          const lat1 = p1[1]
          const lon2 = p2[0]
          const lat2 = p2[1]
          if (lat1 !== undefined && lon1 !== undefined && lat2 !== undefined && lon2 !== undefined) {
            total += haversineKm(lat1, lon1, lat2, lon2)
          }
        }
      }
    } else if (geom.type === 'MultiLineString') {
      for (const line of (geom.coordinates ?? [])) {
        if (!line) continue
        for (let i = 1; i < line.length; i++) {
          const p1 = line[i - 1]
          const p2 = line[i]
          if (p1 && p2) {
            const lon1 = p1[0]
            const lat1 = p1[1]
            const lon2 = p2[0]
            const lat2 = p2[1]
            if (lat1 !== undefined && lon1 !== undefined && lat2 !== undefined && lon2 !== undefined) {
              total += haversineKm(lat1, lon1, lat2, lon2)
            }
          }
        }
      }
    }
  }
  return total
}

export const useRouteStore = defineStore('route', () => {
  const startPoint = ref<[number, number] | null>(null)
  const endPoint = ref<[number, number] | null>(null)
  const routeData = ref<any>(null)
  const isLoading = ref(false)
  const isActive = ref(false)
  const totalCost = ref<number | null>(null)
  const totalDistanceKm = ref<number | null>(null)
  const startAddress = ref<string | null>(null)
  const endAddress = ref<string | null>(null)
  const errorMessage = ref<string | null>(null)
  const nextPoint = ref<'A' | 'B'>('A')

  async function toggleActive() {
    isActive.value = !isActive.value
    if (isActive.value) {
      const ndviStore = useNdviClimateStore()
      if (ndviStore.isActive) {
        ndviStore.toggleActive()
      }
      const { useSentinelRgbStore } = await import('./sentinelRgb')
      const sentinelStore = useSentinelRgbStore()
      if (sentinelStore.isActive) {
        sentinelStore.toggleActive()
      }
    } else {
      clearRoute()
    }
  }

  async function setPoint(coords: [number, number]) {
    if (nextPoint.value === 'A') {
      startPoint.value = coords
      endPoint.value = null
      routeData.value = null
      totalCost.value = null
      totalDistanceKm.value = null
      startAddress.value = null
      endAddress.value = null
      errorMessage.value = null
      nextPoint.value = 'B'
      reverseGeocode(coords, 'start')
    } else {
      endPoint.value = coords
      nextPoint.value = 'A'
      reverseGeocode(coords, 'end')
      await fetchRoute()
    }
  }

  async function reverseGeocode(coords: [number, number], which: 'start' | 'end') {
    try {
      const result = await geocodingService.reverse(coords[1], coords[0], 10)
      const addr = result?.address
      const label = [
        addr?.city || addr?.town || addr?.municipality || addr?.county,
        addr?.state
      ].filter(Boolean).join(', ')
      if (which === 'start') startAddress.value = label || null
      else endAddress.value = label || null
    } catch {
      // fallback: coordenadas brutas exibidas no componente
    }
  }

  async function fetchRoute() {
    if (!startPoint.value || !endPoint.value) return
    isLoading.value = true
    errorMessage.value = null
    try {
      const result = await routeService.getRoute(startPoint.value, endPoint.value)
      if (result.success) {
        routeData.value = result.data
        totalCost.value = result.total_cost || null
        totalDistanceKm.value = result.data ? calcDistanceKm(result.data) : null
      } else {
        errorMessage.value = result.message || 'Erro ao calcular rota'
      }
    } catch (error: any) {
      console.error('Error fetching route:', error)
      errorMessage.value = error.data?.message || error.message || 'Erro na requisição'
    } finally {
      isLoading.value = false
    }
  }

  function clearRoute() {
    startPoint.value = null
    endPoint.value = null
    routeData.value = null
    totalCost.value = null
    totalDistanceKm.value = null
    startAddress.value = null
    endAddress.value = null
    errorMessage.value = null
    nextPoint.value = 'A'
  }

  return {
    startPoint,
    endPoint,
    routeData,
    isLoading,
    isActive,
    totalCost,
    totalDistanceKm,
    startAddress,
    endAddress,
    errorMessage,
    nextPoint,
    setPoint,
    fetchRoute,
    clearRoute,
    toggleActive
  }
})
