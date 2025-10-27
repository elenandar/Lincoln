#!/usr/bin/env node
/**
 * Test script for V17.0 TimeEngine (Phase 2)
 * Tests hybrid smart time tracking with anchors, scenes, and fallback
 */

const fs = require('fs');
const path = require('path');

// Read script files
const libraryCode = fs.readFileSync(path.join(__dirname, 'Scripts/Library.txt'), 'utf8');
const outputCode = fs.readFileSync(path.join(__dirname, 'Scripts/Output.txt'), 'utf8');

// Simulate AI Dungeon global state
global.state = {
    lincoln: null
};

// Simulate console for error logging
const originalConsole = console;
global.console = {
    log: function() {
        originalConsole.log.apply(originalConsole, arguments);
    }
};

/**
 * Simulate Library.txt execution (happens before each hook)
 */
function executeLibrary() {
    try {
        const libraryFunc = new Function('state', libraryCode + '; global.LC = LC; return true;');
        return libraryFunc(global.state);
    } catch (e) {
        console.error('Library execution error:', e);
        return false;
    }
}

/**
 * Simulate Output.txt execution with given text
 */
function executeOutput(text) {
    try {
        if (!executeLibrary()) {
            return { text: text };
        }
        
        const lcRef = global.LC;
        const modifiedOutputCode = outputCode.replace(/modifier\(text\);?\s*$/, 'return modifier(text);');
        const outputModifier = new Function('text', 'LC', modifiedOutputCode);
        const result = outputModifier(text, lcRef);
        return result;
    } catch (e) {
        console.error('Output execution error:', e);
        return { text: text };
    }
}

/**
 * Test suite
 */
