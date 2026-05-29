<script setup lang="ts">
import { inject, onMounted, onUnmounted, watch, computed, ref, type Ref } from 'vue'
import type Map from 'ol/Map'
import { useNdviClimateStore } from '../../stores/ndviClimate'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import GeoJSON from 'ol/format/GeoJSON'
import { Style, Stroke, Fill } from 'ol/style'
import Draw from 'ol/interaction/Draw'

const map = inject<Ref<Map | null>>('olMap')
const ndviClimateStore = useNdviClimateStore()

// Camada para exibir a ROI desenhada (Polígono)
const roiSource = new VectorSource()
const roiLayer = new VectorLayer({
  source: roiSource,
  zIndex: 85,
  style: new Style({
    stroke: new Stroke({
      color: '#0d9488', // teal-600
      width: 3.5,
    }),
    fill: new Fill({
      color: 'rgba(13, 148, 136, 0.12)', // teal-600 com 12% opacidade
    }),
  }),
})

// Camada para renderizar os blocos (Tiles) de NDVI do Earth Engine
const ndviLayer = new TileLayer({
  zIndex: 80,
  opacity: ndviClimateStore.tileOpacity,
  visible: false,
})

let drawInteraction: Draw | null = null

// Calcula o centroide de um polígono simples para uso nas estatísticas climáticas
function getPolygonCentroid(coordinates: number[][][]): [number, number] {
  let totalX = 0
  let totalY = 0
  let count = 0
  
  const ring = coordinates[0] || []
  // Um polígono fechado tem o primeiro e o último ponto iguais
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

// Observa o modo de desenho do Store para adicionar/remover interação no OpenLayers
watch(() => ndviClimateStore.isDrawing, (drawing) => {
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
      const geometry = feature.getGeometry()
      if (!geometry) return

      const format = new GeoJSON()
      const geojson = format.writeGeometryObject(geometry, {
        featureProjection: map.value!.getView().getProjection() || 'EPSG:3857',
        dataProjection: 'EPSG:4326',
      }) as { type: 'Polygon'; coordinates: number[][][] }

      const centroidCoord = getPolygonCentroid(geojson.coordinates)
      ndviClimateStore.setRoiAndCentroid(geojson, centroidCoord)

      // Remove a interação após conclusão
      setTimeout(() => {
        if (map.value && drawInteraction) {
          map.value.removeInteraction(drawInteraction)
          drawInteraction = null
        }
      }, 50)
    })

    map.value.addInteraction(drawInteraction)
    
    // Mudar cursor do mapa para indicar modo de desenho
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
})

// Observa se a ROI no Store foi apagada para limpar a camada no mapa
watch(() => ndviClimateStore.roi, (newRoi) => {
  roiSource.clear()
  if (newRoi && map?.value) {
    const format = new GeoJSON()
    const features = format.readFeatures(
      {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: newRoi,
          properties: {}
        }]
      },
      {
        featureProjection: map.value.getView().getProjection() || 'EPSG:3857',
        dataProjection: 'EPSG:4326'
      }
    )
    roiSource.addFeatures(features)

    // Ajustar visualização para focar no polígono desenhado
    const extent = roiSource.getExtent()
    if (extent) {
      map.value.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 1000 })
    }
  }
}, { deep: true })

// Computa a URL de Tiles correta para o período selecionado
const currentTileUrl = computed(() => {
  const periodKey = ndviClimateStore.selectedPeriodKey
  return ndviClimateStore.ndviData?.ndvi_tiles?.[periodKey]?.tile_url || null
})

// Atualiza a fonte de dados da camada de Tiles NDVI
watch(currentTileUrl, (newUrl) => {
  if (newUrl) {
    const source = new XYZ({
      url: newUrl,
      crossOrigin: 'anonymous',
    })
    ndviLayer.setSource(source)
    ndviLayer.setVisible(ndviClimateStore.tileVisible)
  } else {
    ndviLayer.setSource(null)
    ndviLayer.setVisible(false)
  }
})

// Atualiza a opacidade e a visibilidade da camada NDVI
watch(() => ndviClimateStore.tileOpacity, (opacity) => {
  ndviLayer.setOpacity(opacity)
})

watch(() => ndviClimateStore.tileVisible, (visible) => {
  if (ndviLayer.getSource()) {
    ndviLayer.setVisible(visible)
  }
})

// Observa o carregamento de dados para mudar cursor
watch(() => ndviClimateStore.isLoading, (loading) => {
  if (map?.value) {
    const viewport = map.value.getViewport()
    viewport.style.cursor = loading ? 'wait' : ''
  }
})

onMounted(() => {
  watch(map!, (newMap) => {
    if (newMap) {
      newMap.addLayer(ndviLayer)
      newMap.addLayer(roiLayer)
    }
  }, { immediate: true })
})

onUnmounted(() => {
  if (map?.value) {
    map.value.removeLayer(ndviLayer)
    map.value.removeLayer(roiLayer)
    if (drawInteraction) {
      map.value.removeInteraction(drawInteraction)
    }
    map.value.getViewport().style.cursor = ''
  }
})
</script>

<template>
  <!-- Componente funcional sem marcação DOM -->
  <div v-if="false"></div>
</template>
