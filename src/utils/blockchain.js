import { ethers } from 'ethers';
import { DEMO_CONFIG } from '../config/demo.config';

export const CONTRACT_ADDRESS = DEMO_CONFIG.CONTRACT_ADDRESS;

export const CONTRACT_ABI = [
    "function flagAccount(address account, string calldata reason) external",
    "function unflagAccount(address account) external",
    "function safeTransfer(address to) external payable",
    "function getAccountStatus(address account) external view returns (bool, string, uint256, uint256)",
    "function getBlockedHistory() external view returns (tuple(address,address,uint256,uint256,string)[])",
    "event AccountFlagged(address indexed account, string reason, uint256 timestamp)",
    "event TransactionBlocked(address indexed from, address indexed to, uint256 amount, string reason)",
    "event TransactionAllowed(address indexed from, address indexed to, uint256 amount)"
];

export const SEPOLIA_CHAIN_ID = DEMO_CONFIG.SEPOLIA_CHAIN_ID;

// Connect MetaMask and return signer
export async function connectWallet() {
    if (!window.ethereum) {
        throw new Error("MetaMask not installed. Please install MetaMask extension.");
    }

    // Request account access
    const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
    });

    // Force switch to Sepolia
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CHAIN_ID }]
        });
    } catch (switchError) {
        // Add Sepolia if not present
        if (switchError.code === 4902) {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: SEPOLIA_CHAIN_ID,
                    chainName: 'Sepolia Testnet',
                    nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
                    rpcUrls: [DEMO_CONFIG.SEPOLIA_RPC],
                    blockExplorerUrls: [DEMO_CONFIG.ETHERSCAN_BASE]
                }]
            });
        }
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return { signer, address: accounts[0], provider };
}

export function getContract(signerOrProvider) {
    if (!CONTRACT_ADDRESS || !CONTRACT_ADDRESS.startsWith('0x') || CONTRACT_ADDRESS.length !== 42) {
        throw new Error("Smart Contract address is not configured. Please update CONTRACT_ADDRESS in demo.config.js");
    }
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
}

// Flag/freeze an account on-chain
export async function freezeAccountOnChain(walletAddress, reason, signer) {
    const contract = getContract(signer);
    const tx = await contract.flagAccount(walletAddress, reason);
    const receipt = await tx.wait();
    return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        etherscanUrl: `${DEMO_CONFIG.ETHERSCAN_BASE}/tx/${receipt.hash}`
    };
}

// Unfreeze account
export async function unfreezeAccountOnChain(walletAddress, signer) {
    const contract = getContract(signer);
    const tx = await contract.unflagAccount(walletAddress);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
}

// Attempt transfer — this WILL be blocked if flagged
export async function attemptTransfer(toAddress, amountEth, signer) {
    const contract = getContract(signer);
    try {
        const tx = await contract.safeTransfer(toAddress, {
            value: ethers.parseEther(amountEth.toString())
        });
        const receipt = await tx.wait();
        return {
            blocked: false,
            txHash: receipt.hash,
            etherscanUrl: `${DEMO_CONFIG.ETHERSCAN_BASE}/tx/${receipt.hash}`
        };
    } catch (error) {
        // Extract the revert reason
        let reason = "Transaction blocked by CyberFusion Guard";
        // Ethers v6 error structure
        if (error.info && error.info.error && error.info.error.message) {
            const msg = error.info.error.message;
            if (msg.includes("CYBERFUSION BLOCK:")) {
                reason = msg.split("CYBERFUSION BLOCK:")[1].trim();
            }
        } else if (error.message && error.message.includes("CYBERFUSION BLOCK:")) {
            const match = error.message.match(/CYBERFUSION BLOCK: ([^"]+)/);
            if (match) reason = match[1].trim();
        } else if (error.reason) {
            reason = error.reason;
        }
        return {
            blocked: true,
            reason: reason,
            rawError: error.message
        };
    }
}

// Get real-time account status from chain
export async function getOnChainStatus(walletAddress, provider) {
    const contract = getContract(provider);
    const [isBlacklisted, reason, flaggedAt, blockedAttempts] =
        await contract.getAccountStatus(walletAddress);
    return {
        isBlacklisted,
        reason,
        flaggedAt: flaggedAt > 0 ? new Date(Number(flaggedAt) * 1000).toLocaleString() : null,
        blockedAttempts: Number(blockedAttempts)
    };
}

// Listen for real-time blockchain events
export function listenToBlockedTransactions(provider, onBlock) {
    const contract = getContract(provider);
    contract.on("TransactionBlocked", (from, to, amount, reason) => {
        onBlock({
            from,
            to,
            amount: ethers.formatEther(amount) + " ETH",
            reason,
            timestamp: new Date().toLocaleTimeString()
        });
    });
    return () => contract.removeAllListeners();
}
