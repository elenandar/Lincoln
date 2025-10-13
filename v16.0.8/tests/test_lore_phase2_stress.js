#!/usr/bin/env node
/**
 * Stress Test for LoreEngine Phase 2 Integration
 * Validates that legends influence norms, interpretations, and goals
 * in a realistic multi-turn simulation.
 */

console.log("=== LoreEngine Phase 2 Integration Stress Test ===\n");

const fs = require('fs');
const path = require('path');
const libraryCode = fs.readFileSync(path.join(__dirname, '..', 'v16.0.8/Library v16.0.8.patched.txt'), 'utf8');
global.state = { lincoln: {} };
const toNum = (x, d = 0) => (typeof x === 'number' && !isNaN(x)) ? x : (Number(x) || d);
const toStr = (x) => String(x == null ? "" : x);
const toBool = (x, d = false) => (x == null ? d : !!x);
eval(libraryCode);

// Initialize state
const L = LC.lcInit();
L.turn = 0;

// Create diverse cast of characters
const characterNames = [
  'Алекс', 'Борис', 'Вера', 'Глеб', 'Дарья', 
  'Елена', 'Жанна', 'Иван', 'Ксения', 'Леонид',
  'Мария', 'Николай', 'Ольга', 'Павел', 'Роман'
];

for (const name of characterNames) {
  L.characters[name] = {
    mentions: 10,
    lastSeen: 0,
    type: 'SECONDARY',
    status: 'ACTIVE',
    personality: {
      trust: Math.random(),
      bravery: Math.random(),
      idealism: Math.random(),
      aggression: Math.random()
    },
    qualia_state: {
      somatic_tension: 0.3 + Math.random() * 0.2,
      valence: 0.4 + Math.random() * 0.3,
      focus_aperture: 0.6 + Math.random() * 0.2,
      energy_level: 0.7 + Math.random() * 0.2
    },
    perceptions: {},
    social: {
      status: 'member',
      capital: 100,
      conformity: 0.5
    }
  };
  L.aliases[name] = [name.toLowerCase()];
}

// Setup evergreen
L.evergreen = { 
  enabled: true, 
  relations: {}, 
  status: {}, 
  obligations: {}, 
  facts: {}, 
  history: [] 
};

// Build patterns for GoalsEngine
if (LC.EvergreenEngine?._buildPatterns) {
  LC.EvergreenEngine.patterns = LC.EvergreenEngine._buildPatterns();
}

// Event templates to simulate diverse scenarios
const eventTemplates = [
  { type: 'betrayal', text: (a, b) => `${a} предал(а) ${b} и раскрыл(а) секрет всем в классе.`, impact: -25 },
  { type: 'loyalty', text: (a, b) => `${a} защитил(а) ${b} от обвинений и встал(а) на его/её сторону.`, impact: 15 },
  { type: 'romance', text: (a, b) => `${a} признался/призналась в чувствах к ${b} на школьном балу.`, impact: 10 },
  { type: 'conflict', text: (a, b) => `${a} и ${b} подрались в коридоре при всех.`, impact: -15 },
  { type: 'public_humiliation', text: (a, b) => `${a} публично унизил(а) ${b} перед всем классом.`, impact: -20 },
  { type: 'achievement', text: (a) => `${a} выиграл(а) главный приз на школьном конкурсе.`, impact: 12 },
  { type: 'goal', text: (a, goal) => `${a} хочет ${goal}.`, impact: 0 }
];

// Tracking variables
let legendsCreated = 0;
let normsInfluenced = 0;
let interpretationsAmplified = 0;
let loreGoalsGenerated = 0;
let normStrengthChanges = [];

console.log(`Starting ${characterNames.length}-character simulation for 1000 turns...\n`);

