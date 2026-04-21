'use client';

import { useState, useEffect } from 'react';
import {
  Plus, Key, BarChart3, Database, Settings, Terminal,
  Layers, Globe, Activity, Copy, Check, ChevronRight,
  Zap, Shield, LifeBuoy, Server, Cpu, HardDrive, X,
  Lock, Mail, User, EyeOff, Eye, LogIn, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

type ServiceStatus = { name: string; url: string; lang: string; port: number; status: 'checking' | 'online' | 'offline'; latency: number };
type ApiKey = { id: number; name: string; key: string; created: string; status: string };

const D = {
  bg: '#07070B',
  card: '#0F1014',
  border: 'rgba(255,255,255,0.07)',
  muted: 'rgba(255,255,255,0.4)',
};

/* ─── Translations ─── */
type Lang = 'hy' | 'ru' | 'en';
const T: Record<Lang, Record<string, string>> = {
  hy: {
    welcome_title: 'Բարի գալուստ',
    welcome_sub: 'Մուտք գործեք API բանալիները կառավարելու համար',
    create_title: 'Ստեղծել հաշիվ',
    create_sub: 'Սկսեք կառուցել Argo Maps API-ով',
    your_name: 'Ձեր Անունը',
    email: 'Էլ. փոստ',
    password: 'Գաղտնաբառ',
    login_btn: 'Մուտք',
    register_btn: 'Ստեղծել հաշիվ',
    no_account: 'Հաշիվ չունե՞ք։',
    has_account: 'Արդեն հաշիվ ունե՞ք։',
    register_link: 'Գրանցվել',
    login_link: 'Մուտք',
    fill_all: 'Լրացրեք բոլոր դաշտերը',
    enter_name: 'Մուտքագրեք ձեր անունը',
    not_found: 'Հաշիվ չի գտնվել։ Գրանցվեք։',
    wrong_pass: 'Սխալ էլ. փոստ կամ գաղտնաբառ',
    greeting: 'Բարև',
    monitor_sub: 'Ենթակառուցվածքի մոնիտորինգ',
    new_key: 'Նոր API բանալի',
    total_req: 'Ընդհանուր հարցումներ',
    avg_lat: 'Միջ. ուշացում',
    active_users: 'Ակտիվ օգտ.',
    errors: 'Սխալներ',
    infra_status: 'Ենթակառուցվածքի Կարգավիճակ',
    auto_refresh: 'Ավտո-թարմ.: 10վ',
    api_keys: 'API Բանալիներ',
    create: 'Ստեղծել',
    name_col: 'Անուն',
    api_key_col: 'API Բանալի',
    created_col: 'Ստեղծված',
    status_col: 'Կարգ.',
    docs_title: 'Փաստաթղթեր',
    docs_sub: 'Ինտեգրե՛ք տայլներ, geocoding SDK-ներով',
    docs_btn: 'Տեսնել API',
    style_title: 'Կաստոմ Ոճ',
    style_sub: 'Ստեղծեք ձեր քարտեզի թեմը Argo Studio-ում',
    style_btn: 'Բացել Studio',
    support_title: 'Աջակցություն',
    support_sub: 'Աջակցություն՞ Մեր ինժenerները պատրաստ են',
    support_btn: 'Գրե՛ք մեզ',
    logout: 'Ելք',
    free_plan: 'Անվճար',
    overview: 'Ակնարկ',
    api_keys_nav: 'API Բանալիներ',
    docs_nav: 'Փաստաթղթեր',
    datasets: 'Տվյալների հավ.',
    infra: 'Ենթակառ.',
    settings_nav: 'Կարգ.',
    create_key_title: 'Ստեղծել API բանալի',
    key_name_label: 'Բանալու Անուն',
    key_name_ph: 'Իմ Հավ., My App...',
    cancel: 'Չեղ.',
    generate: 'Ստեղծել',
    key_created: '✓ Բանալին ստեղծված է — անմիջապես պահե՛ք!',
    key_warning: 'Այս պատուհանը փակելուց հետո բանալին ամբողջությամբ չի ցուցադրվի։',
    done: 'Պատրաստ',
    online: '● Ուղիղ',
    offline: '● Անջատ',
    checking: '◌ ...',
    just_now: 'Հենց հիմա',
    active: 'Ակտիվ',
  },
  ru: {
    welcome_title: 'Добро пожаловать',
    welcome_sub: 'Войдите, чтобы управлять API ключами',
    create_title: 'Создать аккаунт',
    create_sub: 'Начните строить с Argo Maps API',
    your_name: 'Ваше Имя',
    email: 'Email',
    password: 'Пароль',
    login_btn: 'Войти',
    register_btn: 'Создать аккаунт',
    no_account: 'Нет аккаунта?',
    has_account: 'Уже есть аккаунт?',
    register_link: 'Зарегистрироваться',
    login_link: 'Войти',
    fill_all: 'Пожалуйста, заполните все поля',
    enter_name: 'Введите ваше имя',
    not_found: 'Аккаунт не найден. Зарегистрируйтесь.',
    wrong_pass: 'Неверный email или пароль',
    greeting: 'Привет',
    monitor_sub: 'Мониторинг инфраструктуры и API производительность.',
    new_key: 'Новый API ключ',
    total_req: 'Всего запросов',
    avg_lat: 'Средняя задержка',
    active_users: 'Активные польз.',
    errors: 'Ошибки',
    infra_status: 'Статус инфраструктуры',
    auto_refresh: 'Авто-обновление: 10с',
    api_keys: 'API Ключи',
    create: 'Создать',
    name_col: 'Название',
    api_key_col: 'API Ключ',
    created_col: 'Создан',
    status_col: 'Статус',
    docs_title: 'Документация',
    docs_sub: 'Интегрируйте тайлы, геокодинг и поиск с нашими SDK.',
    docs_btn: 'Смотреть API',
    style_title: 'Кастомный стиль',
    style_sub: 'Создайте свою тему карты в Argo Studio. Без кода.',
    style_btn: 'Открыть Studio',
    support_title: 'Поддержка',
    support_sub: 'Нужна помощь? Наши инженеры готовы ответить.',
    support_btn: 'Написать нам',
    logout: 'Выйти',
    free_plan: 'Free Plan',
    overview: 'Обзор',
    api_keys_nav: 'API Ключи',
    docs_nav: 'Документация',
    datasets: 'Датасеты',
    infra: 'Инфраструктура',
    settings_nav: 'Настройки',
    create_key_title: 'Создать API ключ',
    key_name_label: 'Название ключа',
    key_name_ph: 'Мой проект, My App...',
    cancel: 'Отмена',
    generate: 'Сгенерировать',
    key_created: '✓ Ключ создан — сохраните сразу!',
    key_warning: 'После закрытия этого окна ключ больше не будет показан полностью.',
    done: 'Готово',
    online: '● Online',
    offline: '● Offline',
    checking: '◌ ...',
    just_now: 'Только что',
    active: 'Active',
  },
  en: {
    welcome_title: 'Welcome back',
    welcome_sub: 'Sign in to manage your API keys',
    create_title: 'Create account',
    create_sub: 'Start building with Argo Maps API',
    your_name: 'Your Name',
    email: 'Email',
    password: 'Password',
    login_btn: 'Sign In',
    register_btn: 'Create Account',
    no_account: "Don't have an account?",
    has_account: 'Already have an account?',
    register_link: 'Sign Up',
    login_link: 'Sign In',
    fill_all: 'Please fill in all fields',
    enter_name: 'Enter your name',
    not_found: 'Account not found. Please register.',
    wrong_pass: 'Invalid email or password',
    greeting: 'Hey',
    monitor_sub: 'Monitor your map infrastructure and API performance.',
    new_key: 'New API Key',
    total_req: 'Total Requests',
    avg_lat: 'Avg Latency',
    active_users: 'Active Users',
    errors: 'Error Rate',
    infra_status: 'Infrastructure Status',
    auto_refresh: 'Auto-refresh: 10s',
    api_keys: 'API Keys',
    create: 'Create',
    name_col: 'Name',
    api_key_col: 'API Key',
    created_col: 'Created',
    status_col: 'Status',
    docs_title: 'Documentation',
    docs_sub: 'Integrate vector tiles, geocoding and search with our SDKs.',
    docs_btn: 'View API Docs',
    style_title: 'Custom Styles',
    style_sub: 'Create your own map theme using Argo Studio. No code.',
    style_btn: 'Open Studio',
    support_title: 'Support',
    support_sub: 'Need help? Our engineers are ready to assist.',
    support_btn: 'Contact Us',
    logout: 'Sign Out',
    free_plan: 'Free Plan',
    overview: 'Overview',
    api_keys_nav: 'API Keys',
    docs_nav: 'Documentation',
    datasets: 'Datasets',
    infra: 'Infrastructure',
    settings_nav: 'Settings',
    create_key_title: 'Create API Key',
    key_name_label: 'Key Name',
    key_name_ph: 'My Project, Production App...',
    cancel: 'Cancel',
    generate: 'Generate Key',
    key_created: '✓ Key created — save it now!',
    key_warning: 'After closing this dialog the key will no longer be shown in full.',
    done: 'Done',
    online: '● Online',
    offline: '● Offline',
    checking: '◌ ...',
    just_now: 'Just now',
    active: 'Active',
  },
};

/* ─── Auth Wall ─── */
function AuthScreen({ onEnter, t }: { onEnter: (name: string) => void; t: Record<string, string> }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError(t.fill_all); return; }
    if (mode === 'register' && !name) { setError(t.enter_name); return; }
    setLoading(true);
    setTimeout(() => {
      const stored = localStorage.getItem('argo-dev-user');
      if (mode === 'register') {
        localStorage.setItem('argo-dev-user', JSON.stringify({ name, email, password }));
        onEnter(name);
      } else {
        if (!stored) { setError(t.not_found); setLoading(false); return; }
        const user = JSON.parse(stored);
        if (user.email !== email || user.password !== password) { setError(t.wrong_pass); setLoading(false); return; }
        onEnter(user.name);
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div style={{ minHeight: '100vh', background: D.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
            <div style={{ background: 'linear-gradient(135deg,#00f2ff,#8147ff)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Key size={18} color="#000" />
            </div>
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
              Argo <span style={{ color: '#00F2FF' }}>Dev</span>
            </span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
            {mode === 'login' ? t.welcome_title : t.create_title}
          </h1>
          <p style={{ color: D.muted, fontSize: '0.9rem' }}>
            {mode === 'login' ? t.welcome_sub : t.create_sub}
          </p>
        </div>

        <form onSubmit={submit} style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: '20px', padding: '2rem', boxShadow: '0 32px 64px rgba(0,0,0,0.5)' }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '10px 14px', fontSize: '0.84rem', color: '#F87171', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <X size={14} /> {error}
            </div>
          )}

          {mode === 'register' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: D.muted, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.your_name}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${D.border}`, borderRadius: '10px', padding: '11px 14px' }}>
                <User size={16} color={D.muted} />
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Ara Petrosyan" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '0.9rem', fontFamily: 'inherit' }} />
              </div>
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: D.muted, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.email}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${D.border}`, borderRadius: '10px', padding: '11px 14px' }}>
              <Mail size={16} color={D.muted} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ara@example.am" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '0.9rem', fontFamily: 'inherit' }} />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: D.muted, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.password}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${D.border}`, borderRadius: '10px', padding: '11px 14px' }}>
              <Lock size={16} color={D.muted} />
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '0.9rem', fontFamily: 'inherit' }} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: D.muted, display: 'flex' }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', background: 'linear-gradient(135deg,#00f2ff,#0099cc)', color: '#000', padding: '13px', borderRadius: '12px', fontWeight: 800, fontSize: '0.95rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}>
            {loading ? '...' : mode === 'login' ? <><LogIn size={16} />{t.login_btn}</> : <><ArrowRight size={16} />{t.register_btn}</>}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: D.muted }}>
            {mode === 'login' ? (
              <>{t.no_account}{' '}<button type="button" onClick={() => { setMode('register'); setError(''); }} style={{ background: 'none', border: 'none', color: '#00F2FF', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' }}>{t.register_link}</button></>
            ) : (
              <>{t.has_account}{' '}<button type="button" onClick={() => { setMode('login'); setError(''); }} style={{ background: 'none', border: 'none', color: '#00F2FF', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' }}>{t.login_link}</button></>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── New Key Modal ─── */
function NewKeyModal({ onClose, onCreate, t }: { onClose: () => void; onCreate: (k: ApiKey) => void; t: Record<string, string> }) {
  const [keyName, setKeyName] = useState('');
  const [created, setCreated] = useState<ApiKey | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = () => {
    if (!keyName.trim()) return;
    const key: ApiKey = {
      id: Date.now(),
      name: keyName,
      key: `argo_live_${Math.random().toString(36).slice(2, 8)}_pk_${Math.floor(Math.random() * 90 + 10)}`,
      created: t.just_now,
      status: t.active,
    };
    setCreated(key);
    onCreate(key);
  };

  const copy = () => {
    if (created) { navigator.clipboard.writeText(created.key); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
      <div style={{ background: '#0F1014', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '480px', boxShadow: '0 40px 80px rgba(0,0,0,0.7)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.15rem', color: '#fff' }}>{t.create_key_title}</h3>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: D.muted, display: 'flex' }}><X size={16} /></button>
        </div>

        {!created ? (
          <>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: D.muted, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.key_name_label}</label>
            <input
              value={keyName} onChange={e => setKeyName(e.target.value)}
              placeholder={t.key_name_ph}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: `1px solid ${D.border}`, borderRadius: '10px', padding: '12px 14px', color: '#fff', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', marginBottom: '1.5rem' }}
              onKeyDown={e => e.key === 'Enter' && generate()}
            />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={onClose} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: `1px solid ${D.border}`, borderRadius: '10px', padding: '12px', color: D.muted, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{t.cancel}</button>
              <button onClick={generate} disabled={!keyName.trim()} style={{ flex: 2, background: 'linear-gradient(135deg,#00f2ff,#0099cc)', color: '#000', borderRadius: '10px', padding: '12px', fontWeight: 800, border: 'none', cursor: keyName.trim() ? 'pointer' : 'not-allowed', opacity: keyName.trim() ? 1 : 0.5, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Key size={14} />{t.generate}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22C55E', marginBottom: '8px' }}>{t.key_created}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <code style={{ flex: 1, fontSize: '0.85rem', color: '#fff', wordBreak: 'break-all', background: 'none', padding: 0 }}>{created.key}</code>
                <button onClick={copy} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#fff', display: 'flex', flexShrink: 0 }}>
                  {copied ? <Check size={15} color="#22C55E" /> : <Copy size={15} />}
                </button>
              </div>
            </div>
            <p style={{ fontSize: '0.82rem', color: D.muted, marginBottom: '1.5rem' }}>{t.key_warning}</p>
            <button onClick={onClose} style={{ width: '100%', background: 'linear-gradient(135deg,#00f2ff,#0099cc)', color: '#000', borderRadius: '10px', padding: '12px', fontWeight: 800, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>{t.done}</button>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Main Dashboard ─── */
export default function DeveloperPortal() {
  const [lang, setLang] = useState<Lang>('hy');
  const [userName, setUserName] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  // Start with an empty keys list — user creates their own
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [showNewKey, setShowNewKey] = useState(false);

  // Load keys from localStorage on mount
  useEffect(() => {
    const savedKeys = localStorage.getItem('argo-api-keys');
    if (savedKeys) {
      try {
        setKeys(JSON.parse(savedKeys));
      } catch (e) {
        console.error("Failed to parse keys", e);
      }
    }
  }, []);

  // Save keys to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('argo-api-keys', JSON.stringify(keys));
  }, [keys]);

  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Search API', url: 'https://argo-maps.pages.dev/api/health', lang: 'Go', port: 443, status: 'checking', latency: 0 },
    { name: 'Spatial Engine', url: 'https://argo-maps.pages.dev/api/spatial/health', lang: 'Rust', port: 443, status: 'checking', latency: 0 },
    { name: 'Tile Server', url: 'https://tiles.openfreemap.org/planet', lang: 'Rust (Martin)', port: 443, status: 'checking', latency: 0 },
  ]);

  // Load language from localStorage (synced with Navbar)
  useEffect(() => {
    const saved = localStorage.getItem('argo-lang') as Lang;
    if (saved && ['hy', 'ru', 'en'].includes(saved)) setLang(saved);
    // Also listen for changes from Navbar
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as Lang;
      if (['hy', 'ru', 'en'].includes(detail)) setLang(detail);
    };
    window.addEventListener('argo-lang-change', handler);
    return () => window.removeEventListener('argo-lang-change', handler);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('argo-dev-session');
    if (stored) setUserName(stored);
  }, []);

  useEffect(() => {
    const checkServices = async () => {
      const updated = await Promise.all(services.map(async (svc) => {
        const start = performance.now();
        try {
          await fetch(svc.url, { mode: 'no-cors', signal: AbortSignal.timeout(3000) });
          return { ...svc, status: 'online' as const, latency: Math.round(performance.now() - start) };
        } catch {
          return { ...svc, status: 'offline' as const, latency: 0 };
        }
      }));
      setServices(updated);
    };
    checkServices();
    const interval = setInterval(checkServices, 10000);
    return () => clearInterval(interval);
  }, []);

  const t = T[lang];

  const handleEnter = (name: string) => {
    localStorage.setItem('argo-dev-session', name);
    setUserName(name);
  };

  const logout = () => {
    localStorage.removeItem('argo-dev-session');
    setUserName(null);
  };

  const copyKey = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const addKey = (k: ApiKey) => setKeys(prev => [...prev, k]);

  const langColor: Record<string, string> = { 'Go': '#00ADD8', 'Rust': '#FF4F00', 'Rust (Martin)': '#FF6E40' };

  const [activeTab, setActiveTab] = useState('overview');

  if (!userName) return <AuthScreen onEnter={handleEnter} t={t} />;

  const navItems = [
    { id: 'overview', label: t.overview, icon: BarChart3 },
    { id: 'api-keys', label: t.api_keys_nav, icon: Key },
    { id: 'infra', label: t.infra, icon: Server },
  ];

  const stats = [
    { label: t.total_req, value: '1.2M', trend: '+12%', icon: Activity, color: '#22C55E' },
    { label: t.avg_lat, value: '24ms', trend: '-4ms', icon: Zap, color: '#F59E0B' },
    { label: t.active_users, value: '45.2k', trend: '+860', icon: Globe, color: '#00F2FF' },
    { label: t.errors, value: '0.02%', trend: '-0.01%', icon: Shield, color: '#EF4444' },
  ];

  return (
    <div style={{ height: 'calc(100vh - 64px)', marginTop: '64px', background: D.bg, color: '#fff', display: 'flex', overflow: 'hidden' }}>
      {showNewKey && <NewKeyModal onClose={() => setShowNewKey(false)} onCreate={addKey} t={t} />}

      {/* Sidebar */}
      <aside style={{ width: '240px', background: D.card, borderRight: `1px solid ${D.border}`, padding: '28px 16px', display: 'flex', flexDirection: 'column', gap: '28px', height: '100%', overflowY: 'auto', flexShrink: 0 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg,#00f2ff,#8147ff)', width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0 }} />
          <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.02em' }}>
            Argo <span style={{ color: '#00F2FF' }}>Technologies</span>
          </span>
        </Link>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', border: 'none', background: activeTab === item.id ? 'rgba(0,242,255,0.08)' : 'transparent', color: activeTab === item.id ? '#00F2FF' : D.muted, fontWeight: 700, fontSize: '0.86rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', fontFamily: 'inherit' }}>
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '12px', border: `1px solid ${D.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ background: 'linear-gradient(135deg,#00f2ff,#8147ff)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 900, fontSize: '0.9rem', flexShrink: 0 }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: '0.84rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
              <div style={{ fontSize: '0.7rem', color: D.muted }}>{t.free_plan}</div>
            </div>
          </div>
          <button onClick={logout} style={{ width: '100%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '8px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, color: '#F87171', cursor: 'pointer', fontFamily: 'inherit' }}>{t.logout}</button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto', minWidth: 0, position: 'relative' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '0 0 36px 0', position: 'sticky', top: 0, zIndex: 10, background: D.bg, paddingBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 900, marginBottom: '6px', letterSpacing: '-0.03em' }}>{t.greeting}, {userName} 👋</h1>
            <p style={{ color: D.muted, fontWeight: 500, fontSize: '0.88rem' }}>{t.monitor_sub}</p>
          </div>
          <button onClick={() => setShowNewKey(true)} style={{ background: 'linear-gradient(135deg,#00f2ff,#0099cc)', color: '#000', padding: '11px 20px', borderRadius: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer', fontSize: '0.86rem', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            <Plus size={16} /> {t.new_key}
          </button>
        </header>

        {/* Content based on activeTab */}
        
        {activeTab === 'overview' && (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '28px' }}>
              {stats.map(stat => (
                <div key={stat.label} style={{ background: D.card, padding: '18px', borderRadius: '14px', border: `1px solid ${D.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ background: `${stat.color}15`, padding: '8px', borderRadius: '9px' }}><stat.icon size={16} color={stat.color} /></div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: stat.trend.startsWith('+') ? '#22C55E' : '#EF4444', background: stat.trend.startsWith('+') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', padding: '3px 8px', borderRadius: '100px' }}>{stat.trend}</span>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '3px' }}>{stat.value}</div>
                  <div style={{ fontSize: '0.75rem', color: D.muted, fontWeight: 600 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Bottom cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              <div style={{ background: 'linear-gradient(135deg,rgba(0,242,255,0.07),rgba(129,71,255,0.07))', border: `1px solid ${D.border}`, padding: '22px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <Terminal size={18} color="#00F2FF" />
                <div><h4 style={{ fontWeight: 800, marginBottom: '5px', fontSize: '0.95rem' }}>{t.docs_title}</h4><p style={{ color: D.muted, fontSize: '0.8rem', lineHeight: 1.6 }}>{t.docs_sub}</p></div>
                <Link href="/api-reference" style={{ marginTop: 'auto', background: 'rgba(0,242,255,0.1)', color: '#00F2FF', border: '1px solid rgba(0,242,255,0.2)', padding: '9px', borderRadius: '9px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '0.8rem' }}>
                  {t.docs_btn} <ChevronRight size={13} />
                </Link>
              </div>
              <div style={{ background: 'rgba(163,116,255,0.07)', border: `1px solid rgba(163,116,255,0.14)`, padding: '22px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <Layers size={18} color="#A374FF" />
                <div><h4 style={{ fontWeight: 800, marginBottom: '5px', fontSize: '0.95rem' }}>{t.style_title}</h4><p style={{ color: D.muted, fontSize: '0.8rem', lineHeight: 1.6 }}>{t.style_sub}</p></div>
                <button style={{ marginTop: 'auto', background: 'rgba(163,116,255,0.12)', color: '#A374FF', border: '1px solid rgba(163,116,255,0.22)', padding: '9px', borderRadius: '9px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {t.style_btn} <ChevronRight size={13} />
                </button>
              </div>
              <div style={{ background: D.card, border: `1px solid ${D.border}`, padding: '22px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <LifeBuoy size={18} color="#F59E0B" />
                <div><h4 style={{ fontWeight: 800, marginBottom: '5px', fontSize: '0.95rem' }}>{t.support_title}</h4><p style={{ color: D.muted, fontSize: '0.8rem', lineHeight: 1.6 }}>{t.support_sub}</p></div>
                <button style={{ marginTop: 'auto', background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)', padding: '9px', borderRadius: '9px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>{t.support_btn}</button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'infra' && (
          <div style={{ background: D.card, padding: '24px', borderRadius: '18px', border: `1px solid ${D.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}><Server size={16} color="#00F2FF" /> {t.infra_status}</h3>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: D.muted }}>{t.auto_refresh}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {services.map(svc => (
                <div key={svc.name} style={{ padding: '14px', borderRadius: '12px', border: `1px solid ${D.border}`, display: 'flex', alignItems: 'center', gap: '12px', background: svc.status === 'online' ? 'rgba(34,197,94,0.04)' : svc.status === 'offline' ? 'rgba(239,68,68,0.04)' : 'transparent' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: `${langColor[svc.lang] || '#888'}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {svc.lang === 'Go' ? <Cpu size={16} color={langColor[svc.lang]} /> : <HardDrive size={16} color={langColor[svc.lang] || '#888'} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.84rem', marginBottom: '2px' }}>{svc.name}</div>
                    <div style={{ fontSize: '0.7rem', color: D.muted }}><span style={{ color: langColor[svc.lang], fontWeight: 800 }}>{svc.lang}</span>:{svc.port}{svc.latency > 0 ? ` · ${svc.latency}ms` : ''}</div>
                  </div>
                  <span style={{ padding: '3px 9px', borderRadius: '100px', fontSize: '0.68rem', fontWeight: 800, flexShrink: 0, background: svc.status === 'online' ? 'rgba(34,197,94,0.12)' : svc.status === 'offline' ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.06)', color: svc.status === 'online' ? '#22C55E' : svc.status === 'offline' ? '#F87171' : '#888' }}>
                    {svc.status === 'online' ? t.online : svc.status === 'offline' ? t.offline : t.checking}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'api-keys' && (
          <div style={{ background: D.card, borderRadius: '18px', border: `1px solid ${D.border}`, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${D.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}><Key size={16} color="#A374FF" /> {t.api_keys}</h3>
              <button onClick={() => setShowNewKey(true)} style={{ background: 'rgba(163,116,255,0.1)', border: '1px solid rgba(163,116,255,0.2)', color: '#A374FF', padding: '6px 14px', borderRadius: '8px', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}>
                <Plus size={13} /> {t.create}
              </button>
            </div>

            {keys.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <Key size={32} color={D.muted} style={{ margin: '0 auto 12px' }} />
                <div style={{ color: D.muted, fontSize: '0.88rem', marginBottom: '16px' }}>{t.api_keys} 0</div>
                <button onClick={() => setShowNewKey(true)} style={{ background: 'linear-gradient(135deg,#00f2ff,#0099cc)', color: '#000', padding: '10px 20px', borderRadius: '10px', fontWeight: 800, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={14} /> {t.new_key}
                </button>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${D.border}` }}>
                    {[t.name_col, t.api_key_col, t.created_col, t.status_col, ''].map(h => (
                      <th key={h} style={{ padding: '12px 20px', color: D.muted, fontSize: '0.72rem', fontWeight: 700, textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {keys.map((k, i) => (
                    <tr key={k.id} style={{ borderBottom: i < keys.length - 1 ? `1px solid ${D.border}` : 'none' }}>
                      <td style={{ padding: '16px 20px', fontWeight: 700, fontSize: '0.88rem' }}>{k.name}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: '8px', width: 'fit-content', maxWidth: '200px' }}>
                          <code style={{ fontSize: '0.8rem', color: '#A374FF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{k.key}</code>
                          <button onClick={() => copyKey(k.key)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', flexShrink: 0 }}>
                            {copiedKey === k.key ? <Check size={12} color="#22C55E" /> : <Copy size={12} color={D.muted} />}
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px', color: D.muted, fontSize: '0.82rem' }}>{k.created}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', padding: '3px 9px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 800 }}>{k.status}</span>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <button style={{ border: 'none', background: 'rgba(239,68,68,0.08)', borderRadius: '6px', padding: '5px 7px', cursor: 'pointer', color: '#F87171', display: 'flex', alignItems: 'center' }} onClick={() => setKeys(prev => prev.filter(x => x.id !== k.id))}>
                          <X size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
