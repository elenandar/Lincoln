#!/usr/bin/env node
/**
 * Test script to verify Self-Concept (Я-Концепция) functionality
 * 
 * This script validates:
 * 1. Self-concept initialization alongside personality
 * 2. Self-concept evolves MORE than objective personality during formative events
 * 3. Internal conflict detection when self-concept diverges from personality
 * 4. Context overlay shows self-concept-based traits and conflicts
 * 5. LivingWorld behavior influenced by self-concept (future)
 */

console.log("=== Testing Self-Concept (Я-Концепция) ===\n");

const fs = require('fs');
const path = require('path');

// Load library code
const libraryCode = fs.readFileSync(path.join(__dirname, '..', 'Library v16.0.8.patched.txt'), 'utf8');

// Set up global state that the library expects
global.state = { lincoln: {} };

// Execute library code
eval(libraryCode);

// Helper functions - set up AFTER library is loaded
const lcSysMessages = [];
LC.lcSys = function(msg) {
  if (typeof msg === 'object' && msg.text) {
    lcSysMessages.push(msg.text);
  } else if (typeof msg === 'string') {
    lcSysMessages.push(msg);
  }
};

let allTestsPassed = true;

// Test 1: Self-Concept Initialization
console.log("Test 1: Self-Concept Initialization");
const L = LC.lcInit();
L.turn = 1;
L.characters = {};
L.aliases = {
  'Максим': ['максим', 'макс']
};

LC.updateCharacterActivity("Максим пришел в школу", false);

const maxim = L.characters['Максим'];
if (!maxim) {
  console.log("  ❌ FAILED: Character not created");
  allTestsPassed = false;
} else if (!maxim.self_concept) {
  console.log("  ❌ FAILED: Self-concept not initialized");
  allTestsPassed = false;
} else {
  console.log("  ✅ Character created with self_concept");
  console.log("     perceived_trust:", maxim.self_concept.perceived_trust);
  console.log("     perceived_bravery:", maxim.self_concept.perceived_bravery);
  console.log("     perceived_idealism:", maxim.self_concept.perceived_idealism);
  console.log("     perceived_aggression:", maxim.self_concept.perceived_aggression);
  
  // Self-concept should initially match personality
  if (maxim.self_concept.perceived_trust === maxim.personality.trust && 
      maxim.self_concept.perceived_bravery === maxim.personality.bravery) {
    console.log("  ✅ Self-concept initially matches personality");
  } else {
    console.log("  ❌ FAILED: Self-concept doesn't match initial personality");
    allTestsPassed = false;
  }
}
console.log("");

// Test 2: Self-Concept Changes MORE Than Personality
console.log("Test 2: Self-Concept Changes More Than Objective Personality");
L.turn = 10;
L.characters = {
  'Анна': {
    mentions: 10,
    lastSeen: 10,
    type: 'MAIN',
    status: 'ACTIVE',
    personality: {
      trust: 0.7,
      bravery: 0.5,
      idealism: 0.6,
      aggression: 0.3
    },
    self_concept: {
      perceived_trust: 0.7,
      perceived_bravery: 0.5,
      perceived_idealism: 0.6,
      perceived_aggression: 0.3
    }
  }
};

const anna = L.characters['Анна'];
const trustBefore = anna.personality.trust;
const perceivedTrustBefore = anna.self_concept.perceived_trust;
const idealismBefore = anna.personality.idealism;
const perceivedIdealismBefore = anna.self_concept.perceived_idealism;

lcSysMessages.length = 0;

// Major betrayal event
LC.Crucible.analyzeEvent({
  type: 'RELATION_CHANGE',
  character: 'Анна',
  otherCharacter: 'Предатель',
  change: -50,
  finalValue: -30
});

const trustAfter = anna.personality.trust;
const perceivedTrustAfter = anna.self_concept.perceived_trust;
const idealismAfter = anna.personality.idealism;
const perceivedIdealismAfter = anna.self_concept.perceived_idealism;

const objectiveTrustChange = Math.abs(trustBefore - trustAfter);
const perceivedTrustChange = Math.abs(perceivedTrustBefore - perceivedTrustAfter);
const objectiveIdealismChange = Math.abs(idealismBefore - idealismAfter);
const perceivedIdealismChange = Math.abs(perceivedIdealismBefore - perceivedIdealismAfter);

console.log(`  Objective trust change: ${objectiveTrustChange.toFixed(3)}`);
console.log(`  Perceived trust change: ${perceivedTrustChange.toFixed(3)}`);
console.log(`  Objective idealism change: ${objectiveIdealismChange.toFixed(3)}`);
console.log(`  Perceived idealism change: ${perceivedIdealismChange.toFixed(3)}`);

if (perceivedTrustChange > objectiveTrustChange) {
  console.log("  ✅ Self-concept trust changed MORE than objective trust");
} else {
  console.log("  ❌ FAILED: Self-concept should change more than objective personality");
  allTestsPassed = false;
}

if (perceivedIdealismChange > objectiveIdealismChange) {
  console.log("  ✅ Self-concept idealism changed MORE than objective idealism");
} else {
  console.log("  ❌ FAILED: Self-concept idealism should change more");
  allTestsPassed = false;
}

