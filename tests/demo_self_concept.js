#!/usr/bin/env node
/**
 * Demo script showcasing Self-Concept (Я-Концепция) functionality
 * 
 * This script demonstrates how formative events primarily change
 * self-perception rather than objective personality, creating 
 * internal conflicts and psychological depth.
 */

const fs = require('fs');
const path = require('path');

console.log("╔══════════════════════════════════════════════════════════╗");
console.log("║      SELF-CONCEPT DEMO (Я-КОНЦЕПЦИЯ)                    ║");
console.log("║   The Inner World of Character Psychology               ║");
console.log("╚══════════════════════════════════════════════════════════╝\n");

// Load library code
const libraryCode = fs.readFileSync(path.join(__dirname, 'v16.0.8/Library v16.0.8.patched.txt'), 'utf8');

// Set up global state
global.state = { lincoln: {} };

// Execute library code
eval(libraryCode);

const L = LC.lcInit();

// Capture director messages
const directorMessages = [];
LC.lcSys = function(msg) {
  if (typeof msg === 'object' && msg.text) {
    directorMessages.push(msg.text);
  } else if (typeof msg === 'string') {
    directorMessages.push(msg);
  }
};

console.log("═══════════════════════════════════════════════════════════\n");
console.log("📖 STORY: The Psychology of Self-Perception\n");
console.log("Three students at Lincoln Heights experience events that");
console.log("change not who they ARE, but who they THINK they are.\n");
console.log("─────────────────────────────────────────────────────────\n");

// ============================================================
// ACT 1: INTRODUCTION
// ============================================================

console.log("ACT 1: THREE STUDENTS, THREE PERSPECTIVES\n");

L.turn = 1;
L.characters = {
  'Мария': {
    mentions: 10,
    lastSeen: 1,
    type: 'MAIN',
    status: 'ACTIVE',
    personality: {
      trust: 0.7,        // Actually quite trusting
      bravery: 0.6,      // Actually fairly brave
      idealism: 0.8,     // Very idealistic
      aggression: 0.2
    },
    self_concept: {
      perceived_trust: 0.7,
      perceived_bravery: 0.6,
      perceived_idealism: 0.8,
      perceived_aggression: 0.2
    }
  },
  'Артём': {
    mentions: 10,
    lastSeen: 1,
    type: 'SECONDARY',
    status: 'ACTIVE',
    personality: {
      trust: 0.5,
      bravery: 0.4,      // Not particularly brave
      idealism: 0.5,
      aggression: 0.3
    },
    self_concept: {
      perceived_trust: 0.5,
      perceived_bravery: 0.4,
      perceived_idealism: 0.5,
      perceived_aggression: 0.3
    }
  }
};

console.log("👤 МАРИЯ:");
console.log("   Reality:      Trust 0.7 | Bravery 0.6 | Idealism 0.8");
console.log("   Self-Concept: Trust 0.7 | Bravery 0.6 | Idealism 0.8");
console.log("   (Aligned personality - knows herself well)\n");

console.log("👤 АРТЁМ:");
console.log("   Reality:      Trust 0.5 | Bravery 0.4 | Idealism 0.5");
console.log("   Self-Concept: Trust 0.5 | Bravery 0.4 | Idealism 0.5");
console.log("   (Aligned personality - average self-awareness)\n");

// ============================================================
// ACT 2: THE BETRAYAL
// ============================================================

console.log("─────────────────────────────────────────────────────────\n");
console.log("ACT 2: МАРИЯ'S BETRAYAL - THE SHATTERING OF SELF\n");

console.log("📝 Event: Мария's closest friend spreads her private secrets");
console.log("          across social media. The betrayal is public and humiliating.\n");

directorMessages.length = 0;

LC.Crucible.analyzeEvent({
  type: 'RELATION_CHANGE',
  character: 'Мария',
  otherCharacter: 'Бывшая подруга',
  change: -60,
  finalValue: -50
});

const maria = L.characters['Мария'];

console.log("💔 AFTERMATH:\n");
console.log("   OBJECTIVE PERSONALITY (who she really is):");
console.log(`      Trust: ${maria.personality.trust.toFixed(2)} (was 0.70, decreased slightly)`);
console.log(`      Idealism: ${maria.personality.idealism.toFixed(2)} (was 0.80, decreased slightly)\n`);

console.log("   SELF-CONCEPT (who she thinks she is):");
console.log(`      Perceived Trust: ${maria.self_concept.perceived_trust.toFixed(2)} (was 0.70, PLUMMETED!)`);
console.log(`      Perceived Idealism: ${maria.self_concept.perceived_idealism.toFixed(2)} (was 0.80, fell hard)\n`);

console.log("   💭 PSYCHOLOGICAL INSIGHT:");
console.log("      Мария is OBJECTIVELY still fairly trusting (0.60).");
console.log("      But she now SEES HERSELF as deeply cynical (0.45).");
console.log("      This gap is INTERNAL CONFLICT - she doesn't recognize");
console.log("      her own capacity to trust.\n");

if (directorMessages.length > 0) {
  console.log(`   📢 Director: ${directorMessages[0]}\n`);
}

// ============================================================
// ACT 3: THE TRIUMPH
// ============================================================

console.log("─────────────────────────────────────────────────────────\n");
console.log("ACT 3: АРТЁМ'S TRIUMPH - NEWFOUND CONFIDENCE\n");

console.log("📝 Event: Артём achieves an important goal - winning the");
console.log("          school's science fair against tough competition.\n");

directorMessages.length = 0;

