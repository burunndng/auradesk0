/**
 * Schema Reflection Service
 * Handles LLM question generation, analysis, and session persistence
 */

import { v4 as uuidv4 } from 'uuid';
import { callOpenRouterGrokPrimary, callOpenRouterQwenFallback } from './ai/aiCore';
import { supabase } from './supabaseClient';
import { Database, Json } from './database.types';
import { schemas } from '../components/wizards/SchemaReflectionWizard/schemaContent';

export interface SchemaResonance {
  schema_id: string;
  resonance_rating: 1 | 2 | 3 | 4 | 5;
}

export interface QuestionResponse {
  questionId: string;
  question: string;
  response: string;
  category?: string;
  timestamp?: string;
  questionType?: 'text' | 'multiple-choice';
  choices?: string[];
}

export interface AIAnalysisResult {
  key_themes: string[];
  severity_assessment: string;
  protective_strategies: string[];
  comparison_to_typical: string;
  personalized_recommendations: string[];
  raw_analysis: string;
  generated_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface SchemaReflectionSession {
  id: string;
  explored_schemas: SchemaResonance[];
  primary_schema: string;
  reflection_prompts: string[];
  reflection_text: string;
  completed: boolean;
  created_at: string;
  // New optional fields for enhanced assessment
  reflection_responses?: QuestionResponse[];
  ai_analysis?: AIAnalysisResult;
  chat_history?: ChatMessage[];
}

/**
 * Generate 3 reflection questions for a schema using LLM
 * Falls back gracefully to static questions if LLM fails
 */
export async function generateReflectionQuestions(
  schema_id: string,
  schema_name: string,
  schema_description: string
): Promise<string[]> {
  // Find the schema to get fallback questions
  const schema = schemas.find(s => s.schema_id === schema_id);
  const fallbackQuestions = schema?.fallback_questions || [
    'What resonates with you most about this pattern?',
    'When did you first notice this pattern in your life?',
    'What would change if this pattern wasn\'t there?'
  ];

  try {
    const prompt = `You are a compassionate therapist creating 3 reflection questions for someone exploring the "${schema_name}" emotional schema.

Schema Name: ${schema_name}
Schema Description: ${schema_description}

Generate exactly 3 thoughtful, open-ended reflection questions that:
1. Help someone explore this pattern in their own life
2. Are non-judgmental and warm in tone
3. Encourage deeper self-understanding
4. Are specific to this schema (not generic)

Format: Return ONLY the 3 questions, one per line, numbered 1-3. No introductions or explanations.

Example format:
1. When did you first notice yourself [specific pattern manifestation]?
2. How does this pattern show up in your most important relationships?
3. What would it feel like to [positive opposite of the pattern]?`;

    // Try Grok 4.1 first
    try {
      const response = await callOpenRouterGrokPrimary(prompt, 800);
      const questions = parseQuestions(response);
      if (questions.length === 3) {
        return questions;
      }
    } catch (grokError) {
      console.warn('[schemaReflectionService] Grok generation failed, trying Qwen fallback:', grokError);
    }

    // Try Qwen fallback
    try {
      const response = await callOpenRouterQwenFallback(prompt, 800);
      const questions = parseQuestions(response);
      if (questions.length === 3) {
        return questions;
      }
    } catch (qwenError) {
      console.warn('[schemaReflectionService] Qwen generation also failed:', qwenError);
    }

    // If both fail, return fallback questions
    console.warn('[schemaReflectionService] Both LLM models failed, returning fallback questions');
    return fallbackQuestions;

  } catch (error) {
    console.error('[schemaReflectionService] Unexpected error generating questions:', error);
    return fallbackQuestions;
  }
}

/**
 * Parse LLM response into array of questions
 * Handles numbered lists and newline-separated questions
 */
function parseQuestions(response: string): string[] {
  if (!response || typeof response !== 'string') {
    return [];
  }

  return response
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      // Remove numbering (e.g., "1. ", "1) ")
      return line.replace(/^[\d]+[\.\)]\s*/, '').trim();
    })
    .filter(line => line.length > 10) // Filter out very short lines
    .slice(0, 3); // Take first 3 valid questions
}

/**
 * Generate 18 structured questions across 6 categories for schema reflection
 * Falls back to static questions if LLM fails
 */
