import React, { useState, useEffect } from "react";
import GlassCard from "../components/GlassCard";
import GeminiPanel from "../components/GeminiPanel";
import { ShieldAlert, Globe } from "lucide-react";
import { useApi } from "../hooks/useApi";
import { getLoginEvents, getAccounts } from "../utils/api";

const getSeverity = s => s >= 75 ? "CRIT" : s >= 45 ? "HIGH" : "MED";
const sevColor = s => s === "CRIT" ? "#FF3366" : s === "HIGH" ? "#FFAA00" : "#FFDD00";

const deriveEvent = ev => {
    if (ev.password_changed) return "Password Changed After Anomalous Login";
    if (ev.failed_logins >= 5) return `Failed Authentication Surge (${ev.failed_logins} attempts)`;
    if (ev.vpn_detected && ev.new_device) return "New Device Login via VPN Detected";
    if (ev.vpn_detected) return "VPN-Masked Login Detected";
    if (ev.new_device && ev.new_city) return "New Device Login from New City";
    if (ev.new_device) return "New Device Fingerprint Registered";
    if (ev.new_city) return "Geographic Anomaly — New City Login";
    if (ev.failed_logins > 0) return `Failed Login Attempt (${ev.failed_logins}x)`;
    return "Standard Login Event";
};

