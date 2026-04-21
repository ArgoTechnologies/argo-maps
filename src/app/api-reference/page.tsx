'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, Key, Copy, Check, ChevronRight, Globe, Zap, Terminal, ArrowRight } from 'lucide-react';
import { group } from 'console';

type Lang = 'hy' | 'ru' | 'en';

const T: Record<Lang, any> = {
  hy: {
    home: 'Գլխավոր',
    api_ref: 'API Տեղեկանք',
    title: 'API Տեղեկանք',
    subtitle: 'Argo Maps REST API. Բոլոր հարցումները պահանջում են API բանալի, որը կարող եք ստանալ ',
    dev_portal: 'Մշակողի Պորտալից',
    groups: 'Խումբ',
    avg_res: 'Միջ. արձագանք',
    auth: 'Նույնականացում',
    auth_desc: 'Օգտագործեք ձեր API բանալին որպես Authorization: Bearer կամ ?key= պարամետր:',
    get_key: 'Ստանալ Բանալի',
    base_url: 'ՀԻՄՆԱԿԱՆ URL',
    endpoints: 'ԷՆԴՓՈՅՆԹՆԵՐ',
    params: 'ՊԱՐԱՄԵՏՐԵՐ',
    name: 'Անուն',
    type: 'Տեսակ',
    req: 'Պարտադիր',
    desc: 'Նկարագրություն',
    required: 'Այո',
    optional: 'Ոչ',
    request: 'Հարցում',
    response: 'Արդյունք',
    copy: 'Պատճենել',
    copied: 'Պատճենված է',
    rate_limits: 'Սահմանափակումներ',
    search_title: 'Տեղանունների Որոնում',
    search_desc: 'Որոնեք փողոցներ, վայրեր և հաստատություններ Հայաստանում առաջադեմ որոնմամբ:',
    geocode_desc: 'Փոխարկեք հասցեն աշխարհագրական կոորդինատների:',
    reverse_desc: 'Փոխարկեք կոորդինատները մարդկանց համար հասկանալի հասցեի:',
    tiles_desc: 'Ստացեք Mapbox Vector Tiles (MVT) մեր տեղական PMTiles բազայից:',
  },
  ru: {
    home: 'Главная',
    api_ref: 'API Документация',
    title: 'API Документация',
    subtitle: 'Argo Maps REST API. Для всех запросов требуется API ключ, который можно получить в ',
    dev_portal: 'Портале Разработчика',
    groups: 'Групп',
    avg_res: 'Ср. ответ',
    auth: 'Аутентификация',
    auth_desc: 'Передавайте ключ в заголовке Authorization: Bearer или как параметр ?key=.',
    get_key: 'Получить Ключ',
    base_url: 'БАЗОВЫЙ URL',
    endpoints: 'ЭНДПОИНТЫ',
    params: 'ПАРАМЕТРЫ',
    name: 'Имя',
    type: 'Тип',
    req: 'Обязат.',
    desc: 'Описание',
    required: 'Да',
    optional: 'Нет',
    request: 'Запрос',
    response: 'Ответ',
    copy: 'Копировать',
    copied: 'Скопировано',
    rate_limits: 'Лимиты Запросов',
    search_title: 'Поиск Мест',
    search_desc: 'Ищите улицы, адреса и заведения по Армении с продвинутым поиском (Levenshtein).',
    geocode_desc: 'Преобразует строку адреса в географические координаты.',
    reverse_desc: 'Преобразует координаты в читаемый адрес с использованием Rust K-D Tree.',
    tiles_desc: 'Получение векторных тайлов (MVT) напрямую из локальной базы PMTiles Армении.',
  },
  en: {
    home: 'Home',
    api_ref: 'API Reference',
    title: 'API Reference',
    subtitle: 'The Argo Maps REST API. All endpoints require an API key obtained from the ',
    dev_portal: 'Developer Portal',
    groups: 'Endpoint Groups',
    avg_res: 'Avg Response',
    auth: 'Authentication',
    auth_desc: 'Pass your API key as Authorization: Bearer YOUR_API_KEY or as ?key= query param.',
    get_key: 'Get API Key',
    base_url: 'BASE URL',
    endpoints: 'ENDPOINTS',
    params: 'PARAMETERS',
    name: 'Name',
    type: 'Type',
    req: 'Required',
    desc: 'Description',
    required: 'Required',
    optional: 'Optional',
    request: 'Request',
    response: 'Response',
    copy: 'Copy',
    copied: 'Copied!',
    rate_limits: 'Rate Limits',
    search_title: 'Fuzzy Place Search',
    search_desc: 'Search for places, streets, and POIs across Armenia with advanced fuzzy matching.',
    geocode_desc: 'Convert an address or place name into geographic coordinates.',
    reverse_desc: 'Convert geographic coordinates into a human-readable address.',
    tiles_desc: 'Serve Mapbox Vector Tiles (MVT) from the locally generated Armenia PMTiles archive.',
  }
};