LC.Crucible.analyzeEvent({
  type: 'GOAL_COMPLETE',
  character: 'Артём',
  success: true
});

const artem = L.characters['Артём'];

console.log("🏆 AFTERMATH:\n");
console.log("   OBJECTIVE PERSONALITY (who he really is):");
console.log(`      Bravery: ${artem.personality.bravery.toFixed(2)} (was 0.40, slight increase)`);
console.log(`      Idealism: ${artem.personality.idealism.toFixed(2)} (was 0.50, slight increase)\n`);

console.log("   SELF-CONCEPT (who he thinks he is):");
console.log(`      Perceived Bravery: ${artem.self_concept.perceived_bravery.toFixed(2)} (was 0.40, BIG BOOST!)`);
console.log(`      Perceived Idealism: ${artem.self_concept.perceived_idealism.toFixed(2)} (was 0.50, significant rise)\n`);

console.log("   💭 PSYCHOLOGICAL INSIGHT:");
console.log("      Артём is OBJECTIVELY only a bit braver (0.45).");
console.log("      But he now FEELS like a hero (0.55 perceived bravery).");
console.log("      Success breeds confidence that exceeds reality!\n");

if (directorMessages.length > 0) {
  console.log(`   📢 Director: ${directorMessages[0]}\n`);
}

// ============================================================
// ACT 4: CONTEXT OVERLAY - HOW THE AI SEES THEM
// ============================================================

console.log("─────────────────────────────────────────────────────────\n");
console.log("ACT 4: INSIDE THEIR MINDS - CONTEXT OVERLAY\n");

console.log("📝 The AI's view of these characters in the current scene:\n");

L.turn = 30;
maria.lastSeen = 30;
artem.lastSeen = 30;

const context = LC.composeContextOverlay({ limit: 2000 });
const contextLines = context.text.split('\n');

console.log("🎭 CONTEXT FOR МАРИЯ:\n");
for (const line of contextLines) {
  if (line.includes('Мария')) {
    console.log(`   ${line}`);
  }
}

console.log("\n🎭 CONTEXT FOR АРТЁМ:\n");
for (const line of contextLines) {
  if (line.includes('Артём')) {
    console.log(`   ${line}`);
  }
}

// ============================================================
// EPILOGUE: THE PHILOSOPHY
// ============================================================

console.log("\n─────────────────────────────────────────────────────────\n");
console.log("EPILOGUE: THE PHILOSOPHY OF SELF-CONCEPT\n");

console.log("📊 COMPARISON TABLE:\n");
console.log("МАРИЯ (after betrayal):");
console.log("   ┌─────────────┬──────────┬──────────────┬──────────────┐");
console.log("   │ Trait       │ Actual   │ Self-Concept │ Difference   │");
console.log("   ├─────────────┼──────────┼──────────────┼──────────────┤");
console.log(`   │ Trust       │   ${maria.personality.trust.toFixed(2)}   │     ${maria.self_concept.perceived_trust.toFixed(2)}     │    -${(maria.personality.trust - maria.self_concept.perceived_trust).toFixed(2)}     │`);
console.log(`   │ Idealism    │   ${maria.personality.idealism.toFixed(2)}   │     ${maria.self_concept.perceived_idealism.toFixed(2)}     │    -${(maria.personality.idealism - maria.self_concept.perceived_idealism).toFixed(2)}     │`);
console.log("   └─────────────┴──────────┴──────────────┴──────────────┘");
console.log("   Мария underestimates her own capacity for trust and hope.\n");

console.log("АРТЁМ (after triumph):");
console.log("   ┌─────────────┬──────────┬──────────────┬──────────────┐");
console.log("   │ Trait       │ Actual   │ Self-Concept │ Difference   │");
console.log("   ├─────────────┼──────────┼──────────────┼──────────────┤");
console.log(`   │ Bravery     │   ${artem.personality.bravery.toFixed(2)}   │     ${artem.self_concept.perceived_bravery.toFixed(2)}     │    +${(artem.self_concept.perceived_bravery - artem.personality.bravery).toFixed(2)}     │`);
console.log(`   │ Idealism    │   ${artem.personality.idealism.toFixed(2)}   │     ${artem.self_concept.perceived_idealism.toFixed(2)}     │    +${(artem.self_concept.perceived_idealism - artem.personality.idealism).toFixed(2)}     │`);
console.log("   └─────────────┴──────────┴──────────────┴──────────────┘");
console.log("   Артём overestimates his bravery - confidence exceeds reality.\n");

console.log("─────────────────────────────────────────────────────────\n");
console.log("✨ KEY INSIGHTS:\n");
console.log("1. FORMATIVE EVENTS primarily change SELF-PERCEPTION");
console.log("   (how we see ourselves) rather than objective traits.\n");

console.log("2. NEGATIVE EVENTS (betrayal, humiliation) damage self-concept");
console.log("   MORE than they change actual personality.\n");

console.log("3. POSITIVE EVENTS (success, rescue) boost self-confidence");
console.log("   MORE than they change actual capabilities.\n");

console.log("4. The GAP between reality and self-perception creates");
console.log("   INTERNAL CONFLICT that drives character depth.\n");

console.log("5. The AI sees characters through their SELF-CONCEPT,");
console.log("   making their behavior match their BELIEFS about themselves.\n");

console.log("─────────────────────────────────────────────────────────\n");
console.log("🎭 This is psychological realism:");
console.log("   We are shaped not by what happens to us,");
console.log("   but by what we BELIEVE happened to us.\n");
console.log("═══════════════════════════════════════════════════════════\n");
