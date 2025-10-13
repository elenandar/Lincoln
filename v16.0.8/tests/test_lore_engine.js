#!/usr/bin/env node
/**
 * Test suite for LoreEngine (Genesis Protocol, Phase 1)
 * Tests the LoreEngine functionality for crystallizing legendary events
 */

console.log("=== LoreEngine Test Suite (Epic: Genesis Protocol Phase 1) ===\n");

const fs = require('fs');
const path = require('path');
const libraryCode = fs.readFileSync(path.join(__dirname, '..', 'v16.0.8/Library v16.0.8.patched.txt'), 'utf8');
global.state = { lincoln: {} };
const toNum = (x, d = 0) => (typeof x === 'number' && !isNaN(x)) ? x : (Number(x) || d);
const toStr = (x) => String(x == null ? "" : x);
const toBool = (x, d = false) => (x == null ? d : !!x);
eval(libraryCode);

const L = LC.lcInit();
let passed = 0;
let failed = 0;

function test(name, condition, details = '') {
  if (condition) {
    console.log(`✅ ${name}`);
    if (details) console.log(`   ${details}`);
    passed++;
  } else {
    console.log(`❌ ${name}`);
    if (details) console.log(`   ${details}`);
    failed++;
  }
}

// ========== Test 1: Data Structures Initialization ==========
console.log("--- Test 1: LoreEngine Structure ---\n");

test("LC.LoreEngine exists", 
  LC.LoreEngine && typeof LC.LoreEngine === 'object');

test("LoreEngine.calculateLorePotential exists", 
  typeof LC.LoreEngine.calculateLorePotential === 'function');

test("LoreEngine.getCurrentThreshold exists", 
  typeof LC.LoreEngine.getCurrentThreshold === 'function');

test("LoreEngine.observe exists", 
  typeof LC.LoreEngine.observe === 'function');

test("LoreEngine.COOL_DOWN_PERIOD constant", 
  LC.LoreEngine.COOL_DOWN_PERIOD === 200,
  `Value: ${LC.LoreEngine.COOL_DOWN_PERIOD}`);

test("LoreEngine.BASE_THRESHOLD constant", 
  LC.LoreEngine.BASE_THRESHOLD === 75,
  `Value: ${LC.LoreEngine.BASE_THRESHOLD}`);

// ========== Test 2: State Initialization ==========
console.log("\n--- Test 2: State Initialization ---\n");

test("L.lore exists", 
  L.lore && typeof L.lore === 'object',
  `lore: ${JSON.stringify(L.lore)}`);

test("L.lore.entries is array", 
  Array.isArray(L.lore.entries),
  `entries: ${JSON.stringify(L.lore.entries)}`);

test("L.lore.stats is object", 
  L.lore.stats && typeof L.lore.stats === 'object',
  `stats: ${JSON.stringify(L.lore.stats)}`);

test("L.lore.coolDown initialized", 
  typeof L.lore.coolDown === 'number',
  `coolDown: ${L.lore.coolDown}`);

// ========== Test 3: Lore Potential Calculation ==========
console.log("\n--- Test 3: Lore Potential Calculation ---\n");

// Test with minimal event
const minimalEvent = {
  type: 'betrayal'
};
const minimalScore = LC.LoreEngine.calculateLorePotential(minimalEvent);
test("Minimal event gets novelty bonus", 
  minimalScore >= 50,
  `Score: ${minimalScore} (should have novelty bonus)`);

// Test with high-impact event
const highImpactEvent = {
  type: 'public_humiliation',
  impact: 90,
  normViolation: 20,
  witnesses: 5,
  participants: []
};
const highImpactScore = LC.LoreEngine.calculateLorePotential(highImpactEvent);
test("High-impact event gets high score", 
  highImpactScore >= 100,
  `Score: ${highImpactScore}`);

// ========== Test 4: Dynamic Threshold ==========
console.log("\n--- Test 4: Dynamic Threshold ---\n");

const initialThreshold = LC.LoreEngine.getCurrentThreshold();
test("Initial threshold equals BASE_THRESHOLD", 
  initialThreshold === 75,
  `Threshold: ${initialThreshold}`);

