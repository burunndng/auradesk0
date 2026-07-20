import React, { useState, useEffect, useMemo } from 'react';
import {
  Book,
  Search,
  X,
  Star,
  GitCompare,
  Grid3x3,
  List,
  ChevronRight,
  Lightbulb,
  Filter,
  ArrowUpDown,
  BookmarkPlus,
  BookmarkCheck,
  StickyNote,
  Network,
  Target,
  Brain,
  Compass,
  Repeat,
  Eye,
  Users,
  Zap,
  TrendingUp,
  MessageCircle,
} from 'lucide-react';
import { colors, spacing } from '../../../theme';
import { getIconComponent } from '../../../.claude/lib/iconMap';
import { StorageManager } from '../../../.claude/lib/storageManager';

// Accent colors for additional frameworks
const accentColors = {
  cyan: '#06b6d4',
  purple: '#a855f7',
  green: '#22c55e',
  yellow: '#eab308',
  orange: '#f97316',
  blue: '#3b82f6',
  pink: '#ec4899',
  red: '#ef4444',
};

type Framework = {
  id: string;
  name: string;
  author: string;
  year?: number;
  color: string;
  colorBg: string;
  colorBorder: string;
  tagline: string;
  coreIdea: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  categories: string[];
  whenToUse: string[];
  keyConcepts: {
    term: string;
    definition: string;
  }[];
  examples: string[];
  relatedFrameworks: string[];
  diagram?: () => React.ReactNode;
};

type ViewMode = 'grid' | 'list';
type SortMode = 'alphabetical' | 'complexity' | 'year' | 'popularity';

