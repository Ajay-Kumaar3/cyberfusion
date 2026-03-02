import { useState } from "react";
import { ethers } from "ethers";

/**
 * useTransaction — sends ETH on Sepolia via MetaMask.
 *
 * Usage:
 *   const { sendAndAnalyze, status, txHash, error, reset } = useTransaction({ account, onAlert });
 *
 *   await sendAndAnalyze({ signer, to, amountEth });
 */
export function useTransaction({ account, onAlert }) {
  const [status, setStatus] = useState("idle"); // idle | pending | mining | done | error
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

  const sendAndAnalyze = async ({ signer, to, amountEth }) => {
    if (!signer) throw new Error("Wallet not connected");
    setStatus("pending");
    setError(null);
    setTxHash(null);

    try {
      // 1. Fire transaction through MetaMask
      const tx = await signer.sendTransaction({
        to,
        value: ethers.parseEther(String(amountEth)),
      });
      setTxHash(tx.hash);
      setStatus("mining");

      // 2. Wait for 1 on-chain confirmation
      const receipt = await tx.wait(1);

      // 3. Build backend payload
      const payload = {
        sender: account,
        receiver: to,
        amount: Number(amountEth),
        currency: "ETH",
        network: "sepolia",
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        timestamp: new Date().toISOString(),
        gasUsed: receipt.gasUsed?.toString(),
      };

      // 4. POST to your existing backend endpoint
      let alertData = null;
      try {
        const res = await fetch("/api/analyze-transaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) alertData = await res.json();
      } catch (fetchErr) {
        console.warn("Backend call failed:", fetchErr.message);
        // Non-fatal — transaction itself succeeded
      }

      setStatus("done");
      if (onAlert && alertData) onAlert({ ...alertData, txHash: tx.hash, amount: amountEth, to });

      return { tx, receipt, alert: alertData };
    } catch (err) {
      const msg = err?.info?.error?.message || err.message || "Transaction failed";
      setError(msg);
      setStatus("error");
      throw err;
    }
  };

  const reset = () => {
    setStatus("idle");
    setTxHash(null);
    setError(null);
  };

  return { sendAndAnalyze, status, txHash, error, reset };
}
