#!/usr/bin/env node
/**
 * Test suite for LoreEngine Integration (Genesis Protocol Phase 2)
 * Tests integration with SocialEngine, InformationEngine, and GoalsEngine
 */

console.log("=== LoreEngine Integration Test Suite (Epic: Genesis Protocol Phase 2) ===\n");

const fs = require('fs');
const path = require('path');
const libraryCode = fs.readFileSync(path.join(__dirname, '..', 'Library v16.0.8.patched.txt'), 'utf8');
global.state = { lincoln: {} };
const toNum = (x, d = 0) => (typeof x === 'number' && !isNaN(x)) ? x : (Number(x) || d);
const toStr = (x) => String(x == null ? "" : x);
const toBool = (x, d = false) => (x == null ? d : !!x);
eval(libraryCode);

let passed = 0;
let failed = 0;

function test(name, condition, details = '') {
  if (condition) {
    console.log(`✅ ${name}`);
    if (details) console.log(`   ${details}`);
    passed++;
  } else {
    console.log(`❌ FAILED: ${name}`);
    if (details) console.log(`   ${details}`);
    failed++;
  }
}

// ========== Test 1: SocialEngine Integration - Lore Influences Norms ==========
console.log("--- Test 1: SocialEngine Integration ---\n");

const L = LC.lcInit();

// Setup lore entries
L.lore = {
  entries: [
    { type: 'betrayal', potential: 95, turn: 10, participants: ['Алиса'], witnesses: 5 },
    { type: 'betrayal', potential: 88, turn: 50, participants: ['Боб'], witnesses: 3 }
  ],
  stats: { type_betrayal: 2 },
  coolDown: 0
};

// Setup a norm with base strength
L.society = { norms: {}, myths: [] };
L.society.norms['betrayal'] = {
  strength: 0.5,
  lastUpdate: L.turn,
  violations: 0,
  reinforcements: 0
};

// Test norm strength without lore influence
const baseStrength = 0.5;

// Get norm strength WITH lore influence
const normStrength = LC.NormsEngine.getNormStrength('betrayal');

test("NormsEngine.getNormStrength exists", 
  typeof LC.NormsEngine.getNormStrength === 'function');

test("Lore entries boost norm strength", 
  normStrength > baseStrength,
  `Base: ${baseStrength}, With lore: ${normStrength} (should be higher due to 2 betrayal legends)`);

test("Norm strength stays within bounds [0, 1]", 
  normStrength >= 0 && normStrength <= 1,
  `strength: ${normStrength}`);

// Test counter-norm logic
L.lore.entries.push({ 
  type: 'loyalty_rescue', 
  potential: 90, 
  turn: 100, 
  participants: ['Карл'], 
  witnesses: 8 
});

const loyaltyStrength = LC.NormsEngine.getNormStrength('loyalty_rescue');
const betrayalWithCounterNorm = LC.NormsEngine.getNormStrength('betrayal');

test("Counter-norms weaken opposing norms",
  betrayalWithCounterNorm < normStrength,
  `Betrayal norm before loyalty legend: ${normStrength}, after: ${betrayalWithCounterNorm}`);

// ========== Test 2: InformationEngine Integration - Legend Recall ==========
console.log("\n--- Test 2: InformationEngine Integration ---\n");

// Setup character with qualia state
L.characters = {
  'Эшли': {
    mentions: 10,
    lastSeen: L.turn,
    type: 'SECONDARY',
    status: 'ACTIVE',
    personality: { trust: 0.75, bravery: 0.6, idealism: 0.5, aggression: 0.3 },
    qualia_state: { somatic_tension: 0.3, valence: 0.5, focus_aperture: 0.7, energy_level: 0.8 },
    perceptions: {}
  }
};

// Test interpretation WITHOUT relevant legend
const eventWithoutLegend = {
  type: 'social',
  action: 'insult',
  rawModifier: -10
};

const interpWithoutLegend = LC.InformationEngine.interpret(L.characters['Эшли'], eventWithoutLegend);

test("InformationEngine._findRelevantLegend exists",
  typeof LC.InformationEngine._findRelevantLegend === 'function');

test("No legend found for unrelated event",
  LC.InformationEngine._findRelevantLegend({ type: 'social', action: 'insult' }) === null);

// Now test WITH relevant legend
const betrayalEvent = {
  type: 'relation_event',
  eventType: 'betrayal',
  rawModifier: -25
};

const relevantLegend = LC.InformationEngine._findRelevantLegend(betrayalEvent);

test("Relevant legend found for betrayal event",
  relevantLegend !== null && relevantLegend.type === 'betrayal',
  `Found legend: ${relevantLegend?.type}`);

