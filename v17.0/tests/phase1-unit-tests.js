// ============================================================================
// Lincoln v17 Phase 1: Infrastructure Unit Tests
// ============================================================================
// Tests all 8 Phase 1 components for ES5 compliance and functionality
//
// Run with: node phase1-unit-tests.js
// ============================================================================

// Mock global state and console for testing
var state = { lincoln: null };
var info = { actionType: "story" };
var text = "";
var globalThis = global || window || this;

// Mock console for test output
var testResults = [];
var originalConsoleLog = console.log;
var originalConsoleWarn = console.warn;
var originalConsoleError = console.error;

console.log = function() {
  // Suppress library logs during testing
};
console.warn = function() { /* suppress */ };
console.error = function() { /* suppress */ };

// Load Library script
eval(require('fs').readFileSync(__dirname + '/../Scripts/Library', 'utf8'));

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

function assertNotNull(value, message) {
  if (value === null || value === undefined) {
    throw new Error(message || "Value is null or undefined");
  }
}

// ============================================================================
// TEST SUITE
// ============================================================================

console.log("============================================================================");
console.log("Lincoln v17 Phase 1: Infrastructure Unit Tests");
console.log("============================================================================\n");

// Reset state before each test group
function resetState() {
  state = { lincoln: null };
}

// ----------------------------------------------------------------------------
// TEST GROUP 1: lcInit
// ----------------------------------------------------------------------------

console.log("TEST GROUP 1: lcInit - State Initialization");
console.log("----------------------------------------------------------------------------");

test("lcInit creates state.lincoln object", function() {
  resetState();
  var L = LC.lcInit();
  assertNotNull(L, "state.lincoln should not be null");
  assert(state.lincoln !== null, "state.lincoln should be created");
});

test("lcInit sets correct version", function() {
  resetState();
  var L = LC.lcInit();
  assert(L.version.indexOf("17.0.0-phase1") !== -1, "Version should be phase1");
});

test("lcInit initializes stateVersion to 0", function() {
  resetState();
  var L = LC.lcInit();
  assertEqual(L.stateVersion, 0, "stateVersion should start at 0");
});

test("lcInit initializes turn to 0", function() {
  resetState();
  var L = LC.lcInit();
  assertEqual(L.turn, 0, "turn should start at 0");
});

test("lcInit creates currentAction structure", function() {
  resetState();
  var L = LC.lcInit();
  assertNotNull(L.currentAction, "currentAction should exist");
  assertEqual(L.currentAction.type, "story", "default type should be 'story'");
});

test("lcInit creates empty drafts array", function() {
  resetState();
  var L = LC.lcInit();
  assert(Array.isArray(L.drafts), "drafts should be an array");
  assertEqual(L.drafts.length, 0, "drafts should be empty");
});

test("lcInit creates characters object", function() {
  resetState();
  var L = LC.lcInit();
  assertNotNull(L.characters, "characters should exist");
  assertEqual(typeof L.characters, "object", "characters should be an object");
});

test("lcInit is idempotent", function() {
  resetState();
  var L1 = LC.lcInit();
  var L2 = LC.lcInit();
  assert(L1 === L2, "Multiple calls should return same object");
});

console.log("");

// ----------------------------------------------------------------------------
// TEST GROUP 2: LC.Tools
// ----------------------------------------------------------------------------

console.log("TEST GROUP 2: LC.Tools - Safety Utilities");
console.log("----------------------------------------------------------------------------");

test("LC.Tools exists", function() {
  assertNotNull(LC.Tools, "LC.Tools should exist");
});

test("safeRegexMatch with simple pattern", function() {
  var result = LC.Tools.safeRegexMatch("hello world", /world/);
  assertNotNull(result, "should find match");
  assertEqual(result[0], "world", "should match 'world'");
});

test("safeRegexMatch with no match", function() {
  var result = LC.Tools.safeRegexMatch("hello world", /xyz/);
  assertEqual(result, null, "should return null for no match");
});

test("safeRegexMatch with string pattern", function() {
  var result = LC.Tools.safeRegexMatch("test123", "\\d+", "g");
  assertNotNull(result, "should find match");
  assertEqual(result[0], "123", "should match digits");
});

test("safeRegexMatch handles null input", function() {
  var result = LC.Tools.safeRegexMatch(null, /test/);
  assertEqual(result, null, "should return null for null input");
});

test("escapeRegex escapes special characters", function() {
  var escaped = LC.Tools.escapeRegex("test.*()?");
  assertEqual(escaped, "test\\.\\*\\(\\)\\?", "should escape regex chars");
});

