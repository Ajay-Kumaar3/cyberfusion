import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "./GlassCard";
import { fetchAlerts } from "../api/api";

const sevColor = (sev) => {
    if (sev === "CRITICAL") return "#ff4444";
    if (sev === "HIGH") return "#ffcc00";
    if (sev === "MEDIUM") return "#88ff88";
    return "#00ff88";
};

const sevLabel = (sev) => {
    if (sev === "CRITICAL") return "CRITICAL_ALERT";
    if (sev === "HIGH") return "HIGH_RISK_TXN";
    if (sev === "MEDIUM") return "SUSPICIOUS_TXN";
    return "MONITOR";
};

export default function AlertFeed() {
    const [alerts, setAlerts] = useState([]);
    const [pool, setPool] = useState([]);
    const [poolIndex, setPoolIndex] = useState(2);

    useEffect(() => {
        fetchAlerts({ limit: 50 })
            .then(data => {
                setPool(data);
                if (data.length >= 2) {
                    setAlerts([
                        { ...data[0], instanceId: Date.now() + 1, timeLabel: "Just now" },
                        { ...data[1], instanceId: Date.now() + 2, timeLabel: "2m ago" },
                    ]);
                }
            })
            .catch(() => {
                setAlerts([{ alert_id: 0, severity: "HIGH", account_id: "API-OFFLINE", description: "Backend offline — restart uvicorn server", instanceId: Date.now(), timeLabel: "Now" }]);
            });
    }, []);

    useEffect(() => {
        if (pool.length === 0) return;
        const interval = setInterval(() => {
            setPoolIndex(prev => {
                const idx = prev % pool.length;
                const next = { ...pool[idx], instanceId: Date.now(), timeLabel: "Just now" };
                setAlerts(curr => [next, ...curr].slice(0, 8));
                return idx + 1;
            });
        }, 8000);
        return () => clearInterval(interval);
    }, [pool]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
            <AnimatePresence>
                {alerts.map((alert) => {
                    const color = sevColor(alert.severity);
                    const type = sevLabel(alert.severity);
                    return (
                        <motion.div
                            key={alert.instanceId}
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 100, damping: 15 }}
                        >
                            <GlassCard style={{ padding: '16px', borderLeft: `4px solid ${color}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 4, backgroundColor: `${color}22`, color, border: `1px solid ${color}44` }}>
                                            {type}
                                        </span>
                                        <span style={{ fontSize: 10, color: '#008800', fontFamily: "'JetBrains Mono', monospace" }}>{alert.timeLabel}</span>
                                    </div>
                                    <button style={{ background: 'transparent', border: `1px solid ${color}88`, color, borderRadius: 4, padding: '4px 10px', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>Investigate</button>
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>{alert.account_id}</div>
                                <div style={{ fontSize: 12, color: '#00aa00' }}>{alert.description?.slice(0, 80)}{alert.description?.length > 80 ? '…' : ''}</div>
                            </GlassCard>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
