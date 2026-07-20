import React from 'react';
import { TabShell } from '../../../components/shared/TabShell';
import { HeroSection } from './integralHistory/HeroSection';
import { WilberSection } from './integralHistory/WilberSection';
import { InfluencesSection } from './integralHistory/InfluencesSection';
import { TimelineSection, type TimelineEvent } from './integralHistory/TimelineSection';

const timelineEvents: TimelineEvent[] = [
  { year: 1977, label: "The Spectrum of Consciousness", type: 'publication', description: "Wilber's first book synthesizes East and West" },
  { year: 1980, label: "The Atman Project", type: 'publication', description: "Developmental stages mapped from birth to enlightenment" },
  { year: 1983, label: "Up From Eden", type: 'publication', description: "Cultural evolution through historical lens" },
  { year: 1995, label: "Sex, Ecology, Spirituality", type: 'publication', description: "Introduction of Four Quadrants (AQAL framework)" },
  { year: 1998, label: "Integral Institute Founded", type: 'institution', description: "Think tank for applying integral theory across disciplines" },
  { year: 2000, label: "A Theory of Everything", type: 'publication', description: "Accessible introduction reaches wider audience" },
  { year: 2003, label: "Integral Naked Launch", type: 'media', description: "Online platform for integral dialogues and teachings" },
  { year: 2006, label: "Integral Life Founded", type: 'institution', description: "Online platform for integral community and content" },
  { year: 2006, label: "Integral Spirituality", type: 'publication', description: "States, stages, and shadow in spiritual development" },
  { year: 2007, label: "Integral Theory Conference", type: 'event', description: "First major academic conference on integral theory" },
  { year: 2011, label: "Integral Life Practice Book", type: 'publication', description: "Practical guide by Wilber, Patten, Leonard, Morelli" },
  { year: 2016, label: "Trump and a Post-Truth World", type: 'essay', description: "Wilber analyzes postmodernism's shadow and cultural dynamics" },
  { year: 2017, label: "The Religion of Tomorrow", type: 'publication', description: "1000+ page synthesis of world's spiritual traditions" },
  { year: 2019, label: "Integral Stage Reaches 5% (est.)", type: 'milestone', description: "Estimated percentage of global population at integral stage" },
  { year: 2023, label: "Metamodernism Emerges", type: 'movement', description: "Integral-adjacent cultural movement gains traction" }
];

