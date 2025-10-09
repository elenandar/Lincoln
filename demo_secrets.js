#!/usr/bin/env node
/**
 * Demo script for Secrets and Knowledge System (Ticket #2)
 * 
 * This demonstrates:
 * - Creating secrets with /secret command
 * - How secrets appear/disappear based on scene focus
 * - Multiple secrets with different visibility
 */

console.log("=== KnowledgeEngine Demo ===\n");

const fs = require('fs');

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
const libraryCode = fs.readFileSync('./Library v16.0.8.patched.txt', 'utf8');
eval(libraryCode);

// Initialize state
const L = LC.lcInit();
L.turn = 10;
L.evergreen = { enabled: true, relations: {}, status: {}, obligations: {}, facts: {}, history: [] };

// Build patterns for character recognition
if (LC.EvergreenEngine?._buildPatterns) {
  LC.EvergreenEngine.patterns = LC.EvergreenEngine._buildPatterns();
}

console.log("=== Scenario: School Mystery ===\n");

// Add secrets
console.log("Step 1: Creating secrets...\n");

L.secrets.push({
  id: 's1',
  text: 'Директор подделывает оценки учеников',
  known_by: ['Максим']
});
console.log("Secret 1: 'Директор подделывает оценки учеников'");
console.log("  Known by: Максим\n");

L.secrets.push({
  id: 's2',
  text: 'Хлоя планирует тайную вечеринку в пятницу',
  known_by: ['Хлоя', 'Эшли']
});
console.log("Secret 2: 'Хлоя планирует тайную вечеринку в пятницу'");
console.log("  Known by: Хлоя, Эшли\n");

L.secrets.push({
  id: 's3',
  text: 'Миссис Грейсон собирается уволиться',
  known_by: ['Максим', 'Хлоя', 'Эшли']
});
console.log("Secret 3: 'Миссис Грейсон собирается уволиться'");
console.log("  Known by: Максим, Хлоя, Эшли\n");

console.log("─".repeat(60) + "\n");

// Scene 1: Максим in focus
console.log("Step 2: Scene with Максим in focus...\n");

L.characters = {
  "Максим": { mentions: 5, lastSeen: 10, firstSeen: 1 },
  "Хлоя": { mentions: 2, lastSeen: 6, firstSeen: 2 }
};

const overlay1 = LC.composeContextOverlay({ limit: 2000, allowPartial: true });
const secrets1 = overlay1.text.split('\n').filter(line => line.includes("⟦SECRET⟧"));

console.log("Active characters:");
console.log("  Максим (just saw, turn 10) ← IN FOCUS");
console.log("  Хлоя (last seen turn 6, 4 turns ago)\n");

console.log("Secrets visible to AI:");
secrets1.forEach(line => console.log("  " + line));
console.log("\nExplanation: Максим is in focus, so AI knows about:");
console.log("  ✓ Secret 1 (Максим knows about fake grades)");
console.log("  ✓ Secret 3 (Everyone knows about teacher leaving)");
console.log("  ✗ Secret 2 is hidden (only Хлоя and Эшли know, neither in HOT focus)\n");

console.log("─".repeat(60) + "\n");

// Scene 2: Хлоя and Эшли in focus
console.log("Step 3: Scene with Хлоя and Эшли in focus...\n");

L.characters = {
  "Хлоя": { mentions: 7, lastSeen: 10, firstSeen: 1 },
  "Эшли": { mentions: 5, lastSeen: 9, firstSeen: 2 },
  "Максим": { mentions: 2, lastSeen: 5, firstSeen: 3 }
};

const overlay2 = LC.composeContextOverlay({ limit: 2000, allowPartial: true });
const secrets2 = overlay2.text.split('\n').filter(line => line.includes("⟦SECRET⟧"));

console.log("Active characters:");
console.log("  Хлоя (just saw, turn 10) ← IN FOCUS");
console.log("  Эшли (last seen turn 9, 1 turn ago) ← IN FOCUS");
console.log("  Максим (last seen turn 5, 5 turns ago)\n");

console.log("Secrets visible to AI:");
secrets2.forEach(line => console.log("  " + line));
console.log("\nExplanation: Хлоя and Эшли are in focus, so AI knows about:");
console.log("  ✗ Secret 1 is hidden (only Максим knows, not in HOT focus)");
console.log("  ✓ Secret 2 (Хлоя and Эшли know about party)");
console.log("  ✓ Secret 3 (Everyone knows about teacher leaving)\n");

console.log("─".repeat(60) + "\n");

// Scene 3: No one specific in focus
console.log("Step 4: Scene with no one in recent focus...\n");

L.characters = {
  "Максим": { mentions: 2, lastSeen: 5, firstSeen: 1 },
  "Хлоя": { mentions: 2, lastSeen: 5, firstSeen: 2 },
  "Эшли": { mentions: 1, lastSeen: 5, firstSeen: 3 }
};

const overlay3 = LC.composeContextOverlay({ limit: 2000, allowPartial: true });
const secrets3 = overlay3.text.split('\n').filter(line => line.includes("⟦SECRET⟧"));

console.log("Active characters:");
console.log("  All characters last seen turn 5 (5 turns ago, not in HOT focus)\n");

console.log("Secrets visible to AI:");
if (secrets3.length === 0) {
  console.log("  (none - no characters in HOT focus)\n");
} else {
  secrets3.forEach(line => console.log("  " + line));
  console.log("");
}

console.log("Explanation: No one is in HOT focus (≤3 turns), so:");
console.log("  ✗ All secrets are hidden from AI");
console.log("  (HOT focus requires lastSeen within 3 turns)\n");

console.log("─".repeat(60) + "\n");

console.log("=== Storytelling Impact ===\n");

console.log("WITHOUT secrets system:");
console.log('  "Максим встретил Хлою в библиотеке.');
console.log('   Они поздоровались и обсудили домашнее задание."\n');

console.log("WITH secrets (when Максим in focus):");
console.log('  "Максим увидел Хлою у полок с учебниками. Знание о');
console.log('   подделке оценок директором жгло его изнутри. Стоит');
console.log('   ли рассказать Хлое? Можно ли ей доверять? Он подошёл,');
console.log('   но решил пока промолчать о своём открытии."\n');

console.log("WITH secrets (when Хлоя and Эшли in focus):");
console.log('  "Хлоя передала Эшли записку с планом вечеринки.');
console.log('   — В пятницу, когда все разойдутся, — прошептала она.');
console.log('   — Только мы с тобой знаем. Максим не должен узнать."\n');

console.log("─".repeat(60) + "\n");

console.log("✅ Demo Complete!\n");
console.log("Key takeaways:");
console.log("  • Secrets are context-aware based on scene focus");
console.log("  • AI only sees secrets known by characters in HOT focus (≤3 turns)");
console.log("  • Creates dramatic irony and character knowledge asymmetry");
console.log("  • Enables mysteries, secrets, and plot reveals");
console.log("  • Use /secret command to add secrets during gameplay\n");
