#!/usr/bin/env node
/**
 * Demo: Subjective Reality Engine
 * 
 * This demo shows how the same events are interpreted differently
 * by characters in different phenomenal states.
 */

console.log("╔═══════════════════════════════════════════════════════════════╗");
console.log("║     SUBJECTIVE REALITY ENGINE - INTERACTIVE DEMO              ║");
console.log("╚═══════════════════════════════════════════════════════════════╝\n");

const fs = require('fs');
const path = require('path');

// Load library
const libraryCode = fs.readFileSync(path.join(__dirname, 'Library v16.0.8.patched.txt'), 'utf8');
global.state = { lincoln: {} };
eval(libraryCode);

const L = LC.lcInit();
L.turn = 1;
L.characters = {};

// Create characters with different phenomenal states
console.log("📖 SCENARIO: Three students react to the same compliment\n");

L.aliases = {
  'Оптимист': ['оптимист'],
  'Параноик': ['параноик'],
  'Нейтрал': ['нейтрал']
};

LC.updateCharacterActivity("Оптимист, Параноик и Нейтрал в классе", false);

// Configure phenomenal states
L.characters['Оптимист'].qualia_state = {
  somatic_tension: 0.2,  // Relaxed
  valence: 0.9,          // Very happy
  focus_aperture: 0.8,
  energy_level: 0.9
};

L.characters['Параноик'].qualia_state = {
  somatic_tension: 0.95, // Very tense
  valence: 0.15,         // Negative
  focus_aperture: 0.2,
  energy_level: 0.3
};

L.characters['Нейтрал'].qualia_state = {
  somatic_tension: 0.4,  // Moderate
  valence: 0.5,          // Neutral
  focus_aperture: 0.6,
  energy_level: 0.7
};

console.log("👤 CHARACTERS:");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

console.log("🌟 Оптимист:");
console.log("   State: Relaxed, very happy (valence: 0.9, tension: 0.2)");
console.log("   Personality: Generally trusting and positive");

console.log("\n😰 Параноик:");
console.log("   State: Extremely tense and negative (valence: 0.15, tension: 0.95)");
console.log("   Personality: Suspicious, expects hidden motives");

console.log("\n😐 Нейтрал:");
console.log("   State: Balanced, neutral mood (valence: 0.5, tension: 0.4)");
console.log("   Personality: Pragmatic, level-headed");

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

// Event: Teacher (Учитель) compliments each student
console.log("📣 EVENT: Teacher says \"Хорошая работа!\" to each student\n");

L.characters['Учитель'] = {
  mentions: 10,
  lastSeen: 10,
  type: 'SECONDARY',
  status: 'ACTIVE',
  personality: { trust: 0.6, bravery: 0.5, idealism: 0.6, aggression: 0.2 },
  qualia_state: { somatic_tension: 0.3, valence: 0.6, focus_aperture: 0.7, energy_level: 0.7 },
  perceptions: {}
};

// Simulate compliment to each character
const event = {
  type: 'social',
  action: 'compliment',
  rawModifier: 5,
  actor: 'Учитель',
  target: null
};

console.log("🔍 INTERPRETATIONS:");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

// Оптимист interpretation
const optimistEvent = { ...event, target: 'Оптимист' };
const optimistInterp = LC.InformationEngine.interpret(L.characters['Оптимист'], optimistEvent);

console.log("🌟 Оптимист's interpretation:");
console.log(`   Sees it as: "${optimistInterp.interpretation}"`);
console.log(`   Emotional impact: ${optimistInterp.subjectiveModifier.toFixed(1)} (boosted from base 5.0)`);
console.log(`   Thought: "The teacher really believes in me! I'm doing well!"`);

// Apply interpretation
LC.InformationEngine.updatePerception('Оптимист', 'Учитель', optimistInterp);

// Параноик interpretation
const paranoidEvent = { ...event, target: 'Параноик' };
const paranoidInterp = LC.InformationEngine.interpret(L.characters['Параноик'], paranoidEvent);

console.log("\n😰 Параноик's interpretation:");
console.log(`   Sees it as: "${paranoidInterp.interpretation}"`);
console.log(`   Emotional impact: ${paranoidInterp.subjectiveModifier.toFixed(1)} (reduced from base 5.0)`);
console.log(`   Trust change: ${paranoidInterp.trustModifier} (penalty for suspicion)`);
console.log(`   Thought: "What does the teacher want? This feels like manipulation..."`);

// Apply interpretation
LC.InformationEngine.updatePerception('Параноик', 'Учитель', paranoidInterp);

// Нейтрал interpretation
const neutralEvent = { ...event, target: 'Нейтрал' };
const neutralInterp = LC.InformationEngine.interpret(L.characters['Нейтрал'], neutralEvent);

