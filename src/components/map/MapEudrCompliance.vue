<script setup lang="ts">
import { inject, onMounted, onUnmounted, watch, computed, type Ref } from 'vue'
import type Map from 'ol/Map'
import { useEudrComplianceStore } from '../../stores/eudrCompliance'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import GeoJSON from 'ol/format/GeoJSON'
import { Style, Stroke, Fill } from 'ol/style'
import Draw from 'ol/interaction/Draw'
import { getArea } from 'ol/sphere'
import type Polygon from 'ol/geom/Polygon'

const map = inject<Ref<Map | null>>('olMap')
const eudrStore = useEudrComplianceStore()

// Camada para exibir a ROI desenhada (Polígono do Talhão)
const roiSource = new VectorSource()
const roiLayer = new VectorLayer({
  source: roiSource,
  zIndex: 86,
  style: new Style({
    stroke: new Stroke({
      color: '#059669', // emerald-600 (tema florestal/madeira legal)
      width: 3.5,
    }),
    fill: new Fill({
      color: 'rgba(5, 150, 105, 0.16)', // emerald com 16% opacidade
    }),
  }),
})

// Camada para renderizar os blocos (Tiles) de satélite/NDVI do Earth Engine
const ndviLayer = new TileLayer({
  zIndex: 81,
  opacity: eudrStore.tileOpacity,
  visible: false,
})

let drawInteraction: Draw | null = null

// Calcula o centroide de um polígono para consulta climática
function getPolygonCentroid(coordinates: number[][][]): [number, number] {
  let totalX = 0
  let totalY = 0
  let count = 0

  const ring = coordinates[0] || []
  const len = ring.length - 1
  const pointsToAverage = len > 0 ? ring.slice(0, len) : ring

  for (const pt of pointsToAverage) {
    if (pt && pt[0] !== undefined && pt[1] !== undefined) {
      totalX += pt[0]
      totalY += pt[1]
      count++
    }
  }

  if (count === 0) return [0, 0]
  return [totalX / count, totalY / count]
}

// Observa o modo de desenho do Store
watch(
  () => eudrStore.isDrawing,
  (drawing) => {
    if (!map?.value) return

    if (drawing) {
      roiSource.clear()
      ndviLayer.setSource(null)
      ndviLayer.setVisible(false)

      if (drawInteraction) {
        map.value.removeInteraction(drawInteraction)
      }

      drawInteraction = new Draw({
        source: roiSource,
        type: 'Polygon',
      })

      drawInteraction.on('drawend', (event) => {
        const feature = event.feature
        const geometry = feature.getGeometry() as Polygon
        if (!geometry) return

        // Calcula a área geodésica precisa em hectares usando ol/sphere
        const areaM2 = getArea(geometry)
        const areaHa = areaM2 / 10000

        const format = new GeoJSON()
        const geojson = format.writeGeometryObject(geometry, {
          featureProjection: map.value!.getView().getProjection() || 'EPSG:3857',
          dataProjection: 'EPSG:4326',
        }) as { type: 'Polygon'; coordinates: number[][][] }

        const centroidCoord = getPolygonCentroid(geojson.coordinates)
        eudrStore.setRoiCentroidAndArea(geojson, centroidCoord, areaHa)

        // Remove a interação após conclusão
        setTimeout(() => {
          if (map.value && drawInteraction) {
            map.value.removeInteraction(drawInteraction)
            drawInteraction = null
          }
        }, 100)
      })

      map.value.addInteraction(drawInteraction)
      map.value.getViewport().style.cursor = 'crosshair'
    } else {
      if (drawInteraction) {
        map.value.removeInteraction(drawInteraction)
        drawInteraction = null
      }
      if (map.value) {
        map.value.getViewport().style.cursor = ''
      }
    }
  }
)

// Observa alterações na ROI
watch(
  () => eudrStore.roi,
  (newRoi) => {
    roiSource.clear()
    if (newRoi && map?.value) {
      const format = new GeoJSON()
      const features = format.readFeatures(
        {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: newRoi,
              properties: {},
            },
          ],
        },
        {
          featureProjection: map.value.getView().getProjection() || 'EPSG:3857',
          dataProjection: 'EPSG:4326',
        }
      )
      roiSource.addFeatures(features)

      const extent = roiSource.getExtent()
      if (extent) {
        map.value.getView().fit(extent, {
          padding: [60, 60, 60, 60],
          maxZoom: 16,
          duration: 800,
        })
      }
    } else {
      ndviLayer.setSource(null)
      ndviLayer.setVisible(false)
    }
  }
)

// URL do Tile de satélite ou MapBiomas (dependente de activeLayerMode)
const activeTileUrl = computed(() => {
  return eudrStore.activeDisplayTileUrl
})

// Atualiza o source da camada de tiles quando a URL mudar
watch(
  activeTileUrl,
  (newUrl) => {
    if (!newUrl) {
      ndviLayer.setSource(null)
      ndviLayer.setVisible(false)
      return
    }

    const newSource = new XYZ({
      url: newUrl,
      crossOrigin: 'anonymous',
    })

    ndviLayer.setSource(newSource)
    ndviLayer.setVisible(eudrStore.tileVisible)
  },
  { immediate: true }
)

// Observa ajustes de opacidade e visibilidade
watch(
  () => eudrStore.tileOpacity,
  (opacity) => {
    ndviLayer.setOpacity(opacity)
  }
)

watch(
  () => eudrStore.tileVisible,
  (visible) => {
    ndviLayer.setVisible(visible && !!activeTileUrl.value)
  }
)

// Adiciona e remove as camadas no ciclo de vida do componente
onMounted(() => {
  watch(
    map!,
    (newMap) => {
      if (newMap) {
        newMap.addLayer(ndviLayer)
        newMap.addLayer(roiLayer)
      }
    },
    { immediate: true }
  )
})

onUnmounted(() => {
  if (map?.value) {
    if (drawInteraction) {
      map.value.removeInteraction(drawInteraction)
    }
    map.value.getViewport().style.cursor = ''
    map.value.removeLayer(ndviLayer)
    map.value.removeLayer(roiLayer)
  }
})
</script>

<template>
  <!-- Componente headless para controle espacial no OpenLayers -->
  <div v-if="false"></div>
</template>
