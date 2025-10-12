# Chaos Tests - Protocol 'Цербер'

## Overview

This directory contains chaos testing scenarios for validating system resilience against destructive user action patterns. These tests implement "Протокол 'Цербер', Часть 2 — Испытание Хаосом" (Cerberus Protocol, Part 2 - Chaos Testing).

## Test Files

### test_chaos_scenarios.js

Validates system behavior under two critical chaos scenarios:

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

## Running the Tests

```bash
# From repository root
node simulacrum/tests/chaos_tests/test_chaos_scenarios.js

# Or as executable
./simulacrum/tests/chaos_tests/test_chaos_scenarios.js
```

## Expected Output

When all tests pass:
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
- Example tests: `simulacrum/tests/example_test_case.js`
- Rebirth Protocol tests: `tests/test_rebirth_protocol.js`
