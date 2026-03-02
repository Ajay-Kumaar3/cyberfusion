import React, { useState, useEffect } from "react";

// Pure SVG mini area chart — no recharts dependency
function MiniAreaChart({ data, cyberKey, txnKey }) {
  const W = 560, H = 220, PAD = { top: 10, right: 10, bottom: 24, left: 30 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const maxVal = 100;
  const xStep = innerW / (data.length - 1);

  const toPoint = (i, val) => ({
    x: PAD.left + i * xStep,
    y: PAD.top + innerH - (val / maxVal) * innerH,
  });

  const pathD = (key) =>
    data.map((d, i) => {
      const p = toPoint(i, d[key]);
      return `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`;
    }).join(" ");

  const areaD = (key) => {
    const pts = data.map((d, i) => toPoint(i, d[key]));
    const top = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const bottom = `L ${pts[pts.length - 1].x} ${PAD.top + innerH} L ${pts[0].x} ${PAD.top + innerH} Z`;
    return top + " " + bottom;
  };

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#00d4ff" stopOpacity="0.3" />
          <stop offset="95%" stopColor="#00d4ff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#a259ff" stopOpacity="0.3" />
          <stop offset="95%" stopColor="#a259ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map(v => {
        const y = PAD.top + innerH - (v / maxVal) * innerH;
        return (
          <g key={v}>
            <line x1={PAD.left} x2={PAD.left + innerW} y1={y} y2={y} stroke="#1e2d47" strokeDasharray="4 4" />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fill="#3a5070" fontSize="9">{v}</text>
          </g>
        );
      })}
      {/* X labels */}
      {data.map((d, i) => (
        <text key={i} x={PAD.left + i * xStep} y={H - 4} textAnchor="middle" fill="#5a7399" fontSize="10">{d.name}</text>
      ))}
      {/* Areas */}
      <path d={areaD(cyberKey)} fill="url(#cg)" />
      <path d={areaD(txnKey)} fill="url(#tg)" />
      {/* Lines */}
      <path d={pathD(cyberKey)} fill="none" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d={pathD(txnKey)} fill="none" stroke="#a259ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots */}
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={toPoint(i, d[cyberKey]).x} cy={toPoint(i, d[cyberKey]).y} r="3.5" fill="#00d4ff" />
          <circle cx={toPoint(i, d[txnKey]).x} cy={toPoint(i, d[txnKey]).y} r="3.5" fill="#a259ff" />
        </g>
      ))}
    </svg>
  );
}

const riskData = [
  { name: "Mon", cyber: 40, transaction: 24 },
  { name: "Tue", cyber: 65, transaction: 48 },
  { name: "Wed", cyber: 30, transaction: 20 },
  { name: "Thu", cyber: 80, transaction: 67 },
  { name: "Fri", cyber: 55, transaction: 43 },
  { name: "Sat", cyber: 90, transaction: 78 },
  { name: "Sun", cyber: 45, transaction: 30 },
];

const initialAlerts = [
  { id: 1, user: "Ajay K.", action: "New device login — Mumbai", risk: "CRITICAL", time: "2m ago", color: "#ff3366", icon: "🔴" },
  { id: 2, user: "Priya S.", action: "Transfer ₹85,000 to unknown account", risk: "HIGH", time: "5m ago", color: "#ff8800", icon: "🟠" },
  { id: 3, user: "Ravi M.", action: "Multiple failed login attempts", risk: "MEDIUM", time: "12m ago", color: "#ffd60a", icon: "🟡" },
  { id: 4, user: "Sneha R.", action: "Password changed + new IP detected", risk: "CRITICAL", time: "18m ago", color: "#ff3366", icon: "🔴" },
  { id: 5, user: "Karan T.", action: "Unusual transaction at 3AM", risk: "MEDIUM", time: "25m ago", color: "#ffd60a", icon: "🟡" },
];

const newAlertPool = [
  { user: "Meena V.", action: "VPN login from Netherlands", color: "#ff3366", risk: "CRITICAL" },
  { user: "Arjun P.", action: "Rapid 3 transfers in 2 min", color: "#ff8800", risk: "HIGH" },
  { user: "Divya N.", action: "Account accessed via new browser", color: "#ffd60a", risk: "MEDIUM" },
];

function useCounter(target, duration = 1500) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const t = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(t); }
      else setVal(start);
    }, 16);
    return () => clearInterval(t);
  }, [target, duration]);
  return val;
}

