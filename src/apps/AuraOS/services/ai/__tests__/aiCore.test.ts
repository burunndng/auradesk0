/**
 * aiCore.ts — callGrokThenAIJson tests
 *
 * Coverage:
 *  - Grok succeeds → returns parsed + schema-validated result
 *  - Grok fails → MiMo fallback succeeds
 *  - Grok + MiMo fail → Qwen fallback succeeds
 *  - All three fail, no staticFallback → throws
 *  - All three fail, staticFallback provided → returns fallback without throwing
 *  - Schema validation failure → throws even when model responds
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { z } from 'zod';

// callGrokThenAIJson calls fetch internally via callProxyWithProviderConfig.
// We mock fetch globally to control each model's response.

const makeOkFetch = (content: string) =>
  vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ choices: [{ message: { content } }] }),
  });

const makeErrorFetch = (status = 500) =>
  vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: async () => ({}),
  });

const makeNetworkErrorFetch = () =>
  vi.fn().mockRejectedValue(new Error('Network error'));

// Simple schema used across tests
const testSchema = z.object({ score: z.number(), label: z.string() });
type TestResult = z.infer<typeof testSchema>;

const validPayload: TestResult = { score: 0.8, label: 'good' };
const validJson = JSON.stringify(validPayload);

// Import after mocks are set up
import { callGrokThenAIJson } from '../aiCore';

describe('callGrokThenAIJson', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('returns parsed and schema-validated result when Grok succeeds', async () => {
    global.fetch = makeOkFetch(validJson) as any;

    const result = await callGrokThenAIJson('TestWizard', 'prompt', undefined, testSchema);

    expect(result).toEqual(validPayload);
  });

  it('falls back to MiMo when Grok returns a 500 error', async () => {
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        // Grok fails
        return { ok: false, status: 500, json: async () => ({}) };
      }
      // MiMo succeeds
      return { ok: true, json: async () => ({ choices: [{ message: { content: validJson } }] }) };
    }) as any;

    const result = await callGrokThenAIJson('TestWizard', 'prompt', undefined, testSchema);

    expect(result).toEqual(validPayload);
    expect(callCount).toBeGreaterThanOrEqual(2);
  });

  it('falls back to Qwen when both Grok and MiMo fail', async () => {
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount <= 2) {
        // Grok and MiMo fail
        return { ok: false, status: 503, json: async () => ({}) };
      }
      // Qwen succeeds
      return { ok: true, json: async () => ({ choices: [{ message: { content: validJson } }] }) };
    }) as any;

    const result = await callGrokThenAIJson('TestWizard', 'prompt', undefined, testSchema);

    expect(result).toEqual(validPayload);
    expect(callCount).toBeGreaterThanOrEqual(3);
  });

  it('throws when all three models fail and no staticFallback is provided', async () => {
    global.fetch = makeErrorFetch(503) as any;

    await expect(
      callGrokThenAIJson('TestWizard', 'prompt', undefined, testSchema)
    ).rejects.toThrow();
  });

  it('returns staticFallback when all models fail and a fallback is provided', async () => {
    global.fetch = makeNetworkErrorFetch() as any;

    const fallback: TestResult = { score: 0, label: 'fallback' };
    const result = await callGrokThenAIJson('TestWizard', 'prompt', undefined, testSchema, fallback);

    expect(result).toEqual(fallback);
  });

  it('throws on schema validation failure even when model responds with 200', async () => {
    const badJson = JSON.stringify({ score: 'not-a-number', label: 99 }); // wrong types
    global.fetch = makeOkFetch(badJson) as any;

    await expect(
      callGrokThenAIJson('TestWizard', 'prompt', undefined, testSchema)
    ).rejects.toThrow(/schema validation failed/i);
  });

  it('works without a schema — returns raw parsed JSON', async () => {
    const rawPayload = { anything: true, value: 42 };
    global.fetch = makeOkFetch(JSON.stringify(rawPayload)) as any;

    const result = await callGrokThenAIJson('TestWizard', 'prompt');

    expect(result).toEqual(rawPayload);
  });

  it('throws when model returns non-JSON response', async () => {
    global.fetch = makeOkFetch('This is plain text, not JSON') as any;

    await expect(
      callGrokThenAIJson('TestWizard', 'prompt', undefined, testSchema)
    ).rejects.toThrow();
  });
});
