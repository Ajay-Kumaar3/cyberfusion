import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Activity, Share2, Users, DollarSign, ShieldAlert, FileText, Link as LinkIcon } from 'lucide-react';

const CyberShield = ({ size = 24, color = "currentColor", strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M 11 1 L 3 9 L 3 15 L 11 23 L 7 19 L 7 15 L 11 11 L 7 7 L 7 5 L 11 1 Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M 13 1 L 21 9 L 21 15 L 13 23 L 17 19 L 17 15 L 13 11 L 17 7 L 17 5 L 13 1 Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", path: "/", icon: <Activity size={18} /> },
    { label: "Kill Chain Graph", path: "/killchain", icon: <Share2 size={18} />, highlight: true },
    { label: "Mule Accounts", path: "/accounts", icon: <Users size={18} /> },
    { label: "Transactions", path: "/transactions", icon: <DollarSign size={18} /> },
    { label: "Payment Demo", path: "/payments", icon: <Activity size={18} />, highlight: true },
    { label: "Cyber Risk SOC", path: "/cyber-risk", icon: <ShieldAlert size={18} /> },
    { label: "AI Reports", path: "/reports", icon: <FileText size={18} /> },
    { label: "Live Demo", path: "/blockchain", icon: <LinkIcon size={18} />, special: true }
  ];

  return (
    <div style={{
      width: 250,
      height: '100vh',
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid rgba(0, 255, 65, 0.05)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0',
      flexShrink: 0,
      zIndex: 10
    }}>
      <div style={{ padding: '0 24px', marginBottom: 40, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ background: 'rgba(0, 255, 65, 0.1)', border: '1px solid rgba(0, 255, 65, 0.3)', padding: '6px', borderRadius: 10, color: 'var(--accent)', boxShadow: '0 4px 12px rgba(0, 255, 65, 0.1)' }}>
          <CyberShield size={24} strokeWidth={2.5} />
        </div>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 800, margin: 0, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase' }}>CYBERFUSION</h1>
          <div style={{ fontSize: 9, color: 'var(--accent-secondary)', fontFamily: "'JetBrains Mono', monospace", display: 'flex', alignItems: 'center', gap: 4, letterSpacing: '0.12em', fontWeight: 600 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-secondary)', boxShadow: '0 0 8px var(--accent-secondary)' }}></span> NETWORK LITE
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, padding: '0 12px' }}>
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
                color: isActive ? '#fff' : 'var(--text-muted)',
                background: isActive ? 'rgba(0, 255, 65, 0.12)' : 'transparent',
                border: isActive ? '1px solid rgba(0, 255, 65, 0.3)' : '1px solid transparent',
                borderRadius: '12px',
                textDecoration: 'none',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.03em',
                transition: 'all 0.2s',
                position: 'relative',
                animation: item.special && !isActive ? 'nav-pulse 2s infinite' : 'none'
              }}
            >
              <style>{`
                @keyframes nav-pulse {
                  0% { border-color: transparent; }
                  50% { border-color: #00CC3388; box-shadow: 0 0 10px #00CC3322; }
                  100% { border-color: transparent; }
                }
              `}</style>
              {item.highlight && !isActive && <span style={{ position: 'absolute', right: 12, background: 'rgba(0, 255, 65, 0.1)', color: 'var(--accent)', border: '1px solid rgba(0, 255, 65, 0.3)', fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 'bold' }}>CORE</span>}
              <span style={{ opacity: isActive ? 1 : 0.6 }}>{item.icon}</span>
              {item.label}
              {isActive && <div style={{ position: 'absolute', right: 12, width: 4, height: 16, borderRadius: 2, background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }}></div>}
            </NavLink>
          );
        })}
      </div>


    </div>
  );
}
