<template>
  <div
    class="absolute z-10 flex flex-col items-end gap-3 transition-all duration-300 pointer-events-none"
    :class="ndviClimateStore.isActive ? 'bottom-6 right-14' : 'bottom-[86px] right-14'"
  >
    <!-- Botão de Ativação (se todos os painéis estiverem inativos) -->
    <button
      v-if="!ndviClimateStore.isActive && !routeStore.isActive && !sentinelRgbStore.isActive"
      @click="ndviClimateStore.toggleActive"
      class="pointer-events-auto bg-white dark:bg-gray-900 shadow-xl rounded-full px-5 py-3 flex items-center gap-3 hover:scale-105 transition-all border border-gray-100 dark:border-gray-800 group"
    >
      <div class="p-2 bg-teal-500 rounded-full text-white group-hover:rotate-12 transition-transform">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      </div>
      <span class="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight">Análise NDVI-Clima</span>
    </button>

    <!-- Painel de Análise NDVI-Clima Ativo -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-y-4 opacity-0 scale-95"
      enter-to-class="transform translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100 scale-100"
      leave-to-class="transform translate-y-4 opacity-0 scale-95"
    >
      <div
        v-if="ndviClimateStore.isActive"
        class="pointer-events-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-6 py-5 shadow-2xl rounded-2xl border border-white/20 dark:border-gray-800/80 w-[380px] max-h-[85vh] overflow-y-auto flex flex-col gap-4"
      >
        <!-- Cabeçalho -->
        <div class="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-teal-500 animate-pulse"></div>
            <h3 class="text-sm font-black text-gray-800 dark:text-white uppercase tracking-wider">Análise NDVI-Clima</h3>
          </div>
          <button
            @click="ndviClimateStore.toggleActive"
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
                v-if="ndviClimateStore.datePeriods.length < 3"
                @click="addPeriod"
                class="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                + Adicionar
              </button>
            </div>
            
            <div class="space-y-2">
              <div
                v-for="(period, idx) in ndviClimateStore.datePeriods"
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
                      class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-xs text-gray-800 dark:text-gray-200 outline-none focus:ring-1 focus:ring-teal-500 font-medium"
                    />
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <span class="text-[9px] font-bold text-gray-400 uppercase">Fim</span>
                    <input
                      type="date"
                      :value="period[1]"
                      @input="updatePeriod(idx, 1, ($event.target as HTMLInputElement).value)"
                      class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-xs text-gray-800 dark:text-gray-200 outline-none focus:ring-1 focus:ring-teal-500 font-medium"
                    />
                  </div>
                </div>
                
                <button
                  v-if="ndviClimateStore.datePeriods.length > 1"
                  @click="ndviClimateStore.removeDatePeriod(idx)"
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
            <div v-if="!ndviClimateStore.roi" class="space-y-2">
              <button
                v-if="!ndviClimateStore.isDrawing"
                @click="ndviClimateStore.startDrawing"
                class="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-600/10 hover:shadow-teal-600/20 hover:scale-[1.01] active:scale-95 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Desenhar Área no Mapa
              </button>

              <div
                v-else
                class="flex flex-col items-center justify-center py-4 bg-teal-50/55 dark:bg-teal-950/15 rounded-xl border border-dashed border-teal-200 dark:border-teal-800 text-center gap-2 animate-pulse"
              >
                <div class="w-2 h-2 rounded-full bg-teal-500"></div>
                <span class="text-xs font-bold text-teal-700 dark:text-teal-400">Desenho Ativo no Mapa</span>
                <span class="text-[10px] text-teal-600/80 dark:text-teal-400/80 px-4 leading-normal">
                  Clique no mapa para marcar os vértices da sua área. Dê duplo clique para concluir o polígono.
                </span>
                <button
                  @click="ndviClimateStore.stopDrawing"
                  class="mt-1 text-[10px] font-bold text-red-500 hover:underline"
                >
                  Cancelar Desenho
                </button>
              </div>
            </div>

            <!-- ROI Desenho Concluído -->
            <div v-else class="flex items-center justify-between bg-teal-500/10 dark:bg-teal-500/5 px-3 py-2.5 rounded-xl border border-teal-500/25">
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-xs font-bold text-teal-700 dark:text-teal-400">Área delimitada com sucesso!</span>
              </div>
              <button
                @click="ndviClimateStore.startDrawing"
                class="text-[10px] font-black uppercase text-teal-600 dark:text-teal-400 hover:underline"
              >
                Redesenhar
              </button>
            </div>
          </div>

          <!-- Carregamento (Loading) -->
          <div v-if="ndviClimateStore.isLoading" class="flex flex-col items-center gap-3 py-8 justify-center bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div class="flex space-x-1.5">
              <div class="w-2.5 h-2.5 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div class="w-2.5 h-2.5 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div class="w-2.5 h-2.5 bg-teal-500 rounded-full animate-bounce"></div>
            </div>
            <span class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest animate-pulse">Processando no Earth Engine</span>
          </div>

          <!-- Erro -->
          <div v-else-if="ndviClimateStore.errorMessage" class="py-2">
            <div class="flex items-center gap-3 py-3 px-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800/50">
              <div class="p-1.5 bg-red-100 dark:bg-red-800 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span class="text-[11px] font-bold text-red-700 dark:text-red-300 leading-tight">{{ ndviClimateStore.errorMessage }}</span>
            </div>
          </div>

          <!-- Seção 3: Exibição de Estatísticas e Controles NDVI-Clima -->
          <div v-else-if="ndviClimateStore.ndviData && ndviClimateStore.climateData" class="space-y-4 animate-fade-in">
            
            <!-- Seleção de Período Ativo (Abas) se houver mais de um -->
            <div v-if="ndviClimateStore.datePeriods.length > 1" class="flex border-b border-gray-100 dark:border-gray-800 gap-1.5">
              <button
                v-for="(_, idx) in ndviClimateStore.datePeriods"
                :key="idx"
                @click="ndviClimateStore.selectedPeriodKey = `period_${idx + 1}`"
                class="flex-1 pb-2 text-xs font-bold transition-all relative"
                :class="ndviClimateStore.selectedPeriodKey === `period_${idx + 1}` ? 'text-teal-600 dark:text-teal-400 font-extrabold' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'"
              >
                P{{ idx + 1 }}
                <div
                  v-if="ndviClimateStore.selectedPeriodKey === `period_${idx + 1}`"
                  class="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500 rounded-full"
                ></div>
              </button>
            </div>

            <!-- Dados NDVI do Período Selecionado -->
            <div v-if="activeNdviStats" class="space-y-3 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/60">
              <div class="flex items-center justify-between">
                <span class="text-xs font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" />
                  </svg>
                  Índice NDVI
                </span>
                <span class="text-[9px] font-bold text-gray-400 uppercase bg-gray-200/55 dark:bg-gray-700/80 px-2 py-0.5 rounded-md">
                  Satélite: {{ activeNdviStats.satellite }}
                </span>
              </div>

              <!-- Medidor Visual de NDVI Médio -->
              <div class="space-y-1.5">
                <div class="flex justify-between items-baseline">
                  <span class="text-[10px] font-bold uppercase text-gray-400">NDVI Médio</span>
                  <span class="text-lg font-black text-teal-600 dark:text-teal-400">{{ activeNdviStats.ndvi_mean.toFixed(3) }}</span>
                </div>
                <!-- Barra de Escala NDVI -->
                <div class="h-2 w-full rounded-full bg-gradient-to-r from-red-500 via-amber-300 to-green-600 relative">
                  <!-- Indicador de Valor -->
                  <div
                    class="absolute top-1/2 -translate-y-1/2 -ml-1.5 w-3 h-3 bg-white dark:bg-gray-900 border border-teal-500 rounded-full shadow"
                    :style="{ left: `${getNdviPercentage(activeNdviStats.ndvi_mean)}%` }"
                  ></div>
                </div>
                <div class="flex justify-between text-[9px] font-semibold text-gray-400 px-0.5">
                  <span>-0.1 (Solo Exposto)</span>
                  <span>0.8+ (Densa)</span>
                </div>
              </div>

              <!-- Mínimo e Máximo -->
              <div class="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div class="flex flex-col bg-white dark:bg-gray-800 px-3 py-2 rounded-xl border border-gray-100 dark:border-gray-700/50">
                  <span class="text-[8px] font-bold uppercase text-gray-400">NDVI Mínimo</span>
                  <span class="text-sm font-black text-gray-600 dark:text-gray-300 mt-0.5">{{ activeNdviStats.ndvi_min.toFixed(3) }}</span>
                </div>
                <div class="flex flex-col bg-white dark:bg-gray-800 px-3 py-2 rounded-xl border border-gray-100 dark:border-gray-700/50">
                  <span class="text-[8px] font-bold uppercase text-gray-400">NDVI Máximo</span>
                  <span class="text-sm font-black text-teal-600 dark:text-teal-400 mt-0.5">{{ activeNdviStats.ndvi_max.toFixed(3) }}</span>
                </div>
              </div>
            </div>

            <!-- Dados de Clima do Período Selecionado -->
            <div v-if="activePrecipitationStats && activeTemperatureStats" class="space-y-3">
              <span class="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
                Estatísticas Climáticas
              </span>

              <!-- Cards Chuva + Temperatura -->
              <div class="grid grid-cols-2 gap-2">
                <!-- Chuva (CHIRPS) -->
                <div class="bg-blue-50/50 dark:bg-blue-950/15 p-3 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex flex-col justify-between min-h-[92px]">
                  <div>
                    <span class="text-[8px] font-bold uppercase text-blue-500/80">Chuva Acumulada</span>
                    <h4 class="text-lg font-black text-blue-600 dark:text-blue-400 mt-0.5 leading-tight">
                      {{ activePrecipitationStats.precipitation_sum.toFixed(1) }} mm
                    </h4>
                  </div>
                  <div class="text-[9px] text-blue-500/70 font-semibold border-t border-blue-100/50 dark:border-blue-900/20 pt-1 mt-1 flex justify-between">
                    <span>Média Diária:</span>
                    <span class="font-extrabold">{{ activePrecipitationStats.precipitation_daily_mean.toFixed(2) }} mm/d</span>
                  </div>
                </div>

                <!-- Temperatura ERA5 -->
                <div class="bg-amber-50/50 dark:bg-amber-950/10 p-3 rounded-2xl border border-amber-100 dark:border-amber-950/20 flex flex-col justify-between min-h-[92px]">
                  <div>
                    <span class="text-[8px] font-bold uppercase text-amber-600/80">Temp. Média</span>
                    <h4 class="text-lg font-black text-amber-700 dark:text-amber-300 mt-0.5 leading-tight">
                      {{ activeTemperatureStats.temperature_mean_celsius.toFixed(1) }} °C
                    </h4>
                  </div>
                  <div class="text-[9px] text-amber-600/70 font-semibold border-t border-amber-100/50 dark:border-amber-900/20 pt-1 mt-1 flex justify-between">
                    <span>Variação:</span>
                    <span class="font-extrabold">{{ activeTemperatureStats.temperature_min_celsius.toFixed(1) }} a {{ activeTemperatureStats.temperature_max_celsius.toFixed(1) }}°</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Camadas no Mapa (Tiles Controls) -->
            <div class="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Visualização no Mapa</span>

              <div class="bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800/60 space-y-3.5">
                <!-- Visibilidade da Camada -->
                <label class="flex items-center justify-between cursor-pointer select-none">
                  <span class="text-xs font-bold text-gray-600 dark:text-gray-300">Mostrar Camada NDVI</span>
                  <div class="relative">
                    <input
                      type="checkbox"
                      v-model="ndviClimateStore.tileVisible"
                      class="sr-only"
                    />
                    <div class="w-8 h-4 bg-gray-300 dark:bg-gray-700 rounded-full transition-colors" :class="{ 'bg-teal-500': ndviClimateStore.tileVisible }"></div>
                    <div class="absolute top-0.5 left-0.5 bg-white w-3 h-3 rounded-full shadow transition-transform" :class="{ 'transform translate-x-4': ndviClimateStore.tileVisible }"></div>
                  </div>
                </label>

                <!-- Controle de Opacidade -->
                <div class="space-y-1.5" v-if="ndviClimateStore.tileVisible">
                  <div class="flex justify-between text-[10px] font-semibold text-gray-400">
                    <span>Opacidade da Imagem</span>
                    <span class="font-extrabold text-teal-600 dark:text-teal-400">{{ Math.round(ndviClimateStore.tileOpacity * 100) }}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    v-model.number="ndviClimateStore.tileOpacity"
                    class="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
                  />
                </div>
              </div>
            </div>

            <!-- Botão Limpar Tudo -->
            <button
              @click="ndviClimateStore.clearAnalysis"
              class="w-full py-2.5 text-xs font-bold text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Limpar Análise
            </button>

          </div>

        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNdviClimateStore } from '../../stores/ndviClimate'