// Reset qualia state for clean test
L.characters['Эшли'].qualia_state = { 
  somatic_tension: 0.3, 
  valence: 0.5, 
  focus_aperture: 0.7, 
  energy_level: 0.8 
};

const interpWithLegend = LC.InformationEngine.interpret(L.characters['Эшли'], betrayalEvent);

test("Interpretation occurs with legend influence",
  interpWithLegend.subjectiveModifier !== 0,
  `Modifier: ${interpWithLegend.subjectiveModifier}`);

// The legend should amplify emotional reaction
// Since Эшли has high trust (0.7), betrayal should be "devastating" with amplification
test("Legend amplifies emotional reaction",
  interpWithLegend.interpretation === 'devastating',
  `Interpretation: ${interpWithLegend.interpretation}`);

test("Legend increases somatic tension",
  L.characters['Эшли'].qualia_state.somatic_tension > 0.3,
  `Tension after: ${L.characters['Эшли'].qualia_state.somatic_tension} (was 0.3)`);

// ========== Test 3: GoalsEngine Integration - Lore-Inspired Goals ==========
console.log("\n--- Test 3: GoalsEngine Integration ---\n");

test("GoalsEngine._generateLoreInspiredGoal exists",
  typeof LC.GoalsEngine._generateLoreInspiredGoal === 'function');

test("GoalsEngine._tryGenerateLoreInspiredGoals exists",
  typeof LC.GoalsEngine._tryGenerateLoreInspiredGoals === 'function');

// Test goal generation for different legend types
const achievementLegend = { type: 'achievement', potential: 92, turn: 5 };
const betrayalLegendForGoal = { type: 'betrayal', potential: 95, turn: 10 };
const loyaltyLegend = { type: 'loyalty_rescue', potential: 88, turn: 15 };

// Test with ambitious character
const ambitiousChar = {
  name: 'Амбициозный',
  char: {
    personality: { trust: 0.5, bravery: 0.6, idealism: 0.7, aggression: 0.8 },
    status: 'ACTIVE'
  }
};

const achievementGoal = LC.GoalsEngine._generateLoreInspiredGoal(ambitiousChar, achievementLegend);

test("Achievement legend inspires leadership goal",
  achievementGoal !== null && achievementGoal.goalText,
  `Goal: ${achievementGoal?.goalText}`);

test("Leadership goal has appropriate plan",
  achievementGoal && Array.isArray(achievementGoal.plan) && achievementGoal.plan.length > 0,
  `Plan steps: ${achievementGoal?.plan?.length}`);

// Test with trusting character
const trustingChar = {
  name: 'Доверчивый',
  char: {
    personality: { trust: 0.8, bravery: 0.4, idealism: 0.6, aggression: 0.2 },
    status: 'ACTIVE'
  }
};

const betrayalGoal = LC.GoalsEngine._generateLoreInspiredGoal(trustingChar, betrayalLegendForGoal);

test("Betrayal legend inspires cautious goal",
  betrayalGoal !== null && betrayalGoal.goalText,
  `Goal: ${betrayalGoal?.goalText}`);

test("Cautious goal mentions friendship or trust",
  betrayalGoal && (betrayalGoal.goalText.includes('друз') || betrayalGoal.goalText.includes('осторожн')),
  `Goal text: ${betrayalGoal?.goalText}`);

// Test with brave character
const braveChar = {
  name: 'Храбрец',
  char: {
    personality: { trust: 0.5, bravery: 0.9, idealism: 0.7, aggression: 0.5 },
    status: 'ACTIVE'
  }
};

const loyaltyGoal = LC.GoalsEngine._generateLoreInspiredGoal(braveChar, loyaltyLegend);

test("Loyalty legend inspires protective goal",
  loyaltyGoal !== null && loyaltyGoal.goalText,
  `Goal: ${loyaltyGoal?.goalText}`);

// ========== Test 4: Full Integration Test ==========
console.log("\n--- Test 4: Full Integration Test ---\n");

// Create a fresh state with all systems
const L2 = LC.lcInit();
L2.turn = 100;
L2.lore = {
  entries: [
    { 
      type: 'public_humiliation', 
      potential: 98, 
      turn: 50, 
      participants: ['Виктор', 'Анна'], 
      witnesses: 10,
      description: 'Виктор публично унизил Анну'
    }
  ],
  stats: { type_public_humiliation: 1 },
  coolDown: 0
};

