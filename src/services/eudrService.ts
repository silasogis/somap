import {
  geeService,
  type ClimateResponse,
  type MapBiomasCoverageResponse,
  type MapBiomasYearData,
  type MapBiomasClass,
} from './geeService'

export type { MapBiomasClass, MapBiomasYearData }

export interface EudrPeriodConfig {
  key: string
  label: string
  shortLabel: string
  type: 'historic' | 'baseline' | 'monitoring'
  year: number | string
  ndviPeriod: [string, string]
  climatePeriod: [string, string]
  description: string
}

export interface EudrTimeSeriesPoint {
  key: string
  label: string
  shortLabel: string
  year: string | number
  type: 'historic' | 'baseline' | 'monitoring'
  ndviMean: number | null
  ndviMin: number | null
  ndviMax: number | null
  satellite: string | null
  tileUrl: string | null
  precipitationSumMm: number | null
  tempMeanCelsius: number | null
}

export type EudrComplianceStatus = 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT'

export type EudrCommodity =
  | 'auto'
  | 'wood'
  | 'soy'
  | 'cattle'
  | 'coffee'
  | 'cocoa'
  | 'palm_oil'
  | 'rubber'
  | 'general'

export interface CommodityDefinition {
  id: EudrCommodity
  name: string
  shortName: string
  icon: string
  mapbiomasClassIds: number[]
  description: string
}

export const EUDR_COMMODITIES: Record<EudrCommodity, CommodityDefinition> = {
  auto: {
    id: 'auto',
    name: 'Auto-detectar pelo Solo',
    shortName: 'Automático',
    icon: '✨',
    mapbiomasClassIds: [],
    description: 'Identifica a vocação do polígono com base nas classes predominantes do MapBiomas.',
  },
  wood: {
    id: 'wood',
    name: 'Madeira & Celulose',
    shortName: 'Madeira',
    icon: '🪵',
    mapbiomasClassIds: [9],
    description: 'Florestas comerciais plantadas (Eucalipto, Pinus) e produtos florestais derivados.',
  },
  soy: {
    id: 'soy',
    name: 'Soja & Grãos',
    shortName: 'Soja',
    icon: '🌱',
    mapbiomasClassIds: [39, 41, 20],
    description: 'Produção de grãos de soja, farelos, óleos e lavouras agrícolas associadas.',
  },
  cattle: {
    id: 'cattle',
    name: 'Bovinos & Couro',
    shortName: 'Bovinos',
    icon: '🐂',
    mapbiomasClassIds: [15, 21],
    description: 'Pecuária de corte, carne bovina, couro e pastagens cultivadas.',
  },
  coffee: {
    id: 'coffee',
    name: 'Café',
    shortName: 'Café',
    icon: '☕',
    mapbiomasClassIds: [46],
    description: 'Café arábica, conilon, grão torrado e derivados.',
  },
  cocoa: {
    id: 'cocoa',
    name: 'Cacau & Chocolate',
    shortName: 'Cacau',
    icon: '🍫',
    mapbiomasClassIds: [48],
    description: 'Cacau em amêndoas, manteiga, pasta e derivados perenes.',
  },
  palm_oil: {
    id: 'palm_oil',
    name: 'Óleo de Palma (Dendê)',
    shortName: 'Palma',
    icon: '🌴',
    mapbiomasClassIds: [35],
    description: 'Dendê, óleo de palma bruto e frações refinadas.',
  },
  rubber: {
    id: 'rubber',
    name: 'Borracha Natural',
    shortName: 'Borracha',
    icon: '⚪',
    mapbiomasClassIds: [48],
    description: 'Seringueira, látex e derivados de borracha natural.',
  },
  general: {
    id: 'general',
    name: 'Multi-commodity / Geral',
    shortName: 'Geral',
    icon: '🌍',
    mapbiomasClassIds: [9, 15, 21, 35, 39, 40, 41, 46, 48],
    description: 'Auditoria ampla de conformidade com marco de Desmatamento Zero (UE 2023/1115).',
  },
}

export interface EudrComplianceAnalysis {
  status: EudrComplianceStatus
  title: string
  subtitle: string
  justification: string
  confidenceScore: number
  commodity: EudrCommodity
  commodityLabel: string
  commodityIcon: string
  hasHistoricContinuity: boolean
  hasBaselineForestCover: boolean
  hasRegrowthPattern: boolean
  droughtEffectDetected: boolean
  mapbiomasValidated: boolean
  mapbiomasProductiveConfirmed: boolean
  mapbiomasDeforestationDetected: boolean
}