export async function generateStructuredQuestions(
  schema_id: string,
  schema_name: string,
  schema_description: string,
  common_origins: string,
  example_manifestations: string[]
): Promise<QuestionResponse[]> {
  // Static fallback questions organized by category - now with multiple-choice options
  const staticQuestions: QuestionResponse[] = [
    // Origins & Development (4)
    { questionId: 'origins-1', question: 'When did you first notice this pattern showing up in your life?', category: 'Origins & Development', response: '', questionType: 'multiple-choice', choices: ['Childhood (before age 10)', 'Adolescence (10-18)', 'Adulthood (18+)'] },
    { questionId: 'origins-2', question: 'What experiences or relationships from your early life might have shaped this pattern?', category: 'Origins & Development', response: '', questionType: 'multiple-choice', choices: ['Family dynamics and relationships', 'Traumatic or difficult events', 'Cultural or environmental factors'] },
    { questionId: 'origins-3', question: 'How did this pattern help or protect you at some point?', category: 'Origins & Development', response: '', questionType: 'multiple-choice', choices: ['It helped me feel safe or in control', 'It helped me survive difficult circumstances', 'It helped me fit in or belong'] },
    { questionId: 'origins-4', question: 'What beliefs about yourself or the world does this pattern reflect?', category: 'Origins & Development', response: '', questionType: 'multiple-choice', choices: ['Negative beliefs about myself', 'Negative beliefs about others', 'Negative beliefs about the world/future'] },
    // How It Shows Up (5)
    { questionId: 'shows-up-1', question: 'What situations or people tend to trigger this pattern?', category: 'How It Shows Up', response: '', questionType: 'multiple-choice', choices: ['Situations of intimacy or vulnerability', 'Situations involving conflict or criticism', 'Situations of uncertainty or loss of control'] },
    { questionId: 'shows-up-2', question: 'What thoughts run through your mind when this pattern activates?', category: 'How It Shows Up', response: '', questionType: 'multiple-choice', choices: ['Catastrophic or anxious thoughts', 'Self-critical or shame-based thoughts', 'Thoughts about what others think of me'] },
    { questionId: 'shows-up-3', question: 'What emotions accompany this pattern when it shows up?', category: 'How It Shows Up', response: '', questionType: 'multiple-choice', choices: ['Anxiety, fear, or panic', 'Shame, guilt, or sadness', 'Anger, frustration, or resentment'] },
    { questionId: 'shows-up-4', question: 'What specific behaviors or actions do you find yourself doing?', category: 'How It Shows Up', response: '', questionType: 'multiple-choice', choices: ['Withdrawing or isolating from others', 'Over-controlling or over-planning', 'Seeking reassurance or approval'] },
    { questionId: 'shows-up-5', question: 'How does this pattern typically end—what usually breaks it?', category: 'How It Shows Up', response: '', questionType: 'multiple-choice', choices: ['It fades with time or distraction', 'It ends through confrontation or realization', 'Someone intervenes or supports me'] },
    // Impact on Life (4)
    { questionId: 'impact-1', question: 'What opportunities or experiences have you missed because of this pattern?', category: 'Impact on Life', response: '', questionType: 'multiple-choice', choices: ['Relationships or connections', 'Career or personal growth opportunities', 'Experiences of joy or peace'] },
    { questionId: 'impact-2', question: 'How has this pattern affected your relationships and connections with others?', category: 'Impact on Life', response: '', questionType: 'multiple-choice', choices: ['It creates distance or conflict', 'It attracts certain relationship patterns', 'It prevents deeper intimacy'] },
    { questionId: 'impact-3', question: 'What would be different in your life if this pattern wasn\'t present?', category: 'Impact on Life', response: '', questionType: 'multiple-choice', choices: ['I\'d feel more confident and capable', 'I\'d have better relationships', 'I\'d take more risks and explore more'] },
    { questionId: 'impact-4', question: 'How do you feel about yourself when this pattern is active?', category: 'Impact on Life', response: '', questionType: 'multiple-choice', choices: ['Ashamed or inadequate', 'Anxious or trapped', 'Angry or resigned'] },
    // Coping Strategies (2)
    { questionId: 'coping-1', question: 'What have you already tried to manage or change this pattern?', category: 'Coping Strategies', response: '', questionType: 'multiple-choice', choices: ['Therapy or counseling', 'Self-help practices or reflection', 'Avoidance or escape'] },
    { questionId: 'coping-2', question: 'What helps you feel safer or calmer when this pattern is triggered?', category: 'Coping Strategies', response: '', questionType: 'multiple-choice', choices: ['Connection with supportive people', 'Solitude and self-reflection', 'Physical activity or grounding techniques'] },
    // Self-Awareness (2)
    { questionId: 'awareness-1', question: 'How much control do you feel you have over this pattern in the moment?', category: 'Self-Awareness', response: '', questionType: 'multiple-choice', choices: ['Very little—I\'m swept away by it', 'Some—I notice it but struggle to stop it', 'Increasing—I can sometimes redirect it'] },
    { questionId: 'awareness-2', question: 'What would help you notice and recognize this pattern earlier when it\'s starting?', category: 'Self-Awareness', response: '', questionType: 'multiple-choice', choices: ['Learning to recognize my body\'s signals', 'Understanding my triggers better', 'Regular reflection and journaling'] },
    // Moving Forward (1)
    { questionId: 'forward-1', question: 'If this pattern began to soften or change, what would become possible for you?', category: 'Moving Forward', response: '', questionType: 'multiple-choice', choices: ['Greater peace and emotional freedom', 'Better relationships and connection', 'More authentic self-expression'] }
  ];

  try {
    const prompt = `You are a compassionate Schema Therapy expert. Generate 18 multiple-choice reflection questions across 6 categories to deeply understand someone's relationship with the "${schema_name}" schema.

Schema: ${schema_name}
Description: ${schema_description}
Common Origins: ${common_origins}
Example Manifestations: ${example_manifestations.join(', ')}

Return a JSON array with exactly 18 questions. Each item must have:
- questionId (string, format: "category-number", e.g., "origins-1")
- question (string, warm and specific to this schema)
- category (string, one of: Origins & Development, How It Shows Up, Impact on Life, Coping Strategies, Self-Awareness, Moving Forward)
- choices (array of exactly 3 option strings, each concise and mutually exclusive)

Organize as:
- Origins & Development: 4 questions
- How It Shows Up: 5 questions
- Impact on Life: 4 questions
- Coping Strategies: 2 questions
- Self-Awareness: 2 questions
- Moving Forward: 1 question

Make questions warm, non-clinical, experience-focused (not academic). Each choice should be concise (2-10 words). Return ONLY valid JSON, no explanations.`;

    // Try Grok 4.1 first
    try {
      const response = await callOpenRouterGrokPrimary(prompt, 2500);
      const parsed = parseStructuredQuestions(response);
      if (parsed.length === 18) {
        return parsed;
      }
    } catch (grokError) {
      console.warn('[schemaReflectionService] Grok question generation failed:', grokError);
    }

    // Try Qwen fallback
    try {
      const response = await callOpenRouterQwenFallback(prompt, 2500);
      const parsed = parseStructuredQuestions(response);
      if (parsed.length === 18) {
        return parsed;
      }
    } catch (qwenError) {
      console.warn('[schemaReflectionService] Qwen question generation also failed:', qwenError);
    }

    // Return static fallback
    console.warn('[schemaReflectionService] Both LLM models failed, returning static questions');
    return staticQuestions;

  } catch (error) {
    console.error('[schemaReflectionService] Unexpected error generating questions:', error);
    return staticQuestions;
  }
}

