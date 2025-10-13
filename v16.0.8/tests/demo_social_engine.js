#!/usr/bin/env node
/**
 * Demo: Social Engine (Norms & Hierarchy)
 * 
 * This demo shows how the Social Engine creates emergent social dynamics:
 * - Social norms emerge from group reactions
 * - Characters gain/lose social capital based on their actions
 * - Status changes from member → leader or member → outcast
 * - Social status affects gossip credibility
 */

console.log("=== Social Engine Demo ===\n");
console.log("This demo simulates a school drama where social norms emerge");
console.log("and characters rise or fall in the social hierarchy.\n");

const fs = require('fs');
const path = require('path');
const libraryCode = fs.readFileSync(path.join(__dirname, '..', 'Library v16.0.8.patched.txt'), 'utf8');
global.state = { lincoln: {} };
const toNum = (x, d = 0) => (typeof x === 'number' && !isNaN(x)) ? x : (Number(x) || d);
const toStr = (x) => String(x == null ? "" : x);
const toBool = (x, d = false) => (x == null ? d : !!x);
eval(libraryCode);

const L = LC.lcInit();
L.turn = 1;

// Setup: Three main characters
console.log("=".repeat(60));
console.log("SETUP: Lincoln Heights School Drama");
console.log("=".repeat(60));
console.log("\nThree students with different personalities:\n");

L.characters = {
  'Эшли': {
    mentions: 20,
    lastSeen: L.turn,
    type: 'SECONDARY',
    status: 'ACTIVE',
    social: {
      status: 'member',
      capital: 100,
      conformity: 0.7
    },
    personality: {
      trust: 0.6,
      bravery: 0.7,
      idealism: 0.8,
      aggression: 0.2
    }
  },
  'Максим': {
    mentions: 18,
    lastSeen: L.turn,
    type: 'SECONDARY',
    status: 'ACTIVE',
    social: {
      status: 'member',
      capital: 100,
      conformity: 0.5
    },
    personality: {
      trust: 0.5,
      bravery: 0.5,
      idealism: 0.5,
      aggression: 0.3
    }
  },
  'Леонид': {
    mentions: 15,
    lastSeen: L.turn,
    type: 'SECONDARY',
    status: 'ACTIVE',
    social: {
      status: 'member',
      capital: 100,
      conformity: 0.3
    },
    personality: {
      trust: 0.4,
      bravery: 0.6,
      idealism: 0.3,
      aggression: 0.7
    }
  }
};

// Setup relationships
L.evergreen = {
  relations: {
    'Эшли': { 'Максим': 60, 'Леонид': 20 },
    'Максим': { 'Эшли': 55, 'Леонид': 30 },
    'Леонид': { 'Эшли': 15, 'Максим': 25 }
  }
};

console.log("👤 Эшли - Популярная ученица (высокая конформность)");
console.log("   Capital: 100, Conformity: 0.7");
console.log("\n👤 Максим - Обычный ученик (средняя конформность)");
console.log("   Capital: 100, Conformity: 0.5");
console.log("\n👤 Леонид - Бунтарь (низкая конформность)");
console.log("   Capital: 100, Conformity: 0.3");

// ========== ACT 1: Positive Actions Build Capital ==========
console.log("\n" + "=".repeat(60));
console.log("ACT 1: Building Social Capital");
console.log("=".repeat(60));

console.log("\n📖 Эшли помогает однокласснику с домашним заданием.");
LC.HierarchyEngine.updateCapital('Эшли', { type: 'POSITIVE_ACTION' });

console.log("📖 Эшли организует школьное мероприятие.");
LC.HierarchyEngine.updateCapital('Эшли', { type: 'POSITIVE_ACTION' });

console.log("📖 Эшли еще раз помогает кому-то.");
LC.HierarchyEngine.updateCapital('Эшли', { type: 'POSITIVE_ACTION' });

console.log("📖 Эшли продолжает быть полезной.");
LC.HierarchyEngine.updateCapital('Эшли', { type: 'POSITIVE_ACTION' });

console.log("📖 Эшли помогает учителю.");
LC.HierarchyEngine.updateCapital('Эшли', { type: 'POSITIVE_ACTION' });

