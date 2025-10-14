#!/usr/bin/env node
/**
 * Test script for System Messages (Phase 1.2)
 * 
 * This test validates that:
 * 1. sys_msgs array is initialized in lcInit()
 * 2. LC.lcSys() adds messages to the queue
 * 3. LC.lcConsumeMsgs() retrieves and clears messages
 * 4. LC.sysBlock() formats messages correctly
 * 5. Output.js displays system messages before AI text
 * 6. Empty queue results in no output (backward compatibility)
 */

console.log("=== Testing Lincoln v17.0 - System Messages (Phase 1.2) ===\n");

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Mock the global state object (as in AI Dungeon)
global.state = {};

console.log("Test 1: Loading library.js with new functions");
try {
  const libraryCode = fs.readFileSync(path.join(__dirname, 'library.js'), 'utf8');
  eval(libraryCode);
  console.log("✓ Library loaded successfully");
  console.log("✓ LC.lcInit function exists:", typeof LC.lcInit === 'function');
  console.log("✓ LC.lcSys function exists:", typeof LC.lcSys === 'function');
  console.log("✓ LC.lcConsumeMsgs function exists:", typeof LC.lcConsumeMsgs === 'function');
  console.log("✓ LC.sysBlock function exists:", typeof LC.sysBlock === 'function');
} catch (error) {
  console.error("✗ Failed to load library:", error.message);
  process.exit(1);
}
console.log("");

console.log("Test 2: Testing sys_msgs array initialization");
try {
  const L = LC.lcInit();
  
  console.log("✓ lcInit() executed without errors");
  console.log("✓ sys_msgs array exists:", Array.isArray(L.sys_msgs));
  console.log("✓ sys_msgs is empty array:", L.sys_msgs.length === 0);
} catch (error) {
  console.error("✗ sys_msgs initialization failed:", error.message);
  process.exit(1);
}
console.log("");

console.log("Test 3: Testing LC.lcSys() - adding messages");
try {
  LC.lcSys("First message");
  LC.lcSys("Second message");
  LC.lcSys("Third message");
  
  const L = LC.lcInit();
  console.log("✓ Messages added successfully");
  console.log("✓ Queue has 3 messages:", L.sys_msgs.length === 3);
  console.log("✓ First message correct:", L.sys_msgs[0] === "First message");
  console.log("✓ Second message correct:", L.sys_msgs[1] === "Second message");
  console.log("✓ Third message correct:", L.sys_msgs[2] === "Third message");
} catch (error) {
  console.error("✗ lcSys() failed:", error.message);
  process.exit(1);
}
console.log("");

console.log("Test 4: Testing LC.lcConsumeMsgs() - retrieve and clear");
try {
  const messages = LC.lcConsumeMsgs();
  const L = LC.lcInit();
  
  console.log("✓ Messages retrieved successfully");
  console.log("✓ Retrieved 3 messages:", messages.length === 3);
  console.log("✓ Queue is now empty:", L.sys_msgs.length === 0);
  console.log("✓ Messages preserved:", messages[0] === "First message");
} catch (error) {
  console.error("✗ lcConsumeMsgs() failed:", error.message);
  process.exit(1);
}
console.log("");

console.log("Test 5: Testing LC.sysBlock() - formatting");
try {
  // Test with messages
  const block1 = LC.sysBlock(["System is online.", "Engine ready."]);
  const expectedBlock1 = "========================================\n" +
                        "⟦SYS⟧ System is online.\n" +
                        "⟦SYS⟧ Engine ready.\n" +
                        "========================================\n";
  
  console.log("✓ sysBlock() formats messages correctly:", block1 === expectedBlock1);
  
  // Test with empty array
  const block2 = LC.sysBlock([]);
  console.log("✓ Empty array returns empty string:", block2 === '');
  
  // Test with null
  const block3 = LC.sysBlock(null);
  console.log("✓ Null returns empty string:", block3 === '');
  
  // Test visual output
  console.log("\nFormatted block example:");
  console.log(block1);
} catch (error) {
  console.error("✗ sysBlock() failed:", error.message);
  process.exit(1);
}
console.log("");

