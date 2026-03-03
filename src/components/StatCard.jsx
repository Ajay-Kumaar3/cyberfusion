import React, { useState, useEffect } from "react";
import GlassCard from "./GlassCard";

export default function StatCard({ title, targetValue, color, suffix = "", prefix = "" }) {
    const [val, setVal] = useState(0);

    useEffect(() => {
        let start = 0;
        const duration = 1500;
        const step = Math.max(1, targetValue / (duration / 16));

        if (targetValue === 0) return;

        const t = setInterval(() => {
            start += step;
            if (start >= targetValue) {
                setVal(targetValue);
                clearInterval(t);
            } else {
                setVal(start);
            }
        }, 16);
        return () => clearInterval(t);
    }, [targetValue]);

    const displayVal = val > 1000 ? (val / 1000).toFixed(1) + 'k' : val.toLocaleString(undefined, { maximumFractionDigits: val % 1 !== 0 ? 1 : 0 });

    return (
        <GlassCard style={{ padding: 20, background: 'rgba(0, 255, 65, 0.05)', border: '1px solid rgba(0, 255, 65, 0.2)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8, letterSpacing: '0.05em' }}>{title}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: color, fontFamily: "'JetBrains Mono', monospace" }}>
                {prefix}{displayVal}{suffix}
            </div>
        </GlassCard>
    );
}
