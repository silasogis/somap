import { ref } from 'vue'
import type OLMap from 'ol/Map'
import BaseLayer from 'ol/layer/Base'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import GeoJSON from 'ol/format/GeoJSON'
import { transformExtent } from 'ol/proj'
import type { Extent } from 'ol/extent'
import { isEmpty, createEmpty, extend } from 'ol/extent'
import { Style, Stroke, Fill, Circle as CircleStyle } from 'ol/style'
import { useMapStore } from '../stores/map'
import type { LayerConfig } from '../types'

// Global layer registry shared across the app
export const olLayersRegistry = new Map<string, BaseLayer>()

// Highlight Vector Source and Layer
const highlightSource = new VectorSource()
const highlightLayer = new VectorLayer({
  source: highlightSource,
  zIndex: 999,
  style: (feature) => {
    const geomType = feature.getGeometry()?.getType()
    if (geomType === 'Point' || geomType === 'MultiPoint') {
      return new Style({
        image: new CircleStyle({
          radius: 10,
          fill: new Fill({ color: '#f59e0b' }), // Amber / Gold highlight
          stroke: new Stroke({ color: '#ffffff', width: 3 })
        })
      })
    }
    return new Style({
      stroke: new Stroke({
        color: '#f59e0b',
        width: 5
      }),
      fill: new Fill({
        color: 'rgba(245, 158, 11, 0.35)'
      })
    })
  }
})

let isHighlightLayerAttached = false

// Helper to clean and format feature properties
function parseGeoJsonFeatures(rawFeatures: any[], projection = 'EPSG:3857') {
  const geojsonFormat = new GeoJSON()
  return rawFeatures.map((f: any, idx: number) => {
    const rawProps = f.properties || {}
    const cleanProps: Record<string, any> = {}
    for (const [k, v] of Object.entries(rawProps)) {
      if (
        k !== 'geometry' &&
        k !== 'geom' &&
        k !== 'the_geom' &&
        k !== 'bbox' &&
        k !== 'boundedBy' &&
        !k.startsWith('ol_')
      ) {
        cleanProps[k] = v
      }
    }

    let olFeature: Feature | undefined
    if (f.geometry) {
      try {
        olFeature = geojsonFormat.readFeature(f, {
          dataProjection: 'EPSG:4326',
          featureProjection: projection
        }) as Feature
      } catch {
        // Ignore geometry read errors
      }
    }

    return {
      id: f.id ?? rawProps.id ?? rawProps.gid ?? rawProps.codigo ?? rawProps.nome ?? rawProps.name ?? idx + 1,
      properties: cleanProps,
      geometry: f.geometry,
      feature: olFeature
    }
  })
}

// Helper to query WFS endpoints from GeoServer / OGC
async function fetchWfsFeatures(layer: LayerConfig): Promise<any[]> {
  const url = layer.source?.url
  const layerName = layer.source?.layers || layer.name
  if (!url) return []

  const candidateUrls: string[] = []

  try {
    const parsed = new URL(url)

    // 1. GeoServer /wfs endpoint (replacing /wms with /wfs)
    const wfsPath = parsed.pathname.replace(/\/wms\/?$/i, '/wfs')
    
    const urlA = new URL(url)
    urlA.pathname = wfsPath
    urlA.search = ''
    urlA.searchParams.set('service', 'WFS')
    urlA.searchParams.set('version', '1.1.0')
    urlA.searchParams.set('request', 'GetFeature')
    if (layerName) urlA.searchParams.set('typeName', layerName)
    urlA.searchParams.set('outputFormat', 'application/json')
    urlA.searchParams.set('srsname', 'EPSG:4326')
    candidateUrls.push(urlA.toString())

    // 2. GeoServer WFS with typeNames (WFS 2.0.0)
    const urlA2 = new URL(url)
    urlA2.pathname = wfsPath
    urlA2.search = ''
    urlA2.searchParams.set('service', 'WFS')
    urlA2.searchParams.set('version', '2.0.0')
    urlA2.searchParams.set('request', 'GetFeature')
    if (layerName) urlA2.searchParams.set('typeNames', layerName)
    urlA2.searchParams.set('outputFormat', 'application/json')
    urlA2.searchParams.set('srsname', 'EPSG:4326')
    candidateUrls.push(urlA2.toString())

    // 3. GeoServer /ows endpoint
    const owsPath = parsed.pathname.replace(/\/wms\/?$/i, '/ows')
    const urlB = new URL(url)
    urlB.pathname = owsPath
    urlB.search = ''
    urlB.searchParams.set('service', 'WFS')
    urlB.searchParams.set('version', '1.0.0')
    urlB.searchParams.set('request', 'GetFeature')
    if (layerName) urlB.searchParams.set('typeName', layerName)
    urlB.searchParams.set('outputFormat', 'application/json')
    candidateUrls.push(urlB.toString())

    // 4. Same URL with WFS parameters
    const urlC = new URL(url)
    urlC.searchParams.set('service', 'WFS')
    urlC.searchParams.set('version', '1.1.0')
    urlC.searchParams.set('request', 'GetFeature')
    if (layerName) urlC.searchParams.set('typeName', layerName)
    urlC.searchParams.set('outputFormat', 'application/json')
    candidateUrls.push(urlC.toString())
  } catch {
    const sep = url.includes('?') ? '&' : '?'
    if (layerName) {
      candidateUrls.push(`${url}${sep}service=WFS&version=1.1.0&request=GetFeature&typeName=${encodeURIComponent(layerName)}&outputFormat=application/json`)
    }
  }

  // 5. Backend proxy endpoint
  candidateUrls.push(`/api/layers/${layer.id}/data`)

  for (const targetUrl of candidateUrls) {
    try {
      const res = await fetch(targetUrl)
      if (res.ok) {
        const text = await res.text()
        try {
          const data = JSON.parse(text)
          if (data && data.features && Array.isArray(data.features) && data.features.length > 0) {
            return data.features
          }
        } catch {
          // Response wasn't valid JSON (might be XML error), try next
        }
      }
    } catch {
      // Network/CORS failure for this URL, try next
    }
  }

  return []
}

