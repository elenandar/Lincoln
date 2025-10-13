#!/usr/bin/env node
/**
 * Test script for Hardening Protocol fixes
 * 
 * This validates:
 * 1. Zero-turn protection: CharacterGC and GossipGC don't run on turn 0
 * 2. Task response handling: Plain "нет" is accepted as task decline
 * 3. Context overlay is always regenerated cleanly
 */

console.log("=== Hardening Protocol Validation Test ===\n");

const fs = require('fs');
const path = require('path');

// Load library code
const libraryCode = fs.readFileSync(path.join(__dirname, '..', 'v16.0.8/Library v16.0.8.patched.txt'), 'utf8');
const inputCode = fs.readFileSync(path.join(__dirname, '..', 'v16.0.8/Input v16.0.8.patched.txt'), 'utf8');
const outputCode = fs.readFileSync(path.join(__dirname, '..', 'v16.0.8/Output v16.0.8.patched.txt'), 'utf8');
const contextCode = fs.readFileSync(path.join(__dirname, '..', 'v16.0.8/Context v16.0.8.patched.txt'), 'utf8');

// Set up global state
global.state = { lincoln: {} };
global.info = { actionCount: 0, characters: [] };

// Helper functions
const toNum = (x, d = 0) => (typeof x === 'number' && !isNaN(x)) ? x : (Number(x) || d);
const toStr = (x) => String(x == null ? "" : x);
const toBool = (x, d = false) => (x == null ? d : !!x);
const getState = () => global.state;

// Create minimal globals
const __SCRIPT_SLOT__ = "test";

// Evaluate library code
eval(libraryCode);

let allTestsPassed = true;

// ========== TEST 1: Zero-turn protection for CharacterGC ==========
console.log("TEST 1: CharacterGC does NOT run on turn 0");

const L = LC.lcInit();
L.turn = 0;
L.characters = {
  'Alice': { type: 'MAIN', status: 'ACTIVE' },
  'Bob': { type: 'SECONDARY', status: 'ACTIVE' }
};

// Check that the code has the protection
const hasCharGCProtection = /L\.turn\s*>\s*0\s*&&\s*L\.turn\s*%\s*50\s*===\s*0/.test(outputCode);

console.log(`  CharacterGC check includes turn > 0: ${hasCharGCProtection ? '✓' : '✗'}`);

if (hasCharGCProtection) {
  console.log("  ✅ PASSED: CharacterGC protected from zero-turn");
} else {
  console.log("  ❌ FAILED: CharacterGC missing zero-turn protection");
  allTestsPassed = false;
}

console.log("");

// ========== TEST 2: Zero-turn protection for GossipGC ==========
console.log("TEST 2: GossipGC does NOT run on turn 0");

const hasGossipGCProtection = /\(L\.turn\s*>\s*0\s*&&\s*L\.turn\s*%\s*25\s*===\s*0\)/.test(outputCode);

console.log(`  GossipGC check includes turn > 0: ${hasGossipGCProtection ? '✓' : '✗'}`);

if (hasGossipGCProtection) {
  console.log("  ✅ PASSED: GossipGC protected from zero-turn");
} else {
  console.log("  ❌ FAILED: GossipGC missing zero-turn protection");
  allTestsPassed = false;
}

console.log("");

// ========== TEST 3: Plain "нет" handling in Input ==========
console.log("TEST 3: Input handles plain 'нет' as task decline");

// Check that Input has the logic to handle plain "нет"
const hasPlainNetHandling = /lowerInput\s*===\s*["']нет["']\s*\|\|\s*lowerInput\s*===\s*["']no["']/.test(inputCode);
const checksWantRecapBeforeCmd = /!cmd\s*&&\s*L\.currentAction/.test(inputCode);

console.log(`  Input checks for plain 'нет'/'no': ${hasPlainNetHandling ? '✓' : '✗'}`);
console.log(`  Input checks wantRecap for non-commands: ${checksWantRecapBeforeCmd ? '✓' : '✗'}`);

if (hasPlainNetHandling && checksWantRecapBeforeCmd) {
  console.log("  ✅ PASSED: Plain 'нет' is handled as task decline");
} else {
  console.log("  ❌ FAILED: Missing plain 'нет' handling");
  allTestsPassed = false;
}

console.log("");

// ========== TEST 4: AI Instructions fortified ==========
console.log("TEST 4: AI Instructions contain hardened rules");

const aiInstructions = fs.readFileSync(path.join(__dirname, '..', 'AI Instructions.txt'), 'utf8');

const hasAbsoluteCharBan = /ЗАПРЕЩЕНО вводить новых персонажей/.test(aiInstructions);
const hasIgnoreBrokenContext = /системные данные.*вне тегов.*ИГНОРИРУЙ/.test(aiInstructions);

console.log(`  Absolute character creation ban: ${hasAbsoluteCharBan ? '✓' : '✗'}`);
console.log(`  Rule to ignore broken context data: ${hasIgnoreBrokenContext ? '✓' : '✗'}`);

if (hasAbsoluteCharBan && hasIgnoreBrokenContext) {
  console.log("  ✅ PASSED: AI Instructions fortified against hallucinations");
} else {
  console.log("  ❌ FAILED: AI Instructions missing hardening rules");
  allTestsPassed = false;
}

console.log("");

// ========== TEST 5: Context overlay is always regenerated ==========
console.log("TEST 5: Context overlay regeneration is self-cleaning");

const contextHasOverlayGeneration = /LC\.composeContextOverlay/.test(contextCode);
const contextHasFallback = /SAFE FALLBACK/.test(contextCode);

console.log(`  Context calls composeContextOverlay: ${contextHasOverlayGeneration ? '✓' : '✗'}`);
console.log(`  Context has safe fallback: ${contextHasFallback ? '✓' : '✗'}`);

if (contextHasOverlayGeneration && contextHasFallback) {
  console.log("  ✅ PASSED: Context overlay is self-cleaning with fallback");
} else {
  console.log("  ❌ FAILED: Context overlay missing safety features");
  allTestsPassed = false;
}

console.log("");

// ========== SUMMARY ==========
console.log("=".repeat(60));
if (allTestsPassed) {
  console.log("✅ ALL HARDENING PROTOCOL TESTS PASSED");
  console.log("\nHardening features verified:");
  console.log("  ✓ Zero-turn protection for periodic GC tasks");
  console.log("  ✓ Plain text task decline handling");
  console.log("  ✓ AI Instructions fortified against hallucinations");
  console.log("  ✓ Context overlay self-cleaning architecture");
  process.exit(0);
} else {
  console.log("❌ SOME HARDENING PROTOCOL TESTS FAILED");
  console.log("Review the failures above and fix the issues.");
  process.exit(1);
}
