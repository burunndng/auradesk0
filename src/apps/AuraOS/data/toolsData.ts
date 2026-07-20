// data/toolsData.ts

import type { LucideIcon } from 'lucide-react';

export type ModuleId = 'mind' | 'shadow' | 'body' | 'spirit';
export type ToolDepth = 'Assessment' | 'Practice' | 'Deep Work';

/**
 * IconName matches the keys in /lib/iconMap.ts
 */
export type IconName =
  // AOS Foundation Icons (Core utility symbols)
  | 'AOSClock'
  | 'AOSBrain'
  | 'AOSArrow'
  | 'AOSReject'
  | 'AOSConfirm'
  // Cyber-Sigils: Universal
  | 'WorldEngine'
  | 'VectorGate'
  | 'Algorithm'
  | 'Chronolith'
  | 'Crucible'
  | 'Aegis'
  // Cyber-Sigils: Body
  | 'VesselFrame'
  | 'PulseMatrix'
  | 'SenseMandala'
  // Cyber-Sigils: Mind
  | 'SynapseNetwork'
  | 'EngramArchive'
  | 'FocusAperture'
  // Cyber-Sigils: Spirit
  | 'AscensionFlame'
  | 'InfiniteBridge'
  // Cyber-Sigils: Shadow
  | 'VoidEclipse'
  | 'UmbraFragment'
  // Sensemaking Lab Icons
  | 'InquiryVortex'
  | 'PatternMandala'
  | 'StructuralLattice'
  | 'TransformativeArc'
  | 'EvolutionaryUnfolding'
  | 'ConsciousNode'
  // Transcendent Icons (Philosophical & Esoteric)
  | 'RecursionWell'
  | 'AetherBreath'
  | 'ParadoxGate'
  | 'RosaCrucis'
  | 'TwinPillars'
  | 'LightningPath'
  // Intelligence & Wisdom Icons
  | 'NoosphereNode'
  // Original Transcendent Icons (Creation, Consciousness, Liberation)
  | 'VoidBloom'
  | 'EchoSphere'
  | 'OuroborosKey'
  // Dimensional Alignment Icons (Dimensionality, Celestial Harmony, Connectivity)
  | 'HyperTesseract'
  | 'OrbitEclipse'
  | 'CipherWeave'
  // Synthesis & Entanglement Icons (AI Emergence, Quantum Connection)
  | 'NeuralConvergence'
  | 'QuantumEntanglement'
  // Psychedelic & Sacred Emergence Icons (Master Craft Edition)
  | 'Merkaba'
  | 'SeedOfLife'
  // Universal & Esoteric Icons (Future Library Reserve)
  | 'OuroborosGate'
  | 'CrystalLattice'
  | 'AstralCompass'
  // The Luminous Triad (Genesis, Integration, Infinite Descent)
  | 'VesicaSacra'
  | 'EnsoTriunity'
  // The Embodied Triad (Resonance, Connection, Grounding)
  | 'ResonanceField'
  | 'DyadBridge'
  | 'SomaticPillar'
  // AETHON Icons (Gateway, Bloom)
  | 'AethonGateway'
  | 'AethonBloom'
  // Values & Coherence Icons (Set 17)
  | 'CelticContinuum'
  | 'DharmaLotus'
  // Spirit Module Additions
  | 'Abrahadabra'
  | 'ApophaticFrame'
  | 'CelestialRose'
  | 'HermeticVessel'
  | 'PsychopompLantern'
  | 'Tesseract'
  | 'ThirdEye'
  | 'Sushumna'
  | 'Nigredo'
  | 'Resonator'
  // Semantic Precision Icons (SET 18 — resolving reuse)
  | 'PolarityScale'
  | 'MoralCompass'
  | 'IdentityPrism'
  | 'DecisionFork'
  | 'SomaThread'
  | 'StackArchitect'
  | 'PhaseWheel'
  | 'DefusionPrism'
  | 'RelationalWeb'
  | 'NonDualEye'
  // Additional Sacred Icons
  | 'CircadianWave'
  | 'FlowerOfLife'
  | 'TriangleInversion'
  // Alchemical Trinity (SET 20)
  | 'DescentChalice'
  | 'SingularityOrb'
  | 'SovereignTriskelion'
  // Dark Force Trinity (SET 21)
  | 'KalachakraMaw'
  | 'QliphothicPillar'
  | 'MahakalaSeal'
  // Legacy Fallbacks (kept for compatibility)
  | 'Heart'
  | 'TrendingUp'
  | 'Unlock'
  | 'BrainCircuit'
  | 'Compass'
  | 'SearchCode'
  | 'GitCompareArrows'
  | 'Shuffle'
  | 'Layers'
  | 'Target'
  | 'RefreshCw'
  | 'GraduationCap'
  | 'Zap'
  | 'Signpost'
  | 'Shield'
  | 'Brain'
  | 'Microscope';

export interface Tool {
  id: string;
  name: string;
  description: string;
  whenToUse: string[];
  timeEstimate: string;
  depth: ToolDepth;
  wizardId: string;
  module: ModuleId;
  iconName: IconName;
}

export interface Module {
  id: ModuleId;
  label: string;
  description: string;
  color: 'blue' | 'purple' | 'emerald' | 'amber';
  count: number;
  tools: Tool[];
}

// ============================================================================
// MIND TOOLS (Blue Module)
// ============================================================================