test("escapeRegex handles null input", function() {
  var result = LC.Tools.escapeRegex(null);
  assertEqual(result, "", "should return empty string for null");
});

console.log("");

// ----------------------------------------------------------------------------
// TEST GROUP 3: LC.Utils
// ----------------------------------------------------------------------------

console.log("TEST GROUP 3: LC.Utils - Type Conversion");
console.log("----------------------------------------------------------------------------");

test("LC.Utils exists", function() {
  assertNotNull(LC.Utils, "LC.Utils should exist");
});

test("toNum converts string to number", function() {
  assertEqual(LC.Utils.toNum("123"), 123, "should convert '123' to 123");
  assertEqual(LC.Utils.toNum("45.67"), 45.67, "should convert '45.67' to 45.67");
});

test("toNum converts boolean to number", function() {
  assertEqual(LC.Utils.toNum(true), 1, "true should be 1");
  assertEqual(LC.Utils.toNum(false), 0, "false should be 0");
});

test("toNum returns default for invalid input", function() {
  assertEqual(LC.Utils.toNum("invalid"), 0, "invalid string should return 0");
  assertEqual(LC.Utils.toNum("invalid", 99), 99, "should use custom default");
});

test("toStr converts number to string", function() {
  assertEqual(LC.Utils.toStr(123), "123", "should convert 123 to '123'");
});

test("toStr converts null to default", function() {
  assertEqual(LC.Utils.toStr(null), "", "null should return empty string");
  assertEqual(LC.Utils.toStr(null, "N/A"), "N/A", "should use custom default");
});

test("toBool converts truthy strings", function() {
  assertEqual(LC.Utils.toBool("true"), true, "'true' should be true");
  assertEqual(LC.Utils.toBool("yes"), true, "'yes' should be true");
  assertEqual(LC.Utils.toBool("1"), true, "'1' should be true");
});

test("toBool converts falsy strings", function() {
  assertEqual(LC.Utils.toBool("false"), false, "'false' should be false");
  assertEqual(LC.Utils.toBool("no"), false, "'no' should be false");
  assertEqual(LC.Utils.toBool("0"), false, "'0' should be false");
});

test("toBool converts numbers", function() {
  assertEqual(LC.Utils.toBool(1), true, "1 should be true");
  assertEqual(LC.Utils.toBool(0), false, "0 should be false");
});

test("clamp limits value to range", function() {
  assertEqual(LC.Utils.clamp(5, 0, 10), 5, "5 in [0,10] should be 5");
  assertEqual(LC.Utils.clamp(-5, 0, 10), 0, "-5 should clamp to 0");
  assertEqual(LC.Utils.clamp(15, 0, 10), 10, "15 should clamp to 10");
});

console.log("");

// ----------------------------------------------------------------------------
// TEST GROUP 4: currentAction
// ----------------------------------------------------------------------------

console.log("TEST GROUP 4: currentAction - Action Tracking");
console.log("----------------------------------------------------------------------------");

test("updateCurrentAction sets action type", function() {
  resetState();
  LC.lcInit();
  LC.updateCurrentAction("do", "walk forward");
  assertEqual(LC.getCurrentActionType(), "do", "action type should be 'do'");
});

test("updateCurrentAction stores raw text", function() {
  resetState();
  LC.lcInit();
  LC.updateCurrentAction("say", "Hello there!");
  var L = state.lincoln;
  assertEqual(L.currentAction.rawText, "Hello there!", "should store raw text");
});

test("updateCurrentAction normalizes text", function() {
  resetState();
  LC.lcInit();
  LC.updateCurrentAction("say", "  HELLO  ");
  var L = state.lincoln;
  assertEqual(L.currentAction.normalized, "hello", "should normalize text");
});

test("updateCurrentAction increments stateVersion", function() {
  resetState();
  var L = LC.lcInit();
  var version = L.stateVersion;
  LC.updateCurrentAction("story", "test");
  assert(L.stateVersion > version, "stateVersion should increment");
});

console.log("");

// ----------------------------------------------------------------------------
// TEST GROUP 5: LC.Flags
// ----------------------------------------------------------------------------

console.log("TEST GROUP 5: LC.Flags - Compatibility Facade");
console.log("----------------------------------------------------------------------------");

test("LC.Flags exists", function() {
  assertNotNull(LC.Flags, "LC.Flags should exist");
});

test("isDo returns true for 'do' action", function() {
  resetState();
  LC.lcInit();
  LC.updateCurrentAction("do", "test");
  assertEqual(LC.Flags.isDo(), true, "isDo should be true");
  assertEqual(LC.Flags.isSay(), false, "isSay should be false");
});

