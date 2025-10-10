#!/usr/bin/env node
/**
 * Demo script showing Living World Engine in action
 * 
 * This demonstrates a complete narrative scenario:
 * 1. Player goes to sleep (ADVANCE_TO_NEXT_MORNING)
 * 2. Living World simulates off-screen NPC actions
 * 3. Player wakes up to discover consequences
 * 4. Multiple characters with different motivations
 */

console.log("=== Living World Engine Demo ===\n");

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
L.turn = 42;

console.log("📖 Scenario: A Day at Lincoln Heights School\n");
console.log("=".repeat(60));
console.log("");

// ========== SETUP: Day 3, Evening ==========
console.log("⏰ DAY 3, EVENING - Before Sleep\n");

L.time = {
  currentDay: 3,
  dayName: 'Среда',
  timeOfDay: 'Вечер',
  turnsPerToD: 5,
  turnsInCurrentToD: 0,
  scheduledEvents: [
    { id: 'party_001', title: 'Школьная вечеринка', day: 5 }
  ]
};

// Setup characters with rich states
L.characters = {
  'Максим': {
    mentions: 25,
    lastSeen: L.turn,
    status: 'ACTIVE',
    type: 'MAIN',
    flags: {}
  },
  'Хлоя': {
    mentions: 20,
    lastSeen: L.turn,
    status: 'ACTIVE',
    type: 'SECONDARY',
    flags: {}
  },
  'Эшли': {
    mentions: 18,
    lastSeen: L.turn,
    status: 'ACTIVE',
    type: 'SECONDARY',
    flags: {}
  },
  'Виктор': {
    mentions: 15,
    lastSeen: L.turn,
    status: 'ACTIVE',
    type: 'SECONDARY',
    flags: {}
  },
  'Старый_одноклассник': {
    mentions: 2,
    lastSeen: L.turn - 80,
    status: 'FROZEN',
    type: 'EXTRA',
    flags: {}
  }
};

// Setup goals
L.goals = {
  'goal_maxim_exam': {
    character: 'Максим',
    description: 'Подготовиться к экзамену по математике',
    status: 'active',
    turn: L.turn - 5
  },
  'goal_ashley_secret': {
    character: 'Эшли',
    description: 'Раскрыть секрет директора',
    status: 'active',
    turn: L.turn - 3
  }
};

// Setup relationships
L.evergreen = {
  relations: {
    'Максим': { 'Хлоя': 75, 'Эшли': -30, 'Виктор': 20 },
    'Хлоя': { 'Максим': 70, 'Эшли': 35, 'Виктор': 15 },
    'Эшли': { 'Максим': -35, 'Хлоя': 30, 'Виктор': -10 },
    'Виктор': { 'Максим': 18, 'Хлоя': 12, 'Эшли': -5 }
  }
};

// Setup moods
L.character_status = {
  'Максим': { mood: 'DETERMINED', reason: 'готовится к экзамену', turn: L.turn },
  'Хлоя': { mood: 'HAPPY', reason: 'в хорошем настроении', turn: L.turn },
  'Эшли': { mood: 'FRUSTRATED', reason: 'расстроена неудачей', turn: L.turn },
  'Виктор': { mood: 'NEUTRAL', reason: '', turn: L.turn - 10 }
};

// Display initial state
console.log("📊 Current State:");
console.log("-".repeat(60));
console.log(`Time: ${L.time.dayName}, ${L.time.timeOfDay}`);
console.log(`Active Characters: 4 (+ 1 FROZEN)`);
console.log("");

console.log("🎯 Active Goals:");
console.log("  • Максим: Подготовиться к экзамену (0% progress)");
console.log("  • Эшли: Раскрыть секрет директора (0% progress)");
console.log("");

console.log("💭 Relationships:");
console.log("  • Максим ↔ Хлоя: 75 (very positive) 💚");
console.log("  • Максим ↔ Эшли: -30 (negative) 💔");
console.log("  • Виктор → Others: weak connections");
console.log("");

console.log("😊 Moods:");
console.log("  • Максим: DETERMINED (focused on exam)");
console.log("  • Хлоя: HAPPY (cheerful)");
console.log("  • Эшли: FRUSTRATED (upset)");
console.log("  • Виктор: (no strong mood)");
console.log("");

console.log("📅 Upcoming Events:");
console.log("  • Школьная вечеринка - in 2 days (Day 5)");
console.log("");

// ========== TRIGGER: Player Goes to Sleep ==========
console.log("=".repeat(60));
console.log("\n💤 PLAYER GOES TO SLEEP...\n");
console.log("Triggering: ADVANCE_TO_NEXT_MORNING");
console.log("");

// Simulate the time jump
LC.TimeEngine.processSemanticAction({ type: 'ADVANCE_TO_NEXT_MORNING' });
const timeJump = LC.TimeEngine.advance();

console.log("🌍 Living World Simulation Running...\n");
console.log("-".repeat(60));

