/**
 * Structured data for the Metamodern Bridge Builder learning tab
 * Maps Integral anchors (quadrants, lines, states, polarities) to metamodern frameworks
 */

export interface AnchorCategory {
  id: 'quadrant' | 'line' | 'state' | 'polarity';
  label: string;
  description: string;
  accent: string;
  icon: string;
}

export interface IntegralAnchor {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  categoryId: AnchorCategory['id'];
  orientation: string;
  guidingQuestion: string;
  color: string;
}

export interface MetamodernFramework {
  id: string;
  name: string;
  author: string;
  tagline: string;
  shortDescription: string;
  gradient: string;
  color: string;
  icon: string;
  pillars: string[];
  tensions: string[];
  bridgeMoves: string[];
}

export interface BridgeNarrative {
  anchorId: string;
  frameworkId: string;
  headline: string;
  bridgeStatement: string;
  tension: string;
  synergy: string;
  practiceCue: string;
  keyInsight: string;
  signal: 'synergy' | 'tension' | 'translation';
  tags: string[];
}

export interface BridgeRecipe {
  id: string;
  title: string;
  description: string;
  duration: string;
  anchors: string[];
  frameworks: string[];
  steps: string[];
  payoff: string;
  tags: string[];
}

export const anchorCategories: AnchorCategory[] = [
  {
    id: 'quadrant',
    label: 'Quadrants',
    description: 'Interior/exterior and individual/collective lenses that keep us from collapsing reality into one angle.',
    accent: 'from-rose-500 via-purple-500 to-indigo-500',
    icon: '🧭'
  },
  {
    id: 'line',
    label: 'Lines',
    description: 'Specific capacities (cognitive, emotional, moral…) that develop at different speeds.',
    accent: 'from-cyan-500 via-sky-500 to-blue-500',
    icon: '📈'
  },
  {
    id: 'state',
    label: 'States',
    description: 'Temporary windows of consciousness that can be trained into traits.',
    accent: 'from-amber-500 via-violet-500 to-slate-600',
    icon: '🌌'
  },
  {
    id: 'polarity',
    label: 'Polarities',
    description: 'Essential tensions (agency ↔ communion, order ↔ emergence) that must be danced, not solved.',
    accent: 'from-emerald-500 via-teal-400 to-lime-500',
    icon: '♾️'
  }
];

export const integralAnchors: IntegralAnchor[] = [
  {
    id: 'quadrant-i',
    label: 'I / Interior-Individual',
    shortLabel: 'I',
    description: 'Subjective felt-sense, intentions, states, shadow work.',
    categoryId: 'quadrant',
    orientation: 'Track the quality of your attention moment-to-moment.',
    guidingQuestion: 'What is alive in me right now?',
    color: 'text-rose-300'
  },
  {
    id: 'quadrant-we',
    label: 'WE / Interior-Collective',
    shortLabel: 'WE',
    description: 'Shared meaning, culture, language, norms.',
    categoryId: 'quadrant',
    orientation: 'Notice how the stories and myths of a group shape options.',
    guidingQuestion: 'What agreements are we breathing in?',
    color: 'text-indigo-300'
  },
  {
    id: 'quadrant-it',
    label: 'IT / Exterior-Individual',
    shortLabel: 'IT',
    description: 'Observable behavior, physiology, skills.',
    categoryId: 'quadrant',
    orientation: 'Map what can actually be seen, measured, repeated.',
    guidingQuestion: 'How does this show up in action?',
    color: 'text-green-300'
  },
  {
    id: 'quadrant-its',
    label: 'ITS / Exterior-Collective',
    shortLabel: 'ITS',
    description: 'Systems, institutions, infrastructure, ecology.',
    categoryId: 'quadrant',
    orientation: 'See the incentives and architectures shaping behavior.',
    guidingQuestion: 'What system is generating this pattern?',
    color: 'text-orange-300'
  },
  {
    id: 'line-cognitive',
    label: 'Cognitive Line',
    shortLabel: 'Cognitive',
    description: 'Meaning-making complexity, perspective-taking, meta-cognition.',
    categoryId: 'line',
    orientation: 'Stretch thinking to hold conflicting truths simultaneously.',
    guidingQuestion: 'How many perspectives can I genuinely include?',
    color: 'text-sky-300'
  },
  {
    id: 'line-emotional',
    label: 'Emotional Line',
    shortLabel: 'Emotional',
    description: 'Affect regulation, somatic literacy, empathy bandwidth.',
    categoryId: 'line',
    orientation: 'Feel signals before reacting; grow range and nuance.',
    guidingQuestion: 'What is this emotion trying to teach?',
    color: 'text-pink-300'
  },
  {
    id: 'line-moral',
    label: 'Moral Line',
    shortLabel: 'Moral',
    description: 'Circle of care, ethics, responsibility for the commons.',
    categoryId: 'line',
    orientation: 'Expand who counts and how you steward power.',
    guidingQuestion: 'Who else is affected and how do I care for them?',
    color: 'text-amber-300'
  },
  {
    id: 'state-gross',
    label: 'Gross State',
    shortLabel: 'Gross',
    description: 'Waking awareness, sensory world, tangible logistics.',
    categoryId: 'state',
    orientation: 'Keep the body grounded and the calendar real.',
    guidingQuestion: 'What needs attention in the most obvious reality?',
    color: 'text-yellow-300'
  },
  {
    id: 'state-subtle',
    label: 'Subtle State',
    shortLabel: 'Subtle',
    description: 'Imaginal space, archetypal currents, collective field.',
    categoryId: 'state',
    orientation: 'Listen to dreams, synchronicity, artistic whispers.',
    guidingQuestion: 'What wants to be born through us?',
    color: 'text-violet-300'
  },
  {
    id: 'polarity-agency',
    label: 'Agency Polarity',
    shortLabel: 'Agency',
    description: 'Capacity to act, initiate, take a stand.',
    categoryId: 'polarity',
    orientation: 'Pair bold moves with stewardship.',
    guidingQuestion: 'How do I wield power without recreating rivalry?',
    color: 'text-emerald-300'
  },
  {
    id: 'polarity-communion',
    label: 'Communion Polarity',
    shortLabel: 'Communion',
    description: 'Belonging, togetherness, co-regulation.',
    categoryId: 'polarity',
    orientation: 'Create connection without fusion or conformity.',
    guidingQuestion: 'What strengthens the “we” without erasing the “I”?',
    color: 'text-cyan-300'
  }
];