console.log("\n😐 Нейтрал's interpretation:");
console.log(`   Sees it as: "${neutralInterp.interpretation}"`);
console.log(`   Emotional impact: ${neutralInterp.subjectiveModifier.toFixed(1)} (unchanged from base 5.0)`);
console.log(`   Thought: "The teacher is being professional and encouraging. Good."`);

// Apply interpretation
LC.InformationEngine.updatePerception('Нейтрал', 'Учитель', neutralInterp);

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

// Show resulting perceptions
console.log("💭 RESULTING PERCEPTIONS OF TEACHER:");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

const optimistPerc = L.characters['Оптимист'].perceptions['Учитель'];
const paranoidPerc = L.characters['Параноик'].perceptions['Учитель'];
const neutralPerc = L.characters['Нейтрал'].perceptions['Учитель'];

console.log("🌟 Оптимист → Учитель:");
console.log(`   Affection: ${optimistPerc.affection.toFixed(1)}/100 ⬆️ (strongly positive)`);
console.log(`   Trust:     ${optimistPerc.trust.toFixed(1)}/100`);
console.log(`   Overall: Likes teacher, feels encouraged`);

console.log("\n😰 Параноик → Учитель:");
console.log(`   Affection: ${paranoidPerc.affection.toFixed(1)}/100 (slightly positive)`);
console.log(`   Trust:     ${paranoidPerc.trust.toFixed(1)}/100 ⬇️ (suspicious!)`);
console.log(`   Overall: Uncertain, doesn't trust the compliment`);

console.log("\n😐 Нейтрал → Учитель:");
console.log(`   Affection: ${neutralPerc.affection.toFixed(1)}/100 ➡️ (moderately positive)`);
console.log(`   Trust:     ${neutralPerc.trust.toFixed(1)}/100`);
console.log(`   Overall: Professional appreciation`);

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

// Demonstrate asymmetry with second scenario
console.log("📖 SCENARIO 2: Off-screen interaction during time jump\n");

// Reset teacher's perceptions
L.characters['Учитель'].perceptions = {
  'Оптимист': { affection: 50, trust: 50, respect: 50, rivalry: 50 },
  'Параноик': { affection: 50, trust: 50, respect: 50, rivalry: 50 }
};

// Simulate off-screen positive interaction
const action = { type: 'SOCIAL_POSITIVE', target: 'Параноик', mood: 'HAPPY' };
LC.LivingWorld.generateFact('Оптимист', action);

console.log("⏰ Time Jump: Morning → Evening");
console.log("📝 Event: Оптимист tries to befriend Параноик (off-screen)\n");

const optToParPerc = L.characters['Оптимист'].perceptions['Параноик'];
const parToOptPerc = L.characters['Параноик'].perceptions['Оптимист'];

console.log("🔍 ASYMMETRIC PERCEPTIONS:");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

console.log("🌟 Оптимист's view:");
console.log(`   Affection for Параноик: ${optToParPerc.affection.toFixed(1)}/100 ⬆️`);
console.log(`   Trust in Параноик:      ${optToParPerc.trust.toFixed(1)}/100`);
console.log(`   Thought: "We're becoming friends! I think they like me."`);

console.log("\n😰 Параноик's view:");
console.log(`   Affection for Оптимист: ${parToOptPerc.affection.toFixed(1)}/100 (minimal increase)`);
console.log(`   Trust in Оптимист:      ${parToOptPerc.trust.toFixed(1)}/100 ⬇️`);
console.log(`   Thought: "They're being too nice. What do they really want?"`);

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

console.log("💡 KEY INSIGHT:");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
console.log("The SAME friendly gesture creates OPPOSITE effects:");
console.log("  • Оптимист feels friendship growing (affection ⬆️, trust stable)");
console.log("  • Параноик becomes MORE suspicious (affection ~, trust ⬇️)");
console.log("\nThis is SUBJECTIVE REALITY in action!");
console.log("Each character's phenomenal state (qualia) filters perception.");
console.log("Same objective event → Different subjective experiences → Asymmetric relations\n");

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

console.log("✨ NARRATIVE POSSIBILITIES:");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
console.log("  • Unrequited friendship (one likes, other suspicious)");
console.log("  • Escalating misunderstandings (kindness seen as manipulation)");
console.log("  • Character arcs through qualia changes (tense → relaxed → open to friendship)");
console.log("  • Dramatic irony (player knows both perspectives)");
console.log("  • Rich dialogue (\"I thought we were friends!\" \"You were using me!\")\n");

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
console.log("Demo complete! 🎭\n");
console.log("The world is no longer objective. Each character lives in their own reality.");
console.log("Welcome to the Subjective Reality Engine! ✨\n");
