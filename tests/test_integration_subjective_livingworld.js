#!/usr/bin/env node
/**
 * Integration test for Subjective Reality Engine with LivingWorld
 * 
 * This test validates:
 * 1. LivingWorld SOCIAL_POSITIVE using InformationEngine
 * 2. LivingWorld SOCIAL_NEGATIVE using InformationEngine
 * 3. Asymmetric perceptions through living world actions
 * 4. Qualia state affecting interpretation in living world
 */

console.log("=== Integration Test: Subjective Reality + LivingWorld ===\n");

const fs = require('fs');
const path = require('path');

// Load library code
const libraryCode = fs.readFileSync(path.join(__dirname, '..', 'Library v16.0.8.patched.txt'), 'utf8');

// Set up global state that the library expects
global.state = { lincoln: {} };

// Execute library code
eval(libraryCode);

let allTestsPassed = true;

// Setup: Create characters with different qualia states
console.log("Setup: Creating characters with different qualia states");
const L = LC.lcInit();
L.turn = 1;
L.characters = {};
L.aliases = {
  'Оптимист': ['оптимист'],
  'Параноик': ['параноик']
};

// Create characters
LC.updateCharacterActivity("Оптимист и Параноик разговаривают", false);

// Set different qualia states
L.characters['Оптимист'].qualia_state = {
  somatic_tension: 0.2,  // Low tension
  valence: 0.8,          // High positive valence
  focus_aperture: 0.7,
  energy_level: 0.9
};

L.characters['Параноик'].qualia_state = {
  somatic_tension: 0.9,  // High tension
  valence: 0.2,          // Low valence
  focus_aperture: 0.3,
  energy_level: 0.4
};

console.log("  Оптимист qualia: tension=0.2, valence=0.8 (happy & relaxed)");
console.log("  Параноик qualia: tension=0.9, valence=0.2 (tense & negative)");
console.log("");

// Test 1: SOCIAL_POSITIVE interaction
console.log("Test 1: SOCIAL_POSITIVE - Оптимист compliments Параноик");

// Simulate positive interaction from Оптимист to Параноик
const positiveAction = {
  type: 'SOCIAL_POSITIVE',
  target: 'Параноик',
  mood: 'HAPPY'
};

LC.LivingWorld.generateFact('Оптимист', positiveAction);

// Check perceptions
const optimistToParanoid = L.characters['Оптимист'].perceptions?.['Параноик'];
const paranoidToOptimist = L.characters['Параноик'].perceptions?.['Оптимист'];

console.log("  Оптимист → Параноик:", JSON.stringify(optimistToParanoid));
console.log("  Параноик → Оптимист:", JSON.stringify(paranoidToOptimist));

if (optimistToParanoid && paranoidToOptimist) {
  // Оптимист (happy) gives compliment with modifier +8 (boosted to ~10.4)
  // Параноик (tense) receives compliment but interprets as sarcasm
  const optAffection = optimistToParanoid.affection;
  const parAffection = paranoidToOptimist.affection;
  const parTrust = paranoidToOptimist.trust;
  
  console.log("  Оптимист's affection:", optAffection, "(should be > 50)");
  console.log("  Параноик's affection:", parAffection, "(should be slightly > 50 due to sarcasm interpretation)");
  console.log("  Параноик's trust:", parTrust, "(should be < 50 due to trust penalty)");
  
  if (optAffection > 50 && parTrust < 50) {
    console.log("  ✅ Asymmetric interpretation: Оптимист sincere, Параноик suspicious");
  } else {
    console.log("  ❌ FAILED: Asymmetric interpretation not working");
    allTestsPassed = false;
  }
} else {
  console.log("  ❌ FAILED: Perceptions not created");
  allTestsPassed = false;
}
console.log("");

// Test 2: SOCIAL_NEGATIVE interaction
console.log("Test 2: SOCIAL_NEGATIVE - Параноик insults Оптимист");

// Reset perceptions for clean test
L.characters['Оптимист'].perceptions = { 'Параноик': { affection: 50, trust: 50, respect: 50, rivalry: 50 } };
L.characters['Параноик'].perceptions = { 'Оптимист': { affection: 50, trust: 50, respect: 50, rivalry: 50 } };

// Simulate negative interaction from Параноик to Оптимист
const negativeAction = {
  type: 'SOCIAL_NEGATIVE',
  target: 'Оптимист',
  mood: 'ANGRY'
};

LC.LivingWorld.generateFact('Параноик', negativeAction);

