#!/usr/bin/env node
/**
 * Test script to verify Subjective Reality Engine functionality
 * 
 * This script validates:
 * 1. Character initialization with perceptions
 * 2. InformationEngine.interpret() functionality
 * 3. Asymmetric perceptions based on qualia state
 * 4. Integration with RelationsEngine
 * 5. Backward compatibility with legacy system
 */

console.log("=== Testing Subjective Reality Engine ===\n");

const fs = require('fs');
const path = require('path');

// Load library code
const libraryCode = fs.readFileSync(path.join(__dirname, '..', 'Library v16.0.8.patched.txt'), 'utf8');

// Set up global state that the library expects
global.state = { lincoln: {} };

// Execute library code
eval(libraryCode);

let allTestsPassed = true;

// Test 1: Character Initialization with Perceptions
console.log("Test 1: Character Initialization with Perceptions");
const L = LC.lcInit();
L.turn = 1;
L.characters = {};
L.aliases = {
  'Эшли': ['эшли'],
  'Хлоя': ['хлоя']
};

LC.updateCharacterActivity("Эшли встретила Хлою", false);
LC.updateCharacterActivity("Хлоя улыбнулась", false);

if (!L.characters['Эшли']) {
  console.log("  ❌ FAILED: Эшли not created");
  allTestsPassed = false;
} else if (!L.characters['Эшли'].perceptions) {
  console.log("  ❌ FAILED: Эшли.perceptions not initialized");
  allTestsPassed = false;
} else {
  console.log("  ✅ Эшли created with perceptions object");
}

if (!L.characters['Хлоя']) {
  console.log("  ❌ FAILED: Хлоя not created");
  allTestsPassed = false;
} else if (!L.characters['Хлоя'].perceptions) {
  console.log("  ❌ FAILED: Хлоя.perceptions not initialized");
  allTestsPassed = false;
} else {
  console.log("  ✅ Хлоя created with perceptions object");
}
console.log("");

// Test 2: InformationEngine Structure
console.log("Test 2: InformationEngine Structure");
if (!LC.InformationEngine) {
  console.log("  ❌ FAILED: LC.InformationEngine not defined");
  allTestsPassed = false;
} else {
  console.log("  ✅ LC.InformationEngine exists:", !!LC.InformationEngine);
  console.log("  ✅ interpret exists:", typeof LC.InformationEngine.interpret === 'function');
  console.log("  ✅ updatePerception exists:", typeof LC.InformationEngine.updatePerception === 'function');
}
console.log("");

// Test 3: Event Interpretation Based on Qualia State
console.log("Test 3: Event Interpretation - Compliment");
const ashley = L.characters['Эшли'];
const event = { type: 'social', action: 'compliment', rawModifier: 5 };

// High valence - interpret as sincere
ashley.qualia_state.valence = 0.8;
ashley.qualia_state.somatic_tension = 0.3;
const interp1 = LC.InformationEngine.interpret(ashley, event);
console.log("  High valence (0.8):");
console.log("    Interpretation:", interp1.interpretation);
console.log("    Modifier:", interp1.subjectiveModifier);

if (interp1.interpretation === 'sincere' && interp1.subjectiveModifier > 5) {
  console.log("  ✅ High valence → interpreted as sincere with boosted modifier");
} else {
  console.log("  ❌ FAILED: High valence interpretation incorrect");
  allTestsPassed = false;
}

// High tension - interpret as sarcasm
ashley.qualia_state.valence = 0.5;
ashley.qualia_state.somatic_tension = 0.9;
const interp2 = LC.InformationEngine.interpret(ashley, event);
console.log("  High tension (0.9):");
console.log("    Interpretation:", interp2.interpretation);
console.log("    Modifier:", interp2.subjectiveModifier);
console.log("    Trust modifier:", interp2.trustModifier);

if (interp2.interpretation === 'sarcasm' && interp2.trustModifier === -5) {
  console.log("  ✅ High tension → interpreted as sarcasm with trust penalty");
} else {
  console.log("  ❌ FAILED: High tension interpretation incorrect");
  allTestsPassed = false;
}
console.log("");

// Test 4: Asymmetric Perceptions
console.log("Test 4: Asymmetric Perceptions via updatePerception");
L.characters['Эшли'].perceptions['Хлоя'] = { affection: 50, trust: 50, respect: 50, rivalry: 50 };
L.characters['Хлоя'].perceptions['Эшли'] = { affection: 50, trust: 50, respect: 50, rivalry: 50 };

// Эшли receives compliment while tense
const ashleyEvent = { 
  type: 'social', 
  action: 'compliment', 
  rawModifier: 5,
  subjectiveModifier: 1.5,
  trustModifier: -5
};
LC.InformationEngine.updatePerception('Эшли', 'Хлоя', ashleyEvent);

// Хлоя receives compliment while happy
const chloeEvent = {
  type: 'social',
  action: 'compliment',
  rawModifier: 5,
  subjectiveModifier: 6.5
};
LC.InformationEngine.updatePerception('Хлоя', 'Эшли', chloeEvent);

const ashleyToChloeTrust = L.characters['Эшли'].perceptions['Хлоя'].trust;
const chloeToAshleyTrust = L.characters['Хлоя'].perceptions['Эшли'].trust;

console.log("  Эшли's trust of Хлоя:", ashleyToChloeTrust, "(should be 45 due to sarcasm)");
console.log("  Хлоя's trust of Эшли:", chloeToAshleyTrust, "(should be 50, no change)");