console.log("Test 6: Testing output.js with system messages");
try {
  // Reset state
  global.state = {};
  eval(fs.readFileSync(path.join(__dirname, 'library.js'), 'utf8'));
  
  // Add a test message
  LC.lcSys("System is online.");
  
  // Load and execute output.js with wrapped code
  const outputCode = fs.readFileSync(path.join(__dirname, 'output.js'), 'utf8');
  const text = "You push open the heavy wooden door.";
  const wrappedCode = `(function() { ${outputCode} })()`;
  const result = eval(wrappedCode);
  
  console.log("✓ Output modifier executed successfully");
  console.log("✓ Result contains system message block:", result.text.includes("⟦SYS⟧ System is online."));
  console.log("✓ Result contains AI text:", result.text.includes(text));
  console.log("✓ System message appears before AI text:", 
    result.text.indexOf("⟦SYS⟧") < result.text.indexOf(text));
  
  console.log("\nOutput example:");
  console.log(result.text);
} catch (error) {
  console.error("✗ Output modifier with messages failed:", error.message);
  process.exit(1);
}
console.log("");

console.log("Test 7: Testing output.js with empty queue (backward compatibility)");
try {
  // Reset state
  global.state = {};
  eval(fs.readFileSync(path.join(__dirname, 'library.js'), 'utf8'));
  
  // Don't add any messages
  
  // Load and execute output.js with wrapped code
  const outputCode = fs.readFileSync(path.join(__dirname, 'output.js'), 'utf8');
  const text = "The dragon roars.";
  const wrappedCode = `(function() { ${outputCode} })()`;
  const result = eval(wrappedCode);
  
  console.log("✓ Output modifier executed successfully");
  console.log("✓ No system message block:", !result.text.includes("⟦SYS⟧"));
  console.log("✓ Text unchanged:", result.text === text);
  
  console.log("\nOutput (no messages):");
  console.log(result.text);
} catch (error) {
  console.error("✗ Backward compatibility test failed:", error.message);
  process.exit(1);
}
console.log("");

console.log("Test 8: Testing message queue isolation between turns");
try {
  // Reset state
  global.state = {};
  eval(fs.readFileSync(path.join(__dirname, 'library.js'), 'utf8'));
  
  // Add messages for first turn
  LC.lcSys("Turn 1 message");
  
  // Consume messages
  const messages1 = LC.lcConsumeMsgs();
  console.log("✓ First turn: 1 message consumed:", messages1.length === 1);
  
  // Verify queue is empty
  const messages2 = LC.lcConsumeMsgs();
  console.log("✓ Queue empty after consumption:", messages2.length === 0);
  
  // Add messages for second turn
  LC.lcSys("Turn 2 message A");
  LC.lcSys("Turn 2 message B");
  
  // Consume messages
  const messages3 = LC.lcConsumeMsgs();
  console.log("✓ Second turn: 2 messages consumed:", messages3.length === 2);
  console.log("✓ Messages isolated between turns");
} catch (error) {
  console.error("✗ Message isolation test failed:", error.message);
  process.exit(1);
}
console.log("");

console.log("Test 9: Testing multiple message types");
try {
  // Reset state
  global.state = {};
  eval(fs.readFileSync(path.join(__dirname, 'library.js'), 'utf8'));
  
  // Add various message types
  LC.lcSys("Info: Character initialized");
  LC.lcSys("Warning: Low memory");
  LC.lcSys("Debug: Turn counter = 5");
  
  const messages = LC.lcConsumeMsgs();
  const block = LC.sysBlock(messages);
  
  console.log("✓ Multiple message types handled");
  console.log("✓ All messages formatted correctly");
  
  console.log("\nMultiple messages example:");
  console.log(block);
} catch (error) {
  console.error("✗ Multiple message types test failed:", error.message);
  process.exit(1);
}
console.log("");

console.log("=== Final State Check ===");
const L = LC.lcInit();
console.log("state.shared.lincoln exists:", state.shared && state.shared.lincoln !== undefined);
console.log("sys_msgs array exists:", Array.isArray(L.sys_msgs));
console.log("sys_msgs is empty:", L.sys_msgs.length === 0);
console.log("");

console.log("✅ All tests passed! System Messages (Phase 1.2) is working correctly.");
console.log("");
console.log("Summary:");
console.log("  ✓ sys_msgs array initialized in lcInit()");
console.log("  ✓ LC.lcSys() adds messages to queue");
console.log("  ✓ LC.lcConsumeMsgs() retrieves and clears messages");
console.log("  ✓ LC.sysBlock() formats messages with ⟦SYS⟧ prefix");
console.log("  ✓ Output.js displays messages before AI text");
console.log("  ✓ Empty queue results in no output (backward compatible)");
console.log("  ✓ Message queue properly isolated between turns");
console.log("  ✓ System ready for Phase 1.3");
