import React, { useState, useEffect } from "react";
import GlassCard from "../components/GlassCard";
import GeminiPanel from "../components/GeminiPanel";
import { FileText, Download, Target, AlertTriangle } from "lucide-react";
import { fetchAlerts, fetchDashboardSummary } from "../api/api";

const sevColor = s => ({ CRITICAL: "#ff4444", HIGH: "#ffcc00", MEDIUM: "#88ff88" }[s] || "#aaaaaa");

export default function Reports() {
    const [triggerReport, setTriggerReport] = useState(0);
    const [reportType, setReportType] = useState('Mule Ring Analysis');
    const [pastAlerts, setPastAlerts] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([fetchAlerts({ limit: 8 }), fetchDashboardSummary()])
            .then(([alerts, dash]) => { setPastAlerts(alerts); setSummary(dash); })
            .catch(err => console.error("Reports API:", err))
            .finally(() => setLoading(false));
    }, []);

    const alertContext = pastAlerts.slice(0, 6).map(a =>
        `[${a.severity}] Account ${a.account_id}: ${a.description} (Risk: ${a.final_score})`
    ).join("\n");

    const geminiPrompt = `Generate a structured ${reportType} report for financial investigators based on these real flagged alerts:\n\n${alertContext}\n\nFormat: Executive Summary, Key Findings, Risk Assessment, Regulatory Recommendation (SAR if applicable), Next Steps.`;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: 24, margin: 0, color: '#ffffff' }}>AI INTELLIGENCE REPORTS</h1>
                    <div style={{ color: '#008800', fontSize: 13, marginTop: 4 }}>
                        Automated analysis & regulatory filing generation
                        {summary && <span style={{ marginLeft: 16, color: '#88ff88' }}>{summary.active_alerts} active alerts · {summary.high_risk_accounts} high-risk accounts</span>}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <GlassCard style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 16, color: '#ffffff', marginBottom: 20 }}>GENERATE NEW REPORT</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 11, color: '#008800', fontWeight: 600, marginBottom: 8, display: 'block' }}>REPORT TYPE</label>
                                <select value={reportType} onChange={e => setReportType(e.target.value)}
                                    style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', borderRadius: 8, fontSize: 14, outline: 'none' }}>
                                    <option>Mule Ring Analysis</option>
                                    <option>Attack Attribution</option>
                                    <option>Recovery Assessment</option>
                                    <option>Regulatory Filing (SAR)</option>
                                </select>
                            </div>

                            <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 12 }}>
                                <div style={{ fontSize: 10, color: '#008800', fontWeight: 600, marginBottom: 8 }}>LIVE DATA CONTEXT (FROM NEON DB)</div>
                                {loading ? <div style={{ fontSize: 11, color: '#555' }}>Loading alerts...</div> :
                                    pastAlerts.slice(0, 3).map((a, i) => (
                                        <div key={i} style={{ fontSize: 11, color: '#00aa00', fontFamily: "'JetBrains Mono',monospace", marginBottom: 4 }}>
                                            <span style={{ color: sevColor(a.severity) }}>[{a.severity}]</span> {a.account_id}: {a.description?.slice(0, 45)}…
                                        </div>
                                    ))
                                }
                            </div>

                            <button onClick={() => setTriggerReport(Date.now())}
                                style={{ width: '100%', marginTop: 8, padding: '16px', background: 'linear-gradient(135deg,rgba(255,255,255,0.4),rgba(136,255,136,0.4))', border: '1px solid #ffffff', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', boxShadow: '0 0 20px rgba(255,255,255,0.2)' }}>
                                <span>✨</span> GENERATE WITH GEMINI
                            </button>
                        </div>
                    </GlassCard>

                    {triggerReport !== 0 && (
                        <GeminiPanel
                            title={`${reportType.toUpperCase()} DRAFT`}
                            prompt={geminiPrompt}
                            trigger={triggerReport}
                            dataContext={{ focus: reportType, alerts: pastAlerts.slice(0, 6) }}
                        />
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', paddingRight: 8 }}>
                    <h3 style={{ fontSize: 16, color: '#ffffff', marginBottom: 4 }}>
                        RECENT FLAGGED ALERTS
                        <span style={{ fontSize: 11, color: '#008800', fontWeight: 400, marginLeft: 12 }}>from Neon DB</span>
                    </h3>
                    {loading && <div style={{ color: '#008800', fontSize: 13, padding: 20 }}>Loading from database...</div>}
                    {pastAlerts.map(a => (
                        <GlassCard key={a.alert_id} hover={true} style={{ padding: 20, cursor: 'pointer', borderLeft: `3px solid ${sevColor(a.severity)}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 8, background: `${sevColor(a.severity)}22`, color: sevColor(a.severity), display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${sevColor(a.severity)}44` }}>
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: 14, color: '#ffffff', fontFamily: "'JetBrains Mono',monospace" }}>{a.account_id}</h4>
                                        <span style={{ fontSize: 11, color: '#008800', fontFamily: "'JetBrains Mono',monospace" }}>
                                            ALERT-{a.alert_id} · {a.created_at ? new Date(a.created_at).toLocaleDateString('en-IN') : "—"}
                                        </span>
                                    </div>
                                </div>
                                <span style={{ fontSize: 10, fontWeight: 'bold', padding: '4px 8px', borderRadius: 4, background: `${sevColor(a.severity)}22`, color: sevColor(a.severity), border: `1px solid ${sevColor(a.severity)}44` }}>{a.severity}</span>
                            </div>
                            <div style={{ fontSize: 12, color: '#00aa00', marginBottom: 12, lineHeight: 1.5 }}>{a.description}</div>
                            <div style={{ display: 'flex', gap: 24, fontSize: 12, color: '#00aa00', marginBottom: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Target size={14} color="#88ff88" /><span>Risk Score: {a.final_score}/100</span></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={14} color="#ffcc00" /><span style={{ color: a.status === 'Open' ? '#ffcc00' : a.status === 'Resolved' ? '#00ff88' : '#ffffff' }}>{a.status}</span></div>
                            </div>
                            <button style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#88ff88', fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
                                VIEW FULL REPORT <Download size={14} />
                            </button>
                        </GlassCard>
                    ))}
                </div>
            </div>
        </div>
    );
}
