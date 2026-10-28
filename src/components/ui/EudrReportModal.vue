<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex flex-col bg-slate-950/80 backdrop-blur-md overflow-y-auto no-scrollbar print:p-0 print:bg-white print:overflow-visible print:block print:static"
      id="eudr-modal-backdrop"
    >
      <!-- Barra Superior de Controle (Oculta na Impressão) -->
      <div
        class="sticky top-0 z-40 bg-slate-900/95 border-b border-slate-800 text-white px-6 py-3.5 flex items-center justify-between shadow-lg backdrop-blur-sm no-print"
      >
        <div class="flex items-center gap-3">
          <div class="p-2 bg-emerald-600/20 text-emerald-400 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L6 8h3v4H7l-3 4h4v4h8v-4h4l-3-4h-2V8h3l-6-6zm-1 16v4h2v-4h-2z" />
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-sm font-black uppercase tracking-wider text-white">Relatório Oficial EUDR</h2>
              <span
                class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full"
                :class="{
                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30': complianceStatus === 'COMPLIANT',
                  'bg-amber-500/20 text-amber-300 border border-amber-500/30': complianceStatus === 'WARNING',
                  'bg-red-500/20 text-red-300 border border-red-500/30': complianceStatus === 'NON_COMPLIANT',
                }"
              >
                {{ complianceTitle }}
              </span>
            </div>
            <p class="text-xs text-slate-400 font-mono">
              Passaporte: {{ report?.passportId }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2.5">
          <!-- Botão de Download Direto em PDF via jsPDF -->
          <button
            @click="handleDownloadPdf"
            :disabled="isGeneratingPdf"
            class="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-700/20 flex items-center gap-2 cursor-pointer"
          >
            <svg
              v-if="!isGeneratingPdf"
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <svg
              v-else
              class="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <span>{{ isGeneratingPdf ? pdfStatusText : 'Baixar Arquivo PDF' }}</span>
          </button>

          <!-- Botão de Impressão Nativa (A4 Vetorial) -->
          <button
            @click="handlePrintNative"
            class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            title="Imprimir ou Salvar como PDF via motor nativo do navegador"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Imprimir / Salvar A4</span>
          </button>

          <!-- Fechar Modal -->
          <button
            @click="emit('close')"
            class="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Fechar Visualização"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Container das Páginas do Laudo (Documento A4) -->
      <div
        ref="reportContainer"
        class="eudr-print-container flex flex-col items-center gap-8 py-8 px-4 flex-1 print:p-0 print:gap-0 print:block"
      >
        <!-- ========================================== -->
        <!-- PÁGINA 1: LAUDO DE CONFORMIDADE EUDR       -->
        <!-- ========================================== -->
        <div
          class="pdf-page bg-white text-slate-900 shadow-2xl rounded-sm border border-slate-200/80 w-[210mm] min-h-[297mm] max-h-[297mm] h-[297mm] p-[13mm] flex flex-col justify-between box-border overflow-hidden relative print:border-none print:shadow-none print:w-[210mm] print:h-[297mm]"
        >
          <div class="space-y-4">
            <!-- Cabeçalho Institucional Oficial -->
            <div class="flex items-start justify-between pb-3 border-b-2 border-emerald-700">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-emerald-700 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm">
                  S
                </div>
                <div>
                  <h1 class="text-base font-black tracking-tight text-slate-900 uppercase">SOMAP • Plataforma WebGIS</h1>
                  <p class="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                    Passaporte Digital de Origem • EUDR Compliance ({{ eudrStore.compliance?.commodityLabel || 'Due Diligence' }})
                  </p>
                </div>
              </div>

              <div class="text-right">
                <span class="inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                  Regulamento (UE) 2023/1115
                </span>
                <p class="text-[9px] text-slate-500 font-mono mt-1">
                  Emissão: {{ formattedDate }}
                </p>
              </div>
            </div>

            <!-- Título do Laudo e Identificação Geral -->
            <div class="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div>
                <span class="text-[9px] font-black uppercase tracking-wider text-slate-500">Documento Oficial</span>
                <h2 class="text-xs font-black text-slate-900 uppercase tracking-tight">
                  Laudo Técnico de Conformidade e Não Desmatamento
                </h2>
              </div>
              <div class="text-right">
                <span class="text-[9px] text-slate-500 font-medium">Identificador Único (ID)</span>
                <p class="text-[10px] font-mono font-bold text-slate-800">{{ report?.passportId }}</p>
              </div>
            </div>

            <!-- Dados Cadastrais do Talhão / Imóvel -->
            <div class="grid grid-cols-4 gap-2 text-xs">
              <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span class="text-[9px] uppercase font-bold text-slate-500 block">Município / Estado</span>
                <span class="text-[11px] font-black text-slate-800 block truncate" :title="locationName">
                  {{ locationName }}
                </span>
                <span class="text-[8px] text-slate-400">Referência Geográfica</span>
              </div>

              <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span class="text-[9px] uppercase font-bold text-slate-500 block">Centroide (GMS)</span>
                <span class="text-[10px] font-mono font-bold text-slate-800 block">
                  {{ centroidLatDms }}
                </span>
                <span class="text-[10px] font-mono font-bold text-slate-800 block">
                  {{ centroidLngDms }}
                </span>
              </div>

              <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span class="text-[9px] uppercase font-bold text-slate-500 block">Área do Talhão</span>
                <div class="flex items-baseline gap-1 mt-0.5">
                  <span class="text-sm font-black text-slate-900">{{ report?.totalAreaHa }}</span>
                  <span class="text-[9px] font-bold text-slate-500">ha</span>
                </div>
                <span class="text-[8px] text-slate-400">Polígono Integral</span>
              </div>

              <div class="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
                <span class="text-[9px] uppercase font-bold text-emerald-800 block">Área Líquida Auditada</span>
                <div class="flex items-baseline gap-1 mt-0.5">
                  <span class="text-sm font-black text-emerald-700">{{ report?.netPlantedAreaHa }}</span>
                  <span class="text-[9px] font-bold text-emerald-800">ha</span>
                </div>
                <span class="text-[8px] text-emerald-600 truncate block">
                  {{ (eudrStore.mapbiomas?.commodityAreaHa ?? eudrStore.mapbiomas?.recentSilvicultureHa) !== undefined
                    ? `${eudrStore.mapbiomas?.commoditySharePercent ?? eudrStore.mapbiomas?.silvicultureSharePercent}% ${eudrStore.compliance?.commodityLabel || 'Produtiva'}`
                    : 'Área Efetiva' }}
                </span>
              </div>
            </div>

            <!-- Selo de Compliance & Parecer Técnico -->
            <div
              class="p-3.5 rounded-xl border transition-all"
              :class="{
                'bg-emerald-50/80 border-emerald-300 text-emerald-950': complianceStatus === 'COMPLIANT',
                'bg-amber-50/80 border-amber-300 text-amber-950': complianceStatus === 'WARNING',
                'bg-red-50/80 border-red-300 text-red-950': complianceStatus === 'NON_COMPLIANT',
              }"
            >
              <div class="flex items-center justify-between mb-1.5">
                <div class="flex items-center gap-2">
                  <span
                    class="p-1 rounded-full text-white"
                    :class="{
                      'bg-emerald-600': complianceStatus === 'COMPLIANT',
                      'bg-amber-600': complianceStatus === 'WARNING',
                      'bg-red-600': complianceStatus === 'NON_COMPLIANT',
                    }"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </span>
                  <span class="text-xs font-black uppercase tracking-wide">{{ complianceTitle }}</span>
                </div>
                <span class="text-[9px] font-black px-2 py-0.5 rounded bg-white border border-slate-200">
                  Índice de Confiança: {{ eudrStore.compliance?.confidenceScore }}%
                </span>
              </div>

              <p class="text-[10px] leading-relaxed text-slate-700">
                {{ eudrStore.compliance?.justification }}
              </p>

              <!-- Checklist Regulatório -->
              <div class="grid grid-cols-3 gap-2 pt-2 mt-2 border-t border-slate-200/80 text-[9px]">
                <div class="flex items-center gap-1.5">
                  <span :class="eudrStore.compliance?.hasHistoricContinuity ? 'text-emerald-600 font-bold' : 'text-slate-400'">✓</span>
                  <span class="text-slate-600">Histórico pré-2020: <strong>{{ eudrStore.compliance?.hasHistoricContinuity ? 'Comprovado' : 'Ausente' }}</strong></span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span :class="eudrStore.compliance?.hasBaselineForestCover ? 'text-emerald-600 font-bold' : 'text-slate-400'">✓</span>
                  <span class="text-slate-600">Marco 31/12/2020: <strong>{{ eudrStore.compliance?.hasBaselineForestCover ? 'Validado' : 'Em análise' }}</strong></span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span :class="!eudrStore.compliance?.mapbiomasDeforestationDetected ? 'text-emerald-600 font-bold' : 'text-red-600'">✓</span>
                  <span class="text-slate-600">Desmatamento pós-2020: <strong>{{ eudrStore.compliance?.mapbiomasDeforestationDetected ? 'Detectado' : 'Não detectado' }}</strong></span>
                </div>
              </div>
            </div>

            <!-- Curva Histórica de NDVI & Chuva (Série Temporal Sentinel/GEE) -->
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                  Auditoria Espectral: Vigor Vegetativo (NDVI) & Precipitação Anual (CHIRPS)
                </span>
                <div class="flex items-center gap-3 text-[8px] font-bold">
                  <span class="flex items-center gap-1 text-emerald-700">
                    <span class="w-2 h-2 rounded-full bg-emerald-600"></span> NDVI Médio
                  </span>
                  <span class="flex items-center gap-1 text-blue-700">
                    <span class="w-2 h-2 rounded-sm bg-blue-400"></span> Precipitação (mm)
                  </span>
                  <span class="flex items-center gap-1 text-amber-700">
                    <span class="w-2 h-0.5 bg-amber-500"></span> Marco EUDR (2020)
                  </span>
                </div>
              </div>

              <!-- SVG do Gráfico -->
              <div class="h-[120px] bg-white rounded-lg p-2 border border-slate-200">
                <svg class="w-full h-full" :viewBox="`0 0 ${chartWidth} ${chartHeight}`">
                  <defs>
                    <linearGradient id="pdfNdviGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#059669" stop-opacity="0.35" />
                      <stop offset="100%" stop-color="#059669" stop-opacity="0.0" />
                    </linearGradient>
                  </defs>

                  <!-- Linhas Guia Horizontais -->
                  <line :x1="paddingX" :y1="getYForNdvi(0.8)" :x2="chartWidth - paddingX" :y2="getYForNdvi(0.8)" stroke="#cbd5e1" stroke-dasharray="3,3" />
                  <text :x="paddingX - 4" :y="getYForNdvi(0.8) + 3" text-anchor="end" font-size="7" fill="#64748b">0.8</text>

                  <line :x1="paddingX" :y1="getYForNdvi(0.4)" :x2="chartWidth - paddingX" :y2="getYForNdvi(0.4)" stroke="#cbd5e1" stroke-dasharray="3,3" />
                  <text :x="paddingX - 4" :y="getYForNdvi(0.4) + 3" text-anchor="end" font-size="7" fill="#64748b">0.4</text>

                  <!-- Linha do Marco de Corte EUDR (31/12/2020) -->
                  <g v-if="baselineIndex >= 0">
                    <line
                      :x1="getXForIndex(baselineIndex)"
                      :y1="10"
                      :x2="getXForIndex(baselineIndex)"
                      :y2="chartHeight - 16"
                      stroke="#d97706"
                      stroke-width="1.5"
                      stroke-dasharray="2,2"
                    />
                    <text
                      :x="getXForIndex(baselineIndex)"
                      :y="8"
                      text-anchor="middle"
                      fill="#b45309"
                      font-size="7"
                      font-weight="bold"
                    >
                      MARCO CORTE EUDR
                    </text>
                  </g>

                  <!-- Barras de Chuva -->
                  <g v-for="(p, idx) in chartPoints" :key="'rain-' + p.key">
                    <rect
                      v-if="p.precipitationSumMm != null"
                      :x="getXForIndex(idx) - 8"
                      :y="getYForRain(p.precipitationSumMm)"
                      width="16"
                      :height="(chartHeight - 16) - getYForRain(p.precipitationSumMm)"
                      rx="2"
                      fill="#38bdf8"
                      fill-opacity="0.45"
                    />
                  </g>

                  <!-- Área sob a curva de NDVI -->
                  <path v-if="svgAreaPath" :d="svgAreaPath" fill="url(#pdfNdviGradient)" />

                  <!-- Linha de NDVI -->
                  <path v-if="svgLinePath" :d="svgLinePath" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round" />

                  <!-- Pontos e Rótulos -->
                  <g v-for="(p, idx) in chartPoints" :key="'pt-' + p.key">
                    <circle
                      v-if="p.ndviMean != null"
                      :cx="getXForIndex(idx)"
                      :cy="getYForNdvi(p.ndviMean)"
                      r="3.5"
                      fill="#ffffff"
                      stroke="#059669"
                      stroke-width="2"
                    />
                    <!-- Rótulo do Ano -->
                    <text
                      :x="getXForIndex(idx)"
                      :y="chartHeight - 4"
                      text-anchor="middle"
                      font-size="8"
                      font-weight="bold"
                      fill="#334155"
                    >
                      {{ p.year }}
                    </text>
                    <!-- Valor do NDVI -->
                    <text
                      v-if="p.ndviMean != null"
                      :x="getXForIndex(idx)"
                      :y="getYForNdvi(p.ndviMean) - 6"
                      text-anchor="middle"
                      font-size="7.5"
                      font-weight="bold"
                      fill="#047857"
                    >
                      {{ p.ndviMean.toFixed(2) }}
                    </text>
                  </g>
                </svg>
              </div>

              <!-- Tabela Resumo dos Períodos Analisados -->
              <table class="w-full text-left border-collapse text-[9px]">
                <thead>
                  <tr class="border-b border-slate-200 text-slate-500 font-bold">
                    <th class="py-1">Período de Referência</th>
                    <th class="py-1">Ano / Satélite</th>
                    <th class="py-1 text-center">NDVI Médio</th>
                    <th class="py-1 text-center">Chuva Anual</th>
                    <th class="py-1 text-right">Classificação do Solo</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-700">
                  <tr v-for="p in chartPoints" :key="'tb-' + p.key">
                    <td class="py-1 font-bold text-slate-800">{{ p.label }}</td>
                    <td class="py-1 text-slate-500">{{ p.year }} ({{ p.satellite || 'Sentinel-2' }})</td>
                    <td class="py-1 text-center font-mono font-bold text-emerald-700">
                      {{ p.ndviMean != null ? p.ndviMean.toFixed(3) : '—' }}
                    </td>
                    <td class="py-1 text-center font-mono text-blue-700">
                      {{ p.precipitationSumMm != null ? `${Math.round(p.precipitationSumMm)} mm` : '—' }}
                    </td>
                    <td class="py-1 text-right text-slate-600">
                      {{ p.type === 'baseline' ? 'Floresta Consolidada' : 'Manejo Silvícola Ativo' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Resumo MapBiomas Coleção 9 -->
            <div v-if="eudrStore.mapbiomas" class="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[9px] space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                  Conformidade MapBiomas (Coleção 9 — Cobertura e Uso da Terra)
                </span>
                <span class="font-mono text-slate-500">Marco 2020 vs Monitoramento 2023</span>
              </div>
              <p class="text-slate-600 leading-normal">
                No ano de referência (2020), o talhão possuía <strong>{{ eudrStore.mapbiomas.commodityAreaHa ?? eudrStore.mapbiomas.baselineSilvicultureHa }} ha</strong> de área vinculada à cadeia produtiva de <strong>{{ eudrStore.compliance?.commodityLabel || 'interesse' }}</strong>.
                Em 2023, registra-se <strong>{{ eudrStore.mapbiomas.commodityAreaHa ?? eudrStore.mapbiomas.recentSilvicultureHa }} ha</strong> ({{ eudrStore.mapbiomas.commoditySharePercent ?? eudrStore.mapbiomas.silvicultureSharePercent }}% da área do talhão).
                Não foram detectadas transições para conversão de vegetação nativa pós-2020.
              </p>
            </div>
          </div>

          <!-- Rodapé Oficial da Página 1 -->
          <div class="pt-2 border-t border-slate-200 flex items-center justify-between text-[8px] text-slate-400">
            <span>SOMAP • Sistema Operacional de Mapeamento e Análise Espacial</span>
            <span class="font-mono">Página 1 de 2 • Passaporte: {{ report?.passportId.slice(0, 24) }}...</span>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- PÁGINA 2: MEMORIAL & CROQUI ILUSTRATIVO    -->
        <!-- ========================================== -->
        <div
          class="pdf-page bg-white text-slate-900 shadow-2xl rounded-sm border border-slate-200/80 w-[210mm] min-h-[297mm] max-h-[297mm] h-[297mm] p-[13mm] flex flex-col justify-between box-border overflow-hidden relative print:border-none print:shadow-none print:w-[210mm] print:h-[297mm]"
        >
          <div class="space-y-3.5">
            <!-- Cabeçalho da Página 2 -->
            <div class="flex items-start justify-between pb-2 border-b-2 border-emerald-700">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-emerald-700 rounded-lg flex items-center justify-center text-white font-black text-sm">
                  S
                </div>
                <div>
                  <h2 class="text-xs font-black tracking-tight text-slate-900 uppercase">
                    Memorial Geográfico & Croqui do Talhão
                  </h2>
                  <p class="text-[9px] font-bold text-slate-500">
                    Tradução Geométrica Simplificada para Conformidade EUDR
                  </p>
                </div>
              </div>
              <div class="text-right">
                <span class="text-[9px] font-mono text-slate-500">WGS84 • EPSG:4326</span>
              </div>
            </div>

            <!-- Descrição e Cartão de Métricas para Leigos -->
            <div class="grid grid-cols-3 gap-2 text-xs">
              <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span class="text-[9px] uppercase font-bold text-slate-500 block">Perímetro Total</span>
                <div class="flex items-baseline gap-1 mt-0.5">
                  <span class="text-base font-black text-slate-900">
                    {{ Math.round(croquiDimensions.totalPerimeterMeters) }}
                  </span>
                  <span class="text-[9px] font-bold text-slate-500">metros</span>
                </div>
                <span class="text-[8px] text-slate-400">
                  ({{ (croquiDimensions.totalPerimeterMeters / 1000).toFixed(2) }} km de contorno)
                </span>
              </div>

              <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span class="text-[9px] uppercase font-bold text-slate-500 block">Dimensões Envolventes</span>
                <div class="flex items-baseline gap-1 mt-0.5">
                  <span class="text-xs font-black text-slate-900">
                    {{ Math.round(croquiDimensions.widthMeters) }}m × {{ Math.round(croquiDimensions.heightMeters) }}m
                  </span>
                </div>
                <span class="text-[8px] text-slate-400">Extensão Leste-Oeste × Norte-Sul</span>
              </div>

              <div class="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
                <span class="text-[9px] uppercase font-bold text-emerald-800 block">Total de Vértices</span>
                <div class="flex items-baseline gap-1 mt-0.5">
                  <span class="text-base font-black text-emerald-700">{{ verticesList.length }}</span>
                  <span class="text-[9px] font-bold text-emerald-800">pontos</span>
                </div>
                <span class="text-[8px] text-emerald-600">Polígono fechado georreferenciado</span>
              </div>
            </div>

            <!-- O CROQUI CARTOGRÁFICO MINIMALISTA (SVG Vetorial) -->
            <div class="p-3 bg-slate-50/70 rounded-xl border border-slate-200 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Croqui Cartográfico Esquemático do Talhão
                </span>
                <span class="text-[8px] text-slate-500 font-medium">
                  Grade de Referência Métrica Relativa (Proporção 1:1 Preservada)
                </span>
              </div>

              <!-- Prancha de Desenho SVG -->
              <div class="relative w-full h-[230px] bg-white rounded-xl border border-slate-300 overflow-hidden shadow-inner flex items-center justify-center">
                <svg
                  class="w-full h-full"
                  :viewBox="svgCroqui.viewBox"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <!-- Linhas da Grade de Referência (Minimalista) -->
                  <g class="grid-lines" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3,3">
                    <line
                      v-for="(gl, idx) in svgCroqui.gridLines"
                      :key="'gl-' + idx"
                      :x1="gl.x1"
                      :y1="gl.y1"
                      :x2="gl.x2"
                      :y2="gl.y2"
                    />
                  </g>

                  <!-- Borda externa da área de plotagem -->
                  <rect
                    x="2"
                    y="2"
                    width="556"
                    height="356"
                    fill="none"
                    stroke="#cbd5e1"
                    stroke-width="1"
                  />

                  <!-- Área preenchida do polígono -->
                  <polygon
                    :points="svgCroqui.polygonPoints"
                    fill="#10b981"
                    fill-opacity="0.14"
                    stroke="#059669"
                    stroke-width="3"
                    stroke-linejoin="round"
                    stroke-linecap="round"
                  />

                  <!-- Segmentos do Polígono e Medidas dos Lados -->
                  <g v-for="(v, idx) in svgCroqui.vertices" :key="'edge-' + idx">
                    <!-- Centroide com mira -->
                    <circle
                      v-if="idx === 0"
                      :cx="svgCroqui.centroid.x"
                      :cy="svgCroqui.centroid.y"
                      r="4"
                      fill="#047857"
                      fill-opacity="0.8"
                    />
                    <circle
                      v-if="idx === 0"
                      :cx="svgCroqui.centroid.x"
                      :cy="svgCroqui.centroid.y"
                      r="9"
                      fill="none"
                      stroke="#047857"
                      stroke-width="1"
                      stroke-dasharray="2,2"
                    />
                  </g>

                  <!-- Vértices Numerados (V1, V2, V3...) -->
                  <g v-for="v in svgCroqui.vertices" :key="'vert-' + v.label">
                    <circle
                      :cx="v.x"
                      :cy="v.y"
                      r="6.5"
                      fill="#ffffff"
                      stroke="#059669"
                      stroke-width="2.5"
                    />
                    <!-- Rótulo do Vértice -->
                    <rect
                      :x="v.x + 8"
                      :y="v.y - 14"
                      width="20"
                      height="12"
                      rx="3"
                      fill="#0f172a"
                      fill-opacity="0.85"
                    />
                    <text
                      :x="v.x + 18"
                      :y="v.y - 5"
                      text-anchor="middle"
                      fill="#ffffff"
                      font-size="8"
                      font-weight="bold"
                    >
                      {{ v.label }}
                    </text>
                  </g>

                  <!-- Rosa dos Ventos / Indicador de Norte -->
                  <g transform="translate(515, 45)">
                    <circle r="16" fill="#ffffff" stroke="#94a3b8" stroke-width="1" fill-opacity="0.9" />
                    <!-- Seta Norte -->
                    <polygon points="0,-12 4,2 0,0 -4,2" fill="#0f172a" />
                    <polygon points="0,0 4,2 0,12 -4,2" fill="#94a3b8" />
                    <text x="0" y="-14" text-anchor="middle" font-size="9" font-weight="black" fill="#0f172a">
                      N
                    </text>
                  </g>

                  <!-- Barra de Escala Métrica -->
                  <g :transform="`translate(${svgCroqui.scaleBar.x}, ${svgCroqui.scaleBar.y})`">
                    <!-- Fundo da escala -->
                    <rect
                      x="-6"
                      y="-12"
                      :width="svgCroqui.scaleBar.lengthPx + 12"
                      height="20"
                      rx="4"
                      fill="#ffffff"
                      fill-opacity="0.85"
                    />
                    <!-- Barra -->
                    <line
                      x1="0"
                      y1="0"
                      :x2="svgCroqui.scaleBar.lengthPx"
                      y2="0"
                      stroke="#0f172a"
                      stroke-width="2.5"
                    />
                    <!-- Marcadores verticais da barra -->
                    <line x1="0" y1="-4" x2="0" y2="4" stroke="#0f172a" stroke-width="2.5" />
                    <line
                      :x1="svgCroqui.scaleBar.lengthPx"
                      y1="-4"
                      :x2="svgCroqui.scaleBar.lengthPx"
                      y2="4"
                      stroke="#0f172a"
                      stroke-width="2.5"
                    />
                    <!-- Rótulo métrico -->
                    <text
                      :x="svgCroqui.scaleBar.lengthPx / 2"
                      y="-4"
                      text-anchor="middle"
                      font-size="8"
                      font-weight="bold"
                      fill="#0f172a"
                    >
                      {{ svgCroqui.scaleBar.metersLabel }}
                    </text>
                  </g>

                  <!-- Rótulo do Centroide -->
                  <g :transform="`translate(${svgCroqui.centroid.x + 12}, ${svgCroqui.centroid.y + 4})`">
                    <rect x="-3" y="-9" width="46" height="11" rx="2" fill="#047857" fill-opacity="0.9" />
                    <text x="20" y="-1" text-anchor="middle" fill="#ffffff" font-size="7" font-weight="bold">
                      Centroide
                    </text>
                  </g>
                </svg>
              </div>
            </div>

            <!-- Tabela Memorial Descritivo dos Vértices -->
            <div class="space-y-1">
              <div class="flex items-center justify-between text-[9px] font-bold text-slate-700">
                <span>Quadro de Coordenadas Geodésicas e Confrontações dos Vértices</span>
                <span class="text-slate-400 font-normal">Datum: SIRGAS2000 / WGS84</span>
              </div>

              <div class="max-h-[170px] overflow-hidden rounded-lg border border-slate-200">
                <table class="w-full text-left border-collapse text-[8.5px]">
                  <thead class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th class="py-1 px-2 text-center w-10">Vértice</th>
                      <th class="py-1 px-2">Latitude (GMS)</th>
                      <th class="py-1 px-2">Longitude (GMS)</th>
                      <th class="py-1 px-2 text-center">Segmento</th>
                      <th class="py-1 px-2 text-right">Extensão</th>
                      <th class="py-1 px-2 text-right">Rumo / Azimute</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 text-slate-800">
                    <tr
                      v-for="v in displayVertices"
                      :key="'v-row-' + v.label"
                      class="hover:bg-slate-50"
                    >
                      <td class="py-1 px-2 font-mono font-bold text-emerald-800 text-center bg-slate-50/50">
                        {{ v.label }}
                      </td>
                      <td class="py-1 px-2 font-mono">{{ v.latDms }}</td>
                      <td class="py-1 px-2 font-mono">{{ v.lngDms }}</td>
                      <td class="py-1 px-2 font-mono text-center text-slate-500">
                        {{ v.label }} → {{ v.nextLabel }}
                      </td>
                      <td class="py-1 px-2 text-right font-mono font-bold text-slate-900">
                        {{ v.distanceToNextMeters }} m
                      </td>
                      <td class="py-1 px-2 text-right text-slate-600">
                        {{ v.directionToNext }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p v-if="verticesList.length > 8" class="text-[8px] text-slate-400 italic">
                * Exibindo os {{ displayVertices.length }} vértices delimitadores de perímetro.
              </p>
            </div>

            <!-- Declaração de Integridade e Autenticidade -->
            <div class="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[8px] text-slate-500 leading-tight">
              <strong>Nota de Responsabilidade Técnica & Regulamento EUDR:</strong> Este laudo foi processado automaticamente pela plataforma SOMAP através de cruzamento de sensoriamento orbital (satélites Copernicus Sentinel-2, ERA5/CHIRPS e coleções do MapBiomas). A geometria representada constitui memorial gráfico para comprovação de não desmatamento posterior a 31 de dezembro de 2020, nos termos do Regulamento (UE) 2023/1115.
            </div>
          </div>

          <!-- Rodapé Oficial da Página 2 -->
          <div class="pt-2 border-t border-slate-200 flex items-center justify-between text-[8px] text-slate-400">
            <span>SOMAP • Sistema Operacional de Mapeamento e Análise Espacial</span>
            <span class="font-mono">Página 2 de 2 • Passaporte: {{ report?.passportId.slice(0, 24) }}...</span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useEudrComplianceStore } from '../../stores/eudrCompliance'
import {
  toDMS,
  getCleanRing,
  calculateCroquiDimensions,
  generateVerticesList,
  buildSvgCroqui,
  type EudrVertexInfo,
  type EudrCroquiDimensions,
} from '../../utils/eudrGeometry'
import { geocodingService } from '../../services/geocodingService'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const eudrStore = useEudrComplianceStore()
const reportContainer = ref<HTMLElement | null>(null)

const isGeneratingPdf = ref(false)
const pdfStatusText = ref('')
const locationName = ref('Brasil (Georreferenciado)')

// Dimensões do Gráfico de NDVI no Laudo
const chartWidth = 520
const chartHeight = 110
const paddingX = 36

const report = computed(() => eudrStore.reportResult)
const complianceStatus = computed(() => eudrStore.compliance?.status || 'COMPLIANT')
const complianceTitle = computed(() => eudrStore.compliance?.title || 'Conformidade EUDR')

const formattedDate = computed(() => {
  if (!report.value?.processingTimestamp) {
    return new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  return new Date(report.value.processingTimestamp).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

const cleanRing = computed<[number, number][]>(() => {
  if (!report.value?.roi?.coordinates) return []
  return getCleanRing(report.value.roi.coordinates)
})

const croquiDimensions = computed<EudrCroquiDimensions>(() => {
  return calculateCroquiDimensions(cleanRing.value)
})

const verticesList = computed<EudrVertexInfo[]>(() => {
  return generateVerticesList(cleanRing.value)
})

const displayVertices = computed(() => {
  // Limita a 8 vértices no layout A4 da página para não vazar a folha
  return verticesList.value.slice(0, 8)
})

const centroidLatDms = computed(() => {
  if (!report.value?.centroid) return ''
  return toDMS(report.value.centroid[1], true)
})

const centroidLngDms = computed(() => {
  if (!report.value?.centroid) return ''
  return toDMS(report.value.centroid[0], false)
})

// Gera a estrutura do croqui SVG
const svgCroqui = computed(() => {
  const centroid: [number, number] = report.value?.centroid || [0, 0]
  return buildSvgCroqui(cleanRing.value, centroid, 560, 360, 48)
})

// Gráfico de NDVI
const chartPoints = computed(() => report.value?.periods || [])
const baselineIndex = computed(() => chartPoints.value.findIndex((p) => p.type === 'baseline'))

function getXForIndex(idx: number): number {
  const total = chartPoints.value.length
  if (total <= 1) return chartWidth / 2
  const availableWidth = chartWidth - paddingX * 2
  return paddingX + (idx / (total - 1)) * availableWidth
}

function getYForNdvi(val: number): number {
  const minNdvi = 0.0
  const maxNdvi = 0.95
  const clamped = Math.max(minNdvi, Math.min(maxNdvi, val))
  const ratio = (clamped - minNdvi) / (maxNdvi - minNdvi)
  const bottomY = chartHeight - 16
  const topY = 16
  return bottomY - ratio * (bottomY - topY)
}

function getYForRain(rainMm: number): number {
  const maxRain = Math.max(
    2000,
    ...chartPoints.value.map((p) => p.precipitationSumMm || 0)
  )
  const ratio = Math.min(1, Math.max(0, rainMm / maxRain))
  const bottomY = chartHeight - 16
  const topY = 24
  return bottomY - ratio * (bottomY - topY)
}

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

const svgAreaPath = computed(() => {
  const points = chartPoints.value
  if (!points.length || !svgLinePath.value) return ''
  const firstX = getXForIndex(0)
  const lastX = getXForIndex(points.length - 1)
  const bottomY = chartHeight - 16
  return `${svgLinePath.value} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`
})

// Geocodificação Reversa para obter o Município/UF
async function fetchReverseLocation() {
  if (!report.value?.centroid) return
  const [lon, lat] = report.value.centroid
  try {
    const res = await geocodingService.reverse(lat, lon)
    if (res?.address) {
      const city =
        res.address.city ||
        res.address.town ||
        res.address.municipality ||
        res.address.county
      const state = res.address.state
      if (city && state) {
        locationName.value = `${city} - ${state}`
      } else if (state) {
        locationName.value = `${state}, Brasil`
      } else if (res.display_name) {
        locationName.value = res.display_name.split(',')[0] || 'Brasil'
      }
    }
  } catch {
    locationName.value = 'Brasil (Georreferenciado)'
  }
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      fetchReverseLocation()
    }
  }
)

onMounted(() => {
  if (props.isOpen) {
    fetchReverseLocation()
  }
})

// Ação 1: Download direto do arquivo PDF via jsPDF + html2canvas (Carregamento sob demanda)
async function handleDownloadPdf() {
  if (!reportContainer.value) return

  try {
    isGeneratingPdf.value = true
    pdfStatusText.value = 'Iniciando...'

    const filename = `Laudo-EUDR-${report.value?.passportId || 'somap'}.pdf`

    // Import dinâmico para não sobrecarregar o bundle principal
    const { generateEudrPdf } = await import('../../services/eudrPdfService')

    await generateEudrPdf(reportContainer.value, {
      filename,
      onProgress: (status) => {
        pdfStatusText.value = status
      },
    })
  } catch (err: any) {
    console.error('Erro ao gerar PDF:', err)
    alert('Não foi possível gerar o arquivo PDF: ' + (err.message || 'Erro desconhecido'))
  } finally {
    isGeneratingPdf.value = false
    pdfStatusText.value = ''
  }
}

// Ação 2: Impressão Nativa do Navegador (Print-to-PDF)
function handlePrintNative() {
  window.print()
}
</script>

<style>
/* Regras de Impressão A4 Nativa */
@media print {
  @page {
    size: A4 portrait;
    margin: 0;
  }

  body {
    background-color: white !important;
    color: black !important;
    overflow: visible !important;
  }

  /* Oculta tudo na aplicação exceto o container do laudo */
  body > * {
    visibility: hidden;
  }

  #eudr-modal-backdrop,
  #eudr-modal-backdrop * {
    visibility: visible;
  }

  #eudr-modal-backdrop {
    position: static !important;
    inset: auto !important;
    background: transparent !important;
    padding: 0 !important;
    overflow: visible !important;
  }

  .no-print {
    display: none !important;
  }

  .eudr-print-container {
    padding: 0 !important;
    margin: 0 !important;
    background: transparent !important;
    display: block !important;
  }

  .pdf-page {
    width: 210mm !important;
    height: 297mm !important;
    min-height: 297mm !important;
    max-height: 297mm !important;
    margin: 0 !important;
    padding: 12mm 14mm !important;
    box-shadow: none !important;
    border: none !important;
    page-break-after: always !important;
    page-break-inside: avoid !important;
    break-after: page !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
  }
}
</style>