/**
 * Parse structured JSON questions response
 */
function parseStructuredQuestions(response: string): QuestionResponse[] {
  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return [];
    }
    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map(q => ({
      questionId: q.questionId || '',
      question: q.question || '',
      response: '',
      category: q.category || '',
      timestamp: undefined,
      questionType: 'multiple-choice' as const,
      choices: Array.isArray(q.choices) ? q.choices : []
    })).filter(q => q.questionId && q.question && q.choices && q.choices.length > 0);
  } catch (error) {
    console.warn('[schemaReflectionService] Failed to parse structured questions:', error);
    return [];
  }
}

/**
 * Analyze schema responses and generate AI insights
 * Returns themes, severity, protective strategies, comparison, and recommendations
 */
export async function analyzeSchemaResponses(
  schema: any, // SchemaDefinition
  responses: QuestionResponse[],
  resonance_rating: number
): Promise<AIAnalysisResult> {
  // Static fallback analysis
  const staticAnalysis: AIAnalysisResult = {
    key_themes: [
      'Pattern awareness emerging',
      'Protective origins identified',
      'Life impact recognized'
    ],
    severity_assessment: 'Moderate - This pattern shows clear presence but with resilience factors present.',
    protective_strategies: [
      'Increase awareness through journaling when pattern activates',
      'Practice self-compassion when noticing the pattern',
      'Seek supportive relationships that help soften the pattern'
    ],
    comparison_to_typical: 'This pattern aligns with typical presentations but with unique personal expressions.',
    personalized_recommendations: [
      'Continue deepening awareness of when and how this pattern shows up',
      'Explore origins with compassion, recognizing the adaptive purpose it once served',
      'Consider working with a Schema Therapy-trained therapist for structured healing',
      'Practice small experiments in responding differently when the pattern activates',
      'Build a support system of understanding people who can offer perspective'
    ],
    raw_analysis: 'Your reflection reveals a pattern that developed as an adaptive response to early experiences. This pattern continues to shape your perceptions and behaviors, though with growing awareness comes the possibility of change.',
    generated_at: new Date().toISOString()
  };

  try {
    const responseSummary = responses
      .map(r => `Q: ${r.question}\nA: ${r.response}`)
      .join('\n\n');

    const prompt = `You are a compassionate Schema Therapy expert conducting a clinical analysis.

Schema: ${schema.plain_name}
Resonance Rating: ${resonance_rating}/5

Response Summary:
${responseSummary}

Provide a structured JSON analysis with:
{
  "key_themes": [3-5 recurring patterns as strings],
  "severity_assessment": "Low/Moderate/Significant/Severe + 1-2 sentence explanation",
  "protective_strategies": [3-5 coping mechanisms the person is already using],
  "comparison_to_typical": "1-2 sentence comparison to typical manifestations",
  "personalized_recommendations": [4-6 specific actionable steps],
  "raw_analysis": "3-4 paragraph narrative synthesis of all responses"
}

Tone: Warm, validating, non-pathologizing. Root insights in evidence from responses.
Return ONLY valid JSON, no explanations.`;

    // Try Grok first
    try {
      const response = await callOpenRouterGrokPrimary(prompt, 2000);
      const parsed = parseAnalysisResponse(response);
      if (parsed.key_themes.length > 0) {
        return parsed;
      }
    } catch (grokError) {
      console.warn('[schemaReflectionService] Grok analysis failed:', grokError);
    }

    // Try Qwen fallback
    try {
      const response = await callOpenRouterQwenFallback(prompt, 2000);
      const parsed = parseAnalysisResponse(response);
      if (parsed.key_themes.length > 0) {
        return parsed;
      }
    } catch (qwenError) {
      console.warn('[schemaReflectionService] Qwen analysis also failed:', qwenError);
    }

    console.warn('[schemaReflectionService] Both LLM models failed, returning static analysis');
    return staticAnalysis;

  } catch (error) {
    console.error('[schemaReflectionService] Unexpected error analyzing responses:', error);
    return staticAnalysis;
  }
}