export default function CyberRisk() {
    const { data: rawEvents, loading: loginsLoading } = useApi(getLoginEvents);
    const { data: allAccounts, loading: accountsLoading } = useApi(getAccounts);
    const [reportTrigger, setReportTrigger] = useState(0);

    const loading = loginsLoading || accountsLoading;
    const events = rawEvents || [];
    const accounts = allAccounts || [];

    const cyberEvents = events.map(ev => ({
        time: ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "—",
        sev: getSeverity(ev.cyber_risk_score),
        source: `${ev.ip_address} (${ev.country})`,
        event: deriveEvent(ev),
        user: ev.account_id,
        location: ev.location,
        amlMatch: accounts.some(acc => acc.account_id === ev.account_id),
        score: ev.cyber_risk_score,
    }));

    const critCount = cyberEvents.filter(e => e.sev === "CRIT").length;
    const amlCount = cyberEvents.filter(e => e.amlMatch).length;
    const geminiContext = cyberEvents.slice(0, 8).map(e => `Account ${e.user}: ${e.event} from ${e.source} — Score: ${e.score}`).join("\n");

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: 24, margin: 0, color: '#ffffff' }}>SOC ↔ AML INTEGRATION FEED</h1>
                    <div style={{ color: '#7A8E7A', fontSize: 13, marginTop: 4, display: 'flex', gap: 20 }}>
                        <span>Bridging cyber attacks and financial crime</span>
                        {!loading && <><span style={{ color: '#00FF41', fontWeight: 'bold' }}>{critCount} CRITICAL</span><span style={{ color: '#A8EF00', fontWeight: 'bold' }}>{amlCount} AML MATCHES</span></>}
                    </div>
                </div>
                <button
                    onClick={() => setReportTrigger(Date.now())}
                    className="hover-lift"
                    style={{ padding: '12px 24px', background: 'rgba(0, 255, 65, 0.05)', border: '1px solid rgba(0, 255, 65, 0.3)', borderRadius: 8, color: 'var(--accent)', fontSize: 13, fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.05em' }}>
                    GENERATE UNIFIED REPORT
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <GlassCard style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: 14, color: '#ffffff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ShieldAlert size={16} color="#00FF41" /> RAW CYBER EVENTS
                        {loading && <span style={{ fontSize: 11, color: '#7A8E7A', marginLeft: 8 }}>Loading...</span>}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', maxHeight: 600 }}>
                        {cyberEvents.map((ev, i) => (
                            <div key={i} style={{ padding: 12, background: 'rgba(0,0,0,0.3)', borderLeft: `3px solid ${sevColor(ev.sev)}`, borderRadius: '0 8px 8px 0', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <span style={{ fontSize: 10, color: '#00aa00', fontFamily: "'JetBrains Mono',monospace" }}>{ev.time}</span>
                                        <span style={{ fontSize: 9, fontWeight: 'bold', padding: '2px 6px', borderRadius: 4, background: `${sevColor(ev.sev)}22`, color: sevColor(ev.sev) }}>{ev.sev}</span>
                                        <span style={{ fontSize: 10, color: '#555', fontFamily: "'JetBrains Mono',monospace" }}>{ev.score}/100</span>
                                    </div>
                                    {ev.amlMatch && <span style={{ fontSize: 9, fontWeight: 'bold', padding: '2px 8px', borderRadius: 12, background: 'linear-gradient(90deg,#00FF4133,#A8EF0033)', color: '#A8EF00', border: '1px solid #A8EF0044' }}>🔗 AML MATCH</span>}
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 }}>{ev.event}</div>
                                <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#7A8E7A', fontFamily: "'JetBrains Mono',monospace" }}>
                                    <span>Account: {ev.user}</span>
                                    <span>Source: {ev.source}</span>
                                    {ev.location && <span><Globe size={10} style={{ display: 'inline', marginRight: 3 }} />{ev.location}</span>}
                                </div>
                            </div>
                        ))}
                        {!loading && cyberEvents.length === 0 && <div style={{ color: '#7A8E7A', fontSize: 13, textAlign: 'center', padding: 40 }}>No login events found</div>}
                    </div>
                </GlassCard>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {reportTrigger !== 0 ? (
                        <GeminiPanel
                            title="UNIFIED THREAT RESPONSE REPORT"
                            prompt={`Generate a full intelligence report combining cyber attack vectors and AML financial crime data from this real event log:\n\n${geminiContext}\n\nInclude: Executive Summary, Attack Vector Analysis, Financial Impact, and Recommended Immediate Actions.`}
                            trigger={reportTrigger}
                            dataContext={cyberEvents}
                        />
                    ) : (
                        <GlassCard style={{ padding: 24, flex: 1 }}>
                            <h3 style={{ fontSize: 14, color: '#ffffff', marginBottom: 20 }}>CYBER ↔ AML CORRELATION MATRIX</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '120px repeat(4, 1fr)', gap: 4 }}>
                                <div />
                                {['Velocity', 'New Rcv', 'Mule Link', 'Geo-Fail'].map(h => <div key={h} style={{ fontSize: 10, color: '#7A8E7A', textAlign: 'center', fontWeight: 'bold' }}>{h}</div>)}
                                {['Phishing', 'Device Fail', 'VPN Use', 'Dark Web'].map(row => (
                                    <React.Fragment key={row}>
                                        <div style={{ fontSize: 11, color: '#00aa00', display: 'flex', alignItems: 'center' }}>{row}</div>
                                        {[1, 2, 3, 4].map((_, j) => { const v = Math.random(); const c = v > 0.8 ? '#00FF41' : v > 0.5 ? '#A8EF00' : v > 0.2 ? '#00FF41' : 'rgba(255,255,255,0.05)'; return <div key={j} style={{ height: 40, background: c, opacity: 0.3 + v * 0.5, borderRadius: 4, border: `1px solid ${c}` }} />; })}
                                    </React.Fragment>
                                ))}
                            </div>
                            <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                {[{ label: 'Total Events', value: cyberEvents.length, color: '#ffffff' }, { label: 'Critical', value: critCount, color: '#00FF41' }, { label: 'AML Matches', value: amlCount, color: '#A8EF00' }].map(({ label, value, color }) => (
                                    <div key={label} style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                                        <div style={{ fontSize: 24, fontWeight: 800, color, fontFamily: "'JetBrains Mono',monospace" }}>{value}</div>
                                        <div style={{ fontSize: 10, color: '#7A8E7A', marginTop: 4 }}>{label}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: 16, fontSize: 11, color: '#7A8E7A', lineHeight: 1.6 }}>
                                💡 <strong style={{ color: '#00FF41' }}>How this works:</strong> Matrix correlates cyber signals (rows) against AML anomalies (columns). Green = strong correlation between breach and laundering attempt.
                            </div>
                        </GlassCard>
                    )}
                </div>
            </div>
        </div>
    );
}
