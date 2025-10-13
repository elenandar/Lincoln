#!/usr/bin/env node
/**
 * Demo script showcasing Qualia Engine functionality
 * 
 * This script demonstrates:
 * 1. Automatic qualia state initialization
 * 2. Event-to-sensation mapping
 * 3. Group resonance (emotional contagion)
 * 4. Integration with LivingWorld
 */

const fs = require('fs');
const path = require('path');

console.log("╔══════════════════════════════════════════════════════════╗");
console.log("║         QUALIA ENGINE DEMONSTRATION                      ║");
console.log("║    The Phenomenal Core of NPC Consciousness             ║");
console.log("╚══════════════════════════════════════════════════════════╝\n");

// Load library code
const libraryCode = fs.readFileSync(path.join(__dirname, 'v16.0.8/Library v16.0.8.patched.txt'), 'utf8');

// Set up global state
global.state = { lincoln: {} };

// Execute library code
eval(libraryCode);

const L = LC.lcInit();

// Helper function to display qualia state
function displayQualia(charName) {
  const char = L.characters[charName];
  if (!char || !char.qualia_state) return;
  
  const qs = char.qualia_state;
  console.log(`  ${charName}:`);
  console.log(`    Напряжение (tension):  ${'█'.repeat(Math.floor(qs.somatic_tension * 20))}${'░'.repeat(20 - Math.floor(qs.somatic_tension * 20))} ${(qs.somatic_tension * 100).toFixed(0)}%`);
  console.log(`    Настроение (valence):  ${'█'.repeat(Math.floor(qs.valence * 20))}${'░'.repeat(20 - Math.floor(qs.valence * 20))} ${(qs.valence * 100).toFixed(0)}%`);
  console.log(`    Фокус (focus):         ${'█'.repeat(Math.floor(qs.focus_aperture * 20))}${'░'.repeat(20 - Math.floor(qs.focus_aperture * 20))} ${(qs.focus_aperture * 100).toFixed(0)}%`);
  console.log(`    Энергия (energy):      ${'█'.repeat(Math.floor(qs.energy_level * 20))}${'░'.repeat(20 - Math.floor(qs.energy_level * 20))} ${(qs.energy_level * 100).toFixed(0)}%`);
}

// Demo 1: Character Creation with Qualia
console.log("═══════════════════════════════════════════════════════════");
console.log("DEMO 1: Automatic Qualia State Initialization");
console.log("═══════════════════════════════════════════════════════════\n");

L.turn = 1;
L.aliases = {
  'Максим': ['максим', 'макс'],
  'Хлоя': ['хлоя'],
  'Борис': ['борис']
};

console.log("Creating characters...\n");
LC.updateCharacterActivity("Максим, Хлоя и Борис вошли в класс.", false);

console.log("✓ Characters created with qualia_state:\n");
displayQualia('Максим');
console.log();
displayQualia('Хлоя');
console.log();
displayQualia('Борис');
console.log("\n");

// Demo 2: Event Processing
console.log("═══════════════════════════════════════════════════════════");
console.log("DEMO 2: Event-to-Sensation Mapping");
console.log("═══════════════════════════════════════════════════════════\n");

console.log("Event: Максим compliments Хлоя\n");
console.log("Before:");
displayQualia('Хлоя');

LC.QualiaEngine.resonate(L.characters['Хлоя'], {
  type: 'social',
  actor: 'Максим',
  action: 'compliment',
  target: 'Хлоя',
  intensity: 1.0
});

console.log("\nAfter compliment:");
displayQualia('Хлоя');
console.log("\n→ Notice: valence ↑ (more pleasant), tension ↓ (more relaxed)\n");

console.log("Event: Борис threatens Максим\n");
console.log("Before:");
displayQualia('Максим');

LC.QualiaEngine.resonate(L.characters['Максим'], {
  type: 'social',
  actor: 'Борис',
  action: 'threat',
  target: 'Максим',
  intensity: 1.0
});

