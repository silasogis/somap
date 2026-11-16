import { http, HttpResponse } from 'msw';
import { mockLayers } from '../data/layers';
import type { LayerConfig } from '../../types';

export const layerHandlers = [
  http.get('/api/workspaces', () => {
    return HttpResponse.json([
      { id: 'ws-1', name: 'Geral', slug: 'geral', description: 'Workspace principal' }
    ]);
  }),

  http.get('/api/layers', ({ request }) => {
    const url = new URL(request.url);
    const workspaceId = url.searchParams.get('workspaceId');
    if (workspaceId) {
      return HttpResponse.json(mockLayers.filter(l => l.workspaceId === workspaceId));
    }
    return HttpResponse.json(mockLayers);
  }),

  http.get('/api/layers/:id/data', async () => {
    // In phase 1, geojson is a static file loaded by openlayers, but we create the mock endpoint just in case
    return new HttpResponse(null, { status: 404 });
  }),

  http.get('/api/layers/:id/search', async ({ request, params }) => {
    const { id } = params;
    const url = new URL(request.url);
    const q = (url.searchParams.get('q') || '').toLowerCase().trim();
    const limit = Number(url.searchParams.get('limit') || 20);

    // Se estiver no mock de pontos ou áreas, carregar e filtrar
    const layer = mockLayers.find(l => l.id === id);
    if (!layer) {
      return HttpResponse.json({
        type: 'FeatureCollection',
        layerId: id,
        query: q,
        numberReturned: 0,
        features: []
      });
    }

    try {
      if (layer.source?.url && layer.source.url.includes('.geojson')) {
        const res = await fetch(layer.source.url);
        if (res.ok) {
          const data = await res.json();
          const matched = (data.features || []).filter((f: any) => {
            const props = f.properties || {};
            return Object.values(props).some(v => v !== null && v !== undefined && String(v).toLowerCase().includes(q));
          }).slice(0, limit);

          return HttpResponse.json({
            type: 'FeatureCollection',
            layerId: id,
            query: q,
            limit,
            offset: 0,
            numberReturned: matched.length,
            features: matched
          });
        }
      }
    } catch {
      // Ignorar fallback de mock
    }

    return HttpResponse.json({
      type: 'FeatureCollection',
      layerId: id,
      query: q,
      numberReturned: 0,
      features: []
    });
  }),

  http.get('/api/layers/:id/features/:featureId', async ({ params }) => {
    const { id, featureId } = params;
    const layer = mockLayers.find(l => l.id === id);
    if (layer?.source?.url && layer.source.url.includes('.geojson')) {
      try {
        const res = await fetch(layer.source.url);
        if (res.ok) {
          const data = await res.json();
          const feature = (data.features || []).find((f: any) => String(f.id ?? f.properties?.id) === String(featureId));
          if (feature) {
            return HttpResponse.json(feature);
          }
        }
      } catch {
        // Ignorar
      }
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.patch('/api/layers/:id', async ({ request, params }) => {
    const { id } = params;
    const updates = await request.json() as Partial<LayerConfig>;
    const layer = mockLayers.find(l => l.id === id);
    if (layer) {
      Object.assign(layer, updates);
      return HttpResponse.json(layer);
    }
    return new HttpResponse(null, { status: 404 });
  })
];
