import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { BANK_NETWORK, PROPAGATION_EVENTS } from '../data/networkData';
import GlassCard from '../components/GlassCard';

const NODE_CONFIG = {
    HUB: { r: 32, fill: '#020509', stroke: '#00ff88', strokeWidth: 3, color: '#00ff88' },
    BANK: { r: 22, fill: 'rgba(0,255,136,0.1)', stroke: '#00ff88', strokeWidth: 1.5, color: '#00ff88' },
    BANK_INTL: { r: 18, fill: 'rgba(0,212,255,0.1)', stroke: '#00d4ff', strokeWidth: 1.5, color: '#00d4ff' },
    REGULATOR: { r: 20, fill: 'rgba(162,89,255,0.1)', stroke: '#a259ff', strokeWidth: 1.5, color: '#a259ff' },
    THREAT: { r: 16, fill: 'rgba(255,51,102,0.15)', stroke: '#ff3366', strokeWidth: 1.5, color: '#ff3366' },
    EXIT: { r: 14, fill: 'rgba(255,170,0,0.1)', stroke: '#ffaa00', strokeWidth: 1.5, color: '#ffaa00' }
};

const EDGE_CONFIG = {
    SHARES_INTEL: { stroke: '#00ff88', opacity: 0.4, strokeWidth: 1, dashed: '4,4' },
    REPORTS_TO: { stroke: '#a259ff', opacity: 0.5, strokeWidth: 1 },
    ATTACKS: { stroke: '#ff3366', opacity: 0.6, strokeWidth: 1.5, animated: true },
    RECEIVES: { stroke: '#ffaa00', opacity: 0.4, strokeWidth: 1 }
};

const FLAGS = {
    IN: "🇮🇳",
    GB: "🇬🇧",
    SG: "🇸🇬",
    RU: "🇷🇺",
    UNKNOWN: "🚩",
    INTL: "🌐"
};

