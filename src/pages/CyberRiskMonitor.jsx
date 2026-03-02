import React, { useState } from "react";

const loginData = [
  { id: 1, user: "Ajay K.", accountId: "ACC-4821", device: "Unknown Android", ip: "103.45.67.89", location: "Mumbai, MH", time: "12:03 PM", flags: ["New Device", "New City", "New IP"], cyberScore: 87, status: "Suspicious" },
  { id: 2, user: "Priya S.", accountId: "ACC-3317", device: "iPhone 14", ip: "49.32.11.204", location: "Delhi, DL", time: "02:30 PM", flags: ["New City", "Failed OTPs"], cyberScore: 74, status: "Suspicious" },
  { id: 3, user: "Sneha R.", accountId: "ACC-1155", device: "VPN — Unknown", ip: "185.220.101.5", location: "Foreign IP (NL)", time: "01:15 PM", flags: ["VPN Detected", "New Device", "Foreign IP"], cyberScore: 90, status: "Critical" },
  { id: 4, user: "Ravi M.", accountId: "ACC-9042", device: "Chrome on Windows", ip: "122.45.67.10", location: "Hyderabad, TS", time: "11:30 AM", flags: ["5 Failed Logins"], cyberScore: 61, status: "Warning" },
  { id: 5, user: "Karan T.", accountId: "ACC-7723", device: "MacBook Safari", ip: "59.88.23.45", location: "Chennai, TN", time: "09:00 AM", flags: ["Password Changed"], cyberScore: 45, status: "Warning" },
  { id: 6, user: "Meena V.", accountId: "ACC-6610", device: "Samsung Galaxy", ip: "103.21.55.77", location: "Pune, MH", time: "08:45 AM", flags: ["New Browser", "New Device"], cyberScore: 78, status: "Suspicious" },
  { id: 7, user: "Divya N.", accountId: "ACC-2201", device: "Trusted iPhone", ip: "59.12.33.88", location: "Bangalore, KA", time: "08:00 AM", flags: [], cyberScore: 12, status: "Safe" },
];

const STATUS_CFG = {
  Critical:   { color: "#ffffff", bg: "#ffffff14", glow: "#ffffff33", icon: "🔴" },
  Suspicious: { color: "#ff8800", bg: "#ff880014", glow: "#ff880033", icon: "🟠" },
  Warning:    { color: "#ffffff", bg: "#ffffff14", glow: "#ffffff33", icon: "🟡" },
  Safe:       { color: "#00ff00", bg: "#00ff0014", glow: "#00ff0033", icon: "🟢" },
};

const FLAG_COLORS = ["#ffffff", "#ff8800", "#ffffff", "#ffffff", "#88ff88", "#ff00ff"];

function ScoreRing({ score, status }) {
  const cfg = STATUS_CFG[status];
  const r = 28, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={68} height={68} viewBox="0 0 68 68">
        <circle cx={34} cy={34} r={r} fill="none" stroke="#1e2d47" strokeWidth={6} />
        <circle
          cx={34} cy={34} r={r} fill="none"
          stroke={cfg.color} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 34 34)"
          style={{ filter: `drop-shadow(0 0 4px ${cfg.color})`, transition: "stroke-dashoffset 1s ease" }}
        />
        <text x="34" y="34" textAnchor="middle" dominantBaseline="middle" fill={cfg.color} fontSize="13" fontWeight="700" fontFamily="JetBrains Mono, monospace">{score}</text>
      </svg>
    </div>
  );
}

