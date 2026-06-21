import React, { useState, useEffect, useMemo } from 'react';

// ✦ Math Helpers
function circlePoints(n, cx, cy, r, startAngle = -Math.PI / 2) {
  return Array.from({ length: n }, (_, i) => {
    const a = startAngle + (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });
}

function lerp(a, b, t) { return a + (b - a) * t; }
function lerpPt(p1, p2, t) { return [lerp(p1[0], p2[0], t), lerp(p1[1], p2[1], t)]; }

const NODE_COUNT = 16;

// ✦ Topology Data
const meshNodes = [[18,22],[42,14],[68,18],[88,30],[10,48],[34,40],[58,46],[82,52],[16,72],[40,66],[64,74],[86,70],[28,90],[52,86],[74,92],[94,86]];
const meshEdges = [[0,1],[1,2],[2,3],[0,4],[1,5],[2,6],[3,7],[4,5],[5,6],[6,7],[4,8],[5,9],[6,10],[7,11],[8,9],[9,10],[10,11],[8,12],[9,13],[10,14],[11,15],[12,13],[13,14],[14,15],[0,5],[2,5],[5,10],[7,10],[1,6],[3,6],[9,12],[11,14]];
const treeNodes = [[50,8],[22,28],[50,28],[78,28],[10,52],[34,52],[50,52],[66,52],[90,52],[6,78],[18,78],[30,78],[42,78],[58,78],[70,78],[82,78]];
const treeEdges = [[0,1],[0,2],[0,3],[1,4],[1,5],[2,6],[2,7],[3,8],[4,9],[4,10],[5,11],[5,12],[6,13],[7,14],[8,15],[14,15]];
const clusterNodes = [[14,18],[28,14],[22,30],[10,34],[70,16],[86,22],[78,34],[92,36],[38,70],[54,64],[50,82],[66,76],[44,38],[62,40],[30,54],[76,56]];
const clusterEdges = [[0,1],[1,2],[2,3],[3,0],[0,2],[4,5],[5,6],[6,7],[7,4],[4,6],[8,9],[9,10],[10,11],[11,8],[9,11],[2,12],[12,6],[12,13],[13,11]];
const ringOuter = circlePoints(11, 50, 50, 38);
const ringInner = circlePoints(5, 50, 50, 14, -Math.PI / 2 + 0.3);
const ringNodes = [...ringOuter, ...ringInner];
const ringEdges = [...Array.from({length:11},(_,i)=>[i,(i+1)%11]),...Array.from({length:5},(_,i)=>[11+i,11+((i+1)%5)]),[11,0],[12,2],[13,5],[14,7],[15,9]];
const gridNodes = [];
for (let r=0;r<4;r++) for (let c=0;c<4;c++) gridNodes.push([15+c*23.33,15+r*23.33]);
const gridEdges = [];
for (let r=0;r<4;r++) for (let c=0;c<4;c++) { const i=r*4+c; if(c<3) gridEdges.push([i,i+1]); if(r<3) gridEdges.push([i,i+4]); }

// Exported so App.jsx can still access the labels
export const TOPOLOGIES = [
  { name:'mesh',    nodes:meshNodes,    edges:meshEdges,    label:'topology.mesh' },
  { name:'tree',    nodes:treeNodes,    edges:treeEdges,    label:'topology.tree' },
  { name:'cluster', nodes:clusterNodes, edges:clusterEdges, label:'topology.cluster' },
  { name:'ring',    nodes:ringNodes,    edges:ringEdges,    label:'topology.ring' },
  { name:'grid',    nodes:gridNodes,    edges:gridEdges,    label:'topology.grid' },
];

export default function NetworkVisual({ progress, accent }) {
  const count = TOPOLOGIES.length;
  const scaled = progress * (count - 1);
  const idx = Math.min(Math.floor(scaled), count - 2);
  const t = scaled - idx;
  const from = TOPOLOGIES[idx], to = TOPOLOGIES[idx + 1];
  
  const [hoveredNode, setHoveredNode] = useState(null);
  const [clickedNode, setClickedNode] = useState(null);
  
  const nodes = useMemo(() => Array.from({ length: NODE_COUNT }, (_, i) => lerpPt(from.nodes[i] ?? [50, 50], to.nodes[i] ?? [50, 50], t)), [from, to, t]);
  
  useEffect(() => {
    if (clickedNode !== null) {
      const timer = setTimeout(() => setClickedNode(null), 1200);
      return () => clearTimeout(timer);
    }
  }, [clickedNode]);
  
  const renderEdges = (topo, opacity, key) => {
    if (opacity <= 0.01) return null;
    return topo.edges.map(([a, b], i) => {
      if (!nodes[a] || !nodes[b]) return null;
      const [x1, y1] = nodes[a], [x2, y2] = nodes[b];
      const isConn = clickedNode !== null && (a === clickedNode || b === clickedNode);
      return <line key={`${key}-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={accent} strokeWidth={isConn ? '0.5' : '0.22'} opacity={isConn ? opacity * 0.9 : opacity * 0.3} style={{ transition: 'opacity 0.3s,stroke-width 0.3s' }} />;
    });
  };
  
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <radialGradient id="ng" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.7" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ng-active" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="1" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      {renderEdges(from, 1 - t, 'f')}{renderEdges(to, t, 't')}
      {nodes.map(([x, y], i) => {
        const isH = hoveredNode === i;
        const isC = clickedNode === i;
        return (
          <g key={i} style={{ cursor: 'pointer' }} onMouseEnter={() => setHoveredNode(i)} onMouseLeave={() => setHoveredNode(null)} onClick={() => setClickedNode(i)}>
            <circle cx={x} cy={y} r={isH || isC ? 6 : 3.2} fill={isC ? "url(#ng-active)" : "url(#ng)"} opacity={isC ? 0.8 : 0.45} style={{ transition: 'r 0.25s,opacity 0.25s' }} />
            <circle cx={x} cy={y} r={isH ? 1.6 : 0.85} fill={i % 3 === 0 ? accent : '#EEF0F8'} opacity={i % 3 === 0 ? 1 : 0.7} style={{ transition: 'r 0.2s' }}>
              {!isH && (<animate attributeName="r" values="0.85;1.25;0.85" dur={`${3 + (i % 3)}s`} repeatCount="indefinite" begin={`${i * 0.1}s`} />)}
            </circle>
            {isC && (<circle cx={x} cy={y} r="2" fill="none" stroke={accent} strokeWidth="0.4">
              <animate attributeName="r" values="2;10" dur="1.2s" fill="freeze" />
              <animate attributeName="opacity" values="0.8;0" dur="1.2s" fill="freeze" />
            </circle>)}
          </g>
        );
      })}
    </svg>
  );
}