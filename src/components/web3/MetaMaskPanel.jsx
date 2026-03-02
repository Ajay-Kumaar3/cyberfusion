import React, { useState } from "react";
import { ethers } from "ethers";
import { useMetaMask } from "../../hooks/useMetaMask";
import { useTransaction } from "../../hooks/useTransaction";
import { Shield, Wallet, Send, X, ExternalLink, AlertTriangle, CheckCircle } from "lucide-react";

/**
 * MetaMaskPanel — floating bottom-right panel.
 *
 * Props:
 *   onFraudAlert(alertObj) — callback when backend returns a fraud signal.
 *                            Attach to Dashboard state to show in the live feed.
 */
export default function MetaMaskPanel({ onFraudAlert }) {
  const { account, signer, isConnecting, error: walletError, connect, disconnect } = useMetaMask();
  const [open, setOpen]     = useState(false);
  const [to, setTo]         = useState("");
  const [amount, setAmount] = useState("");
  const [lastAlert, setLastAlert] = useState(null);

  const handleAlert = (alert) => {
    setLastAlert(alert);
    if (onFraudAlert) onFraudAlert(alert);
  };

  const { sendAndAnalyze, status, txHash, error: txError, reset } = useTransaction({
    account,
    onAlert: handleAlert,
  });

  const short   = (addr) => addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
  const isBusy  = status === "pending" || status === "mining";

  const handleSend = async () => {
    if (!signer || !to || !amount) return;
    try {
      await sendAndAnalyze({ signer, to, amountEth: amount });
    } catch (_) { /* error already in state */ }
  };

  return (
    <>
      {/* Floating trigger */}
      <button
        id="metamask-trigger-btn"
        onClick={() => setOpen(o => !o)}
        title={account ? `Connected: ${short(account)}` : "Connect MetaMask"}
        style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 9999,
          width: 56, height: 56, borderRadius: "50%",
          background: account ? "rgba(0, 255, 0, 0.15)" : "rgba(255,255,255,0.06)",
          border: `1px solid ${account ? "rgba(0, 255, 0, 0.45)" : "rgba(255,255,255,0.15)"}`,
          color: account ? "var(--accent)" : "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          boxShadow: account ? "0 0 20px rgba(0, 255, 0, 0.25)" : "0 4px 20px rgba(0,0,0,0.5)",
          backdropFilter: "blur(12px)",
          transition: "all 0.2s",
        }}
      >
        <Wallet size={22} />
      </button>

      {/* Panel */}
      {open && (
        <div id="metamask-panel" style={{
          position: "fixed", bottom: 96, right: 28, zIndex: 9999,
          width: 360,
          background: "rgba(10, 2, 2, 0.96)",
          backdropFilter: "blur(28px)",
          border: "1px solid rgba(0, 255, 0, 0.25)",
          borderRadius: 16,
          boxShadow: "0 24px 60px rgba(0,0,0,0.8), 0 0 40px rgba(0, 255, 0, 0.04)",
          overflow: "hidden",
          animation: "fadeInUp 0.22s ease",
        }}>

          {/* Header */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 18px", borderBottom: "1px solid rgba(0, 255, 0, 0.1)",
            background: "rgba(0, 255, 0, 0.03)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Shield size={15} color="var(--accent)" />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: "#fff", letterSpacing: "0.03em" }}>
                MetaMask · Sepolia
              </span>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", padding: 4, display: "flex" }}>
              <X size={15} />
            </button>
          </div>

          <div style={{ padding: 18 }}>
            {!account ? (
              /* ── Not Connected ── */
              <div style={{ textAlign: "center", padding: "12px 0 8px" }}>
                <div style={{ fontSize: 42, marginBottom: 12 }}>🦊</div>
                <div style={{ color: "#556655", fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
                  Connect your MetaMask wallet to send Sepolia ETH and trigger CyberFusion fraud detection automatically.
                </div>
                <button id="metamask-connect-btn" onClick={connect} disabled={isConnecting} style={primaryBtn}>
                  {isConnecting ? "Connecting…" : "🔗 Connect MetaMask"}
                </button>
                {walletError && <div style={errBox}>{walletError}</div>}
              </div>
            ) : (
              /* ── Connected ── */
              <>
                {/* Account badge */}
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "8px 12px", borderRadius: 8, marginBottom: 16,
                  background: "rgba(0, 255, 0, 0.05)", border: "1px solid rgba(0, 255, 0, 0.14)",
                }}>
                  <div>
                    <div style={{ fontSize: 9, color: "var(--accent)", letterSpacing: "0.12em", marginBottom: 2, fontWeight: 700 }}>WALLET CONNECTED</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--accent)" }}>{short(account)}</div>
                  </div>
                  <button onClick={disconnect} style={{ background: "none", border: "1px solid rgba(255,255,255,0.08)", color: "#555", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                    Disconnect
                  </button>
                </div>

                {/* Form */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                  <div>
                    <label style={lbl}>Recipient Address</label>
                    <input id="tx-recipient" style={inp} placeholder="0x…" value={to} onChange={e => setTo(e.target.value)} disabled={isBusy} />
                  </div>
                  <div>
                    <label style={lbl}>Amount (ETH)</label>
                    <input id="tx-amount" style={inp} type="number" placeholder="0.001" step="0.001" min="0" value={amount} onChange={e => setAmount(e.target.value)} disabled={isBusy} />
                  </div>
                </div>

                {/* Status messages */}
                {status === "pending" && <StatusRow color="#fbbf24" icon="⏳" text="Waiting for MetaMask approval…" />}
                {status === "mining"  && <StatusRow color="#38bdf8" icon="⛏" text={`Mining… ${txHash ? short(txHash) : ""}`} />}
                {status === "done"    && txHash && (
                  <div style={{ ...statusBox("#00ff00"), marginBottom: 10 }}>
                    <CheckCircle size={13} color="#00ff00" />
                    <span style={{ fontSize: 12, color: "var(--accent)" }}>Confirmed!</span>
                    <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
                      style={{ marginLeft: "auto", color: "var(--accent)", display: "flex", alignItems: "center", gap: 3, fontSize: 11 }}>
                      Etherscan <ExternalLink size={11} />
                    </a>
                  </div>
                )}
                {(status === "error" || (status === "idle" && txError)) && <div style={errBox}>{txError}</div>}

                {/* Fraud alert from backend */}
                {lastAlert && (
                  <div style={{ background: "rgba(255,50,50,0.06)", border: "1px solid rgba(255,50,50,0.2)", borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <AlertTriangle size={13} color="#ff4455" />
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#ff4455" }}>
                        Fraud Signal — Risk {lastAlert.risk_score ?? lastAlert.riskScore ?? "??"}/100
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "#886666", lineHeight: 1.5 }}>
                      {lastAlert.reason || lastAlert.message || "Suspicious transaction detected by CyberFusion."}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 8 }}>
                  {(status === "done" || status === "error") && (
                    <button onClick={() => { reset(); setLastAlert(null); setTo(""); setAmount(""); }}
                      style={{ ...ghostBtn, flex: 1 }}>
                      Reset
                    </button>
                  )}
                  {(status === "idle" || status === "error") && (
                    <button id="tx-send-btn" onClick={handleSend} disabled={!to || !amount || !signer}
                      style={{ ...primaryBtn, flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <Send size={13} /> Send & Analyze
                    </button>
                  )}
                  {isBusy && (
                    <button disabled style={{ ...primaryBtn, flex: 1, opacity: 0.5 }}>Sending…</button>
                  )}
                </div>

                {/* CyberFusion note */}
                <div style={{ marginTop: 14, fontSize: 10, color: "#335533", textAlign: "center", lineHeight: 1.6 }}>
                  Transaction data is forwarded to <strong style={{ color: "#008800" }}>CyberFusion /analyze-transaction</strong> after confirmation.
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function StatusRow({ color, icon, text }) {
  return (
    <div style={{ ...statusBox(color), marginBottom: 10 }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span style={{ fontSize: 12, color }}>{text}</span>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const lbl = {
  fontSize: 10, color: "var(--accent)", display: "block",
  marginBottom: 4, letterSpacing: "0.07em", fontWeight: 700,
};

const inp = {
  width: "100%", background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8,
  padding: "9px 12px", color: "#f1f5f9", fontSize: 13,
  fontFamily: "'JetBrains Mono', monospace", outline: "none",
  transition: "all 0.2s",
};

const errBox = {
  background: "rgba(255,50,50,0.08)", border: "1px solid rgba(255,50,50,0.18)",
  color: "#ff6666", borderRadius: 8, padding: "8px 12px", fontSize: 12, marginTop: 10,
};

const primaryBtn = {
  width: "100%", padding: "11px 14px", borderRadius: 8,
  background: "var(--accent)", border: "1px solid var(--accent)",
  color: "#fff", fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s",
};

const ghostBtn = {
  padding: "11px 14px", borderRadius: 8,
  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
  color: "#555", fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.2s",
};

function statusBox(color) {
  return {
    display: "flex", alignItems: "center", gap: 8,
    background: `${color}10`, border: `1px solid ${color}30`,
    borderRadius: 8, padding: "8px 12px",
  };
}