const getEndpoints = (t: any) => [
  {
    group: 'Search',
    icon: Search,
    color: '#00F0FF',
    items: [
      {
        method: 'GET',
        path: '/api/search',
        title: t.search_title,
        desc: t.search_desc,
        params: [
          { name: 'q', type: 'string', required: true, desc: 'Search query' },
          { name: 'limit', type: 'number', required: false, desc: 'Max limit (1-50)' },
        ],
        example: `curl "https://argo-maps.pages.dev/api/search?q=Abovyan&lang=en" \\\n  -H "Authorization: Bearer YOUR_KEY"`,
        response: `{\n  "results": [\n    {\n      "id": "1234",\n      "name": "Abovyan Street",\n      "lat": 40.1792,\n      "lng": 44.5136\n    }\n  ],\n  "total": 1\n}`,
      },
    ],
  },
  {
    group: 'Geocoding',
    icon: MapPin,
    color: '#A374FF',
    items: [
      {
        method: 'GET',
        path: '/api/geocode',
        title: 'Forward Geocoding',
        desc: t.geocode_desc,
        params: [
          { name: 'q', type: 'string', required: true, desc: 'Address to geocode' },
        ],
        example: `curl "https://argo-maps.pages.dev/api/geocode?q=Yerevan" \\\n  -H "Authorization: Bearer YOUR_KEY"`,
        response: `{\n  "lat": 40.181,\n  "lng": 44.514,\n  "confidence": 0.95\n}`,
      },
      {
        method: 'GET',
        path: '/api/reverse',
        title: 'Reverse Geocoding',
        desc: t.reverse_desc,
        params: [
          { name: 'lat', type: 'number', required: true, desc: 'Latitude' },
          { name: 'lng', type: 'number', required: true, desc: 'Longitude' },
        ],
        example: `curl "https://argo-maps.pages.dev/api/reverse?lat=40.18&lng=44.51" \\\n  -H "Authorization: Bearer YOUR_KEY"`,
        response: `{\n  "place": {\n    "name": "Republic Square",\n    "distance_m": 12\n  }\n}`,
      },
    ],
  },
  {
    group: 'Tiles',
    icon: Globe,
    color: '#22C55E',
    items: [
      {
        method: 'GET',
        path: '/tiles/{z}/{x}/{y}.mvt',
        title: 'Vector Map Tiles',
        desc: t.tiles_desc,
        params: [
          { name: 'z', type: 'number', required: true, desc: 'Zoom level' },
          { name: 'x', type: 'number', required: true, desc: 'X coordinate' },
          { name: 'y', type: 'number', required: true, desc: 'Y coordinate' },
        ],
        example: `// Use directly in MapLibre\nconst url = 'https://argo-maps.pages.dev/tiles/armenia';`,
        response: `// Binary MVT tile data\n// Content-Type: application/x-protobuf`,
      },
    ],
  },
];

const METHOD_COLORS: Record<string, string> = { GET: '#22C55E', POST: '#3B82F6', DELETE: '#EF4444' };

