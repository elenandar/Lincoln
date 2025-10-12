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
console.log("  Actions count:", harness.getActions().length);
console.log("  Results count:", harness.getResults().length);
console.log("  Turn number:", harness.getState().turn);
console.log();

// Execute second turn
console.log("Step 4: Executing second turn...");
const turn2 = harness.performSay("— Привет, Хлоя!");
console.log("  Actions count:", harness.getActions().length);
console.log("  Results count:", harness.getResults().length);
console.log("  Turn number:", harness.getState().turn);
console.log();

// Test retry
console.log("Step 5: Testing Retry action...");
const resultsBeforeRetry = harness.getResults().length;
const retryResult = harness.performRetry();
const resultsAfterRetry = harness.getResults().length;
console.log("  Results removed last entry:", resultsAfterRetry < resultsBeforeRetry ? '✓' : '✗');
// Note: Action type may be changed by Input script based on empty input detection
console.log("  Retry executed successfully:", !retryResult.stopped ? '✓' : '✗');
console.log();

// Test continue
console.log("Step 6: Testing Continue action...");
const actionsBeforeContinue = harness.getActions().length;
const continueResult = harness.performContinue();
const actionsAfterContinue = harness.getActions().length;
console.log("  Actions unchanged:", actionsAfterContinue === actionsBeforeContinue ? '✓' : '✗');
console.log("  Action type was 'continue':", harness.getState().currentAction?.type === 'continue' ? '✓' : '✗');
console.log();

// Test erase
console.log("Step 7: Testing Erase action...");
const actionsBeforeErase = harness.getActions().length;
const resultsBeforeErase = harness.getResults().length;
const erased = harness.performErase();
const actionsAfterErase = harness.getActions().length;
const resultsAfterErase = harness.getResults().length;
console.log("  Entry erased:", erased ? '✓' : '✗');
console.log("  Actions reduced:", actionsAfterErase === actionsBeforeErase - 1 ? '✓' : '✗');
console.log("  Results reduced:", resultsAfterErase === resultsBeforeErase - 1 ? '✓' : '✗');
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
