import React from "react";

export default function RiskGauge({ score, size = 120 }) {
    const r = size / 2 - 10;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;

    const color = 'var(--accent)';

    return (
        <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0, 255, 65, 0.1)" strokeWidth={4} />
                <circle
                    cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4}
                    strokeDasharray={circ} strokeDashoffset={offset}
                    strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{ transition: "stroke-dashoffset 1s ease" }}
                />
                <text x={size / 2} y={size / 2 + 6} textAnchor="middle" fill={color} fontSize={size / 3.5} fontWeight="800" fontFamily="'Space Grotesk', sans-serif">
                    {score}
                </text>
            </svg>
        </div>
    );
}
