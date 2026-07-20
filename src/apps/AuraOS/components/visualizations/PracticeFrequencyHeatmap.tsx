import React, { useEffect, useRef, useState } from 'react';
import { select } from 'd3-selection';
import * as d3 from 'd3';
import { X } from 'lucide-react';
import { ModuleKey } from '../../types';

interface PracticeFrequencyHeatmapProps {
  completionHistory: Record<string, string[]>;
  findModuleKey: (practiceId: string) => ModuleKey;
  onClose: () => void;
}

interface DayData {
  date: string;
  dateObj: Date;
  modules: {
    body: number;
    mind: number;
    spirit: number;
    shadow: number;
  };
  totalCompletions: number;
  practices: string[];
}

const MODULE_COLORS = {
  body: '#d97706',
  mind: '#3b82f6',
  spirit: '#a855f7',
  shadow: '#6b7280',
};

const MODULE_NAMES = {
  body: 'Body',
  mind: 'Mind',
  spirit: 'Spirit',
  shadow: 'Shadow',
};

export default function PracticeFrequencyHeatmap({
  completionHistory,
  findModuleKey,
  onClose,
}: PracticeFrequencyHeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: React.ReactNode;
  }>({ visible: false, x: 0, y: 0, content: null });
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  // Process completion history into daily data for the past 90 days
  const processData = (): DayData[] => {
    const days: DayData[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate 90 days of data
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayData: DayData = {
        date: dateStr,
        dateObj: date,
        modules: { body: 0, mind: 0, spirit: 0, shadow: 0 },
        totalCompletions: 0,
        practices: [],
      };

      // Check each practice to see if it was completed on this date
      Object.entries(completionHistory).forEach(([practiceId, dates]) => {
        if (dates.includes(dateStr)) {
          const module = findModuleKey(practiceId);
          dayData.modules[module]++;
          dayData.totalCompletions++;
          dayData.practices.push(practiceId);
        }
      });

      days.push(dayData);
    }

    return days;
  };

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    const data = processData();
    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 20, bottom: 40, left: 60 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Calculate cell size
    const cellWidth = width / 13; // 13 weeks
    const cellHeight = height / 7; // 7 days
    const cellSize = Math.min(cellWidth, cellHeight) - 2;

    // Find max completions for scaling
    const maxCompletions = Math.max(...data.map((d) => d.totalCompletions), 1);

    // Create opacity scale
    const opacityScale = d3.scaleLinear().domain([0, maxCompletions]).range([0.1, 1]);

    // Group data by week
    const weeks: DayData[][] = [];
    let currentWeek: DayData[] = [];
    
    data.forEach((day, i) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || i === data.length - 1) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });

    // Draw cells
    weeks.forEach((week, weekIndex) => {
      week.forEach((day, dayIndex) => {
        const x = weekIndex * (cellSize + 2);
        const y = dayIndex * (cellSize + 2);

        // Determine dominant module
        let dominantModule: ModuleKey = 'mind';
        let maxCount = 0;
        (Object.keys(day.modules) as ModuleKey[]).forEach((module) => {
          if (day.modules[module] > maxCount) {
            maxCount = day.modules[module];
            dominantModule = module;
          }
        });

        const cell = g
          .append('rect')
          .attr('x', x)
          .attr('y', y)
          .attr('width', cellSize)
          .attr('height', cellSize)
          .attr('rx', 3)
          .attr('fill', day.totalCompletions > 0 ? MODULE_COLORS[dominantModule] : '#1e293b')
          .attr('opacity', day.totalCompletions > 0 ? opacityScale(day.totalCompletions) : 0.3)
          .attr('stroke', '#334155')
          .attr('stroke-width', 1)
          .attr('role', 'button')
          .attr('aria-label', `${day.date}: ${day.totalCompletions} practices completed`)
          .style('cursor', 'pointer')
          .on('mouseenter', function (event) {
            select(this).attr('stroke', '#94a3b8').attr('stroke-width', 2);

            const rect = (event.target as SVGRectElement).getBoundingClientRect();
            setTooltip({
              visible: true,
              x: rect.left + rect.width / 2,
              y: rect.top - 10,
              content: (
                <div className="text-sm">
                  <div className="font-bold text-slate-100">
                    {new Date(day.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="text-slate-300 mt-1">
                    {day.totalCompletions} practice{day.totalCompletions !== 1 ? 's' : ''} completed
                  </div>
                  {day.totalCompletions > 0 && (
                    <div className="mt-2 space-y-1">
                      {(Object.keys(day.modules) as ModuleKey[]).map((module) => {
                        const count = day.modules[module];
                        if (count === 0) return null;
                        return (
                          <div key={module} className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: MODULE_COLORS[module] }}
                            />
                            <span className="text-slate-300">
                              {MODULE_NAMES[module]}: {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ),
            });
          })
          .on('mouseleave', function () {
            select(this).attr('stroke', '#334155').attr('stroke-width', 1);
            setTooltip({ visible: false, x: 0, y: 0, content: null });
          })
          .on('click', function () {
            // Could trigger a drill-down modal here
            console.log('Clicked day:', day.date, day);
          });
      });
    });

    // Add day labels (Sun-Sat)
    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    dayLabels.forEach((label, i) => {
      g.append('text')
        .attr('x', -10)
        .attr('y', i * (cellSize + 2) + cellSize / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#94a3b8')
        .attr('font-size', '12px')
        .text(label);
    });

    // Add month labels at top
    if (data.length === 0) return;
    const firstDayOfWeek = new Date(data[0].dateObj);
    const months: string[] = [];
    weeks.forEach((week, weekIndex) => {
      if (week.length > 0) {
        const firstDay = week[0].dateObj;
        const monthLabel = firstDay.toLocaleDateString('en-US', { month: 'short' });
        if (monthLabel !== months[months.length - 1]) {
          g.append('text')
            .attr('x', weekIndex * (cellSize + 2))
            .attr('y', -10)
            .attr('text-anchor', 'start')
            .attr('fill', '#94a3b8')
            .attr('font-size', '12px')
            .text(monthLabel);
          months.push(monthLabel);
        }
      }
    });

    // Add legend
    const legendX = width - 200;
    const legendY = -30;
    
    g.append('text')
      .attr('x', legendX)
      .attr('y', legendY)
      .attr('fill', '#cbd5e1')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('Module Colors:');

    (Object.keys(MODULE_COLORS) as ModuleKey[]).forEach((module, i) => {
      const x = legendX + i * 50;
      g.append('rect')
        .attr('x', x)
        .attr('y', legendY + 5)
        .attr('width', 12)
        .attr('height', 12)
        .attr('rx', 2)
        .attr('fill', MODULE_COLORS[module]);

      g.append('text')
        .attr('x', x + 16)
        .attr('y', legendY + 16)
        .attr('fill', '#94a3b8')
        .attr('font-size', '10px')
        .text(MODULE_NAMES[module]);
    });

  }, [completionHistory, findModuleKey, dimensions]);

  return (
    <div className="fixed inset-0 bg-stone-950/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl border border-slate-700 max-w-6xl w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Practice Frequency Heatmap</h2>
            <p className="text-slate-400 mt-1">Past 90 days of practice completion patterns</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 transition-colors"
            aria-label="Close heatmap"
          >
            <X size={24} />
          </button>
        </div>

        <div ref={containerRef} className="p-6" style={{ minHeight: '500px' }}>
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="w-full"
            role="img"
            aria-label="Practice completion heatmap showing patterns across Body, Mind, Spirit, and Shadow modules over 90 days"
          />
        </div>

        {tooltip.visible && (
          <div
            className="fixed z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-xl p-3 pointer-events-none"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translate(-50%, -100%)',
            }}
          >
            {tooltip.content}
          </div>
        )}
      </div>
    </div>
  );
}
