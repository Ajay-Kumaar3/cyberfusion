import React, { useState, useEffect } from "react";
import StatCard from "../components/StatCard";
import AlertFeed from "../components/AlertFeed";
import GlassCard from "../components/GlassCard";
import { fetchDashboardSummary } from "../api/api";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

const radarData = [
  { subject: 'Phishing', A: 85, fullMark: 100 },
  { subject: 'Takeover', A: 65, fullMark: 100 },
  { subject: 'Mule', A: 92, fullMark: 100 },
  { subject: 'Velocity', A: 78, fullMark: 100 },
  { subject: 'Geo-Anomaly', A: 45, fullMark: 100 },
  { subject: 'Dark Web', A: 60, fullMark: 100 }
];

export default function Dashboard() {
  const [timeLeft, setTimeLeft] = useState(47 * 60 + 23);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetchDashboardSummary()
      .then(setSummary)
      .catch(err => console.error("Dashboard API error:", err));
  }, []);

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, zIndex: 1, position: 'relative' }}>
      {/* Top Stat Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
        <StatCard title="HIGH RISK ACCOUNTS" targetValue={summary?.high_risk_accounts ?? 14} color="var(--danger)" />
        <StatCard title="ACTIVE ALERTS" targetValue={summary?.active_alerts ?? 37} color="var(--warning)" />
        <StatCard title="TXNS UNDER REVIEW" targetValue={summary?.transactions_flagged ?? 0} color="var(--info)" />
        <GlassCard style={{ padding: 20, border: '1px solid rgba(0,255,0,0.3)', background: 'linear-gradient(135deg, rgba(0,255,0,0.1), rgba(0,255,0,0.02))' }}>
          <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'blink 1s infinite' }} />
            RECOVERY WINDOW
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--accent)', fontFamily: "'JetBrains Mono', monospace", filter: 'drop-shadow(0 0 10px rgba(0,255,0,0.4))' }}>
            {formatTime(timeLeft)}
          </div>
        </GlassCard>
      </div>

      {/* Main content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, minHeight: 480 }}>

        {/* Left Col - Alerts */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: 18, marginBottom: 16, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', animation: 'blink 1.5s infinite', boxShadow: '0 0 8px var(--danger)' }}></span>
            Live Alert Feed
          </h3>
          <div style={{ flex: 1, padding: 4, paddingRight: 8, overflowY: 'auto' }}>
            <AlertFeed />
          </div>
        </div>

        {/* Right Col - Radar & Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <GlassCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0' }}>
            <h3 style={{ fontSize: 14, color: 'var(--info)', marginBottom: 10, letterSpacing: '0.1em' }}>THREAT LEVEL RADAR</h3>
            <div style={{ width: '100%', height: 280, animation: 'pulse-glow 4s infinite' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'Space Grotesk' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Threat" dataKey="A" stroke="var(--accent)" strokeWidth={2} fill="var(--accent)" fillOpacity={0.15} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard style={{ padding: 20 }}>
            <h3 style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, letterSpacing: '0.1em' }}>SYSTEM STATUS</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'SOC Integration', color: 'var(--accent)', text: 'ACTIVE' },
                { label: 'AML Engine', color: 'var(--accent)', text: 'ACTIVE' },
                { label: 'Gemini AI', color: 'var(--special)', text: 'CONNECTED' },
                { label: `Accounts Monitored`, color: 'var(--info)', text: summary ? summary.total_accounts : '…' },
              ].map(({ label, color, text }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-main)' }}>{label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color, fontWeight: 'bold' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, animation: 'pulse-glow 2s infinite' }}></div>
                    {text}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Marquee Ticker */}
      <GlassCard style={{ padding: '0', overflow: 'hidden', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', height: 40, borderLeft: '4px solid var(--accent)' }}>
        <div style={{ background: 'rgba(0, 255, 0, 0.1)', color: 'var(--accent)', padding: '0 16px', fontSize: 11, fontWeight: 'bold', borderRight: '1px solid rgba(0,255,0,0.3)', zIndex: 2, height: '100%', display: 'flex', alignItems: 'center', letterSpacing: '0.05em' }}>TXN FEED</div>
        <div style={{ paddingLeft: 100, fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-muted)', animation: 'slide-left 40s linear infinite', display: 'flex', gap: 40 }}>
          <span>TXN-9281: ₹4,500 <span style={{ color: 'var(--accent)' }}>[+] CLEARED</span></span>
          <span>TXN-9282: ₹120 <span style={{ color: 'var(--accent)' }}>[+] CLEARED</span></span>
          <span>TXN-9283: ₹12,400 <span style={{ color: 'var(--danger)' }}>[x] BLOCKED</span></span>
          <span>TXN-9284: ₹50 <span style={{ color: 'var(--accent)' }}>[+] CLEARED</span></span>
          <span>TXN-9285: ₹8,900 <span style={{ color: 'var(--warning)' }}>[!] UNDER REVIEW</span></span>
          <span>TXN-9286: ₹200 <span style={{ color: 'var(--accent)' }}>[+] CLEARED</span></span>
          <span>TXN-9287: ₹15,200 <span style={{ color: 'var(--danger)' }}>[x] BLOCKED</span></span>
          <span>TXN-9281: ₹4,500 <span style={{ color: 'var(--accent)' }}>[+] CLEARED</span></span>
          <span>TXN-9282: ₹120 <span style={{ color: 'var(--accent)' }}>[+] CLEARED</span></span>
          <span>TXN-9283: ₹12,400 <span style={{ color: 'var(--danger)' }}>[x] BLOCKED</span></span>
        </div>
        <style>{`@keyframes slide-left { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
      </GlassCard>
    </div>
  );
}
