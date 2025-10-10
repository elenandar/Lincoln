#!/usr/bin/env node
/**
 * Test suite for Collective Memory Engine (Myths & Legends)
 * Tests the MemoryEngine functionality for archiving and mythologizing formative events
 */

console.log("=== Collective Memory Engine Test Suite ===\n");

const fs = require('fs');
const path = require('path');
const libraryCode = fs.readFileSync(path.join(__dirname, '..', 'Library v16.0.8.patched.txt'), 'utf8');
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
console.log("--- Test 1: Data Structures ---\n");

test("L.society.myths exists", 
  L.society && Array.isArray(L.society.myths),
  `myths: ${JSON.stringify(L.society.myths)}`);

test("MemoryEngine exists", 
  LC.MemoryEngine && typeof LC.MemoryEngine === 'object');

test("MemoryEngine.runMythologization exists", 
  typeof LC.MemoryEngine.runMythologization === 'function');

test("MemoryEngine.getDominantMyth exists", 
  typeof LC.MemoryEngine.getDominantMyth === 'function');

test("MemoryEngine.getMythStrengthForTheme exists", 
  typeof LC.MemoryEngine.getMythStrengthForTheme === 'function');

// ========== Test 2: Event Archiving ==========
console.log("\n--- Test 2: Event Archiving ---\n");

// Setup: Create characters with proper structure
L.turn = 10;
L.characters = {
  'Максим': {
    mentions: 10,
    lastSeen: 10,
    type: 'MAIN',
    status: 'ACTIVE',
    personality: {
      trust: 0.5,
      bravery: 0.5,
      idealism: 0.5,
      aggression: 0.3
    },
    social: {
      status: 'member',
      capital: 100,
      conformity: 0.5
    }
  },
  'Хлоя': {
    mentions: 8,
    lastSeen: 10,
    type: 'SECONDARY',
    status: 'ACTIVE',
    personality: {
      trust: 0.5,
      bravery: 0.5,
      idealism: 0.5,
      aggression: 0.3
    },
    social: {
      status: 'member',
      capital: 100,
      conformity: 0.5
    }
  }
};

// Clear myths before test
L.society.myths = [];

// Trigger a major relationship event (should be archived)
LC.Crucible.analyzeEvent({
  type: 'RELATION_CHANGE',
  character: 'Максим',
  otherCharacter: 'Хлоя',
  change: 85,  // Very large positive change
  finalValue: 85
});

test("Major positive event archived", 
  L.society.myths.length > 0,
  `myths count: ${L.society.myths.length}`);

if (L.society.myths.length > 0) {
  const firstMyth = L.society.myths[0];
  test("Archived event has correct type", 
    firstMyth.type === 'event_record',
    `type: ${firstMyth.type}`);
  
  test("Archived event has character", 
    firstMyth.character === 'Максим',
    `character: ${firstMyth.character}`);
  
  test("Archived event has details", 
    firstMyth.details && typeof firstMyth.details === 'object',
    `details: ${JSON.stringify(firstMyth.details)}`);
  
  test("Archived event has loyalty_rescue theme", 
    firstMyth.details.theme === 'loyalty_rescue',
    `theme: ${firstMyth.details.theme}`);
}

// ========== Test 3: Status Change Archiving ==========
console.log("\n--- Test 3: Status Change Archiving ---\n");

// Clear myths
L.society.myths = [];

// Make character a leader (first leader should be archived)
L.characters['Максим'].social.capital = 150;
LC.HierarchyEngine.recalculateStatus();

test("First leader status change archived", 
  L.society.myths.length > 0,
  `myths count: ${L.society.myths.length}`);

if (L.society.myths.length > 0) {
  const statusMyth = L.society.myths.find(m => m.eventType === 'STATUS_CHANGE');
  test("Status change event recorded", 
    statusMyth !== undefined,
    `found: ${!!statusMyth}`);
  
  if (statusMyth) {
    test("Status change has leadership theme", 
      statusMyth.details.theme === 'leadership',
      `theme: ${statusMyth.details.theme}`);
  }
}

// ========== Test 4: Mythologization Process ==========
console.log("\n--- Test 4: Mythologization Process ---\n");

