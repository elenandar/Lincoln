#!/usr/bin/env node
/**
 * Demo script for In-Game Time and Calendar System (Ticket #3)
 * 
 * This demonstrates:
 * - Time progression through the day
 * - Day advancement and week cycling
 * - Event scheduling and countdown
 * - TIME and SCHEDULE tags in context
 */

console.log("=== TimeEngine Demo ===\n");

const fs = require('fs');
const path = require('path');

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

global.state = mockFunctions.getState();
const libraryCode = fs.readFileSync(path.join(__dirname, '..', 'v16.0.8/Library v16.0.8.patched.txt'), 'utf8');
eval(libraryCode);

// Initialize state
const L = LC.lcInit();
L.turn = 1;
L.evergreen = { enabled: true, relations: {}, status: {}, obligations: {}, facts: {}, history: [] };

console.log("─".repeat(60));
console.log("SCENARIO: Lincoln Heights School Week");
console.log("─".repeat(60) + "\n");

// Day 1 - Monday Morning
console.log("📅 DAY 1 - MONDAY MORNING\n");
console.log("Current time state:");
console.log(`  Day: ${L.time.currentDay} (${L.time.dayName})`);
console.log(`  Time: ${L.time.timeOfDay}`);
console.log(`  Turns in period: ${L.time.turnsInCurrentToD}/${L.time.turnsPerToD}\n`);

// Schedule some events
console.log("Scheduling upcoming events...\n");

L.time.scheduledEvents = [
  { name: 'Математический тест', day: 2, id: 'event_1' },
  { name: 'Школьная вечеринка', day: 5, id: 'event_2' },
  { name: 'Баскетбольный матч', day: 7, id: 'event_3' }
];

console.log("Events scheduled:");
L.time.scheduledEvents.forEach(e => {
  const daysUntil = e.day - L.time.currentDay;
  console.log(`  • ${e.name} on day ${e.day} (${daysUntil} days away)`);
});
console.log("");

// Show context
let overlay = LC.composeContextOverlay({ limit: 2000 });
let timeLines = overlay.text.match(/⟦TIME⟧[^\n]+/);
let scheduleLines = overlay.text.match(/⟦SCHEDULE⟧[^\n]+/g) || [];

console.log("AI Context Tags:");
if (timeLines) console.log("  " + timeLines[0]);
scheduleLines.forEach(line => console.log("  " + line));
console.log("\n" + "─".repeat(60) + "\n");

// Advance through Day 1
console.log("⏱️  ADVANCING THROUGH DAY 1...\n");

const timePeriods = ['Утро', 'День', 'Вечер', 'Ночь'];
for (let period = 0; period < 4; period++) {
  console.log(`${timePeriods[period]}:`);
  
  // Advance 5 times to complete this period
  for (let t = 0; t < 5; t++) {
    LC.TimeEngine.advance();
  }
  
  console.log(`  → Advanced to: ${L.time.timeOfDay}`);
  console.log(`  → Current day: ${L.time.currentDay} (${L.time.dayName})\n`);
}

console.log("─".repeat(60) + "\n");

// Day 2 - Tuesday (Test Day!)
console.log("📅 DAY 2 - TUESDAY (Test Day!)\n");
console.log("Current time state:");
console.log(`  Day: ${L.time.currentDay} (${L.time.dayName})`);
console.log(`  Time: ${L.time.timeOfDay}\n`);

overlay = LC.composeContextOverlay({ limit: 2000 });
timeLines = overlay.text.match(/⟦TIME⟧[^\n]+/);
scheduleLines = overlay.text.match(/⟦SCHEDULE⟧[^\n]+/g) || [];

console.log("AI Context Tags:");
if (timeLines) console.log("  " + timeLines[0]);
scheduleLines.forEach(line => console.log("  " + line));
console.log("\nNotice: Математический тест is today!");
console.log("\n" + "─".repeat(60) + "\n");

// Skip to Day 5
console.log("⏩ FAST FORWARD TO DAY 5 (Party Day)...\n");

// Advance to day 5 (3 more days * 20 turns = 60 turns)
for (let i = 0; i < 60; i++) {
  LC.TimeEngine.advance();
}