L2.society = { norms: {}, myths: [] };
L2.goals = {};
L2.characters = {
  'Дмитрий': {
    mentions: 10,
    lastSeen: L2.turn,
    type: 'SECONDARY',
    status: 'ACTIVE',
    personality: { trust: 0.6, bravery: 0.5, idealism: 0.8, aggression: 0.7 },
    qualia_state: { somatic_tension: 0.3, valence: 0.6, focus_aperture: 0.7, energy_level: 0.8 },
    perceptions: {},
    social: { status: 'member', capital: 100, conformity: 0.5 }
  }
};

L2.aliases = { 'Дмитрий': ['дмитрий', 'дима'] };
L2.evergreen = { enabled: true, relations: {}, status: {}, obligations: {}, facts: {}, history: [] };

// Build patterns for GoalsEngine
if (LC.EvergreenEngine?._buildPatterns) {
  LC.EvergreenEngine.patterns = LC.EvergreenEngine._buildPatterns();
}

// Test that all three integrations work together
test("State properly initialized for integration",
  L2.lore && L2.society && L2.characters && L2.goals);

// Test norm strength influenced by humiliation legend
L2.society.norms['public_humiliation'] = { strength: 0.5, lastUpdate: L2.turn };
const humiliationNormStrength = LC.NormsEngine.getNormStrength('public_humiliation');

test("Humiliation legend strengthens anti-humiliation norm",
  humiliationNormStrength > 0.5,
  `Norm strength: ${humiliationNormStrength}`);

// Test that insult event recalls humiliation legend
const insultEvent = {
  type: 'social',
  action: 'insult',
  rawModifier: -12
};

L2.characters['Дмитрий'].qualia_state.somatic_tension = 0.3; // Reset
const insultInterp = LC.InformationEngine.interpret(L2.characters['Дмитрий'], insultEvent);

test("Insult event recalls public_humiliation legend",
  LC.InformationEngine._findRelevantLegend(insultEvent)?.type === 'public_humiliation',
  `Found legend type: ${LC.InformationEngine._findRelevantLegend(insultEvent)?.type}`);

test("Recalled legend amplifies insult reaction",
  L2.characters['Дмитрий'].qualia_state.somatic_tension > 0.3,
  `Tension increased to: ${L2.characters['Дмитрий'].qualia_state.somatic_tension}`);

// Test lore-inspired goal generation
// Note: This is probabilistic (5% chance), so we'll test the mechanism directly
const goalBeforeCount = Object.keys(L2.goals).length;
const testCharData = { 
  name: 'Дмитрий', 
  char: L2.characters['Дмитрий'] 
};
const goalData = LC.GoalsEngine._generateLoreInspiredGoal(
  testCharData, 
  L2.lore.entries[0]
);

test("Humiliation legend can inspire goal",
  goalData !== null && goalData.goalText,
  `Goal: ${goalData?.goalText}`);

test("Inspired goal is about avoiding disgrace or achieving status",
  goalData && (
    goalData.goalText.includes('позор') || 
    goalData.goalText.includes('лидер') ||
    goalData.goalText.includes('статус')
  ),
  `Goal text: ${goalData?.goalText}`);

// ========== Test 5: Edge Cases ==========
console.log("\n--- Test 5: Edge Cases ---\n");

// Test with no lore entries
const L3 = LC.lcInit();
L3.lore = { entries: [], stats: {}, coolDown: 0 };
L3.society = { norms: { test: { strength: 0.6 } }, myths: [] };

const strengthNoLore = LC.NormsEngine.getNormStrength('test');

test("System handles no lore entries gracefully",
  strengthNoLore === 0.6,
  `Strength: ${strengthNoLore}`);

// Test with null character
const nullCharInterp = LC.InformationEngine.interpret(null, { type: 'test' });

test("InformationEngine handles null character",
  nullCharInterp !== null);

// Test with null legend
const nullLegendGoal = LC.GoalsEngine._generateLoreInspiredGoal(testCharData, null);

test("GoalsEngine handles null legend",
  nullLegendGoal === null);

// Test counter-norm helper
test("NormsEngine._isCounterNorm exists",
  typeof LC.NormsEngine._isCounterNorm === 'function');

test("_isCounterNorm correctly identifies opposites",
  LC.NormsEngine._isCounterNorm('betrayal', 'loyalty_rescue') === true,
  "betrayal should counter loyalty_rescue");

test("_isCounterNorm returns false for unrelated types",
  LC.NormsEngine._isCounterNorm('romance', 'achievement') === false,
  "romance should not counter achievement");

// Summary
console.log("\n======================================================================");
console.log(`Tests Passed: ${passed}`);
console.log(`Tests Failed: ${failed}`);
console.log("======================================================================\n");

if (failed === 0) {
  console.log("✅ All integration tests passed! LoreEngine Phase 2 integration complete.");
} else {
  console.log(`❌ ${failed} test(s) failed.`);
  process.exit(1);
}
