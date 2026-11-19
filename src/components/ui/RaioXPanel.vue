<template>
  <div
    class="absolute z-10 flex flex-col items-end gap-3 transition-all duration-300 pointer-events-none"
    :class="raioXStore.isActive ? 'bottom-6 right-14' : 'bottom-[266px] right-14'"
  >
    <!-- Botão de Ativação Flutuante -->
    <button
      v-if="!raioXStore.isActive && !eudrStore.isActive && !ndviClimateStore.isActive && !routeStore.isActive && !sentinelRgbStore.isActive"
      @click="raioXStore.toggleActive"
      class="pointer-events-auto bg-white dark:bg-gray-900 shadow-xl rounded-full px-5 py-3 flex items-center gap-3 hover:scale-105 transition-all border border-gray-100 dark:border-gray-800 group"
      title="Análise de Ponto Comercial e Concorrência"
    >
      <div class="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full text-white group-hover:rotate-12 transition-transform shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <span class="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight">Raio-X Comercial</span>
    </button>

    <!-- Painel Lateral Ativo -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-y-4 opacity-0 scale-95"
      enter-to-class="transform translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100 scale-100"
      leave-to-class="transform translate-y-4 opacity-0 scale-95"
    >
      <div
        v-if="raioXStore.isActive"
        class="pointer-events-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-5 py-4 shadow-2xl rounded-2xl border border-white/20 dark:border-gray-800/80 w-[410px] max-h-[85vh] overflow-y-auto flex flex-col gap-3.5 text-gray-800 dark:text-gray-200"
      >
        <!-- Cabeçalho -->
        <div class="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></div>
            <div>
              <h3 class="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-white">Raio-X do Ponto</h3>
              <p class="text-[10px] text-gray-400">Curitiba e RMC · v1</p>
            </div>
          </div>
          <button
            @click="raioXStore.toggleActive"
            class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-red-500"
            title="Fechar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Conteúdo Compartilhado do Painel -->
        <RaioXContent :store="raioXStore" :is-public="false" />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useRaioXStore } from '../../stores/raioX'
import { useRouteStore } from '../../stores/route'
import { useNdviClimateStore } from '../../stores/ndviClimate'
import { useSentinelRgbStore } from '../../stores/sentinelRgb'
import { useEudrComplianceStore } from '../../stores/eudrCompliance'
import RaioXContent from '../raio-x/RaioXContent.vue'

const raioXStore = useRaioXStore()
const routeStore = useRouteStore()
const ndviClimateStore = useNdviClimateStore()
const sentinelRgbStore = useSentinelRgbStore()
const eudrStore = useEudrComplianceStore()
</script>
