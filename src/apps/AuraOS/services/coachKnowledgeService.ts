/**
 * Coach Knowledge Service
 * Centralized knowledge base for AI Coach to access deep practice, wizard, and framework information
 */

import { practices } from '../constants';
import { AllPractice, Practice, ModuleKey } from '../types';

export interface WizardInfo {
  id: string;
  name: string;
  category: 'shadow' | 'mind' | 'body' | 'spirit' | 'developmental';
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  commonStuckPoints: string[];
  prerequisites?: string[];
  followUpRecommendations: string[];
}

export interface FrameworkInfo {
  id: string;
  name: string;
  shortDescription: string;
  keyPoints: string[];
  practicalApplication: string;
  developmentalStage?: string;
}

export interface PracticeDetail extends Practice {
  commonMistakes: string[];
  modifications: {
    beginner: string;
    intermediate: string;
    advanced: string;
  };
  synergiesWith: string[];
  contraindications?: string[];
}

class CoachKnowledgeService {
  /**
   * Get detailed information about a specific practice
   */
  getPracticeDetails(practiceId: string): PracticeDetail | null {
    // Find practice across all modules
    for (const moduleKey of Object.keys(practices) as ModuleKey[]) {
      const practice = practices[moduleKey].find(p => p.id === practiceId);
      if (practice) {
        return {
          ...practice,
          commonMistakes: this.getCommonMistakes(practiceId),
          modifications: this.getModifications(practiceId),
          synergiesWith: this.getSynergies(practiceId),
          contraindications: this.getContraindications(practiceId),
        };
      }
    }
    return null;
  }

  /**
   * Get all practices in a module
   */
  getPracticesByModule(module: ModuleKey): Practice[] {
    return practices[module] || [];
  }

