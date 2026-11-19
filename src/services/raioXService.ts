import { apiFetch } from './api'
import type { Segmento, RaioXResult, DescobertaResult } from '../types/raioX'

// Por padrão consome o backend oficial SOMAP (VITE_API_BASE_URL)
// Se VITE_RAIO_X_API_URL estiver definido, permite apontar para uma URL alternativa
const RAIO_X_CUSTOM_URL = import.meta.env.VITE_RAIO_X_API_URL

async function requestRaioX<T>(path: string): Promise<T> {
  if (RAIO_X_CUSTOM_URL && RAIO_X_CUSTOM_URL !== 'main') {
    const base = RAIO_X_CUSTOM_URL.replace(/\/$/, '')
    const res = await fetch(`${base}/api${path}`)
    if (!res.ok) {
      const err = await res.json().catch(() => null)
      throw new Error(err?.detail || `Erro ${res.status}`)
    }
    return await res.json()
  }

  // Consumo direto do backend oficial SOMAP via apiFetch
  return apiFetch<T>(path)
}

export const raioXService = {
  async getSegmentos(): Promise<Segmento[]> {
    return requestRaioX<Segmento[]>('/segmentos')
  },

  async analisar(lon: number, lat: number, segmento: string): Promise<RaioXResult> {
    const params = new URLSearchParams({
      lon: lon.toString(),
      lat: lat.toString(),
      segmento,
    })
    return requestRaioX<RaioXResult>(`/raio-x?${params.toString()}`)
  },

  async descobrir(lon: number, lat: number): Promise<DescobertaResult> {
    const params = new URLSearchParams({
      lon: lon.toString(),
      lat: lat.toString(),
    })
    return requestRaioX<DescobertaResult>(`/descoberta?${params.toString()}`)
  },
}
