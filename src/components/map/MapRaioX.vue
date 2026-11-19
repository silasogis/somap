<template>
  <!-- Overlay Popup para detalhe do concorrente -->
  <div
    ref="popupEl"
    class="absolute bg-white dark:bg-gray-800 shadow-xl rounded-xl p-3 min-w-[220px] max-w-[320px] border border-gray-200 dark:border-gray-700 text-xs hidden z-50 pointer-events-auto"
  >
    <button
      @click="fecharPopup"
      class="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 rounded"
      title="Fechar"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>
    <div v-if="popupData" class="space-y-1.5 pr-4">
      <div class="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight">
        {{ popupData.nome }}
      </div>
      <div class="text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {{ formatarNumero(popupData.dist_m) }} m em linha reta
      </div>
      <div class="text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-1 mt-1 text-[11px]">
        Aberto em: <b>{{ popupData.abertura ? popupData.abertura.slice(0, 4) : '–' }}</b>
        <span v-if="popupData.porte"> · {{ popupData.porte }}</span>
        <span v-if="popupData.mei" class="ml-1 px-1.5 py-0.2 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 rounded font-semibold">MEI</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, onMounted, onUnmounted, watch, type Ref } from 'vue'
import type Map from 'ol/Map'
import type { MapBrowserEvent } from 'ol'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import { Style, Stroke, Fill, Circle as CircleStyle, Icon } from 'ol/style'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import Overlay from 'ol/Overlay'
import { toLonLat, fromLonLat } from 'ol/proj'
import { useRaioXStore } from '../../stores/raioX'
import type { ConcorrenteProps } from '../../types/raioX'

const map = inject<Ref<Map | null>>('olMap')
const raioXStore = useRaioXStore()

const popupEl = ref<HTMLElement | null>(null)
const popupData = ref<ConcorrenteProps | null>(null)
let popupOverlay: Overlay | null = null

// Camadas vetoriais
const isoSource = new VectorSource()
const isoLayer = new VectorLayer({
  source: isoSource,
  zIndex: 70,
  style: (feature) => {
    const minutos = feature.get('minutos') || 10
    const colorMap: Record<number, { fill: string; stroke: string }> = {
      5: { fill: 'rgba(11, 92, 126, 0.28)', stroke: '#0b5c7e' },
      10: { fill: 'rgba(63, 143, 179, 0.22)', stroke: '#3f8fb3' },
      15: { fill: 'rgba(156, 201, 221, 0.20)', stroke: '#7fb6cf' },
    }
    const defaultColor = { fill: 'rgba(63, 143, 179, 0.22)', stroke: '#3f8fb3' }
    const c = colorMap[minutos] || defaultColor
    return new Style({
      fill: new Fill({ color: c.fill }),
      stroke: new Stroke({ color: c.stroke, width: 1.5 }),
    })
  },
})

const concSource = new VectorSource()
const concLayer = new VectorLayer({
  source: concSource,
  zIndex: 80,
  style: new Style({
    image: new CircleStyle({
      radius: 6,
      fill: new Fill({ color: '#d7301f' }),
      stroke: new Stroke({ color: '#ffffff', width: 1.5 }),
    }),
  }),
})

const markerSource = new VectorSource()
const markerLayer = new VectorLayer({
  source: markerSource,
  zIndex: 90,
  style: new Style({
    image: new CircleStyle({
      radius: 8,
      fill: new Fill({ color: '#1f2d33' }),
      stroke: new Stroke({ color: '#ffffff', width: 2 }),
    }),
  }),
})

function formatarNumero(n?: number | null) {
  if (n === null || n === undefined) return '–'
  return Number(n).toLocaleString('pt-BR')
}

function fecharPopup() {
  if (popupOverlay) {
    popupOverlay.setPosition(undefined)
  }
  popupData.value = null
}

function abrirPopup(coord: [number, number], props: ConcorrenteProps) {
  popupData.value = props
  if (popupOverlay && map?.value) {
    const olCoord = fromLonLat(coord)
    popupOverlay.setPosition(olCoord)
  }
}

