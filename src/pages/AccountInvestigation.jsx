import React, { useState } from "react";

const accounts = [
  {
    id: "ACC-4821", name: "Ajay K.", email: "ajay.k@email.com", phone: "+91 98765 43210", location: "Chennai, TN",
    cyberScore: 87, transactionScore: 91, status: "COMPROMISED",
    timeline: [
      { time: "09:12 AM", event: "Normal login from Chennai (trusted device)", type: "safe" },
      { time: "11:45 AM", event: "Phishing email opened — suspicious link clicked", type: "warning" },
      { time: "12:03 PM", event: "Login from new device — Mumbai IP detected", type: "danger" },
      { time: "12:07 PM", event: "Password changed from new device", type: "danger" },
      { time: "12:15 PM", event: "Transfer of ₹85,000 initiated to unknown account", type: "danger" },
      { time: "12:16 PM", event: "🚨 FRAUD ALERT TRIGGERED — Transaction blocked", type: "alert" },
    ],
    transactions: [
      { id: "TXN-001", amount: "₹85,000", receiver: "Unknown ACC-9999", time: "12:15 PM", risk: "HIGH", status: "Blocked" },
      { id: "TXN-002", amount: "₹2,300", receiver: "Amazon Pay", time: "08:30 AM", risk: "LOW", status: "Cleared" },
      { id: "TXN-003", amount: "₹15,000", receiver: "HDFC Credit Card", time: "Yesterday", risk: "LOW", status: "Cleared" },
    ],
    aiReport: "This account shows a classic account takeover pattern. A phishing link was clicked at 11:45 AM, followed by a login from an unrecognized device in Mumbai just 18 minutes later. The attacker immediately changed the password to lock out the real user and initiated a high-value transfer of ₹85,000 to an unknown account. The combined Cyber Risk Score of 87 and Transaction Risk Score of 91 confirm a high-confidence fraud scenario. Immediate account freeze and user verification is strongly recommended.",
  },
  {
    id: "ACC-3317", name: "Priya S.", email: "priya.s@email.com", phone: "+91 91234 56789", location: "Bangalore, KA",
    cyberScore: 74, transactionScore: 82, status: "HIGH RISK",
    timeline: [
      { time: "10:00 AM", event: "Normal login from Bangalore", type: "safe" },
      { time: "02:30 PM", event: "Login attempt from Delhi IP — new location", type: "warning" },
      { time: "02:35 PM", event: "Multiple failed OTP attempts detected", type: "danger" },
      { time: "02:41 PM", event: "Large transfer ₹40,000 attempted", type: "danger" },
      { time: "02:42 PM", event: "🚨 FRAUD ALERT TRIGGERED", type: "alert" },
    ],
    transactions: [
      { id: "TXN-101", amount: "₹40,000", receiver: "Unknown ACC-5544", time: "02:41 PM", risk: "HIGH", status: "Blocked" },
      { id: "TXN-102", amount: "₹500", receiver: "Swiggy", time: "11:00 AM", risk: "LOW", status: "Cleared" },
    ],
    aiReport: "This account triggered risk signals from a geographic anomaly — a login was detected from Delhi while the account holder's registered location is Bangalore. Multiple failed OTP attempts suggest an attacker trying to bypass two-factor authentication. A ₹40,000 transfer to an unknown account shortly after confirms a likely credential-stuffing attack. Cyber Risk Score: 74, Transaction Risk Score: 82.",
  },
];

const TYPE_CFG = {
  safe:    { color: "#00ff00", bg: "#00ff0012" },
  warning: { color: "#ffffff", bg: "#ffffff12" },
  danger:  { color: "#ffffff", bg: "#ffffff12" },
  alert:   { color: "#ffffff", bg: "#ffffff12" },
};

const RISK_COLOR   = { HIGH: "#ffffff", MEDIUM: "#ffffff", LOW: "#00ff00" };
const STATUS_COLOR = { Blocked: "#ffffff", Cleared: "#00ff00", Pending: "#ffffff" };

const ACCT_STATUS = {
  COMPROMISED:  { color: "#ffffff", bg: "#ffffff14", glow: "#ffffff44" },
  "HIGH RISK":  { color: "#ccff00", bg: "#ccff0014", glow: "#ccff0044" },
  SAFE:         { color: "#00ff00", bg: "#00ff0014", glow: "#00ff0044" },
};