export const metamodernFrameworks: MetamodernFramework[] = [
  {
    id: 'game-b',
    name: 'Game B',
    author: 'Jordan Hall · Jim Rutt · Nora Bateson',
    tagline: 'Anti-rivalrous civilizational OS',
    shortDescription: 'Prototype coordination primitives that outcompete Game A rivalry without collapsing into utopian fantasy.',
    gradient: 'from-indigo-600/50 via-blue-500/40 to-slate-900/60',
    color: 'text-indigo-300',
    icon: '🎮',
    pillars: ['Anti-rivalry audits', 'Sense-making stacks', 'Cooperative protocols', 'Institutional composting'],
    tensions: ['Can drift into abstract meta-talk', 'Relies on unpaid emotional labor', 'Needs embodied exemplars'],
    bridgeMoves: ['Run rivalry retros', 'Design trust accelerators', 'Prototype better default incentives']
  },
  {
    id: 'hanzi-metamodern',
    name: 'Hanzi’s Metamodernism',
    author: 'Hanzi Freinacht',
    tagline: 'Depth-stack politics & ironic sincerity',
    shortDescription: 'Six-dimensional metamodern layers that mix post-postmodern irony with earnest reconstruction.',
    gradient: 'from-fuchsia-600/50 via-purple-500/40 to-slate-900/60',
    color: 'text-fuchsia-300',
    icon: '🦋',
    pillars: ['Depth stack', 'Listening Society', 'Metamemes', 'Existential security'],
    tensions: ['Can become elitist depth cosplay', 'Hard to translate into policy'],
    bridgeMoves: ['Translate metamemes into local stories', 'Pair depth metrics with felt experience']
  },
  {
    id: 'bonnitta-process',
    name: 'Bonnitta Roy · Process Model',
    author: 'Bonnitta Roy',
    tagline: 'Fluid roles & living systems',
    shortDescription: 'Replace rigid hierarchies with living process structures that sense and respond.',
    gradient: 'from-rose-600/50 via-amber-500/40 to-slate-900/60',
    color: 'text-rose-300',
    icon: '🌀',
    pillars: ['Process leadership', 'Felt sense', 'Mesh governance', 'Collective attunement'],
    tensions: ['Hard to explain to linear cultures', 'Requires high trust & skill'],
    bridgeMoves: ['Practice field sensing', 'Rotate roles frequently', 'Make agreements living documents']
  },
  {
    id: 'nordic-bildung',
    name: 'Nordic Bildung',
    author: 'Lene Rachel Andersen · Tomas Björkman',
    tagline: 'Complexity-matching citizen development',
    shortDescription: 'Cultivate inner and civic maturity so societies can handle exponential complexity.',
    gradient: 'from-sky-600/50 via-cyan-500/40 to-slate-900/60',
    color: 'text-sky-300',
    icon: '🌲',
    pillars: ['Civic maturity', 'High-trust culture', 'Complexity literacy', 'Personal responsibility'],
    tensions: ['Hard to transplant outside Nordic context', 'Risk of paternalism'],
    bridgeMoves: ['Create Bildung labs', 'Pair freedom with responsibility contracts']
  },
  {
    id: 'proto-b',
    name: 'Proto-B Practice Fields',
    author: 'Distributed practitioners',
    tagline: 'Micro-experiments in post-capitalist relating',
    shortDescription: 'Local pods rehearsing the culture, economics, and rituals of a post-Game-A world.',
    gradient: 'from-emerald-600/50 via-teal-500/40 to-slate-900/60',
    color: 'text-emerald-300',
    icon: '🧪',
    pillars: ['Mutual aid', 'Practice guilds', 'Commons experiments', 'Embodied prototypes'],
    tensions: ['Easily burns volunteers', 'May stay niche without bridges to institutions'],
    bridgeMoves: ['Write culture READMEs', 'Design repair protocols', 'Document transferable patterns']
  }
];