export function useLayerFeatures() {
  const mapStore = useMapStore()
  const loadingFeatures = ref(false)

  let highlightTimeout: ReturnType<typeof setTimeout> | null = null

  function ensureHighlightLayer(map: OLMap) {
    if (!isHighlightLayerAttached || !map.getLayers().getArray().includes(highlightLayer)) {
      map.addLayer(highlightLayer)
      isHighlightLayerAttached = true
    }
  }

  function clearHighlight() {
    if (highlightTimeout) {
      clearTimeout(highlightTimeout)
      highlightTimeout = null
    }
    highlightSource.clear()
  }

  function highlightFeature(feature: Feature | any, zoomTo = true, autoClearMs = 4000) {
    if (!mapStore.mapInstance) return
    ensureHighlightLayer(mapStore.mapInstance)
    
    if (highlightTimeout) {
      clearTimeout(highlightTimeout)
      highlightTimeout = null
    }
    highlightSource.clear()

    let olFeature: Feature | null = null
    if (feature instanceof Feature) {
      olFeature = feature.clone()
    } else if (feature && feature.geometry) {
      const geojsonFormat = new GeoJSON()
      try {
        olFeature = geojsonFormat.readFeature(feature, {
          featureProjection: mapStore.projection,
          dataProjection: 'EPSG:4326'
        }) as Feature
      } catch (err) {
        console.warn('Erro ao converter geometria para destaque:', err)
      }
    }

    if (olFeature && olFeature.getGeometry()) {
      highlightSource.addFeature(olFeature)

      if (zoomTo) {
        const geom = olFeature.getGeometry()
        if (geom) {
          const extent = geom.getExtent()
          const geomType = geom.getType()
          if (geomType === 'Point') {
            const coords = (geom as any).getCoordinates()
            mapStore.mapInstance.getView().animate({
              center: coords,
              zoom: Math.max(mapStore.mapInstance.getView().getZoom() || 14, 15),
              duration: 700
            })
          } else {
            mapStore.fitExtent(extent, {
              padding: [80, 80, 80, 80],
              duration: 700,
              maxZoom: 16
            })
          }
        }
      }

      // Auto-remover o destaque laranja após alguns segundos
      if (autoClearMs > 0) {
        highlightTimeout = setTimeout(() => {
          highlightSource.clear()
          highlightTimeout = null
        }, autoClearMs)
      }
    }
  }

  async function getLayerFeatures(layer: LayerConfig): Promise<Array<{ id: string | number; properties: Record<string, any>; geometry: any; feature?: Feature }>> {
    if (layer.type === 'xyz' || layer.basemap) {
      return []
    }

    // 1. Check if OpenLayers Vector Source already has features in memory
    const olLayer = olLayersRegistry.get(layer.id)
    if (olLayer && olLayer instanceof VectorLayer) {
      const source = olLayer.getSource() as VectorSource
      const features = source?.getFeatures()
      if (features && features.length > 0) {
        const geojsonFormat = new GeoJSON()
        return features.map((f, idx) => {
          const rawProps = f.getProperties()
          const cleanProps: Record<string, any> = {}
          for (const [k, v] of Object.entries(rawProps)) {
            if (k !== 'geometry' && k !== 'geom' && k !== 'the_geom' && !k.startsWith('ol_')) {
              cleanProps[k] = v
            }
          }
          const geom = f.getGeometry()
          return {
            id: f.getId() ?? rawProps.id ?? rawProps.gid ?? rawProps.nome ?? rawProps.name ?? idx + 1,
            properties: cleanProps,
            geometry: geom ? geojsonFormat.writeGeometryObject(geom, {
              featureProjection: mapStore.projection,
              dataProjection: 'EPSG:4326'
            }) : null,
            feature: f
          }
        })
      }
    }

    // 2. If layer is GeoJSON and has a direct source URL
    if (layer.type === 'geojson' && layer.source?.url) {
      loadingFeatures.value = true
      try {
        const res = await fetch(layer.source.url)
        if (res.ok) {
          const data = await res.json()
          if (data && data.features) {
            return parseGeoJsonFeatures(data.features, mapStore.projection)
          }
        }
      } catch (err) {
        console.warn(`Erro ao carregar GeoJSON da camada ${layer.name}:`, err)
      } finally {
        loadingFeatures.value = false
      }
    }

    // 3. If layer is WMS / WFS (GeoServer / OGC Service)
    if (layer.type === 'wms' || layer.type === 'wfs') {
      loadingFeatures.value = true
      try {
        const wfsFeatures = await fetchWfsFeatures(layer)
        if (wfsFeatures && wfsFeatures.length > 0) {
          return parseGeoJsonFeatures(wfsFeatures, mapStore.projection)
        }
      } catch (err) {
        console.warn(`Erro ao consultar WFS GetFeature para a camada ${layer.name}:`, err)
      } finally {
        loadingFeatures.value = false
      }
    }

    // 4. Try fallback API endpoint: /api/layers/:id/data
    try {
      const res = await fetch(`/api/layers/${layer.id}/data`)
      if (res.ok) {
        const data = await res.json()
        if (data && data.features) {
          return parseGeoJsonFeatures(data.features, mapStore.projection)
        }
      }
    } catch {
      // Ignore fallback error
    }

    return []
  }

  async function zoomToLayerExtent(layer: LayerConfig) {
    if (!mapStore.mapInstance) return

    // 1. Check Vector Layer from OpenLayers
    const olLayer = olLayersRegistry.get(layer.id)
    if (olLayer && olLayer instanceof VectorLayer) {
      const source = olLayer.getSource() as VectorSource
      if (source) {
        const extent = source.getExtent()
        if (extent && !isEmpty(extent) && isFinite(extent[0] ?? NaN) && isFinite(extent[1] ?? NaN)) {
          mapStore.fitExtent(extent, {
            padding: [60, 60, 60, 60],
            duration: 800,
            maxZoom: 16
          })
          return
        }
      }
    }

    // 2. Check Layer BBOX configured on LayerConfig (lon/lat bounds: [minX, minY, maxX, maxY])
    if (layer.bbox && layer.bbox.length === 4) {
      try {
        const [minX, minY, maxX, maxY] = layer.bbox
        const extent3857 = transformExtent([minX, minY, maxX, maxY], 'EPSG:4326', mapStore.projection)
        mapStore.fitExtent(extent3857, {
          padding: [60, 60, 60, 60],
          duration: 800
        })
        return
      } catch (err) {
        console.warn('Falha ao aplicar bbox da camada:', err)
      }
    }

    // 3. Compute extent from fetched features (GeoJSON or WFS)
    if (layer.type === 'geojson' || layer.type === 'wms' || layer.type === 'wfs') {
      const features = await getLayerFeatures(layer)
      if (features.length > 0) {
        const geojsonFormat = new GeoJSON()
        const fullExtent: Extent = createEmpty()
        features.forEach(f => {
          if (f.geometry) {
            try {
              const geom = geojsonFormat.readGeometry(f.geometry, {
                dataProjection: 'EPSG:4326',
                featureProjection: mapStore.projection
              })
              extend(fullExtent, geom.getExtent())
            } catch {
              // Ignore single geometry calculation issue
            }
          }
        })
        if (!isEmpty(fullExtent)) {
          mapStore.fitExtent(fullExtent, {
            padding: [60, 60, 60, 60],
            duration: 800,
            maxZoom: 16
          })
          return
        }
      }
    }

    // 4. Default fallback: Brazil bounding box / center
    const defaultBrazilBbox: [number, number, number, number] = [-73.99, -33.75, -34.79, 5.27]
    const defaultExtent = transformExtent(defaultBrazilBbox, 'EPSG:4326', mapStore.projection)
    mapStore.fitExtent(defaultExtent, {
      padding: [40, 40, 40, 40],
      duration: 800
    })
  }

  return {
    olLayersRegistry,
    highlightFeature,
    clearHighlight,
    getLayerFeatures,
    zoomToLayerExtent,
    loadingFeatures
  }
}
