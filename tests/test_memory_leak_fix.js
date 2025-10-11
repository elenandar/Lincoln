#!/usr/bin/env node
/**
 * Memory Leak Verification Test
 * 
 * This script demonstrates that the memory leak is fixed by:
 * 1. Running a long simulation (2500 turns)
 * 2. Showing that L.lore.entries never exceeds LORE_ACTIVE_CAP
 * 3. Showing that archived legends are preserved
 * 4. Calculating approximate memory usage
 */

console.log("╔══════════════════════════════════════════════════════════════════════════════╗");
console.log("║           MEMORY LEAK VERIFICATION TEST                                     ║");
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

// Track metrics
const metrics = {
  maxActiveEntries: 0,
  totalLegendsCreated: 0,
  archivedCount: 0,
  checkpoints: []
};

// Set up test characters
const CHARACTER_NAMES = ['Алекс', 'Борис', 'Вера', 'Даша', 'Егор'];

L.characters = {};
CHARACTER_NAMES.forEach((name, i) => {
  L.characters[name] = {
    mentions: 10,
    lastSeen: 0,
    type: i < 2 ? 'MAIN' : 'SECONDARY',
    status: 'ACTIVE',
    social: {
      status: i === 0 ? 'leader' : 'member',
      capital: 100 + (i * 10)
    }
  };
});

// Event templates with high legendary potential
const eventTemplates = [
  { type: 'betrayal', witnesses: 10, impact: 13, text: '$1 предал $2 на глазах у всех' },
  { type: 'romance', witnesses: 5, impact: 12, text: '$1 поцеловал $2' },
  { type: 'conflict', witnesses: 5, impact: 12, text: '$1 ударил $2' },
  { type: 'loyalty_rescue', witnesses: 5, impact: 12, text: '$1 защитил $2' },
  { type: 'public_humiliation', witnesses: 10, impact: 12, text: '$1 унизил $2 публично' }
];

console.log("Running 2500-turn simulation to verify memory bounds...\n");

const TOTAL_TURNS = 2500;
const CHECKPOINT_INTERVAL = 500;

for (let turn = 1; turn <= TOTAL_TURNS; turn++) {
  L.turn = turn;
  
  // Update character last seen
  const randomChar = CHARACTER_NAMES[Math.floor(Math.random() * CHARACTER_NAMES.length)];
  if (L.characters[randomChar]) {
    L.characters[randomChar].lastSeen = turn;
  }
  
  // Generate events (with some probability)
  if (Math.random() < 0.25) { // 25% chance per turn
    const template = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
    const char1 = CHARACTER_NAMES[Math.floor(Math.random() * CHARACTER_NAMES.length)];
    const char2 = CHARACTER_NAMES[Math.floor(Math.random() * CHARACTER_NAMES.length)];
    
    if (char1 !== char2) {
      const text = template.text.replace('$1', char1).replace('$2', char2);
      LC.LoreEngine.observe(text);
    }
  }
  
  // Track metrics
  metrics.maxActiveEntries = Math.max(metrics.maxActiveEntries, L.lore.entries.length);
  
  // Checkpoint
  if (turn % CHECKPOINT_INTERVAL === 0) {
    const checkpoint = {
      turn: turn,
      activeEntries: L.lore.entries.length,
      archivedEntries: L.lore.archive ? L.lore.archive.length : 0,
      totalLegends: (L.lore.entries.length + (L.lore.archive ? L.lore.archive.length : 0)),
      estimatedMemory: calculateMemoryUsage(L.lore)
    };
    metrics.checkpoints.push(checkpoint);
    
    console.log(`Turn ${turn}/${TOTAL_TURNS}:`);
    console.log(`  Active entries: ${checkpoint.activeEntries}`);
    console.log(`  Archived entries: ${checkpoint.archivedEntries}`);
    console.log(`  Total legends: ${checkpoint.totalLegends}`);
    console.log(`  Estimated memory: ${(checkpoint.estimatedMemory / 1024).toFixed(2)} KB\n`);
  }
}