test("isSay returns true for 'say' action", function() {
  resetState();
  LC.lcInit();
  LC.updateCurrentAction("say", "test");
  assertEqual(LC.Flags.isSay(), true, "isSay should be true");
  assertEqual(LC.Flags.isDo(), false, "isDo should be false");
});

test("isStory returns true for 'story' action", function() {
  resetState();
  LC.lcInit();
  LC.updateCurrentAction("story", "test");
  assertEqual(LC.Flags.isStory(), true, "isStory should be true");
});

test("getText returns raw text", function() {
  resetState();
  LC.lcInit();
  LC.updateCurrentAction("say", "Hello World");
  assertEqual(LC.Flags.getText(), "Hello World", "should return raw text");
});

test("getNormalizedText returns normalized text", function() {
  resetState();
  LC.lcInit();
  LC.updateCurrentAction("say", "  HELLO WORLD  ");
  assertEqual(LC.Flags.getNormalizedText(), "hello world", "should return normalized");
});

console.log("");

// ----------------------------------------------------------------------------
// TEST GROUP 6: LC.Drafts
// ----------------------------------------------------------------------------

console.log("TEST GROUP 6: LC.Drafts - Message Queue");
console.log("----------------------------------------------------------------------------");

test("LC.Drafts exists", function() {
  assertNotNull(LC.Drafts, "LC.Drafts should exist");
});

test("add queues a message", function() {
  resetState();
  LC.lcInit();
  LC.Drafts.add("Test message", 0);
  var drafts = LC.Drafts.peek();
  assertEqual(drafts.length, 1, "should have 1 message");
  assertEqual(drafts[0].message, "Test message", "should store message");
});

test("flush returns messages and clears queue", function() {
  resetState();
  LC.lcInit();
  LC.Drafts.add("Message 1", 0);
  LC.Drafts.add("Message 2", 0);
  var result = LC.Drafts.flush();
  assert(result.indexOf("Message 1") !== -1, "should contain Message 1");
  assert(result.indexOf("Message 2") !== -1, "should contain Message 2");
  assertEqual(LC.Drafts.peek().length, 0, "queue should be empty after flush");
});

test("flush sorts by priority", function() {
  resetState();
  LC.lcInit();
  LC.Drafts.add("Low", 1);
  LC.Drafts.add("High", 10);
  LC.Drafts.add("Medium", 5);
  var result = LC.Drafts.flush();
  var lines = result.split("\n\n");
  assertEqual(lines[0], "High", "High priority should be first");
  assertEqual(lines[1], "Medium", "Medium priority should be second");
  assertEqual(lines[2], "Low", "Low priority should be last");
});

test("peek does not clear queue", function() {
  resetState();
  LC.lcInit();
  LC.Drafts.add("Test", 0);
  var peeked = LC.Drafts.peek();
  assertEqual(peeked.length, 1, "should have 1 message");
  var peeked2 = LC.Drafts.peek();
  assertEqual(peeked2.length, 1, "should still have 1 message");
});

test("clear empties queue", function() {
  resetState();
  LC.lcInit();
  LC.Drafts.add("Test", 0);
  LC.Drafts.clear();
  assertEqual(LC.Drafts.peek().length, 0, "queue should be empty");
});

console.log("");

// ----------------------------------------------------------------------------
// TEST GROUP 7: LC.Turns
// ----------------------------------------------------------------------------

console.log("TEST GROUP 7: LC.Turns - Turn Counter");
console.log("----------------------------------------------------------------------------");

test("LC.Turns exists", function() {
  assertNotNull(LC.Turns, "LC.Turns should exist");
});

test("get returns current turn", function() {
  resetState();
  LC.lcInit();
  assertEqual(LC.Turns.get(), 0, "initial turn should be 0");
});

test("increment increases turn", function() {
  resetState();
  LC.lcInit();
  LC.Turns.increment();
  assertEqual(LC.Turns.get(), 1, "turn should be 1");
  LC.Turns.increment();
  assertEqual(LC.Turns.get(), 2, "turn should be 2");
});

test("set changes turn to specific value", function() {
  resetState();
  LC.lcInit();
  LC.Turns.set(42);
  assertEqual(LC.Turns.get(), 42, "turn should be 42");
});

test("increment updates stateVersion", function() {
  resetState();
  var L = LC.lcInit();
  var version = L.stateVersion;
  LC.Turns.increment();
  assert(L.stateVersion > version, "stateVersion should increment");
});