// Manipulador de clique no mapa
function handleMapClick(event: MapBrowserEvent<any>) {
  if (!raioXStore.isActive || !map?.value) return

  // Verifica se clicou num concorrente
  const feature = map.value.forEachFeatureAtPixel(
    event.pixel,
    (feat, layer) => {
      if (layer === concLayer) return feat
      return null
    }
  )

  if (feature) {
    const geom = feature.getGeometry() as Point
    if (geom) {
      const coord = toLonLat(geom.getCoordinates()) as [number, number]
      const props = feature.getProperties() as ConcorrenteProps
      abrirPopup(coord, props)
      return
    }
  }

  // Se não clicou em concorrente, define o ponto de análise do Raio-X
  fecharPopup()
  const coords = toLonLat(event.coordinate) as [number, number]
  raioXStore.setPoint(coords)
}

// Cursor pointer sobre concorrentes
function handlePointerMove(event: MapBrowserEvent<any>) {
  if (!raioXStore.isActive || !map?.value) return

  const hit = map.value.hasFeatureAtPixel(event.pixel, {
    layerFilter: (layer) => layer === concLayer,
  })
  const target = map.value.getTargetElement()
  if (target) {
    target.style.cursor = hit ? 'pointer' : ''
  }
}

// Renderização dos dados da store
watch(
  () => [
    raioXStore.isActive,
    raioXStore.selectedPoint,
    raioXStore.raioXData,
    raioXStore.descobertaData,
  ],
  () => {
    isoSource.clear()
    concSource.clear()
    markerSource.clear()
    fecharPopup()

    if (!raioXStore.isActive) return

    // 1. Marcador do ponto selecionado
    if (raioXStore.selectedPoint) {
      const pFeat = new Feature({
        geometry: new Point(fromLonLat(raioXStore.selectedPoint)),
      })
      markerSource.addFeature(pFeat)
    }

    const geojsonFormat = new GeoJSON()
    const proj = map?.value?.getView().getProjection() || 'EPSG:3857'

    // 2. Isócronas e Concorrentes do Modo Direto
    if (raioXStore.raioXData) {
      if (raioXStore.raioXData.isocronas) {
        const isoFeats = geojsonFormat.readFeatures(raioXStore.raioXData.isocronas, {
          featureProjection: proj,
        })
        isoSource.addFeatures(isoFeats)

        // Fit zoom na isócrona de 15 min
        const extent = isoSource.getExtent()
        if (extent && map?.value) {
          map.value.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 800 })
        }
      }

      if (raioXStore.raioXData.concorrentes) {
        const concFeats = geojsonFormat.readFeatures(raioXStore.raioXData.concorrentes, {
          featureProjection: proj,
        })
        concSource.addFeatures(concFeats)
      }
    }

    // 3. Isócronas do Modo Descoberta
    if (raioXStore.descobertaData?.isocronas) {
      const isoFeats = geojsonFormat.readFeatures(raioXStore.descobertaData.isocronas, {
        featureProjection: proj,
      })
      isoSource.addFeatures(isoFeats)

      const extent = isoSource.getExtent()
      if (extent && map?.value) {
        map.value.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 800 })
      }
    }
  },
  { deep: true }
)

// Observa concorrente focado na lista lateral
watch(
  () => raioXStore.focusedCompetitor,
  (foco) => {
    if (!foco || !map?.value) return
    const olCoord = fromLonLat(foco.coord)
    map.value.getView().animate({ center: olCoord, zoom: 17, duration: 600 })
    abrirPopup(foco.coord, foco.props)
  }
)

onMounted(() => {
  if (map?.value) {
    map.value.addLayer(isoLayer)
    map.value.addLayer(concLayer)
    map.value.addLayer(markerLayer)

    if (popupEl.value) {
      popupOverlay = new Overlay({
        element: popupEl.value,
        positioning: 'bottom-center',
        stopEvent: true,
        offset: [0, -10],
      })
      map.value.addOverlay(popupOverlay)
    }

    map.value.on('click', handleMapClick)
    map.value.on('pointermove', handlePointerMove)
  }
})

onUnmounted(() => {
  if (map?.value) {
    map.value.un('click', handleMapClick)
    map.value.un('pointermove', handlePointerMove)
    if (popupOverlay) {
      map.value.removeOverlay(popupOverlay)
    }
    map.value.removeLayer(isoLayer)
    map.value.removeLayer(concLayer)
    map.value.removeLayer(markerLayer)
  }
})
</script>
