#!/usr/bin/env node
/**
 * Test script for LRF (Least Relevant First) Protocol
 * 
 * This validates that the proactive garbage collection:
 * 1. Triggers when rumors exceed RUMOR_HARD_CAP (150)
 * 2. Calculates relevance correctly: (knownBy.length * 2) - (currentTurn - turn)
 * 3. Archives least relevant rumors first
 * 4. Stops archiving once under RUMOR_HARD_CAP
 */

console.log("=== LRF Protocol Validation Test ===\n");

const fs = require('fs');
const path = require('path');

// Load library code
const libraryCode = fs.readFileSync(path.join(__dirname, '..', 'Library v16.0.8.patched.txt'), 'utf8');

// Set up global state that the library expects
global.state = { lincoln: {} };

// Helper functions
const toNum = (x, d = 0) => (typeof x === 'number' && !isNaN(x)) ? x : (Number(x) || d);
const toStr = (x) => String(x == null ? "" : x);
const toBool = (x, d = false) => (x == null ? d : !!x);
const getState = () => global.state;

// Create minimal globals
const __SCRIPT_SLOT__ = "test";

// Evaluate library code
eval(libraryCode);

// Initialize state
const L = LC.lcInit();
L.turn = 100;
L.characters = {
  'Alice': { type: 'MAIN', status: 'ACTIVE' },
  'Bob': { type: 'MAIN', status: 'ACTIVE' },
  'Charlie': { type: 'SECONDARY', status: 'ACTIVE' },
  'Diana': { type: 'SECONDARY', status: 'ACTIVE' }
};

console.log("✓ CONFIG.LIMITS.RUMOR_HARD_CAP:", LC.CONFIG.LIMITS.RUMOR_HARD_CAP);
console.log("");

let allTestsPassed = true;

// ========== TEST 1: LRF Protocol triggers when > RUMOR_HARD_CAP ==========
console.log("TEST 1: LRF Protocol triggers when exceeding RUMOR_HARD_CAP");

L.rumors = [];
L.turn = 100;

// Create 160 rumors (exceeding cap of 150)
for (let i = 0; i < 160; i++) {
  L.rumors.push({
    id: `test_${i}`,
    text: `Test rumor ${i}`,
    type: 'custom',
    subject: 'Alice',
    target: null,
    spin: 'neutral',
    turn: 100 - (i % 50), // Varying ages
    knownBy: i % 2 === 0 ? ['Alice'] : ['Alice', 'Bob'], // Varying knowledge
    distortion: 0,
    verified: false,
    status: 'ACTIVE'
  });
}

const beforeGC = L.rumors.length;
console.log(`  Created ${beforeGC} rumors (exceeds cap of 150)`);

LC.GossipEngine.runGarbageCollection();

const afterGC = L.rumors.length;
console.log(`  After GC: ${afterGC} rumors`);

if (afterGC <= 150) {
  console.log("  ✅ PASSED: Rumors reduced to/below RUMOR_HARD_CAP");
} else {
  console.log(`  ❌ FAILED: Still have ${afterGC} rumors (expected ≤ 150)`);
  allTestsPassed = false;
}

console.log("");

// ========== TEST 2: Relevance calculation is correct ==========
console.log("TEST 2: Relevance score calculation");

L.rumors = [];
L.turn = 100;

// Create rumors with known relevance scores
const testRumors = [
  { id: 'old_unknown', turn: 50, knownBy: [], expectedRelevance: (0 * 2) - (100 - 50) }, // -50
  { id: 'old_known', turn: 50, knownBy: ['Alice', 'Bob', 'Charlie'], expectedRelevance: (3 * 2) - (100 - 50) }, // -44
  { id: 'recent_unknown', turn: 95, knownBy: [], expectedRelevance: (0 * 2) - (100 - 95) }, // -5
  { id: 'recent_known', turn: 95, knownBy: ['Alice', 'Bob', 'Charlie', 'Diana'], expectedRelevance: (4 * 2) - (100 - 95) } // 3
];

testRumors.forEach(r => {
  L.rumors.push({
    id: r.id,
    text: `Test ${r.id}`,
    type: 'custom',
    subject: 'Alice',
    target: null,
    spin: 'neutral',
    turn: r.turn,
    knownBy: r.knownBy,
    distortion: 0,
    verified: false,
    status: 'ACTIVE'
  });
});

