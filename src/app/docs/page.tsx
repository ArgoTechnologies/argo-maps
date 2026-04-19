'use client';

import { useEffect, useState } from 'react';
import { 
  Home, 
  Rocket, 
  Terminal, 
  Layers, 
  Shield, 
  Flag,
  Copy,
  Check,
  Globe
} from 'lucide-react';

const sections = [
  { id: 'about', title: 'What is Argo Maps?', icon: Globe },
  { id: 'architecture', title: 'Architecture', icon: Layers },
  { id: 'quickstart', title: 'Quick Start', icon: Rocket },
  { id: 'api', title: 'API Endpoints', icon: Terminal },
  { id: 'styles', title: 'Styles', icon: Layers },
  { id: 'limits', title: 'Rate Limits', icon: Shield },
  { id: 'roadmap', title: 'Roadmap', icon: Flag },
];

const webCode = `const map = new maplibregl.Map({
  container: 'map',
  style: 'https://api.argotech.am/maps/style.json?key=YOUR_KEY',
  center: [44.509, 40.177],
  zoom: 13
});`;

const rnCode = `<MapLibreGL.MapView
  styleURL="https://api.argotech.am/maps/style.json?key=YOUR_KEY"
  style={{ flex: 1 }}
>
  <MapLibreGL.Camera zoomLevel={13} centerCoordinate={[44.509, 40.177]} />
</MapLibreGL.MapView>`;

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('about');
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', paddingTop: '64px' }}>
      {/* Sidebar */}
      <aside className="glass" style={{
        width: '300px',
        position: 'fixed',
        top: '64px',
        bottom: 0,
        padding: '2rem 1rem',
        overflowY: 'auto',
        borderRight: '1px solid var(--border-color)'
      }}>
        <div style={{ padding: '0 1rem', marginBottom: '2rem' }}>
          <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>Documentation</h4>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={() => setActiveSection(section.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                color: activeSection === section.id ? 'var(--text-main)' : 'var(--text-muted)',
                background: activeSection === section.id ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                transition: 'var(--transition-fast)',
                fontWeight: activeSection === section.id ? 500 : 400
              }}
            >
              <section.icon size={18} />
              {section.title}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: '300px', padding: '4rem 8rem', width: '100%', maxWidth: '1200px' }}>
        
        {/* About */}
        <section id="about" style={{ marginBottom: '6rem' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>Argo Maps — Documentation v1.0</h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
            Argo Maps is Armenia's first native map platform, built by Argo Technologies. 
            Free, accurate, and beautiful map tiles with a developer API and real-time transport data optimized for Armenia. 
            Where Apple Maps and Google Maps fall short — Argo Maps fills the gap.
          </p>
        </section>

        {/* Architecture */}
        <section id="architecture" style={{ marginBottom: '6rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Layers size={24} color="var(--accent-cyan)" /> Architecture
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {[
              { title: 'Tile Server', tech: 'Martin (Rust)', desc: 'Serves vector tiles from PostGIS with extreme low latency.' },
              { title: 'API Server', tech: 'Go', desc: 'Handles API keys, rate limits, and real-time statistics.' },
              { title: 'Database', tech: 'PostgreSQL + PostGIS', desc: 'OSM Armenia data combined with proprietary transport layers.' },
              { title: 'Renderer', tech: 'MapLibre GL', desc: 'Runs on device. 3D buildings, smooth camera, custom Argo styles.' },
            ].map((item, i) => (
              <div key={i} className="glass" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                <h4 style={{ marginBottom: '0.25rem', color: 'var(--accent-cyan)' }}>{item.title}</h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{item.tech}</div>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Start */}
        <section id="quickstart" style={{ marginBottom: '6rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Rocket size={24} color="var(--accent-cyan)" /> Quick Start
          </h2>
          
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Web (MapLibre GL JS)</h3>
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => copyToClipboard(webCode, 'web')}
              style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-dim)' }}
            >
              {copied === 'web' ? <Check size={18} color="var(--accent-cyan)" /> : <Copy size={18} />}
            </button>
            <pre>
              <code className="language-js">{webCode}</code>
            </pre>
          </div>

          <h3 style={{ fontSize: '1.25rem', margin: '2rem 0 1rem' }}>React Native</h3>
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => copyToClipboard(rnCode, 'rn')}
              style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-dim)' }}
            >
              {copied === 'rn' ? <Check size={18} color="var(--accent-cyan)" /> : <Copy size={18} />}
            </button>
            <pre>
              <code className="language-bash">npm install @maplibre/maplibre-react-native</code>
            </pre>
            <pre>
              <code className="language-jsx">{rnCode}</code>
            </pre>
          </div>
        </section>

        {/* API Endpoints */}
        <section id="api" style={{ marginBottom: '6rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Terminal size={24} color="var(--accent-cyan)" /> API Endpoints
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { method: 'GET', path: '/maps/style.json', desc: 'MapLibre стиль карты' },
              { method: 'GET', path: '/tiles/{z}/{x}/{y}.mvt', desc: 'Векторные тайлы' },
              { method: 'GET', path: '/transport/stops', desc: 'Все остановки Армении' },
              { method: 'GET', path: '/transport/stops/{id}/arrivals', desc: 'Live прибытие автобусов' },
              { method: 'GET', path: '/transport/routes', desc: 'Все маршруты' },
              { method: 'GET', path: '/transport/routes/{id}/full', desc: 'Маршрут с геометрией' },
              { method: 'GET', path: '/map/nearby?loc=lat,lng&radius=3000', desc: 'Ближайшие остановки (C++ Quadtree)' },
            ].map((api, i) => (
              <div key={i} className="glass" style={{ display: 'flex', alignItems: 'center', padding: '1rem 1.5rem', borderRadius: '12px', gap: '2rem' }}>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '0.8rem', width: '40px' }}>{api.method}</span>
                <code style={{ fontSize: '0.9rem', color: 'var(--text-main)', background: 'transparent', padding: 0 }}>{api.path}</code>
                <span style={{ marginLeft: 'auto', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{api.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Styles */}
        <section id="styles" style={{ marginBottom: '6rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Layers size={24} color="var(--accent-cyan)" /> Styles
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {[
              { name: 'Default', desc: 'Light mode with Argo brand colors.', color: '#fff' },
              { name: 'Dark', desc: 'Optimized for nighttime and sleek UI.', color: '#0a0a0c' },
              { name: 'Satellite', desc: 'High-res imagery with vector overlays.', color: '#2a2a2a' },
            ].map((style, i) => (
              <div key={i} className="glass" style={{ padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ height: '120px', background: style.color, borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }} />
                <h4 style={{ marginBottom: '0.5rem' }}>{style.name}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{style.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Limits */}
        <section id="limits" style={{ marginBottom: '6rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Shield size={24} color="var(--accent-cyan)" /> Rate Limits
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {[
              { tier: 'Armenian Startups', limit: 'Unlimited', price: 'Free' },
              { tier: 'International', limit: '50,000 / mo', price: 'Free' },
              { tier: 'Pro', limit: 'Unlimited', price: 'Contact Us' },
            ].map((plan, i) => (
              <div key={i} className="glass" style={{ padding: '2rem', borderRadius: '16px', borderTop: i === 0 ? '4px solid var(--accent-cyan)' : '1px solid var(--border-color)' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>{plan.tier}</h3>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{plan.limit}</div>
                <div style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{plan.price}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Roadmap */}
        <section id="roadmap" style={{ marginBottom: '6rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Flag size={24} color="var(--accent-cyan)" /> Roadmap
          </h2>
          <div style={{ position: 'relative', paddingLeft: '2rem' }}>
            <div style={{ position: 'absolute', left: '0.5rem', top: 0, bottom: 0, width: '1px', background: 'var(--border-color)' }} />
            {[
              { version: 'v1.0', content: 'Tile-server, transport API, MapLibre core integration. 🇦🇲', status: 'released' },
              { version: 'v1.5', content: 'Style editor, traffic layers, POI search engine.', status: 'planned' },
              { version: 'v2.0', content: 'Native routing (removing Mapbox dependency), indoor maps, advanced analytics.', status: 'planned' },
            ].map((item, i) => (
              <div key={i} style={{ position: 'relative', marginBottom: '3rem' }}>
                <div style={{ 
                  position: 'absolute', 
                  left: '-2rem', 
                  top: '0.25rem', 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  background: item.status === 'released' ? 'var(--accent-cyan)' : 'var(--bg-tertiary)',
                  border: item.status === 'released' ? 'none' : '2px solid var(--border-color)',
                  boxShadow: item.status === 'released' ? '0 0 10px var(--accent-cyan)' : 'none'
                }} />
                <h4 style={{ color: item.status === 'released' ? 'var(--accent-cyan)' : 'var(--text-main)', marginBottom: '0.5rem' }}>{item.version}</h4>
                <p style={{ color: 'var(--text-muted)' }}>{item.content}</p>
              </div>
            ))}
          </div>
        </section>

        <footer style={{ marginTop: '8rem', padding: '4rem 0', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
            Argo Technologies — Built with ❤️ in Yerevan 🇦🇲
          </p>
        </footer>
      </main>
    </div>
  );
}
