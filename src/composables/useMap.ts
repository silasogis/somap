import { shallowRef, onMounted, onUnmounted } from 'vue'
import Map from 'ol/Map'
import View from 'ol/View'
import { fromLonLat } from 'ol/proj'
import { defaults as defaultControls } from 'ol/control'
import { useMapStore } from '../stores/map'

export function useMap(targetId: string) {
  const mapRef = shallowRef<Map | null>(null)
  
  onMounted(() => {
    const mapStore = useMapStore()
    const map = new Map({
      target: targetId,
      view: new View({
        center: fromLonLat(mapStore.center, 'EPSG:4326'),
        zoom: mapStore.zoom,
        projection: mapStore.projection
      }),
      controls: defaultControls({ attribution: false, zoom: false })
    })

    mapRef.value = map
    mapStore.setMap(map)
  })

  onUnmounted(() => {
    const mapStore = useMapStore()
    mapStore.setMap(null)
    if (mapRef.value) {
      mapRef.value.setTarget(undefined)
      mapRef.value = null
    }
  })

  return { map: mapRef }
}
