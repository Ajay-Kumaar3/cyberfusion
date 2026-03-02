import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "./GlassCard";

const ALERT_POOL = [
  {
    id: 1, type: "ACCOUNT_TAKEOVER", severity: "CRIT", account: "ACC-4821",
    msg: "Login from new device in Mumbai — 3rd country in 24h", time: "Just now"
  },
  {
    id: 2, type: "MULE_FLAGGED", severity: "HIGH", account: "MULE-004",
    msg: "Velocity exceeded 500% of monthly average", time: "Just now"
  },
  {
    id: 3, type: "PATTERN_MATCH", severity: "CRIT", account: "ACC-1002",
    msg: "Matches Lazarus Group laundering behavioral pattern", time: "2m ago"
  },
  {
    id: 4, type: "SUSPICIOUS_TXN", severity: "HIGH", account: "ACC-9922",
    msg: "$10k wire to unknown crypto exchange flagged", time: "4m ago"
  },
  {
    id: 5, type: "PHISHING_DETECTED", severity: "CRIT", account: "ACC-3341",
    msg: "Phishing link clicked from corporate email — credentials at risk", time: "6m ago"
  },
  {
    id: 6, type: "MULE_FLAGGED", severity: "HIGH", account: "MULE-001",
    msg: "Linked to 3 inbound transfers from flagged accounts", time: "8m ago"
  },
  {
    id: 7, type: "GEO_ANOMALY", severity: "MED", account: "ACC-7743",
    msg: "Transaction origin: Kyiv. Account registered: Chennai", time: "11m ago"
  },
  {
    id: 8, type: "DEVICE_CHANGE", severity: "MED", account: "ACC-5512",
    msg: "4th new device registered this week", time: "15m ago"
  },
  {
    id: 9, type: "DARK_WEB_SIGNAL", severity: "CRIT", account: "ACC-4821",
    msg: "Credentials found in dark web dump — immediate freeze recommended", time: "18m ago"
  },
  {
    id: 10, type: "ACCOUNT_TAKEOVER", severity: "HIGH", account: "ACC-2290",
    msg: "Session token reused from different IP — session hijack suspected", time: "22m ago"
  },
  {
    id: 11, type: "MULE_RING", severity: "CRIT", account: "RING-006",
    msg: "New mule ring detected — 6 accounts, $36k total exposure", time: "25m ago"
  },
  {
    id: 12, type: "SUSPICIOUS_TXN", severity: "MED", account: "ACC-8812",
    msg: "Structuring pattern: 9 transactions just below $10k threshold", time: "30m ago"
  }
];

export default function AlertFeed() {
  const [alerts, setAlerts] = useState([]);

  const getBorderColor = (severity) => {
    if (severity === 'CRIT') return '#00ff00';
    if (severity === 'HIGH') return '#00cc00';
    return '#008800';
  };

  useEffect(() => {
    const init1 = { ...ALERT_POOL[0], instanceId: Date.now() + 1 };
    const init2 = { ...ALERT_POOL[1], instanceId: Date.now() + 2 };
    setAlerts([init1, init2]);

    const interval = setInterval(() => {
      setAlerts(prev => {
        const currentPool = ALERT_POOL.filter(a => prev.length === 0 || a.id !== prev[0].id);
        const newAlertBase = currentPool[Math.floor(Math.random() * currentPool.length)];
        const newAlert = { ...newAlertBase, instanceId: Date.now() };
        return [newAlert, ...prev].slice(0, 8); // max 8 visible
      });
    }, 8000); // 8 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
      <AnimatePresence>
        {alerts.map((alert) => {
          const color = getBorderColor(alert.severity);
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
                    <span style={{
                      fontSize: 9,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 4,
                      backgroundColor: `${color}22`,
                      color: color,
                      border: `1px solid ${color}44`
                    }}>
                      {alert.type}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>{alert.time}</span>
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>
                  {alert.account}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {alert.msg}
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
