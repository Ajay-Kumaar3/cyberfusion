import React, { useState } from "react";
import GlassCard from "../components/GlassCard";
import GeminiPanel from "../components/GeminiPanel";
import { ShieldAlert, Fingerprint, Lock, Globe } from "lucide-react";

const cyberEvents = [
    { time: "10:12:05", sev: "CRIT", source: "103.45.67.89 (RU)", event: "Spear Phishing Link Clicked", user: "ACC-4821", amlMatch: true },
    { time: "10:14:22", sev: "HIGH", source: "185.12.98.22 (NL)", event: "New Device Login Extracted", user: "ACC-4821", amlMatch: true },
    { time: "10:18:01", sev: "MED", source: "49.32.11.204 (IN)", event: "Failed Authentication Surge", user: "ACC-9921", amlMatch: false },
    { time: "10:20:44", sev: "CRIT", source: "103.45.67.89 (RU)", event: "Session Hijack Detected", user: "ACC-4821", amlMatch: true },
    { time: "10:25:30", sev: "HIGH", source: "10.0.0.45", event: "Internal Privilege Escalation Attempt", user: "SYS-ADMIN", amlMatch: false },
];

export default function CyberRisk() {
    const [reportTrigger, setReportTrigger] = useState(0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: 24, margin: 0, color: '#ffffff' }}>SOC ↔ AML INTEGRATION FEED</h1>
                    <div style={{ color: '#008800', fontSize: 13, marginTop: 4 }}>Bridging the gap between cyber attacks and financial crime</div>
                </div>
                <button
                    onClick={() => setReportTrigger(Date.now())}
                    style={{ padding: '12px 24px', background: '#ffffff', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 'bold', cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", boxShadow: '0 0 20px rgba(255, 255, 255, 0.4)' }}
                >
                    ✨ GENERATE UNIFIED REPORT
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

                {/* Left Col - Cyber Event Log */}
                <GlassCard style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: 14, color: '#ffffff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><ShieldAlert size={16} color="#88ff88" /> RAW CYBER EVENTS</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                        {cyberEvents.map((ev, i) => (
                            <div key={i} style={{ padding: 12, background: 'rgba(0,0,0,0.3)', borderLeft: `3px solid ${ev.sev === 'CRIT' ? '#ffffff' : ev.sev === 'HIGH' ? '#cdffcd' : '#88ff88'}`, borderRadius: '0 8px 8px 0', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <span style={{ fontSize: 10, color: '#00aa00', fontFamily: "'JetBrains Mono', monospace" }}>{ev.time}</span>
                                        <span style={{ fontSize: 9, fontWeight: 'bold', padding: '2px 6px', borderRadius: 4, background: ev.sev === 'CRIT' ? '#ffffff22' : ev.sev === 'HIGH' ? '#cdffcd22' : '#88ff8822', color: ev.sev === 'CRIT' ? '#ffffff' : ev.sev === 'HIGH' ? '#cdffcd' : '#88ff88' }}>{ev.sev}</span>
                                    </div>
                                    {ev.amlMatch && (
                                        <span style={{ fontSize: 9, fontWeight: 'bold', padding: '2px 8px', borderRadius: 12, background: 'linear-gradient(90deg, #ffffff, #cdffcd)', color: '#fff', boxShadow: '0 0 10px rgba(255,255,255,0.4)', animation: 'pulse-glow 2s infinite' }}>🔗 AML MATCH</span>
                                    )}
                                </div>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 }}>{ev.event}</div>
                                    <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#008800', fontFamily: "'JetBrains Mono', monospace" }}>
                                        <span>Target: {ev.user}</span>
                                        <span>Source: {ev.source}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* Right Col - Matrix / AI */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {reportTrigger !== 0 ? (
                        <GeminiPanel
                            title="UNIFIED THREAT RESPONSE REPORT"
                            prompt="Generate a full intelligence report combining cyber attack vectors and financial AML crime data. Include Executive Summary, Attack Vector, Financial Impact, and Recommended Actions."
                            trigger={reportTrigger}
                            dataContext={cyberEvents}
                        />
                    ) : (
                        <GlassCard style={{ padding: 24, flex: 1 }}>
                            <h3 style={{ fontSize: 14, color: '#ffffff', marginBottom: 20 }}>CYBER ↔ AML CORRELATION MATRIX</h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '120px repeat(4, 1fr)', gap: 4 }}>
                                <div />
                                {['Velocity', 'New Rcv', 'Mule Link', 'Geo-Fail'].map(h => <div key={h} style={{ fontSize: 10, color: '#008800', textAlign: 'center', fontWeight: 'bold' }}>{h}</div>)}

                                {['Phishing', 'Device Fail', 'VPN Use', 'Dark Web'].map((row, i) => (
                                    <React.Fragment key={row}>
                                        <div style={{ fontSize: 11, color: '#00aa00', display: 'flex', alignItems: 'center' }}>{row}</div>
                                        {[1, 2, 3, 4].map((col, j) => {
                                            // Generate heatmap colors
                                            const val = Math.random();
                                            const color = val > 0.8 ? '#ffffff' : val > 0.5 ? '#cdffcd' : val > 0.2 ? '#88ff88' : 'rgba(255,255,255,0.05)';
                                            const op = val > 0.2 ? 0.3 + (val * 0.5) : 1;
                                            return (
                                                <div key={j} style={{ height: 40, background: color, opacity: op, borderRadius: 4, cursor: 'pointer', transition: 'all 0.2s', border: `1px solid ${color !== 'rgba(255,255,255,0.05)' ? color : 'transparent'}` }} className="hover-lift" title="Click for AI analysis"></div>
                                            )
                                        })}
                                    </React.Fragment>
                                ))}
                            </div>
                            <div style={{ marginTop: 24, fontSize: 11, color: '#008800', lineHeight: 1.6 }}>
                                💡 <strong style={{ color: '#88ff88' }}>How this works:</strong> The matrix correlates incoming signals from internal network security logs (rows) against transactional AML anomalies (columns). Dark red indicates a strong correlation linking a cyber breach directly to attempted money laundering.
                            </div>
                        </GlassCard>
                    )}
                </div>

            </div>
        </div>
    );
}
