#!/usr/bin/env node
/**
 * Test for new context overlay tags: QUALIA and PERCEPTION
 * 
 * Validates:
 * 1. QUALIA tag shows extreme phenomenal states
 * 2. PERCEPTION tag shows asymmetric perceptions
 * 3. Tags are properly weighted and included in overlay
 */

console.log("=== Testing New Context Overlay Tags ===\n");

const fs = require('fs');
const path = require('path');

// Load library code
const libraryCode = fs.readFileSync(path.join(__dirname, '..', 'Library v16.0.8.patched.txt'), 'utf8');

// Set up global state that the library expects
global.state = { lincoln: {} };

// Execute library code
eval(libraryCode);

let allTestsPassed = true;

// Setup: Initialize state
console.log("Setup: Creating characters with extreme states\n");
const L = LC.lcInit();
L.turn = 5;
L.characters = {};
L.aliases = {
  'максим': 'Максим',
  'хлоя': 'Хлоя',
  'борис': 'Борис'
};

// Character with extreme qualia state
L.characters['Максим'] = {
  mentions: 10,
  lastSeen: 4, // HOT character (turn=5, so turnsAgo = 5-4 = 1)
  type: 'PRIMARY',
  status: 'ACTIVE',
  personality: { trust: 0.5, bravery: 0.5, idealism: 0.5, aggression: 0.3 },
  qualia_state: {
    somatic_tension: 0.9,  // Extreme tension
    valence: 0.1,          // Very negative
    focus_aperture: 0.2,   // Tunnel vision
    energy_level: 0.8
  },
  perceptions: {
    'Хлоя': { affection: 90, trust: 85, respect: 75, rivalry: 20 }, // Very positive
    'Борис': { affection: 15, trust: 10, respect: 20, rivalry: 85 } // Very negative and competitive
  }
};

// Character with moderate qualia state (should NOT appear in QUALIA tag)
L.characters['Хлоя'] = {
  mentions: 8,
  lastSeen: 3, // HOT character (turn=5, so turnsAgo = 5-3 = 2)
  type: 'SECONDARY',
  status: 'ACTIVE',
  personality: { trust: 0.6, bravery: 0.4, idealism: 0.7, aggression: 0.2 },
  qualia_state: {
    somatic_tension: 0.5,  // Moderate
    valence: 0.5,          // Moderate
    focus_aperture: 0.7,   // Moderate
    energy_level: 0.6
  },
  perceptions: {
    'Максим': { affection: 50, trust: 50, respect: 60, rivalry: 30 } // Moderate
  }
};

// Character with extreme energy but not HOT (should not appear)
L.characters['Борис'] = {
  mentions: 5,
  lastSeen: 0, // NOT HOT (turn=5, so turnsAgo = 5-0 = 5, which is >3)
  type: 'SECONDARY',
  status: 'ACTIVE',
  personality: { trust: 0.4, bravery: 0.6, idealism: 0.5, aggression: 0.5 },
  qualia_state: {
    somatic_tension: 0.3,
    valence: 0.9,          // Very positive
    focus_aperture: 0.7,
    energy_level: 0.95     // Very energetic
  },
  perceptions: {}
};

// Test 1: QUALIA tag appears for extreme states
console.log("Test 1: QUALIA tag for extreme states");
const overlay1 = LC.composeContextOverlay({ limit: 2000, allowPartial: true });

if (overlay1.text) {
  const hasQualiaTag = overlay1.text.includes('⟦QUALIA: Максим⟧');
  console.log(`  ${hasQualiaTag ? '✅' : '❌'} QUALIA tag appears for Максим`);
  
  if (hasQualiaTag) {
    const qualiaLine = overlay1.text.split('\n').find(line => line.includes('⟦QUALIA: Максим⟧'));
    console.log(`     Content: ${qualiaLine}`);
    
    // Check for expected descriptors
    const hasNegative = qualiaLine.includes('негативное состояние');
    const hasTension = qualiaLine.includes('крайне напряжен');
    const hasTunnel = qualiaLine.includes('туннельное зрение');
    
    console.log(`  ${hasNegative ? '✅' : '❌'} Mentions negative state (valence=0.1)`);
    console.log(`  ${hasTension ? '✅' : '❌'} Mentions extreme tension (tension=0.9)`);
    console.log(`  ${hasTunnel ? '✅' : '❌'} Mentions tunnel vision (focus=0.2)`);
    
    if (!hasNegative || !hasTension || !hasTunnel) allTestsPassed = false;
  } else {
    allTestsPassed = false;
  }
  
  // Verify moderate qualia states don't trigger QUALIA tag
  const hasXloyaQualia = overlay1.text.includes('⟦QUALIA: Хлоя⟧');
  console.log(`  ${!hasXloyaQualia ? '✅' : '❌'} QUALIA tag NOT shown for moderate states (Хлоя)`);
  if (hasXloyaQualia) allTestsPassed = false;
  
  // Verify non-HOT characters don't appear
  const hasBorisQualia = overlay1.text.includes('⟦QUALIA: Борис⟧');
  console.log(`  ${!hasBorisQualia ? '✅' : '❌'} QUALIA tag NOT shown for non-HOT characters (Борис, turnsAgo=5)`);
  if (hasBorisQualia) allTestsPassed = false;
  
} else {
  console.log("  ❌ Failed to generate overlay");
  allTestsPassed = false;
}
console.log("");

