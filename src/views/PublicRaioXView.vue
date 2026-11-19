<template>
  <div class="min-h-screen w-full bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col overflow-hidden font-sans">
    
    <!-- TELA 1: CARREGANDO VALIDAÇÃO -->
    <div
      v-if="publicStore.conviteStatus === 'validating' || publicStore.conviteStatus === 'idle'"
      class="flex-1 flex flex-col items-center justify-center p-6 text-center"
    >
      <div class="p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col items-center gap-4 max-w-sm w-full">
        <div class="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <div>
          <h2 class="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-white">Validando Convite</h2>
          <p class="text-xs text-gray-400 mt-1">Acessando o serviço de inteligência de mercado SOMAP…</p>
        </div>
      </div>
      <div class="mt-8 text-xs text-gray-400">Raio-X do ponto · by SOMAP</div>
    </div>

    <!-- TELA 2: CONVITE INVÁLIDO, EXPIRADO, ESGOTADO OU DESATIVADO (SEM MAPA) -->
    <div
      v-else-if="publicStore.conviteStatus === 'invalid'"
      class="flex-1 flex flex-col items-center justify-center p-4 sm:p-6"
    >
      <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 max-w-md w-full text-center flex flex-col items-center gap-4">
        
        <!-- Ícone representativo do status -->
        <div class="p-3.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <div>
          <span class="text-[11px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            Raio-X Comercial
          </span>
          <h1 class="text-lg font-black text-gray-900 dark:text-white mt-1">
            {{ publicStore.conviteErrorTitle || 'Acesso Indisponível' }}
          </h1>
          <p class="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
            {{ publicStore.conviteError }}
          </p>
        </div>

        <div class="w-full bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-left border border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <div class="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Como obter acesso?
          </div>
          <p class="text-[11px] leading-normal">
            Os relatórios de Raio-X do ponto comercial são liberados mediante convites com cotas de análise para Curitiba e Região Metropolitana.
          </p>
        </div>

        <div class="pt-2 w-full flex flex-col gap-2">
          <a
            href="https://somaping.online"
            target="_blank"
            rel="noopener noreferrer"
            class="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl text-xs shadow-md hover:shadow-lg transition-all"
          >
            Conhecer o SOMAP
          </a>
        </div>
      </div>

      <!-- Rodapé Simples -->
      <footer class="mt-6 text-xs text-gray-400 text-center">
        Raio-X do ponto · by SOMAP
      </footer>
    </div>

    <!-- TELA 3: CONVITE VÁLIDO (PÁGINA COMPLETA COM MAPA E PAINEL) -->
    <div
      v-else-if="publicStore.conviteStatus === 'valid'"
      class="flex-1 flex flex-col h-screen overflow-hidden"
    >
      
      <!-- Cabeçalho Superior Fixo -->
      <header class="h-14 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 flex items-center justify-between z-20 shrink-0">
        
        <!-- Marca / Título -->
        <div class="flex items-center gap-3">
          <div class="p-1.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg text-white shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xs sm:text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white">
                Raio-X do Ponto
              </h1>
              <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Curitiba e RMC
              </span>
            </div>
            <p class="text-[10px] text-gray-400 hidden sm:block">Inteligência de mercado e concorrência a pé</p>
          </div>
        </div>

        <!-- Seletor de visualização no Mobile + Saldo de Análises -->
        <div class="flex items-center gap-2">
          
          <!-- Seletor de abas (exibido apenas em telas menores < md) -->
          <div class="flex md:hidden bg-gray-100 dark:bg-gray-800 p-0.5 rounded-lg border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              @click="mobileTab = 'mapa'"
              :class="mobileTab === 'mapa' ? 'bg-white dark:bg-gray-700 text-amber-600 dark:text-amber-400 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium'"
              class="px-2.5 py-1 text-[11px] rounded-md transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>Mapa</span>
            </button>
            <button
              type="button"
              @click="mobileTab = 'painel'"
              :class="mobileTab === 'painel' ? 'bg-white dark:bg-gray-700 text-amber-600 dark:text-amber-400 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium'"
              class="px-2.5 py-1 text-[11px] rounded-md transition-all flex items-center gap-1.5 cursor-pointer relative"
            >
              <span>Análise</span>
              <span
                v-if="publicStore.raioXData || publicStore.descobertaData"
                class="w-1.5 h-1.5 rounded-full bg-amber-500"
              ></span>
            </button>
          </div>

          <!-- Saldo discreto de análises do convite (Requisito 4) -->
          <div
            v-if="publicStore.conviteInfo"
            class="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/40 px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] text-amber-900 dark:text-amber-200"
            :title="`Convite de ${publicStore.conviteInfo.nome}`"
          >
            <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0" :class="{ 'animate-pulse': publicStore.conviteInfo.analises_restantes > 0 }"></span>
            <span class="hidden sm:inline text-gray-600 dark:text-gray-300 font-medium">{{ publicStore.conviteInfo.nome }} ·</span>
            <span class="font-bold tabular-nums">
              {{ publicStore.conviteInfo.analises_restantes }}
            </span>
            <span class="text-gray-600 dark:text-gray-300">
              {{ publicStore.conviteInfo.analises_restantes === 1 ? 'análise restante' : 'análises restantes' }}
            </span>
          </div>
        </div>
      </header>

      <!-- Conteúdo Principal: Mapa + Painel Lateral -->
      <main class="flex-1 relative w-full h-[calc(100vh-56px)] overflow-hidden">
        
        <!-- Componente do Mapa OpenLayers Dedicado -->
        <PublicMapContainer
          ref="mapContainerRef"
          :store="publicStore"
          class="w-full h-full"
          :class="{ 'pointer-events-none md:pointer-events-auto': mobileTab === 'painel' }"
        />

        <!-- Banner flutuante no celular quando um ponto é selecionado ou analisado -->
        <div
          v-if="mobileTab === 'mapa' && publicStore.selectedPoint"
          class="md:hidden absolute bottom-4 left-4 right-4 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-3 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between gap-2"
        >
          <div class="text-xs truncate">
            <span v-if="publicStore.isLoading" class="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold">
              <span class="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></span>
              Processando análise…
            </span>
            <span v-else-if="publicStore.raioXData" class="font-bold text-gray-900 dark:text-white truncate block">
              {{ publicStore.raioXData.segmento.nome }} · {{ publicStore.raioXData.municipio.nome }}
            </span>
            <span v-else-if="publicStore.descobertaData" class="font-bold text-gray-900 dark:text-white truncate block">
              Potencial: {{ publicStore.descobertaData.ranking.length }} ramos avaliados
            </span>
            <span v-else class="text-gray-500">
              Ponto selecionado
            </span>
          </div>

          <button
            type="button"
            @click="mobileTab = 'painel'"
            class="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shrink-0 shadow-sm transition-all"
          >
            Ver Análise →
          </button>
        </div>

        <!-- PAINEL RAIO-X REAPROVEITADO (Desktop: flutuante lateral / Mobile: tela cheia quando tab='painel') -->
        <div
          class="z-10 transition-all duration-300"
          :class="[
            // Estilos no desktop (md:): fixo flutuante à direita
            'md:absolute md:top-4 md:right-4 md:bottom-4 md:w-[410px] md:max-h-[calc(100vh-88px)] md:block',
            // Estilos no mobile (< md): sobrepõe em tela inteira se mobileTab === 'painel', senão esconde
            mobileTab === 'painel' ? 'absolute inset-0 bg-white dark:bg-gray-900 z-30 p-4 overflow-y-auto block' : 'hidden md:block'
          ]"
        >
          <div class="h-full bg-white/95 dark:bg-gray-900/95 md:backdrop-blur-md md:rounded-2xl md:shadow-2xl md:border md:border-gray-200/80 md:dark:border-gray-800/80 p-4 md:p-5 overflow-y-auto flex flex-col gap-3.5">
            
            <!-- Botão de voltar ao mapa no mobile -->
            <div class="flex md:hidden items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <button
                type="button"
                @click="mobileTab = 'mapa'"
                class="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline"
              >
                <span>← Voltar ao Mapa</span>
              </button>
              <span class="text-[11px] text-gray-400">
                {{ publicStore.conviteInfo?.analises_restantes ?? 0 }} análises restantes
              </span>
            </div>

            <!-- Componente Compartilhado do Raio-X -->
            <RaioXContent :store="publicStore" :is-public="true" />
          </div>
        </div>

      </main>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePublicRaioXStore } from '../stores/publicRaioX'
import PublicMapContainer from '../components/map/PublicMapContainer.vue'
import RaioXContent from '../components/raio-x/RaioXContent.vue'

const route = useRoute()
const publicStore = usePublicRaioXStore()

// Controle da aba ativa em dispositivos móveis
const mobileTab = ref<'mapa' | 'painel'>('mapa')
const mapContainerRef = ref<InstanceType<typeof PublicMapContainer> | null>(null)

// Ao alternar abas no mobile, redimensiona o mapa para renderizar com precisão
watch(mobileTab, (tab) => {
  if (tab === 'mapa') {
    nextTick(() => {
      mapContainerRef.value?.updateSize()
    })
  }
})

onMounted(async () => {
  const conviteQuery = route.query.convite
  const codigo = Array.isArray(conviteQuery) ? conviteQuery[0] : conviteQuery
  await publicStore.validar(codigo)
})
</script>
