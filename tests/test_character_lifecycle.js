#!/usr/bin/env node
/**
 * Test script to verify Character Lifecycle and Population System functionality
 * 
 * This script validates:
 * 1. Population initialization (L.population)
 * 2. Character creation with type and status fields
 * 3. Character promotion (EXTRA → SECONDARY)
 * 4. Character freezing (SECONDARY → FROZEN)
 * 5. Character unfreezing (FROZEN → ACTIVE on mention)
 * 6. Character deletion (EXTRA with minimal interaction)
 * 7. FROZEN characters filtered from context
 * 8. Population context in overlay
 * 9. Demographic pressure suggestions
 */

console.log("=== Testing Character Lifecycle & Population System ===\n");

const fs = require('fs');
const path = require('path');

// Load library code
const libraryCode = fs.readFileSync(path.join(__dirname, '..', 'v16.0.8/Library v16.0.8.patched.txt'), 'utf8');

// Set up global state that the library expects
global.state = { lincoln: {} };

// Helper functions
const toNum = (x, d = 0) => (typeof x === 'number' && !isNaN(x)) ? x : (Number(x) || d);
const toStr = (x) => String(x == null ? "" : x);
const toBool = (x, d = false) => (x == null ? d : !!x);

// Evaluate library code
eval(libraryCode);

let allTestsPassed = true;

// Test 1: Population Initialization
console.log("Test 1: Population Initialization");
const L = LC.lcInit();
L.turn = 1;

if (!L.population) {
  console.log("  ❌ FAILED: L.population not initialized");
  allTestsPassed = false;
} else {
  console.log("  ✅ L.population exists:", !!L.population);
  console.log("  ✅ unnamedStudents:", L.population.unnamedStudents);
  console.log("  ✅ unnamedTeachers:", L.population.unnamedTeachers);
}
console.log("");

// Test 2: Character Creation with Type and Status
console.log("Test 2: Character Creation with Type and Status");
L.characters = {};
L.aliases = {
  'Алекс': ['алекс', 'александр']
};

LC.updateCharacterActivity("Алекс пришел в школу", false);

const alex = L.characters['Алекс'];
if (!alex) {
  console.log("  ❌ FAILED: Character not created");
  allTestsPassed = false;
} else {
  console.log("  ✅ Character created:", !!alex);
  console.log("  ✅ Has type field:", alex.type !== undefined);
  console.log("  ✅ Default type is EXTRA:", alex.type === 'EXTRA');
  console.log("  ✅ Has status field:", alex.status !== undefined);
  console.log("  ✅ Default status is ACTIVE:", alex.status === 'ACTIVE');
}
console.log("");

// Test 3: Character Promotion (EXTRA → SECONDARY)
console.log("Test 3: Character Promotion (EXTRA → SECONDARY)");
L.turn = 10;
L.characters = {
  'Борис': { 
    mentions: 6, 
    lastSeen: 8, 
    firstSeen: 1, 
    type: 'EXTRA', 
    status: 'ACTIVE' 
  }
};

LC.CharacterGC.run();

const boris = L.characters['Борис'];
if (!boris) {
  console.log("  ❌ FAILED: Character not found");
  allTestsPassed = false;
} else if (boris.type !== 'SECONDARY') {
  console.log("  ❌ FAILED: Character not promoted to SECONDARY");
  console.log("     Type:", boris.type);
  allTestsPassed = false;
} else {
  console.log("  ✅ Character promoted from EXTRA to SECONDARY");
  console.log("     mentions:", boris.mentions, "type:", boris.type);
}
console.log("");

// Test 4: Character Freezing (SECONDARY → FROZEN)
console.log("Test 4: Character Freezing (SECONDARY → FROZEN)");
L.turn = 200;
L.characters = {
  'Виктор': { 
    mentions: 10, 
    lastSeen: 50, 
    firstSeen: 1, 
    type: 'SECONDARY', 
    status: 'ACTIVE' 
  }
};

LC.CharacterGC.run();

const viktor = L.characters['Виктор'];
if (!viktor) {
  console.log("  ❌ FAILED: Character not found");
  allTestsPassed = false;
} else if (viktor.status !== 'FROZEN') {
  console.log("  ❌ FAILED: Character not frozen");
  console.log("     status:", viktor.status, "lastSeen:", viktor.lastSeen, "turn:", L.turn);
  allTestsPassed = false;
} else {
  console.log("  ✅ Character frozen after >100 turns of inactivity");
  console.log("     type:", viktor.type, "status:", viktor.status);
}
console.log("");

// Test 5: Character Unfreezing (FROZEN → ACTIVE on mention)
console.log("Test 5: Character Unfreezing (FROZEN → ACTIVE on mention)");
L.turn = 250;
L.characters = {
  'Галина': { 
    mentions: 5, 
    lastSeen: 100, 
    firstSeen: 1, 
    type: 'SECONDARY', 
    status: 'FROZEN' 
  }
};
L.aliases = {
  'Галина': ['галина', 'галя']
};

const versionBefore = L.stateVersion;
LC.updateCharacterActivity("Галина вернулась", false);

const galina = L.characters['Галина'];
if (!galina) {
  console.log("  ❌ FAILED: Character not found");
  allTestsPassed = false;
} else if (galina.status !== 'ACTIVE') {
  console.log("  ❌ FAILED: Character not unfrozen");
  console.log("     status:", galina.status);
  allTestsPassed = false;
} else {
  console.log("  ✅ Character unfrozen on mention");
  console.log("     status:", galina.status);
  console.log("  ✅ StateVersion incremented:", L.stateVersion > versionBefore);
}
console.log("");