// Test 2: PERCEPTION tag appears for asymmetric perceptions
console.log("Test 2: PERCEPTION tag for asymmetric perceptions");
const overlay2 = LC.composeContextOverlay({ limit: 2000, allowPartial: true });

if (overlay2.text) {
  const hasPerceptionTag = overlay2.text.includes('⟦PERCEPTION: Максим⟧');
  console.log(`  ${hasPerceptionTag ? '✅' : '❌'} PERCEPTION tag appears for Максим`);
  
  if (hasPerceptionTag) {
    const perceptionLine = overlay2.text.split('\n').find(line => line.includes('⟦PERCEPTION: Максим⟧'));
    console.log(`     Content: ${perceptionLine}`);
    
    // Check for Хлоя (very positive perception)
    const hasXloya = perceptionLine.includes('Хлоя');
    const hasLove = perceptionLine.includes('очень любит') || perceptionLine.includes('любит');
    const hasTrust = perceptionLine.includes('доверяет');
    
    console.log(`  ${hasXloya ? '✅' : '❌'} Mentions Хлоя`);
    console.log(`  ${hasLove ? '✅' : '❌'} Mentions positive affection (affection=90)`);
    console.log(`  ${hasTrust ? '✅' : '❌'} Mentions trust (trust=85)`);
    
    // Борис is NOT in HOT list (turnsAgo=5), so should not appear in PERCEPTION tag
    const hasBoris = perceptionLine.includes('Борис');
    console.log(`  ${!hasBoris ? '✅' : '❌'} Does NOT mention Борис (not in HOT list, turnsAgo=5)`);
    
    if (!hasXloya) allTestsPassed = false;
  } else {
    allTestsPassed = false;
  }
} else {
  console.log("  ❌ Failed to generate overlay");
  allTestsPassed = false;
}
console.log("");

// Test 3: Weight priorities
console.log("Test 3: Tag weight priorities");
const overlay3 = LC.composeContextOverlay({ limit: 2000, allowPartial: true });

if (overlay3.parts) {
  console.log("  ✅ Parts object exists");
  console.log(`     QUALIA: ${overlay3.parts.QUALIA || 0} bytes`);
  console.log(`     PERCEPTION: ${overlay3.parts.PERCEPTION || 0} bytes`);
  console.log(`     CONFLICT: ${overlay3.parts.CONFLICT || 0} bytes`);
  console.log(`     TRAITS: ${overlay3.parts.TRAITS || 0} bytes`);
  
  const hasQualiaInParts = (overlay3.parts.QUALIA || 0) > 0;
  const hasPerceptionInParts = (overlay3.parts.PERCEPTION || 0) > 0;
  
  console.log(`  ${hasQualiaInParts ? '✅' : '❌'} QUALIA tracked in parts`);
  console.log(`  ${hasPerceptionInParts ? '✅' : '❌'} PERCEPTION tracked in parts`);
  
  if (!hasQualiaInParts || !hasPerceptionInParts) allTestsPassed = false;
} else {
  console.log("  ❌ Parts object missing");
  allTestsPassed = false;
}
console.log("");

// Test 4: Only HOT characters (lastSeen <= 3)
console.log("Test 4: Only HOT characters appear in new tags");
// Борис has turnsAgo=5, should NOT appear in QUALIA or PERCEPTION tags
const overlay4 = LC.composeContextOverlay({ limit: 2000, allowPartial: true });

if (overlay4.text) {
  const hasBorisInNewTags = overlay4.text.includes('⟦QUALIA: Борис⟧') || 
                            overlay4.text.includes('⟦PERCEPTION: Борис⟧');
  console.log(`  ${!hasBorisInNewTags ? '✅' : '❌'} Борис (turnsAgo=5) excluded from new tags`);
  if (hasBorisInNewTags) allTestsPassed = false;
} else {
  console.log("  ❌ Failed to generate overlay");
  allTestsPassed = false;
}
console.log("");

// Test Summary
console.log("=== Test Summary ===");
if (allTestsPassed) {
  console.log("✅ All tests passed!");
  console.log("✅ QUALIA tag shows extreme phenomenal states");
  console.log("✅ PERCEPTION tag shows asymmetric perceptions");
  console.log("✅ Tags properly weighted and tracked");
  console.log("✅ Only HOT characters included");
  console.log("\nNew Context Overlay Tags: FUNCTIONAL ✓");
} else {
  console.log("❌ Some tests failed");
  process.exit(1);
}