/**
 * Parse analysis response
 */
function parseAnalysisResponse(response: string): AIAnalysisResult {
  const defaultResult: AIAnalysisResult = {
    key_themes: [],
    severity_assessment: '',
    protective_strategies: [],
    comparison_to_typical: '',
    personalized_recommendations: [],
    raw_analysis: '',
    generated_at: new Date().toISOString()
  };

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return defaultResult;
    }
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      key_themes: Array.isArray(parsed.key_themes) ? parsed.key_themes : [],
      severity_assessment: parsed.severity_assessment || '',
      protective_strategies: Array.isArray(parsed.protective_strategies) ? parsed.protective_strategies : [],
      comparison_to_typical: parsed.comparison_to_typical || '',
      personalized_recommendations: Array.isArray(parsed.personalized_recommendations) ? parsed.personalized_recommendations : [],
      raw_analysis: parsed.raw_analysis || '',
      generated_at: new Date().toISOString()
    };
  } catch (error) {
    console.warn('[schemaReflectionService] Failed to parse analysis response:', error);
    return defaultResult;
  }
}

/**
 * Get AI response for schema exploration chat
 */
export async function getSchemaExplorationResponse(
  chatHistory: ChatMessage[],
  userMessage: string,
  schema: any, // SchemaDefinition
  analysis: AIAnalysisResult,
  responses: QuestionResponse[]
): Promise<{ message: string; suggestedQuestions?: string[] }> {
  const staticResponse = {
    message: 'Thank you for sharing that. This aspect of the pattern connects to what we\'ve explored—the way it shows up in your relationships and life. What feels most important to understand next?',
    suggestedQuestions: [
      'How might this pattern have protected you at some point?',
      'What would change if this pattern began to soften?',
      'What support would help you work with this pattern?'
    ]
  };

  try {
    const conversationContext = chatHistory
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
      .join('\n');

    const sampleResponses = responses
      .slice(0, 3)
      .map(r => `Q: ${r.question}\nA: ${r.response}`)
      .join('\n\n');

    const prompt = `You are a warm Schema Therapy-informed guide (not a treating therapist).

Schema: ${schema.plain_name}
Key Themes from Analysis: ${analysis.key_themes.join(', ')}

Sample Responses from Assessment:
${sampleResponses}

Conversation History:
${conversationContext}

User's Latest Message: ${userMessage}

Respond warmly with:
1. Acknowledgment of what they shared
2. Gentle psychoeducation or reframe (simple language)
3. Curiosity or reflection (optional)
4. 3 suggested follow-up questions

Return JSON:
{
  "message": "Your response here (2-3 paragraphs, warm and conversational)",
  "suggestedQuestions": ["Question 1?", "Question 2?", "Question 3?"]
}

Tone: Conversational, warm, curious. Avoid clinical jargon. Root suggestions in their responses.
Return ONLY valid JSON.`;

    // Try Grok first
    try {
      const response = await callOpenRouterGrokPrimary(prompt, 1500);
      const parsed = parseChatResponse(response);
      if (parsed.message) {
        return parsed;
      }
    } catch (grokError) {
      console.warn('[schemaReflectionService] Grok chat response failed:', grokError);
    }

    // Try Qwen fallback
    try {
      const response = await callOpenRouterQwenFallback(prompt, 1500);
      const parsed = parseChatResponse(response);
      if (parsed.message) {
        return parsed;
      }
    } catch (qwenError) {
      console.warn('[schemaReflectionService] Qwen chat response also failed:', qwenError);
    }

    console.warn('[schemaReflectionService] Both LLM models failed, returning static chat response');
    return staticResponse;

  } catch (error) {
    console.error('[schemaReflectionService] Unexpected error getting chat response:', error);
    return staticResponse;
  }
}

