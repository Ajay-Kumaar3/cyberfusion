import React, { useState } from "react";

const transactions = [
  { id: "TXN-4821", user: "Ajay K.", accountId: "ACC-4821", amount: 85000, receiver: "Unknown ACC-9999", time: "12:15 PM", date: "Today", category: "Transfer", avgAmount: 12000, timeFlag: false, newReceiver: true, transactionScore: 91, cyberScore: 87, status: "Blocked", flags: ["10x Avg Amount", "New Receiver", "Post Compromise"] },
  { id: "TXN-3317", user: "Priya S.", accountId: "ACC-3317", amount: 40000, receiver: "Unknown ACC-5544", time: "02:41 PM", date: "Today", category: "Transfer", avgAmount: 8000, timeFlag: false, newReceiver: true, transactionScore: 82, cyberScore: 74, status: "Blocked", flags: ["5x Avg Amount", "New Receiver"] },
  { id: "TXN-1155A", user: "Sneha R.", accountId: "ACC-1155", amount: 25000, receiver: "Crypto Exchange XYZ", time: "01:20 PM", date: "Today", category: "Crypto", avgAmount: 5000, timeFlag: false, newReceiver: true, transactionScore: 88, cyberScore: 90, status: "Blocked", flags: ["5x Avg Amount", "Crypto Transfer", "VPN Active"] },
  { id: "TXN-1155B", user: "Sneha R.", accountId: "ACC-1155", amount: 18000, receiver: "Crypto Exchange XYZ", time: "01:22 PM", date: "Today", category: "Crypto", avgAmount: 5000, timeFlag: false, newReceiver: false, transactionScore: 75, cyberScore: 90, status: "Flagged", flags: ["Rapid Repeat", "2 min after TXN-1155A"] },
  { id: "TXN-9042", user: "Ravi M.", accountId: "ACC-9042", amount: 3200, receiver: "Amazon Pay", time: "03:10 AM", date: "Today", category: "Shopping", avgAmount: 2800, timeFlag: true, newReceiver: false, transactionScore: 58, cyberScore: 61, status: "Flagged", flags: ["Unusual Hour (3AM)"] },
  { id: "TXN-7723", user: "Karan T.", accountId: "ACC-7723", amount: 15000, receiver: "ICICI Bank ACC-3345", time: "10:30 AM", date: "Today", category: "Transfer", avgAmount: 3500, timeFlag: false, newReceiver: true, transactionScore: 60, cyberScore: 45, status: "Flagged", flags: ["4x Avg Amount", "New Receiver"] },
  { id: "TXN-2201", user: "Divya N.", accountId: "ACC-2201", amount: 1200, receiver: "Swiggy", time: "08:15 PM", date: "Today", category: "Food", avgAmount: 800, timeFlag: false, newReceiver: false, transactionScore: 10, cyberScore: 12, status: "Cleared", flags: [] },
  { id: "TXN-6610", user: "Meena V.", accountId: "ACC-6610", amount: 500, receiver: "Netflix", time: "09:00 AM", date: "Today", category: "Subscription", avgAmount: 500, timeFlag: false, newReceiver: false, transactionScore: 8, cyberScore: 78, status: "Cleared", flags: [] },
];

const STATUS = {
  Blocked: { color: "var(--danger)", bg: "rgba(0, 255, 136, 0.1)", icon: "🚫" },
  Flagged: { color: "var(--warning)", bg: "rgba(245, 158, 11, 0.1)", icon: "[!]️" },
  Cleared: { color: "var(--success)", bg: "rgba(16, 185, 129, 0.1)", icon: "✅" },
};
const FLAG_COLORS = ["var(--accent)", "var(--warning)", "var(--special)", "var(--info)", "var(--success)"];
const CAT_ICONS = { Transfer: "🏦", Crypto: "₿", Shopping: "🛍️", Food: "🍔", Subscription: "📺", Other: "💳" };
const CAT_COLORS = { Transfer: "var(--accent)", Crypto: "var(--accent-secondary)", Shopping: "var(--info)", Food: "var(--warning)", Subscription: "var(--success)", Other: "#94a3b8" };