// Setup: Create old event records
L.turn = 100;
L.society.myths = [
  {
    type: 'event_record',
    turn: 10,  // 90 turns ago - should be mythologized
    eventType: 'RELATION_CHANGE',
    character: 'Максим',
    details: {
      eventType: 'RELATION_CHANGE',
      otherCharacter: 'Хлоя',
      change: 85,
      theme: 'loyalty_rescue'
    },
    archived: 10
  }
];

// Run mythologization
LC.MemoryEngine.runMythologization();

test("Old event transformed into myth", 
  L.society.myths.some(m => m.type === 'myth'),
  `myths: ${JSON.stringify(L.society.myths, null, 2)}`);

const myth = L.society.myths.find(m => m.type === 'myth');
if (myth) {
  test("Myth has theme", 
    myth.theme === 'loyalty_rescue',
    `theme: ${myth.theme}`);
  
  test("Myth has hero", 
    myth.hero === 'Максим',
    `hero: ${myth.hero}`);
  
  test("Myth has moral", 
    myth.moral && myth.moral.length > 0,
    `moral: ${myth.moral}`);
  
  test("Myth has strength", 
    typeof myth.strength === 'number' && myth.strength > 0 && myth.strength <= 1,
    `strength: ${myth.strength}`);
  
  test("Loyalty myth has high strength", 
    myth.strength >= 0.8,
    `strength: ${myth.strength}`);
}

// ========== Test 5: Recent Events Not Mythologized ==========
console.log("\n--- Test 5: Recent Events Not Mythologized ---\n");

// Add a recent event
L.society.myths = [
  {
    type: 'event_record',
    turn: 95,  // Only 5 turns ago - too recent
    eventType: 'RELATION_CHANGE',
    character: 'Хлоя',
    details: {
      theme: 'betrayal'
    },
    archived: 95
  }
];

const mythsBeforeMythologization = L.society.myths.length;
LC.MemoryEngine.runMythologization();

test("Recent events not mythologized", 
  L.society.myths.every(m => m.type === 'event_record'),
  `still event records: ${L.society.myths.every(m => m.type === 'event_record')}`);

// ========== Test 6: Dominant Myth Detection ==========
console.log("\n--- Test 6: Dominant Myth Detection ---\n");

// Setup: Multiple myths with different strengths
L.society.myths = [
  {
    type: 'myth',
    theme: 'loyalty_rescue',
    hero: 'Максим',
    moral: 'защищать друзей — правильно',
    strength: 0.9,
    createdTurn: 100,
    originalTurn: 10
  },
  {
    type: 'myth',
    theme: 'achievement',
    hero: 'Хлоя',
    moral: 'упорство ведёт к успеху',
    strength: 0.7,
    createdTurn: 100,
    originalTurn: 20
  }
];

const dominant = LC.MemoryEngine.getDominantMyth();

test("Dominant myth detected", 
  dominant !== null,
  `dominant: ${dominant ? dominant.theme : 'null'}`);

test("Strongest myth is dominant", 
  dominant && dominant.strength === 0.9,
  `strength: ${dominant ? dominant.strength : 'null'}`);

test("Dominant myth has loyalty theme", 
  dominant && dominant.theme === 'loyalty_rescue',
  `theme: ${dominant ? dominant.theme : 'null'}`);

// ========== Test 7: Myth Strength by Theme ==========
console.log("\n--- Test 7: Myth Strength by Theme ---\n");

const loyaltyStrength = LC.MemoryEngine.getMythStrengthForTheme('loyalty_rescue');
const achievementStrength = LC.MemoryEngine.getMythStrengthForTheme('achievement');
const nonExistentStrength = LC.MemoryEngine.getMythStrengthForTheme('nonexistent');

test("Loyalty theme has strength", 
  loyaltyStrength > 0,
  `strength: ${loyaltyStrength}`);

test("Achievement theme has strength", 
  achievementStrength > 0,
  `strength: ${achievementStrength}`);

test("Non-existent theme has zero strength", 
  nonExistentStrength === 0,
  `strength: ${nonExistentStrength}`);

test("Loyalty theme stronger than achievement", 
  loyaltyStrength > achievementStrength,
  `loyalty: ${loyaltyStrength}, achievement: ${achievementStrength}`);

