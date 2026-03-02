import React, { useState } from "react";

const alertsData = [
  { id: 1, user: "Ajay K.", accountId: "ACC-4821", cyber: 87, transaction: 91, action: "New device login from Mumbai + ₹85,000 transfer to unknown account", time: "2 min ago", status: "Open", severity: "CRITICAL" },
  { id: 2, user: "Priya S.", accountId: "ACC-3317", cyber: 74, transaction: 82, action: "Password changed + login from new city (Delhi) + large transfer", time: "8 min ago", status: "Open", severity: "HIGH" },
  { id: 3, user: "Ravi M.", accountId: "ACC-9042", cyber: 61, transaction: 58, action: "Multiple failed logins + transaction at 3AM outside normal hours", time: "20 min ago", status: "Under Review", severity: "MEDIUM" },
  { id: 4, user: "Sneha R.", accountId: "ACC-1155", cyber: 90, transaction: 88, action: "VPN login from foreign IP + rapid 3 transfers in under 2 minutes", time: "35 min ago", status: "Open", severity: "CRITICAL" },
  { id: 5, user: "Karan T.", accountId: "ACC-7723", cyber: 45, transaction: 60, action: "Unusual receiver account + amount 4x higher than monthly average", time: "1 hr ago", status: "Resolved", severity: "MEDIUM" },
  { id: 6, user: "Meena V.", accountId: "ACC-6610", cyber: 78, transaction: 72, action: "New browser fingerprint + login from unrecognized device", time: "2 hr ago", status: "Under Review", severity: "HIGH" },
];

const SEV = {
  CRITICAL: { color: "#ffffff", bg: "#ffffff14", glow: "#ffffff33", label: "CRITICAL", ring: "#ffffff44" },
  HIGH:     { color: "#ff8800", bg: "#ff880014", glow: "#ff880033", label: "HIGH",     ring: "#ff880044" },
  MEDIUM:   { color: "#ffffff", bg: "#ffffff14", glow: "#ffffff33", label: "MEDIUM",   ring: "#ffffff44" },
  LOW:      { color: "#00ff00", bg: "#00ff0014", glow: "#00ff0033", label: "LOW",       ring: "#00ff0044" },
};
const STAT = {
  Open:          { color: "#ffffff", bg: "#ffffff14" },
  "Under Review":{ color: "#ffffff", bg: "#ffffff14" },
  Resolved:      { color: "#00ff00", bg: "#00ff0014" },
};

function ScoreBar({ value, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: "#1e2d47", borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 4,
          width: `${value}%`,
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
          boxShadow: `0 0 8px ${color}66`,
          transition: "width 0.8s ease",
        }} />
      </div>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color, minWidth: 24 }}>{value}</span>
    </div>
  );
}

