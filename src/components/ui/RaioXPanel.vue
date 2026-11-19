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

        <!-- Seletor de Modo -->
        <div class="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-gray-800/60 p-1 rounded-xl">
          <button
            type="button"
            @click="raioXStore.setMode('direto')"
            :class="raioXStore.mode === 'direto' ? 'bg-white dark:bg-gray-700 shadow-sm text-amber-600 dark:text-amber-400 font-bold' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium'"
            class="py-2 px-2 text-xs rounded-lg transition-all text-center leading-tight"
          >
            Já sei o negócio<br />
            <span class="text-[10px] opacity-75 font-normal">avaliar um ramo</span>
          </button>
          <button
            type="button"
            @click="raioXStore.setMode('descoberta')"
            :class="raioXStore.mode === 'descoberta' ? 'bg-white dark:bg-gray-700 shadow-sm text-amber-600 dark:text-amber-400 font-bold' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium'"
            class="py-2 px-2 text-xs rounded-lg transition-all text-center leading-tight"
          >
            Descobrir potencial<br />
            <span class="text-[10px] opacity-75 font-normal">qual negócio combina</span>
          </button>
        </div>

        <!-- Seletor de Segmento (Modo Direto) -->
        <div v-if="raioXStore.mode === 'direto'" class="space-y-1">
          <label class="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Segmento Comercial</label>
          <div class="relative">
            <select
              v-model="raioXStore.selectedSegment"
              @change="raioXStore.executarAnalise"
              :disabled="raioXStore.loadingSegmentos"
              class="w-full text-xs py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            >
              <option v-for="s in raioXStore.segmentos" :key="s.codigo" :value="s.codigo">
                {{ s.nome }}
              </option>
            </select>
            <div v-if="raioXStore.loadingSegmentos" class="absolute right-3 top-2.5">
              <div class="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>

        <!-- Busca de Endereço -->
        <div class="space-y-1 relative">
          <label class="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Endereço de Consulta</label>
          <div class="relative">
            <input
              type="text"
              v-model="searchQuery"
              @input="onSearchInput"
              placeholder="Ex.: Rua XV de Novembro, Curitiba"
              class="w-full text-xs py-2 pl-8 pr-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-2.5 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div class="text-[11px] text-gray-400 flex items-center justify-between">
            <span>ou clique diretamente no mapa</span>
            <span v-if="raioXStore.selectedPoint" class="text-amber-600 dark:text-amber-400 font-semibold">
              ({{ raioXStore.selectedPoint[0].toFixed(4) }}, {{ raioXStore.selectedPoint[1].toFixed(4) }})
            </span>
          </div>

          <!-- Sugestões de Endereço -->
          <ul
            v-if="sugestoes.length > 0"
            class="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto z-20 divide-y divide-gray-100 dark:divide-gray-700"
          >
            <li
              v-for="(sug, i) in sugestoes"
              :key="i"
              @click="selecionarSugestao(sug)"
              class="p-2 text-xs hover:bg-amber-50 dark:hover:bg-gray-700/60 cursor-pointer transition-colors"
            >
              {{ sug.display_name }}
            </li>
          </ul>
        </div>

        <!-- Alerta de Erro -->
        <div v-if="raioXStore.errorMessage" class="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 border border-red-200 dark:border-red-900/50">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <span>{{ raioXStore.errorMessage }}</span>
        </div>

        <!-- Indicador de Carregamento -->
        <div v-if="raioXStore.isLoading" class="py-6 flex flex-col items-center justify-center gap-2 text-gray-500">
          <div class="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span class="text-xs font-medium">
            {{ raioXStore.mode === 'descoberta' ? 'Analisando todos os ramos no ponto…' : 'Calculando isócronas e contagens…' }}
          </span>
        </div>

        <!-- RESULTADOS DO MODO DIRETO -->
        <div v-else-if="raioXStore.mode === 'direto' && raioXStore.raioXData" class="space-y-3.5 pt-1">
          <!-- Bloco Local & Zoneamento -->
          <div class="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
            <div class="text-xs font-bold text-gray-900 dark:text-gray-100">
              {{ formatarTitulo(raioXStore.raioXData.municipio.nome) }} · {{ raioXStore.raioXData.segmento.nome }}
            </div>
            <div class="text-xs mt-1 flex items-center gap-1.5 flex-wrap">
              <span v-if="raioXStore.raioXData.zona" class="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold text-[10px]">
                {{ raioXStore.raioXData.zona.sigla }}
              </span>
              <span v-if="raioXStore.raioXData.zona" class="text-gray-600 dark:text-gray-300 text-[11px]">
                {{ formatarTitulo(raioXStore.raioXData.zona.nome) }}
              </span>
              <span v-else class="text-gray-400 text-[11px]">Zoneamento disponível apenas para Curitiba</span>
            </div>
            <div v-if="raioXStore.raioXData.ponto.dist_via_m > 150" class="text-[10px] text-gray-400 mt-1">
              Ponto a {{ formatarNumero(raioXStore.raioXData.ponto.dist_via_m) }} m da via mais próxima (isócronas partem da via).
            </div>
          </div>

          <!-- Tabela de Demanda e Concorrência -->
          <div class="space-y-1.5">
            <h4 class="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Demanda e Concorrência a pé</h4>
            <div class="overflow-hidden border border-gray-100 dark:border-gray-800 rounded-xl text-xs">
              <table class="w-full text-right divide-y divide-gray-100 dark:divide-gray-800">
                <thead class="bg-gray-50 dark:bg-gray-800/60 text-gray-400 text-[10px] uppercase font-bold">
                  <tr>
                    <th class="py-1.5 px-2 text-left">Tempo</th>
                    <th class="py-1.5 px-2">Domicílios</th>
                    <th class="py-1.5 px-2">Concorrentes</th>
                    <th class="py-1.5 px-2">Dom./conc.</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                  <tr v-for="f in raioXStore.raioXData.faixas" :key="f.minutos" class="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td class="py-1.5 px-2 text-left font-medium flex items-center gap-1.5">
                      <span class="w-2.5 h-2.5 rounded-sm shrink-0" :style="{ backgroundColor: getIsoColor(f.minutos) }"></span>
                      {{ f.minutos }} min
                    </td>
                    <td class="py-1.5 px-2">{{ formatarNumero(f.domicilios) }}</td>
                    <td class="py-1.5 px-2">{{ formatarNumero(f.concorrentes) }}</td>
                    <td class="py-1.5 px-2 font-semibold">{{ formatarNumero(f.dom_por_concorrente) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Card Destaque Comparativo -->
            <div class="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs">
              <span v-html="textoComparativo"></span>
            </div>
            <div v-if="textoSecundario" class="text-[10px] text-gray-400 px-1">
              {{ textoSecundario }}
            </div>
          </div>

          <!-- Bloco Dinamismo -->
          <div class="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-xs">
            <h4 class="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Dinamismo do Ponto</h4>
            <div>
              <b>{{ formatarNumero(faixa10?.abertos_12m) }}</b> negócios de todos os ramos abriram nos últimos 12 meses a até 10 min a pé.
            </div>
          </div>

          <!-- Concorrentes mais próximos -->
          <div class="space-y-1.5">
            <h4 class="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Concorrentes Mais Próximos</h4>
            <ul v-if="concorrentesList.length > 0" class="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-100 dark:border-gray-800 rounded-xl max-h-44 overflow-y-auto text-xs">
              <li
                v-for="(c, i) in concorrentesList"
                :key="i"
                @click="focarConcorrente(c)"
                class="p-2 flex items-center justify-between hover:bg-amber-50 dark:hover:bg-amber-950/30 cursor-pointer transition-colors group"
              >
                <div class="font-medium group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate max-w-[240px]">
                  {{ formatarNomeConcorrente(c.properties) }}
                </div>
                <div class="text-[11px] text-gray-400 tabular-nums shrink-0">
                  {{ formatarNumero(c.properties.dist_m) }} m
                </div>
              </li>
            </ul>
            <div v-else class="text-xs text-gray-400 p-2">
              Nenhum concorrente localizado a até 15 min a pé.
            </div>
          </div>

          <!-- Nota Metodológica -->
          <div class="text-[10px] text-gray-400 leading-normal border-t border-gray-100 dark:border-gray-800 pt-2">
            Análise preliminar. Domicílios: CNEFE/IBGE (Censo 2022). Empresas: CNPJs ativos da Receita (09/2026). Isócronas a pé (4,8 km/h). Zoneamento: IPPUC, Lei 15.511/2019. Confirme o uso na Consulta Amarela da prefeitura.
          </div>
        </div>

        <!-- RESULTADOS DO MODO DESCOBERTA -->
        <div v-else-if="raioXStore.mode === 'descoberta' && raioXStore.descobertaData" class="space-y-3.5 pt-1">
          <!-- Bloco Local & Resumo -->
          <div class="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
            <div class="text-xs font-bold text-gray-900 dark:text-gray-100">
              {{ formatarTitulo(raioXStore.descobertaData.municipio.nome) }} · Potencial do Ponto
            </div>
            <div class="text-xs mt-1 flex items-center gap-1.5 flex-wrap">
              <span v-if="raioXStore.descobertaData.zona" class="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold text-[10px]">
                {{ raioXStore.descobertaData.zona.sigla }}
              </span>
              <span v-if="raioXStore.descobertaData.zona" class="text-gray-600 dark:text-gray-300 text-[11px]">
                {{ formatarTitulo(raioXStore.descobertaData.zona.nome) }}
              </span>
            </div>
            <div class="text-[11px] text-gray-500 dark:text-gray-400 mt-2">
              <b>{{ formatarNumero(raioXStore.descobertaData.domicilios_10min) }}</b> domicílios a até 10 min a pé · <b>{{ formatarNumero(raioXStore.descobertaData.abertos_12m) }}</b> negócios abertos na região em 12 meses.
            </div>
          </div>

          <!-- Ranking de Oportunidades -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <h4 class="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Ramos com Maior Potencial</h4>
              <span class="text-[10px] text-gray-400">Clique para detalhar</span>
            </div>

            <ul class="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-100 dark:border-gray-800 rounded-xl max-h-72 overflow-y-auto text-xs">
              <li
                v-for="(item, idx) in raioXStore.descobertaData.ranking"
                :key="item.codigo"
                @click="raioXStore.escolherSegmentoDoRanking(item.codigo)"
                class="p-2.5 hover:bg-amber-50 dark:hover:bg-amber-950/30 cursor-pointer transition-colors group"
              >
                <div class="flex items-baseline justify-between gap-2">
                  <span class="font-bold text-gray-900 dark:text-gray-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate">
                    {{ idx + 1 }}. {{ item.nome }}
                  </span>
                  <span class="text-[11px] font-bold tabular-nums shrink-0" :class="getClasseText(item.classe)">
                    {{ item.classe === 'sem_concorrente' ? 'sem concorrente' : `índice ${formatarDecimal(item.indice)}` }}
                  </span>
                </div>

                <div class="text-[10px] text-gray-400 mt-0.5">
                  <span :class="getClasseText(item.classe)" class="font-semibold">{{ item.rotulo }}</span> ·
                  <template v-if="item.concorrentes_10min">
                    {{ formatarNumero(item.concorrentes_10min) }} conc. a 10 min · {{ formatarNumero(item.dom_por_concorrente) }} dom./conc. (cidade: {{ formatarNumero(item.media_municipio) }})
                  </template>
                  <template v-else>
                    Nenhum a até 10 min{{ item.atuam_secundario ? ` · ${formatarNumero(item.atuam_secundario)} como secundário` : '' }}
                  </template>
                </div>

                <!-- Barra de Progresso Visual -->
                <div class="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-1.5 overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all"
                    :class="getClasseBar(item.classe)"
                    :style="{ width: `${calcularLarguraBarra(item)}%` }"
                  ></div>
                </div>
              </li>
            </ul>
          </div>

          <!-- Nota Metodológica -->
          <div class="text-[10px] text-gray-400 leading-normal border-t border-gray-100 dark:border-gray-800 pt-2">
            Índice = domicílios por concorrente a até 10 min a pé ÷ média da cidade. Acima de 1,0 indica demanda superior à média municipal.
          </div>
        </div>

        <!-- Estado Inicial quando não há ponto selecionado -->
        <div v-else class="py-8 text-center text-gray-400 text-xs flex flex-col items-center justify-center gap-2">
          <div class="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span>Clique no mapa ou digite um endereço acima para iniciar a análise</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRaioXStore } from '../../stores/raioX'
import { useRouteStore } from '../../stores/route'
import { useNdviClimateStore } from '../../stores/ndviClimate'
import { useSentinelRgbStore } from '../../stores/sentinelRgb'
import { useEudrComplianceStore } from '../../stores/eudrCompliance'
import { geocodingService } from '../../services/geocodingService'
import type { NominatimResult } from '../../types/geocoding'
import type { DescobertaRankingItem } from '../../types/raioX'

const raioXStore = useRaioXStore()
const routeStore = useRouteStore()
const ndviClimateStore = useNdviClimateStore()
const sentinelRgbStore = useSentinelRgbStore()
const eudrStore = useEudrComplianceStore()

const searchQuery = ref('')
const sugestoes = ref<NominatimResult[]>([])
let searchTimeout: any = null

function formatarNumero(n?: number | null) {
  if (n === null || n === undefined) return '–'
  return Number(n).toLocaleString('pt-BR')
}

function formatarDecimal(n?: number | null) {
  if (n === null || n === undefined) return '–'
  return Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatarTitulo(s?: string) {
  if (!s) return ''
  return s.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase())
}

function formatarNomeConcorrente(p: any) {
  if (p.mei && p.nome === 'MEI') return 'MEI (nome protegido)'
  return formatarTitulo(p.nome)
}

function getIsoColor(minutos: number) {
  if (minutos === 5) return '#0b5c7e'
  if (minutos === 10) return '#3f8fb3'
  return '#9cc9dd'
}

const faixa10 = computed(() => {
  return raioXStore.raioXData?.faixas.find((f) => f.minutos === 10)
})

const textoComparativo = computed(() => {
  const f10 = faixa10.value
  const r = raioXStore.raioXData
  if (!f10 || !r) return ''

  const media = r.municipio.dom_por_concorrente
  if (!f10.concorrentes) {
    return `<b>Nenhum concorrente</b> a até 10 min a pé, para <b>${formatarNumero(f10.domicilios)}</b> domicílios.`
  }
  if (media) {
    const dif = Math.round((f10.dom_por_concorrente! / media - 1) * 100)
    const txt =
      dif >= 0
        ? `<span class="text-emerald-600 dark:text-emerald-400 font-bold">${dif}% mais domicílios por concorrente</span> que a média`
        : `<span class="text-orange-600 dark:text-orange-400 font-bold">${Math.abs(dif)}% menos domicílios por concorrente</span> que a média`
    return `A até 10 min: <b>${formatarNumero(f10.dom_por_concorrente)}</b> dom./conc. ${txt} de ${formatarTitulo(r.municipio.nome)} (${formatarNumero(media)}).`
  }
  return `A até 10 min: <b>${formatarNumero(f10.dom_por_concorrente)}</b> domicílios por concorrente.`
})

const textoSecundario = computed(() => {
  const f10 = faixa10.value
  if (!f10?.atuam_secundario) return ''
  return `+ ${formatarNumero(f10.atuam_secundario)} empresa(s) a até 10 min têm esse ramo como atividade secundária.`
})

const concorrentesList = computed(() => {
  return raioXStore.raioXData?.concorrentes?.features?.slice(0, 10) || []
})

function focarConcorrente(feat: any) {
  const coords = feat.geometry.coordinates as [number, number]
  raioXStore.focarConcorrente(coords, feat.properties)
}

function getClasseText(classe: string) {
  switch (classe) {
    case 'oportunidade':
    case 'sem_concorrente':
      return 'text-emerald-600 dark:text-emerald-400'
    case 'media':
      return 'text-amber-600 dark:text-amber-400'
    default:
      return 'text-orange-600 dark:text-orange-400'
  }
}

function getClasseBar(classe: string) {
  switch (classe) {
    case 'oportunidade':
    case 'sem_concorrente':
      return 'bg-emerald-500'
    case 'media':
      return 'bg-amber-500'
    default:
      return 'bg-orange-500'
  }
}

function calcularLarguraBarra(item: DescobertaRankingItem) {
  if (item.classe === 'sem_concorrente') return 100
  const maxIdx = Math.max(
    1.5,
    ...(raioXStore.descobertaData?.ranking.map((s) => s.indice || 0) || [1.5])
  )
  return Math.min(100, Math.round(((item.indice || 0) / maxIdx) * 100))
}

function onSearchInput() {
  clearTimeout(searchTimeout)
  const q = searchQuery.value.trim()
  if (q.length < 4) {
    sugestoes.value = []
    return
  }
  searchTimeout = setTimeout(async () => {
    try {
      const results = await geocodingService.search(q)
      sugestoes.value = results
    } catch {
      sugestoes.value = []
    }
  }, 400)
}

function selecionarSugestao(sug: NominatimResult) {
  searchQuery.value = sug.display_name
  sugestoes.value = []
  const lon = parseFloat(sug.lon)
  const lat = parseFloat(sug.lat)
  raioXStore.setPoint([lon, lat])
}
</script>