export const mindTools: Tool[] = [
  {
    id: 'kegan-stage',
    name: 'Kegan Stage Assessment',
    description: 'Determine your center of gravity across Kegan\'s stages of adult development (Socialized, Self-Authoring, Self-Transforming)',
    whenToUse: [
      'Want to understand your meaning-making capacity',
      'Curious about developmental psychology',
      'Exploring your leadership or adult maturity level'
    ],
    timeEstimate: '20 mins',
    depth: 'Assessment',
    wizardId: 'kegan',
    module: 'mind',
    iconName: 'Chronolith'
  },
  {
    id: 'immunity-to-change',
    name: 'Immunity to Change',
    description: 'Uncover hidden competing commitments that sabotage your goals. Reveal the unconscious "immune system" protecting you from change',
    whenToUse: [
      'Stuck on a goal despite consistent effort',
      'Want to understand self-sabotage patterns',
      'Need breakthrough thinking on a persistent problem'
    ],
    timeEstimate: '15 mins',
    depth: 'Deep Work',
    wizardId: 'immunity-to-change',
    module: 'mind',
    iconName: 'VectorGate'
  },
  {
    id: 'bias-finder',
    name: 'Bias Finder',
    description: 'AI-guided Socratic inquiry to identify cognitive biases in your thinking',
    whenToUse: [
      'Making an important decision',
      'Want to question your assumptions',
      'Seeking more objective perspective on an issue'
    ],
    timeEstimate: '15-20 mins',
    depth: 'Practice',
    wizardId: 'biasfinder',
    module: 'mind',
    iconName: 'CipherWeave'
  },
  {
    id: 'perspective-shifter',
    name: 'Perspective Shifter',
    description: 'Systematically adopt 1st, 2nd, and 3rd person views on a situation to see all angles',
    whenToUse: [
      'Feeling stuck in one perspective',
      'Want to understand another\'s viewpoint',
      'Seeking more nuanced view of a conflict'
    ],
    timeEstimate: '15-20 mins',
    depth: 'Practice',
    wizardId: 'ps',
    module: 'mind',
    iconName: 'Crucible'
  },
  {
    id: 'polarity-mapper',
    name: 'Polarity Mapper',
    description: 'Manage complex "both/and" tensions effectively. Navigate competing values and perspectives',
    whenToUse: [
      'Facing a dilemma with no clear answer',
      'Managing tension between competing values',
      'Seeking integrated approach to paradox'
    ],
    timeEstimate: '20-25 mins',
    depth: 'Deep Work',
    wizardId: 'pm',
    module: 'mind',
    iconName: 'PolarityScale'
  },
  {
    id: 'subject-object',
    name: 'Subject-Object Awareness',
    description: 'Move unconscious patterns from subject to object. Develop meta-awareness of your operating system',
    whenToUse: [
      'Want to understand your assumptions',
      'Seeking to make unconscious patterns visible',
      'Exploring what "runs" you vs what you run'
    ],
    timeEstimate: '20 mins',
    depth: 'Deep Work',
    wizardId: 'so',
    module: 'mind',
    iconName: 'FocusAperture'
  },
  {
    id: 'role-alignment',
    name: 'Role Alignment',
    description: 'Align the roles you play (parent, professional, friend) with your deeper values and authentic self',
    whenToUse: [
      'Experiencing identity confusion',
      'Feeling fragmented across roles',
      'Wanting authenticity in your roles'
    ],
    timeEstimate: '25-30 mins',
    depth: 'Deep Work',
    wizardId: 'role-alignment',
    module: 'mind',
    iconName: 'IdentityPrism'
  },
  {
    id: 'eight-zones',
    name: '8 Zones of Knowing',
    description: 'Integral methodological pluralism framework. Map your relationship to 8 ways of knowing',
    whenToUse: [
      'Want to balance intuition, logic, emotion, and somatic awareness',
      'Exploring integral approaches to knowledge',
      'Seeking multi-perspective framework for understanding'
    ],
    timeEstimate: '30-45 mins',
    depth: 'Deep Work',
    wizardId: 'eight-zones',
    module: 'mind',
    iconName: 'HyperTesseract'
  },
  {
    id: 'adaptive-cycle',
    name: 'Adaptive Cycle',
    description: 'Map your system across growth and renewal phases. Navigate change cycles with resilience',
    whenToUse: [
      'In transition or major life change',
      'Experiencing crisis or breakdown',
      'Want to understand where you are in renewal cycle'
    ],
    timeEstimate: '20-30 mins',
    depth: 'Practice',
    wizardId: 'adaptive-cycle',
    module: 'mind',
    iconName: 'PhaseWheel'
  },
  {
    id: 'decision-wizard',
    name: 'Decision Wizard',
    description: 'Navigate complex life decisions through structured reflection and values clarification',
    whenToUse: [
      'Facing a major life decision',
      'Weighing competing options with no clear answer',
      'Want structured framework for decision-making'
    ],
    timeEstimate: '15-20 mins',
    depth: 'Practice',
    wizardId: 'decision-wizard',
    module: 'mind',
    iconName: 'DecisionFork'
  },
  {
    id: 'moral-reasoning',
    name: 'Moral Reasoning',
    description: 'Explore ethical dilemmas through multiple moral frameworks to develop nuanced judgment',
    whenToUse: [
      'Facing an ethical dilemma',
      'Want to develop moral reasoning capacity',
      'Exploring competing values and obligations'
    ],
    timeEstimate: '20-30 mins',
    depth: 'Deep Work',
    wizardId: 'moral-reasoning',
    module: 'mind',
    iconName: 'MoralCompass'
  },
  {
    id: 'integral-practice-designer',
    name: 'Integral Practice Designer',
    description: 'Design a personalized integral practice stack across Body, Mind, Spirit, and Shadow domains',
    whenToUse: [
      'Want to build a structured ILP practice plan',
      'Seeking balance across all four quadrants',
      'Need help designing a sustainable practice stack'
    ],
    timeEstimate: '25-35 mins',
    depth: 'Assessment',
    wizardId: 'integral-practice-designer',
    module: 'mind',
    iconName: 'StackArchitect'
  },
  {
    id: 'epistemic-crucible',
    name: 'Epistemic Crucible',
    description: 'Stress-test a factual belief through evidence audit and steelman. Produces an insight ready for 4-Quadrant Catalyst.',
    whenToUse: [
      'Holding a belief strongly but haven\'t actually tested it',
      'About to make a decision based on an assumption',
      'Want to generate a high-quality insight to take into 4-Quadrant Catalyst'
    ],
    timeEstimate: '20-30 mins',
    depth: 'Deep Work',
    wizardId: 'epistemic-crucible',
    module: 'mind',
    iconName: 'Crucible'
  },
  {
    id: 'bias-detective',
    name: 'Bias Detective',
    description: 'Deep-dive investigation into a specific cognitive bias you suspect is operating. Structured evidence gathering and behavioral audit.',
    whenToUse: [
      'Want to go deeper than general bias awareness',
      'Suspect a specific bias is shaping a current situation',
      'Seeking concrete examples of bias in your own behavior'
    ],
    timeEstimate: '20-30 mins',
    depth: 'Deep Work',
    wizardId: 'bias',
    module: 'mind',
    iconName: 'Algorithm'
  },
  {
    id: 'coherence-audit',
    name: 'Coherence Audit',
    description: 'Stress-test your espoused values against your actual behaviors. Surface the gap between who you say you are and how you actually operate.',
    whenToUse: [
      'Feeling a nagging sense of inauthenticity',
      'Want to identify where values and actions diverge',
      'Seeking honest reckoning with your behavioral patterns'
    ],
    timeEstimate: '25-40 mins',
    depth: 'Deep Work',
    wizardId: 'coherence-audit',
    module: 'mind',
    iconName: 'CelticContinuum'
  },
  {
    id: 'daily-checkin',
    name: 'Daily Check-In',
    description: 'Structured 5-step daily integration practice. Anchor your day with somatic awareness, intention, and reflective clarity.',
    whenToUse: [
      'Beginning or ending your day with intention',
      'Want a brief daily practice that builds over time',
      'Seeking to integrate emotional and cognitive states'
    ],
    timeEstimate: '10-15 mins',
    depth: 'Practice',
    wizardId: 'daily-checkin',
    module: 'mind',
    iconName: 'CircadianWave'
  },
  {
    id: 'defusion-lab',
    name: 'Defusion Lab',
    description: 'ACT-based cognitive defusion for sticky thoughts. Change your relationship to repetitive mental patterns through 3-5 minute structured sessions.',
    whenToUse: [
      'A thought keeps returning and feels too real',
      'Want to create distance from a mental narrative',
      'Practicing ACT or interested in cognitive flexibility'
    ],
    timeEstimate: '5-15 mins',
    depth: 'Practice',
    wizardId: 'defusion-lab',
    module: 'mind',
    iconName: 'DefusionPrism'
  },
  {
    id: 'enneagram-compass',
    name: 'Enneagram Compass',
    description: 'Tri-centric Enneagram assessment across Gut, Heart, and Head triads. Discover your type, wing, and instinctual variants.',
    whenToUse: [
      'Want to understand your Enneagram type in depth',
      'Seeking to identify core motivations and fears',
      'Exploring instinctual drives across social, sexual, self-preservation lines'
    ],
    timeEstimate: '30-45 mins',
    depth: 'Assessment',
    wizardId: 'enneagram-compass',
    module: 'mind',
    iconName: 'OuroborosGate'
  },
  {
    id: 'examining-core-belief',
    name: 'Examining Core Belief',
    description: 'Structured examination of a core belief — tracing its origins, testing its evidence, and updating its hold on your identity.',
    whenToUse: [
      'A belief about yourself or the world feels limiting',
      'Want to understand where a deep assumption comes from',
      'Seeking to loosen the grip of a long-held narrative'
    ],
    timeEstimate: '25-35 mins',
    depth: 'Deep Work',
    wizardId: 'examining-core-belief',
    module: 'mind',
    iconName: 'RecursionWell'
  },
  {
    id: 'interpretation-lens',
    name: 'Interpretation Lens',
    description: 'Cognitive Bias Modification for growth-oriented interpretations. Retrain automatic meaning-making toward adaptive patterns.',
    whenToUse: [
      'Noticing habitual negative interpretations of ambiguous events',
      'Want to shift automatic attribution patterns',
      'Interested in CBM-based cognitive flexibility training'
    ],
    timeEstimate: '15-20 mins',
    depth: 'Practice',
    wizardId: 'cbm-interpretation-lens',
    module: 'mind',
    iconName: 'TransformativeArc'
  },
  {
    id: 'life-architecture',
    name: 'Life Architecture',
    description: 'Redesign the structural conditions of your life — schedule, environment, relationships, and commitments — around your deepest values.',
    whenToUse: [
      'Feeling misaligned between daily structure and what matters most',
      'Wanting to design your life intentionally rather than by default',
      'In a transition and building a new life architecture'
    ],
    timeEstimate: '35-50 mins',
    depth: 'Deep Work',
    wizardId: 'life-arch',
    module: 'mind',
    iconName: 'WorldEngine'
  },
  {
    id: 'phenomenon-mapper',
    name: 'Phenomenon Mapper',
    description: 'Source and map a phenomenon in your experience through AI Socratic challenge. Build a rigorous map of what is actually happening.',
    whenToUse: [
      'Want to understand the structure of a recurring experience',
      'Seeking precision and clarity about something you\'re living through',
      'Interested in phenomenological inquiry'
    ],
    timeEstimate: '20-30 mins',
    depth: 'Deep Work',
    wizardId: 'phenomenon-mapper',
    module: 'mind',
    iconName: 'StructuralLattice'
  },
  {
    id: 'reality-tunnel',
    name: 'Reality Tunnel',
    description: 'Explore and flex your epistemic reality tunnel. Map the beliefs and filters that shape what you perceive as real.',
    whenToUse: [
      'Curious about your own epistemic filters and blind spots',
      'Want to test the flexibility of your worldview',
      'Exploring how your belief system shapes your perception'
    ],
    timeEstimate: '20-30 mins',
    depth: 'Deep Work',
    wizardId: 'reality-tunnel',
    module: 'mind',
    iconName: 'VesicaSacra'
  }
];

