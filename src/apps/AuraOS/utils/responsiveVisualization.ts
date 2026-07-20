/**
 * Responsive Visualization Utility
 * Provides adaptive dimensions and scaling for D3, Three.js, and canvas visualizations
 * across mobile, tablet, and desktop viewports
 */

export interface ResponsiveDimensions {
  width: number;
  height: number;
  scale: number;
  fontSize: number;
  padding: number;
  strokeWidth: number;
}

/**
 * Get responsive dimensions based on container width
 * Adapts for mobile, tablet, and desktop screens
 */
export function getResponsiveDimensions(containerWidth: number): ResponsiveDimensions {
  // Mobile: < 640px (iPhone, small Android)
  if (containerWidth < 640) {
    return {
      width: Math.min(containerWidth - 32, 350),  // 16px padding on each side
      height: 280,
      scale: 0.65,
      fontSize: 10,
      padding: 12,
      strokeWidth: 1.5
    };
  }

  // Tablet: 640px - 1024px (iPad, large tablets)
  if (containerWidth < 1024) {
    return {
      width: Math.min(containerWidth - 48, 600),  // 24px padding on each side
      height: 450,
      scale: 0.85,
      fontSize: 12,
      padding: 16,
      strokeWidth: 2
    };
  }

  // Desktop: >= 1024px
  return {
    width: 800,
    height: 600,
    scale: 1,
    fontSize: 14,
    padding: 20,
    strokeWidth: 2.5
  };
}

/**
 * Get responsive font scaling factors
 * Used for SVG text elements in D3 visualizations
 */
export function getResponsiveFontScaling(containerWidth: number): {
  titleSize: number;
  labelSize: number;
  tooltipSize: number;
} {
  if (containerWidth < 640) {
    return {
      titleSize: 12,
      labelSize: 9,
      tooltipSize: 10
    };
  }

  if (containerWidth < 1024) {
    return {
      titleSize: 14,
      labelSize: 11,
      tooltipSize: 12
    };
  }

  return {
    titleSize: 16,
    labelSize: 12,
    tooltipSize: 13
  };
}

/**
 * Calculate responsive node sizes for network/force graphs
 * Scales node radius based on viewport
 */
export function getResponsiveNodeSize(containerWidth: number): {
  baseRadius: number;
  maxRadius: number;
  selectedRadius: number;
} {
  if (containerWidth < 640) {
    return {
      baseRadius: 3,
      maxRadius: 6,
      selectedRadius: 8
    };
  }

  if (containerWidth < 1024) {
    return {
      baseRadius: 4,
      maxRadius: 8,
      selectedRadius: 10
    };
  }

  return {
    baseRadius: 5,
    maxRadius: 10,
    selectedRadius: 12
  };
}

/**
 * Get responsive margin configuration for D3 charts
 * Adjusts margins for labels, titles, and legends
 */
export function getResponsiveMargins(containerWidth: number): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  if (containerWidth < 640) {
    return { top: 20, right: 12, bottom: 20, left: 12 };
  }

  if (containerWidth < 1024) {
    return { top: 30, right: 20, bottom: 30, left: 20 };
  }

  return { top: 40, right: 30, bottom: 40, left: 30 };
}

/**
 * Check if viewport is mobile
 */
export function isMobile(containerWidth: number): boolean {
  return containerWidth < 640;
}

/**
 * Check if viewport is tablet
 */
export function isTablet(containerWidth: number): boolean {
  return containerWidth >= 640 && containerWidth < 1024;
}

/**
 * Check if viewport is desktop
 */
export function isDesktop(containerWidth: number): boolean {
  return containerWidth >= 1024;
}

/**
 * Get optimal Three.js canvas size for mobile
 * Maintains performance while being visually acceptable
 */
export function getResponsiveCanvasSize(containerWidth: number, containerHeight: number): {
  width: number;
  height: number;
  pixelRatio: number;
} {
  const mobile = isMobile(containerWidth);

  return {
    width: Math.min(containerWidth - 32, mobile ? 350 : 800),
    height: Math.min(containerHeight || 400, mobile ? 280 : 600),
    pixelRatio: mobile ? 1 : window.devicePixelRatio || 1  // Reduce for better performance on mobile
  };
}

/**
 * Debounce helper for resize events in visualizations
 * Prevents excessive recalculations during window resize
 */
export function createResizeObserver(
  callback: (width: number, height: number) => void,
  debounceMs: number = 150
): ResizeObserver {
  let timeoutId: NodeJS.Timeout | null = null;

  return new ResizeObserver((entries) => {
    if (timeoutId) clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        const height = entry.contentRect.height;
        callback(width, height);
      }
    }, debounceMs);
  });
}
