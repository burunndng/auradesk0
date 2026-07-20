/**
 * ForumConstellation — D3 constellation banner for the Community Forum.
 * Larger canvas, travelling pulse packets along edges, orbital rings on hubs,
 * shimmer particles, and a slow nebula-glow backdrop.
 */
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

// ── Layout ──────────────────────────────────────────────────────────────────
const W = 720;
const H = 160;

type NodeDef = { x: number; y: number; r: number; hub: boolean; color?: string };

const NODES: NodeDef[] = [
  // left cluster
  { x: 38,  y: 40,  r: 2.2, hub: false },
  { x: 75,  y: 22,  r: 2.6, hub: false },
  { x: 110, y: 55,  r: 2.2, hub: false },
  { x: 60,  y: 70,  r: 1.8, hub: false },
  { x: 148, y: 30,  r: 5.5, hub: true,  color: '#5eead4' },   // hub A

  // mid-left
  { x: 195, y: 70,  r: 2.2, hub: false },
  { x: 220, y: 20,  r: 2.6, hub: false },
  { x: 255, y: 50,  r: 1.8, hub: false },
  { x: 240, y: 95,  r: 2.2, hub: false },
  { x: 285, y: 130, r: 1.8, hub: false },

  // centre hub
  { x: 310, y: 80,  r: 6.5, hub: true,  color: '#a78bfa' },   // hub B (purple)

  // mid-right
  { x: 355, y: 30,  r: 2.6, hub: false },
  { x: 380, y: 110, r: 2.2, hub: false },
  { x: 415, y: 55,  r: 1.8, hub: false },
  { x: 440, y: 130, r: 2.2, hub: false },
  { x: 455, y: 25,  r: 2.2, hub: false },

  // right hub
  { x: 490, y: 75,  r: 5.0, hub: true,  color: '#34d399' },   // hub C (emerald)

  // right cluster
  { x: 530, y: 30,  r: 2.6, hub: false },
  { x: 545, y: 110, r: 1.8, hub: false },
  { x: 580, y: 55,  r: 2.2, hub: false },
  { x: 610, y: 20,  r: 1.8, hub: false },
  { x: 620, y: 90,  r: 2.2, hub: false },
  { x: 660, y: 50,  r: 2.6, hub: false },
  { x: 695, y: 130, r: 1.8, hub: false },
  { x: 700, y: 30,  r: 2.0, hub: false },
];

const LINKS: [number, number][] = [
  // left cluster
  [0,1],[0,3],[1,2],[2,4],[3,4],[1,4],
  // left → centre
  [4,5],[4,6],[5,7],[6,7],[7,8],[8,9],[9,10],[5,10],
  // centre hub spokes
  [10,11],[10,12],[10,13],[10,15],
  // mid-right
  [11,13],[13,15],[12,14],[14,16],[13,16],
  // right hub spokes
  [16,17],[16,18],[16,19],
  // right cluster
  [17,19],[17,20],[19,21],[20,22],[21,22],[22,23],[22,24],[23,24],
];

