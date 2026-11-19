<template>
  <div
    class="absolute z-10 flex flex-col items-end gap-3 transition-all duration-300 pointer-events-none"
    :class="eudrStore.isActive ? 'bottom-6 right-14' : 'bottom-[206px] right-14'"
  >
    <!-- Botão de Ativação Flutuante (quando os painéis analíticos estiverem inativos) -->
    <button
      v-if="!eudrStore.isActive && !ndviClimateStore.isActive && !routeStore.isActive && !sentinelRgbStore.isActive && !raioXStore.isActive"
      @click="eudrStore.toggleActive"
      class="pointer-events-auto bg-white dark:bg-gray-900 shadow-xl rounded-full px-5 py-3 flex items-center gap-3 hover:scale-105 transition-all border border-gray-100 dark:border-gray-800 group"
      title="Passaporte Digital & Due Diligence EUDR (Regulamento UE 2023/1115)"
    >
      <div class="p-2 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-full text-white group-hover:rotate-12 transition-transform shadow-sm">
        <!-- Ícone Estilizado de Certificação Global / Folha e Escudo -->
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
        </svg>
      </div>
      <span class="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight">Compliance EUDR</span>
    </button>

    <!-- Painel Lateral de Análise EUDR Ativo -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-y-4 opacity-0 scale-95"
      enter-to-class="transform translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100 scale-100"
      leave-to-class="transform translate-y-4 opacity-0 scale-95"
    >
      <div
        v-if="eudrStore.isActive"
        class="pointer-events-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-6 py-5 shadow-2xl rounded-2xl border border-white/20 dark:border-gray-800/80 w-[420px] max-h-[88vh] overflow-y-auto flex flex-col gap-4 text-gray-800 dark:text-gray-100"
      >
        <!-- Cabeçalho do Painel -->
        <div class="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div class="flex items-center gap-2.5">
            <div class="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white">Compliance EUDR</h3>
                <span class="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <span>{{ eudrStore.compliance?.commodityIcon || '🌍' }}</span>
                  <span>{{ eudrStore.compliance?.commodityLabel || 'Multi-Commodity' }}</span>
                </span>
              </div>
              <p class="text-[10px] text-gray-400 font-medium leading-none mt-0.5">Passaporte Digital de Origem & Marco 31/12/2020</p>
            </div>
          </div>
          <button
            @click="eudrStore.toggleActive"
            class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-red-500"
            title="Fechar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Seção de Ação: Desenho da ROI -->
        <div v-if="!eudrStore.roi" class="space-y-3">
          <div class="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300 space-y-2">
            <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Auditoria EUDR das 7 Commodities</span>
            </div>
            <p class="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
              O sistema audita o polígono para <strong>Gado, Soja, Madeira, Café, Cacau, Palma e Borracha</strong>, cruzando MapBiomas (Coleção 9), série temporal NDVI Sentinel-2 na seca e precipitação anual para comprovar o marco de <strong>31/12/2020</strong>.
            </p>
          </div>

          <button
            v-if="!eudrStore.isDrawing"
            @click="eudrStore.startDrawing"
            class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Desenhar Polígono do Talhão
          </button>

          <div
            v-else
            class="py-3 px-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center justify-between animate-pulse"
          >
            <span class="font-medium">Clique no mapa para delimitar o talhão...</span>
            <button
              @click="eudrStore.stopDrawing"
              class="text-[10px] uppercase font-bold bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-sm text-red-500 hover:bg-red-50"
            >
              Cancelar
            </button>
          </div>
        </div>

        <!-- Estado de Carregamento -->
        <div
          v-if="eudrStore.isLoading"
          class="flex flex-col items-center gap-3 py-10 justify-center bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800"
        >
          <div class="relative w-10 h-10">
            <div class="absolute inset-0 rounded-full border-2 border-emerald-200 dark:border-emerald-900"></div>
            <div class="absolute inset-0 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin"></div>
          </div>
          <div class="text-center space-y-1">
            <span class="text-xs font-bold text-gray-700 dark:text-gray-200">Processando Auditoria EUDR</span>
            <p class="text-[10px] text-gray-400">Consultando MapBiomas, Sentinel-2 e registros climáticos no Earth Engine...</p>
          </div>
        </div>

        <!-- Mensagem de Erro -->
        <div v-else-if="eudrStore.errorMessage" class="py-2">
          <div class="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl space-y-2">
            <div class="flex items-center gap-2 text-red-700 dark:text-red-400 text-xs font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Erro no Processamento</span>
            </div>
            <p class="text-[11px] text-red-600 dark:text-red-300">{{ eudrStore.errorMessage }}</p>
            <button
              @click="eudrStore.fetchData"
              class="text-[10px] font-bold text-red-700 dark:text-red-400 underline hover:no-underline"
            >
              Tentar novamente
            </button>
          </div>
        </div>

        <!-- Conteúdo Completo do Relatório EUDR -->
        <div v-else-if="eudrStore.reportResult" class="space-y-4 animate-fade-in">
          <!-- Ações Rápidas (Redesenhar / Limpar) -->
          <div class="flex items-center justify-between text-[11px] text-gray-400 pb-1">
            <span class="font-mono text-[10px]">ID: {{ eudrStore.reportResult.passportId.slice(0, 24) }}...</span>
            <div class="flex items-center gap-2">
              <button
                @click="eudrStore.startDrawing"
                class="hover:text-emerald-600 dark:hover:text-emerald-400 font-bold transition-colors"
              >
                Redesenhar
              </button>
              <span>•</span>
              <button
                @click="eudrStore.clearAnalysis"
                class="hover:text-red-500 font-bold transition-colors"
              >
                Limpar
              </button>
            </div>
          </div>

          <!-- Seletor de Commodity EUDR (Auto ou Específica) -->
          <div class="bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-2xl border border-gray-100 dark:border-gray-800/60 space-y-1.5">
            <div class="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
              <span class="font-bold uppercase tracking-wider flex items-center gap-1">
                <span>Commodity Regulamentada</span>
              </span>
              <span v-if="eudrStore.selectedCommodity === 'auto'" class="text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-0.5">
                <span>Detectado:</span>
                <span>{{ eudrStore.compliance?.commodityLabel }}</span>
              </span>
            </div>
            <div class="flex gap-1 overflow-x-auto pb-0.5 no-scrollbar">
              <button
                v-for="comm in Object.values(eudrStore.EUDR_COMMODITIES)"
                :key="comm.id"
                @click="eudrStore.setCommodity(comm.id)"
                class="px-2.5 py-1 text-[9.5px] font-extrabold rounded-lg whitespace-nowrap transition-all border flex items-center gap-1"
                :class="
                  eudrStore.selectedCommodity === comm.id
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-emerald-400'
                "
              >
                <span>{{ comm.icon }}</span>
                <span>{{ comm.shortName }}</span>
              </button>
            </div>
          </div>

          <!-- Cards de Métricas Principais: Área Total e Área Produtiva Auditada -->
          <div class="grid grid-cols-2 gap-2">
            <div class="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
              <span class="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Área do Talhão</span>
              <div class="flex items-baseline gap-1 mt-0.5">
                <span class="text-base font-black text-gray-800 dark:text-white">{{ eudrStore.reportResult.totalAreaHa }}</span>
                <span class="text-[10px] text-gray-400 font-bold">ha</span>
              </div>
              <span class="text-[9px] text-gray-400 block mt-0.5">Polígono georreferenciado</span>
            </div>

            <div class="bg-emerald-50/60 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
              <div class="flex items-center justify-between">
                <span class="text-[9px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center gap-1">
                  <span>{{ eudrStore.compliance?.commodityIcon }}</span>
                  <span class="truncate max-w-[85px]">{{ eudrStore.compliance?.commodityLabel || 'Área Produtiva' }}</span>
                </span>
                <span
                  v-if="eudrStore.mapbiomas?.commodityAreaHa"
                  class="text-[8px] bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 px-1 rounded font-extrabold"
                >
                  MapBiomas
                </span>
              </div>
              <div class="flex items-baseline gap-1 mt-0.5">
                <span class="text-base font-black text-emerald-600 dark:text-emerald-400">{{ eudrStore.reportResult.netPlantedAreaHa }}</span>
                <span class="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 font-bold">ha</span>
              </div>
              <span class="text-[9px] text-emerald-600/70 dark:text-emerald-400/70 block mt-0.5">
                {{ eudrStore.mapbiomas?.commoditySharePercent ? `${eudrStore.mapbiomas.commoditySharePercent}% do talhão auditado` : 'Área produtiva líquida' }}
              </span>
            </div>
          </div>

          <!-- Selo de Compliance EUDR -->
          <div
            v-if="eudrStore.compliance"
            class="p-3.5 rounded-2xl border transition-all"
            :class="{
              'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-100':
                eudrStore.compliance.status === 'COMPLIANT',
              'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/80 text-amber-950 dark:text-amber-100':
                eudrStore.compliance.status === 'WARNING',
              'bg-red-50/80 dark:bg-red-950/30 border-red-200 dark:border-red-800/80 text-red-950 dark:text-red-100':
                eudrStore.compliance.status === 'NON_COMPLIANT',
            }"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span
                  class="p-1 rounded-full text-white"
                  :class="{
                    'bg-emerald-600': eudrStore.compliance.status === 'COMPLIANT',
                    'bg-amber-500': eudrStore.compliance.status === 'WARNING',
                    'bg-red-600': eudrStore.compliance.status === 'NON_COMPLIANT',
                  }"
                >
                  <svg v-if="eudrStore.compliance.status === 'COMPLIANT'" xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </span>
                <span class="text-xs font-black uppercase tracking-wider">{{ eudrStore.compliance.title }}</span>
              </div>
              <span class="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-white/70 dark:bg-black/40">
                Score: {{ eudrStore.compliance.confidenceScore }}%
              </span>
            </div>

            <p class="text-[11px] leading-relaxed text-gray-700 dark:text-gray-300 mt-1">
              {{ eudrStore.compliance.justification }}
            </p>

            <!-- Checklist Regulatório -->
            <div class="grid grid-cols-2 gap-1.5 pt-2.5 mt-2.5 border-t border-black/5 dark:border-white/10 text-[10px]">
              <div class="flex items-center gap-1.5">
                <span :class="eudrStore.compliance.hasHistoricContinuity ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'">●</span>
                <span class="text-gray-600 dark:text-gray-400">Uso pré-2020: <strong>{{ eudrStore.compliance.hasHistoricContinuity ? 'Consolidado' : 'Não detectado' }}</strong></span>
              </div>
              <div class="flex items-center gap-1.5">
                <span :class="eudrStore.compliance.hasBaselineForestCover ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'">●</span>
                <span class="text-gray-600 dark:text-gray-400">Marco 2020: <strong>{{ eudrStore.compliance.hasBaselineForestCover ? 'Validado' : 'Em análise' }}</strong></span>
              </div>
              <div v-if="eudrStore.compliance.mapbiomasValidated" class="flex items-center gap-1.5 col-span-2 pt-1 border-t border-black/5 dark:border-white/5">
                <span :class="eudrStore.compliance.mapbiomasDeforestationDetected ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'">●</span>
                <span class="text-gray-600 dark:text-gray-400">
                  MapBiomas:
                  <strong :class="eudrStore.compliance.mapbiomasDeforestationDetected ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-300'">
                    {{ eudrStore.compliance.mapbiomasDeforestationDetected ? 'Supressão detectada pós-2020' : `${eudrStore.compliance.commodityLabel} sem desmatamento pós-2020` }}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          <!-- Curva Histórica de NDVI & Chuva (Gráfico Nativo SVG Interativo) -->
          <div class="space-y-2 bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800/60">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                Curva Histórica & Clima
              </span>
              <div class="flex items-center gap-2 text-[9px] font-bold">
                <span class="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span> NDVI (Seca)
                </span>
                <span class="flex items-center gap-1 text-blue-500 dark:text-blue-400">
                  <span class="w-2 h-2 rounded-sm bg-blue-400/60"></span> Chuva Anual
                </span>
              </div>
            </div>

            <!-- Gráfico SVG Reativo -->
            <div class="relative w-full h-[150px] bg-white dark:bg-gray-900/80 rounded-xl p-2 border border-gray-100 dark:border-gray-800 flex flex-col justify-end">
              <svg class="w-full h-full overflow-visible" :viewBox="`0 0 ${chartWidth} ${chartHeight}`">
                <!-- Linhas Guia Horizontais -->
                <line
                  :x1="paddingX"
                  :y1="getYForNdvi(0.8)"
                  :x2="chartWidth - paddingX"
                  :y2="getYForNdvi(0.8)"
                  stroke="#94a3b8"
                  stroke-dasharray="3,3"
                  stroke-opacity="0.25"
                />
                <line
                  :x1="paddingX"
                  :y1="getYForNdvi(0.4)"
                  :x2="chartWidth - paddingX"
                  :y2="getYForNdvi(0.4)"
                  stroke="#94a3b8"
                  stroke-dasharray="3,3"
                  stroke-opacity="0.25"
                />

                <!-- Linha Vertical do Marco de Corte EUDR (31/12/2020) -->
                <g v-if="baselineIndex >= 0">
                  <line
                    :x1="getXForIndex(baselineIndex)"
                    :y1="10"
                    :x2="getXForIndex(baselineIndex)"
                    :y2="chartHeight - 20"
                    stroke="#f59e0b"
                    stroke-width="1.5"
                    stroke-dasharray="2,2"
                  />
                  <text
                    :x="getXForIndex(baselineIndex)"
                    :y="14"
                    text-anchor="middle"
                    fill="#f59e0b"
                    font-size="8"
                    font-weight="bold"
                  >
                    MARCO EUDR
                  </text>
                </g>

                <!-- Barras de Chuva Acumulada Anual (Fundo) -->
                <g v-for="(p, idx) in chartPoints" :key="'rain-' + p.key">
                  <rect
                    v-if="p.precipitationSumMm != null"
                    :x="getXForIndex(idx) - 7"
                    :y="getYForRain(p.precipitationSumMm)"
                    width="14"
                    :height="(chartHeight - 20) - getYForRain(p.precipitationSumMm)"
                    rx="2"
                    fill="#3b82f6"
                    fill-opacity="0.22"
                    class="transition-all hover:fill-opacity-50"
                  />
                </g>

                <!-- Área sombreada sob a curva de NDVI -->
                <path
                  v-if="svgAreaPath"
                  :d="svgAreaPath"
                  fill="url(#ndviGradient)"
                  opacity="0.4"
                />

                <!-- Linha da Curva de NDVI -->
                <path
                  v-if="svgLinePath"
                  :d="svgLinePath"
                  fill="none"
                  stroke="#059669"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />

                <!-- Pontos Interativos da Curva -->
                <g v-for="(p, idx) in chartPoints" :key="'pt-' + p.key">
                  <circle
                    v-if="p.ndviMean != null"
                    :cx="getXForIndex(idx)"
                    :cy="getYForNdvi(p.ndviMean)"
                    :r="eudrStore.selectedPeriodKey === p.key ? 5.5 : 3.5"
                    :fill="eudrStore.selectedPeriodKey === p.key ? '#10b981' : '#ffffff'"
                    :stroke="eudrStore.selectedPeriodKey === p.key ? '#065f46' : '#059669'"
                    stroke-width="2"
                    class="cursor-pointer transition-all hover:scale-125"
                    @click="eudrStore.selectedPeriodKey = p.key"
                  />
                  <!-- Rótulos do Eixo X -->
                  <text
                    :x="getXForIndex(idx)"
                    :y="chartHeight - 5"
                    text-anchor="middle"
                    fill="#64748b"
                    font-size="8.5"
                    :font-weight="eudrStore.selectedPeriodKey === p.key ? 'bold' : 'normal'"
                    class="cursor-pointer select-none"
                    @click="eudrStore.selectedPeriodKey = p.key"
                  >
                    {{ p.shortLabel }}
                  </text>
                </g>

                <!-- Gradiente para o preenchimento da curva de NDVI -->
                <defs>
                  <linearGradient id="ndviGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#10b981" stop-opacity="0.6" />
                    <stop offset="100%" stop-color="#10b981" stop-opacity="0.0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <!-- Detalhe do Ponto Selecionado no Gráfico -->
            <div
              v-if="eudrStore.activePeriodPoint"
              class="flex items-center justify-between text-[10px] bg-white dark:bg-gray-900/60 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800"
            >
              <div>
                <span class="font-extrabold text-gray-800 dark:text-gray-200">{{ eudrStore.activePeriodPoint.label }}</span>
                <span class="text-gray-400 block text-[9px]">Satélite: {{ eudrStore.activePeriodPoint.satellite }}</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-right">
                  <span class="text-[8px] uppercase font-bold text-gray-400 block">NDVI</span>
                  <span class="font-black text-emerald-600 dark:text-emerald-400 text-xs">
                    {{ eudrStore.activePeriodPoint.ndviMean != null ? eudrStore.activePeriodPoint.ndviMean.toFixed(3) : '-' }}
                  </span>
                </div>
                <div class="text-right border-l border-gray-100 dark:border-gray-800 pl-3">
                  <span class="text-[8px] uppercase font-bold text-gray-400 block">Chuva</span>
                  <span class="font-black text-blue-500 text-xs">
                    {{ eudrStore.activePeriodPoint.precipitationSumMm != null ? `${eudrStore.activePeriodPoint.precipitationSumMm} mm` : '-' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Auditoria de Uso do Solo (MapBiomas Coleção 9) -->
          <div
            v-if="eudrStore.mapbiomas"
            class="space-y-2.5 bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800/60"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Uso do Solo MapBiomas
              </span>
              <!-- Seletor de Ano 2020 vs 2023 -->
              <div class="flex bg-gray-200/70 dark:bg-gray-700/60 p-0.5 rounded-lg text-[9px] font-bold">
                <button
                  @click="eudrStore.selectedMapbiomasYear = 2020"
                  class="px-2 py-0.5 rounded-md transition-all"
                  :class="eudrStore.selectedMapbiomasYear === 2020 ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'"
                >
                  2020 (Marco)
                </button>
                <button
                  @click="eudrStore.selectedMapbiomasYear = 2023"
                  class="px-2 py-0.5 rounded-md transition-all"
                  :class="eudrStore.selectedMapbiomasYear === 2023 ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'"
                >
                  2023 (Atual)
                </button>
              </div>
            </div>

            <!-- Barra Proporcional Colorida com as Cores Oficiais do MapBiomas -->
            <div v-if="mapbiomasYearData?.classes?.length" class="space-y-1.5">
              <div class="h-2.5 w-full rounded-full overflow-hidden flex bg-gray-200 dark:bg-gray-700 shadow-inner">
                <div
                  v-for="cls in mapbiomasYearData.classes"
                  :key="cls.class_id"
                  :style="{ width: `${cls.percentage}%`, backgroundColor: cls.color }"
                  class="h-full transition-all relative cursor-pointer hover:opacity-80"
                  :title="`${cls.class_name}: ${cls.area_ha} ha (${cls.percentage}%)`"
                ></div>
              </div>

              <!-- Lista das classes predominantes -->
              <div class="grid grid-cols-2 gap-1.5 pt-1">
                <div
                  v-for="cls in topMapbiomasClasses"
                  :key="cls.class_id"
                  class="flex items-center justify-between text-[10px] bg-white dark:bg-gray-900/60 px-2.5 py-1 rounded-lg border border-gray-100 dark:border-gray-800"
                >
                  <div class="flex items-center gap-1.5 truncate pr-1">
                    <span class="w-2 h-2 rounded-full shrink-0" :style="{ backgroundColor: cls.color }"></span>
                    <span class="truncate text-gray-700 dark:text-gray-300 font-medium">{{ cls.class_name }}</span>
                  </div>
                  <span class="font-bold text-gray-800 dark:text-gray-200 shrink-0">{{ cls.percentage }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Controle da Imagem no Mapa (Tiles de Satélite NDVI ou MapBiomas) -->
          <div class="space-y-2.5 bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800/60">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">Visualizar no Mapa</span>
              <!-- Toggle Visibilidade -->
              <label class="flex items-center gap-2 cursor-pointer">
                <span class="text-[10px] font-bold text-gray-400">
                  {{ eudrStore.activeLayerMode === 'mapbiomas' ? 'MapBiomas' : 'Satélite' }}
                </span>
                <input type="checkbox" v-model="eudrStore.tileVisible" class="sr-only" />
                <div
                  class="w-8 h-4 bg-gray-300 dark:bg-gray-700 rounded-full transition-colors relative"
                  :class="{ 'bg-emerald-500': eudrStore.tileVisible }"
                >
                  <div
                    class="absolute top-0.5 left-0.5 bg-white w-3 h-3 rounded-full shadow transition-transform"
                    :class="{ 'transform translate-x-4': eudrStore.tileVisible }"
                  ></div>
                </div>
              </label>
            </div>

            <!-- Seletor do Modo de Camada: NDVI vs MapBiomas -->
            <div class="flex bg-gray-200/70 dark:bg-gray-700/60 p-0.5 rounded-lg text-[10px] font-bold">
              <button
                @click="eudrStore.activeLayerMode = 'ndvi'"
                class="flex-1 py-1 rounded-md transition-all text-center"
                :class="
                  eudrStore.activeLayerMode === 'ndvi'
                    ? 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                "
              >
                NDVI Sentinel-2
              </button>
              <button
                v-if="eudrStore.mapbiomas"
                @click="eudrStore.activeLayerMode = 'mapbiomas'"
                class="flex-1 py-1 rounded-md transition-all text-center"
                :class="
                  eudrStore.activeLayerMode === 'mapbiomas'
                    ? 'bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                "
              >
                MapBiomas Solo
              </button>
            </div>

            <!-- Botões Seletor de Períodos NDVI (Modo NDVI) -->
            <div v-if="eudrStore.activeLayerMode === 'ndvi'" class="flex gap-1 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
              <button
                v-for="p in eudrStore.reportResult.periods"
                :key="p.key"
                @click="eudrStore.selectedPeriodKey = p.key"
                class="px-2.5 py-1 text-[10px] font-extrabold rounded-lg whitespace-nowrap transition-all border"
                :class="
                  eudrStore.selectedPeriodKey === p.key
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-emerald-400'
                "
              >
                {{ p.shortLabel }}
              </button>
            </div>

            <!-- Botões Seletor de Ano MapBiomas (Modo MapBiomas) -->
            <div v-else-if="eudrStore.activeLayerMode === 'mapbiomas'" class="flex gap-1.5 pb-1 pt-0.5">
              <button
                @click="eudrStore.selectedMapbiomasYear = 2020"
                class="flex-1 py-1 text-[10px] font-extrabold rounded-lg transition-all border text-center"
                :class="
                  eudrStore.selectedMapbiomasYear === 2020
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-amber-400'
                "
              >
                2020 (Marco Legal)
              </button>
              <button
                @click="eudrStore.selectedMapbiomasYear = 2023"
                class="flex-1 py-1 text-[10px] font-extrabold rounded-lg transition-all border text-center"
                :class="
                  eudrStore.selectedMapbiomasYear === 2023
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-amber-400'
                "
              >
                2023 (Monitoramento)
              </button>
            </div>

            <!-- Controle de Opacidade -->
            <div v-if="eudrStore.tileVisible" class="flex items-center gap-2 pt-1">
              <span class="text-[10px] font-bold text-gray-400">Opacidade:</span>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                v-model.number="eudrStore.tileOpacity"
                class="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                :class="eudrStore.activeLayerMode === 'mapbiomas' ? 'accent-amber-600' : 'accent-emerald-600'"
              />
              <span class="text-[10px] font-mono text-gray-400 w-8 text-right">{{ Math.round(eudrStore.tileOpacity * 100) }}%</span>
            </div>
          </div>

          <!-- Ações de Exportação -->
          <div class="space-y-2 pt-1">
            <button
              @click="isReportModalOpen = true"
              class="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Visualizar & Exportar Relatório (PDF)
            </button>

            <button
              @click="eudrStore.downloadPassportJson"
              class="w-full py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-gray-200 dark:border-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exportar Passaporte Digital (JSON)
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modal do Relatório Oficial EUDR com Croqui -->
    <EudrReportModal
      :is-open="isReportModalOpen"
      @close="isReportModalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEudrComplianceStore } from '../../stores/eudrCompliance'
import { useNdviClimateStore } from '../../stores/ndviClimate'
import { useRouteStore } from '../../stores/route'
import { useSentinelRgbStore } from '../../stores/sentinelRgb'
import { useRaioXStore } from '../../stores/raioX'
import EudrReportModal from './EudrReportModal.vue'

const isReportModalOpen = ref(false)

const eudrStore = useEudrComplianceStore()
const ndviClimateStore = useNdviClimateStore()
const routeStore = useRouteStore()
const sentinelRgbStore = useSentinelRgbStore()
const raioXStore = useRaioXStore()

// Dimensões do Gráfico SVG
const chartWidth = 360
const chartHeight = 120
const paddingX = 24

const chartPoints = computed(() => {
  return eudrStore.reportResult?.periods || []
})

const baselineIndex = computed(() => {
  return chartPoints.value.findIndex((p) => p.type === 'baseline')
})

function getXForIndex(idx: number): number {
  const total = chartPoints.value.length
  if (total <= 1) return chartWidth / 2
  const availableWidth = chartWidth - paddingX * 2
  return paddingX + (idx / (total - 1)) * availableWidth
}

// Mapeia o NDVI (-0.1 a 1.0) para coordenada Y
function getYForNdvi(val: number): number {
  const minNdvi = 0.0
  const maxNdvi = 0.95
  const clamped = Math.max(minNdvi, Math.min(maxNdvi, val))
  const ratio = (clamped - minNdvi) / (maxNdvi - minNdvi)
  const bottomY = chartHeight - 20
  const topY = 20
  return bottomY - ratio * (bottomY - topY)
}

// Mapeia chuva (0 a max) para altura das barras
function getYForRain(rainMm: number): number {
  const maxRain = Math.max(
    2000,
    ...chartPoints.value.map((p) => p.precipitationSumMm || 0)
  )
  const ratio = Math.min(1, Math.max(0, rainMm / maxRain))
  const bottomY = chartHeight - 20
  const topY = 30
  return bottomY - ratio * (bottomY - topY)
}

// Caminho SVG da linha contínua de NDVI
const svgLinePath = computed(() => {
  const points = chartPoints.value
  let path = ''
  points.forEach((p, idx) => {
    if (p.ndviMean != null) {
      const x = getXForIndex(idx)
      const y = getYForNdvi(p.ndviMean)
      if (!path) {
        path += `M ${x} ${y}`
      } else {
        path += ` L ${x} ${y}`
      }
    }
  })
  return path
})

// Caminho SVG da área sombreada sob a curva de NDVI
const svgAreaPath = computed(() => {
  const points = chartPoints.value
  if (!points.length || !svgLinePath.value) return ''
  const firstX = getXForIndex(0)
  const lastX = getXForIndex(points.length - 1)
  const bottomY = chartHeight - 20
  return `${svgLinePath.value} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`
})

// Dados do MapBiomas para o ano selecionado (2020 ou 2023)
const mapbiomasYearData = computed(() => {
  if (!eudrStore.mapbiomas) return null
  if (eudrStore.selectedMapbiomasYear === 2020) {
    return eudrStore.mapbiomas.baselineData
  }
  return eudrStore.mapbiomas.recentData
})

const topMapbiomasClasses = computed(() => {
  if (!mapbiomasYearData.value?.classes) return []
  return [...mapbiomasYearData.value.classes]
    .sort((a, b) => b.area_ha - a.area_ha)
    .slice(0, 6)
})
</script>

<style scoped>
/* Oculta barra de rolagem horizontal em navegadores modernos */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