export default function AlertsCenter() {
  const [alerts, setAlerts] = useState(alertsData);
  const [filter, setFilter] = useState("All");
  const [hovered, setHovered] = useState(null);
  const filters = ["All", "Open", "Under Review", "Resolved"];

  const filtered = filter === "All" ? alerts : alerts.filter(a => a.status === filter);

  const update = (id, status) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, status } : a));

  const counts = {
    open: alerts.filter(a => a.status === "Open").length,
    review: alerts.filter(a => a.status === "Under Review").length,
    resolved: alerts.filter(a => a.status === "Resolved").length,
  };

  return (
    <div style={styles.page} className="grid-bg">
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.breadcrumb}>CYBERFUSION LITE &nbsp;/&nbsp; ALERTS CENTER</div>
          <h1 style={styles.heading}>
            Alerts <span style={{ color: "#ffffff" }}>Center</span>
          </h1>
          <p style={styles.sub}>All triggered fraud alerts — review and manage in real-time</p>
        </div>
        {/* Counter pills */}
        <div style={styles.pillRow}>
          {[
            { label: "Open", val: counts.open, color: "#ffffff" },
            { label: "In Review", val: counts.review, color: "#ffffff" },
            { label: "Resolved", val: counts.resolved, color: "#00ff00" },
          ].map(p => (
            <div key={p.label} style={{ ...styles.pill, borderColor: p.color + "44" }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: p.color, fontFamily: "'JetBrains Mono', monospace" }}>{p.val}</span>
              <span style={{ fontSize: 10, color: "#008800", marginTop: 2 }}>{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={styles.tabBar}>
        <div style={styles.tabs}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              ...styles.tab,
              color: filter === f ? "#88ff88" : "#008800",
              background: filter === f ? "#88ff8814" : "transparent",
              borderBottom: filter === f ? "2px solid #88ff88" : "2px solid transparent",
            }}>{f}
              {f !== "All" && <span style={{
                marginLeft: 6, fontSize: 9, fontWeight: 800,
                background: filter === f ? "#88ff8822" : "#1e2d47",
                color: filter === f ? "#88ff88" : "#008800",
                padding: "1px 6px", borderRadius: 8,
              }}>
                {f === "Open" ? counts.open : f === "Under Review" ? counts.review : counts.resolved}
              </span>}
            </button>
          ))}
        </div>
        <div style={styles.resultCount}>{filtered.length} alert{filtered.length !== 1 ? "s" : ""}</div>
      </div>

      {/* Alert Cards */}
      <div style={styles.list}>
        {filtered.map((alert, i) => {
          const sev = SEV[alert.severity];
          const sta = STAT[alert.status];
          const isHov = hovered === alert.id;
          return (
            <div
              key={alert.id}
              className="hover-card"
              onMouseEnter={() => setHovered(alert.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                ...styles.card,
                borderColor: isHov ? sev.color + "55" : "#1e2d47",
                boxShadow: isHov ? `0 8px 32px ${sev.color}18, inset 0 0 0 1px ${sev.color}22` : "none",
                animationDelay: `${i * 60}ms`,
              }}
            >
              {/* Left accent bar */}
              <div style={{ ...styles.accentBar, background: sev.color, boxShadow: `0 0 10px ${sev.color}` }} />

              <div style={styles.cardInner}>
                {/* Top row */}
                <div style={styles.cardTop}>
                  <div style={styles.cardLeft}>
                    <div style={{ ...styles.avatar, boxShadow: `0 0 12px ${sev.color}44`, borderColor: sev.color + "44" }}>
                      <span style={{ color: "#0a0f1a", fontWeight: 800 }}>{alert.user.charAt(0)}</span>
                    </div>
                    <div>
                      <div style={styles.userName}>{alert.user}</div>
                      <div style={{ ...styles.accountId, fontFamily: "'JetBrains Mono', monospace" }}>{alert.accountId}</div>
                    </div>
                  </div>
                  <div style={styles.badges}>
                    <span style={{ ...styles.badge, background: sev.bg, color: sev.color, border: `1px solid ${sev.ring}` }}>
                      ● {sev.label}
                    </span>
                    <span style={{ ...styles.badge, background: sta.bg, color: sta.color }}>
                      {alert.status}
                    </span>
                  </div>
                </div>

                {/* Scores */}
                <div style={styles.scoresGrid}>
                  <div>
                    <div style={styles.scoreTitle}>Cyber Risk</div>
                    <ScoreBar value={alert.cyber} color="#88ff88" />
                  </div>
                  <div>
                    <div style={styles.scoreTitle}>Txn Risk</div>
                    <ScoreBar value={alert.transaction} color="#ffffff" />
                  </div>
                </div>

                {/* Action text */}
                <div style={styles.actionBox}>
                  <span style={{ color: sev.color, marginRight: 6 }}>⚠</span>
                  <span style={{ color: "#8499b8", fontSize: 12 }}>{alert.action}</span>
                </div>

                {/* Footer */}
                <div style={styles.cardFooter}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#3a5070" }}>
                    🕐 {alert.time}
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    {alert.status !== "Under Review" && (
                      <button onClick={() => update(alert.id, "Under Review")} style={{ ...styles.btn, color: "#ffffff", borderColor: "#ffffff44", background: "#ffffff0a" }}>
                        Review
                      </button>
                    )}
                    {alert.status !== "Resolved" && (
                      <button onClick={() => update(alert.id, "Resolved")} style={{ ...styles.btn, color: "#00ff00", borderColor: "#00ff0044", background: "#00ff000a" }}>
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={styles.empty}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ color: "#00ff00", fontWeight: 700 }}>All clear</div>
            <div style={{ color: "#008800", fontSize: 12 }}>No alerts match this filter</div>
          </div>
        )}
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
  pillRow: { display: "flex", gap: 10 },
  pill: {
    display: "flex", flexDirection: "column", alignItems: "center",
    background: "#0a0f1a", border: "1px solid",
    borderRadius: 12, padding: "12px 20px", minWidth: 72,
  },
  tabBar: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #1e2d47",
    marginBottom: 20,
  },
  tabs: { display: "flex", gap: 2 },
  tab: {
    padding: "10px 18px", border: "none", cursor: "pointer",
    fontSize: 13, fontWeight: 600,
    borderRadius: "6px 6px 0 0",
    transition: "all 0.2s",
    fontFamily: "Inter, sans-serif",
  },
  resultCount: { fontSize: 11, color: "#3a5070", fontFamily: "'JetBrains Mono', monospace", paddingBottom: 10 },
  list: { display: "flex", flexDirection: "column", gap: 12 },
  card: {
    display: "flex",
    background: "linear-gradient(135deg, #0a0f1a, #0f1623)",
    border: "1px solid",
    borderRadius: 14,
    overflow: "hidden",
    transition: "all 0.25s ease",
    animation: "fadeInUp 0.4s ease both",
  },
  accentBar: { width: 3, flexShrink: 0 },
  cardInner: { flex: 1, padding: "16px 18px" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  cardLeft: { display: "flex", alignItems: "center", gap: 12 },
  avatar: {
    width: 40, height: 40, borderRadius: "50%",
    background: "linear-gradient(135deg, #88ff88, #ffffff)",
    display: "flex", alignItems: "center", justifyContent: "center",
    border: "2px solid", fontSize: 16, flexShrink: 0,
  },
  userName: { color: "#ffffff", fontWeight: 700, fontSize: 14, marginBottom: 2 },
  accountId: { color: "#3a5070", fontSize: 11 },
  badges: { display: "flex", gap: 8 },
  badge: { fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, letterSpacing: "0.04em" },
  scoresGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px", marginBottom: 12 },
  scoreTitle: { fontSize: 10, color: "#008800", marginBottom: 4, fontWeight: 600, letterSpacing: "0.05em" },
  actionBox: {
    display: "flex", alignItems: "flex-start",
    background: "#060b12", borderRadius: 8,
    padding: "10px 12px", marginBottom: 12,
    border: "1px solid #1e2d47",
  },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  btn: {
    padding: "5px 14px", borderRadius: 20,
    border: "1px solid", cursor: "pointer",
    fontSize: 11, fontWeight: 700,
    transition: "all 0.2s", fontFamily: "Inter, sans-serif",
  },
  empty: {
    textAlign: "center", padding: "60px 0",
    background: "#0a0f1a", borderRadius: 14,
    border: "1px solid #1e2d47",
  },
};
