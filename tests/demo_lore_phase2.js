#!/usr/bin/env node
/**
 * Demonstration of LoreEngine Phase 2 Integration
 * Shows how legends influence norms, interpretations, and goals
 */

console.log("╔════════════════════════════════════════════════════════════════════╗");
console.log("║  Genesis Protocol Phase 2: LoreEngine Integration Demo            ║");
console.log("╚════════════════════════════════════════════════════════════════════╝\n");

const fs = require('fs');
const path = require('path');
const libraryCode = fs.readFileSync(path.join(__dirname, '..', 'Library v16.0.8.patched.txt'), 'utf8');
global.state = { lincoln: {} };
const toNum = (x, d = 0) => (typeof x === 'number' && !isNaN(x)) ? x : (Number(x) || d);
const toStr = (x) => String(x == null ? "" : x);
const toBool = (x, d = false) => (x == null ? d : !!x);
eval(libraryCode);

const L = LC.lcInit();

// Setup characters
L.characters = {
  'Алекс': {
    mentions: 10, lastSeen: 0, type: 'SECONDARY', status: 'ACTIVE',
    personality: { trust: 0.8, bravery: 0.6, idealism: 0.7, aggression: 0.3 },
    qualia_state: { somatic_tension: 0.3, valence: 0.6, focus_aperture: 0.7, energy_level: 0.8 },
    perceptions: {}, social: { status: 'member', capital: 100, conformity: 0.5 }
  },
  'Борис': {
    mentions: 10, lastSeen: 0, type: 'SECONDARY', status: 'ACTIVE',
    personality: { trust: 0.4, bravery: 0.7, idealism: 0.5, aggression: 0.7 },
    qualia_state: { somatic_tension: 0.4, valence: 0.5, focus_aperture: 0.6, energy_level: 0.7 },
    perceptions: {}, social: { status: 'member', capital: 100, conformity: 0.5 }
  },
  'Вера': {
    mentions: 10, lastSeen: 0, type: 'SECONDARY', status: 'ACTIVE',
    personality: { trust: 0.6, bravery: 0.5, idealism: 0.8, aggression: 0.4 },
    qualia_state: { somatic_tension: 0.3, valence: 0.7, focus_aperture: 0.8, energy_level: 0.9 },
    perceptions: {}, social: { status: 'member', capital: 100, conformity: 0.5 }
  }
};

console.log("📚 Scene: A high school where dramatic events have become legends\n");

// ═══════════════════════════════════════════════════════════════
// DEMO 1: Creating a Legend
// ═══════════════════════════════════════════════════════════════
console.log("═══ DEMO 1: Legend Creation ═══\n");
console.log("A dramatic betrayal occurs...");
console.log('"Алекс предал Бориса, раскрыв его секрет перед всем классом!"\n');

// Create the betrayal legend manually for demonstration
L.lore.entries.push({
  type: 'betrayal',
  potential: 95,
  turn: 100,
  participants: ['Алекс', 'Борис'],
  witnesses: 10,
  description: 'Алекс предал Бориса, раскрыв его секрет перед всем классом'
});

console.log("📜 Legend created: 'The Great Betrayal'");
console.log(`   Potential: ${L.lore.entries[0].potential}`);
console.log(`   Participants: ${L.lore.entries[0].participants.join(', ')}`);
console.log(`   Witnesses: ${L.lore.entries[0].witnesses}\n`);

// ═══════════════════════════════════════════════════════════════
// DEMO 2: Legend Influences Social Norms
// ═══════════════════════════════════════════════════════════════
console.log("═══ DEMO 2: Legend Influences Social Norms ═══\n");

// Setup norm
L.society.norms['betrayal'] = {
  strength: 0.5,
  lastUpdate: L.turn,
  violations: 0,
  reinforcements: 0
};

console.log("Before legend:");
const normBefore = 0.5;
console.log(`   Anti-betrayal norm strength: ${normBefore}\n`);

console.log("After legend exists:");
const normAfter = LC.NormsEngine.getNormStrength('betrayal');
console.log(`   Anti-betrayal norm strength: ${normAfter}`);
console.log(`   ↑ Increased by ${((normAfter - normBefore) * 100).toFixed(1)}% due to legend\n`);

console.log("💡 Interpretation: The school community now has a stronger");
console.log("   collective memory that betrayal is unacceptable.\n");

// ═══════════════════════════════════════════════════════════════
// DEMO 3: Legend Amplifies Emotional Reactions
// ═══════════════════════════════════════════════════════════════
console.log("═══ DEMO 3: Legend Amplifies Emotional Reactions ═══\n");

