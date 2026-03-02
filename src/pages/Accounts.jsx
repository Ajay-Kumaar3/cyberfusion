import React, { useState, useEffect } from "react";
import GlassCard from "../components/GlassCard";
import RiskGauge from "../components/RiskGauge";
import GeminiPanel from "../components/GeminiPanel";
import { fetchAccounts } from "../api/api";
import { useBlockchain } from "../context/BlockchainContext";
import { freezeAccountOnChain } from "../utils/blockchain";
import { DEMO_CONFIG, truncateAddress } from "../config/demo.config";
import { ExternalLink, ShieldAlert, Lock } from "lucide-react";

const riskColor = (level) => ({ Critical: "#00FF41", High: "#A8EF00", Medium: "#A8EF00" }[level] || "#00CC33");
const statusColor = (s) => ({ Compromised: "#00FF41", Flagged: "#A8EF00", Frozen: "#889488" }[s] || "#00CC33");

export default function Accounts() {
    const { signer, walletConnected, connect } = useBlockchain();
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAcc, setSelectedAcc] = useState(null);
    const [triggerAI, setTriggerAI] = useState(0);
    const [isFreezing, setIsFreezing] = useState(false);
    const [lastTx, setLastTx] = useState(null);

    // Get demo wallet if this is a demo account
    const demoWallet = selectedAcc ? DEMO_CONFIG.MULE_WALLET_MAP[selectedAcc.account_id] : null;

    const handleOnChainFreeze = async () => {
        if (!walletConnected) {
            try {
                await connect();
            } catch (e) {
                alert("Connect failed: " + e.message);
                return;
            }
        }
        if (!demoWallet) return;

        setIsFreezing(true);
        try {
            const result = await freezeAccountOnChain(
                demoWallet,
                `Automated freeze by CyberFusion Pro: Risk Score ${selectedAcc.final_score}`,
                signer
            );
            setLastTx(result);
            alert("SUCCESS: Account frozen on-chain via Sepolia contract.");
        } catch (e) {
            alert("Freeze failed: " + e.message);
        } finally {
            setIsFreezing(false);
        }
    };

    useEffect(() => {
        fetchAccounts({ limit: 50 })
            .then(data => { setAccounts(data); if (data.length) setSelectedAcc(data[0]); })
            .catch(err => console.error("Accounts API:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: '#7A8E7A', fontSize: 18, fontFamily: "'JetBrains Mono',monospace" }}>
            Loading accounts from Neon DB...
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(0,255,65,0.2)', paddingBottom: 16 }}>
                <div>
                    <h1 style={{ fontSize: 24, margin: 0, color: '#ffffff' }}>MULE RING DETECTION</h1>
                    <div style={{ color: '#00FF41', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00FF41', animation: 'blink 1.5s infinite' }}></span>
                        {accounts.filter(a => a.risk_level === 'High' || a.risk_level === 'Critical').length} high-risk accounts detected
                    </div>
                </div>
                <div style={{ fontSize: 13, color: '#7A8E7A' }}>{accounts.length} accounts monitored</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, minHeight: 600 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', maxHeight: 700, paddingRight: 8 }}>
                    {accounts.map(acc => (
                        <GlassCard key={acc.account_id} hover={true}
                            style={{
                                padding: 16,
                                cursor: 'pointer',
                                flexShrink: 0,
                                border: selectedAcc?.account_id === acc.account_id ? `1px solid var(--accent)` : '1px solid rgba(0, 255, 65, 0.3)',
                                background: selectedAcc?.account_id === acc.account_id ? 'rgba(0, 255, 65, 0.1)' : 'rgba(255, 255, 255, 0.02)'
                            }}
                            onClick={() => { setSelectedAcc(acc); setTriggerAI(0); setLastTx(null); }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <div>
                                    <div style={{ fontSize: 16, fontWeight: 'bold', color: '#ffffff', fontFamily: "'JetBrains Mono',monospace" }}>{acc.account_id}</div>
                                    <div style={{ fontSize: 12, color: '#7A8E7A' }}>Name: <span style={{ filter: 'blur(3px)' }}>{acc.name}</span></div>
                                </div>
                                <div style={{ background: `${statusColor(acc.status)}22`, color: statusColor(acc.status), padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 'bold', border: `1px solid ${statusColor(acc.status)}44` }}>
                                    {acc.status?.toUpperCase()}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                                <RiskGauge score={acc.final_score} size={60} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11 }}>
                                        <span style={{ color: '#7A8E7A' }}>Risk Level</span>
                                        <span style={{ color: riskColor(acc.risk_level), fontWeight: 'bold' }}>{acc.risk_level}</span>
                                    </div>
                                    <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                                        <div style={{ width: `${acc.final_score}%`, height: '100%', background: riskColor(acc.risk_level), borderRadius: 2 }}></div>
                                    </div>
                                    <div style={{ marginTop: 8, display: 'flex', gap: 16, fontSize: 11 }}>
                                        <span style={{ color: '#7A8E7A' }}>Cyber: <span style={{ color: '#fff' }}>{acc.cyber_score}</span></span>
                                        <span style={{ color: '#7A8E7A' }}>TXN: <span style={{ color: '#fff' }}>{acc.txn_score}</span></span>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>

                {selectedAcc && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <GlassCard style={{ padding: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                <div>
                                    <h2 style={{ fontSize: 24, margin: 0, fontFamily: "'JetBrains Mono',monospace", color: '#ffffff' }}>{selectedAcc.account_id}</h2>
                                    <div style={{ color: '#7A8E7A', fontSize: 13, marginTop: 4 }}>Account Profile Detail</div>
                                </div>
                                <RiskGauge score={selectedAcc.final_score} size={80} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                                {[
                                    { label: 'Cyber Risk Score', value: `${selectedAcc.cyber_score}/100`, color: selectedAcc.cyber_score > 70 ? '#00FF41' : '#00CC33' },
                                    { label: 'Transaction Risk', value: `${selectedAcc.txn_score}/100`, color: selectedAcc.txn_score > 70 ? '#00FF41' : '#00CC33' },
                                    { label: 'Combined Score', value: `${selectedAcc.final_score}/100`, color: selectedAcc.final_score > 70 ? '#00FF41' : '#00CC33' },
                                    { label: 'Avg Monthly TXN', value: `₹${(selectedAcc.avg_monthly_transaction || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: '#cdffcd' },
                                    { label: 'Location', value: selectedAcc.location || '—', color: '#ffffff' },
                                    { label: 'Status', value: selectedAcc.status, color: statusColor(selectedAcc.status) },
                                ].map(({ label, value, color }) => (
                                    <div key={label} style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ fontSize: 10, color: '#7A8E7A', marginBottom: 4 }}>{label}</div>
                                        <div style={{ fontSize: 13, color, fontWeight: 'bold' }}>{value}</div>
                                    </div>
                                ))}
                            </div>

                            {demoWallet && (
                                <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(0,204,51,0.05)', border: '1px solid rgba(0,204,51,0.2)', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: 10, color: '#00CC33', fontWeight: 800, textTransform: 'uppercase', marginBottom: 2 }}>Blockchain Demo Linked</div>
                                        <div style={{ fontSize: 13, color: '#fff', fontFamily: "'JetBrains Mono', monospace" }}>{truncateAddress(demoWallet)}</div>
                                    </div>
                                    <div style={{ padding: '4px 8px', borderRadius: 4, background: '#00CC3322', color: '#00CC33', fontSize: 10, fontWeight: 800 }}>SEPOLIA</div>
                                </div>
                            )}

                            <button onClick={() => setTriggerAI(Date.now())}
                                style={{ width: '100%', padding: '14px', background: 'rgba(0, 255, 65, 0.05)', border: '1px solid rgba(0, 255, 65, 0.2)', borderRadius: 12, color: 'var(--text-main)', fontSize: 13, fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', marginBottom: 20, letterSpacing: '0.05em' }} className="hover-lift">
                                ASK GEMINI TO ANALYZE <span>&gt;</span>
                            </button>

                            <GeminiPanel
                                prompt={`Analyze this banking account for money mule risk. Account ID: ${selectedAcc.account_id}, Risk Level: ${selectedAcc.risk_level}, Cyber Score: ${selectedAcc.cyber_score}/100, Transaction Risk: ${selectedAcc.txn_score}/100, Combined Score: ${selectedAcc.final_score}/100, Status: ${selectedAcc.status}, Location: ${selectedAcc.location}. Give a 3-sentence investigator summary with recommended action.`}
                                trigger={triggerAI}
                                dataContext={selectedAcc}
                            />

                            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                                {demoWallet ? (
                                    <button
                                        onClick={handleOnChainFreeze}
                                        disabled={isFreezing}
                                        className="hover-lift"
                                        style={{ flex: 2, padding: '12px', background: 'rgba(0, 255, 65, 0.1)', color: '#00FF41', border: '1px solid rgba(0, 255, 65, 0.3)', borderRadius: 12, fontWeight: '800', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, letterSpacing: '0.05em' }}
                                    >
                                        {isFreezing ? (
                                            <div style={{ width: 16, height: 16, border: '2px solid #00FF41', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                        ) : <><Lock size={14} /> FREEZE ON-CHAIN</>}
                                    </button>
                                ) : (
                                    <button className="hover-lift" style={{ flex: 1, padding: '12px', background: 'rgba(0, 255, 65, 0.05)', color: '#00FF41', border: '1px solid rgba(0, 255, 65, 0.15)', borderRadius: 12, fontWeight: '800', cursor: 'pointer', fontSize: 11, letterSpacing: '0.05em' }}>FREEZE</button>
                                )}
                                <button className="hover-lift" style={{ flex: 1, padding: '12px', background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-muted)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: 12, fontWeight: '800', cursor: 'pointer', fontSize: 11, letterSpacing: '0.05em' }}>FLAG SAR</button>
                                <button className="hover-lift" style={{ flex: 1, padding: '12px', background: 'rgba(0, 255, 65, 0.05)', color: '#00FF41', border: '1px solid rgba(0, 255, 65, 0.15)', borderRadius: 12, fontWeight: '800', cursor: 'pointer', fontSize: 11, letterSpacing: '0.05em' }}>MONITOR</button>
                            </div>

                            {lastTx && (
                                <div style={{ marginTop: 16, textAlign: 'center' }}>
                                    <a href={lastTx.etherscanUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#00CC33', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                        On-Chain Receipt <ExternalLink size={10} />
                                    </a>
                                </div>
                            )}
                        </GlassCard>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
