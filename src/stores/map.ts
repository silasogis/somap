import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import type OLMap from 'ol/Map'
import type { Extent } from 'ol/extent'

export const useMapStore = defineStore('map', () => {
  const center = ref<[number, number]>([-5653863, -3030864])
  const zoom = ref(7)
  const projection = ref('EPSG:3857')
  const mapInstance = shallowRef<OLMap | null>(null)

  function setMap(map: OLMap | null) {
    mapInstance.value = map
  }

  function fitExtent(extent: Extent, options?: { padding?: [number, number, number, number]; duration?: number; maxZoom?: number }) {
    if (!mapInstance.value) return
    const view = mapInstance.value.getView()
    view.fit(extent, {
      padding: options?.padding ?? [50, 50, 50, 50],
      duration: options?.duration ?? 800,
      maxZoom: options?.maxZoom ?? 17
    })
  }

  return { center, zoom, projection, mapInstance, setMap, fitExtent }
})

