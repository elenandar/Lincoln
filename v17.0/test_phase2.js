#!/usr/bin/env node
/**
 * Phase 2 Test for Lincoln v17.0.0-alpha.2
 * 
 * Tests the Physical World implementation according to MASTER_PLAN_v17.md
 * 
 * Success Criteria:
 * 1. TimeEngine correctly tracks time progression
 * 2. /time command displays current time
 * 3. EnvironmentEngine manages location and weather
 * 4. /env command works correctly
 * 5. ChronologicalKnowledgeBase records events
 * 6. /ckb command displays recent entries
 * 7. Time advances automatically after each turn
 * 8. Events are logged automatically to CKB
 */

const fs = require('fs');
const path = require('path');

// Simple test harness for v17 scripts
class V17TestHarness {
  constructor() {
    this.reset();
  }

  reset() {
    // Clear global state
    delete global.state;
    delete global.LC;
    delete global.globalThis;
    delete global.text;
    
    // Setup globalThis polyfill
    if (typeof global !== 'undefined' && !global.globalThis) {
      global.globalThis = global;
    }

    // Initialize AI Dungeon-like state
    global.state = {
      shared: {},
      message: ''
    };

    // stop() function for Input.js
    global.stop = () => {
      this.stopped = true;
    };

    this.stopped = false;
  }

  loadScript(filePath) {
    try {
      const code = fs.readFileSync(filePath, 'utf8');
      eval(code);
      return true;
    } catch (e) {
      console.error(`Error loading ${filePath}:`, e.message);
      throw e;
    }
  }

  simulateInput(inputText) {
    this.reset();
    
    // Load scripts in order from scripts/ folder
    this.loadScript(path.join(__dirname, 'scripts/Library.js'));
    
    global.text = inputText;
    this.loadScript(path.join(__dirname, 'scripts/Input.js'));
    
    return {
      message: global.state.message,
      stopped: this.stopped,
      lincoln: global.state.shared.lincoln
    };
  }

  simulateFullCycle(inputText, aiResponse) {
    this.reset();
    
    // Load Library
    this.loadScript(path.join(__dirname, 'scripts/Library.js'));
    
    // Run Input
    global.text = inputText;
    this.loadScript(path.join(__dirname, 'scripts/Input.js'));
    
    // If not stopped, continue with Context and Output
    if (!this.stopped) {
      global.text = aiResponse || 'The story continues...';
      this.loadScript(path.join(__dirname, 'scripts/Context.js'));
      this.loadScript(path.join(__dirname, 'scripts/Output.js'));
    }
    
    return {
      message: global.state.message,
      outputText: global.text,
      stopped: this.stopped,
      lincoln: global.state.shared.lincoln
    };
  }
}

