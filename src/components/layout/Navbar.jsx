import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const PAGE_META = {
  "/":             { title: "Threat Overview",        icon: "◈", color: "#00d4ff" },
  "/alerts":       { title: "Alerts Center",          icon: "◉", color: "#ff3366" },
  "/account":      { title: "Account Investigation",  icon: "◎", color: "#a259ff" },
  "/cyber-risk":   { title: "Cyber Risk Monitor",     icon: "◆", color: "#00d4ff" },
  "/transactions": { title: "Transaction Analyzer",   icon: "◇", color: "#a259ff" },
};

export default function Navbar() {
  const location = useLocation();
  const meta = PAGE_META[location.pathname] || PAGE_META["/"];
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => setPulse(p => !p), 2000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={styles.navbar}>
      {/* Left: Page title */}
      <div style={styles.left}>
        <span style={{ ...styles.pageIcon, color: meta.color, filter: `drop-shadow(0 0 6px ${meta.color})` }}>
          {meta.icon}
        </span>
        <div>
          <div style={styles.pageTitle}>{meta.title}</div>
          <div style={styles.pagePath}>
            {location.pathname === "/" ? "/dashboard" : location.pathname}
          </div>
        </div>
      </div>

      {/* Right */}
      <div style={styles.right}>
        {/* Threat level */}
        <div style={styles.threatBox}>
          <div style={{ fontSize: 9, color: "#5a7399", marginBottom: 2, letterSpacing: "0.1em" }}>
            THREAT LEVEL
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {["#00ff88", "#ffd60a", "#ffd60a", "#ff8800", "#ff3366"].map((c, i) => (
              <div
                key={i}
                style={{
                  width: 14, height: 14, borderRadius: 3,
                  background: i < 3 ? c : c + "33",
                  boxShadow: i < 3 ? `0 0 6px ${c}` : "none",
                  transition: "all 0.5s",
                }}
              />
            ))}
            <span style={{ fontSize: 10, color: "#ffd60a", fontWeight: 700, marginLeft: 4 }}>
              ELEVATED
            </span>
          </div>
        </div>

        <div style={styles.divider} />

        {/* Live Tag */}
        <div style={{
          ...styles.liveTag,
          boxShadow: pulse ? "0 0 16px #ff336644" : "none",
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#ff3366",
            animation: "blink 1s infinite",
          }} />
          LIVE MONITORING
        </div>

        <div style={styles.divider} />

        {/* Avatar */}
        <div style={styles.avatarWrap}>
          <div style={styles.avatar}>AK</div>
          <div>
            <div style={styles.avatarName}>Analyst</div>
            <div style={styles.avatarRole}>Security Ops</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  navbar: {
    height: 62,
    background: "linear-gradient(90deg, #060b12 0%, #0a0f1a 100%)",
    borderBottom: "1px solid #1e2d47",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 28px",
    flexShrink: 0,
  },
  left: { display: "flex", alignItems: "center", gap: 12 },
  pageIcon: { fontSize: 22, lineHeight: 1 },
  pageTitle: { fontSize: 15, fontWeight: 700, color: "#e8edf5" },
  pagePath: {
    fontSize: 9.5,
    color: "#3a5070",
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "0.08em",
    marginTop: 1,
  },
  right: { display: "flex", alignItems: "center", gap: 16 },
  threatBox: {
    background: "#0a0f1a",
    border: "1px solid #1e2d47",
    borderRadius: 8,
    padding: "6px 12px",
  },
  divider: { width: 1, height: 28, background: "#1e2d47" },
  liveTag: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#ff336612",
    border: "1px solid #ff336633",
    color: "#ff3366",
    fontSize: 10,
    fontWeight: 800,
    padding: "6px 12px",
    borderRadius: 20,
    letterSpacing: "0.08em",
    transition: "box-shadow 0.5s ease",
  },
  avatarWrap: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer" },
  avatar: {
    width: 34, height: 34, borderRadius: "50%",
    background: "linear-gradient(135deg, #00d4ff, #a259ff)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, fontWeight: 800, color: "#0a0f1a",
    boxShadow: "0 0 10px #00d4ff44",
  },
  avatarName: { fontSize: 11, fontWeight: 700, color: "#e8edf5" },
  avatarRole: { fontSize: 9, color: "#5a7399", fontFamily: "'JetBrains Mono', monospace" },
};
