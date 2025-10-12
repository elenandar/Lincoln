# Integration Tests

## Overview

This directory contains **integration tests** for the Simulacrum test harness. Integration tests verify that multiple components work together correctly.

## Test Files

### test_chaos_scenarios.js

Validates system behavior under two critical chaos scenarios implementing "Протокол 'Цербер', Часть 2 — Испытание Хаосом" (Cerberus Protocol, Part 2 - Chaos Testing).

#### 1. Retry Storm
- **Scenario**: User performs 10 consecutive retry actions
- **Purpose**: Validate that the system remains stable under retry spam
- **Checks**:
  - Turn counter doesn't go backwards
  - History is correctly managed (cleared by retries)
  - No inappropriate recap offers during retries
  - System remains responsive after the storm

#### 2. Erase+Continue
- **Scenario**: User makes two actions, erases one, then continues
- **Purpose**: Ensure context integrity and prevent system data leakage
- **Checks**:
  - Erase correctly removes history entries
  - Turn counter decrements appropriately
  - Continue doesn't modify history
  - AI context is properly formatted (no naked system data)
  - No leakage of internal state like `[Mood: neutral]` or `currentAction: {`

### test_original_mechanics.js

Validates new discoveries about AI Dungeon architecture and turns hypotheses into concrete guarantees.

**Tests**:
1. **Exact Revert**: Validates precise undo behavior (performErase)
2. **Anti-Cycle**: Placeholder test for future loop detection

### test_vanishing_opening.js

Tests for opening text behavior and captures known bugs.

### test_adaptation_protocol.js

Validates that the test harness correctly implements the original AI Dungeon Story class structure with separate actions and results arrays, matching play.py behavior.

**Validates**:
1. state.story.actions[] for player inputs
2. state.story.results[] for AI responses
3. global.history provides backward compatibility via getter
4. performErase() removes from both arrays (mimics /revert)

### example_test_case.js

Example test demonstrating best practices for writing tests:
1. Setup - load scripts and initialize state
2. Execute - perform actions
3. Assert - verify expected behavior
4. Cleanup - reset for next test

### demo_harness.js

Comprehensive test demonstrating full test harness capabilities:
1. Loading game scripts
2. Executing complete turns
3. Testing retry/continue/erase actions
4. Verifying state persistence

## Running the Tests

```bash
# From simulacrum directory - run all tests
node run_all_tests.js

# Run a specific integration test
cd tests/integration
node test_chaos_scenarios.js
node test_original_mechanics.js
```

## Expected Output

When chaos tests pass:
```
✅ ALL CHAOS TESTS PASSED

Protocol 'Цербер' validation complete:
  ✓ System withstands retry storm (10 consecutive retries)
  ✓ Turn counter remains stable during retry storm
  ✓ No inappropriate recap offers during retries
  ✓ Erase+Continue maintains context integrity
  ✓ No system data leakage in AI context

System is resilient against chaos scenarios! 🛡️
```

## Implementation Notes

- These tests use the Project Simulacrum test harness (`simulacrum/test_harness.js`)
- The Input script may convert empty retry actions to continue actions - this is expected behavior
- Tests verify that system data doesn't leak into the AI context in naked form (e.g., `[Mood: neutral]`)
- Proper formatting uses tags like `⟦MOOD⟧` instead of raw system data

## Related Documentation

- Main test harness: `simulacrum/test_harness.js`
- Master test runner: `simulacrum/run_all_tests.js`
- Unit tests: `simulacrum/tests/unit/`
- System documentation: `SYSTEM_DOCUMENTATION.md`