// ── Component ────────────────────────────────────────────────────────────────
export default function ForumConstellation() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const uid = Math.random().toString(36).slice(2, 8);
    const defs = svg.append('defs');

    // ── Filters ──────────────────────────────────────────────────────────────
    const makeGlow = (id: string, std: number) => {
      const f = defs.append('filter')
        .attr('id', id)
        .attr('x', '-80%').attr('y', '-80%')
        .attr('width', '260%').attr('height', '260%');
      f.append('feGaussianBlur').attr('stdDeviation', std).attr('result', 'blur');
      const m = f.append('feMerge');
      m.append('feMergeNode').attr('in', 'blur');
      m.append('feMergeNode').attr('in', 'SourceGraphic');
      return id;
    };
    const glowLg  = makeGlow(`gl-${uid}`, 5);
    const glowSm  = makeGlow(`gs-${uid}`, 2);
    const glowNeb = makeGlow(`gn-${uid}`, 22);

    // ── Nebula backdrop blobs ─────────────────────────────────────────────────
    const nebula = svg.append('g').attr('filter', `url(#${glowNeb})`);
    const nebSpots = [
      { cx: 148, cy: 80, r: 55, color: '#2dd4bf', op: 0.06 },
      { cx: 310, cy: 80, r: 70, color: '#7c3aed', op: 0.07 },
      { cx: 490, cy: 80, r: 55, color: '#059669', op: 0.06 },
    ];
    nebSpots.forEach(s => {
      nebula.append('ellipse')
        .attr('cx', s.cx).attr('cy', s.cy)
        .attr('rx', s.r).attr('ry', s.r * 0.55)
        .attr('fill', s.color).attr('opacity', s.op);
    });

    // ── Edges ─────────────────────────────────────────────────────────────────
    const edgeGroup = svg.append('g');
    const edges = edgeGroup.selectAll<SVGLineElement, [number,number]>('line')
      .data(LINKS)
      .join('line')
      .attr('x1', d => NODES[d[0]].x)
      .attr('y1', d => NODES[d[0]].y)
      .attr('x2', d => NODES[d[1]].x)
      .attr('y2', d => NODES[d[1]].y)
      .attr('stroke', '#5eead4')
      .attr('stroke-width', 0.65)
      .attr('stroke-opacity', 0.12);

    // gentle edge flicker
    edges.each(function(_, i) {
      const delay = (i * 190) % 5000;
      const dur   = 4000 + (i * 430) % 2500;
      const el    = d3.select(this);
      function flicker() {
        el.transition().delay(delay).duration(dur / 2)
          .attr('stroke-opacity', 0.32)
          .transition().duration(dur / 2)
          .attr('stroke-opacity', 0.08)
          .on('end', flicker);
      }
      flicker();
    });

    // ── Travelling pulse packets along edges ──────────────────────────────────
    const pulseGroup = svg.append('g').attr('filter', `url(#${glowSm})`);

    function spawnPulse() {
      const link = LINKS[Math.floor(Math.random() * LINKS.length)];
      const a = NODES[link[0]];
      const b = NODES[link[1]];
      const reversed = Math.random() > 0.5;
      const src  = reversed ? b : a;
      const dst  = reversed ? a : b;
      const colors = ['#5eead4','#a78bfa','#34d399','#f472b6','#fbbf24'];
      const col = colors[Math.floor(Math.random() * colors.length)];
      const dur = 900 + Math.random() * 1200;

      const dot = pulseGroup.append('circle')
        .attr('cx', src.x).attr('cy', src.y)
        .attr('r', 2.4)
        .attr('fill', col)
        .attr('opacity', 0);

      dot.transition().duration(80).attr('opacity', 0.95)
        .transition().duration(dur).ease(d3.easeLinear)
          .attr('cx', dst.x).attr('cy', dst.y)
        .transition().duration(200).attr('opacity', 0)
        .on('end', () => dot.remove());
    }

    // seed initial pulses
    for (let i = 0; i < 6; i++) {
      setTimeout(spawnPulse, i * 340);
    }
    const pulseInterval = setInterval(spawnPulse, 420);

    // ── Secondary nodes ───────────────────────────────────────────────────────
    const secGroup = svg.append('g').attr('filter', `url(#${glowSm})`);
    const secNodes = NODES.filter(n => !n.hub);
    secGroup.selectAll('circle').data(secNodes).join('circle')
      .attr('cx', d => d.x).attr('cy', d => d.y)
      .attr('r',  d => d.r)
      .attr('fill', d => d.r > 2.2 ? '#2dd4bf' : '#94a3b8')
      .attr('opacity', 0.72)
      .each(function(_, i) {
        const delay   = (i * 250) % 4000;
        const dur     = 2600 + (i * 330) % 2000;
        const el      = d3.select(this);
        const baseR   = secNodes[i].r;
        function breathe() {
          el.transition().delay(delay).duration(dur / 2).ease(d3.easeSinInOut)
            .attr('r', baseR + 1.4).attr('opacity', 1)
            .transition().duration(dur / 2).ease(d3.easeSinInOut)
            .attr('r', baseR).attr('opacity', 0.6)
            .on('end', breathe);
        }
        breathe();
      });

    // ── Hub nodes ─────────────────────────────────────────────────────────────
    const hubNodes = NODES.filter(n => n.hub);
    const hubGroup = svg.append('g');

    hubNodes.forEach((hub, i) => {
      const col  = hub.color ?? '#5eead4';
      const dur  = 3000 + i * 700;

      // outer orbital ring
      hubGroup.append('circle')
        .attr('cx', hub.x).attr('cy', hub.y)
        .attr('r', hub.r + 9)
        .attr('fill', 'none')
        .attr('stroke', col)
        .attr('stroke-width', 0.6)
        .attr('stroke-opacity', 0.22)
        .attr('stroke-dasharray', '3 5');

      // second ring (slightly larger, counter-phase)
      hubGroup.append('circle')
        .attr('cx', hub.x).attr('cy', hub.y)
        .attr('r', hub.r + 17)
        .attr('fill', 'none')
        .attr('stroke', col)
        .attr('stroke-width', 0.4)
        .attr('stroke-opacity', 0.12)
        .attr('stroke-dasharray', '2 8');

      // core circle with glow + breathe
      const core = hubGroup.append('circle')
        .attr('cx', hub.x).attr('cy', hub.y)
        .attr('r', hub.r)
        .attr('fill', col)
        .attr('opacity', 0.92)
        .attr('filter', `url(#${glowLg})`);

      (function breatheHub() {
        core.transition().duration(dur / 2).ease(d3.easeSinInOut)
          .attr('r', hub.r + 2).attr('opacity', 1)
          .transition().duration(dur / 2).ease(d3.easeSinInOut)
          .attr('r', hub.r).attr('opacity', 0.82)
          .on('end', breatheHub);
      })();

      // ring rotation via dashoffset animation
      hubGroup.selectAll(`circle.ring-${i}`); // (rings are static — dasharray gives the feel)
    });

    // ── Floating micro-sparkles ───────────────────────────────────────────────
    const sparkGroup = svg.append('g');
    const SPARK_COUNT = 18;
    for (let i = 0; i < SPARK_COUNT; i++) {
      const sx = Math.random() * W;
      const sy = Math.random() * H;
      const sp = sparkGroup.append('circle')
        .attr('cx', sx).attr('cy', sy)
        .attr('r', 0.9)
        .attr('fill', '#e2e8f0')
        .attr('opacity', 0);

      (function twinkle(el: d3.Selection<SVGCircleElement,unknown,null,undefined>) {
        const delay = Math.random() * 6000;
        const dur   = 1200 + Math.random() * 2000;
        function go() {
          el.transition().delay(delay).duration(dur / 2)
            .attr('opacity', 0.55)
            .transition().duration(dur / 2)
            .attr('opacity', 0)
            .on('end', go);
        }
        go();
      })(sp);
    }

    return () => {
      clearInterval(pulseInterval);
      svg.selectAll('*').remove();
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className="w-full max-w-full"
      style={{ display: 'block' }}
      aria-hidden="true"
    />
  );
}