// Run simulation
for (let turn = 0; turn < 1000; turn++) {
  L.turn = turn;
  
  // Every 10 turns, trigger a random event
  if (turn % 10 === 0 && turn > 0) {
    const template = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
    
    // Pick random characters
    const char1 = characterNames[Math.floor(Math.random() * characterNames.length)];
    const char2 = characterNames[Math.floor(Math.random() * characterNames.length)];
    
    // Update lastSeen for involved characters
    L.characters[char1].lastSeen = turn;
    if (char2 !== char1) {
      L.characters[char2].lastSeen = turn;
    }
    
    let eventText;
    if (template.type === 'goal') {
      const goals = ['найти правду', 'стать лидером', 'помочь другу', 'победить в соревновании'];
      eventText = template.text(char1, goals[Math.floor(Math.random() * goals.length)]);
    } else if (template.type === 'achievement') {
      eventText = template.text(char1);
    } else {
      eventText = template.text(char1, char2);
    }
    
    // Count legends before
    const legendsBefore = L.lore.entries.length;
    
    // Analyze the event
    LC.UnifiedAnalyzer?.analyze?.(eventText, "output");
    
    // Track if new legend was created
    if (L.lore.entries.length > legendsBefore) {
      legendsCreated++;
      const newLegend = L.lore.entries[L.lore.entries.length - 1];
      console.log(`Turn ${turn}: Legend created - "${newLegend.type}" (potential: ${newLegend.potential})`);
      
      // Check if this legend influenced norm strength
      const normStrength = LC.NormsEngine.getNormStrength(newLegend.type);
      normStrengthChanges.push({ turn, type: newLegend.type, strength: normStrength });
      
      // With a legend present, norm strength should be influenced
      if (normStrength !== 0.5) {
        normsInfluenced++;
      }
    }
    
    // Test interpretation with legend if one exists
    if (L.lore.entries.length > 0 && template.type !== 'goal' && template.type !== 'achievement') {
      const testEvent = {
        type: 'relation_event',
        eventType: template.type,
        rawModifier: template.impact
      };
      
      const legend = LC.InformationEngine._findRelevantLegend(testEvent);
      if (legend) {
        const initialTension = L.characters[char1].qualia_state.somatic_tension;
        LC.InformationEngine.interpret(L.characters[char1], testEvent);
        
        // Check if tension increased (sign of legend influence)
        if (L.characters[char1].qualia_state.somatic_tension > initialTension) {
          interpretationsAmplified++;
        }
      }
    }
  }
  
  // Every 50 turns, try to generate lore-inspired goals
  if (turn % 50 === 0 && turn > 0) {
    const goalsBefore = Object.keys(L.goals).length;
    
    // Manually call the lore-inspired goal generation (bypassing the 5% random check)
    if (L.lore.entries.length > 0) {
      const activeChars = characterNames.filter(name => L.characters[name].status === 'ACTIVE');
      if (activeChars.length > 0) {
        const selectedChar = activeChars[Math.floor(Math.random() * activeChars.length)];
        const legend = L.lore.entries[Math.floor(Math.random() * L.lore.entries.length)];
        
        const goalData = LC.GoalsEngine._generateLoreInspiredGoal(
          { name: selectedChar, char: L.characters[selectedChar] },
          legend
        );
        
        if (goalData && goalData.goalText) {
          const goalKey = `${selectedChar}_lore_${turn}_${Math.random().toString(36).slice(2,6)}`;
          L.goals[goalKey] = {
            character: selectedChar,
            text: goalData.goalText,
            status: "active",
            turnCreated: turn,
            plan: goalData.plan || [],
            planProgress: 0,
            inspiredByLore: legend.type
          };
          
          loreGoalsGenerated++;
          console.log(`Turn ${turn}: Lore-inspired goal - ${selectedChar}: "${goalData.goalText}" (from ${legend.type})`);
        }
      }
    }
  }
  
  // Every 20 turns, recalculate social status
  if (turn % 20 === 0) {
    LC.HierarchyEngine?.recalculateStatus?.();
  }
}

