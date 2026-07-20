import type { AudioBackend } from './types';
import { blissBackend } from './blissBackend';
import { superSonicBackend } from './superSonicBackend';

const registry = new Map<string, AudioBackend>();
let active: AudioBackend = blissBackend;

registry.set(blissBackend.id, blissBackend);
registry.set(superSonicBackend.id, superSonicBackend);

export function registerBackend(backend: AudioBackend): void {
  registry.set(backend.id, backend);
}

export function getBackend(): AudioBackend {
  return active;
}

export function setBackend(id: string): boolean {
  const b = registry.get(id);
  if (!b || !b.available) return false;
  active = b;
  return true;
}

export function listBackends(): AudioBackend[] {
  return [...registry.values()];
}

export function getActiveBackendId(): string {
  return active.id;
}
