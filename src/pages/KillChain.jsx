import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { KILL_CHAIN_DATA as KILL_CHAIN_FALLBACK_DATA } from '../data/killChainData';
import GlassCard from '../components/GlassCard';
import GeminiPanel from '../components/GeminiPanel';
import { getKillChain, startAttackSimulation } from '../api/api';
import { useAlerts } from '../context/AlertContext';

const ICONS = {
    ATTACK_ORIGIN: "💀",
    PHISHING: "🎣",
    COMPROMISED_ACCOUNT: "🔓",
    MULE_ACCOUNT: "💰",
    TRANSACTION: "↔️",
    EXIT_POINT: "🏦",
    LOGIN_ANOMALY: "📍"
};

const COLORS = {
    ATTACK_ORIGIN: "#00FF41",
    PHISHING: "#FFAA00", // Amber for phishing/simulation
    COMPROMISED_ACCOUNT: "#FF3366",
    MULE_ACCOUNT: "#FFAA00",
    TRANSACTION: "#00FF41",
    EXIT_POINT: "#A8EF00",
    LOGIN_ANOMALY: "#00d4ff"
};

export default function KillChain() {
    const d3Container = useRef(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const [triggerAI, setTriggerAI] = useState(0); // Used to re-trigger AI analysis
    const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
    const [graphStats, setGraphStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const { refreshGraphTrigger } = useAlerts();
    const [simRunning, setSimRunning] = useState(false);
    const [simStep, setSimStep] = useState(0); // 0-5
    const [simLog, setSimLog] = useState([]);
    const [elapsed, setElapsed] = useState(0);

    const loadGraph = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getKillChain();
            setGraphData({ nodes: data.nodes, edges: data.edges });
            setGraphStats(data.stats);
        } catch (err) {
            console.warn('Kill chain backend unavailable, using fallback data');
            setGraphData(KILL_CHAIN_FALLBACK_DATA);
            setGraphStats(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadGraph();
        const interval = setInterval(loadGraph, 30000);
        return () => clearInterval(interval);
    }, [loadGraph, refreshGraphTrigger]);

    useEffect(() => {
        if (!d3Container.current || loading) return;

        // Clear previous if any
        d3.select(d3Container.current).selectAll("*").remove();

        const width = d3Container.current.clientWidth;
        const height = d3Container.current.clientHeight;

        const svg = d3.select(d3Container.current)
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${width} ${height}`);

        // Create defs for dropshadow and glowing effects
        const defs = svg.append("defs");
        const filter = defs.append("filter").attr("id", "glow");
        filter.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "coloredBlur");
        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "coloredBlur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");

        // Clone data so d3 mutations don't affect original
        const nodes = graphData.nodes.map(d => Object.create(d));
        const edges = graphData.edges.map(d => Object.create(d));

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(edges).id(d => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-400))
            .force("center", d3.forceCenter(width / 2 - 50, height / 2))
            .force("x", d3.forceX(width / 2).strength(0.05))
            .force("y", d3.forceY(height / 2).strength(0.05));

        // Links
        const link = svg.append("g")
            .selectAll("line")
            .data(edges)
            .join("line")
            .attr("stroke", d => {
                if (d.type === "RECRUITS") return "rgba(205, 255, 205, 0.4)";
                if (d.type === "CONTROLS") return "rgba(255, 255, 255, 0.4)";
                if (d.type === "TRANSFERS" || d.type === "TRANSFERS_TO") return "rgba(136, 255, 136, 0.4)";
                if (d.type === "LAUNDERS_VIA") return "rgba(255, 255, 255, 0.4)";
                return "rgba(255,255,255,0.2)";
            })
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", d => d.type === "RECRUITS" ? "5,5" : "none");

        const linkPaths = svg.append("g")
            .selectAll("path")
            .data(edges)
            .join("path")
            .attr("fill", "none")
            .attr("stroke", d => {
                if (d.type === "RECRUITS") return "rgba(205, 255, 205, 0.8)";
                if (d.type === "CONTROLS") return "rgba(255, 255, 255, 0.8)";
                if (d.type === "TRANSFERS" || d.type === "TRANSFERS_TO") return "#00FF41";
                if (d.type === "LAUNDERS_VIA") return "#ffffff";
                return "rgba(255,255,255,0.5)";
            })
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "10,10")
            .style("opacity", 0);

        // Nodes
        const nodeGroup = svg.append("g")
            .selectAll("g")
            .data(nodes)
            .join("g")
            .attr("class", "node-circle")
            .call(drag(simulation));

        nodeGroup.append("circle")
            .attr("r", 24)
            .attr("fill", "rgba(0,12,0,0.9)")
            .attr("stroke", d => COLORS[d.type])
            .attr("stroke-width", 2)
            .style("filter", "url(#glow)")
            .on("click", (event, d) => {
                setSelectedNode(d);
                setTriggerAI(Date.now());
            });

        nodeGroup.append("text")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("font-size", 20)
            .style("pointer-events", "none")
            .text(d => ICONS[d.type]);

        nodeGroup.append("text")
            .attr("y", 40)
            .attr("text-anchor", "middle")
            .attr("font-family", "'JetBrains Mono', monospace")
            .attr("font-size", 10)
            .attr("fill", "#ffffff")
            .text(d => d.label);

        simulation.on("tick", () => {
            link
                .attr("x1", d => Math.max(24, Math.min(width - 24, d.source.x)))
                .attr("y1", d => Math.max(24, Math.min(height - 24, d.source.y)))
                .attr("x2", d => Math.max(24, Math.min(width - 24, d.target.x)))
                .attr("y2", d => Math.max(24, Math.min(height - 24, d.target.y)));

            linkPaths.attr("d", d => {
                const dx = d.target.x - d.source.x,
                    dy = d.target.y - d.source.y,
                    dr = Math.sqrt(dx * dx + dy * dy);
                return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
            });

            nodeGroup.attr("transform", d => {
                d.x = Math.max(24, Math.min(width - 24, d.x));
                d.y = Math.max(24, Math.min(height - 30, d.y));
                return `translate(${d.x},${d.y})`;
            });
        });

        const animateDelay = 1000;
        linkPaths.transition()
            .delay((d, i) => i * (animateDelay / 4))
            .duration(animateDelay)
            .style("opacity", 1)
            .attrTween("stroke-dashoffset", function () {
                const l = this.getTotalLength();
                const i = d3.interpolateString("" + l, "0");
                return t => i(t);
            })
            .on("end", function () {
                d3.select(this)
                    .style("animation", "dash 30s linear infinite");
            });

        svg.append('style').text(`
      @keyframes dash {
        to { stroke-dashoffset: -1000; }
      }
    `);

        function drag(simulation) {
            function dragstarted(event) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }
            function dragged(event) {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }
            function dragended(event) {
                if (!event.active) simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            }
            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }
    }, [graphData, loading]);

    const handleSim = async () => {
        setSimRunning(true);
        setSimStep(0);
        setSimLog([]);
        setElapsed(0);
        
        try {
            await startAttackSimulation();
            
            const steps = [
                { t: 0,  step: 1, msg: "T+0s  → Phishing event detected" },
                { t: 15, step: 2, msg: "T+15s → Login anomaly from foreign IP" },
                { t: 30, step: 3, msg: "T+30s → Account marked COMPROMISED" },
                { t: 60, step: 4, msg: "T+60s → Suspicious transaction flagged" },
                { t: 90, step: 5, msg: "T+90s → Kill chain graph updated" },
            ];

            let tick = 0;
            const timer = setInterval(() => {
                tick++;
                setElapsed(tick);
                if (tick >= 90) clearInterval(timer);
            }, 1000);

            steps.forEach(({ t, step, msg }) => {
                setTimeout(() => {
                    setSimStep(step);
                    setSimLog(prev => [...prev, msg]);
                    if (step === 5) {
                        setSimRunning(false);
                        loadGraph();
                    }
                }, t * 1000);
            });
        } catch (err) {
            alert("Simulation failed: " + err.message);
            setSimRunning(false);
        }
    };

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 120px)', gap: 24 }}>
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                @keyframes pulse-amber {
                    0%, 100% { box-shadow: 0 0 10px rgba(255, 170, 0, 0.2); }
                    50% { box-shadow: 0 0 25px rgba(255, 170, 0, 0.5); }
                }
                @keyframes pulse-glow {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.2); }
                }
            `}</style>
            
            {/* Graph Area */}
            <GlassCard style={{ flex: 1, padding: 0, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                {/* Header Overlay */}
                <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, background: 'rgba(0,0,0,0.6)', padding: '16px', borderRadius: 12, backdropFilter: 'blur(10px)', border: '1px solid rgba(0, 255, 65, 0.2)', display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, color: '#ffffff' }}>
                            <span style={{ fontSize: 16 }}>🕸️</span> LIVE KILL CHAIN DIAGRAM
                            <div style={{ 
                                width: 6, height: 6, borderRadius: '50%', 
                                background: '#00FF41', 
                                boxShadow: '0 0 8px #00FF41',
                                marginLeft: 4
                            }} title="WebSocket Active" />
                        </h3>
                        <div style={{ fontSize: 11, color: '#7A8E7A', marginTop: 4 }}>Graph updates automatically when connections are discovered</div>
                    </div>

                    <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,0.1)' }} />

                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="hover-lift" onClick={loadGraph} style={{
                            padding: '8px 16px', background: 'rgba(0, 255, 65, 0.05)', color: '#00FF41',
                            border: '1px solid rgba(0, 255, 65, 0.3)', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer',
                            fontSize: 11, letterSpacing: '0.05em'
                        }}>
                            ↻ REFRESH
                        </button>
                        <button 
                            className="hover-lift"
                            onClick={handleSim}
                            disabled={simRunning}
                            style={{
                                padding: '8px 16px',
                                background: 'rgba(255, 170, 0, 0.05)',
                                color: '#FFAA00',
                                border: '1px solid rgba(255, 170, 0, 0.3)',
                                borderRadius: 8,
                                fontSize: 11,
                                fontWeight: 'bold',
                                cursor: simRunning ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                letterSpacing: '0.05em',
                                boxShadow: simRunning ? '0 0 20px rgba(255, 170, 0, 0.3)' : 'none',
                                animation: simRunning ? 'pulse-amber 2s infinite' : 'none'
                            }}
                        >
                            {simRunning ? `SIMULATING... ${90 - elapsed}s` : '⚡ ATTACK SIMULATION'}
                        </button>
                    </div>
                </div>

                {/* Top Stats Overlay */}
                {graphStats && !loading && (
                    <div style={{ position: 'absolute', top: 20, left: '55%', transform: 'translateX(-50%)', zIndex: 5, textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(0, 255, 136, 0.6)', letterSpacing: '0.05em', background: 'rgba(0,0,0,0.3)', padding: '8px 16px', borderRadius: 20 }}>
                        {graphStats.total_nodes} NODES  ·  {graphStats.total_edges} EDGES  ·  {graphStats.mule_accounts} MULES  ·  ₹{parseInt(graphStats.total_exposure).toLocaleString()} EXPOSURE
                    </div>
                )}

                <div ref={d3Container} style={{ width: '100%', flex: 1, opacity: loading ? 0 : 1 }}></div>

                {loading && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, background: 'rgba(0,0,0,0.6)' }}>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", color: '#00ff88', fontSize: 14, letterSpacing: '0.1em', animation: 'pulse 1.5s infinite' }}>
                            COMPUTING KILL CHAIN...
                        </div>
                    </div>
                )}

                {/* Simulation Progress Panel */}
                {(simRunning || simLog.length > 0) && (
                    <div style={{ 
                        position: 'absolute', bottom: 20, left: 20, right: 20, zIndex: 100,
                        background: 'rgba(10, 15, 26, 0.95)', 
                        border: '1px solid rgba(255, 170, 0, 0.3)', 
                        borderRadius: 12, padding: 20,
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.8)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFAA00', animation: 'pulse-glow 1.5s infinite' }} />
                                <span style={{ fontSize: 12, fontWeight: 'bold', color: '#FFAA00', letterSpacing: '0.1em' }}>LIVE ATTACK SIMULATION</span>
                            </div>
                            {simStep === 5 && (
                                <div style={{ fontSize: 11, color: '#00FF41', fontWeight: 'bold' }}>SIMULATION COMPLETE — REFRESHING GRAPH...</div>
                            )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, position: 'relative', padding: '0 40px' }}>
                            <div style={{ position: 'absolute', top: '50%', left: 40, right: 40, height: 2, background: 'rgba(255,255,255,0.1)', zIndex: 0 }} />
                            {[
                                { label: 'Phishing', step: 1 },
                                { label: 'Anomaly', step: 2 },
                                { label: 'Compromised', step: 3 },
                                { label: 'Transaction', step: 4 },
                                { label: 'Graph Update', step: 5 }
                            ].map((s, i) => {
                                const active = simStep >= s.step;
                                const current = simStep === s.step;
                                return (
                                    <div key={i} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                        <div style={{
                                            width: 24, height: 24, borderRadius: '50%',
                                            background: active ? '#00FF41' : current ? '#FFAA00' : '#1e2d47',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            border: `2px solid ${active ? '#00FF41' : current ? '#FFAA00' : '#1e2d47'}`,
                                            boxShadow: current ? '0 0 15px #FFAA00' : 'none',
                                            transition: 'all 0.5s'
                                        }}>
                                            {active ? '✓' : ''}
                                        </div>
                                        <span style={{ fontSize: 10, color: active ? '#ffffff' : '#7A8E7A', fontWeight: active ? 'bold' : 'normal' }}>{s.label}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ 
                            background: 'rgba(0,0,0,0.4)', borderRadius: 8, padding: 12, 
                            fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#00FF41',
                            height: 80, overflowY: 'auto'
                        }}>
                            {simLog.map((log, i) => (
                                <div key={i} style={{ marginBottom: 4 }}>
                                    {`> ${log}`}
                                </div>
                            ))}
                            {simRunning && <div style={{ animation: 'blink 1s infinite', display: 'inline-block' }}>_</div>}
                        </div>
                    </div>
                )}

                {/* Legend Overlay */}
                <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 5, display: 'flex', gap: 12, flexWrap: 'wrap', width: 400 }}>
                    {Object.entries(COLORS).map(([key, col]) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#ffffff' }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: col }}></div>
                            {key.replace('_', ' ')}
                        </div>
                    ))}
                </div>
            </GlassCard>

            {/* Right Panel */}
            <div style={{ width: 340, display: 'flex', flexDirection: 'column', gap: 20 }}>
                {selectedNode ? (
                    <>
                        <GlassCard style={{ padding: 20, borderColor: 'rgba(0, 255, 65, 0.2)', background: 'rgba(0, 255, 65, 0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                <div style={{ fontSize: 24, border: `2px solid ${COLORS[selectedNode.type]}`, width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,12,0,0.8)' }}>
                                    {ICONS[selectedNode.type]}
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, color: COLORS[selectedNode.type], fontWeight: 'bold', letterSpacing: '0.05em' }}>{selectedNode.type.replace('_', ' ')}</div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff' }}>{selectedNode.label}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11 }}>
                                <span style={{ color: '#7A8E7A' }}>Risk Level</span>
                                <span style={{ color: '#00FF41', fontWeight: 'bold' }}>{selectedNode.risk}%</span>
                            </div>
                            <div style={{ width: '100%', height: 4, background: 'rgba(0, 255, 65, 0.1)', borderRadius: 2 }}>
                                <div style={{ width: `${selectedNode.risk}%`, height: '100%', background: '#00FF41', borderRadius: 2, boxShadow: '0 0 8px #00FF41' }}></div>
                            </div>
                        </GlassCard>

                        <GeminiPanel
                            prompt={`Explain the role of this node in the attack chain: Type=${selectedNode.type}, Label=${selectedNode.label}.`}
                            trigger={triggerAI}
                            dataContext={selectedNode}
                        />

                        <GlassCard style={{ padding: 20, background: 'rgba(0, 255, 65, 0.02)', borderColor: 'rgba(0, 255, 65, 0.2)' }}>
                            <div style={{ fontSize: 11, color: '#00FF41', fontWeight: 'bold', marginBottom: 12, letterSpacing: '0.05em' }}>RECOMMENDED ACTION</div>
                            <button className="hover-lift" style={{
                                width: '100%', padding: '12px', background: 'rgba(0, 255, 65, 0.05)', color: '#00FF41',
                                border: '1px solid rgba(0, 255, 65, 0.3)', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer',
                                fontFamily: "Space Grotesk, sans-serif", fontSize: 14, boxShadow: '0 4px 12px rgba(0, 255, 65, 0.1)', letterSpacing: '0.05em'
                            }}>
                                {selectedNode.type.includes('ACCOUNT') ? 'FREEZE ACCOUNT' :
                                    selectedNode.type === 'TRANSACTION' ? 'REVERSE TRANSACTION' : 'FLAG ACTIVITY'}
                            </button>
                        </GlassCard>
                    </>
                ) : (
                    <GlassCard style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 32 }}>
                        <div style={{ color: '#7A8E7A' }}>
                            <div style={{ fontSize: 32, marginBottom: 16 }}>👆</div>
                            <div style={{ fontSize: 14, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 }}>Select a Node</div>
                            <div style={{ fontSize: 12 }}>Click any node on the kill chain graph to view intelligence and take action.</div>
                        </div>
                    </GlassCard>
                )}
            </div>
        </div>
    );
}
