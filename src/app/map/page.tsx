'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
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
  Heart,
  TrafficCone,
  Map as MapIcon,
  ShieldCheck,
  Code
} from 'lucide-react';
import Link from 'next/link';

const ARGO_UI_CONFIG = {
  primary: '#00f2ff',
  secondary: '#8147ff',
  bg: '#F8F7F4',
  text: '#1C1917',
  muted: '#78716c',
};

// Expanded Mock Data for Search
const ALL_PLACES = [
  { id: 1, name: 'Republic Square', loc: [44.5126, 40.1776], type: 'Metro Station', rating: 4.9, time: '3 min', category: 'transport' },
  { id: 2, name: 'Cascade Complex', loc: [44.5152, 40.1888], type: 'Landmark', rating: 4.8, time: '8 min', category: 'nearby' },
  { id: 3, name: 'Opera Theatre', loc: [44.5142, 40.1843], type: 'Opera Stop', rating: 4.9, time: '5 min', category: 'transport' },
  { id: 4, name: 'Northern Avenue', loc: [44.5145, 40.1818], type: 'Shopping District', rating: 4.7, time: '2 min', category: 'nearby' },
  { id: 5, name: 'Yeritasardakan', loc: [44.5204, 40.1866], type: 'Metro Station', rating: 4.6, time: '1 min', category: 'transport' },
  { id: 6, name: 'Vernissage Market', loc: [44.5186, 40.1764], type: 'Open Air Market', rating: 4.8, time: '10 min', category: 'nearby' },
  { id: 7, name: 'Matenadaran', loc: [44.5211, 40.1920], type: 'Museum', rating: 4.9, time: '15 min', category: 'nearby' },
];

