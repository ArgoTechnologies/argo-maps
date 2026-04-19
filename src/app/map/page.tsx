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
  Map as MapIcon, 
  LocateFixed, 
  Settings2,
  Clock,
  Star,
  MapPin
} from 'lucide-react';

const ARGO_UI_CONFIG = {
  primaryColor: '#00f2ff',
  bgColor: '#F8F6F1',
  textColor: '#2C2A26',
  mutedColor: '#8C8880'
};

const mockBusStops = [
  { id: 1, name: 'Republic Square', loc: [44.5126, 40.1776], buses: ['1', '14', '33'], type: 'Metro Station' },
  { id: 2, name: 'Cascade Complex', loc: [44.5152, 40.1888], buses: ['1', '5', '8'], type: 'Bus Stop' },
  { id: 3, name: 'Opera House', loc: [44.5142, 40.1843], buses: ['11', '14', '20'], type: 'Bus Stop' },
  { id: 4, name: 'Vernissage Market', loc: [44.5186, 40.1764], buses: ['2', '12'], type: 'Cultural Site' },
  { id: 5, name: 'Yeritasardakan', loc: [44.5204, 40.1866], buses: ['Metro'], type: 'Metro Station' },
];

export default function ArgoMapExplorer() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Use a reliable base style but we will customize it to the "Argo" palette
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [44.512, 40.183],
      zoom: 14.5,
      pitch: 45,
      bearing: -17,
      attributionControl: false,
    });

    map.current.on('style.load', () => {
      if (!map.current) return;
      
      // Override colors to match Argo's warm off-white and electric cyan brand
      const style = map.current.getStyle();
      style.layers?.forEach(layer => {
        if (layer.type === 'background') {
          map.current?.setPaintProperty(layer.id, 'background-color', ARGO_UI_CONFIG.bgColor);
        }
        if (layer.type === 'fill' && layer.id.includes('water')) {
          map.current?.setPaintProperty(layer.id, 'fill-color', '#A8C8E8');
        }
        if (layer.type === 'fill' && (layer.id.includes('park') || layer.id.includes('green') || layer.id.includes('wood'))) {
          map.current?.setPaintProperty(layer.id, 'fill-color', '#C8DDB0');
        }
        if (layer.type === 'line' && (layer.id.includes('motorway') || layer.id.includes('primary'))) {
          map.current?.setPaintProperty(layer.id, 'line-color', '#F0C070');
        }
      });

      // Add custom 3D buildings at high zoom
      if (!map.current.getLayer('3d-buildings')) {
        map.current.addLayer({
          'id': '3d-buildings',
          'source': 'carto',
          'source-layer': 'building',
          'type': 'fill-extrusion',
          'minzoom': 15,
          'paint': {
            'fill-extrusion-color': '#E8E4DC',
            'fill-extrusion-height': ['get', 'render_height'],
            'fill-extrusion-base': ['get', 'render_min_height'],
            'fill-extrusion-opacity': 0.8
          }
        });
      }

      // Add custom markers
      mockBusStops.forEach(stop => {
        const el = document.createElement('div');
        el.className = 'argo-custom-marker';
        el.style.cursor = 'pointer';
        el.innerHTML = `
          <div style="
            background: #ffffff; 
            width: 36px; 
            height: 36px; 
            border-radius: 50% 50% 50% 0; 
            transform: rotate(-45deg); 
            display: flex; 
            align-items: center; 
            justify-content: center;
            border: 3px solid #ffffff;
            box-shadow: 0 6px 16px rgba(0,0,0,0.25);
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          " class="marker-pin">
            <div style="
              width: 16px; 
              height: 16px; 
              background: #00f2ff; 
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
        `;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          setSelectedItem(stop);
          setSidebarOpen(true);
          map.current?.flyTo({ 
            center: stop.loc as any, 
            zoom: 16.5, 
            pitch: 60, 
            duration: 1500,
            offset: [150, 0] // Offset to make room for sidebar
          });
        });

        new maplibregl.Marker(el)
          .setLngLat(stop.loc as any)
          .addTo(map.current!);
      });
    });

    return () => map.current?.remove();
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#F8F6F1', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Search Bar - Top Floating */}
      <div style={{
        position: 'absolute',
        top: '24px',
        left: '24px',
        width: '420px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div className="glass" style={{
          padding: '12px 20px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          border: '1px solid rgba(255,255,255,0.4)',
          background: 'rgba(255,255,255,0.95)'
        }}>
          <div style={{ background: '#00f2ff', color: 'black', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 900, letterSpacing: '0.05em' }}>ARGO</div>
          <input 
            type="text" 
            placeholder="Search stops, places, routes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#2C2A26',
              fontSize: '1rem',
              width: '100%',
              outline: 'none',
              fontWeight: 500
            }}
          />
          <Search size={20} color="#8C8880" />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { label: 'Transport', icon: Bus },
            { label: 'Saved', icon: Star },
            { label: 'Nearby', icon: MapPin },
          ].map(item => (
            <button key={item.label} className="glass" style={{
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.95)',
              color: '#444',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <item.icon size={15} />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map Content */}
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {/* Controls - Bottom Right */}
      <div style={{
        position: 'absolute',
        bottom: '32px',
        right: '24px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <button className="glass-btn" style={{ width: '52px', height: '52px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', color: '#2C2A26', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <LocateFixed size={22} />
        </button>
        <button className="glass-btn" style={{ width: '52px', height: '52px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', color: '#2C2A26', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <Layers size={22} />
        </button>
      </div>

      {/* Floating Info Panel - Sliding from Right */}
      {selectedItem && sidebarOpen && (
        <div style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          width: '420px',
          height: 'calc(100vh - 48px)',
          zIndex: 2000,
          background: '#ffffff',
          borderRadius: '28px',
          boxShadow: '-10px 0 60px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div style={{ position: 'relative', height: '240px', background: '#f0f0f0' }}>
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.4))', position: 'absolute', zIndex: 1 }} />
            <img 
              src={`https://images.unsplash.com/photo-1579294800821-694d95e86143?q=80&w=1000&auto=format&fit=crop`} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              alt="Yerevan City"
            />
            <button 
              onClick={() => setSidebarOpen(false)}
              style={{ 
                position: 'absolute', 
                top: '20px', 
                right: '20px', 
                background: 'rgba(255,255,255,0.9)', 
                color: '#2C2A26', 
                width: '36px', 
                height: '36px', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ background: '#00f2ff', color: 'black', fontSize: '0.7rem', fontWeight: 900, padding: '4px 10px', borderRadius: '6px', letterSpacing: '0.05em' }}>
                {selectedItem.type.toUpperCase()}
              </span>
              <div style={{ display: 'flex', gap: '4px', color: '#f59e0b', alignItems: 'center' }}>
                <Star size={14} fill="#f59e0b" />
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2C2A26' }}>4.9</span>
              </div>
            </div>

            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#2C2A26', marginBottom: '20px', letterSpacing: '-0.02em' }}>{selectedItem.name}</h2>
            
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
              <button style={{ flex: 1, background: '#2C2A26', color: 'white', padding: '14px', borderRadius: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', border: 'none', cursor: 'pointer' }}>
                <Navigation2 size={20} fill="white" /> Get Directions
              </button>
              <button style={{ background: '#F0F0F0', width: '52px', borderRadius: '16px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Star size={20} />
              </button>
            </div>

            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '28px' }}>
              <h4 style={{ color: '#8C8880', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '0.1em' }}>Live Bus Arrivals</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {selectedItem.buses.map((bus: string) => (
                  <div key={bus} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px', background: '#F8F9FA', borderRadius: '20px', border: '1px solid #f0f0f0' }}>
                    <div style={{ background: '#00f2ff', color: 'black', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem' }}>
                      {bus}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: '#2C2A26', fontSize: '0.95rem' }}>Towards Centre</div>
                      <div style={{ fontSize: '0.85rem', color: '#00f2ff', fontWeight: 800 }}>Arriving in {Math.floor(Math.random() * 10) + 2} mins</div>
                    </div>
                    <Clock size={18} color="#8C8880" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styling */}
      <style jsx global>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .argo-custom-marker:hover .marker-pin {
          transform: rotate(-45deg) scale(1.15);
          box-shadow: 0 10px 24px rgba(0,0,0,0.3);
        }
        .glass-btn {
          transition: all 0.2s ease;
          border: 1px solid rgba(0,0,0,0.05);
          cursor: pointer;
        }
        .glass-btn:hover {
          transform: scale(1.05);
          background: #f8f8f8 !important;
        }
      `}</style>
    </div>
  );
}
