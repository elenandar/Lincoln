# State Tests - Protocol 'Цербер'

## Overview

This directory contains state integrity tests for validating that Lincoln's state object correctly updates and maintains data consistency across different game actions. These tests implement "Протокол 'Цербер', Часть 3 — Проверка Памяти" (Cerberus Protocol, Part 3 - Memory Verification).

## Test Files

### test_turn_counter_integrity.js

Validates that the turn counter (`state.turn`) correctly updates during different user actions.

**Test Steps**:
1. **Initial State**: Verify `state.turn` starts at 0
2. **Say Action**: Verify turn increments to 1 after first user input
3. **Retry Action**: Verify retry behavior (converts to Continue with empty input)
4. **Continue Action**: Verify turn increments (Continue is a real turn)
5. **Second Say**: Verify turn continues incrementing
6. **Erase Action**: Verify turn decrements when undoing

**Checks**:
- Turn counter starts at 0
- Turn increments on Say actions
- Turn increments on Continue actions
- Turn decrements on Erase actions
- Retry with empty input converts to Continue (expected behavior)

## Running the Tests

```bash
# From repository root
node simulacrum/tests/state_tests/test_turn_counter_integrity.js

# Or as executable
./simulacrum/tests/state_tests/test_turn_counter_integrity.js
```

## Expected Output

When all tests pass:
```
✅ ALL TESTS PASSED - Turn counter integrity verified!

The state.turn counter correctly:
  • Starts at 0
  • Increments on Say actions
  • Retry converts to Continue (empty input detection)
  • Increments on Continue actions
  • Decrements on Erase actions

Note: The Retry→Continue conversion is intentional system behavior.
Empty input from Retry is detected as Continue by detectInputType().
```

## Implementation Notes

- **Retry→Continue Conversion**: The Input script's `detectInputType()` function automatically detects empty input (used by Retry) as a Continue action. This is intentional system behavior documented in the chaos tests.
- **Turn Increment Logic**: The turn counter increments for all actions EXCEPT commands and retries. Since retry converts to continue, it does increment the turn.
- **State Persistence**: The state object (`state.lincoln`) persists across turns and maintains integrity.

## System Behavior Details

The turn counter behavior is controlled by:
- `Library.shouldIncrementTurn()`: Returns false only for commands and retries
- `Library.incrementTurn()`: Called by Output script when appropriate
- `Library.detectInputType()`: Analyzes input to determine action type
- `TestHarness.performErase()`: Decrements turn counter when undoing

## Related Documentation

- Main test harness: `simulacrum/test_harness.js`
- Example tests: `simulacrum/tests/example_test_case.js`
- Chaos tests: `simulacrum/tests/chaos_tests/test_chaos_scenarios.js`
- System documentation: `SYSTEM_DOCUMENTATION.md`
