/**
 * Utilitários para processamento geométrico e memorial simplificado do EUDR
 */

export interface EudrVertexInfo {
  index: number
  label: string
  lat: number
  lng: number
  latDms: string
  lngDms: string
  distanceToNextMeters: number
  directionToNext: string
  nextLabel: string
}

export interface EudrCroquiDimensions {
  minLng: number
  maxLng: number
  minLat: number
  maxLat: number
  widthMeters: number
  heightMeters: number
  totalPerimeterMeters: number
  aspectRatio: number
}

/**
 * Converte coordenada decimal em Graus, Minutos e Segundos (GMS) amigável para leigos
 */
export function toDMS(coordinate: number, isLatitude: boolean): string {
  const absolute = Math.abs(coordinate)
  const degrees = Math.floor(absolute)
  const minutesNotTruncated = (absolute - degrees) * 60
  const minutes = Math.floor(minutesNotTruncated)
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(1)
  const direction = isLatitude
    ? coordinate >= 0
      ? 'N'
      : 'S'
    : coordinate >= 0
      ? 'L'
      : 'O'
  return `${degrees}° ${minutes}' ${seconds}" ${direction}`
}

/**
 * Distância geodésica entre duas coordenadas WGS84 em metros (Fórmula de Haversine)
 */
export function calculateDistanceMeters(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const R = 6371000 // Raio médio da Terra em metros
  const [lon1, lat1] = coord1
  const [lon2, lat2] = coord2

  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Direção cardeal aproximada do segmento (Azimute amigável)
 */
export function calculateBearingDirection(
  coord1: [number, number],
  coord2: [number, number]
): string {
  const [lon1, lat1] = coord1
  const [lon2, lat2] = coord2

  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180)
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180)

  let brng = (Math.atan2(y, x) * 180) / Math.PI
  brng = (brng + 360) % 360

  const directions = [
    'Norte (N)',
    'Nordeste (NE)',
    'Leste (L)',
    'Sudeste (SE)',
    'Sul (S)',
    'Sudoeste (SO)',
    'Oeste (O)',
    'Noroeste (NO)',
  ]
  const index = Math.round(brng / 45) % 8
  return directions[index] ?? 'Norte (N)'
}

/**
 * Extrai o anel exterior e remove o ponto de fechamento redundante
 */
export function getCleanRing(coordinates: number[][][]): [number, number][] {
  if (!coordinates || !coordinates[0] || coordinates[0].length === 0) return []
  const ring = coordinates[0] as [number, number][]
  if (ring.length > 3) {
    const first = ring[0]
    const last = ring[ring.length - 1]
    if (
      first &&
      last &&
      Math.abs(first[0] - last[0]) < 1e-7 &&
      Math.abs(first[1] - last[1]) < 1e-7
    ) {
      return ring.slice(0, ring.length - 1)
    }
  }
  return ring
}

/**
 * Calcula dimensões e métricas envolventes do polígono
 */
export function calculateCroquiDimensions(ring: [number, number][]): EudrCroquiDimensions {
  if (ring.length === 0) {
    return {
      minLng: 0,
      maxLng: 0,
      minLat: 0,
      maxLat: 0,
      widthMeters: 0,
      heightMeters: 0,
      totalPerimeterMeters: 0,
      aspectRatio: 1,
    }
  }

  let minLng = Infinity
  let maxLng = -Infinity
  let minLat = Infinity
  let maxLat = -Infinity

  for (const pt of ring) {
    if (pt[0] < minLng) minLng = pt[0]
    if (pt[0] > maxLng) maxLng = pt[0]
    if (pt[1] < minLat) minLat = pt[1]
    if (pt[1] > maxLat) maxLat = pt[1]
  }

  const midLat = (minLat + maxLat) / 2
  const midLng = (minLng + maxLng) / 2

  const widthMeters = calculateDistanceMeters([minLng, midLat], [maxLng, midLat])
  const heightMeters = calculateDistanceMeters([midLng, minLat], [midLng, maxLat])

  let totalPerimeterMeters = 0
  const n = ring.length
  for (let i = 0; i < n; i++) {
    const curr = ring[i]
    const next = ring[(i + 1) % n]
    if (curr && next) {
      totalPerimeterMeters += calculateDistanceMeters(curr, next)
    }
  }

  const aspectRatio = heightMeters > 0 ? widthMeters / heightMeters : 1

  return {
    minLng,
    maxLng,
    minLat,
    maxLat,
    widthMeters,
    heightMeters,
    totalPerimeterMeters,
    aspectRatio,
  }
}

/**
 * Gera lista de vértices explicados para a tabela do memorial
 */
export function generateVerticesList(ring: [number, number][]): EudrVertexInfo[] {
  const n = ring.length
  if (n === 0) return []

  const list: EudrVertexInfo[] = []

  for (let i = 0; i < n; i++) {
    const curr = ring[i]
    const next = ring[(i + 1) % n]
    if (!curr || !next) continue

    const dist = calculateDistanceMeters(curr, next)
    const dir = calculateBearingDirection(curr, next)

    list.push({
      index: i + 1,
      label: `V${i + 1}`,
      lat: curr[1],
      lng: curr[0],
      latDms: toDMS(curr[1], true),
      lngDms: toDMS(curr[0], false),
      distanceToNextMeters: Math.round(dist),
      directionToNext: dir,
      nextLabel: `V${((i + 1) % n) + 1}`,
    })
  }

  return list
}