const frameworks: Framework[] = [
  {
    id: 'weick',
    name: "Weick's Sensemaking Theory",
    author: 'Karl Weick',
    year: 1995,
    color: colors.modules.mind.text,
    colorBg: colors.modules.mind.bg,
    colorBorder: colors.modules.mind.border,
    complexity: 'advanced',
    categories: ['Cognition', 'Organizational', 'Decision-Making'],
    tagline: 'How we create meaning from ambiguity',
    coreIdea:
      'Sensemaking is the ongoing process through which people work to understand surprising, ambiguous, or confusing events. We create plausible stories that allow us to act, then test those stories against reality.',
    whenToUse: [
      'Facing unexpected disruptions or crises',
      'Navigating ambiguous situations with no clear answer',
      'Making sense of conflicting information',
      'Understanding organizational change or failure',
    ],
    keyConcepts: [
      {
        term: 'Retrospective',
        definition: 'We make sense of what has already happened, not what will happen',
      },
      {
        term: 'Plausibility over Accuracy',
        definition: 'We need a "good enough" story to act, not the perfect explanation',
      },
      {
        term: 'Enacted Environment',
        definition: 'Our actions shape the reality we then try to understand',
      },
      {
        term: 'Social Process',
        definition: 'Meaning is created through conversation and shared understanding',
      },
    ],
    examples: [
      'A team debriefing after a failed product launch to understand what went wrong',
      'Making sense of a sudden health diagnosis by talking to doctors and patients',
      'Understanding why a relationship ended through journaling and reflection',
    ],
    relatedFrameworks: ['argyris', 'schon', 'kolb'],
    diagram: () => (
      <svg viewBox="0 0 300 200" style={{ width: '100%', height: 'auto' }}>
        <circle cx="150" cy="100" r="70" fill={colors.modules.mind.bg} stroke={colors.modules.mind.border} strokeWidth="2" />
        <text x="150" y="80" textAnchor="middle" fill={colors.modules.mind.text} fontSize="12" fontWeight="600">
          Ambiguous
        </text>
        <text x="150" y="95" textAnchor="middle" fill={colors.modules.mind.text} fontSize="12" fontWeight="600">
          Event
        </text>
        <path d="M 220 100 L 260 100" stroke={colors.modules.mind.text} strokeWidth="2" markerEnd="url(#arrowMind)" />
        <circle cx="280" cy="100" r="15" fill={colors.modules.mind.border} />
        <text x="280" y="105" textAnchor="middle" fill={colors.neutral[100]} fontSize="10">
          Act
        </text>
        <path d="M 280 85 Q 300 50 150 30" stroke={colors.modules.mind.text} strokeWidth="1.5" strokeDasharray="4,2" markerEnd="url(#arrowMind)" />
        <text x="240" y="50" fill={colors.neutral[400]} fontSize="10">
          Retrospect
        </text>
        <defs>
          <marker id="arrowMind" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={colors.modules.mind.text} />
          </marker>
        </defs>
      </svg>
    ),
  },
  {
    id: 'cynefin',
    name: 'Cynefin Framework',
    author: 'Dave Snowden',
    year: 1999,
    color: colors.modules.spirit.text,
    colorBg: colors.modules.spirit.bg,
    colorBorder: colors.modules.spirit.border,
    complexity: 'intermediate',
    categories: ['Decision-Making', 'Complexity', 'Leadership'],
    tagline: 'Matching your response to the type of problem',
    coreIdea:
      'Not all problems are the same. Cynefin distinguishes five domains (Clear, Complicated, Complex, Chaotic, Confused) to help you choose the right approach: best practices, expert analysis, experimentation, or rapid action.',
    whenToUse: [
      'Choosing a decision-making strategy',
      'Avoiding "best practice" thinking in novel situations',
      'Leading through crisis or uncertainty',
      'Matching tools to problem complexity',
    ],
    keyConcepts: [
      {
        term: 'Clear (Obvious)',
        definition: 'Known cause-effect. Use best practices. Sense → Categorize → Respond.',
      },
      {
        term: 'Complicated',
        definition: 'Knowable cause-effect. Use expert analysis. Sense → Analyze → Respond.',
      },
      {
        term: 'Complex',
        definition: 'Emergent patterns. Experiment and adapt. Probe → Sense → Respond.',
      },
      {
        term: 'Chaotic',
        definition: 'No patterns. Act fast to stabilize. Act → Sense → Respond.',
      },
    ],
    examples: [
      'Fixing a broken website (Clear) vs designing a new product (Complex)',
      'Following a recipe (Clear) vs creating a new dish (Complex)',
      'Responding to a fire alarm (Chaotic) vs planning a career change (Complicated/Complex)',
    ],
    relatedFrameworks: ['weick', 'ooda', 'design-thinking'],
    diagram: () => (
      <svg viewBox="0 0 300 200" style={{ width: '100%', height: 'auto' }}>
        <rect x="20" y="20" width="130" height="80" fill={colors.modules.spirit.bg} stroke={colors.modules.spirit.border} strokeWidth="2" />
        <text x="85" y="50" textAnchor="middle" fill={colors.modules.spirit.text} fontSize="11" fontWeight="600">
          Complex
        </text>
        <text x="85" y="65" textAnchor="middle" fill={colors.neutral[400]} fontSize="9">
          Probe-Sense
        </text>
        <rect x="150" y="20" width="130" height="80" fill={colors.modules.spirit.bg} stroke={colors.modules.spirit.border} strokeWidth="2" />
        <text x="215" y="50" textAnchor="middle" fill={colors.modules.spirit.text} fontSize="11" fontWeight="600">
          Complicated
        </text>
        <text x="215" y="65" textAnchor="middle" fill={colors.neutral[400]} fontSize="9">
          Sense-Analyze
        </text>
        <rect x="20" y="100" width="130" height="80" fill={colors.modules.spirit.bg} stroke={colors.modules.spirit.border} strokeWidth="2" />
        <text x="85" y="130" textAnchor="middle" fill={colors.modules.spirit.text} fontSize="11" fontWeight="600">
          Chaotic
        </text>
        <text x="85" y="145" textAnchor="middle" fill={colors.neutral[400]} fontSize="9">
          Act-Sense
        </text>
        <rect x="150" y="100" width="130" height="80" fill={colors.modules.spirit.bg} stroke={colors.modules.spirit.border} strokeWidth="2" />
        <text x="215" y="130" textAnchor="middle" fill={colors.modules.spirit.text} fontSize="11" fontWeight="600">
          Clear
        </text>
        <text x="215" y="145" textAnchor="middle" fill={colors.neutral[400]} fontSize="9">
          Sense-Categorize
        </text>
      </svg>
    ),
  },
  {
    id: 'argyris',
    name: 'Double-Loop Learning',
    author: 'Chris Argyris',
    year: 1977,
    color: colors.modules.shadow.text,
    colorBg: colors.modules.shadow.bg,
    colorBorder: colors.modules.shadow.border,
    complexity: 'intermediate',
    categories: ['Learning', 'Reflection', 'Growth'],
    tagline: 'Learning to question your assumptions',
    coreIdea:
      'Single-loop learning fixes errors without questioning underlying beliefs. Double-loop learning questions the goals, values, and mental models that led to the error. Triple-loop learning questions how we learn.',
    whenToUse: [
      'Stuck in repeating patterns despite trying solutions',
      'Fixing symptoms but not root causes',
      'Organizational culture preventing change',
      'Personal growth plateaus',
    ],
    keyConcepts: [
      {
        term: 'Single-Loop',
        definition: 'Detect and correct errors within existing rules (like a thermostat)',
      },
      {
        term: 'Double-Loop',
        definition: 'Question the rules themselves and change governing variables',
      },
      {
        term: 'Espoused Theory',
        definition: 'What we say we believe and do',
      },
      {
        term: 'Theory-in-Use',
        definition: 'What we actually believe and do (often different from espoused)',
      },
    ],
    examples: [
      'Single-loop: "I need to study harder." Double-loop: "Is memorization the right strategy?"',
      'Single-loop: "We need better marketing." Double-loop: "Is this the right product for this market?"',
      'Single-loop: "I need to communicate better." Double-loop: "Am I trying to control instead of collaborate?"',
    ],
    relatedFrameworks: ['schon', 'kolb', 'ladder-inference'],
    diagram: () => (
      <svg viewBox="0 0 300 150" style={{ width: '100%', height: 'auto' }}>
        <rect x="20" y="40" width="80" height="30" rx="4" fill={colors.modules.shadow.bg} stroke={colors.modules.shadow.border} strokeWidth="2" />
        <text x="60" y="60" textAnchor="middle" fill={colors.modules.shadow.text} fontSize="10">
          Action
        </text>
        <path d="M 100 55 L 140 55" stroke={colors.modules.shadow.text} strokeWidth="2" markerEnd="url(#arrowShadow)" />
        <rect x="140" y="40" width="80" height="30" rx="4" fill={colors.modules.shadow.bg} stroke={colors.modules.shadow.border} strokeWidth="2" />
        <text x="180" y="60" textAnchor="middle" fill={colors.modules.shadow.text} fontSize="10">
          Result
        </text>
        <path d="M 180 70 Q 180 100 60 100 Q 60 80 60 70" stroke={accentColors.purple} strokeWidth="2" strokeDasharray="4,2" markerEnd="url(#arrowPurple)" />
        <text x="120" y="115" textAnchor="middle" fill={accentColors.purple} fontSize="9">
          Single Loop
        </text>
        <path d="M 220 55 Q 280 55 280 20 Q 280 10 100 10 Q 20 10 20 30" stroke={accentColors.cyan} strokeWidth="2" strokeDasharray="4,2" markerEnd="url(#arrowCyan)" />
        <text x="150" y="8" textAnchor="middle" fill={accentColors.cyan} fontSize="9">
          Double Loop (Question Goals)
        </text>
        <defs>
          <marker id="arrowShadow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={colors.modules.shadow.text} />
          </marker>
          <marker id="arrowPurple" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={accentColors.purple} />
          </marker>
          <marker id="arrowCyan" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={accentColors.cyan} />
          </marker>
        </defs>
      </svg>
    ),
  },
  {
    id: 'schon',
    name: 'Reflective Practice',
    author: 'Donald Schön',
    year: 1983,
    color: colors.modules.body.text,
    colorBg: colors.modules.body.bg,
    colorBorder: colors.modules.body.border,
    complexity: 'beginner',
    categories: ['Learning', 'Reflection', 'Expertise'],
    tagline: 'Learning from experience in real-time',
    coreIdea:
      'Professionals learn not just from theory but from reflecting on their practice. Reflection-in-action happens during the work; reflection-on-action happens after. Both turn experience into expertise.',
    whenToUse: [
      'Developing expertise in a skill or craft',
      'Learning from mistakes and successes',
      'Navigating unique situations without clear rules',
      'Teaching others how to learn from experience',
    ],
    keyConcepts: [
      {
        term: 'Reflection-in-Action',
        definition: 'Thinking on your feet while doing the work (improvisation)',
      },
      {
        term: 'Reflection-on-Action',
        definition: 'Thinking back on what you did to learn for next time',
      },
      {
        term: 'Knowing-in-Action',
        definition: 'Tacit knowledge embedded in skillful practice (hard to articulate)',
      },
      {
        term: 'Surprise as Trigger',
        definition: 'Unexpected results prompt reflection and learning',
      },
    ],
    examples: [
      "A therapist noticing mid-session that a technique isn't working and pivoting",
      'A chef tasting a dish and adjusting seasoning in real-time',
      "Journaling after a difficult conversation to understand what worked and what didn't",
    ],
    relatedFrameworks: ['argyris', 'kolb', 'weick'],
    diagram: () => (
      <svg viewBox="0 0 300 180" style={{ width: '100%', height: 'auto' }}>
        <circle cx="150" cy="90" r="60" fill={colors.modules.body.bg} stroke={colors.modules.body.border} strokeWidth="2" />
        <text x="150" y="85" textAnchor="middle" fill={colors.modules.body.text} fontSize="11" fontWeight="600">
          Practice
        </text>
        <text x="150" y="100" textAnchor="middle" fill={colors.modules.body.text} fontSize="9">
          (Doing)
        </text>
        <path d="M 150 30 Q 100 10 50 30" stroke={accentColors.orange} strokeWidth="2" strokeDasharray="4,2" />
        <text x="100" y="15" textAnchor="middle" fill={accentColors.orange} fontSize="9" fontWeight="600">
          Reflection-ON
        </text>
        <path d="M 210 90 L 250 90" stroke={accentColors.green} strokeWidth="2" strokeDasharray="4,2" />
        <text x="270" y="85" fill={accentColors.green} fontSize="9" fontWeight="600">
          Reflection-IN
        </text>
        <text x="270" y="98" fill={accentColors.green} fontSize="8">
          (real-time)
        </text>
      </svg>
    ),
  },
  {
    id: 'kolb',
    name: "Kolb's Learning Cycle",
    author: 'David Kolb',
    year: 1984,
    color: accentColors.cyan,
    colorBg: 'rgba(6, 182, 212, 0.1)',
    colorBorder: 'rgba(6, 182, 212, 0.3)',
    complexity: 'beginner',
    categories: ['Learning', 'Reflection', 'Education'],
    tagline: 'Four stages of experiential learning',
    coreIdea:
      'Learning is a cycle of four stages: Concrete Experience (doing), Reflective Observation (reflecting), Abstract Conceptualization (thinking), and Active Experimentation (planning). We spiral through these stages to develop deeper understanding.',
    whenToUse: [
      'Designing learning experiences or curriculum',
      'Reflecting on your own learning process',
      'Helping others learn from experience',
      'Developing new skills systematically',
    ],
    keyConcepts: [
      {
        term: 'Concrete Experience',
        definition: 'Having a new experience or encountering a situation (doing)',
      },
      {
        term: 'Reflective Observation',
        definition: 'Reviewing and thinking about the experience (reflecting)',
      },
      {
        term: 'Abstract Conceptualization',
        definition: 'Drawing conclusions and forming theories (thinking)',
      },
      {
        term: 'Active Experimentation',
        definition: 'Testing theories in new situations (planning)',
      },
    ],
    examples: [
      'Learning to code: write code → debug errors → understand patterns → try new approach',
      'Learning to cook: make a dish → taste and observe → understand technique → experiment with variations',
      'Team retrospective: review what happened → discuss observations → identify principles → plan next iteration',
    ],
    relatedFrameworks: ['schon', 'argyris', 'design-thinking'],
    diagram: () => (
      <svg viewBox="0 0 300 200" style={{ width: '100%', height: 'auto' }}>
        <circle cx="150" cy="100" r="80" fill="none" stroke={accentColors.cyan} strokeWidth="2" strokeDasharray="5,3" />
        <circle cx="150" cy="20" r="15" fill={accentColors.cyan} opacity="0.2" stroke={accentColors.cyan} strokeWidth="2" />
        <text x="150" y="25" textAnchor="middle" fill={accentColors.cyan} fontSize="9" fontWeight="600">
          Do
        </text>
        <circle cx="230" cy="100" r="15" fill={accentColors.cyan} opacity="0.2" stroke={accentColors.cyan} strokeWidth="2" />
        <text x="230" y="105" textAnchor="middle" fill={accentColors.cyan} fontSize="9" fontWeight="600">
          Reflect
        </text>
        <circle cx="150" cy="180" r="15" fill={accentColors.cyan} opacity="0.2" stroke={accentColors.cyan} strokeWidth="2" />
        <text x="150" y="185" textAnchor="middle" fill={accentColors.cyan} fontSize="9" fontWeight="600">
          Think
        </text>
        <circle cx="70" cy="100" r="15" fill={accentColors.cyan} opacity="0.2" stroke={accentColors.cyan} strokeWidth="2" />
        <text x="70" y="105" textAnchor="middle" fill={accentColors.cyan} fontSize="9" fontWeight="600">
          Plan
        </text>
        <path d="M 165 30 L 220 90" stroke={accentColors.cyan} strokeWidth="1.5" markerEnd="url(#arrowCyan2)" />
        <path d="M 225 115 L 160 170" stroke={accentColors.cyan} strokeWidth="1.5" markerEnd="url(#arrowCyan2)" />
        <path d="M 140 170 L 80 110" stroke={accentColors.cyan} strokeWidth="1.5" markerEnd="url(#arrowCyan2)" />
        <path d="M 75 85 L 140 30" stroke={accentColors.cyan} strokeWidth="1.5" markerEnd="url(#arrowCyan2)" />
        <defs>
          <marker id="arrowCyan2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={accentColors.cyan} />
          </marker>
        </defs>
      </svg>
    ),
  },
  {
    id: 'senge',
    name: 'Systems Thinking',
    author: 'Peter Senge',
    year: 1990,
    color: accentColors.green,
    colorBg: 'rgba(34, 197, 94, 0.1)',
    colorBorder: 'rgba(34, 197, 94, 0.3)',
    complexity: 'advanced',
    categories: ['Systems', 'Complexity', 'Organizational'],
    tagline: 'Seeing the whole, not just the parts',
    coreIdea:
      'Systems thinking helps us see patterns, relationships, and structures rather than isolated events. Understanding feedback loops, delays, and leverage points reveals why systems behave the way they do and where to intervene effectively.',
    whenToUse: [
      'Understanding recurring organizational problems',
      'Identifying unintended consequences of decisions',
      'Finding leverage points for change',
      'Avoiding "whack-a-mole" problem solving',
    ],
    keyConcepts: [
      {
        term: 'Feedback Loops',
        definition: 'Reinforcing (amplifying) and balancing (stabilizing) cycles that drive system behavior',
      },
      {
        term: 'Delays',
        definition: 'Time gaps between actions and consequences that create instability',
      },
      {
        term: 'Leverage Points',
        definition: 'Places where small changes can produce big impacts on the whole system',
      },
      {
        term: 'Mental Models',
        definition: 'Deeply held assumptions that shape how we understand and act in systems',
      },
    ],
    examples: [
      'Traffic jams emerge from individual driving decisions (emergent behavior)',
      'Hiring more people can slow down a team (Brooks\'s Law - adding feedback)',
      'Dieting creates yo-yo weight gain through metabolic adaptation (balancing loop)',
    ],
    relatedFrameworks: ['cynefin', 'weick', 'ladder-inference'],
    diagram: () => (
      <svg viewBox="0 0 300 180" style={{ width: '100%', height: 'auto' }}>
        <circle cx="100" cy="60" r="25" fill={accentColors.green} opacity="0.2" stroke={accentColors.green} strokeWidth="2" />
        <text x="100" y="65" textAnchor="middle" fill={accentColors.green} fontSize="10">
          A
        </text>
        <circle cx="200" cy="60" r="25" fill={accentColors.green} opacity="0.2" stroke={accentColors.green} strokeWidth="2" />
        <text x="200" y="65" textAnchor="middle" fill={accentColors.green} fontSize="10">
          B
        </text>
        <circle cx="150" cy="130" r="25" fill={accentColors.green} opacity="0.2" stroke={accentColors.green} strokeWidth="2" />
        <text x="150" y="135" textAnchor="middle" fill={accentColors.green} fontSize="10">
          C
        </text>
        <path d="M 120 70 L 175 70" stroke={accentColors.green} strokeWidth="2" markerEnd="url(#arrowGreen)" />
        <path d="M 190 85 L 160 115" stroke={accentColors.green} strokeWidth="2" markerEnd="url(#arrowGreen)" />
        <path d="M 135 120 L 110 80" stroke={accentColors.green} strokeWidth="2" markerEnd="url(#arrowGreen)" />
        <text x="150" y="20" textAnchor="middle" fill={accentColors.green} fontSize="11" fontWeight="600">
          Feedback Loop
        </text>
        <defs>
          <marker id="arrowGreen" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={accentColors.green} />
          </marker>
        </defs>
      </svg>
    ),
  },
  {
    id: 'johari',
    name: 'Johari Window',
    author: 'Joseph Luft & Harry Ingham',
    year: 1955,
    color: accentColors.purple,
    colorBg: 'rgba(168, 85, 247, 0.1)',
    colorBorder: 'rgba(168, 85, 247, 0.3)',
    complexity: 'beginner',
    categories: ['Self-Awareness', 'Communication', 'Growth'],
    tagline: 'Understanding what you know and don\'t know about yourself',
    coreIdea:
      'The Johari Window divides self-awareness into four quadrants: Open (known to self and others), Blind (known to others but not self), Hidden (known to self but not others), and Unknown (known to neither). Growth comes from expanding the Open area.',
    whenToUse: [
      'Building self-awareness and emotional intelligence',
      'Improving team communication and trust',
      'Giving and receiving feedback effectively',
      'Understanding relationship dynamics',
    ],
    keyConcepts: [
      {
        term: 'Open Area',
        definition: 'Known to you and others - the foundation of trust and collaboration',
      },
      {
        term: 'Blind Spot',
        definition: 'Known to others but not you - revealed through feedback',
      },
      {
        term: 'Hidden Area',
        definition: 'Known to you but not others - reduced through disclosure',
      },
      {
        term: 'Unknown Area',
        definition: 'Known to neither - discovered through experience and exploration',
      },
    ],
    examples: [
      'Asking for 360° feedback to discover blind spots in your leadership style',
      'Sharing vulnerabilities with a team to build trust (reducing Hidden area)',
      'Discovering hidden talents through trying new experiences (Unknown → Open)',
    ],
    relatedFrameworks: ['argyris', 'schon', 'theory-u'],
    diagram: () => (
      <svg viewBox="0 0 300 200" style={{ width: '100%', height: 'auto' }}>
        <rect x="50" y="40" width="100" height="70" fill={accentColors.purple} opacity="0.3" stroke={accentColors.purple} strokeWidth="2" />
        <text x="100" y="70" textAnchor="middle" fill={accentColors.purple} fontSize="11" fontWeight="600">
          Open
        </text>
        <text x="100" y="85" textAnchor="middle" fill={colors.neutral[300]} fontSize="8">
          Known to Self
        </text>
        <text x="100" y="95" textAnchor="middle" fill={colors.neutral[300]} fontSize="8">
          & Others
        </text>
        <rect x="150" y="40" width="100" height="70" fill={accentColors.purple} opacity="0.1" stroke={accentColors.purple} strokeWidth="2" />
        <text x="200" y="70" textAnchor="middle" fill={accentColors.purple} fontSize="11" fontWeight="600">
          Blind
        </text>
        <text x="200" y="85" textAnchor="middle" fill={colors.neutral[400]} fontSize="8">
          Others See
        </text>
        <rect x="50" y="110" width="100" height="70" fill={accentColors.purple} opacity="0.1" stroke={accentColors.purple} strokeWidth="2" />
        <text x="100" y="140" textAnchor="middle" fill={accentColors.purple} fontSize="11" fontWeight="600">
          Hidden
        </text>
        <text x="100" y="155" textAnchor="middle" fill={colors.neutral[400]} fontSize="8">
          You Hide
        </text>
        <rect x="150" y="110" width="100" height="70" fill={accentColors.purple} opacity="0.05" stroke={accentColors.purple} strokeWidth="2" strokeDasharray="4,2" />
        <text x="200" y="140" textAnchor="middle" fill={accentColors.purple} fontSize="11" fontWeight="600">
          Unknown
        </text>
        <text x="200" y="155" textAnchor="middle" fill={colors.neutral[500]} fontSize="8">
          Undiscovered
        </text>
      </svg>
    ),
  },
  {
    id: 'ooda',
    name: 'OODA Loop',
    author: 'John Boyd',
    year: 1976,
    color: accentColors.orange,
    colorBg: 'rgba(249, 115, 22, 0.1)',
    colorBorder: 'rgba(249, 115, 22, 0.3)',
    complexity: 'intermediate',
    categories: ['Decision-Making', 'Strategy', 'Agility'],
    tagline: 'Making faster, better decisions under pressure',
    coreIdea:
      'The OODA Loop (Observe, Orient, Decide, Act) is a decision-making framework emphasizing speed and adaptation. Success comes from cycling through the loop faster than your opponent or the changing environment, constantly updating your understanding.',
    whenToUse: [
      'Fast-paced competitive situations',
      'Rapidly changing environments',
      'Strategic planning and execution',
      'Crisis response and tactical decisions',
    ],
    keyConcepts: [
      {
        term: 'Observe',
        definition: 'Gather information from multiple sources about the current situation',
      },
      {
        term: 'Orient',
        definition: 'Analyze and synthesize data using mental models, experience, and culture',
      },
      {
        term: 'Decide',
        definition: 'Choose a course of action based on your orientation',
      },
      {
        term: 'Act',
        definition: 'Execute the decision and observe results to start the loop again',
      },
    ],
    examples: [
      'Startup pivoting based on customer feedback (faster OODA than competitors)',
      'Emergency room triage - rapid assessment and action cycles',
      'Military tactics - disrupting enemy decision cycles through speed',
    ],
    relatedFrameworks: ['cynefin', 'weick', 'design-thinking'],
    diagram: () => (
      <svg viewBox="0 0 300 200" style={{ width: '100%', height: 'auto' }}>
        <ellipse cx="150" cy="100" rx="120" ry="70" fill="none" stroke={accentColors.orange} strokeWidth="2" strokeDasharray="6,4" />
        <circle cx="80" cy="100" r="20" fill={accentColors.orange} opacity="0.2" stroke={accentColors.orange} strokeWidth="2" />
        <text x="80" y="105" textAnchor="middle" fill={accentColors.orange} fontSize="10" fontWeight="600">
          Observe
        </text>
        <circle cx="150" cy="50" r="20" fill={accentColors.orange} opacity="0.2" stroke={accentColors.orange} strokeWidth="2" />
        <text x="150" y="55" textAnchor="middle" fill={accentColors.orange} fontSize="10" fontWeight="600">
          Orient
        </text>
        <circle cx="220" cy="100" r="20" fill={accentColors.orange} opacity="0.2" stroke={accentColors.orange} strokeWidth="2" />
        <text x="220" y="105" textAnchor="middle" fill={accentColors.orange} fontSize="10" fontWeight="600">
          Decide
        </text>
        <circle cx="150" cy="150" r="20" fill={accentColors.orange} opacity="0.2" stroke={accentColors.orange} strokeWidth="2" />
        <text x="150" y="155" textAnchor="middle" fill={accentColors.orange} fontSize="10" fontWeight="600">
          Act
        </text>
        <path d="M 95 90 L 135 60" stroke={accentColors.orange} strokeWidth="2" markerEnd="url(#arrowOrange)" />
        <path d="M 165 60 L 205 90" stroke={accentColors.orange} strokeWidth="2" markerEnd="url(#arrowOrange)" />
        <path d="M 210 120 L 160 140" stroke={accentColors.orange} strokeWidth="2" markerEnd="url(#arrowOrange)" />
        <path d="M 140 160 L 90 120" stroke={accentColors.orange} strokeWidth="2" markerEnd="url(#arrowOrange)" />
        <defs>
          <marker id="arrowOrange" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={accentColors.orange} />
          </marker>
        </defs>
      </svg>
    ),
  },
  {
    id: 'ladder-inference',
    name: 'Ladder of Inference',
    author: 'Chris Argyris',
    year: 1990,
    color: accentColors.blue,
    colorBg: 'rgba(59, 130, 246, 0.1)',
    colorBorder: 'rgba(59, 130, 246, 0.3)',
    complexity: 'intermediate',
    categories: ['Cognition', 'Decision-Making', 'Communication'],
    tagline: 'How we jump to conclusions',
    coreIdea:
      'The Ladder of Inference describes how we move from observable data to actions based on beliefs. We climb the ladder: select data → add meaning → make assumptions → draw conclusions → adopt beliefs → take action. Awareness of this process prevents faulty reasoning.',
    whenToUse: [
      'Questioning your own assumptions and biases',
      'Resolving conflicts based on different interpretations',
      'Improving critical thinking and reasoning',
      'Slowing down rushed judgments',
    ],
    keyConcepts: [
      {
        term: 'Observable Data',
        definition: 'The raw facts and experiences available to everyone (bottom of ladder)',
      },
      {
        term: 'Selected Data',
        definition: 'We selectively notice certain data based on our beliefs',
      },
      {
        term: 'Interpreted Meaning',
        definition: 'We add cultural and personal meanings to what we select',
      },
      {
        term: 'Reflexive Loop',
        definition: 'Our beliefs influence what data we select, creating self-reinforcing cycles',
      },
    ],
    examples: [
      'Colleague is quiet in meeting → "They\'re disengaged" → Avoid involving them → Relationship deteriorates',
      'Code review comment → "They think I\'m incompetent" → Defensive response → Communication breaks down',
      'Sales numbers down → "Product is failing" → Cut marketing → Accelerate decline',
    ],
    relatedFrameworks: ['argyris', 'weick', 'senge'],
    diagram: () => (
      <svg viewBox="0 0 300 220" style={{ width: '100%', height: 'auto' }}>
        <line x1="50" y1="200" x2="50" y2="40" stroke={accentColors.blue} strokeWidth="3" />
        <line x1="45" y1="200" x2="55" y2="200" stroke={accentColors.blue} strokeWidth="3" />
        <line x1="45" y1="160" x2="55" y2="160" stroke={accentColors.blue} strokeWidth="2" />
        <line x1="45" y1="130" x2="55" y2="130" stroke={accentColors.blue} strokeWidth="2" />
        <line x1="45" y1="100" x2="55" y2="100" stroke={accentColors.blue} strokeWidth="2" />
        <line x1="45" y1="70" x2="55" y2="70" stroke={accentColors.blue} strokeWidth="2" />
        <line x1="45" y1="40" x2="55" y2="40" stroke={accentColors.blue} strokeWidth="3" />
        <text x="70" y="205" fill={accentColors.blue} fontSize="10" fontWeight="600">
          Observable Data
        </text>
        <text x="70" y="165" fill={accentColors.blue} fontSize="10">
          Select Data
        </text>
        <text x="70" y="135" fill={accentColors.blue} fontSize="10">
          Add Meaning
        </text>
        <text x="70" y="105" fill={accentColors.blue} fontSize="10">
          Assumptions
        </text>
        <text x="70" y="75" fill={accentColors.blue} fontSize="10">
          Conclusions
        </text>
        <text x="70" y="45" fill={accentColors.blue} fontSize="10" fontWeight="600">
          Take Action
        </text>
        <path d="M 250 40 Q 280 120 50 190" stroke={colors.neutral[500]} strokeWidth="1.5" strokeDasharray="4,2" markerEnd="url(#arrowBlue)" />
        <text x="260" y="90" fill={colors.neutral[400]} fontSize="9">
          Reflexive
        </text>
        <text x="260" y="102" fill={colors.neutral[400]} fontSize="9">
          Loop
        </text>
        <defs>
          <marker id="arrowBlue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={colors.neutral[500]} />
          </marker>
        </defs>
      </svg>
    ),
  },
  {
    id: 'theory-u',
    name: 'Theory U',
    author: 'Otto Scharmer',
    year: 2007,
    color: accentColors.pink,
    colorBg: 'rgba(236, 72, 153, 0.1)',
    colorBorder: 'rgba(236, 72, 153, 0.3)',
    complexity: 'advanced',
    categories: ['Innovation', 'Leadership', 'Transformation'],
    tagline: 'Leading from the emerging future',
    coreIdea:
      'Theory U describes a journey of transformation: moving down the left side (sensing, letting go), reaching the bottom (presencing), and moving up the right side (letting come, prototyping). This process helps us let go of the past and connect with emerging possibilities.',
    whenToUse: [
      'Leading major organizational transformation',
      'Solving complex systemic problems',
      'Innovation requiring fresh perspectives',
      'Personal or collective breakthrough moments',
    ],
    keyConcepts: [
      {
        term: 'Downloading',
        definition: 'Seeing through habitual patterns and past frameworks',
      },
      {
        term: 'Presencing',
        definition: 'Connecting to the deepest source of knowing (sensing + presence)',
      },
      {
        term: 'Prototyping',
        definition: 'Exploring the future by doing, creating living examples',
      },
      {
        term: 'Letting Go & Letting Come',
        definition: 'Releasing the old to make space for the new to emerge',
      },
    ],
    examples: [
      'Company reinventing itself by deeply listening to emerging customer needs',
      'Social innovation through immersing in communities most affected',
      'Personal transformation through meditation and deep reflection',
    ],
    relatedFrameworks: ['weick', 'design-thinking', 'appreciative-inquiry'],
    diagram: () => (
      <svg viewBox="0 0 300 180" style={{ width: '100%', height: 'auto' }}>
        <path d="M 30 30 Q 80 60 100 100 Q 120 130 150 150 Q 180 130 200 100 Q 220 60 270 30" fill="none" stroke={accentColors.pink} strokeWidth="3" />
        <circle cx="30" cy="30" r="5" fill={accentColors.pink} />
        <text x="30" y="20" textAnchor="middle" fill={accentColors.pink} fontSize="9">
          Download
        </text>
        <circle cx="100" cy="100" r="5" fill={accentColors.pink} />
        <text x="100" y="120" textAnchor="middle" fill={accentColors.pink} fontSize="9">
          Let Go
        </text>
        <circle cx="150" cy="150" r="6" fill={accentColors.pink} />
        <text x="150" y="170" textAnchor="middle" fill={accentColors.pink} fontSize="10" fontWeight="600">
          Presencing
        </text>
        <circle cx="200" cy="100" r="5" fill={accentColors.pink} />
        <text x="200" y="120" textAnchor="middle" fill={accentColors.pink} fontSize="9">
          Let Come
        </text>
        <circle cx="270" cy="30" r="5" fill={accentColors.pink} />
        <text x="270" y="20" textAnchor="middle" fill={accentColors.pink} fontSize="9">
          Perform
        </text>
      </svg>
    ),
  },
  {
    id: 'design-thinking',
    name: 'Design Thinking',
    author: 'IDEO / Stanford d.school',
    year: 2005,
    color: accentColors.yellow,
    colorBg: 'rgba(234, 179, 8, 0.1)',
    colorBorder: 'rgba(234, 179, 8, 0.3)',
    complexity: 'beginner',
    categories: ['Innovation', 'Problem-Solving', 'Creativity'],
    tagline: 'Human-centered problem solving',
    coreIdea:
      'Design Thinking is an iterative process for solving problems creatively: Empathize (understand users), Define (frame the problem), Ideate (generate solutions), Prototype (build to think), Test (learn and refine). It emphasizes rapid experimentation and user feedback.',
    whenToUse: [
      'Developing new products or services',
      'Solving complex human-centered problems',
      'Fostering innovation and creativity',
      'When you need to deeply understand user needs',
    ],
    keyConcepts: [
      {
        term: 'Empathize',
        definition: 'Deeply understand the people you\'re designing for through observation and engagement',
      },
      {
        term: 'Define',
        definition: 'Frame the right problem based on insights from empathy work',
      },
      {
        term: 'Ideate',
        definition: 'Generate a wide range of creative solutions without judgment',
      },
      {
        term: 'Prototype & Test',
        definition: 'Build to learn quickly, test with users, iterate based on feedback',
      },
    ],
    examples: [
      'Redesigning hospital experiences by observing patients and staff',
      'Creating new banking services through customer journey mapping',
      'Developing educational tools by testing with students iteratively',
    ],
    relatedFrameworks: ['kolb', 'ooda', 'theory-u'],
    diagram: () => (
      <svg viewBox="0 0 300 140" style={{ width: '100%', height: 'auto' }}>
        <circle cx="40" cy="70" r="25" fill={accentColors.yellow} opacity="0.2" stroke={accentColors.yellow} strokeWidth="2" />
        <text x="40" y="75" textAnchor="middle" fill={accentColors.yellow} fontSize="9" fontWeight="600">
          Empathize
        </text>
        <path d="M 65 70 L 95 70" stroke={accentColors.yellow} strokeWidth="2" markerEnd="url(#arrowYellow)" />
        <circle cx="120" cy="70" r="25" fill={accentColors.yellow} opacity="0.2" stroke={accentColors.yellow} strokeWidth="2" />
        <text x="120" y="75" textAnchor="middle" fill={accentColors.yellow} fontSize="9" fontWeight="600">
          Define
        </text>
        <path d="M 145 70 L 175 70" stroke={accentColors.yellow} strokeWidth="2" markerEnd="url(#arrowYellow)" />
        <circle cx="200" cy="70" r="25" fill={accentColors.yellow} opacity="0.2" stroke={accentColors.yellow} strokeWidth="2" />
        <text x="200" y="75" textAnchor="middle" fill={accentColors.yellow} fontSize="9" fontWeight="600">
          Ideate
        </text>
        <path d="M 220 80 L 240 100" stroke={accentColors.yellow} strokeWidth="2" markerEnd="url(#arrowYellow)" />
        <ellipse cx="260" cy="110" rx="35" ry="20" fill={accentColors.yellow} opacity="0.2" stroke={accentColors.yellow} strokeWidth="2" strokeDasharray="4,2" />
        <text x="260" y="108" textAnchor="middle" fill={accentColors.yellow} fontSize="8">
          Prototype
        </text>
        <text x="260" y="118" textAnchor="middle" fill={accentColors.yellow} fontSize="8">
          & Test
        </text>
        <path d="M 230 105 L 210 85" stroke={accentColors.yellow} strokeWidth="1.5" strokeDasharray="3,2" markerEnd="url(#arrowYellow)" />
        <text x="150" y="20" textAnchor="middle" fill={colors.neutral[400]} fontSize="9">
          Iterate
        </text>
        <defs>
          <marker id="arrowYellow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={accentColors.yellow} />
          </marker>
        </defs>
      </svg>
    ),
  },
  {
    id: 'jtbd',
    name: 'Jobs to Be Done',
    author: 'Clayton Christensen',
    year: 2016,
    color: accentColors.blue,
    colorBg: 'rgba(59, 130, 246, 0.1)',
    colorBorder: 'rgba(59, 130, 246, 0.3)',
    complexity: 'intermediate',
    categories: ['Innovation', 'Problem-Solving', 'Strategy'],
    tagline: 'Understanding what people are trying to accomplish',
    coreIdea:
      'People don\'t buy products, they "hire" them to do a job. Understanding the job—the progress someone is trying to make in a particular circumstance—reveals why people choose solutions and how to innovate effectively.',
    whenToUse: [
      'Designing new products or services',
      'Understanding why customers choose (or don\'t choose) your solution',
      'Finding opportunities for innovation',
      'Reframing problems from customer perspective',
    ],
    keyConcepts: [
      {
        term: 'Job',
        definition: 'The progress a person is trying to make in a particular circumstance',
      },
      {
        term: 'Circumstances',
        definition: 'The context and constraints that shape what job needs to be done',
      },
      {
        term: 'Functional, Emotional, Social',
        definition: 'Jobs have functional (task), emotional (feeling), and social (perception) dimensions',
      },
      {
        term: 'Hire/Fire',
        definition: 'People hire solutions to do jobs and fire them when they don\'t perform',
      },
    ],
    examples: [
      'People hire milkshakes for a "make my commute less boring" job (not nutrition)',
      'Hiring a mattress for the job of "feel like a responsible adult" not just "sleep better"',
      'Students hire lectures, highlighting, and coffee to do the job of "pass the exam"',
    ],
    relatedFrameworks: ['design-thinking', 'cynefin', 'theory-u'],
    diagram: () => (
      <svg viewBox="0 0 300 160" style={{ width: '100%', height: 'auto' }}>
        <rect x="30" y="40" width="80" height="40" rx="4" fill={accentColors.blue} opacity="0.2" stroke={accentColors.blue} strokeWidth="2" />
        <text x="70" y="55" textAnchor="middle" fill={accentColors.blue} fontSize="9" fontWeight="600">
          Job to
        </text>
        <text x="70" y="68" textAnchor="middle" fill={accentColors.blue} fontSize="9" fontWeight="600">
          Be Done
        </text>
        <path d="M 110 60 L 160 60" stroke={accentColors.blue} strokeWidth="2" markerEnd="url(#arrowBlue)" />
        <rect x="160" y="40" width="100" height="40" rx="4" fill={accentColors.blue} opacity="0.3" stroke={accentColors.blue} strokeWidth="2" />
        <text x="210" y="55" textAnchor="middle" fill={accentColors.blue} fontSize="9" fontWeight="600">
          Solution
        </text>
        <text x="210" y="68" textAnchor="middle" fill={accentColors.blue} fontSize="9" fontWeight="600">
          (Hired)
        </text>
        <text x="70" y="110" textAnchor="middle" fill={colors.neutral[400]} fontSize="8">
          Circumstances
        </text>
        <text x="70" y="125" textAnchor="middle" fill={colors.neutral[400]} fontSize="8">
          Functional
        </text>
        <text x="70" y="138" textAnchor="middle" fill={colors.neutral[400]} fontSize="8">
          Emotional
        </text>
        <text x="70" y="151" textAnchor="middle" fill={colors.neutral[400]} fontSize="8">
          Social
        </text>
        <defs>
          <marker id="arrowBlue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={accentColors.blue} />
          </marker>
        </defs>
      </svg>
    ),
  },
  {
    id: 'kegan',
    name: 'Constructive-Developmental Theory',
    author: 'Robert Kegan',
    year: 1982,
    color: accentColors.pink,
    colorBg: 'rgba(236, 72, 153, 0.1)',
    colorBorder: 'rgba(236, 72, 153, 0.3)',
    complexity: 'advanced',
    categories: ['Growth', 'Development', 'Self-Awareness'],
    tagline: 'How we make meaning evolves through life stages',
    coreIdea:
      'We develop through qualitatively different stages of meaning-making, each more complex than the last. What we were "subject to" (couldn\'t see) becomes "object" (we can observe and choose). Most adults operate at stages 2-4, with stage 5 being rare.',
    whenToUse: [
      'Understanding why people struggle with certain challenges',
      'Designing developmental experiences and education',
      'Navigating personal growth plateaus',
      'Building self-authorship and autonomy',
    ],
    keyConcepts: [
      {
        term: 'Subject-Object Shift',
        definition: 'Growth means making what was implicit (subject) explicit (object) so we can reflect on it',
      },
      {
        term: 'Stage 2: Instrumental',
        definition: 'Needs and interests drive decisions (concrete, transactional)',
      },
      {
        term: 'Stage 3: Socialized',
        definition: 'Relationships and others\' expectations shape identity (seeks approval)',
      },
      {
        term: 'Stage 4: Self-Authoring',
        definition: 'Internal values and principles guide decisions (self-directed)',
      },
      {
        term: 'Stage 5: Self-Transforming',
        definition: 'Hold multiple perspectives, see the limits of all systems (rare)',
      },
    ],
    examples: [
      'Stage 3→4 transition: Moving from "what should I do?" to "what do I believe is right?"',
      'Recognizing you\'ve been living by others\' values (subject) and choosing your own (object)',
      'A leader moving from needing approval to standing by unpopular decisions',
    ],
    relatedFrameworks: ['argyris', 'theory-u', 'johari'],
    diagram: () => (
      <svg viewBox="0 0 300 180" style={{ width: '100%', height: 'auto' }}>
        <path d="M 40 140 Q 80 120 120 100 Q 160 80 200 70 Q 240 65 280 65" stroke={accentColors.pink} strokeWidth="3" fill="none" />
        <circle cx="40" cy="140" r="8" fill={accentColors.pink} opacity="0.3" />
        <text x="40" y="160" textAnchor="middle" fill={accentColors.pink} fontSize="8">
          S2
        </text>
        <circle cx="120" cy="100" r="8" fill={accentColors.pink} opacity="0.5" />
        <text x="120" y="120" textAnchor="middle" fill={accentColors.pink} fontSize="8">
          S3
        </text>
        <circle cx="200" cy="70" r="8" fill={accentColors.pink} opacity="0.7" />
        <text x="200" y="90" textAnchor="middle" fill={accentColors.pink} fontSize="8">
          S4
        </text>
        <circle cx="280" cy="65" r="8" fill={accentColors.pink} />
        <text x="280" y="85" textAnchor="middle" fill={accentColors.pink} fontSize="8">
          S5
        </text>
        <text x="150" y="30" textAnchor="middle" fill={colors.neutral[400]} fontSize="10" fontWeight="600">
          Subject → Object
        </text>
      </svg>
    ),
  },
  {
    id: 'appreciative-inquiry',
    name: 'Appreciative Inquiry',
    author: 'David Cooperrider',
    year: 1987,
    color: accentColors.orange,
    colorBg: 'rgba(249, 115, 22, 0.1)',
    colorBorder: 'rgba(249, 115, 22, 0.3)',
    complexity: 'intermediate',
    categories: ['Organizational', 'Change', 'Positive Psychology'],
    tagline: 'Change by focusing on what works, not what\'s broken',
    coreIdea:
      'Organizations change in the direction of what they study. Appreciative Inquiry shifts focus from problem-solving to appreciating and amplifying existing strengths. The 4-D cycle: Discover (what works), Dream (what could be), Design (what should be), Destiny (what will be).',
    whenToUse: [
      'Organizational change and transformation',
      'Team building and culture development',
      'When problem-focused approaches create fatigue',
      'Amplifying existing successes',
    ],
    keyConcepts: [
      {
        term: 'Discover',
        definition: 'Identify and appreciate the best of what is (success stories, strengths)',
      },
      {
        term: 'Dream',
        definition: 'Envision what might be (aspirational future grounded in strengths)',
      },
      {
        term: 'Design',
        definition: 'Co-construct how things should be (systems, structures, strategies)',
      },
      {
        term: 'Destiny',
        definition: 'Sustain and evolve what will be (implementation and adaptation)',
      },
    ],
    examples: [
      'Instead of "why do teams fail?" ask "when do teams excel and how can we do more of that?"',
      'Retrospective focused on "what gave us energy?" rather than "what went wrong?"',
      'Career development by exploring peak experiences rather than fixing weaknesses',
    ],
    relatedFrameworks: ['design-thinking', 'senge', 'theory-u'],
    diagram: () => (
      <svg viewBox="0 0 300 200" style={{ width: '100%', height: 'auto' }}>
        <circle cx="150" cy="100" r="80" fill="none" stroke={accentColors.orange} strokeWidth="2" />
        <circle cx="150" cy="40" r="25" fill={accentColors.orange} opacity="0.2" stroke={accentColors.orange} strokeWidth="2" />
        <text x="150" y="45" textAnchor="middle" fill={accentColors.orange} fontSize="10" fontWeight="600">
          Discover
        </text>
        <circle cx="230" cy="100" r="25" fill={accentColors.orange} opacity="0.2" stroke={accentColors.orange} strokeWidth="2" />
        <text x="230" y="105" textAnchor="middle" fill={accentColors.orange} fontSize="10" fontWeight="600">
          Dream
        </text>
        <circle cx="150" cy="160" r="25" fill={accentColors.orange} opacity="0.2" stroke={accentColors.orange} strokeWidth="2" />
        <text x="150" y="165" textAnchor="middle" fill={accentColors.orange} fontSize="10" fontWeight="600">
          Design
        </text>
        <circle cx="70" cy="100" r="25" fill={accentColors.orange} opacity="0.2" stroke={accentColors.orange} strokeWidth="2" />
        <text x="70" y="105" textAnchor="middle" fill={accentColors.orange} fontSize="10" fontWeight="600">
          Destiny
        </text>
        <path d="M 165 55 L 215 90" stroke={accentColors.orange} strokeWidth="2" markerEnd="url(#arrowOrange)" />
        <path d="M 220 115 L 165 150" stroke={accentColors.orange} strokeWidth="2" markerEnd="url(#arrowOrange)" />
        <path d="M 135 150 L 85 115" stroke={accentColors.orange} strokeWidth="2" markerEnd="url(#arrowOrange)" />
        <path d="M 80 85 L 135 55" stroke={accentColors.orange} strokeWidth="2" markerEnd="url(#arrowOrange)" />
        <defs>
          <marker id="arrowOrange" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={accentColors.orange} />
          </marker>
        </defs>
      </svg>
    ),
  },
  {
    id: 'wardley-mapping',
    name: 'Wardley Mapping',
    author: 'Simon Wardley',
    year: 2005,
    color: accentColors.red,
    colorBg: 'rgba(239, 68, 68, 0.1)',
    colorBorder: 'rgba(239, 68, 68, 0.3)',
    complexity: 'advanced',
    categories: ['Strategy', 'Systems', 'Decision-Making'],
    tagline: 'Strategic mapping through value chain evolution',
    coreIdea:
      'Wardley Maps visualize the components needed to serve user needs, positioned by visibility (value chain) and evolution (genesis→custom→product→commodity). This reveals strategic opportunities, competitive landscape, and where to invest or outsource.',
    whenToUse: [
      'Strategic planning and decision-making',
      'Understanding competitive dynamics',
      'Deciding build vs buy decisions',
      'Identifying areas for innovation or commoditization',
    ],
    keyConcepts: [
      {
        term: 'Value Chain',
        definition: 'Components arranged by visibility to user (user needs at top, infrastructure below)',
      },
      {
        term: 'Evolution Axis',
        definition: 'Components evolve from Genesis → Custom → Product → Commodity over time',
      },
      {
        term: 'Climatic Patterns',
        definition: 'Universal patterns that shape evolution (e.g., commoditization, componentization)',
      },
      {
        term: 'Doctrine & Gameplay',
        definition: 'Universal principles (doctrine) and context-specific moves (gameplay)',
      },
    ],
    examples: [
      'Mapping a startup to identify which components to build vs buy (e.g., build unique value, buy commodity infrastructure)',
      'Understanding why competitors made certain strategic choices',
      'Identifying opportunities for disruption where custom solutions are becoming products',
    ],
    relatedFrameworks: ['cynefin', 'senge', 'ooda'],
    diagram: () => (
      <svg viewBox="0 0 300 180" style={{ width: '100%', height: 'auto' }}>
        <line x1="40" y1="40" x2="40" y2="160" stroke={colors.neutral[400]} strokeWidth="1" />
        <line x1="40" y1="160" x2="280" y2="160" stroke={colors.neutral[400]} strokeWidth="1" />
        <text x="15" y="100" textAnchor="middle" fill={colors.neutral[400]} fontSize="9" transform="rotate(-90 15 100)">
          Value Chain
        </text>
        <text x="160" y="175" textAnchor="middle" fill={colors.neutral[400]} fontSize="9">
          Evolution →
        </text>
        <circle cx="80" cy="70" r="12" fill={accentColors.red} opacity="0.3" stroke={accentColors.red} strokeWidth="2" />
        <text x="80" y="74" textAnchor="middle" fill={accentColors.red} fontSize="8">
          A
        </text>
        <circle cx="150" cy="100" r="12" fill={accentColors.red} opacity="0.5" stroke={accentColors.red} strokeWidth="2" />
        <text x="150" y="104" textAnchor="middle" fill={accentColors.red} fontSize="8">
          B
        </text>
        <circle cx="240" cy="130" r="12" fill={accentColors.red} opacity="0.7" stroke={accentColors.red} strokeWidth="2" />
        <text x="240" y="134" textAnchor="middle" fill={accentColors.red} fontSize="8">
          C
        </text>
        <line x1="80" y1="82" x2="150" y2="88" stroke={accentColors.red} strokeWidth="1.5" strokeDasharray="3,2" />
        <line x1="150" y1="112" x2="240" y2="118" stroke={accentColors.red} strokeWidth="1.5" strokeDasharray="3,2" />
        <text x="80" y="25" textAnchor="middle" fill={colors.neutral[500]} fontSize="8">
          Genesis
        </text>
        <text x="240" y="25" textAnchor="middle" fill={colors.neutral[500]} fontSize="8">
          Commodity
        </text>
      </svg>
    ),
  },
  {
    id: 'immunity-to-change',
    name: 'Immunity to Change',
    author: 'Robert Kegan & Lisa Lahey',
    year: 2009,
    color: '#14b8a6', // teal
    colorBg: 'rgba(20, 184, 166, 0.1)',
    colorBorder: 'rgba(20, 184, 166, 0.3)',
    complexity: 'intermediate',
    categories: ['Growth', 'Change', 'Self-Awareness'],
    tagline: 'Uncovering hidden commitments that block change',
    coreIdea:
      'We often fail to change not due to lack of willpower but because we have an "immunity" - a hidden competing commitment that protects us from a big assumption we hold. The four-column process reveals this immune system and enables genuine transformation.',
    whenToUse: [
      'Stuck despite genuine effort to change',
      'Personal development plateaus',
      'Understanding resistance to change',
      'Facilitating deep behavioral shifts',
    ],
    keyConcepts: [
      {
        term: 'Improvement Goal',
        definition: 'The change you genuinely want to make',
      },
      {
        term: 'Doing/Not Doing Instead',
        definition: 'Behaviors that work against your goal (observing your immunity)',
      },
      {
        term: 'Hidden Competing Commitment',
        definition: 'What you\'re unconsciously committed to that blocks change',
      },
      {
        term: 'Big Assumption',
        definition: 'The belief that makes the competing commitment feel necessary',
      },
    ],
    examples: [
      'Goal: Delegate more. Hidden commitment: Maintaining control. Big assumption: "If I don\'t do it, it won\'t be done right"',
      'Goal: Speak up in meetings. Hidden commitment: Avoiding conflict. Big assumption: "Disagreement damages relationships"',
      'Goal: Exercise regularly. Hidden commitment: Avoiding discomfort. Big assumption: "I can\'t handle feeling uncomfortable"',
    ],
    relatedFrameworks: ['argyris', 'kegan', 'ladder-inference'],
    diagram: () => (
      <svg viewBox="0 0 300 180" style={{ width: '100%', height: 'auto' }}>
        <rect x="20" y="30" width="60" height="35" rx="4" fill="#14b8a6" opacity="0.2" stroke="#14b8a6" strokeWidth="2" />
        <text x="50" y="43" textAnchor="middle" fill="#14b8a6" fontSize="8" fontWeight="600">
          Goal
        </text>
        <text x="50" y="55" textAnchor="middle" fill="#14b8a6" fontSize="7">
          What I want
        </text>
        <path d="M 80 47 L 105 47" stroke="#14b8a6" strokeWidth="2" markerEnd="url(#arrowTeal)" />
        <rect x="105" y="30" width="60" height="35" rx="4" fill="#ef4444" opacity="0.15" stroke="#ef4444" strokeWidth="2" />
        <text x="135" y="43" textAnchor="middle" fill="#ef4444" fontSize="8" fontWeight="600">
          Behaviors
        </text>
        <text x="135" y="55" textAnchor="middle" fill="#ef4444" fontSize="7">
          What I do
        </text>
        <path d="M 135 65 L 135 90" stroke="#14b8a6" strokeWidth="2" markerEnd="url(#arrowTeal)" />
        <rect x="105" y="90" width="60" height="35" rx="4" fill="#f97316" opacity="0.2" stroke="#f97316" strokeWidth="2" />
        <text x="135" y="103" textAnchor="middle" fill="#f97316" fontSize="8" fontWeight="600">
          Hidden
        </text>
        <text x="135" y="113" textAnchor="middle" fill="#f97316" fontSize="8" fontWeight="600">
          Commitment
        </text>
        <path d="M 165 107 L 195 107" stroke="#14b8a6" strokeWidth="2" markerEnd="url(#arrowTeal)" />
        <rect x="195" y="90" width="70" height="35" rx="4" fill="#a855f7" opacity="0.15" stroke="#a855f7" strokeWidth="2" />
        <text x="230" y="103" textAnchor="middle" fill="#a855f7" fontSize="8" fontWeight="600">
          Big
        </text>
        <text x="230" y="113" textAnchor="middle" fill="#a855f7" fontSize="8" fontWeight="600">
          Assumption
        </text>
        <defs>
          <marker id="arrowTeal" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#14b8a6" />
          </marker>
        </defs>
      </svg>
    ),
  },
  {
    id: 'polyvagal',
    name: 'Polyvagal Theory',
    author: 'Stephen Porges',
    year: 1994,
    color: '#8b5cf6', // violet
    colorBg: 'rgba(139, 92, 246, 0.1)',
    colorBorder: 'rgba(139, 92, 246, 0.3)',
    complexity: 'intermediate',
    categories: ['Neuroscience', 'Self-Awareness', 'Body'],
    tagline: 'How the nervous system shapes safety and connection',
    coreIdea:
      'The autonomic nervous system has three hierarchical states: Ventral Vagal (safe & social), Sympathetic (fight/flight), Dorsal Vagal (shutdown/freeze). Understanding these states and their neuroception (unconscious safety detection) helps regulate emotions and relationships.',
    whenToUse: [
      'Understanding emotional regulation and dysregulation',
      'Trauma-informed practice and healing',
      'Improving interpersonal connection and safety',
      'Managing stress and nervous system health',
    ],
    keyConcepts: [
      {
        term: 'Ventral Vagal State',
        definition: 'Safe & social: calm, connected, curious, able to engage (optimal zone)',
      },
      {
        term: 'Sympathetic State',
        definition: 'Mobilization: fight or flight response to threat (activated, anxious)',
      },
      {
        term: 'Dorsal Vagal State',
        definition: 'Shutdown: freeze, collapse, dissociation when threat is overwhelming',
      },
      {
        term: 'Neuroception',
        definition: 'Unconscious detection of safety or danger (below conscious awareness)',
      },
      {
        term: 'Co-regulation',
        definition: 'Nervous systems regulate each other through safe connection',
      },
    ],
    examples: [
      'Recognizing you\'re in sympathetic activation (tight chest, racing thoughts) and using breathwork to shift to ventral',
      'Understanding why you shut down (dorsal) in certain conflicts',
      'Creating ventral vagal cues (warm tone, eye contact) to help others feel safe',
    ],
    relatedFrameworks: ['johari', 'schon', 'kegan'],
    diagram: () => (
      <svg viewBox="0 0 300 180" style={{ width: '100%', height: 'auto' }}>
        <rect x="60" y="20" width="180" height="35" rx="4" fill="#8b5cf6" opacity="0.3" stroke="#8b5cf6" strokeWidth="2" />
        <text x="150" y="35" textAnchor="middle" fill="#8b5cf6" fontSize="10" fontWeight="600">
          Ventral Vagal
        </text>
        <text x="150" y="48" textAnchor="middle" fill="#8b5cf6" fontSize="8">
          Safe & Social
        </text>
        <path d="M 150 55 L 120 75" stroke={colors.neutral[400]} strokeWidth="2" />
        <path d="M 150 55 L 180 75" stroke={colors.neutral[400]} strokeWidth="2" />
        <rect x="40" y="75" width="120" height="35" rx="4" fill="#f97316" opacity="0.2" stroke="#f97316" strokeWidth="2" />
        <text x="100" y="90" textAnchor="middle" fill="#f97316" fontSize="10" fontWeight="600">
          Sympathetic
        </text>
        <text x="100" y="103" textAnchor="middle" fill="#f97316" fontSize="8">
          Fight / Flight
        </text>
        <rect x="140" y="75" width="120" height="35" rx="4" fill="#6366f1" opacity="0.2" stroke="#6366f1" strokeWidth="2" />
        <text x="200" y="90" textAnchor="middle" fill="#6366f1" fontSize="10" fontWeight="600">
          Dorsal Vagal
        </text>
        <text x="200" y="103" textAnchor="middle" fill="#6366f1" fontSize="8">
          Shutdown / Freeze
        </text>
        <path d="M 100 110 L 100 135" stroke={colors.neutral[400]} strokeWidth="2" markerEnd="url(#arrowViolet)" />
        <path d="M 200 110 L 200 135" stroke={colors.neutral[400]} strokeWidth="2" markerEnd="url(#arrowViolet)" />
        <rect x="60" y="135" width="180" height="25" rx="4" fill={colors.neutral[800]} opacity="0.3" stroke={colors.neutral[600]} strokeWidth="1" strokeDasharray="3,2" />
        <text x="150" y="150" textAnchor="middle" fill={colors.neutral[400]} fontSize="9">
          Threat / Overwhelm
        </text>
        <defs>
          <marker id="arrowViolet" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={colors.neutral[400]} />
          </marker>
        </defs>
      </svg>
    ),
  },
];

