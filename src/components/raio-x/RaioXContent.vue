<template>
  <div class="flex flex-col gap-3.5 text-gray-800 dark:text-gray-200">
    <!-- Seletor de Modo -->
    <div class="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-gray-800/60 p-1 rounded-xl">
      <button
        type="button"
        @click="store.setMode('direto')"
        :class="store.mode === 'direto' ? 'bg-white dark:bg-gray-700 shadow-sm text-amber-600 dark:text-amber-400 font-bold' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium'"
        class="py-2 px-2 text-xs rounded-lg transition-all text-center leading-tight cursor-pointer"
      >
        Já sei o negócio<br />
        <span class="text-[10px] opacity-75 font-normal">avaliar um ramo</span>
      </button>
      <button
        type="button"
        @click="store.setMode('descoberta')"
        :class="store.mode === 'descoberta' ? 'bg-white dark:bg-gray-700 shadow-sm text-amber-600 dark:text-amber-400 font-bold' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium'"
        class="py-2 px-2 text-xs rounded-lg transition-all text-center leading-tight cursor-pointer"
      >
        Descobrir potencial<br />
        <span class="text-[10px] opacity-75 font-normal">qual negócio combina</span>
      </button>
    </div>

    <!-- Seletor de Segmento (Modo Direto) -->
    <div v-if="store.mode === 'direto'" class="space-y-1">
      <label class="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Segmento Comercial</label>
      <div class="relative">
        <select
          v-model="store.selectedSegment"
          @change="store.executarAnalise"
          :disabled="store.loadingSegmentos"
          class="w-full text-xs py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-gray-800 dark:text-gray-200 cursor-pointer"
        >
          <option v-for="s in store.segmentos" :key="s.codigo" :value="s.codigo">
            {{ s.nome }}
          </option>
        </select>
        <div v-if="store.loadingSegmentos" class="absolute right-3 top-2.5">
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
          class="w-full text-xs py-2 pl-8 pr-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-gray-800 dark:text-gray-200"
        />
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-2.5 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <div class="text-[11px] text-gray-400 flex items-center justify-between">
        <span>ou clique diretamente no mapa</span>
        <span v-if="store.selectedPoint" class="text-amber-600 dark:text-amber-400 font-semibold tabular-nums">
          ({{ store.selectedPoint[0].toFixed(4) }}, {{ store.selectedPoint[1].toFixed(4) }})
        </span>
      </div>

      <!-- Sugestões de Endereço -->
      <ul
        v-if="sugestoes.length > 0"
        class="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-48 overflow-y-auto z-30 divide-y divide-gray-100 dark:divide-gray-700"
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
    <div v-if="store.errorMessage" class="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 border border-red-200 dark:border-red-900/50">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      <span>{{ store.errorMessage }}</span>
    </div>

    <!-- Indicador de Carregamento -->
    <div v-if="store.isLoading" class="py-6 flex flex-col items-center justify-center gap-2 text-gray-500">
      <div class="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      <span class="text-xs font-medium">
        {{ store.mode === 'descoberta' ? 'Analisando todos os ramos no ponto…' : 'Calculando isócronas e contagens…' }}
      </span>
    </div>

    <!-- RESULTADOS DO MODO DIRETO -->
    <div v-else-if="store.mode === 'direto' && store.raioXData" class="space-y-3.5 pt-1">
      <!-- Bloco Local & Zoneamento -->
      <div class="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
        <div class="text-xs font-bold text-gray-900 dark:text-gray-100">
          {{ formatarTitulo(store.raioXData.municipio.nome) }} · {{ store.raioXData.segmento.nome }}
        </div>
        <div class="text-xs mt-1 flex items-center gap-1.5 flex-wrap">
          <span v-if="store.raioXData.zona" class="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold text-[10px]">
            {{ store.raioXData.zona.sigla }}
          </span>
          <span v-if="store.raioXData.zona" class="text-gray-600 dark:text-gray-300 text-[11px]">
            {{ formatarTitulo(store.raioXData.zona.nome) }}
          </span>
          <span v-else class="text-gray-400 text-[11px]">Zoneamento disponível apenas para Curitiba</span>
        </div>
        <div v-if="store.raioXData.ponto.dist_via_m > 150" class="text-[10px] text-gray-400 mt-1">
          Ponto a {{ formatarNumero(store.raioXData.ponto.dist_via_m) }} m da via mais próxima (isócronas partem da via).
        </div>
      </div>

      <!-- Tabela de Demanda e Concorrência a pé -->
      <div class="space-y-1.5">
        <h4 class="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Demanda e Concorrência a pé</h4>
        <div class="overflow-x-auto border border-gray-100 dark:border-gray-800 rounded-xl text-xs">
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
              <tr v-for="f in store.raioXData.faixas" :key="f.minutos" class="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                <td class="py-1.5 px-2 text-left font-medium flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-sm shrink-0" :style="{ backgroundColor: getIsoColor(f.minutos) }"></span>
                  {{ f.minutos }} min
                </td>
                <td class="py-1.5 px-2 tabular-nums">{{ formatarNumero(f.domicilios) }}</td>
                <td class="py-1.5 px-2 tabular-nums">{{ formatarNumero(f.concorrentes) }}</td>
                <td class="py-1.5 px-2 font-semibold tabular-nums">{{ formatarNumero(f.dom_por_concorrente) }}</td>
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
    <div v-else-if="store.mode === 'descoberta' && store.descobertaData" class="space-y-3.5 pt-1">
      <!-- Bloco Local & Resumo -->
      <div class="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
        <div class="text-xs font-bold text-gray-900 dark:text-gray-100">
          {{ formatarTitulo(store.descobertaData.municipio.nome) }} · Potencial do Ponto
        </div>
        <div class="text-xs mt-1 flex items-center gap-1.5 flex-wrap">
          <span v-if="store.descobertaData.zona" class="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold text-[10px]">
            {{ store.descobertaData.zona.sigla }}
          </span>
          <span v-if="store.descobertaData.zona" class="text-gray-600 dark:text-gray-300 text-[11px]">
            {{ formatarTitulo(store.descobertaData.zona.nome) }}
          </span>
        </div>
        <div class="text-[11px] text-gray-500 dark:text-gray-400 mt-2">
          <b>{{ formatarNumero(store.descobertaData.domicilios_10min) }}</b> domicílios a até 10 min a pé · <b>{{ formatarNumero(store.descobertaData.abertos_12m) }}</b> negócios abertos na região em 12 meses.
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
            v-for="(item, idx) in store.descobertaData.ranking"
            :key="item.codigo"
            @click="store.escolherSegmentoDoRanking(item.codigo)"
            class="p-2.5 hover:bg-amber-50 dark:hover:bg-amber-950/30 cursor-pointer transition-colors group"
          >
            <div class="flex items-baseline justify-between gap-2">
              <span class="font-bold text-gray-900 dark:text-gray-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate">
                {{ Number(idx) + 1 }}. {{ item.nome }}
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

    <!-- Rodapé simples -->
    <div class="text-[11px] text-gray-400 dark:text-gray-500 text-center pt-2 border-t border-gray-100 dark:border-gray-800/80">
      Raio-X do ponto · by SOMAP
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { geocodingService } from '../../services/geocodingService'
import { publicRaioXService } from '../../services/publicRaioXService'
import type { NominatimResult } from '../../types/geocoding'
import type { DescobertaRankingItem } from '../../types/raioX'

