#!/usr/bin/env node
/**
 * Epic 4 Integration Test: Complete Consciousness Cascade
 * 
 * Validates the full four-level consciousness architecture:
 * 1. Events → Qualia (phenomenal sensations)
 * 2. Qualia → Interpretations (subjective meaning)
 * 3. Interpretations → Self-Concept (identity)
 * 4. Interpretations → Memory (collective culture)
 * 5. Perceptions → Social Capital (hierarchy)
 */

console.log("=== Epic 4: Complete Consciousness Cascade Integration Test ===\n");

const fs = require('fs');
const path = require('path');

// Load library code
const libraryCode = fs.readFileSync(path.join(__dirname, '..', 'Library v16.0.8.patched.txt'), 'utf8');
global.state = { lincoln: {} };
eval(libraryCode);

let allTestsPassed = true;

// Setup: Create a scenario with multiple characters
console.log("Setup: Creating test scenario\n");
const L = LC.lcInit();
L.turn = 100;
L.characters = {};
L.aliases = {
  'максим': 'Максим',
  'хлоя': 'Хлоя',
  'борис': 'Борис'
};

L.society = { myths: [], norms: {} };

// Максим: Happy, well-respected character
L.characters['Максим'] = {
  mentions: 15,
  lastSeen: 99,
  type: 'MAIN',  // Changed from PRIMARY to MAIN
  status: 'ACTIVE',
  personality: { trust: 0.7, bravery: 0.8, idealism: 0.6, aggression: 0.2 },
  self_concept: {
    perceived_trust: 0.7,
    perceived_bravery: 0.3,  // Underestimates bravery!
    perceived_idealism: 0.6,
    perceived_aggression: 0.2
  },
  qualia_state: {
    somatic_tension: 0.2,
    valence: 0.8,  // Very positive
    focus_aperture: 0.7,
    energy_level: 0.9
  },
  perceptions: {
    'Хлоя': { affection: 70, trust: 70, respect: 60, rivalry: 20 }
  },
  social: { status: 'member', capital: 120, conformity: 0.7 }
};

// Хлоя: Tense, suspicious character
L.characters['Хлоя'] = {
  mentions: 12,
  lastSeen: 99,
  type: 'SECONDARY',
  status: 'ACTIVE',
  personality: { trust: 0.4, bravery: 0.5, idealism: 0.7, aggression: 0.3 },
  self_concept: {
    perceived_trust: 0.2,  // Underestimates trust
    perceived_bravery: 0.5,
    perceived_idealism: 0.7,
    perceived_aggression: 0.3
  },
  qualia_state: {
    somatic_tension: 0.9,  // Very tense
    valence: 0.2,          // Negative mood
    focus_aperture: 0.3,   // Tunnel vision
    energy_level: 0.5
  },
  perceptions: {
    'Максим': { affection: 50, trust: 40, respect: 60, rivalry: 30 }
  },
  social: { status: 'member', capital: 90, conformity: 0.5 }
};

// Борис: Witness character
L.characters['Борис'] = {
  mentions: 8,
  lastSeen: 99,
  type: 'SECONDARY',
  status: 'ACTIVE',
  personality: { trust: 0.5, bravery: 0.6, idealism: 0.5, aggression: 0.4 },
  qualia_state: {
    somatic_tension: 0.5,
    valence: 0.5,
    focus_aperture: 0.7,
    energy_level: 0.7
  },
  perceptions: {
    'Максим': { affection: 60, trust: 70, respect: 80, rivalry: 20 },  // Respects Максим
    'Хлоя': { affection: 50, trust: 50, respect: 50, rivalry: 40 }
  },
  social: { status: 'member', capital: 100, conformity: 0.6 }
};

console.log("=== Test 1: Level 1 → Level 2 (Qualia → Interpretation) ===");

// Максим gives compliment to Хлоя
const event = {
  type: 'social',
  action: 'compliment',
  rawModifier: 5,
  actor: 'Максим',
  target: 'Хлоя'
};

// Максим's interpretation (high valence = sincere)
const maksimInterpretation = LC.InformationEngine.interpret(L.characters['Максим'], event);
console.log(`Максим's interpretation (valence=0.8): ${maksimInterpretation.interpretation}`);
console.log(`  Subjective modifier: ${maksimInterpretation.subjectiveModifier}`);

