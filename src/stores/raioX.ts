import { defineStore } from 'pinia'
import { ref } from 'vue'
import { raioXService } from '../services/raioXService'
import type { Segmento, RaioXResult, DescobertaResult, ConcorrenteProps } from '../types/raioX'

// Caixa aproximada de Curitiba e RMC
export const RMC_BOUNDS = {
  lonMin: -49.9,
  lonMax: -48.8,
  latMin: -25.95,
  latMax: -25.0,
}

export const useRaioXStore = defineStore('raioX', () => {
  const isActive = ref(false)
  const mode = ref<'direto' | 'descoberta'>('direto')
  const selectedPoint = ref<[number, number] | null>(null) // [lon, lat]
  const selectedSegment = ref<string>('')
  const segmentos = ref<Segmento[]>([])
  const loadingSegmentos = ref(false)
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)

  const raioXData = ref<RaioXResult | null>(null)
  const descobertaData = ref<DescobertaResult | null>(null)

  const focusedCompetitor = ref<{
    coord: [number, number]
    props: ConcorrenteProps
  } | null>(null)

  async function toggleActive() {
    isActive.value = !isActive.value
    if (isActive.value) {
      // Desativa os demais painéis analíticos
      const { useRouteStore } = await import('./route')
      const routeStore = useRouteStore()
      if (routeStore.isActive) routeStore.toggleActive()

      const { useNdviClimateStore } = await import('./ndviClimate')
      const ndviStore = useNdviClimateStore()
      if (ndviStore.isActive) ndviStore.toggleActive()

      const { useSentinelRgbStore } = await import('./sentinelRgb')
      const sentinelStore = useSentinelRgbStore()
      if (sentinelStore.isActive) sentinelStore.toggleActive()

      const { useEudrComplianceStore } = await import('./eudrCompliance')
      const eudrStore = useEudrComplianceStore()
      if (eudrStore.isActive) eudrStore.toggleActive()

      // Carrega segmentos se ainda não tiver
      if (segmentos.value.length === 0) {
        await loadSegmentos()
      }
    } else {
      limpar()
    }
  }

  async function loadSegmentos() {
    try {
      loadingSegmentos.value = true
      const dados = await raioXService.getSegmentos()
      segmentos.value = dados
      if (dados.length > 0 && !selectedSegment.value && dados[0]) {
        selectedSegment.value = dados[0].codigo
      }
    } catch (err: any) {
      console.error('Erro ao carregar segmentos:', err)
      errorMessage.value = err?.message || 'Não foi possível carregar a lista de segmentos.'
    } finally {
      loadingSegmentos.value = false
    }
  }

  function setMode(novoModo: 'direto' | 'descoberta') {
    mode.value = novoModo
    errorMessage.value = null
    focusedCompetitor.value = null
    if (selectedPoint.value) {
      executarAnalise()
    }
  }

  function setPoint(coords: [number, number]) {
    const [lon, lat] = coords
    if (
      lon < RMC_BOUNDS.lonMin ||
      lon > RMC_BOUNDS.lonMax ||
      lat < RMC_BOUNDS.latMin ||
      lat > RMC_BOUNDS.latMax
    ) {
      errorMessage.value = 'Ponto fora da área coberta (Curitiba e RMC).'
      return
    }

    selectedPoint.value = coords
    errorMessage.value = null
    focusedCompetitor.value = null
    executarAnalise()
  }

  async function executarAnalise() {
    if (!selectedPoint.value) return

    const [lon, lat] = selectedPoint.value
    isLoading.value = true
    errorMessage.value = null

    try {
      if (mode.value === 'descoberta') {
        raioXData.value = null
        const res = await raioXService.descobrir(lon, lat)
        descobertaData.value = res
      } else {
        descobertaData.value = null
        if (!selectedSegment.value && segmentos.value.length > 0 && segmentos.value[0]) {
          selectedSegment.value = segmentos.value[0].codigo
        }
        if (!selectedSegment.value) {
          errorMessage.value = 'Selecione um segmento.'
          isLoading.value = false
          return
        }
        const res = await raioXService.analisar(lon, lat, selectedSegment.value)
        raioXData.value = res
      }
    } catch (err: any) {
      console.error('Erro ao executar análise de Raio-X:', err)
      errorMessage.value = err?.message || 'Falha ao processar a análise.'
      raioXData.value = null
      descobertaData.value = null
    } finally {
      isLoading.value = false
    }
  }

  function escolherSegmentoDoRanking(codigo: string) {
    selectedSegment.value = codigo
    setMode('direto')
  }

  function focarConcorrente(coord: [number, number], props: ConcorrenteProps) {
    focusedCompetitor.value = { coord, props }
  }

  function limpar() {
    selectedPoint.value = null
    raioXData.value = null
    descobertaData.value = null
    errorMessage.value = null
    focusedCompetitor.value = null
  }

  return {
    isActive,
    mode,
    selectedPoint,
    selectedSegment,
    segmentos,
    loadingSegmentos,
    isLoading,
    errorMessage,
    raioXData,
    descobertaData,
    focusedCompetitor,
    toggleActive,
    loadSegmentos,
    setMode,
    setPoint,
    executarAnalise,
    escolherSegmentoDoRanking,
    focarConcorrente,
    limpar,
  }
})
