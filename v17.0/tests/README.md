# Lincoln v17 Tests

This directory contains test suites for Lincoln v17 development.

## Test Files

### Phase 1: Infrastructure Tests

#### `phase1-unit-tests.js`
**Purpose:** Comprehensive unit tests for all 8 Phase 1 components  
**Tests:** 60  
**Coverage:**
- lcInit (8 tests)
- LC.Tools (6 tests)
- LC.Utils (10 tests)
- currentAction (4 tests)
- LC.Flags (6 tests)
- LC.Drafts (6 tests)
- LC.Turns (5 tests)
- LC.CommandsRegistry (11 tests)
- ES5 Compliance (4 tests)

**Run:**
```bash
node phase1-unit-tests.js
```

#### `phase1-integration-tests.js`
**Purpose:** Integration tests for modifier interactions  
**Tests:** 20  
**Coverage:**
- Input Modifier Integration (4 tests)
- Output Modifier Integration (3 tests)
- Command Flow Integration (3 tests)
- State Persistence (3 tests)
- Error Handling (5 tests)
- Context Modifier (2 tests)

**Run:**
```bash
node phase1-integration-tests.js
```

## Running All Tests

```bash
# Run both test suites
node phase1-unit-tests.js && node phase1-integration-tests.js
```

## Test Results (Latest)

**Unit Tests:** ✅ 60/60 passed (100%)  
**Integration Tests:** ✅ 20/20 passed (100%)  
**Total:** ✅ 80/80 passed (100%)

## Test Framework

Tests use a minimal custom framework (no external dependencies):
- `test(description, testFn)` - Define a test
- `assert(condition, message)` - Assert truth
- `assertEqual(actual, expected, message)` - Assert equality
- `assertNotNull(value, message)` - Assert non-null

## Requirements

- Node.js v12+ (tested with v20.19.5)
- No external dependencies

## Future Tests

- **Phase 2:** TimeEngine, EnvironmentEngine, ChronologicalKB
- **Phase 3:** EvergreenEngine, GoalsEngine, KnowledgeEngine
- **Phase 4:** QualiaEngine, InformationEngine (CRITICAL)
- **Phase 5+:** Additional engine tests

## Notes

- Tests mock AI Dungeon global variables (`state`, `info`, `text`, etc.)
- Library script is loaded first, then modifiers
- Each test group resets state to ensure isolation
- Console output is suppressed during tests for clean output
