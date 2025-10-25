// ============================================================================
// Lincoln v17 Phase 1: Infrastructure Integration Tests
// ============================================================================
// Tests integration between Input, Output, Context modifiers and Library
//
// Run with: node phase1-integration-tests.js
// ============================================================================

// Mock global state and console for testing
var state = { lincoln: null };
var info = { actionType: "story" };
var text = "";
var history = [];
var globalThis = global || window || this;

// Mock console for test output
var originalConsoleLog = console.log;
var originalConsoleWarn = console.warn;
var originalConsoleError = console.error;

console.log = function() { /* suppress library logs */ };
console.warn = function() { /* suppress */ };
console.error = function() { /* suppress */ };

// Load all scripts
eval(require('fs').readFileSync(__dirname + '/../Scripts/Library', 'utf8'));

// Load Input modifier - extract the modifier function
var inputModifierCode = require('fs').readFileSync(__dirname + '/../Scripts/Input', 'utf8');
var inputModifier = eval('(function() { ' + inputModifierCode.replace('return modifier(text);', 'return modifier;') + ' })()');

// Load Output modifier
var outputModifierCode = require('fs').readFileSync(__dirname + '/../Scripts/Output', 'utf8');
var outputModifier = eval('(function() { ' + outputModifierCode.replace('return modifier(text);', 'return modifier;') + ' })()');

// Load Context modifier
var contextModifierCode = require('fs').readFileSync(__dirname + '/../Scripts/Context', 'utf8');
var contextModifier = eval('(function() { ' + contextModifierCode.replace('return modifier(text);', 'return modifier;') + ' })()');


// Restore console
console.log = originalConsoleLog;
console.warn = originalConsoleWarn;
console.error = originalConsoleError;

// Test framework
var testCount = 0;
var passCount = 0;
var failCount = 0;

function test(description, testFn) {
  testCount++;
  try {
    testFn();
    passCount++;
    console.log("✓ " + description);
  } catch (error) {
    failCount++;
    console.log("✗ " + description);
    console.log("  Error: " + error.message);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error((message || "Values not equal") + " (expected: " + expected + ", got: " + actual + ")");
  }
}

// Reset state before each test
function resetState() {
  state = { lincoln: null };
  info = { actionType: "story" };
  text = "";
}

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

console.log("============================================================================");
console.log("Lincoln v17 Phase 1: Infrastructure Integration Tests");
console.log("============================================================================\n");

// ----------------------------------------------------------------------------
// TEST GROUP 1: Input Modifier Integration
// ----------------------------------------------------------------------------

console.log("TEST GROUP 1: Input Modifier Integration");
console.log("----------------------------------------------------------------------------");

test("Input modifier initializes LC", function() {
  resetState();
  text = "test input";
  var result = inputModifier(text);
  assert(state.lincoln !== null, "state.lincoln should be initialized");
});

test("Input modifier tracks action type", function() {
  resetState();
  info.actionType = "do";
  text = "walk forward";
  inputModifier(text);
  assertEqual(LC.getCurrentActionType(), "do", "should track action type");
});

test("Input modifier detects commands", function() {
  resetState();
  text = "/ping";
  var result = inputModifier(text);
  // Command should clear input
  assertEqual(result.text, "", "command should clear input");
  // Result should be in drafts
  var drafts = LC.Drafts.peek();
  assert(drafts.length > 0, "command result should be queued");
});

test("Input modifier passes through non-commands", function() {
  resetState();
  text = "regular story text";
  var result = inputModifier(text);
  assertEqual(result.text, "regular story text", "should pass through non-command");
});

console.log("");

// ----------------------------------------------------------------------------
// TEST GROUP 2: Output Modifier Integration
// ----------------------------------------------------------------------------

console.log("TEST GROUP 2: Output Modifier Integration");
console.log("----------------------------------------------------------------------------");

test("Output modifier increments turn", function() {
  resetState();
  LC.lcInit();
  text = "AI output";
  var initialTurn = LC.Turns.get();
  outputModifier(text);
  assertEqual(LC.Turns.get(), initialTurn + 1, "turn should increment");
});

test("Output modifier flushes drafts", function() {
  resetState();
  LC.lcInit();
  LC.Drafts.add("System message", 10);
  text = "AI output";
  var result = outputModifier(text);
  assert(result.text.indexOf("System message") !== -1, "should include draft");
  assert(result.text.indexOf("AI output") !== -1, "should include AI output");
});

test("Output modifier prepends high-priority drafts", function() {
  resetState();
  LC.lcInit();
  LC.Drafts.add("Low priority", 1);
  LC.Drafts.add("High priority", 100);
  text = "AI output";
  var result = outputModifier(text);
  var highIndex = result.text.indexOf("High priority");
  var lowIndex = result.text.indexOf("Low priority");
  assert(highIndex < lowIndex, "high priority should come first");
});

console.log("");

// ----------------------------------------------------------------------------
// TEST GROUP 3: Command Flow Integration
// ----------------------------------------------------------------------------

console.log("TEST GROUP 3: Command Flow Integration");
console.log("----------------------------------------------------------------------------");

test("Full /ping command flow", function() {
  resetState();
  LC.lcInit();
  
  // Input: user types /ping
  text = "/ping";
  var inputResult = inputModifier(text);
  
  // Input should clear text
  assertEqual(inputResult.text, "", "input should be cleared");
  
  // Output: should display command result
  text = "";
  var outputResult = outputModifier(text);
  
  assert(outputResult.text.indexOf("PONG") !== -1, "output should contain PONG");
  assert(outputResult.text.indexOf("17.0.0-phase1") !== -1, "output should contain version");
});

