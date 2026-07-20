import { LiveParseError } from './errors';

export type ParsedToken = string;

export interface ParsedCommand {
  verb: string;
  args: ParsedToken[];
  raw: string;
}

function tokenize(source: string): ParsedToken[] {
  return source.trim().split(/\s+/).filter(Boolean);
}

export function parse(source: string): ParsedCommand {
  const raw = source.trim();
  if (!raw) throw new LiveParseError('Empty command', source);

  const tokens = tokenize(raw);
  const verb = tokens[0].toLowerCase();
  const args = tokens.slice(1);
  return { verb, args, raw };
}

export function parseNumber(token: string, label: string): number {
  const n = parseFloat(token);
  if (isNaN(n)) throw new LiveParseError(`Expected a number for ${label}, got "${token}"`);
  return n;
}

export function parseTrackRef(token: string): string {
  // Accept bare track ids or numeric shorthand "1"-"8" → "track-1"
  if (/^\d+$/.test(token)) return `track-${token}`;
  return token;
}

export function parseSceneRef(token: string): string {
  if (/^\d+$/.test(token)) return `scene-${token}`;
  return token;
}
