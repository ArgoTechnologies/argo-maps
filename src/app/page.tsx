import Hero from "@/components/Hero";
import MapPreview from "@/components/MapPreview";

export default function Home() {
  return (
    <main>
      <Hero />
      
      {/* Short Overview Section */}
      <section style={{ padding: '8rem 2rem', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Argo Maps fills the gap.</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                Where Apple Maps and Google Maps fall short — Argo Maps fills the gap. 
                Built by Argo Technologies in Yerevan, we provide the most accurate 
                and beautiful map tiles optimized specifically for Armenia.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-cyan)' }} />
                  <span>Developer-first API and SDKs</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-cyan)' }} />
                  <span>Real-time transport intelligence</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-cyan)' }} />
                  <span>Free for Armenian start-ups</span>
                </div>
              </div>
            </div>
            
            <div style={{ height: '400px', width: '100%' }}>
              <MapPreview />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
