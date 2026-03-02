import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Clock, Cpu, ChevronDown } from "lucide-react";

export default function Navbar() {
  const [time, setTime] = useState(new Date());
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      height: 80,
      background: 'transparent',
      borderBottom: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 5
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: 'var(--accent)', fontFamily: "'JetBrains Mono', monospace", fontWeight: 'bold', letterSpacing: '0.1em' }}>
          <Cpu size={14} /> FREE NODE ACTIVE <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse-glow 2s infinite' }}></span>
        </div>
        <h2 style={{ margin: 0, fontSize: 32, color: 'var(--text-main)', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, textTransform: 'uppercase' }}>
          {location.pathname === '/' ? 'THREAT DASHBOARD' :
            location.pathname === '/killchain' ? <>VERIFIED AI <span style={{ color: 'var(--accent)' }}>MODELS</span></> :
              location.pathname === '/accounts' ? 'Mule Account Intelligence' :
                location.pathname === '/transactions' ? 'Transaction Flow Analyzer' :
                  location.pathname === '/cyber-risk' ? 'SOC Integration Feed' : 'Reports'}
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 20, border: '1px solid rgba(0, 255, 65, 0.15)', background: 'rgba(255,255,255,0.02)' }}>
          <Clock size={16} color="var(--accent)" />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-main)', fontWeight: 600, fontSize: 14 }}>
            {time.toLocaleTimeString()}
          </span>
        </div>

        <button style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'var(--text-main)',
          padding: '8px 16px',
          borderRadius: 8,
          fontSize: 10,
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 600,
          letterSpacing: '0.05em',
          cursor: 'pointer'
        }} className="hover-lift">
          ACTIVE PROTOCOLS
        </button>

        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setProfileOpen(!profileOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
              padding: '6px 12px 6px 6px',
              background: 'rgba(0, 255, 65, 0.05)',
              borderRadius: 30,
              border: '1px solid rgba(0, 255, 65, 0.2)',
              transition: 'all 0.2s'
            }}
            className="hover-lift"
          >
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(0, 255, 65, 0.1)',
              color: 'var(--accent)',
              border: '1px solid rgba(0, 255, 65, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: 12,
              fontFamily: "'Inter', sans-serif"
            }}>
              V
            </div>
            <span style={{ color: 'var(--text-main)', fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif", letterSpacing: '0.05em' }}>VEDANTH</span>
            <ChevronDown size={14} color="var(--accent)" style={{ transform: profileOpen ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
          </div>

          {profileOpen && (
            <div style={{
              position: 'absolute',
              top: '120%',
              right: 0,
              width: 200,
              background: 'rgba(5, 8, 5, 0.95)',
              border: '1px solid rgba(0, 255, 65, 0.2)',
              borderRadius: 8,
              padding: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(10px)',
              zIndex: 100
            }}>
              <div style={{ padding: '8px 12px', color: 'var(--text-main)', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: 4, fontFamily: "'Inter', sans-serif" }}>
                <div style={{ fontWeight: 'bold' }}>Vedanth</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Security Admin</div>
              </div>
              <div
                style={{ color: 'var(--text-main)', padding: '8px 12px', fontSize: 12, cursor: 'pointer', borderRadius: 4, transition: '0.2s', fontFamily: "'Inter', sans-serif" }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(0,255,65,0.1)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                Profile Settings
              </div>
              <div
                style={{ color: '#ff4444', padding: '8px 12px', fontSize: 12, cursor: 'pointer', borderRadius: 4, transition: '0.2s', fontFamily: "'Inter', sans-serif" }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,68,68,0.1)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
