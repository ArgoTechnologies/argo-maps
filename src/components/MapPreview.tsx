'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MapPreview() {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json', // Placeholder style
      center: [44.509, 40.177], // Yerevan coordinates
      zoom: 12,
      attributionControl: false
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    return () => map.remove();
  }, []);

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%', borderRadius: '20px', overflow: 'hidden' }}>
      <div ref={mapContainer} style={{ height: '100%', width: '100%' }} />
      <div className="glass" style={{ position: 'absolute', bottom: '1rem', left: '1rem', padding: '0.5rem 1rem', borderRadius: '8px', pointerEvents: 'none' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>LIVE PREVIEW: YEREVAN</span>
      </div>
    </div>
  );
}