const integralHistoryData = {
  hero: {
    title: "The Evolution of Integral Theory",
    subtitle: "From Ancient Wisdom to Metamodern Synthesis",
    body: "Integral Theory didn't appear fully formed from a single mind—it emerged through centuries of developmental thinking, cross-cultural synthesis, and evolutionary philosophy. From the Vedas to Hegel, from Aurobindo to Wilber, this is the story of how humanity learned to think integrally.",
    koan: "What does it mean to see everything at once without losing the details?"
  },
  wilber: {
    title: "Ken Wilber",
    subtitle: "The Architect of Integral Theory",
    biography: "Born in Oklahoma City in 1949, Ken Wilber began his intellectual journey studying biochemistry before a profound existential crisis redirected him toward consciousness studies. At 23, he wrote his first book, *The Spectrum of Consciousness*, synthesizing insights from Western psychology and Eastern contemplative traditions. Over five decades, Wilber has published more than 25 books, founding Integral Institute and developing the AQAL framework that now serves as the operating system for Integral Life Practice.",
    approach: "Wilber's methodology is inclusivity through transcendence: honor all perspectives by finding the partial truth each contains, then integrate them into more comprehensive frameworks. He calls this 'transcend and include'—evolution doesn't discard earlier stages, it embraces and incorporates them.",
    evolution: "Wilber's own thinking has evolved through multiple phases—from 'Wilber I' (spectrum psychology) through 'Wilber II' (developmental stages) to 'Wilber V' (post-metaphysics and Integral Methodological Pluralism). Each phase refines and expands the previous without negating it.",
    works: [
      { year: 1977, title: "The Spectrum of Consciousness", significance: "Unified Western psychology and Eastern meditation traditions" },
      { year: 1980, title: "The Atman Project", significance: "Developmental stages from birth to enlightenment" },
      { year: 1995, title: "Sex, Ecology, Spirituality", significance: "Introduction of the Four Quadrants (AQAL)" },
      { year: 2000, title: "Integral Psychology", significance: "Comprehensive charts mapping 100+ developmental models" },
      { year: 2000, title: "A Theory of Everything", significance: "Accessible introduction to Integral Theory" },
      { year: 2006, title: "Integral Spirituality", significance: "States, stages, and shadow in spiritual development" },
      { year: 2017, title: "The Religion of Tomorrow", significance: "Integral approach to world religions and contemplative practice" }
    ]
  },
  influences: {
    title: "Streams That Fed the River",
    subtitle: "The Lineages and Influences Behind Integral Theory",
    description: "Integral Theory stands on the shoulders of giants—philosophers, mystics, and scientists who saw partial glimpses of the whole. These are the key streams of thought that converged to create the integral vision.",
    streams: [
      {
        category: "Evolutionary Philosophy",
        figures: [
          { name: "Hegel", contribution: "Dialectical development: thesis-antithesis-synthesis", years: "1770-1831" },
          { name: "Teilhard de Chardin", contribution: "Omega Point and cosmic evolution of consciousness", years: "1881-1955" },
          { name: "Sri Aurobindo", contribution: "Integral Yoga and the evolution of consciousness", years: "1872-1950" }
        ]
      },
      {
        category: "Developmental Psychology",
        figures: [
          { name: "Jean Piaget", contribution: "Cognitive developmental stages", years: "1896-1980" },
          { name: "Lawrence Kohlberg", contribution: "Moral development stages", years: "1927-1987" },
          { name: "Jane Loevinger", contribution: "Ego development theory", years: "1918-2008" },
          { name: "Robert Kegan", contribution: "Subject-Object theory and orders of consciousness", years: "1946-present" }
        ]
      },
      {
        category: "Cultural Evolution",
        figures: [
          { name: "Jean Gebser", contribution: "Structures of consciousness: archaic, magical, mythical, mental, integral", years: "1905-1973" },
          { name: "Clare Graves", contribution: "Spiral Dynamics: emergent levels of human existence", years: "1914-1986" },
          { name: "Don Beck", contribution: "Applied Spiral Dynamics (with Chris Cowan)", years: "1937-2022" }
        ]
      },
      {
        category: "Contemplative Traditions",
        figures: [
          { name: "Plotinus", contribution: "Neoplatonic levels of being: One, Intellect, Soul, Matter", years: "204-270 CE" },
          { name: "Shankara", contribution: "Advaita Vedanta: non-dual awareness", years: "788-820 CE" },
          { name: "Padmasambhava", contribution: "Tibetan Buddhism: Dzogchen and rigpa", years: "8th century CE" }
        ]
      },
      {
        category: "Systems Theory",
        figures: [
          { name: "Ludwig von Bertalanffy", contribution: "General Systems Theory", years: "1901-1972" },
          { name: "Erich Jantsch", contribution: "Self-organizing systems and co-evolution", years: "1929-1980" },
          { name: "Arthur Koestler", contribution: "Holarchy: holons within holons", years: "1905-1983" }
        ]
      }
    ]
  },
  timeline: {
    title: "The Integral Timeline",
    subtitle: "Key Milestones in the Development of Integral Theory",
    events: timelineEvents
  }
};

export default function IntegralHistory() {
  return (
    <TabShell 
      tab="integral-history"
      subtitle="From Ancient Wisdom to Metamodern Synthesis"
    >
      <HeroSection data={integralHistoryData.hero} />
      <WilberSection data={integralHistoryData.wilber} />
      <InfluencesSection data={integralHistoryData.influences} />
      <TimelineSection data={integralHistoryData.timeline} />
    </TabShell>
  );
}
