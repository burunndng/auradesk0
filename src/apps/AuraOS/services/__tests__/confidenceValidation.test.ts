/**
 * Tests for Confidence Validation & Tonal Shifting
 */

import { describe, it, expect } from 'vitest';
import {
  validateConfidence,
  detectConfidenceLanguage,
  calculateConfidenceFromDataVolume,
} from '../confidenceValidator';
import {
  shiftTone,
  determineTone,
  buildToneInstructions,
} from '../tonalShifter';

describe('Confidence Validation', () => {
  it('should detect overconfident language', () => {
    const overconfidentText = "You are clearly demonstrating a 95% confident pattern of perfectionism. This is definitely established.";
    const validation = validateConfidence(overconfidentText, 0.45, 2);
    expect(validation.isValid).toBe(false);
    expect(validation.mismatchType).toBeTruthy();
  });

  it('should accept exploratory language matching low confidence', () => {
    const exploratoryText = "I'm noticing some patterns worth exploring around this area. It might be worth investigating further.";
    const validation = validateConfidence(exploratoryText, 0.35, 1);
    expect(validation.isValid).toBe(true);
  });

  it('should accept definitive language matching high confidence', () => {
    const definitiveText = "You are demonstrating a clear pattern of growth-oriented behavior. This consistent evidence suggests strong development.";
    const validation = validateConfidence(definitiveText, 0.85, 20);
    expect(validation.isValid).toBe(true);
  });

  it('should detect language patterns', () => {
    const overconfidentText = "You are clearly demonstrating a 95% confident pattern of perfectionism. This is definitely established.";
    const detected = detectConfidenceLanguage(overconfidentText);
    expect(detected.definiteMarkers.length).toBeGreaterThan(0);
    expect(detected.overconfidenceDetected).toBe(true);
  });
});

describe('Tonal Shifting', () => {
  it('should shift to exploratory tone for low confidence', () => {
    const testText = "You are demonstrating a clear pattern of avoidance behavior. This is definitely established.";
    const shifted = shiftTone(testText, 0.4);
    expect(shifted.shiftedText).toBeTruthy();
    expect(shifted.changesApplied.length).toBeGreaterThan(0);
  });

  it('should determine tone based on confidence', () => {
    expect(determineTone(0.3)).toBeTruthy();
    expect(determineTone(0.6)).toBeTruthy();
    expect(determineTone(0.85)).toBeTruthy();
  });

  it('should build tone instructions', () => {
    const lowTone = buildToneInstructions(0.4);
    const highTone = buildToneInstructions(0.85);
    expect(lowTone).toContain('EXPLORATORY');
    expect(highTone).toContain('DEFINITIVE');
  });
});

describe('Confidence Calculation from Data Volume', () => {
  it('should calculate increasing confidence with more data', () => {
    const conf1 = calculateConfidenceFromDataVolume(1, 0, 0);
    const conf5 = calculateConfidenceFromDataVolume(5, 2, 2);
    const conf20 = calculateConfidenceFromDataVolume(20, 5, 8);
    expect(conf1).toBeGreaterThan(0);
    expect(conf5).toBeGreaterThan(conf1);
    expect(conf20).toBeGreaterThan(conf5);
  });
});
