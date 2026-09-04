<template>
  <Transition name="slide-up">
    <div
      v-if="tableStore.isOpen && tableStore.activeLayer"
      :class="[
        'absolute bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col transition-all duration-300 pointer-events-auto',
        tableStore.isMaximized ? 'h-[85vh]' : tableStore.isMinimized ? 'h-12' : 'h-80 md:h-96'
      ]"
    >
      <!-- Header -->
      <div class="h-12 px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 flex-shrink-0 select-none bg-gray-50/70 dark:bg-gray-850/70">
        <div class="flex items-center gap-2.5 overflow-hidden">
          <div class="p-1.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-lg flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="flex items-center gap-2 min-w-0">
            <span class="text-xs font-black text-gray-800 dark:text-white uppercase tracking-wider truncate">
              Tabela de Atributos:
            </span>
            <span class="text-xs font-bold text-teal-600 dark:text-teal-400 truncate">
              {{ tableStore.activeLayer.name }}
            </span>
            <span class="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              {{ tableStore.activeLayer.type }}
            </span>
          </div>
          <span 
            v-if="!tableStore.isMinimized && !loading && features.length > 0"
            class="text-[11px] font-semibold text-gray-500 dark:text-gray-400 ml-2 hidden sm:inline"
          >
            ({{ filteredFeatures.length }} de {{ features.length }} registros)
          </span>
        </div>

        <!-- Header Actions -->
        <div class="flex items-center gap-1.5 flex-shrink-0">
          <!-- Refresh button -->
          <button
            v-if="!tableStore.isMinimized"
            @click="loadFeatures"
            :disabled="loading"
            class="p-1.5 text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Recarregar atributos"
          >
            <svg xmlns="http://www.w3.org/2000/svg" :class="['h-4 w-4', loading ? 'animate-spin text-teal-500' : '']" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <!-- CSV Export -->
          <button
            v-if="!tableStore.isMinimized && features.length > 0"
            @click="exportCsv"
            class="px-2.5 py-1 text-xs font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            title="Exportar dados como CSV"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span class="hidden md:inline">Exportar CSV</span>
          </button>

          <!-- Minimize / Restore -->
          <button
            @click="tableStore.toggleMinimize"
            class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            :title="tableStore.isMinimized ? 'Expandir' : 'Minimizar'"
          >
            <svg v-if="!tableStore.isMinimized" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
          </button>

          <!-- Maximize / Normal -->
          <button
            v-if="!tableStore.isMinimized"
            @click="tableStore.toggleMaximize"
            class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors hidden sm:inline-flex"
            :title="tableStore.isMaximized ? 'Tamanho normal' : 'Maximizar'"
          >
            <svg v-if="!tableStore.isMaximized" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 9L4 4m0 0h4m-4 0v4m11 11l5 5m0 0h-4m4 0v-4M9 15l-5 5m0 0h4m-4 0v-4m11-11l5-5m0 0h-4m4 0v4" />
            </svg>
          </button>

          <!-- Close -->
          <button
            @click="handleClose"
            class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Fechar Tabela"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Main Content (when not minimized) -->
      <div v-show="!tableStore.isMinimized" class="flex-1 flex flex-col overflow-hidden">
        <!-- Toolbar & Filter -->
        <div v-if="features.length > 0 || loading" class="px-4 py-2 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4 bg-white dark:bg-gray-900 flex-shrink-0">
          <div class="relative flex-1 max-w-sm">
            <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Filtrar atributos e valores na tabela..."
              class="w-full pl-8 pr-7 py-1 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-200 placeholder-gray-400 outline-none focus:ring-1 focus:ring-teal-500 transition-all"
            />
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="text-[11px] text-gray-400 dark:text-gray-500 hidden sm:flex items-center gap-2">
            <span>💡 Dica: Clique em qualquer linha para centralizar e destacar a feição no mapa.</span>
          </div>
        </div>

        <!-- Table View or Raster/WMS Notice -->
        <div class="flex-1 overflow-auto">
          <!-- Loading State -->
          <div v-if="loading" class="flex flex-col items-center justify-center h-full py-12 gap-2.5">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Consultando atributos da camada no servidor...</span>
          </div>

          <!-- Data Grid (When Features Exist) -->
          <div v-else-if="features.length > 0" class="w-full">
            <table class="w-full text-left text-xs border-collapse">
              <thead class="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <tr>
                  <!-- Action column -->
                  <th class="py-2 px-3 w-16 text-center font-extrabold text-[10px] uppercase tracking-wider text-gray-400">
                    Ação
                  </th>
                  <!-- Dynamic Property Columns -->
                  <th
                    v-for="col in columns"
                    :key="col"
                    @click="handleSort(col)"
                    class="py-2 px-3 font-extrabold text-[10px] uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-750 transition-colors select-none whitespace-nowrap"
                  >
                    <div class="flex items-center gap-1.5">
                      <span>{{ col }}</span>
                      <span v-if="sortColumn === col" class="text-teal-600 dark:text-teal-400">
                        {{ sortDirection === 'asc' ? '▲' : '▼' }}
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                <tr
                  v-for="feature in sortedFilteredFeatures"
                  :key="feature.id"
                  @click="selectAndLocateFeature(feature)"
                  :class="[
                    'cursor-pointer transition-colors hover:bg-teal-50/60 dark:hover:bg-teal-950/30',
                    tableStore.selectedFeatureId === feature.id
                      ? 'bg-amber-50 dark:bg-amber-950/40 font-semibold ring-1 ring-inset ring-amber-400'
                      : 'odd:bg-white even:bg-gray-50/40 dark:odd:bg-gray-900 dark:even:bg-gray-850/40'
                  ]"
                >
                  <!-- Locate button -->
                  <td class="py-1.5 px-3 text-center" @click.stop="selectAndLocateFeature(feature)">
                    <button
                      class="p-1 rounded hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-600 dark:text-teal-400 transition-colors"
                      title="Centralizar no mapa"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </td>
                  <!-- Property Values -->
                  <td
                    v-for="col in columns"
                    :key="col"
                    class="py-1.5 px-3 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs font-mono text-[11px]"
                    :title="String(feature.properties[col] ?? '')"
                  >
                    {{ feature.properties[col] !== undefined && feature.properties[col] !== null ? feature.properties[col] : '—' }}
                  </td>
                </tr>
                <tr v-if="sortedFilteredFeatures.length === 0">
                  <td :colspan="columns.length + 1" class="text-center py-6 text-xs text-gray-400">
                    Nenhum resultado corresponde ao filtro "{{ searchQuery }}".
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Basemap / Pure XYZ Tile Layer Notice -->
          <div v-else-if="tableStore.activeLayer.type === 'xyz' || tableStore.activeLayer.basemap" class="flex flex-col items-center justify-center h-full p-6 text-center">
            <div class="p-3 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-2xl mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h4 class="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">
              Mapa de Fundo (Basemap XYZ)
            </h4>
            <p class="text-xs text-gray-500 dark:text-gray-400 max-w-md">
              Os mapas de fundo são mosaicos de imagens cartográficas de referência e não possuem registros vetoriais tabulares individuais.
            </p>
          </div>

          <!-- WMS Service with no WFS features returned -->
          <div v-else-if="tableStore.activeLayer.type === 'wms' || tableStore.activeLayer.type === 'wfs'" class="flex flex-col items-center justify-center h-full p-6 text-center">
            <div class="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-2xl mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h4 class="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">
              Nenhuma feição tabular retornada para esta camada WMS
            </h4>
            <p class="text-xs text-gray-500 dark:text-gray-400 max-w-md mb-4">
              Não foi possível obter a matriz de feições via WFS do GeoServer para esta camada. Se a camada for um mosaico de imagem raster (ex: satélite/ortofoto), use a ferramenta <strong>Identificar</strong> no mapa.
            </p>

            <button
              @click="loadFeatures"
              class="px-3 py-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/40 border border-teal-200 dark:border-teal-800 rounded-lg transition-colors mb-4 flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Tentar Novamente (WFS GetFeature)
            </button>

            <div class="bg-gray-50 dark:bg-gray-850 p-3 rounded-xl border border-gray-200 dark:border-gray-800 text-left text-xs text-gray-600 dark:text-gray-400 max-w-lg w-full space-y-1 font-mono text-[11px]">
              <div><strong>Fonte:</strong> {{ tableStore.activeLayer.source.url }}</div>
              <div v-if="tableStore.activeLayer.source.layers"><strong>Camada:</strong> {{ tableStore.activeLayer.source.layers }}</div>
            </div>
          </div>

          <!-- Empty GeoJSON State -->
          <div v-else class="flex flex-col items-center justify-center h-full p-6 text-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p class="text-xs font-semibold">Nenhuma feição encontrada nesta camada.</p>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useLayerTableStore } from '../../stores/layerTable'
