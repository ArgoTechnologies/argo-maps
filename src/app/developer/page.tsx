'use client';

import { useState } from 'react';
import { 
  Plus, 
  Key, 
  BarChart3, 
  Database, 
  Settings, 
  Terminal, 
  Layers, 
  Globe, 
  Activity,
  Copy,
  Check,
  ChevronRight,
  Zap,
  Shield,
  LifeBuoy
} from 'lucide-react';
import Link from 'next/link';

export default function DeveloperPortal() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [keys, setKeys] = useState([
    { id: 1, name: 'Production App', key: 'argo_live_882x_pk_99', created: '12 days ago', status: 'Active' },
    { id: 2, name: 'Development Bot', key: 'argo_test_412x_sk_21', created: '2 hrs ago', status: 'Active' },
  ]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA', color: '#1A1D1F', display: 'flex' }}>
      
      {/* Sidebar */}
      <aside style={{ 
        width: '280px', 
        background: 'white', 
        borderRight: '1px solid #E6E8EC',
        padding: '32px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px',
        position: 'sticky',
        top: 0,
        height: '100vh'
      }}>
        <Link href="/" style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-0.02em', textDecoration: 'none', color: 'black', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'linear-gradient(135deg, #00f2ff, #8147ff)', width: '32px', height: '32px', borderRadius: '8px' }} />
          ARGO <span style={{ color: '#8147ff', fontSize: '12px', fontWeight: 700, background: 'rgba(129, 71, 255, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>DEV</span>
        </Link>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { label: 'Overview', icon: BarChart3, active: true },
            { label: 'API Keys', icon: Key },
            { label: 'Documentation', icon: Terminal },
            { label: 'Datasets', icon: Database },
            { label: 'Infrastructure', icon: Globe },
            { label: 'Settings', icon: Settings },
          ].map(item => (
            <button key={item.label} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              background: item.active ? 'rgba(129, 71, 255, 0.05)' : 'transparent',
              color: item.active ? '#8147ff' : '#6F767E',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: '0.2s',
              textAlign: 'left'
            }}>
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', background: '#F4F4F4', padding: '20px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ background: '#8147ff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>A</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Argo Team</div>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>Pro Plan</div>
            </div>
          </div>
          <button style={{ width: '100%', background: 'white', border: '1px solid #ddd', padding: '8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>Upgrade</button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '48px 64px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.03em' }}>Welcome back, Admin</h1>
            <p style={{ color: '#6F767E', fontWeight: 500 }}>Monitor your map infrastructure and API performance across Armenia.</p>
          </div>
          <button style={{ 
            background: '#1A1D1F', 
            color: 'white', 
            padding: '12px 24px', 
            borderRadius: '12px', 
            fontWeight: 700, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            border: 'none',
            cursor: 'pointer'
          }}>
            <Plus size={20} /> New API Key
          </button>
        </header>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '48px' }}>
          {[
            { label: 'Total Requests', value: '1.2M', trend: '+12%', icon: Activity, color: '#22C55E' },
            { label: 'Avg Latency', value: '24ms', trend: '-4ms', icon: Zap, color: '#f59e0b' },
            { label: 'Active Users', value: '45.2k', trend: '+860', icon:Globe, color: '#00f2ff' },
            { label: 'Error Rate', value: '0.02%', trend: '-0.01%', icon: Shield, color: '#ef4444' },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #E6E8EC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(0,0,0,0.03)', padding: '10px', borderRadius: '12px' }}>
                  <stat.icon size={20} color={stat.color} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: stat.trend.startsWith('+') ? '#22C55E' : '#ef4444' }}>{stat.trend}</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '4px' }}>{stat.value}</div>
              <div style={{ fontSize: '0.85rem', color: '#6F767E', fontWeight: 600 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* API Keys Table */}
        <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #E6E8EC', marginBottom: '48px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '24px' }}>Active API Keys</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #E6E8EC' }}>
                <th style={{ padding: '16px', color: '#6F767E', fontSize: '0.85rem' }}>NAME</th>
                <th style={{ padding: '16px', color: '#6F767E', fontSize: '0.85rem' }}>API KEY</th>
                <th style={{ padding: '16px', color: '#6F767E', fontSize: '0.85rem' }}>CREATED</th>
                <th style={{ padding: '16px', color: '#6F767E', fontSize: '0.85rem' }}>STATUS</th>
                <th style={{ padding: '16px', color: '#6F767E', fontSize: '0.85rem' }}></th>
              </tr>
            </thead>
            <tbody>
              {keys.map(k => (
                <tr key={k.id} style={{ borderBottom: '1px solid #F4F4F4' }}>
                  <td style={{ padding: '20px 16px', fontWeight: 700 }}>{k.name}</td>
                  <td style={{ padding: '20px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F8F9FA', padding: '6px 12px', borderRadius: '8px', width: 'fit-content' }}>
                      <code style={{ fontSize: '0.9rem', color: '#333' }}>{k.key}</code>
                      <button onClick={() => copyToClipboard(k.key)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        {copiedKey === k.key ? <Check size={14} color="#22C55E" /> : <Copy size={14} color="#888" />}
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '20px 16px', color: '#6F767E', fontSize: '0.9rem' }}>{k.created}</td>
                  <td style={{ padding: '20px 16px' }}>
                    <span style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22C55E', padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 800 }}>{k.status}</span>
                  </td>
                  <td style={{ padding: '20px 16px', textAlign: 'right' }}>
                    <button style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><Settings size={18} color="#6F767E" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick Help & Docs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
           <div style={{ background: '#1A1D1F', color: 'white', padding: '32px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Terminal size={20} color="#00f2ff" />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px' }}>API Documentation</h4>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', lineHeight: 1.6 }}>Integrate vector tiles, geocoding and routing APIs with our comprehensive SDKs.</p>
              </div>
              <button style={{ marginTop: 'auto', background: 'white', color: 'black', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                View Docs <ChevronRight size={16} />
              </button>
           </div>
           
           <div style={{ background: '#8147ff', color: 'white', padding: '32px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={20} color="white" />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px' }}>Custom Styles</h4>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', lineHeight: 1.6 }}>Create your own map theme using the Argo Studio. No code required.</p>
              </div>
              <button style={{ marginTop: 'auto', background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                Open Studio <ChevronRight size={16} />
              </button>
           </div>

           <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #E6E8EC', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: 'rgba(0,0,0,0.05)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LifeBuoy size={20} color="#6F767E" />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px' }}>Direct Support</h4>
                <p style={{ color: '#6F767E', fontSize: '0.85rem', lineHeight: 1.6 }}>Need help with implementation? Our engineers are ready to help via Slack or Email.</p>
              </div>
              <button style={{ marginTop: 'auto', background: '#F4F4F4', color: '#1A1D1F', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 800 }}>Contact Us</button>
           </div>
        </div>

      </main>
    </div>
  );
}
