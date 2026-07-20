# Schema Therapy Service - Modular Structure

This directory contains the modular split of `schemaTherapyService.ts` for improved tree-shaking.

## Files

- **schemaTestData.ts** - Test items, Likert scales, constants, question banks
- **schemaScoring.ts** - Scoring algorithms, calculations, thresholds (to be created)
- **schemaSynthesis.ts** - Profile synthesis, narratives, recommendations (to be created)
- **schemaAnalysis.ts** - LLM-based analysis functions (to be created)

## Usage

Import from the parent orchestrator file:

```typescript
import {
  scoreEMSTest,
  aggregateDomains,
  analyzeSchemaTestResponses,
  synthesizeSchemaProfile
} from '../services/schemaTherapyService';
```

The orchestrator file (`../schemaTherapyService.ts`) re-exports everything from these modules,
maintaining 100% backward compatibility with existing code.

## Tree-Shaking Benefits

Each module can be independently imported if you only need specific functionality:

```typescript
// Only pull in test data
import { EMS_QUESTIONS, MODE_QUESTIONS } from '../services/schema/schemaTestData';

// Only pull in scoring logic
import { scoreEMSTest } from '../services/schema/schemaScoring';
```

This allows bundlers to eliminate unused code when components only need specific parts of the service.