/**
 * Parse chat response
 */
function parseChatResponse(response: string): { message: string; suggestedQuestions?: string[] } {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { message: '' };
    }
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      message: parsed.message || '',
      suggestedQuestions: Array.isArray(parsed.suggestedQuestions) ? parsed.suggestedQuestions : undefined
    };
  } catch (error) {
    console.warn('[schemaReflectionService] Failed to parse chat response:', error);
    return { message: '' };
  }
}

/**
 * Save a schema reflection session to integrated_insights table
 * Handles both authenticated and anonymous users
 */
export async function saveSchemaReflectionSession(
  session: SchemaReflectionSession,
  userId: string
): Promise<boolean> {
  // For anonymous users (non-UUID userId), skip Supabase — session is already in localStorage
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!userId || !uuidPattern.test(userId)) {
    return true;
  }

  try {
    const insight: Database['public']['Tables']['integrated_insights']['Insert'] = {
      id: session.id,
      user_id: userId,
      mind_tool_type: 'schema_reflection',
      mind_tool_session_id: session.id,
      mind_tool_name: 'Schema Reflection Wizard',
      mind_tool_report: buildSchemaReport(session),
      mind_tool_short_summary: buildSchemaSummary(session),
      detected_pattern: session.primary_schema || 'unknown',
      suggested_shadow_work: null,
      suggested_next_steps: buildNextSteps(session),
      date_created: session.created_at,
      status: 'pending',
      shadow_work_sessions_addressed: null,
      related_practice_sessions: null,
      practice_outcome: null,
      pattern_evolution_notes: session.reflection_text,
      lineage_id: null,
      generated_by: 'schema_reflection_wizard',
      confidence_score: 0.85,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('integrated_insights')
      .upsert(insight, { onConflict: 'id' });

    if (error) {
      console.error('[schemaReflectionService] Error saving session:', error);
      // Fall back gracefully — session is persisted in localStorage
      return true;
    }

    return true;
  } catch (err) {
    console.error('[schemaReflectionService] Unexpected error saving session:', err);
    // Fall back gracefully — session is persisted in localStorage
    return true;
  }
}

