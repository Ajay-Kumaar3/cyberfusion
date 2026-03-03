import React, { useState, useEffect } from "react";
import GlassCard from "./GlassCard";
import { useBlockchain } from "../context/BlockchainContext";
import { freezeAccountOnChain, attemptTransfer } from "../utils/blockchain";
import { DEMO_CONFIG, truncateAddress } from "../config/demo.config";
import { Check, ShieldAlert, Wallet, ExternalLink, Lock, RotateCcw, AlertTriangle } from "lucide-react";

export default function BlockchainDemo() {
    const { walletConnected, address, signer, connect } = useBlockchain();
    const [targetWallet, setTargetWallet] = useState('');
    const [freezeReason, setFreezeReason] = useState('Confirmed money mule - linked to phishing ring');
    const [isFreezing, setIsFreezing] = useState(false);
    const [isAttempting, setIsAttempting] = useState(false);
    const [freezeResult, setFreezeResult] = useState(null);   // { txHash, etherscanUrl }
    const [blockResult, setBlockResult] = useState(null);     // { blocked, reason } or { blocked:false, txHash }
    const [currentStep, setCurrentStep] = useState(0); // demo step tracker 0-4
    const [error, setError] = useState(null);
    const [liveBlockedEvents] = useState([]);

    // Sync step with connection
    useEffect(() => {
        if (walletConnected && currentStep === 0) {
            setCurrentStep(1);
        }
    }, [walletConnected, currentStep]);

    const handleConnect = async () => {
        try {
            await connect();
        } catch (e) {
            setError(e.message);
        }
    };

    const handleFreeze = async () => {
        if (!targetWallet) {
            setError("Please enter a target wallet address.");
            return;
        }
        setError(null);
        setIsFreezing(true);
        try {
            const result = await freezeAccountOnChain(targetWallet, freezeReason, signer);
            setFreezeResult(result);
            setCurrentStep(3);
        } catch (e) {
            setError(e.message);
        } finally {
            setIsFreezing(false);
        }
    };

    const handleAttempt = async () => {
        setError(null);
        setIsAttempting(true);
        try {
            const result = await attemptTransfer(address, 0.001, signer);
            setBlockResult(result);
            setCurrentStep(4);
        } catch (e) {
            setError(e.message);
        } finally {
            setIsAttempting(false);
        }
    };

    const resetDemo = () => {
        setCurrentStep(1);
        setFreezeResult(null);
        setBlockResult(null);
        setError(null);
    };

    const StepIndicator = () => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 32 }}>
            {[
                { label: "Connect", icon: <Wallet size={14} /> },
                { label: "Configure", icon: <AlertTriangle size={14} /> },
                { label: "Freeze", icon: <Lock size={14} /> },
                { label: "Block", icon: <ShieldAlert size={14} /> }
            ].map((step, idx) => (
                <React.Fragment key={idx}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative' }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: currentStep > idx ? '#00CC3322' : idx === currentStep ? '#00CC33' : 'rgba(255,255,255,0.05)',
                            border: currentStep > idx ? '1px solid #00CC33' : idx === currentStep ? 'none' : '1px solid rgba(0, 255, 65, 0.15)',
                            color: idx === currentStep ? '#000' : currentStep > idx ? '#00CC33' : 'rgba(255,255,255,0.3)',
                            boxShadow: idx === currentStep ? '0 0 15px rgba(0, 204, 51, 0.4)' : 'none',
                            transition: 'all 0.3s'
                        }}>
                            {currentStep > idx ? <Check size={18} /> : <span>{idx + 1}</span>}
                        </div>
                        <span style={{ fontSize: 10, color: idx <= currentStep ? '#00CC33' : 'rgba(255,255,255,0.3)', fontWeight: 600, textTransform: 'uppercase' }}>{step.label}</span>
                    </div>
                    {idx < 3 && <div style={{ height: 1, width: 40, background: currentStep > idx ? '#00CC33' : 'rgba(255,255,255,0.1)', marginBottom: 18 }} />}
                </React.Fragment>
            ))}
        </div>
    );

    return (
        <GlassCard style={{ padding: 32, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,204,51,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: 18, color: '#fff', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 8 }}>
                        ⛓ LIVE BLOCKCHAIN DEMO
                    </h2>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Real-time transaction enforcement on Sepolia Testnet</p>
                </div>
                <div style={{ padding: '4px 10px', borderRadius: 4, background: 'rgba(0, 255, 65, 0.1)', border: '1px solid rgba(0, 255, 65, 0.3)', color: 'var(--accent)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}>
                    SEPOLIA TESTNET
                </div>
            </div>

            <StepIndicator />

            {error && (
                <div style={{ padding: 12, background: 'rgba(0, 255, 65, 0.1)', border: '1px solid rgba(0, 255, 65, 0.3)', borderRadius: 8, color: '#00FF41', fontSize: 12, marginBottom: 20 }}>
                    [!]️ {error}
                </div>
            )}

            {/* STEP 0: CONNECT */}
            {!walletConnected && (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🦊</div>
                    <h3 style={{ margin: '0 0 8px', color: '#fff' }}>Connect MetaMask to begin live demo</h3>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>Ensure you are on Sepolia Testnet with test ETH</p>
                    <button onClick={handleConnect} style={{ padding: '12px 32px', background: '#00CC33', border: 'none', borderRadius: 8, color: '#000', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, margin: '0 auto' }}>
                        <Wallet size={18} /> CONNECT METAMASK
                    </button>
                </div>
            )}

            {/* STEP 1-2: CONFIGURE & FREEZE */}
            {walletConnected && currentStep <= 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: 20, width: 'fit-content', fontSize: 11, color: '#00CC33', border: '1px solid rgba(0,204,51,0.3)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00CC33', boxShadow: '0 0 5px #00CC33' }} />
                        Connected: {truncateAddress(address)}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.05em' }}>TARGET WALLET ADDRESS</label>
                        <input
                            value={targetWallet}
                            onChange={(e) => setTargetWallet(e.target.value)}
                            placeholder="0x... (mule account to freeze)"
                            style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0, 255, 65, 0.15)', borderRadius: 8, color: '#fff', fontSize: 14, fontFamily: "'JetBrains Mono', monospace" }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.05em' }}>FREEZE REASON</label>
                        <input
                            value={freezeReason}
                            onChange={(e) => setFreezeReason(e.target.value)}
                            placeholder="Reason for flagging..."
                            style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0, 255, 65, 0.15)', borderRadius: 8, color: '#fff', fontSize: 14 }}
                        />
                    </div>

                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: -8 }}>
                        💡 <b>For demo:</b> Use a second MetaMask wallet address as the target
                    </p>

                    <button
                        onClick={handleFreeze}
                        disabled={isFreezing}
                        style={{ padding: '14px', background: '#00CC33', border: 'none', borderRadius: 8, color: '#000', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', marginTop: 8 }}
                    >
                        {isFreezing ? (
                            <div style={{ width: 20, height: 20, border: '3px solid #000', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        ) : <><Lock size={18} /> FREEZE ACCOUNT ON-CHAIN</>}
                    </button>
                </div>
            )}

            {/* STEP 3: ATTEMPT TRANSFER */}
            {currentStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {freezeResult && (
                        <div style={{ padding: 16, background: 'rgba(0,204,51,0.05)', border: '1px solid rgba(0,204,51,0.3)', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#00CC33', fontSize: 14, fontWeight: 700 }}>
                                <Check size={18} /> ACCOUNT FROZEN ON-CHAIN
                            </div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                                TX Hash: <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{truncateAddress(freezeResult.txHash)}</span>
                            </div>
                            <a href={freezeResult.etherscanUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#00CC33', fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                                View on Etherscan <ExternalLink size={12} />
                            </a>
                        </div>
                    )}

                    <div style={{ padding: 24, background: 'rgba(0, 255, 65,0.05)', border: '1px solid rgba(0, 255, 65,0.2)', borderRadius: 12 }}>
                        <h3 style={{ margin: '0 0 8px', color: '#00FF41', display: 'flex', alignItems: 'center', gap: 8 }}>
                            [+] NOW ATTEMPT A TRANSFER
                        </h3>
                        <p style={{ margin: '0 0 20px', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Switch MetaMask to the frozen wallet, then click below</p>

                        <div style={{ padding: 16, background: 'rgba(0,0,0,0.4)', borderRadius: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: 24 }}>
                            1. Open <b>MetaMask</b><br />
                            2. Switch to the <b>wallet you just froze</b><br />
                            3. Click the button below — it will be <b>REJECTED</b>
                        </div>

                        <button
                            onClick={handleAttempt}
                            disabled={isAttempting}
                            style={{ padding: '14px', background: 'rgba(0, 255, 65,0.2)', border: '1px solid #00FF41', borderRadius: 8, color: '#00FF41', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%' }}
                        >
                            {isAttempting ? (
                                <div style={{ width: 20, height: 20, border: '3px solid #00FF41', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            ) : <><RotateCcw size={18} /> ATTEMPT TRANSFER (0.001 ETH)</>}
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 4: RESULT */}
            {currentStep === 4 && blockResult && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {blockResult.blocked ? (
                        <div style={{ padding: 32, background: 'rgba(0, 255, 65,0.1)', border: '2px solid #00FF41', borderRadius: 12, textAlign: 'center' }}>
                            <div style={{ background: '#00FF41', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#fff' }}>
                                <ShieldAlert size={32} />
                            </div>
                            <h2 style={{ margin: '0 0 8px', color: '#00FF41', letterSpacing: '0.05em' }}>🚫 TRANSACTION BLOCKED</h2>
                            <p style={{ margin: '0 0 24px', fontSize: 15, color: '#fff' }}>CyberFusion Guard rejected this transaction</p>

                            <div style={{ padding: 16, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0, 255, 65,0.3)', borderRadius: 8, textAlign: 'left', marginBottom: 24 }}>
                                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: 6 }}>BLOCK REASON:</div>
                                <div style={{ fontSize: 14, color: '#00FF41', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{blockResult.reason}</div>
                            </div>

                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>
                                MetaMask showed this rejection in real-time
                            </p>

                            <button onClick={resetDemo} style={{ padding: '12px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: '#fff', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, margin: '0 auto' }}>
                                <RotateCcw size={16} /> RESET DEMO
                            </button>
                        </div>
                    ) : (
                        <div style={{ padding: 32, background: 'rgba(0,204,51,0.1)', border: '2px solid #00CC33', borderRadius: 12, textAlign: 'center' }}>
                            <div style={{ background: '#00CC33', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#000' }}>
                                <Check size={32} />
                            </div>
                            <h2 style={{ margin: '0 0 8px', color: '#00CC33', letterSpacing: '0.05em' }}>✅ TRANSACTION ALLOWED</h2>
                            <p style={{ margin: '0 0 24px', fontSize: 15, color: '#fff' }}>This wallet was not flagged — transfer succeeded</p>

                            {blockResult.txHash && (
                                <a href={`${DEMO_CONFIG.ETHERSCAN_BASE}/tx/${blockResult.txHash}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'rgba(255,255,255,0.05)', borderRadius: 8, color: '#00CC33', textDecoration: 'none', fontSize: 13, marginBottom: 24 }}>
                                    View Hash: {truncateAddress(blockResult.txHash)} <ExternalLink size={14} />
                                </a>
                            )}

                            <button onClick={resetDemo} style={{ padding: '12px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: '#fff', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, margin: '0 auto' }}>
                                <RotateCcw size={16} /> TRY AGAIN
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* LIVE EVENT FEED */}
            {walletConnected && (
                <div style={{ marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00CC33', animation: 'blink 1.5s infinite' }} />
                        <h4 style={{ margin: 0, fontSize: 12, color: '#fff', letterSpacing: '0.05em' }}>LIVE ON-CHAIN EVENTS</h4>
                    </div>

                    <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 8 }}>
                        {liveBlockedEvents.length === 0 ? (
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>Waiting for on-chain activity...</div>
                        ) : (
                            liveBlockedEvents.map((ev, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.02)', padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: "'JetBrains Mono', monospace" }}>{ev.timestamp}</span>
                                    <span style={{
                                        padding: '2px 8px', borderRadius: 4, fontSize: 9, fontWeight: 800,
                                        background: ev.type === 'BLOCKED' ? '#00FF4122' : ev.type === 'ALLOWED' ? '#00CC3322' : '#A8EF0022',
                                        color: ev.type === 'BLOCKED' ? '#00FF41' : ev.type === 'ALLOWED' ? '#00CC33' : '#A8EF00',
                                        border: `1px solid ${ev.type === 'BLOCKED' ? '#00FF4144' : ev.type === 'ALLOWED' ? '#00CC3344' : '#A8EF0044'}`
                                    }}>{ev.type}</span>
                                    <span style={{ fontSize: 11, color: '#fff', fontFamily: "'JetBrains Mono', monospace", flex: 1 }}>{truncateAddress(ev.address)}</span>
                                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{ev.amount}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); borderRadius: 10px; }
      `}</style>
        </GlassCard>
    );
}