test("Full /debug command flow", function() {
  resetState();
  LC.lcInit();
  
  // Set up some state
  LC.Turns.set(5);
  LC.updateCurrentAction("say", "Hello");
  
  // Input: user types /debug  
  text = "/debug";
  inputModifier(text);
  
  // Output: should display debug info
  text = "";
  var outputResult = outputModifier(text);
  
  // Debug command output should contain debug information
  assert(outputResult.text.indexOf("DEBUG") !== -1, "should contain DEBUG marker");
  assert(outputResult.text.indexOf("Turn:") !== -1, "should show turn information");
});

test("Multiple commands in sequence", function() {
  resetState();
  LC.lcInit();
  
  // Command 1: /ping
  text = "/ping";
  inputModifier(text);
  text = "";
  var result1 = outputModifier(text);
  assert(result1.text.indexOf("PONG") !== -1, "first command should work");
  
  // Command 2: /turn
  text = "/turn";
  inputModifier(text);
  text = "";
  var result2 = outputModifier(text);
  assert(result2.text.indexOf("Current turn:") !== -1, "second command should work");
});

console.log("");

// ----------------------------------------------------------------------------
// TEST GROUP 4: State Persistence
// ----------------------------------------------------------------------------

console.log("TEST GROUP 4: State Persistence");
console.log("----------------------------------------------------------------------------");

test("State persists across modifier calls", function() {
  resetState();
  LC.lcInit();
  
  // Turn 1
  text = "input 1";
  inputModifier(text);
  text = "output 1";
  outputModifier(text);
  var turn1 = LC.Turns.get();
  
  // Turn 2
  text = "input 2";
  inputModifier(text);
  text = "output 2";
  outputModifier(text);
  var turn2 = LC.Turns.get();
  
  assertEqual(turn2, turn1 + 1, "turns should persist and increment");
});

test("CurrentAction persists from Input to Output", function() {
  resetState();
  LC.lcInit();
  
  // Input sets action
  info.actionType = "say";
  text = "Hello there";
  inputModifier(text);
  
  // Output can read action
  assertEqual(LC.getCurrentActionType(), "say", "action should persist");
  assertEqual(LC.Flags.getText(), "Hello there", "text should persist");
});

test("StateVersion increments on modifications", function() {
  resetState();
  var L = LC.lcInit();
  var initialVersion = L.stateVersion;
  
  LC.updateCurrentAction("do", "test");
  assert(L.stateVersion > initialVersion, "version should increment on action update");
  
  var version2 = L.stateVersion;
  LC.Drafts.add("test", 0);
  assert(L.stateVersion > version2, "version should increment on draft add");
  
  var version3 = L.stateVersion;
  LC.Turns.increment();
  assert(L.stateVersion > version3, "version should increment on turn");
});

console.log("");

// ----------------------------------------------------------------------------
// TEST GROUP 5: Error Handling
// ----------------------------------------------------------------------------

console.log("TEST GROUP 5: Error Handling");
console.log("----------------------------------------------------------------------------");

test("Input handles empty text", function() {
  resetState();
  text = "";
  var result = inputModifier(text);
  assertEqual(result.text, "", "should handle empty text");
});

test("Input handles null text", function() {
  resetState();
  text = null;
  var result = inputModifier(text);
  assertEqual(result.text, "", "should convert null to empty string");
});

test("Output handles empty text", function() {
  resetState();
  LC.lcInit();
  text = "";
  var result = outputModifier(text);
  assertEqual(typeof result.text, "string", "should return string");
});

test("Commands handle missing arguments", function() {
  resetState();
  LC.lcInit();
  text = "/draft";
  inputModifier(text);
  text = "";
  var result = outputModifier(text);
  assert(result.text.indexOf("Usage:") !== -1, "should show usage message");
});

test("Unknown commands pass through", function() {
  resetState();
  LC.lcInit();
  text = "/unknowncommand arg1 arg2";
  var result = inputModifier(text);
  // Unknown commands should return null and pass through
  assertEqual(result.text, "/unknowncommand arg1 arg2", "unknown command should pass through");
});

console.log("");

// ----------------------------------------------------------------------------
// TEST GROUP 6: Context Modifier
// ----------------------------------------------------------------------------

console.log("TEST GROUP 6: Context Modifier");
console.log("----------------------------------------------------------------------------");

test("Context modifier works", function() {
  resetState();
  LC.lcInit();
  text = "This is context";
  var result = contextModifier(text);
  assertEqual(result.text, "This is context", "should pass through context");
});

test("Context modifier can read state", function() {
  resetState();
  LC.lcInit();
  LC.Turns.set(10);
  text = "context";
  contextModifier(text);
  assertEqual(LC.Turns.get(), 10, "should be able to read state");
});

console.log("");

// ============================================================================
// TEST SUMMARY
// ============================================================================

console.log("============================================================================");
console.log("TEST SUMMARY");
console.log("============================================================================");
console.log("Total Tests:  " + testCount);
console.log("Passed:       " + passCount + " ✓");
console.log("Failed:       " + failCount + " ✗");
console.log("Success Rate: " + Math.round((passCount / testCount) * 100) + "%");
console.log("============================================================================");

if (failCount === 0) {
  console.log("\n✓ ALL INTEGRATION TESTS PASSED! Phase 1 is fully integrated.\n");
  process.exit(0);
} else {
  console.log("\n✗ SOME TESTS FAILED. Please review the errors above.\n");
  process.exit(1);
}
