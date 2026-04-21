'use client';

import Link from 'next/link';
import { Map, Globe, ChevronDown, Code, X, Search } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const LANG_LABELS: Record<string, string> = { hy: 'HY', ru: 'RU', en: 'EN' };

export default function Navbar() {
  const [lang, setLang] = useState<'hy' | 'ru' | 'en'>('hy');
  const [langMenu, setLangMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const langRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('argo-lang') as any;
    if (saved && ['hy', 'ru', 'en'].includes(saved)) setLang(saved);
  }, []);

  // Close lang menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const changeLang = (l: 'hy' | 'ru' | 'en') => {
    setLang(l);
    localStorage.setItem('argo-lang', l);
    setLangMenu(false);
    // Dispatch custom event so Map page can react
    window.dispatchEvent(new CustomEvent('argo-lang-change', { detail: l }));
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      height: '64px',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      padding: '0 2rem',
      justifyContent: 'space-between',
      background: '#07070B',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
    }}>
      {/* Left: Logo + Nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800, fontSize: '1.2rem', color: '#00F2FF', letterSpacing: '-0.02em' }}>
          <div style={{ background: 'linear-gradient(135deg,#00f2ff,#8147ff)', width: '30px', height: '30px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Map size={16} color="#000" />
          </div>
          Argo Maps
        </Link>

        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {[
            { href: '/docs', label: 'Docs' },
            { href: '/map', label: 'Explorer', accent: true },
            { href: '/api-reference', label: 'API Reference' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 600,
                color: item.accent ? '#00F2FF' : 'rgba(255,255,255,0.55)',
                transition: 'color 0.15s, background 0.15s',
              }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = item.accent ? '#00F2FF' : 'rgba(255,255,255,0.55)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Right: Search + Lang + CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Search */}
        {searchOpen ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '6px 12px', width: '220px' }}>
            <Search size={14} color="rgba(255,255,255,0.4)" />
            <input
              ref={searchRef}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск в документации..."
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '0.84rem', fontFamily: 'inherit' }}
            />
            <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex' }}>
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '10px', padding: '6px 12px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.84rem' }}
          >
            <Search size={14} />
            <span>Поиск...</span>
            <span style={{ marginLeft: '8px', border: '1px solid rgba(255,255,255,0.15)', padding: '1px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>⌘K</span>
          </button>
        )}

        {/* Language Switcher */}
        <div ref={langRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setLangMenu(!langMenu)}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '10px', padding: '6px 10px', color: '#fff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
          >
            <Globe size={14} color="rgba(255,255,255,0.5)" />
            {LANG_LABELS[lang]}
            <ChevronDown size={12} color="rgba(255,255,255,0.4)" style={{ transform: langMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {langMenu && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              background: '#111116', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px', padding: '6px', boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
              minWidth: '140px', zIndex: 2000,
            }}>
              {[
                { k: 'hy', l: 'Հայերեն', flag: '🇦🇲' },
                { k: 'ru', l: 'Русский', flag: '🇷🇺' },
                { k: 'en', l: 'English', flag: '🇬🇧' },
              ].map(opt => (
                <button
                  key={opt.k}
                  onClick={() => changeLang(opt.k as any)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    width: '100%', padding: '9px 12px', borderRadius: '8px',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    fontSize: '0.88rem', fontWeight: 600,
                    background: lang === opt.k ? 'rgba(0,242,255,0.08)' : 'transparent',
                    color: lang === opt.k ? '#00F2FF' : 'rgba(255,255,255,0.75)',
                    transition: 'background 0.15s',
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>{opt.flag}</span>
                  {opt.l}
                  {lang === opt.k && <span style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: '#00F2FF', flexShrink: 0 }} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <Link
          href="/developer"
          style={{
            background: 'linear-gradient(135deg,#00f2ff,#0099cc)',
            color: '#000',
            padding: '8px 18px',
            borderRadius: '10px',
            fontWeight: 800,
            fontSize: '0.84rem',
            display: 'flex', alignItems: 'center', gap: '6px',
            transition: 'opacity 0.15s, transform 0.15s',
          }}
          onMouseOver={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
          onMouseOut={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
        >
          <Code size={14} />
          Get API Key
        </Link>
      </div>
    </nav>
  );
}
