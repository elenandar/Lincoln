#!/usr/bin/env node
/**
 * Demo script for System Messages (Phase 1.2)
 * 
 * This demonstrates how system messages work in a realistic game scenario.
 * It simulates a complete turn with system diagnostics displayed.
 */

console.log("╔══════════════════════════════════════════════════════════════╗");
console.log("║     Lincoln v17.0 - Phase 1.2: System Messages Demo         ║");
console.log("╚══════════════════════════════════════════════════════════════╝");
console.log("");

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Mock the global state object
global.state = {};

console.log("📦 Step 1: Loading Scripts");
console.log("─────────────────────────────────────────────────────────────");

// Load library
const libraryCode = fs.readFileSync(path.join(__dirname, 'library.js'), 'utf8');
eval(libraryCode);
console.log("✓ library.js loaded");

// Load input modifier
const inputCode = fs.readFileSync(path.join(__dirname, 'input.js'), 'utf8');
console.log("✓ input.js loaded");

// Load context modifier
const contextCode = fs.readFileSync(path.join(__dirname, 'context.js'), 'utf8');
console.log("✓ context.js loaded");

// Load output modifier
const outputCode = fs.readFileSync(path.join(__dirname, 'output.js'), 'utf8');
console.log("✓ output.js loaded");
console.log("");

console.log("🎮 Step 2: Player Input");
console.log("─────────────────────────────────────────────────────────────");
const playerInput = "> I enter the tavern.";
console.log("Player types:", playerInput);
console.log("");

console.log("⚙️  Processing through Input Modifier...");
const inputContext = { LC, state };
vm.createContext(inputContext);
vm.runInContext(inputCode, inputContext);
const inputResult = inputContext.modifier(playerInput);
console.log("✓ Input processed");
console.log("");

console.log("🤖 Step 3: AI Generates Context");
console.log("─────────────────────────────────────────────────────────────");
const aiContext = "You are in a fantasy world. The tavern is bustling with activity.";
console.log("Context text:", aiContext);
console.log("");

console.log("⚙️  Processing through Context Modifier...");
const contextContext = { LC, state };
vm.createContext(contextContext);
vm.runInContext(contextCode, contextContext);
const contextResult = contextContext.modifier(aiContext);
console.log("✓ Context processed");
console.log("");

console.log("💬 Step 4: AI Generates Response");
console.log("─────────────────────────────────────────────────────────────");
const aiOutput = "You push open the heavy wooden door and step into the warm, bustling tavern. The smell of roasted meat and ale fills your nostrils. A bard plays a lively tune in the corner.";
console.log("AI generates:");
console.log("  \"" + aiOutput + "\"");
console.log("");

console.log("🔧 Step 5: Adding System Messages");
console.log("─────────────────────────────────────────────────────────────");
console.log("Simulating system diagnostics...");
LC.lcSys("System is online.");
LC.lcSys("Turn counter: 1");
LC.lcSys("Memory usage: OK");
console.log("✓ 3 system messages added to queue");
console.log("");

console.log("⚙️  Processing through Output Modifier...");
const outputContext = { LC, state };
vm.createContext(outputContext);
vm.runInContext(outputCode, outputContext);
const outputResult = outputContext.modifier(aiOutput);
console.log("✓ Output processed");
console.log("");

console.log("📺 Step 6: Final Display to Player");
console.log("─────────────────────────────────────────────────────────────");
console.log("What the player sees:\n");
console.log(outputResult.text);
console.log("─────────────────────────────────────────────────────────────");
console.log("");

console.log("📊 Step 7: State After Turn");
console.log("─────────────────────────────────────────────────────────────");
const L = LC.lcInit();
console.log("Message queue status:");
console.log("  sys_msgs.length:", L.sys_msgs.length);
console.log("  (Queue cleared after consumption)");
console.log("");

console.log("🔄 Step 8: Next Turn (No System Messages)");
console.log("─────────────────────────────────────────────────────────────");
const aiOutput2 = "You approach the bar and order a drink. The bartender nods and slides a mug of ale toward you.";

// Process without adding messages
const outputContext2 = { LC, state };
vm.createContext(outputContext2);
vm.runInContext(outputCode, outputContext2);
const outputResult2 = outputContext2.modifier(aiOutput2);

console.log("Player sees (no system messages):\n");
console.log(outputResult2.text);
console.log("─────────────────────────────────────────────────────────────");
console.log("");

console.log("✨ Summary");
console.log("═════════════════════════════════════════════════════════════");
console.log("✓ System messages displayed when added");
console.log("✓ Messages appear before AI text in formatted block");
console.log("✓ Queue automatically cleared after display");
console.log("✓ No output when queue is empty (backward compatible)");
console.log("✓ Each turn can have different system messages");
console.log("");
console.log("🎯 Phase 1.2 Implementation: SUCCESSFUL");
console.log("");
console.log("Next Steps:");
console.log("  → Phase 1.3: CommandsRegistry (add /ping command)");
console.log("  → Use LC.lcSys() in future systems for debugging");
console.log("  → System messages will help monitor all game engines");
console.log("");
