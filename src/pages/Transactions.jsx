import React, { useState } from "react";
import GlassCard from "../components/GlassCard";
import { mockTransactions } from "../data/mockTransactions";
import { Zap, MapPin, Link as LinkIcon, AlertTriangle } from "lucide-react";

export default function Transactions() {
    const [expanded, setExpanded] = useState(null);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Filters */}
            <GlassCard style={{ padding: '12px 24px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#008800', fontWeight: 600 }}>FLOW FILTERS:</span>
                {['ALL', 'SUSPICIOUS', 'FLAGGED', 'REVERSED', 'CLEARED'].map(f => (
                    <button key={f} style={{ background: f === 'ALL' ? '#88ff8822' : 'transparent', border: f === 'ALL' ? '1px solid #88ff88' : '1px solid rgba(255,255,255,0.1)', color: f === 'ALL' ? '#88ff88' : '#008800', padding: '6px 16px', borderRadius: 20, fontSize: 11, fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}>
                        {f}
                    </button>
                ))}
            </GlassCard>

            {/* SVG Flow Diagram */}
            <GlassCard style={{ padding: 24, overflow: 'hidden', position: 'relative' }}>
                <h3 style={{ fontSize: 14, color: '#ffffff', marginBottom: 20, fontFamily: "'Space Grotesk', sans-serif" }}>MONEY FLOW (LAST 24 HOURS)</h3>
                <div style={{ height: 200, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px', position: 'relative' }}>

                    {/* Connecting Lines */}
                    <div style={{ position: 'absolute', top: 0, left: 140, right: 140, bottom: 0, zIndex: 0 }}>
                        <svg width="100%" height="100%">
                            {/* Animated paths */}
                            <path d="M 0 100 Q 150 20 300 100 T 600 100" fill="transparent" stroke="rgba(255,255,255,0.5)" strokeWidth="4" strokeDasharray="10 10" />
                            <path d="M 0 100 Q 150 180 300 100 T 600 100" fill="transparent" stroke="rgba(205,255,205,0.5)" strokeWidth="4" strokeDasharray="10 10" />
                            <style>{`
                path { animation: flow 20s linear infinite; }
                @keyframes flow { to { stroke-dashoffset: -1000; } }
              `}</style>
                        </svg>
                    </div>

                    {[
                        { title: "Sources", items: ["ACC-4821", "ACC-7743"], color: "#88ff88" },
                        { title: "Aggregator (Mules)", items: ["MULE-RING-A", "MULE-RING-B"], color: "#cdffcd" },
                        { title: "Exit Points", items: ["Crypto Exch C", "Offshore Wire"], color: "#ffffff" }
                    ].map((col, idx) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 10, zIndex: 1, alignItems: 'center' }}>
                            <div style={{ fontSize: 11, color: '#008800', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 8 }}>{col.title.toUpperCase()}</div>
                            {col.items.map((item, i) => (
                                <div key={i} style={{ background: 'rgba(0,12,0,0.9)', border: `1px solid ${col.color}44`, padding: '12px 24px', borderRadius: 8, fontSize: 13, fontWeight: 'bold', color: '#ffffff', boxShadow: `0 0 20px ${col.color}22` }}>
                                    {item}
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
                            {['TXN ID', 'AMOUNT', 'FROM', 'TO', 'TIME', 'VELOCITY', 'STATUS', ''].map(h => (
                                <th key={h} style={{ padding: '16px 20px', fontSize: 11, color: '#008800', fontWeight: 600, letterSpacing: '0.05em' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {mockTransactions.map((t, i) => (
                            <React.Fragment key={t.id}>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: expanded === t.id ? 'rgba(0,255,0,0.02)' : 'transparent', transition: 'all 0.2s', cursor: 'pointer' }} onClick={() => setExpanded(expanded === t.id ? null : t.id)} className="hover-lift">
                                    <td style={{ padding: '16px 20px', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#88ff88', fontWeight: 700 }}>{t.id}</td>
                                    <td style={{ padding: '16px 20px', fontFamily: "'JetBrains Mono', monospace", fontSize: 16, color: '#ffffff', fontWeight: 800 }}>{t.amount}</td>
                                    <td style={{ padding: '16px 20px', fontSize: 13, color: '#00aa00' }}>{t.from}</td>
                                    <td style={{ padding: '16px 20px', fontSize: 13, color: '#00aa00' }}>{t.to}</td>
                                    <td style={{ padding: '16px 20px', fontSize: 12, color: '#008800' }}>{t.time}</td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <div style={{ width: 40, height: 4, background: '#1e2d47', borderRadius: 2 }}><div style={{ width: `${t.velocity}%`, height: '100%', background: t.velocity > 80 ? '#ffffff' : '#00ff00', borderRadius: 2 }}></div></div>
                                            <span style={{ fontSize: 11, color: t.velocity > 80 ? '#ffffff' : '#00ff00', fontWeight: 'bold' }}>{t.velocity}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <span style={{ padding: '4px 8px', borderRadius: 4, fontSize: 10, fontWeight: 'bold', background: t.status === 'BLOCKED' ? '#ffffff22' : t.status === 'CLEARED' ? '#00ff0022' : '#cdffcd22', color: t.status === 'BLOCKED' ? '#ffffff' : t.status === 'CLEARED' ? '#00ff00' : '#cdffcd', border: `1px solid ${t.status === 'BLOCKED' ? '#ffffff' : t.status === 'CLEARED' ? '#00ff00' : '#cdffcd'}44` }}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 20px', color: '#008800' }}>{expanded === t.id ? '▲' : '▼'}</td>
                                </tr>

                                {/* Expandable Panel */}
                                {expanded === t.id && (
                                    <tr>
                                        <td colSpan="8" style={{ padding: 0 }}>
                                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: 24, borderBottom: '1px solid rgba(0, 255, 0, 0.2)', display: 'flex', gap: 32 }}>

                                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                                                    <h4 style={{ margin: 0, fontSize: 12, color: '#88ff88', display: 'flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={14} /> SECURITY HEADERS</h4>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8 }}><div style={{ fontSize: 10, color: '#008800', marginBottom: 4 }}>Origin IP</div><div style={{ fontSize: 12, color: '#ffffff', fontFamily: "'JetBrains Mono', monospace" }}>185.12.98.22 (RU)</div></div>
                                                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8 }}><div style={{ fontSize: 10, color: '#008800', marginBottom: 4 }}>Device ID</div><div style={{ fontSize: 12, color: '#ffffff', fontFamily: "'JetBrains Mono', monospace" }}>Unknown_Android_X86</div></div>
                                                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8 }}><div style={{ fontSize: 10, color: '#008800', marginBottom: 4 }}>Mule Ring Match</div><div style={{ fontSize: 12, color: '#ffffff', fontWeight: 'bold' }}>{t.muleLink} ⚠</div></div>
                                                    </div>
                                                </div>

                                                <div style={{ flex: 1, borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 32 }}>
                                                    {t.status === 'BLOCKED' ? (
                                                        <div style={{ background: '#ffffff11', border: '1px solid #ffffff44', padding: 16, borderRadius: 8, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                            <div style={{ fontSize: 11, color: '#ffffff', fontWeight: 'bold', marginBottom: 8 }}>RECOVERY WINDOW CLOSED</div>
                                                            <div style={{ fontSize: 13, color: '#ffffff', marginBottom: 16 }}>Transaction blocked at source, funds protected. No recovery required.</div>
                                                            <button style={{ background: 'transparent', border: '1px solid #ffffff', color: '#ffffff', padding: '8px 16px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer', fontSize: 11 }}>VIEW AUDIT LOG</button>
                                                        </div>
                                                    ) : (
                                                        <div style={{ background: '#00ff0011', border: '1px solid #00ff0044', padding: 16, borderRadius: 8, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                            <div style={{ fontSize: 11, color: '#00ff00', fontWeight: 'bold', marginBottom: 8 }}>RECOVERABLE — 47:23:10 LEFT</div>
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
                        ))}
                    </tbody>
                </table>
            </GlassCard>
        </div>
    );
}
