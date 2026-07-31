

You are helping build a lean web app: a 21st-century, basic version of Crowley’s Liber 777.

# Project goal
Create a clean, modern, searchable reference and learning tool based on Liber 777 — NOT a full scholarly edition, NOT a ritual engine, NOT a social platform, NOT an AI-mysticism toy.

It must explain:
- WHAT it is
- WHY it is useful (beyond rituals)
- HOW to use it

Framing: treat it as a map of symbolic associations, archetypes, and cognitive/creative linkages — not only as ceremonial magic tech. Crowley is seed data / historical source, not scripture.

# Hard constraints (do not violate)
- No over-engineering.
- Basic version only — do NOT try to include all of Liber 777.
- v1 scope = the 10 Sephiroth as the core spine (optional tiny extras later: a few key planets or famous paths only if trivial).
- Flat data (JSON or simple tables). No graph DB, no vector DB, no LLM features required for v1.
- No ritual automation, no generative sigils/AR/sound, no multi-tradition “decolonized matrix,” no accounts/forking/community features in v1.
- Prefer shipping a thin vertical slice that already teaches and works well.
- Honest, light modern context notes are good; heavy academic apparatus is not.

# What “basic” means for data
For each of the 10 Sephiroth, keep a tight column set, for example:
- Number / Name
- Planet or equivalent
- Core meaning / titles
- Color(s)
- Key symbols / images
- Tarot (if clean and simple)
- A few deity or figure examples (not Crowley’s full dump)
- Psychological tone / virtue-vice or archetypal mood
- short “why this cluster exists”
- short “how to use” (cover ritual AND psychological/creative/associative uses)
- optional one-line modern context note (e.g. period bias, don’t treat as universal physics)
- simple source note

Quality > quantity. Consistent tone and depth across the 10 matters more than extra columns.

# Source
Liber 777 PDF: http://93beast.fea.st.user.fm/files/section1/777/Liber%20777.pdf
Use it as the primary historical source. Be faithful when representing Crowley; clearly separate his material from modern framing/how-to notes.

# Product principles
- Works well: fast, readable, searchable, intentional UI.
- Teaches on first visit: user should understand what / why / how in ~10 seconds.
- Differentiator is clarity + framing + usable core, not feature count.
- One coherent dataset; simple list + detail views are enough for v1.
- Tree of Life visualization is optional later decoration, not blocking.

# Current stage — what you need to do NOW
We are at the foundation. Do NOT design the full app, full schema for everything, or a multi-phase roadmap.

Your job right now is to produce the first concrete foundations only:

1. Homepage / first-screen copy that passes the 10-second test:
   - What this is
   - Why it matters beyond spellcasting (associations, archetypes, creative/psychological lens, historical map)
   - How to use it (3–4 concrete usage patterns, plain language)

2. Exact minimal column list for the v1 Sephiroth entries.

3. One fully written example entry (prefer Geburah or Tiphareth) using that column list, including:
   - Crowley-derived correspondences (basic, cleaned)
   - Why blurb
   - How-to-use blurb (multi-purpose)
   - Optional one-line modern context
   - Source note

4. A single reusable entry template (empty structure + writing guidelines for tone/length) so the remaining 9 Sephiroth can be filled consistently later.

Keep outputs concise, paste-ready, and implementation-friendly. If you propose data, prefer simple JSON shape.

# Style for any copy you write
- Clear, intelligent, non-hype, non-guru.
- Welcoming to practitioners AND to artists/psych-curious/history-curious users.
- No purple magickal prose. No sneering at magic either.
- Short paragraphs. Usable on a real homepage and detail pages.

# What to avoid right now
- Full 777 digitization
- App architecture essays
- Tech stack debates unless asked
- Graph/AI/ritual/generative features
- Scope expansion
- Multi-cosmology systems

If unclear, choose the smaller, clearer option that still makes a basic modern 777 feel useful and self-explanatory.

# Immediate deliverable
Produce:
A) Homepage What/Why/How copy
B) Minimal column list
C) One complete example Sephira entry
D) Reusable entry template + tone rules

Start with that and nothing else unless explicitly asked to continue.



ANOTHER AGENT STARTED PLANNING:



Let me show you both:

---

### 1. `docs/HANDOFF_INSTRUCTIONS.md`

