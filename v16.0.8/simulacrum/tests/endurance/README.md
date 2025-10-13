# Endurance Tests

This directory contains **endurance tests** for long-running stress testing.

Endurance tests verify system stability over extended periods, such as:
- Multi-thousand turn simulations
- Memory leak detection
- Performance degradation testing
- Long-term state consistency

## Running Endurance Tests

From the simulacrum directory:

```bash
# Run all tests (including endurance tests)
node run_all_tests.js

# Run a specific endurance test
cd tests/endurance
node test_stress_2500_turns.js
```

## Naming Convention

All test files should be named `test_*.js`.

## Note

Currently, this directory is empty. Endurance tests may take several minutes to complete and should be run separately from quick unit and integration tests when doing rapid development.
