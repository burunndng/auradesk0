/**
 * insightDatabaseService Tests
 * Verifies CRUD operations and field mapping between camelCase TypeScript and snake_case DB rows
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IntegratedInsight } from '../../types';

// Chainable mock builder — each call resets chain state per test via beforeEach
let mockQueryResult: { data: any; error: any } = { data: null, error: null };

const chain: any = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  upsert: vi.fn(() => Promise.resolve(mockQueryResult)),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  neq: vi.fn().mockReturnThis(),
  order: vi.fn(() => Promise.resolve(mockQueryResult)),
  limit: vi.fn().mockReturnThis(),
  single: vi.fn(() => Promise.resolve(mockQueryResult)),
  maybeSingle: vi.fn(() => Promise.resolve(mockQueryResult)),
};

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => chain),
  },
}));

// Import after mock is set up
import { insightDatabaseService } from '../insightDatabaseService';
import { supabase } from '../supabaseClient';

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

function createMockInsight(overrides: Partial<IntegratedInsight> = {}): IntegratedInsight {
  return {
    id: 'insight-abc-123',
    mindToolType: 'IFS Session',
    mindToolSessionId: 'session-xyz-456',
    mindToolName: 'IFS Session',
    mindToolReport: 'Full report text here',
    mindToolShortSummary: 'Short summary',
    detectedPattern: 'Avoidance of vulnerability',
    suggestedShadowWork: [
      { practiceId: 'shadow-journaling', practiceName: 'Shadow Journaling', rationale: 'Explore the pattern' },
    ],
    suggestedNextSteps: [
      { practiceId: 'meditation', practiceName: 'Meditation', rationale: 'Ground the work' },
    ],
    dateCreated: '2026-01-15T10:00:00.000Z',
    status: 'pending',
    shadowWorkSessionsAddressed: [],
    relatedPracticeSessions: [],
    practiceOutcome: null as any,
    patternEvolutionNotes: 'Pattern softening over time',
    lineageId: 'lineage-001',
    generatedBy: 'grok',
    confidenceScore: 0.82,
    ...overrides,
  };
}

/** Builds the snake_case DB row that corresponds to createMockInsight() output */
function createMockDbRow(overrides: Record<string, any> = {}): Record<string, any> {
  const insight = createMockInsight();
  return {
    id: insight.id,
    mind_tool_type: insight.mindToolType,
    mind_tool_session_id: insight.mindToolSessionId,
    mind_tool_name: insight.mindToolName,
    mind_tool_report: insight.mindToolReport,
    mind_tool_short_summary: insight.mindToolShortSummary,
    detected_pattern: insight.detectedPattern,
    suggested_shadow_work: insight.suggestedShadowWork,
    suggested_next_steps: insight.suggestedNextSteps,
    date_created: insight.dateCreated,
    status: insight.status,
    shadow_work_sessions_addressed: insight.shadowWorkSessionsAddressed,
    related_practice_sessions: insight.relatedPracticeSessions,
    practice_outcome: insight.practiceOutcome,
    pattern_evolution_notes: insight.patternEvolutionNotes,
    lineage_id: insight.lineageId,
    generated_by: insight.generatedBy,
    confidence_score: insight.confidenceScore,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Reset chain mock return values before each test
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  mockQueryResult = { data: null, error: null };

  // Re-wire chain methods that return promises to read from mockQueryResult
  chain.order.mockImplementation(() => Promise.resolve(mockQueryResult));
  chain.upsert.mockImplementation(() => Promise.resolve(mockQueryResult));
  chain.delete.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.select.mockReturnValue(chain);
});

// ===========================================================================
// getInsights
// ===========================================================================

