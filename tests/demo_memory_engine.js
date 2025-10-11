#!/usr/bin/env node
/**
 * Demo script showing the Collective Memory Engine in action
 * 
 * This demonstrates:
 * 1. Formative events being archived
 * 2. Events aging into myths
 * 3. Myths influencing new characters
 * 4. Zeitgeist appearing in context
 */

console.log("=== Collective Memory Engine Demo ===\n");

const fs = require('fs');

// Load library code
const libraryCode = fs.readFileSync('./Library v16.0.8.patched.txt', 'utf8');

// Set up global state
global.state = { lincoln: {} };

// Helper functions
const toNum = (x, d = 0) => (typeof x === 'number' && !isNaN(x)) ? x : (Number(x) || d);
const toStr = (x) => String(x == null ? "" : x);
const toBool = (x, d = false) => (x == null ? d : !!x);

// Evaluate library code
eval(libraryCode);

// Initialize
const L = LC.lcInit();
L.turn = 1;

console.log("📖 Scenario: The Legend of Lincoln Heights\n");
console.log("=".repeat(60));
console.log("\n=== ACT 1: THE HEROIC RESCUE ===\n");

// Setup characters
L.characters = {
  'Максим': {
    mentions: 10,
    lastSeen: 1,
    type: 'MAIN',
    status: 'ACTIVE',
    personality: {
      trust: 0.5,
      bravery: 0.5,
      idealism: 0.5,
      aggression: 0.3
    },
    social: {
      status: 'member',
      capital: 100,
      conformity: 0.5
    }
  },
  'Хлоя': {
    mentions: 8,
    lastSeen: 1,
    type: 'SECONDARY',
    status: 'ACTIVE',
    personality: {
      trust: 0.5,
      bravery: 0.5,
      idealism: 0.5,
      aggression: 0.3
    },
    social: {
      status: 'member',
      capital: 100,
      conformity: 0.5
    }
  },
  'Марк': {
    mentions: 5,
    lastSeen: 1,
    type: 'SECONDARY',
    status: 'ACTIVE',
    personality: {
      trust: 0.5,
      bravery: 0.5,
      idealism: 0.5,
      aggression: 0.6
    },
    social: {
      status: 'member',
      capital: 80,
      conformity: 0.3
    }
  }
};

// Event: Максим спасает Хлою от Марка
console.log("Turn 5: Максим защищает Хлою от хулигана Марка у шкафчиков\n");
L.turn = 5;

LC.Crucible.analyzeEvent({
  type: 'RELATION_CHANGE',
  character: 'Максим',
  otherCharacter: 'Хлоя',
  change: 85,
  finalValue: 85
});

console.log("✓ Максим's personality evolved (trust +0.15, bravery +0.1)");
console.log(`  Trust: 0.5 → ${L.characters['Максим'].personality.trust}`);
console.log(`  Bravery: 0.5 → ${L.characters['Максим'].personality.bravery}`);

console.log("\n✓ Formative event archived:");
if (L.society.myths.length > 0) {
  const event = L.society.myths[0];
  console.log(`  Type: ${event.type}`);
  console.log(`  Character: ${event.character}`);
  console.log(`  Theme: ${event.details.theme}`);
  console.log(`  Turn: ${event.turn}`);
}

console.log("\n" + "=".repeat(60));
console.log("\n=== ACT 2: 50 TURNS LATER... ===\n");

L.turn = 60;

console.log("Turn 60: Time has passed. The event is now history.\n");
console.log("Running mythologization process...\n");

LC.MemoryEngine.runMythologization();

console.log("✓ Event transformed into myth:");
const myth = L.society.myths.find(m => m.type === 'myth');
if (myth) {
  console.log(`  Theme: ${myth.theme}`);
  console.log(`  Hero: ${myth.hero}`);
  console.log(`  Moral: ${myth.moral}`);
  console.log(`  Strength: ${myth.strength}`);
  console.log(`  Original turn: ${myth.originalTurn} → Mythologized at: ${myth.createdTurn}`);
}

