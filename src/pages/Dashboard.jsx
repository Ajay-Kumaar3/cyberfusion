import React, { useState, useEffect } from "react";
import StatCard from "../components/StatCard";
import AlertFeed from "../components/AlertFeed";
import GlassCard from "../components/GlassCard";
import { fetchDashboardSummary } from "../api/api";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { askGemini } from "../utils/gemini";

const radarData = [
  { subject: 'Phishing', A: 85 },
  { subject: 'Takeover', A: 65 },
  { subject: 'Mule', A: 92 },
  { subject: 'Velocity', A: 78 },
  { subject: 'Geo-Anomaly', A: 45 },
  { subject: 'Dark Web', A: 60 },
];

export default function Dashboard() {
  const [timeLeft, setTimeLeft] = useState(47 * 60 + 23); // 47:23
  const [briefing, setBriefing] = useState("Analyzing threat landscape...");
  const [briefingDisplay, setBriefingDisplay] = useState("");
  const [summary, setSummary] = useState(null);

  const fetchBriefing = async () => {
    setBriefing("Analyzing threat landscape...");
    setBriefingDisplay("");
    const prompt = "You are a SOC analyst AI. Given these active threats: 14 active threats, 37 mule accounts flagged, $2.4M under review, recovery window at 47 minutes. Write a 1-sentence threat briefing for the security team. Be specific and urgent.";
    const response = await askGemini(prompt);
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
        <StatCard title="HIGH RISK ACCOUNTS" targetValue={summary?.high_risk_accounts ?? 0} color="var(--danger)" />
        <StatCard title="ACTIVE ALERTS" targetValue={summary?.active_alerts ?? 0} color="var(--warning)" />
        <StatCard title="TXNS UNDER REVIEW" targetValue={summary?.transactions_flagged ?? 0} color="var(--info)" />
        <GlassCard style={{ padding: 20, border: '1px solid rgba(0,255,0,0.3)', background: 'linear-gradient(135deg,rgba(0,255,0,0.1),rgba(0,255,0,0.02))' }}>
          <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'blink 1s infinite' }} /> RECOVERY WINDOW
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--accent)', fontFamily: "'JetBrains Mono', monospace", filter: 'drop-shadow(0 0 10px rgba(0,255,0,0.4))' }}>
            {fmt(timeLeft)}
          </div>
        </GlassCard>
      </div>

      {/* Gemini Threat Briefing Banner */}
      <div style={{ backgroundColor: 'rgba(0, 255, 0, 0.08)', border: '1px solid rgba(0, 255, 0, 0.3)', borderRadius: 10, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#00ff00', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#00ff00', animation: 'blink 1.5s infinite' }} />
          [+] GEMINI BRIEFING
        </div>
        <div style={{ color: briefing === "Analyzing threat landscape..." ? '#666' : '#fff', fontSize: 13, flex: 1 }}>
          {briefingDisplay}
        </div>
        <button onClick={fetchBriefing} style={{ backgroundColor: 'transparent', border: 'none', color: '#00ff00', fontSize: 12, cursor: 'pointer', flexShrink: 0, fontWeight: 600 }}>
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
                { id: "ACC-4821", risk: 95, status: "COMPROMISED", color: "#00ff00" },
                { id: "ACC-7743", risk: 88, status: "FROZEN", color: "#00ff00" },
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
          <GlassCard style={{ padding: 16, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 12 }}>
            <h3 style={{ fontSize: 14, color: 'var(--info)', marginBottom: 16, letterSpacing: '0.1em', textAlign: 'center' }}>ATTACK ORIGINS</h3>
            <div style={{ position: 'relative', width: '100%', height: 220, overflow: 'hidden' }}>
              <svg viewBox="0 0 400 220" style={{ width: '100%', height: '100%', opacity: 0.2 }}>
                <path fill="#ffffff" d="M381.1,19.2c-2.3-1.6-4.6,0-4.6,0s-0.7,2.2-0.2,3.3c0.6,1.4,1.4,5,1.4,5s-1.4,1.8-1,3 c0.4,1.1,1.5,1,1.5,1s1.1,0.5,1.7-0.7C380.3,29.9,380.8,24,381.1,19.2z M35.2,50c-2.7-0.1-5,0.7-5,0.7s-0.7,0.4-0.1,1.4 c0.6,0.9,0.7,1,0.7,1s2.5-0.1,3.4-0.4c1-0.3,4-1.2,4-1.2S36.9,50,35.2,50z M63.3,42.4c0,0-4.2-2.1-5.1-1.7 c-0.9,0.4-3.1,0-3.1,0s0.3,1.6,1.8,1.4c1.3-0.2,3.3,1.3,3.3,1.3S63.3,42.4,63.3,42.4z M45.8,59.2c-0.1-0.9-1.2-1.9-1.2-1.9 s-2.8,0.2-2.7,1c0.1,0.8,2,2,2,2S46,59.8,45.8,59.2z M74.2,47c-0.9,0.7-3.9,0-3.9,0s-1.8,2.8-1,3.5c0.7,0.7,2.4,1.8,2.4,1.8 s2.3-1.6,2.2-2.7C73.8,48.5,74.2,47,74.2,47z M82,49c-0.7-1-1.4-1.9-1.4-1.9s-1.8,2.4-0.8,3.3C80.8,51.3,82.4,50,82,49z M93.1,43 c0,0-1.8,1.2-1.6,2.1c0.2,0.9,3,1.2,3,1.2s0.5-2.2-0.3-2.6C93.4,43.2,93.1,43,93.1,43z M88.9,32.3c0,0-2.6,3.4-3.5,3.3 c-0.9-0.1-4.7,2.7-4.7,2.7s1.3,1.8,3,0.8C85.5,38.1,88.9,32.3,88.9,32.3z" />
                <path fill="#ffffff" d="M129.5,45.8c0,0-2.5,0.1-3,0.3c-0.5,0.2-0.8,0.8-0.8,0.8s-2.1,3,0.5,3 c2.2,0,4.8,0.6,6.3,0.2c1.7-0.5,2.1-2,2.1-2S130.6,45.3,129.5,45.8z" />
                <path fill="#ffffff" d="M192.5,45.8c0,0-10.5,0.1-13,0.3c-2.5,0.2-4.8,0.8-4.8,0.8s-2.1,3,0.5,3 c2.2,0,14.8,0.6,16.3,0.2c1.7-0.5,4.1-2,4.1-2S195.6,45.3,192.5,45.8z" />
                <path fill="#ffffff" d="M292.5,85.8c0,0-15.5,10.1-23,20.3c-2.5,0.2-4.8,0.8-4.8,0.8s-2.1,3,0.5,3 c2.2,0,14.8,0.6,16.3,0.2c1.7-0.5,8.1-12,8.1-12S295.6,85.3,292.5,85.8z M168,160.8c-2,10.1-13,20.3-13,20.3c-2.5,0.2-4.8,0.8-4.8,0.8s-2.1,3,0.5,3 c2.2,0,14.8,0.6,16.3,0.2c1.7-0.5,8.1-12,8.1-12S170,140.3,168,160.8z M228,120.8c-2,10.1-13,20.3-13,20.3c-2.5,0.2-4.8,0.8-4.8,0.8s-2.1,3,0.5,3 c2.2,0,14.8,0.6,16.3,0.2c1.7-0.5,8.1-12,8.1-12S230,120.3,228,120.8z" />
              </svg>
              {[
                { label: "RU", x: 280, y: 70, color: "#00ff00", size: 8 },
                { label: "CN", x: 340, y: 100, color: "#00ff00", size: 10 },
                { label: "NG", x: 220, y: 160, color: "#00ff00", size: 6 },
                { label: "BR", x: 130, y: 170, color: "#00ff00", size: 7 },
                { label: "RO", x: 245, y: 85, color: "#00ff00", size: 5 },
                { label: "UA", x: 255, y: 78, color: "#00ff00", size: 7 },
                { label: "VN", x: 335, y: 130, color: "#00ff00", size: 5 },
                { label: "IN", x: 310, y: 120, color: "#00ff00", size: 6 }
              ].map((dot, i) => (
                <div key={i} style={{ position: 'absolute', top: dot.y, left: dot.x }}>
                  <div style={{ width: dot.size, height: dot.size, backgroundColor: dot.color, borderRadius: '50%', position: 'absolute', transform: 'translate(-50%, -50%)', zIndex: 2 }} title={dot.label} />
                  <div style={{ width: dot.size, height: dot.size, backgroundColor: dot.color, borderRadius: '50%', position: 'absolute', transform: 'translate(-50%, -50%)', zIndex: 1, animation: `sonar 2s infinite ease-out`, animationDelay: `${i * 0.2}s` }} />
                </div>
              ))}
              <style>{`
                @keyframes sonar {
                  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
                  100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
                }
              `}</style>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16, fontSize: 11, color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#00ff00' }}></span> Critical Origin</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#00cc00' }}></span> High</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#008800' }}></span> Medium</span>
            </div>
          </GlassCard>

        </div>
      </div>

      {/* Marquee Ticker */}
      <div style={{
        backgroundColor: 'rgba(0, 255, 0, 0.05)',
        borderTop: '1px solid rgba(0, 255, 0, 0.2)',
        borderRadius: '0 0 12px 12px',
        padding: '10px 20px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        marginTop: 'auto'
      }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#00ff00', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, zIndex: 10, position: 'relative' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#00ff00', animation: 'blink 1.5s infinite' }} />
          LIVE TXN FEED
        </div>

        <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', position: 'relative' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, display: 'inline-flex', gap: 40, animation: 'slide-left 25s linear infinite' }}>
            <span><span style={{ color: '#00ff00' }}>TXN-8821 · $4,200 · ACC-4821 → MULE-001</span> · <span style={{ color: '#ffffff' }}>[!] FLAGGED</span></span>
            <span><span style={{ color: '#00ff00' }}>TXN-4492 · $12,400 · MULE-001 → Crypto Exchange A</span> · <span style={{ color: '#ffffff' }}>[x] CRITICAL</span></span>
            <span><span style={{ color: '#00ff00' }}>TXN-3301 · $8,900 · MULE-002 → Crypto Exchange A</span> · <span style={{ color: '#ffffff' }}>[!] FLAGGED</span></span>
            <span><span style={{ color: '#00ff00' }}>TXN-7721 · $15,200 · MULE-003 → Wire Transfer HK</span> · <span style={{ color: '#ffffff' }}>[x] CRITICAL</span></span>
            <span><span style={{ color: '#00ff00' }}>TXN-1102 · $3,100 · ACC-9922 → Unknown Wallet</span> · <span style={{ color: '#ffffff' }}>[!] FLAGGED</span></span>
            <span><span style={{ color: '#00ff00' }}>TXN-5543 · $9,800 · ACC-5512 → Exchange B</span> · <span style={{ color: '#00ff00' }}>[+] CLEARED</span></span>
            <span><span style={{ color: '#00ff00' }}>TXN-6621 · $22,000 · MULE-006 → Offshore Account</span> · <span style={{ color: '#ffffff' }}>[x] CRITICAL</span></span>
            {/* Duplicates for infinite scroll */}
            <span><span style={{ color: '#00ff00' }}>TXN-8821 · $4,200 · ACC-4821 → MULE-001</span> · <span style={{ color: '#ffffff' }}>[!] FLAGGED</span></span>
            <span><span style={{ color: '#00ff00' }}>TXN-4492 · $12,400 · MULE-001 → Crypto Exchange A</span> · <span style={{ color: '#ffffff' }}>[x] CRITICAL</span></span>
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
