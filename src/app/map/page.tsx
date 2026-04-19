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

    // Background
    if (t === 'background') {
      map.setPaintProperty(id, 'background-color', BRAND.bg);
    }

    // Water
    if (t === 'fill' && id.includes('water')) {
      map.setPaintProperty(id, 'fill-color', BRAND.water);
    }

    // Parks
    if (t === 'fill' && (id.includes('park') || id.includes('green') || id.includes('forest'))) {
      map.setPaintProperty(id, 'fill-color', BRAND.park);
    }

    // Landuse
    if (t === 'fill' && id.includes('residential')) {
      map.setPaintProperty(id, 'fill-color', '#101115');
    }

    // Buildings
    if (t === 'fill' && id.includes('building')) {
      map.setPaintProperty(id, 'fill-color', BRAND.building);
      map.setPaintProperty(id, 'fill-outline-color', BRAND.buildingStroke);
    }

    // Roads — Glowing Neon Lights approach
    if (t === 'line') {
      if (id.includes('motorway')) {
        map.setPaintProperty(id, 'line-color', BRAND.amber);
        // map.setPaintProperty(id, 'line-opacity', 0.8);
      } else if (id.includes('trunk') || id.includes('primary')) {
        map.setPaintProperty(id, 'line-color', BRAND.cyan);
        map.setPaintProperty(id, 'line-opacity', 0.6);
      } else if (id.includes('secondary') || id.includes('tertiary')) {
        map.setPaintProperty(id, 'line-color', BRAND.violet);
        map.setPaintProperty(id, 'line-opacity', 0.4);
      } else if (id.includes('road') || id.includes('street') || id.includes('minor') || id.includes('path')) {
        map.setPaintProperty(id, 'line-color', '#2A2E39'); // Dark subtle roads
      }
    }
    
    // Labels (Text colors)
    if (t === 'symbol' && id.includes('label')) {
      if (map.getPaintProperty(id, 'text-color')) {
        map.setPaintProperty(id, 'text-color', '#E2E8F0'); // White text
      }
      if (map.getPaintProperty(id, 'text-halo-color')) {
        map.setPaintProperty(id, 'text-halo-color', '#000000'); // Black halo
        map.setPaintProperty(id, 'text-halo-width', 1.5);
      }
    }
  }

  // 3D Buildings - Stealth Glass Look
  if (!map.getLayer('argo-3d-buildings')) {
    const sources = Object.keys(map.getStyle().sources);
    if (sources.length > 0) {
      try {
        map.addLayer({
          id: 'argo-3d-buildings',
          source: sources[0],
          'source-layer': 'building',
          type: 'fill-extrusion',
          minzoom: 15,
          paint: {
            'fill-extrusion-color': BRAND.building,
            'fill-extrusion-height': ['get', 'render_height'],
            'fill-extrusion-base': ['get', 'render_min_height'],
            'fill-extrusion-opacity': 0.85,
          },
        });
      } catch (_) {}
    }
  }
}

/* ═══════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════ */
export default function ArgoMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const [selected, setSelected] = useState<(typeof PLACES)[0] | null>(null);
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [layerPanel, setLayerPanel] = useState(false);
  const [activeView, setActiveView] = useState<'default' | 'transit' | 'traffic'>('default');

  /* Search filter */
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return PLACES.filter(p => p.name.toLowerCase().includes(q) || p.type.toLowerCase().includes(q));
  }, [query]);

  /* Select place */
  const selectPlace = useCallback((place: (typeof PLACES)[0]) => {
    setSelected(place);
    setQuery('');
    setSearchFocused(false);
    mapRef.current?.flyTo({ center: place.loc as [number, number], zoom: 17, pitch: 55, duration: 1800 });
  }, []);

  /* ── Map init ── */
  useEffect(() => {
    if (!containerRef.current) return;

    const m = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [44.5135, 40.1820],
      zoom: 14.5,
      pitch: 45,
      bearing: -12,
      attributionControl: false,
    });

    mapRef.current = m;

    m.on('style.load', () => {
      applyArgoPalette(m);

      // Add markers
      markersRef.current.forEach(mk => mk.remove());
      markersRef.current = [];

      PLACES.forEach(place => {
        const el = document.createElement('div');
        el.className = 'argo-pin';
        const isTransport = place.cat === 'transport';
        el.innerHTML = `
          <div class="pin-ring" style="--ring-color: ${isTransport ? 'rgba(0,229,255,0.35)' : 'rgba(124,58,237,0.30)'}"></div>
          <div class="pin-dot" style="background: ${isTransport ? BRAND.cyan : BRAND.violet}"></div>
        `;
        el.addEventListener('click', () => selectPlace(place));
        const marker = new maplibregl.Marker({ element: el }).setLngLat(place.loc as [number, number]).addTo(m);
        markersRef.current.push(marker);
      });
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
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            onChange={e => setQuery(e.target.value)}
          />
          {query && <button className="icon-btn" onClick={() => setQuery('')}><X size={15} /></button>}
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
        <button className="ctrl-btn" onClick={() => mapRef.current?.flyTo({ center: [44.5135, 40.1820], zoom: 14.5, pitch: 45 })}><LocateFixed size={19} /></button>
        <button className="ctrl-btn" onClick={() => mapRef.current?.setBearing(0)}><Compass size={19} /></button>
      </div>

      {/* ─── Place Detail Card ─── */}
      {selected && (
        <div className="detail-card">
          <div className="detail-hero">
            <img src="https://images.unsplash.com/photo-1549918830-11ec3d403619?q=80&w=800&auto=format&fit=crop" alt={selected.name} />
            <button className="close-fab" onClick={() => setSelected(null)}><X size={16} /></button>
            <div className="rating-badge"><Star size={13} fill="#FACC15" color="#FACC15" />{selected.rating}</div>
          </div>
          <div className="detail-body">
            <span className="detail-type"><ShieldCheck size={13} color="#22C55E" /> {selected.type}</span>
            <h2>{selected.name}</h2>
            <div className="detail-actions">
              <button className="btn-primary"><Navigation2 size={18} fill="white" /> Navigate</button>
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
      `}</style>
    </div>
  );
}
