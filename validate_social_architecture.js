#!/usr/bin/env node
/**
 * Quick validation script for Social Architecture feature
 * Tests all major components in a single run
 */

console.log("=== Social Architecture Feature Validation ===\n");

const fs = require('fs');
const libraryCode = fs.readFileSync('./Library v16.0.8.patched.txt', 'utf8');
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

// Test 1: Population System
test("Population initialized", 
  L.population && L.population.unnamedStudents === 50 && L.population.unnamedTeachers === 5,
  `Students: ${L.population?.unnamedStudents}, Teachers: ${L.population?.unnamedTeachers}`);

// Test 2: Character Type/Status
L.turn = 1;
L.aliases = { 'Тест': ['тест'] };
LC.updateCharacterActivity("Тест появился", false);
const testChar = L.characters['Тест'];
test("Character has type field", testChar && testChar.type === 'EXTRA');
test("Character has status field", testChar && testChar.status === 'ACTIVE');

// Test 3: CharacterGC exists
test("CharacterGC engine exists", typeof LC.CharacterGC?.run === 'function');

// Test 4: DemographicPressure exists
test("DemographicPressure engine exists", typeof LC.DemographicPressure?.analyze === 'function');

// Test 5: Loneliness Detection
L.characters = { 'Один': { mentions: 1, lastSeen: 10, firstSeen: 10, type: 'EXTRA', status: 'ACTIVE' } };
L.turn = 10;
LC.DemographicPressure.analyze("Один сидел в одиночестве.");
const suggestions = LC.DemographicPressure.getSuggestions();
test("Loneliness detection works", suggestions.length > 0 && suggestions[0].includes('Один'));

// Test 6: Expert Detection
LC.DemographicPressure.analyze("Нужно взломать систему.");
const expertSuggestions = LC.DemographicPressure.getSuggestions();
test("Expert detection works", expertSuggestions.length > 0 && expertSuggestions[0].includes('компьютер'));

// Test 7: Character Promotion
L.characters = { 
  'Промо': { mentions: 6, lastSeen: 10, firstSeen: 1, type: 'EXTRA', status: 'ACTIVE' } 
};
L.turn = 20;
LC.CharacterGC.run();
test("Character promotion works", L.characters['Промо'].type === 'SECONDARY');

// Test 8: Character Freezing
L.characters = { 
  'Заморозка': { mentions: 10, lastSeen: 50, firstSeen: 1, type: 'SECONDARY', status: 'ACTIVE' } 
};
L.turn = 200;
LC.CharacterGC.run();
test("Character freezing works", L.characters['Заморозка'].status === 'FROZEN');

// Test 9: FROZEN filtering
const activeChars = LC.getActiveCharacters(10);
const activeNames = activeChars.map(c => c.name);
test("FROZEN characters filtered", !activeNames.includes('Заморозка'));

// Test 10: Context overlay includes population
LC._contextCache = {};
const overlay = LC.composeContextOverlay({ limit: 2000 });
test("Population in context overlay", overlay.text.includes('⟦WORLD⟧'));

// Test 11: Context overlay includes suggestions
LC.DemographicPressure.suggestions = ['⟦SUGGESTION⟧ Test'];
LC._contextCache = {};
const overlayWithSugg = LC.composeContextOverlay({ limit: 2000 });
test("Suggestions in context overlay", overlayWithSugg.text.includes('⟦SUGGESTION⟧'));

// Summary
console.log("\n" + "=".repeat(50));
console.log(`Total: ${passed + failed} tests`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);

if (failed === 0) {
  console.log("\n🎉 Social Architecture feature is fully operational!");
  process.exit(0);
} else {
  console.log("\n⚠️  Some validation checks failed.");
  process.exit(1);
}
