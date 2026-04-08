import React, { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import { fetchAccounts, fetchAccount } from "../api/api";
import GeminiPanel from "../components/GeminiPanel";
import GlassCard from "../components/GlassCard";

const TYPE_CFG = {
  safe:    { color: "#00FF41", bg: "#00FF4112" },
  warning: { color: "#FFAA00", bg: "#FFAA0012" },
  danger:  { color: "#FF3366", bg: "#FF336612" },
  alert:   { color: "#FF3366", bg: "#FF336612" },
};

const RISK_COLOR   = { HIGH: "#FF3366", MEDIUM: "#FFAA00", LOW: "#00FF41" };
const STATUS_COLOR = { Blocked: "#FF3366", Cleared: "#00FF41", Pending: "#7A8E7A", BLOCKED: "#FF3366", APPROVED: "#00FF41", PENDING: "#7A8E7A" };

const ACCT_STATUS = {
  COMPROMISED:  { color: "#FF3366", bg: "#FF336614", glow: "#FF336644" },
  "HIGH RISK":  { color: "#FFAA00", bg: "#FFAA0014", glow: "#FFAA0044" },
  SAFE:         { color: "#00FF41", bg: "#00FF4114", glow: "#00FF4144" },
  Flagged:      { color: "#FFAA00", bg: "#FFAA0014", glow: "#FFAA0044" },
  Frozen:       { color: "#FF3366", bg: "#FF336614", glow: "#FF336644" },
  Normal:       { color: "#00FF41", bg: "#00FF4114", glow: "#00FF4144" },
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
      <div style={{ fontSize: 10, color: "#7A8E7A", marginTop: 6, fontWeight: 600, letterSpacing: "0.05em" }}>{label}</div>
    </div>
  );
}