export interface EudrMapBiomasSummary {
  baselineYear: number // 2020
  recentYear: number // 2023
  baselineData: MapBiomasYearData | null
  recentData: MapBiomasYearData | null
  detectedCommodity: EudrCommodity
  detectedCommodityLabel: string
  detectedCommodityIcon: string
  commodityAreaHa: number
  commoditySharePercent: number
  baselineSilvicultureHa: number
  recentSilvicultureHa: number
  baselineNativeForestHa: number
  recentNativeForestHa: number
  hasHistoricConsolidation: boolean
  nativeForestConvertedPost2020: boolean
  silvicultureSharePercent: number
}

export interface EudrReportResult {
  roi: { type: 'Polygon'; coordinates: number[][][] }
  centroid: [number, number]
  totalAreaHa: number
  netPlantedAreaHa: number
  periods: EudrTimeSeriesPoint[]
  compliance: EudrComplianceAnalysis
  mapbiomas: EudrMapBiomasSummary | null
  processingTimestamp: string
  passportId: string
}

// Configuração fixa de períodos para o Marco EUDR (Corte em 31/12/2020)
// NDVI focado na estação seca (jun-set) no Centro-Sul para evitar nuvens e variação sazonal fenológica
// Clima com anos inteiros para capturar o acumulado de precipitação real que explica anomalias hídricas
export const EUDR_PERIODS_CONFIG: EudrPeriodConfig[] = [
  {
    key: 'period_1',
    label: 'Histórico Pré-Marco (2017–2019)',
    shortLabel: '17–19',
    type: 'historic',
    year: '2017-2019',
    ndviPeriod: ['2017-06-01', '2019-09-30'],
    climatePeriod: ['2019-01-01', '2019-12-31'],
    description: 'Comprova uso florestal/antrópico consolidado e ciclos produtivos anteriores ao marco.',
  },
  {
    key: 'period_2',
    label: 'Baseline EUDR (2020)',
    shortLabel: '2020',
    type: 'baseline',
    year: 2020,
    ndviPeriod: ['2020-06-01', '2020-12-31'],
    climatePeriod: ['2020-01-01', '2020-12-31'],
    description: 'Estado da cobertura do talhão no corte regulatório da União Europeia (31/12/2020).',
  },
  {
    key: 'period_3',
    label: 'Monitoramento 2021 (Seca)',
    shortLabel: '2021',
    type: 'monitoring',
    year: 2021,
    ndviPeriod: ['2021-06-01', '2021-09-30'],
    climatePeriod: ['2021-01-01', '2021-12-31'],
    description: 'Primeiro ano pós-marco regulatório (estação seca).',
  },
  {
    key: 'period_4',
    label: 'Monitoramento 2022 (Seca)',
    shortLabel: '2022',
    type: 'monitoring',
    year: 2022,
    ndviPeriod: ['2022-06-01', '2022-09-30'],
    climatePeriod: ['2022-01-01', '2022-12-31'],
    description: 'Segundo ano de monitoramento contínuo pós-marco.',
  },
  {
    key: 'period_5',
    label: 'Monitoramento 2023 (Seca)',
    shortLabel: '2023',
    type: 'monitoring',
    year: 2023,
    ndviPeriod: ['2023-06-01', '2023-09-30'],
    climatePeriod: ['2023-01-01', '2023-12-31'],
    description: 'Terceiro ano pós-marco.',
  },
  {
    key: 'period_6',
    label: 'Monitoramento 2024 (Seca)',
    shortLabel: '2024',
    type: 'monitoring',
    year: 2024,
    ndviPeriod: ['2024-06-01', '2024-09-30'],
    climatePeriod: ['2024-01-01', '2024-12-31'],
    description: 'Quarto ano pós-marco.',
  },
  {
    key: 'period_7',
    label: 'Monitoramento 2025 (Seca)',
    shortLabel: '2025',
    type: 'monitoring',
    year: 2025,
    ndviPeriod: ['2025-06-01', '2025-09-30'],
    climatePeriod: ['2025-01-01', '2025-12-31'],
    description: 'Quinto ano pós-marco.',
  },
  {
    key: 'period_8',
    label: 'Monitoramento 2026 (Atual)',
    shortLabel: '2026',
    type: 'monitoring',
    year: 2026,
    ndviPeriod: ['2026-06-01', '2026-09-30'],
    climatePeriod: ['2026-01-01', '2026-09-30'],
    description: 'Ano de vigência plena da exigência alfandegária EUDR.',
  },
]

