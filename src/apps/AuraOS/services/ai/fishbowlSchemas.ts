import { z } from 'zod';

export const fishbowlResponseSchema = z.object({
  perspectives: z.array(z.object({
    perspectiveName: z.string(),
    response: z.string().min(80).max(200),
  })).min(2).max(3),
});

export const bridgeAndPracticeResponseSchema = z.object({
  bridgeQuestion: z.string().min(20).max(250),
  plainLanguageGloss: z.string().min(10).max(120),
  practice: z.string().min(30).max(250),
  varietyClass: z.enum(['conversation', 'boundary', 'attention', 'pacing', 'honesty', 'support-seeking']),
});

export type FishbowlResponse = z.infer<typeof fishbowlResponseSchema>;
export type BridgeAndPracticeResponse = z.infer<typeof bridgeAndPracticeResponseSchema>;
