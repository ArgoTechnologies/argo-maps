'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';
import {
  Search, Bus, Navigation2, X, LocateFixed, Star, MapPin, Compass,
  Heart, Layers, Code, ShieldCheck, TrafficCone, Map as MapIcon,
  Coffee, ShoppingBag, Building2, GraduationCap, Utensils, Trees,
  Hotel, Fuel, ParkingCircle, Church, Landmark, Clock, ChevronRight,
  Share2, Phone, Globe, Info
} from 'lucide-react';
import Link from 'next/link';

/* ─── Ultra-Premium Dark Palette ─── */
const BRAND = {
  cyan: '#00F0FF',
  violet: '#A374FF',
  amber: '#FFB800',
  magenta: '#FF007A',
  emerald: '#22C55E',
  bg: '#0D0E12',
  text: '#FFFFFF',
  muted: '#8A8F9E',
  surface: '#1A1D24',
  surfaceHover: '#22252E',
  water: '#141824',
  park: '#121A15',
  building: '#1A1D24',
  buildingStroke: '#2A2E39',
};

/* ─── Category Icon & Color mapper ─── */
function getCategoryMeta(type: string) {
  const t = type.toLowerCase();
  if (t.includes('cafe') || t.includes('coffee')) return { icon: Coffee, color: '#D97706', bg: 'rgba(217,119,6,.12)' };
  if (t.includes('restaurant') || t.includes('food') || t.includes('fast')) return { icon: Utensils, color: '#EF4444', bg: 'rgba(239,68,68,.10)' };
  if (t.includes('hotel') || t.includes('hostel') || t.includes('guest') || t.includes('apartment')) return { icon: Hotel, color: '#8B5CF6', bg: 'rgba(139,92,246,.10)' };
  if (t.includes('shop') || t.includes('market') || t.includes('mall') || t.includes('supermarket')) return { icon: ShoppingBag, color: '#F59E0B', bg: 'rgba(245,158,11,.10)' };
  if (t.includes('bank') || t.includes('atm')) return { icon: Building2, color: '#10B981', bg: 'rgba(16,185,129,.10)' };
  if (t.includes('school') || t.includes('university') || t.includes('college') || t.includes('kindergarten')) return { icon: GraduationCap, color: '#3B82F6', bg: 'rgba(59,130,246,.10)' };
  if (t.includes('park') || t.includes('garden')) return { icon: Trees, color: '#22C55E', bg: 'rgba(34,197,94,.10)' };
  if (t.includes('fuel') || t.includes('gas')) return { icon: Fuel, color: '#F97316', bg: 'rgba(249,115,22,.10)' };
  if (t.includes('parking')) return { icon: ParkingCircle, color: '#6366F1', bg: 'rgba(99,102,241,.10)' };
  if (t.includes('church') || t.includes('worship') || t.includes('mosque') || t.includes('synagogue')) return { icon: Church, color: '#A855F7', bg: 'rgba(168,85,247,.10)' };
  if (t.includes('metro') || t.includes('bus') || t.includes('station') || t.includes('transit')) return { icon: Bus, color: BRAND.cyan, bg: 'rgba(0,240,255,.10)' };
  if (t.includes('landmark') || t.includes('monument') || t.includes('museum') || t.includes('theatre') || t.includes('historic')) return { icon: Landmark, color: BRAND.amber, bg: 'rgba(255,184,0,.10)' };
  return { icon: MapPin, color: BRAND.violet, bg: 'rgba(163,116,255,.10)' };
}

