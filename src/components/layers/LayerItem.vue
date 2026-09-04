<template>
  <div 
    class="border border-gray-200 dark:border-gray-700/80 rounded-xl bg-white dark:bg-gray-800/95 mb-2.5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
    :class="{ 'ring-2 ring-teal-500/50 dark:ring-teal-500/30': isTableOpen }"
  >
    <!-- Top Row: Checkbox, Name, Drag Handle -->
    <div class="px-3 pt-2.5 pb-1 flex items-center justify-between gap-2">
      <div class="flex items-center gap-2.5 min-w-0 flex-1">
        <input 
          type="checkbox" 
          v-model="visible" 
          class="w-4 h-4 text-teal-600 accent-teal-600 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-teal-500 flex-shrink-0 cursor-pointer" 
          title="Alternar visibilidade"
        />
        <span 
          class="text-xs font-bold text-gray-800 dark:text-gray-200 truncate cursor-default select-none" 
          :title="layer.name"
        >
          {{ layer.name }}
        </span>
      </div>

      <div class="flex items-center gap-1.5 flex-shrink-0">
        <span class="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
          {{ layer.type }}
        </span>
        <div class="cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5" title="Arrastar para reordenar">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Action Toolbar Row: Zoom to Extent, Internal Search, Attribute Table -->
    <div class="px-3 py-1.5 flex items-center justify-between bg-gray-50/70 dark:bg-gray-850/50 border-t border-b border-gray-100 dark:border-gray-750">
      <div class="flex items-center gap-1">
        <!-- 1. Enquadramento (Zoom to Extent) -->
        <button
          @click="handleZoomToExtent"
          class="p-1.5 rounded-lg text-gray-500 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors flex items-center gap-1 group"
          title="Enquadrar camada no mapa (Zoom to Extent)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>

        <!-- 2. Busca Interna (Lupa) -->
        <button
          @click="toggleSearch"
          :class="[
            'p-1.5 rounded-lg transition-colors flex items-center gap-1 group',
            isSearchOpen
              ? 'bg-teal-600 text-white dark:bg-teal-500 shadow-sm'
              : 'text-gray-500 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40'
          ]"
          title="Buscar e filtrar feições nesta camada"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        <!-- 3. Tabela de Atributos (Grade) -->
        <button
          @click="toggleAttributeTable"
          :class="[
            'p-1.5 rounded-lg transition-colors flex items-center gap-1 group',
            isTableOpen
              ? 'bg-teal-600 text-white dark:bg-teal-500 shadow-sm'
              : 'text-gray-500 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40'
          ]"
          title="Abrir matriz tabular de atributos"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      <!-- Quick Opacity Value Display -->
      <span class="text-[10px] font-mono font-semibold text-gray-400 dark:text-gray-500">
        {{ Math.round(opacity * 100) }}%
      </span>
    </div>

    <!-- Opacity Slider Row -->
    <div class="px-3 py-2 flex items-center gap-2">
      <input 
        type="range" 
        min="0" 
        max="1" 
        step="0.01" 
        v-model="opacity" 
        class="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-600" 
        title="Ajustar opacidade da camada"
      />
    </div>

    <!-- Collapsible Internal Search Drawer -->
    <div 
      v-if="isSearchOpen" 
      class="px-3 pb-3 pt-1 border-t border-gray-100 dark:border-gray-750 bg-gray-50/90 dark:bg-gray-850/80 flex flex-col gap-2"
    >
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Pesquisar feições da camada..."
          class="w-full pl-7 pr-6 py-1 text-[11px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-200 placeholder-gray-400 outline-none focus:ring-1 focus:ring-teal-500 transition-all"
        />
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 absolute left-2 top-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute right-2 top-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Loading Search Features -->
      <div v-if="loadingSearch" class="py-2 text-center text-[10px] text-gray-400">
        Buscando dados da camada...
      </div>

      <!-- Search Results List -->
      <div v-else-if="filteredFeatures.length > 0" class="max-h-36 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
        <div class="text-[9px] font-bold text-gray-400 uppercase tracking-wider pb-0.5">
          {{ filteredFeatures.length }} {{ filteredFeatures.length === 1 ? 'resultado' : 'resultados' }}
        </div>
        <button
          v-for="item in filteredFeatures"
          :key="item.id"
          @click="locateFeature(item)"
          class="w-full text-left p-1.5 rounded bg-white dark:bg-gray-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-gray-100 dark:border-gray-700/60 transition-colors flex items-center justify-between gap-1 group/btn"
        >
          <div class="min-w-0 flex-1">
            <div class="text-xs font-bold text-gray-800 dark:text-gray-200 truncate group-hover/btn:text-teal-600 dark:group-hover/btn:text-teal-400">
              {{ getItemTitle(item) }}
            </div>
            <div class="text-[10px] text-gray-400 dark:text-gray-500 truncate">
              {{ getItemSubtitle(item) }}
            </div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-gray-400 group-hover/btn:text-teal-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </div>

      <!-- No Results State -->
      <div v-else-if="searchQuery" class="py-2 text-center text-[10px] text-gray-400">
        Nenhuma feição encontrada para "{{ searchQuery }}".
      </div>

      <div v-else-if="layer.type === 'xyz' || layer.basemap" class="py-1 text-center text-[10px] text-gray-400 italic">
        A busca textual de feições não está disponível para mapas base (XYZ).
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { LayerConfig } from '../../types'
import { useLayerFeatures } from '../../composables/useLayerFeatures'
import { useLayerTableStore } from '../../stores/layerTable'

