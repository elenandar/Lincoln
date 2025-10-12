#!/usr/bin/env node
/**
 * Comprehensive test demonstrating full test harness capabilities
 * 
 * This test demonstrates:
 * 1. Loading game scripts
 * 2. Executing complete turns
 * 3. Testing retry/continue/erase actions
 * 4. Verifying state persistence
 */

const path = require('path');
const harness = require('../test_harness.js');

console.log("=== Project Simulacrum - Comprehensive Demo ===\n");

// Load all scripts
console.log("Step 1: Loading game scripts...");
harness.loadScript(path.join(__dirname, '..', '..', 'Library v16.0.8.patched.txt'));
harness.loadScript(path.join(__dirname, '..', '..', 'Input v16.0.8.patched.txt'));
harness.loadScript(path.join(__dirname, '..', '..', 'Context v16.0.8.patched.txt'));
harness.loadScript(path.join(__dirname, '..', '..', 'Output v16.0.8.patched.txt'));
console.log("✓ All scripts loaded\n");

// Set up initial memory
console.log("Step 2: Setting up initial scenario...");
harness.setMemory("Максим и Хлоя — старшеклассники Lincoln Heights High School.");
console.log("✓ Memory set\n");

// Execute first turn
console.log("Step 3: Executing first turn (Say action)...");
const turn1 = harness.performSay("Максим подошёл к Хлое.");
console.log("  Context includes INTENT:", turn1.context.includes("⟦INTENT⟧") ? '✓' : '✗');
console.log("  Context includes GUIDE:", turn1.context.includes("⟦GUIDE⟧") ? '✓' : '✗');
console.log("  History length:", global.history.length);
console.log("  Turn number:", harness.getState().turn);
console.log();

// Execute second turn
console.log("Step 4: Executing second turn...");
const turn2 = harness.performSay("— Привет, Хлоя!");
console.log("  History length:", global.history.length);
console.log("  Turn number:", harness.getState().turn);
console.log();

// Test retry
console.log("Step 5: Testing Retry action...");
const historyBeforeRetry = global.history.length;
const retryResult = harness.performRetry();
const historyAfterRetry = global.history.length;
console.log("  History removed last entry:", historyAfterRetry < historyBeforeRetry ? '✓' : '✗');
console.log("  Action type was 'retry':", harness.getState().currentAction?.type === 'retry' ? '✓' : '✗');
console.log();

// Test continue
console.log("Step 6: Testing Continue action...");
const historyBeforeContinue = global.history.length;
const continueResult = harness.performContinue();
const historyAfterContinue = global.history.length;
console.log("  History unchanged:", historyAfterContinue === historyBeforeContinue ? '✓' : '✗');
console.log("  Action type was 'continue':", harness.getState().currentAction?.type === 'continue' ? '✓' : '✗');
console.log();

// Test erase
console.log("Step 7: Testing Erase action...");
const historyBeforeErase = global.history.length;
const erased = harness.performErase();
const historyAfterErase = global.history.length;
console.log("  Entry erased:", erased ? '✓' : '✗');
console.log("  History reduced:", historyAfterErase === historyBeforeErase - 1 ? '✓' : '✗');
console.log();

// Test command execution
console.log("Step 8: Testing command execution...");
const cmdResult = harness.performSay("/help");
console.log("  Command stopped execution:", cmdResult.stopped ? '✓' : '✗');
console.log("  Command output received:", cmdResult.commandOutput ? '✓' : '✗');
console.log();

// Demonstrate full turn lifecycle
console.log("Step 9: Demonstrating full turn lifecycle...");
harness.reset();
harness.loadScript(path.join(__dirname, '..', '..', 'Library v16.0.8.patched.txt'));
harness.loadScript(path.join(__dirname, '..', '..', 'Input v16.0.8.patched.txt'));
harness.loadScript(path.join(__dirname, '..', '..', 'Context v16.0.8.patched.txt'));
harness.loadScript(path.join(__dirname, '..', '..', 'Output v16.0.8.patched.txt'));

const fullTurn = harness.executeTurn("Начался новый день в школе.", "Максим проснулся рано утром...");
console.log("  Turn executed:", !fullTurn.stopped ? '✓' : '✗');
console.log("  Context generated:", fullTurn.context.length > 0 ? '✓' : '✗');
console.log("  AI response captured:", fullTurn.aiResponse === "Максим проснулся рано утром..." ? '✓' : '✗');
console.log("  Output processed:", fullTurn.output.length > 0 ? '✓' : '✗');
console.log();

// Final summary
console.log("=== Demo Complete ===");
console.log("✅ Test harness successfully demonstrated:");
console.log("  • Script loading and execution");
console.log("  • Full turn lifecycle (Input → Context → Output)");
console.log("  • User action simulation (Say, Retry, Continue, Erase)");
console.log("  • Command handling");
console.log("  • State management and persistence");
console.log("\nThe test harness is ready for writing test cases!");