export const bridgeNarratives: BridgeNarrative[] = [
  // Quadrant I --------------------------------------------------------------
  {
    anchorId: 'quadrant-i',
    frameworkId: 'game-b',
    headline: 'Inner anti-rivalry practice',
    bridgeStatement: 'Game B collapses without players who can metabolize the rivalry reflex in their own nervous system.',
    tension: 'Game B circles sometimes fetishize new protocols while under-investing in personal shadow integration.',
    synergy: 'Integral interior practices supply the emotional bandwidth Game B requires for durable cooperation.',
    practiceCue: 'Track three rivalry triggers this week and design a personal pause ritual before responding.',
    keyInsight: 'Anti-rivalry is emotional regulation, not a whitepaper.',
    signal: 'synergy',
    tags: ['shadow', 'regulation']
  },
  {
    anchorId: 'quadrant-i',
    frameworkId: 'hanzi-metamodern',
    headline: 'Depth codes start inside',
    bridgeStatement: 'Hanzi’s metamodern layers begin with subjective altitude—the I-quadrant is where ironic sincerity is actually felt.',
    tension: 'Depth metrics can turn into cosplay if they ignore raw phenomenology.',
    synergy: 'Pair AQAL state diagnostics with Hanzi’s code language to keep depth honest and embodied.',
    practiceCue: 'Name the cultural code you are running right now and describe its somatic texture.',
    keyInsight: 'Metamodern codes are first-person before they’re political.',
    signal: 'translation',
    tags: ['depth-stack', 'phenomenology']
  },
  {
    anchorId: 'quadrant-i',
    frameworkId: 'bonnitta-process',
    headline: 'Process leadership is somatic',
    bridgeStatement: 'Process structures ask leaders to feel micro-movements inside themselves before acting.',
    tension: 'Integral can stay in analytic narration while process work demands immediate sensing.',
    synergy: 'Use Integral state training to notice inner signals, then respond with Bonnitta’s “lead by listening” moves.',
    practiceCue: 'Before each meeting, scan your interior for subtle cues and speak one aloud to seed honesty.',
    keyInsight: 'Language follows felt experience, not the other way around.',
    signal: 'synergy',
    tags: ['process', 'somatics']
  },
  {
    anchorId: 'quadrant-i',
    frameworkId: 'nordic-bildung',
    headline: 'Interior Bildung portfolio',
    bridgeStatement: 'Nordic Bildung treats inner maturity as civic infrastructure; the I-quadrant is where that literacy is cultivated.',
    tension: 'Bildung institutions risk standardizing inner life unless they are rooted in personal practice.',
    synergy: 'Integral journaling and contemplative audits become evidence inside a Bildung portfolio.',
    practiceCue: 'Map one civic responsibility you hold to the interior capacities it requires and score yourself.',
    keyInsight: 'Societal resilience is upstream of inner literacy.',
    signal: 'translation',
    tags: ['bildung', 'civic']
  },
  {
    anchorId: 'quadrant-i',
    frameworkId: 'proto-b',
    headline: 'Prototype your interior OS',
    bridgeStatement: 'Proto-B labs treat inner life as open-source infrastructure—every participant experiments with new ways of being.',
    tension: 'Fast prototyping can skip integration, recreating Game A stress patterns.',
    synergy: 'Integral micro-practices (shadow check-ins, state naming) keep proto-B experiments humane.',
    practiceCue: 'Build a three-step reflection ritual for your proto-B pod and run it after each session.',
    keyInsight: 'The future culture must first boot in your nervous system.',
    signal: 'synergy',
    tags: ['proto-b', 'ritual']
  },

  // Quadrant WE ------------------------------------------------------------
  {
    anchorId: 'quadrant-we',
    frameworkId: 'game-b',
    headline: 'Culture as coordination protocol',
    bridgeStatement: 'Game B is more than tech; it’s a culture of shared myth and trust woven in the WE quadrant.',
    tension: 'Integral sometimes watches culture from afar instead of hacking it.',
    synergy: 'Use AQAL cultural diagnostics to design Game B rituals that reinforce anti-rivalry norms.',
    practiceCue: 'Host a “Game B story night” where members share moments they caught themselves slipping into Game A.',
    keyInsight: 'Culture is the executable for coordination.',
    signal: 'synergy',
    tags: ['culture', 'ritual']
  },
  {
    anchorId: 'quadrant-we',
    frameworkId: 'hanzi-metamodern',
    headline: 'Metamemes as shared myth',
    bridgeStatement: 'Hanzi’s archetypal metamemes live in intersubjective space—the WE quadrant turns abstract codes into folklore.',
    tension: 'Metamemes can become elitist in-groups if not continuously translated for diverse cultures.',
    synergy: 'Integral quadrant literacy helps adapt metamemes without losing depth.',
    practiceCue: 'Translate a metameme (e.g., Listening Society) into a story your local community would instantly feel.',
    keyInsight: 'Metamemes propagate through belonging, not essays.',
    signal: 'translation',
    tags: ['myth', 'translation']
  },
  {
    anchorId: 'quadrant-we',
    frameworkId: 'bonnitta-process',
    headline: 'Field sensing for groups',
    bridgeStatement: 'Process structures treat the group field as a living organism; the WE quadrant is the dashboard.',
    tension: 'Integral models may freeze culture into typologies, while process work wants constant sensing.',
    synergy: 'Alternate between Integral mapping sessions and Bonnitta-style silent sensing to keep teams alive.',
    practiceCue: 'Spend two minutes in collective silence before decisions and note what the field is requesting.',
    keyInsight: 'The field will tell you what wants to happen if you pause.',
    signal: 'synergy',
    tags: ['sensing', 'silence']
  },
  {
    anchorId: 'quadrant-we',
    frameworkId: 'nordic-bildung',
    headline: 'Nordic trust architecture',
    bridgeStatement: 'Nordic Bildung depends on high-trust cultures; WE-quadrant literacy explains how that trust is built and repaired.',
    tension: 'Exporting Nordic norms without reading local culture can feel colonial.',
    synergy: 'Use Integral cultural scans plus Bildung civic labs to tailor trust architecture to place.',
    practiceCue: 'Map the unwritten rules of your team; which ones build trust and which ones erode it?',
    keyInsight: 'Trust is a cultural protocol you can consciously edit.',
    signal: 'translation',
    tags: ['trust', 'culture']
  },
  {
    anchorId: 'quadrant-we',
    frameworkId: 'proto-b',
    headline: 'Guild-level belonging',
    bridgeStatement: 'Proto-B spaces prototype new forms of belonging—part guild, part studio, part friendship.',
    tension: 'Without shared meaning-making, experiments fragment into novelty chasing.',
    synergy: 'Use Integral WE diagnostics to create onboarding narratives that align personal myth with collective mission.',
    practiceCue: 'Write a short “culture README” that names vibe, taboos, and invitations for your pod.',
    keyInsight: 'Belonging is the carbon lattice that lets new practices crystallize.',
    signal: 'synergy',
    tags: ['belonging', 'onboarding']
  },

  // Quadrant IT ------------------------------------------------------------
  {
    anchorId: 'quadrant-it',
    frameworkId: 'game-b',
    headline: 'Behavior as protocol surface',
    bridgeStatement: 'Game B needs observable anti-rivalrous behaviors—how you facilitate, allocate attention, share credit.',
    tension: 'Integral can stay in analysis while Game B demands experiments.',
    synergy: 'Use AQAL IT metrics to run behavior sprints (transparent decision logs, consent rounds).',
    practiceCue: 'Record one meeting and tag behaviors that reinforced anti-rivalry versus ones that didn’t.',
    keyInsight: 'Protocols show up as habits before they show up as software.',
    signal: 'synergy',
    tags: ['behavior', 'experiments']
  },
  {
    anchorId: 'quadrant-it',
    frameworkId: 'hanzi-metamodern',
    headline: 'Enacting the depth stack',
    bridgeStatement: 'Metamodern depth must be enacted in how individuals behave under pressure.',
    tension: 'Depth talk can drift toward moral superiority if not tested in action.',
    synergy: 'Design micro-behaviors (check-ins, feedback loops) that match the layer you claim to inhabit.',
    practiceCue: 'Pick one layer and choose a concrete behavior that would exemplify it today.',
    keyInsight: 'Depth is visible in micro-actions.',
    signal: 'translation',
    tags: ['behavior', 'depth']
  },
  {
    anchorId: 'quadrant-it',
    frameworkId: 'bonnitta-process',
    headline: 'Process choreography',
    bridgeStatement: 'Bonnitta’s process structures replace rigid roles with responsive choreography of behaviors.',
    tension: 'Integral models can inadvertently reify job descriptions.',
    synergy: 'Combine process roles with Integral skill matrices to know who can flex where.',
    practiceCue: 'Rotate facilitation roles weekly and note what new intelligence emerges.',
    keyInsight: 'Structure is a verb.',
    signal: 'synergy',
    tags: ['roles', 'experiments']
  },
  {
    anchorId: 'quadrant-it',
    frameworkId: 'nordic-bildung',
    headline: 'Skillful civic action',
    bridgeStatement: 'Bildung expects citizens who can act skillfully in complex situations—observable competencies live here.',
    tension: 'Policy often measures knowledge, not embodied competence.',
    synergy: 'Pair Bildung curricula with Integral behavioral rubrics (listen, facilitate, prototype).',
    practiceCue: 'Film yourself facilitating a conversation; score it using a Bildung rubric.',
    keyInsight: 'Maturity shows through micro-behaviors under stress.',
    signal: 'translation',
    tags: ['competence', 'feedback']
  },
  {
    anchorId: 'quadrant-it',
    frameworkId: 'proto-b',
    headline: 'Embodied prototyping',
    bridgeStatement: 'Proto-B spaces hack daily habits—how money flows, how meetings run, how conflict appears.',
    tension: 'Without behavioral agreements, experiments default to Game A muscle memory.',
    synergy: 'Use Integral behavior inventories to design proto-B “behavior stacks.”',
    practiceCue: 'Redesign one habitual routine (e.g., status update) to reflect post-capitalist values.',
    keyInsight: 'The future is prototyped in mundane routines.',
    signal: 'synergy',
    tags: ['prototype', 'habits']
  },

  // Quadrant ITS -----------------------------------------------------------
  {
    anchorId: 'quadrant-its',
    frameworkId: 'game-b',
    headline: 'Institutional composting',
    bridgeStatement: 'Game B is the art of composting Game A institutions into cooperative infrastructures.',
    tension: 'Integral can stay descriptive; Game B demands redesign.',
    synergy: 'Use AQAL system mapping to identify leverage points for Game B primitives.',
    practiceCue: 'Diagram one institution you belong to and highlight rivalrous incentive loops.',
    keyInsight: 'Systems shape consciousness unless you redesign them.',
    signal: 'synergy',
    tags: ['systems', 'incentives']
  },
  {
    anchorId: 'quadrant-its',
    frameworkId: 'hanzi-metamodern',
    headline: 'Governance for depth',
    bridgeStatement: 'Hanzi’s metamodern politics asks for institutions that reward psychological depth and existential security.',
    tension: 'Integral charts systemic stages but rarely specifies policy levers.',
    synergy: 'Marry AQAL diagnostics with Hanzi’s policy stack (Listening Society, effective value-flow).',
    practiceCue: 'For a policy area, list interior/exterior impacts and propose one depth-friendly intervention.',
    keyInsight: 'Governance can be developmental scaffolding.',
    signal: 'translation',
    tags: ['policy', 'governance']
  },
  {
    anchorId: 'quadrant-its',
    frameworkId: 'bonnitta-process',
    headline: 'Fluid governance mesh',
    bridgeStatement: 'Process structures create meshworks instead of hierarchies—an ITS-level rewiring.',
    tension: 'Fluidity can slide into chaos without minimal shared agreements.',
    synergy: 'Combine Integral quadrant clarity with process principles to know when to loosen vs tighten.',
    practiceCue: 'Run a governance retro: where could your system trade static hierarchy for living agreements?',
    keyInsight: 'Structure should breathe with the context.',
    signal: 'synergy',
    tags: ['governance', 'agreements']
  },
  {
    anchorId: 'quadrant-its',
    frameworkId: 'nordic-bildung',
    headline: 'Civic scaffolding',
    bridgeStatement: 'Nordic Bildung shows how institutions can cultivate maturity at scale.',
    tension: 'High-trust Nordic models don’t transplant easily.',
    synergy: 'Integral mapping reveals cultural preconditions; Bildung offers program design once readiness is there.',
    practiceCue: 'Assess your local institution on three Bildung pillars (knowledge, self-authorship, societal care).',
    keyInsight: 'Institutions are adult-development technologies.',
    signal: 'translation',
    tags: ['bildung', 'institutions']
  },
  {
    anchorId: 'quadrant-its',
    frameworkId: 'proto-b',
    headline: 'Meshwork infrastructure',
    bridgeStatement: 'Proto-B spaces prototype infrastructure-lite institutions—distributed ledgers of care, solidarity networks.',
    tension: 'Without scaffolding, experiments remain fringe.',
    synergy: 'Use Integral system lenses to connect micro proto-B projects into macro meshworks.',
    practiceCue: 'Map how two proto-B projects could share resources through a simple commons agreement.',
    keyInsight: 'Interconnection turns experiments into ecosystems.',
    signal: 'synergy',
    tags: ['commons', 'meshwork']
  },

  // Cognitive Line ---------------------------------------------------------
  {
    anchorId: 'line-cognitive',
    frameworkId: 'game-b',
    headline: 'Sense-making stack',
    bridgeStatement: 'Game B is a cognitive upgrade—collective intelligence requires individuals who can grok multi-scale complexity.',
    tension: 'High cognition without humility breeds meta-tribes.',
    synergy: 'Integral developmental assessments reveal where sense-making edges actually are.',
    practiceCue: 'Run a “context stack” analysis on a problem: personal, organizational, civilizational.',
    keyInsight: 'Sense-making is developmental fitness.',
    signal: 'synergy',
    tags: ['sensemaking', 'complexity']
  },
  {
    anchorId: 'line-cognitive',
    frameworkId: 'hanzi-metamodern',
    headline: 'Depth literacy',
    bridgeStatement: 'Hanzi’s metamodernism demands cognitive range to hold irony and sincerity simultaneously.',
    tension: 'Depth talk can become mental gymnastics detached from action.',
    synergy: 'Map your cognitive altitude and practice Hanzi’s six dimensions from there.',
    practiceCue: 'Journal: “What does sincere irony mean from my current cognitive stage?”',
    keyInsight: 'Metamodern thought is a cognitive yoga.',
    signal: 'translation',
    tags: ['depth', 'cognition']
  },
  {
    anchorId: 'line-cognitive',
    frameworkId: 'bonnitta-process',
    headline: 'Process logic',
    bridgeStatement: 'Process structures require non-linear cognition capable of holding flows, not objects.',
    tension: 'Linear planning tools choke emergent processes.',
    synergy: 'Train with Integral perspective-taking exercises, then apply them to sense-making knots.',
    practiceCue: 'Sketch a process map that shows flows instead of milestones.',
    keyInsight: 'Thinking in verbs unlocks process leadership.',
    signal: 'synergy',
    tags: ['process', 'nonlinear']
  },
  {
    anchorId: 'line-cognitive',
    frameworkId: 'nordic-bildung',
    headline: 'Complexity literacy',
    bridgeStatement: 'Bildung is civic cognitive development—teaching people to think in systems.',
    tension: 'Education often stops at information ingestion.',
    synergy: 'Integrate AQAL literacy into Bildung curricula so citizens can read multiple perspectives.',
    practiceCue: 'Teach a friend the four quadrants using a current event as case study.',
    keyInsight: 'Democracy survives when cognition scales.',
    signal: 'synergy',
    tags: ['education', 'systems']
  },
  {
    anchorId: 'line-cognitive',
    frameworkId: 'proto-b',
    headline: 'Adaptive heuristics',
    bridgeStatement: 'Proto-B labs need people who can learn fast, update frames, and improvise heuristics.',
    tension: 'High cognition can stall action if perfectionism creeps in.',
    synergy: 'Use Integral cognition diagnostics to assign roles: explorers, integrators, sense-makers.',
    practiceCue: 'After each experiment, explicitly log the heuristic you updated.',
    keyInsight: 'Cognition is only useful if it iterates.',
    signal: 'translation',
    tags: ['heuristics', 'learning']
  },

  // Emotional Line ---------------------------------------------------------
  {
    anchorId: 'line-emotional',
    frameworkId: 'game-b',
    headline: 'Trust bandwidth',
    bridgeStatement: 'Anti-rivalry depends on emotional bandwidth for repair and honesty.',
    tension: 'Game B communities can under-resource emotional labor.',
    synergy: 'Integral emotional assessments highlight where trust might rupture.',
    practiceCue: 'Schedule a feelings retro after intense sprints.',
    keyInsight: 'Trust is an emotional muscle.',
    signal: 'synergy',
    tags: ['trust', 'repair']
  },
  {
    anchorId: 'line-emotional',
    frameworkId: 'hanzi-metamodern',
    headline: 'Affective depth codes',
    bridgeStatement: 'Hanzi’s layers include existential intimacy; emotional development determines how far sincerity can stretch.',
    tension: 'Intellectual metamodernism without feelings becomes brittle irony.',
    synergy: 'Shadow + compassion work translates metamodern ideals into actual intimacy.',
    practiceCue: 'Practice “sincere irony” by expressing a vulnerable truth with playful tone.',
    keyInsight: 'Metamodern hearts hold paradox patiently.',
    signal: 'translation',
    tags: ['emotion', 'intimacy']
  },
  {
    anchorId: 'line-emotional',
    frameworkId: 'bonnitta-process',
    headline: 'Affect attunement',
    bridgeStatement: 'Process leadership tracks micro-emotions in the field; emotional capacity is the instrument.',
    tension: 'Over-mental teams miss the subtle cues that process work relies on.',
    synergy: 'Combine Integral emotional literacy with Bonnitta’s “feel first, speak later” principle.',
    practiceCue: 'In meetings, name the emotion in the room before the content.',
    keyInsight: 'Sensing is emotional, not analytical.',
    signal: 'synergy',
    tags: ['attunement', 'emotion']
  },
  {
    anchorId: 'line-emotional',
    frameworkId: 'nordic-bildung',
    headline: 'Psychological safety as Bildung',
    bridgeStatement: 'Nordic Bildung invests in emotional safety to hold societal complexity.',
    tension: 'High empathy without boundaries can dissolve agency.',
    synergy: 'Integral polarity awareness keeps Bildung empathy balanced with firmness.',
    practiceCue: 'Practice giving a boundary while radiating care.',
    keyInsight: 'Compassion scales when supported by structure.',
    signal: 'translation',
    tags: ['safety', 'boundaries']
  },
  {
    anchorId: 'line-emotional',
    frameworkId: 'proto-b',
    headline: 'Mutual care protocols',
    bridgeStatement: 'Proto-B pods thrive when emotional labor is explicit and resourced.',
    tension: 'DIY communities burn out when care is invisible.',
    synergy: 'Design emotional check-in protocols using Integral language (states, shadows).',
    practiceCue: 'Start every session with a 60-second color-coded feelings round.',
    keyInsight: 'Care work is system work.',
    signal: 'synergy',
    tags: ['care', 'protocols']
  },

  // Moral Line -------------------------------------------------------------
  {
    anchorId: 'line-moral',
    frameworkId: 'game-b',
    headline: 'Prosocial operating system',
    bridgeStatement: 'Game B invites a moral leap from rivalrous gain to prosocial stewardship.',
    tension: 'Techno-utopian narratives can bypass actual moral commitments.',
    synergy: 'Integral moral staging clarifies which appeals resonate with which audiences.',
    practiceCue: 'Map your circle of care; expand it by one ring with a concrete action.',
    keyInsight: 'Anti-rivalry is a moral stance before it’s coordination tech.',
    signal: 'synergy',
    tags: ['ethics', 'stewardship']
  },
  {
    anchorId: 'line-moral',
    frameworkId: 'hanzi-metamodern',
    headline: 'Value magnetics',
    bridgeStatement: 'Hanzi frames politics as value-magnet engineering; moral development determines magnet strength.',
    tension: 'Meta-ethics talk can float above real tradeoffs.',
    synergy: 'Combine Integral moral diagnostics with metamodern policy experiments.',
    practiceCue: 'Write a policy memo that names the developmental benefit to the least resourced group.',
    keyInsight: 'Values attract institutions that mirror them.',
    signal: 'translation',
    tags: ['policy', 'values']
  },
  {
    anchorId: 'line-moral',
    frameworkId: 'bonnitta-process',
    headline: 'Ethical immediacy',
    bridgeStatement: 'Process leadership demands instant ethics—responding to what the field needs now.',
    tension: 'Rules-based morality lags behind emergent situations.',
    synergy: 'Use moral line training to trust ethical intuition while staying accountable.',
    practiceCue: 'During conflict, ask: “What keeps the field coherent for everyone?”',
    keyInsight: 'Ethics is a present-moment art.',
    signal: 'synergy',
    tags: ['ethics', 'process']
  },
  {
    anchorId: 'line-moral',
    frameworkId: 'nordic-bildung',
    headline: 'Caring institutions',
    bridgeStatement: 'Nordic Bildung demonstrates institutions built explicitly for shared welfare.',
    tension: 'Importing models without moral buy-in leads to bureaucracy.',
    synergy: 'Pair Bildung civics with Integral moral reflection circles.',
    practiceCue: 'Host a civic dinner where each person names a responsibility they accept for the commons.',
    keyInsight: 'Institutions are moral mirrors.',
    signal: 'translation',
    tags: ['commons', 'civics']
  },
  {
    anchorId: 'line-moral',
    frameworkId: 'proto-b',
    headline: 'Commons guardianship',
    bridgeStatement: 'Proto-B cells are miniature commons; moral maturity keeps them from drifting into freeloading.',
    tension: 'Anti-hierarchical vibes sometimes dodge accountability.',
    synergy: 'Use Integral moral staging to craft accountability agreements matched to developmental capacity.',
    practiceCue: 'Write a “care contract” that names obligations as well as freedoms.',
    keyInsight: 'Freedom without guardianship collapses the commons.',
    signal: 'tension',
    tags: ['accountability', 'commons']
  },

  // Gross State ------------------------------------------------------------
  {
    anchorId: 'state-gross',
    frameworkId: 'game-b',
    headline: 'Operational sobriety',
    bridgeStatement: 'Game B experiments still happen in the waking, gross reality of budgets, logistics, maintenance.',
    tension: 'Visionary talk can ignore mundane work.',
    synergy: 'Integral gross-state practices keep operators resourced.',
    practiceCue: 'Close each sprint with a body check: what needs rest or repair?',
    keyInsight: 'Utopias die in neglected logistics.',
    signal: 'synergy',
    tags: ['logistics', 'body']
  },
  {
    anchorId: 'state-gross',
    frameworkId: 'hanzi-metamodern',
    headline: 'Meta-sincerity in action',
    bridgeStatement: 'Metamodern sincerity shows up as embodied behavior even while you joke about it.',
    tension: 'Irony can become an escape from doing the dishes.',
    synergy: 'Use gross-state mindfulness to anchor sincerity in everyday chores.',
    practiceCue: 'Do one mundane task today as if it were sacred civic service.',
    keyInsight: 'Depth without daily practice is cosplay.',
    signal: 'translation',
    tags: ['practice', 'sincerity']
  },
  {
    anchorId: 'state-gross',
    frameworkId: 'bonnitta-process',
    headline: 'Real-time instrumentation',
    bridgeStatement: 'Process structures rely on bodies-as-sensors; gross-state awareness is the instrumentation.',
    tension: 'Overly ethereal process talk can float away from deliverables.',
    synergy: 'Alternate between somatic tuning and concrete task lists.',
    practiceCue: 'During facilitation, periodically name what your body is noticing about pace and energy.',
    keyInsight: 'Your body is a dashboard.',
    signal: 'synergy',
    tags: ['somatic', 'dashboard']
  },
  {
    anchorId: 'state-gross',
    frameworkId: 'nordic-bildung',
    headline: 'Policy prototyping in the real',
    bridgeStatement: 'Bildung labs build tangible prototypes—schools, civic rituals, welfare experiments.',
    tension: 'Vision without pilots stays academic.',
    synergy: 'Apply Integral gross-state attention to measure how prototypes feel on the ground.',
    practiceCue: 'Visit a civic prototype and journal sensory data, not opinions.',
    keyInsight: 'Reality is the ultimate user test.',
    signal: 'translation',
    tags: ['prototype', 'policy']
  },
  {
    anchorId: 'state-gross',
    frameworkId: 'proto-b',
    headline: 'Everyday practice pods',
    bridgeStatement: 'Proto-B culture is built through repeated, ordinary gatherings.',
    tension: 'Skipping “boring” logistics recreates burnout.',
    synergy: 'Use Integral habit design to anchor proto-B rituals.',
    practiceCue: 'Assign rotating mundane roles (hosting, cleanup) and treat them as sacred service.',
    keyInsight: 'The future is choreographed one chore at a time.',
    signal: 'synergy',
    tags: ['ritual', 'habits']
  },

  // Subtle State -----------------------------------------------------------
  {
    anchorId: 'state-subtle',
    frameworkId: 'game-b',
    headline: 'Collective imaginal bandwidth',
    bridgeStatement: 'Game B strategies emerge from shared imaginal space; subtle states expand the option set.',
    tension: 'Without grounding, subtle visions drift into fantasy.',
    synergy: 'Combine Integral subtle-state training with Game B sense-making sessions.',
    practiceCue: 'Before strategy meetings, run a guided imaginal practice that invites wild possibilities.',
    keyInsight: 'The imaginal is a strategic asset.',
    signal: 'synergy',
    tags: ['imaginal', 'strategy']
  },
  {
    anchorId: 'state-subtle',
    frameworkId: 'hanzi-metamodern',
    headline: 'Mythopoetic codes',
    bridgeStatement: 'Metamodernism re-enchants myth; subtle states feed the narrative palette.',
    tension: 'Mythic revival can regress to pre-modern dogma.',
    synergy: 'Integral stage awareness keeps mythopoesis progressive.',
    practiceCue: 'Write a short myth about your project that holds both sincerity and satire.',
    keyInsight: 'Stories are state-dependent technologies.',
    signal: 'translation',
    tags: ['myth', 'story']
  },
  {
    anchorId: 'state-subtle',
    frameworkId: 'bonnitta-process',
    headline: 'Field attunement',
    bridgeStatement: 'Process leaders surf subtle collective fields.',
    tension: 'Skeptics may dismiss it as woo.',
    synergy: 'Use Integral language to legitimize subtle sensing while keeping rigor.',
    practiceCue: 'After meetings, compare subtle impressions with teammates to triangulate.',
    keyInsight: 'Shared subtle data becomes actionable when spoken.',
    signal: 'synergy',
    tags: ['subtle', 'data']
  },
  {
    anchorId: 'state-subtle',
    frameworkId: 'nordic-bildung',
    headline: 'Cultural ritual design',
    bridgeStatement: 'Nordic societies use rituals (saunas, solstice) to keep subtle cohesion alive.',
    tension: 'Exported rituals can feel fake if not adapted.',
    synergy: 'Combine Integral cultural reading with local ritual prototyping.',
    practiceCue: 'Design a micro-ritual for your team that honors transition moments.',
    keyInsight: 'Rituals keep the social fabric supple.',
    signal: 'translation',
    tags: ['ritual', 'culture']
  },
  {
    anchorId: 'state-subtle',
    frameworkId: 'proto-b',
    headline: 'Dream the scaffolding',
    bridgeStatement: 'Proto-B pods rely on shared imaginal experiences—vision quests, symbolic artifacts.',
    tension: 'Without integration, rituals become escapism.',
    synergy: 'Close every subtle session with a concrete next step.',
    practiceCue: 'After a visionary gathering, immediately decide one mundane action it inspires.',
    keyInsight: 'Vision only matters if it lands.',
    signal: 'synergy',
    tags: ['vision', 'integration']
  },

  // Agency Polarity --------------------------------------------------------
  {
    anchorId: 'polarity-agency',
    frameworkId: 'game-b',
    headline: 'Sovereign agency without ego-war',
    bridgeStatement: 'Game B needs high-agency actors who refuse to weaponize that agency against others.',
    tension: 'Strong agency can slide back into Game A heroics.',
    synergy: 'Integral polarity maps teach how to flex agency while tracking communal impact.',
    practiceCue: 'Before acting boldly, ask: “What cooperative field am I protecting?”',
    keyInsight: 'True agency amplifies the commons.',
    signal: 'tension',
    tags: ['agency', 'commons']
  },
  {
    anchorId: 'polarity-agency',
    frameworkId: 'hanzi-metamodern',
    headline: 'Sovereign depth practice',
    bridgeStatement: 'Hanzi champions sovereign individuals who can hold paradox and still act.',
    tension: 'Sovereignty rhetoric can become spiritual bypass.',
    synergy: 'Pair sovereignty with Integral accountability buddies.',
    practiceCue: 'Share your boldest move-in-progress with a peer and invite critique.',
    keyInsight: 'Sovereignty blossoms inside relationship.',
    signal: 'translation',
    tags: ['sovereignty', 'accountability']
  },
  {
    anchorId: 'polarity-agency',
    frameworkId: 'bonnitta-process',
    headline: 'Flow agency',
    bridgeStatement: 'Process structures see agency as flow—leading when energy wants it.',
    tension: 'People accustomed to fixed roles may freeze.',
    synergy: 'Practice switching between leading and following in one meeting.',
    practiceCue: 'Hand facilitation to someone else at least once per session.',
    keyInsight: 'Agency is a dance, not a throne.',
    signal: 'synergy',
    tags: ['roles', 'agency']
  },
  {
    anchorId: 'polarity-agency',
    frameworkId: 'nordic-bildung',
    headline: 'Responsible freedom',
    bridgeStatement: 'Nordic Bildung cultivates freedom paired with responsibility—an agency polarity.',
    tension: 'Freedom talk without responsibilities dissolves trust.',
    synergy: 'Use Bildung mentoring to pair every freedom with an offered service.',
    practiceCue: 'List your privileges and the stewarding actions you choose in return.',
    keyInsight: 'Freedom ripens through stewardship.',
    signal: 'translation',
    tags: ['freedom', 'stewardship']
  },
  {
    anchorId: 'polarity-agency',
    frameworkId: 'proto-b',
    headline: 'Distributed leadership loops',
    bridgeStatement: 'Proto-B pods rotate agency so no single ego dominates.',
    tension: 'Rotation without clarity can stall progress.',
    synergy: 'Combine Integral role clarity with proto-B rotation norms.',
    practiceCue: 'Implement a “lead-next” queue where agency is nominated weekly.',
    keyInsight: 'Agency scales when it circulates.',
    signal: 'synergy',
    tags: ['rotation', 'leadership']
  },

  // Communion Polarity -----------------------------------------------------
  {
    anchorId: 'polarity-communion',
    frameworkId: 'game-b',
    headline: 'Communion without fusion',
    bridgeStatement: 'Game B needs deep communion to sustain trust while avoiding groupthink.',
    tension: 'Tight bonds can slip into subtle rivalry for belonging.',
    synergy: 'Integral communion practices (circling, authentic relating) train non-fused connection.',
    practiceCue: 'Run a circling session focusing on mutual admiration minus comparison.',
    keyInsight: 'Belonging thrives when individuality is welcomed.',
    signal: 'synergy',
    tags: ['communion', 'relating']
  },
  {
    anchorId: 'polarity-communion',
    frameworkId: 'hanzi-metamodern',
    headline: 'Fractal belonging',
    bridgeStatement: 'Hanzi imagines societies where belonging scales from local to planetary.',
    tension: 'Large-scale belonging often erases local flavor.',
    synergy: 'Use Integral quadrant scans to protect locality while designing global myth.',
    practiceCue: 'Craft a pledge that honors both your local community and a planetary commitment.',
    keyInsight: 'Belonging can be fractal if designed intentionally.',
    signal: 'translation',
    tags: ['belonging', 'global']
  },
  {
    anchorId: 'polarity-communion',
    frameworkId: 'bonnitta-process',
    headline: 'Interbeing practice',
    bridgeStatement: 'Process facilitation literally trains interbeing—feeling the we-space as self.',
    tension: 'Some participants resist the vulnerability required.',
    synergy: 'Offer tiered practices so people can ease into deeper communion.',
    practiceCue: 'Introduce a “two-person weave” exercise where partners speak as the field.',
    keyInsight: 'Communion grows at the edge of comfort.',
    signal: 'synergy',
    tags: ['interbeing', 'practice']
  },
  {
    anchorId: 'polarity-communion',
    frameworkId: 'nordic-bildung',
    headline: 'Shared civic identity',
    bridgeStatement: 'Nordic cultures invest heavily in shared ceremonies, story, and welfare.',
    tension: 'Strong communion can exclude outsiders.',
    synergy: 'Integral awareness ensures communion stays permeable.',
    practiceCue: 'Audit who is missing from your communal rituals and invite them explicitly.',
    keyInsight: 'Communion that excludes is just another tribe.',
    signal: 'tension',
    tags: ['inclusion', 'ritual']
  },
  {
    anchorId: 'polarity-communion',
    frameworkId: 'proto-b',
    headline: 'Peer belonging agreements',
    bridgeStatement: 'Proto-B pods invent belonging agreements to replace contracts.',
    tension: 'Unspoken expectations create silent resentments.',
    synergy: 'Write explicit belonging agreements referencing states, needs, and repair steps.',
    practiceCue: 'Co-create a “how we reconnect” protocol before conflict happens.',
    keyInsight: 'Belonging is maintained by explicit repair pathways.',
    signal: 'synergy',
    tags: ['agreements', 'repair']
  }
];

