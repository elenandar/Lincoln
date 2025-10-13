#!/usr/bin/env node
/**
 * Test suite for Social Engine (Norms & Hierarchy)
 * Tests the NormsEngine and HierarchyEngine functionality
 */

console.log("=== Social Engine Test Suite ===\n");

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
console.log("--- Test 1: Data Structures ---\n");

test("L.society exists", 
  L.society && typeof L.society === 'object',
  `society: ${JSON.stringify(L.society)}`);

test("L.society.norms exists", 
  L.society && L.society.norms && typeof L.society.norms === 'object',
  `norms: ${JSON.stringify(L.society.norms)}`);

// Test character creation with social structure
L.turn = 1;
L.aliases = { 'Тестовый': ['тестовый'] };
LC.updateCharacterActivity("Тестовый появился", false);
const testChar = L.characters['Тестовый'];

test("Character has social object", 
  testChar && testChar.social && typeof testChar.social === 'object',
  `social: ${JSON.stringify(testChar.social)}`);

test("Character social has status field", 
  testChar && testChar.social && testChar.social.status === 'member',
  `status: ${testChar.social?.status}`);

test("Character social has capital field", 
  testChar && testChar.social && testChar.social.capital === 100,
  `capital: ${testChar.social?.capital}`);

test("Character social has conformity field", 
  testChar && testChar.social && testChar.social.conformity === 0.5,
  `conformity: ${testChar.social?.conformity}`);

// ========== Test 2: NormsEngine Existence ==========
console.log("\n--- Test 2: NormsEngine Functionality ---\n");

test("NormsEngine exists", 
  LC.NormsEngine && typeof LC.NormsEngine === 'object');

test("NormsEngine.processEvent exists", 
  typeof LC.NormsEngine.processEvent === 'function');

test("NormsEngine.getNormStrength exists", 
  typeof LC.NormsEngine.getNormStrength === 'function');

// Test default norm strength
const defaultStrength = LC.NormsEngine.getNormStrength('unknown_norm');
test("Default norm strength is 0.5", 
  defaultStrength === 0.5,
  `strength: ${defaultStrength}`);

// ========== Test 3: HierarchyEngine Existence ==========
console.log("\n--- Test 3: HierarchyEngine Functionality ---\n");

test("HierarchyEngine exists", 
  LC.HierarchyEngine && typeof LC.HierarchyEngine === 'object');

test("HierarchyEngine.updateCapital exists", 
  typeof LC.HierarchyEngine.updateCapital === 'function');

test("HierarchyEngine.recalculateStatus exists", 
  typeof LC.HierarchyEngine.recalculateStatus === 'function');

test("HierarchyEngine.getStatus exists", 
  typeof LC.HierarchyEngine.getStatus === 'function');

// ========== Test 4: Social Capital Updates ==========
console.log("\n--- Test 4: Social Capital Updates ---\n");

// Setup test characters
L.characters = {
  'Алиса': {
    mentions: 10,
    lastSeen: L.turn,
    type: 'SECONDARY',
    status: 'ACTIVE',
    social: {
      status: 'member',
      capital: 100,
      conformity: 0.5
    }
  },
  'Боб': {
    mentions: 10,
    lastSeen: L.turn,
    type: 'SECONDARY',
    status: 'ACTIVE',
    social: {
      status: 'member',
      capital: 100,
      conformity: 0.5
    }
  }
};

// Test capital loss from norm violation
const initialCapital = L.characters['Алиса'].social.capital;
LC.HierarchyEngine.updateCapital('Алиса', {
  type: 'NORM_VIOLATION',
  normStrength: 0.8,
  witnessCount: 3
});

test("Capital decreases on norm violation", 
  L.characters['Алиса'].social.capital < initialCapital,
  `Before: ${initialCapital}, After: ${L.characters['Алиса'].social.capital}`);

test("Conformity decreases on norm violation", 
  L.characters['Алиса'].social.conformity < 0.5,
  `conformity: ${L.characters['Алиса'].social.conformity}`);

// Test capital gain from conformity
const bobInitialCapital = L.characters['Боб'].social.capital;
LC.HierarchyEngine.updateCapital('Боб', {
  type: 'NORM_CONFORMITY',
  normStrength: 0.8
});

test("Capital increases on norm conformity", 
  L.characters['Боб'].social.capital > bobInitialCapital,
  `Before: ${bobInitialCapital}, After: ${L.characters['Боб'].social.capital}`);

// ========== Test 5: Status Transitions ==========
console.log("\n--- Test 5: Status Transitions ---\n");

