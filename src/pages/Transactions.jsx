import React, { useState, useEffect } from "react";
import GlassCard from "../components/GlassCard";
import { useApi } from "../hooks/useApi";
import { getTransactions } from "../utils/api";
import { AlertTriangle, Clock } from "lucide-react";

const statusDisplay = {
    ON_HOLD: { label: "BLOCKED", color: "#FF3366" },
    REVIEW: { label: "FLAGGED", color: "#FFAA00" },
    APPROVED: { label: "CLEARED", color: "#00CC33" },
    BLOCKED: { label: "BLOCKED", color: "#FF3366" },
    PENDING: { label: "PENDING", color: "#FFDD00" },
};

const formatWindow = (createdAt) => {
    const start = new Date(createdAt);
    const now = new Date();
    const fortyEightHours = 48 * 60 * 60 * 1000;
    const elapsed = now - start;
    const remaining = fortyEightHours - elapsed;
    
    if (remaining <= 0) return "WINDOW CLOSED";
    
    const h = Math.floor(remaining / 3600000);
    const m = Math.floor((remaining % 3600000) / 60000);
    return `${h}h ${m}m REMAINING`;
};

export default function Transactions() {
    const { data: transactionsRaw, loading, error } = useApi(getTransactions);
    const [expanded, setExpanded] = useState(null);
    const [filter, setFilter] = useState("ALL");

    const transactions = transactionsRaw || [];

    const filtered = transactions.filter(t => {
        if (filter === "ALL") return true;
        if (filter === "SUSPICIOUS") return t.final_score >= 55;
        if (filter === "FLAGGED") return t.status === "REVIEW" || t.status === "ON_HOLD";
        if (filter === "BLOCKED") return t.status === "ON_HOLD" || t.status === "BLOCKED";
        if (filter === "CLEARED") return t.status === "APPROVED";
        return true;
    });

    const fmtAmt = n => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    const fmtTime = ts => ts ? new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : "—";
    const parseFlags = f => { try { return JSON.parse(f || "[]"); } catch { return []; } };

    if (loading && !transactions.length) return (
        <div className="skeleton-pulse" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: '#7A8E7A', fontSize: 18, fontFamily: "'JetBrains Mono',monospace" }}>
            Loading transactions from Neon DB...
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <GlassCard style={{ padding: '12px 24px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#7A8E7A', fontWeight: 600 }}>FLOW FILTERS:</span>
                {['ALL', 'SUSPICIOUS', 'FLAGGED', 'BLOCKED', 'CLEARED'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? '#00FF4122' : 'transparent', border: filter === f ? '1px solid #00FF41' : '1px solid rgba(0, 255, 65, 0.15)', color: filter === f ? '#00FF41' : '#7A8E7A', padding: '6px 16px', borderRadius: 20, fontSize: 11, fontWeight: 'bold', cursor: 'pointer' }}>
                        {f}
                    </button>
                ))}
                <span style={{ marginLeft: 'auto', fontSize: 12, color: '#7A8E7A' }}>{filtered.length} transactions</span>
            </GlassCard>

            <GlassCard style={{ padding: 24, overflow: 'hidden', position: 'relative' }}>
                <h3 style={{ fontSize: 14, color: '#ffffff', marginBottom: 20 }}>MONEY FLOW (LAST 24 HOURS)</h3>
                <div style={{ height: 200, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: 140, right: 140, bottom: 0, zIndex: 0 }}>
                        <svg width="100%" height="100%">
                            <path d="M 0 100 Q 150 20 300 100 T 600 100" fill="transparent" stroke="rgba(255,255,255,0.5)" strokeWidth="4" strokeDasharray="10 10" />
                            <path d="M 0 100 Q 150 180 300 100 T 600 100" fill="transparent" stroke="rgba(205,255,205,0.5)" strokeWidth="4" strokeDasharray="10 10" />
                            <style>{`path{animation:flow 20s linear infinite}@keyframes flow{to{stroke-dashoffset:-1000}}`}</style>
                        </svg>
                    </div>
                    {[
                        { title: "Sources", items: transactions.slice(0, 2).map(t => t.from_account), color: "#00FF41" },
                        { title: "Aggregator (Mules)", items: transactions.filter(t => t.final_score >= 70).slice(0, 2).map(t => t.txn_id?.slice(0, 10)), color: "#cdffcd" },
                        { title: "Exit Points", items: ["Crypto Exch", "Wire Transfer"], color: "#ffffff" },
                    ].map((col, idx) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 10, zIndex: 1, alignItems: 'center' }}>
                            <div style={{ fontSize: 11, color: '#7A8E7A', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 8 }}>{col.title.toUpperCase()}</div>
                            {col.items.map((item, i) => (
                                <div key={i} style={{ background: 'rgba(0,12,0,0.9)', border: `1px solid ${col.color}44`, padding: '12px 24px', borderRadius: 8, fontSize: 13, fontWeight: 'bold', color: '#ffffff' }}>{item || "—"}</div>
                            ))}
                        </div>
                    ))}
                </div>
            </GlassCard>

            <GlassCard style={{ padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(0, 255, 65, 0.15)' }}>
                            {['TXN ID', 'AMOUNT', 'FROM', 'TO', 'TIME', 'RISK', 'STATUS', ''].map(h => (
                                <th key={h} style={{ padding: '16px 20px', fontSize: 11, color: '#7A8E7A', fontWeight: 600, letterSpacing: '0.05em' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(t => {
                            const sd = statusDisplay[t.status] || { label: t.status, color: '#889488' };
                            const flags = parseFlags(t.flags);
                            return (
                                <React.Fragment key={t.txn_id}>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: expanded === t.txn_id ? 'rgba(0,255,65,0.02)' : 'transparent', cursor: 'pointer' }}
                                        onClick={() => setExpanded(expanded === t.txn_id ? null : t.txn_id)}>
                                        <td style={{ padding: '16px 20px', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: '#00FF41', fontWeight: 700 }}>{t.txn_id}</td>
                                        <td style={{ padding: '16px 20px', fontFamily: "'JetBrains Mono',monospace", fontSize: 15, color: '#ffffff', fontWeight: 800 }}>{fmtAmt(t.amount)}</td>
                                        <td style={{ padding: '16px 20px', fontSize: 12, color: '#00aa00' }}>{t.from_account}</td>
                                        <td style={{ padding: '16px 20px', fontSize: 12, color: '#00aa00' }}>{t.receiver_name || t.to_account}</td>
                                        <td style={{ padding: '16px 20px', fontSize: 12, color: '#7A8E7A' }}>{fmtTime(t.created_at)}</td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <div style={{ width: 40, height: 4, background: '#1e2d47', borderRadius: 2 }}>
                                                    <div style={{ width: `${t.final_score}%`, height: '100%', background: t.final_score > 75 ? '#00FF41' : t.final_score > 55 ? '#A8EF00' : '#00CC33', borderRadius: 2 }}></div>
                                                </div>
                                                <span style={{ fontSize: 11, color: t.final_score > 75 ? '#00FF41' : t.final_score > 55 ? '#A8EF00' : '#00CC33', fontWeight: 'bold' }}>{t.final_score}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <span style={{ padding: '4px 8px', borderRadius: 4, fontSize: 10, fontWeight: 'bold', background: `${sd.color}22`, color: sd.color, border: `1px solid ${sd.color}44` }}>{sd.label}</span>
                                        </td>
                                        <td style={{ padding: '16px 20px', color: '#7A8E7A' }}>{expanded === t.txn_id ? '▲' : '▼'}</td>
                                    </tr>
                                    {expanded === t.txn_id && (
                                        <tr><td colSpan="8" style={{ padding: 0 }}>
                                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: 24, borderBottom: '1px solid rgba(0,255,65,0.2)', display: 'flex', gap: 32 }}>
                                                <div style={{ flex: 1 }}>
                                                    <h4 style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={14} /> RISK FLAGS</h4>
                                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                                                        {flags.length > 0 ? flags.map(f => (
                                                            <span key={f} style={{ padding: '4px 10px', background: 'rgba(0, 255, 65, 0.1)', border: '1px solid rgba(0, 255, 65, 0.3)', borderRadius: 12, fontSize: 11, color: 'var(--accent)', fontWeight: 'bold' }}>{f}</span>
                                                        )) : <span style={{ color: '#7A8E7A', fontSize: 12 }}>No flags detected</span>}
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                                        {[
                                                            { label: 'Category', value: t.category },
                                                            { label: 'Cyber Score', value: `${t.cyber_score}/100` },
                                                            { label: 'Risk Score', value: `${t.final_score}/100`, color: t.final_score > 70 ? '#FF3366' : '#FFAA00' },
                                                            { label: 'Merchant', value: t.receiver_name || 'N/A' },
                                                        ].map(({ label, value, color }) => (
                                                            <div key={label} style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8 }}>
                                                                <div style={{ fontSize: 10, color: '#7A8E7A', marginBottom: 4 }}>{label}</div>
                                                                <div style={{ fontSize: 12, color: color || '#ffffff', fontWeight: 'bold' }}>{value}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div style={{ flex: 1, borderLeft: '1px solid rgba(0, 255, 65, 0.15)', paddingLeft: 32 }}>
                                                    {t.status === "ON_HOLD" || t.status === "BLOCKED" ? (
                                                        <div style={{ background: 'rgba(255, 51, 102, 0.05)', border: '1px solid rgba(255, 51, 102, 0.2)', padding: 16, borderRadius: 8, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                            <div style={{ fontSize: 11, color: '#FF3366', fontWeight: 'bold', marginBottom: 8 }}>TRANSACTION FROZEN</div>
                                                            <div style={{ fontSize: 13, color: '#ffffff', marginBottom: 16 }}>This transaction has been automatically blocked. Funds have not left the account.</div>
                                                            <button style={{ background: 'transparent', border: '1px solid #FF3366', color: '#FF3366', padding: '8px 16px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer', fontSize: 11 }}>VIEW BLOCK EVIDENCE</button>
                                                        </div>
                                                    ) : (
                                                        <div style={{ background: 'rgba(0, 255, 65, 0.05)', border: '1px solid rgba(0, 255, 65, 0.2)', padding: 16, borderRadius: 8, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                            <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 'bold', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                <Clock size={14} /> {formatWindow(t.created_at)}
                                                            </div>
                                                            <div style={{ fontSize: 13, color: '#ffffff', marginBottom: 16 }}>This transaction is within the Regulation E reversal window. You can still claw back these funds.</div>
                                                            <button className="hover-lift" style={{ background: 'var(--accent)', border: 'none', color: '#000', padding: '10px 16px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer', fontSize: 11 }}>INITIATE REVERSAL</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td></tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                        {error && <tr><td colSpan="8" style={{ padding: 20, color: '#FF3366', textAlign: 'center' }}>{error}</td></tr>}
                    </tbody>
                </table>
            </GlassCard>
        </div>
    );
}
