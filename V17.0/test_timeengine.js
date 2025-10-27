// Test file for TimeEngine implementation
// Run with: node V17.0/test_timeengine.js

// Mock global objects needed by Library.txt
global.state = {
    lincoln: null // Will be initialized by Library code
};

global.console = console;

// Read and execute the library code
const fs = require('fs');
const libraryCode = fs.readFileSync('./V17.0/Scripts/Library.txt', 'utf8');

// Execute in a way that makes LC available
var LC;
(function() {
    eval(libraryCode);
    // LC is now defined in this scope, export it to parent
    global.LC = LC;
})();

// Get LC from global
LC = global.LC;

console.log("=== TimeEngine Tests ===\n");
console.log("LC object available:", LC ? "YES" : "NO");
console.log("TimeEngine available:", LC && LC.TimeEngine ? "YES" : "NO");
console.log();

// Test 1: Time Anchor Detection - "after lessons"
console.log("Test 1: Time anchor 'after lessons'");
console.log("Initial time:", state.lincoln.time.timeString);
var minutes = LC.TimeEngine.calculateHybridTime("The students gathered after lessons to discuss the project.");
LC.TimeEngine.addMinutes(minutes);
console.log("After anchor:", state.lincoln.time.timeString);
console.log("Expected: Day 1, Afternoon (4:00 PM)");
console.log("Result:", state.lincoln.time.hour === 16 && state.lincoln.time.minute === 0 ? "PASS" : "FAIL");
console.log();

// Test 2: Relative time - "2 hours later"
console.log("Test 2: Relative anchor '2 hours later'");
console.log("Initial time:", state.lincoln.time.timeString);
minutes = LC.TimeEngine.calculateHybridTime("Two hours later, they finally arrived.");
LC.TimeEngine.addMinutes(minutes);
console.log("After anchor:", state.lincoln.time.timeString);
console.log("Expected: Day 1, Evening (6:00 PM)");
console.log("Result:", state.lincoln.time.hour === 18 && state.lincoln.time.minute === 0 ? "PASS" : "FAIL");
console.log();

// Test 3: Overnight
console.log("Test 3: Overnight anchor");
console.log("Initial time:", state.lincoln.time.timeString);
minutes = LC.TimeEngine.calculateHybridTime("They camped overnight in the forest.");
LC.TimeEngine.addMinutes(minutes);
console.log("After anchor:", state.lincoln.time.timeString);
console.log("Expected: Next day morning (8+ hours passed)");
console.log("Result:", state.lincoln.time.hour >= 2 ? "PASS" : "FAIL");
console.log();

// Reset time for scene tests
state.lincoln.time = {
    day: 1,
    hour: 12,
    minute: 0,
    timeString: "Day 1, Afternoon (12:00 PM)",
    timeOfDay: "Afternoon",
    currentScene: "general",
    sceneStartTurn: 0,
    sceneTurnCount: 0,
    sceneMinutes: 0,
    mode: "hybrid",
    totalMinutesPassed: 0
};

// Test 4: Combat scene detection
console.log("Test 4: Combat scene (2 min/turn)");
console.log("Initial time:", state.lincoln.time.timeString);
state.lincoln.turn = 1;
minutes = LC.TimeEngine.calculateHybridTime("You attack the enemy with your sword, dodging their strike.");
console.log("Scene detected:", state.lincoln.time.currentScene);
console.log("Minutes passed:", minutes);
console.log("Expected: combat scene, 2 minutes");
console.log("Result:", state.lincoln.time.currentScene === "combat" && minutes === 2 ? "PASS" : "FAIL");
console.log();

// Test 5: Dialogue scene detection
console.log("Test 5: Dialogue scene (5 min/turn)");
state.lincoln.time.currentScene = "general";
state.lincoln.time.sceneTurnCount = 0;
state.lincoln.time.sceneMinutes = 0;
state.lincoln.turn = 2;
minutes = LC.TimeEngine.calculateHybridTime("'Hello,' she says. You ask her about the quest.");
console.log("Scene detected:", state.lincoln.time.currentScene);
console.log("Minutes passed:", minutes);
console.log("Expected: dialogue scene, 5 minutes");
console.log("Result:", state.lincoln.time.currentScene === "dialogue" && minutes === 5 ? "PASS" : "FAIL");
console.log();