if (ashleyToChloeTrust === 45 && chloeToAshleyTrust === 50) {
  console.log("  ✅ Asymmetric perceptions working correctly");
} else {
  console.log("  ❌ FAILED: Perceptions not asymmetric");
  allTestsPassed = false;
}
console.log("");

// Test 5: RelationsEngine Integration with Perceptions
console.log("Test 5: RelationsEngine Integration");
L.characters['Максим'] = {
  mentions: 10,
  lastSeen: 10,
  type: 'PRIMARY',
  status: 'ACTIVE',
  personality: { trust: 0.5, bravery: 0.5, idealism: 0.5, aggression: 0.3 },
  social: { status: 'member', capital: 100, conformity: 0.5 },
  qualia_state: { somatic_tension: 0.3, valence: 0.5, focus_aperture: 0.7, energy_level: 0.8 },
  perceptions: {}
};
L.characters['Борис'] = {
  mentions: 10,
  lastSeen: 10,
  type: 'SECONDARY',
  status: 'ACTIVE',
  personality: { trust: 0.5, bravery: 0.5, idealism: 0.5, aggression: 0.3 },
  social: { status: 'member', capital: 100, conformity: 0.5 },
  qualia_state: { somatic_tension: 0.3, valence: 0.5, focus_aperture: 0.7, energy_level: 0.8 },
  perceptions: {}
};

// Update using new system
LC.RelationsEngine.updateRelation('Максим', 'Борис', 10);

const maximToBoris = LC.RelationsEngine.getRelation('Максим', 'Борис');
const borisToMaxim = LC.RelationsEngine.getRelation('Борис', 'Максим');

console.log("  Максим → Борис:", JSON.stringify(maximToBoris));
console.log("  Борис → Максим:", JSON.stringify(borisToMaxim));

if (maximToBoris && typeof maximToBoris === 'object' && maximToBoris.affection === 60) {
  console.log("  ✅ Perceptions stored in character objects");
} else {
  console.log("  ❌ FAILED: Perceptions not properly stored");
  allTestsPassed = false;
}
console.log("");

// Test 6: Backward Compatibility - Legacy Mode
console.log("Test 6: Backward Compatibility with Legacy Relations");
L.evergreen.relations = {};
L.evergreen.relations['Алекс'] = { 'Саша': 25 };
L.evergreen.relations['Саша'] = { 'Алекс': 25 };

const legacyRel = LC.RelationsEngine.getRelation('Алекс', 'Саша');
console.log("  Legacy relation value:", legacyRel);

if (legacyRel === 25) {
  console.log("  ✅ Legacy relations still accessible");
} else {
  console.log("  ❌ FAILED: Legacy relations broken");
  allTestsPassed = false;
}

// Update legacy relation
LC.RelationsEngine.updateRelation('Алекс', 'Саша', 10, { usePerceptions: false });
const updatedLegacy = LC.RelationsEngine.getRelation('Алекс', 'Саша');
console.log("  After update (+10):", updatedLegacy);

if (updatedLegacy === 35) {
  console.log("  ✅ Legacy update mode working");
} else {
  console.log("  ❌ FAILED: Legacy update broken");
  allTestsPassed = false;
}
console.log("");

// Test 7: Qualia-Based Interpretation Variations
console.log("Test 7: Different Interpretations of Same Event");
L.characters['Оптимист'] = {
  mentions: 5,
  lastSeen: 5,
  type: 'SECONDARY',
  status: 'ACTIVE',
  personality: { trust: 0.8, bravery: 0.7, idealism: 0.8, aggression: 0.2 },
  qualia_state: { somatic_tension: 0.2, valence: 0.8, focus_aperture: 0.7, energy_level: 0.9 },
  perceptions: {}
};
L.characters['Параноик'] = {
  mentions: 5,
  lastSeen: 5,
  type: 'SECONDARY',
  status: 'ACTIVE',
  personality: { trust: 0.2, bravery: 0.3, idealism: 0.3, aggression: 0.6 },
  qualia_state: { somatic_tension: 0.9, valence: 0.2, focus_aperture: 0.3, energy_level: 0.4 },
  perceptions: {}
};

const sameEvent = { type: 'social', action: 'compliment', rawModifier: 5 };
const optimistInterp = LC.InformationEngine.interpret(L.characters['Оптимист'], sameEvent);
const paranoidInterp = LC.InformationEngine.interpret(L.characters['Параноик'], sameEvent);

console.log("  Оптимист interpretation:", optimistInterp.interpretation, "→ modifier:", optimistInterp.subjectiveModifier);
console.log("  Параноик interpretation:", paranoidInterp.interpretation, "→ modifier:", paranoidInterp.subjectiveModifier || 0, "trust:", paranoidInterp.trustModifier || 0);

if (optimistInterp.interpretation === 'sincere' && paranoidInterp.interpretation === 'sarcasm') {
  console.log("  ✅ Same event interpreted differently based on qualia state");
} else {
  console.log("  ❌ FAILED: Interpretations not varying as expected");
  allTestsPassed = false;
}
console.log("");

// Test Summary
console.log("=== Test Summary ===");
if (allTestsPassed) {
  console.log("✅ All tests passed!");
  console.log("✅ Perceptions system initialized");
  console.log("✅ InformationEngine interpreting events based on qualia");
  console.log("✅ Asymmetric perceptions working");
  console.log("✅ RelationsEngine integrated with perceptions");
  console.log("✅ Backward compatibility maintained");
  console.log("\nSubjective Reality Engine Status: FUNCTIONAL ✓");
} else {
  console.log("❌ Some tests failed");
  process.exit(1);
}
