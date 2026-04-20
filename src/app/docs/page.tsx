'use client';

import { useEffect, useState } from 'react';
import { Home, Rocket, Terminal, Layers, Shield, Flag, Copy, Check, Globe } from 'lucide-react';

type Lang = 'hy' | 'ru' | 'en';

const T: Record<Lang, any> = {
  hy: {
    docs: 'ՓԱՍՏԱԹՂԹԵՐ',
    about: 'Ինչ է Argo Maps-ը',
    architecture: 'Ճարտարապետություն',
    quickstart: 'Արագ Մեկնարկ',
    api: 'API Էնդփոյնթներ',
    styles: 'Ոճեր',
    limits: 'Սահմանափակումներ',
    roadmap: 'Ծրագիր',
    title: 'Argo Maps — Փաստաթղթեր v1.0',
    desc: 'Argo Maps-ը Հայաստանի առաջին տեղական քարտեզային հարթակն է՝ ստեղծված Argo Technologies-ի կողմից։ Անվճար, ճշգրիտ և գեղեցիկ քարտեզներ ծրագրավորողների համար՝ օպտիմիզացված տեղական շուկայի համար։ Այնտեղ, որտեղ Apple և Google քարտեզները թերի են՝ Argo Maps-ը լրացնում է բացը։',
    tile_server_desc: 'Սպասարկում է վեկտորային քարտեզներ PostGIS-ից չափազանց ցածր արձագանքման ժամանակով:',
    api_server_desc: 'Կառավարում է բանալիներ, սահմանափակումներ և վիճակագրություն:',
    db_desc: 'OSM Հայաստանի տվյալներ՝ սեփական և տրանսպորտային շերտերով:',
    renderer_desc: 'Աշխատում է սարքի վրա: 3D շենքեր, սահուն կամերա և անհատական ոճեր:',
    vectors: 'Վեկտորային քարտեզներ (Martin)',
    fuzzy: 'Որոնման API (Go + Levenshtein, Բազմալեզու)',
    reverse: 'Հակառակ Geocoding (Rust K-D Tree)',
    nearby: 'Մոտակա օբյեկտներ (Rust K-D Tree)',
    live: 'Ուղիղ GPS Երևանի ավտոբուսների համար (Go Socket)',
    default: 'Լռելյայն',
    default_desc: 'Լուսավոր թեմա՝ Argo ապրանքանիշի գույներով:',
    dark: 'Մութ',
    dark_desc: 'Օպտիմիզացված է գիշերվա և գեղեցիկ UI-ի համար:',
    sat: 'Արբանյակային',
    sat_desc: 'Բարձր որակի պատկերներ՝ վեկտորային շերտերով:',
    free: 'Անվճար',
    unlimited: 'Անսահմանափակ',
    contact: 'Գրեք մեզ',
    startups: 'Հայկական Ստարտափներ',
    intl: 'Միջազգային',
    built_with: 'Argo Technologies — Ստեղծված է սիրով Երևանում 🇦🇲',
  },
  ru: {
    docs: 'ДОКУМЕНТАЦИЯ',
    about: 'Что такое Argo Maps?',
    architecture: 'Архитектура',
    quickstart: 'Быстрый Старт',
    api: 'API Эндпоинты',
    styles: 'Стили',
    limits: 'Лимиты Расценок',
    roadmap: 'Дорожная Карта',
    title: 'Argo Maps — Документация v1.0',
    desc: 'Argo Maps — первая национальная картографическая платформа Армении, созданная Argo Technologies. Бесплатные, точные и красивые тайлы карт с API для разработчиков и транспортными данными, оптимизированными для Армении. Где не справляются Apple и Google — помогает Argo Maps.',
    tile_server_desc: 'Раздает векторные тайлы из PostGIS с минимальной задержкой.',
    api_server_desc: 'Обрабатывает ключи API, лимиты и статистику в реальном времени.',
    db_desc: 'Данные OSM Армении в сочетании с нашими транспортными слоями.',
    renderer_desc: 'Работает на устройстве. 3D-здания, плавная камера и кастомные стили.',
    vectors: 'Векторные тайлы (Martin)',
    fuzzy: 'Fuzzy Search API (Go + Levenshtein, Multi-lang)',
    reverse: 'Обратный геокодинг (Rust K-D Tree)',
    nearby: 'Ближайшие объекты инфраструктуры (Rust K-D Tree)',
    live: 'Live GPS сокеты автобусов Еревана (Go Socket)',
    default: 'По умолчанию',
    default_desc: 'Светлая тема в фирменных цветах Argo.',
    dark: 'Темный',
    dark_desc: 'Оптимизировано для ночного времени и интерфейса.',
    sat: 'Спутник',
    sat_desc: 'Снимки высокого разрешения со слоями.',
    free: 'Бесплатно',
    unlimited: 'Безлимит',
    contact: 'Напишите нам',
    startups: 'Армянские Стартапы',
    intl: 'Международный',
    built_with: 'Argo Technologies — Сделано с ❤️ в Ереване 🇦🇲',
  },
  en: {
    docs: 'DOCUMENTATION',
    about: 'What is Argo Maps?',
    architecture: 'Architecture',
    quickstart: 'Quick Start',
    api: 'API Endpoints',
    styles: 'Styles',
    limits: 'Rate Limits',
    roadmap: 'Roadmap',
    title: 'Argo Maps — Documentation v1.0',
    desc: "Argo Maps is Armenia's first native Map platform, built by Argo Technologies. Free, accurate, and beautiful map tiles with a developer API and real-time transport data optimized for Armenia. Where Apple Maps and Google Maps fall short — Argo Maps fills the gap.",
    tile_server_desc: 'Serves vector tiles from PostGIS with extreme low latency.',
    api_server_desc: 'Handles API keys, rate limits, and real-time statistics.',
    db_desc: 'OSM Armenia data combined with proprietary transport layers.',
    renderer_desc: 'Runs on device. 3D buildings, smooth camera, custom Argo styles.',
    vectors: 'Vector Map Tiles (Martin)',
    fuzzy: 'Fuzzy Search API (Go + Levenshtein, Multi-lang)',
    reverse: 'Reverse Geocoding (Rust K-D Tree)',
    nearby: 'Nearby Infrastructure (Rust K-D Tree)',
    live: 'Live GPS WebSockets for Yerevan Buses (Go Socket)',
    default: 'Default',
    default_desc: 'Light mode with Argo brand colors.',
    dark: 'Dark',
    dark_desc: 'Optimized for nighttime and sleek UI.',
    sat: 'Satellite',
    sat_desc: 'High-res imagery with vector overlays.',
    free: 'Free',
    unlimited: 'Unlimited',
    contact: 'Contact Us',
    startups: 'Armenian Startups',
    intl: 'International',
    built_with: 'Argo Technologies — Built with ❤️ in Yerevan 🇦🇲',
  }
};

