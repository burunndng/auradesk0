import type {
  TherapyModalityId,
  TherapyRecommendation,
  TherapyClinicalFlag,
  TherapyScoringResult,
} from '../types';
import { therapyAssessmentQuestions } from '../data/therapyAssessmentQuestions';

const ALL_MODALITIES: TherapyModalityId[] = [
  'cbt', 'dbt', 'act', 'psychodynamic', 'emdr',
  'ifs', 'somatic', 'narrative', 'sfbt', 'eft',
];

function createEmptyScores(): Record<TherapyModalityId, number> {
  return Object.fromEntries(ALL_MODALITIES.map((m) => [m, 0])) as Record<TherapyModalityId, number>;
}

function getFitLabel(normalizedScore: number): TherapyRecommendation['fitLabel'] {
  if (normalizedScore >= 85) return 'Excellent fit';
  if (normalizedScore >= 70) return 'Strong fit';
  if (normalizedScore >= 50) return 'Good fit';
  return 'Possible fit';
}

export function calculateTherapyScores(
  answers: Record<string, string[]>
): TherapyScoringResult {
  const scores = createEmptyScores();
  const contributionMap: Record<TherapyModalityId, string[]> = Object.fromEntries(
    ALL_MODALITIES.map((m) => [m, []])
  ) as Record<TherapyModalityId, string[]>;

  // Phase 1: Accumulate weighted scores
  for (const question of therapyAssessmentQuestions) {
    const selectedValues = answers[question.id] || [];

    for (const selectedValue of selectedValues) {
      const option = question.options.find((o) => o.value === selectedValue);
      if (!option) continue;

      for (const [modality, weight] of Object.entries(option.scores)) {
        const mod = modality as TherapyModalityId;
        if (!ALL_MODALITIES.includes(mod)) continue;
        scores[mod] += weight;

        if (weight > 0) {
          contributionMap[mod].push(`${question.construct}: "${option.label}"`);
        }
      }
    }
  }

  // Phase 2: Clinical flags & contraindication overrides
  const flags: TherapyClinicalFlag[] = [];
  const selectedConcerns = answers['q1_concerns'] || [];
  const copingStyles = answers['q10_coping_style'] || [];

  // Dissociation + trauma -> EMDR contraindication
  if (
    copingStyles.includes('dissociate') &&
    (selectedConcerns.includes('trauma_discrete') ||
      selectedConcerns.includes('trauma_complex'))
  ) {
    scores.emdr = Math.min(scores.emdr, 0);
    flags.push({
      type: 'contraindication',
      message:
        'EMDR typically requires a stabilization phase before trauma reprocessing when dissociation is present. A therapist trained in phase-oriented trauma treatment can assess your readiness.',
      affectedModalities: ['emdr'],
    });
  }

  // Dysregulation + complex trauma -> phased approach note
  if (
    selectedConcerns.includes('dysregulation') &&
    selectedConcerns.includes('trauma_complex')
  ) {
    scores.dbt += 2;
    flags.push({
      type: 'modifier',
      message:
        'For complex trauma with emotion dysregulation, many clinicians recommend a phased approach: stabilization skills first (often DBT), followed by trauma processing (EMDR, IFS, or somatic work).',
      affectedModalities: ['dbt', 'emdr', 'ifs', 'somatic'],
    });
  }

  // Crisis screen: dysregulation + dissociation
  if (
    selectedConcerns.includes('dysregulation') &&
    copingStyles.includes('dissociate')
  ) {
    flags.push({
      type: 'crisis',
      message:
        'If you are currently experiencing thoughts of self-harm or suicide, please reach out to the 988 Suicide & Crisis Lifeline (call or text 988) or go to your nearest emergency room.',
    });
  }

  // Phase 3: Floor negative scores, normalize
  const adjustedScores = { ...scores };
  for (const mod of ALL_MODALITIES) {
    adjustedScores[mod] = Math.max(0, adjustedScores[mod]);
  }

  const maxScore = Math.max(...Object.values(adjustedScores), 1);

  const normalizedScores = Object.fromEntries(
    ALL_MODALITIES.map((mod) => [
      mod,
      Math.round((adjustedScores[mod] / maxScore) * 100),
    ])
  ) as Record<TherapyModalityId, number>;

  // Phase 4: Ranked recommendations (top 3)
  const topRecommendations: TherapyRecommendation[] = ALL_MODALITIES
    .map((modality) => ({
      modality,
      rawScore: adjustedScores[modality],
      normalizedScore: normalizedScores[modality],
      fitLabel: getFitLabel(normalizedScores[modality]),
      contributingFactors: contributionMap[modality].slice(0, 5),
    }))
    .sort((a, b) => b.rawScore - a.rawScore)
    .slice(0, 3);

  return {
    rawScores: adjustedScores,
    normalizedScores,
    topRecommendations,
    flags,
  };
}
