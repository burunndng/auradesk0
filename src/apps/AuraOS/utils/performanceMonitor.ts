/**
 * Simple performance monitoring for key operations.
 * Logs timing data to help identify bottlenecks.
 */

type PerformanceMarker = {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
};

const markers = new Map<string, PerformanceMarker[]>();

export function startMark(name: string) {
  if (!markers.has(name)) {
    markers.set(name, []);
  }
  markers.get(name)!.push({
    name,
    startTime: performance.now(),
  });
}

export function endMark(name: string) {
  const markerList = markers.get(name);
  if (!markerList || markerList.length === 0) {
    console.warn(`[perf] No start mark found for "${name}"`);
    return;
  }

  const marker = markerList[markerList.length - 1];
  marker.endTime = performance.now();
  marker.duration = marker.endTime - marker.startTime;

  if (marker.duration > 100) {
    console.debug(
      `[perf] ${name}: ${marker.duration.toFixed(2)}ms (slow)`,
      marker
    );
  }
}

export function getMetrics(name: string) {
  const markerList = markers.get(name) || [];
  if (markerList.length === 0) return null;

  const durations = markerList
    .filter(m => m.duration !== undefined)
    .map(m => m.duration!);

  return {
    count: durations.length,
    min: Math.min(...durations),
    max: Math.max(...durations),
    avg: durations.reduce((a, b) => a + b, 0) / durations.length,
  };
}

export function clearMetrics(name?: string) {
  if (name) {
    markers.delete(name);
  } else {
    markers.clear();
  }
}