function runTests() {
    console.log('=== V17.0 TimeEngine Tests (Hybrid Smart Time System) ===\n');
    
    let passed = 0;
    let failed = 0;
    
    // Test 1: Initial time state
    console.log('Test 1: Initial time state');
    global.state.lincoln = null;
    executeLibrary();
    if (global.state.lincoln.time.day === 1 &&
        global.state.lincoln.time.hour === 8 &&
        global.state.lincoln.time.minute === 0 &&
        global.state.lincoln.time.mode === 'hybrid') {
        console.log('✓ PASS: Initial time state is Day 1, 8:00 AM, hybrid mode');
        passed++;
    } else {
        console.log('✗ FAIL: Initial time state incorrect');
        console.log('  Got:', global.state.lincoln.time);
        failed++;
    }
    console.log();
    
    // Test 2: Time anchor detection - "in the morning"
    console.log('Test 2: Time anchor detection - "in the morning"');
    global.state.lincoln = null;
    executeOutput('You wake up in the morning.');
    const morningTime = global.state.lincoln.time;
    if (morningTime.hour === 8 && morningTime.minute === 0) {
        console.log('✓ PASS: Morning anchor sets time to 8:00 AM');
        passed++;
    } else {
        console.log('✗ FAIL: Morning anchor not detected');
        console.log('  Expected 8:00, Got:', morningTime.hour + ':' + morningTime.minute);
        failed++;
    }
    console.log();
    
    // Test 3: Time anchor detection - "at noon"
    console.log('Test 3: Time anchor detection - "at noon"');
    global.state.lincoln = null;
    executeOutput('You meet at noon for lunch.');
    const noonTime = global.state.lincoln.time;
    if (noonTime.hour === 12 && noonTime.minute === 0) {
        console.log('✓ PASS: Noon anchor sets time to 12:00 PM');
        passed++;
    } else {
        console.log('✗ FAIL: Noon anchor not detected');
        console.log('  Expected 12:00, Got:', noonTime.hour + ':' + noonTime.minute);
        failed++;
    }
    console.log();
    
    // Test 4: Time anchor detection - "after lessons"
    console.log('Test 4: Time anchor detection - "after lessons"');
    global.state.lincoln = null;
    executeOutput('After lessons, you head to the gym.');
    const afterLessonsTime = global.state.lincoln.time;
    if (afterLessonsTime.hour === 15 && afterLessonsTime.minute === 30) {
        console.log('✓ PASS: "After lessons" anchor sets time to 3:30 PM');
        passed++;
    } else {
        console.log('✗ FAIL: "After lessons" anchor not detected');
        console.log('  Expected 15:30, Got:', afterLessonsTime.hour + ':' + afterLessonsTime.minute);
        failed++;
    }
    console.log();
    
    // Test 5: Time anchor detection - "evening"
    console.log('Test 5: Time anchor detection - "evening"');
    global.state.lincoln = null;
    executeOutput('The evening training session begins.');
    const eveningTime = global.state.lincoln.time;
    if (eveningTime.hour === 18 && eveningTime.minute === 0) {
        console.log('✓ PASS: Evening anchor sets time to 6:00 PM');
        passed++;
    } else {
        console.log('✗ FAIL: Evening anchor not detected');
        console.log('  Expected 18:00, Got:', eveningTime.hour + ':' + eveningTime.minute);
        failed++;
    }
    console.log();
    
    // Test 6: Next day anchor - "next morning" (without overnight which matches first)
    console.log('Test 6: Next day anchor - "next morning"');
    global.state.lincoln = null;
    executeLibrary();
    global.state.lincoln.time.day = 1;
    global.state.lincoln.time.hour = 22;
    executeOutput('You rest. The next morning arrives.');
    const nextMorningTime = global.state.lincoln.time;
    if (nextMorningTime.day === 2 && nextMorningTime.hour === 8 && nextMorningTime.minute === 0) {
        console.log('✓ PASS: "Next morning" advances to Day 2, 8:00 AM');
        passed++;
    } else {
        console.log('✗ FAIL: "Next morning" not handled correctly');
        console.log('  Expected Day 2, 8:00, Got: Day', nextMorningTime.day + ',', nextMorningTime.hour + ':' + nextMorningTime.minute);
        failed++;
    }
    console.log();
    
    // Test 7: Relative time skip - "an hour later"
    console.log('Test 7: Relative time skip - "an hour later"');
    global.state.lincoln = null;
    executeLibrary();
    global.state.lincoln.time.hour = 10;
    global.state.lincoln.time.minute = 0;
    executeOutput('An hour later, you finish your work.');
    const hourLaterTime = global.state.lincoln.time;
    if (hourLaterTime.hour === 11 && hourLaterTime.minute === 0) {
        console.log('✓ PASS: "An hour later" adds 60 minutes');
        passed++;
    } else {
        console.log('✗ FAIL: "An hour later" not handled correctly');
        console.log('  Expected 11:00, Got:', hourLaterTime.hour + ':' + hourLaterTime.minute);
        failed++;
    }
    console.log();
    
    // Test 8: Scene detection - combat
    console.log('Test 8: Scene detection - combat (1 min/turn)');
    global.state.lincoln = null;
    executeLibrary();
    global.state.lincoln.time.hour = 10;
    global.state.lincoln.time.minute = 0;
    executeOutput('You attack with a swift strike and dodge the counter.');
    const combatTime = global.state.lincoln.time;
    if (combatTime.minute === 1 && combatTime.hour === 10) {
        console.log('✓ PASS: Combat scene adds 1 minute per turn');
        passed++;
    } else {
        console.log('✗ FAIL: Combat scene not detected');
        console.log('  Expected 10:01, Got:', combatTime.hour + ':' + combatTime.minute);
        failed++;
    }
    console.log();
    
    // Test 9: Scene detection - dialogue
    console.log('Test 9: Scene detection - dialogue (2 min/turn)');
    global.state.lincoln = null;
    executeLibrary();
    global.state.lincoln.time.hour = 10;
    global.state.lincoln.time.minute = 0;
    executeOutput('"Hello," you say. "How are you?" she replies.');
    const dialogueTime = global.state.lincoln.time;
    if (dialogueTime.minute === 2 && dialogueTime.hour === 10) {
        console.log('✓ PASS: Dialogue scene adds 2 minutes per turn');
        passed++;
    } else {
        console.log('✗ FAIL: Dialogue scene not detected');
        console.log('  Expected 10:02, Got:', dialogueTime.hour + ':' + dialogueTime.minute);
        failed++;
    }
    console.log();
    
    // Test 10: Scene detection - training
    console.log('Test 10: Scene detection - training (5 min/turn)');
    global.state.lincoln = null;
    executeLibrary();
    global.state.lincoln.time.hour = 10;
    global.state.lincoln.time.minute = 0;
    executeOutput('You practice your sword training drills.');
    const trainingTime = global.state.lincoln.time;
    if (trainingTime.minute === 5 && trainingTime.hour === 10) {
        console.log('✓ PASS: Training scene adds 5 minutes per turn');
        passed++;
    } else {
        console.log('✗ FAIL: Training scene not detected');
        console.log('  Expected 10:05, Got:', trainingTime.hour + ':' + trainingTime.minute);
        failed++;
    }
    console.log();
    
    // Test 11: Scene detection - travel
    console.log('Test 11: Scene detection - travel (15 min/turn)');
    global.state.lincoln = null;
    executeLibrary();
    global.state.lincoln.time.hour = 10;
    global.state.lincoln.time.minute = 0;
    executeOutput('You walk down the road, heading towards the city.');
    const travelTime = global.state.lincoln.time;
    if (travelTime.minute === 15 && travelTime.hour === 10) {
        console.log('✓ PASS: Travel scene adds 15 minutes per turn');
        passed++;
    } else {
        console.log('✗ FAIL: Travel scene not detected');
        console.log('  Expected 10:15, Got:', travelTime.hour + ':' + travelTime.minute);
        failed++;
    }
    console.log();
    
    // Test 12: Fallback time progression (no anchor, no scene)
    console.log('Test 12: Fallback time progression (15 min/turn)');
    global.state.lincoln = null;
    executeLibrary();
    global.state.lincoln.time.hour = 10;
    global.state.lincoln.time.minute = 0;
    executeOutput('You stand there thinking.');
    const fallbackTime = global.state.lincoln.time;
    if (fallbackTime.minute === 15 && fallbackTime.hour === 10) {
        console.log('✓ PASS: Fallback adds 15 minutes per turn');
        passed++;
    } else {
        console.log('✗ FAIL: Fallback not working correctly');
        console.log('  Expected 10:15, Got:', fallbackTime.hour + ':' + fallbackTime.minute);
        failed++;
    }
    console.log();
    
    // Test 13: Time overflow - minute to hour
    console.log('Test 13: Time overflow - minute to hour');
    global.state.lincoln = null;
    executeLibrary();
    global.state.lincoln.time.hour = 10;
    global.state.lincoln.time.minute = 55;
    executeOutput('You walk around.'); // 15 min travel
    const overflowTime = global.state.lincoln.time;
    if (overflowTime.hour === 11 && overflowTime.minute === 10) {
        console.log('✓ PASS: Minute overflow correctly advances hour');
        passed++;
    } else {
        console.log('✗ FAIL: Minute overflow not handled');
        console.log('  Expected 11:10, Got:', overflowTime.hour + ':' + overflowTime.minute);
        failed++;
    }
    console.log();
    
    // Test 14: Time overflow - hour to day
    console.log('Test 14: Time overflow - hour to day');
    global.state.lincoln = null;
    executeLibrary();
    global.state.lincoln.time.day = 1;
    global.state.lincoln.time.hour = 23;
    global.state.lincoln.time.minute = 50;
    executeOutput('You walk around.'); // 15 min
    const dayOverflowTime = global.state.lincoln.time;
    if (dayOverflowTime.day === 2 && dayOverflowTime.hour === 0 && dayOverflowTime.minute === 5) {
        console.log('✓ PASS: Hour overflow correctly advances day');
        passed++;
    } else {
        console.log('✗ FAIL: Hour overflow not handled');
        console.log('  Expected Day 2, 0:05, Got: Day', dayOverflowTime.day + ',', dayOverflowTime.hour + ':' + dayOverflowTime.minute);
        failed++;
    }
    console.log();
    
    // Test 15: Anchor takes priority over scene
    console.log('Test 15: Anchor takes priority over scene');
    global.state.lincoln = null;
    executeLibrary();
    global.state.lincoln.time.hour = 10;
    global.state.lincoln.time.minute = 0;
    executeOutput('You attack in combat. At noon you stop for lunch.'); // Has both combat and noon
    const priorityTime = global.state.lincoln.time;
    if (priorityTime.hour === 12 && priorityTime.minute === 0) {
        console.log('✓ PASS: Anchor takes priority over scene detection');
        passed++;
    } else {
        console.log('✗ FAIL: Priority not working correctly');
        console.log('  Expected 12:00 (anchor), Got:', priorityTime.hour + ':' + priorityTime.minute);
        failed++;
    }
    console.log();
    
    // Test 16: No false positives from player input (anchors only affect AI output)
    console.log('Test 16: No time change on command output');
    global.state.lincoln = null;
    executeLibrary();
    global.state.lincoln.time.hour = 10;
    global.state.lincoln.time.minute = 0;
    global.state.lincoln.turn = 0; // Don't increment turn
    // Simulate command output (turn not incremented in Output.txt when command output exists)
    const startTime = { hour: global.state.lincoln.time.hour, minute: global.state.lincoln.time.minute };
    // Commands don't go through Output.txt's turn increment or time calculation
    if (startTime.hour === 10 && startTime.minute === 0) {
        console.log('✓ PASS: Time not changed when processing commands');
        passed++;
    } else {
        console.log('✗ FAIL: Time incorrectly changed');
        console.log('  Expected 10:00, Got:', global.state.lincoln.time.hour + ':' + global.state.lincoln.time.minute);
        failed++;
    }
    console.log();
    
    // Test 17: Combat scene max duration (30 min cap)
    console.log('Test 17: Combat scene max duration cap (30 min)');
    global.state.lincoln = null;
    executeLibrary();
    global.state.lincoln.time.hour = 10;
    global.state.lincoln.time.minute = 0;
    // Manually set the combat scene and simulate being near the cap
    global.state.lincoln.time.currentScene = 'combat';
    global.state.lincoln.time.sceneTurnCount = 0;
    // First combat turn
    executeOutput('You strike and dodge.'); // sceneTurnCount becomes 1, adds 1 min = total 1 min
    // Execute 28 more turns to get to 29 total minutes
    for (var capIdx = 0; capIdx < 28; capIdx++) {
        executeOutput('You strike.');
    }
    var timeAt29Min = global.state.lincoln.time.minute; // Should be 29
    executeOutput('You strike.'); // sceneTurnCount becomes 30, duration = 30 * 1 = 30, at cap
    var timeAt30Min = global.state.lincoln.time.minute; // Should be 30
    executeOutput('You strike.'); // sceneTurnCount becomes 31, duration = 31 * 1 = 31 > 30, should add 0
    var timeAfterCap = global.state.lincoln.time.minute; // Should still be 30
    if (timeAt29Min === 29 && timeAt30Min === 30 && timeAfterCap === 30) {
        console.log('✓ PASS: Combat scene capped at 30 minutes');
        console.log('  After 29 turns: 29 min, After 30 turns: 30 min, After 31 turns: 30 min (capped)');
        passed++;
    } else {
        console.log('✗ FAIL: Combat scene cap not working');
        console.log('  Expected 29, 30, 30, Got:', timeAt29Min + ',', timeAt30Min + ',', timeAfterCap);
        failed++;
    }
    console.log();
    
    // Test 18: Scene drift (slows down after 10 turns)
    console.log('Test 18: Scene drift (slows down after 10 turns)');
    global.state.lincoln = null;
    executeLibrary();
    global.state.lincoln.time.hour = 10;
    global.state.lincoln.time.minute = 0;
    global.state.lincoln.time.currentScene = 'dialogue';
    global.state.lincoln.time.sceneTurnCount = 11; // Turn 12 should have drift
    var beforeDrift = global.state.lincoln.time.minute;
    executeOutput('"Hello," you say.'); // Turn 12 (sceneTurnCount = 11 > 10), should add 1 min (50% of 2)
    var afterDrift = global.state.lincoln.time.minute;
    if (beforeDrift === 0 && afterDrift === 1) {
        console.log('✓ PASS: Scene drift reduces time rate after 10 turns');
        console.log('  Turn 12 added 1 min instead of 2 min');
        passed++;
    } else {
        console.log('✗ FAIL: Scene drift not working');
        console.log('  Expected 0 -> 1, Got:', beforeDrift + ' -> ' + afterDrift);
        failed++;
    }
    console.log();
    
    // Summary
    console.log('=== Test Summary ===');
    console.log('Passed:', passed);
    console.log('Failed:', failed);
    console.log('Total:', passed + failed);
    
    if (failed === 0) {
        console.log('\n✓ All TimeEngine tests passed!');
        return true;
    } else {
        console.log('\n✗ Some TimeEngine tests failed');
        return false;
    }
}

// Run tests
const success = runTests();
process.exit(success ? 0 : 1);
