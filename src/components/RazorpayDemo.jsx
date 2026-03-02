import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { initiatePayment, isAccountFlagged, getFlagDetails } from "../utils/razorpay";
import { askGemini } from "../utils/gemini";
import GeminiPanel from "./GeminiPanel";
import GlassCard from "./GlassCard";
import { AlertTriangle, CheckCircle, Lock, FileText, RefreshCw } from "lucide-react";

export default function RazorpayDemo({ onStatsUpdate }) {
    const navigate = useNavigate();
    const [selectedAccount, setSelectedAccount] = useState('ACC-4821');
    const [amount, setAmount] = useState(49999);

    // idle -> scanning -> checkout_open -> intercepting -> blocked | success
    const [demoPhase, setDemoPhase] = useState('idle');

    const [blockData, setBlockData] = useState(null);
    const [successData, setSuccessData] = useState(null);
    const [scanProgress, setScanProgress] = useState(0);
    const [interceptLog, setInterceptLog] = useState([]);

    const [geminiAlert, setGeminiAlert] = useState(null);
    const [isGeminiLoading, setIsGeminiLoading] = useState(false);

    const addLog = (msg, type = 'info') => {
        setInterceptLog(prev => [...prev, { time: new Date().toLocaleTimeString(), msg, type }]);
    };

    const handleStartPayment = () => {
        if (demoPhase !== 'idle' && demoPhase !== 'success' && demoPhase !== 'blocked') return;

        setDemoPhase('scanning');
        setBlockData(null);
        setSuccessData(null);
        setGeminiAlert(null);
        setScanProgress(0);
        setInterceptLog([]);

        addLog(`Initiating payment for ₹${amount.toLocaleString('en-IN')}`, 'info');

        const isFlagged = isAccountFlagged(selectedAccount);
        const flagDetails = getFlagDetails(selectedAccount);

        const scanSteps = [
            { t: 300, msg: `> Checking account ${selectedAccount} against threat database...` },
            { t: 600, msg: `> Cross-referencing with kill chain graph...` },
            { t: 900, msg: `> Behavioral analysis: ${isFlagged ? "ANOMALOUS" : "NORMAL"}` },
            { t: 1200, msg: `> Risk score: ${isFlagged ? `${flagDetails.riskScore}/100 — CRITICAL` : "12/100 — SAFE"}` },
            { t: 1500, msg: `> AML flag: ${isFlagged ? "ACTIVE" : "CLEARED"}` },
            { t: 1800, msg: `> Decision: ${isFlagged ? "MONITOR AND INTERCEPT" : "ALLOW"}` },
            { t: 2000, msg: `> Opening payment gateway...` }
        ];

        let progressInterval = setInterval(() => {
            setScanProgress(p => p >= 100 ? 100 : p + (100 / (2000 / 50)));
        }, 50);

        scanSteps.forEach(step => {
            setTimeout(() => {
                addLog(step.msg, step.msg.includes("CRITICAL") || step.msg.includes("ANOMALOUS") ? 'warning' : 'info');
            }, step.t);
        });

        setTimeout(() => {
            clearInterval(progressInterval);
            setScanProgress(100);
            setDemoPhase('checkout_open');

            initiatePayment({
                accountId: selectedAccount,
                amount: amount * 100, // paise
                onSuccess: (data) => {
                    setDemoPhase('success');
                    setSuccessData({ ...data, accountId: selectedAccount });
                    addLog(`Payment authorized by Razorpay: ${data.paymentId}`, 'success');
                    addLog(`CyberFusion: Transaction cleared.`, 'success');
                    if (onStatsUpdate) onStatsUpdate({ type: 'cleared', amount: amount });
                },
                onBlock: (data) => {
                    setDemoPhase('intercepting');
                    addLog(`CyberFusion intercepting payment pre-settlement...`, 'warning');

                    setTimeout(() => {
                        setDemoPhase('blocked');
                        setBlockData({ ...data, accountId: selectedAccount });
                        addLog(`TRANSACTION INTERCEPTED AND BLOCKED`, 'danger');
                        addLog(`Reason: ${data.flagDetails?.reason || data.error?.description}`, 'danger');
                        if (onStatsUpdate) onStatsUpdate({ type: 'blocked', amount: amount });

                        // Trigger Gemini
                        triggerGemini(selectedAccount, amount, data.flagDetails);
                    }, 1000); // 1s dramatic intercepting phase
                },
                onDismiss: () => {
                    // If user closed the modal manually before intercept
                    // or if they just closed it on a clean account
                    setDemoPhase('idle');
                    addLog(`User closed payment gateway`, 'info');
                }
            });

        }, 2000);
    };

    const triggerGemini = async (accountId, amt, flagDetails) => {
        setIsGeminiLoading(true);
        const prompt = `
      A payment was just intercepted by CyberFusion AML system.
      Account: ${accountId}
      Amount: ₹${amt}
      Flag reason: ${flagDetails.reason}
      Risk score: ${flagDetails.riskScore}/100
      
      Write a 2-sentence SOC analyst alert message about this interception.
      End with one specific recommended next action.
      Be concise and professional.
    `;
        try {
            const resp = await askGemini(prompt);
            setGeminiAlert(resp);
        } catch (e) {
            setGeminiAlert("Failed to generate AI alert. Network error.");
        } finally {
            setIsGeminiLoading(false);
        }
    };

    const isScanning = demoPhase === 'scanning';
    const isIdle = demoPhase === 'idle' || demoPhase === 'scanning';
    const isBlocked = demoPhase === 'blocked';
    const isSuccess = demoPhase === 'success';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>
            {/* HEADER */}
            <div>
                <div style={{ display: 'inline-block', background: 'rgba(0, 255, 65, 0.1)', border: '1px solid rgba(0, 255, 65, 0.3)', color: 'var(--accent)', fontSize: 10, padding: '2px 8px', borderRadius: 4, fontWeight: 'bold', marginBottom: 8, letterSpacing: '0.05em' }}>
                    RAZORPAY TEST MODE
                </div>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, margin: 0, color: 'var(--text-main)', letterSpacing: '0.05em' }}>
                    💳 PAYMENT INTERCEPTION DEMO
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
                    UPI / Card payments blocked in real-time by CyberFusion AI
                </p>
            </div>

            {/* PAYMENT FORM PANEL */}
            {(isIdle || isScanning) && (
                <GlassCard style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
                    {isScanning ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: 280, justifyContent: 'center' }}>
                            <h3 style={{ fontSize: 16, color: 'var(--warning)', margin: 0, display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '0.05em' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--warning)', animation: 'blink 1s infinite' }} />
                                🔍 CYBERFUSION SCANNING...
                            </h3>

                            <div style={{ width: '100%', height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                                <div style={{ width: `${scanProgress}%`, height: '100%', backgroundColor: 'var(--warning)', transition: 'width 0.1s linear' }} />
                            </div>

                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 160 }}>
                                {interceptLog.map((log, i) => (
                                    <div key={i} style={{ color: log.type === 'warning' ? 'var(--warning)' : 'var(--text-main)' }}>
                                        {log.msg}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <h3 style={{ fontSize: 14, color: 'var(--text-main)', margin: 0, letterSpacing: '0.05em' }}>SIMULATE PAYMENT ATTEMPT</h3>

                            <div>
                                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Pay From Account</label>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    {[
                                        { id: 'ACC-4821', risk: 95, color: '#ff3366' },
                                        { id: 'ACC-7743', risk: 88, color: '#ff3366' },
                                        { id: 'ACC-CLEAN', risk: 12, color: '#00ff00' }
                                    ].map(acc => (
                                        <button
                                            key={acc.id}
                                            onClick={() => setSelectedAccount(acc.id)}
                                            style={{
                                                flex: 1, padding: '12px', borderRadius: 8,
                                                background: selectedAccount === acc.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                                                border: `1px solid ${selectedAccount === acc.id ? acc.color : 'rgba(255,255,255,0.1)'}`,
                                                color: 'var(--text-main)', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 'bold',
                                                cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                            }}>
                                            {acc.id}
                                            <span style={{ fontSize: 10, background: `${acc.color}22`, color: acc.color, padding: '2px 6px', borderRadius: 4 }}>
                                                {acc.risk}/100 Risk
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Transfer Amount (INR)</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: 'var(--text-muted)' }}>₹</span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(Number(e.target.value))}
                                        style={{
                                            width: '100%', padding: '16px 16px 16px 40px', borderRadius: 8,
                                            background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                                            color: 'var(--text-main)', fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 'bold', outline: 'none'
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Payment Method</label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {['UPI', 'Credit Card', 'Net Banking', 'Wallet'].map(method => (
                                        <div key={method} style={{
                                            padding: '8px 16px', borderRadius: 20, fontSize: 11, fontWeight: 'bold',
                                            background: method === 'UPI' ? 'var(--accent-dim)' : 'rgba(255,255,255,0.05)',
                                            color: method === 'UPI' ? 'var(--accent)' : 'var(--text-muted)',
                                            border: `1px solid ${method === 'UPI' ? 'var(--accent)' : 'transparent'}`
                                        }}>
                                            {method}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginTop: 8 }}>
                                <button
                                    onClick={handleStartPayment}
                                    className="hover-lift"
                                    style={{
                                        width: '100%', padding: '16px', borderRadius: 8,
                                        background: 'rgba(0, 255, 65, 0.05)', color: '#00FF41',
                                        border: '1px solid rgba(0, 255, 65, 0.3)',
                                        fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 'bold', letterSpacing: '0.05em', cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(0, 255, 65, 0.1)'
                                    }}>
                                    INITIATE PAYMENT
                                </button>
                                {isAccountFlagged(selectedAccount) && (
                                    <div style={{ textAlign: 'center', color: '#ff3366', fontSize: 11, marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                        <AlertTriangle size={12} />
                                        ⚠ WARNING: This account has risk score {getFlagDetails(selectedAccount).riskScore}/100
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </GlassCard>
            )}

            {demoPhase === 'checkout_open' && (
                <div style={{
                    padding: '24px', background: 'rgba(255, 170, 0, 0.1)', border: '1px solid rgba(255, 170, 0, 0.4)', borderRadius: 12,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, animation: 'fadeInUp 0.3s ease'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#ffaa00', fontSize: 16, fontWeight: 'bold', letterSpacing: '0.05em' }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ffaa00', animation: 'blink 1s infinite' }} />
                        ⚡ CYBERFUSION IS MONITORING THIS TRANSACTION...
                    </div>
                    {isAccountFlagged(selectedAccount) && (
                        <div style={{ color: '#ffaa00', fontSize: 14 }}>
                            Intercepting in 4 seconds if flagged...
                        </div>
                    )}
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        (Complete payment in Razorpay window if not simulated)
                    </div>
                </div>
            )}

            {demoPhase === 'intercepting' && (
                <GlassCard style={{
                    padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24,
                    border: '2px solid #ff3366', animation: 'flash-border 1s infinite'
                }}>
                    <h2 style={{ color: '#ff3366', margin: 0, fontSize: 24, display: 'flex', alignItems: 'center', gap: 12, animation: 'blink 0.2s infinite' }}>
                        <AlertTriangle size={32} />
                        🚨 TRANSACTION INTERCEPTED
                    </h2>
                    <div style={{ color: 'var(--text-main)', fontSize: 16, fontFamily: "'JetBrains Mono', monospace" }}>
                        Freezing funds... Notifying authorities...
                    </div>
                    <style>{`
            @keyframes flash-border {
              0% { box-shadow: 0 0 0 0 rgba(255,51,102,0.4); }
              50% { box-shadow: 0 0 40px 10px rgba(255,51,102,0.8); }
              100% { box-shadow: 0 0 0 0 rgba(255,51,102,0.4); }
            }
          `}</style>
                </GlassCard>
            )}

            {isBlocked && blockData && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{
                        background: 'rgba(255,51,102,0.08)', border: '2px solid #ff3366', borderRadius: 12, padding: 32,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
                        boxShadow: '0 0 30px rgba(255,51,102,0.15)', animation: 'fadeInUp 0.3s ease'
                    }}>
                        <div style={{ fontSize: 64 }}>🚫</div>
                        <div style={{ textAlign: 'center' }}>
                            <h2 style={{ color: '#ff3366', fontSize: 32, margin: 0, letterSpacing: '0.05em' }}>PAYMENT BLOCKED</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>CyberFusion AI intercepted this transaction pre-settlement</p>
                        </div>

                        <div style={{ width: '100%', maxWidth: 500, background: 'rgba(0,0,0,0.4)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', padding: 20, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>ACCOUNT:</span>
                                <span>{blockData.accountId}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>AMOUNT:</span>
                                <span style={{ fontWeight: 'bold' }}>₹{blockData.amount?.toLocaleString('en-IN')}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>INTERCEPTED:</span>
                                <span>{blockData.interceptedAt}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>PAYMENT REF:</span>
                                <span>{blockData.simulatedPaymentId || blockData.paymentId || 'N/A'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ff3366' }}>
                                <span style={{ color: 'rgba(255,51,102,0.7)' }}>RISK SCORE:</span>
                                <span>{blockData.flagDetails?.riskScore || 100}/100 — CRITICAL</span>
                            </div>
                        </div>

                        {blockData.flagDetails?.reason && (
                            <div style={{ width: '100%', maxWidth: 500, borderLeft: '4px solid #ff3366', background: 'rgba(255,51,102,0.1)', padding: '12px 16px', borderRadius: '0 8px 8px 0', fontSize: 13, color: '#ffaaaa' }}>
                                <strong>BLOCK REASON:</strong> {blockData.flagDetails.reason}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                            <button onClick={() => navigate('/accounts')} style={{ ...btnStyle, background: 'rgba(255,51,102,0.15)', border: '1px solid #ff3366', color: '#ff3366' }}>
                                <Lock size={16} /> FREEZE ACCOUNT
                            </button>
                            <button onClick={() => navigate('/reports')} style={{ ...btnStyle, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-main)' }}>
                                <FileText size={16} /> FILE SAR REPORT
                            </button>
                            <button onClick={() => setDemoPhase('idle')} style={{ ...btnStyle, background: 'transparent', border: 'none', color: 'var(--text-muted)' }}>
                                <RefreshCw size={16} /> TRY AGAIN
                            </button>
                        </div>

                        <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
                            In production: Funds held in escrow. Notified: RBI FIU, Bank Compliance, SOC Team
                        </div>
                    </div>

                    {blockData && (
                        <GeminiPanel
                            title="GEMINI ANALYST ALERT"
                            prompt={null}
                            response={geminiAlert}
                            loading={isGeminiLoading}
                        />
                    )}
                </div>
            )}

            {isSuccess && successData && (
                <div style={{
                    background: 'rgba(0,255,0,0.08)', border: '2px solid #00ff00', borderRadius: 12, padding: 32,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
                    boxShadow: '0 0 30px rgba(0,255,0,0.1)', animation: 'fadeInUp 0.3s ease'
                }}>
                    <CheckCircle size={48} color="#00ff00" />
                    <h2 style={{ color: '#00ff00', fontSize: 24, margin: 0, letterSpacing: '0.05em' }}>✅ PAYMENT CLEARED</h2>
                    <p style={{ color: 'var(--text-main)', fontSize: 14 }}>Account verified — no threats detected</p>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: 'var(--text-muted)', background: 'rgba(0,0,0,0.3)', padding: '8px 16px', borderRadius: 6 }}>
                        ID: {successData.paymentId}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>This account passed all CyberFusion security checks</p>
                    <button onClick={() => setDemoPhase('idle')} style={{ ...btnStyle, background: 'transparent', border: '1px solid #00ff00', color: '#00ff00', marginTop: 16 }}>
                        <RefreshCw size={16} /> NEW PAYMENT
                    </button>
                </div>
            )}

            <div style={{ marginTop: 'auto', background: '#0a0a0a', border: '1px solid #222', borderRadius: 8, padding: 16 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--text-muted)', animation: 'blink 2s infinite' }} />
                    INTERCEPT LOG
                </h4>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, height: 120, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {interceptLog.length === 0 ? (
                        <div style={{ color: '#444' }}>Waiting for activity...</div>
                    ) : (
                        interceptLog.map((log, i) => {
                            let color = '#888';
                            if (log.type === 'success') color = '#00ff00';
                            if (log.type === 'warning') color = '#ffaa00';
                            if (log.type === 'danger') color = '#ff3366';

                            return (
                                <div key={i} style={{ display: 'flex', gap: 12 }}>
                                    <span style={{ color: '#555', flexShrink: 0 }}>[{log.time}]</span>
                                    <span style={{ color }}>{log.msg}</span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

const btnStyle = {
    padding: '10px 20px', borderRadius: 8, fontSize: 12, fontWeight: 'bold', fontFamily: "'Space Grotesk', sans-serif",
    display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s'
};