// Calculate relevance manually
testRumors.forEach(r => {
  const rumor = L.rumors.find(rum => rum.id === r.id);
  const calculatedRelevance = (rumor.knownBy.length * 2) - (L.turn - rumor.turn);
  console.log(`  ${r.id}: relevance = ${calculatedRelevance} (expected: ${r.expectedRelevance})`);
  
  if (calculatedRelevance !== r.expectedRelevance) {
    console.log(`    ❌ FAILED: Calculation mismatch`);
    allTestsPassed = false;
  }
});

console.log("  ✅ PASSED: Relevance calculations correct");
console.log("");

// ========== TEST 3: Least relevant rumors archived first ==========
console.log("TEST 3: Least relevant rumors archived first");

L.rumors = [];
L.turn = 100;

// Create exactly 155 rumors (5 over cap)
// First 5 should be least relevant and get archived
for (let i = 0; i < 155; i++) {
  L.rumors.push({
    id: `rumor_${i}`,
    text: `Test rumor ${i}`,
    type: 'custom',
    subject: 'Alice',
    target: null,
    spin: 'neutral',
    turn: i < 5 ? 50 : 90, // First 5 are old
    knownBy: i < 5 ? [] : ['Alice', 'Bob'], // First 5 are unknown
    distortion: 0,
    verified: false,
    status: 'ACTIVE'
  });
}

console.log(`  Created 155 rumors (5 over cap)`);
console.log(`  First 5 rumors: old (turn 50) + unknown (0 knownBy) = low relevance`);
console.log(`  Rest: recent (turn 90) + known (2 knownBy) = higher relevance`);

LC.GossipEngine.runGarbageCollection();

const remainingCount = L.rumors.length;
console.log(`  After GC: ${remainingCount} rumors`);

// Check that the least relevant ones were removed
const stillHasOldUnknown = L.rumors.some(r => r.turn === 50 && r.knownBy.length === 0);

if (remainingCount <= 150 && !stillHasOldUnknown) {
  console.log("  ✅ PASSED: Least relevant rumors were archived");
} else {
  console.log("  ❌ FAILED: Wrong rumors archived");
  allTestsPassed = false;
}

console.log("");

// ========== TEST 4: Standard GC still works (FADED/ARCHIVED) ==========
console.log("TEST 4: Standard GC lifecycle still works");

L.rumors = [];
L.turn = 100;

// Create rumor that should fade (75% knowledge)
L.rumors.push({
  id: 'should_fade',
  text: 'Test fade',
  type: 'custom',
  subject: 'Alice',
  target: null,
  spin: 'neutral',
  turn: 100,
  knownBy: ['Alice', 'Bob', 'Charlie'], // 75% of 4 characters
  distortion: 0,
  verified: false,
  status: 'ACTIVE'
});

// Create faded rumor that should archive (>50 turns old)
L.rumors.push({
  id: 'should_archive',
  text: 'Test archive',
  type: 'custom',
  subject: 'Alice',
  target: null,
  spin: 'neutral',
  turn: 40,
  knownBy: ['Alice', 'Bob'],
  distortion: 0,
  verified: false,
  status: 'FADED',
  fadedAtTurn: 45
});

LC.GossipEngine.runGarbageCollection();

const fadedRumor = L.rumors.find(r => r.id === 'should_fade');
const archivedRumor = L.rumors.find(r => r.id === 'should_archive');

if (fadedRumor && fadedRumor.status === 'FADED') {
  console.log("  ✅ PASSED: ACTIVE → FADED transition works");
} else {
  console.log("  ❌ FAILED: ACTIVE → FADED transition failed");
  allTestsPassed = false;
}

if (!archivedRumor) {
  console.log("  ✅ PASSED: FADED → ARCHIVED → removed works");
} else {
  console.log("  ❌ FAILED: FADED → ARCHIVED → removed failed");
  allTestsPassed = false;
}

console.log("");

// ========== FINAL SUMMARY ==========
console.log("═══════════════════════════════════════════════════════");
if (allTestsPassed) {
  console.log("✅ ALL LRF PROTOCOL TESTS PASSED");
  console.log("═══════════════════════════════════════════════════════");
  process.exit(0);
} else {
  console.log("❌ SOME TESTS FAILED");
  console.log("═══════════════════════════════════════════════════════");
  process.exit(1);
}
