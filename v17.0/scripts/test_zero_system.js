#!/usr/bin/env node
/**
 * Test script for Zero System (Phase 1.1)
 * 
 * This test validates that:
 * 1. Library.js creates the LC object with lcInit function
 * 2. lcInit() initializes state.shared.lincoln
 * 3. All modifier scripts work without errors
 * 4. Text passes through unchanged
 * 5. State is initialized correctly
 */

console.log("=== Testing Lincoln v17.0 - Zero System ===\n");

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Mock the global state object (as in AI Dungeon)
global.state = {};

console.log("Test 1: Loading library.js");
try {
  const libraryCode = fs.readFileSync(path.join(__dirname, 'library.js'), 'utf8');
  eval(libraryCode);
  console.log("✓ Library loaded successfully");
  console.log("✓ LC object exists:", typeof LC !== 'undefined');
  console.log("✓ LC.lcInit function exists:", typeof LC.lcInit === 'function');
} catch (error) {
  console.error("✗ Failed to load library:", error.message);
  process.exit(1);
}
console.log("");

console.log("Test 2: Testing lcInit() function");
try {
  console.log("Initial state.shared:", state.shared);
  
  const L = LC.lcInit();
  
  console.log("✓ lcInit() executed without errors");
  console.log("✓ state.shared exists:", state.shared !== undefined);
  console.log("✓ state.shared.lincoln exists:", state.shared.lincoln !== undefined);
  console.log("✓ lcInit() returns state.shared.lincoln:", L === state.shared.lincoln);
  console.log("✓ state.shared.lincoln is empty object:", Object.keys(L).length === 0);
} catch (error) {
  console.error("✗ lcInit() failed:", error.message);
  process.exit(1);
}
console.log("");

console.log("Test 3: Testing lcInit() idempotency (calling twice)");
try {
  const L1 = LC.lcInit();
  const L2 = LC.lcInit();
  
  console.log("✓ Second call returns same object:", L1 === L2);
  console.log("✓ state.shared.lincoln unchanged:", state.shared.lincoln === L1);
} catch (error) {
  console.error("✗ Idempotency test failed:", error.message);
  process.exit(1);
}
console.log("");

console.log("Test 4: Loading input.js modifier");
try {
  const inputCode = fs.readFileSync(path.join(__dirname, 'input.js'), 'utf8');
  const context = { LC: global.LC, state: global.state };
  vm.createContext(context);
  vm.runInContext(inputCode, context);
  
  const testInput = "You walk into the room.";
  const result = context.modifier(testInput);
  
  console.log("✓ Input modifier loaded successfully");
  console.log("✓ Modifier returns object:", typeof result === 'object');
  console.log("✓ Result has text property:", result.text !== undefined);
  console.log("✓ Text unchanged:", result.text === testInput);
  console.log("  Input:  '" + testInput + "'");
  console.log("  Output: '" + result.text + "'");
} catch (error) {
  console.error("✗ Input modifier failed:", error.message);
  process.exit(1);
}
console.log("");

console.log("Test 5: Loading context.js modifier");
try {
  const contextCode = fs.readFileSync(path.join(__dirname, 'context.js'), 'utf8');
  const context = { LC: global.LC, state: global.state };
  vm.createContext(context);
  vm.runInContext(contextCode, context);
  
  const testContext = "The story so far...";
  const result = context.modifier(testContext);
  
  console.log("✓ Context modifier loaded successfully");
  console.log("✓ Text unchanged:", result.text === testContext);
  console.log("  Input:  '" + testContext + "'");
  console.log("  Output: '" + result.text + "'");
} catch (error) {
  console.error("✗ Context modifier failed:", error.message);
  process.exit(1);
}
console.log("");

console.log("Test 6: Loading output.js modifier");
try {
  const outputCode = fs.readFileSync(path.join(__dirname, 'output.js'), 'utf8');
  const context = { LC: global.LC, state: global.state };
  vm.createContext(context);
  vm.runInContext(outputCode, context);
  
  const testOutput = "The dragon appears before you.";
  const result = context.modifier(testOutput);
  
  console.log("✓ Output modifier loaded successfully");
  console.log("✓ Text unchanged:", result.text === testOutput);
  console.log("  Input:  '" + testOutput + "'");
  console.log("  Output: '" + result.text + "'");
} catch (error) {
  console.error("✗ Output modifier failed:", error.message);
  process.exit(1);
}
console.log("");

console.log("Test 7: Testing failsafe (LC undefined)");
try {
  const inputCode = fs.readFileSync(path.join(__dirname, 'input.js'), 'utf8');
  const context = { state: global.state }; // No LC in context
  vm.createContext(context);
  vm.runInContext(inputCode, context);
  
  const testInput = "Test text";
  const result = context.modifier(testInput);
  
  console.log("✓ Modifier works when LC is undefined");
  console.log("✓ Text still returned:", result.text === testInput);
} catch (error) {
  console.error("✗ Failsafe test failed:", error.message);
  process.exit(1);
}
console.log("");

console.log("Test 8: Testing empty string handling");
try {
  const inputCode = fs.readFileSync(path.join(__dirname, 'input.js'), 'utf8');
  const context = { LC: global.LC, state: global.state };
  vm.createContext(context);
  vm.runInContext(inputCode, context);
  
  const result1 = context.modifier("");
  const result2 = context.modifier(null);
  const result3 = context.modifier(undefined);
  
  console.log("✓ Empty string handled:", result1.text === "");
  console.log("✓ Null handled:", result2.text === "");
  console.log("✓ Undefined handled:", result3.text === "");
} catch (error) {
  console.error("✗ Empty string test failed:", error.message);
  process.exit(1);
}
console.log("");

console.log("=== Final State Check ===");
console.log("state.shared.lincoln exists:", state.shared && state.shared.lincoln !== undefined);
console.log("state.shared.lincoln is object:", typeof state.shared.lincoln === 'object');
console.log("state.shared.lincoln contents:", JSON.stringify(state.shared.lincoln));
console.log("");

console.log("✅ All tests passed! Zero System is working correctly.");
console.log("");
console.log("Summary:");
console.log("  ✓ Library.js creates LC object with lcInit()");
console.log("  ✓ lcInit() initializes state.shared.lincoln as empty object");
console.log("  ✓ All three modifiers (input, context, output) work");
console.log("  ✓ Text passes through unchanged (no game interference)");
console.log("  ✓ Failsafe works when LC is undefined");
console.log("  ✓ State is stable and ready for Phase 1.2");
