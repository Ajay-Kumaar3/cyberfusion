import React, { useState, useEffect } from "react";
import StatCard from "../components/StatCard";
import AlertFeed from "../components/AlertFeed";
import GlassCard from "../components/GlassCard";
import { fetchDashboardSummary } from "../api/api";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { askGemini } from "../utils/gemini";
import { useBlockchain } from "../context/BlockchainContext";
import { indiaPaths, indiaViewBox } from "../utils/indiaMapPath";

const radarData = [
  { subject: 'Phishing', A: 85 },
  { subject: 'Takeover', A: 65 },
  { subject: 'Mule', A: 92 },
  { subject: 'Velocity', A: 78 },
  { subject: 'Geo-Anomaly', A: 45 },
  { subject: 'Dark Web', A: 60 },
];

export default function Dashboard() {
  const { blockedCount } = useBlockchain();
  const [timeLeft, setTimeLeft] = useState(47 * 60 + 23); // 47:23
  const [briefing, setBriefing] = useState("Analyzing threat landscape...");
  const [briefingDisplay, setBriefingDisplay] = useState("");
  const [summary, setSummary] = useState(null);

  const fetchBriefing = async (forceRefresh = false) => {
    setBriefing("Analyzing threat landscape...");
    setBriefingDisplay("");
    const prompt = "You are a SOC analyst AI. Given these active threats: 14 active threats, 37 mule accounts flagged, $2.4M under review, recovery window at 47 minutes. Write a 1-sentence threat briefing for the security team. Be specific and urgent.";
    const response = await askGemini(prompt, forceRefresh);
    setBriefing(response);
  };

  useEffect(() => {
    fetchBriefing();
    const interval = setInterval(() => {
      fetchBriefing();
    }, 300000); // 5 min
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (briefing === "Analyzing threat landscape...") {
      setBriefingDisplay(briefing);
      return;
    }
    setBriefingDisplay("");
    let i = 0;
    const t = setInterval(() => {
      setBriefingDisplay(briefing.slice(0, i));
      i++;
      if (i > briefing.length) clearInterval(t);
    }, 30);
    return () => clearInterval(t);
  }, [briefing]);

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(p => p > 0 ? p - 1 : 0), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetchDashboardSummary()
      .then(setSummary)
      .catch(err => console.error("Dashboard API:", err));
  }, []);

  const fmt = s => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sc = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sc}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, zIndex: 1, position: 'relative' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
        <StatCard title="HIGH RISK" targetValue={summary?.high_risk_accounts ?? 0} color="var(--accent)" />
        <StatCard title="ALERTS" targetValue={summary?.active_alerts ?? 0} color="var(--accent)" />
        <StatCard title="TXNS REVIEW" targetValue={summary?.transactions_flagged ?? 0} color="var(--accent)" />
        <StatCard title="ON-CHAIN BLOCKED" targetValue={blockedCount} color="var(--text-main)" />
        <GlassCard style={{ padding: 20, background: 'rgba(0, 255, 65, 0.05)', border: '1px solid rgba(0, 255, 65, 0.2)' }}>
          <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'blink 1s infinite' }} /> RECOVERY WINDOW
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)', fontFamily: "'JetBrains Mono', monospace" }}>
            {fmt(timeLeft)}
          </div>
        </GlassCard>
      </div>

      {/* Gemini Threat Briefing Banner */}
      <div style={{ backgroundColor: 'rgba(0, 255, 65, 0.08)', border: '1px solid rgba(0, 255, 65, 0.3)', borderRadius: 10, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#00FF41', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#00FF41', animation: 'blink 1.5s infinite' }} />
          [+] GEMINI BRIEFING
        </div>
        <div style={{ color: briefing === "Analyzing threat landscape..." ? '#666' : '#fff', fontSize: 13, flex: 1 }}>
          {briefingDisplay}
        </div>
        <button onClick={() => fetchBriefing(true)} style={{ backgroundColor: 'transparent', border: 'none', color: '#00FF41', fontSize: 12, cursor: 'pointer', flexShrink: 0, fontWeight: 600 }}>
          ↻ REFRESH
        </button>
      </div>

      {/* Main content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, minHeight: 480 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>

          {/* Top 3 Accounts at Risk strip */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, marginBottom: 12, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              TOP RISK ACCOUNTS
            </h3>
            <div style={{ display: 'flex', gap: '3%', justifyContent: 'space-between' }}>
              {[
                { id: "ACC-4821", risk: 95, status: "COMPROMISED", color: "#00FF41" },
                { id: "ACC-7743", risk: 88, status: "FROZEN", color: "#00FF41" },
                { id: "MULE-001", risk: 85, status: "FLAGGED", color: "#00cc00" }
              ].map(acc => (
                <GlassCard key={acc.id} style={{ width: '31%', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 'bold', fontSize: 13, color: 'var(--text-main)' }}>{acc.id}</span>
                    <a href="/accounts" style={{ color: 'var(--text-muted)', textDecoration: 'none', cursor: 'pointer' }}>→</a>
                  </div>
                  <div style={{ width: '100%', height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${acc.risk}%`, height: '100%', backgroundColor: acc.color }} />
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: acc.color, letterSpacing: '0.05em' }}>{acc.status}</div>
                </GlassCard>
              ))}
            </div>
          </div>

          <h3 style={{ fontSize: 18, marginBottom: 16, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', animation: 'blink 1.5s infinite', boxShadow: '0 0 8px var(--danger)' }}></span>
            Live Alert Feed
          </h3>
          <div style={{ flex: 1, padding: 4, paddingRight: 8, overflowY: 'auto' }}>
            <AlertFeed />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <GlassCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0' }}>
            <h3 style={{ fontSize: 14, color: 'var(--info)', marginBottom: 10, letterSpacing: '0.1em' }}>THREAT LEVEL RADAR</h3>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
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
                { label: 'Accounts Monitored', color: 'var(--info)', text: summary ? `${summary.total_accounts}` : '…' },
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

          {/* ATTACK ORIGINS MAP */}
          <GlassCard style={{ padding: 16, background: 'rgba(0, 255, 65, 0.05)', border: '1px solid rgba(0, 255, 65, 0.2)', borderRadius: 12 }}>
            <h3 style={{ fontSize: 14, color: 'var(--accent)', marginBottom: 16, letterSpacing: '0.1em', textAlign: 'center' }}>ATTACK ORIGINS</h3>
            <div style={{ position: 'relative', width: '100%', height: 260, overflow: 'hidden' }}>
              <svg viewBox={indiaViewBox} style={{ width: '100%', height: '100%' }}>
                {indiaPaths.map((path, i) => (
                  <path key={i} fill="var(--accent)" opacity={0.2} d={path} />
                ))}

                {[
                  { label: "Delhi", cx: 194, cy: 201, r: 8, color: "#00cc00" },
                  { label: "Mumbai", cx: 101, cy: 432, r: 16, color: "#00FF41" },
                  { label: "Bangalore", cx: 200, cy: 578, r: 10, color: "#00FF41" },
                  { label: "Kolkata", cx: 428, cy: 348, r: 12, color: "#00cc00" },
                  { label: "Chennai", cx: 257, cy: 576, r: 8, color: "rgba(255,255,255,0.7)" },
                  { label: "Hyderabad", cx: 219, cy: 472, r: 9, color: "#00FF41" },
                  { label: "Ahmedabad", cx: 95, cy: 336, r: 6, color: "rgba(255,255,255,0.7)" },
                  { label: "Pune", cx: 122, cy: 444, r: 7, color: "#00cc00" }
                ].map((dot, i) => (
                  <g key={i}>
                    <circle cx={dot.cx} cy={dot.cy} r={dot.r} fill={dot.color} opacity={0.8} />
                    <circle
                      cx={dot.cx}
                      cy={dot.cy}
                      r={dot.r}
                      fill={dot.color}
                      style={{
                        transformOrigin: `${dot.cx}px ${dot.cy}px`,
                        animation: `sonar-svg 2s infinite ease-out`,
                        animationDelay: `${i * 0.2}s`
                      }}
                    />
                  </g>
                ))}
              </svg>
              <style>{`
                @keyframes sonar-svg {
                  0% { transform: scale(1); opacity: 0.8; }
                  100% { transform: scale(3.5); opacity: 0; }
                }
              `}</style>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16, fontSize: 11, color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#00FF41' }}></span> Critical Origin</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#00cc00' }}></span> High</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.7)' }}></span> Medium</span>
            </div>
          </GlassCard>

        </div>
      </div>

      {/* Marquee Ticker */}
      <div style={{
        backgroundColor: 'rgba(0, 255, 65, 0.05)',
        borderTop: '1px solid rgba(0, 255, 65, 0.2)',
        borderRadius: '0 0 12px 12px',
        padding: '10px 20px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        marginTop: 'auto'
      }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#00FF41', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, zIndex: 10, position: 'relative' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#00FF41', animation: 'blink 1.5s infinite' }} />
          LIVE TXN FEED
        </div>

        <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', position: 'relative' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, display: 'inline-flex', gap: 40, animation: 'slide-left 25s linear infinite' }}>
            <span><span style={{ color: '#00FF41' }}>TXN-8821 · $4,200 · ACC-4821 → MULE-001</span> · <span style={{ color: '#ffffff' }}>[!] FLAGGED</span></span>
            <span><span style={{ color: '#00FF41' }}>TXN-4492 · $12,400 · MULE-001 → Crypto Exchange A</span> · <span style={{ color: '#ffffff' }}>[x] CRITICAL</span></span>
            <span><span style={{ color: '#00FF41' }}>TXN-3301 · $8,900 · MULE-002 → Crypto Exchange A</span> · <span style={{ color: '#ffffff' }}>[!] FLAGGED</span></span>
            <span><span style={{ color: '#00FF41' }}>TXN-7721 · $15,200 · MULE-003 → Wire Transfer HK</span> · <span style={{ color: '#ffffff' }}>[x] CRITICAL</span></span>
            <span><span style={{ color: '#00FF41' }}>TXN-1102 · $3,100 · ACC-9922 → Unknown Wallet</span> · <span style={{ color: '#ffffff' }}>[!] FLAGGED</span></span>
            <span><span style={{ color: '#00FF41' }}>TXN-5543 · $9,800 · ACC-5512 → Exchange B</span> · <span style={{ color: '#00FF41' }}>[+] CLEARED</span></span>
            <span><span style={{ color: '#00FF41' }}>TXN-6621 · $22,000 · MULE-006 → Offshore Account</span> · <span style={{ color: '#ffffff' }}>[x] CRITICAL</span></span>
            {/* Duplicates for infinite scroll */}
            <span><span style={{ color: '#00FF41' }}>TXN-8821 · $4,200 · ACC-4821 → MULE-001</span> · <span style={{ color: '#ffffff' }}>[!] FLAGGED</span></span>
            <span><span style={{ color: '#00FF41' }}>TXN-4492 · $12,400 · MULE-001 → Crypto Exchange A</span> · <span style={{ color: '#ffffff' }}>[x] CRITICAL</span></span>
          </div>
        </div>
        <style>{`
          @keyframes slide-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>
    </div>
  );
}
