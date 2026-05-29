<template>
  <div
    ref="popupElement"
    class="absolute bg-white dark:bg-gray-800 shadow-xl rounded-lg p-4 min-w-[200px] max-w-[300px] border border-gray-200 dark:border-gray-700 hidden group"
  >
    <!-- Botão Fechar -->
    <button
      @click="closePopup"
      class="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <div v-if="loading" class="flex items-center justify-center py-4">
      <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
    </div>

    <div v-else-if="result" class="space-y-2">
      <div class="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
        {{ formatType(result.type) }}
      </div>
      <div class="text-sm font-medium text-gray-800 dark:text-gray-100 leading-tight">
        {{ result.display_name }}
      </div>
      
      <div v-if="result.address" class="pt-2 mt-2 border-t border-gray-100 dark:border-gray-700">
        <div class="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold">Detalhes Hierárquicos</div>
        <div class="flex flex-wrap gap-1 mt-1">
          <span v-if="result.address.suburb" class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] text-gray-600 dark:text-gray-300">
            {{ result.address.suburb }}
          </span>
          <span v-if="result.address.city || result.address.town" class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] text-gray-600 dark:text-gray-300">
            {{ result.address.city || result.address.town }}
          </span>
          <span v-if="result.address.state" class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] text-gray-600 dark:text-gray-300">
            {{ result.address.state }}
          </span>
        </div>
      </div>
    </div>

    <!-- Seta do Popup -->
    <div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white dark:border-t-gray-800"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, type Ref, onMounted, onUnmounted, watch } from 'vue'
import type Map from 'ol/Map'
import Overlay from 'ol/Overlay'
import { toLonLat } from 'ol/proj'
import { geocodingService } from '../../services/geocodingService'
import type { NominatimResult } from '../../types/geocoding'
import { useNdviClimateStore } from '../../stores/ndviClimate'
import { useRouteStore } from '../../stores/route'

const map = inject<Ref<Map | null>>('olMap')
const ndviClimateStore = useNdviClimateStore()
const routeStore = useRouteStore()
const popupElement = ref<HTMLElement | null>(null)
const result = ref<NominatimResult | null>(null)
const loading = ref(false)
let overlay: Overlay | null = null

function formatType(type: string) {
  const types: Record<string, string> = {
    house: 'Imóvel',
    residential: 'Residencial',
    road: 'Logradouro',
    city: 'Cidade',
    suburb: 'Bairro',
    postcode: 'CEP'
  }
  return types[type] || type.charAt(0).toUpperCase() + type.slice(1)
}

function handleMapClick(event: any) {
  if (!map?.value || !overlay) return

  // Impedir popup de geocodificação durante desenho ativo ou roteirização ativa
  if (ndviClimateStore.isDrawing || routeStore.isActive) {
    return
  }

  const coords = event.coordinate
  const [lon84, lat84] = toLonLat(coords)
  
  if (lon84 === undefined || lat84 === undefined) return

  // Posicionar popup e mostrar carregando
  overlay.setPosition(coords)
  popupElement.value?.classList.remove('hidden')
  loading.value = true
  result.value = null

  // Obter zoom atual
  const currentZoom = Math.round(map.value.getView().getZoom() || 10)

  geocodingService.reverse(lat84, lon84, currentZoom)
    .then(data => {
      result.value = data
    })
    .catch(err => {
      console.error('Erro na geocodificação reversa:', err)
      closePopup()
    })
    .finally(() => {
      loading.value = false
    })
}

function closePopup() {
  overlay?.setPosition(undefined)
  popupElement.value?.classList.add('hidden')
  result.value = null
}

onMounted(() => {
  if (!popupElement.value) return

  overlay = new Overlay({
    element: popupElement.value,
    autoPan: {
      animation: {
        duration: 250
      }
    },
    offset: [0, -15],
    positioning: 'bottom-center'
  })

  watch(map!, (newMap) => {
    if (newMap) {
      newMap.addOverlay(overlay!)
      newMap.on('singleclick', handleMapClick)
    }
  }, { immediate: true })

  // Fechar o popup se o usuário começar a desenhar ou calcular rotas
  watch(() => ndviClimateStore.isDrawing, (drawing) => {
    if (drawing) {
      closePopup()
    }
  })

  watch(() => routeStore.isActive, (active) => {
    if (active) {
      closePopup()
    }
  })
})

onUnmounted(() => {
  if (map?.value) {
    map.value.removeOverlay(overlay!)
    map.value.un('singleclick', handleMapClick)
  }
})
</script>
