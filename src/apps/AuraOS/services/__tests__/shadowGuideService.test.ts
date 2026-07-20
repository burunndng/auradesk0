import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  getShadowReflection,
  SHADOW_JOURNALING_MODEL,
  SHADOW_JOURNALING_TEMPERATURE,
} from '../shadowGuideService';
import * as openRouterService from '../openRouterService';

const MOCK_REFLECTION = `---

**Acknowledge**
You shared something meaningful.

**Mirror**
I hear the tension you're naming.

**Inquire**
- What sits underneath this?
- Where else does it show up?

**Return Agency**
Trust what you notice as you stay with this.
`;

describe('shadowGuideService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Shadow journaling pins Grok 4.1 @ temperature 0.5', async () => {
    const generateSpy = vi.spyOn(openRouterService, 'generateOpenRouterResponse').mockResolvedValue({
      success: true,
      text: MOCK_REFLECTION,
    });

    const response = await getShadowReflection({
      exerciseId: 'projection-inventory',
      exerciseName: 'Projection Inventory',
      exercisePhase: 'discovery',
      instructions: 'Test instructions',
      userEntry: 'Test entry',
    });

    expect(response.success).toBe(true);
    expect(generateSpy).toHaveBeenCalledTimes(1);

    const [, , options] = generateSpy.mock.calls[0];
    expect(options).toBeDefined();
    expect(options?.model).toBe(SHADOW_JOURNALING_MODEL);
    expect(options?.temperature).toBe(SHADOW_JOURNALING_TEMPERATURE);
  });
});