import { useLayerFeatures } from '../../composables/useLayerFeatures'

const tableStore = useLayerTableStore()
const { getLayerFeatures, highlightFeature, clearHighlight } = useLayerFeatures()

interface FeatureItem {
  id: string | number
  properties: Record<string, any>
  geometry: any
  feature?: any
}

const features = ref<FeatureItem[]>([])
const loading = ref(false)
const searchQuery = ref('')
const sortColumn = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc'>('asc')

async function loadFeatures() {
  if (tableStore.activeLayer) {
    loading.value = true
    searchQuery.value = ''
    sortColumn.value = null
    try {
      features.value = await getLayerFeatures(tableStore.activeLayer)
    } finally {
      loading.value = false
    }
  } else {
    features.value = []
    clearHighlight()
  }
}

// Load features whenever active layer changes
watch(() => tableStore.activeLayerId, () => {
  loadFeatures()
}, { immediate: true })

// Extract column keys dynamically from all features
const columns = computed(() => {
  const colSet = new Set<string>()
  features.value.forEach(f => {
    Object.keys(f.properties).forEach(k => {
      if (!k.startsWith('ol_') && k !== 'geometry' && k !== 'geom' && k !== 'the_geom' && k !== 'bbox') {
        colSet.add(k)
      }
    })
  })
  return Array.from(colSet)
})