/* ─── Argo Dark Mode Overrides ─── */
function applyArgoPalette(map: maplibregl.Map) {
  const style = map.getStyle();
  if (!style?.layers) return;

  for (const layer of style.layers) {
    const id = layer.id;
    const t = layer.type;

    if (t === 'background' || id.includes('landcover') || id.includes('landuse')) {
      if (id.includes('park') || id.includes('wood') || id.includes('grass') || id.includes('pitch')) {
        map.setPaintProperty(id, 'fill-color', BRAND.park);
      } else {
        try { map.setPaintProperty(id, t === 'background' ? 'background-color' : 'fill-color', BRAND.bg); } catch (_) { }
      }
    }

    if (t === 'fill' && id.includes('water')) {
      map.setPaintProperty(id, 'fill-color', BRAND.water);
    }

    if (id.includes('building')) {
      if (t === 'fill') {
        map.setPaintProperty(id, 'fill-color', BRAND.building);
        map.setPaintProperty(id, 'fill-outline-color', BRAND.buildingStroke);
      }
      if (t === 'fill-extrusion') {
        map.setPaintProperty(id, 'fill-extrusion-color', BRAND.building);
        try { map.setPaintProperty(id, 'fill-extrusion-opacity', 0.85); } catch (_) { }
      }
    }

    if (t === 'line' && id.includes('highway')) {
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
      } else {
        map.setPaintProperty(id, 'line-color', '#2A2E39');
      }
    }

    if (t === 'symbol') {
      if (map.getPaintProperty(id, 'text-color')) {
        const isPOI = id.includes('poi') || id.includes('place');
        try { map.setPaintProperty(id, 'text-color', isPOI ? '#FFFFFF' : '#E2E8F0'); } catch (_) { }
      }
      if (map.getPaintProperty(id, 'text-halo-color')) {
        try { map.setPaintProperty(id, 'text-halo-color', '#000000'); } catch (_) { }
        try { map.setPaintProperty(id, 'text-halo-width', 1.5); } catch (_) { }
      }
    }

    if (t === 'circle') {
      map.setLayoutProperty(id, 'visibility', 'none');
    }
  }
}

