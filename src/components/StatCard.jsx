import React, { useState, useEffect } from "react";
import GlassCard from "./GlassCard";

export default function StatCard({ title, targetValue, color, suffix = "", prefix = "" }) {
    const [val, setVal] = useState(0);

    useEffect(() => {
        let start = 0;
        const duration = 1500;
        const step = Math.max(1, targetValue / (duration / 16));
        const isFloat = !Number.isInteger(targetValue);

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
        <GlassCard style={{ padding: 20 }}>
            {/* Glow */}
            <div style={{
                position: 'absolute', top: -20, right: -20, width: 60, height: 60,
                background: color, filter: 'blur(30px)', opacity: 0.15, pointerEvents: 'none'
            }} />
            <div style={{ fontSize: 12, color: '#008800', fontWeight: 600, marginBottom: 8 }}>{title}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace" }}>
                {prefix}{displayVal}{suffix}
            </div>
        </GlassCard>
    );
}