function StatCard({ icon, value, label, sub, accentColor, delay = 0 }) {
  const num = typeof value === "number" ? value : null;
  const count = useCounter(num ?? 0);

  return (
    <div className="hover-card" style={{
      ...styles.statCard,
      animationDelay: `${delay}ms`,
      borderColor: accentColor + "44",
    }}>
      {/* Glow orb */}
      <div style={{
        position: "absolute", top: -30, right: -30,
        width: 100, height: 100,
        background: accentColor,
        borderRadius: "50%",
        filter: "blur(40px)",
        opacity: 0.12,
        pointerEvents: "none",
      }} />
      <div style={{ ...styles.statIcon, color: accentColor, background: accentColor + "18" }}>
        {icon}
      </div>
      <div style={{ ...styles.statValue, color: accentColor }}>
        {num !== null ? count.toLocaleString() : value}
      </div>
      <div style={styles.statLabel}>{label}</div>
      <div style={{ ...styles.statSub, color: accentColor + "bb" }}>{sub}</div>
    </div>
  );
}



export default function Dashboard() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [tick, setTick] = useState(0);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const iv = setInterval(() => {
      setTick(t => t + 1);
      setTime(new Date());
      const pool = newAlertPool[Math.floor(Math.random() * newAlertPool.length)];
      setAlerts(prev => [{
        ...pool, id: Date.now(), time: "Just now",
        icon: pool.color === "#ff3366" ? "🔴" : pool.color === "#ff8800" ? "🟠" : "🟡",
      }, ...prev.slice(0, 4)]);
    }, 6000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={styles.page} className="grid-bg">
      {/* Scanline overlay */}
      <div style={styles.scanline} />

      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.breadcrumb}>CYBERFUSION LITE &nbsp;/&nbsp; DASHBOARD</div>
          <h1 style={styles.heading}>
            Threat <span style={{ color: "#00d4ff" }}>Overview</span>
          </h1>
          <p style={styles.sub}>Real-time behavioral & cyber fraud detection engine</p>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.liveChip}>
            <div style={{ ...styles.liveDot, animationDuration: `${1 + (tick % 3) * 0.5}s` }} />
            LIVE
          </div>
          <div style={styles.clockBox}>
            <div style={styles.clockTime}>
              {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
            <div style={styles.clockDate}>{time.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" })}</div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={styles.statsGrid}>
        <StatCard icon="🛡️" value={12847} label="Accounts Monitored" sub="↑ 3.2% from yesterday" accentColor="#00d4ff" delay={0} />
        <StatCard icon="🚨" value={38} label="Active Alerts" sub="↑ 12 new this hour" accentColor="#ff3366" delay={80} />
        <StatCard icon="💸" value={7} label="High Risk Transactions" sub="Flagged for review" accentColor="#a259ff" delay={160} />
        <StatCard icon="⚡" value="62/100" label="Avg Cyber Risk Score" sub="⚠ Elevated today" accentColor="#ffd60a" delay={240} />
      </div>

      {/* Bottom Row */}
      <div style={styles.bottomGrid}>
        {/* Chart */}
        <div style={{ ...styles.glassCard, flex: 1.5 }}>
          <div style={styles.cardHeader}>
            <div>
              <div style={styles.cardTitle}>📊 Weekly Risk Trend</div>
              <div style={styles.cardSub}>Cyber vs Transaction risk scores</div>
            </div>
            <div style={styles.legendRow}>
              <span style={{ fontSize: 11, color: "#00d4ff", fontWeight: 600 }}>● Cyber</span>
              <span style={{ fontSize: 11, color: "#a259ff", fontWeight: 600 }}>● Transaction</span>
            </div>
          </div>
          <MiniAreaChart data={riskData} cyberKey="cyber" txnKey="transaction" />
        </div>

        {/* Live Feed */}
        <div style={{ ...styles.glassCard, flex: 1, minWidth: 0 }}>
          <div style={styles.cardHeader}>
            <div>
              <div style={styles.cardTitle}>⚡ Live Alert Feed</div>
              <div style={styles.cardSub}>Auto-refreshing every 6s</div>
            </div>
          </div>
          <div style={styles.feedList}>
            {alerts.map((a, i) => (
              <div key={a.id} style={{
                ...styles.feedItem,
                opacity: 1 - i * 0.14,
                borderLeftColor: a.color,
                animation: i === 0 ? "slideInRight 0.4s ease" : "none",
              }}>
                <div style={styles.feedTop}>
                  <span style={styles.feedUser}>{a.icon}&nbsp; {a.user}</span>
                  <span style={{ ...styles.riskBadge, color: a.color, background: a.color + "18", border: `1px solid ${a.color}44` }}>
                    {a.risk}
                  </span>
                </div>
                <div style={styles.feedAction}>{a.action}</div>
                <div style={styles.feedTime}>{a.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "28px 32px",
    minHeight: "100%",
    position: "relative",
    animation: "fadeIn 0.4s ease",
  },
  scanline: {
    position: "fixed",
    top: 0, left: 0, right: 0,
    height: "2px",
    background: "linear-gradient(90deg, transparent, #00d4ff22, transparent)",
    animation: "scanline 8s linear infinite",
    pointerEvents: "none",
    zIndex: 10,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  },
  breadcrumb: {
    fontSize: 10,
    fontFamily: "'JetBrains Mono', monospace",
    color: "#3a5070",
    letterSpacing: "0.15em",
    marginBottom: 8,
  },
  heading: {
    fontSize: 32,
    fontWeight: 800,
    color: "#e8edf5",
    letterSpacing: "-0.5px",
    marginBottom: 6,
  },
  sub: { color: "#5a7399", fontSize: 13 },
  headerRight: { display: "flex", gap: 12, alignItems: "center" },
  liveChip: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 18px",
    borderRadius: 30,
    background: "#ff336618",
    border: "1px solid #ff336644",
    color: "#ff3366",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.12em",
    animation: "pulse-glow 2s infinite",
  },
  liveDot: {
    width: 8, height: 8,
    borderRadius: "50%",
    background: "#ff3366",
    animation: "blink 1s infinite",
  },
  clockBox: {
    background: "#0f1623",
    border: "1px solid #1e2d47",
    borderRadius: 10,
    padding: "8px 14px",
    textAlign: "center",
  },
  clockTime: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 15,
    fontWeight: 600,
    color: "#00d4ff",
    letterSpacing: "0.05em",
  },
  clockDate: { fontSize: 10, color: "#5a7399", marginTop: 2 },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
    marginBottom: 20,
  },
  statCard: {
    position: "relative",
    background: "linear-gradient(135deg, #0a0f1a, #0f1623)",
    border: "1px solid",
    borderRadius: 16,
    padding: "22px 20px",
    overflow: "hidden",
    animation: "fadeInUp 0.5s ease both",
  },
  statIcon: {
    width: 42, height: 42,
    borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 20,
    marginBottom: 14,
  },
  statValue: {
    fontSize: 34,
    fontWeight: 800,
    letterSpacing: "-0.5px",
    marginBottom: 4,
    fontFamily: "'JetBrains Mono', monospace",
  },
  statLabel: { fontSize: 12, color: "#5a7399", marginBottom: 4, fontWeight: 500 },
  statSub: { fontSize: 11, fontWeight: 600 },
  bottomGrid: {
    display: "flex",
    gap: 16,
    flex: 1,
  },
  glassCard: {
    background: "linear-gradient(135deg, #0a0f1acc, #0f1623cc)",
    border: "1px solid #1e2d47",
    borderRadius: 16,
    padding: "22px",
    backdropFilter: "blur(20px)",
    overflow: "hidden",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  cardTitle: { fontSize: 14, fontWeight: 700, color: "#e8edf5", marginBottom: 2 },
  cardSub: { fontSize: 11, color: "#5a7399" },
  legendRow: { display: "flex", gap: 14 },
  legendDot: (c) => ({ fontSize: 11, color: c, fontWeight: 600 }),
  feedList: { display: "flex", flexDirection: "column", gap: 8 },
  feedItem: {
    background: "#0a0f1a",
    borderRadius: 10,
    padding: "10px 12px",
    borderLeft: "3px solid",
    transition: "all 0.3s ease",
  },
  feedTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  feedUser: { fontSize: 12, fontWeight: 700, color: "#e8edf5" },
  riskBadge: {
    fontSize: 9,
    fontWeight: 800,
    padding: "2px 8px",
    borderRadius: 20,
    letterSpacing: "0.06em",
  },
  feedAction: { fontSize: 11, color: "#5a7399", marginBottom: 3 },
  feedTime: { fontSize: 10, color: "#3a5070", fontFamily: "'JetBrains Mono', monospace" },
};