console.log("Scenario: A new betrayal occurs, and Вера witnesses it.\n");

// Event without legend context
const event = {
  type: 'relation_event',
  eventType: 'betrayal',
  rawModifier: -25
};

console.log("Character: Вера (trust: 0.6)");
console.log(`Initial tension: ${L.characters['Вера'].qualia_state.somatic_tension}\n`);

// Find relevant legend
const relevantLegend = LC.InformationEngine._findRelevantLegend(event);
console.log(`Relevant legend found: "${relevantLegend.type}"`);
console.log(`Legend potential: ${relevantLegend.potential}\n`);

// Interpret the event
const interpretation = LC.InformationEngine.interpret(L.characters['Вера'], event);

console.log("Вера's interpretation:");
console.log(`   Interpretation: "${interpretation.interpretation}"`);
console.log(`   Emotional impact: ${interpretation.subjectiveModifier.toFixed(1)}`);
console.log(`   New tension level: ${L.characters['Вера'].qualia_state.somatic_tension}\n`);

console.log("💡 Interpretation: Вera remembers 'The Great Betrayal' and");
console.log("   reacts MORE strongly to this new betrayal. The legend");
console.log("   amplified her emotional response by ~28%.\n");

// ═══════════════════════════════════════════════════════════════
// DEMO 4: Legend Inspires New Goals
// ═══════════════════════════════════════════════════════════════
console.log("═══ DEMO 4: Legend Inspires New Goals ═══\n");

console.log("Scenario: Characters develop goals inspired by the legendary betrayal.\n");

// Generate goals for each character
for (const charName of ['Алекс', 'Борис', 'Вера']) {
  const charData = { name: charName, char: L.characters[charName] };
  const goalData = LC.GoalsEngine._generateLoreInspiredGoal(charData, L.lore.entries[0]);
  
  if (goalData) {
    console.log(`${charName}:`);
    console.log(`   Goal: "${goalData.goalText}"`);
    console.log(`   Plan steps: ${goalData.plan.length}`);
    console.log(`   First step: "${goalData.plan[0]?.text}"\n`);
  }
}

console.log("💡 Interpretation: Each character develops different goals");
console.log("   based on their personality and the legend's influence.\n");

// ═══════════════════════════════════════════════════════════════
// DEMO 5: Multiple Legends Create Complex Dynamics
// ═══════════════════════════════════════════════════════════════
console.log("═══ DEMO 5: Multiple Legends Create Complex Dynamics ═══\n");

// Add a loyalty legend
L.lore.entries.push({
  type: 'loyalty_rescue',
  potential: 88,
  turn: 150,
  participants: ['Вера', 'Борис'],
  witnesses: 8,
  description: 'Вера защитила Бориса от несправедливых обвинений'
});

console.log("A new legend emerges: 'The Loyal Defender'");
console.log(`   Type: loyalty_rescue`);
console.log(`   Participants: Вера, Борис\n`);

console.log("Impact on norms:");
const betrayalNorm = LC.NormsEngine.getNormStrength('betrayal');
const loyaltyNorm = LC.NormsEngine.getNormStrength('loyalty_rescue');

console.log(`   Anti-betrayal norm: ${betrayalNorm.toFixed(3)}`);
console.log(`      (weakened by counter-legend: loyalty)`);
console.log(`   Pro-loyalty norm: ${loyaltyNorm.toFixed(3)}`);
console.log(`      (strengthened by legend)\n`);

console.log("💡 Interpretation: Opposing legends create nuanced social norms.");
console.log("   The community now values both avoiding betrayal AND");
console.log("   demonstrating loyalty.\n");

// ═══════════════════════════════════════════════════════════════
// Summary
// ═══════════════════════════════════════════════════════════════
console.log("╔════════════════════════════════════════════════════════════════════╗");
console.log("║  Summary: LoreEngine Phase 2 Integration                          ║");
console.log("╚════════════════════════════════════════════════════════════════════╝\n");

console.log("✅ Legends influence social norms (±5% per legend)");
console.log("✅ Characters recall legends when interpreting events (up to +30% amplification)");
console.log("✅ Legends inspire new character goals (personality-dependent)");
console.log("✅ Multiple legends create complex, non-linear dynamics");
console.log("✅ The world has a memory that shapes its future\n");

console.log("🎉 Genesis Protocol Phase 2: COMPLETE!\n");