// Run the Living World simulation
LC.LivingWorld.runOffScreenCycle(timeJump);

console.log("");
console.log("✓ Simulation complete: " + timeJump.duration);
console.log("");

// ========== RESULTS: Next Morning ==========
console.log("=".repeat(60));
console.log("\n☀️ DAY 4, УТРО - Player Wakes Up\n");

console.log("📊 State Changes (Silent, Behind the Scenes):");
console.log("-".repeat(60));
console.log("");

console.log("🎯 Goal Progress:");
const maximGoalProgress = L.characters['Максим'].flags['goal_progress_goal_maxim_exam'] || 0;
const ashleyGoalProgress = L.characters['Эшли'].flags['goal_progress_goal_ashley_secret'] || 0;
console.log(`  • Максим exam preparation: ${(maximGoalProgress * 100).toFixed(0)}%`);
console.log(`    → Spent the night studying!`);
console.log(`  • Эшли investigation: ${(ashleyGoalProgress * 100).toFixed(0)}%`);
console.log(`    → Made progress on uncovering the secret`);
console.log("");

console.log("💭 Relationship Changes:");
const maximChloeAfter = L.evergreen.relations['Максим']['Хлоя'];
const maximAshleyAfter = L.evergreen.relations['Максим']['Эшли'];
const viktorPrep = L.characters['Виктор'].flags['event_preparation_party_001'];
console.log(`  • Максим ↔ Хлоя: 75 → ${maximChloeAfter} (+${maximChloeAfter - 75})`);
console.log(`    → Хлоя's HAPPY mood made their connection stronger!`);
console.log(`  • Максим ↔ Эшли: -30 → ${maximAshleyAfter} (${maximAshleyAfter - (-30)})`);
console.log(`    → Эшли's FRUSTRATED mood made things worse...`);
console.log("");

console.log("📅 Event Preparation:");
console.log(`  • Виктор prepared for party: ${viktorPrep ? 'Yes ✓' : 'No'}`);
if (viktorPrep) {
  console.log(`    → No strong goals/relations, so focused on upcoming event`);
}
console.log("");

console.log("❄️ FROZEN Characters:");
console.log("  • Старый_одноклассник: No changes (skipped)");
console.log("");

// ========== NARRATIVE IMPACT ==========
console.log("=".repeat(60));
console.log("\n📖 How This Appears in Narrative:\n");
console.log("-".repeat(60));
console.log("");

console.log("The AI doesn't receive text about these changes.");
console.log("Instead, they're reflected in the context overlay:");
console.log("");

// Simulate what the context might show
console.log("⟦GOALS⟧");
console.log(`  Максим (${(maximGoalProgress * 100).toFixed(0)}% progress): Подготовиться к экзамену`);
console.log(`  Эшли (${(ashleyGoalProgress * 100).toFixed(0)}% progress): Раскрыть секрет директора`);
console.log("");

console.log("⟦RELATIONS⟧");
console.log(`  Максим → Хлоя: ${maximChloeAfter} (very positive)`);
console.log(`  Максим → Эшли: ${maximAshleyAfter} (negative)`);
console.log("");

console.log("The AI naturally incorporates these changes:");
console.log("");
console.log('Player: "Доброе утро, Максим!"');
console.log("");
console.log("AI might respond:");
console.log('  "Максим выглядит уставшим, но довольным. Видно, что он');
console.log('   провёл всю ночь за учебниками. Хлоя подходит с улыбкой,');
console.log('   и их дружба кажется ещё крепче после вчерашнего вечера.');
console.log('   Эшли же бросает на него сердитый взгляд из-за их');
console.log('   недавней ссоры..."');
console.log("");

// ========== SUMMARY ==========
console.log("=".repeat(60));
console.log("\n📈 Summary of Living World Impact:\n");
console.log("-".repeat(60));
console.log("");

console.log("✅ Autonomous Actions Taken:");
console.log("  • 4 characters simulated (1 frozen, skipped)");
console.log("  • 2 goal pursuits (Максим, Эшли)");
console.log("  • 2 relationship interactions (Хлоя, Эшли with Максим)");
console.log("  • 1 event preparation (Виктор for party)");
console.log("");

console.log("🎭 Motivation Pyramid in Action:");
console.log("  Priority 1 (Goals): Максим, Эшли");
console.log("  Priority 2 (Relations): Хлоя (positive), Виктор considered but...");
console.log("  Priority 3 (Events): Виктор (no strong relations, prepared for party)");
console.log("");

console.log("🎨 Design Principles Demonstrated:");
console.log("  ✓ Proactive world (NPCs act independently)");
console.log("  ✓ Fact-based (no text, only state changes)");
console.log("  ✓ Integration (uses GoalsEngine, RelationsEngine, MoodEngine)");
console.log("  ✓ Performance (skips frozen characters)");
console.log("  ✓ Player discovery (changes revealed naturally in next scene)");
console.log("");

console.log("Demo complete! The world is now alive. 🌍✨");
