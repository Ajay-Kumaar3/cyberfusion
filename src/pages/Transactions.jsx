import React, { useState, useEffect } from "react";
import GlassCard from "../components/GlassCard";
import { fetchTransactions } from "../api/api";
import { Zap, MapPin, AlertTriangle } from "lucide-react";

const statusDisplay = {
    "ON_HOLD": { label: "BLOCKED", color: "#ff4444" },
    "REVIEW": { label: "FLAGGED", color: "#ffcc00" },
    "APPROVED": { label: "CLEARED", color: "#00ff88" },
    "BLOCKED": { label: "BLOCKED", color: "#ff4444" },
    "PENDING": { label: "PENDING", color: "#aaaaaa" },
};

export default function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);
    const [filter, setFilter] = useState("ALL");

    useEffect(() => {
        fetchTransactions({ limit: 100 })
            .then(setTransactions)
            .catch(err => console.error("Transactions API error:", err))
            .finally(() => setLoading(false));
    }, []);

    const filtered = transactions.filter(t => {
        if (filter === "ALL") return true;
        if (filter === "SUSPICIOUS") return t.final_score >= 55;
        if (filter === "FLAGGED") return t.status === "REVIEW" || t.status === "ON_HOLD";
        if (filter === "BLOCKED") return t.status === "ON_HOLD" || t.status === "BLOCKED";
        if (filter === "CLEARED") return t.status === "APPROVED";
        return true;
    });

    const formatAmount = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    const formatTime = (ts) => ts ? new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : "—";
    const parseFlags = (f) => { try { return JSON.parse(f || "[]"); } catch { return []; } };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: '#008800', fontSize: 18, fontFamily: "'JetBrains Mono', monospace" }}>
            Loading transactions from database...
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Filters */}
            <GlassCard style={{ padding: '12px 24px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#008800', fontWeight: 600 }}>FLOW FILTERS:</span>
                {['ALL', 'SUSPICIOUS', 'FLAGGED', 'BLOCKED', 'CLEARED'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? '#88ff8822' : 'transparent', border: filter === f ? '1px solid #88ff88' : '1px solid rgba(255,255,255,0.1)', color: filter === f ? '#88ff88' : '#008800', padding: '6px 16px', borderRadius: 20, fontSize: 11, fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}>
                        {f}
                    </button>
                ))}
                <span style={{ marginLeft: 'auto', fontSize: 12, color: '#008800' }}>
                    {filtered.length} transactions
                </span>
            </GlassCard>

            {/* SVG Flow Diagram */}
            <GlassCard style={{ padding: 24, overflow: 'hidden', position: 'relative' }}>
                <h3 style={{ fontSize: 14, color: '#ffffff', marginBottom: 20 }}>MONEY FLOW (LAST 24 HOURS)</h3>
                <div style={{ height: 200, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: 140, right: 140, bottom: 0, zIndex: 0 }}>
                        <svg width="100%" height="100%">
                            <path d="M 0 100 Q 150 20 300 100 T 600 100" fill="transparent" stroke="rgba(255,255,255,0.5)" strokeWidth="4" strokeDasharray="10 10" />
                            <path d="M 0 100 Q 150 180 300 100 T 600 100" fill="transparent" stroke="rgba(205,255,205,0.5)" strokeWidth="4" strokeDasharray="10 10" />
                            <style>{`path { animation: flow 20s linear infinite; } @keyframes flow { to { stroke-dashoffset: -1000; } }`}</style>
                        </svg>
                    </div>
                    {[
                        { title: "Sources", items: transactions.slice(0, 2).map(t => t.from_account), color: "#88ff88" },
                        { title: "Aggregator (Mules)", items: transactions.filter(t => t.final_score >= 70).slice(0, 2).map(t => t.txn_id?.slice(0, 10)), color: "#cdffcd" },
                        { title: "Exit Points", items: ["Crypto Exch", "Wire Transfer"], color: "#ffffff" }
                    ].map((col, idx) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 10, zIndex: 1, alignItems: 'center' }}>
                            <div style={{ fontSize: 11, color: '#008800', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 8 }}>{col.title.toUpperCase()}</div>
                            {col.items.map((item, i) => (
                                <div key={i} style={{ background: 'rgba(0,12,0,0.9)', border: `1px solid ${col.color}44`, padding: '12px 24px', borderRadius: 8, fontSize: 13, fontWeight: 'bold', color: '#ffffff', boxShadow: `0 0 20px ${col.color}22` }}>
                                    {item || "—"}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </GlassCard>

            {/* Table */}
            <GlassCard style={{ padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            {['TXN ID', 'AMOUNT', 'FROM', 'TO', 'TIME', 'RISK', 'STATUS', ''].map(h => (
                                <th key={h} style={{ padding: '16px 20px', fontSize: 11, color: '#008800', fontWeight: 600, letterSpacing: '0.05em' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((t) => {
                            const sd = statusDisplay[t.status] || { label: t.status, color: '#aaaaaa' };
                            const flags = parseFlags(t.flags);
                            return (
                                <React.Fragment key={t.txn_id}>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: expanded === t.txn_id ? 'rgba(0,255,0,0.02)' : 'transparent', transition: 'all 0.2s', cursor: 'pointer' }}
                                        onClick={() => setExpanded(expanded === t.txn_id ? null : t.txn_id)}>
                                        <td style={{ padding: '16px 20px', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#88ff88', fontWeight: 700 }}>{t.txn_id}</td>
                                        <td style={{ padding: '16px 20px', fontFamily: "'JetBrains Mono', monospace", fontSize: 15, color: '#ffffff', fontWeight: 800 }}>{formatAmount(t.amount)}</td>
                                        <td style={{ padding: '16px 20px', fontSize: 12, color: '#00aa00' }}>{t.from_account}</td>
                                        <td style={{ padding: '16px 20px', fontSize: 12, color: '#00aa00' }}>{t.receiver_name || t.to_account}</td>
                                        <td style={{ padding: '16px 20px', fontSize: 12, color: '#008800' }}>{formatTime(t.created_at)}</td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <div style={{ width: 40, height: 4, background: '#1e2d47', borderRadius: 2 }}>
                                                    <div style={{ width: `${t.final_score}%`, height: '100%', background: t.final_score > 75 ? '#ff4444' : t.final_score > 55 ? '#ffcc00' : '#00ff88', borderRadius: 2 }}></div>
                                                </div>
                                                <span style={{ fontSize: 11, color: t.final_score > 75 ? '#ff4444' : t.final_score > 55 ? '#ffcc00' : '#00ff88', fontWeight: 'bold' }}>{t.final_score}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <span style={{ padding: '4px 8px', borderRadius: 4, fontSize: 10, fontWeight: 'bold', background: `${sd.color}22`, color: sd.color, border: `1px solid ${sd.color}44` }}>
                                                {sd.label}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 20px', color: '#008800' }}>{expanded === t.txn_id ? '▲' : '▼'}</td>
                                    </tr>

                                    {expanded === t.txn_id && (
                                        <tr>
                                            <td colSpan="8" style={{ padding: 0 }}>
                                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: 24, borderBottom: '1px solid rgba(0, 255, 0, 0.2)', display: 'flex', gap: 32 }}>
                                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                                                        <h4 style={{ margin: 0, fontSize: 12, color: '#88ff88', display: 'flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={14} /> RISK FLAGS</h4>
                                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                            {flags.length > 0 ? flags.map(f => (
                                                                <span key={f} style={{ padding: '4px 10px', background: '#ff444422', border: '1px solid #ff444466', borderRadius: 12, fontSize: 11, color: '#ff8888', fontWeight: 'bold' }}>{f}</span>
                                                            )) : <span style={{ color: '#008800', fontSize: 12 }}>No flags</span>}
                                                        </div>
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8 }}><div style={{ fontSize: 10, color: '#008800', marginBottom: 4 }}>Category</div><div style={{ fontSize: 12, color: '#ffffff', fontFamily: "'JetBrains Mono', monospace" }}>{t.category}</div></div>
                                                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8 }}><div style={{ fontSize: 10, color: '#008800', marginBottom: 4 }}>Cyber Score at TXN</div><div style={{ fontSize: 12, color: '#ffffff', fontFamily: "'JetBrains Mono', monospace" }}>{t.cyber_score}/100</div></div>
                                                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8 }}><div style={{ fontSize: 10, color: '#008800', marginBottom: 4 }}>New Receiver</div><div style={{ fontSize: 12, color: t.new_receiver ? '#ff8888' : '#00ff88', fontWeight: 'bold' }}>{t.new_receiver ? "YES ⚠" : "No"}</div></div>
                                                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8 }}><div style={{ fontSize: 10, color: '#008800', marginBottom: 4 }}>Unusual Hour</div><div style={{ fontSize: 12, color: t.time_flag ? '#ff8888' : '#00ff88', fontWeight: 'bold' }}>{t.time_flag ? "YES ⚠" : "No"}</div></div>
                                                        </div>
                                                    </div>
                                                    <div style={{ flex: 1, borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 32 }}>
                                                        {t.status === "ON_HOLD" || t.status === "BLOCKED" ? (
                                                            <div style={{ background: '#ff444411', border: '1px solid #ff444444', padding: 16, borderRadius: 8, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                                <div style={{ fontSize: 11, color: '#ff4444', fontWeight: 'bold', marginBottom: 8 }}>TRANSACTION ON HOLD</div>
                                                                <div style={{ fontSize: 13, color: '#ffffff', marginBottom: 16 }}>Transaction blocked by risk engine. Final score: {t.final_score}/100. Funds protected.</div>
                                                                <button style={{ background: 'transparent', border: '1px solid #ff4444', color: '#ff4444', padding: '8px 16px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer', fontSize: 11 }}>VIEW AUDIT LOG</button>
                                                            </div>
                                                        ) : (
                                                            <div style={{ background: '#00ff0011', border: '1px solid #00ff0044', padding: 16, borderRadius: 8, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                                <div style={{ fontSize: 11, color: '#00ff00', fontWeight: 'bold', marginBottom: 8 }}>RECOVERABLE — REVERSAL WINDOW OPEN</div>
                                                                <div style={{ fontSize: 13, color: '#ffffff', marginBottom: 16 }}>This transaction is within the 48h reversal window under Reg E.</div>
                                                                <button style={{ background: '#00ff00', border: 'none', color: '#000', padding: '8px 16px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer', fontSize: 11 }}>REVERSE TRANSACTION NOW</button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </GlassCard>
        </div>
    );
}