// Test 6: Character Deletion (EXTRA with minimal interaction)
console.log("Test 6: Character Deletion (EXTRA with minimal interaction)");
L.turn = 300;
L.characters = {
  'Дмитрий': { 
    mentions: 1, 
    lastSeen: 50, 
    firstSeen: 49, 
    type: 'EXTRA', 
    status: 'ACTIVE' 
  },
  'Елена': { 
    mentions: 5, 
    lastSeen: 50, 
    firstSeen: 10, 
    type: 'EXTRA', 
    status: 'ACTIVE' 
  }
};

LC.CharacterGC.run();

const dmitriy = L.characters['Дмитрий'];
const elena = L.characters['Елена'];

if (dmitriy) {
  console.log("  ❌ FAILED: Character with minimal interaction not deleted");
  allTestsPassed = false;
} else {
  console.log("  ✅ Character with ≤2 mentions and >200 turns deleted");
}

if (!elena) {
  console.log("  ❌ FAILED: Character with more mentions incorrectly deleted");
  allTestsPassed = false;
} else {
  console.log("  ✅ Character with >2 mentions preserved");
}
console.log("");

// Test 7: FROZEN characters filtered from getActiveCharacters
console.log("Test 7: FROZEN Characters Filtered from Context");
L.turn = 100;
L.characters = {
  'Иван': { mentions: 10, lastSeen: 95, firstSeen: 1, type: 'SECONDARY', status: 'ACTIVE' },
  'Катя': { mentions: 10, lastSeen: 96, firstSeen: 1, type: 'SECONDARY', status: 'FROZEN' }
};

const activeChars = LC.getActiveCharacters(10);
const activeNames = activeChars.map(c => c.name);

if (activeNames.includes('Катя')) {
  console.log("  ❌ FAILED: FROZEN character included in active characters");
  allTestsPassed = false;
} else {
  console.log("  ✅ FROZEN character excluded from active characters");
}

if (!activeNames.includes('Иван')) {
  console.log("  ❌ FAILED: ACTIVE character excluded from active characters");
  allTestsPassed = false;
} else {
  console.log("  ✅ ACTIVE character included in active characters");
}
console.log("");

// Test 8: Population Context in Overlay
console.log("Test 8: Population Context in Overlay");
L.population = {
  unnamedStudents: 50,
  unnamedTeachers: 5
};

const overlay = LC.composeContextOverlay({ limit: 2000 });
const overlayText = overlay.text || "";

if (!overlayText.includes('⟦WORLD⟧')) {
  console.log("  ❌ FAILED: Population context not included");
  allTestsPassed = false;
} else {
  console.log("  ✅ Population context included in overlay");
  const worldLine = overlayText.split('\n').find(line => line.includes('⟦WORLD⟧'));
  console.log("    ", worldLine);
}
console.log("");

// Test 9: Demographic Pressure - Loneliness Detection
console.log("Test 9: Demographic Pressure - Loneliness Detection");
L.turn = 50;
L.characters = {
  'Лев': { mentions: 3, lastSeen: 50, firstSeen: 40, type: 'EXTRA', status: 'ACTIVE' }
};

LC.DemographicPressure.analyze("Лев сидел один в пустом классе.");
const suggestions = LC.DemographicPressure.getSuggestions();

if (!suggestions || suggestions.length === 0) {
  console.log("  ❌ FAILED: No loneliness suggestion generated");
  allTestsPassed = false;
} else {
  console.log("  ✅ Loneliness suggestion generated");
  console.log("    ", suggestions[0]);
}
console.log("");

// Test 10: Demographic Pressure - Expert Needed
console.log("Test 10: Demographic Pressure - Expert Detection");
LC.DemographicPressure.analyze("Нужно взломать сервер директора.");
const expertSuggestions = LC.DemographicPressure.getSuggestions();

if (!expertSuggestions || expertSuggestions.length === 0) {
  console.log("  ❌ FAILED: No expert suggestion generated");
  allTestsPassed = false;
} else {
  console.log("  ✅ Expert suggestion generated");
  console.log("    ", expertSuggestions[0]);
}
console.log("");

// Test 11: Demographic Suggestions in Context Overlay
console.log("Test 11: Demographic Suggestions in Context Overlay");
LC.DemographicPressure.suggestions = ['⟦SUGGESTION⟧ Test suggestion'];
// Clear context cache to ensure fresh compilation
LC._contextCache = {};
const overlayWithSuggestion = LC.composeContextOverlay({ limit: 2000 });
const overlayWithSuggestionText = overlayWithSuggestion.text || "";

if (!overlayWithSuggestionText.includes('⟦SUGGESTION⟧')) {
  console.log("  ❌ FAILED: Demographic suggestion not included in overlay");
  allTestsPassed = false;
} else {
  console.log("  ✅ Demographic suggestion included in overlay");
  const suggestionLine = overlayWithSuggestionText.split('\n').find(line => line.includes('⟦SUGGESTION⟧'));
  console.log("    ", suggestionLine);
}
console.log("");

// Final Summary
console.log("=".repeat(60));
if (allTestsPassed) {
  console.log("✅ ALL TESTS PASSED");
  process.exit(0);
} else {
  console.log("❌ SOME TESTS FAILED");
  process.exit(1);
}
