import Link from 'next/link';
import { ArrowRight, Zap, Globe, Layers } from 'lucide-react';

export default function Hero() {
  return (
    <section style={{
      position: 'relative',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      paddingTop: '64px'
    }}>
      {/* Background with Image and Gradient Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url("/hero.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.4,
        zIndex: -1
      }} />
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at center, transparent 0%, var(--bg-primary) 80%)',
        zIndex: -1
      }} />

      <div className="container animate-fade-in" style={{ textAlign: 'center', maxWidth: '800px', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0, 242, 255, 0.1)', color: 'var(--accent-cyan)', padding: '0.4rem 1rem', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '2rem', border: '1px solid rgba(0, 242, 255, 0.2)' }}>
          <Zap size={14} />
          <span>v1.0 is now live</span>
        </div>
        
        <h1 style={{ fontSize: '4.5rem', lineHeight: 1.1, marginBottom: '1.5rem', fontWeight: 700 }}>
          The Map Platform <br />
          <span style={{ background: 'linear-gradient(to right, var(--accent-cyan), var(--accent-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Built for Armenia</span>
        </h1>
        
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
          High-performance vector tiles, real-time transport data, and beautiful map styles. 
          The first native mapping solution optimized for the Armenian landscape.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/docs" className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
            Get Started <ArrowRight size={18} />
          </Link>
          <Link href="#" className="btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
            View Demo
          </Link>
        </div>

        <div style={{ marginTop: '5rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ color: 'var(--accent-cyan)', marginBottom: '1rem' }}><Globe size={24} /></div>
            <h3 style={{ marginBottom: '0.5rem' }}>Native Armenia</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Deepest OSM data integration for Yerevan and regions.</p>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ color: 'var(--accent-cyan)', marginBottom: '1rem' }}><Zap size={24} /></div>
            <h3 style={{ marginBottom: '0.5rem' }}>Vector Speed</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Powered by Rust-based Martin tile server for 60fps rendering.</p>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ color: 'var(--accent-cyan)', marginBottom: '1rem' }}><Layers size={24} /></div>
            <h3 style={{ marginBottom: '0.5rem' }}>Live Transit</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Real-time bus arrivals and optimized routing engine.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
