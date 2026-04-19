'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Search, Bus, Navigation2, X, Zap, LocateFixed, Star, MapPin, Compass,
  Heart, Layers, Code, ShieldCheck, TrafficCone, Map as MapIcon
} from 'lucide-react';
import Link from 'next/link';

/* ─── Ultra-Premium Dark Palette ─── */
const BRAND = {
  cyan: '#00F0FF',
  violet: '#A374FF',
  amber: '#FFB800',
  magenta: '#FF007A',
  bg: '#0D0E12', // Deep near-black slate
  text: '#FFFFFF',
  muted: '#8A8F9E',
  water: '#141824', // Subtle dark blue for water
  park: '#121A15',  // Very dark stealth green
  building: '#1A1D24',
  buildingStroke: '#2A2E39',
};

/* ─── Places Database ─── */
const PLACES = [
  { id: 1, name: 'Republic Square',     nameHy: 'Հանրապետության Հրապարակ',  loc: [44.5126, 40.1776], type: 'Metro Station',     cat: 'transport', rating: 4.9 },
  { id: 2, name: 'Cascade Complex',     nameHy: 'Կասկադ Համալիր',           loc: [44.5152, 40.1888], type: 'Landmark',           cat: 'nearby',    rating: 4.8 },
  { id: 3, name: 'Opera Theatre',       nameHy: 'Օպերայի Թատրոն',           loc: [44.5142, 40.1843], type: 'Bus & Metro Stop',   cat: 'transport', rating: 4.9 },
  { id: 4, name: 'Northern Avenue',     nameHy: 'Հյուսիսային Պողոտա',       loc: [44.5145, 40.1818], type: 'Shopping District',  cat: 'nearby',    rating: 4.7 },
  { id: 5, name: 'Yeritasardakan',      nameHy: 'Երիտասարդական',             loc: [44.5204, 40.1866], type: 'Metro Station',      cat: 'transport', rating: 4.6 },
  { id: 6, name: 'Vernissage Market',   nameHy: 'Վերնիսաժ',                 loc: [44.5186, 40.1764], type: 'Open Air Market',    cat: 'nearby',    rating: 4.8 },
  { id: 7, name: 'Matenadaran',         nameHy: 'Մատենադարան',               loc: [44.5211, 40.1920], type: 'Museum',             cat: 'nearby',    rating: 4.9 },
];

/* ─── Argo Dark Mode Overrides ─── */
function applyArgoPalette(map: maplibregl.Map) {
  const style = map.getStyle();
  if (!style?.layers) return;

  for (const layer of style.layers) {
    const id = layer.id;
    const t = layer.type;

    // Background & Admin
    if (t === 'background' || id.includes('landcover') || id.includes('landuse')) {
      if (id.includes('park') || id.includes('wood') || id.includes('grass') || id.includes('pitch')) {
        map.setPaintProperty(id, 'fill-color', BRAND.park);
      } else {
        try { map.setPaintProperty(id, t === 'background' ? 'background-color' : 'fill-color', BRAND.bg); } catch(_) {}
      }
    }

    // Water
    if (t === 'fill' && id.includes('water')) {
      map.setPaintProperty(id, 'fill-color', BRAND.water);
    }

    // Buildings
    if (id.includes('building')) {
      if (t === 'fill') {
        map.setPaintProperty(id, 'fill-color', BRAND.building);
        map.setPaintProperty(id, 'fill-outline-color', BRAND.buildingStroke);
      }
      if (t === 'fill-extrusion') {
        map.setPaintProperty(id, 'fill-extrusion-color', BRAND.building);
        try { map.setPaintProperty(id, 'fill-extrusion-opacity', 0.85); } catch(_) {}
      }
    }

    // Roads (Liberty Schema: highway_motorway, highway_primary, etc)
    if (t === 'line' && id.includes('highway')) {
      // Remove casings for a cleaner neon look or make them dark
      if (id.includes('casing') || id.includes('outline')) {
        map.setPaintProperty(id, 'line-color', BRAND.bg);
        continue;
      }

      if (id.includes('motorway')) {
        map.setPaintProperty(id, 'line-color', BRAND.amber);
      } else if (id.includes('trunk') || id.includes('primary') || id.includes('major')) {
        map.setPaintProperty(id, 'line-color', BRAND.cyan);
      } else if (id.includes('secondary') || id.includes('tertiary')) {
        map.setPaintProperty(id, 'line-color', BRAND.violet);
      } else if (id.includes('minor') || id.includes('path') || id.includes('pedestrian')) {
        map.setPaintProperty(id, 'line-color', '#2A2E39');
      } else {
        map.setPaintProperty(id, 'line-color', '#2A2E39');
      }
    }
    
    // Labels and Icons
    if (t === 'symbol') {

      if (map.getPaintProperty(id, 'text-color')) {
        const isPOI = id.includes('poi') || id.includes('place');
        try { map.setPaintProperty(id, 'text-color', isPOI ? '#FFFFFF' : '#E2E8F0'); } catch(_) {}
      }
      if (map.getPaintProperty(id, 'text-halo-color')) {
        try { map.setPaintProperty(id, 'text-halo-color', '#000000'); } catch(_) {}
        try { map.setPaintProperty(id, 'text-halo-width', 1.5); } catch(_) {}
      }
    }

    // Hide any raw circle layers (ugly dots)
    if (t === 'circle') {
      map.setLayoutProperty(id, 'visibility', 'none');
    }
  } // End for loop
}