  /**
   * Search practices by keyword
   */
  searchPractices(query: string): Practice[] {
    const lowerQuery = query.toLowerCase();
    const allPractices: Practice[] = [];

    for (const moduleKey of Object.keys(practices) as ModuleKey[]) {
      allPractices.push(...practices[moduleKey]);
    }

    return allPractices.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.why.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get wizard information
   */
  getWizardInfo(wizardId: string): WizardInfo | null {
    const wizards = this.getAllWizards();
    return wizards.find(w => w.id === wizardId) || null;
  }

  /**
   * Get all wizards by category
   */
  getWizardsByCategory(category: WizardInfo['category']): WizardInfo[] {
    return this.getAllWizards().filter(w => w.category === category);
  }

  /**
   * Get framework information
   */
  getFrameworkInfo(frameworkId: string): FrameworkInfo | null {
    const frameworks = this.getAllFrameworks();
    return frameworks.find(f => f.id === frameworkId) || null;
  }

  /**
   * Get practice recommendations based on module imbalance
   */
  getBalancingPractices(lackingModule: ModuleKey, userLevel: 'beginner' | 'intermediate' | 'advanced'): Practice[] {
    const modulePractices = practices[lackingModule];

    // Filter by difficulty appropriate for user level
    const filtered = modulePractices.filter(p => {
      if (userLevel === 'beginner') {
        return p.difficulty === 'Trivial' || p.difficulty === 'Very Low' || p.difficulty === 'Low';
      } else if (userLevel === 'intermediate') {
        return p.difficulty === 'Low-Medium' || p.difficulty === 'Medium';
      } else {
        return p.difficulty === 'Medium-High' || p.difficulty === 'High';
      }
    });

    // Sort by ROI
    return filtered.sort((a, b) => {
      const roiOrder = { 'EXTREME': 5, 'VERY HIGH': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      return roiOrder[b.roi] - roiOrder[a.roi];
    }).slice(0, 3);
  }

  /**
   * Get wizard recommendations based on user needs
   */
  getWizardRecommendations(userContext: {
    moduleBalance: Record<ModuleKey, number>;
    experienceLevel: 'beginner' | 'intermediate' | 'advanced';
    patterns?: string[];
  }): WizardInfo[] {
    const recommendations: WizardInfo[] = [];

    // If shadow is lacking, recommend shadow wizards
    if (userContext.moduleBalance.shadow < 15) {
      if (userContext.experienceLevel === 'beginner') {
        recommendations.push(this.getWizardInfo('bias-detective')!);
      } else {
        recommendations.push(this.getWizardInfo('321-process')!, this.getWizardInfo('ifs')!);
      }
    }

    // If spirit is lacking, recommend spirit wizards
    if (userContext.moduleBalance.spirit < 15) {
      recommendations.push(this.getWizardInfo('jhana-tracker')!);
    }

    return recommendations.filter(Boolean);
  }

  /**
   * Get all wizards
   */
  private getAllWizards(): WizardInfo[] {
    return [
      // Shadow Wizards
      {
        id: '321-process',
        name: '3-2-1 Process',
        category: 'shadow',
        description: 'Shadow integration through Face It (3rd person), Talk To It (2nd person), Be It (1st person)',
        duration: '15-30 minutes',
        difficulty: 'intermediate',
        commonStuckPoints: ['Resistance to "Being It"', 'Intellectualizing instead of feeling', 'Choosing weak projections'],
        followUpRecommendations: ['IFS for deeper parts work', 'Memory Reconsolidation for trauma', 'Polarity Mapper for integration'],
      },
      {
        id: 'ifs',
        name: 'Internal Family Systems',
        category: 'shadow',
        description: 'Dialogue with your parts (protectors, exiles, Self) to heal internal conflicts',
        duration: '20-40 minutes',
        difficulty: 'intermediate',
        commonStuckPoints: ['Blending with parts', 'Unable to access Self', 'Parts not willing to talk'],
        followUpRecommendations: ['Big Mind for expanded parts work', '3-2-1 for projection work', 'Memory Reconsolidation'],
      },
      {
        id: 'bias-detective',
        name: 'Bias Detective',
        category: 'shadow',
        description: 'Analyze decisions for cognitive biases with AI-generated scenarios',
        duration: '10-20 minutes',
        difficulty: 'beginner',
        commonStuckPoints: ['Defending biased thinking', 'Not seeing patterns', 'Choosing easy scenarios'],
        followUpRecommendations: ['Perspective Shifter', 'Subject-Object Interview', 'Polarity Mapper'],
      },
      {
        id: 'subject-object',
        name: 'Subject-Object Interview',
        category: 'shadow',
        description: 'Explore what you\'re subject to vs. can reflect on (Kegan stages)',
        duration: '20-30 minutes',
        difficulty: 'advanced',
        commonStuckPoints: ['Confusing subject with object', 'Unable to identify being subject to something'],
        followUpRecommendations: ['Kegan Assessment', 'Immunity to Change', 'Perspective Shifter'],
      },
      {
        id: 'perspective-shifter',
        name: 'Perspective Shifter',
        category: 'shadow',
        description: 'Practice taking multiple viewpoints (1st/2nd/3rd person, interior/exterior)',
        duration: '10-15 minutes',
        difficulty: 'beginner',
        commonStuckPoints: ['Staying stuck in own perspective', 'Superficial perspective-taking'],
        followUpRecommendations: ['8 Zones', 'AQAL Analysis', 'Bias Detective'],
      },
      // Mind Wizards
      {
        id: 'kegan',
        name: 'Kegan Assessment',
        category: 'mind',
        description: 'Determine your developmental stage (Socialized → Self-Authoring → Self-Transforming)',
        duration: '15-25 minutes',
        difficulty: 'intermediate',
        commonStuckPoints: ['Aspiring to higher stage vs. actually being there', 'Not understanding stage descriptions'],
        followUpRecommendations: ['Subject-Object Interview', 'Immunity to Change', 'Role Alignment'],
      },
      {
        id: '8-zones',
        name: '8 Zones of Consciousness',
        category: 'mind',
        description: 'Explore Timothy Leary\'s 8 neurological circuits',
        duration: '20-30 minutes',
        difficulty: 'advanced',
        commonStuckPoints: ['Too abstract', 'Not connecting to lived experience'],
        followUpRecommendations: ['Perspective Shifter', 'AQAL Analysis', 'Consciousness Graph'],
      },
      // Body Wizards
      {
        id: 'body-architect',
        name: 'Body Architect',
        category: 'body',
        description: 'Comprehensive body optimization: movement, nutrition, sleep, recovery',
        duration: '30-45 minutes',
        difficulty: 'intermediate',
        commonStuckPoints: ['Overwhelm from too many changes', 'Unrealistic expectations'],
        followUpRecommendations: ['Workout Architect', 'Bioenergetics', 'Somatic practices'],
      },
      {
        id: 'bioenergetics',
        name: 'Bioenergetics',
        category: 'body',
        description: 'Character structure analysis and somatic release (Wilhelm Reich)',
        duration: '25-35 minutes',
        difficulty: 'advanced',
        commonStuckPoints: ['Resistance to embodiment', 'Over-analyzing instead of feeling'],
        followUpRecommendations: ['Somatic Generator', 'IFS for parts work', 'Memory Reconsolidation'],
      },
      // Spirit Wizards
      {
        id: 'jhana-tracker',
        name: 'Jhana Tracker',
        category: 'spirit',
        description: 'Track meditative absorption states (1st-8th jhanas)',
        duration: '10-15 minutes',
        difficulty: 'intermediate',
        commonStuckPoints: ['Striving for jhanas vs. letting them arise', 'Misidentifying states'],
        followUpRecommendations: ['Meditation Finder', '8 Zones', 'Attachment Assessment'],
      },
      {
        id: 'attachment-assessment',
        name: 'Attachment Assessment',
        category: 'spirit',
        description: 'ECR-R questionnaire to identify attachment style',
        duration: '15-20 minutes',
        difficulty: 'beginner',
        commonStuckPoints: ['Defensive answers', 'Not seeing patterns in relationships'],
        followUpRecommendations: ['Relational Pattern Chatbot', 'IFS', '3-2-1 Process'],
      },
      // Developmental Wizards
      {
        id: 'immunity-to-change',
        name: 'Immunity to Change',
        category: 'developmental',
        description: 'Uncover hidden commitments blocking your growth (Kegan & Lahey)',
        duration: '30-45 minutes',
        difficulty: 'advanced',
        commonStuckPoints: ['Superficial competing commitments', 'Unable to identify big assumption'],
        prerequisites: ['Kegan Assessment helpful but not required'],
        followUpRecommendations: ['Subject-Object Interview', 'Role Alignment', '3-2-1 Process'],
      },
      {
        id: 'role-alignment',
        name: 'Role Alignment',
        category: 'developmental',
        description: 'Examine life roles and align with values',
        duration: '20-30 minutes',
        difficulty: 'intermediate',
        commonStuckPoints: ['Identifying roles but not examining them', 'Avoiding role conflicts'],
        followUpRecommendations: ['Immunity to Change', 'Polarity Mapper', 'Kegan Assessment'],
      },
    ];
  }

  /**
   * Get all frameworks
   */
  private getAllFrameworks(): FrameworkInfo[] {
    return [
      {
        id: 'aqal',
        name: 'AQAL (All Quadrants, All Levels)',
        shortDescription: 'Ken Wilber\'s integral map: 4 quadrants × developmental levels',
        keyPoints: [
          'I (Interior-Individual): Subjective experience, thoughts, feelings',
          'We (Interior-Collective): Culture, shared meanings, values',
          'It (Exterior-Individual): Objective behavior, physiology',
          'Its (Exterior-Collective): Systems, structures, environments',
          'Each quadrant has developmental levels (archaic → magic → mythic → rational → pluralistic → integral)',
        ],
        practicalApplication: 'Use AQAL to diagnose problems holistically. Is it a mindset issue (I)? Cultural (We)? Behavioral (It)? Systemic (Its)?',
      },
      {
        id: 'kegan-stages',
        name: 'Kegan Developmental Stages',
        shortDescription: 'Subject-Object Theory: What you\'re embedded in vs. can reflect on',
        keyPoints: [
          'Stage 2 (Imperial): Subject to impulses, can\'t reflect on them',
          'Stage 3 (Socialized): Subject to others\' opinions, can reflect on impulses',
          'Stage 4 (Self-Authoring): Subject to own system, can reflect on relationships',
          'Stage 5 (Self-Transforming): Can reflect on own system, holds paradox',
          'Transition is painful: what was self becomes object',
        ],
        practicalApplication: 'Identity crises signal stage transitions. Stage 3→4: "Who am I without others?" Stage 4→5: "My system isn\'t the truth."',
        developmentalStage: 'Meta-framework for understanding your current center of gravity',
      },
      {
        id: 'leary-circuits',
        name: 'Leary\'s 8 Circuits',
        shortDescription: '8 neurological circuits from survival to non-dual awareness',
        keyPoints: [
          'C1 (Bio-Survival): Safety, approach/avoid',
          'C2 (Emotional-Territorial): Power, dominance, submission',
          'C3 (Semantic): Language, logic, abstraction',
          'C4 (Socio-Sexual): Bonding, tribal roles, morality',
          'C5 (Neurosomatic): Sensory pleasure, body awareness',
          'C6 (Metaprogramming): Reprogramming mind, consciousness of consciousness',
          'C7 (Neurogenetic): Archetypal, collective unconscious',
          'C8 (Neuro-Atomic): Non-dual, quantum consciousness',
        ],
        practicalApplication: 'Most people operate primarily C1-C4. Higher circuits activated through meditation, psychedelics, shadow work.',
      },
      {
        id: 'ifs',
        name: 'Internal Family Systems',
        shortDescription: 'Multiple sub-personalities (parts) with Self as leader',
        keyPoints: [
          'Self: Compassionate, curious, calm leader (8 C\'s)',
          'Managers: Proactive protectors (perfectionism, people-pleasing)',
          'Firefighters: Reactive protectors (addictions, dissociation)',
          'Exiles: Wounded young parts carrying pain',
          'All parts have positive intent, even destructive ones',
        ],
        practicalApplication: 'When you notice inner conflict, ask: "What part of me is this?" Dialogue with parts from Self.',
      },
      {
        id: 'attachment-theory',
        name: 'Attachment Theory',
        shortDescription: 'Relational patterns from early bonding (Bowlby, Ainsworth)',
        keyPoints: [
          'Secure: Comfortable with intimacy and autonomy',
          'Anxious: Craves closeness, fears abandonment',
          'Avoidant: Values independence, discomfort with closeness',
          'Fearful-Avoidant: Wants closeness but fears it',
          'Measured on 2 axes: anxiety and avoidance',
        ],
        practicalApplication: 'Your attachment style predicts relationship dynamics. Anxious + Avoidant = protest-withdrawal cycle. Earned security is possible.',
      },
    ];
  }

  /**
   * Helper methods for practice details
   */
  private getCommonMistakes(practiceId: string): string[] {
    const mistakes: Record<string, string[]> = {
      'meditation': [
        'Trying too hard to stop thoughts',
        'Expecting immediate results',
        'Not establishing consistent time/place',
      ],
      'cold-exposure': [
        'Going too intense too fast',
        'Not breathing properly',
        'Skipping the gradual adaptation period',
      ],
      'journaling': [
        'Superficial reflection',
        'Censoring thoughts',
        'Irregular practice',
      ],
    };
    return mistakes[practiceId] || ['Practice requires consistency', 'Start gradually', 'Track your progress'];
  }

  private getModifications(practiceId: string): { beginner: string; intermediate: string; advanced: string } {
    return {
      beginner: 'Start with 5-10 minutes, focus on building the habit',
      intermediate: 'Increase duration, add complexity or intensity',
      advanced: 'Explore edge cases, combine with other practices, teach others',
    };
  }

  private getSynergies(practiceId: string): string[] {
    const synergies: Record<string, string[]> = {
      'meditation': ['breathwork', 'journaling', 'cold-exposure'],
      'cold-exposure': ['breathwork', 'meditation', 'heat-exposure'],
      'journaling': ['meditation', 'shadow-work', 'gratitude'],
    };
    return synergies[practiceId] || [];
  }

  private getContraindications(practiceId: string): string[] | undefined {
    const contraindications: Record<string, string[]> = {
      'cold-exposure': ['Heart conditions', 'Raynaud\'s disease', 'Pregnancy without doctor approval'],
      'intense-breathwork': ['Pregnancy', 'Epilepsy', 'Severe anxiety without guidance'],
    };
    return contraindications[practiceId];
  }
}

// Singleton instance
export const coachKnowledgeService = new CoachKnowledgeService();