export default function ArgoMapV3() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  
  const [selected, setSelected] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLayer, setActiveLayer] = useState<'default' | 'transit' | 'traffic'>('default');
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Search logic
  const filteredResults = useMemo(() => {
    if (!searchQuery) return [];
    return ALL_PLACES.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleSelectPlace = (place: any) => {
    setSelected(place);
    setSearchQuery('');
    setIsSearchFocused(false);
    map.current?.flyTo({ center: place.loc as any, zoom: 17, pitch: 60, duration: 2000 });
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [44.5135, 40.1820],
      zoom: 14.5,
      pitch: 45,
      bearing: -10,
      attributionControl: false,
    });

    const updateMarkers = () => {
      // Clear old markers
      markers.current.forEach(m => m.remove());
      markers.current = [];

      ALL_PLACES.forEach(stop => {
        const el = document.createElement('div');
        el.className = 'argo-marker-v3';
        el.innerHTML = `
          <div class="marker-wrapper">
            <div class="marker-pulse" style="background: ${stop.category === 'transport' ? 'rgba(0, 242, 255, 0.4)' : 'rgba(129, 71, 255, 0.4)'}"></div>
            <div class="marker-icon">
              <div class="dot" style="background: linear-gradient(135deg, ${stop.category === 'transport' ? '#00f2ff, #0099ff' : '#8147ff, #b447ff'})"></div>
            </div>
          </div>
        `;

        el.addEventListener('click', () => handleSelectPlace(stop));

        const m = new maplibregl.Marker(el).setLngLat(stop.loc as any).addTo(map.current!);
        markers.current.push(m);
      });
    };

    map.current.on('style.load', () => {
      updateMarkers();
      
      // Layer logic (Simulated for this demo using map events)
      map.current?.addLayer({
        'id': '3d-buildings',
        'source': 'carto',
        'source-layer': 'building',
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
          'fill-extrusion-color': '#EEEBE6',
          'fill-extrusion-height': ['get', 'render_height'],
          'fill-extrusion-base': ['get', 'render_min_height'],
          'fill-extrusion-opacity': 0.8
        }
      });
    });

    return () => map.current?.remove();
  }, []);

  // Update map visual based on activeLayer
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;
    
    if (activeLayer === 'traffic') {
      // Simulate traffic view by darkening the map slightly
      map.current.setPaintProperty('background', 'background-color', '#E5E7EB');
    } else if (activeLayer === 'transit') {
      map.current.setPaintProperty('background', 'background-color', '#F0F9FF');
    } else {
      map.current.setPaintProperty('background', 'background-color', '#F8F7F4');
    }
  }, [activeLayer]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: ARGO_UI_CONFIG.bg, color: ARGO_UI_CONFIG.text }}>
      
      {/* Search & Navigation Bar */}
      <div style={{
        position: 'absolute',
        top: '24px',
        left: '24px',
        width: '440px',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div className="glass-premium" style={{
          padding: '8px',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        }}>
          <Link href="/" style={{
            background: 'linear-gradient(135deg, #00f2ff, #8147ff)',
            color: 'white',
            padding: '10px 14px',
            borderRadius: '16px',
            fontWeight: 900,
            fontSize: '11px',
            letterSpacing: '0.1em',
            textDecoration: 'none'
          }}>ARGO</Link>
          
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '8px' }}>
            <Search size={18} color={isSearchFocused ? ARGO_UI_CONFIG.primary : "#A8A29E"} />
            <input 
              type="text" 
              placeholder="Search places or stops..." 
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                width: '100%',
                outline: 'none',
                color: ARGO_UI_CONFIG.text
              }}
            />
          </div>

          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ padding: '8px' }}><X size={16} /></button>
          )}
          
          <div style={{ width: '1px', height: '24px', background: 'rgba(0,0,0,0.05)' }} />
          
          <Link href="/developer" style={{ width: '40px', height: '40px', borderRadius: '14px', background: '#F5F5F4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ARGO_UI_CONFIG.text }}>
            <Code size={18} />
          </Link>
        </div>

        {/* Search Results Dropdown */}
        {isSearchFocused && searchQuery && (
          <div className="glass-premium" style={{ borderRadius: '20px', padding: '12px', maxHeight: '400px', overflowY: 'auto' }}>
            {filteredResults.length > 0 ? (
              filteredResults.map(item => (
                <button key={item.id} onClick={() => handleSelectPlace(item)} className="search-result-item">
                  <div className="result-icon" style={{ background: item.category === 'transport' ? 'rgba(0, 242, 255, 0.1)' : 'rgba(129, 71, 255, 0.1)' }}>
                    {item.category === 'transport' ? <Bus size={16} color="#0099ff" /> : <MapPin size={16} color="#8147ff" />}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#888' }}>{item.type}</div>
                  </div>
                </button>
              ))
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#888', fontSize: '0.9rem' }}>No places found for "{searchQuery}"</div>
            )}
          </div>
        )}

        {/* Quick Filters */}
        {!searchQuery && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="quick-btn"><Bus size={14} /> Transport</button>
            <button className="quick-btn"><Star size={14} /> Top Rated</button>
            <button className="quick-btn"><Zap size={14} /> Open Now</button>
          </div>
        )}
      </div>

      {/* Layer Control - Top Right */}
      <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
        <button 
          onClick={() => setIsLayersOpen(!isLayersOpen)}
          className="glass-premium" 
          style={{ width: '52px', height: '52px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' }}
        >
          <Layers size={22} color={isLayersOpen ? ARGO_UI_CONFIG.primary : ARGO_UI_CONFIG.text} />
        </button>

        {isLayersOpen && (
          <div className="glass-premium" style={{ padding: '12px', borderRadius: '20px', width: '200px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { id: 'default', label: 'Default View', icon: MapIcon },
              { id: 'transit', label: 'Public Transit', icon: Bus },
              { id: 'traffic', label: 'Traffic Flow', icon: TrafficCone },
            ].map(layer => (
              <button 
                key={layer.id} 
                onClick={() => setActiveLayer(layer.id as any)}
                className={`layer-option ${activeLayer === layer.id ? 'active' : ''}`}
              >
                <layer.icon size={16} />
                <span>{layer.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {/* Control Stack - Bottom Right */}
      <div style={{ position: 'absolute', bottom: '40px', right: '24px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="glass-btn-stack">
          <button><LocateFixed size={20} /></button>
          <div style={{ width: '20px', height: '1px', background: 'rgba(0,0,0,0.05)', marginLeft: '12px' }} />
          <button><Compass size={20} /></button>
        </div>
      </div>

      {/* Details Card */}
      {selected && (
        <div className="location-card">
          <div style={{ position: 'relative', height: '200px' }}>
            <img src="https://images.unsplash.com/photo-1549918830-11ec3d403619?q=80&w=1000&auto=format&fit=crop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={selected.name} />
            <button onClick={() => setSelected(null)} className="close-btn"><X size={18} /></button>
            <div className="rating-pill">
              <Star size={14} fill="#FACC15" color="#FACC15" />
              <span>{selected.rating}</span>
            </div>
          </div>
          
          <div style={{ padding: '24px' }}>
            <div style={{ color: ARGO_UI_CONFIG.muted, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={14} color="#22C55E" /> Verified Place
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '24px' }}>{selected.name}</h2>
            
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
              <button className="primary-action-btn">
                <Navigation2 size={20} fill="white" />
                <span>Take a Route</span>
              </button>
              <button className="secondary-action-btn"><Heart size={20} /></button>
            </div>

            <div style={{ background: '#F8F9FA', borderRadius: '20px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 900, color: '#444' }}>LIVE ARRIVALS</h4>
                <div className="live-badge"><div className="pulse-dot"></div> Live</div>
              </div>
              <div className="arrival-list">
                <div className="arrival-item">
                  <div className="bus-id">14</div>
                  <div style={{ flex: 1, fontWeight: 700, fontSize: '0.9rem' }}>Massiv Direction</div>
                  <div style={{ color: '#00f2ff', fontWeight: 800 }}>3 min</div>
                </div>
                <div className="arrival-item">
                  <div className="bus-id" style={{ background: '#8147ff' }}>M1</div>
                  <div style={{ flex: 1, fontWeight: 700, fontSize: '0.9rem' }}>Barekamutyun</div>
                  <div style={{ color: '#8147ff', fontWeight: 800 }}>7 min</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; overflow: hidden; }

        .glass-premium {
          backdrop-filter: blur(24px) saturate(200%);
          background: rgba(255, 255, 255, 0.88);
          border: 1px solid rgba(255, 255, 255, 0.4);
        }

        .search-result-item {
          display: flex; align-items: center; gap: 16px; padding: 12px; width: 100%;
          border-radius: 14px; transition: 0.2s; border: none; background: transparent; cursor: pointer;
        }
        .search-result-item:hover { background: rgba(0,0,0,0.03); }
        .result-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }

        .layer-option {
          display: flex; align-items: center; gap: 12px; padding: 12px; width: 100%;
          border-radius: 14px; transition: 0.2s; border: none; background: transparent; cursor: pointer;
          font-weight: 700; font-size: 0.9rem; color: #555;
        }
        .layer-option:hover { background: #F5F5F4; }
        .layer-option.active { background: rgba(0, 242, 255, 0.1); color: #000; }

        .quick-btn {
          background: rgba(255, 255, 255, 0.95); padding: 10px 18px; border-radius: 14px;
          font-weight: 700; font-size: 0.8rem; display: flex; align-items: center; gap: 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.02); transition: 0.2s;
        }
        .quick-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }

        .glass-btn-stack { background: white; padding: 8px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); display: flex; flex-direction: column; }
        .glass-btn-stack button { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; transition: 0.2s; border: none; background: transparent; cursor: pointer; }
        .glass-btn-stack button:hover { background: #F5F5F4; }

        .argo-marker-v3 { cursor: pointer; }
        .marker-wrapper { position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; }
        .marker-pulse { position: absolute; width: 100%; height: 100%; border-radius: 50%; animation: pulse 2.2s infinite; }
        .marker-icon { width: 22px; height: 22px; background: white; border-radius: 50%; box-shadow: 0 4px 15px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; z-index: 10; }
        .dot { width: 10px; height: 10px; border-radius: 50%; }

        .location-card {
          position: absolute; top: 24px; right: 24px; width: 440px; background: white;
          border-radius: 32px; box-shadow: 0 30px 80px rgba(0,0,0,0.2); z-index: 3000;
          overflow: hidden; animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .close-btn { position: absolute; top: 20px; right: 20px; width: 40px; height: 40px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: none; cursor: pointer; }
        .rating-pill { position: absolute; bottom: 20px; left: 20px; background: white; padding: 8px 16px; border-radius: 100px; display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 0.9rem; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }

        .primary-action-btn { flex: 1; background: #1C1917; color: white; padding: 18px; border-radius: 20px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 14px; border: none; cursor: pointer; }
        .secondary-action-btn { width: 64px; background: #F5F5F4; border-radius: 20px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; }

        .live-badge { background: white; color: #22C55E; font-weight: 800; font-size: 0.75rem; padding: 4px 10px; border-radius: 100px; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; }
        .pulse-dot { width: 6px; height: 6px; background: #22C55E; border-radius: 50%; animation: pulse-opacity 1.5s infinite; }

        .arrival-item { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid #eee; }
        .arrival-item:last-child { border-bottom: none; }
        .bus-id { background: #00f2ff; color: black; width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 900; }

        @keyframes pulse { 0% { transform: scale(0.8); opacity: 0.8; } 100% { transform: scale(2.6); opacity: 0; } }
        @keyframes pulse-opacity { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