console.log("\nAfter threat:");
displayQualia('Максим');
console.log("\n→ Notice: valence ↓ (unpleasant), tension ↑ (stressed), focus ↓ (tunnel vision)\n");

// Demo 3: Group Resonance
console.log("═══════════════════════════════════════════════════════════");
console.log("DEMO 3: Emotional Contagion (Group Resonance)");
console.log("═══════════════════════════════════════════════════════════\n");

// Reset states to extremes
L.characters['Максим'].qualia_state = {
  somatic_tension: 0.9,  // Very tense
  valence: 0.2,          // Very negative
  focus_aperture: 0.3,
  energy_level: 0.5
};

L.characters['Хлоя'].qualia_state = {
  somatic_tension: 0.1,  // Very calm
  valence: 0.9,          // Very positive
  focus_aperture: 0.9,
  energy_level: 0.9
};

L.characters['Борис'].qualia_state = {
  somatic_tension: 0.5,
  valence: 0.5,
  focus_aperture: 0.5,
  energy_level: 0.7
};

console.log("Initial states (extreme differences):\n");
displayQualia('Максим');
console.log();
displayQualia('Хлоя');
console.log();
displayQualia('Борис');

console.log("\n\nRunning group resonance (5 cycles)...\n");

for (let i = 0; i < 5; i++) {
  LC.QualiaEngine.runGroupResonance(['Максим', 'Хлоя', 'Борис'], 0.2);
}

console.log("After emotional contagion:\n");
displayQualia('Максим');
console.log();
displayQualia('Хлоя');
console.log();
displayQualia('Борис');

console.log("\n→ Notice: States converged toward group average");
console.log("→ Shared 'atmosphere' emerged in the room\n");

// Demo 4: LivingWorld Integration
console.log("═══════════════════════════════════════════════════════════");
console.log("DEMO 4: Integration with LivingWorld Engine");
console.log("═══════════════════════════════════════════════════════════\n");

// Reset to neutral
L.characters['Максим'].qualia_state = {
  somatic_tension: 0.3,
  valence: 0.5,
  focus_aperture: 0.7,
  energy_level: 0.8
};

L.characters['Хлоя'].qualia_state = {
  somatic_tension: 0.3,
  valence: 0.5,
  focus_aperture: 0.7,
  energy_level: 0.8
};

// Initialize relations
L.evergreen = { enabled: true, relations: {} };
LC.RelationsEngine.updateRelation('Максим', 'Хлоя', 40);

console.log("Scenario: Максим performs positive social action toward Хлоя\n");
console.log("Before:");
displayQualia('Максим');
console.log();
displayQualia('Хлоя');

console.log("\nExecuting: LC.LivingWorld.generateFact('Максим', { type: 'SOCIAL_POSITIVE', target: 'Хлоя' })...\n");

LC.LivingWorld.generateFact('Максим', {
  type: 'SOCIAL_POSITIVE',
  target: 'Хлоя',
  mood: 'HAPPY'
});

console.log("After:");
displayQualia('Максим');
console.log();
displayQualia('Хлоя');

console.log("\n→ Notice: Both characters' qualia updated automatically");
console.log("→ Хлоя received compliment (higher valence, lower tension)");
console.log("→ Максим gave kindness (slight positive effect)\n");

// Summary
console.log("═══════════════════════════════════════════════════════════");
console.log("SUMMARY");
console.log("═══════════════════════════════════════════════════════════\n");

console.log("The Qualia Engine successfully simulates:");
console.log("  ✓ Raw bodily sensations (pre-cognitive layer)");
console.log("  ✓ Event-to-sensation direct mapping");
console.log("  ✓ Emotional contagion in groups");
console.log("  ✓ Automatic integration with character actions");
console.log("\nThis creates a visceral, embodied foundation for all");
console.log("higher-level consciousness systems in Lincoln NPCs.\n");

console.log("═══════════════════════════════════════════════════════════\n");
