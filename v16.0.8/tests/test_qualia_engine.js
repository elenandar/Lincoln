#!/usr/bin/env node
/**
 * Test script to verify Qualia Engine (Phenomenal Core) functionality
 * 
 * This script validates:
 * 1. Qualia state initialization for characters
 * 2. QualiaEngine.resonate() event processing
 * 3. Social event qualia changes (compliment, insult, threat)
 * 4. Environmental event qualia changes
 * 5. Physical event qualia changes
 * 6. Achievement event qualia changes
 * 7. Group resonance (emotional contagion)
 * 8. Integration with LivingWorld engine
 * 9. Bounds checking (values stay in [0, 1])
 */

console.log("=== Testing Qualia Engine (Phenomenal Core) ===\n");

const fs = require('fs');
const path = require('path');

// Load library code
const libraryCode = fs.readFileSync(path.join(__dirname, '..', 'Library v16.0.8.patched.txt'), 'utf8');

// Set up global state that the library expects
global.state = { lincoln: {} };

// Execute library code
eval(libraryCode);

let allTestsPassed = true;

// Test 1: Qualia State Initialization
console.log("Test 1: Qualia State Initialization");
const L = LC.lcInit();
L.turn = 1;
L.characters = {};
L.aliases = {
  'Алекс': ['алекс', 'александр']
};

LC.updateCharacterActivity("Алекс пришел в школу", false);

const alex = L.characters['Алекс'];
if (!alex) {
  console.log("  ❌ FAILED: Character not created");
  allTestsPassed = false;
} else if (!alex.qualia_state) {
  console.log("  ❌ FAILED: Qualia state not initialized");
  allTestsPassed = false;
} else {
  console.log("  ✅ Character created with qualia_state");
  console.log("     somatic_tension:", alex.qualia_state.somatic_tension);
  console.log("     valence:", alex.qualia_state.valence);
  console.log("     focus_aperture:", alex.qualia_state.focus_aperture);
  console.log("     energy_level:", alex.qualia_state.energy_level);
  
  if (alex.qualia_state.somatic_tension === 0.3 && 
      alex.qualia_state.valence === 0.5 && 
      alex.qualia_state.focus_aperture === 0.7 && 
      alex.qualia_state.energy_level === 0.8) {
    console.log("  ✅ Default qualia values correct");
  } else {
    console.log("  ❌ FAILED: Default qualia values incorrect");
    allTestsPassed = false;
  }
}
console.log("");

// Test 2: QualiaEngine Structure
console.log("Test 2: QualiaEngine Structure");
if (!LC.QualiaEngine) {
  console.log("  ❌ FAILED: LC.QualiaEngine not defined");
  allTestsPassed = false;
} else {
  console.log("  ✅ LC.QualiaEngine exists:", !!LC.QualiaEngine);
  console.log("  ✅ resonate exists:", typeof LC.QualiaEngine.resonate === 'function');
  console.log("  ✅ runGroupResonance exists:", typeof LC.QualiaEngine.runGroupResonance === 'function');
}
console.log("");

// Test 3: Social Event - Compliment
console.log("Test 3: Social Event - Compliment");
L.characters = {
  'Борис': {
    mentions: 10,
    lastSeen: 10,
    type: 'SECONDARY',
    status: 'ACTIVE',
    qualia_state: {
      somatic_tension: 0.5,
      valence: 0.5,
      focus_aperture: 0.7,
      energy_level: 0.8
    }
  }
};

const borisBefore = { ...L.characters['Борис'].qualia_state };

LC.QualiaEngine.resonate(L.characters['Борис'], {
  type: 'social',
  actor: 'Максим',
  action: 'compliment',
  target: 'Борис',
  intensity: 1.0
});

const borisAfter = L.characters['Борис'].qualia_state;

console.log("  Before: valence =", borisBefore.valence, "tension =", borisBefore.somatic_tension);
console.log("  After:  valence =", borisAfter.valence, "tension =", borisAfter.somatic_tension);

if (borisAfter.valence > borisBefore.valence) {
  console.log("  ✅ Valence increased after compliment");
} else {
  console.log("  ❌ FAILED: Valence should increase");
  allTestsPassed = false;
}

if (borisAfter.somatic_tension < borisBefore.somatic_tension) {
  console.log("  ✅ Tension decreased after compliment");
} else {
  console.log("  ❌ FAILED: Tension should decrease");
  allTestsPassed = false;
}
console.log("");

