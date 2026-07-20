import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { SEPHIROT, PATHS } from '../../constants/treeOfLifePrompts';
import type { Sephira, Path } from '../../constants/treeOfLifePrompts';

interface TreeOfLifeVisualizationProps {
  onSelectSephira: (sephiraId: string) => void;
  onSkip?: () => void;
}

interface PositionedSephira extends Sephira {
  x: number;
  y: number;
}

/**
 * Tree of Life Visualization
 * Interactive D3.js visualization of the Kabbalistic Tree of Life
 * Features sacred geometry aesthetic with glowing nodes and flowing paths
 */
export default function TreeOfLifeVisualization({ onSelectSephira, onSkip }: TreeOfLifeVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 900 });
  const [selectedSephira, setSelectedSephira] = useState<string | null>(null);
  const [hoveredSephira, setHoveredSephira] = useState<string | null>(null);

  // Calculate positions based on traditional Tree of Life layout
  const getPosition = (sephira: Sephira): { x: number; y: number } => {
    const centerX = dimensions.width / 2;
    const pillarOffset = dimensions.width * 0.15; // 15% of width for pillar spacing

    // Vertical positions (scaled to fit viewport)
    const scale = dimensions.height / 900;
    const positions: Record<string, { x: number; y: number }> = {
      kether: { x: centerX, y: 100 * scale },
      chokmah: { x: centerX + pillarOffset, y: 200 * scale },
      binah: { x: centerX - pillarOffset, y: 200 * scale },
      daat: { x: centerX, y: 250 * scale },
      chesed: { x: centerX - pillarOffset, y: 350 * scale },
      gevurah: { x: centerX + pillarOffset, y: 350 * scale },
      tiferet: { x: centerX, y: 400 * scale },
      netzach: { x: centerX - pillarOffset, y: 550 * scale },
      hod: { x: centerX + pillarOffset, y: 550 * scale },
      yesod: { x: centerX, y: 650 * scale },
      malkuth: { x: centerX, y: 750 * scale },
    };

    return positions[sephira.id] || { x: centerX, y: 0 };
  };

  // Position all sephiroth
  const positionedSephirot: PositionedSephira[] = SEPHIROT.map(sephira => ({
    ...sephira,
    ...getPosition(sephira),
  }));

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);

  // Responsive resize handling
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      setIsMobile(width < 640);
      setDimensions({
        width: Math.max(320, Math.min(width, 1200)),
        height: Math.max(600, Math.min(height, 1000))
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // D3 rendering
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create main group for zoom/pan
    const g = svg.append('g');

    // Add subtle radial gradient background
    const defs = svg.append('defs');

    const radialGradient = defs.append('radialGradient')
      .attr('id', 'bg-gradient')
      .attr('cx', '50%')
      .attr('cy', '30%');

    radialGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#1a1a2e')
      .attr('stop-opacity', 1);

    radialGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#0a0a0f')
      .attr('stop-opacity', 1);

    svg.insert('rect', ':first-child')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'url(#bg-gradient)');

    // Add glow filter for nodes (dual-layer for enhanced effect)
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    filter.append('feGaussianBlur')
      .attr('stdDeviation', '5.5')
      .attr('result', 'coloredBlur');

    filter.append('feGaussianBlur')
      .attr('stdDeviation', '2')
      .attr('in', 'coloredBlur')
      .attr('result', 'coloredBlur2');

    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur2');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Strong glow filter for selected/hovered nodes
    const strongFilter = defs.append('filter')
      .attr('id', 'strong-glow')
      .attr('x', '-150%')
      .attr('y', '-150%')
      .attr('width', '400%')
      .attr('height', '400%');

    strongFilter.append('feGaussianBlur')
      .attr('stdDeviation', '12')
      .attr('result', 'coloredBlur');

    const strongMerge = strongFilter.append('feMerge');
    strongMerge.append('feMergeNode').attr('in', 'coloredBlur');
    strongMerge.append('feMergeNode').attr('in', 'coloredBlur');
    strongMerge.append('feMergeNode').attr('in', 'coloredBlur');
    strongMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Draw paths (connections between sephiroth)
    const pathGroup = g.append('g').attr('class', 'paths');

    PATHS.forEach(path => {
      const source = positionedSephirot.find(s => s.id === path.from);
      const target = positionedSephirot.find(s => s.id === path.to);

      if (source && target) {
        pathGroup.append('line')
          .attr('x1', source.x)
          .attr('y1', source.y)
          .attr('x2', target.x)
          .attr('y2', target.y)
          .attr('stroke', '#d4a574')
          .attr('stroke-width', 2)
          .attr('stroke-opacity', 0.2)
          .attr('class', `path path-${path.from}-${path.to}`)
          .style('filter', 'url(#glow)');
      }
    });

    // Draw nodes (sephiroth)
    const nodeGroup = g.append('g').attr('class', 'nodes');

    const nodes = nodeGroup.selectAll('.node')
      .data(positionedSephirot)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .style('cursor', 'pointer');

    // Node circles (responsive to mobile)
    const baseRadius = isMobile ? 32 : 40;
    nodes.append('circle')
      .attr('r', baseRadius)
      .attr('fill', d => d.color)
      .attr('fill-opacity', 0.2)
      .attr('stroke', d => d.color)
      .attr('stroke-width', 2)
      .style('filter', 'url(#glow)')
      .attr('class', 'node-circle');

    // Node labels (name)
    nodes.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.2em')
      .attr('fill', d => d.color)
      .attr('font-size', '15px')
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '0.5px')
      .attr('class', 'node-name')
      .style('pointer-events', 'none')
      .text(d => d.name);

    // Hebrew text
    nodes.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.5em')
      .attr('fill', d => d.color)
      .attr('fill-opacity', 0.5)
      .attr('font-size', '11px')
      .attr('class', 'node-hebrew')
      .style('pointer-events', 'none')
      .text(d => d.hebrew);

    // Tooltip
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tree-of-life-tooltip')
      .style('position', 'absolute')
      .style('opacity', 0)
      .style('background', 'rgba(15, 15, 20, 0.95)')
      .style('border', '1px solid #d4a574')
      .style('border-radius', '8px')
      .style('padding', '12px 16px')
      .style('color', '#e8d5b5')
      .style('font-size', '14px')
      .style('pointer-events', 'none')
      .style('max-width', '300px')
      .style('box-shadow', '0 4px 12px rgba(0,0,0,0.5)')
      .style('z-index', '10000');

    // Interaction handlers
    nodes
      .on('mouseenter', function(event, d) {
        setHoveredSephira(d.id);

        // Enlarge node with enhanced hover state
        const hoverRadius = isMobile ? 38 : 48;
        d3.select(this).select('.node-circle')
          .transition()
          .duration(200)
          .attr('r', hoverRadius)
          .attr('stroke-width', 3)
          .attr('fill-opacity', 0.35)
          .style('filter', 'url(#strong-glow)');

        d3.select(this).select('.node-name')
          .transition()
          .duration(200)
          .attr('font-size', '17px')
          .attr('font-weight', '800')
          .attr('letter-spacing', '0.75px');

        // Brighten connected paths
        PATHS.forEach(path => {
          if (path.from === d.id || path.to === d.id) {
            d3.select(`.path-${path.from}-${path.to}`)
              .transition()
              .duration(200)
              .attr('stroke-opacity', 0.7)
              .attr('stroke-width', 4);
          }
        });

        // Show tooltip with enhanced styling
        tooltip.transition()
          .duration(200)
          .style('opacity', 1);

        tooltip.html(`
          <div style="font-family: serif; font-size: 16px; font-weight: bold; color: ${d.color}; margin-bottom: 8px; text-shadow: 0 0 10px ${d.color}40;">
            ${d.name}
          </div>
          <div style="font-weight: 600; color: #d4a574; margin-bottom: 6px;">
            ${d.archetype}
          </div>
          <div style="line-height: 1.5; color: #c4b5a5;">
            ${d.description}
          </div>
        `)
          .style('left', (event.pageX + 15) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mousemove', function(event) {
        tooltip
          .style('left', (event.pageX + 15) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseleave', function(event, d) {
        setHoveredSephira(null);

        // Reset node size to base (responsive)
        const baseRadius = isMobile ? 32 : 40;
        d3.select(this).select('.node-circle')
          .transition()
          .duration(200)
          .attr('r', baseRadius)
          .attr('stroke-width', 2)
          .attr('fill-opacity', 0.2)
          .style('filter', 'url(#glow)');

        d3.select(this).select('.node-name')
          .transition()
          .duration(200)
          .attr('font-size', '15px')
          .attr('font-weight', 'bold')
          .attr('letter-spacing', '0.5px');

        // Reset paths
        PATHS.forEach(path => {
          if (path.from === d.id || path.to === d.id) {
            d3.select(`.path-${path.from}-${path.to}`)
              .transition()
              .duration(200)
              .attr('stroke-opacity', 0.2)
              .attr('stroke-width', 2);
          }
        });

        // Hide tooltip
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      })
      .on('click', function(event, d) {
        event.stopPropagation();
        setSelectedSephira(d.id);

        // Pulse animation
        d3.select(this).select('.node-circle')
          .transition()
          .duration(300)
          .attr('r', 50)
          .attr('stroke-width', 4)
          .transition()
          .duration(300)
          .attr('r', 45)
          .attr('stroke-width', 3)
          .on('end', function() {
            // Call the parent callback after animation
            onSelectSephira(d.id);
          });
      });

    // Keyboard navigation
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        event.preventDefault();
        const currentIndex = positionedSephirot.findIndex(s => s.id === (hoveredSephira || selectedSephira));
        const nextIndex = (currentIndex + 1) % positionedSephirot.length;
        setHoveredSephira(positionedSephirot[nextIndex].id);
      } else if (event.key === 'Enter' && hoveredSephira) {
        onSelectSephira(hoveredSephira);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      tooltip.remove();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dimensions, selectedSephira, hoveredSephira, onSelectSephira]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[600px] overflow-hidden bg-stone-950"
      style={{ height: '100dvh' }}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 sm:p-6 text-center">
        <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-amber-100 mb-2">
          The Tree of Life
        </h1>
        <p className="text-sm sm:text-base text-amber-200/80 max-w-2xl mx-auto">
          Explore the Kabbalistic Tree of Life. Hover over each Sephira to learn about its archetype, then click to begin your journey.
        </p>
      </div>

      {/* SVG Visualization */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        role="img"
        aria-label="Interactive Tree of Life visualization showing the 11 Sephiroth and their connections"
      />

      {/* Skip Button */}
      {onSkip && (
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 sm:p-8 text-center">
          <button
            onClick={onSkip}
            className="px-8 py-4 bg-gradient-to-r from-amber-600/40 to-amber-500/40 hover:from-amber-600/60 hover:to-amber-500/60 text-amber-100 rounded-lg transition-all duration-300 border border-amber-700/50 hover:border-amber-500/70 text-sm sm:text-lg font-bold shadow-lg hover:shadow-xl hover:shadow-amber-500/20"
            aria-label="Skip visualization and go directly to open conversation"
          >
            Skip to Open Conversation
          </button>
        </div>
      )}

      {/* Accessibility instruction */}
      <div className="sr-only" role="status" aria-live="polite">
        {hoveredSephira && `Now viewing ${positionedSephirot.find(s => s.id === hoveredSephira)?.name}. Press Tab to navigate to next Sephira, Enter to select.`}
      </div>
    </div>
  );
}