console.log("📅 DAY 5 - FRIDAY (Party Day!)\n");
console.log("Current time state:");
console.log(`  Day: ${L.time.currentDay} (${L.time.dayName})`);
console.log(`  Time: ${L.time.timeOfDay}\n`);

overlay = LC.composeContextOverlay({ limit: 2000 });
timeLines = overlay.text.match(/⟦TIME⟧[^\n]+/);
scheduleLines = overlay.text.match(/⟦SCHEDULE⟧[^\n]+/g) || [];

console.log("AI Context Tags:");
if (timeLines) console.log("  " + timeLines[0]);
scheduleLines.forEach(line => console.log("  " + line));
console.log("\nNotice: Школьная вечеринка is today!");
console.log("        Баскетбольный матч is 2 days away!");
console.log("\n" + "─".repeat(60) + "\n");

// Week cycle demonstration
console.log("📆 WEEK CYCLING DEMONSTRATION\n");

L.time.currentDay = 1;
L.time.dayName = 'Понедельник';
L.time.timeOfDay = 'Утро';
L.time.turnsInCurrentToD = 0;

console.log("Starting from Monday, advancing 1 day at a time:\n");

for (let d = 0; d < 10; d++) {
  console.log(`Day ${L.time.currentDay}: ${L.time.dayName}`);
  
  // Advance a full day (20 turns)
  for (let t = 0; t < 20; t++) {
    LC.TimeEngine.advance();
  }
}

console.log("\nNotice: Days cycle through the week and restart!");
console.log("\n" + "─".repeat(60) + "\n");

// Multiple simultaneous events
console.log("📋 MULTIPLE EVENTS SCENARIO\n");

L.time.currentDay = 10;
L.time.dayName = 'Среда';
L.time.scheduledEvents = [
  { name: 'Родительское собрание', day: 11, id: 'e1' },
  { name: 'Репетиция пьесы', day: 12, id: 'e2' },
  { name: 'Экскурсия в музей', day: 13, id: 'e3' },
  { name: 'Контрольная работа', day: 14, id: 'e4' },
  { name: 'Концерт', day: 15, id: 'e5' }
];

overlay = LC.composeContextOverlay({ limit: 2000 });
scheduleLines = overlay.text.match(/⟦SCHEDULE⟧[^\n]+/g) || [];

console.log(`Current: Day ${L.time.currentDay} (${L.time.dayName})\n`);
console.log("Upcoming events in AI context:");
scheduleLines.forEach(line => console.log("  " + line));

console.log("\n" + "─".repeat(60) + "\n");

// Storytelling example
console.log("📖 STORYTELLING EXAMPLE\n");

L.time.currentDay = 3;
L.time.dayName = 'Среда';
L.time.timeOfDay = 'Вечер';
L.time.scheduledEvents = [
  { name: 'Финальная игра', day: 6, id: 'final' }
];

console.log("Story context at Day 3, Evening:");
console.log("═".repeat(60));

overlay = LC.composeContextOverlay({ limit: 2000 });
const contextLines = overlay.text.split('\n').filter(line => 
  line.includes('⟦TIME⟧') || line.includes('⟦SCHEDULE⟧') || line.includes('⟦GUIDE⟧')
).slice(0, 6);

contextLines.forEach(line => console.log(line));

console.log("═".repeat(60));
console.log("\nThe AI sees:");
console.log("  • Current temporal context (Wednesday evening)");
console.log("  • Upcoming deadline (Final game in 3 days)");
console.log("  • Can create urgency and time pressure in narrative");
console.log("\n" + "─".repeat(60) + "\n");

// Summary
console.log("✅ DEMO COMPLETE\n");
console.log("Key features demonstrated:");
console.log("  ✓ Time progression through day periods");
console.log("  ✓ Day advancement and week cycling");
console.log("  ✓ Event scheduling with countdowns");
console.log("  ✓ TIME tag in AI context");
console.log("  ✓ SCHEDULE tags for upcoming events");
console.log("  ✓ Integration with storytelling\n");
console.log("The TimeEngine enables:");
console.log("  • Temporal awareness in AI responses");
console.log("  • Deadline-driven narrative tension");
console.log("  • Realistic time flow in the story world");
console.log("  • Event-based plot structuring\n");