const getSections = (t: any) => [
  { id: 'about', title: t.about, icon: Globe },
  { id: 'architecture', title: t.architecture, icon: Layers },
  { id: 'quickstart', title: t.quickstart, icon: Rocket },
  { id: 'api', title: t.api, icon: Terminal },
  { id: 'limits', title: t.limits, icon: Shield },
  { id: 'roadmap', title: t.roadmap, icon: Flag },
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
  const [lang, setLang] = useState<Lang>('hy');
  const [activeSection, setActiveSection] = useState('about');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('argo-lang') as Lang;
    if (saved && ['hy', 'ru', 'en'].includes(saved)) setLang(saved);
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as Lang;
      if (['hy', 'ru', 'en'].includes(detail)) setLang(detail);
    };
    window.addEventListener('argo-lang-change', handler);
    return () => window.removeEventListener('argo-lang-change', handler);
  }, []);

  const t = T[lang];
  const sections = getSections(t);

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
          <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>{t.docs}</h4>
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
                fontWeight: activeSection === section.id ? 500 : 400,
                textDecoration: 'none'
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
          <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem', fontWeight: 800 }}>{t.title}</h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
            {t.desc}
          </p>
        </section>

        {/* Architecture */}
        <section id="architecture" style={{ marginBottom: '6rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Layers size={24} color="var(--accent-cyan)" /> {t.architecture}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {[
              { title: 'Tile Server', tech: 'Martin (Rust)', desc: t.tile_server_desc },
              { title: 'API Server', tech: 'Go', desc: t.api_server_desc },
              { title: 'Database', tech: 'PostgreSQL + PostGIS', desc: t.db_desc },
              { title: 'Renderer', tech: 'MapLibre GL', desc: t.renderer_desc },
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
            <Rocket size={24} color="var(--accent-cyan)" /> {t.quickstart}
          </h2>
          
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Web (MapLibre GL JS)</h3>
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => copyToClipboard(webCode, 'web')}
              style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {copied === 'web' ? <Check size={18} color="var(--accent-cyan)" /> : <Copy size={18} />}
            </button>
            <pre style={{ background: '#0F1014', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', color: '#A3BE8C', overflowX: 'auto', fontSize: '0.9rem' }}>
              <code>{webCode}</code>
            </pre>
          </div>

          <h3 style={{ fontSize: '1.25rem', margin: '2rem 0 1rem' }}>React Native</h3>
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => copyToClipboard(rnCode, 'rn')}
              style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {copied === 'rn' ? <Check size={18} color="var(--accent-cyan)" /> : <Copy size={18} />}
            </button>
            <pre style={{ background: '#0F1014', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', color: '#88C0D0', marginBottom: '1rem', fontSize: '0.9rem' }}>
              <code>npm install @maplibre/maplibre-react-native</code>
            </pre>
            <pre style={{ background: '#0F1014', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', color: '#EBCB8B', overflowX: 'auto', fontSize: '0.9rem' }}>
              <code>{rnCode}</code>
            </pre>
          </div>
        </section>

        {/* API Endpoints */}
        <section id="api" style={{ marginBottom: '6rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Terminal size={24} color="var(--accent-cyan)" /> {t.api}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { method: 'GET', path: '/tiles/{z}/{x}/{y}.mvt', desc: t.vectors },
              { method: 'GET', path: '/api/search?q={query}', desc: t.fuzzy },
              { method: 'GET', path: '/api/spatial/reverse?lng={l}&lat={l}', desc: t.reverse },
              { method: 'GET', path: '/api/spatial/nearby?lng={l}&lat={l}&k={num}', desc: t.nearby },
              { method: 'GET', path: 'wss://bus.argotech.am/ws', desc: t.live },
            ].map((api, i) => (
              <div key={i} className="glass" style={{ display: 'flex', alignItems: 'center', padding: '1rem 1.5rem', borderRadius: '12px', gap: '2rem' }}>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '0.8rem', width: '40px' }}>{api.method}</span>
                <code style={{ fontSize: '0.9rem', color: 'var(--text-main)', background: 'transparent', padding: 0 }}>{api.path}</code>
                <span style={{ marginLeft: 'auto', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{api.desc}</span>
              </div>
            ))}
          </div>
        </section>



        {/* Limits */}
        <section id="limits" style={{ marginBottom: '6rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Shield size={24} color="var(--accent-cyan)" /> {t.limits}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {[
              { tier: t.startups, limit: t.unlimited, price: t.free },
              { tier: t.intl, limit: '50,000 / mo', price: t.free },
              { tier: 'Pro', limit: t.unlimited, price: t.contact },
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
            <Flag size={24} color="var(--accent-cyan)" /> {t.roadmap}
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
            {t.built_with}
          </p>
        </footer>
      </main>
    </div>
  );
}