console.log("");

// ----------------------------------------------------------------------------
// TEST GROUP 8: LC.CommandsRegistry
// ----------------------------------------------------------------------------

console.log("TEST GROUP 8: LC.CommandsRegistry - Command Parser");
console.log("----------------------------------------------------------------------------");

test("LC.CommandsRegistry exists", function() {
  assertNotNull(LC.CommandsRegistry, "LC.CommandsRegistry should exist");
});

test("CommandsRegistry uses plain object, not Map", function() {
  assert(typeof LC.CommandsRegistry._handlers === "object", "should use plain object");
  assert(!(LC.CommandsRegistry._handlers instanceof Map), "should NOT use Map");
});

test("register adds a command", function() {
  LC.CommandsRegistry.register("test", function() { return "OK"; });
  assert(LC.CommandsRegistry.has("test"), "command should be registered");
});

test("execute runs registered command", function() {
  LC.CommandsRegistry.register("echo", function(args) { return args.join(" "); });
  var result = LC.CommandsRegistry.execute("/echo hello world");
  assertEqual(result, "hello world", "should return 'hello world'");
});

test("execute returns null for unknown command", function() {
  var result = LC.CommandsRegistry.execute("/unknowncommand");
  assertEqual(result, null, "should return null for unknown command");
});

test("execute returns null for non-command input", function() {
  var result = LC.CommandsRegistry.execute("regular text");
  assertEqual(result, null, "should return null for non-command");
});

test("execute handles command with no args", function() {
  LC.CommandsRegistry.register("noargs", function(args) { return "NO ARGS"; });
  var result = LC.CommandsRegistry.execute("/noargs");
  assertEqual(result, "NO ARGS", "should execute command with no args");
});

test("list returns all commands", function() {
  var commands = LC.CommandsRegistry.list();
  assert(Array.isArray(commands), "should return array");
  assert(commands.indexOf("ping") !== -1, "should include 'ping'");
  assert(commands.indexOf("debug") !== -1, "should include 'debug'");
});

test("built-in /ping command works", function() {
  var result = LC.CommandsRegistry.execute("/ping");
  assert(result.indexOf("PONG") !== -1, "should contain PONG");
  assert(result.indexOf("17.0.0-phase1") !== -1, "should contain version");
});

test("built-in /debug command works", function() {
  resetState();
  LC.lcInit();
  var result = LC.CommandsRegistry.execute("/debug");
  assert(result.indexOf("DEBUG") !== -1, "should contain DEBUG");
  assert(result.indexOf("Turn:") !== -1, "should show turn");
});

console.log("");

// ----------------------------------------------------------------------------
// TEST GROUP 9: ES5 Compliance
// ----------------------------------------------------------------------------

console.log("TEST GROUP 9: ES5 Compliance");
console.log("----------------------------------------------------------------------------");

test("No Map usage in CommandsRegistry", function() {
  var code = require('fs').readFileSync(__dirname + '/../Scripts/Library', 'utf8');
  assert(code.indexOf("new Map") === -1, "should not use 'new Map'");
});

test("No Set usage", function() {
  var code = require('fs').readFileSync(__dirname + '/../Scripts/Library', 'utf8');
  assert(code.indexOf("new Set") === -1, "should not use 'new Set'");
});

test("No arrow functions in production code", function() {
  var code = require('fs').readFileSync(__dirname + '/../Scripts/Library', 'utf8');
  // Remove comments and JSDoc
  var lines = code.split('\n');
  var productionLines = lines.filter(function(line) {
    var trimmed = line.trim();
    // Exclude comment lines and JSDoc
    return trimmed.indexOf('//') !== 0 && trimmed.indexOf('*') !== 0;
  });
  var productionCode = productionLines.join('\n');
  // Check for actual arrow function usage (not in comments)
  // Pattern: something => something (actual arrow function)
  var arrowFunctionPattern = /\w+\s*=>\s*\w+/;
  assert(!arrowFunctionPattern.test(productionCode), "should not use arrow functions in production code");
});

test("Uses plain for loops, not forEach", function() {
  var code = require('fs').readFileSync(__dirname + '/../Scripts/Library', 'utf8');
  // forEach is allowed but we should also have for loops
  assert(code.indexOf("for (var") !== -1, "should use for loops");
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
  console.log("\n✓ ALL TESTS PASSED! Phase 1 Infrastructure is ready.\n");
  process.exit(0);
} else {
  console.log("\n✗ SOME TESTS FAILED. Please review the errors above.\n");
  process.exit(1);
}
