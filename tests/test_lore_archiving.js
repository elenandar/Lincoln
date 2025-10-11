#!/usr/bin/env node
/**
 * Test suite for LoreEngine Archiving System
 * 
 * This script verifies that:
 * 1. L.lore.archive exists and is initialized correctly
 * 2. When entries exceed LORE_ACTIVE_CAP, oldest legends are archived
 * 3. Active entries array never exceeds LORE_ACTIVE_CAP
 * 4. Archived legends are preserved in L.lore.archive
 */

console.log("╔══════════════════════════════════════════════════════════════════════════════╗");
console.log("║           LOREENGINE ARCHIVING TEST                                          ║");
console.log("╚══════════════════════════════════════════════════════════════════════════════╝");
console.log("");

const fs = require('fs');
const path = require('path');

// Load library code
const libraryCode = fs.readFileSync(path.join(__dirname, '..', 'Library v16.0.8.patched.txt'), 'utf8');

// Set up global state
global.state = { lincoln: {} };

const toNum = (x, d = 0) => (typeof x === 'number' && !isNaN(x)) ? x : (Number(x) || d);
const toStr = (x) => String(x == null ? "" : x);
const toBool = (x, d = false) => (x == null ? d : !!x);

// Evaluate library code
eval(libraryCode);

// Initialize state
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

// ========== Test 1: Archive Structure Initialization ==========
console.log("--- Test 1: Archive Structure Initialization ---\n");

test("L.lore.archive exists", 
  L.lore && Array.isArray(L.lore.archive),
  `archive type: ${typeof L.lore?.archive}`);

test("L.lore.archive is initially empty", 
  L.lore.archive.length === 0,
  `archive length: ${L.lore.archive.length}`);

test("LORE_ACTIVE_CAP is defined in CONFIG", 
  LC.CONFIG?.LIMITS?.LORE_ACTIVE_CAP === 5,
  `LORE_ACTIVE_CAP: ${LC.CONFIG?.LIMITS?.LORE_ACTIVE_CAP}`);

// ========== Test 2: Archiving When Cap Is Exceeded ==========
console.log("\n--- Test 2: Archiving When Cap Is Exceeded ---\n");

// Set up test characters
L.characters = {
  'Алекс': {
    mentions: 10,
    lastSeen: 0,
    type: 'MAIN',
    status: 'ACTIVE',
    social: { status: 'member', capital: 100 }
  },
  'Борис': {
    mentions: 10,
    lastSeen: 0,
    type: 'MAIN',
    status: 'ACTIVE',
    social: { status: 'member', capital: 100 }
  }
};

// Clear existing entries
L.lore.entries = [];
L.lore.archive = [];
L.lore.stats = {};
L.lore.coolDown = 0;

// Create 6 legends (one more than cap of 5)
for (let i = 1; i <= 6; i++) {
  L.turn = i * 250; // Space them out past cooldown
  L.lore.coolDown = 0; // Reset cooldown for testing
  
  const event = {
    type: 'betrayal',
    participants: ['Алекс', 'Борис'],
    witnesses: 10,
    impact: 13,
    description: `Легенда номер ${i}`
  };
  
  LC.LoreEngine._crystallize(event);
}

test("Active entries capped at 5", 
  L.lore.entries.length === 5,
  `entries length: ${L.lore.entries.length}`);

test("One legend archived", 
  L.lore.archive.length === 1,
  `archive length: ${L.lore.archive.length}`);

test("Oldest legend was archived", 
  L.lore.archive[0] && L.lore.archive[0].turn === 250,
  `archived legend turn: ${L.lore.archive[0]?.turn}`);

test("Newest legends remain active", 
  L.lore.entries[L.lore.entries.length - 1].turn === 1500,
  `newest active legend turn: ${L.lore.entries[L.lore.entries.length - 1]?.turn}`);

// ========== Test 3: Multiple Archiving ==========
console.log("\n--- Test 3: Multiple Archiving ---\n");

// Add 3 more legends (should archive 3 more)
for (let i = 7; i <= 9; i++) {
  L.turn = i * 250;
  L.lore.coolDown = 0;
  
  const event = {
    type: 'conflict',
    participants: ['Алекс', 'Борис'],
    witnesses: 5,
    impact: 12,
    description: `Легенда номер ${i}`
  };
  
  LC.LoreEngine._crystallize(event);
}

test("Active entries still capped at 5", 
  L.lore.entries.length === 5,
  `entries length: ${L.lore.entries.length}`);

test("Archive now has 4 legends", 
  L.lore.archive.length === 4,
  `archive length: ${L.lore.archive.length}`);

test("Archive maintains chronological order", 
  L.lore.archive[0].turn < L.lore.archive[1].turn,
  `archive[0] turn: ${L.lore.archive[0]?.turn}, archive[1] turn: ${L.lore.archive[1]?.turn}`);

test("Active entries are the 5 newest", 
  L.lore.entries[0].turn === 1250 && L.lore.entries[4].turn === 2250,
  `oldest active: ${L.lore.entries[0]?.turn}, newest active: ${L.lore.entries[4]?.turn}`);

// ========== Test 4: Archive Preserves Legend Data ==========
console.log("\n--- Test 4: Archive Preserves Legend Data ---\n");

const archivedLegend = L.lore.archive[0];

test("Archived legend has type", 
  archivedLegend.type === 'betrayal',
  `type: ${archivedLegend.type}`);

test("Archived legend has participants", 
  Array.isArray(archivedLegend.participants) && archivedLegend.participants.length > 0,
  `participants: ${archivedLegend.participants?.join(', ')}`);

test("Archived legend has turn", 
  typeof archivedLegend.turn === 'number',
  `turn: ${archivedLegend.turn}`);

test("Archived legend has description", 
  archivedLegend.description && archivedLegend.description.length > 0,
  `description length: ${archivedLegend.description?.length}`);

// ========== Test 5: State Persistence ==========
console.log("\n--- Test 5: State Persistence ---\n");

// Simulate saving and reloading state
const serializedState = JSON.stringify(L.lore);
const reloadedLore = JSON.parse(serializedState);

test("Archive survives serialization", 
  Array.isArray(reloadedLore.archive) && reloadedLore.archive.length === 4,
  `reloaded archive length: ${reloadedLore.archive?.length}`);

test("Entries survive serialization", 
  Array.isArray(reloadedLore.entries) && reloadedLore.entries.length === 5,
  `reloaded entries length: ${reloadedLore.entries?.length}`);

// ========== Final Summary ==========
console.log("\n" + "=".repeat(80));
console.log("ARCHIVING TEST SUMMARY");
console.log("=".repeat(80));
console.log(`\nPassed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed === 0) {
  console.log("\n✅ ALL ARCHIVING TESTS PASSED");
  process.exit(0);
} else {
  console.log("\n❌ SOME ARCHIVING TESTS FAILED");
  process.exit(1);
}