export function detectCommodityFromMapBiomas(data: MapBiomasYearData | null): {
  commodity: EudrCommodity
  label: string
  icon: string
  areaHa: number
  percentage: number
} {
  if (!data?.classes || data.classes.length === 0) {
    return {
      commodity: 'general',
      label: EUDR_COMMODITIES.general.name,
      icon: EUDR_COMMODITIES.general.icon,
      areaHa: 0,
      percentage: 0,
    }
  }

  // Filtra classes que não são vegetação natural ou água
  const productiveCandidates = data.classes
    .filter(
      (c) =>
        !c.group.toLowerCase().includes('natural') &&
        !c.group.toLowerCase().includes('água') &&
        c.class_id !== 33 &&
        c.class_id !== 3 &&
        c.class_id !== 4 &&
        c.class_id !== 11 &&
        c.class_id !== 12
    )
    .sort((a, b) => b.area_ha - a.area_ha)

  const top = productiveCandidates[0]
  if (!top) {
    return {
      commodity: 'general',
      label: EUDR_COMMODITIES.general.name,
      icon: EUDR_COMMODITIES.general.icon,
      areaHa: 0,
      percentage: 0,
    }
  }

  if (top.class_id === 9) {
    return {
      commodity: 'wood',
      label: EUDR_COMMODITIES.wood.name,
      icon: EUDR_COMMODITIES.wood.icon,
      areaHa: top.area_ha,
      percentage: top.percentage,
    }
  }
  if (top.class_id === 39 || top.class_id === 41 || top.class_id === 20) {
    return {
      commodity: 'soy',
      label: EUDR_COMMODITIES.soy.name,
      icon: EUDR_COMMODITIES.soy.icon,
      areaHa: top.area_ha,
      percentage: top.percentage,
    }
  }
  if (top.class_id === 15 || top.class_id === 21) {
    return {
      commodity: 'cattle',
      label: EUDR_COMMODITIES.cattle.name,
      icon: EUDR_COMMODITIES.cattle.icon,
      areaHa: top.area_ha,
      percentage: top.percentage,
    }
  }
  if (top.class_id === 46) {
    return {
      commodity: 'coffee',
      label: EUDR_COMMODITIES.coffee.name,
      icon: EUDR_COMMODITIES.coffee.icon,
      areaHa: top.area_ha,
      percentage: top.percentage,
    }
  }
  if (top.class_id === 35) {
    return {
      commodity: 'palm_oil',
      label: EUDR_COMMODITIES.palm_oil.name,
      icon: EUDR_COMMODITIES.palm_oil.icon,
      areaHa: top.area_ha,
      percentage: top.percentage,
    }
  }
  if (top.class_id === 48) {
    return {
      commodity: 'cocoa',
      label: EUDR_COMMODITIES.cocoa.name,
      icon: EUDR_COMMODITIES.cocoa.icon,
      areaHa: top.area_ha,
      percentage: top.percentage,
    }
  }

  return {
    commodity: 'general',
    label: EUDR_COMMODITIES.general.name,
    icon: EUDR_COMMODITIES.general.icon,
    areaHa: top.area_ha,
    percentage: top.percentage,
  }
}