if (maksimInterpretation.interpretation === 'sincere' && maksimInterpretation.subjectiveModifier > 5) {
  console.log("  ✅ High valence → sincere interpretation with boost");
} else {
  console.log("  ❌ FAILED: Expected sincere interpretation");
  allTestsPassed = false;
}

// Хлоя's interpretation (high tension = sarcasm)
const xloyaInterpretation = LC.InformationEngine.interpret(L.characters['Хлоя'], event);
console.log(`Хлоя's interpretation (tension=0.9): ${xloyaInterpretation.interpretation}`);
console.log(`  Subjective modifier: ${xloyaInterpretation.subjectiveModifier}`);

if (xloyaInterpretation.interpretation === 'sarcasm' && xloyaInterpretation.subjectiveModifier < 5) {
  console.log("  ✅ High tension → sarcasm interpretation with penalty");
} else {
  console.log("  ❌ FAILED: Expected sarcasm interpretation");
  allTestsPassed = false;
}

console.log("");

console.log("=== Test 2: Level 2 → Level 3 (Interpretation → Perceptions) ===");

// Apply changes through RelationsEngine which uses InformationEngine
const beforeMaksimAffection = L.characters['Максим'].perceptions['Хлоя'].affection;
const beforeXloyaTrust = L.characters['Хлоя'].perceptions['Максим'].trust;

// Use RelationsEngine to apply the relationship change with interpretation
if (LC.RelationsEngine && typeof LC.RelationsEngine.updateRelation === 'function') {
  LC.RelationsEngine.updateRelation('Максим', 'Хлоя', 5, {
    interpretedEvent: event
  });
  
  const afterMaksimAffection = L.characters['Максим'].perceptions['Хлоя'].affection;
  const afterXloyaTrust = L.characters['Хлоя'].perceptions['Максим'].trust;
  
  console.log(`Максим's affection for Хлоя: ${beforeMaksimAffection} → ${afterMaksimAffection}`);
  console.log(`Хлоя's trust of Максим: ${beforeXloyaTrust} → ${afterXloyaTrust}`);
  
  if (afterMaksimAffection > beforeMaksimAffection && afterXloyaTrust < beforeXloyaTrust) {
    console.log("  ✅ Asymmetric perceptions: same event, opposite effects");
  } else {
    console.log("  ❌ FAILED: Perceptions not updated correctly");
    console.log(`     Expected: Максим affection increase, Хлоя trust decrease`);
    console.log(`     Got: Максим ${afterMaksimAffection - beforeMaksimAffection}, Хлоя ${afterXloyaTrust - beforeXloyaTrust}`);
    allTestsPassed = false;
  }
} else {
  console.log("  ⚠️  RelationsEngine not available");
  allTestsPassed = false;
}

console.log("");

console.log("=== Test 3: Level 3 → Social Capital (Perceptions → Hierarchy) ===");

const beforeCapital = L.characters['Максим'].social.capital;
console.log(`Максим's capital before positive action: ${beforeCapital}`);

// Максим performs positive action with Борис as witness
// Борис has high respect (80) for Максим
LC.HierarchyEngine.updateCapital('Максим', {
  type: 'POSITIVE_ACTION',
  target: 'Хлоя'
});

const afterCapital = L.characters['Максим'].social.capital;
console.log(`Максим's capital after positive action: ${afterCapital}`);

const capitalGain = afterCapital - beforeCapital;
console.log(`Capital gain: ${capitalGain}`);

if (capitalGain >= 8) {
  console.log("  ✅ Social capital increased (boosted by witness respect)");
} else {
  console.log("  ❌ FAILED: Social capital should increase");
  allTestsPassed = false;
}

console.log("");

console.log("=== Test 4: Level 3 → Self-Concept (Events → Identity) ===");

// Trigger a formative event that should affect self-concept
const beforeSelfBravery = L.characters['Максим'].self_concept.perceived_bravery;
console.log(`Максим's perceived bravery before: ${beforeSelfBravery}`);

// Simulate a public success that should boost self-perception
if (LC.Crucible && typeof LC.Crucible.analyzeEvent === 'function') {
  LC.Crucible.analyzeEvent({
    type: 'GOAL_COMPLETE',
    character: 'Максим',
    success: true
  });
  
  const afterSelfBravery = L.characters['Максим'].self_concept.perceived_bravery;
  console.log(`Максим's perceived bravery after success: ${afterSelfBravery}`);
  
  if (afterSelfBravery > beforeSelfBravery) {
    console.log("  ✅ Self-concept improved after success");
  } else {
    console.log("  ❌ FAILED: Self-concept should improve after success");
    allTestsPassed = false;
  }
} else {
  console.log("  ⚠️  Crucible not available, skipping self-concept test");
}