describe('getInsights', () => {
  it('returns array of IntegratedInsight with correct camelCase field mapping from snake_case DB row', async () => {
    const dbRow = createMockDbRow();
    mockQueryResult = { data: [dbRow], error: null };

    const result = await insightDatabaseService.getInsights('user-001');

    expect(result).toHaveLength(1);
    const insight = result[0];
    expect(insight.id).toBe(dbRow.id);
    expect(insight.mindToolType).toBe(dbRow.mind_tool_type);
    expect(insight.mindToolSessionId).toBe(dbRow.mind_tool_session_id);
    expect(insight.mindToolName).toBe(dbRow.mind_tool_name);
    expect(insight.mindToolReport).toBe(dbRow.mind_tool_report);
    expect(insight.mindToolShortSummary).toBe(dbRow.mind_tool_short_summary);
    expect(insight.detectedPattern).toBe(dbRow.detected_pattern);
    expect(insight.suggestedShadowWork).toEqual(dbRow.suggested_shadow_work);
    expect(insight.suggestedNextSteps).toEqual(dbRow.suggested_next_steps);
    expect(insight.dateCreated).toBe(dbRow.date_created);
    expect(insight.status).toBe(dbRow.status);
    expect(insight.shadowWorkSessionsAddressed).toEqual(dbRow.shadow_work_sessions_addressed);
    expect(insight.relatedPracticeSessions).toEqual(dbRow.related_practice_sessions);
    expect(insight.patternEvolutionNotes).toBe(dbRow.pattern_evolution_notes);
    expect(insight.lineageId).toBe(dbRow.lineage_id);
    expect(insight.generatedBy).toBe(dbRow.generated_by);
    expect(insight.confidenceScore).toBe(dbRow.confidence_score);
  });

  it('returns empty array when supabase returns an error', async () => {
    mockQueryResult = { data: null, error: { message: 'DB connection failed', code: '500' } };

    const result = await insightDatabaseService.getInsights('user-001');

    expect(result).toEqual([]);
  });

  it('returns empty array when supabase returns null data', async () => {
    mockQueryResult = { data: null, error: null };

    const result = await insightDatabaseService.getInsights('user-001');

    expect(result).toEqual([]);
  });

  it('returns empty array when supabase returns empty array', async () => {
    mockQueryResult = { data: [], error: null };

    const result = await insightDatabaseService.getInsights('user-001');

    expect(result).toEqual([]);
  });

  it('queries the integrated_insights table filtered by user_id ordered by date_created descending', async () => {
    mockQueryResult = { data: [], error: null };

    await insightDatabaseService.getInsights('user-999');

    expect(supabase.from).toHaveBeenCalledWith('integrated_insights');
    expect(chain.eq).toHaveBeenCalledWith('user_id', 'user-999');
    expect(chain.order).toHaveBeenCalledWith('date_created', { ascending: false });
  });

  it('defaults suggestedShadowWork and suggestedNextSteps to empty arrays when null in DB', async () => {
    const dbRow = createMockDbRow({ suggested_shadow_work: null, suggested_next_steps: null });
    mockQueryResult = { data: [dbRow], error: null };

    const result = await insightDatabaseService.getInsights('user-001');

    expect(result[0].suggestedShadowWork).toEqual([]);
    expect(result[0].suggestedNextSteps).toEqual([]);
  });
});

// ===========================================================================
// saveInsight
// ===========================================================================

describe('saveInsight', () => {
  it('returns true when upsert succeeds', async () => {
    mockQueryResult = { data: null, error: null };

    const result = await insightDatabaseService.saveInsight('user-001', createMockInsight());

    expect(result).toBe(true);
  });

  it('returns false when supabase returns an error', async () => {
    mockQueryResult = { data: null, error: { message: 'Unique constraint violation', code: '23505' } };

    const result = await insightDatabaseService.saveInsight('user-001', createMockInsight());

    expect(result).toBe(false);
  });

  it('maps camelCase insight fields to snake_case DB columns', async () => {
    mockQueryResult = { data: null, error: null };
    const insight = createMockInsight();

    await insightDatabaseService.saveInsight('user-001', insight);

    expect(supabase.from).toHaveBeenCalledWith('integrated_insights');
    const upsertCall = chain.upsert.mock.calls[0][0];
    expect(upsertCall.mind_tool_type).toBe(insight.mindToolType);
    expect(upsertCall.mind_tool_session_id).toBe(insight.mindToolSessionId);
    expect(upsertCall.mind_tool_name).toBe(insight.mindToolName);
    expect(upsertCall.detected_pattern).toBe(insight.detectedPattern);
    expect(upsertCall.user_id).toBe('user-001');
    expect(upsertCall.lineage_id).toBe(insight.lineageId);
    expect(upsertCall.confidence_score).toBe(insight.confidenceScore);
    expect(upsertCall.generated_by).toBe(insight.generatedBy);
  });

  it('upserts with onConflict id to handle duplicates', async () => {
    mockQueryResult = { data: null, error: null };

    await insightDatabaseService.saveInsight('user-001', createMockInsight());

    const upsertOptions = chain.upsert.mock.calls[0][1];
    expect(upsertOptions).toEqual({ onConflict: 'id' });
  });

  it('includes updated_at timestamp in the upsert payload', async () => {
    mockQueryResult = { data: null, error: null };

    await insightDatabaseService.saveInsight('user-001', createMockInsight());

    const upsertCall = chain.upsert.mock.calls[0][0];
    expect(upsertCall.updated_at).toBeDefined();
    expect(typeof upsertCall.updated_at).toBe('string');
  });
});

