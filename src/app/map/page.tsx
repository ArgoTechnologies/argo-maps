'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Search, Map as MapIcon, Layers, Bus, Navigation2, Info, X, ChevronRight, Zap } from 'lucide-react';

// Mock data for transit
const mockBusStops = [
  { id: 1, name: 'Republic Square', loc: [44.512, 40.177], type: 'central' },
  { id: 2, name: 'Cascade Complex', loc: [44.515, 40.188], type: 'stop' },
  { id: 3, name: 'Opera House', loc: [44.514, 40.184], type: 'stop' },
  { id: 4, name: 'Vernissage', loc: [44.518, 40.176], type: 'stop' },
  { id: 5, name: 'Yeritasardakan Metro', loc: [44.520, 40.186], type: 'metro' },
];

const mockBuses = [
  { id: '101', route: '1', loc: [44.513, 40.180], heading: 45 },
  { id: '102', route: '14', loc: [44.510, 40.175], heading: 180 },
];

export default function MapApp() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [layersOpen, setLayersOpen] = useState(false);
  const [activeLayer, setActiveLayer] = useState('Default');

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [44.509, 40.177],
      zoom: 14,
      attributionControl: false,
    });

    map.current.addControl(new maplibregl.NavigationControl({ visualEnabled: true }), 'bottom-right');
    map.current.addControl(new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true }), 'bottom-right');

    map.current.on('load', () => {
      // Add bus stops markers
      mockBusStops.forEach(stop => {
        const el = document.createElement('div');
        el.className = 'stop-marker';
        el.style.width = '12px';
        el.style.height = '12px';
        el.style.borderRadius = '50%';
        el.style.background = 'white';
        el.style.border = '2px solid var(--accent-cyan)';
        el.style.boxShadow = '0 0 10px rgba(0, 242, 255, 0.5)';
        el.style.cursor = 'pointer';

        el.addEventListener('click', () => {
          setSelectedItem({ type: 'stop', ...stop });
          map.current?.flyTo({ center: stop.loc as any, zoom: 16 });
        });

        new maplibregl.Marker(el)
          .setLngLat(stop.loc as any)
          .addTo(map.current!);
      });

      // Add live bus markers
      mockBuses.forEach(bus => {
        const el = document.createElement('div');
        el.className = 'bus-marker';
        el.innerHTML = `<div style="background: var(--accent-cyan); width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transform: rotate(${bus.heading}deg); border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3)">
          <span style="color: black; font-weight: 700; font-size: 10px">${bus.route}</span>
        </div>`;
        
        el.addEventListener('click', () => {
          setSelectedItem({ type: 'bus', ...bus });
          map.current?.flyTo({ center: bus.loc as any, zoom: 16 });
        });

        new maplibregl.Marker(el)
          .setLngLat(bus.loc as any)
          .addTo(map.current!);
      });
    });

    return () => map.current?.remove();
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg-primary)' }}>
      {/* Search Header */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        width: '400px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div className="glass" style={{
          padding: '8px 16px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <Search size={20} color="var(--text-dim)" />
          <input 
            type="text" 
            placeholder="Search stops, routes, or places..." 
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              fontSize: '1rem',
              width: '100%',
              outline: 'none'
            }}
          />
          <X size={18} color="var(--text-dim)" style={{ cursor: 'pointer' }} />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['Bus', 'Metro', 'Nearby'].map(tag => (
            <button key={tag} className="glass" style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {tag === 'Bus' && <Bus size={14} />}
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Layer Toggles */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <button 
          onClick={() => setLayersOpen(!layersOpen)}
          className="glass" 
          style={{ width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyCCenter: 'center' }}
        >
          <Layers size={21} />
        </button>
        
        {layersOpen && (
          <div className="glass animated-fade-in" style={{ padding: '10px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['Default', 'Dark', 'Satellite'].map(layer => (
              <button 
                key={layer}
                onClick={() => setActiveLayer(layer)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textAlign: 'left',
                  background: activeLayer === layer ? 'var(--accent-cyan)' : 'transparent',
                  color: activeLayer === layer ? 'black' : 'var(--text-main)',
                  transition: '0.2s'
                }}
              >
                {layer}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map Content */}
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {/* Info Sheet (Bottom side) */}
      {selectedItem && (
        <div className="glass" style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          width: '380px',
          maxHeight: '400px',
          zIndex: 10,
          borderRadius: '20px',
          padding: '24px',
          boxShadow: 'var(--shadow-lg)',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{selectedItem.name || \`Route \${selectedItem.route}\`}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{selectedItem.type || 'In transit'}</p>
            </div>
            <button onClick={() => setSelectedItem(null)} style={{ color: 'var(--text-dim)' }}>
              <X size={20} />
            </button>
          </div>

          {selectedItem.type === 'stop' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <div style={{ background: '#22c55e', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCCenter: 'center' }}>
                  <Bus size={18} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>Route 1</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Arriving in 3 mins</div>
                </div>
                <ChevronRight size={16} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <div style={{ background: '#f59e0b', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCCenter: 'center' }}>
                  <Bus size={18} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>Route 14</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Arriving in 12 mins</div>
                </div>
                <ChevronRight size={16} />
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-cyan)', marginBottom: '1rem' }}>
                <Zap size={16} />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>LIVE TRACKING ACTIVE</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Currently moving towards Sayat-Nova Ave. Estimated speed 34 km/h.</p>
            </div>
          )}

          <button className="btn-primary" style={{ width: '100%', marginTop: '20px', justifyContent: 'center' }}>
            <Navigation2 size={18} /> Get Directions
          </button>
        </div>
      )}

      {/* Floating Attribution/Logo hack */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '100px',
        zIndex: 5,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        opacity: 0.8
      }}>
        <div style={{ background: 'var(--accent-cyan)', color: 'black', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 900 }}>ARGO</div>
        <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>© OpenStreetMap contributors</span>
      </div>
    </div>
  );
}
