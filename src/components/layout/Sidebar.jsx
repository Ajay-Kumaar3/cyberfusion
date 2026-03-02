import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { label: "Dashboard",             path: "/",            icon: "◈", sub: "Overview" },
  { label: "Alerts Center",         path: "/alerts",       icon: "◉", sub: "Fraud Alerts" },
  { label: "Account Investigation", path: "/account",      icon: "◎", sub: "User Profiles" },
  { label: "Cyber Risk Monitor",    path: "/cyber-risk",   icon: "◆", sub: "Login Intel" },
  { label: "Transaction Analyzer",  path: "/transactions", icon: "◇", sub: "Financial Scan" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [hovered, setHovered] = useState(null);

  return (
    <div style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoIcon}>⬡</div>
        <div>
          <div style={styles.logoText}>CyberFusion</div>
          <div style={styles.logoSub}>LITE v1.0</div>
        </div>
      </div>

      <div style={styles.sectionLabel}>NAVIGATION</div>

      {/* Nav */}
      <nav style={styles.nav}>
        {navItems.map(item => {
          const active = location.pathname === item.path;
          const hov = hovered === item.path;
          return (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              onMouseEnter={() => setHovered(item.path)}
              onMouseLeave={() => setHovered(null)}
              style={{
                ...styles.navItem,
                background: active
                  ? "linear-gradient(135deg, #00d4ff14, #a259ff08)"
                  : hov ? "#00d4ff08" : "transparent",
                borderLeft: active ? "2px solid #00d4ff" : "2px solid transparent",
                boxShadow: active ? "inset 8px 0 16px #00d4ff08" : "none",
              }}
            >
              {active && <div style={styles.activeDot} />}
              <div style={{ ...styles.navIcon, color: active ? "#00d4ff" : "#3a5070" }}>
                {item.icon}
              </div>
              <div style={styles.navText}>
                <div style={{ ...styles.navLabel, color: active ? "#e8edf5" : "#8499b8" }}>
                  {item.label}
                </div>
                <div style={{ ...styles.navSub, color: active ? "#5a7399" : "#3a5070" }}>
                  {item.sub}
                </div>
              </div>
              {active && <div style={styles.navArrow} />}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.statusDot} />
          <div>
            <div style={styles.statusLabel}>System Active</div>
            <div style={styles.statusSub}>All monitors online</div>
          </div>
        </div>
        <div style={styles.versionTag}>BUILD 2025.03</div>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: 240,
    background: "linear-gradient(180deg, #060b12 0%, #0a0f1a 100%)",
    borderRight: "1px solid #1e2d47",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    position: "relative",
    overflow: "hidden",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "22px 20px",
    borderBottom: "1px solid #1e2d47",
    marginBottom: 10,
  },
  logoIcon: {
    fontSize: 28,
    color: "#00d4ff",
    filter: "drop-shadow(0 0 8px #00d4ff88)",
    lineHeight: 1,
  },
  logoText: { fontSize: 15, fontWeight: 800, color: "#e8edf5" },
  logoSub: {
    fontSize: 9,
    color: "#3a5070",
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "0.12em",
    marginTop: 1,
  },
  sectionLabel: {
    fontSize: 9,
    color: "#3a5070",
    fontWeight: 700,
    letterSpacing: "0.18em",
    padding: "6px 20px 10px",
  },
  nav: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    padding: "0 10px",
    overflowY: "auto",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px 10px 18px",
    borderRadius: "0 8px 8px 0",
    cursor: "pointer",
    transition: "all 0.2s ease",
    position: "relative",
    marginLeft: -10,
  },
  activeDot: {
    position: "absolute",
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
    width: 2,
    height: 20,
    background: "#00d4ff",
    boxShadow: "0 0 8px #00d4ff",
    borderRadius: 2,
  },
  navIcon: { fontSize: 16, fontWeight: 900, flexShrink: 0, width: 20, textAlign: "center" },
  navText: { flex: 1, minWidth: 0 },
  navLabel: {
    fontSize: 12.5,
    fontWeight: 600,
    transition: "color 0.2s",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  navSub: {
    fontSize: 9.5,
    marginTop: 1,
    transition: "color 0.2s",
    fontFamily: "'JetBrains Mono', monospace",
  },
  navArrow: {
    width: 4,
    height: 4,
    borderRight: "1.5px solid #00d4ff",
    borderTop: "1.5px solid #00d4ff",
    transform: "rotate(45deg)",
    flexShrink: 0,
    opacity: 0.7,
  },
  footer: { padding: "14px 18px", borderTop: "1px solid #1e2d47" },
  footerInner: { display: "flex", alignItems: "center", gap: 10, marginBottom: 8 },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#00ff88",
    boxShadow: "0 0 8px #00ff88",
    flexShrink: 0,
  },
  statusLabel: { fontSize: 11, fontWeight: 700, color: "#00ff88" },
  statusSub: { fontSize: 9.5, color: "#3a5070", marginTop: 1 },
  versionTag: {
    fontSize: 8.5,
    color: "#1e2d47",
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "0.12em",
  },
};