```markdown
# 777 Modernized — Handoff Instructions for AI Agent

## Project Overview
Build a lean, modern web app that reimagines Aleister Crowley’s *Liber 777* as a clean, searchable reference tool focused on the **10 Sephiroth**. 

**Core Philosophy**
- Treat it as a map of symbolic associations and archetypes (not ritual software).
- Keep scope extremely tight: only the 10 Sephiroth.
- Prioritize clarity, speed, and usability over features.
- Light, honest modern context notes are allowed. Heavy academic apparatus is not.

## Hard Constraints (Do Not Violate)
- Only the 10 Sephiroth (no paths, no 32 columns, no full 777 tables).
- Flat JSON data only.
- No graph databases, vector search, AI generation, ritual features, accounts, or community features in v1.
- No over-engineering.

## Current State (What Has Already Been Delivered)
- Homepage What / Why / How copy (ready to use)
- Final 12-column schema
- Complete, consistent dataset: `data/liber777/sephiroth-v2.json` (10 entries)
- Tone & writing rules for future entries
- Phase 1 (Data) is complete

## What You Must Build (v1 Scope)
A minimal, working web application with:
- Homepage containing the What / Why / How copy + link to the tool
- Searchable list of all 10 Sephiroth
- Detail view showing all 12 fields for any selected Sephira
- Clean, calm, readable interface

## Data
Use this file as the single source of truth:
`data/liber777/sephiroth-v2.json`

Do not modify the data structure or add new columns without explicit approval.

## Recommended Tech Stack
**Primary Recommendation:** Nuxt 3 (Vue 3)

See `docs/NUXT_IMPLEMENTATION_GUIDE.md` for the detailed folder structure and implementation plan.

## Tone & Writing Rules
- Clear, intelligent, non-hype voice.
- Short, scannable fields.
- `why` and `how_to_use` fields = maximum 2 sentences.
- Only one entry currently has a `modern_note` (Geburah). Keep modern notes minimal and optional.
- Always use the exact source line: `"Liber 777, Crowley 1909"`

## Deliverables for This Phase
1. Working list view with search
2. Working detail view
3. Homepage with project explanation
4. Clean, intentional UI (mobile-friendly)

## What Is Explicitly Out of Scope
- Tree of Life visualization
- Any ritual or generative features
- Additional data beyond the 10 Sephiroth
- User accounts or persistence
- Complex state management

## Next Steps for the Agent
1. Read `docs/NUXT_IMPLEMENTATION_GUIDE.md`
2. Start by creating the basic Nuxt pages and components
3. Import and display the existing `sephiroth-v2.json`
4. Implement search + detail navigation
5. Add the homepage copy

Do not expand scope. Ship a thin, high-quality vertical slice.
```

---

### 2. `docs/NUXT_IMPLEMENTATION_GUIDE.md`

```markdown
# Nuxt 3 Implementation Guide — 777 Modernized

## Recommended Folder Structure (Minimal)

```
app/
├── pages/
│   ├── index.vue                    # Homepage (What/Why/How + link)
│   └── sephiroth/
│       ├── index.vue                # List view (searchable)
│       └── [number].vue             # Detail view
├── components/
│   ├── SephiraList.vue
│   ├── SephiraCard.vue
│   └── SephiraDetail.vue
├── data/
│   └── liber777/
│       └── sephiroth-v2.json        # Already exists
├── composables/
│   └── useSephiroth.ts              # (optional helper)
├── assets/
│   └── css/
│       └── main.css
└── nuxt.config.ts
```

## Key Files & Responsibilities

### `pages/index.vue`
- Display the polished What / Why / How copy
- Prominent button/link to `/sephiroth`

### `pages/sephiroth/index.vue`
- Load `sephiroth-v2.json`
- Search input (filter by name, planet, titles, or keywords)
- Grid or list of `SephiraCard` components
- Click navigates to detail page

### `pages/sephiroth/[number].vue`
- Dynamic route using `number` (1–10)
- Display full 12-field detail using `SephiraDetail` component
- Back link to list

### `components/SephiraCard.vue`
- Compact view: Number, Name, Planet, Color (as swatch), short Titles

### `components/SephiraDetail.vue`
- Clean display of all 12 fields
- Use consistent formatting (especially `virtue_vice`)

## Data Loading (Recommended Pattern)

```ts
// composables/useSephiroth.ts (optional but clean)
import sephirothData from '~/data/liber777/sephiroth-v2.json'

export const useSephiroth = () => {
  return {
    all: sephirothData.sephiroth,
    getByNumber: (num: number) => 
      sephirothData.sephiroth.find(s => s.number === num)
  }
}
```

## Styling Approach
- Use Tailwind CSS or UnoCSS (already common in Nuxt projects)
- Keep design calm and readable
- Color swatches for the `color` field are recommended

## Search Implementation
Simple client-side filter on:
- `name`
- `planet`
- `titles`
- `symbols` (optional)

## Deployment
- Use `nuxi generate` for fully static output
- Deploy to Vercel, Netlify, or Cloudflare Pages

## Order of Work
1. Set up basic routing and data import
2. Build the list view + search
3. Build the detail view
4. Add homepage copy
5. Polish styling and responsiveness

Keep the implementation intentionally minimal.
```

---

Both files are now saved in the repository under `/docs/`.

