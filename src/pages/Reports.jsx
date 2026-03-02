import React, { useState } from "react";
import GlassCard from "../components/GlassCard";
import GeminiPanel from "../components/GeminiPanel";
import { FileText, Download, Target, Shield, AlertTriangle } from "lucide-react";

const reportsList = [
    { id: "REP-2025-03-A", title: "Mule Ring Detection: Operation Crimson", date: "Today, 10:45 AM", type: "Mule Analysis", severity: "CRITICAL", accounts: 6, txns: 12 },
    { id: "REP-2025-03-B", title: "Phishing Campaign Attribution #441", date: "Yesterday, 14:20 PM", type: "Cyber Threat", severity: "HIGH", accounts: 2, txns: 0 },
    { id: "REP-2025-03-C", title: "SAR Filing: ACC-9922 Suspicious Wire", date: "Mar 1, 09:15 AM", type: "Regulatory", severity: "MEDIUM", accounts: 1, txns: 3 },
    { id: "REP-2025-02-D", title: "Monthly AML Review Summary", date: "Feb 28, 17:00 PM", type: "Summary", severity: "INFO", accounts: 24, txns: 142 }
];

export default function Reports() {
    const [triggerReport, setTriggerReport] = useState(0);
    const [reportType, setReportType] = useState('Mule Ring Analysis');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: 24, margin: 0, color: '#ffffff' }}>AI INTELLIGENCE REPORTS</h1>
                    <div style={{ color: '#008800', fontSize: 13, marginTop: 4 }}>Automated analysis & regulatory filing generation</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

                {/* Generate Report Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <GlassCard style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 16, color: '#ffffff', marginBottom: 20 }}>GENERATE NEW REPORT</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 11, color: '#008800', fontWeight: 600, marginBottom: 8, display: 'block' }}>REPORT TYPE</label>
                                <select
                                    value={reportType}
                                    onChange={e => setReportType(e.target.value)}
                                    style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: "'Space Grotesk', sans-serif" }}
                                >
                                    <option>Mule Ring Analysis</option>
                                    <option>Attack Attribution</option>
                                    <option>Recovery Assessment</option>
                                    <option>Regulatory Filing (SAR)</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: 11, color: '#008800', fontWeight: 600, marginBottom: 8, display: 'block' }}>DATE RANGE (MOCK)</label>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <input type="date" defaultValue="2025-03-01" style={{ flex: 1, padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: "'JetBrains Mono', monospace" }} />
                                    <input type="date" defaultValue="2025-03-02" style={{ flex: 1, padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: "'JetBrains Mono', monospace" }} />
                                </div>
                            </div>

                            <button
                                onClick={() => setTriggerReport(Date.now())}
                                style={{ width: '100%', marginTop: 8, padding: '16px', background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(136, 255, 136, 0.4))', border: '1px solid #ffffff', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.05em', boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)' }}
                            >
                                <span>✨</span> GENERATE WITH GEMINI
                            </button>
                        </div>
                    </GlassCard>

                    {triggerReport !== 0 && (
                        <GeminiPanel
                            title={`${reportType.toUpperCase()} DRAFT`}
                            prompt={`Generate a structured ${reportType} report based on the cyber and financial data analyzed today. Format it professionally with sections: Summary, Key Findings, Entities Involved, and Next Steps.`}
                            trigger={triggerReport}
                            dataContext={{ focus: reportType }}
                        />
                    )}
                </div>

                {/* Existing Reports Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', paddingRight: 8 }}>
                    <h3 style={{ fontSize: 16, color: '#ffffff', marginBottom: 4 }}>PAST REPORTS</h3>

                    {reportsList.map((r, i) => (
                        <GlassCard key={i} hover={true} style={{ padding: 20, cursor: 'pointer' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.1)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: 14, color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif" }}>{r.title}</h4>
                                        <span style={{ fontSize: 11, color: '#008800', fontFamily: "'JetBrains Mono', monospace" }}>{r.id} · {r.date}</span>
                                    </div>
                                </div>
                                <span style={{ fontSize: 10, fontWeight: 'bold', padding: '4px 8px', borderRadius: 4, background: r.severity === 'CRITICAL' ? '#ffffff22' : r.severity === 'HIGH' ? '#cdffcd22' : r.severity === 'MEDIUM' ? '#ffffff22' : '#88ff8822', color: r.severity === 'CRITICAL' ? '#ffffff' : r.severity === 'HIGH' ? '#cdffcd' : r.severity === 'MEDIUM' ? '#ffffff' : '#88ff88', border: `1px solid ${r.severity === 'CRITICAL' ? '#ffffff' : r.severity === 'HIGH' ? '#cdffcd' : r.severity === 'MEDIUM' ? '#ffffff' : '#88ff88'}44` }}>
                                    {r.severity}
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: 24, fontSize: 12, color: '#00aa00', padding: '12px 0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Target size={14} color="#88ff88" /> <span>{r.type}</span></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={14} color="#cdffcd" /> <span>{r.accounts} Accounts Linked</span></div>
                            </div>

                            <button style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#88ff88', fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s' }}>
                                VIEW FULL REPORT <Download size={14} />
                            </button>
                        </GlassCard>
                    ))}
                </div>

            </div>
        </div>
    );
}
