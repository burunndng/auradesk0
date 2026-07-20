// services/biasDetectiveService.ts
import { executeWithFallback } from '../utils/modelFallback';

const PROXY_URL = '/api/openrouter-proxy';

async function callOpenRouterFallback(prompt: string, maxTokens: number = 2000): Promise<string> {
  try {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: maxTokens,
        provider: { quantizations: ['bf16'] }
      })
    });

    if (!response.ok) {
      throw new Error(`Proxy error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    throw new Error(`OpenRouter fallback failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

interface DiscoveryAnswers {
  alternativesConsidered: string;
  informationSources: string;
  timePressure: string;
  emotionalState: string;
  influencers: string;
}

interface BiasScenario {
  biasName: string;
  howItInfluenced: string;
  scenario: string;
  alternativeDecision: string;
}

/**
 * Analyzes a user's decision-making process using Socratic inputs.
 * @returns A narrative analysis of potential biases, grounded in the user's answers.
 */
export async function generateBiasedDecisionAnalysis(
  decision: string,
  reasoning: string,
  discoveryAnswers: DiscoveryAnswers
): Promise<string> {
  const prompt = `
    As a cognitive psychologist, analyze the user's decision-making process based on their own reflections.
    Your task is to provide a grounded, narrative diagnosis of potential cognitive biases at play.
    Reference their specific answers to make the analysis feel undeniable and personalized.

    **User's Decision:**
    "${decision}"

    **User's Reasoning:**
    "${reasoning}"

    **User's Discovery Answers:**
    1.  **Alternatives Considered:** "${discoveryAnswers.alternativesConsidered}"
    2.  **Information Sources & Gaps:** "${discoveryAnswers.informationSources}"
    3.  **Time Pressure:** "${discoveryAnswers.timePressure}"
    4.  **Emotional State:** "${discoveryAnswers.emotionalState}"
    5.  **Influencers:** "${discoveryAnswers.influencers}"

    **Your Analysis:**
    Begin by acknowledging their reflection. Then, in a narrative format (2-3 paragraphs), connect their discovery answers to 2-3 likely cognitive biases.
    For example, if they dismissed alternatives quickly and were anxious, you could link that to Confirmation Bias and the brain's tendency to reduce cognitive load under stress.
    Make it feel like a synthesis of what they've already uncovered, not a judgment.

    **Example Snippet:** "It's insightful that you noted you dismissed alternatives quickly while feeling anxious. This often points to Confirmation Bias, where our brains, under pressure, gravitate toward defending an initial instinct rather than staying curious and seeking disconfirming evidence, which you also mentioned you didn't look for."

    Return ONLY the narrative analysis as a single string.
    `;

  return await executeWithFallback(
    'BiasDetective',
    'openrouter/free',
    async (primaryModel) => {
      try {
        const response = await fetch(PROXY_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: primaryModel,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 2000,
          })
        });

        if (!response.ok) {
          throw new Error(`Proxy error: ${response.status}`);
        }

        const data = await response.json();
        if (!data.choices[0]?.message?.content) {
          throw new Error('API response returned empty text');
        }

        return data.choices[0].message.content;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to generate biased decision analysis: ${errorMessage}`);
      }
    },
    async (fallbackModel) => {
      return await callOpenRouterFallback(prompt);
    }
  );
}

/**
 * Generates actionable "what if" scenarios to counter identified biases.
 * @returns An array of BiasScenario objects.
 */
export async function generateBiasScenarios(
  decision: string,
  reasoning: string,
  diagnosis: string
): Promise<BiasScenario[]> {
  try {
    const prompt = `
    A user has made a decision and received a diagnosis of potential biases.

    **Decision:** "${decision}"
    **Reasoning:** "${reasoning}"
    **AI Diagnosis:** "${diagnosis}"

    Your task is to generate 3-4 concrete, actionable "what if" scenarios that directly counter the biases mentioned in the diagnosis.
    Each scenario should be a practical exercise the user can imagine doing.

    For each scenario, return an object with the following keys:
    - "biasName": The name of the bias it's designed to counter.
    - "howItInfluenced": A brief, one-sentence explanation of how this bias likely shaped the original decision based on the diagnosis.
    - "scenario": The "what if" question or prompt for the user to consider.
    - "alternativeDecision": A plausible alternative outcome that might have resulted from this new approach.

    Return a JSON array of these objects.
    Return ONLY the JSON array.
    `;

    const responseText = await executeWithFallback(
      'BiasDetective_Scenarios',
      'openrouter/free',
      async (primaryModel) => {
        const response = await fetch(PROXY_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: primaryModel,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 2000,
          })
        });

        if (!response.ok) {
          throw new Error(`Proxy error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || '';
      },
      async (fallbackModel) => {
        // Fallback to Qwen via proxy
        const response = await fetch(PROXY_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'openrouter/free',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 2000,
          })
        });

        if (!response.ok) {
          throw new Error(`Proxy error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || '';
      }
    );

    if (!responseText) {
      throw new Error('API response returned empty text');
    }

    const cleanJson = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    if (!Array.isArray(parsed)) {
      throw new Error('Invalid response structure - expected an array');
    }

    return parsed as BiasScenario[];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate bias scenarios: ${errorMessage}`);
  }
}
