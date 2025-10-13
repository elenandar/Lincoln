#!/usr/bin/env node
/**
 * Demo: Character Evolution Engine (The Crucible)
 * 
 * This demo showcases how The Crucible transforms NPC personalities
 * through formative experiences. We'll follow three characters through
 * different life-changing events.
 */

console.log("═══════════════════════════════════════════════════════════");
console.log("  CHARACTER EVOLUTION ENGINE (THE CRUCIBLE) - DEMO");
console.log("═══════════════════════════════════════════════════════════\n");

const fs = require('fs');
const path = require('path');

// Load library
const libraryCode = fs.readFileSync(path.join(__dirname, 'v16.0.8/Library v16.0.8.patched.txt'), 'utf8');
global.state = { lincoln: {} };
eval(libraryCode);

// Set up message capturing
const directorMessages = [];
LC.lcSys = function(msg) {
  if (typeof msg === 'object' && msg.text && msg.level === 'director') {
    directorMessages.push(msg.text);
    console.log(`📢 [DIRECTOR]: ${msg.text}`);
  }
};

const L = LC.lcInit();
L.turn = 1;

console.log("📖 STORY: Three students at Lincoln Heights School\n");
console.log("─────────────────────────────────────────────────────────\n");

// ============================================================
// ACT 1: INTRODUCTION
// ============================================================

console.log("ACT 1: INTRODUCTION\n");

L.characters = {
  'Алекс': {
    mentions: 15,
    lastSeen: 1,
    type: 'MAIN',
    status: 'ACTIVE',
    personality: {
      trust: 0.7,      // Trusting
      bravery: 0.5,    // Average courage
      idealism: 0.8,   // Highly idealistic
      aggression: 0.2  // Peaceful
    }
  },
  'Саша': {
    mentions: 12,
    lastSeen: 1,
    type: 'SECONDARY',
    status: 'ACTIVE',
    personality: {
      trust: 0.5,
      bravery: 0.3,    // Somewhat timid
      idealism: 0.6,
      aggression: 0.3
    }
  },
  'Виктор': {
    mentions: 10,
    lastSeen: 1,
    type: 'SECONDARY',
    status: 'ACTIVE',
    personality: {
      trust: 0.6,
      bravery: 0.7,    // Brave
      idealism: 0.5,
      aggression: 0.4
    }
  }
};

console.log("👤 АЛЕКС: Trusting idealist, believes in the good in people");
console.log("   Trust: 0.7 | Bravery: 0.5 | Idealism: 0.8 | Aggression: 0.2");
console.log("");
console.log("👤 САША: Cautious and timid, plays it safe");
console.log("   Trust: 0.5 | Bravery: 0.3 | Idealism: 0.6 | Aggression: 0.3");
console.log("");
console.log("👤 ВИКТОР: Brave and confident, natural leader");
console.log("   Trust: 0.6 | Bravery: 0.7 | Idealism: 0.5 | Aggression: 0.4");
console.log("\n");

// ============================================================
// ACT 2: THE BETRAYAL
// ============================================================

console.log("─────────────────────────────────────────────────────────\n");
console.log("ACT 2: THE BETRAYAL\n");

console.log("📝 Event: Алекс discovers that his best friend betrayed him,");
console.log("          revealing his secrets to the entire school.\n");

L.evergreen = { relations: {} };

// Simulate massive betrayal - even more severe for demo purposes
LC.Crucible.analyzeEvent({
  type: 'RELATION_CHANGE',
  character: 'Алекс',
  otherCharacter: 'Бывший_друг',
  change: -60,  // Massive negative change
  finalValue: -50
});

// Apply a second betrayal to push trust even lower for demo visibility
LC.Crucible.analyzeEvent({
  type: 'RELATION_CHANGE',
  character: 'Алекс',
  otherCharacter: 'Другой_предатель',
  change: -50,
  finalValue: -70
});

console.log("");
console.log("💔 AFTERMATH:");
const alex = L.characters['Алекс'];
console.log(`   Trust: ${alex.personality.trust.toFixed(2)} (was 0.70)`);
console.log(`   Idealism: ${alex.personality.idealism.toFixed(2)} (was 0.80)`);
console.log("");
console.log("   ⚡ Алекс has fundamentally changed. The naive idealist");
console.log("      is now more guarded, less trusting of others.\n");

// ============================================================
// ACT 3: THE RESCUE
// ============================================================

