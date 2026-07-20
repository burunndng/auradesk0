import { describe, it, expect } from 'vitest';
import { parse, parseNumber, parseTrackRef, parseSceneRef } from './parser';
import { LiveParseError } from './errors';

describe('parse', () => {
  it('splits verb + args and lowercases the verb', () => {
    const c = parse('BPM 140');
    expect(c.verb).toBe('bpm');
    expect(c.args).toEqual(['140']);
    expect(c.raw).toBe('BPM 140');
  });

  it('collapses surrounding + internal whitespace', () => {
    const c = parse('   play    kick   in   groove  ');
    expect(c.verb).toBe('play');
    expect(c.args).toEqual(['kick', 'in', 'groove']);
  });

  it('throws on empty input', () => {
    expect(() => parse('')).toThrow(LiveParseError);
    expect(() => parse('   ')).toThrow(LiveParseError);
  });
});

describe('parseNumber', () => {
  it('parses numeric strings', () => {
    expect(parseNumber('140', 'bpm')).toBe(140);
    expect(parseNumber('0.5', 'mix')).toBe(0.5);
  });

  it('throws on non-numeric input', () => {
    expect(() => parseNumber('abc', 'bpm')).toThrow(LiveParseError);
  });
});

describe('parseTrackRef / parseSceneRef', () => {
  it('expands bare integers to track-N / scene-N', () => {
    expect(parseTrackRef('3')).toBe('track-3');
    expect(parseSceneRef('2')).toBe('scene-2');
  });

  it('passes through non-numeric ids unchanged', () => {
    expect(parseTrackRef('kick')).toBe('kick');
    expect(parseSceneRef('groove')).toBe('groove');
  });
});