// Filter features by global search query
const filteredFeatures = computed(() => {
  if (!searchQuery.value.trim()) return features.value
  const query = searchQuery.value.toLowerCase().trim()
  return features.value.filter(f => {
    return Object.values(f.properties).some(val => {
      if (val === null || val === undefined) return false
      return String(val).toLowerCase().includes(query)
    })
  })
})

// Sort features
const sortedFilteredFeatures = computed(() => {
  if (!sortColumn.value) return filteredFeatures.value
  const col = sortColumn.value
  const dir = sortDirection.value === 'asc' ? 1 : -1

  return [...filteredFeatures.value].sort((a, b) => {
    const valA = a.properties[col]
    const valB = b.properties[col]

    if (valA === valB) return 0
    if (valA === undefined || valA === null) return 1
    if (valB === undefined || valB === null) return -1

    if (typeof valA === 'number' && typeof valB === 'number') {
      return (valA - valB) * dir
    }
    return String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' }) * dir
  })
})

function handleSort(col: string) {
  if (sortColumn.value === col) {
    if (sortDirection.value === 'asc') {
      sortDirection.value = 'desc'
    } else {
      sortColumn.value = null
      sortDirection.value = 'asc'
    }
  } else {
    sortColumn.value = col
    sortDirection.value = 'asc'
  }
}

function selectAndLocateFeature(f: FeatureItem) {
  tableStore.selectFeature(f.id)
  highlightFeature(f.feature || f, true)
}

function handleClose() {
  clearHighlight()
  tableStore.closeTable()
}

function exportCsv() {
  if (!tableStore.activeLayer || features.value.length === 0) return

  const cols = columns.value
  const headerRow = cols.map(c => `"${c.replace(/"/g, '""')}"`).join(',')
  
  const dataRows = features.value.map(f => {
    return cols.map(c => {
      const val = f.properties[c]
      if (val === undefined || val === null) return '""'
      return `"${String(val).replace(/"/g, '""')}"`
    }).join(',')
  })

  const csvContent = [headerRow, ...dataRows].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${tableStore.activeLayer.name.toLowerCase().replace(/\s+/g, '_')}_atributos.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