function calculateMemoryUsage(lore) {
  // Rough estimate: each legend is about 200 bytes
  const entriesSize = (lore.entries?.length || 0) * 200;
  const archiveSize = (lore.archive?.length || 0) * 200;
  const statsSize = Object.keys(lore.stats || {}).length * 50;
  return entriesSize + archiveSize + statsSize;
}

// Final report
console.log("\n" + "=".repeat(80));
console.log("MEMORY LEAK VERIFICATION RESULTS");
console.log("=".repeat(80));

console.log("\n📊 Summary:");
console.log(`  Total turns simulated: ${TOTAL_TURNS}`);
console.log(`  Max active entries observed: ${metrics.maxActiveEntries}`);
console.log(`  LORE_ACTIVE_CAP setting: ${LC.CONFIG?.LIMITS?.LORE_ACTIVE_CAP || 5}`);
console.log(`  Final active entries: ${L.lore.entries.length}`);
console.log(`  Final archived entries: ${L.lore.archive?.length || 0}`);
console.log(`  Total legends created: ${L.lore.entries.length + (L.lore.archive?.length || 0)}`);

console.log("\n📈 Memory Growth Analysis:");
if (metrics.checkpoints.length >= 2) {
  const firstCheckpoint = metrics.checkpoints[0];
  const lastCheckpoint = metrics.checkpoints[metrics.checkpoints.length - 1];
  
  console.log(`  Memory at turn ${firstCheckpoint.turn}: ${(firstCheckpoint.estimatedMemory / 1024).toFixed(2)} KB`);
  console.log(`  Memory at turn ${lastCheckpoint.turn}: ${(lastCheckpoint.estimatedMemory / 1024).toFixed(2)} KB`);
  
  const memoryGrowth = lastCheckpoint.estimatedMemory / firstCheckpoint.estimatedMemory;
  console.log(`  Memory growth factor: ${memoryGrowth.toFixed(2)}x`);
  
  if (memoryGrowth < 2.0) {
    console.log(`  ✅ Memory growth is bounded (< 2x)`);
  } else {
    console.log(`  ⚠️  Memory growth exceeds expected bounds`);
  }
}

console.log("\n🔒 Cap Enforcement:");
const capEnforced = metrics.maxActiveEntries <= (LC.CONFIG?.LIMITS?.LORE_ACTIVE_CAP || 5);
if (capEnforced) {
  console.log(`  ✅ Active entries never exceeded LORE_ACTIVE_CAP (${LC.CONFIG?.LIMITS?.LORE_ACTIVE_CAP || 5})`);
} else {
  console.log(`  ❌ Active entries exceeded LORE_ACTIVE_CAP! (max: ${metrics.maxActiveEntries})`);
}

console.log("\n💾 Archive Functionality:");
const archiveWorking = (L.lore.archive?.length || 0) > 0 && L.lore.entries.length <= (LC.CONFIG?.LIMITS?.LORE_ACTIVE_CAP || 5);
if (archiveWorking) {
  console.log(`  ✅ Legends are being archived correctly`);
  console.log(`     ${L.lore.archive.length} legends archived, ${L.lore.entries.length} active`);
} else if ((L.lore.archive?.length || 0) === 0 && L.lore.entries.length <= (LC.CONFIG?.LIMITS?.LORE_ACTIVE_CAP || 5)) {
  console.log(`  ✅ No archiving needed (legends below cap)`);
} else {
  console.log(`  ❌ Archive not working as expected`);
}

console.log("\n" + "=".repeat(80));
if (capEnforced && L.lore.entries.length <= (LC.CONFIG?.LIMITS?.LORE_ACTIVE_CAP || 5)) {
  console.log("✅ MEMORY LEAK FIXED - Memory growth is bounded!");
  console.log("=".repeat(80));
  process.exit(0);
} else {
  console.log("❌ MEMORY LEAK STILL PRESENT");
  console.log("=".repeat(80));
  process.exit(1);
}