const props = defineProps<{
  store: any
  isPublic?: boolean
}>()

const searchQuery = ref('')
const sugestoes = ref<NominatimResult[]>([])
let searchTimeout: any = null

watch(
  () => props.store.selectedPoint,
  async (point) => {
    if (point) {
      const [lon, lat] = point
      try {
        const res = await geocodingService.reverse(lat, lon, 16)
        if (res && res.display_name) {
          searchQuery.value = res.display_name
        } else {
          searchQuery.value = `${lat.toFixed(5)}, ${lon.toFixed(5)}`
        }
      } catch {
        searchQuery.value = `${lat.toFixed(5)}, ${lon.toFixed(5)}`
      }
    } else {
      searchQuery.value = ''
    }
  }
)

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
  return props.store.raioXData?.faixas?.find((f: any) => f.minutos === 10)
})

const textoComparativo = computed(() => {
  const f10 = faixa10.value
  const r = props.store.raioXData
  if (!f10 || !r) return ''

  const media = r.municipio?.dom_por_concorrente
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
  return props.store.raioXData?.concorrentes?.features?.slice(0, 10) || []
})

function focarConcorrente(feat: any) {
  const coords = feat.geometry.coordinates as [number, number]
  props.store.focarConcorrente(coords, feat.properties)
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
    ...(props.store.descobertaData?.ranking?.map((s: any) => s.indice || 0) || [1.5])
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
      if (props.isPublic && props.store.convite) {
        sugestoes.value = await publicRaioXService.geocode(q, props.store.convite)
      } else {
        sugestoes.value = await geocodingService.search(q)
      }
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
  props.store.setPoint([lon, lat])
}
</script>
