# Simulacrum Tests

## Overview

This directory contains all tests for the **Project Simulacrum** test harness, organized by test type according to the "Legion Protocol, Part 1" specification.

## Directory Structure

```
tests/
├── unit/              # Unit tests - test individual components in isolation
├── integration/       # Integration tests - test components working together
└── endurance/         # Endurance tests - long-running stress tests
```

### Unit Tests (`unit/`)

Fast, focused tests that validate individual components:
- `test_harness_basic.js` - Basic test harness functionality
- `test_turn_counter_integrity.js` - State turn counter validation

**When to add tests here**: Tests for single functions, modules, or isolated behaviors.

### Integration Tests (`integration/`)

Tests that verify multiple components working together:
- `test_chaos_scenarios.js` - Chaos testing (retry storms, edge cases)
- `test_original_mechanics.js` - AI Dungeon mechanics validation
- `test_adaptation_protocol.js` - Protocol compatibility tests
- `test_vanishing_opening.js` - Opening text behavior tests
- `example_test_case.js` - Test writing best practices
- `demo_harness.js` - Comprehensive harness demonstration

**When to add tests here**: End-to-end scenarios, full turn simulations, multi-component interactions.

### Endurance Tests (`endurance/`)

Long-running stress tests for system stability:

**When to add tests here**: Multi-thousand turn simulations, memory leak detection, performance degradation tests.

*Currently empty - endurance tests may take several minutes and should be run separately during development.*

## Running Tests

### Run All Tests

From the `simulacrum` directory:

```bash
# Master test runner - runs all tests in all categories
node run_all_tests.js
```

This will:
1. Recursively find all `test_*.js` files in subdirectories
2. Run each test and capture output
3. Generate a unified report with pass/fail statistics
4. Display detailed output for failed tests

### Run Individual Tests

From the `simulacrum` directory:

```bash
# Run a specific test
cd tests/unit
node test_harness_basic.js

# Or from simulacrum root
node tests/unit/test_harness_basic.js
```

## Test Naming Convention

All test files **must** be named with the `test_*.js` pattern to be automatically discovered by the master test runner.

Examples:
- ✅ `test_harness_basic.js`
- ✅ `test_chaos_scenarios.js`
- ❌ `harness_test.js` (won't be discovered)
- ❌ `demo_only.js` (won't be discovered unless named `test_demo_*.js`)

## Writing New Tests

See `integration/example_test_case.js` for best practices:

```javascript
#!/usr/bin/env node
const path = require('path');
const harness = require('../../test_harness.js');

console.log("=== My Test Suite ===\n");

// 1. Setup - reset and load scripts
harness.reset();
harness.loadScript(path.join(__dirname, '..', '..', 'Library v16.0.8.patched.txt'));
// ... load other scripts

// 2. Execute - perform actions
const result = harness.performSay("Test input");

// 3. Assert - verify expected behavior
if (result.context.includes("expected string")) {
  console.log("✅ PASSED: Test passed");
  process.exit(0);
} else {
  console.log("❌ FAILED: Test failed");
  process.exit(1);
}
```

**Key points**:
1. Use `harness.reset()` before each test case
2. Load all required game scripts
3. Use `performSay()`, `performRetry()`, `performContinue()`, `performErase()` for actions
4. Exit with code 0 for success, 1 for failure
5. Use clear ✅/❌ indicators in output

## Test Harness API

The test harness (`test_harness.js`) provides:

- `reset()` - Reset state to initial conditions
- `loadScript(path)` - Load and evaluate a game script
- `performSay(text)` - Simulate user text input
- `performRetry()` - Simulate retry action
- `performContinue()` - Simulate continue action
- `performErase()` - Simulate undo/erase action
- `getState()` - Get current game state
- `getHistory()` - Get action/result history
- `setMemory(text)` - Set front memory
- `setAuthorsNote(text)` - Set author's note

See `test_harness.js` for complete API documentation.

## Migration from Old Structure

Previous test directories have been reorganized:
- `logic_tests/` → `integration/`
- `chaos_tests/` → `integration/`
- `state_tests/` → `unit/`

All existing tests have been moved to appropriate categories and their import paths updated.

## Related Documentation

- Main test harness: `../test_harness.js`
- Master test runner: `../run_all_tests.js`
- System documentation: `../../SYSTEM_DOCUMENTATION.md`
- Simulacrum README: `../README.md`
