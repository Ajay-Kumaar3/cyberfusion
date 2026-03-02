import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Activity, Share2, Users, DollarSign, ShieldAlert, FileText, Shield } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", path: "/", icon: <Activity size={18} /> },
    { label: "Kill Chain Graph", path: "/killchain", icon: <Share2 size={18} />, highlight: true },
    { label: "Mule Accounts", path: "/accounts", icon: <Users size={18} /> },
    { label: "Transactions", path: "/transactions", icon: <DollarSign size={18} /> },
    { label: "Cyber Risk SOC", path: "/cyber-risk", icon: <ShieldAlert size={18} /> },
    { label: "AI Reports", path: "/reports", icon: <FileText size={18} /> }
  ];

  return (
    <div style={{
      width: 250,
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(30px)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0',
      flexShrink: 0,
      zIndex: 10
    }}>
      <div style={{ padding: '0 24px', marginBottom: 40, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ border: '1px solid var(--accent)', padding: '6px', borderRadius: 8, color: 'var(--accent)', background: 'var(--accent-dim)' }}>
          <Shield size={22} />
        </div>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontStyle: 'italic', fontSize: 18, fontWeight: 800, margin: 0, color: '#fff', letterSpacing: '0.05em' }}>AGENTCHAIN</h1>
          <div style={{ fontSize: 9, color: 'var(--accent)', fontFamily: "'JetBrains Mono', monospace", display: 'flex', alignItems: 'center', gap: 4, letterSpacing: '0.1em' }}>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)' }}></span> CYBERFUSION EVM
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, padding: '0 12px' }}>
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                background: isActive ? 'var(--accent-dim)' : 'transparent',
                border: isActive ? '1px solid var(--accent)' : '1px solid transparent',
                borderRadius: '8px',
                textDecoration: 'none',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.05em',
                transition: 'all 0.2s',
                position: 'relative'
              }}
            >
              {item.highlight && !isActive && <span style={{ position: 'absolute', right: 12, background: 'var(--special)', color: '#fff', fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 'bold' }}>CORE</span>}
              <span style={{ opacity: isActive ? 1 : 0.6 }}>{item.icon}</span>
              {item.label}
              {isActive && <div style={{ position: 'absolute', right: 12, width: 4, height: 12, borderRadius: 2, background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }}></div>}
            </NavLink>
          );
        })}
      </div>

      <div style={{ padding: '0 24px', paddingTop: 24 }}>
        <button style={{
          width: '100%', padding: '12px', background: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: 8, fontWeight: 'bold', fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s'
        }} className="hover-lift">
          <Shield size={14} /> CONNECT ALPHA
        </button>
      </div>
    </div>
  );
}
