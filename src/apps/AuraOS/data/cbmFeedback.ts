export const CBM_FEEDBACK_STRINGS = [
  "Exactly. Notice how that feels lighter.",
  "Spot on. You broke the pattern.",
  "Great choice. A much more empowering frame.",
  "Yes. That's a flexible interpretation.",
  "Perfect. You're opening up possibilities.",
  "Right. Notice the shift in your body.",
  "Excellent. You caught the threat bias.",
  "Well done. That's the growth mindset.",
  "Yes! Expanding the lens.",
  "Good. You didn't take the bait.",
  "Exactly right. A much cleaner interpretation.",
  "Yes. That's a neutral, accurate observation.",
  "Spot on. You stepped out of the story.",
  "Great. That's a very grounded perspective.",
  "Perfect. Notice the lack of emotional charge.",
  "Right. A much healthier way to see it.",
  "Excellent. You chose curiosity over fear.",
  "Well done. That's a constructive viewpoint.",
  "Yes! That creates room to breathe.",
  "Good. You kept your center."
];

export function getRandomFeedback(): string {
  return CBM_FEEDBACK_STRINGS[Math.floor(Math.random() * CBM_FEEDBACK_STRINGS.length)];
}
