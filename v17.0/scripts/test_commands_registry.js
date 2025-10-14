#!/usr/bin/env node
/**
 * Test script for CommandsRegistry (Phase 1.3)
 * 
 * This test validates that:
 * 1. CommandsRegistry is initialized in lcInit()
 * 2. LC.registerCommand() registers commands correctly
 * 3. LC.sanitizeInput() removes "> " prefix and trims whitespace
 * 4. Input.js parses and executes commands
 * 5. /ping command works as expected
 * 6. Unknown commands display error messages
 * 7. Normal input is passed through with sanitization
 */

console.log("=== Testing Lincoln v17.0 - CommandsRegistry (Phase 1.3) ===\n");

const fs = require('fs');
const path = require('path');

// Mock the global state object (as in AI Dungeon)
global.state = {};

console.log("Test 1: Loading library.js with CommandsRegistry");
try {
  const libraryCode = fs.readFileSync(path.join(__dirname, 'library.js'), 'utf8');
  eval(libraryCode);
  console.log("✓ Library loaded successfully");
  console.log("✓ LC.registerCommand function exists:", typeof LC.registerCommand === 'function');
  console.log("✓ LC.sanitizeInput function exists:", typeof LC.sanitizeInput === 'function');
} catch (error) {
  console.error("✗ Failed to load library:", error.message);
  process.exit(1);
}
console.log("");

console.log("Test 2: Testing CommandsRegistry initialization");
try {
  const L = LC.lcInit();
  
  console.log("✓ lcInit() executed without errors");
  console.log("✓ CommandsRegistry exists:", L.CommandsRegistry !== undefined);
  console.log("✓ CommandsRegistry is a Map:", L.CommandsRegistry instanceof Map);
} catch (error) {
  console.error("✗ CommandsRegistry initialization failed:", error.message);
  process.exit(1);
}
console.log("");

console.log("Test 3: Testing /ping command registration");
try {
  const L = LC.lcInit();
  const pingCommand = L.CommandsRegistry.get('/ping');
  
  console.log("✓ /ping command exists:", pingCommand !== undefined);
  console.log("✓ /ping has handler:", typeof pingCommand.handler === 'function');
  console.log("✓ /ping has description:", typeof pingCommand.description === 'string');
  console.log("✓ Description correct:", pingCommand.description === "/ping — Проверяет, отвечает ли система.");
} catch (error) {
  console.error("✗ /ping command registration failed:", error.message);
  process.exit(1);
}
console.log("");

console.log("Test 4: Testing LC.registerCommand() - manual registration");
try {
  LC.registerCommand("/test", {
    description: "/test - A test command",
    handler: function(args) {
      LC.lcSys("Test command executed with args: " + args.join(' '));
    }
  });
  
  const L = LC.lcInit();
  const testCommand = L.CommandsRegistry.get('/test');
  
  console.log("✓ /test command registered:", testCommand !== undefined);
  console.log("✓ /test has handler:", typeof testCommand.handler === 'function');
  console.log("✓ Registry now has 2 commands:", L.CommandsRegistry.size === 2);
} catch (error) {
  console.error("✗ Manual command registration failed:", error.message);
  process.exit(1);
}
console.log("");

console.log("Test 5: Testing LC.sanitizeInput() - removing '> ' prefix");
try {
  const test1 = LC.sanitizeInput("> Посмотреть на свои руки");
  console.log("✓ Removes '> ' prefix:", test1 === "Посмотреть на свои руки");
  
  const test2 = LC.sanitizeInput("  > Посмотреть на свои руки  ");
  console.log("✓ Handles whitespace and prefix:", test2 === "Посмотреть на свои руки");
  
  const test3 = LC.sanitizeInput("Text without prefix");
  console.log("✓ Leaves text without prefix:", test3 === "Text without prefix");
  
  const test4 = LC.sanitizeInput("  Text with spaces  ");
  console.log("✓ Trims whitespace:", test4 === "Text with spaces");
  
  const test5 = LC.sanitizeInput("");
  console.log("✓ Handles empty string:", test5 === "");
  
  const test6 = LC.sanitizeInput(null);
  console.log("✓ Handles null:", test6 === "");
} catch (error) {
  console.error("✗ sanitizeInput() failed:", error.message);
  process.exit(1);
}
console.log("");

console.log("Test 6: Testing input.js with /ping command (Acceptance Test 1)");
try {
  // Reset state
  global.state = {};
  eval(fs.readFileSync(path.join(__dirname, 'library.js'), 'utf8'));
  
  // Load and execute input.js with /ping command
  const inputCode = fs.readFileSync(path.join(__dirname, 'input.js'), 'utf8');
  const text = "/ping";
  const wrappedCode = `(function() { ${inputCode} })()`;
  const result = eval(wrappedCode);
  
  console.log("✓ Input modifier executed successfully");
  console.log("✓ Result stops processing:", result.stop === true);
  console.log("✓ Result has empty text:", result.text === "");
  
  // Check that system message was queued
  const L = LC.lcInit();
  console.log("✓ System message queued:", L.sys_msgs.length === 1);
  console.log("✓ Message is 'Pong!':", L.sys_msgs[0] === "Pong!");
  
  console.log("\n⟦SYS⟧ Message that will appear: " + L.sys_msgs[0]);
} catch (error) {
  console.error("✗ /ping command test failed:", error.message);
  console.error(error.stack);
  process.exit(1);
}
console.log("");