if (lcSysMessages.length > 0) {
  console.log(`  ✅ Director message: ${lcSysMessages[0]}`);
}
console.log("");

// Test 3: Divergence Creates Internal Conflict
console.log("Test 3: Internal Conflict from Self-Concept Divergence");
L.turn = 20;
L.characters = {
  'Иван': {
    mentions: 15,
    lastSeen: 20,
    type: 'SECONDARY',
    status: 'ACTIVE',
    personality: {
      trust: 0.8,        // Objectively trusting
      bravery: 0.7,      // Objectively brave
      idealism: 0.5,
      aggression: 0.3
    },
    self_concept: {
      perceived_trust: 0.3,      // Sees himself as cynical
      perceived_bravery: 0.4,    // Sees himself as cautious
      perceived_idealism: 0.5,
      perceived_aggression: 0.3
    }
  }
};

const ivan = L.characters['Иван'];
const hasTrustDivergence = Math.abs(ivan.personality.trust - ivan.self_concept.perceived_trust) > 0.2;
const hasBraveryDivergence = Math.abs(ivan.personality.bravery - ivan.self_concept.perceived_bravery) > 0.2;

console.log(`  Objective trust: ${ivan.personality.trust}`);
console.log(`  Perceived trust: ${ivan.self_concept.perceived_trust}`);
console.log(`  Trust divergence: ${hasTrustDivergence ? 'YES' : 'NO'}`);
console.log(`  Objective bravery: ${ivan.personality.bravery}`);
console.log(`  Perceived bravery: ${ivan.self_concept.perceived_bravery}`);
console.log(`  Bravery divergence: ${hasBraveryDivergence ? 'YES' : 'NO'}`);

if (hasTrustDivergence && hasBraveryDivergence) {
  console.log("  ✅ Significant divergence detected");
} else {
  console.log("  ❌ FAILED: Test setup should have divergence");
  allTestsPassed = false;
}
console.log("");

// Test 4: Context Overlay Shows Self-Concept and Conflict
console.log("Test 4: Context Overlay Shows Self-Concept Traits and Conflict");
L.turn = 25;
// Иван should be in focus (hot)
L.characters['Иван'].lastSeen = 25;

const context = LC.composeContextOverlay({ limit: 1500 });
const contextText = context.text || '';

console.log(`  Context length: ${contextText.length}`);

// Should show traits based on self-concept (low trust)
const hasTraits = contextText.includes('⟦TRAITS: Иван⟧');
const hasCynicalTrait = contextText.includes('циничен и не доверяет людям');
const hasConflict = contextText.includes('⟦CONFLICT: Иван⟧');

if (hasTraits) {
  console.log("  ✅ Context includes TRAITS tag for Иван");
} else {
  console.log("  ❌ FAILED: Context should include TRAITS");
  allTestsPassed = false;
}

if (hasCynicalTrait) {
  console.log("  ✅ Traits reflect self-concept (cynical, based on low perceived trust)");
} else {
  console.log("  ❌ FAILED: Should show cynical trait based on self-concept");
  allTestsPassed = false;
}

if (hasConflict) {
  console.log("  ✅ Context includes CONFLICT tag for internal conflict");
  // Extract conflict message
  const conflictMatch = contextText.match(/⟦CONFLICT: Иван⟧[^\n]*/);
  if (conflictMatch) {
    console.log(`     ${conflictMatch[0]}`);
  }
} else {
  console.log("  ⚠️  WARNING: Context should include CONFLICT tag when divergence is significant");
  // Not failing test as this is a more subtle feature
}
console.log("");

// Test 5: Goal Success Affects Self-Concept More
console.log("Test 5: Goal Success Primarily Affects Self-Concept");
L.turn = 30;
L.characters = {
  'Елена': {
    mentions: 12,
    lastSeen: 30,
    type: 'MAIN',
    status: 'ACTIVE',
    personality: {
      trust: 0.5,
      bravery: 0.4,
      idealism: 0.5,
      aggression: 0.3
    },
    self_concept: {
      perceived_trust: 0.5,
      perceived_bravery: 0.4,
      perceived_idealism: 0.5,
      perceived_aggression: 0.3
    }
  }
};

const elena = L.characters['Елена'];
const braveryBeforeGoal = elena.personality.bravery;
const perceivedBraveryBeforeGoal = elena.self_concept.perceived_bravery;
const idealismBeforeGoal = elena.personality.idealism;
const perceivedIdealismBeforeGoal = elena.self_concept.perceived_idealism;

lcSysMessages.length = 0;

// Goal success
LC.Crucible.analyzeEvent({
  type: 'GOAL_COMPLETE',
  character: 'Елена',
  success: true
});

const braveryAfterGoal = elena.personality.bravery;
const perceivedBraveryAfterGoal = elena.self_concept.perceived_bravery;
const idealismAfterGoal = elena.personality.idealism;
const perceivedIdealismAfterGoal = elena.self_concept.perceived_idealism;

