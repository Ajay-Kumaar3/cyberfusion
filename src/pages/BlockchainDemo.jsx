import React, { useState, useEffect } from "react";
import GlassCard from "../components/GlassCard";
import BlockchainDemo from "../components/BlockchainDemo";
import { useBlockchain } from "../context/BlockchainContext";
import { DEMO_CONFIG, truncateAddress } from "../config/demo.config";
import { getContract } from "../utils/blockchain";
import { Info, Shield, Layers, ArrowDown, ExternalLink, Activity } from "lucide-react";

export default function BlockchainDemoPage() {
    const { blockedCount, address, provider } = useBlockchain();
    const [totalBlocked, setTotalBlocked] = useState(0);

    useEffect(() => {
        if (provider) {
            try {
                const contract = getContract(provider);
                contract.getBlockedHistory()
                    .then(history => setTotalBlocked(history.length))
                    .catch(err => console.error("Error fetching history:", err));
            } catch (err) {
                console.warn("Blockchain demo not fully configured:", err.message);
                setTotalBlocked("N/A");
            }
        }
    }, [provider, blockedCount]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
                <h1 style={{ margin: 0, fontSize: 32, letterSpacing: '-0.02em', color: '#fff' }}>LIVE TRANSACTION BLOCKING DEMO</h1>
                <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: 16 }}>Real-time on-chain enforcement via Sepolia Testnet</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24 }}>
                {/* LEFT COLUMN: THE ACTUAL DEMO PANEL */}
                <div>
                    <BlockchainDemo />
                </div>

                {/* RIGHT COLUMN: EXPLAINER & STATUS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* HOW IT WORKS */}
                    <GlassCard style={{ padding: 24 }}>
                        <h3 style={{ margin: '0 0 20px', fontSize: 14, color: '#fff', display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '0.05em' }}>
                            <Activity size={16} color="#00CC33" /> HOW IT WORKS
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '10px 0' }}>
                            {[
                                { label: "CyberFusion detects mule", color: "#00CC33" },
                                { label: "Analyst clicks FREEZE", color: "#00CC33" },
                                { label: "Smart contract blacklists wallet", color: "#A8EF00" },
                                { label: "Mule attempts transfer", color: "#00FF41" },
                                { label: "Contract REVERTS transaction", color: "#00FF41" },
                                { label: "MetaMask shows real error", color: "#00FF41" }
                            ].map((step, i) => (
                                <React.Fragment key={i}>
                                    <div style={{
                                        padding: '12px 20px', width: '100%', textAlign: 'center',
                                        background: `${step.color}11`, border: `1px solid ${step.color}22`,
                                        borderRadius: 8, color: step.color, fontSize: 12, fontWeight: 700
                                    }}>
                                        {step.label}
                                    </div>
                                    {i < 5 && <ArrowDown size={14} color="rgba(255,255,255,0.2)" />}
                                </React.Fragment>
                            ))}
                        </div>
                    </GlassCard>

                    {/* CONTRACT INFO */}
                    <GlassCard style={{ padding: 24 }}>
                        <h3 style={{ margin: '0 0 20px', fontSize: 14, color: '#fff', display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '0.05em' }}>
                            <Layers size={16} color="#00ffff" /> CONTRACT INFORMATION
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {[
                                { label: 'Network', value: 'Sepolia Testnet', color: '#00ffff' },
                                { label: 'Contract', value: truncateAddress(DEMO_CONFIG.CONTRACT_ADDRESS), link: `${DEMO_CONFIG.ETHERSCAN_BASE}/address/${DEMO_CONFIG.CONTRACT_ADDRESS}` },
                                { label: 'Owner', value: address ? truncateAddress(address) : 'Not connected' },
                                { label: 'Total Blocked', value: totalBlocked, color: '#00FF41', bold: true },
                            ].map((row, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 12 }}>
                                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{row.label.toUpperCase()}</span>
                                    {row.link ? (
                                        <a href={row.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#fff', fontFamily: "'JetBrains Mono', monospace", textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            {row.value} <ExternalLink size={12} color="#00CC33" />
                                        </a>
                                    ) : (
                                        <span style={{ fontSize: 13, color: row.color || '#fff', fontWeight: row.bold ? 800 : 400, fontFamily: row.label === 'Owner' ? "'JetBrains Mono', monospace" : 'inherit' }}>
                                            {row.value}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: 24, padding: 12, background: 'rgba(0,0,0,0.3)', borderRadius: 8, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                            <Info size={16} color="#00CC33" style={{ marginTop: 2, flexShrink: 0 }} />
                            <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                                The contract uses <code>revert()</code> to stop money movement at the protocol level. No funds leave the sender's wallet if they are flagged.
                            </p>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
