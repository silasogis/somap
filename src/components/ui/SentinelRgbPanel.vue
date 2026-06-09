<template>
  <div class="absolute bottom-6 right-14 z-10 flex flex-col items-end gap-3 pointer-events-none">
    <!-- Botão de Ativação (se todos os painéis estiverem inativos) -->
    <button
      v-if="!sentinelRgbStore.isActive && !ndviClimateStore.isActive && !routeStore.isActive"
      @click="sentinelRgbStore.toggleActive"
      class="pointer-events-auto bg-white dark:bg-gray-900 shadow-xl rounded-full px-5 py-3 flex items-center gap-3 hover:scale-105 transition-all border border-gray-100 dark:border-gray-800 group"
    >
      <div class="p-2 bg-indigo-500 rounded-full text-white group-hover:rotate-12 transition-transform">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <span class="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight">Sentinel-2 RGB</span>
    </button>

    <!-- Painel de Imagem Sentinel RGB Ativo -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-y-4 opacity-0 scale-95"
      enter-to-class="transform translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100 scale-100"
      leave-to-class="transform translate-y-4 opacity-0 scale-95"
    >
      <div
        v-if="sentinelRgbStore.isActive"
        class="pointer-events-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-6 py-5 shadow-2xl rounded-2xl border border-white/20 dark:border-gray-800/80 w-[380px] max-h-[85vh] overflow-y-auto flex flex-col gap-4"
      >
        <!-- Cabeçalho -->
        <div class="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-indigo-500 animate-pulse"></div>
            <h3 class="text-sm font-black text-gray-800 dark:text-white uppercase tracking-wider">Sentinel-2 RGB</h3>
          </div>
          <button
            @click="sentinelRgbStore.toggleActive"
            class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-red-500"
            title="Fechar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Conteúdo do Painel -->
        <div class="space-y-4 text-sm text-gray-700 dark:text-gray-300">
          
          <!-- Seção 1: Períodos de Datas -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Intervalos de Data</span>
              <button
                v-if="sentinelRgbStore.datePeriods.length < 3"
                @click="addPeriod"
                class="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                + Adicionar
              </button>
            </div>
            
            <div class="space-y-2">
              <div
                v-for="(period, idx) in sentinelRgbStore.datePeriods"
                :key="idx"
                class="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800/60"
              >
                <div class="grid grid-cols-2 gap-1.5 flex-1">
                  <div class="flex flex-col gap-0.5">
                    <span class="text-[9px] font-bold text-gray-400 uppercase">Início</span>
                    <input
                      type="date"
                      :value="period[0]"
                      @input="updatePeriod(idx, 0, ($event.target as HTMLInputElement).value)"
                      class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-xs text-gray-800 dark:text-gray-200 outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <span class="text-[9px] font-bold text-gray-400 uppercase">Fim</span>
                    <input
                      type="date"
                      :value="period[1]"
                      @input="updatePeriod(idx, 1, ($event.target as HTMLInputElement).value)"
                      class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-xs text-gray-800 dark:text-gray-200 outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                </div>
                
                <button
                  v-if="sentinelRgbStore.datePeriods.length > 1"
                  @click="sentinelRgbStore.removeDatePeriod(idx)"
                  class="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-400 hover:text-red-500 rounded-lg transition-colors mt-3.5"
                  title="Remover Período"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Seção 2: Área / Ações de Desenho -->
          <div class="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Área de Análise (ROI)</span>
            
            <!-- Sem ROI Desenho -->
            <div v-if="!sentinelRgbStore.roi" class="space-y-2">
              <button
                v-if="!sentinelRgbStore.isDrawing"
                @click="sentinelRgbStore.startDrawing"
                class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 hover:scale-[1.01] active:scale-95 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Desenhar Área no Mapa
              </button>

              <div
                v-else
                class="flex flex-col items-center justify-center py-4 bg-indigo-50/55 dark:bg-indigo-950/15 rounded-xl border border-dashed border-indigo-200 dark:border-indigo-800 text-center gap-2 animate-pulse"
              >
                <div class="w-2 h-2 rounded-full bg-indigo-500"></div>
                <span class="text-xs font-bold text-indigo-700 dark:text-indigo-400">Desenho Ativo no Mapa</span>
                <span class="text-[10px] text-indigo-600/80 dark:text-indigo-400/80 px-4 leading-normal">
                  Clique no mapa para marcar os vértices da sua área. Dê duplo clique para concluir o polígono.
                </span>
                <button
                  @click="sentinelRgbStore.stopDrawing"
                  class="mt-1 text-[10px] font-bold text-red-500 hover:underline"
                >
                  Cancelar Desenho
                </button>
              </div>
            </div>

            <!-- ROI Desenho Concluído -->
            <div v-else class="flex items-center justify-between bg-indigo-500/10 dark:bg-indigo-500/5 px-3 py-2.5 rounded-xl border border-indigo-500/25">
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-xs font-bold text-indigo-700 dark:text-indigo-400">Área delimitada com sucesso!</span>
              </div>
              <button
                @click="sentinelRgbStore.startDrawing"
                class="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Redesenhar
              </button>
            </div>
          </div>

          <!-- Carregamento (Loading) -->
          <div v-if="sentinelRgbStore.isLoading" class="flex flex-col items-center gap-3 py-8 justify-center bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div class="flex space-x-1.5">
              <div class="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div class="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div class="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce"></div>
            </div>
            <span class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest animate-pulse">Processando no Earth Engine</span>
          </div>

          <!-- Erro -->
          <div v-else-if="sentinelRgbStore.errorMessage" class="py-2">
            <div class="flex items-center gap-3 py-3 px-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800/50">
              <div class="p-1.5 bg-red-100 dark:bg-red-800 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span class="text-[11px] font-bold text-red-700 dark:text-red-300 leading-tight">{{ sentinelRgbStore.errorMessage }}</span>
            </div>
          </div>

          <!-- Seção 3: Abas e Controles de Visualização -->
          <div v-else-if="sentinelRgbStore.rgbData" class="space-y-4 animate-fade-in">
            
            <!-- Seleção de Período Ativo (Abas) se houver mais de um -->
            <div v-if="sentinelRgbStore.datePeriods.length > 1" class="flex border-b border-gray-100 dark:border-gray-800 gap-1.5">
              <button
                v-for="(_, idx) in sentinelRgbStore.datePeriods"
                :key="idx"
                @click="sentinelRgbStore.selectedPeriodKey = `period_${idx + 1}`"
                class="flex-1 pb-2 text-xs font-bold transition-all relative"
                :class="sentinelRgbStore.selectedPeriodKey === `period_${idx + 1}` ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'"
              >
                P{{ idx + 1 }}
                <div
                  v-if="sentinelRgbStore.selectedPeriodKey === `period_${idx + 1}`"
                  class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full"
                ></div>
              </button>
            </div>

            <!-- Camadas no Mapa (Tiles Controls) -->
            <div class="space-y-3">
              <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Visualização no Mapa</span>

              <div class="bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800/60 space-y-3.5">
                <!-- Visibilidade da Camada -->
                <label class="flex items-center justify-between cursor-pointer select-none">
                  <span class="text-xs font-bold text-gray-600 dark:text-gray-300">Mostrar Sentinel-2 RGB</span>
                  <div class="relative">
                    <input
                      type="checkbox"
                      v-model="sentinelRgbStore.tileVisible"
                      class="sr-only"
                    />
                    <div class="w-8 h-4 bg-gray-300 dark:bg-gray-700 rounded-full transition-colors" :class="{ 'bg-indigo-500': sentinelRgbStore.tileVisible }"></div>
                    <div class="absolute top-0.5 left-0.5 bg-white w-3 h-3 rounded-full shadow transition-transform" :class="{ 'transform translate-x-4': sentinelRgbStore.tileVisible }"></div>
                  </div>
                </label>

                <!-- Controle de Opacidade -->
                <div class="space-y-1.5" v-if="sentinelRgbStore.tileVisible">
                  <div class="flex justify-between text-[10px] font-semibold text-gray-400">
                    <span>Opacidade da Imagem</span>
                    <span class="font-extrabold text-indigo-600 dark:text-indigo-400">{{ Math.round(sentinelRgbStore.tileOpacity * 100) }}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    v-model.number="sentinelRgbStore.tileOpacity"
                    class="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>
            </div>

            <!-- Botão Limpar Tudo -->
            <button
              @click="sentinelRgbStore.clearAnalysis"
              class="w-full py-2.5 text-xs font-bold text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Limpar Visualização
            </button>

          </div>

        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useSentinelRgbStore } from '../../stores/sentinelRgb'
import { useNdviClimateStore } from '../../stores/ndviClimate'
import { useRouteStore } from '../../stores/route'

const sentinelRgbStore = useSentinelRgbStore()
const ndviClimateStore = useNdviClimateStore()
const routeStore = useRouteStore()

function addPeriod() {
  const currentLen = sentinelRgbStore.datePeriods.length
  if (currentLen === 1) {
    sentinelRgbStore.addDatePeriod('2024-02-01', '2024-02-28')
  } else if (currentLen === 2) {
    sentinelRgbStore.addDatePeriod('2024-03-01', '2024-03-28')
  } else {
    sentinelRgbStore.addDatePeriod('2024-04-01', '2024-04-28')
  }
}

function updatePeriod(index: number, position: 0 | 1, value: string) {
  const period = sentinelRgbStore.datePeriods[index]
  if (!period) return
  const currentPeriod: [string, string] = [period[0], period[1]]
  currentPeriod[position] = value
  sentinelRgbStore.updateDatePeriod(index, currentPeriod[0], currentPeriod[1])
}
</script>

<style scoped>
.backdrop-blur-md {
  backdrop-filter: blur(12px);
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>
