<template>
  <div class="pointer-events-auto">
    <!-- Collapsed state button -->
    <Transition name="fade-scale" mode="out-in">
      <button
        v-if="isCollapsed"
        @click="isCollapsed = false"
        class="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md hover:bg-white dark:hover:bg-gray-900 shadow-xl border border-gray-200/50 dark:border-gray-800/80 rounded-2xl px-4 py-3 flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-95 group font-bold text-xs tracking-wider uppercase text-gray-700 dark:text-gray-200"
      >
        <span class="p-1.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-lg group-hover:rotate-12 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 12h3a2 2 0 002-2v-3a2 2 0 00-2-2h-3m-3.414-2A9 9 0 002.59 13H5m0-4V9a2 2 0 012-2h2m3.414 2A9 9 0 0017.59 5H15M5 21H3a2 2 0 01-2-2v-3" />
          </svg>
        </span>
        <span>Legendas</span>
        <span 
          v-if="legendLayers.length > 0"
          class="bg-teal-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ml-1 animate-pulse"
        >
          {{ legendLayers.length }}
        </span>
      </button>

      <!-- Expanded state panel -->
      <div
        v-else
        class="bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-800/80 shadow-2xl rounded-2xl w-80 max-h-[60vh] overflow-hidden flex flex-col transition-all duration-300"
      >
        <!-- Header -->
        <div class="px-4 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/55">
          <div class="flex items-center gap-2">
            <span class="p-1.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 12h3a2 2 0 002-2v-3a2 2 0 00-2-2h-3m-3.414-2A9 9 0 002.59 13H5m0-4V9a2 2 0 012-2h2m3.414 2A9 9 0 0017.59 5H15M5 21H3a2 2 0 01-2-2v-3" />
              </svg>
            </span>
            <h3 class="text-xs font-black text-gray-800 dark:text-white uppercase tracking-wider">Legendas</h3>
            <span 
              v-if="legendLayers.length > 0"
              class="bg-teal-500/15 text-teal-600 dark:text-teal-400 text-[10px] px-1.5 py-0.5 rounded-full font-black"
            >
              {{ legendLayers.length }}
            </span>
          </div>
          
          <button
            @click="isCollapsed = true"
            class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Recolher Painel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <div v-if="legendLayers.length === 0" class="text-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto text-gray-350 dark:text-gray-650 mb-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="text-xs font-bold text-gray-450 dark:text-gray-500">Nenhuma legenda ativa no momento.</p>
          </div>
          
          <div 
            v-else
            v-for="layer in legendLayers" 
            :key="layer.id"
            class="space-y-2 border-b border-gray-100 dark:border-gray-800/80 pb-3.5 last:border-0 last:pb-0"
          >
            <!-- Layer Title -->
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-black text-gray-800 dark:text-gray-250 truncate leading-tight">{{ layer.name }}</span>
              <span class="text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-850 text-gray-500 dark:text-gray-450 font-extrabold flex-shrink-0">
                {{ layer.type }}
              </span>
            </div>

            <!-- Layer Graphic -->
            <!-- WMS -->
            <div v-if="layer.type === 'wms'" class="bg-white p-2 rounded-xl border border-gray-200/60 shadow-sm inline-block max-w-full">
              <img 
                :src="getWmsLegendUrl(layer)" 
                alt="Legenda WMS" 
                class="max-w-full h-auto object-contain block select-none"
                loading="lazy"
              />
            </div>

            <!-- GeoJSON -->
            <div 
              v-else-if="layer.type === 'geojson'" 
              class="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/40 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800/60"
            >
              <div 
                class="w-5 h-5 rounded-lg border-2 shadow-sm flex-shrink-0"
                :style="{
                  backgroundColor: layer.style?.fillColor || 'rgba(20, 184, 166, 0.15)',
                  borderColor: layer.style?.strokeColor || layer.style?.color || '#14b8a6',
                  borderWidth: `${layer.style?.strokeWidth || 2}px`,
                  borderStyle: 'solid'
                }"
              ></div>
              <div class="flex flex-col gap-0.5 min-w-0">
                <span class="text-[10px] font-bold text-gray-650 dark:text-gray-300">Estilo Vetorial</span>
                <span class="text-[8px] text-gray-400 dark:text-gray-500 truncate">
                  Cor: {{ layer.style?.strokeColor || layer.style?.color || '#14b8a6' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLayersStore } from '../../stores/layers'
import type { LayerConfig } from '../../types'

const layersStore = useLayersStore()
const isCollapsed = ref(false)

const legendLayers = computed(() => {
  // Reverse to match standard GIS drawing hierarchy (top-most layer on top)
  return [...layersStore.layers]
    .reverse()
    .filter(layer => layer.visible && (layer.type === 'wms' || layer.type === 'geojson'))
})

function getWmsLegendUrl(layer: LayerConfig) {
  if (layer.type !== 'wms') return ''
  const url = layer.source.url
  const layerName = layer.source.layers
  if (!url || !layerName) return ''

  const baseParams: Record<string, string> = {
    REQUEST: 'GetLegendGraphic',
    VERSION: '1.0.0',
    FORMAT: 'image/png',
    LAYER: layerName,
    TRANSPARENT: 'TRUE'
  }

  try {
    const urlObj = new URL(url)
    Object.entries(baseParams).forEach(([key, val]) => {
      urlObj.searchParams.set(key, val)
    })
    return urlObj.toString()
  } catch {
    const separator = url.includes('?') ? '&' : '?'
    const queryString = Object.entries(baseParams)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')
    return `${url}${separator}${queryString}`
  }
}
</script>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
.backdrop-blur-md {
  backdrop-filter: blur(12px);
}
</style>
