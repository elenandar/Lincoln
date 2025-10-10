#!/usr/bin/env node
/**
 * Demo: Chronological Knowledge Base - Semantic Time Control
 * 
 * This demo showcases the new semantic time control system where time flows
 * based on narrative meaning rather than mechanical turn counting.
 */

const fs = require('fs');
const path = require('path');

// Mock functions
const mockFunctions = {
  _state: null,
  getState() {
    if (!this._state) {
      this._state = { lincoln: { stateVersion: 0 } };
    }
    return this._state;
  },
  toNum(x, d = 0) { const n = Number(x); return isFinite(n) ? n : d; },
  toStr(x) { return String(x || ""); },
  toBool(x, d = false) { if (x === undefined || x === null) return d; return !!x; }
};

global.state = mockFunctions.getState();
const libraryCode = fs.readFileSync(path.join(__dirname, '..', 'Library v16.0.8.patched.txt'), 'utf8');
eval(libraryCode);

console.log("╔═══════════════════════════════════════════════════════════════╗");
console.log("║  Chronological Knowledge Base - Semantic Time Control Demo   ║");
console.log("╚═══════════════════════════════════════════════════════════════╝\n");

const L = LC.lcInit();
L.evergreen = { enabled: true, relations: {}, status: {}, obligations: {}, facts: {}, history: [] };
L.time = { 
  currentDay: 1, 
  dayName: 'Понедельник', 
  timeOfDay: 'Утро', 
  turnsPerToD: 5, 
  turnsInCurrentToD: 0, 
  scheduledEvents: [] 
};

function showTime() {
  return `📅 Day ${L.time.currentDay} (${L.time.dayName}), ${L.time.timeOfDay}`;
}

function process(text, description) {
  console.log(`\n${description}`);
  console.log(`📝 Story: "${text}"`);
  console.log(`⏰ Before: ${showTime()}`);
  LC.UnifiedAnalyzer.analyze(text, "output");
  console.log(`⏰ After:  ${showTime()}`);
}

console.log("═════════════════════════════════════════════════════════════════");
console.log("SCENARIO 1: A School Day with Semantic Time Flow");
console.log("═════════════════════════════════════════════════════════════════");

console.log(`\n⏰ Starting state: ${showTime()}`);

process(
  "Максим проснулся в понедельник утром. Солнце только начинало восходить.",
  "1. Morning wake-up (explicit time marker)"
);

process(
  "После уроков он встретился с Хлоей у входа в школу.",
  "2. After school (automatic advancement to День)"
);

process(
  "Они пообедали вместе в кафе неподалеку.",
  "3. Lunch (confirms/maintains День)"
);

process(
  "К вечеру они вернулись домой.",
  "4. By evening (advancement to Вечер)"
);

process(
  "За ужином Максим рассказал семье о своем дне.",
  "5. Dinner (confirms Вечер)"
);

process(
  "Устав от долгого дня, Максим лег спать.",
  "6. Going to sleep (advancement to next day, Утро)"
);

console.log("\n═════════════════════════════════════════════════════════════════");
console.log("SCENARIO 2: Time Jumps");
console.log("═════════════════════════════════════════════════════════════════");

process(
  "На следующий день Максим снова встретился с Хлоей.",
  "1. Next day (jump to Day 3, Утро)"
);

process(
  "Час спустя они добрались до библиотеки.",
  "2. An hour later (advancement by 1 time period)"
);

process(
  "Прошла неделя напряженной учебы.",
  "3. A week passed (jump forward 7 days)"
);

console.log("\n═════════════════════════════════════════════════════════════════");
console.log("SCENARIO 3: English Language Support");
console.log("═════════════════════════════════════════════════════════════════");

L.time = { currentDay: 1, dayName: 'Понедельник', timeOfDay: 'Утро', turnsPerToD: 5, turnsInCurrentToD: 0, scheduledEvents: [] };
console.log(`\n⏰ Reset to: ${showTime()}`);

process(
  "After school, Max and Chloe went to the cafe.",
  "1. After school (English pattern)"
);

process(
  "They had dinner together at Max's house.",
  "2. Had dinner (English pattern)"
);