// ============================================================================
// SHADOW TOOLS (Purple Module)
// ============================================================================

export const shadowTools: Tool[] = [
  {
    id: '3-2-1-process',
    name: '3-2-1 Process',
    description: 'Transform reactive emotions into integrated wisdom. Work with strong feelings toward someone or something',
    whenToUse: [
      'Strong emotional reaction to someone',
      'Triggered or activated by external event',
      'Want to integrate shadow material'
    ],
    timeEstimate: '20-30 mins',
    depth: 'Deep Work',
    wizardId: '321',
    module: 'shadow',
    iconName: 'UmbraFragment'
  },
  {
    id: 'ifs-process',
    name: 'IFS (Internal Family Systems)',
    description: 'Map and dialogue with your inner parts. Resolve inner conflict and self-sabotage patterns',
    whenToUse: [
      'Experiencing inner conflict',
      'Self-sabotaging despite conscious intent',
      'Want to understand your inner ecosystem'
    ],
    timeEstimate: '30-45 mins',
    depth: 'Deep Work',
    wizardId: 'ifs',
    module: 'shadow',
    iconName: 'QuantumEntanglement'
  },
  {
    id: 'memory-recon',
    name: 'Memory Reconsolidation',
    description: 'Reprocess and update painful memories. Transform stuck traumatic memories into integrated wisdom',
    whenToUse: [
      'Stuck memory that keeps replaying',
      'Traumatic event still activates nervous system',
      'Want to update implicit memory'
    ],
    timeEstimate: '20-30 mins',
    depth: 'Deep Work',
    wizardId: 'memory-reconsolidation',
    module: 'shadow',
    iconName: 'EchoSphere'
  },
  {
    id: 'shadow-journaling',
    name: 'Shadow Journaling',
    description: 'Free-form shadow exploration. Unstructured journaling to access and integrate shadow material',
    whenToUse: [
      'Want general shadow work without structure',
      'Exploring disowned parts of self',
      'Processing difficult material'
    ],
    timeEstimate: '15-30 mins',
    depth: 'Deep Work',
    wizardId: 'shadow-journaling',
    module: 'shadow',
    iconName: 'VoidBloom'
  },
  {
    id: 'axis',
    name: 'AXIS',
    description: 'Turn AI into a focused analyst. Frame your session, go deep, generate a brief to continue next time',
    whenToUse: [
      'Need AI-powered analysis on complex topics',
      'Want structured exploration with continuity',
      'Seeking deep insights with external dialogue'
    ],
    timeEstimate: '20-40 mins',
    depth: 'Deep Work',
    wizardId: 'axis',
    module: 'shadow',
    iconName: 'ParadoxGate'
  },
  {
    id: 'psychedelic-hub',
    name: 'Psychedelic Journeys',
    description: 'Comprehensive support for psychedelic experiences: preparation with intention-setting and safety planning, plus integration with narrative processing and meaning-making',
    whenToUse: [
      'Planning or integrating a psychedelic experience',
      'Need preparation guidance and safety support',
      'Seeking meaning-making from a transformative experience'
    ],
    timeEstimate: '30-45 mins',
    depth: 'Deep Work',
    wizardId: 'psychedelic-hub',
    module: 'shadow',
    iconName: 'Merkaba'
  },
  {
    id: 'golden-shadow',
    name: 'Golden Shadow Reclamation',
    description: 'Reclaim your projected positive qualities from admired figures',
    whenToUse: [
      'Admiring or idealizing someone',
      'Want to own your own projected strengths',
      'Exploring positive shadow material'
    ],
    timeEstimate: '20-30 mins',
    depth: 'Deep Work',
    wizardId: 'golden-shadow',
    module: 'shadow',
    iconName: 'VoidEclipse'
  },
  {
    id: 'attachment-practice',
    name: 'Attachment Practice',
    description: 'Rewire relational patterns through targeted attachment style work',
    whenToUse: [
      'Experiencing relational anxiety or avoidance',
      'Want to heal attachment wounds',
      'Seeking secure functioning in relationships'
    ],
    timeEstimate: '20-30 mins',
    depth: 'Deep Work',
    wizardId: 'attachment-practice',
    module: 'shadow',
    iconName: 'DyadBridge'
  },
  {
    id: 'dbt-coach',
    name: 'DBT Skills Coach',
    description: 'Learn and practice Dialectical Behavior Therapy skills for emotional regulation, distress tolerance, and interpersonal effectiveness',
    whenToUse: [
      'Struggling with emotional dysregulation',
      'Want concrete skills for distress tolerance',
      'Seeking to improve interpersonal effectiveness'
    ],
    timeEstimate: '20-40 mins',
    depth: 'Practice',
    wizardId: 'dbt-coach',
    module: 'shadow',
    iconName: 'PatternMandala'
  },
  {
    id: 'therapy-style',
    name: 'Therapy Style Assessment',
    description: 'Discover which psychotherapy approaches align with your situation, goals, and preferences across 10 modalities',
    whenToUse: [
      'Exploring therapy options',
      'Want personalized therapy style recommendations',
      'Curious which modality fits your situation'
    ],
    timeEstimate: '10-15 mins',
    depth: 'Assessment',
    wizardId: 'therapy-style',
    module: 'shadow',
    iconName: 'AstralCompass'
  },
  {
    id: 'relational',
    name: 'Relational Pattern Tracker',
    description: 'Explore how you show up in different relationships and uncover unconscious fears and needs driving automatic behaviors',
    whenToUse: [
      'Noticing recurring relational conflicts',
      'Want to understand your patterns across contexts',
      'Seeking insight into reactive relationship behaviors'
    ],
    timeEstimate: '20-30 mins',
    depth: 'Deep Work',
    wizardId: 'relational',
    module: 'shadow',
    iconName: 'RelationalWeb'
  },
  {
    id: 'schema-detective',
    name: 'Schema Detective',
    description: 'Identify Early Maladaptive Schemas—deep emotional patterns from childhood that dictate your reactions and relationships',
    whenToUse: [
      'Experiencing recurring emotional triggers',
      'Want to understand deep relationship patterns',
      'Seeking to identify childhood emotional blueprints'
    ],
    timeEstimate: '45 mins',
    depth: 'Deep Work',
    wizardId: 'schema-detective',
    module: 'shadow',
    iconName: 'EngramArchive'
  },
  {
    id: 'schema-reflection',
    name: 'Schema Reflection',
    description: 'Explore emotional blueprints through curated schemas. Self-rate resonance and journal about patterns that shape your life',
    whenToUse: [
      'After Schema Detective, want to go deeper',
      'Exploring one specific emotional pattern',
      'Seeking therapeutic insight into a schema'
    ],
    timeEstimate: '30-45 mins',
    depth: 'Deep Work',
    wizardId: 'schema-reflection',
    module: 'shadow',
    iconName: 'CrystalLattice'
  },
  {
    id: 'mourning-field',
    name: 'Mourning Field',
    description: 'A grounded grief companion drawing from the Dual Process Model, meaning reconstruction, and CFT self-compassion. Holds space for loss without rushing resolution.',
    whenToUse: [
      'Processing grief, loss, or bereavement',
      'Oscillating between loss-focused and restoration-focused mourning',
      'Seeking non-pathologizing support for grief'
    ],
    timeEstimate: '30-60 mins',
    depth: 'Deep Work',
    wizardId: 'mourning-field',
    module: 'shadow',
    iconName: 'PsychopompLantern'
  },
  {
    id: 'cultural-shadow',
    name: 'Cultural Shadow Excavator',
    description: 'Excavate deeply conditioned cultural scripts, lineage patterns, and collective shadow material inherited from family, religion, class, and origin.',
    whenToUse: [
      'Exploring cultural conditioning and inherited belief systems',
      'Investigating lineage trauma or collective shadow',
      'Seeking to understand how cultural identity shapes shadow material'
    ],
    timeEstimate: '30-45 mins',
    depth: 'Deep Work',
    wizardId: 'cultural-shadow',
    module: 'shadow',
    iconName: 'KalachakraMaw'
  },
  {
    id: 'relational-blueprint',
    name: 'Relational Blueprint',
    description: 'Map the cast of characters in a relational pattern, trace its somatic signature, and excavate the origin wound shaping your relational blueprint.',
    whenToUse: [
      'The same relational dynamic keeps appearing across different relationships',
      'Want to understand where a pattern originates — not just manage it',
      'Seeking somatic and historical depth in relational work'
    ],
    timeEstimate: '35-50 mins',
    depth: 'Deep Work',
    wizardId: 'relational-blueprint',
    module: 'shadow',
    iconName: 'NeuralConvergence'
  },
  {
    id: 'relational-field',
    name: 'Relational Field Mapper',
    description: 'Map the full relational field around a significant relationship or dynamic. Surface the systemic forces, roles, and patterns at play.',
    whenToUse: [
      'Wanting a systemic view of a relationship or group dynamic',
      'Sensing invisible forces shaping a relational situation',
      'Working with family systems or organizational dynamics'
    ],
    timeEstimate: '25-40 mins',
    depth: 'Deep Work',
    wizardId: 'relational-field',
    module: 'shadow',
    iconName: 'SynapseNetwork'
  }
];