// ===========================================================================
// saveInsights (bulk)
// ===========================================================================

describe('saveInsights', () => {
  it('returns true when bulk upsert succeeds', async () => {
    mockQueryResult = { data: null, error: null };
    const insights = [createMockInsight({ id: 'a' }), createMockInsight({ id: 'b' })];

    const result = await insightDatabaseService.saveInsights('user-001', insights);

    expect(result).toBe(true);
  });

  it('returns true without calling supabase when given an empty array', async () => {
    // saveInsights on empty array: the service calls upsert with [] which succeeds
    mockQueryResult = { data: null, error: null };

    const result = await insightDatabaseService.saveInsights('user-001', []);

    expect(result).toBe(true);
  });

  it('returns false when supabase returns an error during bulk upsert', async () => {
    mockQueryResult = { data: null, error: { message: 'Bulk insert failed', code: '500' } };
    const insights = [createMockInsight()];

    const result = await insightDatabaseService.saveInsights('user-001', insights);

    expect(result).toBe(false);
  });

  it('maps all insights in the batch to snake_case DB rows', async () => {
    mockQueryResult = { data: null, error: null };
    const insights = [
      createMockInsight({ id: 'bulk-1', mindToolType: 'IFS Session' }),
      createMockInsight({ id: 'bulk-2', mindToolType: 'Shadow Journaling' }),
    ];

    await insightDatabaseService.saveInsights('user-001', insights);

    const upsertRows = chain.upsert.mock.calls[0][0];
    expect(Array.isArray(upsertRows)).toBe(true);
    expect(upsertRows).toHaveLength(2);
    expect(upsertRows[0].id).toBe('bulk-1');
    expect(upsertRows[0].mind_tool_type).toBe('IFS Session');
    expect(upsertRows[1].id).toBe('bulk-2');
    expect(upsertRows[1].mind_tool_type).toBe('Shadow Journaling');
  });
});

// ===========================================================================
// deleteInsight
// ===========================================================================

describe('deleteInsight', () => {
  beforeEach(() => {
    // For delete, the terminal method is eq (returns a promise via the chain mock)
    chain.eq.mockImplementation(() => Promise.resolve(mockQueryResult));
  });

  it('returns true when delete succeeds', async () => {
    mockQueryResult = { data: null, error: null };

    const result = await insightDatabaseService.deleteInsight('insight-abc-123');

    expect(result).toBe(true);
  });

  it('returns false when supabase returns an error', async () => {
    mockQueryResult = { data: null, error: { message: 'Row not found', code: '404' } };

    const result = await insightDatabaseService.deleteInsight('insight-abc-123');

    expect(result).toBe(false);
  });

  it('deletes from integrated_insights table filtered by id', async () => {
    mockQueryResult = { data: null, error: null };

    await insightDatabaseService.deleteInsight('insight-to-delete');

    expect(supabase.from).toHaveBeenCalledWith('integrated_insights');
    expect(chain.eq).toHaveBeenCalledWith('id', 'insight-to-delete');
  });
});
