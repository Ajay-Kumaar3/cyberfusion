import React, { useState, useEffect } from "react";
import GlassCard from "../components/GlassCard";
import RiskGauge from "../components/RiskGauge";
import GeminiPanel from "../components/GeminiPanel";
import { fetchAccounts } from "../api/api";

export default function Accounts() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAcc, setSelectedAcc] = useState(null);
    const [triggerAI, setTriggerAI] = useState(0);

    useEffect(() => {
        fetchAccounts({ limit: 50 })
            .then(data => {
                setAccounts(data);
                if (data.length > 0) setSelectedAcc(data[0]);
            })
            .catch(err => console.error("Accounts API error:", err))
            .finally(() => setLoading(false));
    }, []);

    const riskColor = (level) => {
        if (level === "Critical") return "#ff4444";
        if (level === "High") return "#ff8800";
        if (level === "Medium") return "#ffcc00";
        return "#00ff88";
    };

    const statusColor = (status) => {
        if (status === "Compromised") return "#ff4444";
        if (status === "Flagged") return "#ffcc00";
        if (status === "Frozen") return "#aaaaaa";
        return "#00ff88";
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: '#008800', fontSize: 18, fontFamily: "'JetBrains Mono', monospace" }}>
            Loading accounts from database...
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(0, 255, 0, 0.2)', paddingBottom: 16 }}>
                <div>
                    <h1 style={{ fontSize: 24, margin: 0, color: '#ffffff' }}>MULE RING DETECTION</h1>
                    <div style={{ color: '#88ff88', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#88ff88', animation: 'blink 1.5s infinite' }}></span>
                        {accounts.filter(a => a.risk_level === "High" || a.risk_level === "Critical").length} high-risk accounts detected
                    </div>
                </div>
                <div style={{ fontSize: 13, color: '#008800' }}>
                    {accounts.length} accounts monitored
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, minHeight: 600 }}>

                {/* Left List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', maxHeight: 700, paddingRight: 8 }}>
                    {accounts.map(acc => (
                        <GlassCard
                            key={acc.account_id}
                            hover={true}
                            style={{ padding: 16, cursor: 'pointer', border: selectedAcc?.account_id === acc.account_id ? `1px solid ${riskColor(acc.risk_level)}` : '1px solid rgba(0, 255, 0, 0.15)', background: selectedAcc?.account_id === acc.account_id ? 'rgba(0, 255, 0, 0.05)' : '' }}
                            onClick={() => { setSelectedAcc(acc); setTriggerAI(0); }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <div>
                                    <div style={{ fontSize: 16, fontWeight: 'bold', color: '#ffffff', fontFamily: "'JetBrains Mono', monospace" }}>{acc.account_id}</div>
                                    <div style={{ fontSize: 12, color: '#008800' }}>
                                        Name: <span style={{ filter: 'blur(3px)' }}>{acc.name}</span>
                                    </div>
                                </div>
                                <div style={{ background: `${statusColor(acc.status)}22`, color: statusColor(acc.status), padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 'bold', border: `1px solid ${statusColor(acc.status)}44` }}>
                                    {acc.status?.toUpperCase()}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                                <RiskGauge score={acc.final_score} size={60} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11 }}>
                                        <span style={{ color: '#008800' }}>Risk Level</span>
                                        <span style={{ color: riskColor(acc.risk_level), fontWeight: 'bold' }}>{acc.risk_level}</span>
                                    </div>
                                    <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                                        <div style={{ width: `${acc.final_score}%`, height: '100%', background: riskColor(acc.risk_level), borderRadius: 2, boxShadow: `0 0 4px ${riskColor(acc.risk_level)}` }}></div>
                                    </div>
                                    <div style={{ marginTop: 8, display: 'flex', gap: 16, fontSize: 11 }}>
                                        <span style={{ color: '#008800' }}>Cyber: <span style={{ color: '#fff' }}>{acc.cyber_score}</span></span>
                                        <span style={{ color: '#008800' }}>TXN: <span style={{ color: '#fff' }}>{acc.txn_score}</span></span>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>

                {/* Right Detail */}
                {selectedAcc && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <GlassCard style={{ padding: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                <div>
                                    <h2 style={{ fontSize: 24, margin: 0, fontFamily: "'JetBrains Mono', monospace", color: '#ffffff' }}>{selectedAcc.account_id}</h2>
                                    <div style={{ color: '#008800', fontSize: 13, marginTop: 4 }}>Account Profile Detail</div>
                                </div>
                                <RiskGauge score={selectedAcc.final_score} size={80} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                                {[
                                    { label: 'Cyber Risk Score', value: `${selectedAcc.cyber_score}/100`, color: selectedAcc.cyber_score > 70 ? '#ff4444' : '#00ff88' },
                                    { label: 'Transaction Risk', value: `${selectedAcc.txn_score}/100`, color: selectedAcc.txn_score > 70 ? '#ff4444' : '#00ff88' },
                                    { label: 'Combined Score', value: `${selectedAcc.final_score}/100`, color: selectedAcc.final_score > 70 ? '#ff4444' : '#00ff88' },
                                    { label: 'Avg Monthly TXN', value: `₹${selectedAcc.avg_monthly_transaction?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: '#cdffcd' },
                                    { label: 'Location', value: selectedAcc.location, color: '#ffffff' },
                                    { label: 'Status', value: selectedAcc.status, color: statusColor(selectedAcc.status) },
                                ].map(({ label, value, color }) => (
                                    <div key={label} style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ fontSize: 10, color: '#008800', marginBottom: 4 }}>{label}</div>
                                        <div style={{ fontSize: 13, color, fontWeight: 'bold' }}>{value}</div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setTriggerAI(Date.now())}
                                style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(136, 255, 136, 0.2))', border: '1px solid #ffffff', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', letterSpacing: '0.05em', boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)', marginBottom: 20 }}
                            >
                                <span>✨</span> ASK GEMINI TO ANALYZE
                            </button>

                            <GeminiPanel
                                prompt={`Analyze this banking account for money mule risk. Account ID: ${selectedAcc.account_id}, Risk Level: ${selectedAcc.risk_level}, Cyber Score: ${selectedAcc.cyber_score}/100, Transaction Risk Score: ${selectedAcc.txn_score}/100, Combined Score: ${selectedAcc.final_score}/100, Status: ${selectedAcc.status}, Location: ${selectedAcc.location}. Provide a 3-sentence investigator summary with a recommended action.`}
                                trigger={triggerAI}
                                dataContext={selectedAcc}
                            />

                            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                                <button style={{ flex: 1, padding: '12px', background: '#ff444422', color: '#ff4444', border: '1px solid #ff444466', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer', fontSize: 12 }}>FREEZE</button>
                                <button style={{ flex: 1, padding: '12px', background: 'transparent', color: '#cdffcd', border: '1px solid #cdffcd', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer', fontSize: 12 }}>FLAG SAR</button>
                                <button style={{ flex: 1, padding: '12px', background: 'transparent', color: '#88ff88', border: '1px solid #88ff88', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer', fontSize: 12 }}>MONITOR</button>
                            </div>
                        </GlassCard>
                    </div>
                )}
            </div>
        </div>
    );
}