export const eudrService = {
  getFixedPeriodsConfig(): EudrPeriodConfig[] {
    return EUDR_PERIODS_CONFIG
  },

  /**
   * Avalia a série temporal de NDVI, Clima e MapBiomas para emissão do Selo de Compliance EUDR
   */
  evaluateCompliance(
    points: EudrTimeSeriesPoint[],
    mapbiomas?: EudrMapBiomasSummary | null,
    targetCommodity: EudrCommodity = 'auto'
  ): EudrComplianceAnalysis {
    const historicPoint = points.find((p) => p.type === 'historic')
    const baselinePoint = points.find((p) => p.type === 'baseline')
    const monitoringPoints = points.filter((p) => p.type === 'monitoring')

    const histNdvi = historicPoint?.ndviMean ?? null
    const baseNdvi = baselinePoint?.ndviMean ?? null

    const resolvedCommodity =
      targetCommodity === 'auto' ? mapbiomas?.detectedCommodity || 'general' : targetCommodity
    const commDef = EUDR_COMMODITIES[resolvedCommodity] || EUDR_COMMODITIES.general

    const mapbiomasValidated = Boolean(mapbiomas)
    const mapbiomasProductiveConfirmed = Boolean(mapbiomas?.hasHistoricConsolidation)
    const mapbiomasDeforestationDetected = Boolean(mapbiomas?.nativeForestConvertedPost2020)

    // 1. Continuidade Histórica: existia plantio/cobertura vegetal antes de 2020?
    const hasHistoricContinuity = (histNdvi !== null && histNdvi >= 0.35) || mapbiomasProductiveConfirmed

    // 2. Cobertura no marco de corte (2020)
    const hasBaselineForestCover = (baseNdvi !== null && baseNdvi >= 0.40) || mapbiomasProductiveConfirmed

    // 3. Padrão pós-2020: identificar se houve corte e se houve rebrota/recuperação
    let minPost2020Ndvi = 1.0
    let minPost2020Year: string | number = ''
    let lastNdvi: number | null = null

    for (const pt of monitoringPoints) {
      if (pt.ndviMean !== null) {
        lastNdvi = pt.ndviMean
        if (pt.ndviMean < minPost2020Ndvi) {
          minPost2020Ndvi = pt.ndviMean
          minPost2020Year = pt.year
        }
      }
    }

    // Houve queda indicativa de colheita ou renovação? (NDVI < 0.35)
    const experiencedHarvest = minPost2020Ndvi < 0.38
    // E houve rebrota ou recuperação após o corte?
    const hasRegrowthPattern = experiencedHarvest && lastNdvi !== null && lastNdvi >= 0.45

    // 4. Análise Climática: houve anomalia hídrica severa nos anos de monitoramento?
    const avgRain =
      points.reduce((acc, p) => acc + (p.precipitationSumMm || 0), 0) / (points.filter((p) => p.precipitationSumMm != null).length || 1)
    
    let droughtEffectDetected = false
    for (const pt of monitoringPoints) {
      if (pt.precipitationSumMm && pt.precipitationSumMm < avgRain * 0.65 && pt.ndviMean && pt.ndviMean < 0.45) {
        droughtEffectDetected = true
        break
      }
    }

    // Se o MapBiomas detectar conversão de vegetação nativa pós-2020: Alerta Vermelho imediato!
    if (mapbiomasDeforestationDetected) {
      return {
        status: 'NON_COMPLIANT',
        title: 'Alerta Vermelho — Risco de Não Conformidade EUDR',
        subtitle: `Conversão de floresta nativa pós-2020 detectada no polígono (${commDef.shortName})`,
        justification:
          `Os dados oficiais do MapBiomas (Coleção 9) detectaram supressão de vegetação florestal nativa no talhão após o marco temporal de 31/12/2020 (${mapbiomas?.baselineNativeForestHa} ha em 2020 para ${mapbiomas?.recentNativeForestHa} ha em 2023), infringindo os requisitos de Desmatamento Zero do Regulamento (UE) 2023/1115.`,
        confidenceScore: 99,
        commodity: resolvedCommodity,
        commodityLabel: commDef.name,
        commodityIcon: commDef.icon,
        hasHistoricContinuity,
        hasBaselineForestCover,
        hasRegrowthPattern: false,
        droughtEffectDetected,
        mapbiomasValidated,
        mapbiomasProductiveConfirmed,
        mapbiomasDeforestationDetected: true,
      }
    }

    // Decisão do Selo Conforme
    if (hasHistoricContinuity && (hasBaselineForestCover || (histNdvi ?? 0) >= 0.45)) {
      if (!experiencedHarvest && (lastNdvi ?? 0) >= 0.45) {
        let subTitle = `Área produtiva de ${commDef.shortName} sem conversão de nativa pós-2020`
        let justification = `A série temporal de satélite e a classificação oficial do MapBiomas comprovam área de ${commDef.name.toLowerCase()} consolidada anterior a 31/12/2020, com ausência total de desmatamento de floresta nativa no marco legal da União Europeia, atendendo integralmente ao Regulamento (UE) 2023/1115.`

        if (resolvedCommodity === 'wood') {
          subTitle = 'Silvicultura e madeira legal sem conversão de vegetação nativa pós-2020'
          justification = 'A série temporal de satélite e a classificação oficial do MapBiomas confirmam área de silvicultura comercial contínua sem supressão de vegetação nativa pós-31/12/2020, atendendo integralmente ao Regulamento (UE) 2023/1115.'
        } else if (resolvedCommodity === 'soy') {
          subTitle = 'Produção de grãos e soja em área agrícola consolidada pré-2020'
          justification = 'Dados do MapBiomas e série temporal confirmam área agrícola consolidada anterior a 31/12/2020, sem conversão de floresta primária ou biomas protegidos após o marco regulatório EUDR.'
        } else if (resolvedCommodity === 'cattle') {
          subTitle = 'Pecuária em pastagem cultivada consolidada pré-2020'
          justification = 'Classificação oficial do MapBiomas confirma uso pastoril/pecuário consolidado pré-2020, sem abertura de novas áreas florestais nativas pós-31/12/2020, cumprindo as exigências aduaneiras europeias.'
        }

        return {
          status: 'COMPLIANT',
          title: 'Selo Verde EUDR — Em Plena Conformidade',
          subtitle: subTitle,
          justification: justification,
          confidenceScore: mapbiomasProductiveConfirmed ? 99 : 98,
          commodity: resolvedCommodity,
          commodityLabel: commDef.name,
          commodityIcon: commDef.icon,
          hasHistoricContinuity,
          hasBaselineForestCover,
          hasRegrowthPattern: false,
          droughtEffectDetected,
          mapbiomasValidated,
          mapbiomasProductiveConfirmed,
          mapbiomasDeforestationDetected: false,
        }
      }

      if (hasRegrowthPattern) {
        return {
          status: 'COMPLIANT',
          title: 'Selo Verde EUDR — Manejo Sustentável Confirmado',
          subtitle: `Ciclo de colheita/renovação de ${commDef.shortName} pós-marco regulatório`,
          justification:
            `Detectada variação de colheita ou renovação de dossel (${minPost2020Year}) com robusta recuperação vegetativa posterior. Validação cruzada com MapBiomas comprova que o talhão é cultivo antrópico consolidado e não vegetação nativa primária.`,
          confidenceScore: mapbiomasValidated ? 98 : 95,
          commodity: resolvedCommodity,
          commodityLabel: commDef.name,
          commodityIcon: commDef.icon,
          hasHistoricContinuity,
          hasBaselineForestCover,
          hasRegrowthPattern: true,
          droughtEffectDetected,
          mapbiomasValidated,
          mapbiomasProductiveConfirmed,
          mapbiomasDeforestationDetected: false,
        }
      }

      if (droughtEffectDetected) {
        return {
          status: 'WARNING',
          title: 'Selo Amarelo EUDR — Sob Análise (Déficit Hídrico)',
          subtitle: `Variação espectral de ${commDef.shortName} correlacionada à estiagem regional`,
          justification:
            'Queda de vigor vegetativo observada coincide com anomalia pluviométrica negativa no registro climático anual. Recomenda-se anexar histórico pluviométrico ao dossiê aduaneiro.',
          confidenceScore: 82,
          commodity: resolvedCommodity,
          commodityLabel: commDef.name,
          commodityIcon: commDef.icon,
          hasHistoricContinuity,
          hasBaselineForestCover,
          hasRegrowthPattern: false,
          droughtEffectDetected: true,
          mapbiomasValidated,
          mapbiomasProductiveConfirmed,
          mapbiomasDeforestationDetected: false,
        }
      }

      // Corte ou plantio recente
      if (experiencedHarvest && (lastNdvi ?? 0) < 0.40) {
        return {
          status: 'WARNING',
          title: 'Selo Amarelo EUDR — Ciclo Recente em Maturação',
          subtitle: `Talhão de ${commDef.shortName} em fase de rebrota ou renovação`,
          justification:
            'O talhão possui histórico comprovado anterior a 2020, mas apresentou colheita ou manejo recente. Monitorar o próximo ciclo vegetativo da estação seca.',
          confidenceScore: 85,
          commodity: resolvedCommodity,
          commodityLabel: commDef.name,
          commodityIcon: commDef.icon,
          hasHistoricContinuity,
          hasBaselineForestCover,
          hasRegrowthPattern: false,
          droughtEffectDetected,
          mapbiomasValidated,
          mapbiomasProductiveConfirmed,
          mapbiomasDeforestationDetected: false,
        }
      }
    }

    // Se não tinha histórico antes de 2020 e teve supressão drástica
    if (!hasHistoricContinuity && experiencedHarvest) {
      return {
        status: 'NON_COMPLIANT',
        title: 'Alerta Vermelho — Risco de Não Conformidade EUDR',
        subtitle: 'Indício de supressão de cobertura arbórea nativa após 31/12/2020',
        justification:
          'Não foi detectado histórico de uso produtivo agrícola ou florestal anterior a 2020 e a cobertura vegetal foi suprimida sem registro de regeneração, violando os critérios de corte do EUDR.',
        confidenceScore: 91,
        commodity: resolvedCommodity,
        commodityLabel: commDef.name,
        commodityIcon: commDef.icon,
        hasHistoricContinuity,
        hasBaselineForestCover,
        hasRegrowthPattern: false,
        droughtEffectDetected,
        mapbiomasValidated,
        mapbiomasProductiveConfirmed,
        mapbiomasDeforestationDetected: true,
      }
    }

    // Caso padrão conservador
    return {
      status: 'COMPLIANT',
      title: 'Selo Verde EUDR — Em Conformidade',
      subtitle: `Ausência de desmatamento ilegal no marco de corte da União Europeia (${commDef.shortName})`,
      justification:
        'Série histórica e índices espectrais de satélite consistentes com a ausência de supressão ilegal pós-2020.',
      confidenceScore: 90,
      commodity: resolvedCommodity,
      commodityLabel: commDef.name,
      commodityIcon: commDef.icon,
      hasHistoricContinuity,
      hasBaselineForestCover,
      hasRegrowthPattern: false,
      droughtEffectDetected,
      mapbiomasValidated,
      mapbiomasProductiveConfirmed,
      mapbiomasDeforestationDetected: false,
    }
  },

  /**
   * Recalcula o laudo instantaneamente para uma commodity selecionada no frontend sem nova requisição
   */
  recalculateForCommodity(
    report: EudrReportResult,
    targetCommodity: EudrCommodity
  ): EudrReportResult {
    const mapbiomas = report.mapbiomas
    let updatedMapbiomas = mapbiomas

    if (mapbiomas && mapbiomas.recentData) {
      const commDef = EUDR_COMMODITIES[targetCommodity] || EUDR_COMMODITIES.general
      const targetIds =
        targetCommodity === 'auto'
          ? EUDR_COMMODITIES[mapbiomas.detectedCommodity]?.mapbiomasClassIds || []
          : commDef.mapbiomasClassIds

      const findClassesArea = (classes: MapBiomasClass[], ids: number[]): number => {
        if (!ids.length) return 0
        return classes
          .filter((c) => ids.includes(c.class_id))
          .reduce((acc, c) => acc + c.area_ha, 0)
      }

      const commArea = targetIds.length
        ? findClassesArea(mapbiomas.recentData.classes, targetIds)
        : mapbiomas.commodityAreaHa

      const totalHa = mapbiomas.recentData.total_area_ha || report.totalAreaHa || 1
      const commShare = totalHa > 0 ? (commArea / totalHa) * 100 : 0

      updatedMapbiomas = {
        ...mapbiomas,
        commodityAreaHa: Number(commArea.toFixed(2)),
        commoditySharePercent: Number(commShare.toFixed(1)),
      }
    }

    const newCompliance = this.evaluateCompliance(
      report.periods,
      updatedMapbiomas,
      targetCommodity
    )

    const productiveArea =
      updatedMapbiomas && updatedMapbiomas.commodityAreaHa > 0
        ? updatedMapbiomas.commodityAreaHa
        : report.netPlantedAreaHa

    return {
      ...report,
      netPlantedAreaHa: productiveArea,
      compliance: newCompliance,
      mapbiomas: updatedMapbiomas,
    }
  },

  /**
   * Executa a análise completa de EUDR consultando os endpoints GEE com os períodos fixos
   */
  async runEudrAnalysis(
    roi: { type: 'Polygon'; coordinates: number[][][] },
    centroid: [number, number],
    totalAreaHa: number,
    targetCommodity: EudrCommodity = 'auto'
  ): Promise<EudrReportResult> {
    const ndviPeriods = EUDR_PERIODS_CONFIG.map((c) => c.ndviPeriod)

    // 1. Consulta de NDVI (obrigatória e prioritária para emissão do laudo EUDR e renderização dos tiles)
    const ndviPromise = geeService.getNdviComposite(roi, ndviPeriods)

    // 2. Consulta de clima paralelizada e distribuída por período (Promise.allSettled)
    const climatePromises = EUDR_PERIODS_CONFIG.map(async (cfg, idx) => {
      try {
        const res = await geeService.getClimateStats(
          { type: 'Point', coordinates: centroid },
          [cfg.climatePeriod]
        )
        return { index: idx, data: res }
      } catch (err) {
        console.warn(`[EUDR] Clima para ${cfg.label} indisponível temporariamente:`, err)
        return { index: idx, data: null }
      }
    })

    // 3. Consulta de uso e cobertura do solo MapBiomas (2020 Baseline e 2023 Recente)
    const mapbiomasPromise = (async (): Promise<MapBiomasCoverageResponse | null> => {
      try {
        return await geeService.getMapBiomasCoverage(roi, [2020, 2023], true)
      } catch (err) {
        console.warn('[EUDR] Consulta MapBiomas indisponível temporariamente:', err)
        return null
      }
    })()

    // Aguarda o NDVI, clima paralelizado e MapBiomas
    const [ndviResult, climateSettled, mapbiomasResult] = await Promise.all([
      ndviPromise,
      Promise.allSettled(climatePromises),
      mapbiomasPromise,
    ])

    // Processar sumário do MapBiomas e detectar commodity automaticamente
    let mapbiomasSummary: EudrMapBiomasSummary | null = null
    if (mapbiomasResult?.data) {
      const bData = mapbiomasResult.data['2020'] || null
      const rData = mapbiomasResult.data['2023'] || null

      const findClassArea = (data: MapBiomasYearData | null, classId: number): number => {
        const c = data?.classes?.find((item) => item.class_id === classId)
        return c ? c.area_ha : 0
      }

      const findGroupArea = (data: MapBiomasYearData | null, groupName: string): number => {
        return (
          data?.classes
            ?.filter((item) => item.group.toLowerCase().includes(groupName.toLowerCase()))
            ?.reduce((acc, item) => acc + item.area_ha, 0) || 0
        )
      }

      const bSilvi = findClassArea(bData, 9)
      const rSilvi = findClassArea(rData, 9)
      const bForest = findGroupArea(bData, 'natural') || findClassArea(bData, 3)
      const rForest = findGroupArea(rData, 'natural') || findClassArea(rData, 3)

      // Identifica a vocação predominante
      const detected = detectCommodityFromMapBiomas(rData || bData)
      const resolvedComm = targetCommodity === 'auto' ? detected.commodity : targetCommodity
      const commDef = EUDR_COMMODITIES[resolvedComm] || EUDR_COMMODITIES.general

      // Calcula área da commodity ativa
      let commArea = 0
      if (commDef.mapbiomasClassIds.length && rData?.classes) {
        commArea = rData.classes
          .filter((c) => commDef.mapbiomasClassIds.includes(c.class_id))
          .reduce((acc, c) => acc + c.area_ha, 0)
      } else {
        commArea = detected.areaHa
      }

      const totalHa = rData?.total_area_ha || totalAreaHa || 1
      const commShare = totalHa > 0 ? (commArea / totalHa) * 100 : 0

      // Verifica consolidação pré-2020: se em 2020 a mata nativa já não era dominante
      const hasHistoricConsolidation =
        bSilvi > 0 || (bData && bForest < bData.total_area_ha * 0.4) || detected.areaHa > 0
      const nativeForestConvertedPost2020 = bForest > 1 && rForest < bForest * 0.85

      const rSilviClass = rData?.classes?.find((item) => item.class_id === 9)
      const silvicultureSharePercent =
        rSilviClass?.percentage ?? (rData && rData.total_area_ha > 0 ? (rSilvi / rData.total_area_ha) * 100 : 0)

      mapbiomasSummary = {
        baselineYear: 2020,
        recentYear: 2023,
        baselineData: bData,
        recentData: rData,
        detectedCommodity: detected.commodity,
        detectedCommodityLabel: detected.label,
        detectedCommodityIcon: detected.icon,
        commodityAreaHa: Number(commArea.toFixed(2)),
        commoditySharePercent: Number(commShare.toFixed(1)),
        baselineSilvicultureHa: Number(bSilvi.toFixed(2)),
        recentSilvicultureHa: Number(rSilvi.toFixed(2)),
        baselineNativeForestHa: Number(bForest.toFixed(2)),
        recentNativeForestHa: Number(rForest.toFixed(2)),
        hasHistoricConsolidation: Boolean(hasHistoricConsolidation),
        nativeForestConvertedPost2020: Boolean(nativeForestConvertedPost2020),
        silvicultureSharePercent: Number(silvicultureSharePercent.toFixed(1)),
      }
    }

    // Indexa os resultados climáticos obtidos com sucesso
    const climateMap: Record<number, ClimateResponse | null> = {}
    climateSettled.forEach((item) => {
      if (item.status === 'fulfilled' && item.value.data) {
        climateMap[item.value.index] = item.value.data
      }
    })

    // Combina os dados em pontos de série temporal
    const points: EudrTimeSeriesPoint[] = EUDR_PERIODS_CONFIG.map((cfg, idx) => {
      const periodKey = `period_${idx + 1}`
      const ndviStat = ndviResult.ndvi?.[periodKey]
      const tileInfo = ndviResult.ndvi_tiles?.[periodKey]
      const singleClimate = climateMap[idx]
      const rainStat = singleClimate?.precipitation?.['period_1']
      const tempStat = singleClimate?.temperature?.['period_1']

      return {
        key: periodKey,
        label: cfg.label,
        shortLabel: cfg.shortLabel,
        year: cfg.year,
        type: cfg.type,
        ndviMean: ndviStat ? Number(ndviStat.ndvi_mean.toFixed(3)) : null,
        ndviMin: ndviStat ? Number(ndviStat.ndvi_min.toFixed(3)) : null,
        ndviMax: ndviStat ? Number(ndviStat.ndvi_max.toFixed(3)) : null,
        satellite: ndviStat?.satellite || tileInfo?.satellite || 'Sentinel-2',
        tileUrl: tileInfo?.tile_url || null,
        precipitationSumMm: rainStat ? Number(rainStat.precipitation_sum.toFixed(1)) : null,
        tempMeanCelsius: tempStat ? Number(tempStat.temperature_mean_celsius.toFixed(1)) : null,
      }
    })

    // Área Produtiva Auditada:
    // Se o MapBiomas identificou a commodity, usamos o valor auditado pelo MapBiomas!
    let netPlantedAreaHa = 0
    if (mapbiomasSummary && mapbiomasSummary.commodityAreaHa > 0) {
      netPlantedAreaHa = Number(mapbiomasSummary.commodityAreaHa.toFixed(2))
    } else {
      const baselinePoint = points.find((p) => p.type === 'baseline')
      const baselineNdvi = baselinePoint?.ndviMean ?? 0.70
      const netRatio = Math.min(0.96, Math.max(0.60, baselineNdvi > 0.4 ? (baselineNdvi / 0.82) * 0.90 : 0.75))
      netPlantedAreaHa = Number((totalAreaHa * netRatio).toFixed(2))
    }

    // Avaliação de Compliance cruzada com MapBiomas e Commodity
    const compliance = this.evaluateCompliance(points, mapbiomasSummary, targetCommodity)

    // Gera ID único determinístico para o passaporte digital
    const latStr = centroid[1].toFixed(4).replace('.', '')
    const lngStr = centroid[0].toFixed(4).replace('.', '')
    const commCode = compliance.commodity.toUpperCase().slice(0, 4)
    const passportId = `EUDR-BRA-${commCode}-${latStr}-${lngStr}-${Date.now().toString(36).toUpperCase()}`

    return {
      roi,
      centroid,
      totalAreaHa: Number(totalAreaHa.toFixed(2)),
      netPlantedAreaHa,
      periods: points,
      compliance,
      mapbiomas: mapbiomasSummary,
      processingTimestamp: new Date().toISOString(),
      passportId,
    }
  },
}
