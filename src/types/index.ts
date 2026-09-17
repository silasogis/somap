export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface LayerConfig {
  id: string;
  name: string;
  workspaceId: string;
  type: 'wms' | 'wfs' | 'geojson' | 'xyz' | 'kml';
  visible: boolean;
  opacity: number;
  zIndex: number;
  basemap?: boolean;
  isLocal?: boolean;
  kmlText?: string;
  style?: {
    color?: string;
    fillColor?: string;
    strokeWidth?: number;
    strokeColor?: string;
  };
  source: {
    url?: string;
    layers?: string;
    params?: Record<string, string>;
  };
  bbox?: [number, number, number, number];
  attribution?: string;
}