import { useRouteStore } from '../../stores/route'
import { useSentinelRgbStore } from '../../stores/sentinelRgb'

const ndviClimateStore = useNdviClimateStore()
const routeStore = useRouteStore()
const sentinelRgbStore = useSentinelRgbStore()

function addPeriod() {
  const currentLen = ndviClimateStore.datePeriods.length
  if (currentLen === 1) {
    ndviClimateStore.addDatePeriod('2024-02-01', '2024-02-28')
  } else if (currentLen === 2) {
    ndviClimateStore.addDatePeriod('2024-03-01', '2024-03-28')
  } else {
    ndviClimateStore.addDatePeriod('2024-04-01', '2024-04-28')
  }
}

function updatePeriod(index: number, position: 0 | 1, value: string) {
  const period = ndviClimateStore.datePeriods[index]
  if (!period) return
  const currentPeriod: [string, string] = [period[0], period[1]]
  currentPeriod[position] = value
  ndviClimateStore.updateDatePeriod(index, currentPeriod[0], currentPeriod[1])
}

const activeNdviStats = computed(() => {
  const key = ndviClimateStore.selectedPeriodKey
  return ndviClimateStore.ndviData?.ndvi?.[key] || null
})

const activePrecipitationStats = computed(() => {
  const key = ndviClimateStore.selectedPeriodKey
  return ndviClimateStore.climateData?.precipitation?.[key] || null
})

const activeTemperatureStats = computed(() => {
  const key = ndviClimateStore.selectedPeriodKey
  return ndviClimateStore.climateData?.temperature?.[key] || null
})

// Calcula a posição na escala de -0.1 a 1.0 (largura de 1.1)
function getNdviPercentage(val: number): number {
  const min = -0.1
  const max = 1.0
  if (val <= min) return 0
  if (val >= max) return 100
  return ((val - min) / (max - min)) * 100
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