function ScoreBar({ score, color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 9, color: "var(--text-muted)", width: 55, fontWeight: 700, letterSpacing: "0.04em" }}>{label}</span>
      <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${score}%`, borderRadius: 4,
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
          boxShadow: `0 0 6px ${color}44`,
        }} />
      </div>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, color, minWidth: 20 }}>{score}</span>
    </div>
  );
}

export default function TransactionAnalyzer() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const [selected, setSelected] = useState(null);
  const filters = ["All", "Blocked", "Flagged", "Cleared"];

  let filtered = transactions.filter(t => {
    const mf = filter === "All" || t.status === filter;
    const ms = t.user.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase()) || t.receiver.toLowerCase().includes(search.toLowerCase());
    return mf && ms;
  });
  if (sortBy === "score") filtered = [...filtered].sort((a, b) => b.transactionScore - a.transactionScore);
  if (sortBy === "amount") filtered = [...filtered].sort((a, b) => b.amount - a.amount);

  const blocked = transactions.filter(t => t.status === "Blocked");
  const blockedAmt = blocked.reduce((s, t) => s + t.amount, 0);

  return (
    <div style={styles.page} className="grid-bg">
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.breadcrumb}>CYBERFUSION LITE &nbsp;/&nbsp; TRANSACTION ANALYZER</div>
          <h1 style={styles.heading}>
            Transaction <span style={{ color: "#ffffff" }}>Analyzer</span>
          </h1>
          <p style={styles.sub}>Real-time financial anomaly detection & risk scoring</p>
        </div>
        <div style={styles.controls}>
          <div style={styles.searchWrap}>
            <span style={styles.searchIcon}>⌕</span>
            <input style={styles.input} placeholder="Search transaction..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select style={styles.select} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="score">↓ Risk Score</option>
            <option value="amount">↓ Amount</option>
          </select>
        </div>
      </div>

      {/* Summary Banner */}
      <div style={styles.summaryBanner}>
        {[
          { icon: "🚫", val: blocked.length, label: "Blocked", sub: `₹${blockedAmt.toLocaleString()} saved`, color: "var(--danger)" },
          { icon: "[!]️", val: transactions.filter(t => t.status === "Flagged").length, label: "Flagged", sub: "Under review", color: "var(--warning)" },
          { icon: "✅", val: transactions.filter(t => t.status === "Cleared").length, label: "Cleared", sub: "Normal activity", color: "var(--success)" },
          { icon: "🛡️", val: `₹${blockedAmt.toLocaleString()}`, label: "Protected", sub: "Fraud prevented", color: "var(--accent)" },
        ].map((s, i) => (
          <div key={i} className="hover-card" style={{ ...styles.summaryCard, borderColor: 'rgba(255,255,255,0.06)' }}>
            <div style={{ ...styles.summaryOrb, background: s.color }} />
            <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: typeof s.val === 'string' ? 16 : 30, fontWeight: 900, color: '#fff', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1, marginBottom: 4 }}>{s.val}</div>
            <div style={{ fontSize: 11, color: s.color, fontWeight: 700, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={styles.tabBar}>
        <div style={styles.tabs}>
          {filters.map(f => {
            const cfg = f !== "All" ? STATUS[f] : { color: "var(--accent)" };
            return (
              <button key={f} onClick={() => setFilter(f)} style={{
                ...styles.tab,
                color: filter === f ? cfg.color : "var(--text-muted)",
                background: filter === f ? "rgba(255,255,255,0.03)" : "transparent",
                borderBottom: filter === f ? `2px solid ${cfg.color}` : "2px solid transparent",
              }}>{f}</button>
            );
          })}
        </div>
        <span style={styles.resultCount}>{filtered.length} transactions</span>
      </div>

      {/* Cards Grid */}
      <div style={styles.grid}>
        {filtered.map((txn, i) => {
          const cfg = STATUS[txn.status];
          const mult = (txn.amount / txn.avgAmount).toFixed(1);
          const isOpen = selected?.id === txn.id;
          const catColor = CAT_COLORS[txn.category] ?? "#8499b8";
          return (
            <div
              key={txn.id}
              onClick={() => setSelected(isOpen ? null : txn)}
              style={{
                ...styles.card,
                borderColor: isOpen ? cfg.color : "rgba(255,255,255,0.05)",
                boxShadow: isOpen ? `0 12px 40px -12px ${cfg.color}44` : "none",
                animationDelay: `${i * 50}ms`,
                cursor: "pointer",
              }}
              className="hover-card"
            >
              {/* Top bar */}
              <div style={{ ...styles.topBar, background: cfg.color, boxShadow: `0 0 12px ${cfg.color}`, width: `${txn.transactionScore}%` }} />

              <div style={styles.cardInner}>
                {/* Header */}
                <div style={styles.cardHead}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ ...styles.catBadge, color: catColor, background: catColor + "18", border: `1px solid ${catColor}33` }}>
                      {CAT_ICONS[txn.category] ?? "💳"}
                    </div>
                    <div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#3a5070", marginBottom: 2 }}>{txn.id}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#ffffff" }}>{txn.user} · <span style={{ color: "#3a5070" }}>{txn.accountId}</span></div>
                    </div>
                  </div>
                  <span style={{ ...styles.statusBadge, color: cfg.color, background: cfg.bg }}>
                    {cfg.icon} {txn.status}
                  </span>
                </div>

                {/* Amount */}
                <div style={styles.amountRow}>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#ffffff", fontFamily: "'JetBrains Mono', monospace" }}>
                    ₹{txn.amount.toLocaleString()}
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: 800,
                    color: parseFloat(mult) >= 3 ? "#ffffff" : "#ffffff",
                    background: parseFloat(mult) >= 3 ? "#ffffff18" : "#ffffff18",
                    padding: "3px 10px", borderRadius: 20,
                  }}>{mult}× avg</div>
                </div>

                <div style={styles.receiver}>→ <span style={{ color: "#8499b8" }}>{txn.receiver}</span></div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#3a5070", marginBottom: 12 }}>
                  {txn.time} · {txn.date} · {txn.category}
                </div>

                {/* Risk Scores */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                  <ScoreBar score={txn.transactionScore} color="var(--accent)" label="GLOBAL RISK" />
                  <ScoreBar score={txn.cyberScore} color="var(--accent-secondary)" label="BEHAVIOR" />
                </div>

                {/* Flags */}
                {txn.flags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {txn.flags.map((f, fi) => (
                      <span key={fi} style={{
                        fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                        color: FLAG_COLORS[fi % FLAG_COLORS.length],
                        background: FLAG_COLORS[fi % FLAG_COLORS.length] + "18",
                        border: `1px solid ${FLAG_COLORS[fi % FLAG_COLORS.length]}33`,
                      }}>{f}</span>
                    ))}
                  </div>
                )}

                {/* Expanded */}
                {isOpen && (
                  <div style={styles.expanded}>
                    <div style={styles.expandTitle}>🔍 Investigation Detail</div>
                    <div style={styles.detailGrid}>
                      {[
                        { label: "Avg Monthly", val: `₹${txn.avgAmount.toLocaleString()}`, color: "#008800" },
                        { label: "This Transfer", val: `₹${txn.amount.toLocaleString()}`, color: "#ffffff" },
                        { label: "New Receiver", val: txn.newReceiver ? "Yes [!]" : "No ✓", color: txn.newReceiver ? "#ffffff" : "#00ff00" },
                        { label: "Unusual Time", val: txn.timeFlag ? "Yes [!]" : "No ✓", color: txn.timeFlag ? "#ffffff" : "#00ff00" },
                      ].map(d => (
                        <div key={d.label} style={styles.detailItem}>
                          <div style={{ fontSize: 10, color: "#008800", marginBottom: 3 }}>{d.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: d.color, fontFamily: "'JetBrains Mono', monospace" }}>{d.val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: "28px 32px", minHeight: "100%", animation: "fadeIn 0.4s ease" },
  breadcrumb: { fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "var(--text-muted)", letterSpacing: "0.15em", marginBottom: 8 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  heading: { fontSize: 32, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.5px", marginBottom: 6 },
  sub: { color: "var(--accent-secondary)", fontSize: 13, fontWeight: 500 },
  controls: { display: "flex", gap: 10, alignItems: "center" },
  searchWrap: { position: "relative", display: "flex", alignItems: "center" },
  searchIcon: { position: "absolute", left: 12, fontSize: 18, color: "var(--accent)", pointerEvents: "none" },
  input: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 14px 10px 36px", color: "#ffffff", fontSize: 12, outline: "none", width: 220, fontFamily: "Inter, sans-serif" },
  select: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 14px", color: "#ffffff", fontSize: 12, outline: "none", cursor: "pointer", fontFamily: "Inter, sans-serif" },
  summaryBanner: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 },
  summaryCard: { position: "relative", overflow: "hidden", background: "rgba(24, 7, 7, 0.4)", border: "1px solid", borderRadius: 16, padding: "18px 20px" },
  summaryOrb: { position: "absolute", top: -30, right: -20, width: 70, height: 70, borderRadius: "50%", filter: "blur(40px)", opacity: 0.1 },
  tabBar: { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: 20 },
  tabs: { display: "flex", gap: 2 },
  tab: { padding: "12px 20px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, borderRadius: "8px 8px 0 0", transition: "all 0.2s", fontFamily: "'Space Grotesk', sans-serif" },
  resultCount: { fontSize: 10, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", paddingBottom: 10 },
  grid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 },
  card: { position: "relative", background: "rgba(24, 7, 7, 0.3)", border: "1px solid", borderRadius: 16, overflow: "hidden", transition: "all 0.25s ease", animation: "fadeInUp 0.4s ease both" },
  topBar: { height: 3, transition: "width 0.8s ease" },
  cardInner: { padding: "16px" },
  cardHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  catBadge: { width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 },
  statusBadge: { fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 20, textTransform: 'uppercase' },
  amountRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 6 },
  receiver: { fontSize: 12, color: "var(--accent-secondary)", marginBottom: 6, fontWeight: 500 },
  expanded: { marginTop: 14, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 14, animation: "fadeInUp 0.3s ease" },
  expandTitle: { color: "var(--accent)", fontSize: 11, fontWeight: 800, marginBottom: 12, textTransform: 'uppercase' },
  detailGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  detailItem: { background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "10px 12px", border: '1px solid rgba(255,255,255,0.03)' },
};