/* ═══════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════ */
export type DynamicPlace = {
  id: string | number;
  name: string;
  nameHy?: string;
  type: string;
  cat: 'transport' | 'nearby';
  rating: string | number;
  loc: [number, number];
};

export default function ArgoMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const [selected, setSelected] = useState<DynamicPlace | null>(null);
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [layerPanel, setLayerPanel] = useState(false);
  const [activeView, setActiveView] = useState<'default' | 'transit' | 'traffic'>('default');
  const [results, setResults] = useState<DynamicPlace[]>([]);

  /* ── Go API Search ── */
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    
    // We are hitting a blazing fast Go API. We don't need artificial debounce delays!
    const controller = new AbortController();
    fetch(`http://127.0.0.1:4000/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => setResults(data || []))
      .catch(err => {
        if (err.name !== 'AbortError') console.error('Go API Error:', err);
      });
      
    // Cancel previous request if user types a new character before the last request finishes
    return () => controller.abort();
  }, [query]);

  /* Select place */
  const selectPlace = useCallback((place: DynamicPlace) => {
    setSelected(place);
    setQuery('');
    setSearchFocused(false);
    mapRef.current?.flyTo({ center: place.loc as [number, number], zoom: 17, pitch: 55, duration: 1800 });
  }, []);

  /* ── Routing ── */
  const clearRoute = useCallback(() => {
    const m = mapRef.current;
    if (m && m.getSource('route')) {
      (m.getSource('route') as maplibregl.GeoJSONSource).setData({ type: 'FeatureCollection', features: [] } as any);
    }
  }, []);

  const drawRoute = useCallback((end: [number, number]) => {
    const m = mapRef.current;
    if (!m) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async pos => {
        const start = [pos.coords.longitude, pos.coords.latitude];
        try {
          const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson`);
          const data = await res.json();
          if (data.routes && data.routes[0]) {
            const geom = data.routes[0].geometry;
            const source = m.getSource('route') as maplibregl.GeoJSONSource;
            if (source) {
              source.setData(geom);
            } else {
              m.addSource('route', { type: 'geojson', data: geom });
              m.addLayer({
                id: 'route-line-casing',
                type: 'line',
                source: 'route',
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: { 'line-color': BRAND.cyan, 'line-width': 10, 'line-opacity': 0.25 }
              });
              m.addLayer({
                id: 'route-line',
                type: 'line',
                source: 'route',
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: { 'line-color': BRAND.cyan, 'line-width': 4 }
              });
            }
            const bounds = new maplibregl.LngLatBounds(start, start);
            for (const coord of geom.coordinates) bounds.extend(coord as [number, number]);
            m.fitBounds(bounds, { padding: 80, pitch: 45 });
          }
        } catch (err) { console.error('Route error:', err); }
      }, () => alert("Please allow Location access to build a route."));
    }
  }, []);

  /* ── Map init ── */
  useEffect(() => {
    if (!containerRef.current) return;

    const m = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [44.5135, 40.1820],
      zoom: 14.5,
      pitch: 45,
      bearing: -12,
      attributionControl: false,
    });

    mapRef.current = m;

    m.on('style.load', () => {
      applyArgoPalette(m);
    });

    // ── INTERACTIVE POI LOGIC ──
    m.on('click', (e) => {
      // Find what we clicked on
      const hit = m.queryRenderedFeatures(e.point).find(feat => 
        feat.layer.type === 'symbol' && feat.properties.name
      );

      if (hit) {
        let cat: 'transport' | 'nearby' = 'nearby';
        const typeStr = (hit.properties.class || hit.properties.subclass || hit.properties.type || 'Location').toString().toLowerCase();
        
        if (typeStr.includes('bus') || typeStr.includes('transit') || typeStr.includes('station')) {
          cat = 'transport';
        }

        // Generate a fun random high rating for realism
        const rating = (Math.random() * (5 - 4.0) + 4.0).toFixed(1);

        selectPlace({
          id: hit.id || Math.random(),
          name: hit.properties.name,
          nameHy: hit.properties['name:hy'] || hit.properties['name:en'] || '',
          type: typeStr.charAt(0).toUpperCase() + typeStr.slice(1).replace('_', ' '),
          cat,
          rating,
          loc: [e.lngLat.lng, e.lngLat.lat]
        });
      } else {
        // No vector feature clicked — ask Rust Spatial Engine for the nearest place
        fetch(`http://127.0.0.1:4002/api/reverse?lng=${e.lngLat.lng}&lat=${e.lngLat.lat}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.place) {
              selectPlace({
                id: data.place.id,
                name: data.place.name,
                nameHy: data.place.name_hy || '',
                type: data.place.place_type || 'Location',
                cat: data.place.place_type?.includes('Station') ? 'transport' : 'nearby',
                rating: '4.5',
                loc: [data.place.lng, data.place.lat]
              });
            } else {
              setSelected(null);
            }
          })
          .catch(() => setSelected(null));
      }
    });

    // Change cursor dynamically when hovering over interesting places
    m.on('mousemove', (e) => {
      const isPOI = m.queryRenderedFeatures(e.point).some(feat => feat.layer.type === 'symbol' && feat.properties.name);
      m.getCanvas().style.cursor = isPOI ? 'pointer' : '';
    });

    return () => { m.remove(); mapRef.current = null; };
  }, [selectPlace]);

  /* ── Layer view switcher ── */
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !m.isStyleLoaded()) return;
    const bgColor = activeView === 'traffic' ? '#E8E6E1' : activeView === 'transit' ? '#EDF5FF' : BRAND.bg;
    try { m.setPaintProperty('background', 'background-color', bgColor); } catch (_) {}
  }, [activeView]);

  return (
    <div className="argo-root">
      {/* ─── Search ─── */}
      <div className="search-area">
        <div className="search-bar">
          <Link href="/" className="brand-pill">ARGO</Link>
          <Search size={17} color={searchFocused ? BRAND.cyan : '#aaa'} />
          <input
            placeholder="Search Yerevan…"
            value={query}
            onFocus={() => setSearchFocused(true)}
            onChange={e => setQuery(e.target.value)}
          />
          {query && <button className="icon-btn" onClick={() => { setQuery(''); setSearchFocused(false); }}><X size={15} /></button>}
          <span className="divider-v" />
          <Link href="/developer" className="icon-btn"><Code size={17} /></Link>
        </div>

        {/* Results dropdown */}
        {searchFocused && query && (
          <div className="results-dropdown">
            {results.length ? results.map(r => (
              <button key={r.id} className="result-row" onClick={() => selectPlace(r)}>
                <div className="result-icon" style={{ background: r.cat === 'transport' ? 'rgba(0,229,255,0.12)' : 'rgba(124,58,237,0.10)' }}>
                  {r.cat === 'transport' ? <Bus size={15} color={BRAND.cyan} /> : <MapPin size={15} color={BRAND.violet} />}
                </div>
                <div><div className="result-name">{r.name}</div><div className="result-type">{r.type}</div></div>
              </button>
            )) : <div className="no-results">No places found</div>}
          </div>
        )}
      </div>

      {/* ─── Layer Toggle ─── */}
      <div className="layers-area">
        <button className="fab" onClick={() => setLayerPanel(!layerPanel)}>
          <Layers size={20} color={layerPanel ? BRAND.cyan : BRAND.text} />
        </button>
        {layerPanel && (
          <div className="layers-menu">
            {([
              { key: 'default', label: 'Default', icon: MapIcon },
              { key: 'transit', label: 'Transit', icon: Bus },
              { key: 'traffic', label: 'Traffic', icon: TrafficCone },
            ] as const).map(v => (
              <button
                key={v.key}
                className={`layer-row ${activeView === v.key ? 'active' : ''}`}
                onClick={() => { setActiveView(v.key); setLayerPanel(false); }}
              >
                <v.icon size={16} /><span>{v.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── Map Canvas ─── */}
      <div ref={containerRef} className="map-canvas" />

      {/* ─── Controls ─── */}
      <div className="controls-stack">
        <button className="ctrl-btn" onClick={() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
              mapRef.current?.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 16, pitch: 45 });
            }, () => {
              mapRef.current?.flyTo({ center: [44.5135, 40.1820], zoom: 14.5, pitch: 45 }); // reset
            });
          }
        }}><LocateFixed size={19} /></button>
        <button className="ctrl-btn" onClick={() => mapRef.current?.setBearing(0)}><Compass size={19} /></button>
      </div>

      {/* ─── Place Detail Card ─── */}
      {selected && (
        <div className="detail-card">
          <div className="detail-hero">
            <img src="https://images.unsplash.com/photo-1549918830-11ec3d403619?q=80&w=800&auto=format&fit=crop" alt={selected.name} />
            <button className="close-fab" onClick={() => { 
              setSelected(null); 
              clearRoute(); 
              mapRef.current?.flyTo({ center: [44.5135, 40.1820], zoom: 14.5, pitch: 45, duration: 1500 });
            }}>
              <X size={16} />
            </button>
            <div className="rating-badge"><Star size={13} fill="#FACC15" color="#FACC15" />{selected.rating}</div>
          </div>
          <div className="detail-body">
            <span className="detail-type"><ShieldCheck size={13} color="#22C55E" /> {selected.type}</span>
            <h2>{selected.name}</h2>
            <div className="detail-actions">
              <button className="btn-primary" onClick={() => drawRoute(selected.loc as [number, number])}>
                <Navigation2 size={18} fill="white" /> Navigate
              </button>
              <button className="btn-secondary"><Heart size={18} /></button>
            </div>
            <div className="departures">
              <div className="dep-header">
                <span className="dep-title">LIVE ARRIVALS</span>
                <span className="live-dot"><span className="pulse-circle" /> Live</span>
              </div>
              <div className="dep-row"><div className="bus-badge">14</div><span className="dep-dest">→ Massiv</span><span className="dep-eta">3 min</span></div>
              <div className="dep-row"><div className="bus-badge metro">M1</div><span className="dep-dest">→ Barekamutyun</span><span className="dep-eta purple">7 min</span></div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Styles ─── */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;overflow:hidden}
        button{border:none;background:none;cursor:pointer;font-family:inherit}
        a{text-decoration:none;color:inherit}

        .argo-root{position:fixed;inset:0;background:${BRAND.bg};color:${BRAND.text}}
        .map-canvas{width:100%;height:100%}

        /* ── Search ── */
        .search-area{position:absolute;top:20px;left:20px;width:420px;z-index:1000;display:flex;flex-direction:column;gap:10px}
        .search-bar{display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:18px;background:rgba(26,29,36,.85);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.05);box-shadow:0 12px 40px rgba(0,0,0,.3)}
        .brand-pill{background:linear-gradient(135deg,${BRAND.cyan},${BRAND.violet});color:#000;padding:8px 13px;border-radius:14px;font-weight:900;font-size:11px;letter-spacing:.12em}
        .search-bar input{flex:1;border:none;outline:none;background:none;font-size:.95rem;font-weight:600;color:#FFF}
        .icon-btn{width:36px;height:36px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:#2A2E39;color:#FFF}
        .icon-btn svg{stroke:#FFF}
        .divider-v{width:1px;height:22px;background:rgba(255,255,255,.1)}

        .results-dropdown{background:rgba(26,29,36,.95);backdrop-filter:blur(16px);border-radius:18px;padding:8px;border:1px solid rgba(255,255,255,.05);box-shadow:0 16px 48px rgba(0,0,0,.4)}
        .result-row{display:flex;align-items:center;gap:14px;padding:10px 12px;width:100%;border-radius:12px;transition:.15s;color:#FFF}
        .result-row:hover{background:rgba(255,255,255,.05)}
        .result-icon{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .result-name{font-weight:700;font-size:.9rem;text-align:left}
        .result-type{font-size:.72rem;color:#8A8F9E;text-align:left}
        .no-results{padding:24px;text-align:center;color:#8A8F9E;font-size:.85rem}

        /* ── Layers ── */
        .layers-area{position:absolute;top:20px;right:20px;z-index:1000;display:flex;flex-direction:column;align-items:flex-end;gap:10px}
        .fab{width:48px;height:48px;border-radius:16px;background:rgba(26,29,36,.85);backdrop-filter:blur(16px);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.05);transition:.2s}
        .fab:hover{box-shadow:0 12px 32px rgba(0,0,0,.4)}
        .layers-menu{background:rgba(26,29,36,.95);backdrop-filter:blur(16px);border-radius:16px;padding:8px;width:180px;box-shadow:0 16px 48px rgba(0,0,0,.4);border:1px solid rgba(255,255,255,.05)}
        .layer-row{display:flex;align-items:center;gap:10px;padding:10px 14px;width:100%;border-radius:12px;font-weight:700;font-size:.85rem;color:#8A8F9E;transition:.15s}
        .layer-row:hover{background:#2A2E39}
        .layer-row.active{background:rgba(0,240,255,.1);color:${BRAND.cyan}}
        .layer-row.active svg{stroke:${BRAND.cyan}}

        /* ── Controls ── */
        .controls-stack{position:absolute;bottom:36px;right:20px;z-index:1000;display:flex;flex-direction:column;gap:2px;background:#1A1D24;border-radius:16px;box-shadow:0 8px 28px rgba(0,0,0,.3);overflow:hidden;border:1px solid rgba(255,255,255,.05)}
        .ctrl-btn{width:44px;height:44px;display:flex;align-items:center;justify-content:center;transition:.15s;color:#FFF}
        .ctrl-btn:hover{background:#2A2E39}

        /* ── Markers ── */
        .argo-pin{cursor:pointer;position:relative;width:38px;height:38px;display:flex;align-items:center;justify-content:center}
        .pin-ring{position:absolute;inset:0;border-radius:50%;background:var(--ring-color);animation:ring-pulse 2.4s ease-out infinite}
        .pin-dot{width:12px;height:12px;border-radius:50%;box-shadow:0 2px 10px rgba(0,0,0,.5);z-index:1;border:2px solid #0D0E12}

        /* ── Detail Card ── */
        .detail-card{position:absolute;top:20px;right:20px;width:380px;background:#1A1D24;border-radius:28px;box-shadow:0 24px 64px rgba(0,0,0,.5);z-index:2000;overflow:hidden;animation:card-in .5s cubic-bezier(.16,1,.3,1);border:1px solid rgba(255,255,255,.05)}
        .detail-hero{position:relative;height:180px}
        .detail-hero img{width:100%;height:100%;object-fit:cover;opacity:0.9}
        .close-fab{position:absolute;top:14px;right:14px;width:34px;height:34px;background:rgba(26,29,36,.8);backdrop-filter:blur(8px);border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,.3);color:#FFF}
        .rating-badge{position:absolute;bottom:14px;left:14px;background:rgba(26,29,36,.8);backdrop-filter:blur(8px);padding:5px 12px;border-radius:99px;display:flex;align-items:center;gap:5px;font-weight:800;font-size:.8rem;box-shadow:0 4px 12px rgba(0,0,0,.3);color:#FFF}
        .detail-body{padding:22px}
        .detail-type{display:flex;align-items:center;gap:6px;font-size:.7rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:${BRAND.muted};margin-bottom:6px}
        .detail-body h2{font-size:1.5rem;font-weight:800;margin-bottom:20px;letter-spacing:-.02em;color:#FFF}
        .detail-actions{display:flex;gap:10px;margin-bottom:24px}
        .btn-primary{flex:1;background:#FFF;color:#0D0E12;padding:15px;border-radius:16px;font-weight:800;display:flex;align-items:center;justify-content:center;gap:10px;font-size:.9rem;transition:.2s}
        .btn-primary svg{stroke:#0D0E12}
        .btn-primary:hover{opacity:0.9}
        .btn-secondary{width:54px;background:#2A2E39;color:#FFF;border-radius:16px;display:flex;align-items:center;justify-content:center}

        .departures{background:#262932;border-radius:18px;padding:18px}
        .dep-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
        .dep-title{font-size:.72rem;font-weight:900;color:#8A8F9E;letter-spacing:.06em}
        .live-dot{display:flex;align-items:center;gap:5px;font-size:.7rem;font-weight:800;color:#00F0FF}
        .pulse-circle{width:6px;height:6px;background:#00F0FF;border-radius:50%;animation:blink 1.4s infinite}
        .dep-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-top:1px solid #333}
        .dep-row:first-of-type{border-top:none}
        .bus-badge{width:34px;height:34px;border-radius:9px;background:${BRAND.cyan};color:#000;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:.85rem}
        .bus-badge.metro{background:${BRAND.violet};color:white}
        .dep-dest{flex:1;font-weight:700;font-size:.85rem;color:#FFF}
        .dep-eta{font-weight:800;font-size:.8rem;color:${BRAND.cyan}}
        .dep-eta.purple{color:${BRAND.violet}}

        @keyframes ring-pulse{0%{transform:scale(.7);opacity:.7}100%{transform:scale(2.2);opacity:0}}
        @keyframes card-in{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes slide-up{from{transform:translateY(100%)}to{transform:translateY(0)}}

        /* ══════════════════════════════════════
           MOBILE RESPONSIVE (< 768px)
           Bottom Sheet Pattern like Yandex Go
           ══════════════════════════════════════ */
        @media(max-width:767px){
          /* Search bar: full width, compact */
          .search-area{width:calc(100% - 32px);left:16px;top:12px}
          .search-bar{padding:6px 8px;border-radius:14px}
          .brand-pill{padding:6px 10px;font-size:10px}
          .search-bar input{font-size:.85rem}
          .results-dropdown{border-radius:14px;max-height:40vh;overflow-y:auto}

          /* Layers: move below search */
          .layers-area{top:12px;right:16px}
          .fab{width:42px;height:42px;border-radius:14px}

          /* Controls: bottom left on mobile */
          .controls-stack{bottom:24px;right:16px}
          .ctrl-btn{width:40px;height:40px}

          /* Detail Card: BOTTOM SHEET! */
          .detail-card{
            position:fixed !important;
            top:auto !important;
            bottom:0 !important;
            left:0 !important;
            right:0 !important;
            width:100% !important;
            max-height:70vh;
            border-radius:24px 24px 0 0 !important;
            animation:slide-up .4s cubic-bezier(.16,1,.3,1) !important;
            overflow-y:auto;
          }
          .detail-hero{height:140px}
          .detail-body{padding:16px}
          .detail-body h2{font-size:1.2rem;margin-bottom:14px}
          .detail-actions{gap:8px;margin-bottom:16px}
          .btn-primary{padding:12px;font-size:.85rem;border-radius:14px}
          .btn-secondary{width:48px;border-radius:14px}
          .departures{padding:14px;border-radius:14px}

          /* Add a drag handle at the top of the bottom sheet */
          .detail-card::before{
            content:'';
            display:block;
            width:36px;
            height:4px;
            background:rgba(255,255,255,.2);
            border-radius:4px;
            margin:10px auto 4px;
          }
        }

        /* Tablet tweaks (768-1024) */
        @media(min-width:768px) and (max-width:1024px){
          .search-area{width:340px}
          .detail-card{width:340px}
        }
      `}</style>
    </div>
  );
}