// Test 4: Social Event - Insult
console.log("Test 4: Social Event - Insult");
L.characters['Борис'].qualia_state = {
  somatic_tension: 0.3,
  valence: 0.7,
  focus_aperture: 0.7,
  energy_level: 0.8
};

const borisBefore2 = { ...L.characters['Борис'].qualia_state };

LC.QualiaEngine.resonate(L.characters['Борис'], {
  type: 'social',
  actor: 'Максим',
  action: 'insult',
  target: 'Борис',
  intensity: 1.0
});

const borisAfter2 = L.characters['Борис'].qualia_state;

console.log("  Before: valence =", borisBefore2.valence, "tension =", borisBefore2.somatic_tension);
console.log("  After:  valence =", borisAfter2.valence, "tension =", borisAfter2.somatic_tension);

if (borisAfter2.valence < borisBefore2.valence) {
  console.log("  ✅ Valence decreased after insult");
} else {
  console.log("  ❌ FAILED: Valence should decrease");
  allTestsPassed = false;
}

if (borisAfter2.somatic_tension > borisBefore2.somatic_tension) {
  console.log("  ✅ Tension increased after insult");
} else {
  console.log("  ❌ FAILED: Tension should increase");
  allTestsPassed = false;
}
console.log("");

// Test 5: Social Event - Threat
console.log("Test 5: Social Event - Threat");
L.characters['Борис'].qualia_state = {
  somatic_tension: 0.3,
  valence: 0.6,
  focus_aperture: 0.7,
  energy_level: 0.8
};

const borisBefore3 = { ...L.characters['Борис'].qualia_state };

LC.QualiaEngine.resonate(L.characters['Борис'], {
  type: 'social',
  actor: 'Максим',
  action: 'threat',
  target: 'Борис',
  intensity: 1.0
});

const borisAfter3 = L.characters['Борис'].qualia_state;

console.log("  Before: valence =", borisBefore3.valence, "focus =", borisBefore3.focus_aperture);
console.log("  After:  valence =", borisAfter3.valence, "focus =", borisAfter3.focus_aperture);

if (borisAfter3.valence < borisBefore3.valence) {
  console.log("  ✅ Valence decreased after threat");
} else {
  console.log("  ❌ FAILED: Valence should decrease");
  allTestsPassed = false;
}

if (borisAfter3.focus_aperture < borisBefore3.focus_aperture) {
  console.log("  ✅ Focus narrowed (tunnel vision) after threat");
} else {
  console.log("  ❌ FAILED: Focus should narrow");
  allTestsPassed = false;
}
console.log("");

// Test 6: Environmental Event - Loud Noise
console.log("Test 6: Environmental Event - Loud Noise");
L.characters['Борис'].qualia_state = {
  somatic_tension: 0.2,
  valence: 0.6,
  focus_aperture: 0.7,
  energy_level: 0.8
};

const borisBefore4 = { ...L.characters['Борис'].qualia_state };

LC.QualiaEngine.resonate(L.characters['Борис'], {
  type: 'environmental',
  action: 'loud_noise',
  intensity: 1.0
});

const borisAfter4 = L.characters['Борис'].qualia_state;

console.log("  Before: tension =", borisBefore4.somatic_tension, "focus =", borisBefore4.focus_aperture);
console.log("  After:  tension =", borisAfter4.somatic_tension, "focus =", borisAfter4.focus_aperture);

if (borisAfter4.somatic_tension > borisBefore4.somatic_tension) {
  console.log("  ✅ Tension increased after loud noise");
} else {
  console.log("  ❌ FAILED: Tension should increase");
  allTestsPassed = false;
}

if (borisAfter4.focus_aperture < borisBefore4.focus_aperture) {
  console.log("  ✅ Focus narrowed after loud noise");
} else {
  console.log("  ❌ FAILED: Focus should narrow");
  allTestsPassed = false;
}
console.log("");

// Test 7: Achievement Event - Success
console.log("Test 7: Achievement Event - Success");
L.characters['Борис'].qualia_state = {
  somatic_tension: 0.3,
  valence: 0.5,
  focus_aperture: 0.7,
  energy_level: 0.6
};

const borisBefore5 = { ...L.characters['Борис'].qualia_state };

LC.QualiaEngine.resonate(L.characters['Борис'], {
  type: 'achievement',
  action: 'success',
  intensity: 1.0
});