console.log("📖 Эшли получает признание за доброту.");
LC.HierarchyEngine.updateCapital('Эшли', { type: 'POSITIVE_ACTION' });

console.log("\n📊 Social Capital after positive actions:");
console.log(`   Эшли: ${L.characters['Эшли'].social.capital}`);
console.log(`   Максим: ${L.characters['Максим'].social.capital}`);
console.log(`   Леонид: ${L.characters['Леонид'].social.capital}`);

// ========== ACT 2: Status Recalculation ==========
console.log("\n" + "=".repeat(60));
console.log("ACT 2: First Status Recalculation");
console.log("=".repeat(60));

console.log("\n⚖️ Recalculating social hierarchy...\n");
LC.HierarchyEngine.recalculateStatus();

console.log("\n📊 New Social Statuses:");
console.log(`   Эшли: ${L.characters['Эшли'].social.status} (capital: ${L.characters['Эшли'].social.capital})`);
console.log(`   Максим: ${L.characters['Максим'].social.status} (capital: ${L.characters['Максим'].social.capital})`);
console.log(`   Леонид: ${L.characters['Леонид'].social.status} (capital: ${L.characters['Леонид'].social.capital})`);

// ========== ACT 3: Negative Actions Lose Capital ==========
console.log("\n" + "=".repeat(60));
console.log("ACT 3: Леонид's Downfall");
console.log("=".repeat(60));

console.log("\n📖 Леонид ссорится с одноклассником.");
LC.HierarchyEngine.updateCapital('Леонид', { type: 'NEGATIVE_ACTION' });

console.log("📖 Леонид грубит учителю.");
LC.HierarchyEngine.updateCapital('Леонид', { type: 'NEGATIVE_ACTION' });

console.log("📖 Леонид нарушает сильную социальную норму (предательство).");
LC.HierarchyEngine.updateCapital('Леонид', { 
  type: 'NORM_VIOLATION',
  normStrength: 0.9,
  witnessCount: 5
});

console.log("📖 Леонид продолжает конфликтовать.");
LC.HierarchyEngine.updateCapital('Леонид', { type: 'NEGATIVE_ACTION' });

console.log("📖 Леонид нарушает еще одну норму.");
LC.HierarchyEngine.updateCapital('Леонид', { 
  type: 'NORM_VIOLATION',
  normStrength: 0.7,
  witnessCount: 3
});

console.log("📖 Леонид продолжает нарушать нормы.");
LC.HierarchyEngine.updateCapital('Леонид', { type: 'NEGATIVE_ACTION' });
LC.HierarchyEngine.updateCapital('Леонид', { type: 'NEGATIVE_ACTION' });
LC.HierarchyEngine.updateCapital('Леонид', { type: 'NEGATIVE_ACTION' });
LC.HierarchyEngine.updateCapital('Леонид', { type: 'NEGATIVE_ACTION' });
LC.HierarchyEngine.updateCapital('Леонид', { type: 'NEGATIVE_ACTION' });

console.log("\n📊 Social Capital after Леонид's actions:");
console.log(`   Эшли: ${L.characters['Эшли'].social.capital}`);
console.log(`   Максим: ${L.characters['Максим'].social.capital}`);
console.log(`   Леонид: ${L.characters['Леонид'].social.capital}`);

// ========== ACT 4: Becoming an Outcast ==========
console.log("\n" + "=".repeat(60));
console.log("ACT 4: Second Status Recalculation");
console.log("=".repeat(60));

console.log("\n⚖️ Recalculating social hierarchy...\n");
LC.HierarchyEngine.recalculateStatus();

console.log("\n📊 Final Social Statuses:");
console.log(`   Эшли: ${L.characters['Эшли'].social.status} (capital: ${L.characters['Эшли'].social.capital})`);
console.log(`   Максим: ${L.characters['Максим'].social.status} (capital: ${L.characters['Максим'].social.capital})`);
console.log(`   Леонид: ${L.characters['Леонид'].social.status} (capital: ${L.characters['Леонид'].social.capital})`);

// ========== ACT 5: Impact on Gossip ==========
console.log("\n" + "=".repeat(60));
console.log("ACT 5: Social Status Affects Gossip Credibility");
console.log("=".repeat(60));

