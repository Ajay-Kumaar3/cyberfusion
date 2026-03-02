import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { connectWallet, listenToBlockedTransactions } from '../utils/blockchain';

const BlockchainContext = createContext();

export const useBlockchain = () => {
    const context = useContext(BlockchainContext);
    if (!context) throw new Error("useBlockchain must be used within a BlockchainProvider");
    return context;
};

export const BlockchainProvider = ({ children }) => {
    const [blockedCount, setBlockedCount] = useState(0);
    const [recentBlockedTxs, setRecentBlockedTxs] = useState([]);
    const [walletConnected, setWalletConnected] = useState(false);
    const [signer, setSigner] = useState(null);
    const [address, setAddress] = useState('');
    const [provider, setProvider] = useState(null);

    const connect = useCallback(async () => {
        try {
            const { signer, address, provider } = await connectWallet();
            setSigner(signer);
            setAddress(address);
            setProvider(provider);
            setWalletConnected(true);
            return { signer, address, provider };
        } catch (error) {
            console.error("Wallet connection failed:", error);
            throw error;
        }
    }, []);

    const addBlockedEvent = useCallback((event) => {
        setBlockedCount(prev => prev + 1);
        setRecentBlockedTxs(prev => [event, ...prev].slice(0, 10)); // Keep last 10
    }, []);

    useEffect(() => {
        if (walletConnected && provider) {
            try {
                const cleanup = listenToBlockedTransactions(provider, addBlockedEvent);
                return () => cleanup();
            } catch (err) {
                console.warn("Could not start blockchain listeners:", err.message);
            }
        }
    }, [walletConnected, provider, addBlockedEvent]);

    return (
        <BlockchainContext.Provider value={{
            blockedCount,
            recentBlockedTxs,
            walletConnected,
            signer,
            address,
            provider,
            connect,
            addBlockedEvent
        }}>
            {children}
        </BlockchainContext.Provider>
    );
};