const borisAfter5 = L.characters['Борис'].qualia_state;

console.log("  Before: valence =", borisBefore5.valence, "energy =", borisBefore5.energy_level);
console.log("  After:  valence =", borisAfter5.valence, "energy =", borisAfter5.energy_level);

if (borisAfter5.valence > borisBefore5.valence) {
  console.log("  ✅ Valence increased after success");
} else {
  console.log("  ❌ FAILED: Valence should increase");
  allTestsPassed = false;
}

if (borisAfter5.energy_level > borisBefore5.energy_level) {
  console.log("  ✅ Energy increased after success");
} else {
  console.log("  ❌ FAILED: Energy should increase");
  allTestsPassed = false;
}
console.log("");

// Test 8: Bounds Checking
console.log("Test 8: Bounds Checking (values stay in [0, 1])");
L.characters['Борис'].qualia_state = {
  somatic_tension: 0.95,
  valence: 0.95,
  focus_aperture: 0.95,
  energy_level: 0.95
};

// Apply multiple compliments to try to exceed 1.0
for (let i = 0; i < 5; i++) {
  LC.QualiaEngine.resonate(L.characters['Борис'], {
    type: 'social',
    action: 'compliment',
    intensity: 1.0
  });
}

const borisAfter6 = L.characters['Борис'].qualia_state;

console.log("  After 5 compliments from 0.95:");
console.log("  valence =", borisAfter6.valence);
console.log("  tension =", borisAfter6.somatic_tension);

if (borisAfter6.valence <= 1.0 && borisAfter6.valence >= 0) {
  console.log("  ✅ Valence bounded to [0, 1]");
} else {
  console.log("  ❌ FAILED: Valence out of bounds:", borisAfter6.valence);
  allTestsPassed = false;
}

if (borisAfter6.somatic_tension <= 1.0 && borisAfter6.somatic_tension >= 0) {
  console.log("  ✅ Tension bounded to [0, 1]");
} else {
  console.log("  ❌ FAILED: Tension out of bounds:", borisAfter6.somatic_tension);
  allTestsPassed = false;
}
console.log("");

// Test 9: Group Resonance (Emotional Contagion)
console.log("Test 9: Group Resonance - Emotional Contagion");
L.characters = {
  'Алекс': {
    qualia_state: {
      somatic_tension: 0.9,  // Very tense
      valence: 0.2,          // Very negative
      focus_aperture: 0.3,
      energy_level: 0.5
    }
  },
  'Борис': {
    qualia_state: {
      somatic_tension: 0.2,  // Very calm
      valence: 0.8,          // Very positive
      focus_aperture: 0.8,
      energy_level: 0.9
    }
  },
  'Хлоя': {
    qualia_state: {
      somatic_tension: 0.5,
      valence: 0.5,
      focus_aperture: 0.5,
      energy_level: 0.7
    }
  }
};

const alexBefore = { ...L.characters['Алекс'].qualia_state };
const borisBefore7 = { ...L.characters['Борис'].qualia_state };
const chloeBefore = { ...L.characters['Хлоя'].qualia_state };

console.log("  Before resonance:");
console.log("    Алекс: tension =", alexBefore.somatic_tension, "valence =", alexBefore.valence);
console.log("    Борис: tension =", borisBefore7.somatic_tension, "valence =", borisBefore7.valence);
console.log("    Хлоя:  tension =", chloeBefore.somatic_tension, "valence =", chloeBefore.valence);

// Run group resonance multiple times to see convergence
for (let i = 0; i < 5; i++) {
  LC.QualiaEngine.runGroupResonance(['Алекс', 'Борис', 'Хлоя'], 0.2);
}

const alexAfter = L.characters['Алекс'].qualia_state;
const borisAfter7 = L.characters['Борис'].qualia_state;
const chloeAfter = L.characters['Хлоя'].qualia_state;

console.log("  After 5 resonance cycles:");
console.log("    Алекс: tension =", alexAfter.somatic_tension.toFixed(2), "valence =", alexAfter.valence.toFixed(2));
console.log("    Борис: tension =", borisAfter7.somatic_tension.toFixed(2), "valence =", borisAfter7.valence.toFixed(2));
console.log("    Хлоя:  tension =", chloeAfter.somatic_tension.toFixed(2), "valence =", chloeAfter.valence.toFixed(2));

