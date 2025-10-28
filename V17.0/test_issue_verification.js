#!/usr/bin/env node
/**
 * Verification test using the exact scenario from the GitHub issue
 * 
 * Issue: "Спустя 2 часа" did not advance time by 2 hours—system progressed by generic turn rate only.
 * Expected: Time should advance by 2 hours
 */

console.log("=== Issue Scenario Verification Test ===\n");
console.log("Testing the exact scenario reported in the GitHub issue:\n");
console.log('Input text: "Спустя 2 часа пришла Хлоя"');
console.log("Expected behavior: Time should advance by 2 hours\n");

const fs = require('fs');
const path = require('path');

// Mock state object
global.state = {
  lincoln: {
    version: "17.0.0",
    stateVersion: 0,
    initialized: true,
    turn: 0,
    time: {
      day: 1,
      hour: 8,
      minute: 0,
      timeString: "Day 1, Morning (8:00 AM)",
      timeOfDay: "Morning",
      currentScene: "general",
      sceneStartTurn: 0,
      sceneTurnCount: 0,
      sceneMinutes: 0,
      mode: "hybrid",
      totalMinutesPassed: 0
    }
  }
};

// Load Library.txt
const libraryCode = fs.readFileSync(path.join(__dirname, 'Scripts', 'Library.txt'), 'utf8');
const createLC = new Function('state', libraryCode + '\nreturn LC;');
const LC = createLC(global.state);

console.log("BEFORE:");
console.log("  Time:", state.lincoln.time.timeString);
console.log("  Hour:", state.lincoln.time.hour);
console.log("  Minute:", state.lincoln.time.minute);
console.log("");

// Process the exact text from the issue
const issueText = "Спустя 2 часа пришла Хлоя.";

// Simulate Output.txt processing
LC.Turns.increment();
const minutesPassed = LC.TimeEngine.calculateHybridTime(issueText);
LC.TimeEngine.addMinutes(minutesPassed);

console.log("PROCESSING:");
console.log('  Input:', issueText);
console.log("  Minutes passed:", minutesPassed);
console.log("");

console.log("AFTER:");
console.log("  Time:", state.lincoln.time.timeString);
console.log("  Hour:", state.lincoln.time.hour);
console.log("  Minute:", state.lincoln.time.minute);
console.log("");

console.log("RESULT:");
if (minutesPassed === 120) {
  console.log("  ✅ SUCCESS - Time advanced by 2 hours (120 minutes)");
  console.log("  ✅ Issue is FIXED");
  console.log("");
  console.log("  Before: Day 1, Morning (8:00 AM)");
  console.log("  After:  " + state.lincoln.time.timeString);
  console.log("");
  console.log("  The Russian time anchor 'Спустя 2 часа' was correctly detected");
  console.log("  and time advanced by the intended 2 hours instead of the");
  console.log("  generic scene rate (10 minutes).");
} else {
  console.log("  ❌ FAILURE - Time advanced by " + minutesPassed + " minutes instead of 120");
  console.log("  ❌ Issue is NOT fixed");
}

console.log("");
console.log("Additional test cases from the issue:");

// Reset time
state.lincoln.time.hour = 8;
state.lincoln.time.minute = 0;
state.lincoln.time.day = 1;

const additionalTests = [
  { text: "Через три часа началась вечеринка.", expected: 180, desc: "Через три часа" },
  { text: "Через 5 минут он вернулся.", expected: 5, desc: "Через 5 минут" }
];

additionalTests.forEach((test, idx) => {
  state.lincoln.time.hour = 8;
  state.lincoln.time.minute = 0;
  LC.TimeEngine.updateTimeString();
  
  const mins = LC.TimeEngine.calculateHybridTime(test.text);
  const result = mins === test.expected ? "✅" : "❌";
  console.log(`  ${result} "${test.desc}" → ${mins} min (expected ${test.expected})`);
});

console.log("");
console.log("=== Verification Complete ===");