// ============================================================================
// BODY TOOLS (Emerald Module)
// ============================================================================

export const bodyTools: Tool[] = [
  {
    id: 'body-architect',
    name: 'Integral Body Architect',
    description: 'Generate personalized training plan combining yang (strength, power) and yin (mobility, restoration)',
    whenToUse: [
      'Want structured fitness plan aligned with ILP',
      'Seeking balance between intensity and recovery',
      'Need integral approach to physical development'
    ],
    timeEstimate: '20-30 mins',
    depth: 'Assessment',
    wizardId: 'integral-body-architect',
    module: 'body',
    iconName: 'VesselFrame'
  },
  {
    id: 'dynamic-workout',
    name: 'Dynamic Workout Architect',
    description: 'Create adaptive workout programs. Generate specific sessions with progression and variation',
    whenToUse: [
      'Need workout variety and progression',
      'Want AI-guided training design',
      'Seeking personalized exercise programming'
    ],
    timeEstimate: '15-20 mins',
    depth: 'Practice',
    wizardId: 'dynamic-workout-architect',
    module: 'body',
    iconName: 'PulseMatrix'
  },
  {
    id: 'somatic-practice',
    name: 'Somatic Practice & Embodiment',
    description: 'Embodiment and nervous system regulation. Return to body awareness and reset your nervous system',
    whenToUse: [
      'Feeling disconnected from body',
      'Dysregulated nervous system',
      'Want to deepen body awareness'
    ],
    timeEstimate: '15-25 mins',
    depth: 'Practice',
    wizardId: 'somatic',
    module: 'body',
    iconName: 'SomaticPillar'
  },
  {
    id: 'bioenergetics',
    name: 'Bioenergetics & Breathing',
    description: 'Breathwork for energy and release. Shift your energetic state through conscious breathing',
    whenToUse: [
      'Need to shift energy state',
      'Want to release physical tension',
      'Seeking nervous system regulation through breath'
    ],
    timeEstimate: '10-20 mins',
    depth: 'Practice',
    wizardId: 'bioenergetics',
    module: 'body',
    iconName: 'ResonanceField'
  },
  {
    id: 'scarlett',
    name: 'Scarlett',
    description: 'Expert guidance on sexual health, desire, pleasure, and embodiment (18+ only). Private conversations with Dr. Vex.',
    whenToUse: [
      'Seeking guidance on sexual health and desire',
      'Want to explore pleasure and embodiment',
      'Interested in somatic sexuality practices'
    ],
    timeEstimate: '20-30 mins',
    depth: 'Deep Work',
    wizardId: 'sexology-coach',
    module: 'body',
    iconName: 'RosaCrucis'
  },
  {
    id: 'interoception',
    name: 'Interoception Training',
    description: 'Develop sensitivity to internal body signals and somatic wisdom through guided interoceptive awareness practices',
    whenToUse: [
      'Feeling disconnected from body signals',
      'Want to deepen interoceptive awareness',
      'Seeking to trust somatic wisdom'
    ],
    timeEstimate: '15-25 mins',
    depth: 'Practice',
    wizardId: 'interoception',
    module: 'body',
    iconName: 'SomaThread'
  },
  {
    id: 'chronobiology',
    name: 'Chronobiology Protocol',
    description: 'Map your energy and focus rhythms over 5 days, identify biological performance windows, audit schedule mismatches, and redesign your week around your biology.',
    whenToUse: [
      'Feeling chronically fatigued or fighting your own energy patterns',
      'Want to align your schedule with your biological rhythms',
      'Seeking to optimize cognitive and physical performance through timing'
    ],
    timeEstimate: '25-35 mins',
    depth: 'Assessment',
    wizardId: 'chronobiology',
    module: 'body',
    iconName: 'CircadianWave'
  },
  {
    id: 'polyvagal-trainer',
    name: 'Polyvagal Trainer',
    description: 'Assess your current autonomic state (dorsal/sympathetic/ventral), receive AI co-regulation, and build a ventral vagal anchor through targeted interventions.',
    whenToUse: [
      'Stuck in freeze, shutdown, or chronic fight-or-flight',
      'Want to understand your autonomic nervous system patterns',
      'Seeking to build reliable ventral vagal regulation capacity'
    ],
    timeEstimate: '20-30 mins',
    depth: 'Practice',
    wizardId: 'polyvagal-trainer',
    module: 'body',
    iconName: 'AetherBreath'
  },
  {
    id: 'quantified-self',
    name: 'Quantified Self',
    description: 'Integral embodiment tracking and body quantification. Build a data-informed picture of your physical patterns, cycles, and performance.',
    whenToUse: [
      'Want to track body patterns and metrics within an integral framework',
      'Seeking evidence-based insight into your physical rhythms',
      'Combining self-tracking with embodied self-knowledge'
    ],
    timeEstimate: '20-30 mins',
    depth: 'Assessment',
    wizardId: 'quantified-self',
    module: 'body',
    iconName: 'SenseMandala'
  }
];

