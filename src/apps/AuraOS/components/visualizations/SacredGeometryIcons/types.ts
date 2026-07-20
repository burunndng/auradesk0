/**
 * Shared props interface for all Sacred Geometry icon components.
 * Ensures consistency across all custom SVG icons and enables
 * unified updates to the icon API if new props are needed.
 */
export interface IconProps {
  /** Size in pixels (default: 64) */
  size?: number;
  /** SVG stroke color (default: 'currentColor' for theme inheritance) */
  color?: string;
  /** Optional CSS class name for additional styling */
  className?: string;
}