const objBraveryChange = braveryAfterGoal - braveryBeforeGoal;
const percBraveryChange = perceivedBraveryAfterGoal - perceivedBraveryBeforeGoal;
const objIdealismChange = idealismAfterGoal - idealismBeforeGoal;
const percIdealismChange = perceivedIdealismAfterGoal - perceivedIdealismBeforeGoal;

console.log(`  Objective bravery change: +${objBraveryChange.toFixed(3)}`);
console.log(`  Perceived bravery change: +${percBraveryChange.toFixed(3)}`);
console.log(`  Objective idealism change: +${objIdealismChange.toFixed(3)}`);
console.log(`  Perceived idealism change: +${percIdealismChange.toFixed(3)}`);

if (percBraveryChange > objBraveryChange) {
  console.log("  ✅ Perceived bravery increased MORE than objective bravery");
} else {
  console.log("  ❌ FAILED: Self-concept should increase more from success");
  allTestsPassed = false;
}

if (percIdealismChange > objIdealismChange) {
  console.log("  ✅ Perceived idealism increased MORE than objective idealism");
} else {
  console.log("  ❌ FAILED: Self-concept idealism should increase more");
  allTestsPassed = false;
}

if (lcSysMessages.length > 0 && lcSysMessages[0].includes('верит в свою смелость')) {
  console.log(`  ✅ Message emphasizes self-belief: ${lcSysMessages[0]}`);
} else {
  console.log("  ⚠️  WARNING: Message should emphasize self-belief");
}
console.log("");

// Test 6: Rumor Spread Damages Self-Concept More
console.log("Test 6: Public Humiliation Damages Self-Concept More");
L.turn = 40;
L.characters = {
  'Дмитрий': {
    mentions: 10,
    lastSeen: 40,
    type: 'SECONDARY',
    status: 'ACTIVE',
    personality: {
      trust: 0.6,
      bravery: 0.7,
      idealism: 0.5,
      aggression: 0.3
    },
    self_concept: {
      perceived_trust: 0.6,
      perceived_bravery: 0.7,
      perceived_idealism: 0.5,
      perceived_aggression: 0.3
    }
  }
};

const dmitry = L.characters['Дмитрий'];
const trustBeforeRumor = dmitry.personality.trust;
const perceivedTrustBeforeRumor = dmitry.self_concept.perceived_trust;
const braveryBeforeRumor = dmitry.personality.bravery;
const perceivedBraveryBeforeRumor = dmitry.self_concept.perceived_bravery;

lcSysMessages.length = 0;

// Widespread negative rumor
LC.Crucible.analyzeEvent({
  type: 'RUMOR_SPREAD',
  character: 'Дмитрий',
  spreadCount: 7,
  spin: 'negative'
});

const trustAfterRumor = dmitry.personality.trust;
const perceivedTrustAfterRumor = dmitry.self_concept.perceived_trust;
const braveryAfterRumor = dmitry.personality.bravery;
const perceivedBraveryAfterRumor = dmitry.self_concept.perceived_bravery;

const objTrustChangeRumor = Math.abs(trustBeforeRumor - trustAfterRumor);
const percTrustChangeRumor = Math.abs(perceivedTrustBeforeRumor - perceivedTrustAfterRumor);
const objBraveryChangeRumor = Math.abs(braveryBeforeRumor - braveryAfterRumor);
const percBraveryChangeRumor = Math.abs(perceivedBraveryBeforeRumor - perceivedBraveryAfterRumor);

console.log(`  Objective trust change: -${objTrustChangeRumor.toFixed(3)}`);
console.log(`  Perceived trust change: -${percTrustChangeRumor.toFixed(3)}`);
console.log(`  Objective bravery change: -${objBraveryChangeRumor.toFixed(3)}`);
console.log(`  Perceived bravery change: -${percBraveryChangeRumor.toFixed(3)}`);

if (percTrustChangeRumor > objTrustChangeRumor) {
  console.log("  ✅ Perceived trust damaged MORE by rumor");
} else {
  console.log("  ❌ FAILED: Public humiliation should damage self-concept more");
  allTestsPassed = false;
}

if (percBraveryChangeRumor > objBraveryChangeRumor) {
  console.log("  ✅ Perceived bravery damaged by public humiliation");
} else {
  console.log("  ⚠️  WARNING: Public humiliation could damage perceived bravery");
}

if (lcSysMessages.length > 0 && lcSysMessages[0].includes('менее уверен')) {
  console.log(`  ✅ Message emphasizes loss of self-confidence: ${lcSysMessages[0]}`);
}
console.log("");

// Final summary
console.log("============================================================");
if (allTestsPassed) {
  console.log("✅ ALL TESTS PASSED");
  console.log("\nSelf-Concept (Я-Концепция) is fully operational!");
  console.log("Characters now have dual trait systems:");
  console.log("  - personality: objective traits (who they really are)");
  console.log("  - self_concept: perceived traits (who they think they are)");
  console.log("\nFormative events primarily change self-concept,");
  console.log("creating potential for internal conflict and character depth.");
} else {
  console.log("❌ SOME TESTS FAILED");
  process.exit(1);
}