// ============================================================================
// SPIRIT TOOLS (Amber Module)
// ============================================================================

export const spiritTools: Tool[] = [
  {
    id: 'meditation-finder',
    name: 'Meditation Practice Finder',
    description: 'Discover your ideal meditation style from 12+ traditions and approaches',
    whenToUse: [
      'New to meditation',
      'Want to find your practice',
      'Seeking meditation style that resonates'
    ],
    timeEstimate: '15-20 mins',
    depth: 'Assessment',
    wizardId: 'meditation',
    module: 'spirit',
    iconName: 'AstralCompass'
  },
  {
    id: 'big-mind',
    name: 'Big Mind Process',
    description: 'Voice dialogue with archetypal perspectives. Access transcendent wisdom and integrated perspectives',
    whenToUse: [
      'Want transpersonal perspective shift',
      'Seeking voice of wisdom or compassion',
      'Exploring non-dual consciousness'
    ],
    timeEstimate: '20-30 mins',
    depth: 'Deep Work',
    wizardId: 'big-mind',
    module: 'spirit',
    iconName: 'OuroborosGate'
  },
  {
    id: 'jhana-guide',
    name: 'Jhana/Samadhi Guide',
    description: 'Concentration meditation training. Navigate the four jhana states and deep absorption states',
    whenToUse: [
      'Want to deepen meditative absorption',
      'Interested in concentration practices',
      'Seeking to access samadhi states'
    ],
    timeEstimate: '25-45 mins',
    depth: 'Deep Work',
    wizardId: 'jhana',
    module: 'spirit',
    iconName: 'SeedOfLife'
  },
  {
    id: 'consciousness-graph',
    name: 'Consciousness Development Graph',
    description: 'Map your consciousness development. Assess your stage and trajectory of spiritual development',
    whenToUse: [
      'Want to understand spiritual development stage',
      'Curious about consciousness evolution',
      'Seeking framework for integral spirituality'
    ],
    timeEstimate: '20-30 mins',
    depth: 'Assessment',
    wizardId: 'consciousness-graph',
    module: 'spirit',
    iconName: 'OrbitEclipse'
  },
  {
    id: 'insight-map',
    name: 'Insight Practice Map',
    description: 'Navigate insight meditation practices. Explore vipassana traditions and penetrative wisdom practices',
    whenToUse: [
      'Working with vipassana or insight traditions',
      'Want guidance on insight practice',
      'Seeking to deepen wisdom through seeing'
    ],
    timeEstimate: '25-40 mins',
    depth: 'Deep Work',
    wizardId: 'insight-practice-map',
    module: 'spirit',
    iconName: 'OuroborosKey'
  },
  {
    id: 'tree-of-life',
    name: 'Tree of Life Coaching',
    description: 'Kabbalistic coaching through the 11 Sephirot. Explore consciousness development via archetypal wisdom',
    whenToUse: [
      'Seeking archetypal developmental guidance',
      'Working with Kabbalistic frameworks',
      'Want perspective shift through Sephirotic lenses'
    ],
    timeEstimate: '20-45 mins',
    depth: 'Deep Work',
    wizardId: 'tree-of-life',
    module: 'spirit',
    iconName: 'TwinPillars'
  },
  {
    id: 'advaita-master',
    name: 'Advaita Master Coach',
    description: 'Non-dual philosophy transmission. Direct pointing to the nature of Self through Advaita Vedanta inquiry',
    whenToUse: [
      'Seeking non-dual philosophy guidance',
      'Want direct pointing to the Self',
      'Exploring dissolution of seeker through inquiry'
    ],
    timeEstimate: '20-40 mins',
    depth: 'Deep Work',
    wizardId: 'advaita',
    module: 'spirit',
    iconName: 'NonDualEye'
  },
  {
    id: 'states-training',
    name: 'States Training',
    description: 'Access and stabilize altered states of consciousness through structured practice sequences',
    whenToUse: [
      'Want to reliably access elevated states',
      'Seeking to stabilize meditative experiences',
      'Exploring state-based spiritual practices'
    ],
    timeEstimate: '20-30 mins',
    depth: 'Practice',
    wizardId: 'states-training',
    module: 'spirit',
    iconName: 'AscensionFlame'
  },
  {
    id: 'contemplative-inquiry',
    name: 'Contemplative Inquiry',
    description: 'Explore the deepest questions through sustained open inquiry and phenomenological reporting',
    whenToUse: [
      'Want to sit with big existential questions',
      'Seeking phenomenological self-exploration',
      'Interested in inquiry-based practice'
    ],
    timeEstimate: '20-30 mins',
    depth: 'Deep Work',
    wizardId: 'contemplative-inquiry',
    module: 'spirit',
    iconName: 'InquiryVortex'
  },
  {
    id: 'ultimate-concern',
    name: 'Ultimate Concern',
    description: 'Clarify what you\'re ultimately committed to and willing to sacrifice for — your deepest value and ground of being',
    whenToUse: [
      'Seeking clarity on your deepest values',
      'Feeling disconnected from meaning and purpose',
      'Want to identify your ultimate ground of commitment'
    ],
    timeEstimate: '20-30 mins',
    depth: 'Deep Work',
    wizardId: 'ultimate-concern',
    module: 'spirit',
    iconName: 'AstralCompass'
  },
  {
    id: '4-quadrant-catalyst',
    name: '4-Quadrant Catalyst',
    description: 'Anchor a validated insight into concrete reality across body, relationships, and environment. The execution layer for insights produced by other Mind tools.',
    whenToUse: [
      'You have a clear insight but aren\'t acting on it',
      'Just completed Epistemic Crucible and have a belief to act on',
      'Want a 72-hour action plan grounded in somatic and structural change'
    ],
    timeEstimate: '15 mins',
    depth: 'Practice',
    wizardId: '4-quadrant-catalyst',
    module: 'spirit',
    iconName: 'TransformativeArc'
  },
  {
    id: 'tonglen',
    name: 'Tonglen',
    description: 'Tibetan compassion meditation with expanding circles. Breathe in suffering, breathe out relief — for yourself, loved ones, and all beings.',
    whenToUse: [
      'Want to cultivate deep compassion through formal practice',
      'Feeling contracted around suffering — your own or others\'',
      'Seeking a contemplative practice rooted in Tibetan Buddhism'
    ],
    timeEstimate: '20-35 mins',
    depth: 'Deep Work',
    wizardId: 'tonglen',
    module: 'spirit',
    iconName: 'AethonBloom'
  },
  {
    id: 'generativity-map',
    name: 'Generativity Map',
    description: 'Erikson Stage 7 work — map your contribution, legacy, and the ways you\'re showing up for the next generation. Transform stagnation into generativity.',
    whenToUse: [
      'Feeling stagnant, purposeless, or disconnected from contribution',
      'Want to understand your legacy and impact',
      'Working through midlife questions of meaning and generativity'
    ],
    timeEstimate: '25-40 mins',
    depth: 'Deep Work',
    wizardId: 'generativity-map',
    module: 'spirit',
    iconName: 'EvolutionaryUnfolding'
  },
  {
    id: 'inner-compass',
    name: 'Inner Compass',
    description: 'Fishbowl multi-perspective reflection with metaphor and breath overlay. Access inner guidance through structured contemplative inquiry.',
    whenToUse: [
      'Seeking inner guidance on a life question',
      'Want to access multiple inner voices in structured dialogue',
      'Looking for clarity through contemplative self-reflection'
    ],
    timeEstimate: '20-30 mins',
    depth: 'Deep Work',
    wizardId: 'inner-compass',
    module: 'spirit',
    iconName: 'InfiniteBridge'
  },
  {
    id: 'integral-civic-practice',
    name: 'Integral Civic Practice',
    description: 'Coaching for civic engagement, contribution, and commitment. Identify your civic path and build commitments grounded in integral values.',
    whenToUse: [
      'Want to deepen your civic engagement from an integral perspective',
      'Seeking clarity on how to contribute to collective transformation',
      'Working on the intersection of inner development and outer action'
    ],
    timeEstimate: '25-40 mins',
    depth: 'Practice',
    wizardId: 'integral-civic-practice',
    module: 'spirit',
    iconName: 'ConsciousNode'
  },
  {
    id: 'archetypal-contemplation',
    name: 'Archetypal Contemplation',
    description: 'Major Arcana contemplation — draw a Tarot archetype and harvest its wisdom through 1st, 2nd, and 3rd person perspectives and multi-voice resonance.',
    whenToUse: [
      'Want to work with archetypal energies and symbols',
      'Seeking transpersonal insight through Major Arcana imagery',
      'Exploring Tarot as a contemplative and developmental mirror'
    ],
    timeEstimate: '25-40 mins',
    depth: 'Deep Work',
    wizardId: 'archetypal-contemplation',
    module: 'spirit',
    iconName: 'Abrahadabra'
  },
  {
    id: 'return-of-ritual',
    name: 'Return of Ritual',
    description: 'Reframe routine into metamodern ritual. Move beyond postmodern irony to reclaim the power of intentional practice and sacred structure.',
    whenToUse: [
      'Feeling disconnected from meaningful routine or structure',
      'Interested in the psychological and spiritual function of ritual',
      'Wanting to build practices with genuine depth and intention'
    ],
    timeEstimate: '25-40 mins',
    depth: 'Practice',
    wizardId: 'return-of-ritual',
    module: 'spirit',
    iconName: 'DharmaLotus'
  },
  {
    id: 'structure-of-feeling',
    name: 'Structure of Feeling',
    description: 'Compare philosophical and psychological frameworks for understanding your felt experience. Generate practices from the frameworks that resonate most.',
    whenToUse: [
      'Want to understand your experience through multiple frameworks',
      'Seeking a bridge between intellectual understanding and lived practice',
      'Interested in comparing contemplative or philosophical models'
    ],
    timeEstimate: '30-45 mins',
    depth: 'Deep Work',
    wizardId: 'structure-of-feeling',
    module: 'spirit',
    iconName: 'ApophaticFrame'
  }
];

