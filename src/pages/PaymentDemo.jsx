import React, { useState } from "react";
import RazorpayDemo from "../components/RazorpayDemo";
import GlassCard from "../components/GlassCard";
import { Shield, CreditCard, Activity, ArrowRight, XCircle, CheckCircle } from "lucide-react";

export default function PaymentDemoPage() {
    const [stats, setStats] = useState({ count: 0, blocked: 0, cleared: 0, amount: 0 });

    const handleStatsUpdate = (data) => {
        setStats(s => ({
            count: s.count + 1,
            blocked: s.blocked + (data.type === 'blocked' ? 1 : 0),
            cleared: s.cleared + (data.type === 'cleared' ? 1 : 0),
            amount: s.amount + (data.type === 'blocked' ? data.amount : 0)
        }));
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(600px, 55%) 1fr', gap: 24, height: '100%' }}>

            {/* LEFT COLUMN: Demo App */}
            <GlassCard style={{ padding: 32, display: 'flex', flexDirection: 'column' }}>
                <RazorpayDemo onStatsUpdate={handleStatsUpdate} />
            </GlassCard>

            {/* RIGHT COLUMN: Instructions & Flow */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                <GlassCard style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 20px 0', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Activity size={16} /> HOW INTERCEPTION WORKS
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>

                        <div style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.05)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', width: '100%', textAlign: 'center' }}>
                            <CreditCard size={16} style={{ marginBottom: 8 }} />
                            <div>Payment Initiated</div>
                        </div>

                        <ArrowRight size={20} style={{ transform: 'rotate(90deg)', color: 'var(--text-muted)' }} />

                        <div style={{ padding: '12px 24px', background: 'var(--accent-dim)', borderRadius: 8, border: '1px solid var(--accent)', color: 'var(--accent)', width: '100%', textAlign: 'center' }}>
                            <Shield size={16} style={{ marginBottom: 8 }} />
                            <div>CyberFusion scans account (real-time)</div>
                        </div>

                        <ArrowRight size={20} style={{ transform: 'rotate(90deg)', color: 'var(--text-muted)' }} />

                        <div style={{ padding: '12px 24px', background: 'var(--warning-dim)', borderRadius: 8, border: '1px solid var(--warning)', color: 'var(--warning)', width: '100%', textAlign: 'center', fontSize: 11 }}>
                            Cross-references:<br />Kill Chain + AML DB + Behavior
                        </div>

                        <ArrowRight size={20} style={{ transform: 'rotate(90deg)', color: 'var(--text-muted)' }} />

                        <div style={{ display: 'flex', gap: 16, width: '100%' }}>
                            <div style={{ flex: 1, padding: '12px', background: 'rgba(255,51,102,0.1)', borderRadius: 8, border: '1px solid #ff3366', color: '#ff3366', textAlign: 'center' }}>
                                <XCircle size={16} style={{ marginBottom: 4 }} />
                                <div style={{ fontSize: 11, fontWeight: 'bold' }}>FLAGGED MULE</div>
                                <div style={{ fontSize: 10, marginTop: 4, opacity: 0.8 }}>Intercept + Block + Alert SOC</div>
                            </div>
                            <div style={{ flex: 1, padding: '12px', background: 'rgba(0,255,0,0.1)', borderRadius: 8, border: '1px solid #00ff00', color: '#00ff00', textAlign: 'center' }}>
                                <CheckCircle size={16} style={{ marginBottom: 4 }} />
                                <div style={{ fontSize: 11, fontWeight: 'bold' }}>SAFE ACCOUNT</div>
                                <div style={{ fontSize: 10, marginTop: 4, opacity: 0.8 }}>Allow payment through</div>
                            </div>
                        </div>

                    </div>
                </GlassCard>

                {/* TEST CREDENTIALS */}
                <GlassCard style={{ padding: '20px 24px', borderLeft: '4px solid var(--special)' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: 12, color: 'var(--special)', letterSpacing: '0.1em' }}>TEST CREDENTIALS (JUDGES)</h4>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--text-main)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div><span style={{ color: 'var(--text-muted)' }}>Card:</span> 4111 1111 1111 1111</div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Expiry:</span> 12/28</div>
                        <div><span style={{ color: 'var(--text-muted)' }}>CVV:</span> 123</div>
                        <div><span style={{ color: 'var(--text-muted)' }}>OTP:</span> 1234</div>
                        <div style={{ gridColumn: '1 / -1', fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                            (Or choose UPI and enter any random VPA string)
                        </div>
                    </div>
                </GlassCard>

                {/* STATS */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 'auto' }}>
                    <StatBox title="Payments Scanned Today" value={stats.count} color="var(--info)" />
                    <StatBox title="Payments Blocked" value={stats.blocked} color="#ff3366" />
                    <StatBox title="Payments Cleared" value={stats.cleared} color="#00ff00" />
                    <StatBox title="Funds Protected" value={`₹${stats.amount.toLocaleString('en-IN')}`} color="var(--accent)" />
                </div>

            </div>

        </div>
    );
}

function StatBox({ title, value, color }) {
    return (
        <GlassCard style={{ padding: 20, borderBottom: `2px solid ${color}` }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</div>
            <div style={{ fontSize: 24, fontWeight: 'bold', fontFamily: "'JetBrains Mono', monospace", color }}>{value}</div>
        </GlassCard>
    );
}