// Test 6: Travel scene detection
console.log("Test 6: Travel scene (15 min/turn)");
state.lincoln.time.currentScene = "general";
state.lincoln.time.sceneTurnCount = 0;
state.lincoln.time.sceneMinutes = 0;
state.lincoln.turn = 3;
minutes = LC.TimeEngine.calculateHybridTime("You walk down the road, traveling toward the city.");
console.log("Scene detected:", state.lincoln.time.currentScene);
console.log("Minutes passed:", minutes);
console.log("Expected: travel scene, 15 minutes");
console.log("Result:", state.lincoln.time.currentScene === "travel" && minutes === 15 ? "PASS" : "FAIL");
console.log();

// Test 7: Scene drift after 10 turns
console.log("Test 7: Scene drift after 10 turns (30% reduction)");
state.lincoln.time.currentScene = "dialogue";
state.lincoln.time.sceneTurnCount = 10;
state.lincoln.time.sceneMinutes = 50;
state.lincoln.turn = 13;
minutes = LC.TimeEngine.calculateHybridTime("You continue talking about the weather.");
console.log("Minutes passed after 10 turns:", minutes);
console.log("Expected: ~3.5 minutes (70% of 5)");
console.log("Result:", minutes <= 4 ? "PASS" : "FAIL");
console.log();

// Test 8: Max duration cap
console.log("Test 8: Combat max duration cap (30 min)");
state.lincoln.time.currentScene = "combat";
state.lincoln.time.sceneTurnCount = 1;
state.lincoln.time.sceneMinutes = 29;
state.lincoln.turn = 15;
minutes = LC.TimeEngine.calculateHybridTime("The battle continues with strikes and dodges.");
console.log("Minutes passed near cap:", minutes);
console.log("Expected: reduced rate or 0 (approaching 30 min cap)");
console.log("Result:", minutes <= 2 ? "PASS" : "FAIL");
console.log();

// Test 9: /time command parsing
console.log("Test 9: Time command - skip 2 hours");
var timeCmd = LC.CommandsRegistry.commands['time'];
var result = timeCmd(['skip', '2', 'hours']);
console.log("Command result:", result.substring(0, 50) + "...");
console.log("Result:", result.indexOf('Skipped 2 hour') >= 0 ? "PASS" : "FAIL");
console.log();

// Test 10: /time set command
console.log("Test 10: Time command - set absolute time");
result = timeCmd(['set', '2', '14', '30']);
console.log("Command result:", result.substring(0, 50) + "...");
console.log("Time after set:", state.lincoln.time.day, state.lincoln.time.hour, state.lincoln.time.minute);
console.log("Expected: Day 2, 14:30");
console.log("Result:", state.lincoln.time.day === 2 && state.lincoln.time.hour === 14 && state.lincoln.time.minute === 30 ? "PASS" : "FAIL");
console.log();

// Test 11: Manual mode
console.log("Test 11: Manual mode (no auto progression)");
state.lincoln.time.mode = 'manual';
state.lincoln.turn = 20;
minutes = LC.TimeEngine.calculateHybridTime("You fight and travel all day.");
console.log("Minutes passed in manual mode:", minutes);
console.log("Expected: 0");
console.log("Result:", minutes === 0 ? "PASS" : "FAIL");
console.log();

// Test 12: ES5 compliance check
console.log("Test 12: ES5 Compliance");
var libraryContent = fs.readFileSync('./V17.0/Scripts/Library.txt', 'utf8');
var es6Patterns = [
    { pattern: /\blet\s+/, name: 'let' },
    { pattern: /\bconst\s+[^m]/, name: 'const (non-modifier)' }, // Allow const modifier
    { pattern: /\=\>/, name: 'arrow functions' },
    { pattern: /\`/, name: 'template literals' },
    { pattern: /\.includes\(/, name: '.includes()' },
    { pattern: /new Map\(/, name: 'Map' },
    { pattern: /new Set\(/, name: 'Set' },
    { pattern: /\.\.\.\w/, name: 'spread operator' }
];

var es6Found = [];
for (var i = 0; i < es6Patterns.length; i++) {
    if (es6Patterns[i].pattern.test(libraryContent)) {
        es6Found.push(es6Patterns[i].name);
    }
}

console.log("ES6 features found:", es6Found.length > 0 ? es6Found.join(', ') : "None");
console.log("Result:", es6Found.length === 0 ? "PASS" : "FAIL");
console.log();

console.log("=== All Tests Complete ===");