// ============================================================================
// MODULE DEFINITIONS
// ============================================================================

export const modules: Module[] = [
  {
    id: 'mind',
    label: 'Mind Tools',
    description: 'Cognitive development, emotional patterns, and meaning-making',
    color: 'blue',
    count: mindTools.length,
    tools: mindTools
  },
  {
    id: 'shadow',
    label: 'Shadow Tools',
    description: 'Integration, transformation, and healing of disowned material',
    color: 'purple',
    count: shadowTools.length,
    tools: shadowTools
  },
  {
    id: 'body',
    label: 'Body Tools',
    description: 'Physical development, nervous system regulation, and embodiment',
    color: 'emerald',
    count: bodyTools.length,
    tools: bodyTools
  },
  {
    id: 'spirit',
    label: 'Spirit Tools',
    description: 'Consciousness development, meditation, and transcendent wisdom',
    color: 'amber',
    count: spiritTools.length,
    tools: spiritTools
  }
];

// ============================================================================
// COLOR MAPPING
// ============================================================================

export const colorMap = {
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    borderActive: 'border-blue-500/60',
    text: 'text-blue-300',
    textHover: 'text-blue-400',
    ctaButton: 'bg-blue-600 hover:bg-blue-700'
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    borderActive: 'border-purple-500/60',
    text: 'text-purple-300',
    textHover: 'text-purple-400',
    ctaButton: 'bg-purple-600 hover:bg-purple-700'
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    borderActive: 'border-emerald-500/60',
    text: 'text-emerald-300',
    textHover: 'text-emerald-400',
    ctaButton: 'bg-emerald-600 hover:bg-emerald-700'
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    borderActive: 'border-amber-500/60',
    text: 'text-amber-300',
    textHover: 'text-amber-400',
    ctaButton: 'bg-amber-600 hover:bg-amber-700'
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getToolById(toolId: string): Tool | undefined {
  return [...mindTools, ...shadowTools, ...bodyTools, ...spiritTools].find(
    tool => tool.id === toolId
  );
}

export function getModuleById(moduleId: ModuleId): Module | undefined {
  return modules.find(m => m.id === moduleId);
}

export function getAllTools(): Tool[] {
  return [...mindTools, ...shadowTools, ...bodyTools, ...spiritTools];
}
