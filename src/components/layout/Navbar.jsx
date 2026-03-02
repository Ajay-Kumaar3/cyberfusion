import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Clock, Cpu } from "lucide-react";

export default function Navbar() {
  const [time, setTime] = useState(new Date());
  const location = useLocation();

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      height: 80,
      background: 'transparent',
      borderBottom: '1px solid var(--border-color)',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
          <Clock size={16} color="var(--accent)" />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-main)', fontWeight: 600, fontSize: 14 }}>
            {time.toLocaleTimeString()}
          </span>
        </div>

        <button style={{
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'var(--text-main)',
          padding: '8px 16px',
          borderRadius: 8,
          fontSize: 11,
          fontFamily: "'JetBrains Mono', monospace",
          cursor: 'pointer'
        }} className="hover-lift">
          ALL PROTOCOLS
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 12 }}>
            AK
          </div>
        </div>
      </div>
    </div>
  );
}
