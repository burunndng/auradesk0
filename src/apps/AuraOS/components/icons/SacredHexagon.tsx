/**
 * Sacred Hexagon Icon
 * Symbol for AXIS - representing balance, completeness, and oracle precision
 * @component
 */

interface SacredHexagonProps {
  className?: string;
  size?: number;
}

export default function SacredHexagon({ className = '', size = 48 }: SacredHexagonProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer hexagon */}
      <polygon
        points="24,2 42.4,11.2 42.4,29.6 24,38.8 5.6,29.6 5.6,11.2"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Inner geometric patterns */}
      <circle cx="24" cy="20" r="4" fill="currentColor" />
      <line x1="24" y1="8" x2="24" y2="32" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <line x1="10" y1="14" x2="38" y2="26" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <line x1="38" y1="14" x2="10" y2="26" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}