// ========== Test 8: Myth Influence on New Characters ==========
console.log("\n--- Test 8: Myth Influence on New Characters ---\n");

// Setup: Strong loyalty myth
L.society.myths = [
  {
    type: 'myth',
    theme: 'loyalty_rescue',
    hero: 'Максим',
    moral: 'защищать друзей — правильно',
    strength: 0.9,
    createdTurn: 100,
    originalTurn: 10
  }
];

// Create new character
L.aliases = { 'Новичок': ['новичок'] };
LC.updateCharacterActivity("Новичок появился в школе", false);

const newChar = L.characters['Новичок'];

test("New character has personality", 
  newChar && newChar.personality,
  `personality: ${JSON.stringify(newChar.personality)}`);

test("New character trust influenced by loyalty myth", 
  newChar.personality.trust > 0.5,
  `trust: ${newChar.personality.trust}`);

// ========== Test 9: Myth Influence on Norms ==========
console.log("\n--- Test 9: Myth Influence on Norms ---\n");

// Setup: Norm without myth
L.society.norms = {
  'loyalty_rescue': {
    strength: 0.6,
    lastUpdate: 50,
    violations: 0,
    reinforcements: 5
  }
};

L.society.myths = [
  {
    type: 'myth',
    theme: 'loyalty_rescue',
    strength: 0.9
  }
];

const normStrength = LC.NormsEngine.getNormStrength('loyalty_rescue');

test("Norm strength boosted by myth", 
  normStrength > 0.6,
  `base: 0.6, boosted: ${normStrength}`);

test("Norm strength increased by up to 20%", 
  normStrength <= 0.78,  // 0.6 + 0.9*0.2 = 0.78
  `strength: ${normStrength}`);

// ========== Test 10: Context Overlay Zeitgeist ==========
console.log("\n--- Test 10: Context Overlay Zeitgeist ---\n");

// Setup: Strong loyalty myth
L.society.myths = [
  {
    type: 'myth',
    theme: 'loyalty_rescue',
    hero: 'Максим',
    moral: 'защищать друзей — правильно',
    strength: 0.9,
    createdTurn: 100,
    originalTurn: 10
  }
];

const context = LC.composeContextOverlay();

test("Context overlay generated", 
  context && context.text,
  `text length: ${context.text ? context.text.length : 0}`);

test("Context contains ZEITGEIST tag", 
  context.text.includes('⟦ZEITGEIST⟧'),
  `found: ${context.text.includes('⟦ZEITGEIST⟧')}`);

test("Zeitgeist reflects loyalty theme", 
  context.text.includes('героев уважают') || context.text.includes('предателей презирают'),
  `content: ${context.text.substring(context.text.indexOf('⟦ZEITGEIST⟧'), context.text.indexOf('⟦ZEITGEIST⟧') + 100)}`);

// ========== Test 11: Myth Pruning ==========
console.log("\n--- Test 11: Myth Pruning ---\n");

// Create many myths (more than MAX_MYTHS = 20)
L.society.myths = [];
for (let i = 0; i < 25; i++) {
  L.society.myths.push({
    type: 'myth',
    theme: 'test',
    hero: `Hero${i}`,
    moral: `moral ${i}`,
    strength: Math.random(),
    createdTurn: 100 - i,
    originalTurn: 10 - i
  });
}

const mythCountBefore = L.society.myths.filter(m => m.type === 'myth').length;

// Trigger pruning
LC.MemoryEngine._pruneMythsIfNeeded();

const mythCountAfter = L.society.myths.filter(m => m.type === 'myth').length;

test("Myths pruned to reasonable count", 
  mythCountAfter <= 20,
  `before: ${mythCountBefore}, after: ${mythCountAfter}`);

test("Strongest myths kept", 
  mythCountAfter > 0,
  `count: ${mythCountAfter}`);

// ========== Summary ==========
console.log("\n============================================================");
console.log(`Tests passed: ${passed}`);
console.log(`Tests failed: ${failed}`);

if (failed === 0) {
  console.log("✅ ALL TESTS PASSED");
  process.exit(0);
} else {
  console.log("❌ SOME TESTS FAILED");
  process.exit(1);
}
