import React, { useState, useEffect } from "react";
import { streamGemini } from "../utils/gemini";
import GlassCard from "./GlassCard";

const systemPrompt = `You are CyberFusion's AI analyst specializing in connecting cyber attacks to financial crime. You analyze money mule networks, phishing campaigns, and suspicious transactions. Be concise, analytical, and action-oriented. Format responses in 2-3 short paragraphs. Always end with a 'Recommended Action'. `;

export default function GeminiPanel({ title = "GEMINI INTELLIGENCE REPORT", prompt, trigger, dataContext }) {
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (trigger && prompt) {
            const run = async () => {
                setLoading(true);
                setText("");
                const fullPrompt = `${systemPrompt}\n\nContext block: ${JSON.stringify(dataContext)}\n\nQuery: ${prompt}`;
                try {
                    await streamGemini(fullPrompt, (chunk) => {
                        setText(chunk);
                    });
                } catch (e) {
                    setText("Analysis unavailable.");
                }
                setLoading(false);
            };
            run();
        }
    }, [trigger, prompt, dataContext]);

    return (
        <GlassCard style={{ borderColor: 'rgba(255, 255, 255, 0.3)', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid rgba(255, 255, 255, 0.2)', paddingBottom: 8 }}>
                <span style={{ fontSize: 18, marginRight: 8 }}>🤖</span>
                <h3 style={{ margin: 0, color: '#ffffff', fontSize: 13, fontWeight: 700, letterSpacing: '0.05em' }}>{title}</h3>
            </div>

            {loading && text.length === 0 ? (
                <div style={{ padding: '20px 0' }}>
                    <div className="skeleton-pulse" style={{ height: 12, width: '100%', marginBottom: 10, background: 'rgba(255,255,255,0.2)', borderRadius: 4 }}></div>
                    <div className="skeleton-pulse" style={{ height: 12, width: '80%', marginBottom: 10, background: 'rgba(255,255,255,0.2)', borderRadius: 4 }}></div>
                    <div className="skeleton-pulse" style={{ height: 12, width: '60%', background: 'rgba(255,255,255,0.2)', borderRadius: 4 }}></div>
                </div>
            ) : (
                <div style={{ fontSize: 13, lineHeight: 1.6, color: '#ffffff', whiteSpace: 'pre-wrap' }}>
                    {text || "Awaiting intelligence request..."}
                    {loading && <span className="gemini-cursor" style={{ display: 'inline-block', width: 6, height: 14, background: '#ffffff', marginLeft: 4, animation: 'blink 1s infinite' }}></span>}
                </div>
            )}
        </GlassCard>
    );
}
