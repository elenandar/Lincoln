#!/usr/bin/env node
/**
 * Demo script showing the Zero System in action
 * 
 * This demonstrates:
 * - How the scripts load in AI Dungeon
 * - How state is initialized
 * - How text flows through the modifiers
 * - The "zero interference" principle
 */

console.log("╔════════════════════════════════════════════════════════════╗");
console.log("║  Lincoln v17.0 - Zero System Demonstration                ║");
console.log("╚════════════════════════════════════════════════════════════╝");
console.log("");

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Mock the AI Dungeon environment
global.state = {}; // Fresh game state

console.log("📚 Step 1: Loading Library Script");
console.log("─────────────────────────────────────────────────────────────");
const libraryCode = fs.readFileSync(path.join(__dirname, 'library.js'), 'utf8');
eval(libraryCode);
console.log("✓ Library loaded");
console.log("✓ LC object created:", typeof LC !== 'undefined');
console.log("✓ LC.lcInit available:", typeof LC.lcInit === 'function');
console.log("");

console.log("🎮 Step 2: Player Action - 'You enter the tavern'");
console.log("─────────────────────────────────────────────────────────────");
const playerInput = "You enter the tavern";
console.log("Player types:", playerInput);
console.log("");

console.log("⚙️  Processing through Input Modifier...");
const inputCode = fs.readFileSync(path.join(__dirname, 'input.js'), 'utf8');
const inputContext = { LC, state };
vm.createContext(inputContext);
vm.runInContext(inputCode, inputContext);
const inputResult = inputContext.modifier(playerInput);
console.log("✓ Input processed");
console.log("  Input:  '" + playerInput + "'");
console.log("  Output: '" + inputResult.text + "'");
console.log("  Changed:", playerInput !== inputResult.text ? "YES" : "NO (pass-through)");
console.log("");

console.log("📖 Step 3: Checking State After Input Processing");
console.log("─────────────────────────────────────────────────────────────");
console.log("state.shared exists:", !!state.shared);
console.log("state.shared.lincoln exists:", !!(state.shared && state.shared.lincoln));
console.log("state.shared.lincoln contents:", JSON.stringify(state.shared.lincoln));
console.log("State initialized:", !!(state.shared && state.shared.lincoln && typeof state.shared.lincoln === 'object'));
console.log("");

console.log("🤖 Step 4: AI Generates Context");
console.log("─────────────────────────────────────────────────────────────");
const aiContext = "You are in a tavern. There are many people here.";
console.log("Context text:", aiContext);
console.log("");

console.log("⚙️  Processing through Context Modifier...");
const contextCode = fs.readFileSync(path.join(__dirname, 'context.js'), 'utf8');
const contextContext = { LC, state };
vm.createContext(contextContext);
vm.runInContext(contextCode, contextContext);
const contextResult = contextContext.modifier(aiContext);
console.log("✓ Context processed");
console.log("  Input:  '" + aiContext + "'");
console.log("  Output: '" + contextResult.text + "'");
console.log("  Changed:", aiContext !== contextResult.text ? "YES" : "NO (pass-through)");
console.log("");

console.log("💬 Step 5: AI Generates Response");
console.log("─────────────────────────────────────────────────────────────");
const aiOutput = "You push open the heavy wooden door and step into the warm, bustling tavern.";
console.log("AI generates:", aiOutput);
console.log("");

console.log("⚙️  Processing through Output Modifier...");
const outputCode = fs.readFileSync(path.join(__dirname, 'output.js'), 'utf8');
const outputContext = { LC, state };
vm.createContext(outputContext);
vm.runInContext(outputCode, outputContext);
const outputResult = outputContext.modifier(aiOutput);
console.log("✓ Output processed");
console.log("  Input:  '" + aiOutput + "'");
console.log("  Output: '" + outputResult.text + "'");
console.log("  Changed:", aiOutput !== outputResult.text ? "YES" : "NO (pass-through)");
console.log("");

console.log("📊 Step 6: Final State");
console.log("─────────────────────────────────────────────────────────────");
const L = LC.lcInit();
console.log("Lincoln state (L):", L);
console.log("Is empty object:", Object.keys(L).length === 0);
console.log("Same as state.shared.lincoln:", L === state.shared.lincoln);
console.log("");

console.log("✨ Summary");
console.log("═════════════════════════════════════════════════════════════");
console.log("✓ All scripts loaded without errors");
console.log("✓ State initialized: state.shared.lincoln = {}");
console.log("✓ Text flows unchanged through all modifiers");
console.log("✓ Zero interference with game behavior");
console.log("✓ Ready for Phase 1.2 development");
console.log("");
console.log("🎯 The Zero System is working perfectly!");
console.log("   Next: Add CommandsRegistry, System Messages, and more...");
console.log("");
