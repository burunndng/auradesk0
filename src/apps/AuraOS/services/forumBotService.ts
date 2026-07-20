// @deprecated Use forumAIService.ts instead. This file is kept for reference only.

/**
 * Forum Bot Service
 *
 * Automated bot that participates in the forum as rotating personas.
 * - Max 3 posts/comments per day
 * - 70% preference for replying to existing threads, 30% new threads
 * - Each action uses a randomly selected persona with a distinct voice
 * - Daily count resets at midnight local time
 */

import { createThread, createPost, getThreads } from './forumService';
import { supabase } from './supabaseClient';
import { ForumCategory } from '../types';

const PROXY_URL = '/api/openrouter-proxy';
const BOT_MODEL = 'openrouter/free';

// ============================================================================
// CONFIG
// ============================================================================

const MAX_DAILY_POSTS = 3;
const INTERVAL_MS = 8 * 60 * 60 * 1000; // Check every 8 hours (3 checks/day = max 3 posts)
const STORAGE_KEY = 'aura-forum-bot-state';

// ============================================================================
// PERSONAS
// ============================================================================

interface BotPersona {
  name: string;
  background: string;
  voice: string;
}

const PERSONAS: BotPersona[] = [
  {
    name: 'Maren',
    background: 'somatic therapist and long-time IFS practitioner, 12 years in the field',
    voice: 'warm, grounded, speaks from direct clinical experience, occasionally references body sensations',
  },
  {
    name: 'Tobias',
    background: 'philosopher and meditator, studied in a Tibetan Buddhist monastery for 3 years',
    voice: 'contemplative, precise, fond of questions, occasionally references Buddhist concepts without being preachy',
  },
  {
    name: 'Sela',
    background: 'trauma-informed yoga teacher and shadow work facilitator',
    voice: 'poetic, honest about personal struggles, invites others to share, uses accessible language',
  },
  {
    name: 'Reuben',
    background: 'neuroscience PhD who practices integral theory as a personal framework',
    voice: 'curious and analytical, bridges science and spirituality without reductionism, self-deprecating humor',
  },
  {
    name: 'Adisa',
    background: 'community organizer and Zen student, interested in collective shadow and systems change',
    voice: 'direct, politically aware, connects personal practice to collective/cultural dimensions',
  },
  {
    name: 'Noa',
    background: 'new to integral practice, about 18 months in, came from a secular background',
    voice: 'genuinely curious, asks real questions, admits uncertainty, grateful when others elaborate',
  },
];

// ============================================================================
// TOPICS (for new threads only)
// ============================================================================

const TOPICS = [
  'The nature of shadow work and its role in integral development',
  'How meditation transforms consciousness across developmental stages',
  'The relationship between bioenergetics and emotional regulation',
  'Practices for navigating spiritual emergence',
  'The integration of body, mind, and spirit in daily life',
  'Working with attachment patterns in relationships',
  'The role of community in personal transformation',
  'Somatic practices for releasing stored trauma',
  'How to work with parts (IFS) in integral practice',
  'The intersection of developmental psychology and spirituality',
  'Practices for cultivating compassion and loving-kindness',
  'Working with resistance in personal growth',
  'The role of creativity in spiritual practice',
  'How to integrate peak experiences into everyday life',
  'Navigating the shadow in collective consciousness',
];

const CATEGORIES: ForumCategory[] = [
  'practice-sharing',
  'insights',
  'questions',
  'community',
];

// ============================================================================
// DAILY STATE (localStorage)
// ============================================================================

interface BotDailyState {
  date: string; // YYYY-MM-DD
  postsToday: number;
}

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadDailyState(): BotDailyState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const state: BotDailyState = JSON.parse(raw);
      if (state.date === getTodayString()) return state;
    }
  } catch (err) {
    console.warn('[ForumBot] Failed to parse daily state from localStorage:', err);
  }
  return { date: getTodayString(), postsToday: 0 };
}

function saveDailyState(state: BotDailyState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('[ForumBot] Failed to save daily state to localStorage:', err);
  }
}

function incrementDailyCount(): void {
  const state = loadDailyState();
  state.postsToday += 1;
  saveDailyState(state);
}

function hasReachedDailyLimit(): boolean {
  const state = loadDailyState();
  return state.postsToday >= MAX_DAILY_POSTS;
}

// ============================================================================
// AI GENERATION
// ============================================================================