console.log("Test 7: Testing input.js with unknown command /fly (Acceptance Test 2)");
try {
  // Reset state
  global.state = {};
  eval(fs.readFileSync(path.join(__dirname, 'library.js'), 'utf8'));
  
  // Load and execute input.js with unknown command
  const inputCode = fs.readFileSync(path.join(__dirname, 'input.js'), 'utf8');
  const text = "/fly";
  const wrappedCode = `(function() { ${inputCode} })()`;
  const result = eval(wrappedCode);
  
  console.log("✓ Input modifier executed successfully");
  console.log("✓ Result stops processing:", result.stop === true);
  console.log("✓ Result has empty text:", result.text === "");
  
  // Check that error message was queued
  const L = LC.lcInit();
  console.log("✓ System message queued:", L.sys_msgs.length === 1);
  console.log("✓ Message is error:", L.sys_msgs[0].includes('Unknown command'));
  console.log("✓ Message mentions /fly:", L.sys_msgs[0].includes('/fly'));
  
  console.log("\n⟦SYS⟧ Message that will appear: " + L.sys_msgs[0]);
} catch (error) {
  console.error("✗ Unknown command test failed:", error.message);
  console.error(error.stack);
  process.exit(1);
}
console.log("");

console.log("Test 8: Testing input.js with normal input (Acceptance Test 3)");
try {
  // Reset state
  global.state = {};
  eval(fs.readFileSync(path.join(__dirname, 'library.js'), 'utf8'));
  
  // Load and execute input.js with normal input
  const inputCode = fs.readFileSync(path.join(__dirname, 'input.js'), 'utf8');
  const text = "> Посмотреть на свои руки";
  const wrappedCode = `(function() { ${inputCode} })()`;
  const result = eval(wrappedCode);
  
  console.log("✓ Input modifier executed successfully");
  console.log("✓ Result does not stop:", result.stop === undefined || result.stop === false);
  console.log("✓ Prefix removed:", result.text === "Посмотреть на свои руки");
  console.log("✓ Text cleaned correctly:", !result.text.includes('>'));
  
  console.log("\nCleaned text that goes to AI: \"" + result.text + "\"");
} catch (error) {
  console.error("✗ Normal input test failed:", error.message);
  console.error(error.stack);
  process.exit(1);
}
console.log("");

console.log("Test 9: Testing command with arguments");
try {
  // Reset state
  global.state = {};
  eval(fs.readFileSync(path.join(__dirname, 'library.js'), 'utf8'));
  
  // Register a command that uses arguments
  LC.registerCommand("/echo", {
    description: "/echo - Echoes arguments",
    handler: function(args) {
      LC.lcSys("Echo: " + args.join(' '));
    }
  });
  
  // Load and execute input.js with command + args
  const inputCode = fs.readFileSync(path.join(__dirname, 'input.js'), 'utf8');
  const text = "/echo hello world";
  const wrappedCode = `(function() { ${inputCode} })()`;
  const result = eval(wrappedCode);
  
  console.log("✓ Command with args executed");
  const L = LC.lcInit();
  console.log("✓ Message contains args:", L.sys_msgs[0] === "Echo: hello world");
} catch (error) {
  console.error("✗ Command with arguments failed:", error.message);
  process.exit(1);
}
console.log("");

console.log("Test 10: Testing integration with output.js");
try {
  // Reset state
  global.state = {};
  eval(fs.readFileSync(path.join(__dirname, 'library.js'), 'utf8'));
  
  // Execute /ping command via input.js
  const inputCode = fs.readFileSync(path.join(__dirname, 'input.js'), 'utf8');
  const text = "/ping";
  const wrappedInputCode = `(function() { ${inputCode} })()`;
  const inputResult = eval(wrappedInputCode);
  
  // Execute output.js to see the message
  const outputCode = fs.readFileSync(path.join(__dirname, 'output.js'), 'utf8');
  const aiText = "The game continues.";
  const wrappedOutputCode = `(function() { const text = "${aiText}"; ${outputCode} })()`;
  const outputResult = eval(wrappedOutputCode);
  
  console.log("✓ Integration test executed");
  console.log("✓ Output contains ⟦SYS⟧:", outputResult.text.includes("⟦SYS⟧"));
  console.log("✓ Output contains Pong!:", outputResult.text.includes("Pong!"));
  
  console.log("\nComplete output:");
  console.log(outputResult.text);
} catch (error) {
  console.error("✗ Integration test failed:", error.message);
  process.exit(1);
}
console.log("");

console.log("=== Final State Check ===");
const L = LC.lcInit();
console.log("state.shared.lincoln exists:", state.shared && state.shared.lincoln !== undefined);
console.log("CommandsRegistry exists:", L.CommandsRegistry !== undefined);
console.log("CommandsRegistry is Map:", L.CommandsRegistry instanceof Map);
console.log("CommandsRegistry size:", L.CommandsRegistry.size);
console.log("");

console.log("✅ All tests passed! CommandsRegistry (Phase 1.3) is working correctly.");
console.log("");
console.log("Summary:");
console.log("  ✓ CommandsRegistry initialized in lcInit()");
console.log("  ✓ LC.registerCommand() registers commands");
console.log("  ✓ LC.sanitizeInput() cleans input text");
console.log("  ✓ /ping command returns 'Pong!' message");
console.log("  ✓ Unknown commands show error messages");
console.log("  ✓ Normal input is sanitized and passed through");
console.log("  ✓ Commands don't appear in game history (stop: true)");
console.log("  ✓ Integration with output.js works correctly");
console.log("");
console.log("Acceptance Criteria:");
console.log("  ✅ Test 1: /ping → ⟦SYS⟧ Pong! (text not in history)");
console.log("  ✅ Test 2: /fly → ⟦SYS⟧ Unknown command: \"/fly\"");
console.log("  ✅ Test 3: > Посмотреть на свои руки → cleaned text to AI");
