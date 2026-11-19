import type { Segmento, RaioXResult, DescobertaResult, ConviteValidacao } from '../types/raioX'
import type { NominatimResult } from '../types/geocoding'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

export class PublicRaioXError extends Error {
  constructor(
    public status: number,
    public detail: string
  ) {
    super(detail)
    this.name = 'PublicRaioXError'
  }
}

async function requestPublic<T>(path: string, convite?: string): Promise<T> {
  const url = new URL(`${BASE_URL}/api/public/raio-x${path}`, window.location.origin)
  
  if (convite) {
    url.searchParams.set('convite', convite)
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (convite) {
    headers['X-Convite'] = convite
  }

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers,
  })

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null)
    const detail = errorBody?.detail || `Erro na requisição (${res.status})`
    throw new PublicRaioXError(res.status, detail)
  }

  return await res.json()
}

export const publicRaioXService = {
  /**
   * Valida se um código de convite é válido, ativo, não expirado e possui saldo de análises.
   */
  async validarConvite(convite: string): Promise<ConviteValidacao> {
    return requestPublic<ConviteValidacao>('/validar', convite)
  },

  /**
   * Retorna os segmentos de negócios disponíveis para consulta (não consome cota).
   */
  async getSegmentos(convite: string): Promise<Segmento[]> {
    return requestPublic<Segmento[]>('/segmentos', convite)
  },

  /**
   * Executa a análise direta de um segmento comercial em um ponto específico.
   * Consome 1 análise do convite.
   */
  async analisar(lon: number, lat: number, segmento: string, convite: string): Promise<RaioXResult> {
    const params = new URLSearchParams({
      lon: lon.toString(),
      lat: lat.toString(),
      segmento,
    })
    return requestPublic<RaioXResult>(`/analise?${params.toString()}`, convite)
  },

  /**
   * Executa o modo descoberta (multissegmento) para avaliar o potencial do ponto.
   * Consome 1 análise do convite.
   */
  async descobrir(lon: number, lat: number, convite: string): Promise<DescobertaResult> {
    const params = new URLSearchParams({
      lon: lon.toString(),
      lat: lat.toString(),
    })
    return requestPublic<DescobertaResult>(`/descoberta?${params.toString()}`, convite)
  },

  /**
   * Geocodificação pública de endereços em Curitiba/RMC (não consome cota).
   */
  async geocode(q: string, convite: string): Promise<NominatimResult[]> {
    try {
      const params = new URLSearchParams({ q, limit: '5' })
      const res = await requestPublic<any[]>(`/geocode?${params.toString()}`, convite)
      if (Array.isArray(res)) {
        return res.map((item: any, i: number): NominatimResult => ({
          place_id: item.place_id || i + 1,
          licence: item.licence || '',
          osm_type: item.osm_type || 'node',
          osm_id: item.osm_id || i + 1,
          boundingbox: item.boundingbox || ['', '', '', ''],
          lat: item.lat?.toString() || '0',
          lon: item.lon?.toString() || '0',
          display_name: item.nome || item.display_name || item.endereco || '',
          class: item.class || 'place',
          type: item.type || 'point',
          importance: item.importance || 0,
          address: item.address || {}
        }))
      }
      return []
    } catch {
      // Fallback para o geocodingService padrão do projeto se o endpoint específico falhar
      const { geocodingService } = await import('./geocodingService')
      return await geocodingService.search(q)
    }
  }
}