const paranoidToOptimist2 = L.characters['Параноик'].perceptions?.['Оптимист'];
const optimistToParanoid2 = L.characters['Оптимист'].perceptions?.['Параноик'];

console.log("  Параноик → Оптимист:", JSON.stringify(paranoidToOptimist2));
console.log("  Оптимист → Параноик:", JSON.stringify(optimistToParanoid2));

if (paranoidToOptimist2 && optimistToParanoid2) {
  const parAffection2 = paranoidToOptimist2.affection;
  const optAffection2 = optimistToParanoid2.affection;
  
  console.log("  Параноик's affection:", parAffection2, "(should be < 50 after insult)");
  console.log("  Оптимист's affection:", optAffection2, "(should be < 50 but maybe less severe)");
  
  // Both should decrease, but possibly by different amounts due to interpretation
  if (parAffection2 < 50 && optAffection2 < 50) {
    console.log("  ✅ Both perceptions decreased (asymmetrically)");
  } else {
    console.log("  ❌ FAILED: Negative interaction not working");
    allTestsPassed = false;
  }
} else {
  console.log("  ❌ FAILED: Perceptions not updated");
  allTestsPassed = false;
}
console.log("");

// Test 3: Verify qualia state affects LivingWorld interactions
console.log("Test 3: Same action, different qualia states");

// Create two identical characters but with different qualia
L.characters['Нейтрал1'] = {
  mentions: 5,
  lastSeen: 5,
  type: 'SECONDARY',
  status: 'ACTIVE',
  personality: { trust: 0.5, bravery: 0.5, idealism: 0.5, aggression: 0.3 },
  qualia_state: { somatic_tension: 0.3, valence: 0.8, focus_aperture: 0.7, energy_level: 0.8 }, // Happy
  perceptions: { 'Актор': { affection: 50, trust: 50, respect: 50, rivalry: 50 } }
};

L.characters['Нейтрал2'] = {
  mentions: 5,
  lastSeen: 5,
  type: 'SECONDARY',
  status: 'ACTIVE',
  personality: { trust: 0.5, bravery: 0.5, idealism: 0.5, aggression: 0.3 },
  qualia_state: { somatic_tension: 0.9, valence: 0.2, focus_aperture: 0.3, energy_level: 0.4 }, // Tense
  perceptions: { 'Актор': { affection: 50, trust: 50, respect: 50, rivalry: 50 } }
};

L.characters['Актор'] = {
  mentions: 10,
  lastSeen: 10,
  type: 'PRIMARY',
  status: 'ACTIVE',
  personality: { trust: 0.5, bravery: 0.5, idealism: 0.5, aggression: 0.3 },
  qualia_state: { somatic_tension: 0.3, valence: 0.5, focus_aperture: 0.7, energy_level: 0.8 },
  perceptions: { 'Нейтрал1': { affection: 50, trust: 50, respect: 50, rivalry: 50 }, 
                  'Нейтрал2': { affection: 50, trust: 50, respect: 50, rivalry: 50 } }
};

// Same action to both
const actionToNeutral1 = { type: 'SOCIAL_POSITIVE', target: 'Нейтрал1' };
const actionToNeutral2 = { type: 'SOCIAL_POSITIVE', target: 'Нейтрал2' };

LC.LivingWorld.generateFact('Актор', actionToNeutral1);
LC.LivingWorld.generateFact('Актор', actionToNeutral2);

const neutral1Trust = L.characters['Нейтрал1'].perceptions['Актор'].trust;
const neutral2Trust = L.characters['Нейтрал2'].perceptions['Актор'].trust;

console.log("  Нейтрал1 (happy) trust of Актор:", neutral1Trust);
console.log("  Нейтрал2 (tense) trust of Актор:", neutral2Trust);

if (neutral1Trust > neutral2Trust) {
  console.log("  ✅ Happy character trusts more than tense character for same action");
} else {
  console.log("  ❌ FAILED: Qualia state not affecting interpretation");
  allTestsPassed = false;
}
console.log("");

// Test Summary
console.log("=== Integration Test Summary ===");
if (allTestsPassed) {
  console.log("✅ All integration tests passed!");
  console.log("✅ LivingWorld using InformationEngine for interpretations");
  console.log("✅ Asymmetric perceptions created through LivingWorld actions");
  console.log("✅ Qualia state affects interpretation of interactions");
  console.log("\nLivingWorld + Subjective Reality Integration: FUNCTIONAL ✓");
} else {
  console.log("❌ Some integration tests failed");
  process.exit(1);
}