export interface SvgCroquiData {
  viewBox: string
  polygonPoints: string
  vertices: {
    label: string
    x: number
    y: number
  }[]
  centroid: {
    x: number
    y: number
  }
  gridLines: {
    x1: number
    y1: number
    x2: number
    y2: number
    label?: string
  }[]
  scaleBar: {
    x: number
    y: number
    lengthPx: number
    metersLabel: string
  }
}

/**
 * Converte as coordenadas do polígono para coordenadas SVG preservando a proporção métrica real
 */
export function buildSvgCroqui(
  ring: [number, number][],
  centroidCoord: [number, number],
  svgWidth = 560,
  svgHeight = 360,
  padding = 44
): SvgCroquiData {
  if (ring.length === 0) {
    return {
      viewBox: `0 0 ${svgWidth} ${svgHeight}`,
      polygonPoints: '',
      vertices: [],
      centroid: { x: svgWidth / 2, y: svgHeight / 2 },
      gridLines: [],
      scaleBar: { x: 40, y: svgHeight - 30, lengthPx: 60, metersLabel: '100 m' },
    }
  }

  const dims = calculateCroquiDimensions(ring)
  const midLat = (dims.minLat + dims.maxLat) / 2
  const cosMidLat = Math.cos((midLat * Math.PI) / 180)

  // Coordenadas métricas planas locais relativas ao centro
  const toLocalMeters = (pt: [number, number]): { x: number; y: number } => {
    const R = 6371000
    const x = ((pt[0] - dims.minLng) * Math.PI / 180) * R * cosMidLat
    const y = ((pt[1] - dims.minLat) * Math.PI / 180) * R
    return { x, y }
  }

  const metricRing = ring.map(toLocalMeters)
  const metricCentroid = toLocalMeters(centroidCoord)

  // Bounding box métrico
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  for (const p of metricRing) {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
  }

  const rangeX = maxX - minX || 100
  const rangeY = maxY - minY || 100

  const availableWidth = svgWidth - padding * 2
  const availableHeight = svgHeight - padding * 2

  // Escala uniforme para preservar a forma cartográfica
  const scale = Math.min(availableWidth / rangeX, availableHeight / rangeY)

  const offsetX = padding + (availableWidth - rangeX * scale) / 2
  const offsetY = padding + (availableHeight - rangeY * scale) / 2

  // Transforma ponto métrico em ponto SVG (com Y invertido)
  const toSvg = (p: { x: number; y: number }): { x: number; y: number } => {
    const x = offsetX + (p.x - minX) * scale
    const y = svgHeight - (offsetY + (p.y - minY) * scale)
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) }
  }

  const svgPoints = metricRing.map(toSvg)
  const polygonPointsStr = svgPoints.map((p) => `${p.x},${p.y}`).join(' ')

  const vertices = svgPoints.map((p, idx) => ({
    label: `V${idx + 1}`,
    x: p.x,
    y: p.y,
  }))

  const svgCentroid = toSvg(metricCentroid)

  // Grade cartográfica sutil (Grid de 5 colunas x 4 linhas)
  const gridLines: SvgCroquiData['gridLines'] = []
  const cols = 5
  const rows = 4

  for (let c = 1; c < cols; c++) {
    const gx = padding + (availableWidth * c) / cols
    gridLines.push({
      x1: Number(gx.toFixed(1)),
      y1: padding / 2,
      x2: Number(gx.toFixed(1)),
      y2: svgHeight - padding / 2,
    })
  }

  for (let r = 1; r < rows; r++) {
    const gy = padding + (availableHeight * r) / rows
    gridLines.push({
      x1: padding / 2,
      y1: Number(gy.toFixed(1)),
      x2: svgWidth - padding / 2,
      y2: Number(gy.toFixed(1)),
    })
  }

  // Barra de escala métrica arredondada (ex: 50m, 100m, 200m, 500m, 1km, 2km)
  const targetPx = 80
  const metersForTarget = targetPx / scale
  const niceNumbers = [10, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000, 10000]
  let chosenMeters = niceNumbers[0] ?? 100
  for (const n of niceNumbers) {
    if (Math.abs(n - metersForTarget) < Math.abs(chosenMeters - metersForTarget)) {
      chosenMeters = n
    }
  }

  const scaleLengthPx = Number((chosenMeters * scale).toFixed(1))
  const metersLabel = chosenMeters >= 1000 ? `${chosenMeters / 1000} km` : `${chosenMeters} m`

  const scaleBar = {
    x: padding,
    y: svgHeight - 20,
    lengthPx: scaleLengthPx,
    metersLabel,
  }

  return {
    viewBox: `0 0 ${svgWidth} ${svgHeight}`,
    polygonPoints: polygonPointsStr,
    vertices,
    centroid: svgCentroid,
    gridLines,
    scaleBar,
  }
}
