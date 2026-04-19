'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  Search, 
  Layers, 
  Bus, 
  Navigation2, 
  X, 
  ChevronRight, 
  Zap, 
  LocateFixed, 
  Settings2,
  Clock,
  Star,
  MapPin,
  Compass,
  LayoutGrid,
  Heart
} from 'lucide-react';

const ARGO_UI_CONFIG = {
  primary: '#00f2ff',
  secondary: '#8147ff',
  bg: '#F8F6F1',
  text: '#1C1917',
  muted: '#78716c',
  border: 'rgba(0, 0, 0, 0.05)'
};

// Advanced Map Style definition directly in code for instant customization
const ARGO_V2_STYLE: any = {
  "version": 8,
  "sources": {
    "argo-tiles": {
      "type": "vector",
      "tiles": ["https://tiles.basemaps.cartocdn.com/gl/positron-gl-style/style.json"], // Fallback vector
    }
  },
  "glyphs": "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
  "layers": [
    { "id": "background", "type": "background", "paint": { "background-color": "#FDFCFB" } }
  ]
};

const mockStops = [
  { id: 1, name: 'Republic Square', loc: [44.5126, 40.1776], type: 'Metro/Bus', rating: 4.9, time: '3 min' },
  { id: 2, name: 'Cascade Complex', loc: [44.5152, 40.1888], type: 'Landmark', rating: 4.8, time: '8 min' },
  { id: 3, name: 'Opera Theatre', loc: [44.5142, 40.1843], type: 'Opera Stop', rating: 4.9, time: '5 min' },
  { id: 4, name: 'Northern Avenue', loc: [44.5145, 40.1818], type: 'Shopping District', rating: 4.7, time: '2 min' }
];

