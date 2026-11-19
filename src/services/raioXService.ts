import { apiFetch } from './api'
import type { Segmento, RaioXResult, DescobertaResult } from '../types/raioX'

const BASE_PATH = import.meta.env.VITE_RAIO_X_API_PATH ?? ''

export const raioXService = {
  async getSegmentos(): Promise<Segmento[]> {
    return apiFetch<Segmento[]>(`${BASE_PATH}/segmentos`)
  },

  async analisar(lon: number, lat: number, segmento: string): Promise<RaioXResult> {
    const params = new URLSearchParams({
      lon: lon.toString(),
      lat: lat.toString(),
      segmento,
    })
    return apiFetch<RaioXResult>(`${BASE_PATH}/raio-x?${params.toString()}`)
  },

  async descobrir(lon: number, lat: number): Promise<DescobertaResult> {
    const params = new URLSearchParams({
      lon: lon.toString(),
      lat: lat.toString(),
    })
    return apiFetch<DescobertaResult>(`${BASE_PATH}/descoberta?${params.toString()}`)
  },
}