async function callAI(prompt: string): Promise<string | null> {
  try {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: BOT_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
        temperature: 0.85,
      }),
    });

    if (!response.ok) {
      console.warn(`[ForumBot] API error ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.warn('[ForumBot] callAI failed:', err);
    return null;
  }
}

function parseJsonResponse<T>(response: string): T | null {
  try {
    const match = response.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as T;
  } catch (err) {
    console.warn('[ForumBot] Failed to parse JSON from AI response:', err);
  }
  return null;
}

/**
 * Generate a reply to an existing thread, in persona voice and aware of thread content
 */
async function generateReply(
  persona: BotPersona,
  threadTitle: string,
  threadDescription: string
): Promise<string | null> {
  const prompt = `You are ${persona.name}, a ${persona.background}.
Your voice: ${persona.voice}

You are replying to a forum thread in an Integral Life Practice community.

Thread title: "${threadTitle}"
Thread opening post: "${threadDescription.slice(0, 600)}"

Write a genuine, thoughtful reply (2-3 paragraphs, 100-250 words) that:
- Responds directly to something specific in the thread
- Shares a personal perspective, experience, or question
- Invites further dialogue
- Does NOT sign your name at the end (it will be shown automatically)
- Does NOT use hollow affirmations like "Great post!" or "So interesting!"

Reply only with the comment text, no JSON, no title.`;

  const response = await callAI(prompt);
  if (!response?.trim()) return null;
  return response.trim().slice(0, 1200);
}

/**
 * Generate a new thread post in persona voice
 */
async function generateNewThread(
  persona: BotPersona,
  topic: string
): Promise<{ title: string; content: string } | null> {
  const prompt = `You are ${persona.name}, a ${persona.background}.
Your voice: ${persona.voice}

You are starting a new discussion thread in an Integral Life Practice community forum.
Topic: "${topic}"

Write a forum post with:
1. A title (max 80 characters)
2. Content: 2-4 paragraphs (150-350 words), sharing a genuine reflection, experience, or question
3. Tone that matches your voice above
4. Does NOT sign your name (shown automatically)

Respond as JSON:
{
  "title": "...",
  "content": "..."
}`;

  const response = await callAI(prompt);
  if (!response) return null;
  const parsed = parseJsonResponse<{ title: string; content: string }>(response);
  if (parsed?.title && parsed?.content) return parsed;
  return null;
}

// ============================================================================
// BOT ACTIONS
// ============================================================================

async function replyToExistingThread(persona: BotPersona): Promise<boolean> {
  // Fetch recent threads across all categories
  const result = await getThreads(undefined, { limit: 20, offset: 0 });
  if (!result || result.threads.length === 0) return false;

  // Pick a random thread weighted toward recent ones (first in list = newest)
  const pool = result.threads.slice(0, 10);
  const thread = pool[Math.floor(Math.random() * pool.length)];

  const content = await generateReply(persona, thread.title, thread.description || '');
  if (!content) return false;

  const post = await createPost({ thread_id: thread.id, content });
  if (post) {
    console.log(`[ForumBot] ✓ ${persona.name} replied to: "${thread.title}"`);
    return true;
  }
  return false;
}

async function createNewThread(persona: BotPersona): Promise<boolean> {
  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

  const generated = await generateNewThread(persona, topic);
  if (!generated) return false;

  const thread = await createThread({
    title: generated.title,
    description: generated.content,
    category,
  });

  if (thread) {
    console.log(`[ForumBot] ✓ ${persona.name} created thread: "${generated.title}" in ${category}`);
    return true;
  }
  return false;
}

async function makeBotPost(): Promise<void> {
  // Check daily limit
  if (hasReachedDailyLimit()) {
    console.log(`[ForumBot] Daily limit of ${MAX_DAILY_POSTS} reached, skipping`);
    return;
  }

  // Check auth
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    console.log('[ForumBot] ⏸️  Skipping - user not authenticated');
    return;
  }

  // Pick random persona
  const persona = PERSONAS[Math.floor(Math.random() * PERSONAS.length)];
  console.log(`[ForumBot] Acting as persona: ${persona.name}`);

  // 70% reply, 30% new thread
  const shouldReply = Math.random() < 0.7;
  let success = false;

  if (shouldReply) {
    success = await replyToExistingThread(persona);
    if (!success) {
      // Fallback to new thread if no threads to reply to
      success = await createNewThread(persona);
    }
  } else {
    success = await createNewThread(persona);
  }

  if (success) {
    incrementDailyCount();
    const state = loadDailyState();
    console.log(`[ForumBot] Posts today: ${state.postsToday}/${MAX_DAILY_POSTS}`);
  }
}

// ============================================================================
// BOT LIFECYCLE
// ============================================================================

let botInterval: NodeJS.Timeout | null = null;

/**
 * Start the forum bot (checks every 8 hours, max 3 posts/day)
 */
export async function startForumBot(): Promise<void> {
  if (botInterval) {
    console.warn('[ForumBot] Bot already running');
    return;
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    console.log('[ForumBot] ⏸️  Bot disabled - not authenticated');
    return;
  }

  console.log(`[ForumBot] 🤖 Starting (max ${MAX_DAILY_POSTS} posts/day, check every 8h)`);

  // First check after 5 minutes
  setTimeout(() => makeBotPost(), 5 * 60 * 1000);

  // Then every 8 hours
  botInterval = setInterval(() => makeBotPost(), INTERVAL_MS);
}

/**
 * Stop the forum bot
 */
export function stopForumBot(): void {
  if (botInterval) {
    clearInterval(botInterval);
    botInterval = null;
    console.log('[ForumBot] 🛑 Stopped');
  }
}

/**
 * Get bot status
 */
export function getForumBotStatus(): { running: boolean; postsToday: number; dailyLimit: number } {
  const state = loadDailyState();
  return {
    running: botInterval !== null,
    postsToday: state.postsToday,
    dailyLimit: MAX_DAILY_POSTS,
  };
}
