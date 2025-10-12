#!/usr/bin/env node
/**
 * Test: LoreEngine Text Generation
 * 
 * Verifies that LoreEngine generates meaningful Text field for legends
 * instead of leaving it as "undefined".
 */

console.log("╔══════════════════════════════════════════════════════════════════════════════╗");
console.log("║           LORE TEXT GENERATION TEST                                         ║");
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
  },
  'Вера': {
    mentions: 10,
    lastSeen: 0,
    type: 'SECONDARY',
    status: 'ACTIVE',
    social: { status: 'member', capital: 80 }
  }
};

console.log("Testing text generation for different legend types...\n");

// Test cases: different event types with expected patterns
const testCases = [
  {
    type: 'betrayal',
    text: 'Алекс предал Бориса на глазах у всех',
    expectedPattern: /предал.*изменило/i,
    description: 'Betrayal legend'
  },
  {
    type: 'public_humiliation',
    text: 'Алекс унизил Бориса перед всем классом',
    expectedPattern: /публично унижен/i,
    description: 'Public humiliation legend'
  },
  {
    type: 'loyalty_rescue',
    text: 'Вера защитила Бориса от хулиганов',
    expectedPattern: /верность.*спас/i,
    description: 'Loyalty/rescue legend'
  },
  {
    type: 'romance',
    text: 'Алекс поцеловал Веру',
    expectedPattern: /чувства/i,
    description: 'Romance legend'
  },
  {
    type: 'conflict',
    text: 'Борис ударил Алекса',
    expectedPattern: /конфликт.*запомнится/i,
    description: 'Conflict legend'
  },
  {
    type: 'achievement',
    text: 'Вера выиграла соревнование',
    expectedPattern: /успех.*школа/i,
    description: 'Achievement legend'
  },
  {
    type: 'secret_reveal',
    text: 'Все узнали тайну Алекса',
    expectedPattern: /тайна раскрыта/i,
    description: 'Secret reveal legend'
  }
];

let passedTests = 0;
let failedTests = 0;

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.description}`);
  
  // Reset state for each test
  L.lore.entries = [];
  L.lore.stats = {};
  L.lore.coolDown = 0;
  L.turn = (index + 1) * 100;
  
  // Update character lastSeen
  Object.keys(L.characters).forEach(name => {
    L.characters[name].lastSeen = L.turn;
  });
  
  // Trigger legend creation
  LC.LoreEngine.observe(testCase.text);
  
  // Verify legend was created
  if (L.lore.entries.length === 0) {
    console.log(`  ❌ FAILED: Legend was not created`);
    failedTests++;
    console.log("");
    return;
  }
  
  const legend = L.lore.entries[0];
  
  // Check that Text field exists and is not undefined
  if (legend.Text === undefined) {
    console.log(`  ❌ FAILED: Text field is undefined`);
    failedTests++;
  } else if (typeof legend.Text !== 'string') {
    console.log(`  ❌ FAILED: Text field is not a string (type: ${typeof legend.Text})`);
    failedTests++;
  } else if (legend.Text === '') {
    console.log(`  ❌ FAILED: Text field is empty`);
    failedTests++;
  } else if (testCase.expectedPattern.test(legend.Text)) {
    console.log(`  ✅ PASSED`);
    console.log(`     Text: "${legend.Text}"`);
    passedTests++;
  } else {
    console.log(`  ❌ FAILED: Text doesn't match expected pattern`);
    console.log(`     Text: "${legend.Text}"`);
    console.log(`     Expected pattern: ${testCase.expectedPattern}`);
    failedTests++;
  }
  
  console.log("");
});

// Summary
console.log("=" .repeat(80));
console.log("TEST SUMMARY");
console.log("=".repeat(80));
console.log("");
console.log(`Total tests: ${testCases.length}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);
console.log("");

if (failedTests === 0) {
  console.log("✅ ALL TESTS PASSED");
  process.exit(0);
} else {
  console.log("❌ SOME TESTS FAILED");
  process.exit(1);
}
