export interface Segmento {
  codigo: string
  nome: string
}

export interface RaioXFaixa {
  minutos: number
  domicilios: number
  concorrentes: number
  dom_por_concorrente: number | null
  atuam_secundario?: number
  abertos_12m?: number
}

export interface ConcorrenteProps {
  nome: string
  dist_m: number
  abertura?: string
  porte?: string
  mei?: boolean
}

export interface RaioXResult {
  ponto: {
    lon: number
    lat: number
    dist_via_m: number
  }
  municipio: {
    nome: string
    dom_por_concorrente: number | null
  }
  segmento: {
    codigo: string
    nome: string
  }
  zona?: {
    sigla: string
    nome: string
  } | null
  faixas: RaioXFaixa[]
  isocronas: any // GeoJSON FeatureCollection
  concorrentes: any // GeoJSON FeatureCollection
  versao?: string
}

export type ClasseOportunidade = 'sem_concorrente' | 'oportunidade' | 'media' | 'saturado' | 'sem_media'

export interface DescobertaRankingItem {
  codigo: string
  nome: string
  domicilios_10min: number
  concorrentes_10min: number
  dom_por_concorrente: number | null
  media_municipio: number | null
  indice: number | null
  atuam_secundario: number
  classe: ClasseOportunidade
  rotulo: string
  mais_proximo_m: number | null
}

export interface DescobertaResult {
  ponto: {
    lon: number
    lat: number
    dist_via_m: number
  }
  municipio: {
    nome: string
  }
  zona?: {
    sigla: string
    nome: string
  } | null
  isocronas: any // GeoJSON FeatureCollection
  domicilios_10min: number
  abertos_12m: number
  ranking: DescobertaRankingItem[]
  versao?: string
  cache?: boolean
}

export interface ConviteValidacao {
  valido: boolean
  nome: string
  expira_em: string
  limite_analises: number
  analises_usadas: number
  analises_restantes: number
}

