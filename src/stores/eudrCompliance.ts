import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  eudrService,
  EUDR_COMMODITIES,
  type EudrCommodity,
  type EudrReportResult,
  type EudrTimeSeriesPoint,
  type EudrComplianceAnalysis,
  type EudrMapBiomasSummary,
} from '../services/eudrService'
import { useRouteStore } from './route'
import { useNdviClimateStore } from './ndviClimate'

export const useEudrComplianceStore = defineStore('eudrCompliance', () => {
  const isActive = ref(false)
  const isDrawing = ref(false)

  const roi = ref<{ type: 'Polygon'; coordinates: number[][][] } | null>(null)
  const centroid = ref<[number, number] | null>(null)
  const totalAreaHa = ref<number | null>(null)

  const reportResult = ref<EudrReportResult | null>(null)
  const selectedPeriodKey = ref<string>('period_2') // Padrão no Baseline (2020)
  const selectedCommodity = ref<EudrCommodity>('auto')
  const activeLayerMode = ref<'ndvi' | 'mapbiomas'>('ndvi')
  const selectedMapbiomasYear = ref<number>(2023)
  const tileOpacity = ref<number>(0.8)
  const tileVisible = ref<boolean>(true)

  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)

  const activeCommodity = computed(() => {
    return EUDR_COMMODITIES[selectedCommodity.value] || EUDR_COMMODITIES.auto
  })

  const activePeriodPoint = computed<EudrTimeSeriesPoint | null>(() => {
    if (!reportResult.value) return null
    return reportResult.value.periods.find((p) => p.key === selectedPeriodKey.value) || reportResult.value.periods[0] || null
  })

  const compliance = computed<EudrComplianceAnalysis | null>(() => {
    return reportResult.value?.compliance || null
  })

  const mapbiomas = computed<EudrMapBiomasSummary | null>(() => {
    return reportResult.value?.mapbiomas || null
  })

  const activeMapbiomasTileUrl = computed<string | null>(() => {
    if (!reportResult.value?.mapbiomas) return null
    if (selectedMapbiomasYear.value === 2020) {
      return reportResult.value.mapbiomas.baselineData?.mapbiomas_tile || null
    }
    return reportResult.value.mapbiomas.recentData?.mapbiomas_tile || null
  })

  // URL ativa para renderização no mapa (depende de activeLayerMode)
  const activeDisplayTileUrl = computed<string | null>(() => {
    if (activeLayerMode.value === 'mapbiomas') {
      return activeMapbiomasTileUrl.value
    }
    return activePeriodPoint.value?.tileUrl || null
  })

  async function toggleActive() {
    isActive.value = !isActive.value
    if (isActive.value) {
      // Desativa outras ferramentas no mapa para evitar conflitos de interação
      const routeStore = useRouteStore()
      if (routeStore.isActive) {
        routeStore.toggleActive()
      }
      const ndviClimateStore = useNdviClimateStore()
      if (ndviClimateStore.isActive) {
        ndviClimateStore.toggleActive()
      }
      const { useSentinelRgbStore } = await import('./sentinelRgb')
      const sentinelRgbStore = useSentinelRgbStore()
      if (sentinelRgbStore.isActive) {
        sentinelRgbStore.toggleActive()
      }
    } else {
      clearAnalysis()
    }
  }

  function startDrawing() {
    if (!isActive.value) return
    isDrawing.value = true
    errorMessage.value = null
  }

  function stopDrawing() {
    isDrawing.value = false
  }

  async function setRoiCentroidAndArea(
    geojsonRoi: { type: 'Polygon'; coordinates: number[][][] },
    centroidCoord: [number, number],
    areaHa: number
  ) {
    roi.value = geojsonRoi
    centroid.value = centroidCoord
    totalAreaHa.value = areaHa
    isDrawing.value = false

    await fetchData()
  }

  async function fetchData() {
    if (!roi.value || !centroid.value || !totalAreaHa.value) return

    isLoading.value = true
    errorMessage.value = null
    reportResult.value = null

    try {
      console.log('EUDR Analysis Request - Polígono:', JSON.stringify(roi.value))
      console.log('EUDR Centroid:', centroid.value, 'Área (ha):', totalAreaHa.value)

      const result = await eudrService.runEudrAnalysis(
        roi.value,
        centroid.value,
        totalAreaHa.value,
        selectedCommodity.value
      )

      reportResult.value = result
      // Define a seleção inicial para o período Baseline 2020
      selectedPeriodKey.value = 'period_2'
    } catch (err: any) {
      console.error('Erro na análise EUDR:', err)
      errorMessage.value =
        err?.data?.message || err?.message || 'Falha ao processar a série temporal EUDR no Google Earth Engine.'
    } finally {
      isLoading.value = false
    }
  }

  function setCommodity(commodity: EudrCommodity) {
    selectedCommodity.value = commodity
    if (reportResult.value) {
      reportResult.value = eudrService.recalculateForCommodity(
        reportResult.value,
        commodity
      )
    }
  }

  function clearAnalysis() {
    isDrawing.value = false
    roi.value = null
    centroid.value = null
    totalAreaHa.value = null
    reportResult.value = null
    errorMessage.value = null
    isLoading.value = false
    selectedPeriodKey.value = 'period_2'
    selectedCommodity.value = 'auto'
    activeLayerMode.value = 'ndvi'
    selectedMapbiomasYear.value = 2023
  }

  function downloadPassportJson() {
    if (!reportResult.value) return

    const exportData = {
      standard: 'EUDR_REGULATION_EU_2023_1115',
      passport_id: reportResult.value.passportId,
      issued_at: reportResult.value.processingTimestamp,
      commodity_target: {
        id: reportResult.value.compliance.commodity,
        label: reportResult.value.compliance.commodityLabel,
        icon: reportResult.value.compliance.commodityIcon,
      },
      parcel: {
        total_area_hectares: reportResult.value.totalAreaHa,
        productive_area_hectares: reportResult.value.netPlantedAreaHa,
        net_planted_area_hectares: reportResult.value.netPlantedAreaHa,
        centroid_wgs84: {
          latitude: reportResult.value.centroid[1],
          longitude: reportResult.value.centroid[0],
        },
        polygon_geojson: reportResult.value.roi,
      },
      audit_result: {
        compliance_status: reportResult.value.compliance.status,
        badge_title: reportResult.value.compliance.title,
        confidence_percent: reportResult.value.compliance.confidenceScore,
        technical_justification: reportResult.value.compliance.justification,
        historical_continuity_pre_2020: reportResult.value.compliance.hasHistoricContinuity,
        baseline_forest_cover_at_cutoff: reportResult.value.compliance.hasBaselineForestCover,
        commercial_harvest_and_regrowth: reportResult.value.compliance.hasRegrowthPattern,
        drought_anomaly_detected: reportResult.value.compliance.droughtEffectDetected,
        mapbiomas_validated: reportResult.value.compliance.mapbiomasValidated,
        mapbiomas_productive_confirmed: reportResult.value.compliance.mapbiomasProductiveConfirmed,
        mapbiomas_deforestation_detected: reportResult.value.compliance.mapbiomasDeforestationDetected,
      },
      mapbiomas_land_use_audit: reportResult.value.mapbiomas
        ? {
            source: 'MapBiomas Brasil (Coleção 9)',
            detected_commodity: reportResult.value.mapbiomas.detectedCommodity,
            detected_commodity_label: reportResult.value.mapbiomas.detectedCommodityLabel,
            commodity_area_hectares: reportResult.value.mapbiomas.commodityAreaHa,
            commodity_share_percent: reportResult.value.mapbiomas.commoditySharePercent,
            baseline_2020: {
              year: reportResult.value.mapbiomas.baselineYear,
              silviculture_hectares: reportResult.value.mapbiomas.baselineSilvicultureHa,
              native_forest_hectares: reportResult.value.mapbiomas.baselineNativeForestHa,
              classes: reportResult.value.mapbiomas.baselineData?.classes || [],
            },
            recent_audit: {
              year: reportResult.value.mapbiomas.recentYear,
              silviculture_hectares: reportResult.value.mapbiomas.recentSilvicultureHa,
              native_forest_hectares: reportResult.value.mapbiomas.recentNativeForestHa,
              classes: reportResult.value.mapbiomas.recentData?.classes || [],
            },
            cross_check: {
              historic_consolidation_confirmed: reportResult.value.mapbiomas.hasHistoricConsolidation,
              native_forest_converted_post_2020: reportResult.value.mapbiomas.nativeForestConvertedPost2020,
            },
          }
        : null,
      time_series: reportResult.value.periods.map((p) => ({
        phase: p.type,
        year: p.year,
        ndvi_mean: p.ndviMean,
        ndvi_min: p.ndviMin,
        ndvi_max: p.ndviMax,
        precipitation_accumulated_mm: p.precipitationSumMm,
        temperature_mean_celsius: p.tempMeanCelsius,
        satellite_source: p.satellite,
      })),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Passaporte_EUDR_${reportResult.value.passportId}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return {
    isActive,
    isDrawing,
    roi,
    centroid,
    totalAreaHa,
    reportResult,
    selectedPeriodKey,
    selectedCommodity,
    activeCommodity,
    activeLayerMode,
    selectedMapbiomasYear,
    activePeriodPoint,
    compliance,
    mapbiomas,
    activeMapbiomasTileUrl,
    activeDisplayTileUrl,
    tileOpacity,
    tileVisible,
    isLoading,
    errorMessage,
    toggleActive,
    startDrawing,
    stopDrawing,
    setRoiCentroidAndArea,
    fetchData,
    setCommodity,
    clearAnalysis,
    downloadPassportJson,
    EUDR_COMMODITIES,
  }
})