/* ═══════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════ */
export type DynamicPlace = {
  id: string | number;
  name: string;
  nameHy?: string;
  nameRu?: string;
  type: string;
  cat: 'transport' | 'nearby';
  rating: string | number;
  addressHy?: string;
  addressRu?: string;
  addressEn?: string;
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
  const [cardClosing, setCardClosing] = useState(false);
  const [globalLang, setGlobalLang] = useState<'hy' | 'ru' | 'en'>('hy');
  const markerRef = useRef<maplibregl.Marker | null>(null);

  // ── Follow Me state ──
  const [locationMode, setLocationMode] = useState<'off' | 'locate' | 'follow'>('off');
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const compassListenerRef = useRef<((e: DeviceOrientationEvent) => void) | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('argo-lang');
    if (saved && ['hy', 'ru', 'en'].includes(saved)) {
      setGlobalLang(saved as any);
    }
  }, []);

  /* ── Sync Map Marker ── */
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Clear old marker
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    if (selected) {
      const el = document.createElement('div');
      el.className = 'argo-custom-marker';
      el.innerHTML = `
        <div class="marker-core" style="background: ${getCategoryMeta(selected.type).color}"></div>
        <div class="marker-pulse" style="background: ${getCategoryMeta(selected.type).color}"></div>
      `;
      markerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat(selected.loc as [number, number])
        .addTo(mapRef.current);
    }
  }, [selected]);

  /* ── Debounced Go API Search ── */
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      const controller = new AbortController();
      fetch(`http://127.0.0.1:4000/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then(res => res.json())
        .then(data => setResults(data || []))
        .catch(err => {
          if (err.name !== 'AbortError') console.error('Go API Error:', err);
        });
    }, 180);

    return () => clearTimeout(timer);
  }, [query]);

  /* Select place */
  const selectPlace = useCallback((place: DynamicPlace) => {
    setCardClosing(false);
    setSelected(place);
    setQuery('');
    setSearchFocused(false);
    mapRef.current?.flyTo({ center: place.loc as [number, number], zoom: 17, pitch: 55, duration: 1800 });
  }, []);

  /* Close place with animation */
  const closePlace = useCallback(() => {
    setCardClosing(true);
    setTimeout(() => {
      setSelected(null);
      setCardClosing(false);
      mapRef.current?.flyTo({ center: [44.5135, 40.1820], zoom: 14.5, pitch: 45, duration: 1500 });
    }, 300);
  }, []);

  /* ── Follow Me: cleanup helper ── */
  const stopFollowMe = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (compassListenerRef.current) {
      window.removeEventListener('deviceorientation', compassListenerRef.current);
      compassListenerRef.current = null;
    }
    userMarkerRef.current?.remove();
    userMarkerRef.current = null;
    setLocationMode('off');
  }, []);

  /* ── Follow Me: 3-state handler ── */
  const handleLocate = useCallback(() => {
    const m = mapRef.current;
    if (!m) return;

    // Mode: off → locate
    if (locationMode === 'off') {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(pos => {
        const { longitude: lng, latitude: lat } = pos.coords;

        // Create user dot marker
        if (userMarkerRef.current) userMarkerRef.current.remove();
        const el = document.createElement('div');
        el.className = 'user-location-marker';
        el.innerHTML = `
          <div class="user-dot"></div>
          <div class="user-ring"></div>
        `;
        userMarkerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(m);

        m.flyTo({ center: [lng, lat], zoom: 17, pitch: 50, duration: 1400 });
        setLocationMode('locate');
      }, () => {
        m.flyTo({ center: [44.5135, 40.1820], zoom: 14.5, pitch: 45, duration: 1000 });
      });
      return;
    }

    // Mode: locate → follow (compass mode)
    if (locationMode === 'locate') {
      if (!navigator.geolocation) return;

      // Watch GPS for live position
      watchIdRef.current = navigator.geolocation.watchPosition(pos => {
        const { longitude: lng, latitude: lat } = pos.coords;
        userMarkerRef.current?.setLngLat([lng, lat]);
        m.setCenter([lng, lat]);
      }, undefined, { enableHighAccuracy: true, maximumAge: 1000 });

      // Compass: listen to device orientation
      const compassHandler = (e: DeviceOrientationEvent) => {
        // webkitCompassHeading is iOS, alpha is Android (need to invert)
        const heading = (e as any).webkitCompassHeading ?? (e.alpha ? 360 - e.alpha : null);
        if (heading !== null) {
          m.easeTo({ bearing: heading, duration: 200, easing: (t) => t });
        }
      };
      compassListenerRef.current = compassHandler;

      // iOS 13+ needs permission
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        (DeviceOrientationEvent as any).requestPermission().then((res: string) => {
          if (res === 'granted') {
            window.addEventListener('deviceorientation', compassHandler);
            setLocationMode('follow');
          }
        });
      } else {
        window.addEventListener('deviceorientation', compassHandler);
        setLocationMode('follow');
      }
      return;
    }

    // Mode: follow → off
    stopFollowMe();
    m.easeTo({ bearing: 0, pitch: 45, duration: 600 });
  }, [locationMode, stopFollowMe]);

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
        const start: [number, number] = [pos.coords.longitude, pos.coords.latitude];
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
      style: '/style.json',
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
      const hit = m.queryRenderedFeatures(e.point).find(feat =>
        feat.layer.type === 'symbol' && feat.properties.name
      );

      if (hit) {
        let cat: 'transport' | 'nearby' = 'nearby';
        const typeStr = (hit.properties.class || hit.properties.subclass || hit.properties.type || 'Location').toString().toLowerCase();

        if (typeStr.includes('bus') || typeStr.includes('transit') || typeStr.includes('station')) {
          cat = 'transport';
        }

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
        fetch(`http://127.0.0.1:4002/api/spatial/reverse?lng=${e.lngLat.lng}&lat=${e.lngLat.lat}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.place) {
              selectPlace({
                id: data.place.id,
                name: data.place.name,
                nameHy: data.place.name_hy || '',
                nameRu: data.place.name_ru || '',
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
    try { m.setPaintProperty('background', 'background-color', bgColor); } catch (_) { }
  }, [activeView]);

  const getAddress = (p: DynamicPlace) => {
    if (globalLang === 'hy' && p.addressHy) return p.addressHy;
    if (globalLang === 'ru' && p.addressRu) return p.addressRu;
    if (globalLang === 'en' && p.addressEn) return p.addressEn;
    return p.addressHy || p.addressRu || p.addressEn || '';
  };

  /* ── Helper: category meta for selected place ── */
  const catMeta = selected ? getCategoryMeta(selected.type) : null;
  const CatIcon = catMeta?.icon || MapPin;

  return (
    <div className="argo-root">
      {/* ─── Search ─── */}
      <div className="search-area">
        <div className="search-bar">
          <Link href="/" className="brand-pill">ARGO</Link>
          <Search size={17} color={searchFocused ? BRAND.cyan : '#666'} />
          <input
            placeholder="Поиск по Еревану..."
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
            {results.length ? results.slice(0, 6).map(r => {
              const meta = getCategoryMeta(r.type);
              const RIcon = meta.icon;
              return (
                <button key={r.id} className="result-row" onClick={() => selectPlace(r)}>
                  <div className="result-icon" style={{ background: meta.bg }}>
                    <RIcon size={15} color={meta.color} />
                  </div>
                  <div className="result-info">
                    <div className="result-name">{r.name}</div>
                    <div className="result-type">
                      {r.type}
                      {getAddress(r) ? ` · ${getAddress(r)}` : (r.nameRu && r.nameRu !== r.name ? ` · ${r.nameRu}` : '')}
                    </div>
                  </div>
                </button>
              );
            }) : <div className="no-results">Ничего не найдено</div>}
            {results.length > 6 && (
              <div className="results-more">ещё {results.length - 6} результатов</div>
            )}
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
        <button
          className={`ctrl-btn locate-btn locate-${locationMode}`}
          onClick={handleLocate}
          title={locationMode === 'off' ? 'Найти меня' : locationMode === 'locate' ? 'Следить за мной' : 'Выключить слежение'}
        >
          {locationMode === 'follow' ? <Compass size={19} /> : <LocateFixed size={19} />}
          {locationMode === 'follow' && <div className="compass-ring" />}
        </button>
        <button className="ctrl-btn" onClick={() => mapRef.current?.setBearing(0)}><Compass size={19} /></button>
      </div>

      {/* ─── Place Detail Card ─── */}
      {selected && (
        <div className={`detail-card ${cardClosing ? 'closing' : ''}`}>
          {/* Gradient Hero with Category Icon */}
          <div className="detail-hero" style={{ background: `linear-gradient(135deg, ${catMeta?.bg || BRAND.surface} 0%, ${BRAND.surface} 100%)` }}>
            <div className="hero-icon-wrap" style={{ background: catMeta?.bg }}>
              <CatIcon size={32} color={catMeta?.color} />
            </div>
            <button className="close-fab" onClick={() => { closePlace(); clearRoute(); }}>
              <X size={16} />
            </button>
            <div className="rating-badge"><Star size={13} fill="#FACC15" color="#FACC15" />{selected.rating}</div>
          </div>

          <div className="detail-body">
            <span className="detail-type"><ShieldCheck size={13} color={BRAND.emerald} /> {selected.type}</span>
            <h2>{selected.name}</h2>
            {(selected.nameHy || selected.nameRu) && (
              <p className="detail-lang">
                {selected.nameHy && <span className="lang-tag hy">{selected.nameHy}</span>}
                {selected.nameRu && selected.nameRu !== selected.name && <span className="lang-tag ru">{selected.nameRu}</span>}
              </p>
            )}

            <div className="detail-actions">
              <button className="btn-primary" onClick={() => drawRoute(selected.loc as [number, number])}>
                <Navigation2 size={18} fill="white" /> Маршрут
              </button>
              <button className="btn-secondary"><Share2 size={17} /></button>
              <button className="btn-secondary"><Heart size={17} /></button>
            </div>

            {/* Info section */}
            <div className="info-section">
              <div className="info-row">
                <MapPin size={15} color="#8A8F9E" />
                <span>{getAddress(selected) || 'Ереван, Армения'}</span>
              </div>
              <div className="info-row">
                <Clock size={15} color={BRAND.emerald} />
                <span style={{ color: BRAND.emerald }}>Открыто</span>
                <span className="info-secondary">· до 22:00</span>
              </div>
              <div className="info-row">
                <Globe size={15} color={BRAND.muted} />
                <span className="info-link">argo.am/{selected.name.toLowerCase().replace(/\s+/g, '-')}</span>
              </div>
            </div>

            {/* Transport section for transit stops */}
            {selected.cat === 'transport' && (
              <div className="departures">
                <div className="dep-header">
                  <span className="dep-title">LIVE ARRIVALS</span>
                  <span className="live-dot"><span className="pulse-circle" /> Live</span>
                </div>
                <div className="dep-row"><div className="bus-badge">14</div><span className="dep-dest">→ Massiv</span><span className="dep-eta">3 min</span></div>
                <div className="dep-row"><div className="bus-badge metro">M1</div><span className="dep-dest">→ Barekamutyun</span><span className="dep-eta purple">7 min</span></div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