const props = defineProps<{ layer: LayerConfig }>()
const emit = defineEmits<{
  (e: 'update', id: string, changes: Partial<LayerConfig>): void
}>()

const { zoomToLayerExtent, getLayerFeatures, highlightFeature } = useLayerFeatures()
const tableStore = useLayerTableStore()

const isSearchOpen = ref(false)
const searchQuery = ref('')
const layerFeatures = ref<Array<{ id: string | number; properties: Record<string, any>; geometry: any; feature?: any }>>([])
const loadingSearch = ref(false)

const visible = computed({
  get: () => props.layer.visible,
  set: (val) => emit('update', props.layer.id, { visible: val })
})

const opacity = computed({
  get: () => props.layer.opacity,
  set: (val) => emit('update', props.layer.id, { opacity: Number(val) })
})

const isTableOpen = computed(() => {
  return tableStore.activeLayerId === props.layer.id
})

function handleZoomToExtent() {
  zoomToLayerExtent(props.layer)
}

async function toggleSearch() {
  isSearchOpen.value = !isSearchOpen.value
  if (isSearchOpen.value && layerFeatures.value.length === 0) {
    loadingSearch.value = true
    try {
      layerFeatures.value = await getLayerFeatures(props.layer)
    } finally {
      loadingSearch.value = false
    }
  }
}

function toggleAttributeTable() {
  tableStore.toggleTable(props.layer.id)
}

const filteredFeatures = computed(() => {
  if (!searchQuery.value.trim()) return layerFeatures.value
  const q = searchQuery.value.toLowerCase().trim()
  return layerFeatures.value.filter(item => {
    return Object.values(item.properties).some(val => {
      if (val === null || val === undefined) return false
      return String(val).toLowerCase().includes(q)
    })
  })
})

function getItemTitle(item: any): string {
  return item.properties.nome || item.properties.name || item.properties.title || `Feição #${item.id}`
}

function getItemSubtitle(item: any): string {
  const parts: string[] = []
  if (item.properties.categoria) parts.push(item.properties.categoria)
  if (item.properties.estado || item.properties.uf) parts.push(item.properties.estado || item.properties.uf)
  if (item.properties.bioma) parts.push(item.properties.bioma)
  if (item.properties.status) parts.push(item.properties.status)
  return parts.join(' • ') || 'Ver feição no mapa'
}

function locateFeature(item: any) {
  // Ensure layer is visible
  if (!props.layer.visible) {
    emit('update', props.layer.id, { visible: true })
  }
  highlightFeature(item.feature || item, true)
}
</script>