console.log("\n✓ Dominant myth established:");
const dominant = LC.MemoryEngine.getDominantMyth();
if (dominant) {
  console.log(`  "${dominant.moral}"`);
  console.log(`  (Strength: ${dominant.strength})`);
}

console.log("\n" + "=".repeat(60));
console.log("\n=== ACT 3: THE NEW GENERATION ===\n");

L.turn = 65;

console.log("Turn 65: New students arrive at Lincoln Heights\n");

// Create new characters - they should be influenced by myths
L.aliases = { 
  'Алекс': ['алекс'],
  'София': ['софия']
};

console.log("Creating Алекс (new student)...");
LC.updateCharacterActivity("Алекс появился в школе", false);

const alex = L.characters['Алекс'];
console.log(`\n✓ Алекс's personality calibrated by mythology:`);
console.log(`  Trust: ${alex.personality.trust.toFixed(2)} (baseline: 0.50)`);
console.log(`  ${alex.personality.trust > 0.5 ? '↑ Boosted by loyalty myths' : '→ Standard'}`);

console.log("\nCreating София (new student)...");
LC.updateCharacterActivity("София появилась в школе", false);

const sofia = L.characters['София'];
console.log(`\n✓ София's personality calibrated by mythology:`);
console.log(`  Trust: ${sofia.personality.trust.toFixed(2)} (baseline: 0.50)`);
console.log(`  ${sofia.personality.trust > 0.5 ? '↑ Boosted by loyalty myths' : '→ Standard'}`);

console.log("\n" + "=".repeat(60));
console.log("\n=== ACT 4: THE ZEITGEIST ===\n");

console.log("Generating context overlay for AI...\n");

const context = LC.composeContextOverlay();

console.log("✓ Context overlay generated:");
console.log(`  Length: ${context.text.length} characters`);

// Extract and display zeitgeist tag
const zeitgeistMatch = context.text.match(/⟦ZEITGEIST⟧[^\n]+/);
if (zeitgeistMatch) {
  console.log(`\n✓ Zeitgeist tag present:\n`);
  console.log(`  ${zeitgeistMatch[0]}\n`);
  console.log("  This tells the AI about the cultural atmosphere of the school.");
}

// Show how norms are boosted
console.log("\n✓ Norms strengthened by myths:");
const normStrength = LC.NormsEngine.getNormStrength('loyalty_rescue');
console.log(`  loyalty_rescue norm strength: ${normStrength.toFixed(2)}`);
console.log(`  (Base strength + myth boost)`);

console.log("\n" + "=".repeat(60));
console.log("\n=== ACT 5: THE LEGEND GROWS ===\n");

L.turn = 100;

console.log("Turn 100: Another formative event occurs\n");

// Make Максим a leader
L.characters['Максим'].social.capital = 150;
LC.HierarchyEngine.recalculateStatus();

console.log("✓ Максим becomes the first leader");
console.log(`  Status: ${L.characters['Максим'].social.status}`);
console.log(`  Capital: ${L.characters['Максим'].social.capital}`);

console.log("\n✓ Leadership event archived:");
const leadershipEvent = L.society.myths.find(m => m.eventType === 'STATUS_CHANGE');
if (leadershipEvent) {
  console.log(`  Type: ${leadershipEvent.type}`);
  console.log(`  Character: ${leadershipEvent.character}`);
  console.log(`  Theme: ${leadershipEvent.details.theme}`);
}

console.log("\n✓ Current myth collection:");
console.log(`  Total myths: ${L.society.myths.filter(m => m.type === 'myth').length}`);
console.log(`  Event records: ${L.society.myths.filter(m => m.type === 'event_record').length}`);

console.log("\n" + "=".repeat(60));
console.log("\n=== EPILOGUE ===\n");

console.log("🎭 The Collective Memory Engine transforms raw events into cultural myths.");
console.log("📚 These myths shape the personality of new characters.");
console.log("🌍 The zeitgeist reflects the dominant cultural values.");
console.log("⚖️ Social norms are reinforced by legendary examples.");
console.log("\nLincoln Heights has a living, breathing culture that grows with every story.\n");

console.log("=".repeat(60));
console.log("\n✅ DEMO COMPLETE\n");