export default function CyberRiskMonitor() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const filters = ["All", "Critical", "Suspicious", "Warning", "Safe"];

  const filtered = loginData.filter(item => {
    const matchF = filter === "All" || item.status === filter;
    const matchS = item.user.toLowerCase().includes(search.toLowerCase()) || item.accountId.toLowerCase().includes(search.toLowerCase());
    return matchF && matchS;
  });

  const counts = {
    Critical: loginData.filter(d => d.status === "Critical").length,
    Suspicious: loginData.filter(d => d.status === "Suspicious").length,
    Warning: loginData.filter(d => d.status === "Warning").length,
    Safe: loginData.filter(d => d.status === "Safe").length,
  };

  return (
    <div style={styles.page} className="grid-bg">
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.breadcrumb}>CYBERFUSION LITE &nbsp;/&nbsp; CYBER RISK MONITOR</div>
          <h1 style={styles.heading}>
            Cyber Risk <span style={{ color: "#88ff88" }}>Monitor</span>
          </h1>
          <p style={styles.sub}>Login anomaly intelligence — device, IP & location signals</p>
        </div>
        {/* Search */}
        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>⌕</span>
          <input
            style={styles.input}
            placeholder="Search user or account ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div style={styles.summaryGrid}>
        {Object.entries(counts).map(([key, val]) => {
          const cfg = STATUS_CFG[key];
          return (
            <div key={key} className="hover-card" style={{ ...styles.summaryCard, borderColor: cfg.color + "33" }}>
              <div style={{ ...styles.summaryGlow, background: cfg.color, boxShadow: `0 0 40px ${cfg.color}` }} />
              <div style={{ fontSize: 11, color: cfg.color, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 10 }}>
                {cfg.icon} {key.toUpperCase()}
              </div>
              <div style={{ fontSize: 38, fontWeight: 900, color: cfg.color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 10, color: "#3a5070", marginTop: 6 }}>accounts</div>
            </div>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div style={styles.tabBar}>
        <div style={styles.tabs}>
          {filters.map(f => {
            const cfg = f !== "All" ? STATUS_CFG[f] : null;
            return (
              <button key={f} onClick={() => setFilter(f)} style={{
                ...styles.tab,
                color: filter === f ? (cfg?.color ?? "#88ff88") : "#008800",
                background: filter === f ? (cfg?.color ?? "#88ff88") + "14" : "transparent",
                borderBottom: filter === f ? `2px solid ${cfg?.color ?? "#88ff88"}` : "2px solid transparent",
              }}>{f}</button>
            );
          })}
        </div>
        <span style={styles.resultCount}>{filtered.length} logins</span>
      </div>

      {/* Table */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              {["User", "Device", "IP Address", "Location", "Time", "Anomaly Flags", "Risk Score", "Status"].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, i) => {
              const cfg = STATUS_CFG[item.status];
              return (
                <tr key={item.id} style={{
                  ...styles.tr,
                  background: i % 2 === 0 ? "#0a0f1a" : "#060b12",
                  borderBottom: "1px solid #1e2d47",
                }}>
                  {/* User */}
                  <td style={styles.td}>
                    <div style={styles.userCell}>
                      <div style={{ ...styles.avatar, boxShadow: `0 0 8px ${cfg.color}44`, borderColor: cfg.color + "44" }}>
                        {item.user.charAt(0)}
                      </div>
                      <div>
                        <div style={{ color: "#ffffff", fontSize: 13, fontWeight: 700 }}>{item.user}</div>
                        <div style={{ color: "#3a5070", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>{item.accountId}</div>
                      </div>
                    </div>
                  </td>
                  {/* Device */}
                  <td style={styles.td}>
                    <span style={{ color: "#8499b8", fontSize: 12 }}>📱 {item.device}</span>
                  </td>
                  {/* IP */}
                  <td style={styles.td}>
                    <span style={{ color: "#88ff88", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", background: "#88ff880a", padding: "2px 8px", borderRadius: 4 }}>
                      {item.ip}
                    </span>
                  </td>
                  {/* Location */}
                  <td style={styles.td}>
                    <span style={{ color: "#8499b8", fontSize: 12 }}>📍 {item.location}</span>
                  </td>
                  {/* Time */}
                  <td style={styles.td}>
                    <span style={{ color: "#008800", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>🕐 {item.time}</span>
                  </td>
                  {/* Flags */}
                  <td style={styles.td}>
                    <div style={styles.flagsWrap}>
                      {item.flags.length === 0
                        ? <span style={{ color: "#00ff00", fontSize: 10, background: "#00ff0014", padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>✓ Clean</span>
                        : item.flags.map((flag, fi) => (
                          <span key={fi} style={{
                            fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                            background: FLAG_COLORS[fi % FLAG_COLORS.length] + "18",
                            color: FLAG_COLORS[fi % FLAG_COLORS.length],
                            border: `1px solid ${FLAG_COLORS[fi % FLAG_COLORS.length]}33`,
                          }}>{flag}</span>
                        ))
                      }
                    </div>
                  </td>
                  {/* Score */}
                  <td style={styles.td}><ScoreRing score={item.cyberScore} status={item.status} /></td>
                  {/* Status */}
                  <td style={styles.td}>
                    <span style={{ ...styles.statusBadge, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}44`, boxShadow: `0 0 8px ${cfg.glow}` }}>
                      {cfg.icon} {item.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: "28px 32px", minHeight: "100%", animation: "fadeIn 0.4s ease" },
  breadcrumb: { fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#3a5070", letterSpacing: "0.15em", marginBottom: 8 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 },
  heading: { fontSize: 32, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.5px", marginBottom: 6 },
  sub: { color: "#008800", fontSize: 13 },
  searchWrap: { position: "relative", display: "flex", alignItems: "center" },
  searchIcon: { position: "absolute", left: 12, fontSize: 18, color: "#008800", pointerEvents: "none" },
  input: {
    background: "#0a0f1a", border: "1px solid #1e2d47",
    borderRadius: 10, padding: "10px 14px 10px 36px",
    color: "#ffffff", fontSize: 13, outline: "none", width: 240,
    fontFamily: "Inter, sans-serif",
    transition: "border-color 0.2s",
  },
  summaryGrid: {
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
    gap: 14, marginBottom: 24,
  },
  summaryCard: {
    position: "relative", overflow: "hidden",
    background: "linear-gradient(135deg, #0a0f1a, #0f1623)",
    border: "1px solid", borderRadius: 14, padding: "18px 20px",
  },
  summaryGlow: { position: "absolute", top: -40, right: -20, width: 80, height: 80, borderRadius: "50%", filter: "blur(40px)", opacity: 0.12 },
  tabBar: { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e2d47", marginBottom: 0 },
  tabs: { display: "flex", gap: 2 },
  tab: { padding: "10px 18px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, borderRadius: "6px 6px 0 0", transition: "all 0.2s", fontFamily: "Inter, sans-serif" },
  resultCount: { fontSize: 10, color: "#3a5070", fontFamily: "'JetBrains Mono', monospace", paddingBottom: 10 },
  tableWrap: { background: "linear-gradient(135deg, #0a0f1a, #0f1623)", border: "1px solid #1e2d47", borderRadius: "0 14px 14px 14px", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#060b12", borderBottom: "1px solid #1e2d47" },
  th: { padding: "12px 16px", textAlign: "left", color: "#3a5070", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" },
  tr: { transition: "background 0.2s" },
  td: { padding: "12px 16px", verticalAlign: "middle" },
  userCell: { display: "flex", alignItems: "center", gap: 10 },
  avatar: {
    width: 34, height: 34, borderRadius: "50%",
    background: "linear-gradient(135deg, #88ff88, #ffffff)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 13, fontWeight: 800, color: "#0a0f1a",
    border: "1.5px solid", flexShrink: 0,
  },
  flagsWrap: { display: "flex", flexWrap: "wrap", gap: 4, maxWidth: 180 },
  statusBadge: { fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" },
};
