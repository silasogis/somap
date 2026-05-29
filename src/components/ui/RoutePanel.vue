<template>
  <div
    class="absolute z-10 flex flex-col items-end gap-3 transition-all duration-300"
    :class="routeStore.isActive ? 'bottom-6 right-14' : 'bottom-[86px] right-14'"
  >
    <!-- Botão de Ativação (se inativo e NDVI inativo) -->
    <button
      v-if="!routeStore.isActive && !ndviClimateStore.isActive"
      @click="routeStore.toggleActive"
      class="bg-white dark:bg-gray-900 shadow-xl rounded-full px-5 py-3 flex items-center gap-3 hover:scale-105 transition-all border border-gray-100 dark:border-gray-800 group"
    >
      <div class="p-2 bg-blue-500 rounded-full text-white group-hover:rotate-12 transition-transform">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      </div>
      <span class="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight">Roteirização</span>
    </button>

    <!-- Painel de Roteirização Ativo -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-y-4 opacity-0 scale-95"
      enter-to-class="transform translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100 scale-100"
      leave-to-class="transform translate-y-4 opacity-0 scale-95"
    >
      <div
        v-if="routeStore.isActive"
        class="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-6 py-5 shadow-2xl rounded-2xl border border-white/20 dark:border-gray-700/50 min-w-[320px] max-w-[400px]"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
            <h3 class="text-xs font-black text-gray-800 dark:text-white uppercase tracking-widest">Modo Roteiro</h3>
          </div>
          <button
            @click="routeStore.toggleActive"
            class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-red-500"
            title="Fechar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-3">
          <!-- Status / Instruções -->
          <div class="text-sm text-gray-600 dark:text-gray-300">
            <div v-if="!routeStore.startPoint && !routeStore.isLoading" class="flex items-center gap-3 py-2">
              <div class="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 font-bold text-xs">A</div>
              <span class="font-medium">Clique no mapa ou busque o Ponto de Partida</span>
            </div>

            <div v-else-if="routeStore.startPoint && !routeStore.endPoint && !routeStore.isLoading" class="flex items-center gap-3 py-2">
              <div class="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 font-bold text-xs">B</div>
              <span class="font-medium animate-pulse">Agora selecione o Ponto de Destino</span>
            </div>

            <div v-else-if="routeStore.isLoading" class="flex items-center gap-3 py-4 justify-center bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div class="flex space-x-1.5">
                <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              </div>
            </div>

            <!-- Erro -->
            <div v-else-if="routeStore.errorMessage" class="py-2">
              <div class="flex items-center gap-3 py-3 px-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800/50">
                <div class="p-1.5 bg-red-100 dark:bg-red-800 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span class="text-[11px] font-bold text-red-700 dark:text-red-300 leading-tight">{{ routeStore.errorMessage }}</span>
              </div>
            </div>

            <!-- Resultado -->
            <div v-else-if="routeStore.totalCost !== null" class="flex flex-col gap-2">
              <!-- Métricas principais: tempo + distância -->
              <div class="grid grid-cols-2 gap-2">
                <div class="flex flex-col px-3 py-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <span class="text-[9px] font-bold uppercase tracking-widest text-blue-400 mb-0.5">Tempo Est.</span>
                  <span class="text-lg font-black text-blue-700 dark:text-blue-300 leading-tight">{{ formatTime(routeStore.totalCost) }}</span>
                </div>
                <div class="flex flex-col px-3 py-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <span class="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Distância</span>
                  <span class="text-lg font-black text-gray-700 dark:text-gray-200 leading-tight">
                    {{ routeStore.totalDistanceKm ? formatDistance(routeStore.totalDistanceKm) : '—' }}
                  </span>
                </div>
              </div>

              <!-- Velocidade média -->
              <div v-if="avgSpeed !== null" class="flex items-center justify-between px-3 py-2 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30">
                <div class="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span class="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Vel. Média Est.</span>
                </div>
                <span class="text-sm font-black text-amber-700 dark:text-amber-300">{{ avgSpeed }} km/h</span>
              </div>
            </div>
          </div>

          <!-- Pontos A e B -->
          <div v-if="routeStore.startPoint" class="flex flex-col gap-1.5 pt-3 border-t border-gray-100 dark:border-gray-800">
            <div class="flex items-center gap-2 min-w-0">
              <div class="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 font-black text-[9px] shrink-0">A</div>
              <span class="text-[11px] text-gray-600 dark:text-gray-400 truncate">
                {{ routeStore.startAddress || routeStore.startPoint.map(c => c.toFixed(4)).join(', ') }}
              </span>
            </div>
            <div v-if="routeStore.endPoint" class="flex items-center gap-2 min-w-0">
              <div class="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 font-black text-[9px] shrink-0">B</div>
              <span class="text-[11px] text-gray-600 dark:text-gray-400 truncate">
                {{ routeStore.endAddress || routeStore.endPoint.map(c => c.toFixed(4)).join(', ') }}
              </span>
            </div>
          </div>

          <!-- Botão de Limpar -->
          <button
            v-if="routeStore.startPoint"
            @click="routeStore.clearRoute"
            class="w-full py-2.5 text-xs font-bold text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Limpar Rota
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouteStore } from '../../stores/route'
import { useNdviClimateStore } from '../../stores/ndviClimate'

const routeStore = useRouteStore()
const ndviClimateStore = useNdviClimateStore()

function formatTime(hours: number): string {
  const h = Math.floor(hours)
  const min = Math.round((hours - h) * 60)
  if (h === 0) return `${min}min`
  if (min === 0) return `${h}h`
  return `${h}h ${min}min`
}

function formatDistance(km: number): string {
  if (km >= 1) return `${Math.round(km)} km`
  return `${Math.round(km * 1000)} m`
}

const avgSpeed = computed<number | null>(() => {
  if (!routeStore.totalCost || !routeStore.totalDistanceKm) return null
  return Math.round(routeStore.totalDistanceKm / routeStore.totalCost)
})
</script>

<style scoped>
.backdrop-blur-md {
  backdrop-filter: blur(12px);
}
</style>
