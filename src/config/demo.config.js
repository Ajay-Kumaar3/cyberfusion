// CyberFusion Pro — Blockchain Demo Config
// Update these values after deploying the smart contract on Sepolia

export const DEMO_CONFIG = {
    // Replace with the deployed CyberFusionGuard address from Remix
    CONTRACT_ADDRESS: "PASTE_YOUR_DEPLOY_ADDRESS_HERE",

    // Sepolia Testnet Chain ID
    SEPOLIA_CHAIN_ID: "0xaa36a7",

    // RPC for read-only & event listening (Infura/Alchemy/Public)
    SEPOLIA_RPC: "https://sepolia.infura.io/v3/",

    // Mapping existing database accounts to demo wallets for the presentation
    // Use separate MetaMask accounts for each of these for the best effect
    MULE_WALLET_MAP: {
        "ACC-4821": "PASTE_MULE_WALLET_ADDRESS_1_HERE", // Account 1
        "ACC-7743": "PASTE_MULE_WALLET_ADDRESS_2_HERE", // Account 2
        "MULE-001": "PASTE_MULE_WALLET_ADDRESS_3_HERE", // Account 3
    },

    // Etherscan Base URL for Sepolia
    ETHERSCAN_BASE: "https://sepolia.etherscan.io",

    // Razorpay Key for Payment Intercept Demo
    RAZORPAY_KEY: "rzp_test_PASTE_YOUR_KEY_HERE",
};

export function truncateAddress(addr) {
    if (!addr) return "0x000...0000";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