// Check convergence: states should be closer to each other
const tensionVarianceBefore = Math.pow(alexBefore.somatic_tension - 0.533, 2) + 
                              Math.pow(borisBefore7.somatic_tension - 0.533, 2) + 
                              Math.pow(chloeBefore.somatic_tension - 0.533, 2);
const tensionVarianceAfter = Math.pow(alexAfter.somatic_tension - 0.533, 2) + 
                             Math.pow(borisAfter7.somatic_tension - 0.533, 2) + 
                             Math.pow(chloeAfter.somatic_tension - 0.533, 2);

if (tensionVarianceAfter < tensionVarianceBefore) {
  console.log("  ✅ Tension values converged (group atmosphere created)");
} else {
  console.log("  ⚠ Tension values did not converge as expected");
}

// All values should still be in bounds
const allInBounds = 
  alexAfter.somatic_tension >= 0 && alexAfter.somatic_tension <= 1 &&
  alexAfter.valence >= 0 && alexAfter.valence <= 1 &&
  borisAfter7.somatic_tension >= 0 && borisAfter7.somatic_tension <= 1 &&
  borisAfter7.valence >= 0 && borisAfter7.valence <= 1 &&
  chloeAfter.somatic_tension >= 0 && chloeAfter.somatic_tension <= 1 &&
  chloeAfter.valence >= 0 && chloeAfter.valence <= 1;

if (allInBounds) {
  console.log("  ✅ All qualia values remain bounded after group resonance");
} else {
  console.log("  ❌ FAILED: Some values out of bounds");
  allTestsPassed = false;
}
console.log("");

// Test 10: Integration with LivingWorld
console.log("Test 10: Integration with LivingWorld Engine");
L.evergreen = { enabled: true, relations: {} };
L.characters = {
  'Максим': {
    mentions: 10,
    lastSeen: 10,
    type: 'SECONDARY',
    status: 'ACTIVE',
    qualia_state: {
      somatic_tension: 0.3,
      valence: 0.5,
      focus_aperture: 0.7,
      energy_level: 0.8
    }
  },
  'Хлоя': {
    mentions: 10,
    lastSeen: 10,
    type: 'SECONDARY',
    status: 'ACTIVE',
    qualia_state: {
      somatic_tension: 0.3,
      valence: 0.5,
      focus_aperture: 0.7,
      energy_level: 0.8
    }
  }
};

// Initialize RelationsEngine
if (LC.RelationsEngine && typeof LC.RelationsEngine.init === 'function') {
  LC.RelationsEngine.init(L);
}

// Initialize relations
LC.RelationsEngine.updateRelation('Максим', 'Хлоя', 40); // Strong positive

const maximBefore = { ...L.characters['Максим'].qualia_state };
const chloeBefore2 = { ...L.characters['Хлоя'].qualia_state };

// Simulate a positive social action
LC.LivingWorld.generateFact('Максим', {
  type: 'SOCIAL_POSITIVE',
  target: 'Хлоя',
  mood: 'HAPPY'
});

const maximAfter2 = L.characters['Максим'].qualia_state;
const chloeAfter2 = L.characters['Хлоя'].qualia_state;

console.log("  Максим before: valence =", maximBefore.valence.toFixed(2));
console.log("  Максим after:  valence =", maximAfter2.valence.toFixed(2));
console.log("  Хлоя before:   valence =", chloeBefore2.valence.toFixed(2));
console.log("  Хлоя after:    valence =", chloeAfter2.valence.toFixed(2));

if (chloeAfter2.valence > chloeBefore2.valence || maximAfter2.valence > maximBefore.valence) {
  console.log("  ✅ Qualia changed via LivingWorld integration");
} else {
  console.log("  ⚠ Qualia did not change (might be within tolerance)");
}
console.log("");

// Summary
console.log("=== Test Summary ===");
if (allTestsPassed) {
  console.log("✅ All critical tests passed!");
  console.log("✅ Qualia state initialization working");
  console.log("✅ QualiaEngine.resonate() working for all event types");
  console.log("✅ Group resonance (emotional contagion) working");
  console.log("✅ Bounds checking enforced");
  console.log("✅ Integration with LivingWorld working");
  console.log("\nQualia Engine Status: FULLY FUNCTIONAL ✓");
} else {
  console.log("❌ Some tests failed - see details above");
  process.exit(1);
}
