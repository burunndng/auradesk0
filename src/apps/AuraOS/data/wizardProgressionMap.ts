export type ModuleKey = 'shadow' | 'mind' | 'body' | 'spirit';

export interface WizardProgression {
  nextWizardId: string;
  nextTitle: string;
  rationale: string;
  moduleKey: ModuleKey;
}

export const WIZARD_PROGRESSION_MAP: Record<string, WizardProgression> = {
  'shadow-journaling':      { nextWizardId: 'three-two-one',            nextTitle: '3-2-1 Shadow',       rationale: 'Transform the pattern you just named',                moduleKey: 'shadow' },
  'three-two-one':          { nextWizardId: 'ifs',                      nextTitle: 'IFS',                 rationale: 'Meet the part behind the shadow',                      moduleKey: 'shadow' },
  'meditation':             { nextWizardId: 'polyvagal-trainer',        nextTitle: 'Polyvagal Trainer',   rationale: 'Anchor the stillness in your nervous system',          moduleKey: 'body'   },
  'polyvagal-trainer':      { nextWizardId: 'somatic',                  nextTitle: 'Somatic Generator',   rationale: 'Build on your regulated state',                        moduleKey: 'body'   },
  'interoception':          { nextWizardId: 'somatic-cartography',      nextTitle: 'Somatic Cartography', rationale: 'Build a spatial map from your interoceptive awareness',   moduleKey: 'body'   },
  'somatic-cartography':    { nextWizardId: 'polyvagal-trainer',        nextTitle: 'Polyvagal Trainer',   rationale: 'Ground your body map in nervous system regulation',       moduleKey: 'body'   },
  'bias':                   { nextWizardId: 'schema-detective',         nextTitle: 'Schema Detective',    rationale: 'Find the belief beneath the bias',                    moduleKey: 'mind'   },
  'ps':                     { nextWizardId: 'axis',                     nextTitle: 'AXIS',                rationale: 'Enact the shift across all quadrants',                moduleKey: 'mind'   },
  'contemplative-inquiry':  { nextWizardId: 'states-training',         nextTitle: 'States Training',     rationale: 'Move from inquiry into direct practice',              moduleKey: 'spirit' },
  'tree-of-life':           { nextWizardId: 'integral-practice-designer', nextTitle: 'Practice Designer', rationale: 'Design a practice built on your emergence',          moduleKey: 'spirit' },
};