/**
 * Build the full schema report (mind_tool_report field)
 */
function buildSchemaReport(session: SchemaReflectionSession): string {
  const schema = schemas.find(s => s.schema_id === session.primary_schema);
  if (!schema) {
    return 'Schema reflection completed.';
  }

  const explored = session.explored_schemas
    .map(e => {
      const s = schemas.find(x => x.schema_id === e.schema_id);
      return `- ${s?.plain_name || e.schema_id}: ${e.resonance_rating}/5`;
    })
    .join('\n');

  let reportContent = `## Schema Reflection Report

**Primary Schema Explored:** ${schema.plain_name}

**All Schemas Explored:**
${explored}

**Reflection Prompts:**
${session.reflection_prompts.map((q, i) => `${i + 1}. ${q}`).join('\n')}

**Your Reflection:**
${session.reflection_text || '(No reflection provided)'}`;

  // Add AI Analysis if available
  if (session.ai_analysis) {
    reportContent += `

---

## AI Analysis Summary

**Key Themes:**
${session.ai_analysis.key_themes.map(t => `- ${t}`).join('\n')}

**Severity Assessment:**
${session.ai_analysis.severity_assessment}

**Protective Strategies You're Using:**
${session.ai_analysis.protective_strategies.map(s => `- ${s}`).join('\n')}

**How This Compares to Typical Patterns:**
${session.ai_analysis.comparison_to_typical}

**Personalized Recommendations:**
${session.ai_analysis.personalized_recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

**Full Analysis:**
${session.ai_analysis.raw_analysis}`;
  }

  reportContent += `

---

**About ${schema.plain_name}:**
${schema.full_description}

**Common Origins:**
${schema.common_origins}

**Next Steps:**
Consider exploring this pattern with a therapist or through continued self-reflection. Many schemas soften with awareness and compassionate attention.`;

  return reportContent;
}

/**
 * Build the short summary (mind_tool_short_summary field)
 */
function buildSchemaSummary(session: SchemaReflectionSession): string {
  const schema = schemas.find(s => s.schema_id === session.primary_schema);
  const primaryRating = session.explored_schemas.find(e => e.schema_id === session.primary_schema)?.resonance_rating || 0;

  return `Explored ${session.explored_schemas.length} schemas. Primary pattern: ${schema?.plain_name || 'Unknown'} (${primaryRating}/5). Reflection: ${
    session.reflection_text.slice(0, 100)
  }${session.reflection_text.length > 100 ? '...' : ''}`;
}

/**
 * Build suggested next steps based on the session
 */
function buildNextSteps(session: SchemaReflectionSession): Json {
  const schema = schemas.find(s => s.schema_id === session.primary_schema);

  return {
    steps: [
      {
        title: 'Deepen Your Understanding',
        description: `Spend time this week noticing when the "${schema?.plain_name}" pattern shows up. What triggers it? What do you do?`
      },
      {
        title: 'Explore Origins',
        description: `Reflect on where this pattern might have developed. What did you learn about this need or fear in childhood?`
      },
      {
        title: 'Consider Professional Support',
        description: 'Schema Therapy is a structured approach that can help heal these patterns. A trained therapist can accelerate this work.'
      },
      {
        title: 'Practice Self-Compassion',
        description: `Remember: this schema developed as a way to protect you. It was adaptive once. You can appreciate its function while choosing new responses.`
      }
    ]
  };
}

/**
 * Create a new empty schema reflection session
 */
export function createNewSession(): SchemaReflectionSession {
  return {
    id: uuidv4(),
    explored_schemas: [],
    primary_schema: '',
    reflection_prompts: [],
    reflection_text: '',
    completed: false,
    created_at: new Date().toISOString()
  };
}

/**
 * Calculate primary schema from resonance ratings
 * Returns the highest-rated schema (first one if tied)
 */
export function calculatePrimarySchema(explored: SchemaResonance[]): string {
  if (explored.length === 0) {
    return '';
  }

  return explored.reduce((prev, current) =>
    current.resonance_rating > prev.resonance_rating ? current : prev
  ).schema_id;
}