// Add mock lore entries
L.lore.entries = [
  { type: 'test1', turn: 1 },
  { type: 'test2', turn: 2 },
  { type: 'test3', turn: 3 }
];

const newThreshold = LC.LoreEngine.getCurrentThreshold();
test("Threshold increases with lore count", 
  newThreshold === 75 + (3 * 5),
  `Threshold: ${newThreshold} (expected: ${75 + 15})`);

// Reset for next tests
L.lore.entries = [];

// ========== Test 5: Cooldown Filter ==========
console.log("\n--- Test 5: Cooldown Filter (Filter 2) ---\n");

L.turn = 10;
L.lore.coolDown = 0; // No cooldown

// Setup characters
L.characters = {
  'Максим': {
    mentions: 10,
    lastSeen: 10,
    type: 'MAIN',
    status: 'ACTIVE',
    social: { status: 'member', capital: 100 }
  }
};

// Should create lore when no cooldown
LC.LoreEngine.observe("Максим предал всех своих друзей на глазах у всего класса");
test("Lore created when no cooldown", 
  L.lore.entries.length === 1,
  `Entries: ${L.lore.entries.length}`);

// Cooldown should now be set
test("Cooldown set after lore creation", 
  L.lore.coolDown === 10 + 200,
  `Cooldown: ${L.lore.coolDown}`);

// Reset
const firstLoreCount = L.lore.entries.length;
L.turn = 50; // Still within cooldown (210)

// Should NOT create lore during cooldown
LC.LoreEngine.observe("София предала Хлоя на глазах у всех");
test("Lore NOT created during cooldown", 
  L.lore.entries.length === firstLoreCount,
  `Entries: ${L.lore.entries.length} (should be ${firstLoreCount})`);

// ========== Test 6: Duplication Filter ==========
console.log("\n--- Test 6: Duplication Filter (Filter 4) ---\n");

L.turn = 300; // Past cooldown
L.lore.coolDown = 0;
L.lore.entries = [];
L.lore.stats = {};

// Create first legend
L.characters['Максим'].lastSeen = 300;
LC.LoreEngine.observe("Максим предал своих друзей");
const afterFirst = L.lore.entries.length;
test("First legend created", 
  afterFirst === 1,
  `Entries: ${afterFirst}`);

L.turn = 600; // Well past cooldown
L.lore.coolDown = 0;

// Try to create duplicate with same type and participant
L.characters['Максим'].lastSeen = 600;
LC.LoreEngine.observe("Максим снова предал друзей");
test("Duplicate legend NOT created", 
  L.lore.entries.length === afterFirst,
  `Entries: ${L.lore.entries.length} (should still be ${afterFirst})`);

// ========== Test 7: Event Extraction ==========
console.log("\n--- Test 7: Event Extraction from State ---\n");

L.turn = 700;
L.lore.coolDown = 0;
L.lore.entries = [];
L.lore.stats = {};

L.characters = {
  'Хлоя': {
    mentions: 10,
    lastSeen: 700,
    type: 'MAIN',
    status: 'ACTIVE',
    social: { status: 'leader', capital: 150 }
  }
};

// Extract event from text
const extractedEvent = LC.LoreEngine._extractEventFromState(
  "Хлоя публично унизила всех на глазах у класса"
);

test("Event extracted from text", 
  extractedEvent !== null,
  `Event: ${JSON.stringify(extractedEvent)}`);

test("Event type detected", 
  extractedEvent && extractedEvent.type === 'public_humiliation',
  `Type: ${extractedEvent?.type}`);

test("Participants detected", 
  extractedEvent && Array.isArray(extractedEvent.participants) && extractedEvent.participants.length > 0,
  `Participants: ${JSON.stringify(extractedEvent?.participants)}`);

// ========== Test Summary ==========
console.log("\n" + "=".repeat(70));
console.log(`Tests Passed: ${passed}`);
console.log(`Tests Failed: ${failed}`);
console.log("=".repeat(70));

if (failed === 0) {
  console.log("\n✅ All tests passed! LoreEngine is ready.");
  process.exit(0);
} else {
  console.log(`\n❌ ${failed} test(s) failed.`);
  process.exit(1);
}