export default function AccountInvestigation() {
  const { data: accountsRaw, loading: loadingList } = useApi(fetchAccounts);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchId, setSearchId] = useState("");
  const [showAI, setShowAI] = useState(false);
  const [triggerAI, setTriggerAI] = useState(0);

  const accounts = accountsRaw || [];

  useEffect(() => {
     if (accounts.length > 0 && !selectedId) {
         setSelectedId(accounts[0].account_id);
     }
  }, [accounts, selectedId]);

  useEffect(() => {
    if (selectedId) {
        setLoadingDetail(true);
        fetchAccount(selectedId)
            .then(data => {
                setDetail(data);
                setLoadingDetail(false);
            })
            .catch(err => {
                console.error(err);
                setLoadingDetail(false);
            });
    }
  }, [selectedId]);

  const handleSearch = () => {
    const found = accounts.find(a =>
      a.account_id.toLowerCase().includes(searchId.toLowerCase()) ||
      a.name.toLowerCase().includes(searchId.toLowerCase())
    );
    if (found) setSelectedId(found.account_id);
  };

  const selected = detail?.account;
  if (!selected && loadingList) return <div style={{ color: "#7A8E7A", padding: 40, textAlign: 'center' }}>Connecting to intelligence grid...</div>;
  if (!selected) return <div style={{ color: "#7A8E7A", padding: 40, textAlign: 'center' }}>No accounts available for investigation.</div>;

  const sc = ACCT_STATUS[selected.status] || ACCT_STATUS["SAFE"];
  const combinedRisk = selected.final_score;

  // Build timeline from login_events and alerts
  const timeline = [
    ...(detail.login_events || []).map(l => ({
        time: new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        event: `${l.event_type.replace('_', ' ').toUpperCase()} from ${l.location}`,
        type: l.cyber_risk_score > 70 ? "danger" : l.cyber_risk_score > 40 ? "warning" : "safe",
        rawTime: new Date(l.timestamp)
    })),
    ...(detail.alerts || []).map(a => ({
        time: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        event: `🚨 ALERT: ${a.description}`,
        type: "alert",
        rawTime: new Date(a.created_at)
    }))
  ].sort((a, b) => b.rawTime - a.rawTime).slice(0, 10);

  const geminiPrompt = `Perform a deep behavioral investigation for Account ${selected.account_id} (${selected.name}). 
  Risk Score: ${selected.final_score}. 
  Status: ${selected.status}. 
  Recent Events: ${timeline.map(t => t.event).join("; ")}.
  Analyze if this pattern suggests account takeover, money laundering, or legitimate use.`;

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
        {accounts.slice(0, 8).map(acc => {
          const s = ACCT_STATUS[acc.status] || ACCT_STATUS["SAFE"];
          const active = selectedId === acc.account_id;
          return (
            <div
              key={acc.account_id}
              onClick={() => { setSelectedId(acc.account_id); setShowAI(false); }}
              style={{
                ...styles.tab,
                color: active ? s.color : "#7A8E7A",
                background: active ? s.bg : "transparent",
                borderBottom: active ? `2px solid ${s.color}` : "2px solid transparent",
                boxShadow: active ? `inset 0 0 20px ${s.glow}` : "none",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700 }}>{acc.name}</div>
              <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", opacity: 0.7, marginTop: 2 }}>{acc.account_id}</div>
            </div>
          );
        })}
      </div>

      {/* Profile Card */}
      <div style={styles.profileCard}>
        {loadingDetail && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontSize: 12 }}>REFRESHING THREAT INTEL...</div>}
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
                { icon: "📱", val: selected.phone || "N/A" },
                { icon: "📍", val: selected.location || "N/A" },
                { icon: "🪪", val: selected.account_id, mono: true },
              ].map(d => (
                <div key={d.val + d.icon} style={{ fontSize: 12, color: "#8499b8", display: "flex", gap: 6 }}>
                  <span>{d.icon}</span>
                  <span style={d.mono ? { fontFamily: "'JetBrains Mono', monospace", color: "#00FF41", fontSize: 11 } : {}}>
                    {d.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gauges */}
        <div style={styles.gaugesRow}>
          <ScoreGauge score={selected.cyber_score} label="CYBER RISK" color="#00FF41" />
          <div style={{ width: 1, background: "#1e2d47", alignSelf: "stretch", margin: "8px 0" }} />
          <ScoreGauge score={selected.txn_score} label="TXN RISK" color="#ffffff" />
          <div style={{ width: 1, background: "#1e2d47", alignSelf: "stretch", margin: "8px 0" }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{
              ...styles.statusChip,
              background: sc.bg, color: sc.color,
              border: `1px solid ${sc.color}55`,
              boxShadow: `0 0 16px ${sc.glow}`,
            }}>
              {selected.status.toUpperCase()}
            </div>
            <div style={{ fontSize: 10, color: "#7A8E7A" }}>Account Status</div>
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
      <button onClick={() => { setShowAI(true); setTriggerAI(Date.now()); }} style={{
        ...styles.aiBtn,
        background: showAI
          ? "linear-gradient(135deg, #ffffff33, #00FF4122)"
          : "linear-gradient(135deg, #ffffff14, #00FF410a)",
        borderColor: showAI ? "#ffffff" : "#ffffff44",
        color: showAI ? "#ffffff" : "#ffffff",
        marginBottom: 20,
      }}>
        <span style={{ fontSize: 16 }}>🤖</span>
        {showAI ? "Regenerate AI Investigation" : "Generate AI Investigation Report"}
        <span style={{ marginLeft: "auto", fontSize: 11, color: "#7A8E7A" }}>Powered by Gemini</span>
      </button>

      {showAI && (
        <GeminiPanel 
            title={`AI INVESTIGATION: ${selected.account_id}`}
            prompt={geminiPrompt}
            trigger={triggerAI}
            dataContext={detail}
            style={{ marginBottom: 24 }}
        />
      )}

      {/* Timeline + Transactions */}
      <div style={styles.bottomGrid}>
        {/* Timeline */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>🕐 Behavioral Timeline (Recent)</div>
          <div style={styles.timeline}>
            {timeline.length > 0 ? timeline.map((ev, i) => {
              const cfg = TYPE_CFG[ev.type] || TYPE_CFG.warning;
              const nextCfg = i < timeline.length - 1 ? (TYPE_CFG[timeline[i + 1].type] || TYPE_CFG.warning) : null;
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
            }) : <div style={{ color: '#7A8E7A', fontSize: 12 }}>No recent events logged.</div>}
          </div>
        </div>

        {/* Transactions */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>💸 Observed Cash Flow</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {detail.transactions && detail.transactions.length > 0 ? detail.transactions.map(txn => (
              <div key={txn.txn_id} className="hover-card" style={styles.txnCard}>
                <div style={styles.txnTop}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#3a5070" }}>
                    {txn.txn_id}
                  </span>
                  <span style={{
                    fontSize: 9, fontWeight: 800,
                    color: RISK_COLOR[txn.final_score > 70 ? 'HIGH' : txn.final_score > 40 ? 'MEDIUM' : 'LOW'],
                    background: (RISK_COLOR[txn.final_score > 70 ? 'HIGH' : txn.final_score > 40 ? 'MEDIUM' : 'LOW']) + "18",
                    padding: "2px 8px", borderRadius: 20,
                  }}>{txn.final_score > 70 ? 'HIGH' : txn.final_score > 40 ? 'MEDIUM' : 'LOW'}</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#ffffff", fontFamily: "'JetBrains Mono', monospace", marginBottom: 2 }}>
                  ₹{Number(txn.amount).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: 12, color: "#7A8E7A", marginBottom: 8 }}>→ {txn.receiver_name || txn.to_account}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: "#3a5070", fontFamily: "'JetBrains Mono', monospace" }}>
                    🕐 {new Date(txn.created_at).toLocaleTimeString()}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 800,
                    color: STATUS_COLOR[txn.status] || "#8499b8",
                    background: (STATUS_COLOR[txn.status] || "#8499b8") + "18",
                    padding: "2px 10px", borderRadius: 20,
                  }}>{txn.status}</span>
                </div>
              </div>
            )) : <div style={{ color: '#7A8E7A', fontSize: 12 }}>No recent transactions.</div>}
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
  sub: { color: "#7A8E7A", fontSize: 13 },
  searchRow: { display: "flex", gap: 8, alignItems: "center" },
  searchWrap: { position: "relative", display: "flex", alignItems: "center" },
  searchIcon: { position: "absolute", left: 12, fontSize: 18, color: "#7A8E7A", pointerEvents: "none" },
  input: { background: "#0a0f1a", border: "1px solid #1e2d47", borderRadius: 10, padding: "10px 14px 10px 36px", color: "#ffffff", fontSize: 12, outline: "none", width: 240, fontFamily: "Inter, sans-serif" },
  searchBtn: { background: "linear-gradient(135deg, #ffffff, #00FF41)", border: "none", color: "#1a1a1a", padding: "10px 20px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "Inter, sans-serif" },
  tabRow: { display: "flex", gap: 2, borderBottom: "1px solid #1e2d47", marginBottom: 20 },
  tab: { padding: "10px 22px", cursor: "pointer", transition: "all 0.2s", borderRadius: "8px 8px 0 0" },
  profileCard: { position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #0a0f1a, #0f1623)", border: "1px solid #1e2d47", borderRadius: 16, padding: "28px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  profileGlow: { position: "absolute", top: -60, left: -30, width: 200, height: 200, borderRadius: "50%", filter: "blur(70px)", opacity: 0.08, pointerEvents: "none" },
  profileLeft: { display: "flex", gap: 20, alignItems: "center" },
  bigAvatar: { width: 70, height: 70, borderRadius: "50%", background: "linear-gradient(135deg, #00FF41, #ffffff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 900, color: "#0a0f1a", border: "2px solid", flexShrink: 0 },
  profileName: { fontSize: 22, fontWeight: 800, color: "#ffffff" },
  gaugesRow: { display: "flex", gap: 28, alignItems: "center" },
  statusChip: { fontSize: 12, fontWeight: 800, padding: "8px 18px", borderRadius: 30, letterSpacing: "0.05em" },
  aiBtn: { display: "flex", alignItems: "center", gap: 10, width: "100%", border: "1px solid", borderRadius: 12, padding: "14px 20px", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 700, transition: "all 0.25s" },
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