process(
  "Max fell asleep thinking about tomorrow.",
  "3. Fell asleep (English pattern)"
);

process(
  "A few hours later, he woke up from a strange dream.",
  "4. A few hours later (time jump)"
);

console.log("\n═════════════════════════════════════════════════════════════════");
console.log("SCENARIO 4: Comparison with Old System");
console.log("═════════════════════════════════════════════════════════════════");

L.time = { currentDay: 1, dayName: 'Понедельник', timeOfDay: 'Утро', turnsPerToD: 5, turnsInCurrentToD: 0, scheduledEvents: [] };
console.log(`\n⏰ Reset to: ${showTime()}`);

console.log("\n📊 OLD SYSTEM (turn-based, now disabled):");
console.log("   - Required 5 turns to advance time period");
console.log("   - Required 20 turns to advance a day");
console.log("   - No semantic understanding");
console.log("   - Time flow disconnected from narrative");

console.log("\n📊 NEW SYSTEM (semantic, now active):");
console.log("   - Time flows based on story content");
console.log("   - 'лег спать' → next morning immediately");
console.log("   - 'после уроков' → afternoon immediately");
console.log("   - Natural narrative progression");

console.log("\n📝 Demo: Old advance() method (now disabled):");
const beforeDay = L.time.currentDay;
const beforeTime = L.time.timeOfDay;
for (let i = 0; i < 10; i++) {
  LC.TimeEngine.advance();
}
console.log(`   Called advance() 10 times`);
console.log(`   Result: ${showTime()}`);
console.log(`   Time changed: ${beforeDay !== L.time.currentDay || beforeTime !== L.time.timeOfDay ? 'YES' : 'NO (as expected - disabled)'}`);

console.log("\n📝 Demo: Semantic time control:");
process(
  "Максим лег спать.",
  "Single semantic action"
);

console.log("\n═════════════════════════════════════════════════════════════════");
console.log("PATTERN CATEGORIES");
console.log("═════════════════════════════════════════════════════════════════");

const CKB = LC.ChronologicalKnowledgeBase;
const categories = Object.keys(CKB);

console.log("\n📚 Chronological Knowledge Base contains:");
for (const cat of categories) {
  const entry = CKB[cat];
  const count = entry.patterns.length;
  const actionType = entry.action.type;
  console.log(`\n   ${cat}:`);
  console.log(`   - Patterns: ${count}`);
  console.log(`   - Action: ${actionType}`);
  if (count <= 5) {
    console.log(`   - Examples: ${entry.patterns.slice(0, 3).map(p => p.source).join(', ')}`);
  }
}

console.log("\n═════════════════════════════════════════════════════════════════");
console.log("INTEGRATION STATISTICS");
console.log("═════════════════════════════════════════════════════════════════");

const patterns = LC.UnifiedAnalyzer._buildUnifiedPatterns();
const ckbPatterns = patterns.filter(p => p.engine === 'TimeEngine');
const otherPatterns = patterns.filter(p => p.engine !== 'TimeEngine');

console.log(`\n📊 UnifiedAnalyzer Pattern Statistics:`);
console.log(`   - Total patterns: ${patterns.length}`);
console.log(`   - CKB patterns: ${ckbPatterns.length}`);
console.log(`   - Other patterns: ${otherPatterns.length}`);
console.log(`   - Engines: TimeEngine, EvergreenEngine, GoalsEngine`);

console.log("\n═════════════════════════════════════════════════════════════════");
console.log("DEMO COMPLETE");
console.log("═════════════════════════════════════════════════════════════════");

console.log("\n✅ Key Features Demonstrated:");
console.log("   1. Semantic time control based on narrative content");
console.log("   2. Bilingual support (Russian and English)");
console.log("   3. Multiple time advancement patterns");
console.log("   4. Integration with UnifiedAnalyzer");
console.log("   5. Old turn-based mechanics disabled");
console.log("   6. Natural story-driven time progression");

console.log("\n📖 For more information, see SYSTEM_DOCUMENTATION.md");
console.log("   Section 3.4: In-Game Time and Calendar System (TimeEngine)\n");
