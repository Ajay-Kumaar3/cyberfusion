import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "./GlassCard";
import { useApi } from "../hooks/useApi";
import { getAlerts } from "../utils/api";

const sevColor = (sev) => {
    if (sev === "CRITICAL") return "#FF3366";
    if (sev === "HIGH") return "#FFAA00";
    if (sev === "MEDIUM") return "#FFDD00";
    return "#00FF41";
};

const sevLabel = (sev) => {
    if (sev === "CRITICAL") return "[x] CRITICAL_ALERT";
    if (sev === "HIGH") return "[!] HIGH_RISK_TXN";
    if (sev === "MEDIUM") return "[!] SUSPICIOUS_TXN";
    return "[+] MONITOR";
};

const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function AlertFeed() {
    const { data: alerts, loading, error } = useApi(getAlerts, []);

    if (loading) return <div className="skeleton-pulse" style={{ height: 100, borderRadius: 12, background: 'rgba(255,255,255,0.05)' }} />;
    if (error) return <div style={{ color: '#ff3366', fontSize: 12 }}>{error}</div>;

    const displayAlerts = (alerts || []).slice(0, 8);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
            <AnimatePresence>
                {displayAlerts.map((alert) => {
                    const color = sevColor(alert.severity);
                    const type = sevLabel(alert.severity);
                    return (
                        <motion.div
                            key={alert.alert_id}
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 100, damping: 15 }}
                        >
                            <GlassCard style={{ padding: '16px', background: 'rgba(0, 255, 65, 0.05)', border: '1px solid rgba(0, 255, 65, 0.2)', borderLeft: `4px solid ${color}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 4, backgroundColor: `rgba(0, 255, 65, 0.1)`, color: color, border: `1px solid rgba(0, 255, 65, 0.3)` }}>
                                            {type}
                                        </span>
                                        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                                            {formatTime(alert.created_at)}
                                        </span>
                                    </div>
                                    <button className="hover-lift" style={{ background: 'rgba(0, 255, 65, 0.05)', border: `1px solid rgba(0, 255, 65, 0.3)`, color: 'var(--accent)', borderRadius: 4, padding: '4px 10px', fontSize: 10, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.05em' }}>
                                        INVESTIGATE
                                    </button>
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>
                                    {alert.account_id}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                    {alert.description?.slice(0, 80)}{alert.description?.length > 80 ? '…' : ''}
                                </div>
                            </GlassCard>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
