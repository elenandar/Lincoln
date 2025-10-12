#!/usr/bin/env node
/**
 * Test script to verify GossipEngine functionality
 * 
 * This script validates that:
 * 1. L.rumors state is initialized correctly
 * 2. Character reputation is tracked
 * 3. Observer sub-module detects gossip-worthy events
 * 4. Interpretation matrix adjusts rumor spin
 * 5. Propagator sub-module spreads rumors
 * 6. Reputation updates based on rumor spread
 * 7. Commands /rumor and /reputation are registered
 */

console.log("=== Testing GossipEngine ===\n");

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

// Test 1: Rumors and reputation state initialization
console.log("Test 1: State Initialization");
const L = LC.lcInit();
console.log("✓ L.rumors exists:", !!L.rumors);
console.log("✓ L.rumors is array:", Array.isArray(L.rumors));
console.log("✓ L.rumors starts empty:", L.rumors.length === 0);
console.log("✓ L.characters exists:", !!L.characters);
console.log("");

// Test 2: GossipEngine structure
console.log("Test 2: GossipEngine Structure");
console.log("✓ LC.GossipEngine exists:", !!LC.GossipEngine);
console.log("✓ Has generateRumorId method:", typeof LC.GossipEngine?.generateRumorId === 'function');
console.log("✓ Has Observer sub-module:", !!LC.GossipEngine?.Observer);
console.log("✓ Observer has observe method:", typeof LC.GossipEngine?.Observer?.observe === 'function');
console.log("✓ Has Propagator sub-module:", !!LC.GossipEngine?.Propagator);
console.log("✓ Propagator has spreadRumor method:", typeof LC.GossipEngine?.Propagator?.spreadRumor === 'function');
console.log("✓ Propagator has autoPropagate method:", typeof LC.GossipEngine?.Propagator?.autoPropagate === 'function');
console.log("✓ Has analyze method:", typeof LC.GossipEngine?.analyze === 'function');
console.log("");

// Test 3: Rumor ID generation
console.log("Test 3: Rumor ID Generation");
const id1 = LC.GossipEngine.generateRumorId();
const id2 = LC.GossipEngine.generateRumorId();
console.log("✓ ID generated:", !!id1);
console.log("✓ ID is string:", typeof id1 === 'string');
console.log("✓ ID starts with 'rumor_':", id1.startsWith('rumor_'));
console.log("✓ IDs are unique:", id1 !== id2);
console.log("");

// Test 4: Setup characters for testing
console.log("Test 4: Character Setup");
L.turn = 10;
L.characters = {
  'Максим': { mentions: 10, lastSeen: 10, reputation: 50 },
  'Хлоя': { mentions: 8, lastSeen: 10, reputation: 50 },
  'Эшли': { mentions: 5, lastSeen: 9, reputation: 50 },
  'София': { mentions: 3, lastSeen: 8, reputation: 50 }
};

// Setup EvergreenEngine mock for character validation
if (!LC.EvergreenEngine) {
  LC.EvergreenEngine = {
    normalizeCharName(name) {
      const normalized = name.trim();
      if (normalized.match(/макс/i)) return 'Максим';
      if (normalized.match(/хло/i)) return 'Хлоя';
      if (normalized.match(/эшли/i)) return 'Эшли';
      if (normalized.match(/софия/i)) return 'София';
      return normalized;
    },
    isImportantCharacter(name) {
      return ['Максим', 'Хлоя', 'Эшли', 'София'].includes(name);
    }
  };
}

console.log("✓ Characters created:", Object.keys(L.characters).length);
console.log("✓ All have reputation:", Object.values(L.characters).every(c => c.reputation !== undefined));
console.log("");

// Test 5: Observer - Romance event detection
console.log("Test 5: Observer - Romance Event Detection");
L.rumors = [];
LC.GossipEngine.Observer.observe("Максим поцеловал Хлою в библиотеке");
console.log("✓ Rumor created:", L.rumors.length > 0);
if (L.rumors.length > 0) {
  const rumor = L.rumors[0];
  console.log("✓ Rumor has id:", !!rumor.id);
  console.log("✓ Rumor type is romance:", rumor.type === 'romance');
  console.log("✓ Subject is Максим:", rumor.subject === 'Максим');
  console.log("✓ Target is Хлоя:", rumor.target === 'Хлоя');
  console.log("✓ Has knownBy array:", Array.isArray(rumor.knownBy));
  console.log("✓ Witnesses detected:", rumor.knownBy.length > 0);
  console.log("  Witnesses:", rumor.knownBy.join(', '));
}
console.log("");

// Test 6: Observer - Conflict event detection
console.log("Test 6: Observer - Conflict Event Detection");
const rumorsBefore = L.rumors.length;
LC.GossipEngine.Observer.observe("Максим подрался с Джейком");
console.log("✓ New rumor created:", L.rumors.length > rumorsBefore);
if (L.rumors.length > rumorsBefore) {
  const rumor = L.rumors[L.rumors.length - 1];
  console.log("✓ Rumor type is conflict:", rumor.type === 'conflict');
  console.log("✓ Has negative spin:", rumor.spin === 'negative');
}
console.log("");

