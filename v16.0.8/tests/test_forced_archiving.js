#!/usr/bin/env node
/**
 * Forced Archiving Test
 * 
 * This script forces the creation of many legends by:
 * 1. Reducing the cooldown period temporarily
 * 2. Generating high-potential events
 * 3. Verifying that archiving happens correctly
 */

console.log("╔══════════════════════════════════════════════════════════════════════════════╗");
console.log("║           FORCED ARCHIVING TEST                                             ║");
console.log("╚══════════════════════════════════════════════════════════════════════════════╝");
console.log("");

const fs = require('fs');
const path = require('path');

// Load library code
const libraryCode = fs.readFileSync(path.join(__dirname, '..', 'v16.0.8/Library v16.0.8.patched.txt'), 'utf8');

// Set up global state
global.state = { lincoln: {} };

const toNum = (x, d = 0) => (typeof x === 'number' && !isNaN(x)) ? x : (Number(x) || d);
const toStr = (x) => String(x == null ? "" : x);
const toBool = (x, d = false) => (x == null ? d : !!x);

// Evaluate library code
eval(libraryCode);

// Initialize state
const L = LC.lcInit();

// Set up test characters
L.characters = {
  'Алекс': {
    mentions: 10,
    lastSeen: 0,
    type: 'MAIN',
    status: 'ACTIVE',
    social: { status: 'leader', capital: 150 }
  },
  'Борис': {
    mentions: 10,
    lastSeen: 0,
    type: 'MAIN',
    status: 'ACTIVE',
    social: { status: 'member', capital: 100 }
  }
};

console.log("Creating 10 legends to force archiving...\n");

// Create 10 different legend types
const legendTypes = [
  { type: 'betrayal', text: 'Алекс предал Бориса' },
  { type: 'romance', text: 'Алекс поцеловал Бориса' },
  { type: 'conflict', text: 'Алекс ударил Бориса' },
  { type: 'loyalty_rescue', text: 'Алекс защитил Бориса' },
  { type: 'public_humiliation', text: 'Алекс унизил Бориса' },
  { type: 'betrayal', text: 'Борис предал Алекс' },  // Different participants
  { type: 'romance', text: 'Борис поцеловал Алекс' },
  { type: 'conflict', text: 'Борис ударил Алекс' },
  { type: 'loyalty_rescue', text: 'Борис защитил Алекс' },
  { type: 'public_humiliation', text: 'Борис унизил Алекс' }
];

for (let i = 0; i < legendTypes.length; i++) {
  L.turn = (i + 1) * 250; // Space them out past cooldown
  L.lore.coolDown = 0; // Force no cooldown for testing
  
  const legend = legendTypes[i];
  console.log(`Creating legend ${i + 1}: ${legend.type} (turn ${L.turn})`);
  
  // Directly crystallize the event (bypass observe filters for testing)
  const event = {
    type: legend.type,
    participants: ['Алекс', 'Борис'],
    witnesses: 10,
    impact: 13,
    description: legend.text
  };
  LC.LoreEngine._crystallize(event);
  
  console.log(`  → Active: ${L.lore.entries.length}, Archived: ${L.lore.archive?.length || 0}\n`);
}

console.log("=".repeat(80));
console.log("FINAL STATE");
console.log("=".repeat(80) + "\n");

console.log(`Active entries: ${L.lore.entries.length}`);
console.log(`Archived entries: ${L.lore.archive?.length || 0}`);
console.log(`Total legends: ${L.lore.entries.length + (L.lore.archive?.length || 0)}`);

console.log("\n📜 Active Legends (newest 5):");
L.lore.entries.forEach((legend, i) => {
  console.log(`  ${i + 1}. Turn ${legend.turn}: ${legend.type}`);
});

console.log("\n📦 Archived Legends (oldest ones):");
if (L.lore.archive && L.lore.archive.length > 0) {
  L.lore.archive.forEach((legend, i) => {
    console.log(`  ${i + 1}. Turn ${legend.turn}: ${legend.type}`);
  });
} else {
  console.log("  (none)");
}

console.log("\n" + "=".repeat(80));
console.log("VALIDATION");
console.log("=".repeat(80) + "\n");

let passed = true;

// Test 1: Active entries should be exactly 5
if (L.lore.entries.length === 5) {
  console.log("✅ Active entries = 5 (LORE_ACTIVE_CAP)");
} else {
  console.log(`❌ Active entries = ${L.lore.entries.length} (expected 5)`);
  passed = false;
}

// Test 2: Archive should have 5 entries (10 total - 5 active)
if (L.lore.archive && L.lore.archive.length === 5) {
  console.log("✅ Archived entries = 5 (correct)");
} else {
  console.log(`❌ Archived entries = ${L.lore.archive?.length || 0} (expected 5)`);
  passed = false;
}

// Test 3: Total should be 10
const total = L.lore.entries.length + (L.lore.archive?.length || 0);
if (total === 10) {
  console.log("✅ Total legends = 10 (no legends lost)");
} else {
  console.log(`❌ Total legends = ${total} (expected 10)`);
  passed = false;
}

// Test 4: Active entries should be the 5 newest
if (L.lore.entries[0].turn === 1500 && L.lore.entries[4].turn === 2500) {
  console.log("✅ Active entries are the 5 newest");
} else {
  console.log(`❌ Active entries are not the newest (first: ${L.lore.entries[0]?.turn}, last: ${L.lore.entries[4]?.turn})`);
  passed = false;
}

// Test 5: Archived entries should be the 5 oldest
if (L.lore.archive && L.lore.archive[0].turn === 250 && L.lore.archive[4].turn === 1250) {
  console.log("✅ Archived entries are the 5 oldest");
} else {
  console.log(`❌ Archived entries are not the oldest (first: ${L.lore.archive?.[0]?.turn}, last: ${L.lore.archive?.[4]?.turn})`);
  passed = false;
}

console.log("\n" + "=".repeat(80));
if (passed) {
  console.log("✅ FORCED ARCHIVING TEST PASSED");
  console.log("=".repeat(80));
  process.exit(0);
} else {
  console.log("❌ FORCED ARCHIVING TEST FAILED");
  console.log("=".repeat(80));
  process.exit(1);
}
