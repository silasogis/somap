import type { LayerConfig } from '../../types';

export const mockLayers: LayerConfig[] = [
  {
    id: 'osm-base',
    name: 'OpenStreetMap',
    workspaceId: 'ws-1',
    type: 'xyz',
    visible: true,
    opacity: 1,
    zIndex: 0,
    basemap: true,
    source: {
      url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    },
    attribution: '© OpenStreetMap contributors',
    bbox: [-73.99, -33.75, -34.79, 5.27]
  },
  {
    id: 'cartodb-dark',
    name: 'CartoDB Dark Matter',
    workspaceId: 'ws-1',
    type: 'xyz',
    visible: false,
    opacity: 1,
    zIndex: 5,
    basemap: true,
    source: {
      url: 'https://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
    },
    attribution: '© OpenStreetMap contributors, © CARTO',
    bbox: [-73.99, -33.75, -34.79, 5.27]
  },
  {
    id: 'ibge-municipios',
    name: 'Municípios — IBGE',
    workspaceId: 'ws-1',
    type: 'wms',
    visible: true,
    opacity: 0.7,
    zIndex: 10,
    basemap: false,
    source: {
      url: 'https://geoservicos.ibge.gov.br/geoserver/wms',
      layers: 'CCAR:BC250_Municipio_A',
      params: { FORMAT: 'image/png', TRANSPARENT: 'TRUE' }
    },
    attribution: '© IBGE',
    bbox: [-73.99, -33.75, -34.79, 5.27]
  },
  {
    id: 'ibge-rodovias',
    name: 'Rodovias — IBGE',
    workspaceId: 'ws-1',
    type: 'wms',
    visible: false,
    opacity: 1,
    zIndex: 20,
    basemap: false,
    source: {
      url: 'https://geoservicos.ibge.gov.br/geoserver/wms',
      layers: 'CCAR:BC250_Trecho_Rodoviario_L',
      params: { FORMAT: 'image/png', TRANSPARENT: 'TRUE' }
    },
    attribution: '© IBGE',
    bbox: [-73.99, -33.75, -34.79, 5.27]
  },
  {
    id: 'areas-conservacao-mock',
    name: 'Áreas de Conservação (Polígonos)',
    workspaceId: 'ws-1',
    type: 'geojson',
    visible: true,
    opacity: 0.85,
    zIndex: 25,
    basemap: false,
    source: {
      url: `${import.meta.env.BASE_URL}mock/areas-conservacao.geojson`
    },
    style: {
      color: '#10b981',
      fillColor: 'rgba(16, 185, 129, 0.25)',
      strokeWidth: 2,
      strokeColor: '#059669'
    },
    bbox: [-54.40, -26.10, -44.75, -23.30]
  },
  {
    id: 'pontos-mock',
    name: 'Pontos de interesse (mock)',
    workspaceId: 'ws-1',
    type: 'geojson',
    visible: true,
    opacity: 1,
    zIndex: 30,
    basemap: false,
    source: {
      url: `${import.meta.env.BASE_URL}mock/pontos-interesse.geojson`
    },
    style: {
      color: '#E24B4A',
      fillColor: '#FCEBEB',
      strokeWidth: 2,
      strokeColor: '#A32D2D'
    },
    bbox: [-51.30, -30.10, -43.10, -15.70]
  }
];