export default function ArgoMapV2() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('explore');

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [44.5135, 40.1820],
      zoom: 15,
      pitch: 55,
      bearing: -20,
      attributionControl: false,
    });

    map.current.on('style.load', () => {
      if (!map.current) return;

      // Road Design Refinement
      const style = map.current.getStyle();
      style.layers?.forEach(layer => {
        if (layer.type === 'background') {
          map.current?.setPaintProperty(layer.id, 'background-color', '#F8F7F4');
        }
        
        if (layer.type === 'line' && (layer.id.includes('road') || layer.id.includes('highway'))) {
          // Main arteries - Premium Yellow/Gold
          if (layer.id.includes('primary') || layer.id.includes('motorway')) {
            map.current?.setPaintProperty(layer.id, 'line-color', '#FFD891');
          } else {
            map.current?.setPaintProperty(layer.id, 'line-color', '#FFFFFF');
          }
        }
        
        if (layer.type === 'fill' && layer.id.includes('water')) {
          map.current?.setPaintProperty(layer.id, 'fill-color', '#B8D5F0');
        }
      });

      // Buildings 3D Styling
      map.current.addLayer({
        'id': '3d-buildings-pro',
        'source': 'carto',
        'source-layer': 'building',
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
          'fill-extrusion-color': '#EEEBE6',
          'fill-extrusion-height': ['get', 'render_height'],
          'fill-extrusion-base': ['get', 'render_min_height'],
          'fill-extrusion-opacity': 0.9
        }
      });

      // Markers
      mockStops.forEach(stop => {
        const el = document.createElement('div');
        el.className = 'argo-marker-v2';
        el.innerHTML = `
          <div class="marker-wrapper">
            <div class="marker-pulse"></div>
            <div class="marker-icon">
              <div class="dot"></div>
            </div>
          </div>
        `;

        el.addEventListener('click', () => {
          setSelected(stop);
          map.current?.flyTo({ center: stop.loc as any, zoom: 17, pitch: 60, duration: 2000 });
        });

        new maplibregl.Marker(el).setLngLat(stop.loc as any).addTo(map.current!);
      });
    });

    return () => map.current?.remove();
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#F8F7F4', color: ARGO_UI_CONFIG.text }}>
      
      {/* Search Console - High Design */}
      <div style={{
        position: 'absolute',
        top: '24px',
        left: '24px',
        width: '440px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div className="glass-premium" style={{
          padding: '8px',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
          background: 'rgba(255, 255, 255, 0.8)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #00f2ff, #8147ff)',
            color: 'white',
            padding: '10px 14px',
            borderRadius: '16px',
            fontWeight: 900,
            fontSize: '11px',
            letterSpacing: '0.1em'
          }}>ARGO</div>
          
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '8px' }}>
            <Search size={18} color="#A8A29E" />
            <input 
              type="text" 
              placeholder="Where are we going?" 
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                width: '100%',
                outline: 'none',
                color: '#1C1917'
              }}
            />
          </div>
          
          <button style={{ width: '40px', height: '40px', borderRadius: '14px', background: '#F5F5F4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Settings2 size={18} />
          </button>
        </div>

        {/* Quick Menu */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'transport', label: 'Bus & Metro', icon: Bus },
            { id: 'saved', label: 'Favorites', icon: Heart },
            { id: 'all', label: 'Explore', icon: LayoutGrid }
          ].map(item => (
            <button key={item.id} className="quick-btn">
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map Body */}
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {/* Control Stack */}
      <div style={{ 
        position: 'absolute', 
        bottom: '40px', 
        right: '24px', 
        zIndex: 1000, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px' 
      }}>
        <div className="glass-btn-stack">
          <button><LocateFixed size={20} /></button>
          <div style={{ width: '20px', height: '1px', background: 'rgba(0,0,0,0.05)', marginLeft: '12px' }} />
          <button><Compass size={20} /></button>
          <div style={{ width: '20px', height: '1px', background: 'rgba(0,0,0,0.05)', marginLeft: '12px' }} />
          <button><Layers size={20} /></button>
        </div>
      </div>

      {/* Location Details - Floating Modal Design */}
      {selected && (
        <div className="location-card">
          <div style={{ position: 'relative', height: '180px' }}>
            <img src="https://images.unsplash.com/photo-1549918830-11ec3d403619?q=80&w=1000&auto=format&fit=crop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Yerevan" />
            <button onClick={() => setSelected(null)} className="close-btn"><X size={18} /></button>
            <div className="rating-pill">
              <Star size={14} fill="#FACC15" color="#FACC15" />
              <span>{selected.rating}</span>
            </div>
          </div>
          
          <div style={{ padding: '24px' }}>
            <div style={{ color: ARGO_UI_CONFIG.muted, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
              {selected.type}
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '20px' }}>{selected.name}</h2>
            
            <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
              <button className="primary-action-btn">
                <Navigation2 size={20} fill="white" />
                <span>Go there</span>
              </button>
              <button className="secondary-action-btn"><Heart size={20} /></button>
            </div>

            <div style={{ borderTop: '1px solid #F5F5F4', paddingTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800 }}>LIVE DEPARTURES</h4>
                <div style={{ color: '#22C55E', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Zap size={12} fill="#22C55E" /> Live
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 <div className="departure-item">
                    <div className="route-id">14</div>
                    <div className="route-info">to Massiv</div>
                    <div className="route-time">{selected.time}</div>
                 </div>
                 <div className="departure-item">
                    <div className="route-id">1</div>
                    <div className="route-info">to Kentron</div>
                    <div className="route-time">12 min</div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        
        body { font-family: 'Plus Jakarta Sans', sans-serif; }

        .glass-premium {
          backdrop-filter: blur(20px) saturate(180%);
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .quick-btn {
          background: rgba(255, 255, 255, 0.95);
          padding: 10px 18px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.03);
          border: 1px solid rgba(0,0,0,0.02);
          transition: 0.2s;
        }
        .quick-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
          background: white;
        }

        .glass-btn-stack {
          background: white;
          padding: 8px;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .glass-btn-stack button {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: 0.2s;
        }
        .glass-btn-stack button:hover {
          background: #F5F5F4;
        }

        .argo-marker-v2 { cursor: pointer; }
        .marker-wrapper { position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; }
        .marker-pulse { 
          position: absolute; width: 100%; height: 100%; border-radius: 50%;
          background: rgba(0, 242, 255, 0.4); animation: pulse 2s infinite;
        }
        .marker-icon {
          width: 20px; height: 20px; background: white; border-radius: 50%;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; z-index: 10;
        }
        .dot { width: 8px; height: 8px; background: linear-gradient(135deg, #00f2ff, #8147ff); border-radius: 50%; }

        .location-card {
          position: absolute; top: 24px; right: 24px; width: 420px; background: white;
          border-radius: 32px; box-shadow: 0 30px 60px rgba(0,0,0,0.15); z-index: 2000;
          overflow: hidden; animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .close-btn { 
          position: absolute; top: 16px; right: 16px; width: 36px; height: 36px;
          background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        .rating-pill {
          position: absolute; bottom: 16px; left: 16px; background: white;
          padding: 6px 12px; border-radius: 100px; display: flex; align-items: center; gap: 6px;
          font-weight: 800; font-size: 0.85rem; box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }

        .primary-action-btn {
          flex: 1; background: #1C1917; color: white; padding: 16px; border-radius: 18px;
          font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 12px;
        }
        .secondary-action-btn {
          width: 56px; background: #F5F5F4; border-radius: 18px; display: flex; align-items: center; justify-content: center;
        }

        .departure-item {
          display: flex; align-items: center; gap: 14px; padding: 14px;
          background: #FBFBFA; border-radius: 18px; border: 1px solid #F5F5F4;
        }
        .route-id { background: #00f2ff; color: black; width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 900; }
        .route-info { flex: 1; font-weight: 700; font-size: 0.95rem; }
        .route-time { color: #00f2ff; font-weight: 800; font-size: 0.9rem; }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
