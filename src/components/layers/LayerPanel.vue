<template>
  <div class="flex flex-col min-h-0 bg-gray-50 dark:bg-gray-900">
    <div class="p-4 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center flex-shrink-0">
      Camadas
      <button class="text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 p-1 px-2 rounded font-bold" title="Adicionar WMS">+</button>
    </div>
    
    <div class="flex-1 overflow-y-auto p-4 space-y-6 pb-12">
      <!-- Seção: Camadas de Informação -->
      <div class="flex flex-col">
        <div class="flex items-center gap-1.5 mb-2.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          Camadas de Informação
        </div>
        
        <VueDraggableNext
          v-model="regularLayers"
          class="flex flex-col min-h-[50px]"
          handle=".cursor-move"
          animation="150"
        >
          <LayerItem
            v-for="layer in regularLayers"
            :key="layer.id"
            :layer="layer"
            @update="handleLayerUpdate"
          />
        </VueDraggableNext>
        
        <div 
          v-if="regularLayers.length === 0" 
          class="text-xs text-gray-450 dark:text-gray-550 italic p-4 bg-gray-100/50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-800/80 text-center"
        >
          Nenhuma camada ativa.
        </div>
      </div>

      <!-- Seção: Mapas de Fundo -->
      <div class="flex flex-col pt-5 border-t border-gray-200 dark:border-gray-800/80">
        <div class="flex items-center gap-1.5 mb-2.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-450 dark:text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Mapas de Fundo (Basemaps)
        </div>
        
        <VueDraggableNext
          v-model="basemapLayers"
          class="flex flex-col min-h-[50px]"
          handle=".cursor-move"
          animation="150"
        >
          <LayerItem
            v-for="layer in basemapLayers"
            :key="layer.id"
            :layer="layer"
            @update="handleLayerUpdate"
          />
        </VueDraggableNext>
        
        <div 
          v-if="basemapLayers.length === 0" 
          class="text-xs text-gray-450 dark:text-gray-550 italic p-4 bg-gray-100/50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-800/80 text-center"
        >
          Nenhum mapa de fundo.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { VueDraggableNext } from 'vue-draggable-next'
import LayerItem from './LayerItem.vue'
import { useLayersStore } from '../../stores/layers'
import type { LayerConfig } from '../../types'

const layersStore = useLayersStore()

const regularLayers = computed({
  get: () => [...layersStore.layers].filter(l => !l.basemap).reverse(),
  set: (val) => {
    const basemaps = [...layersStore.layers].filter(l => !!l.basemap)
    const regular = [...val].reverse()
    layersStore.reorderLayers([...basemaps, ...regular])
  }
})

const basemapLayers = computed({
  get: () => [...layersStore.layers].filter(l => !!l.basemap).reverse(),
  set: (val) => {
    const basemaps = [...val].reverse()
    const regular = [...layersStore.layers].filter(l => !l.basemap)
    layersStore.reorderLayers([...basemaps, ...regular])
  }
})

function handleLayerUpdate(id: string, updates: Partial<LayerConfig>) {
  layersStore.updateLayer(id, updates)
}
</script>
