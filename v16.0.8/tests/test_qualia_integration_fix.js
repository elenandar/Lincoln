#!/usr/bin/env node
/**
 * Test to verify QualiaEngine integration fix
 * This test demonstrates that characters now "feel" events through qualia_state changes
 */

const fs = require('fs');
const path = require('path');

console.log("╔══════════════════════════════════════════════════════════════════════════════╗");
console.log("║         QualiaEngine Integration Fix - Verification Test                    ║");
console.log("╚══════════════════════════════════════════════════════════════════════════════╝");
console.log("");

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

// Initialize characters
L.characters = {
  'Максим': {
    mentions: 100,
    lastSeen: 1,
    firstSeen: 1,
    type: 'MAIN',
    status: 'ACTIVE',
    qualia_state: {
      somatic_tension: 0.3,
      valence: 0.5,
      focus_aperture: 0.7,
      energy_level: 0.8
    }
  },
  'Хлоя': {
    mentions: 100,
    lastSeen: 1,
    firstSeen: 1,
    type: 'MAIN',
    status: 'ACTIVE',
    qualia_state: {
      somatic_tension: 0.3,
      valence: 0.5,
      focus_aperture: 0.7,
      energy_level: 0.8
    }
  }
};

L.evergreen = { 
  enabled: true, 
  relations: {
    'Максим': { 'Хлоя': 0 },
    'Хлоя': { 'Максим': 0 }
  }, 
  status: {}, 
  obligations: {}, 
  facts: {}, 
  history: [] 
};

let allTestsPassed = true;

// Test 1: Negative social event (relation-based)
console.log("Test 1: Negative Social Event (Relation Pattern)");
console.log("  Event: 'Хлоя оскорбила Максима'");
const before1 = { ...L.characters['Максим'].qualia_state };
console.log(`  Before: tension=${before1.somatic_tension.toFixed(2)}, valence=${before1.valence.toFixed(2)}`);

LC.UnifiedAnalyzer.analyze("Хлоя оскорбила Максима.", "output");

const after1 = L.characters['Максим'].qualia_state;
console.log(`  After:  tension=${after1.somatic_tension.toFixed(2)}, valence=${after1.valence.toFixed(2)}`);

if (after1.somatic_tension > before1.somatic_tension) {
  console.log("  ✅ Tension increased (character felt the insult)");
} else {
  console.log("  ❌ FAILED: Tension should increase");
  allTestsPassed = false;
}

if (after1.valence < before1.valence) {
  console.log("  ✅ Valence decreased (character felt negative emotion)");
} else {
  console.log("  ❌ FAILED: Valence should decrease");
  allTestsPassed = false;
}
console.log("");

// Test 2: Positive event (generic pattern)
console.log("Test 2: Positive Event (Generic Pattern)");
console.log("  Event: 'Максим получил замечательный комплимент'");
const before2 = { ...L.characters['Максим'].qualia_state };
console.log(`  Before: valence=${before2.valence.toFixed(2)}`);

LC.UnifiedAnalyzer.analyze("Максим получил замечательный комплимент.", "output");

const after2 = L.characters['Максим'].qualia_state;
console.log(`  After:  valence=${after2.valence.toFixed(2)}`);

if (after2.valence > before2.valence) {
  console.log("  ✅ Valence increased (character felt the compliment)");
} else {
  console.log("  ❌ FAILED: Valence should increase");
  allTestsPassed = false;
}
console.log("");

// Test 3: Negative event (generic pattern)
console.log("Test 3: Negative Event (Generic Pattern)");
console.log("  Event: 'Хлоя была публично унижена'");
const before3 = { ...L.characters['Хлоя'].qualia_state };
console.log(`  Before: tension=${before3.somatic_tension.toFixed(2)}, valence=${before3.valence.toFixed(2)}`);

LC.UnifiedAnalyzer.analyze("Хлоя была публично унижена.", "output");

const after3 = L.characters['Хлоя'].qualia_state;
console.log(`  After:  tension=${after3.somatic_tension.toFixed(2)}, valence=${after3.valence.toFixed(2)}`);

if (after3.somatic_tension > before3.somatic_tension) {
  console.log("  ✅ Tension increased");
} else {
  console.log("  ❌ FAILED: Tension should increase");
  allTestsPassed = false;
}

if (after3.valence < before3.valence) {
  console.log("  ✅ Valence decreased");
} else {
  console.log("  ❌ FAILED: Valence should decrease");
  allTestsPassed = false;
}
console.log("");

// Test 4: Success event
console.log("Test 4: Success Event (Generic Pattern)");
console.log("  Event: 'Максим добился значительного успеха'");
const before4 = { ...L.characters['Максим'].qualia_state };
console.log(`  Before: valence=${before4.valence.toFixed(2)}`);

LC.UnifiedAnalyzer.analyze("Максим добился значительного успеха.", "output");

const after4 = L.characters['Максим'].qualia_state;
console.log(`  After:  valence=${after4.valence.toFixed(2)}`);

if (after4.valence > before4.valence) {
  console.log("  ✅ Valence increased");
} else {
  console.log("  ❌ FAILED: Valence should increase");
  allTestsPassed = false;
}
console.log("");

// Summary
console.log("═══════════════════════════════════════════════════════════════════════════════");
if (allTestsPassed) {
  console.log("✅ ALL TESTS PASSED - QualiaEngine Integration Fix Verified!");
  console.log("");
  console.log("Summary:");
  console.log("  ✓ Characters now 'feel' social events through qualia_state changes");
  console.log("  ✓ Both relation-based and generic event patterns trigger qualia");
  console.log("  ✓ Negative events increase tension and decrease valence");
  console.log("  ✓ Positive events increase valence");
  console.log("  ✓ The 'heartbeat' is now connected!");
  process.exit(0);
} else {
  console.log("❌ SOME TESTS FAILED");
  process.exit(1);
}
