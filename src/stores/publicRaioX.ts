import { defineStore } from 'pinia'
import { ref } from 'vue'
import { publicRaioXService, PublicRaioXError } from '../services/publicRaioXService'
import { RMC_BOUNDS } from './raioX'
import type { Segmento, RaioXResult, DescobertaResult, ConcorrenteProps, ConviteValidacao } from '../types/raioX'

export const usePublicRaioXStore = defineStore('publicRaioX', () => {
  const convite = ref<string>('')
  const conviteInfo = ref<ConviteValidacao | null>(null)
  const conviteStatus = ref<'idle' | 'validating' | 'valid' | 'invalid'>('idle')
  const conviteError = ref<string | null>(null)
  const conviteErrorTitle = ref<string | null>(null)

  // Na página pública, a visualização do Raio-X está sempre ativa
  const isActive = ref(true)
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

  /**
   * Valida o código do convite e carrega os segmentos caso válido.
   */
  async function validar(codigo: string | null | undefined): Promise<boolean> {
    if (!codigo || !codigo.trim()) {
      conviteStatus.value = 'invalid'
      conviteErrorTitle.value = 'Convite não informado'
      conviteError.value = 'Para acessar o Raio-X comercial, você precisa de um link de convite válido (ex.: /raio-x?convite=SEU_CODIGO).'
      return false
    }

    const trimmed = codigo.trim()
    convite.value = trimmed
    conviteStatus.value = 'validating'
    conviteError.value = null
    conviteErrorTitle.value = null

    try {
      const info = await publicRaioXService.validarConvite(trimmed)
      conviteInfo.value = info
      conviteStatus.value = 'valid'

      // Carrega a lista de segmentos públicos
      await loadSegmentos()
      return true
    } catch (err: any) {
      conviteStatus.value = 'invalid'
      conviteInfo.value = null

      if (err instanceof PublicRaioXError) {
        if (err.status === 404) {
          conviteErrorTitle.value = 'Convite inválido'
          conviteError.value = 'O código de convite informado não existe ou foi digitado incorretamente.'
        } else if (err.status === 403) {
          const detail = err.detail.toLowerCase()
          if (detail.includes('expirou')) {
            conviteErrorTitle.value = 'Convite expirado'
            conviteError.value = 'A data de validade deste convite expirou. Solicite um novo link à equipe SOMAP.'
          } else if (detail.includes('limite')) {
            conviteErrorTitle.value = 'Limite de análises esgotado'
            conviteError.value = 'Este convite já atingiu a quantidade máxima de análises disponíveis.'
          } else if (detail.includes('desativado')) {
            conviteErrorTitle.value = 'Convite desativado'
            conviteError.value = 'Este convite foi desativado pela administração do SOMAP.'
          } else {
            conviteErrorTitle.value = 'Acesso não permitido'
            conviteError.value = err.detail
          }
        } else {
          conviteErrorTitle.value = 'Erro de validação'
          conviteError.value = err.detail || 'Não foi possível validar o convite.'
        }
      } else {
        conviteErrorTitle.value = 'Falha na conexão'
        conviteError.value = err?.message || 'Verifique sua conexão com a internet e tente novamente.'
      }

      return false
    }
  }

  async function loadSegmentos() {
    if (!convite.value) return
    try {
      loadingSegmentos.value = true
      const dados = await publicRaioXService.getSegmentos(convite.value)
      segmentos.value = dados
      if (dados.length > 0 && !selectedSegment.value && dados[0]) {
        selectedSegment.value = dados[0].codigo
      }
    } catch (err: any) {
      console.error('Erro ao carregar segmentos públicos:', err)
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
    if (!selectedPoint.value || !convite.value) return

    // Verifica se ainda tem análises restantes
    if (conviteInfo.value && conviteInfo.value.analises_restantes <= 0) {
      errorMessage.value = 'Limite de análises deste convite atingido. Solicite uma recarga ou novo convite.'
      return
    }

    const [lon, lat] = selectedPoint.value
    isLoading.value = true
    errorMessage.value = null

    try {
      if (mode.value === 'descoberta') {
        raioXData.value = null
        const res = await publicRaioXService.descobrir(lon, lat, convite.value)
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
        const res = await publicRaioXService.analisar(lon, lat, selectedSegment.value, convite.value)
        raioXData.value = res
      }

      // Atualiza o saldo de análises localmente após execução bem-sucedida
      if (conviteInfo.value && conviteInfo.value.analises_restantes > 0) {
        conviteInfo.value.analises_restantes -= 1
        conviteInfo.value.analises_usadas += 1
      }
    } catch (err: any) {
      console.error('Erro ao executar análise pública de Raio-X:', err)
      const msg = err?.message || err?.detail || 'Falha ao processar a análise.'
      errorMessage.value = msg

      if (msg.toLowerCase().includes('limite') && conviteInfo.value) {
        conviteInfo.value.analises_restantes = 0
      }

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
    convite,
    conviteInfo,
    conviteStatus,
    conviteError,
    conviteErrorTitle,
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
    validar,
    loadSegmentos,
    setMode,
    setPoint,
    executarAnalise,
    escolherSegmentoDoRanking,
    focarConcorrente,
    limpar,
  }
})
