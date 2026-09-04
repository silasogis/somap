<template>
  <div class="relative w-full h-full">
    <div id="ol-map-target" class="w-full h-full bg-gray-100 dark:bg-gray-800"></div>
    <MapSearch />
    <MapRoute />
    <RoutePanel />
    <MapNdviClimate />
    <NdviClimatePanel />
    <MapSentinelRgb />
    <SentinelRgbPanel />
    <MapPopup />
    <MapIdentifyPopup />
    <MapControls />
    <MapAttributions />
    <LegendPanel class="absolute bottom-8 left-4 z-10" />
    <LayerAttributeTable />
  </div>
</template>

<script setup lang="ts">
import { provide } from 'vue'
import { useMap } from '../../composables/useMap'
import { useLayer } from '../../composables/useLayer'
import MapControls from './MapControls.vue'
import MapSearch from './MapSearch.vue'
import MapPopup from './MapPopup.vue'
import MapIdentifyPopup from './MapIdentifyPopup.vue'
import MapAttributions from './MapAttributions.vue'
import MapRoute from './MapRoute.vue'
import RoutePanel from '../ui/RoutePanel.vue'
import MapNdviClimate from './MapNdviClimate.vue'
import NdviClimatePanel from '../ui/NdviClimatePanel.vue'
import MapSentinelRgb from './MapSentinelRgb.vue'
import SentinelRgbPanel from '../ui/SentinelRgbPanel.vue'
import LegendPanel from '../ui/LegendPanel.vue'
import LayerAttributeTable from '../layers/LayerAttributeTable.vue'

const { map } = useMap('ol-map-target')
useLayer(map)

provide('olMap', map)
</script>