function ScoreGauge({ score, label, color }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#1e2d47" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 48 48)"
          style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: "stroke-dashoffset 1s ease" }}
        />
        <circle cx="48" cy="48" r="28" fill="none" stroke={color + "22"} strokeWidth="1" />
        <text x="48" y="44" textAnchor="middle" dominantBaseline="middle" fill={color} fontSize="20" fontWeight="800" fontFamily="JetBrains Mono, monospace">{score}</text>
        <text x="48" y="60" textAnchor="middle" dominantBaseline="middle" fill="#3a5070" fontSize="9">/100</text>
      </svg>
      <div style={{ fontSize: 10, color: "#008800", marginTop: 6, fontWeight: 600, letterSpacing: "0.05em" }}>{label}</div>
    </div>
  );
}

export default function AccountInvestigation() {
  const [selected, setSelected] = useState(accounts[0]);
  const [searchId, setSearchId] = useState("");
  const [showAI, setShowAI] = useState(false);

  const handleSearch = () => {
    const found = accounts.find(a =>
      a.id.toLowerCase().includes(searchId.toLowerCase()) ||
      a.name.toLowerCase().includes(searchId.toLowerCase())
    );
    if (found) setSelected(found);
  };

  const sc = ACCT_STATUS[selected.status] || ACCT_STATUS["SAFE"];
  const combinedRisk = Math.round((selected.cyberScore + selected.transactionScore) / 2);

  return (
    <div style={styles.page} className="grid-bg">
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.breadcrumb}>CYBERFUSION LITE &nbsp;/&nbsp; ACCOUNT INVESTIGATION</div>
          <h1 style={styles.heading}>
            Account <span style={{ color: "#ffffff" }}>Investigation</span>
          </h1>
          <p style={styles.sub}>Deep behavioral analysis of individual account risk profiles</p>
        </div>
        <div style={styles.searchRow}>
          <div style={styles.searchWrap}>
            <span style={styles.searchIcon}>⌕</span>
            <input
              style={styles.input}
              placeholder="Search name or ACC-ID..."
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
            />
          </div>
          <button onClick={handleSearch} style={styles.searchBtn}>Search</button>
        </div>
      </div>

      {/* Account Tabs */}
      <div style={styles.tabRow}>
        {accounts.map(acc => {
          const s = ACCT_STATUS[acc.status] || ACCT_STATUS["SAFE"];
          const active = selected.id === acc.id;
          return (
            <div
              key={acc.id}
              onClick={() => { setSelected(acc); setShowAI(false); }}
              style={{
                ...styles.tab,
                color: active ? s.color : "#008800",
                background: active ? s.bg : "transparent",
                borderBottom: active ? `2px solid ${s.color}` : "2px solid transparent",
                boxShadow: active ? `inset 0 0 20px ${s.glow}` : "none",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700 }}>{acc.name}</div>
              <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", opacity: 0.7, marginTop: 2 }}>{acc.id}</div>
            </div>
          );
        })}
      </div>

      {/* Profile Card */}
      <div style={styles.profileCard}>
        <div style={{ ...styles.profileGlow, background: sc.color }} />

        <div style={styles.profileLeft}>
          <div style={{
            ...styles.bigAvatar,
            boxShadow: `0 0 24px ${sc.color}66, 0 0 60px ${sc.color}22`,
            borderColor: sc.color,
          }}>
            {selected.name.charAt(0)}
          </div>
          <div>
            <div style={styles.profileName}>{selected.name}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6 }}>
              {[
                { icon: "📧", val: selected.email },
                { icon: "📱", val: selected.phone },
                { icon: "📍", val: selected.location },
                { icon: "🪪", val: selected.id, mono: true },
              ].map(d => (
                <div key={d.val} style={{ fontSize: 12, color: "#8499b8", display: "flex", gap: 6 }}>
                  <span>{d.icon}</span>
                  <span style={d.mono ? { fontFamily: "'JetBrains Mono', monospace", color: "#88ff88", fontSize: 11 } : {}}>
                    {d.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gauges */}
        <div style={styles.gaugesRow}>
          <ScoreGauge score={selected.cyberScore} label="CYBER RISK" color="#88ff88" />
          <div style={{ width: 1, background: "#1e2d47", alignSelf: "stretch", margin: "8px 0" }} />
          <ScoreGauge score={selected.transactionScore} label="TXN RISK" color="#ffffff" />
          <div style={{ width: 1, background: "#1e2d47", alignSelf: "stretch", margin: "8px 0" }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{
              ...styles.statusChip,
              background: sc.bg, color: sc.color,
              border: `1px solid ${sc.color}55`,
              boxShadow: `0 0 16px ${sc.glow}`,
            }}>
              {selected.status}
            </div>
            <div style={{ fontSize: 10, color: "#008800" }}>Account Status</div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, color: sc.color,
              background: sc.bg, padding: "4px 12px", borderRadius: 20,
            }}>
              Combined: <strong>{combinedRisk}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* AI Report Button */}
      <button onClick={() => setShowAI(s => !s)} style={{
        ...styles.aiBtn,
        background: showAI
          ? "linear-gradient(135deg, #ffffff33, #88ff8822)"
          : "linear-gradient(135deg, #ffffff14, #88ff880a)",
        borderColor: showAI ? "#ffffff" : "#ffffff44",
        color: showAI ? "#ffffff" : "#ffffff",
        marginBottom: 20,
      }}>
        <span style={{ fontSize: 16 }}>🤖</span>
        {showAI ? "Hide AI Investigation Report" : "Generate AI Investigation Report"}
        <span style={{ marginLeft: "auto", fontSize: 11, color: "#008800" }}>Powered by Gemini</span>
      </button>

      {showAI && (
        <div style={styles.aiCard}>
          <div style={styles.aiHeader}>
            <span style={{ color: "#ffffff", fontSize: 13, fontWeight: 700 }}>🤖 AI Investigation Report</span>
            <span style={{ fontSize: 10, color: "#008800", fontFamily: "'JetBrains Mono', monospace" }}>
              Gemini API · {new Date().toLocaleTimeString()}
            </span>
          </div>
          <div style={styles.aiText}>{selected.aiReport}</div>
          <div style={styles.aiBadge}>
            <span style={styles.aiBadgeItem}>[!] CONFIDENCE: HIGH</span>
            <span style={styles.aiBadgeItem}>ACCOUNT: {selected.id}</span>
            <span style={styles.aiBadgeItem}>COMBINED SCORE: {combinedRisk}/100</span>
          </div>
        </div>
      )}

      {/* Timeline + Transactions */}
      <div style={styles.bottomGrid}>
        {/* Timeline */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>🕐 Event Timeline</div>
          <div style={styles.timeline}>
            {selected.timeline.map((ev, i) => {
              const cfg = TYPE_CFG[ev.type];
              const nextCfg = i < selected.timeline.length - 1 ? TYPE_CFG[selected.timeline[i + 1].type] : null;
              return (
                <div key={i} style={styles.timelineRow}>
                  <div style={styles.timelineAxis}>
                    <div style={{
                      ...styles.dot,
                      background: cfg.color,
                      boxShadow: `0 0 8px ${cfg.color}, 0 0 16px ${cfg.color}66`,
                    }} />
                    {nextCfg && (
                      <div style={{
                        ...styles.line,
                        background: `linear-gradient(to bottom, ${cfg.color}66, ${nextCfg.color}33)`,
                      }} />
                    )}
                  </div>
                  <div style={{
                    ...styles.timelineCard,
                    background: cfg.bg,
                    borderLeft: `2px solid ${cfg.color}`,
                  }}>
                    <div style={{ fontSize: 10, color: cfg.color, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, marginBottom: 3 }}>
                      {ev.time}
                    </div>
                    <div style={{ fontSize: 12, color: "#c0cfe0" }}>{ev.event}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transactions */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>💸 Recent Transactions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {selected.transactions.map(txn => (
              <div key={txn.id} className="hover-card" style={styles.txnCard}>
                <div style={styles.txnTop}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#3a5070" }}>
                    {txn.id}
                  </span>
                  <span style={{
                    fontSize: 9, fontWeight: 800,
                    color: RISK_COLOR[txn.risk] || "#8499b8",
                    background: (RISK_COLOR[txn.risk] || "#8499b8") + "18",
                    padding: "2px 8px", borderRadius: 20,
                  }}>{txn.risk}</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#ffffff", fontFamily: "'JetBrains Mono', monospace", marginBottom: 2 }}>
                  {txn.amount}
                </div>
                <div style={{ fontSize: 12, color: "#008800", marginBottom: 8 }}>→ {txn.receiver}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: "#3a5070", fontFamily: "'JetBrains Mono', monospace" }}>
                    🕐 {txn.time}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 800,
                    color: STATUS_COLOR[txn.status] || "#8499b8",
                    background: (STATUS_COLOR[txn.status] || "#8499b8") + "18",
                    padding: "2px 10px", borderRadius: 20,
                  }}>{txn.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: "28px 32px", minHeight: "100%", animation: "fadeIn 0.4s ease" },
  breadcrumb: { fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#3a5070", letterSpacing: "0.15em", marginBottom: 8 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  heading: { fontSize: 32, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.5px", marginBottom: 6 },
  sub: { color: "#008800", fontSize: 13 },
  searchRow: { display: "flex", gap: 8, alignItems: "center" },
  searchWrap: { position: "relative", display: "flex", alignItems: "center" },
  searchIcon: { position: "absolute", left: 12, fontSize: 18, color: "#008800", pointerEvents: "none" },
  input: { background: "#0a0f1a", border: "1px solid #1e2d47", borderRadius: 10, padding: "10px 14px 10px 36px", color: "#ffffff", fontSize: 12, outline: "none", width: 240, fontFamily: "Inter, sans-serif" },
  searchBtn: { background: "linear-gradient(135deg, #ffffff, #88ff88)", border: "none", color: "#fff", padding: "10px 20px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "Inter, sans-serif" },
  tabRow: { display: "flex", gap: 2, borderBottom: "1px solid #1e2d47", marginBottom: 20 },
  tab: { padding: "10px 22px", cursor: "pointer", transition: "all 0.2s", borderRadius: "8px 8px 0 0" },
  profileCard: { position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #0a0f1a, #0f1623)", border: "1px solid #1e2d47", borderRadius: 16, padding: "28px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  profileGlow: { position: "absolute", top: -60, left: -30, width: 200, height: 200, borderRadius: "50%", filter: "blur(70px)", opacity: 0.08, pointerEvents: "none" },
  profileLeft: { display: "flex", gap: 20, alignItems: "center" },
  bigAvatar: { width: 70, height: 70, borderRadius: "50%", background: "linear-gradient(135deg, #88ff88, #ffffff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 900, color: "#0a0f1a", border: "2px solid", flexShrink: 0 },
  profileName: { fontSize: 22, fontWeight: 800, color: "#ffffff" },
  gaugesRow: { display: "flex", gap: 28, alignItems: "center" },
  statusChip: { fontSize: 12, fontWeight: 800, padding: "8px 18px", borderRadius: 30, letterSpacing: "0.05em" },
  aiBtn: { display: "flex", alignItems: "center", gap: 10, width: "100%", border: "1px solid", borderRadius: 12, padding: "14px 20px", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 700, transition: "all 0.25s" },
  aiCard: { background: "linear-gradient(135deg, #0a0f1a, #0f0a1a)", border: "1px solid #ffffff33", borderRadius: 14, padding: "20px 22px", marginBottom: 20 },
  aiHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid #1e2d47" },
  aiText: { fontSize: 13, lineHeight: 1.8, color: "#8499b8", marginBottom: 14 },
  aiBadge: { display: "flex", gap: 12, flexWrap: "wrap" },
  aiBadgeItem: { fontSize: 10, color: "#008800", fontFamily: "'JetBrains Mono', monospace", background: "#0a0f1a", border: "1px solid #1e2d47", padding: "3px 10px", borderRadius: 20 },
  bottomGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  section: { background: "linear-gradient(135deg, #0a0f1a, #0f1623)", border: "1px solid #1e2d47", borderRadius: 14, padding: "20px" },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: "#ffffff", marginBottom: 18 },
  timeline: { display: "flex", flexDirection: "column" },
  timelineRow: { display: "flex", gap: 12 },
  timelineAxis: { display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 4 },
  dot: { width: 10, height: 10, borderRadius: "50%", flexShrink: 0 },
  line: { width: 2, flex: 1, margin: "4px 0", minHeight: 16, borderRadius: 2 },
  timelineCard: { flex: 1, padding: "8px 12px", borderRadius: 8, marginBottom: 8 },
  txnCard: { background: "#0a0f1a", border: "1px solid #1e2d47", borderRadius: 10, padding: "14px" },
  txnTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
};