const STORAGE_KEY = 'aura-framework-encyclopedia';

type UserData = {
  bookmarks: string[];
  viewedFrameworks: string[];
  notes: Record<string, string>;
  preferredView: ViewMode;
  preferredSort: SortMode;
};

const defaultUserData: UserData = {
  bookmarks: [],
  viewedFrameworks: [],
  notes: {},
  preferredView: 'grid',
  preferredSort: 'alphabetical',
};

export default function FrameworkEncyclopedia() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortMode, setSortMode] = useState<SortMode>('alphabetical');
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [complexityFilter, setComplexityFilter] = useState<string[]>([]);
  const [userData, setUserData] = useState<UserData>(defaultUserData);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [noteEditingId, setNoteEditingId] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);

  // Load user data
  useEffect(() => {
    try {
      const saved = StorageManager.getUntyped(STORAGE_KEY) as any | null;
      if (saved) {
        setUserData({ ...defaultUserData, ...saved });
        setViewMode(saved.preferredView || 'grid');
        setSortMode(saved.preferredSort || 'alphabetical');
      }
    } catch (e) {
      console.error('Failed to load user data:', e);
    }
  }, []);

  // Save user data
  const saveUserData = (newData: Partial<UserData>) => {
    const updated = { ...userData, ...newData };
    setUserData(updated);
    StorageManager.setUntyped(STORAGE_KEY, updated);
  };

  const toggleBookmark = (id: string) => {
    const bookmarks = userData.bookmarks.includes(id)
      ? userData.bookmarks.filter((b) => b !== id)
      : [...userData.bookmarks, id];
    saveUserData({ bookmarks });
  };

  const markAsViewed = (id: string) => {
    if (!userData.viewedFrameworks.includes(id)) {
      saveUserData({ viewedFrameworks: [...userData.viewedFrameworks, id] });
    }
  };

  const updateNote = (id: string, note: string) => {
    saveUserData({ notes: { ...userData.notes, [id]: note } });
  };

  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    saveUserData({ preferredView: mode });
  };

  const handleSortChange = (mode: SortMode) => {
    setSortMode(mode);
    saveUserData({ preferredSort: mode });
  };

  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    frameworks.forEach((f) => f.categories.forEach((c) => cats.add(c)));
    return Array.from(cats).sort();
  }, []);

  const filteredAndSortedFrameworks = useMemo(() => {
    let result = frameworks.filter((f) => {
      if (showBookmarksOnly && !userData.bookmarks.includes(f.id)) return false;
      if (!searchQuery.trim() && categoryFilter.length === 0 && complexityFilter.length === 0)
        return true;

      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        f.name.toLowerCase().includes(query) ||
        f.author.toLowerCase().includes(query) ||
        f.tagline.toLowerCase().includes(query) ||
        f.coreIdea.toLowerCase().includes(query) ||
        f.categories.some((c) => c.toLowerCase().includes(query)) ||
        f.whenToUse.some((w) => w.toLowerCase().includes(query)) ||
        f.keyConcepts.some(
          (k) =>
            k.term.toLowerCase().includes(query) || k.definition.toLowerCase().includes(query)
        );

      const matchesCategory =
        categoryFilter.length === 0 || f.categories.some((c) => categoryFilter.includes(c));
      const matchesComplexity =
        complexityFilter.length === 0 || complexityFilter.includes(f.complexity);

      return matchesSearch && matchesCategory && matchesComplexity;
    });

    // Sort
    result.sort((a, b) => {
      switch (sortMode) {
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        case 'complexity':
          const complexityOrder = { beginner: 0, intermediate: 1, advanced: 2 };
          return complexityOrder[a.complexity] - complexityOrder[b.complexity];
        case 'year':
          return (b.year || 0) - (a.year || 0);
        case 'popularity':
          return userData.viewedFrameworks.filter((id) => id === b.id).length -
            userData.viewedFrameworks.filter((id) => id === a.id).length;
        default:
          return 0;
      }
    });

    return result;
  }, [searchQuery, categoryFilter, complexityFilter, sortMode, showBookmarksOnly, userData]);

  const selectedFrameworks = frameworks.filter((f) => selectedIds.includes(f.id));

  const handleFrameworkClick = (id: string) => {
    if (compareMode) {
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter((sid) => sid !== id));
      } else if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
        markAsViewed(id);
      }
    } else {
      setSelectedIds([id]);
      markAsViewed(id);
    }
  };

  const complexityColors = {
    beginner: accentColors.green,
    intermediate: accentColors.yellow,
    advanced: accentColors.orange,
  };

  return (
    <div
      style={{
        padding: spacing.xl,
        maxWidth: 1600,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.xl,
        minHeight: '100dvh',
        position: 'relative',
      }}
    >
      {/* Ambient Background Effects */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '20%',
            width: 400,
            height: 400,
            background: `radial-gradient(circle, ${accentColors.cyan}15 0%, transparent 70%)`,
            filter: 'blur(80px)',
            animation: 'float 8s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '40%',
            right: '10%',
            width: 350,
            height: 350,
            background: `radial-gradient(circle, ${accentColors.purple}12 0%, transparent 70%)`,
            filter: 'blur(80px)',
            animation: 'float 10s ease-in-out infinite',
            animationDelay: '-3s',
          }}
        />
      </div>

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: spacing.lg,
            marginBottom: spacing.md,
            padding: spacing.xl,
            background: 'rgba(23, 23, 23, 0.6)',
            backdropFilter: 'blur(16px)',
            borderRadius: 20,
            border: `1px solid rgba(64, 64, 64, 0.3)`,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.lg }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: `linear-gradient(135deg, ${accentColors.cyan}20, ${accentColors.purple}20)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${accentColors.cyan}30`,
                boxShadow: `0 0 24px ${accentColors.cyan}20`,
              }}
            >
              <Book size={28} style={{ color: accentColors.cyan }} />
            </div>
            <div>
              <h1
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  fontFamily: "'Cormorant Garamond', serif",
                  background: `linear-gradient(135deg, ${accentColors.cyan}, ${accentColors.purple}, ${accentColors.pink})`,
                  backgroundSize: '200% 200%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: 0,
                  letterSpacing: '-0.02em',
                  animation: 'gradientShift 8s ease infinite',
                }}
              >
                Framework Encyclopedia
              </h1>
              <p
                style={{
                  fontSize: 15,
                  color: colors.neutral[400],
                  margin: 0,
                  marginTop: 6,
                  letterSpacing: '0.02em',
                }}
              >
                <span style={{ color: accentColors.cyan, fontWeight: 600 }}>{frameworks.length}</span> research-backed frameworks for sensemaking and growth
              </p>
            </div>
          </div>

          {/* View & Compare Controls */}
          <div style={{ display: 'flex', gap: spacing.sm, alignItems: 'center' }}>
            <button
              onClick={() => setCompareMode(!compareMode)}
              style={{
                padding: `${spacing.md} ${spacing.lg}`,
                background: compareMode 
                  ? `linear-gradient(135deg, ${accentColors.purple}, ${accentColors.purple}dd)`
                  : 'rgba(45, 45, 45, 0.8)',
                border: `1px solid ${compareMode ? accentColors.purple : colors.neutral[600]}`,
                borderRadius: 12,
                color: compareMode ? colors.neutral[100] : colors.neutral[300],
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: spacing.sm,
                fontSize: 13,
                fontWeight: 600,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backdropFilter: 'blur(8px)',
                boxShadow: compareMode ? `0 4px 20px ${accentColors.purple}40` : 'none',
              }}
            >
              <GitCompare size={16} />
              Compare {compareMode && `(${selectedIds.length}/3)`}
            </button>
            <button
              onClick={() => handleViewChange(viewMode === 'grid' ? 'list' : 'grid')}
              style={{
                padding: spacing.md,
                background: 'rgba(45, 45, 45, 0.8)',
                border: `1px solid ${colors.neutral[600]}`,
                borderRadius: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {viewMode === 'grid' ? (
                <List size={18} style={{ color: colors.neutral[400] }} />
              ) : (
                <Grid3x3 size={18} style={{ color: colors.neutral[400] }} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', gap: spacing.md, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 300 }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: spacing.lg,
                top: '50%',
                transform: 'translateY(-50%)',
                color: searchQuery ? accentColors.cyan : colors.neutral[500],
                transition: 'color 0.3s',
              }}
            />
            <input
              type="text"
              placeholder="Search frameworks, concepts, authors, use cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: `${spacing.lg} ${spacing.lg} ${spacing.lg} 52px`,
                background: 'rgba(30, 30, 30, 0.8)',
                backdropFilter: 'blur(12px)',
                border: `2px solid ${searchQuery ? accentColors.cyan : 'rgba(64, 64, 64, 0.5)'}`,
                borderRadius: 16,
                color: colors.neutral[100],
                fontSize: 15,
                fontFamily: 'inherit',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: searchQuery ? `0 0 20px ${accentColors.cyan}20` : '0 4px 16px rgba(0, 0, 0, 0.3)',
              }}
            />
            {searchQuery && (
              <X
                size={18}
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: spacing.lg,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.neutral[400],
                  cursor: 'pointer',
                  padding: 4,
                  borderRadius: 8,
                  transition: 'all 0.2s',
                }}
              />
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: `${spacing.md} ${spacing.lg}`,
              background: showFilters 
                ? `linear-gradient(135deg, ${accentColors.purple}, ${accentColors.purple}dd)`
                : 'rgba(45, 45, 45, 0.8)',
              backdropFilter: 'blur(12px)',
              border: `2px solid ${showFilters ? accentColors.purple : 'rgba(64, 64, 64, 0.5)'}`,
              borderRadius: 14,
              color: colors.neutral[100],
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
              fontSize: 14,
              fontWeight: 600,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: showFilters ? `0 4px 20px ${accentColors.purple}40` : '0 4px 16px rgba(0, 0, 0, 0.3)',
            }}
          >
            <Filter size={16} />
            Filters
            {(categoryFilter.length > 0 || complexityFilter.length > 0) && (
              <span
                style={{
                  background: `linear-gradient(135deg, ${accentColors.cyan}, ${accentColors.cyan}dd)`,
                  color: colors.neutral[900],
                  borderRadius: 12,
                  padding: '3px 10px',
                  fontSize: 11,
                  fontWeight: 700,
                  boxShadow: `0 2px 8px ${accentColors.cyan}40`,
                }}
              >
                {categoryFilter.length + complexityFilter.length}
              </span>
            )}
          </button>

          <button
            onClick={() => handleSortChange(
              sortMode === 'alphabetical' ? 'complexity' :
              sortMode === 'complexity' ? 'year' :
              sortMode === 'year' ? 'popularity' : 'alphabetical'
            )}
            style={{
              padding: `${spacing.md} ${spacing.lg}`,
              background: 'rgba(45, 45, 45, 0.8)',
              backdropFilter: 'blur(12px)',
              border: `2px solid rgba(64, 64, 64, 0.5)`,
              borderRadius: 14,
              color: colors.neutral[100],
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
              fontSize: 14,
              fontWeight: 600,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
            }}
          >
            <ArrowUpDown size={16} />
            {sortMode === 'alphabetical' && 'A-Z'}
            {sortMode === 'complexity' && 'Complexity'}
            {sortMode === 'year' && 'Year'}
            {sortMode === 'popularity' && 'Popular'}
          </button>

          <button
            onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
            style={{
              padding: `${spacing.md} ${spacing.lg}`,
              background: showBookmarksOnly 
                ? `linear-gradient(135deg, ${accentColors.yellow}, ${accentColors.orange})`
                : 'rgba(45, 45, 45, 0.8)',
              backdropFilter: 'blur(12px)',
              border: `2px solid ${showBookmarksOnly ? accentColors.yellow : 'rgba(64, 64, 64, 0.5)'}`,
              borderRadius: 14,
              color: showBookmarksOnly ? colors.neutral[900] : colors.neutral[100],
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
              fontSize: 14,
              fontWeight: 600,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: showBookmarksOnly ? `0 4px 20px ${accentColors.yellow}40` : '0 4px 16px rgba(0, 0, 0, 0.3)',
            }}
          >
            <Star size={16} fill={showBookmarksOnly ? colors.neutral[900] : 'none'} />
            Bookmarked ({userData.bookmarks.length})
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div
            style={{
              padding: spacing.xl,
              background: 'rgba(20, 20, 25, 0.9)',
              backdropFilter: 'blur(16px)',
              border: `1px solid rgba(64, 64, 64, 0.4)`,
              borderRadius: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: spacing.xl,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              animation: 'fadeInUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: colors.neutral[500],
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: spacing.md,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.sm,
                }}
              >
                <span style={{ width: 16, height: 1, background: `linear-gradient(90deg, ${accentColors.cyan}, transparent)` }} />
                Categories
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.sm }}>
                {allCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() =>
                      setCategoryFilter(
                        categoryFilter.includes(cat)
                          ? categoryFilter.filter((c) => c !== cat)
                          : [...categoryFilter, cat]
                      )
                    }
                    style={{
                      padding: `${spacing.sm} ${spacing.md}`,
                      background: categoryFilter.includes(cat)
                        ? `linear-gradient(135deg, ${accentColors.cyan}, ${accentColors.cyan}dd)`
                        : 'rgba(45, 45, 45, 0.6)',
                      border: `1px solid ${
                        categoryFilter.includes(cat) ? accentColors.cyan : 'rgba(64, 64, 64, 0.5)'
                      }`,
                      borderRadius: 24,
                      color: categoryFilter.includes(cat) ? colors.neutral[900] : colors.neutral[300],
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 600,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: categoryFilter.includes(cat) ? `0 2px 12px ${accentColors.cyan}30` : 'none',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: colors.neutral[500],
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: spacing.md,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.sm,
                }}
              >
                <span style={{ width: 16, height: 1, background: `linear-gradient(90deg, ${accentColors.purple}, transparent)` }} />
                Complexity
              </div>
              <div style={{ display: 'flex', gap: spacing.sm }}>
                {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() =>
                      setComplexityFilter(
                        complexityFilter.includes(level)
                          ? complexityFilter.filter((l) => l !== level)
                          : [...complexityFilter, level]
                      )
                    }
                    style={{
                      padding: `${spacing.sm} ${spacing.lg}`,
                      background: complexityFilter.includes(level)
                        ? complexityColors[level]
                        : 'rgba(45, 45, 45, 0.6)',
                      border: `1px solid ${
                        complexityFilter.includes(level)
                          ? complexityColors[level]
                          : 'rgba(64, 64, 64, 0.5)'
                      }`,
                      borderRadius: 24,
                      color: complexityFilter.includes(level)
                        ? colors.neutral[900]
                        : colors.neutral[300],
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: complexityFilter.includes(level) ? `0 2px 12px ${complexityColors[level]}40` : 'none',
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {(categoryFilter.length > 0 || complexityFilter.length > 0) && (
              <button
                onClick={() => {
                  setCategoryFilter([]);
                  setComplexityFilter([]);
                }}
                style={{
                  padding: `${spacing.sm} ${spacing.lg}`,
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${accentColors.red}40`,
                  borderRadius: 12,
                  color: accentColors.red,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  alignSelf: 'flex-start',
                  transition: 'all 0.2s',
                }}
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      <div 
        style={{ 
          fontSize: 14, 
          color: colors.neutral[500],
          display: 'flex',
          alignItems: 'center',
          gap: spacing.sm,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <span style={{ 
          width: 8, 
          height: 8, 
          borderRadius: '50%', 
          background: filteredAndSortedFrameworks.length > 0 ? accentColors.green : accentColors.red,
          boxShadow: `0 0 8px ${filteredAndSortedFrameworks.length > 0 ? accentColors.green : accentColors.red}60`,
        }} />
        Showing <span style={{ color: colors.neutral[300], fontWeight: 600 }}>{filteredAndSortedFrameworks.length}</span> of {frameworks.length} frameworks
      </div>

      {/* Framework Grid/List */}
      {filteredAndSortedFrameworks.length > 0 ? (
        <div
          style={{
            display: viewMode === 'grid' ? 'grid' : 'flex',
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(360px, 1fr))' : undefined,
            flexDirection: viewMode === 'list' ? 'column' : undefined,
            gap: spacing.xl,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {filteredAndSortedFrameworks.map((framework, index) => {
            const isBookmarked = userData.bookmarks.includes(framework.id);
            const isViewed = userData.viewedFrameworks.includes(framework.id);
            const isSelected = selectedIds.includes(framework.id);

            return (
              <div
                key={framework.id}
                onClick={() => handleFrameworkClick(framework.id)}
                style={{
                  border: `1px solid ${isSelected ? framework.color : 'rgba(64, 64, 64, 0.4)'}`,
                  borderRadius: 20,
                  padding: spacing.xl,
                  background: `linear-gradient(145deg, ${framework.colorBg}, rgba(20, 20, 25, 0.9))`,
                  backdropFilter: 'blur(12px)',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isSelected 
                    ? `0 8px 32px ${framework.color}30, inset 0 0 0 1px ${framework.color}40`
                    : '0 4px 24px rgba(0, 0, 0, 0.4)',
                  animation: `fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.05}s both`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px) scale(1.01)';
                  e.currentTarget.style.boxShadow = `0 20px 40px ${framework.colorBorder}, 0 0 40px ${framework.color}20`;
                  e.currentTarget.style.borderColor = framework.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = isSelected 
                    ? `0 8px 32px ${framework.color}30, inset 0 0 0 1px ${framework.color}40`
                    : '0 4px 24px rgba(0, 0, 0, 0.4)';
                  e.currentTarget.style.borderColor = isSelected ? framework.color : 'rgba(64, 64, 64, 0.4)';
                }}
              >
                {/* Subtle gradient overlay */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 100,
                    background: `linear-gradient(180deg, ${framework.color}08 0%, transparent 100%)`,
                    pointerEvents: 'none',
                  }}
                />
                
                {/* Bookmark button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark(framework.id);
                  }}
                  style={{
                    position: 'absolute',
                    top: spacing.lg,
                    right: spacing.lg,
                    padding: spacing.sm,
                    background: isBookmarked 
                      ? `linear-gradient(135deg, ${accentColors.yellow}, ${accentColors.orange})`
                      : 'rgba(45, 45, 45, 0.8)',
                    border: 'none',
                    borderRadius: 10,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: isBookmarked ? 1 : 0.7,
                    boxShadow: isBookmarked ? `0 4px 12px ${accentColors.yellow}40` : 'none',
                    backdropFilter: 'blur(8px)',
                    zIndex: 2,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.transform = 'scale(1.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = isBookmarked ? '1' : '0.7';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <Star
                    size={16}
                    fill={isBookmarked ? colors.neutral[900] : 'none'}
                    style={{ color: isBookmarked ? colors.neutral[900] : colors.neutral[400] }}
                  />
                </button>

                <div style={{ marginTop: spacing.sm, position: 'relative', zIndex: 1 }}>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      fontFamily: "'Cormorant Garamond', serif",
                      color: framework.color,
                      marginBottom: spacing.xs,
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.sm,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {framework.name}
                    {isViewed && (
                      <Eye size={14} style={{ color: colors.neutral[500], opacity: 0.5 }} />
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: colors.neutral[400],
                      marginBottom: spacing.md,
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.sm,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>{framework.author}</span>
                    {framework.year && (
                      <>
                        <span style={{ color: colors.neutral[600] }}>•</span>
                        <span style={{ color: colors.neutral[500] }}>{framework.year}</span>
                      </>
                    )}
                    <span
                      style={{
                        marginLeft: 'auto',
                        padding: '4px 12px',
                        background: `linear-gradient(135deg, ${complexityColors[framework.complexity]}, ${complexityColors[framework.complexity]}dd)`,
                        color: colors.neutral[900],
                        borderRadius: 16,
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        boxShadow: `0 2px 8px ${complexityColors[framework.complexity]}30`,
                      }}
                    >
                      {framework.complexity}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: 15,
                      color: colors.neutral[300],
                      lineHeight: 1.7,
                      margin: `${spacing.md} 0`,
                      fontWeight: 400,
                      fontStyle: 'italic',
                    }}
                  >
                    "{framework.tagline}"
                  </p>

                  {/* Categories */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: spacing.sm,
                      marginTop: spacing.lg,
                    }}
                  >
                    {framework.categories.map((cat) => (
                      <span
                        key={cat}
                        style={{
                          padding: `5px ${spacing.md}`,
                          background: 'rgba(45, 45, 45, 0.6)',
                          border: `1px solid rgba(64, 64, 64, 0.5)`,
                          borderRadius: 8,
                          fontSize: 11,
                          color: colors.neutral[400],
                          fontWeight: 500,
                          transition: 'all 0.2s',
                        }}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>

                  {/* Related frameworks indicator */}
                  {framework.relatedFrameworks.length > 0 && (
                    <div
                      style={{
                        marginTop: spacing.lg,
                        paddingTop: spacing.md,
                        borderTop: `1px solid rgba(64, 64, 64, 0.3)`,
                        fontSize: 12,
                        color: colors.neutral[500],
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing.sm,
                      }}
                    >
                      <Network size={14} style={{ color: framework.color, opacity: 0.7 }} />
                      <span>{framework.relatedFrameworks.length} related frameworks</span>
                      <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: `${spacing['2xl']} ${spacing.xl}`,
            background: 'rgba(20, 20, 25, 0.8)',
            backdropFilter: 'blur(16px)',
            borderRadius: 24,
            border: `1px solid rgba(64, 64, 64, 0.3)`,
            position: 'relative',
            zIndex: 1,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              margin: '0 auto',
              marginBottom: spacing.xl,
              borderRadius: 20,
              background: `linear-gradient(135deg, ${accentColors.purple}20, ${accentColors.cyan}20)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid rgba(64, 64, 64, 0.3)`,
            }}
          >
            <Search size={36} style={{ color: colors.neutral[500] }} />
          </div>
          <div style={{ 
            fontSize: 20, 
            fontWeight: 600, 
            marginBottom: spacing.sm,
            fontFamily: "'Cormorant Garamond', serif",
            color: colors.neutral[300],
          }}>
            No frameworks found
          </div>
          <div style={{ fontSize: 14, color: colors.neutral[500], marginBottom: spacing.xl }}>
            Try adjusting your search or filters
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter([]);
              setComplexityFilter([]);
              setShowBookmarksOnly(false);
            }}
            style={{
              padding: `${spacing.md} ${spacing.xl}`,
              background: `linear-gradient(135deg, ${accentColors.cyan}20, ${accentColors.purple}20)`,
              border: `1px solid ${accentColors.cyan}40`,
              borderRadius: 12,
              color: accentColors.cyan,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              transition: 'all 0.3s',
            }}
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Detail Panel (Slide-out) */}
      {selectedIds.length > 0 && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: compareMode ? '100%' : 'min(850px, 92vw)',
            background: 'linear-gradient(180deg, rgba(15, 15, 20, 0.98) 0%, rgba(10, 10, 15, 0.99) 100%)',
            backdropFilter: 'blur(20px)',
            borderLeft: `1px solid rgba(64, 64, 64, 0.4)`,
            boxShadow: '-8px 0 40px rgba(0, 0, 0, 0.6)',
            zIndex: 1000,
            overflowY: 'auto',
            animation: 'slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedIds([]);
          }}
        >
          <style>
            {`
              @keyframes slideIn {
                from {
                  transform: translateX(100%);
                  opacity: 0;
                }
                to {
                  transform: translateX(0);
                  opacity: 1;
                }
              }
              @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
              }
              @keyframes gradientShift {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
              }
              @keyframes fadeInUp {
                from {
                  opacity: 0;
                  transform: translateY(20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
              }
            `}
          </style>

          {/* Close button */}
          <button
            onClick={() => setSelectedIds([])}
            style={{
              position: 'sticky',
              top: spacing.xl,
              left: spacing.xl,
              zIndex: 10,
              padding: `${spacing.md} ${spacing.lg}`,
              background: 'rgba(45, 45, 45, 0.9)',
              backdropFilter: 'blur(12px)',
              border: `1px solid rgba(64, 64, 64, 0.5)`,
              borderRadius: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
              fontSize: 14,
              fontWeight: 600,
              color: colors.neutral[300],
              marginBottom: spacing.xl,
              marginLeft: spacing.xl,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(60, 60, 60, 0.95)';
              e.currentTarget.style.borderColor = colors.neutral[500];
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(45, 45, 45, 0.9)';
              e.currentTarget.style.borderColor = 'rgba(64, 64, 64, 0.5)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <X size={18} />
            Close {compareMode ? 'Comparison' : ''}
          </button>

          {/* Content */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: compareMode ? `repeat(${selectedFrameworks.length}, 1fr)` : '1fr',
              gap: spacing['2xl'],
              padding: `0 ${spacing['2xl']} ${spacing['2xl']}`,
            }}
          >
            {selectedFrameworks.map((selected) => (
              <div key={selected.id} style={{ minWidth: 0 }}>
                {/* Header */}
                <div
                  style={{
                    paddingBottom: spacing.xl,
                    borderBottom: `1px solid ${selected.colorBorder}`,
                    background: `linear-gradient(180deg, ${selected.color}08 0%, transparent 100%)`,
                    margin: `-${spacing.lg}`,
                    marginBottom: spacing.xl,
                    padding: spacing.xl,
                    borderRadius: '16px 16px 0 0',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md }}>
                    <div style={{ flex: 1 }}>
                      <h2
                        style={{
                          fontSize: compareMode ? 24 : 32,
                          fontWeight: 600,
                          fontFamily: "'Cormorant Garamond', serif",
                          color: selected.color,
                          margin: 0,
                          marginBottom: spacing.sm,
                          letterSpacing: '-0.02em',
                          textShadow: `0 0 40px ${selected.color}30`,
                        }}
                      >
                        {selected.name}
                      </h2>
                      <div style={{ fontSize: 15, color: colors.neutral[400], marginBottom: spacing.md, display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                        <span style={{ fontWeight: 500 }}>{selected.author}</span>
                        {selected.year && (
                          <>
                            <span style={{ color: colors.neutral[600] }}>•</span>
                            <span>{selected.year}</span>
                          </>
                        )}
                      </div>
                      <div
                        style={{
                          display: 'inline-block',
                          padding: '6px 16px',
                          background: `linear-gradient(135deg, ${complexityColors[selected.complexity]}, ${complexityColors[selected.complexity]}dd)`,
                          color: colors.neutral[900],
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          boxShadow: `0 4px 12px ${complexityColors[selected.complexity]}30`,
                        }}
                      >
                        {selected.complexity}
                      </div>
                    </div>
                    {!compareMode && (
                      <button
                        onClick={() => toggleBookmark(selected.id)}
                        style={{
                          padding: spacing.md,
                          background: userData.bookmarks.includes(selected.id)
                            ? `linear-gradient(135deg, ${accentColors.yellow}, ${accentColors.orange})`
                            : 'rgba(45, 45, 45, 0.8)',
                          border: 'none',
                          borderRadius: 12,
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: userData.bookmarks.includes(selected.id) 
                            ? `0 4px 16px ${accentColors.yellow}40`
                            : 'none',
                        }}
                      >
                        <Star
                          size={20}
                          fill={userData.bookmarks.includes(selected.id) ? colors.neutral[900] : 'none'}
                          style={{
                            color: userData.bookmarks.includes(selected.id)
                              ? colors.neutral[900]
                              : colors.neutral[400],
                          }}
                        />
                      </button>
                    )}
                  </div>

                  <p
                    style={{
                      fontSize: 18,
                      color: colors.neutral[300],
                      lineHeight: 1.8,
                      fontStyle: 'italic',
                      fontFamily: "'Cormorant Garamond', serif",
                      margin: 0,
                    }}
                  >
                    "{selected.tagline}"
                  </p>
                </div>

                {/* Diagram */}
                {selected.diagram && (
                  <section style={{ marginBottom: spacing['2xl'] }}>
                    <div
                      style={{
                        padding: spacing.xl,
                        background: `linear-gradient(145deg, ${selected.colorBg}, rgba(20, 20, 25, 0.8))`,
                        border: `1px solid ${selected.colorBorder}`,
                        borderRadius: 16,
                        boxShadow: `0 4px 24px rgba(0, 0, 0, 0.3), inset 0 0 40px ${selected.color}05`,
                      }}
                    >
                      {selected.diagram()}
                    </div>
                  </section>
                )}

                {/* Core Idea */}
                <section style={{ marginBottom: spacing['2xl'] }}>
                  <h3
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: colors.neutral[500],
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: spacing.md,
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.sm,
                    }}
                  >
                    <Lightbulb size={16} style={{ color: accentColors.yellow }} />
                    Core Idea
                  </h3>
                  <p
                    style={{
                      fontSize: 16,
                      color: colors.neutral[200],
                      lineHeight: 1.8,
                      margin: 0,
                    }}
                  >
                    {selected.coreIdea}
                  </p>
                </section>

                {/* When to Use */}
                <section style={{ marginBottom: spacing['2xl'] }}>
                  <h3
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: colors.neutral[500],
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: spacing.lg,
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.sm,
                    }}
                  >
                    <Target size={16} style={{ color: accentColors.green }} />
                    When to Use
                  </h3>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: 0,
                      listStyle: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: spacing.md,
                    }}
                  >
                    {selected.whenToUse.map((use, i) => (
                      <li
                        key={i}
                        style={{
                          fontSize: 15,
                          color: colors.neutral[300],
                          lineHeight: 1.7,
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: spacing.md,
                          padding: spacing.md,
                          background: 'rgba(30, 30, 35, 0.5)',
                          borderRadius: 12,
                          border: '1px solid rgba(64, 64, 64, 0.3)',
                          transition: 'all 0.2s',
                        }}
                      >
                        <ChevronRight size={18} style={{ color: selected.color, marginTop: 2, flexShrink: 0 }} />
                        <span>{use}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Key Concepts */}
                <section style={{ marginBottom: spacing['2xl'] }}>
                  <h3
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: colors.neutral[500],
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: spacing.lg,
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.sm,
                    }}
                  >
                    <Brain size={16} style={{ color: accentColors.purple }} />
                    Key Concepts
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                    {selected.keyConcepts.map((concept, i) => (
                      <div
                        key={i}
                        style={{
                          padding: spacing.lg,
                          background: `linear-gradient(145deg, ${selected.colorBg}, rgba(20, 20, 25, 0.8))`,
                          border: `1px solid ${selected.colorBorder}`,
                          borderRadius: 14,
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          cursor: 'default',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = selected.color;
                          e.currentTarget.style.boxShadow = `0 4px 20px ${selected.color}20`;
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = selected.colorBorder;
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: selected.color,
                            marginBottom: spacing.sm,
                          }}
                        >
                          {concept.term}
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            color: colors.neutral[300],
                            lineHeight: 1.7,
                          }}
                        >
                          {concept.definition}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Examples */}
                <section style={{ marginBottom: spacing['2xl'] }}>
                  <h3
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: colors.neutral[500],
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: spacing.lg,
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.sm,
                    }}
                  >
                    {React.createElement(getIconComponent('QuantumEntanglement') || 'div', { size: 16, style: { color: accentColors.cyan } })}
                    Examples in Practice
                  </h3>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: 0,
                      listStyle: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: spacing.md,
                    }}
                  >
                    {selected.examples.map((example, i) => (
                      <li
                        key={i}
                        style={{
                          fontSize: 15,
                          color: colors.neutral[300],
                          lineHeight: 1.8,
                          paddingLeft: spacing.xl,
                          borderLeft: `3px solid ${selected.color}40`,
                          background: `linear-gradient(90deg, ${selected.color}08 0%, transparent 100%)`,
                          paddingTop: spacing.sm,
                          paddingBottom: spacing.sm,
                          borderRadius: '0 8px 8px 0',
                        }}
                      >
                        {example}
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Related Frameworks */}
                {selected.relatedFrameworks.length > 0 && (
                  <section style={{ marginBottom: spacing['2xl'] }}>
                    <h3
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: colors.neutral[500],
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginBottom: spacing.lg,
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing.sm,
                      }}
                    >
                      <Network size={16} style={{ color: accentColors.orange }} />
                      Related Frameworks
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.md }}>
                      {selected.relatedFrameworks.map((relatedId) => {
                        const related = frameworks.find((f) => f.id === relatedId);
                        if (!related) return null;
                        return (
                          <button
                            key={relatedId}
                            onClick={() => {
                              if (!compareMode) {
                                setSelectedIds([relatedId]);
                                markAsViewed(relatedId);
                              }
                            }}
                            style={{
                              padding: `${spacing.md} ${spacing.lg}`,
                              background: `linear-gradient(145deg, ${related.colorBg}, rgba(20, 20, 25, 0.8))`,
                              border: `1px solid ${related.colorBorder}`,
                              borderRadius: 12,
                              color: related.color,
                              cursor: 'pointer',
                              fontSize: 13,
                              fontWeight: 600,
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: spacing.sm,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = related.color;
                              e.currentTarget.style.transform = 'translateY(-3px)';
                              e.currentTarget.style.boxShadow = `0 8px 20px ${related.color}20`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = related.colorBorder;
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            {related.name}
                            <ChevronRight size={14} style={{ opacity: 0.6 }} />
                          </button>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Notes Section */}
                {!compareMode && (
                  <section style={{ marginBottom: spacing['2xl'] }}>
                    <h3
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: colors.neutral[500],
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginBottom: spacing.lg,
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing.sm,
                      }}
                    >
                      <StickyNote size={16} style={{ color: accentColors.pink }} />
                      Your Notes
                    </h3>
                    {noteEditingId === selected.id ? (
                      <div>
                        <textarea
                          autoFocus
                          defaultValue={userData.notes[selected.id] || ''}
                          placeholder="Add your thoughts, reflections, or how you might apply this framework..."
                          style={{
                            width: '100%',
                            minHeight: 140,
                            padding: spacing.lg,
                            background: 'rgba(30, 30, 35, 0.8)',
                            border: `2px solid ${selected.color}60`,
                            borderRadius: 14,
                            color: colors.neutral[100],
                            fontSize: 15,
                            fontFamily: 'inherit',
                            lineHeight: 1.7,
                            resize: 'vertical',
                            boxShadow: `0 0 20px ${selected.color}15`,
                          }}
                          onBlur={(e) => {
                            updateNote(selected.id, e.target.value);
                            setNoteEditingId(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              setNoteEditingId(null);
                            }
                          }}
                        />
                        <div style={{ fontSize: 12, color: colors.neutral[500], marginTop: spacing.sm, display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: accentColors.green, animation: 'pulse 2s infinite' }} />
                          Press Escape or click outside to save
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => setNoteEditingId(selected.id)}
                        style={{
                          padding: spacing.lg,
                          background: 'rgba(25, 25, 30, 0.6)',
                          border: `1px dashed ${userData.notes[selected.id] ? 'rgba(64, 64, 64, 0.5)' : 'rgba(64, 64, 64, 0.3)'}`,
                          borderRadius: 14,
                          minHeight: 100,
                          cursor: 'text',
                          fontSize: 15,
                          color: userData.notes[selected.id] ? colors.neutral[300] : colors.neutral[500],
                          lineHeight: 1.7,
                          fontStyle: userData.notes[selected.id] ? 'normal' : 'italic',
                          transition: 'all 0.3s',
                        }}
                      >
                        {userData.notes[selected.id] || 'Click to add notes...'}
                      </div>
                    )}
                  </section>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