// Create a rumor
console.log("\n📖 A rumor emerges about Максим...");
L.rumors = [{
  id: 'rumor_001',
  text: 'Максим получил двойку по математике',
  type: 'academic_failure',
  subject: 'Максим',
  target: null,
  spin: 'neutral',
  turn: L.turn,
  knownBy: ['Эшли', 'Леонид'],
  distortion: 0,
  verified: false,
  status: 'ACTIVE'
}];

console.log("\n🗣️ Эшли (leader) tries to spread the rumor...");
let spreadCount = 0;
for (let i = 0; i < 10; i++) {
  const beforeCount = L.rumors[0].knownBy.length;
  // Simulate spreading to a new person
  L.rumors[0].knownBy = ['Эшли', 'Леонид']; // Reset
  const testChar = 'TestChar' + i;
  L.characters[testChar] = { mentions: 1, lastSeen: L.turn, status: 'ACTIVE' };
  
  // Try to spread from Эшли
  LC.GossipEngine.Propagator.spreadRumor('rumor_001', 'Эшли', testChar);
  if (L.rumors[0].knownBy.includes(testChar)) spreadCount++;
}
console.log(`   Success rate: ${spreadCount}/10 attempts (expected ~15/10 with 1.5x multiplier)`);

console.log("\n🗣️ Леонид (outcast) tries to spread the same rumor...");
L.rumors[0].knownBy = ['Эшли', 'Леонид']; // Reset
spreadCount = 0;
for (let i = 0; i < 10; i++) {
  const testChar = 'TestChar2_' + i;
  L.characters[testChar] = { mentions: 1, lastSeen: L.turn, status: 'ACTIVE' };
  
  // Try to spread from Леонид
  LC.GossipEngine.Propagator.spreadRumor('rumor_001', 'Леонид', testChar);
  if (L.rumors[0].knownBy.includes(testChar)) spreadCount++;
}
console.log(`   Success rate: ${spreadCount}/10 attempts (expected ~2/10 with 0.2x multiplier)`);

// ========== ACT 6: Context Overlay ==========
console.log("\n" + "=".repeat(60));
console.log("ACT 6: Context Overlay Shows Status");
console.log("=".repeat(60));

console.log("\n🎭 Generating AI context overlay...\n");
const overlay = LC.composeContextOverlay({});
const overlayText = overlay.text || '';

// Extract STATUS tags
const statusMatches = overlayText.match(/⟦STATUS:[^⟧]+⟧[^⟦]*/g);
if (statusMatches && statusMatches.length > 0) {
  console.log("📋 STATUS Tags in Context:");
  statusMatches.forEach(match => {
    console.log(`   ${match.trim()}`);
  });
} else {
  console.log("📋 STATUS Tags in Context:");
  console.log("   (Characters must be in HOT window to show STATUS tags)");
  console.log("   Current statuses:");
  console.log(`   - Эшли: ${L.characters['Эшли'].social.status}`);
  console.log(`   - Леонид: ${L.characters['Леонид'].social.status}`);
}

// ========== Summary ==========
console.log("\n" + "=".repeat(60));
console.log("SUMMARY");
console.log("=".repeat(60));

console.log("\n✨ The Social Engine demonstrates:");
console.log("   1. Characters build/lose social capital through actions");
console.log("   2. Status dynamically changes based on capital");
console.log("   3. Leaders have more influence (rumors spread better)");
console.log("   4. Outcasts have less credibility (rumors ignored)");
console.log("   5. Status appears in AI context as ⟦STATUS⟧ tags");

console.log("\n🎯 Final Results:");
console.log(`   Эшли: ${L.characters['Эшли'].social.status.toUpperCase()} (${L.characters['Эшли'].social.capital} capital)`);
console.log(`   Максим: ${L.characters['Максим'].social.status.toUpperCase()} (${L.characters['Максим'].social.capital} capital)`);
console.log(`   Леонид: ${L.characters['Леонид'].social.status.toUpperCase()} (${L.characters['Леонид'].social.capital} capital)`);

console.log("\n🎉 Demo complete!\n");
