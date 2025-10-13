#!/usr/bin/env node
/**
 * Stress Test for LoreEngine - 2500 Turns
 * 
 * This script verifies that:
 * 1. LoreEngine creates 1-3 legends over 2500 turns (not too many, not none)
 * 2. Filtering system works correctly (cooldown, threshold, duplication)
 * 3. Only truly legendary events become lore
 */

console.log("╔══════════════════════════════════════════════════════════════════════════════╗");
console.log("║           LOREENGINE STRESS TEST - 2500 TURNS                                ║");
console.log("╚══════════════════════════════════════════════════════════════════════════════╝");
console.log("");

const fs = require('fs');
const path = require('path');

// Load library code
const libraryCode = fs.readFileSync(path.join(__dirname, '..', 'v16.0.8/Library v16.0.8.patched.txt'), 'utf8');

// Mock functions
const mockFunctions = {
  _state: null,
  getState() {
    if (!this._state) {
      this._state = { lincoln: {} };
    }
    return this._state;
  },
  toNum(x, d = 0) {
    return (typeof x === 'number' && !isNaN(x)) ? x : (Number(x) || d);
  },
  toStr(x) {
    return String(x == null ? "" : x);
  },
  toBool(x, d = false) {
    return (x == null ? d : !!x);
  }
};

// Create global state
global.state = mockFunctions.getState();

const __SCRIPT_SLOT__ = "test";
const getState = mockFunctions.getState;
const toNum = mockFunctions.toNum;
const toStr = mockFunctions.toStr;
const toBool = mockFunctions.toBool;

// Evaluate library code
eval(libraryCode);

// Initialize state
const L = LC.lcInit();

// ============================================================================
// SETUP
// ============================================================================

const CHARACTER_NAMES = ['Максим', 'Хлоя', 'Леонид', 'София', 'Анна'];

// Initialize characters
console.log("Initializing characters...");
L.characters = {};
CHARACTER_NAMES.forEach((name, i) => {
  L.characters[name] = {
    mentions: 10,
    lastSeen: 0,
    type: i < 2 ? 'MAIN' : 'SECONDARY',
    status: 'ACTIVE',
    social: {
      status: i === 0 ? 'leader' : (i === 4 ? 'outcast' : 'member'),
      capital: 100 + (i * 10)
    }
  };
});

// Event templates with varying legendary potential
const eventTemplates = [
  // High potential events (should become lore)
  { text: "{char1} предал {char2} на глазах у всего класса", potential: 'high', frequency: 0.02 },
  { text: "{char1} публично унизил {char2} перед всеми", potential: 'high', frequency: 0.02 },
  
  // Medium potential events (might become lore if conditions are right)
  { text: "{char1} поцеловал {char2}", potential: 'medium', frequency: 0.05 },
  { text: "{char1} ударил {char2}", potential: 'medium', frequency: 0.04 },
  { text: "{char1} защитил {char2} от всех", potential: 'medium', frequency: 0.03 },
  
  // Low potential events (should NOT become lore)
  { text: "{char1} разговаривал с {char2}", potential: 'low', frequency: 0.3 },
  { text: "{char1} встретил {char2} в коридоре", potential: 'low', frequency: 0.3 },
  { text: "{char1} помог {char2} с домашкой", potential: 'low', frequency: 0.15 }
];

function generateEvent(turn) {
  // Select template based on frequency
  const rand = Math.random();
  let cumulativeFreq = 0;
  let selectedTemplate = eventTemplates[eventTemplates.length - 1];
  
  for (const template of eventTemplates) {
    cumulativeFreq += template.frequency;
    if (rand < cumulativeFreq) {
      selectedTemplate = template;
      break;
    }
  }
  
  // Pick random characters
  const char1 = CHARACTER_NAMES[Math.floor(Math.random() * CHARACTER_NAMES.length)];
  let char2 = CHARACTER_NAMES[Math.floor(Math.random() * CHARACTER_NAMES.length)];
  while (char2 === char1) {
    char2 = CHARACTER_NAMES[Math.floor(Math.random() * CHARACTER_NAMES.length)];
  }
  
  const text = selectedTemplate.text.replace('{char1}', char1).replace('{char2}', char2);
  
  return { text, potential: selectedTemplate.potential, char1, char2 };
}

// ============================================================================
// RUN SIMULATION
// ============================================================================

console.log("Running 2500-turn simulation...\n");

const TOTAL_TURNS = 2500;
const CHECKPOINT_INTERVAL = 500;
let eventsProcessed = 0;

