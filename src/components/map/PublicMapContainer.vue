<template>
  <div class="absolute inset-0 w-full h-full overflow-hidden">
    <!-- Contêiner do Mapa com posicionamento absoluto para garantir dimensões 100% -->
    <div id="public-ol-map-target" ref="mapTarget" class="absolute inset-0 w-full h-full bg-gray-100 dark:bg-gray-800"></div>

    <!-- Camadas vetoriais do Raio-X montadas no mapa (isócronas, concorrentes, pin) -->
    <MapRaioX :store="store" />

    <!-- Controles flutuantes de Zoom do Mapa -->
    <div class="absolute top-4 left-4 z-10 hidden sm:flex flex-col gap-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden">
      <button
        type="button"
        @click="zoomIn"
        class="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        title="Aproximar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
      <div class="h-[1px] bg-gray-200 dark:bg-gray-800"></div>
      <button
        type="button"
        @click="zoomOut"
        class="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        title="Afastar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, provide, onMounted, onUnmounted, watch } from 'vue'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import { fromLonLat } from 'ol/proj'
import { defaults as defaultControls } from 'ol/control'
import MapRaioX from './MapRaioX.vue'

const props = defineProps<{
  store: any
}>()

const mapTarget = ref<HTMLElement | null>(null)
const olMap = shallowRef<Map | null>(null)

// Fornece a instância do OpenLayers para o componente MapRaioX e seus popups
provide('olMap', olMap)

function initMap() {
  if (!mapTarget.value) return

  const baseLayer = new TileLayer({
    source: new XYZ({
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attributions: '© OpenStreetMap contributors',
      crossOrigin: 'anonymous'
    }),
    zIndex: 0
  })

  const mapInstance = new Map({
    target: mapTarget.value,
    layers: [baseLayer],
    view: new View({
      center: fromLonLat([-49.27306, -25.42836]),
      zoom: 13,
      minZoom: 9,
      maxZoom: 19
    }),
    controls: defaultControls({ attribution: false, zoom: false })
  })

  olMap.value = mapInstance

  // Força cálculo imediato das dimensões do canvas
  requestAnimationFrame(() => {
    mapInstance.updateSize()
  })
}

function zoomIn() {
  if (!olMap.value) return
  const view = olMap.value.getView()
  view.animate({ zoom: (view.getZoom() || 13) + 1, duration: 250 })
}

function zoomOut() {
  if (!olMap.value) return
  const view = olMap.value.getView()
  view.animate({ zoom: (view.getZoom() || 13) - 1, duration: 250 })
}

function updateSize() {
  olMap.value?.updateSize()
}

// Ao selecionar ponto (por clique ou busca), centraliza suavemente a visão
watch(
  () => props.store.selectedPoint,
  (pt) => {
    if (pt && olMap.value) {
      const view = olMap.value.getView()
      view.animate({
        center: fromLonLat(pt),
        duration: 500
      })
    }
  }
)

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  if (olMap.value) {
    olMap.value.setTarget(undefined)
    olMap.value = null
  }
})

defineExpose({
  updateSize,
  zoomIn,
  zoomOut
})
</script>