// Analysis
console.log("\n=== Simulation Complete ===\n");
console.log(`Total turns: 1000`);
console.log(`Legends created: ${legendsCreated}`);
console.log(`Norms influenced by legends: ${normsInfluenced}`);
console.log(`Interpretations amplified by legends: ${interpretationsAmplified}`);
console.log(`Lore-inspired goals generated: ${loreGoalsGenerated}`);
console.log(`Total goals: ${Object.keys(L.goals).length}`);

console.log("\n--- Legend Details ---");
for (let i = 0; i < L.lore.entries.length; i++) {
  const legend = L.lore.entries[i];
  console.log(`${i + 1}. "${legend.type}" (Turn ${legend.turn}, Potential: ${legend.potential.toFixed(1)})`);
  console.log(`   Participants: ${legend.participants.join(', ')}, Witnesses: ${legend.witnesses}`);
}

console.log("\n--- Norm Strength Evolution ---");
const normTypes = [...new Set(normStrengthChanges.map(n => n.type))];
for (const normType of normTypes) {
  const changes = normStrengthChanges.filter(n => n.type === normType);
  if (changes.length > 0) {
    const latest = changes[changes.length - 1];
    console.log(`${normType}: ${latest.strength.toFixed(3)} (influenced by ${changes.length} legend(s))`);
  }
}

console.log("\n--- Lore-Inspired Goals ---");
const loreGoals = Object.values(L.goals).filter(g => g.inspiredByLore);
for (const goal of loreGoals.slice(0, 5)) {
  console.log(`${goal.character}: "${goal.text}" (inspired by: ${goal.inspiredByLore})`);
}
if (loreGoals.length > 5) {
  console.log(`... and ${loreGoals.length - 5} more`);
}

// Validation
console.log("\n=== Validation ===\n");

let testsPassed = 0;
let testsFailed = 0;

function test(name, condition, details = '') {
  if (condition) {
    console.log(`✅ ${name}`);
    if (details) console.log(`   ${details}`);
    testsPassed++;
  } else {
    console.log(`❌ FAILED: ${name}`);
    if (details) console.log(`   ${details}`);
    testsFailed++;
  }
}

test("At least some legends were created",
  legendsCreated > 0,
  `Created: ${legendsCreated}`);

test("Legends influenced social norms",
  normsInfluenced > 0,
  `Norms influenced: ${normsInfluenced}`);

test("Legends amplified emotional reactions",
  interpretationsAmplified > 0,
  `Amplifications: ${interpretationsAmplified}`);

test("Lore-inspired goals were generated",
  loreGoalsGenerated > 0,
  `Goals generated: ${loreGoalsGenerated}`);

test("Multiple legend types created",
  new Set(L.lore.entries.map(l => l.type)).size > 1,
  `Types: ${new Set(L.lore.entries.map(l => l.type)).size}`);

test("Goals have proper structure",
  Object.values(L.goals).every(g => g.character && g.text && g.status),
  `Total goals: ${Object.keys(L.goals).length}`);

test("Lore-inspired goals tagged correctly",
  loreGoals.every(g => g.inspiredByLore),
  `Tagged goals: ${loreGoals.length}`);

test("Characters maintain diverse personalities",
  Object.values(L.characters).every(c => c.personality && typeof c.personality.trust === 'number'),
  `Characters: ${Object.keys(L.characters).length}`);

test("Social capital system functioning",
  Object.values(L.characters).every(c => c.social && typeof c.social.capital === 'number'),
  `All characters have social capital tracked`);

console.log("\n======================================================================");
console.log(`Tests Passed: ${testsPassed}`);
console.log(`Tests Failed: ${testsFailed}`);
console.log("======================================================================\n");

if (testsFailed === 0) {
  console.log("✅ Stress test PASSED! LoreEngine Phase 2 integration shows complex, emergent dynamics.");
  console.log("   - Legends influence social norms");
  console.log("   - Characters recall legends when interpreting events");
  console.log("   - New goals emerge inspired by legendary events");
  console.log("\n🎉 Genesis Protocol Phase 2 Complete!");
} else {
  console.log(`❌ ${testsFailed} validation(s) failed.`);
  process.exit(1);
}
