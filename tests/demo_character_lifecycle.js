#!/usr/bin/env node
/**
 * Demo script showing Character Lifecycle System in action
 * 
 * This demonstrates:
 * 1. Population system initialization
 * 2. Character creation with type and status
 * 3. Demographic pressure detection
 * 4. Character promotion (EXTRA → SECONDARY)
 * 5. Character freezing (SECONDARY → FROZEN)
 * 6. Character unfreezing on mention
 * 7. Character deletion (EXTRA cleanup)
 * 8. Context overlay integration
 */

console.log("=== Character Lifecycle System Demo ===\n");

const fs = require('fs');
const path = require('path');

// Load library code
const libraryCode = fs.readFileSync(path.join(__dirname, '..', 'Library v16.0.8.patched.txt'), 'utf8');

// Set up global state that the library expects
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
L.aliases = {
  'Максим': ['максим', 'макс'],
  'Хлоя': ['хлоя', 'хло'],
  'Алекс': ['алекс', 'александр'],
  'Марина': ['марина', 'маша'],
  'Виктор': ['виктор', 'витя']
};

console.log("📊 Scenario: A semester at Lincoln Heights School\n");

// ==== TURN 1-10: Introduction Phase ====
console.log("--- TURN 1-10: Introduction Phase ---");
console.log("Characters are introduced and interact frequently.\n");

L.turn = 1;
LC.updateCharacterActivity("Максим и Хлоя встретились в коридоре.", false);
L.turn = 2;
LC.updateCharacterActivity("Максим рассказал Хлое о своих планах.", false);
L.turn = 3;
LC.updateCharacterActivity("Хлоя и Алекс обсуждали Максима.", false);
L.turn = 5;
LC.updateCharacterActivity("Алекс, Максим и Хлоя пошли в столовую вместе.", false);
L.turn = 8;
LC.updateCharacterActivity("Марина подошла к группе и представилась.", false);

console.log("Characters created:");
for (const name in L.characters) {
  const c = L.characters[name];
  console.log(`  ${name}: ${c.mentions} mentions, type=${c.type}, status=${c.status}`);
}
console.log("");

// ==== TURN 15: Demographic Pressure - Loneliness ====
console.log("--- TURN 15: Demographic Pressure Detection ---");
L.turn = 15;
// Update Максим's lastSeen to make him active
LC.updateCharacterActivity("Максим размышлял о прошлом.", false);
const lonelyText = "Максим сидел один в пустом классе, размышляя о прошлом.";
console.log(`Text: "${lonelyText}"\n`);

LC.DemographicPressure.analyze(lonelyText);
const suggestions = LC.DemographicPressure.getSuggestions();

if (suggestions.length > 0) {
  console.log("Demographic Pressure Suggestions:");
  suggestions.forEach(s => console.log(`  ${s}`));
} else {
  console.log("No suggestions generated.");
}
console.log("");

// ==== TURN 20: Expert Needed ====
console.log("--- TURN 20: Expert Needed Detection ---");
L.turn = 20;
const expertText = "Нужно взломать компьютер директора, но никто не знает как.";
console.log(`Text: "${expertText}"\n`);

LC.DemographicPressure.analyze(expertText);
const expertSuggestions = LC.DemographicPressure.getSuggestions();

if (expertSuggestions.length > 0) {
  console.log("Expert Needed Suggestions:");
  expertSuggestions.forEach(s => console.log(`  ${s}`));
}
console.log("");

// ==== TURN 40: Character Promotion ====
console.log("--- TURN 40: Character Promotion Check ---");
L.turn = 40;

// Add more mentions to trigger promotion
for (let i = 11; i <= 40; i++) {
  L.turn = i;
  if (i % 3 === 0) {
    LC.updateCharacterActivity("Алекс помогал с планом.", false);
  }
  if (i % 4 === 0) {
    LC.updateCharacterActivity("Хлоя обдумывала ситуацию.", false);
  }
}

console.log("Before CharacterGC:");
for (const name in L.characters) {
  const c = L.characters[name];
  console.log(`  ${name}: ${c.mentions} mentions, type=${c.type}`);
}

// Manually run GC to show promotion
LC.CharacterGC.run();

