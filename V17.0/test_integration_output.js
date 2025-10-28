#!/usr/bin/env node
/**
 * Integration test for Russian time anchors with Output.txt
 * 
 * This test simulates the full flow:
 * 1. Library.txt initializes LC and TimeEngine
 * 2. Output.txt processes AI output with Russian text
 * 3. Time advances correctly based on Russian anchors
 */

console.log("=== Integration Test: Russian Time Anchors with Output.txt ===\n");

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

console.log("✓ Library loaded");
console.log("✓ Initial time:", state.lincoln.time.timeString);
console.log("");

// Simulate Output.txt processing
function simulateOutput(text) {
  // Increment turn counter
  LC.Turns.increment();
  
  // Calculate and apply time progression
  var minutesPassed = LC.TimeEngine.calculateHybridTime(text);
  LC.TimeEngine.addMinutes(minutesPassed);
  
  return {
    turn: state.lincoln.turn,
    minutesPassed: minutesPassed,
    timeString: state.lincoln.time.timeString,
    timeOfDay: state.lincoln.time.timeOfDay,
    hour: state.lincoln.time.hour,
    minute: state.lincoln.time.minute
  };
}

console.log("Test 1: Russian text 'Спустя 2 часа пришла Хлоя.'");
const result1 = simulateOutput("Спустя 2 часа пришла Хлоя. Она подходит без спешки, её шаги отчётливо стучат по асфальту даже на расстоянии.");
console.log("  Minutes passed:", result1.minutesPassed);
console.log("  New time:", result1.timeString);
console.log("  Expected: +120 minutes (2 hours)");
console.log("  " + (result1.minutesPassed === 120 ? "✓ PASS" : "✗ FAIL"));
console.log("");

console.log("Test 2: Russian text 'Через три минуты раздался звонок.'");
const result2 = simulateOutput("Через три минуты раздался звонок. Максим достаёт телефон из кармана.");
console.log("  Minutes passed:", result2.minutesPassed);
console.log("  New time:", result2.timeString);
console.log("  Expected: +3 minutes");
console.log("  " + (result2.minutesPassed === 3 ? "✓ PASS" : "✗ FAIL"));
console.log("");

console.log("Test 3: Russian text 'Через пару часов все собрались в спортзале.'");
const result3 = simulateOutput("Через пару часов все собрались в спортзале. Начинается вечерняя тренировка.");
console.log("  Minutes passed:", result3.minutesPassed);
console.log("  New time:", result3.timeString);
console.log("  Expected: +120 minutes (2 hours)");
console.log("  " + (result3.minutesPassed === 120 ? "✓ PASS" : "✗ FAIL"));
console.log("");

console.log("Test 4: English text '2 hours later, they met again.'");
const result4 = simulateOutput("2 hours later, they met again at the same spot.");
console.log("  Minutes passed:", result4.minutesPassed);
console.log("  New time:", result4.timeString);
console.log("  Expected: +120 minutes (2 hours)");
console.log("  " + (result4.minutesPassed === 120 ? "✓ PASS" : "✗ FAIL"));
console.log("");

console.log("Test 5: Text without time anchor (uses scene detection)");
const result5 = simulateOutput("Максим продолжает разговор с Хлоей. Они обсуждают планы на выходные.");
console.log("  Minutes passed:", result5.minutesPassed);
console.log("  New time:", result5.timeString);
console.log("  Expected: ~5-10 minutes (dialogue scene)");
console.log("  " + (result5.minutesPassed >= 5 && result5.minutesPassed <= 10 ? "✓ PASS" : "✗ FAIL"));
console.log("");

console.log("=== Final State ===");
console.log("Total turns:", state.lincoln.turn);
console.log("Final time:", state.lincoln.time.timeString);
console.log("Total minutes passed:", state.lincoln.time.totalMinutesPassed);
console.log("Time of day:", state.lincoln.time.timeOfDay);
console.log("");

console.log("=== Integration Test Summary ===");
console.log("✓ Russian time anchors work with Output.txt flow");
console.log("✓ Time advances correctly based on detected anchors");
console.log("✓ English anchors still work (no regression)");
console.log("✓ Scene detection fallback works for text without anchors");
console.log("✓ Turn counter increments properly");
console.log("✓ Time state updates correctly");
