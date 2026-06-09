export interface NdviPeriodStats {
  ndvi_max: number
  ndvi_mean: number
  ndvi_min: number
  satellite: string
}

export interface NdviTileInfo {
  satellite: string
  tile_url: string
}

export interface NdviResponse {
  ndvi: Record<string, NdviPeriodStats>
  ndvi_tiles: Record<string, NdviTileInfo>
  project_info: {
    project_id: string
    status: string
  }
}

export interface PrecipitationPeriodStats {
  precipitation_daily_mean: number
  precipitation_sum: number
  source: string
}

export interface TemperaturePeriodStats {
  temperature_max_celsius: number
  temperature_mean_celsius: number
  temperature_min_celsius: number
  source: string
}

export interface ClimateResponse {
  precipitation: Record<string, PrecipitationPeriodStats>
  temperature: Record<string, TemperaturePeriodStats>
  processing_time_seconds: number
  project_info: {
    project_id: string
    status: string
  }
}

export interface SentinelRgbTileInfo {
  satellite: string
  tile_url: string
}

export interface SentinelRgbResponse {
  rgb_tiles?: Record<string, SentinelRgbTileInfo>
  tiles?: Record<string, SentinelRgbTileInfo>
  ndvi_tiles?: Record<string, SentinelRgbTileInfo>
  project_info?: {
    project_id: string
    status: string
  }
}

export class GeeApiError extends Error {
  constructor(public status: number, public data: any) {
    super(`Earth Engine API Error ${status}`)
  }
}

async function geeFetch<T>(path: string, body: any): Promise<T> {
  const baseUrl = import.meta.env.VITE_GEE_API_BASE_URL || 'https://gee.somaping.online'
  const apiKey = import.meta.env.VITE_GEE_API_KEY || 'dev-key-1'

  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    console.error('GEE API Fetch Error:', { status: res.status, data: errorData, path })
    throw new GeeApiError(res.status, errorData)
  }

  return res.json()
}

export const geeService = {
  async getNdviComposite(roi: { type: 'Polygon'; coordinates: number[][][] }, datePeriods: [string, string][]): Promise<NdviResponse> {
    return geeFetch<NdviResponse>('/ndvi_composite', {
      roi,
      date_periods: datePeriods,
    })
  },

  async getClimateStats(point: { type: 'Point'; coordinates: [number, number] }, datePeriods: [string, string][]): Promise<ClimateResponse> {
    return geeFetch<ClimateResponse>('/climate_stats', {
      point,
      date_periods: datePeriods,
    })
  },

  async getSentinelRgb(roi: { type: 'Polygon'; coordinates: number[][][] }, datePeriods: [string, string][]): Promise<SentinelRgbResponse> {
    return geeFetch<SentinelRgbResponse>('/sentinel_rgb', {
      roi,
      date_periods: datePeriods,
    })
  },
}