export default function NetworkIntelligence() {
    const d3Container = useRef(null);
    const simulationRef = useRef(null);
    const [networkStats, setNetworkStats] = useState({
        alerts_shared: 24, banks_protected: 7, threats_blocked: 12
    });
    const [eventLog, setEventLog] = useState([]);
    const [nodeData, setNodeData] = useState(BANK_NETWORK.nodes.map(n => ({ ...n })));

    const triggerPropagation = useCallback((eventRecord) => {
        const event = eventRecord || PROPAGATION_EVENTS[Math.floor(Math.random() * PROPAGATION_EVENTS.length)];
        
        // Update stats
        setNetworkStats(prev => ({
            ...prev,
            alerts_shared: prev.alerts_shared + 1,
            threats_blocked: prev.threats_blocked + event.propagate_to.length
        }));

        // Add to log
        setEventLog(prev => [{
            ...event,
            timestamp: new Date().toLocaleTimeString(),
            bank_name: BANK_NETWORK.nodes.find(n => n.id === event.trigger_bank)?.label.replace('\n', ' ')
        }, ...prev].slice(0, 10));

        const svg = d3.select(d3Container.current).select("svg");
        
        // 1. Trigger bank pulse
        svg.selectAll(".node-group")
            .filter(d => d.id === event.trigger_bank)
            .transition()
            .duration(300)
            .attr("transform", d => `translate(${d.x},${d.y}) scale(1.4)`)
            .transition()
            .duration(500)
            .attr("transform", d => `translate(${d.x},${d.y}) scale(1)`);

        // 2. Animate signals
        event.propagate_to.forEach((targetId, index) => {
            const edge = BANK_NETWORK.edges.find(e => 
                (e.source === event.trigger_bank && e.target === targetId) ||
                (e.target === event.trigger_bank && e.source === targetId) ||
                // Hub brokering
                (e.source === "cf_hub" && e.target === targetId)
            );

            // Create signal dot traveling from hub (brokered) or direct triggering
            // Actually, prompt says: "Dots travel along each edge TO the target banks"
            // "The hub node (CyberFusion) flashes briefly to indicate it brokered the intelligence share"
            
            // First flash hub
            svg.selectAll(".node-group")
                .filter(d => d.id === "cf_hub")
                .transition()
                .delay(200)
                .duration(200)
                .style("filter", "brightness(2) drop-shadow(0 0 10px #00ff88)");

            // Signal dots from hub to targets
            const sourceNode = BANK_NETWORK.nodes.find(n => n.id === "cf_hub");
            const targetNode = BANK_NETWORK.nodes.find(n => n.id === targetId);

            if (sourceNode && targetNode) {
                const signal = svg.append("circle")
                    .attr("r", 4)
                    .attr("fill", "#00ff88")
                    .attr("cx", sourceNode.x)
                    .attr("cy", sourceNode.y)
                    .attr("filter", "url(#glow)");

                signal.transition()
                    .delay(event.delay_ms * (index * 0.2))
                    .duration(800)
                    .attr("cx", targetNode.x)
                    .attr("cy", targetNode.y)
                    .on("end", () => {
                        signal.remove();
                        // 3. Target bank lights up
                        svg.selectAll(".node-group")
                            .filter(d => d.id === targetId)
                            .transition()
                            .duration(200)
                            .attr("transform", d => `translate(${d.x},${d.y}) scale(1.2)`)
                            .transition()
                            .duration(300)
                            .attr("transform", d => `translate(${d.x},${d.y}) scale(1)`);
                        
                        // Increment alert count in UI state if needed, but for now just visual
                    });
            }
        });
    }, []);

    useEffect(() => {
        if (!d3Container.current) return;

        d3.select(d3Container.current).selectAll("*").remove();

        const width = d3Container.current.clientWidth;
        const height = d3Container.current.clientHeight;

        const svg = d3.select(d3Container.current)
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const defs = svg.append("defs");
        
        // Glow filter
        const filter = defs.append("filter").attr("id", "glow");
        filter.append("feGaussianBlur").attr("stdDeviation", "3.5").attr("result", "coloredBlur");
        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "coloredBlur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");

        // Edge animation style
        svg.append("style").text(`
            @keyframes dash {
                to { stroke-dashoffset: -20; }
            }
            .edge-animated {
                stroke-dasharray: 5,5;
                animation: dash 1s linear infinite;
            }
            @keyframes pulse-node {
                0% { opacity: 0.6; r: 16; }
                50% { opacity: 1; r: 19; }
                100% { opacity: 0.6; r: 16; }
            }
            .pulse-threat {
                animation: pulse-node 2s infinite ease-in-out;
            }
        `);

        const nodes = BANK_NETWORK.nodes.map(d => ({ ...d }));
        const links = BANK_NETWORK.edges.map(d => ({ ...d }));

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(150))
            .force("charge", d3.forceManyBody().strength(-600))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide().radius(d => NODE_CONFIG[d.type].r + 20));

        simulationRef.current = simulation;

        const link = svg.append("g")
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke", d => EDGE_CONFIG[d.type].stroke)
            .attr("stroke-opacity", d => EDGE_CONFIG[d.type].opacity)
            .attr("stroke-width", d => EDGE_CONFIG[d.type].strokeWidth)
            .attr("stroke-dasharray", d => EDGE_CONFIG[d.type].dashed || "none")
            .attr("class", d => EDGE_CONFIG[d.type].animated ? "edge-animated" : "");

        const nodeGroup = svg.append("g")
            .selectAll("g")
            .data(nodes)
            .join("g")
            .attr("class", "node-group")
            .call(d3.drag()
                .on("start", (event, d) => {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on("drag", (event, d) => {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on("end", (event, d) => {
                    if (!event.active) simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                }));

        nodeGroup.append("circle")
            .attr("r", d => NODE_CONFIG[d.type].r)
            .attr("fill", d => NODE_CONFIG[d.type].fill)
            .attr("stroke", d => NODE_CONFIG[d.type].stroke)
            .attr("stroke-width", d => NODE_CONFIG[d.type].strokeWidth)
            .style("filter", d => d.type === 'HUB' || d.type === 'THREAT' ? "url(#glow)" : "none")
            .attr("class", d => d.type === 'THREAT' ? "pulse-threat" : "");

        nodeGroup.append("text")
            .attr("dy", d => NODE_CONFIG[d.type].r + 15)
            .attr("text-anchor", "middle")
            .attr("fill", d => NODE_CONFIG[d.type].color)
            .attr("font-size", "10px")
            .attr("font-family", "'JetBrains Mono', monospace")
            .selectAll("tspan")
            .data(d => d.label.split('\n'))
            .join("tspan")
            .attr("x", 0)
            .attr("dy", (d, i) => i === 0 ? "1.2em" : "1.1em")
            .text(d => d);

        nodeGroup.append("text")
            .attr("dy", d => -(NODE_CONFIG[d.type].r + 5))
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .text(d => FLAGS[d.country] || "");

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            nodeGroup.attr("transform", d => `translate(${d.x},${d.y})`);
        });

        // Initial propagation trigger
        const handle = setInterval(() => triggerPropagation(), 12000);
        return () => clearInterval(handle);
    }, [triggerPropagation]);

    return (
        <div style={{ padding: '0 20px', color: '#ffffff' }}>
            {/* Header section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>CROSS-BANK INTELLIGENCE NETWORK</h1>
                    <div style={{ fontSize: 13, color: '#7A8E7A', marginTop: 4 }}>Real-time threat propagation across 7 integrated institutions</div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ padding: '8px 16px', background: 'rgba(0, 255, 136, 0.05)', borderRadius: 8, border: '1px solid rgba(0, 255, 136, 0.2)', color: '#00ff88', fontSize: 11, fontWeight: 'bold' }}>7 BANKS CONNECTED</div>
                    <div style={{ padding: '8px 16px', background: 'rgba(255, 170, 0, 0.05)', borderRadius: 8, border: '1px solid rgba(255, 170, 0, 0.2)', color: '#ffaa00', fontSize: 11, fontWeight: 'bold' }}>{networkStats.alerts_shared} ALERTS SHARED</div>
                    <div style={{ padding: '8px 16px', background: 'rgba(255, 51, 102, 0.05)', borderRadius: 8, border: '1px solid rgba(255, 51, 102, 0.2)', color: '#ff3366', fontSize: 11, fontWeight: 'bold' }}>{networkStats.threats_blocked} THREATS BLOCKED</div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 24, height: 'calc(100vh - 180px)' }}>
                {/* LEFT — D3 Network Graph */}
                <div style={{ flex: '0 0 65%', display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <GlassCard style={{ flex: 1, padding: 0, position: 'relative', overflow: 'hidden' }}>
                        <div ref={d3Container} style={{ width: '100%', height: '100%' }}></div>
                        <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', width: '90%' }}>
                            <button className="hover-lift" onClick={() => triggerPropagation()} style={{
                                width: '100%', padding: '14px', background: 'rgba(0, 255, 136, 0.1)', color: '#00FF41',
                                border: '1px solid rgba(0, 255, 136, 0.3)', borderRadius: 12, fontWeight: 'bold', cursor: 'pointer',
                                fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, boxShadow: '0 8px 32px rgba(0, 255, 136, 0.1)', letterSpacing: '0.05em'
                            }}>
                                ⚡ SIMULATE THREAT PROPAGATION
                            </button>
                        </div>
                    </GlassCard>
                </div>

                {/* RIGHT — Intelligence Feed Panel */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto', paddingRight: 4 }}>
                    <GlassCard style={{ padding: 20 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#00ff88', marginBottom: 16, letterSpacing: '0.05em' }}>THREAT INTELLIGENCE FEED</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {eventLog.length === 0 && <div style={{ color: '#7A8E7A', fontSize: 12, textAlign: 'center', padding: 20 }}>Waiting for network activity...</div>}
                            {eventLog.map((event, i) => (
                                <div key={i} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderLeft: `3px solid ${event.type === 'MULE_FLAGGED' ? '#ff3366' : '#a259ff'}`, borderRadius: '0 8px 8px 0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ fontSize: 12, fontWeight: 'bold' }}>{FLAGS[BANK_NETWORK.nodes.find(n => n.id === event.trigger_bank)?.country]} {event.bank_name}</span>
                                        <span style={{ fontSize: 10, color: '#7A8E7A' }}>{event.timestamp}</span>
                                    </div>
                                    <div style={{ fontSize: 11, color: '#ffffff', opacity: 0.8 }}>→ Shared with {event.propagate_to.length} institutions</div>
                                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                        <span style={{ fontSize: 9, padding: '2px 6px', background: 'rgba(255,51,102,0.1)', color: '#ff3366', borderRadius: 4, fontWeight: 'bold' }}>{event.type}</span>
                                        <span style={{ fontSize: 9, color: '#00ff88' }}>₹{event.amount} exposure prevented</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                    <GlassCard style={{ padding: 20 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#00ff88', marginBottom: 16, letterSpacing: '0.05em' }}>NETWORK STATUS</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {BANK_NETWORK.nodes.filter(n => n.type.startsWith('BANK')).map(bank => (
                                <div key={bank.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span>{FLAGS[bank.country]}</span>
                                        <span style={{ fontWeight: 'bold' }}>{bank.label.replace('\n', ' ')}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <span style={{ fontSize: 9, padding: '2px 6px', background: 'rgba(0,255,136,0.1)', color: '#00ff88', borderRadius: 10 }}>{bank.status}</span>
                                        <span style={{ color: '#ffaa00' }}>{bank.alerts} alerts</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                    <GlassCard style={{ padding: 20, background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, rgba(255, 51, 102, 0.05) 100%)' }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#ffffff', marginBottom: 16, textAlign: 'center' }}>SILOS vs NETWORK</div>
                        <div style={{ display: 'flex', gap: 16 }}>
                            <div style={{ flex: 1, padding: 12, background: 'rgba(255,51,102,0.03)', border: '1px solid rgba(255,51,102,0.1)', borderRadius: 12 }}>
                                <div style={{ fontSize: 9, color: '#ff3366', fontWeight: 800, marginBottom: 8 }}>WITHOUT CYBERFUSION</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 10, color: '#ff3366' }}>
                                    <div>SBI detects mule ✗</div>
                                    <div>HDFC still exposed ✗</div>
                                    <div>ICICI still exposed ✗</div>
                                    <div style={{ marginTop: 8, fontWeight: 'bold' }}>Detection: 48-72h</div>
                                </div>
                            </div>
                            <div style={{ flex: 1, padding: 12, background: 'rgba(0,255,136,0.03)', border: '1px solid rgba(0,255,136,0.1)', borderRadius: 12 }}>
                                <div style={{ fontSize: 9, color: '#00ff88', fontWeight: 800, marginBottom: 8 }}>WITH CYBERFUSION</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 10, color: '#00ff88' }}>
                                    <div>SBI detects mule ✓</div>
                                    <div>HDFC alerted in 0.4s ✓</div>
                                    <div>ICICI alerted in 0.6s ✓</div>
                                    <div style={{ marginTop: 8, fontWeight: 'bold' }}>Detection: &lt; 1s</div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