export const bridgeRecipes: BridgeRecipe[] = [
  {
    id: 'recipe-rivalry-audit',
    title: 'Rivalry Audit',
    description: 'Surface the micro Game A scripts living in your body and culture.',
    duration: '15–20 min solo or duo',
    anchors: ['quadrant-i', 'quadrant-we', 'polarity-agency'],
    frameworks: ['game-b'],
    steps: [
      'List three contexts where competition quietly drives your behavior.',
      'Name the bodily signal that announces the rivalry script.',
      'Design a “Game B pause” ritual (breath, question, handshake) to insert at that moment.',
      'Share your ritual with a collaborator and ask them to mirror it back when they see you slip.'
    ],
    payoff: 'Anti-rivalry stops being a concept and becomes a nervous-system pattern.',
    tags: ['anti-rivalry', 'shadow', 'practice']
  },
  {
    id: 'recipe-depth-stack',
    title: 'Depth Stack Translation Lab',
    description: 'Translate Hanzi’s metamodern layers into actionable practices for your team.',
    duration: '45 min workshop',
    anchors: ['line-cognitive', 'line-emotional', 'state-subtle'],
    frameworks: ['hanzi-metamodern'],
    steps: [
      'Choose one metamodern layer and summarize it in plain language.',
      'Identify its interior signal (feeling) and exterior behavior.',
      'Design a micro-practice that invites that layer for a week.',
      'Close with a mythopoetic statement that celebrates the tension you are holding.'
    ],
    payoff: 'Depth codes become embodied habits instead of abstract memes.',
    tags: ['depth', 'translation', 'ritual']
  },
  {
    id: 'recipe-process-field',
    title: 'Process Sensing Dojo',
    description: 'Practice switching between felt-sense leadership and Integral mapping.',
    duration: '60 min group lab',
    anchors: ['quadrant-we', 'line-emotional', 'polarity-communion'],
    frameworks: ['bonnitta-process'],
    steps: [
      'Begin with five minutes of silent attunement; notice what the field feels like.',
      'Name the sensation without analysis ("tingly", "compressed", etc.).',
      'Move into action planning for 15 minutes while tracking the sensation.',
      'Close with a retro: when did agency/communion balance feel alive?' 
    ],
    payoff: 'Teams learn to toggle between sensing and structuring without losing either.',
    tags: ['process', 'attunement', 'team']
  },
  {
    id: 'recipe-bildung-sprint',
    title: 'Civic Bildung Sprint',
    description: 'Pair freedom with responsibility using Bildung contracts.',
    duration: '90 min workshop',
    anchors: ['line-moral', 'quadrant-its', 'polarity-agency'],
    frameworks: ['nordic-bildung'],
    steps: [
      'List the privileges/powers your team currently holds.',
      'For each item, write the responsibility it implies for the commons.',
      'Design a quarterly ritual where these pairs are reviewed publicly.',
      'Invite feedback from an outside stakeholder to stress-test sincerity.'
    ],
    payoff: 'Freedom ripens into trust because responsibilities are visible.',
    tags: ['bildung', 'civics', 'accountability']
  },
  {
    id: 'recipe-proto-commons',
    title: 'Proto-B Micro-Commons',
    description: 'Stand up a tiny commons that can be replicated elsewhere.',
    duration: '2 hours to launch · ongoing stewardship',
    anchors: ['quadrant-it', 'quadrant-its', 'polarity-communion'],
    frameworks: ['proto-b'],
    steps: [
      'Name a shared resource (childcare, tools, emotional support).',
      'Write a culture README covering purpose, taboos, repair steps.',
      'Draft a simple ledger (can be analog) that tracks commitments instead of transactions.',
      'Schedule a monthly integration circle to harvest lessons and iterate.'
    ],
    payoff: 'Commons literacy grows through lived, small-scale success stories.',
    tags: ['commons', 'proto-b', 'practice']
  }
];
