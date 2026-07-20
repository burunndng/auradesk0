import React, { useCallback, useRef } from 'react';

/**
 * Rotary knob primitive driven by vertical pointer drag.
 *
 * - Drag up = increase, drag down = decrease.
 * - Hold Shift for fine control (0.25x sensitivity).
 * - Double-click resets to `defaultValue` (if provided) else the range midpoint.
 * - Keyboard: Arrows = step, PageUp/Down = 10% of range, Home/End = min/max.
 *
 * Styled to match the BLISS dark/zinc aesthetic; the value arc and indicator
 * use `color` so the knob can inherit the owning track's accent color.
 */
export interface KnobProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  label?: string;
  color?: string;
  size?: number;
  defaultValue?: number;
  format?: (value: number) => string;
  disabled?: boolean;
  title?: string;
}

const START_ANGLE = -135; // lower-left
const END_ANGLE = 135;    // lower-right
const SWEEP = END_ANGLE - START_ANGLE; // 270 deg
const DRAG_SENSITIVITY = 160; // pixels to traverse the full range

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export const Knob: React.FC<KnobProps> = ({
  value,
  min,
  max,
  step = 0,
  onChange,
  label,
  color = '#f59e0b',
  size = 36,
  defaultValue,
  format,
  disabled = false,
  title,
}) => {
  const dragState = useRef<{ startY: number; startValue: number; pointerId: number } | null>(null);
  const knobRef = useRef<HTMLDivElement | null>(null);

  const range = max - min;
  const big = range / 10;
  const rawNorm = range > 0 ? (value - min) / range : 0;
  const norm = clamp(rawNorm, 0, 1);
  const valueAngle = START_ANGLE + norm * SWEEP;

  const quantize = useCallback(
    (v: number) => {
      if (!step || step <= 0) return v;
      const snapped = Math.round(v / step) * step;
      // Guard against float drift (e.g. 0.30000000004)
      return parseFloat(snapped.toFixed(6));
    },
    [step]
  );

  const commit = useCallback(
    (v: number) => {
      onChange(clamp(quantize(v), min, max));
    },
    [onChange, quantize, min, max]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      e.preventDefault();
      (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
      dragState.current = { startY: e.clientY, startValue: value, pointerId: e.pointerId };
    },
    [disabled, value]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const st = dragState.current;
      if (!st || st.pointerId !== e.pointerId) return;
      const fine = e.shiftKey ? 0.25 : 1;
      const deltaY = st.startY - e.clientY; // up = positive
      const delta = (deltaY / DRAG_SENSITIVITY) * range * fine;
      commit(st.startValue + delta);
    },
    [commit, range]
  );

  const endDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const st = dragState.current;
      if (!st || st.pointerId !== e.pointerId) return;
      try {
        (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      dragState.current = null;
    },
    []
  );

  const handleDoubleClick = useCallback(() => {
    if (disabled) return;
    const reset = defaultValue !== undefined ? defaultValue : min + range / 2;
    commit(reset);
  }, [commit, defaultValue, disabled, min, range]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      let handled = true;
      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowRight':
          commit(value + (step || big * 0.1));
          break;
        case 'ArrowDown':
        case 'ArrowLeft':
          commit(value - (step || big * 0.1));
          break;
        case 'PageUp':
          commit(value + big);
          break;
        case 'PageDown':
          commit(value - big);
          break;
        case 'Home':
          commit(min);
          break;
        case 'End':
          commit(max);
          break;
        default:
          handled = false;
      }
      if (handled) e.preventDefault();
    },
    [commit, disabled, value, step, big, min, max]
  );

  const cx = size / 2;
  const cy = size / 2;
  const strokeWidth = Math.max(2, size * 0.09);
  const r = size / 2 - strokeWidth - 1;
  const trackPath = describeArc(cx, cy, r, START_ANGLE, END_ANGLE);
  const valuePath = describeArc(cx, cy, r, START_ANGLE, valueAngle);
  const indicator = polarToCartesian(cx, cy, r - strokeWidth * 0.4, valueAngle);
  const readout = format ? format(value) : String(value);
  const ariaValuenow = parseFloat(value.toFixed(4));

  return (
    <div className="flex flex-col items-center gap-1 select-none" title={title ?? label}>
      <div
        ref={knobRef}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={ariaValuenow}
        aria-label={label}
        aria-disabled={disabled}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        className={`relative rounded-full ${
          disabled ? 'cursor-not-allowed opacity-40' : 'cursor-ns-resize'
        } focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40 touch-none`}
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
          {/* Track */}
          <path d={trackPath} fill="none" stroke="#27272a" strokeWidth={strokeWidth} strokeLinecap="round" />
          {/* Value arc */}
          {norm > 0.0001 && (
            <path
              d={valuePath}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 2px ${color}80)` }}
            />
          )}
          {/* Knob body */}
          <circle cx={cx} cy={cy} r={r - strokeWidth * 0.55} fill="#18181b" stroke="#3f3f46" strokeWidth={1} />
          {/* Indicator dot */}
          <circle cx={indicator.x} cy={indicator.y} r={strokeWidth * 0.5} fill={disabled ? '#52525b' : '#fafafa'} />
        </svg>
      </div>
      {label && (
        <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 leading-none">
          {label}
        </span>
      )}
      <span className="text-[9px] font-mono text-zinc-400 leading-none tabular-nums">{readout}</span>
    </div>
  );
};

export default Knob;
