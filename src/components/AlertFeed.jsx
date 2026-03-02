import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "./GlassCard";

const alertsPool = [
    { id: 1, type: "PHISHING_DETECTED", accountId: "ACC-5912", desc: "Spear-phishing kit v4 matched payload", risk: "HIGH", color: "#cdffcd" },
    { id: 2, type: "ACCOUNT_TAKEOVER", accountId: "ACC-4821", desc: "Login from new device in Mumbai", risk: "CRITICAL", color: "#ffffff" },
    { id: 3, type: "MULE_FLAGGED", accountId: "MULE-004", desc: "Velocity exceeded 500% monthly avg", risk: "CRITICAL", color: "#ffffff" },
    { id: 4, type: "SUSPICIOUS_TXN", accountId: "ACC-9922", desc: "$10k wire to unknown crypto exchange", risk: "HIGH", color: "#cdffcd" },
    { id: 5, type: "PATTERN_MATCH", accountId: "ACC-1002", desc: "Matches Lazarus group laundering behavior", risk: "CRITICAL", color: "#ffffff" }
];

export default function AlertFeed() {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        // Initial populate
        setAlerts([
            { ...alertsPool[0], instanceId: Date.now() + 1, time: "Just now" },
            { ...alertsPool[1], instanceId: Date.now() + 2, time: "2m ago" }
        ]);

        const interval = setInterval(() => {
            const idx = Math.floor(Math.random() * alertsPool.length);
            const newAlert = { ...alertsPool[idx], instanceId: Date.now(), time: "Just now" };
            setAlerts(prev => [newAlert, ...prev].slice(0, 8)); // keep max 8
        }, 8000); // 8 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
            <AnimatePresence>
                {alerts.map((alert) => (
                    <motion.div
                        key={alert.instanceId}
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    >
                        <GlassCard style={{ padding: '16px', borderLeft: `4px solid ${alert.color}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <span style={{
                                        fontSize: 9,
                                        fontWeight: 700,
                                        padding: '2px 8px',
                                        borderRadius: 4,
                                        backgroundColor: `${alert.color}22`,
                                        color: alert.color,
                                        border: `1px solid ${alert.color}44`
                                    }}>
                                        {alert.type}
                                    </span>
                                    <span style={{ fontSize: 10, color: '#008800', fontFamily: "'JetBrains Mono', monospace" }}>{alert.time}</span>
                                </div>
                                <button style={{
                                    background: 'transparent',
                                    border: `1px solid ${alert.color}88`,
                                    color: alert.color,
                                    borderRadius: 4,
                                    padding: '4px 10px',
                                    fontSize: 10,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}>Investigate</button>
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>
                                {alert.accountId}
                            </div>
                            <div style={{ fontSize: 12, color: '#00aa00' }}>
                                {alert.desc}
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
