<template>
  <div
    ref="popupElement"
    class="absolute bg-white/95 dark:bg-gray-900/95 backdrop-blur shadow-2xl rounded-xl p-4 min-w-[280px] max-w-[340px] border border-gray-200/80 dark:border-gray-800/85 hidden z-50 transition-all duration-150 ease-out select-text"
  >
    <!-- Botão Fechar -->
    <button
      @click="closePopup"
      class="absolute top-2.5 right-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-850"
      title="Fechar"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <!-- Cabeçalho -->
    <div class="border-b border-gray-100 dark:border-gray-800 pb-2 mb-3">
      <h3 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Identificar Camadas
      </h3>
    </div>

    <!-- Carregando -->
    <div v-if="identifyStore.loading" class="flex flex-col items-center justify-center py-6 gap-2">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      <span class="text-xs text-gray-500 dark:text-gray-400">Consultando camadas...</span>
    </div>

    <!-- Resultados -->
    <div v-else class="max-h-64 overflow-y-auto pr-1 space-y-4 scrollbar-thin">
      <div v-if="identifyStore.features.length === 0" class="text-center py-4 text-xs text-gray-500 dark:text-gray-400">
        Nenhuma feição encontrada nesta coordenada.
      </div>
      
      <div
        v-else
        v-for="(feature, idx) in identifyStore.features"
        :key="idx"
        class="bg-gray-50 dark:bg-gray-950/60 rounded-lg p-2.5 border border-gray-100 dark:border-gray-900"
      >
        <div class="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1.5 border-b border-blue-100 dark:border-blue-900/30 pb-1">
          {{ feature.layerName }}
        </div>
        
        <table class="w-full text-left text-xs text-gray-700 dark:text-gray-300 border-collapse">
          <tbody>
            <tr
              v-for="(val, key) in feature.properties"
              :key="key"
              class="border-b border-gray-100/50 dark:border-gray-900/50 last:border-none hover:bg-gray-100/30 dark:hover:bg-gray-900/30"
            >
              <td class="font-semibold py-1 pr-2 text-gray-450 dark:text-gray-500 select-all min-w-[80px] truncate" :title="String(key)">
                {{ key }}
              </td>
              <td class="py-1 break-all select-all font-mono text-[11px]">
                {{ val }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Seta do Popup -->
    <div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white dark:border-t-gray-900"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, type Ref, onMounted, onUnmounted, watch } from 'vue'
import type Map from 'ol/Map'
import Overlay from 'ol/Overlay'
import TileWMS from 'ol/source/TileWMS'
import { useIdentifyStore } from '../../stores/identify'

const map = inject<Ref<Map | null>>('olMap')
const identifyStore = useIdentifyStore()
const popupElement = ref<HTMLElement | null>(null)
let overlay: Overlay | null = null

function cleanProperties(properties: Record<string, any>) {
  const clean: Record<string, any> = {}
  for (const [key, value] of Object.entries(properties)) {
    if (
      key === 'geometry' ||
      key === 'boundedBy' ||
      key === 'bbox' ||
      key.startsWith('ol_') ||
      typeof value === 'object' ||
      value === null ||
      value === undefined
    ) {
      continue
    }
    clean[key] = value
  }
  return clean
}

async function handleIdentifyClick(event: any) {
  if (!map?.value || !overlay || !identifyStore.isActive) return

  const coordinate = event.coordinate
  const pixel = event.pixel

  // Atualizar store
  identifyStore.coordinate = coordinate
  identifyStore.loading = true
  identifyStore.features = []

  // Posicionar overlay e exibir
  overlay.setPosition(coordinate)
  popupElement.value?.classList.remove('hidden')

  const collectedFeatures: Array<{ layerName: string; properties: Record<string, any> }> = []

  // 1. Consultar camadas vetoriais locais (GeoJSON) clicadas no pixel
  map.value.forEachFeatureAtPixel(pixel, (feature, layer) => {
    if (layer && layer.get('layerType') === 'geojson') {
      const name = layer.get('name') || 'Camada Vetorial'
      const rawProperties = feature.getProperties()
      const cleaned = cleanProperties(rawProperties)
      
      if (Object.keys(cleaned).length > 0) {
        collectedFeatures.push({
          layerName: name,
          properties: cleaned
        })
      }
    }
  })

  // 2. Consultar camadas do GeoServer (WMS)
  const view = map.value.getView()
  const resolution = view.getResolution()
  const projection = view.getProjection()
  
  if (resolution !== undefined) {
    const layers = map.value.getLayers().getArray()
    const wmsPromises: Promise<void>[] = []

    for (const layer of layers) {
      if (layer.getVisible() && layer.get('layerType') === 'wms') {
        const source = (layer as any).getSource()
        if (source && typeof (source as any).getFeatureInfoUrl === 'function') {
          const url = (source as TileWMS).getFeatureInfoUrl(
            coordinate,
            resolution,
            projection,
            {
              'INFO_FORMAT': 'application/json',
              'FEATURE_COUNT': 5
            }
          )

          if (url) {
            const layerName = layer.get('name') || 'Camada GeoServer'
            wmsPromises.push(
              fetch(url)
                .then(res => {
                  if (!res.ok) throw new Error('GetFeatureInfo request failed')
                  return res.json()
                })
                .then(data => {
                  if (data && data.features && data.features.length > 0) {
                    data.features.forEach((feat: any) => {
                      const cleaned = cleanProperties(feat.properties || {})
                      if (Object.keys(cleaned).length > 0) {
                        collectedFeatures.push({
                          layerName,
                          properties: cleaned
                        })
                      }
                    })
                  }
                })
                .catch(err => {
                  console.error(`Erro ao obter informações da camada WMS "${layerName}":`, err)
                })
            )
          }
        }
      }
    }

    if (wmsPromises.length > 0) {
      await Promise.allSettled(wmsPromises)
    }
  }

  // Preencher a store com todos os dados encontrados
  identifyStore.features = collectedFeatures
  identifyStore.loading = false
}

function closePopup() {
  overlay?.setPosition(undefined)
  popupElement.value?.classList.add('hidden')
  identifyStore.clear()
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
      newMap.on('singleclick', handleIdentifyClick)
    }
  }, { immediate: true })

  // Fecha o popup se desativar a ferramenta
  watch(() => identifyStore.isActive, (active) => {
    if (!active) {
      closePopup()
    }
  })
})

onUnmounted(() => {
  if (map?.value) {
    if (overlay) map.value.removeOverlay(overlay)
    map.value.un('singleclick', handleIdentifyClick)
  }
})
</script>

<style scoped>
/* Estilização fina para a barra de rolagem nos navegadores modernos */
.scrollbar-thin::-webkit-scrollbar {
  width: 5px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.4);
  border-radius: 9999px;
}
.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.6);
}
</style>