export default function ApiReference() {
  const [lang, setLang] = useState<Lang>('hy');
  const [copied, setCopied] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState('Search');

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
  const endpoints = getEndpoints(t);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '64px', color: 'var(--text-main)' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border-color)', padding: '3rem 2rem 2rem', background: 'var(--bg-secondary)' }}>
        <div className="container" style={{ maxWidth: '1100px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            <Link href="/" style={{ color: 'var(--text-dim)' }}>{t.home}</Link>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--accent-cyan)' }}>{t.api_ref}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>{t.title}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '560px', lineHeight: 1.6 }}>
                {t.subtitle} 
                <Link href="/developer" style={{ color: 'var(--accent-cyan)' }}>{t.dev_portal}</Link>.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="glass" style={{ padding: '1rem 1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>3</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>{t.groups}</div>
              </div>
              <div className="glass" style={{ padding: '1rem 1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#A374FF' }}>50ms</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>{t.avg_res}</div>
              </div>
            </div>
          </div>

          {/* Auth callout */}
          <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,240,255,0.06)', border: '1px solid rgba(0,240,255,0.15)', borderRadius: '12px', padding: '1rem 1.5rem' }}>
            <Key size={18} color="var(--accent-cyan)" />
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.auth}: </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t.auth_desc}</span>
            </div>
            <Link href="/developer" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {t.get_key} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Base URL */}
      <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
        <div className="container" style={{ maxWidth: '1100px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.base_url}</span>
          <code style={{ background: 'var(--bg-secondary)', padding: '6px 14px', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--accent-cyan)', border: '1px solid var(--border-color)', flex: 1, userSelect: 'all' }}>
            https://argo-maps.pages.dev
          </code>
          <button onClick={() => copy('https://argo-maps.pages.dev', 'base')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
            {copied === 'base' ? <Check size={14} color="#22C55E" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="container" style={{ maxWidth: '1100px', padding: '2rem', display: 'grid', gridTemplateColumns: '220px 1fr', gap: '3rem' }}>
        <aside style={{ position: 'sticky', top: '80px', alignSelf: 'start' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>{t.endpoints}</div>
          {endpoints.map(group => (
            <div key={group.group} style={{ marginBottom: '1.5rem' }}>
              <button
                onClick={() => setActiveGroup(group.group)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: activeGroup === group.group ? group.color : 'var(--text-muted)', fontWeight: 700, fontSize: '0.88rem', padding: '6px 0', width: '100%', textAlign: 'left' }}
              >
                <group.icon size={15} />
                {group.group}
              </button>
              {group.items.map(ep => (
                <a key={ep.path} href={`#\${ep.path}`} style={{ display: 'block', padding: '4px 0 4px 23px', fontSize: '0.8rem', color: 'var(--text-dim)', textDecoration: 'none' }}
                  onMouseOver={e => (e.currentTarget.style.color = 'var(--text-main)')}
                  onMouseOut={e => (e.currentTarget.style.color = 'var(--text-dim)')}
                >
                  {ep.title}
                </a>
              ))}
            </div>
          ))}
        </aside>

        <main style={{ minWidth: 0 }}>
          {endpoints.map(group => (
            <section key={group.group} style={{ marginBottom: '4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `\${group.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <group.icon size={16} color={group.color} />
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{group.group}</h2>
              </div>

              {group.items.map(ep => (
                <div key={ep.path} id={ep.path} style={{ marginBottom: '3rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden' }}>
                  <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <span style={{ background: `\${METHOD_COLORS[ep.method]}20`, color: METHOD_COLORS[ep.method], padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em', flexShrink: 0, marginTop: '2px' }}>
                      {ep.method}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <code style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>{ep.path}</code>
                      </div>
                      <h3 style={{ fontWeight: 600, marginBottom: '4px' }}>{ep.title}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{ep.desc}</p>
                    </div>
                  </div>

                  <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: '1rem' }}>{t.params}</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr>
                          {[t.name, t.type, t.req, t.desc].map(h => (
                            <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-dim)', fontWeight: 600, fontSize: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {ep.params.map((p: any) => (
                          <tr key={p.name}>
                            <td style={{ padding: '10px 12px' }}><code style={{ color: 'var(--accent-cyan)', background: 'rgba(0,240,255,0.08)', padding: '2px 6px', borderRadius: '4px' }}>{p.name}</code></td>
                            <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{p.type}</td>
                            <td style={{ padding: '10px 12px' }}>
                              <span style={{ padding: '2px 8px', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 700, background: p.required ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.06)', color: p.required ? '#EF4444' : 'var(--text-dim)' }}>
                                {p.required ? t.required : t.optional}
                              </span>
                            </td>
                            <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{p.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
                    <div style={{ borderRight: '1px solid var(--border-color)' }}>
                      <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}><Terminal size={13} /> {t.request}</span>
                        <button onClick={() => copy(ep.example, ep.path + '-req')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                          {copied === ep.path + '-req' ? <Check size={12} color="#22C55E" /> : <Copy size={12} />}
                          {copied === ep.path + '-req' ? t.copied : t.copy}
                        </button>
                      </div>
                      <pre style={{ margin: 0, padding: '1.25rem 1.5rem', fontSize: '0.78rem', overflowX: 'auto', color: '#A3BE8C', lineHeight: 1.6, minHeight: '140px' }}>{ep.example}</pre>
                    </div>
                    <div>
                      <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)' }}>200 {t.response}</span>
                        <button onClick={() => copy(ep.response, ep.path + '-res')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                          {copied === ep.path + '-res' ? <Check size={12} color="#22C55E" /> : <Copy size={12} />}
                          {copied === ep.path + '-res' ? t.copied : t.copy}
                        </button>
                      </div>
                      <pre style={{ margin: 0, padding: '1.25rem 1.5rem', fontSize: '0.78rem', overflowX: 'auto', color: '#88C0D0', lineHeight: 1.6, minHeight: '140px' }}>{ep.response}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          ))}

<section style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '2rem', marginBottom: '3rem' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
    <Zap size={20} color="var(--accent-cyan)" />
    <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{t.rate_limits}</h2>
  </div>
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
    {[
      { plan: 'Free', limit: '1,000 req/day', color: '#22C55E' },
      { plan: 'Pro', limit: '100,000 req/day', color: '#A374FF' },
      { plan: 'Enterprise', limit: 'Unlimited', color: '#00F0FF' },
    ].map(p => (
      <div key={p.plan} style={{ padding: '1.25rem', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
        <div style={{ fontWeight: 800, color: p.color, marginBottom: '4px' }}>{p.plan}</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{p.limit}</div>
      </div>
    ))}
  </div>
</section>
        </main >
      </div >
    </div >
  );
}
