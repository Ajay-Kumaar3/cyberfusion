import React, { useState } from "react";
import GlassCard from "../components/GlassCard";
import RiskGauge from "../components/RiskGauge";
import GeminiPanel from "../components/GeminiPanel";
import { mockAccounts } from "../data/mockAccounts";

export default function Accounts() {
    const [selectedAcc, setSelectedAcc] = useState(mockAccounts[0]);
    const [triggerAI, setTriggerAI] = useState(0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(0, 255, 0, 0.2)', paddingBottom: 16 }}>
                <div>
                    <h1 style={{ fontSize: 24, margin: 0, color: '#ffffff' }}>MULE RING DETECTION</h1>
                    <div style={{ color: '#88ff88', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#88ff88', animation: 'blink 1.5s infinite' }}></span>
                        6 accounts in active ring
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, minHeight: 600 }}>

                {/* Left List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', paddingRight: 8 }}>
                    {mockAccounts.map(acc => (
                        <GlassCard
                            key={acc.id}
                            hover={true}
                            style={{ padding: 16, cursor: 'pointer', border: selectedAcc.id === acc.id ? '1px solid #00ff00' : '1px solid rgba(0, 255, 0, 0.15)', background: selectedAcc.id === acc.id ? 'rgba(0, 255, 0, 0.05)' : '' }}
                            className="glass-card"
                            onClick={() => { setSelectedAcc(acc); setTriggerAI(0); }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <div>
                                    <div style={{ fontSize: 16, fontWeight: 'bold', color: '#ffffff', fontFamily: "'JetBrains Mono', monospace" }}>{acc.id}</div>
                                    <div style={{ fontSize: 12, color: '#008800' }}>Name: <span style={{ filter: 'blur(3px)' }}>{acc.name}</span></div>
                                </div>
                                <div style={{ background: acc.status === 'FLAGGED' ? '#cdffcd22' : acc.status === 'FROZEN' ? '#ffffff22' : '#00ff0022', color: acc.status === 'FLAGGED' ? '#cdffcd' : acc.status === 'FROZEN' ? '#ffffff' : '#00ff00', padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 'bold', border: `1px solid ${acc.status === 'FLAGGED' ? '#cdffcd' : acc.status === 'FROZEN' ? '#ffffff' : '#00ff00'}44` }}>
                                    {acc.status}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                                <RiskGauge score={acc.score} size={60} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11 }}>
                                        <span style={{ color: '#008800' }}>Mule Confidence</span>
                                        <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{acc.muleConfidence}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                                        <div style={{ width: `${acc.muleConfidence}%`, height: '100%', background: acc.muleConfidence > 80 ? '#ffffff' : '#cdffcd', borderRadius: 2, boxShadow: '0 0 4px ' + (acc.muleConfidence > 80 ? '#ffffff' : '#cdffcd') }}></div>
                                    </div>

                                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'flex-end', gap: 4, height: 20 }}>
                                        <span style={{ fontSize: 9, color: '#008800', width: 40 }}>Velocity</span>
                                        {acc.txnVelocity.map((v, i) => (
                                            <div key={i} style={{ width: 8, height: `${Math.min(100, (v / 500) * 100)}%`, background: i === acc.txnVelocity.length - 1 ? '#ffffff' : '#88ff88', borderRadius: 2 }}></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>

                {/* Right Detail */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <GlassCard style={{ padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <div>
                                <h2 style={{ fontSize: 24, margin: 0, fontFamily: "'JetBrains Mono', monospace", color: '#ffffff' }}>{selectedAcc.id}</h2>
                                <div style={{ color: '#008800', fontSize: 13, marginTop: 4 }}>Account Profile Detail</div>
                            </div>
                            <RiskGauge score={selectedAcc.score} size={80} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: 10, color: '#008800', marginBottom: 4 }}>Behavioral Fingerprint</div>
                                <div style={{ fontSize: 13, color: '#ffffff', fontWeight: 'bold' }}>Geographic Inconsistency (94%)</div>
                            </div>
                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: 10, color: '#008800', marginBottom: 4 }}>Velocity Check</div>
                                <div style={{ fontSize: 13, color: '#cdffcd', fontWeight: 'bold' }}>400% above 30-day avg</div>
                            </div>
                        </div>

                        <button
                            onClick={() => setTriggerAI(Date.now())}
                            style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(136, 255, 136, 0.2))', border: '1px solid #ffffff', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.05em', boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)', marginBottom: 20 }}
                        >
                            <span>✨</span> ASK GEMINI TO ANALYZE
                        </button>

                        <GeminiPanel
                            prompt={`Analyze this account profile and determine if this is a money mule. Account ID: ${selectedAcc.id}, Velocity Spike: ${selectedAcc.txnVelocity.join(',')}, Confidence: ${selectedAcc.muleConfidence}`}
                            trigger={triggerAI}
                            dataContext={selectedAcc}
                        />

                        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                            <button style={{ flex: 1, padding: '12px', background: '#ffffff', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", fontSize: 12 }}>FREEZE</button>
                            <button style={{ flex: 1, padding: '12px', background: 'transparent', color: '#cdffcd', border: '1px solid #cdffcd', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", fontSize: 12 }}>FLAG SAR</button>
                            <button style={{ flex: 1, padding: '12px', background: 'transparent', color: '#88ff88', border: '1px solid #88ff88', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", fontSize: 12 }}>MONITOR</button>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