console.log("\nAfter CharacterGC (promotion check):");
for (const name in L.characters) {
  const c = L.characters[name];
  console.log(`  ${name}: ${c.mentions} mentions, type=${c.type}`);
}
console.log("");

// ==== TURN 200: Character Freezing ====
console.log("--- TURN 200: Long-term Character Management ---");
L.turn = 200;

// Марина hasn't been mentioned in a while
console.log(`Марина last seen at turn ${L.characters['Марина'].lastSeen}`);
console.log(`Current turn: ${L.turn}`);
console.log(`Turns since last seen: ${L.turn - L.characters['Марина'].lastSeen}\n`);

LC.CharacterGC.run();

console.log("After CharacterGC (freezing check):");
for (const name in L.characters) {
  const c = L.characters[name];
  console.log(`  ${name}: type=${c.type}, status=${c.status}, last seen=${c.lastSeen}`);
}
console.log("");

// ==== Character Unfreezing ====
console.log("--- TURN 210: Character Returns (Unfreezing) ---");
L.turn = 210;
const returnText = "Марина вернулась в школу после долгого отсутствия.";
console.log(`Text: "${returnText}"\n`);

LC.updateCharacterActivity(returnText, false);

const marina = L.characters['Марина'];
console.log(`Марина status after mention: ${marina.status}`);
console.log(`Марина is back in the narrative!\n`);

// ==== Context Overlay Integration ====
console.log("--- Context Overlay Integration ---");
LC._contextCache = {}; // Clear cache
const overlay = LC.composeContextOverlay({ limit: 2000 });

console.log("Population context:");
const worldLine = overlay.text.split('\n').find(line => line.includes('⟦WORLD⟧'));
if (worldLine) {
  console.log(`  ${worldLine}`);
} else {
  console.log("  (Not found)");
}

console.log("\nActive characters in scene:");
const sceneLines = overlay.text.split('\n').filter(line => line.includes('⟦SCENE⟧'));
sceneLines.forEach(line => console.log(`  ${line}`));

console.log("\nFull overlay excerpt:");
console.log(overlay.text.split('\n').slice(0, 15).join('\n'));
console.log("...\n");

// ==== TURN 400: Character Deletion ====
console.log("--- TURN 400: Character Deletion (Extra Cleanup) ---");
L.turn = 400;

// Add a character with minimal interaction
L.characters['Сергей'] = {
  mentions: 1,
  lastSeen: 150,
  firstSeen: 149,
  type: 'EXTRA',
  status: 'ACTIVE'
};

console.log("Before deletion:");
console.log(`  Сергей: ${L.characters['Сергей'].mentions} mentions, last seen at turn ${L.characters['Сергей'].lastSeen}`);
console.log(`  Turns since last seen: ${L.turn - L.characters['Сергей'].lastSeen}\n`);

LC.CharacterGC.run();

console.log("After CharacterGC (deletion check):");
if (L.characters['Сергей']) {
  console.log(`  Сергей still exists`);
} else {
  console.log(`  Сергей was deleted (minimal interaction, long absence)`);
}
console.log("");

// ==== Summary ====
console.log("=== Summary ===\n");

console.log("Final character roster:");
for (const name in L.characters) {
  const c = L.characters[name];
  const emoji = c.type === 'SECONDARY' ? '⭐' : '👤';
  const statusIcon = c.status === 'FROZEN' ? '❄️' : '✅';
  console.log(`  ${emoji} ${name}: ${c.mentions} mentions, ${c.type}, ${statusIcon} ${c.status}`);
}

console.log("\nPopulation:");
console.log(`  Students: ${L.population.unnamedStudents}`);
console.log(`  Teachers: ${L.population.unnamedTeachers}`);

console.log("\n✅ Demo completed successfully!");
console.log("\nKey Features Demonstrated:");
console.log("  ✓ Population system provides world context");
console.log("  ✓ Demographic pressure suggests new character introductions");
console.log("  ✓ Characters are categorized by narrative importance");
console.log("  ✓ Inactive secondary characters are frozen (not deleted)");
console.log("  ✓ Frozen characters can be unfrozen on mention");
console.log("  ✓ Minimal extras are cleaned up automatically");
console.log("  ✓ Context overlay integrates all systems");