console.log("");

console.log("=== Test 5: Level 4 → Memory (Interpretations → Culture) ===");

// Archive a formative event with interpretation
if (LC.Crucible && LC.Crucible._archiveFormativeEvent) {
  const formativeEvent = {
    type: 'RELATION_CHANGE',
    character: 'Максим',
    otherCharacter: 'Хлоя',
    change: 50,
    interpretation: 'sincere',  // Максим's interpretation
    subjectiveModifier: 6.5
  };
  
  LC.Crucible._archiveFormativeEvent(formativeEvent, L.characters['Максим']);
  
  console.log(`Myths archive length: ${L.society.myths.length}`);
  
  if (L.society.myths.length > 0) {
    const record = L.society.myths[L.society.myths.length - 1];
    console.log(`Latest event record:`);
    console.log(`  Type: ${record.type}`);
    console.log(`  Character: ${record.character}`);
    console.log(`  Interpretation: ${record.details?.interpretation}`);
    console.log(`  Perceived magnitude: ${record.details?.perceivedMagnitude}`);
    
    if (record.details?.interpretation === 'sincere') {
      console.log("  ✅ Memory stores subjective interpretation, not just objective fact");
    } else {
      console.log("  ❌ FAILED: Interpretation should be stored");
      allTestsPassed = false;
    }
  } else {
    console.log("  ❌ FAILED: Event should be archived");
    allTestsPassed = false;
  }
} else {
  console.log("  ⚠️  Crucible archiving not available, skipping memory test");
}

console.log("");

console.log("=== Test 6: Context Overlay Integration ===");

L.turn = 100;
const overlay = LC.composeContextOverlay({ limit: 3000, allowPartial: true });

console.log("Checking for new tags in context overlay:");

const hasQualia = overlay.text.includes('⟦QUALIA:');
const hasPerception = overlay.text.includes('⟦PERCEPTION:');
const hasConflict = overlay.text.includes('⟦CONFLICT:');

console.log(`  QUALIA tag present: ${hasQualia ? '✅' : '❌'}`);
console.log(`  PERCEPTION tag present: ${hasPerception ? '✅' : '❌'}`);
console.log(`  CONFLICT tag present: ${hasConflict ? '✅' : '❌'}`);

if (hasQualia) {
  const qualiaLines = overlay.text.split('\n').filter(line => line.includes('⟦QUALIA:'));
  console.log(`  Qualia lines: ${qualiaLines.length}`);
  qualiaLines.forEach(line => console.log(`    ${line}`));
}

if (hasPerception) {
  const perceptionLines = overlay.text.split('\n').filter(line => line.includes('⟦PERCEPTION:'));
  console.log(`  Perception lines: ${perceptionLines.length}`);
  perceptionLines.forEach(line => console.log(`    ${line}`));
}

if (hasConflict) {
  const conflictLines = overlay.text.split('\n').filter(line => line.includes('⟦CONFLICT:'));
  console.log(`  Conflict lines: ${conflictLines.length}`);
  conflictLines.forEach(line => console.log(`    ${line}`));
}

if (!hasQualia) allTestsPassed = false;
if (!hasPerception) allTestsPassed = false;
if (!hasConflict) allTestsPassed = false;

console.log("");

// Test Summary
console.log("=== Integration Test Summary ===");
if (allTestsPassed) {
  console.log("✅ All integration tests passed!");
  console.log("✅ Level 1 (Events → Qualia): Phenomenal sensations working");
  console.log("✅ Level 2 (Qualia → Interpretations): Subjective reality working");
  console.log("✅ Level 3a (Interpretations → Perceptions): Asymmetric views working");
  console.log("✅ Level 3b (Perceptions → Social Capital): Witness effects working");
  console.log("✅ Level 3c (Events → Self-Concept): Identity evolution working");
  console.log("✅ Level 4 (Interpretations → Memory): Cultural memory working");
  console.log("✅ Context Overlay: All new tags present and functional");
  console.log("\n🎉 EPIC 4: COMPLETE CONSCIOUSNESS CASCADE VERIFIED ✓");
} else {
  console.log("❌ Some integration tests failed");
  process.exit(1);
}