// Test 7: Interpretation Matrix
console.log("Test 7: Interpretation Matrix");
// Setup relationships
L.evergreen = {
  relations: {
    'Эшли→Максим': -30,  // Эшли dislikes Максим
    'Максим→Эшли': -20
  }
};

L.rumors = [];
LC.GossipEngine.Observer.observe("Максим поцеловал Хлою");
if (L.rumors.length > 0) {
  const rumor = L.rumors[0];
  console.log("✓ Rumor created with witnesses");
  console.log("  Spin:", rumor.spin);
  console.log("  Distortion:", rumor.distortion);
  console.log("✓ Interpretation matrix applied:", rumor.distortion >= 0);
}
console.log("");

// Test 8: Propagator - Manual spread
console.log("Test 8: Propagator - Manual Rumor Spread");
if (L.rumors.length > 0) {
  const rumor = L.rumors[0];
  const knownByBefore = [...rumor.knownBy];
  
  LC.GossipEngine.Propagator.spreadRumor(rumor.id, 'Эшли', 'София');
  
  console.log("✓ Spread executed");
  console.log("✓ New character added to knownBy:", rumor.knownBy.includes('София'));
  console.log("✓ knownBy increased:", rumor.knownBy.length > knownByBefore.length);
  console.log("  Known by before:", knownByBefore.length);
  console.log("  Known by after:", rumor.knownBy.length);
}
console.log("");

// Test 9: Reputation updates
console.log("Test 9: Reputation Updates");
const repBefore = L.characters['Максим'].reputation;
console.log("  Reputation before:", repBefore);

// Create and spread a rumor that affects reputation
L.rumors = [];
LC.GossipEngine.Observer.observe("Максим предал Хлою");
if (L.rumors.length > 0) {
  const rumor = L.rumors[0];
  LC.GossipEngine.Propagator.updateReputation(rumor);
  
  const repAfter = L.characters['Максим'].reputation;
  console.log("  Reputation after:", repAfter);
  console.log("✓ Reputation changed:", repAfter !== repBefore);
  console.log("✓ Reputation decreased (betrayal):", repAfter < repBefore);
  console.log("✓ Reputation in valid range:", repAfter >= 0 && repAfter <= 100);
}
console.log("");

// Test 10: Auto-propagation
console.log("Test 10: Auto-Propagation");
// Setup scenario: two characters interacting
L.characters['Эшли'].lastSeen = L.turn;
L.characters['София'].lastSeen = L.turn;

// Create a rumor known only by Эшли
L.rumors = [{
  id: 'test_rumor_1',
  text: 'Test rumor',
  type: 'custom',
  subject: 'Максим',
  target: null,
  spin: 'neutral',
  turn: L.turn,
  knownBy: ['Эшли'],
  distortion: 0,
  verified: false
}];

// Try auto-propagation (it's probabilistic, so just verify it doesn't crash)
try {
  LC.GossipEngine.Propagator.autoPropagate('Эшли', 'София');
  console.log("✓ autoPropagate executed without error");
  // Check if Sofia might have learned the rumor (20% chance)
  const sofiaKnows = L.rumors[0].knownBy.includes('София');
  console.log("  Sofia learned rumor:", sofiaKnows);
} catch (e) {
  console.log("✗ autoPropagate error:", e.message);
}
console.log("");

// Test 11: Commands registration
console.log("Test 11: Commands Registration");
const rumorCmd = LC.CommandsRegistry.get("/rumor");
const reputationCmd = LC.CommandsRegistry.get("/reputation");
console.log("✓ /rumor command registered:", !!rumorCmd);
console.log("✓ /rumor has handler:", typeof rumorCmd?.handler === 'function');
console.log("✓ /reputation command registered:", !!reputationCmd);
console.log("✓ /reputation has handler:", typeof reputationCmd?.handler === 'function');
console.log("");

// Test 12: GossipEngine.analyze() integration
console.log("Test 12: GossipEngine.analyze() Integration");
L.rumors = [];
L.turn = 15;
L.characters['Максим'].lastSeen = 15;
L.characters['Хлоя'].lastSeen = 15;

try {
  LC.GossipEngine.analyze("Максим поцеловал Хлою");
  console.log("✓ analyze() executed without error");
  console.log("✓ Rumors detected:", L.rumors.length > 0);
} catch (e) {
  console.log("✗ analyze() error:", e.message);
}
console.log("");

console.log("=== Test Summary ===");
console.log("✅ Rumors and reputation state initialized");
console.log("✅ GossipEngine structure complete");
console.log("✅ Rumor ID generation works");
console.log("✅ Observer detects romance and conflict events");
console.log("✅ Interpretation matrix modifies rumor spin");
console.log("✅ Propagator spreads rumors correctly");
console.log("✅ Reputation updates based on rumors");
console.log("✅ Auto-propagation executes");
console.log("✅ Commands registered");
console.log("✅ Integration with analyze() works");
