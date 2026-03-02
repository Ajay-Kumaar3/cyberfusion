import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111 in hex

/**
 * useMetaMask — handles MetaMask connection, Sepolia switching, and account state.
 *
 * Returns:
 *   account       — connected wallet address (or null)
 *   isConnecting  — loading state during connect
 *   error         — last error message (or null)
 *   connect()     — trigger wallet connect + Sepolia switch
 *   disconnect()  — clear local state (MetaMask doesn't support programmatic disconnect)
 *   provider      — ethers BrowserProvider (or null)
 *   signer        — ethers Signer (or null)
 */
export function useMetaMask() {
  const [account, setAccount] = useState(null);
  const [isConnecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  // Auto-reconnect on page load if already connected
  useEffect(() => {
    if (!window.ethereum) return;
    const init = async () => {
      try {
        const prov = new ethers.BrowserProvider(window.ethereum);
        const accounts = await prov.listAccounts();
        if (accounts.length > 0) {
          const sig = await prov.getSigner();
          setProvider(prov);
          setSigner(sig);
          setAccount(await sig.getAddress());
        }
      } catch (_) { /* not connected yet */ }
    };
    init();

    // Listen for account changes
    window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length === 0) {
        setAccount(null); setProvider(null); setSigner(null);
      } else {
        setAccount(accounts[0]);
      }
    });

    // Listen for network changes
    window.ethereum.on("chainChanged", () => window.location.reload());

    return () => {
      window.ethereum?.removeAllListeners?.("accountsChanged");
      window.ethereum?.removeAllListeners?.("chainChanged");
    };
  }, []);

  const switchToSepolia = useCallback(async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError) {
      // Chain not added → add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: SEPOLIA_CHAIN_ID,
            chainName: "Sepolia Testnet",
            nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
            rpcUrls: ["https://sepolia.infura.io/v3/"],
            blockExplorerUrls: ["https://sepolia.etherscan.io"],
          }],
        });
      } else throw switchError;
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError("MetaMask not found. Please install it from metamask.io");
      return;
    }
    setConnecting(true);
    setError(null);
    try {
      await switchToSepolia();
      const prov = new ethers.BrowserProvider(window.ethereum);
      await prov.send("eth_requestAccounts", []);
      const sig = await prov.getSigner();
      const addr = await sig.getAddress();
      setProvider(prov);
      setSigner(sig);
      setAccount(addr);
    } catch (err) {
      setError(err.message || "Connection failed");
    } finally {
      setConnecting(false);
    }
  }, [switchToSepolia]);

  const disconnect = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
  }, []);

  return { account, isConnecting, error, provider, signer, connect, disconnect };
}