// Setup characters with different capital levels
L.characters = {
  'Лидер': {
    mentions: 20,
    lastSeen: L.turn,
    type: 'SECONDARY',
    status: 'ACTIVE',
    social: {
      status: 'member',
      capital: 150,
      conformity: 0.8
    }
  },
  'Обычный': {
    mentions: 15,
    lastSeen: L.turn,
    type: 'SECONDARY',
    status: 'ACTIVE',
    social: {
      status: 'member',
      capital: 100,
      conformity: 0.5
    }
  },
  'Изгой': {
    mentions: 10,
    lastSeen: L.turn,
    type: 'SECONDARY',
    status: 'ACTIVE',
    social: {
      status: 'member',
      capital: 30,
      conformity: 0.2
    }
  }
};

// Recalculate statuses
LC.HierarchyEngine.recalculateStatus();

test("High capital becomes leader", 
  L.characters['Лидер'].social.status === 'leader',
  `status: ${L.characters['Лидер'].social.status}, capital: ${L.characters['Лидер'].social.capital}`);

test("Medium capital stays member", 
  L.characters['Обычный'].social.status === 'member',
  `status: ${L.characters['Обычный'].social.status}, capital: ${L.characters['Обычный'].social.capital}`);

test("Low capital becomes outcast", 
  L.characters['Изгой'].social.status === 'outcast',
  `status: ${L.characters['Изгой'].social.status}, capital: ${L.characters['Изгой'].social.capital}`);

// ========== Test 6: Context Overlay Integration ==========
console.log("\n--- Test 6: Context Overlay Integration ---\n");

// Setup a leader character
L.characters = {
  'Лидер': {
    mentions: 20,
    lastSeen: L.turn,
    type: 'SECONDARY',
    status: 'ACTIVE',
    social: {
      status: 'leader',
      capital: 150,
      conformity: 0.8
    },
    personality: {
      trust: 0.5,
      bravery: 0.5,
      idealism: 0.5,
      aggression: 0.3
    }
  },
  'Изгой': {
    mentions: 18,
    lastSeen: L.turn,
    type: 'SECONDARY',
    status: 'ACTIVE',
    social: {
      status: 'outcast',
      capital: 30,
      conformity: 0.2
    },
    personality: {
      trust: 0.5,
      bravery: 0.5,
      idealism: 0.5,
      aggression: 0.3
    }
  }
};

const overlay = LC.composeContextOverlay({});
const overlayText = overlay.text || '';

test("Context overlay includes STATUS tag for leader", 
  overlayText.includes('⟦STATUS: Лидер⟧') && overlayText.includes('Лидер мнений'),
  "STATUS tag found in overlay");

test("Context overlay includes STATUS tag for outcast", 
  overlayText.includes('⟦STATUS: Изгой⟧') && overlayText.includes('Изгой'),
  "STATUS tag found in overlay");

// ========== Test 7: GetStatus Method ==========
console.log("\n--- Test 7: GetStatus Method ---\n");

test("getStatus returns correct status for leader", 
  LC.HierarchyEngine.getStatus('Лидер') === 'leader');

test("getStatus returns correct status for outcast", 
  LC.HierarchyEngine.getStatus('Изгой') === 'outcast');

test("getStatus returns 'member' for unknown character", 
  LC.HierarchyEngine.getStatus('Unknown') === 'member');

// ========== Test 8: Capital Capping ==========
console.log("\n--- Test 8: Capital Capping ---\n");

L.characters['TestCap'] = {
  mentions: 10,
  lastSeen: L.turn,
  type: 'SECONDARY',
  status: 'ACTIVE',
  social: {
    status: 'member',
    capital: 195,
    conformity: 0.9
  }
};

// Try to add more capital
LC.HierarchyEngine.updateCapital('TestCap', {
  type: 'POSITIVE_ACTION'
});

test("Capital is capped at 200", 
  L.characters['TestCap'].social.capital <= 200,
  `capital: ${L.characters['TestCap'].social.capital}`);

// Test floor at 0
L.characters['TestFloor'] = {
  mentions: 10,
  lastSeen: L.turn,
  type: 'SECONDARY',
  status: 'ACTIVE',
  social: {
    status: 'member',
    capital: 3,
    conformity: 0.1
  }
};

LC.HierarchyEngine.updateCapital('TestFloor', {
  type: 'NEGATIVE_ACTION'
});

test("Capital is floored at 0", 
  L.characters['TestFloor'].social.capital >= 0,
  `capital: ${L.characters['TestFloor'].social.capital}`);

// ========== Summary ==========
console.log("\n" + "=".repeat(50));
console.log(`Total: ${passed + failed} tests`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);

if (failed === 0) {
  console.log("\n🎉 All Social Engine tests passed!");
  process.exit(0);
} else {
  console.log(`\n⚠️ ${failed} test(s) failed.`);
  process.exit(1);
}
