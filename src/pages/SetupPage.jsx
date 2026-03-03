import React, { useState, useEffect } from "react";
import GlassCard from "../components/GlassCard";
import { useBlockchain } from "../context/BlockchainContext";
import { DEMO_CONFIG } from "../config/demo.config";
import { getContract, unfreezeAccountOnChain } from "../utils/blockchain";
import { CheckCircle2, XCircle, Info, RefreshCw, Trash2, Wallet } from "lucide-react";
import { ethers } from "ethers";

export default function SetupPage() {
    const { walletConnected, address, provider, signer, connect } = useBlockchain();
    const [checks, setChecks] = useState([
        { id: 'metamask', label: 'MetaMask installed', status: 'pending', desc: 'Checks window.ethereum existence' },
        { id: 'sepolia', label: 'Connected to Sepolia', status: 'pending', desc: 'Checks chainId === 0xaa36a7' },
        { id: 'balance', label: 'Wallet has Sepolia ETH', status: 'pending', desc: 'Checks balance > 0.01 ETH' },
        { id: 'contract', label: 'Contract deployed', status: 'pending', desc: 'CONTRACT_ADDRESS is not placeholder' },
        { id: 'reachable', label: 'Contract reachable', status: 'pending', desc: 'Calls getBlockedHistory()' },
        { id: 'owner', label: 'Owner wallet connected', status: 'pending', desc: 'Signer address matches contract owner' },
    ]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const runChecks = async () => {
        setIsRefreshing(true);
        const newChecks = [...checks];

        // 1. MetaMask
        newChecks[0].status = window.ethereum ? 'success' : 'fail';

        // 2. Sepolia
        if (window.ethereum) {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            newChecks[1].status = chainId === DEMO_CONFIG.SEPOLIA_CHAIN_ID ? 'success' : 'fail';
        } else {
            newChecks[1].status = 'fail';
        }

        // 3. Balance
        if (walletConnected && provider) {
            const bal = await provider.getBalance(address);
            newChecks[2].status = ethers.formatEther(bal) > 0.01 ? 'success' : 'fail';
        } else {
            newChecks[2].status = 'fail';
        }

        // 4. Contract Deployed
        newChecks[3].status = (DEMO_CONFIG.CONTRACT_ADDRESS && DEMO_CONFIG.CONTRACT_ADDRESS.startsWith('0x') && DEMO_CONFIG.CONTRACT_ADDRESS.length === 42) ? 'success' : 'fail';

        // 5. Reachable
        if (provider && newChecks[3].status === 'success') {
            try {
                const contract = getContract(provider);
                await contract.getBlockedHistory();
                newChecks[4].status = 'success';
            } catch (e) {
                newChecks[4].status = 'fail';
            }
        } else {
            newChecks[4].status = 'fail';
        }

        // 6. Owner
        if (provider && signer && newChecks[4].status === 'success') {
            try {
                const contract = getContract(provider);
                const owner = await contract.owner();
                newChecks[5].status = (owner.toLowerCase() === address.toLowerCase()) ? 'success' : 'fail';
            } catch (e) {
                newChecks[5].status = 'fail';
            }
        } else {
            newChecks[5].status = 'fail';
        }

        setChecks(newChecks);
        setIsRefreshing(false);
    };

    useEffect(() => {
        if (walletConnected) runChecks();
    }, [walletConnected]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleResetDemo = async () => {
        if (!window.confirm("This will unflag all demo wallets and clear history. Proceed?")) return;
        setIsResetting(true);
        try {
            for (const accountId in DEMO_CONFIG.MULE_WALLET_MAP) {
                const addr = DEMO_CONFIG.MULE_WALLET_MAP[accountId];
                if (addr.startsWith('0x')) {
                    await unfreezeAccountOnChain(addr, signer);
                    console.log(`Unflagged ${accountId}: ${addr}`);
                }
            }
            alert("Demo state reset successfully!");
        } catch (e) {
            alert("Reset failed: " + e.message);
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 32, letterSpacing: '-0.02em', color: '#fff' }}>DEMO SETUP CHECKLIST</h1>
                    <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: 16 }}>Pre-flight verification for the live presentation</p>
                </div>
                <button
                    onClick={runChecks}
                    disabled={isRefreshing}
                    style={{ padding: '10px 16px', borderRadius: 8, background: '#00CC33', border: 'none', color: '#000', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                    <RefreshCw size={18} className={isRefreshing ? "spin" : ""} /> RUN ALL CHECKS
                </button>
            </div>

            {!walletConnected && (
                <div style={{ padding: 24, background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: '1px solid rgba(0, 255, 65, 0.15)', textAlign: 'center' }}>
                    <h3 style={{ margin: '0 0 16px', color: '#fff' }}>Connect Wallet to Begin Checks</h3>
                    <button onClick={connect} style={{ padding: '12px 24px', background: '#00CC33', border: 'none', borderRadius: 8, color: '#000', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, margin: '0 auto' }}>
                        <Wallet size={18} /> CONNECT METAMASK
                    </button>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
                {checks.map(check => (
                    <GlassCard key={check.id} style={{ padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <h4 style={{ margin: 0, color: '#fff', fontSize: 14 }}>{check.label}</h4>
                            {check.status === 'success' ? (
                                <CheckCircle2 color="#00CC33" size={24} />
                            ) : check.status === 'fail' ? (
                                <XCircle color="#00FF41" size={24} />
                            ) : (
                                <RefreshCw color="rgba(255,255,255,0.2)" size={24} />
                            )}
                        </div>
                        <p style={{ margin: '0 0 12px', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{check.desc}</p>
                        {check.status === 'fail' && (
                            <div style={{ padding: 10, background: 'rgba(0, 255, 65, 0.1)', borderRadius: 6, fontSize: 11, color: '#00FF41', border: '1px solid rgba(0, 255, 65, 0.2)' }}>
                                FIX: {check.id === 'sepolia' ? 'Switch MetaMask to Sepolia Testnet' :
                                    check.id === 'balance' ? 'Get test ETH from a Sepolia faucet' :
                                        check.id === 'contract' ? 'Paste the address in src/config/demo.config.js' :
                                            check.id === 'owner' ? 'Connect the wallet that deployed the contract' :
                                                'Please check manual setup steps'}
                            </div>
                        )}
                    </GlassCard>
                ))}
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
                <GlassCard style={{ flex: 1, padding: 24, border: '1px solid rgba(0, 255, 65, 0.2)' }}>
                    <h3 style={{ margin: '0 0 12px', fontSize: 14, color: '#00FF41', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Trash2 size={16} /> DANGER ZONE
                    </h3>
                    <p style={{ margin: '0 0 20px', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                        Resetting the demo state will unflag all configured wallets in the smart contract.
                    </p>
                    <button
                        onClick={handleResetDemo}
                        className={isResetting ? "shimmer" : ""}
                        style={{ width: '100%', padding: '12px', borderRadius: 8, background: 'transparent', border: '1px solid #00FF41', color: '#00FF41', fontWeight: 700, cursor: 'pointer' }}
                    >
                        RESET DEMO STATE
                    </button>
                </GlassCard>

                <GlassCard style={{ flex: 1, padding: 24 }}>
                    <h3 style={{ margin: '0 0 12px', fontSize: 14, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Info size={16} color="#00CC33" /> QUICK LINKS
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                        <a href="https://sepolia-faucet.pk910.de/" target="_blank" rel="noopener noreferrer" style={{ color: '#00CC33', fontSize: 13, textDecoration: 'none' }}>→ Sepolia Faucet ↗</a>
                        <a href="https://remix.ethereum.org" target="_blank" rel="noopener noreferrer" style={{ color: '#00CC33', fontSize: 13, textDecoration: 'none' }}>→ Remix IDE ↗</a>
                        <a href={DEMO_CONFIG.ETHERSCAN_BASE} target="_blank" rel="noopener noreferrer" style={{ color: '#00CC33', fontSize: 13, textDecoration: 'none' }}>→ Sepolia Etherscan ↗</a>
                    </div>
                </GlassCard>
            </div>

            <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .shimmer { opacity: 0.5; cursor: not-allowed; }
      `}</style>
        </div>
    );
}