console.log("─────────────────────────────────────────────────────────\n");
console.log("ACT 3: THE RESCUE\n");

console.log("📝 Event: Саша is being bullied. Виктор steps in to defend");
console.log("          her, risking his reputation and safety.\n");

directorMessages.length = 0;

LC.Crucible.analyzeEvent({
  type: 'RELATION_CHANGE',
  character: 'Саша',
  otherCharacter: 'Виктор',
  change: 55,   // Heroic rescue
  finalValue: 85
});

console.log("");
console.log("❤️ AFTERMATH:");
const sasha = L.characters['Саша'];
console.log(`   Trust: ${sasha.personality.trust.toFixed(2)} (was 0.50)`);
console.log(`   Bravery: ${sasha.personality.bravery.toFixed(2)} (was 0.30)`);
console.log("");
console.log("   ⚡ Саша learned that standing up for yourself is possible.");
console.log("      She's braver now, more willing to trust good people.\n");

// ============================================================
// ACT 4: THE TRIUMPH
// ============================================================

console.log("─────────────────────────────────────────────────────────\n");
console.log("ACT 4: THE TRIUMPH\n");

console.log("📝 Event: Виктор achieves his long-held goal of becoming");
console.log("          captain of the debate team.\n");

directorMessages.length = 0;

LC.Crucible.analyzeEvent({
  type: 'GOAL_COMPLETE',
  character: 'Виктор',
  success: true
});

console.log("");
console.log("🏆 AFTERMATH:");
const viktor = L.characters['Виктор'];
console.log(`   Bravery: ${viktor.personality.bravery.toFixed(2)} (was 0.70)`);
console.log(`   Idealism: ${viktor.personality.idealism.toFixed(2)} (was 0.50)`);
console.log("");
console.log("   ⚡ Success breeds confidence. Виктор is now even braver,");
console.log("      and his idealistic side has awakened.\n");

// ============================================================
// ACT 5: THE SCENE
// ============================================================

console.log("─────────────────────────────────────────────────────────\n");
console.log("ACT 5: HOW THEY APPEAR NOW\n");

console.log("📝 Generating context overlay to see how the AI would");
console.log("   perceive these evolved characters...\n");

// Make all characters "hot" (in current scene)
L.characters['Алекс'].lastSeen = 100;
L.characters['Саша'].lastSeen = 100;
L.characters['Виктор'].lastSeen = 100;
L.turn = 100;

const context = LC.composeContextOverlay();
const contextLines = context.text.split('\n');

console.log("🎭 CONTEXT OVERLAY (personality traits):\n");

for (const line of contextLines) {
  if (line.includes('⟦TRAITS:')) {
    console.log(`   ${line}`);
  }
}

console.log("\n");

// ============================================================
// EPILOGUE
// ============================================================

console.log("─────────────────────────────────────────────────────────\n");
console.log("EPILOGUE: PERMANENT TRANSFORMATION\n");

console.log("📊 CHARACTER EVOLUTION SUMMARY:\n");

console.log("👤 АЛЕКС:");
console.log("   BEFORE: Trusting idealist (Trust 0.7, Idealism 0.8)");
console.log(`   AFTER:  Wounded cynic (Trust ${alex.personality.trust.toFixed(2)}, Idealism ${alex.personality.idealism.toFixed(2)})`);
console.log("   CAUSE:  Betrayal by best friend\n");

console.log("👤 САША:");
console.log("   BEFORE: Timid follower (Trust 0.5, Bravery 0.3)");
console.log(`   AFTER:  Brave believer (Trust ${sasha.personality.trust.toFixed(2)}, Bravery ${sasha.personality.bravery.toFixed(2)})`);
console.log("   CAUSE:  Rescued by Виктор\n");

console.log("👤 ВИКТОР:");
console.log("   BEFORE: Confident realist (Bravery 0.7, Idealism 0.5)");
console.log(`   AFTER:  Bold idealist (Bravery ${viktor.personality.bravery.toFixed(2)}, Idealism ${viktor.personality.idealism.toFixed(2)})`);
console.log("   CAUSE:  Achieved important goal\n");

console.log("─────────────────────────────────────────────────────────\n");
console.log("✨ The Crucible has forged them into new people.");
console.log("   They don't just remember these events—they ARE changed by them.");
console.log("\n═══════════════════════════════════════════════════════════\n");
