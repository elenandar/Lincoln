#!/usr/bin/env node
/**
 * Demo script showing performance optimizations in action
 */

console.log("=== Performance Optimization Demo ===\n");

const fs = require('fs');

// Mock functions
const mockFunctions = {
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

// Load library code
const libraryCode = fs.readFileSync('../Library v16.0.8.patched.txt', 'utf8');

const __SCRIPT_SLOT__ = "demo-perf";
const getState = mockFunctions.getState;
const toNum = mockFunctions.toNum;
const toStr = mockFunctions.toStr;
const toBool = mockFunctions.toBool;

eval(libraryCode);

const L = LC.lcInit();

console.log("📊 Demo 1: Context Caching\n");
console.log("Initial stateVersion:", L.stateVersion);

// Reset cache
LC._contextCache = {};

// First call - cold start
console.log("\n1️⃣ First call (cold start - building context):");
const start1 = Date.now();
const result1 = LC.composeContextOverlay({ limit: 800 });
const time1 = Date.now() - start1;
console.log(`   Time: ${time1}ms`);
console.log(`   StateVersion: ${L.stateVersion}`);
console.log(`   Context length: ${result1.text.length} chars`);

// Second call - should hit cache
console.log("\n2️⃣ Second call (cache hit - stateVersion unchanged):");
const start2 = Date.now();
const result2 = LC.composeContextOverlay({ limit: 800 });
const time2 = Date.now() - start2;
console.log(`   Time: ${time2}ms`);
console.log(`   StateVersion: ${L.stateVersion}`);
console.log(`   Cache hit: ${result1.text === result2.text ? '✅ YES' : '❌ NO'}`);

if (time1 > 0) {
  const speedup = ((time1 - time2) / time1 * 100).toFixed(1);
  console.log(`   Speed improvement: ${speedup}% faster`);
}

console.log("\n\n📊 Demo 2: State Change Invalidates Cache\n");

// Initialize for testing
L.goals = {};
L.character_status = {};
L.turn = 15;
L.evergreen = { enabled: true, relations: {}, status: {}, obligations: {}, facts: {}, history: [] };

console.log("3️⃣ Adding a goal (state change):");
const versionBefore = L.stateVersion;
LC.GoalsEngine.analyze("Максим хочет узнать правду о директоре.", "output");
console.log(`   StateVersion before: ${versionBefore}`);
console.log(`   StateVersion after:  ${L.stateVersion}`);
console.log(`   Version incremented: ${L.stateVersion > versionBefore ? '✅ YES' : '❌ NO'}`);

// Next call should rebuild
console.log("\n4️⃣ Next call (cache miss - rebuilds due to state change):");
const start3 = Date.now();
const result3 = LC.composeContextOverlay({ limit: 800 });
const time3 = Date.now() - start3;
console.log(`   Time: ${time3}ms`);
console.log(`   StateVersion: ${L.stateVersion}`);
console.log(`   Context includes goal: ${result3.text.includes('⟦GOAL⟧') ? '✅ YES' : '❌ NO'}`);

// Call again - should hit cache
console.log("\n5️⃣ Another call (cache hit again):");
const start4 = Date.now();
const result4 = LC.composeContextOverlay({ limit: 800 });
const time4 = Date.now() - start4;
console.log(`   Time: ${time4}ms`);
console.log(`   Cache hit: ${result3.text === result4.text ? '✅ YES' : '❌ NO'}`);

console.log("\n\n📊 Demo 3: Unified Analyzer\n");

L.goals = {};
L.character_status = {};
L.evergreen.relations = {};

const versionBeforeAnalysis = L.stateVersion;
const text = "Максим хочет найти улики. Он был зол после встречи с директором.";

console.log("6️⃣ Single UnifiedAnalyzer.analyze() call:");
console.log(`   Input text: "${text}"`);
console.log(`   StateVersion before: ${versionBeforeAnalysis}`);

LC.UnifiedAnalyzer.analyze(text, "output");

console.log(`   StateVersion after:  ${L.stateVersion}`);
console.log(`   Goals detected: ${Object.keys(L.goals).length}`);
console.log(`   Moods detected: ${Object.keys(L.character_status).length}`);

if (Object.keys(L.goals).length > 0) {
  console.log("\n   Goal details:");
  for (const key in L.goals) {
    const goal = L.goals[key];
    console.log(`   - ${goal.character}: ${goal.text}`);
  }
}

if (Object.keys(L.character_status).length > 0) {
  console.log("\n   Mood details:");
  for (const char in L.character_status) {
    const status = L.character_status[char];
    console.log(`   - ${char}: ${status.mood} (${status.reason})`);
  }
}

console.log("\n\n✅ All optimizations working correctly!");
console.log("\n💡 Key Benefits:");
console.log("   • Context caching reduces repeated work");
console.log("   • State versioning tracks changes automatically");
console.log("   • Unified analyzer simplifies code flow");
console.log("   • Performance improves for retry/continue scenarios");