// Test runner
function runTests() {
  const harness = new V17TestHarness();
  const tests = [];
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    tests.push({ name, fn });
  }

  function assertEqual(actual, expected, msg) {
    if (actual !== expected) {
      throw new Error(`${msg || 'Assertion failed'}: expected ${expected}, got ${actual}`);
    }
  }

  function assertDefined(value, msg) {
    if (value === undefined || value === null) {
      throw new Error(`${msg || 'Value is undefined/null'}`);
    }
  }

  function assertContains(str, substring, msg) {
    if (!str || !str.includes(substring)) {
      throw new Error(`${msg || 'String does not contain substring'}: "${substring}" not in "${str}"`);
    }
  }

  // === PHASE 2 TESTS ===

  test('TimeEngine initializes correctly', () => {
    const result = harness.simulateInput('Test');
    assertDefined(result.lincoln.time, 'time structure should exist');
    assertEqual(result.lincoln.time.day, 1, 'day should start at 1');
    assertEqual(result.lincoln.time.timeOfDay, 'Morning', 'should start at Morning');
    assertEqual(result.lincoln.time.dayOfWeek, 'Monday', 'should start on Monday');
  });

  test('EnvironmentEngine initializes correctly', () => {
    const result = harness.simulateInput('Test');
    assertDefined(result.lincoln.environment, 'environment structure should exist');
    assertDefined(result.lincoln.environment.location, 'location should exist');
    assertDefined(result.lincoln.environment.weather, 'weather should exist');
  });

  test('ChronologicalKnowledgeBase initializes correctly', () => {
    const result = harness.simulateInput('Test');
    assertDefined(result.lincoln.chronologicalKnowledge, 'CKB should exist');
    assertEqual(Array.isArray(result.lincoln.chronologicalKnowledge), true, 'CKB should be an array');
  });

  test('/time command displays current time', () => {
    const result = harness.simulateInput('/time');
    assertContains(result.message, 'Day 1', 'should display day');
    assertContains(result.message, 'Monday', 'should display day of week');
    assertContains(result.message, 'Morning', 'should display time of day');
  });

  test('/env command displays current environment', () => {
    const result = harness.simulateInput('/env');
    assertContains(result.message, 'Location:', 'should display location');
    assertContains(result.message, 'Weather:', 'should display weather');
  });

  test('/env set location changes location', () => {
    const result = harness.simulateInput('/env set location Classroom');
    assertContains(result.message, 'Location set to', 'should confirm change');
    assertEqual(result.lincoln.environment.location, 'Classroom', 'location should be updated');
  });

  test('/env set weather changes weather', () => {
    const result = harness.simulateInput('/env set weather Rainy');
    assertContains(result.message, 'Weather set to', 'should confirm change');
    assertEqual(result.lincoln.environment.weather, 'Rainy', 'weather should be updated');
  });

  test('Time advances after story action', () => {
    const result = harness.simulateFullCycle('Player does something', 'AI responds');
    assertEqual(result.lincoln.turn, 1, 'turn should increment');
    assertEqual(result.lincoln.time.turn, 1, 'time.turn should sync');
    assertEqual(result.lincoln.time.timeOfDay, 'Day', 'should advance to Day');
  });

  test('Time progresses through day correctly', () => {
    harness.reset();
    harness.loadScript(path.join(__dirname, 'scripts/Library.js'));
    
    // Simulate multiple turns
    for (let i = 0; i < 4; i++) {
      global.text = 'Story continues...';
      harness.loadScript(path.join(__dirname, 'scripts/Input.js'));
      harness.loadScript(path.join(__dirname, 'scripts/Context.js'));
      harness.loadScript(path.join(__dirname, 'scripts/Output.js'));
    }
    
    const L = global.state.shared.lincoln;
    assertEqual(L.turn, 4, 'should be turn 4');
    assertEqual(L.time.day, 2, 'should be day 2');
    assertEqual(L.time.timeOfDay, 'Morning', 'should cycle back to Morning');
    assertEqual(L.time.dayOfWeek, 'Tuesday', 'should be Tuesday');
  });

  test('Events are logged to CKB automatically', () => {
    const result = harness.simulateFullCycle('Player action', 'AI response text');
    assertEqual(result.lincoln.chronologicalKnowledge.length > 0, true, 'CKB should have entries');
    const entry = result.lincoln.chronologicalKnowledge[0];
    assertDefined(entry.turn, 'entry should have turn');
    assertDefined(entry.day, 'entry should have day');
    assertDefined(entry.timeOfDay, 'entry should have timeOfDay');
    assertDefined(entry.text, 'entry should have text');
  });

  test('/ckb command displays recent entries', () => {
    // First, create some CKB entries
    harness.reset();
    harness.loadScript(path.join(__dirname, 'scripts/Library.js'));
    
    // Create 3 story actions to populate CKB
    for (let i = 0; i < 3; i++) {
      global.text = `Story action ${i + 1}`;
      harness.loadScript(path.join(__dirname, 'scripts/Input.js'));
      global.text = `AI response ${i + 1}`;
      harness.loadScript(path.join(__dirname, 'scripts/Context.js'));
      harness.loadScript(path.join(__dirname, 'scripts/Output.js'));
    }
    
    // Now test /ckb command
    global.text = '/ckb';
    harness.loadScript(path.join(__dirname, 'scripts/Input.js'));
    
    const message = global.state.message;
    assertContains(message, 'Recent', 'should show recent entries');
    assertContains(message, 'CKB', 'should mention CKB');
  });

  test('Time does not advance for command actions', () => {
    harness.reset();
    harness.loadScript(path.join(__dirname, 'scripts/Library.js'));
    
    // Execute a command
    global.text = '/time';
    harness.loadScript(path.join(__dirname, 'scripts/Input.js'));
    
    const L = global.state.shared.lincoln;
    assertEqual(L.turn, 0, 'turn should not increment for commands');
  });

  test('Week cycles correctly after 7 days', () => {
    harness.reset();
    harness.loadScript(path.join(__dirname, 'scripts/Library.js'));
    
    // Simulate 28 turns (7 days * 4 time periods)
    for (let i = 0; i < 28; i++) {
      global.text = 'Story continues...';
      harness.loadScript(path.join(__dirname, 'scripts/Input.js'));
      harness.loadScript(path.join(__dirname, 'scripts/Context.js'));
      harness.loadScript(path.join(__dirname, 'scripts/Output.js'));
    }
    
    const L = global.state.shared.lincoln;
    assertEqual(L.time.day, 8, 'should be day 8');
    assertEqual(L.time.dayOfWeek, 'Monday', 'should cycle back to Monday');
  });

  // Run all tests
  console.log('=== Lincoln v17.0.0-alpha.2 Phase 2 Tests ===\n');

  tests.forEach(({ name, fn }) => {
    try {
      fn();
      console.log(`✓ ${name}`);
      passed++;
    } catch (e) {
      console.log(`✗ ${name}`);
      console.log(`  Error: ${e.message}`);
      failed++;
    }
  });

  console.log('\n=== Test Results ===');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${tests.length}`);

  if (failed === 0) {
    console.log('\n✓ All tests passed! Phase 2 implementation is successful.');
  } else {
    console.log(`\n✗ ${failed} test(s) failed.`);
    process.exit(1);
  }
}

// Run the tests
runTests();
