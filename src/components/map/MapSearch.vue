<template>
  <div class="absolute top-4 left-4 z-10 w-80 max-w-[calc(100vw-2rem)] flex flex-col gap-2 pointer-events-none">
    <div class="relative group pointer-events-auto">
      <div class="flex items-center bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
        <div class="pl-3 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar endereço..."
          class="w-full py-2 px-3 bg-transparent outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 text-sm"
          @keyup.enter="handleSearch"
        />
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Resultados -->
      <div
        v-if="results.length > 0 && showResults"
        class="absolute mt-2 w-full bg-white dark:bg-gray-800 shadow-xl rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden max-h-80 overflow-y-auto"
      >
        <ul class="divide-y divide-gray-100 dark:divide-gray-700">
          <li
            v-for="result in results"
            :key="result.place_id"
            @click="selectResult(result)"
            class="px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors group/item"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                  {{ result.display_name }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {{ formatType(result.type) }}
                </div>
              </div>
              
              <!-- Botões de Rota -->
              <div v-if="routeStore.isActive" class="flex flex-col gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                <button 
                  @click.stop="setRoutePoint(result, 'A')"
                  class="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded shadow-sm transition-colors"
                  title="Definir como Partida (A)"
                >
                  <span class="text-[10px] font-black">A</span>
                </button>
                <button 
                  @click.stop="setRoutePoint(result, 'B')"
                  class="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded shadow-sm transition-colors"
                  title="Definir como Destino (B)"
                >
                  <span class="text-[10px] font-black">B</span>
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Carregando / Sem resultados -->
      <div
        v-if="loading"
        class="absolute mt-2 w-full bg-white dark:bg-gray-800 shadow-xl rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center text-sm text-gray-500"
      >
        Buscando...
      </div>
    </div>

    <!-- Botão de Informação (Identify) -->
    <div class="flex pointer-events-auto">
      <button
        @click="identifyStore.toggleActive()"
        :class="[
          'w-8 h-8 shadow-md rounded flex items-center justify-center border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
          identifyStore.isActive
            ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
        ]"
        title="Identificar feições nas camadas"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, type Ref, watch, onMounted, onUnmounted } from 'vue'
import type Map from 'ol/Map'
import { fromLonLat } from 'ol/proj'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Style, Icon } from 'ol/style'
import { geocodingService } from '../../services/geocodingService'
import type { NominatimResult } from '../../types/geocoding'
import { useRouteStore } from '../../stores/route'
import { useIdentifyStore } from '../../stores/identify'

const map = inject<Ref<Map | null>>('olMap')
const routeStore = useRouteStore()
const identifyStore = useIdentifyStore()
const searchQuery = ref('')
const results = ref<NominatimResult[]>([])
const loading = ref(false)
const showResults = ref(false)

function setRoutePoint(result: NominatimResult, type: 'A' | 'B') {
  const lon = parseFloat(result.lon)
  const lat = parseFloat(result.lat)
  
  if (type === 'A') {
    routeStore.startPoint = [lon, lat]
    routeStore.nextPoint = 'B'
  } else {
    routeStore.endPoint = [lon, lat]
    routeStore.nextPoint = 'A'
    routeStore.fetchRoute()
  }
  
  moveToCoords(lon, lat, 16)
  showResults.value = false
  searchQuery.value = result.display_name
}

// Camada de marcador para o resultado da busca
const searchSource = new VectorSource()
const searchLayer = new VectorLayer({
  source: searchSource,
  zIndex: 100,
  style: new Style({
    image: new Icon({
      anchor: [0.5, 1],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      src: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Pin vermelho padrão
      scale: 0.06 // Ajustar escala conforme necessário
    })
  })
})


async function handleSearch() {
  if (!searchQuery.value || searchQuery.value.length < 3) return

  // Tentar detectar coordenadas (lat, lon)
  const coordRegex = /^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)$/
  const match = searchQuery.value.match(coordRegex)

  if (match && match[1] && match[3]) {
    const lat = parseFloat(match[1])
    const lon = parseFloat(match[3])
    loading.value = true
    try {
      const result = await geocodingService.reverse(lat, lon, 18)
      selectResult(result)
    } catch (error) {
      console.error('Busca reversa falhou:', error)
      moveToCoords(lon, lat)
    } finally {
      loading.value = false
    }
    return
  }

  loading.value = true
  showResults.value = true
  results.value = []

  try {
    results.value = await geocodingService.search(searchQuery.value)
  } catch (error) {
    console.error('Busca falhou:', error)
  } finally {
    loading.value = false
  }
}

function moveToCoords(lon: number, lat: number, zoom = 16) {
  if (!map?.value) return
  const coords = fromLonLat([lon, lat])
  const view = map.value.getView()

  searchSource.clear()
  const feature = new Feature({
    geometry: new Point(coords)
  })
  searchSource.addFeature(feature)

  view.animate({
    center: coords,
    zoom,
    duration: 1000
  })
}

function selectResult(result: NominatimResult) {
  if (!map?.value) return

  const lon = parseFloat(result.lon)
  const lat = parseFloat(result.lat)
  
  moveToCoords(lon, lat, 16)

  showResults.value = false
  searchQuery.value = result.display_name
}


onMounted(() => {
  watch(map!, (newMap) => {
    if (newMap) {
      newMap.addLayer(searchLayer)
    }
  }, { immediate: true })
})

onUnmounted(() => {
  if (map?.value) {
    map.value.removeLayer(searchLayer)
  }
})

function clearSearch() {
  searchQuery.value = ''
  results.value = []
  showResults.value = false
  searchSource.clear() // Limpar o pin também
}

function formatType(type: string) {
  const types: Record<string, string> = {
    house: 'Casa',
    residential: 'Residencial',
    apartments: 'Apartamentos',
    road: 'Rua',
    city: 'Cidade',
    village: 'Vila',
    suburb: 'Bairro',
    commercial: 'Comercial'
  }
  return types[type] || type.charAt(0).toUpperCase() + type.slice(1)
}

// Fechar resultados ao clicar fora (opcional, simples aqui)
watch(searchQuery, (val) => {
  if (!val) {
    results.value = []
    showResults.value = false
  }
})
</script>
