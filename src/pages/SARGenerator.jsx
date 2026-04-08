import React, { useState, useEffect } from "react";
import GlassCard from "../components/GlassCard";
import { FileText, Download, Link as LinkIcon, Copy } from "lucide-react";
import { fetchAccounts, generateSAR } from "../api/api";
import { freezeAccountOnChain, connectWallet } from "../utils/blockchain";

const sevColor = s => ({ CRITICAL: "#00FF41", HIGH: "#A8EF00", MEDIUM: "#00FF41" }[s] || "#889488");

function useTypingEffect(text = "", speed = 10, start = false) {
    const [displayed, setDisplayed] = useState("");
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        if (!start || !text) {
            setDisplayed("");
            setCompleted(false);
            return;
        }
        
        let i = 0;
        const interval = setInterval(() => {
            setDisplayed(text.slice(0, i));
            i += 3;
            if (i > text.length) {
                clearInterval(interval);
                setDisplayed(text);
                setCompleted(true);
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, start, speed]);

    return [displayed, completed];
}

export default function SARGenerator() {
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState("");
    const [generating, setGenerating] = useState(false);
    const [sarData, setSarData] = useState(null);
    const [logs, setLogs] = useState([]);
    const [copied, setCopied] = useState(false);

    // Typing hooks for sections
    const [startS2, setStartS2] = useState(false);
    const [startS3, setStartS3] = useState(false);
    const [startS5, setStartS5] = useState(false);

    const [s2Display, s2Done] = useTypingEffect(sarData?.section2_narrative, 15, startS2);
    const [s3Display, s3Done] = useTypingEffect(sarData?.section3?.narrative, 15, startS3);
    const [s5Display] = useTypingEffect(sarData?.section5_recommendation, 15, startS5);

    useEffect(() => {
        fetchAccounts().then(allAccs => {
            const flagged = allAccs.filter(a => ['FLAGGED', 'COMPROMISED', 'FROZEN'].includes(a.status));
            setAccounts(flagged);
        });
    }, []);

    useEffect(() => {
        if (sarData) {
            setStartS2(true);
        }
    }, [sarData]);

    useEffect(() => {
        if (s2Done) setStartS3(true);
    }, [s2Done]);

    useEffect(() => {
        if (s3Done) setStartS5(true);
    }, [s3Done]);

    const handleGenerate = async () => {
        if (!selectedAccount) return;
        setGenerating(true);
        setSarData(null);
        setLogs([]);
        setStartS2(false);
        setStartS3(false);
        setStartS5(false);

        const logSteps = [
            { text: "> Fetching account profile...", delay: 300 },
            { text: "> Pulling transaction history...", delay: 800 },
            { text: "> Correlating login anomalies...", delay: 1300 },
            { text: "> Analyzing kill chain path...", delay: 1800 },
            { text: "> Generating Section 2 narrative...", delay: 2300 },
            { text: "> Generating Section 3 attribution...", delay: 3500 },
            { text: "> Generating Section 5 recommendations...", delay: 4700 },
            { text: "> Compiling final document...", delay: 5500 }
        ];

        logSteps.forEach(step => {
            setTimeout(() => {
                setLogs(prev => [...prev, step.text]);
            }, step.delay);
        });

        try {
            const result = await generateSAR(selectedAccount);
            // wait until the last log
            setTimeout(() => {
                setGenerating(false);
                setSarData(result);
            }, 6000); // just over the 5500 delay
        } catch (err) {
            console.error("SAR Generation error", err);
            setTimeout(() => {
                setGenerating(false);
                setLogs(prev => [...prev, "> ERROR: Generation failed."]);
            }, 6000);
        }
    };

    const selAccDetails = accounts.find(a => a.account_id === selectedAccount);

    const getFullDocumentText = () => {
        if (!sarData) return "";
        return `SUSPICIOUS ACTIVITY REPORT — FIU-IND FORM A
Report Reference: ${sarData.report_reference}
Filing Institution: ${sarData.filing_institution}
Date of Filing: ${sarData.date_of_filing}
Classification: CONFIDENTIAL

SECTION 1: SUBJECT INFORMATION
Account Holder: ${sarData.section1.account_holder}
Account Number: ${sarData.section1.account_number}
Risk Classification: ${sarData.section1.risk_classification}
Mule Confidence: ${sarData.section1.mule_confidence}%
Cyber Score: ${sarData.section1.cyber_score}/100

SECTION 2: SUSPICIOUS ACTIVITY DESCRIPTION
${sarData.section2_narrative}

SECTION 3: CYBER ATTRIBUTION
Kill Chain Origin: ${sarData.section3.kill_chain_origin}
Attack Vector: ${sarData.section3.attack_vector}
${sarData.section3.narrative}
Login Anomalies:
${sarData.section3.login_anomalies.map(l => `- ${l.ip} (${l.country}): VPN ${l.vpn_used}, Risk ${l.risk_score}`).join("\n")}

SECTION 4: TRANSACTION DETAIL
Total Suspicious Amount: ₹${sarData.section4_total}
${sarData.section4_transactions.map(t => `- TXN ${t.txn_id} | ₹${t.amount} | ${t.receiver} | ${t.status}`).join("\n")}

SECTION 5: RECOMMENDED ACTION
${sarData.section5_recommendation}`;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(getFullDocumentText());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLogBlockchain = async () => {
        try {
            const { signer } = await connectWallet();
            // Log the SAR against a dummy/demo on-chain address for the account since we only have account_id
            await freezeAccountOnChain("0x000000000000000000000000000000000000dead", `SAR FILED: ${sarData.report_reference}`, signer);
            alert("SAR Reference logged on-chain successfully.");
        } catch (err) {
            console.error(err);
            alert("Blockchain logging failed.");
        }
    };

    const handleDownload = () => {
        const text = getFullDocumentText();
        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `SAR_${sarData.report_reference}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 style={{ fontSize: 24, margin: 0, color: "#ffffff", fontFamily: "Space Grotesk, sans-serif" }}>📋 SAR FILING GENERATOR</h1>
                    <div style={{ color: "#7A8E7A", fontSize: 13, marginTop: 4 }}>
                        RBI FIU-IND Form A — Automated Generation
                    </div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "60% 35%", gap: "5%" }}>
                {/* LEFT COLUMN: GENERATOR PANEL */}
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <GlassCard style={{ padding: 24 }}>
                        <div style={{ fontSize: 11, color: "#7A8E7A", fontWeight: 600, marginBottom: 8 }}>SELECT SUBJECT ACCOUNT</div>
                        <select 
                            value={selectedAccount} 
                            onChange={e => setSelectedAccount(e.target.value)}
                            style={{ 
                                width: "100%", padding: "12px", background: "rgba(0,0,0,0.3)", 
                                border: "1px solid rgba(0, 255, 65, 0.15)", color: "#00ff88", 
                                borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "'JetBrains Mono', monospace"
                            }}
                        >
                            <option value="">-- Select an account --</option>
                            {accounts.map(a => (
                                <option key={a.account_id} value={a.account_id}>
                                    {a.account_id} — {a.name} — Risk: {a.final_score} — {a.status}
                                </option>
                            ))}
                        </select>

                        {selAccDetails && (
                            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                                <div style={{ background: "rgba(0,255,136,0.1)", color: "#00ff88", padding: "4px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, border: "1px solid rgba(0,255,136,0.2)" }}>
                                    Risk Score: {selAccDetails.final_score}
                                </div>
                                <div style={{ background: "rgba(0,255,136,0.1)", color: "#00ff88", padding: "4px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, border: "1px solid rgba(0,255,136,0.2)" }}>
                                    Status: {selAccDetails.status}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleGenerate}
                            disabled={!selectedAccount || generating}
                            style={{ 
                                width: "100%", marginTop: 24, padding: "16px", background: "rgba(0, 255, 65, 0.05)", 
                                border: "1px solid rgba(0, 255, 65, 0.3)", borderRadius: 8, color: "var(--accent)", 
                                fontSize: 14, fontWeight: "bold", display: "flex", alignItems: "center", 
                                justifyContent: "center", gap: 10, cursor: selectedAccount && !generating ? "pointer" : "not-allowed", 
                                transition: "all 0.2s", letterSpacing: "0.05em", opacity: selectedAccount ? 1 : 0.5
                            }}
                            className="hover-lift"
                        >
                            {generating ? "GENERATING..." : "✦ GENERATE SAR WITH GEMINI"}
                        </button>

                        {logs.length > 0 && !sarData && (
                            <div style={{ marginTop: 16, background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 8, padding: 16 }}>
                                {logs.map((log, i) => (
                                    <div key={i} style={{ color: "#00ff88", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>
                                        {log}
                                    </div>
                                ))}
                            </div>
                        )}
                    </GlassCard>
                </div>

                {/* RIGHT COLUMN: PAST SARs */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <h3 style={{ fontSize: 16, color: "#ffffff", marginBottom: 4, fontFamily: "Inter, sans-serif" }}>FILED REPORTS</h3>
                    
                    {[
                        { ref: "SAR-2025-CF-0041", type: "Mule Ring Analysis", sev: "CRITICAL", date: "Today 10:45" },
                        { ref: "SAR-2025-CF-0038", type: "Phishing Attribution", sev: "HIGH", date: "Yesterday" },
                        { ref: "SAR-2025-CF-0031", type: "Account Takeover", sev: "HIGH", date: "2 days ago" },
                    ].map((sar, i) => (
                        <GlassCard key={i} hover={true} style={{ padding: 20, borderLeft: `3px solid ${sevColor(sar.sev)}` }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 8, background: `${sevColor(sar.sev)}22`, color: sevColor(sar.sev), display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${sevColor(sar.sev)}44` }}>
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: 14, color: "#ffffff", fontFamily: "'JetBrains Mono',monospace" }}>{sar.ref}</h4>
                                        <span style={{ fontSize: 11, color: "#7A8E7A", fontFamily: "'JetBrains Mono',monospace" }}>
                                            {sar.date}
                                        </span>
                                    </div>
                                </div>
                                <span style={{ fontSize: 10, fontWeight: "bold", padding: "4px 8px", borderRadius: 4, background: `${sevColor(sar.sev)}22`, color: sevColor(sar.sev) }}>{sar.sev}</span>
                            </div>
                            <div style={{ fontSize: 12, color: "#00aa00", marginBottom: 12 }}>{sar.type}</div>
                            <button 
                                onClick={() => alert("Report archived")}
                                style={{ width: "100%", padding: "8px", background: "transparent", border: "1px solid rgba(0, 255, 65, 0.15)", borderRadius: 6, color: "#00FF41", fontSize: 12, fontWeight: "bold", cursor: "pointer" }}
                            >
                                VIEW
                            </button>
                        </GlassCard>
                    ))}
                </div>
            </div>

            {/* DOCUMENT DISPLAY */}
            {sarData && (
                <GlassCard style={{ padding: "0" }}>
                    <div style={{ 
                        background: "rgba(0,0,0,0.4)", border: "1px solid rgba(0,255,136,0.1)", borderRadius: 8, 
                        padding: 32, fontFamily: "'JetBrains Mono', monospace", color: "#e0e0e0"
                    }}>
                        <div style={{ borderBottom: "1px solid rgba(0,255,136,0.2)", paddingBottom: 16, marginBottom: 16 }}>
                            <div style={{ color: "#00ff88", fontWeight: "bold", fontSize: 16, marginBottom: 12 }}>SUSPICIOUS ACTIVITY REPORT — FIU-IND FORM A</div>
                            <div>Report Reference: {sarData.report_reference}</div>
                            <div>Filing Institution: {sarData.filing_institution}</div>
                            <div>Date of Filing: {sarData.date_of_filing}</div>
                            <div>Classification: CONFIDENTIAL</div>
                        </div>

                        <div style={{ borderBottom: "1px solid rgba(0,255,136,0.2)", paddingBottom: 16, marginBottom: 16 }}>
                            <div style={{ color: "#00ff88", fontWeight: "bold", marginBottom: 8 }}>SECTION 1: SUBJECT INFORMATION</div>
                            <div>Account Holder: {sarData.section1.account_holder}</div>
                            <div>Account Number: {sarData.section1.account_number}</div>
                            <div>Risk Classification: {sarData.section1.risk_classification}</div>
                            <div>Mule Confidence: {sarData.section1.mule_confidence}%</div>
                            <div>Cyber Score: {sarData.section1.cyber_score}/100</div>
                        </div>

                        <div style={{ borderBottom: "1px solid rgba(0,255,136,0.2)", paddingBottom: 16, marginBottom: 16 }}>
                            <div style={{ color: "#00ff88", fontWeight: "bold", marginBottom: 8 }}>SECTION 2: SUSPICIOUS ACTIVITY DESCRIPTION</div>
                            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                                {s2Display}
                            </div>
                        </div>

                        <div style={{ borderBottom: "1px solid rgba(0,255,136,0.2)", paddingBottom: 16, marginBottom: 16 }}>
                            <div style={{ color: "#00ff88", fontWeight: "bold", marginBottom: 8 }}>SECTION 3: CYBER ATTRIBUTION</div>
                            <div>Kill Chain Origin: {sarData.section3.kill_chain_origin}</div>
                            <div>Attack Vector: {sarData.section3.attack_vector}</div>
                            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14, whiteSpace: "pre-wrap", lineHeight: 1.6, marginTop: 8, marginBottom: 8 }}>
                                {s3Display}
                            </div>
                            {startS5 && (
                            <div>
                                <div style={{ color: "#00aa00", marginBottom: 4 }}>Login Anomalies:</div>
                                <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                                    <tbody>
                                        {sarData.section3.login_anomalies.map((l, i) => (
                                            <tr key={i}>
                                                <td style={{ padding: "4px" }}>{l.ip} ({l.country})</td>
                                                <td style={{ padding: "4px" }}>VPN: {l.vpn_used ? "YES" : "NO"}</td>
                                                <td style={{ padding: "4px" }}>Risk: {l.risk_score}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            )}
                        </div>

                        <div style={{ borderBottom: "1px solid rgba(0,255,136,0.2)", paddingBottom: 16, marginBottom: 16 }}>
                            <div style={{ color: "#00ff88", fontWeight: "bold", marginBottom: 8 }}>SECTION 4: TRANSACTION DETAIL</div>
                            <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse", marginBottom: 8 }}>
                                <thead>
                                    <tr style={{ color: "#7A8E7A", textAlign: "left" }}>
                                        <th style={{ padding: "4px" }}>TXN ID</th>
                                        <th style={{ padding: "4px" }}>Amount</th>
                                        <th style={{ padding: "4px" }}>Receiver</th>
                                        <th style={{ padding: "4px" }}>Time</th>
                                        <th style={{ padding: "4px" }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sarData.section4_transactions.map((t, i) => (
                                        <tr key={i}>
                                            <td style={{ padding: "4px" }}>{t.txn_id}</td>
                                            <td style={{ padding: "4px" }}>₹{t.amount}</td>
                                            <td style={{ padding: "4px" }}>{t.receiver}</td>
                                            <td style={{ padding: "4px" }}>{new Date(t.timestamp).toLocaleTimeString()}</td>
                                            <td style={{ padding: "4px" }}>{t.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div style={{ color: "#00ff88" }}>Total Suspicious Amount: ₹{sarData.section4_total}</div>
                        </div>

                        <div>
                            <div style={{ color: "#00ff88", fontWeight: "bold", marginBottom: 8 }}>SECTION 5: RECOMMENDED ACTION</div>
                            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                                {s5Display}
                            </div>
                        </div>
                    </div>
                </GlassCard>
            )}

            {sarData && (
                <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                    <button onClick={handleCopy} style={{ flex: 1, padding: "16px", background: "rgba(0, 255, 65, 0.05)", border: "1px solid rgba(0, 255, 65, 0.3)", borderRadius: 8, color: "var(--accent)", fontSize: 14, fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer" }}>
                        <Copy size={18} /> {copied ? "COPIED ✓" : "📋 COPY REPORT"}
                    </button>
                    <button onClick={handleLogBlockchain} style={{ flex: 1, padding: "16px", background: "rgba(0, 255, 65, 0.05)", border: "1px solid rgba(0, 255, 65, 0.3)", borderRadius: 8, color: "var(--accent)", fontSize: 14, fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer" }}>
                        <LinkIcon size={18} /> ⛓ LOG TO BLOCKCHAIN
                    </button>
                    <button onClick={handleDownload} style={{ flex: 1, padding: "16px", background: "rgba(0, 255, 65, 0.05)", border: "1px solid rgba(0, 255, 65, 0.3)", borderRadius: 8, color: "var(--accent)", fontSize: 14, fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer" }}>
                        <Download size={18} /> 📁 DOWNLOAD .TXT
                    </button>
                </div>
            )}
        </div>
    );
}