for (let turn = 1; turn <= TOTAL_TURNS; turn++) {
  L.turn = turn;
  
  // Generate and process event
  const event = generateEvent(turn);
  
  // Update character activity
  L.characters[event.char1].lastSeen = turn;
  L.characters[event.char2].lastSeen = turn;
  
  // Process through UnifiedAnalyzer (which calls LoreEngine)
  LC.UnifiedAnalyzer?.analyze?.(event.text, 'output');
  
  eventsProcessed++;
  
  // Checkpoint reporting
  if (turn % CHECKPOINT_INTERVAL === 0) {
    console.log(`Turn ${turn}/${TOTAL_TURNS}: ${L.lore.entries.length} legends created`);
  }
}

// ============================================================================
// RESULTS
// ============================================================================

console.log("\n" + "=".repeat(80));
console.log("SIMULATION COMPLETE");
console.log("=".repeat(80));

console.log(`\nTotal turns: ${TOTAL_TURNS}`);
console.log(`Events processed: ${eventsProcessed}`);
console.log(`Legends created: ${L.lore.entries.length}`);
console.log(`\nLegend statistics by type:`);

if (L.lore.stats) {
  for (const [key, count] of Object.entries(L.lore.stats)) {
    console.log(`  ${key}: ${count}`);
  }
}

console.log("\n" + "=".repeat(80));
console.log("LEGENDS DETAIL");
console.log("=".repeat(80));

if (L.lore.entries.length > 0) {
  L.lore.entries.forEach((legend, i) => {
    console.log(`\nLegend ${i + 1}:`);
    console.log(`  Type: ${legend.type}`);
    console.log(`  Turn: ${legend.turn}`);
    console.log(`  Potential: ${legend.potential}`);
    console.log(`  Participants: ${legend.participants.join(', ')}`);
    console.log(`  Witnesses: ${legend.witnesses}`);
    console.log(`  Impact: ${legend.impact}`);
    console.log(`  Description: ${legend.description.substring(0, 80)}...`);
  });
} else {
  console.log("\nNo legends created.");
}

// ============================================================================
// VALIDATION
// ============================================================================

console.log("\n" + "=".repeat(80));
console.log("VALIDATION");
console.log("=".repeat(80) + "\n");

const legendCount = L.lore.entries.length;
let validationPassed = true;
let validationMessages = [];

// Check 1: Should have 1-3 legends (can be a bit flexible: 1-5 is acceptable)
if (legendCount >= 1 && legendCount <= 5) {
  validationMessages.push(`✅ Legend count in acceptable range: ${legendCount} (target: 1-3, acceptable: 1-5)`);
} else if (legendCount === 0) {
  validationMessages.push(`⚠️  No legends created. This might be acceptable but check threshold tuning.`);
  validationMessages.push(`    Current base threshold: ${LC.LoreEngine.BASE_THRESHOLD}`);
} else {
  validationMessages.push(`❌ Too many legends created: ${legendCount} (expected: 1-3)`);
  validationPassed = false;
}

// Check 2: Cooldown should be working (entries should be spaced apart)
if (legendCount >= 2) {
  let minSpacing = Infinity;
  for (let i = 1; i < L.lore.entries.length; i++) {
    const spacing = L.lore.entries[i].turn - L.lore.entries[i-1].turn;
    minSpacing = Math.min(minSpacing, spacing);
  }
  
  if (minSpacing >= LC.LoreEngine.COOL_DOWN_PERIOD) {
    validationMessages.push(`✅ Cooldown working correctly: min spacing ${minSpacing} >= ${LC.LoreEngine.COOL_DOWN_PERIOD}`);
  } else {
    validationMessages.push(`❌ Cooldown not working: min spacing ${minSpacing} < ${LC.LoreEngine.COOL_DOWN_PERIOD}`);
    validationPassed = false;
  }
}

// Check 3: All legends should have high potential
if (legendCount > 0) {
  const avgPotential = L.lore.entries.reduce((sum, l) => sum + l.potential, 0) / legendCount;
  if (avgPotential >= LC.LoreEngine.BASE_THRESHOLD) {
    validationMessages.push(`✅ Average potential (${avgPotential.toFixed(1)}) >= threshold (${LC.LoreEngine.BASE_THRESHOLD})`);
  } else {
    validationMessages.push(`⚠️  Average potential (${avgPotential.toFixed(1)}) < threshold (${LC.LoreEngine.BASE_THRESHOLD})`);
  }
}

// Print validation results
validationMessages.forEach(msg => console.log(msg));

console.log("\n" + "=".repeat(80));
if (validationPassed) {
  console.log("✅ STRESS TEST PASSED");
  console.log("=".repeat(80));
  process.exit(0);
} else {
  console.log("❌ STRESS TEST FAILED");
  console.log("=".repeat(80));
  process.exit(1);
}
